import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Course from '../models/Course.js';
import Notification from '../models/Notification.js';
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

  if (courseDoc.instructor.toString() !== requesterUser.id && requesterUser.role !== 'admin') {
    throw new ErrorResponse('Not authorized to add a quiz to this course.', 403);
  }

  const quiz = await Quiz.create({
    course: targetCourseId,
    lesson: lessonId || lesson || undefined,
    title: title.trim(),
    description: description || '',
    passingScore: passingScore !== undefined ? Number(passingScore) : 70,
    timeLimitMinutes: timeLimitMinutes !== undefined ? Number(timeLimitMinutes) : 15,
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
  if (course.instructor.toString() !== requesterUser.id && requesterUser.role !== 'admin') {
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
  if (course.instructor.toString() !== requesterUser.id && requesterUser.role !== 'admin') {
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

export const submitQuiz = async (quizId, studentId, { answers, timeSpentSeconds }) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ErrorResponse('Quiz not found.', 404);
  }

  let earnedPoints = 0;
  let totalPoints = 0;

  const evaluatedAnswers = quiz.questions.map((q, idx) => {
    // Support matching by questionIndex or question _id
    const studentAns = answers?.find(
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

  await Notification.create({
    recipient: studentId,
    title: passed ? '🎉 Quiz Passed!' : 'Quiz Attempt Result',
    message: `You scored ${percentage}% on "${quiz.title}". ${
      passed ? 'Congratulations on passing!' : 'Keep reviewing and try again!'
    }`,
    type: 'quiz_graded',
    link: `/student/course/${quiz.course}/learn`,
  });

  return {
    attemptId: attempt._id,
    score: earnedPoints,
    totalPoints,
    percentage,
    passed,
    passingScore: quiz.passingScore,
    detailedReview: evaluatedAnswers,
  };
};

export const getStudentQuizSubmissions = async (quizId, studentId) => {
  const submissions = await QuizAttempt.find({
    quiz: quizId,
    student: studentId,
  }).sort({ attemptedAt: -1, createdAt: -1 });

  return submissions;
};

export default {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizById,
  getCourseQuizzes,
  submitQuiz,
  getStudentQuizSubmissions,
};
