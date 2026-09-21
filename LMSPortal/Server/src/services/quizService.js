import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Course from '../models/Course.js';
import Notification from '../models/Notification.js';
import { createNotification } from './notificationService.js';
import ErrorResponse from '../utils/errorResponse.js';

export const createQuiz = async (quizData, requesterUser) => {
  const {
    courseId,
    course,
    lessonId,
    lesson,
    title,
    description,
    passingScore,
    timeLimitMinutes,
    questions,
  } = quizData;

  const targetCourseId = courseId || course;
  if (!targetCourseId) {
    throw new ErrorResponse('Please specify a course for this quiz.', 400);
  }
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new ErrorResponse('Please provide a quiz title.', 400);
  }

  const courseDoc = await Course.findById(targetCourseId);
  if (!courseDoc) {
    throw new ErrorResponse('Course not found.', 404);
  }

  const courseDocInstructorId = (courseDoc.instructor?._id || courseDoc.instructor)?.toString();
  if (courseDocInstructorId !== requesterUser.id && requesterUser.role !== 'admin') {
    throw new ErrorResponse('Not authorized to add a quiz to this course.', 403);
  }

  const sanitizedPassingScore =
    passingScore !== undefined ? Math.min(100, Math.max(1, Number(passingScore) || 70)) : 70;
  const sanitizedTimeLimit =
    timeLimitMinutes !== undefined ? Math.max(1, Number(timeLimitMinutes) || 15) : 15;

  const quiz = await Quiz.create({
    course: targetCourseId,
    lesson: lessonId || lesson || undefined,
    title: title.trim(),
    description: description || '',
    passingScore: sanitizedPassingScore,
    timeLimitMinutes: sanitizedTimeLimit,
    questions: Array.isArray(questions) ? questions : [],
  });

  return quiz;
};

export const updateQuiz = async (quizId, updateData, requesterUser) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ErrorResponse('Quiz not found.', 404);
  }

  const course = await Course.findById(quiz.course);
  const instructorId = (course?.instructor?._id || course?.instructor)?.toString();
  if (!course || (instructorId !== requesterUser.id && requesterUser.role !== 'admin')) {
    throw new ErrorResponse('Not authorized to modify this quiz.', 403);
  }

  const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, updateData, {
    new: true,
    runValidators: true,
  });

  return updatedQuiz;
};

export const deleteQuiz = async (quizId, requesterUser) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ErrorResponse('Quiz not found.', 404);
  }

  const course = await Course.findById(quiz.course);
  const instructorId = (course?.instructor?._id || course?.instructor)?.toString();
  if (!course || (instructorId !== requesterUser.id && requesterUser.role !== 'admin')) {
    throw new ErrorResponse('Not authorized to delete this quiz.', 403);
  }

  await QuizAttempt.deleteMany({ quiz: quizId });
  await quiz.deleteOne();

  return { success: true };
};

export const getQuizById = async (quizId, requesterUser) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ErrorResponse('Quiz not found.', 404);
  }

  const isInstructorOrAdmin =
    requesterUser &&
    (requesterUser.role === 'admin' ||
      (await Course.exists({ _id: quiz.course, instructor: requesterUser.id })));

  let quizData = quiz.toObject();

  // Security: Never reveal the answer key to students before submission
  if (!isInstructorOrAdmin) {
    quizData.questions = quizData.questions.map((q) => {
      const { correctAnswer, correctAnswerIndex, explanation, ...safeQuestion } = q;
      return safeQuestion;
    });
  }

  return quizData;
};

export const getCourseQuizzes = async (courseId, requesterUser) => {
  const isInstructorOrAdmin =
    requesterUser &&
    (requesterUser.role === 'admin' ||
      (await Course.exists({ _id: courseId, instructor: requesterUser.id })));

  let query = Quiz.find({ course: courseId });
  if (!isInstructorOrAdmin) {
    query = query.select('-questions.correctAnswer -questions.correctAnswerIndex -questions.explanation');
  }

  const quizzes = await query;
  return quizzes;
};

