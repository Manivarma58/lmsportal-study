import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const run = async () => {
  await connectDB();
  const quizzes = await Quiz.find().populate('course', 'title category domain').lean();
  console.log(`Total Quizzes: ${quizzes.length}`);
  quizzes.forEach((q, i) => {
    console.log(`${i + 1}. [${q._id}] "${q.title}" | Course: "${q.course?.title || 'None'}" | Current QCount: ${q.questions?.length || 0}`);
  });
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
