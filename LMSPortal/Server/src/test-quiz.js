import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from './models/User.js';
import Course from './models/Course.js';
import Lesson from './models/Lesson.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import quizService from './services/quizService.js';

let mongoServer;

async function runQuizTests() {
  console.log('🧪 Starting LMS Quiz & Assessment System Test Suite (PROMPT 11)...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  };

  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('  📦 Connected to in-memory test database.\n');

    // 1. Setup users (Instructor 1, Instructor 2, Student)
    const instructor1 = await User.create({
      name: 'Prof. Alan Turing',
      email: 'alan@computation.edu',
      password: 'Password123!',
      role: 'instructor',
    });

    const instructor2 = await User.create({
      name: 'Dr. Rival Instructor',
      email: 'rival@other.edu',
      password: 'Password123!',
      role: 'instructor',
    });

    const student = await User.create({
      name: 'Ada Lovelace',
      email: 'ada@student.edu',
      password: 'Password123!',
      role: 'student',
    });

    // 2. Setup Course
    const course = await Course.create({
      title: 'Theoretical Computer Science & Automata',
      description: 'Foundations of computation and Turing machines.',
      category: 'Computer Science',
      level: 'Advanced',
      price: 120,
      published: true,
      instructor: instructor1._id,
    });

    const lesson = await Lesson.create({
      course: course._id,
      title: 'Decidability & The Halting Problem',
      content: 'Exploring undecidable problems.',
      order: 1,
      duration: 45,
    });

    // TEST 1: Instructor Creates Quiz with passing score & initial questions
    console.log('🔹 Test Group 1: Instructor Quiz Creation & Question Configuration');
    const createdQuiz = await quizService.createQuiz(
      {
        courseId: course._id.toString(),
        lessonId: lesson._id.toString(),
        title: 'Halting Problem & Decidability Quiz',
        description: 'Test your understanding of undecidable decision problems.',
        passingScore: 75,
        timeLimitMinutes: 20,
        questions: [
          {
            question: 'Is the Halting Problem decidable over all Turing machines?',
            options: ['Yes, always', 'No, it is undecidable', 'Only for finite automata', 'Decidable in polynomial time'],
            correctAnswer: 1,
            marks: 10,
            explanation: 'Turing proved in 1936 that no general algorithm can decide halting for all inputs.',
          },
          {
            question: 'Which complexity class contains problems verifiable in polynomial time?',
            options: ['P', 'NP', 'EXPTIME', 'BQP'],
            correctAnswer: 1,
            marks: 15,
            explanation: 'NP represents nondeterministic polynomial time, verifiable in polynomial time.',
          },
        ],
      },
      { id: instructor1._id.toString(), role: 'instructor' }
    );

    assert(createdQuiz && createdQuiz.title === 'Halting Problem & Decidability Quiz', 'Instructor can create quiz with title');
    assert(createdQuiz.passingScore === 75, 'Instructor can set custom passing score (75%)');
    assert(createdQuiz.questions.length === 2, 'Quiz initialized with 2 questions');
    assert(createdQuiz.questions[0].marks === 10 && createdQuiz.questions[1].marks === 15, 'Questions have customized marks/points');

    // TEST 2: Add Question to Quiz
    console.log('\n🔹 Test Group 2: Question Management (Add, Update, Delete)');
    const addResult = await quizService.addQuestionToQuiz(
      createdQuiz._id.toString(),
      {
        question: 'Does P = NP have a known consensus solution?',
        options: ['Yes, proven equal', 'Yes, proven unequal', 'No, it remains an open Millennium Prize problem', 'It was retracted'],
        correctAnswer: 2,
        marks: 25,
        explanation: 'The P versus NP problem remains unresolved.',
      },
      { id: instructor1._id.toString(), role: 'instructor' }
    );

    assert(addResult.quiz.questions.length === 3, 'Instructor can add question to existing quiz');
    const thirdQ = addResult.quiz.questions[2];
    assert(thirdQ.marks === 25, 'Newly added question preserves marks');

    // TEST 3: Update Question in Quiz
    const updatedRes = await quizService.updateQuestionInQuiz(
      createdQuiz._id.toString(),
      thirdQ._id.toString(),
      {
        question: 'Does P equal NP according to current mathematical consensus?',
        marks: 20,
      },
      { id: instructor1._id.toString(), role: 'instructor' }
    );
    const updatedQ = updatedRes.quiz.questions.id(thirdQ._id);
    assert(updatedQ.marks === 20, 'Instructor can update question marks to 20');
    assert(updatedQ.question.includes('current mathematical consensus'), 'Instructor can update question text');

    // TEST 4: Delete Question from Quiz
    const delRes = await quizService.deleteQuestionFromQuiz(
      createdQuiz._id.toString(),
      thirdQ._id.toString(),
      { id: instructor1._id.toString(), role: 'instructor' }
    );
    assert(delRes.success === true, 'Instructor can delete question from quiz');
    const freshQuiz = await Quiz.findById(createdQuiz._id);
    assert(freshQuiz.questions.length === 2, 'Quiz question count decremented back to 2');

    // TEST 5: Authorization & Ownership Protection
    console.log('\n🔹 Test Group 3: Authorization & Ownership Security');
    let unauthorizedBlocked = false;
    try {
      await quizService.addQuestionToQuiz(
        createdQuiz._id.toString(),
        {
          question: 'Malicious question?',
          options: ['A', 'B'],
          correctAnswer: 0,
        },
        { id: instructor2._id.toString(), role: 'instructor' }
      );
    } catch (err) {
      if (err.statusCode === 403) unauthorizedBlocked = true;
    }
    assert(unauthorizedBlocked, 'Non-owner instructor blocked from modifying another instructor quiz (403)');

    let studentBlocked = false;
    try {
      await quizService.updateQuiz(
        createdQuiz._id.toString(),
        { passingScore: 10 },
        { id: student._id.toString(), role: 'student' }
      );
    } catch (err) {
      if (err.statusCode === 403) studentBlocked = true;
    }
    assert(studentBlocked, 'Student blocked from modifying quiz settings (403)');

    // TEST 6: Anti-Cheat Masking for Students
    console.log('\n🔹 Test Group 4: Anti-Cheat Masking Before Submission');
    const studentView = await quizService.getQuizById(
      createdQuiz._id.toString(),
      { id: student._id.toString(), role: 'student' }
    );

    assert(studentView.questions[0].correctAnswer === undefined, 'Student view masks correctAnswer');
    assert(studentView.questions[0].correctAnswerIndex === undefined, 'Student view masks correctAnswerIndex');
    assert(studentView.questions[0].explanation === undefined, 'Student view masks explanation');
    assert(Array.isArray(studentView.questions[0].options), 'Student view preserves options');

    const instructorView = await quizService.getQuizById(
      createdQuiz._id.toString(),
      { id: instructor1._id.toString(), role: 'instructor' }
    );
    assert(instructorView.questions[0].correctAnswer !== undefined, 'Instructor view retains correctAnswer');

    // TEST 7: Backend Grading, Score Calculation & Pass/Fail
    console.log('\n🔹 Test Group 5: Secure Backend Grading & Submission');
    // Total marks = 10 + 15 = 25. Passing score is 75%.
    // Passing requires >= 18.75 marks (i.e. both correct: 25/25 = 100%).
    // First attempt: answer only question 0 correctly, question 1 incorrectly.
    // Score = 10/25 = 40% -> FAIL.
    const failSubmission = await quizService.submitQuiz(
      createdQuiz._id.toString(),
      student._id.toString(),
      {
        answers: [
          { questionIndex: 0, selectedOption: 1 }, // Correct (+10)
          { questionIndex: 1, selectedOption: 0 }, // Incorrect (0)
        ],
        timeSpentSeconds: 180,
      }
    );

    assert(failSubmission.score === 10, 'Backend correctly calculated earned score (10)');
    assert(failSubmission.totalPoints === 25, 'Backend calculated total quiz points (25)');
    assert(failSubmission.percentage === 40, 'Backend calculated score percentage (40%)');
    assert(failSubmission.passed === false, 'Quiz status is FAIL when percentage (40%) < passingScore (75%)');
    assert(failSubmission.correctCount === 1, 'Result returns correct count (1)');
    assert(failSubmission.incorrectCount === 1, 'Result returns incorrect count (1)');
    assert(Array.isArray(failSubmission.detailedReview), 'Result includes detailed review with correct answers after submission');

    // TEST 8: MongoDB Persistence in QuizAttempt
    console.log('\n🔹 Test Group 6: MongoDB QuizAttempt Persistence');
    const savedAttempt = await QuizAttempt.findById(failSubmission.attemptId);
    assert(savedAttempt !== null, 'Quiz attempt persisted in MongoDB');
    assert(savedAttempt.student.toString() === student._id.toString(), 'Attempt records student ID');
    assert(savedAttempt.answers.length === 2, 'Attempt stores per-question answer breakdown');
    assert(savedAttempt.timeSpentSeconds === 180, 'Attempt stores time spent');

    // TEST 9: Retrying / Retake Allowed
    console.log('\n🔹 Test Group 7: Quiz Retry & Passing Score Achievement');
    // Second attempt: both correct! (+10 + 15 = 25/25 = 100% -> PASS)
    const passSubmission = await quizService.submitQuiz(
      createdQuiz._id.toString(),
      student._id.toString(),
      {
        answers: [
          { questionIndex: 0, selectedOption: 1 }, // Correct (+10)
          { questionIndex: 1, selectedOption: 1 }, // Correct (+15)
        ],
        timeSpentSeconds: 120,
      }
    );

    assert(passSubmission.score === 25, 'Retry earned full score (25)');
    assert(passSubmission.percentage === 100, 'Retry earned 100%');
    assert(passSubmission.passed === true, 'Quiz status is PASS when percentage >= 75%');
    assert(passSubmission.correctCount === 2, 'Result returns 2 correct answers');
    assert(passSubmission.incorrectCount === 0, 'Result returns 0 incorrect answers');

    // Verify student submissions history
    const allStudentSubmissions = await quizService.getStudentQuizSubmissions(
      createdQuiz._id.toString(),
      student._id.toString()
    );
    assert(allStudentSubmissions.length === 2, 'Student history records both attempts (retry tracked in DB)');

    console.log(`\n========================================`);
    console.log(`🏁 Quiz Test Suite Finished: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 Unhandled error in quiz tests:', err);
    process.exit(1);
  } finally {
    if (mongoServer) {
      await mongoose.disconnect();
      await mongoServer.stop();
    }
  }
}

runQuizTests();