export const submitQuizAttempt = async (quizId, arg2, arg3) => {
  let submissionData, studentId;
  // If arg2 has answers or timeSpentSeconds, or arg2 is an object and arg3 is string/id
  if (
    typeof arg2 === 'object' &&
    arg2 !== null &&
    !arg2._bsontype &&
    !arg2.buffer &&
    (arg2.answers !== undefined || arg2.timeSpentSeconds !== undefined)
  ) {
    submissionData = arg2;
    studentId = arg3;
  } else {
    studentId = arg2;
    submissionData = typeof arg3 === 'object' && arg3 !== null ? arg3 : {};
  }

  const { answers, timeSpentSeconds } = submissionData || {};
  const answersList = Array.isArray(answers) ? answers : [];

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ErrorResponse('Quiz not found.', 404);
  }

  let totalPoints = 0;
  let earnedPoints = 0;

  const evaluatedAnswers = quiz.questions.map((q, idx) => {
    // Support matching by questionIndex or question _id
    const studentAns = answersList.find(
      (a) =>
        a.questionIndex === idx ||
        (a.question && q._id && a.question.toString() === q._id.toString())
    );

    const selected = studentAns !== undefined ? studentAns.selectedOption : -1;
    const correctVal =
      q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : q.correctAnswer;
    const isCorrect = String(selected) === String(correctVal);
    const points = q.marks || q.points || 10;

    totalPoints += points;
    if (isCorrect) earnedPoints += points;

    return {
      question: q._id,
      questionIndex: idx,
      questionText: q.questionText || q.question,
      options: q.options,
      selectedOption: selected,
      correctAnswer: correctVal,
      isCorrect,
      explanation: q.explanation || '',
      marksObtained: isCorrect ? points : 0,
    };
  });

  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = percentage >= (quiz.passingScore || 70);
  const correctCount = evaluatedAnswers.filter((a) => a.isCorrect).length;
  const incorrectCount = evaluatedAnswers.length - correctCount;

  const attempt = await QuizAttempt.create({
    student: studentId,
    quiz: quiz._id,
    course: quiz.course,
    answers: evaluatedAnswers.map((a) => ({
      question: a.question,
      questionIndex: a.questionIndex,
      selectedOption: a.selectedOption,
      isCorrect: a.isCorrect,
      marksObtained: a.marksObtained,
    })),
    score: earnedPoints,
    totalPoints,
    percentage,
    passed,
    attemptedAt: new Date(),
    timeSpentSeconds: timeSpentSeconds || 0,
  });

  await createNotification({
    recipient: studentId,
    title: passed ? '🎉 Quiz Passed!' : 'Quiz Attempt Result',
    message: `You scored ${percentage}% on "${quiz.title}". ${
      passed ? 'Congratulations on passing!' : 'Keep reviewing and try again!'
    }`,
    type: 'quiz_result',
    link: `/student/course/${quiz.course}/learn`,
  });

  return {
    attemptId: attempt._id,
    score: earnedPoints,
    totalPoints,
    percentage,
    passed,
    passingScore: quiz.passingScore,
    correctCount,
    incorrectCount,
    detailedReview: evaluatedAnswers,
  };
};

export const addQuestionToQuiz = async (quizId, questionData, requesterUser) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ErrorResponse('Quiz not found.', 404);
  }

  const course = await Course.findById(quiz.course);
  const instructorId = (course?.instructor?._id || course?.instructor)?.toString();
  if (!course || (instructorId !== requesterUser.id && requesterUser.role !== 'admin')) {
    throw new ErrorResponse('Not authorized to add questions to this quiz.', 403);
  }

  const text = questionData.question || questionData.questionText;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new ErrorResponse('Please provide question text.', 400);
  }
  if (!Array.isArray(questionData.options) || questionData.options.length < 2) {
    throw new ErrorResponse('Question must have at least 2 options.', 400);
  }

  const newQuestion = {
    question: text.trim(),
    options: questionData.options,
    correctAnswer:
      questionData.correctAnswer !== undefined
        ? questionData.correctAnswer
        : (questionData.correctAnswerIndex ?? 0),
    marks: Number(questionData.marks || questionData.points) || 10,
    explanation: questionData.explanation || '',
  };

  quiz.questions.push(newQuestion);
  await quiz.save();

  const createdQuestion = quiz.questions[quiz.questions.length - 1];
  return {
    question: createdQuestion,
    quiz,
  };
};

export const updateQuestionInQuiz = async (quizId, questionId, questionData, requesterUser) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ErrorResponse('Quiz not found.', 404);
  }

  const course = await Course.findById(quiz.course);
  const instructorId = (course?.instructor?._id || course?.instructor)?.toString();
  if (!course || (instructorId !== requesterUser.id && requesterUser.role !== 'admin')) {
    throw new ErrorResponse('Not authorized to update questions in this quiz.', 403);
  }

  const question = quiz.questions.id(questionId);
  if (!question) {
    throw new ErrorResponse('Question not found.', 404);
  }

  if (questionData.question || questionData.questionText) {
    question.question = (questionData.question || questionData.questionText).trim();
  }
  if (Array.isArray(questionData.options)) {
    if (questionData.options.length < 2) {
      throw new ErrorResponse('Question must have at least 2 options.', 400);
    }
    question.options = questionData.options;
  }
  if (questionData.correctAnswer !== undefined || questionData.correctAnswerIndex !== undefined) {
    question.correctAnswer =
      questionData.correctAnswer !== undefined
        ? questionData.correctAnswer
        : questionData.correctAnswerIndex;
  }
  if (questionData.marks !== undefined || questionData.points !== undefined) {
    question.marks = Number(questionData.marks || questionData.points);
  }
  if (questionData.explanation !== undefined) {
    question.explanation = questionData.explanation;
  }

  await quiz.save();
  return {
    question,
    quiz,
  };
};

export const deleteQuestionFromQuiz = async (quizId, questionId, requesterUser) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ErrorResponse('Quiz not found.', 404);
  }

  const course = await Course.findById(quiz.course);
  const instructorId = (course?.instructor?._id || course?.instructor)?.toString();
  if (!course || (instructorId !== requesterUser.id && requesterUser.role !== 'admin')) {
    throw new ErrorResponse('Not authorized to delete questions from this quiz.', 403);
  }

  const question = quiz.questions.id(questionId);
  if (!question) {
    throw new ErrorResponse('Question not found.', 404);
  }

  quiz.questions.pull({ _id: questionId });
  await quiz.save();

  return { success: true, message: 'Question deleted successfully.' };
};

export const getStudentQuizSubmissions = async (quizId, studentId) => {
  const submissions = await QuizAttempt.find({
    quiz: quizId,
    student: studentId,
  }).sort({ attemptedAt: -1, createdAt: -1 });

  return submissions;
};

export const submitQuiz = submitQuizAttempt;

export default {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizById,
  getCourseQuizzes,
  submitQuiz,
  submitQuizAttempt,
  getStudentQuizSubmissions,
  addQuestionToQuiz,
  updateQuestionInQuiz,
  deleteQuestionFromQuiz,
};
