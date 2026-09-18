import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  Award,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

const QuizTaker = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionIndex]: optionIndex }
  const [timeLeft, setTimeLeft] = useState(600); // in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/quizzes/${quizId}`);
        setQuiz(res.data.quiz);
        setTimeLeft((res.data.quiz.timeLimitMinutes || 10) * 60);
      } catch (err) {
        toast.error(err.message || 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(); // auto-submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const handleSelectOption = (qIdx, optIdx) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [qIdx]: optIdx,
    });
  };

  const handleSubmitQuiz = async () => {
    if (submitting || isSubmitted) return;
    try {
      setSubmitting(true);
      const answersArray = Object.entries(selectedAnswers).map(
        ([qIndex, optIndex]) => ({
          questionIndex: Number(qIndex),
          selectedOption: Number(optIndex),
        })
      );

      const res = await API.post(`/quizzes/${quizId}/submit`, {
        answers: answersArray,
        timeSpentSeconds: (quiz?.timeLimitMinutes || 10) * 60 - timeLeft,
      });

      setResult(res.data);
      setIsSubmitted(true);

      if (res.data.passed) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        toast.success('🎉 Assessment passed successfully!');
      } else {
        toast.info('Assessment submitted. Passing score not reached.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to={`/student/course/${courseId}/learn`}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">
              {quiz?.title}
            </h1>
            <p className="text-xs text-slate-400">
              Passing threshold: {quiz?.passingScore}% • {quiz?.questions?.length} Questions
            </p>
          </div>
        </div>

        {!isSubmitted && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-sm ${
              timeLeft < 120
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-slate-900 text-indigo-400 border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Result Showcase */}
      {isSubmitted && result && (
        <div className="max-w-3xl mx-auto w-full my-6 p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-xl animate-in fade-in zoom-in-95">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 ${
              result.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {result.passed ? <Award className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {result.passed ? 'Assessment Passed with Honors!' : 'Keep Learning & Try Again'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            You scored{' '}
            <span className="font-bold text-white text-base">
              {result.percentage}%
            </span>{' '}
            ({result.score}/{result.totalPoints} points). Required: {result.passingScore}%.
          </p>

          <div className="flex items-center justify-center gap-3 mt-5">
            <Link
              to={`/student/course/${courseId}/learn`}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
            >
              Return to Class
            </Link>
          </div>
        </div>
      )}

      {/* Questions Form */}
      <div className="max-w-3xl mx-auto w-full space-y-6 py-6">
        {quiz?.questions?.map((q, qIdx) => {
          const reviewItem = result?.detailedReview?.[qIdx];

          return (
            <div
              key={qIdx}
              className={`p-6 rounded-3xl bg-slate-900 border transition-colors ${
                isSubmitted
                  ? reviewItem?.isCorrect
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-rose-500/40 bg-rose-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-400">
                  Question {qIdx + 1} of {quiz.questions.length}
                </span>
                {isSubmitted && reviewItem && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      reviewItem.isCorrect
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {reviewItem.isCorrect ? '+10 pts (Correct)' : '0 pts'}
                  </span>
                )}
              </div>

              <p className="text-base font-semibold text-white mb-4">
                {q.questionText}
              </p>

              <div className="space-y-2.5">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[qIdx] === optIdx;
                  let optStyle =
                    'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300';

                  if (isSubmitted && reviewItem) {
                    if (optIdx === reviewItem.correctAnswerIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold';
                    } else if (isSelected && !reviewItem.isCorrect) {
                      optStyle = 'border-rose-500 bg-rose-500/10 text-rose-300 line-through';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-indigo-500 bg-indigo-500/15 text-indigo-300 font-semibold';
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${optStyle}`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500 text-white'
                            : 'border-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="text-sm">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {isSubmitted && reviewItem?.explanation && (
                <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                  <span className="font-bold text-white">Explanation: </span>
                  {reviewItem.explanation}
                </div>
              )}
            </div>
          );
        })}

        {/* Submit Action */}
        {!isSubmitted && (
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all transform hover:scale-102 active:scale-98 disabled:opacity-50"
            >
              {submitting ? 'Evaluating Answers...' : 'Submit Assessment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizTaker;
