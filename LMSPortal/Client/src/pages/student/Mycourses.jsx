import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { BookOpen, PlayCircle, Award, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

const Mycourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'in-progress', 'completed'

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const res = await API.get('/enrollments/my-courses');
        setEnrollments(res.data.enrollments);
      } catch (err) {
        toast.error(err.message || 'Failed to fetch enrolled courses');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const filtered = enrollments.filter((item) => {
    if (activeTab === 'in-progress') return !item.isCompleted;
    if (activeTab === 'completed') return item.isCompleted;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Learning Journey
          </h1>
          <p className="text-sm text-slate-500">
            All courses you have enrolled in, with tracked lesson milestones.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            All ({enrollments.length})
          </button>
          <button
            onClick={() => setActiveTab('in-progress')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'in-progress'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            In Progress ({enrollments.filter((e) => !e.isCompleted).length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Completed ({enrollments.filter((e) => e.isCompleted).length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading your courses...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No courses found in this category
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Browse our course catalog to find your next topic of study.
          </p>
          <Link
            to="/courses"
            className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md"
          >
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.course?.thumbnail}
                    alt={item.course?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white/90 text-slate-800 backdrop-blur-sm">
                    {item.course?.category}
                  </span>
                  {item.isCompleted && (
                    <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2">
                    {item.course?.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Instructor: {item.course?.instructor?.name || 'Instructor'}
                  </p>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
                      <span>Progress</span>
                      <span className="font-bold">{item.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${item.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between">
                {item.isCompleted && item.certificate ? (
                  <Link
                    to={`/student/certificates/${item.certificate._id || item.certificate}`}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold hover:underline"
                  >
                    <Award className="w-4 h-4" /> Certificate
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> In Progress
                  </span>
                )}

                <Link
                  to={`/student/course/${item.course?._id}/learn`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors"
                >
                  <PlayCircle className="w-4 h-4" /> Continue
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Mycourses;