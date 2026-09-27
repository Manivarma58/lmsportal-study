import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import {
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  PlayCircle,
  BarChart3,
  Calendar,
  ArrowRight,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SkillProgress } from '../../components/ui';
import { toast } from 'sonner';
import { getCache, setCache } from '../../utils/fastCache';

const Progress = () => {
  const initialCache = getCache('student_progress_data') || {};

  const [enrollments, setEnrollments] = useState(initialCache.enrollments || []);
  const [certificates, setCertificates] = useState(initialCache.certificates || []);
  const [skills, setSkills] = useState(initialCache.skills || []);
  const [skillStats, setSkillStats] = useState(initialCache.skillStats || null);
  const [loading, setLoading] = useState(!initialCache.enrollments && !initialCache.skills);

  const fetchProgressData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [eRes, cRes, sRes] = await Promise.allSettled([
        API.get('/enrollments/my-courses'),
        API.get('/certificates/student/my-certificates'),
        API.get('/skills/my-skills'),
      ]);

      let newEnrollments = [];
      let newCertificates = [];
      let newSkills = [];
      let newSkillStats = null;

      if (eRes.status === 'fulfilled') {
        newEnrollments = eRes.value.data?.enrollments || [];
        setEnrollments(newEnrollments);
      }
      if (cRes.status === 'fulfilled') {
        newCertificates = cRes.value.data?.certificates || [];
        setCertificates(newCertificates);
      }
      if (sRes.status === 'fulfilled') {
        newSkills = sRes.value.data?.skills || [];
        newSkillStats = sRes.value.data?.stats || null;
        setSkills(newSkills);
        setSkillStats(newSkillStats);
      }

      setCache('student_progress_data', {
        enrollments: newEnrollments,
        certificates: newCertificates,
        skills: newSkills,
        skillStats: newSkillStats,
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load progress analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasCached = Boolean(initialCache.enrollments || initialCache.skills);
    fetchProgressData(hasCached);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-3 font-medium">Gathering your learning metrics...</p>
      </div>
    );
  }

  const validEnrollments = enrollments.filter((e) => Boolean(e.course));

  const completedCourses = validEnrollments.filter(
    (e) => e.completed || e.isCompleted || (e.completionPercentage ?? e.progressPercentage ?? 0) === 100
  );
  const inProgressCourses = validEnrollments.filter(
    (e) => !e.completed && !e.isCompleted && (e.completionPercentage ?? e.progressPercentage ?? 0) < 100
  );

  // Calculate total completed lessons and overall average progress
  const totalCompletedLessons = validEnrollments.reduce(
    (sum, e) => sum + (e.completedLessons?.length || 0),
    0
  );

  const averageProgress =
    validEnrollments.length > 0
      ? Math.round(
          validEnrollments.reduce(
            (sum, e) => sum + (e.completionPercentage ?? e.progressPercentage ?? 0),
            0
          ) / validEnrollments.length
        )
      : 0;

  return (
    <div className="space-y-8 p-6 sm:p-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Learning Analytics &amp; Progress
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Detailed metrics, lesson completion tracking, and verifiable credential achievements.
        </p>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Avg. Completion
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {averageProgress}%
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Lessons Finished
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {totalCompletedLessons}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Courses Finished
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {completedCourses.length} / {enrollments.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Certificates
            </p>
            <p className="text-2xl font-bold text-amber-500 mt-1">
              {certificates.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Demonstrated Skill Mastery Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Demonstrated Skill Mastery ({skills.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Proficiency scores calculated exclusively from evaluated quizzes, coding sandboxes, and verified assessments.
            </p>
          </div>

          {skillStats && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200/80">
                {skillStats.averageScore}% Avg Mastery
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-medium">
                {skillStats.verifiedEvidenceTotal} Evidence Points
              </span>
            </div>
          )}
        </div>

        {skills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skillItem) => (
              <SkillProgress
                key={skillItem._id || skillItem.id}
                skill={skillItem}
                variant="detailed"
              />
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-white border border-dashed border-slate-200 text-center">
            <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">
              No Demonstrated Evidence Recorded Yet
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Complete quizzes, solve code sandboxes, and submit assessments in your enrolled courses to calibrate your skill proficiency scores.
            </p>
          </div>
        )}
      </div>

      {/* Empty State */}
      {enrollments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">
            No Progress Recorded Yet
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
            You are not currently enrolled in any courses. Explore the catalog and start your learning path today!
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            Browse Course Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Course Breakdown List */
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Course Completion Breakdown
          </h2>

          <div className="space-y-4">
            {validEnrollments.map((item) => {
              const course = item.course;
              const completedLessonsCount = item.completedLessons?.length || 0;
              const progress = item.completionPercentage ?? item.progressPercentage ?? 0;
              const isDone = item.completed || item.isCompleted || progress === 100;
              const certId = item.certificate?._id || item.certificate;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <img
                      src={
                        course?.thumbnail ||
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300'
                      }
                      alt={course?.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0 border border-slate-200"
                    />

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {course?.category || 'General'}
                        </span>
                        {isDone ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" /> In Progress
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-base truncate max-w-md sm:max-w-lg">
                        {course?.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Instructor: {course?.instructor?.name || 'Instructor'} • Enrolled{' '}
                        {new Date(item.createdAt || item.enrolledAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-shrink-0">
                    <div className="w-full sm:w-44 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          {completedLessonsCount} lessons done
                        </span>
                        <span className="font-bold text-slate-800">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isDone ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDone && certId ? (
                        <Link
                          to={`/student/certificates/${certId}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                        >
                          <Award className="w-3.5 h-3.5" /> View Certificate
                        </Link>
                      ) : null}

                      <Link
                        to={`/student/course/${course?._id}/learn`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                      >
                        <PlayCircle className="w-3.5 h-3.5" /> Continue
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Earned Certificates Section */}
      {certificates.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Verified Credentials &amp; Certificates ({certificates.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    Verified Award
                  </span>
                  <Award className="w-5 h-5 text-amber-500" />
                </div>

                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                  {cert.course?.title || cert.courseTitle || 'Course Certificate'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Issued: {new Date(cert.issueDate || cert.createdAt).toLocaleDateString()}
                </p>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Code: {cert.certificateCode}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/verify/${cert.certificateCode}`}
                    target="_blank"
                    className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1"
                  >
                    Verify <ExternalLink className="w-3 h-3" />
                  </Link>

                  <Link
                    to={`/student/certificates/${cert._id}`}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View Credential →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
