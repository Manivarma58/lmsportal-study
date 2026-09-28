import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import { NextActionCard } from '../../components/ui';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Target,
  ArrowRight,
  Code,
  BookOpen,
  Award,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  BrainCircuit,
  GraduationCap,
  Clock,
  FolderGit2,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  BarChart3,
  ShieldCheck,
  CheckCircle,
  Play,
  Flame,
  Zap,
} from 'lucide-react';

const trendIcons = {
  improving: {
    icon: TrendingUp,
    label: 'Accelerating',
    className: 'text-emerald-600 dark:text-emerald-400',
  },
  declining: {
    icon: TrendingDown,
    label: 'Needs Review',
    className: 'text-amber-600 dark:text-amber-400',
  },
  steady: {
    icon: Minus,
    label: 'Steady',
    className: 'text-slate-400 dark:text-slate-500',
  },
  new: {
    icon: Sparkles,
    label: 'Calibrating',
    className: 'text-cyan-500 dark:text-cyan-400',
  },
};

const levelBadgeStyles = {
  Beginner: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  Intermediate: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Advanced: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  Expert: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
};

import { getCache, setCache } from '../../utils/fastCache';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Initialize from instant fast cache if available
  const initialCache = getCache('student_dashboard_data') || {};

  const [enrollments, setEnrollments] = useState(initialCache.enrollments || []);
  const [certificates, setCertificates] = useState(initialCache.certificates || []);
  const [dashboardSummary, setDashboardSummary] = useState(initialCache.dashboardSummary || null);
  const [challenges, setChallenges] = useState(initialCache.challenges || []);
  const [projects, setProjects] = useState(initialCache.projects || []);
  const [recommendedCourses, setRecommendedCourses] = useState(initialCache.recommendedCourses || []);
  const [targetRole, setTargetRole] = useState(initialCache.targetRole || null);
  const [nextActionRec, setNextActionRec] = useState(initialCache.nextActionRec || null);
  const [loading, setLoading] = useState(!initialCache.dashboardSummary && !initialCache.enrollments);
  const [fetchError, setFetchError] = useState(null);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setFetchError(null);

      const [
        enrollmentRes,
        certRes,
        courseRes,
        skillSummaryRes,
        challengeRes,
        projectRes,
        targetRoleRes,
        recRes,
      ] = await Promise.allSettled([
        API.get('/enrollments/my-courses'),
        API.get('/certificates/student/my-certificates'),
        API.get('/courses', { params: { limit: 4 } }),
        API.get('/skills/dashboard-summary'),
        API.get('/challenges', { params: { limit: 4 } }),
        API.get('/projects', { params: { limit: 3 } }),
        API.get('/target-roles/learner/current'),
        API.get('/recommendations/me'),
      ]);

      let newEnrollments = [];
      let newCertificates = [];
      let newCourses = [];
      let newSummary = null;
      let newChallenges = [];
      let newProjects = [];
      let newTargetRole = null;
      let newRec = null;

      if (enrollmentRes.status === 'fulfilled') {
        const raw = enrollmentRes.value.data?.enrollments || [];
        newEnrollments = raw.filter((e) => Boolean(e.course));
        setEnrollments(newEnrollments);
      }
      if (certRes.status === 'fulfilled') {
        newCertificates = certRes.value.data?.certificates || [];
        setCertificates(newCertificates);
      }
      if (courseRes.status === 'fulfilled') {
        newCourses = courseRes.value.data?.courses || [];
        setRecommendedCourses(newCourses);
      }
      if (skillSummaryRes.status === 'fulfilled') {
        newSummary = skillSummaryRes.value.data;
        setDashboardSummary(newSummary);
      }
      if (challengeRes.status === 'fulfilled') {
        const cList = challengeRes.value.data?.challenges || [];
        newChallenges = Array.isArray(cList) ? cList : [];
        setChallenges(newChallenges);
      }
      if (projectRes.status === 'fulfilled') {
        const pList = projectRes.value.data?.projects || [];
        newProjects = Array.isArray(pList) ? pList : [];
        setProjects(newProjects);
      }
      if (targetRoleRes.status === 'fulfilled' && targetRoleRes.value.data?.activeRole) {
        newTargetRole = targetRoleRes.value.data.activeRole.targetRole || targetRoleRes.value.data.activeRole;
        setTargetRole(newTargetRole);
      }
      if (recRes.status === 'fulfilled' && recRes.value.data?.recommendation) {
        newRec = recRes.value.data.recommendation;
        setNextActionRec(newRec);
      }

      // Persist to fast cache for zero-delay instant switching
      setCache('student_dashboard_data', {
        enrollments: newEnrollments,
        certificates: newCertificates,
        recommendedCourses: newCourses,
        dashboardSummary: newSummary,
        challenges: newChallenges,
        projects: newProjects,
        targetRole: newTargetRole,
        nextActionRec: newRec,
      });

      // Synchronize shared caches so MyCourses, CodingLab, and Projects open instantly in 0ms
      if (newEnrollments.length > 0) setCache('student_enrollments', newEnrollments);
      if (newCertificates.length > 0) setCache('student_certificates', newCertificates);
      if (newChallenges.length > 0) setCache('student_challenges', newChallenges);
      if (newProjects.length > 0) setCache('student_projects', newProjects);
    } catch (err) {
      console.warn('Dashboard telemetry fetch notice:', err);
      setFetchError('Could not fetch latest learning telemetry. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If cached, fetch silently in background; otherwise show initial loader
    const hasCachedData = Boolean(initialCache.dashboardSummary || initialCache.enrollments);
    fetchDashboardData(hasCachedData);
  }, []);

  // Compute curriculum progress
  const totalEnrolled = enrollments.length;
  const inProgressEnrollments = useMemo(
    () =>
      enrollments.filter(
        (e) => !e.completed && (e.completionPercentage ?? e.progressPercentage ?? 0) < 100
      ),
    [enrollments]
  );
  const activeEnrollment = inProgressEnrollments[0] || enrollments[0] || null;
  const activeCourse = activeEnrollment?.course || null;
  const activeCourseProgress =
    activeEnrollment?.completionPercentage ?? activeEnrollment?.progressPercentage ?? 0;

  // Real Skill stats from backend telemetry
  const skillStats = dashboardSummary?.stats || {
    totalSkills: 0,
    averageScore: 0,
    overallLevel: 'Beginner',
    verifiedEvidenceTotal: 0,
    proficiencyCounts: { Beginner: 0, Intermediate: 0, Advanced: 0, Expert: 0 },
    dimensionalAverages: { knowledge: 0, practical: 0, project: 0, assessment: 0 },
  };

  const topSkills = dashboardSummary?.topSkills || [];
  const weakAreas = dashboardSummary?.weakAreas || [];
  const recentAssessments = dashboardSummary?.recentAssessments || [];
  const nextAction = nextActionRec || dashboardSummary?.nextAction || null;

  // Student greeting name & target role title
  const studentName = user?.name || 'Scholar';
  const roleTitle = targetRole?.title || 'Full Stack Cloud Engineer';

  if (loading) {
    return (
      <div className="flex flex-col w-full text-slate-800 dark:text-slate-100 antialiased pb-16 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-44 bg-slate-200 dark:bg-slate-800/60 rounded-3xl"></div>
        <div className="h-40 bg-slate-200 dark:bg-slate-800/60 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-slate-200 dark:bg-slate-800/60 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full text-slate-800 dark:text-slate-100 antialiased pb-16">
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 max-w-7xl mx-auto">
        
        {fetchError && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold hover:bg-amber-200 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* 1. WELCOME / LEARNER STATUS */}
        {/* ============================================================ */}
        <section className="relative w-full rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/90 dark:border-slate-800 p-6 lg:p-8 overflow-hidden transition-all">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left Greeting & Telemetry Header */}
            <div className="flex flex-col gap-3 max-w-2xl min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-xs font-semibold border border-blue-200/70 dark:border-blue-800">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  ACADEMIC SESSION ACTIVE
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono text-xs font-semibold border border-purple-200/70 dark:border-purple-800">
                  <Target className="w-3 h-3" />
                  TARGET ROLE: {roleTitle.toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs font-bold">
                  {skillStats.overallLevel.toUpperCase()} LEVEL
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome back,{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                    {studentName}
                  </span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Competency telemetry active. Real-time scores calculated from verified coding challenges, job simulations, and evaluated laboratories.
                </p>
              </div>

              {/* Status Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Overall Skill</span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {skillStats.averageScore}%
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Active Courses</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {totalEnrolled}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Verified Evidence</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {skillStats.verifiedEvidenceTotal}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Certificates</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                    {certificates.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Quick Action Portal */}
            <div className="w-full lg:w-72 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-4 shrink-0 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span>Learning Hub</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  to="/student/mentor"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:border-cyan-500 transition-all shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-cyan-500 text-[18px]">smart_toy</span>
                    <span>AI Mentor</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/student/portfolio"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-[18px]">badge</span>
                    <span>Skill Portfolio</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/student/certificates"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 transition-all shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-[18px]">workspace_premium</span>
                    <span>Certificates ({certificates.length})</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. CONTINUE LEARNING */}
        {/* ============================================================ */}
        <section className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Continue Learning
              </h2>
            </div>
            <Link
              to="/student/my-courses"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>All Enrolled ({enrollments.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeCourse ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                      {activeCourse.category || 'Curriculum'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Level: {activeCourse.level || 'Intermediate'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                    {activeCourse.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Instructor: {activeCourse.instructor?.name || 'Lead Faculty Chair'} • {activeCourseProgress}% Completed
                  </p>
                </div>
              </div>

              {/* Progress Bar & Direct Action Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 md:min-w-[280px]">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeCourseProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${activeCourseProgress}%` }}
                    ></div>
                  </div>
                </div>

                <Link
                  to={`/student/course/${activeCourse._id}/learn`}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Course</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Active Enrolled Courses</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Explore the course catalog to enroll in foundational and advanced engineering tracks.
              </p>
              <Link
                to="/student/courses"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 3. MY SKILLS */}
        {/* ============================================================ */}
        <section className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                My Skills
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
                {topSkills.length} Tracked
              </span>
            </div>
            <Link
              to="/student/progress"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Full Skill Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {topSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topSkills.slice(0, 6).map((skill) => {
                const sName = skill.name || skill.skillName || 'Engineering Competency';
                const sScore = Math.round(skill.overallScore || skill.score || 0);
                const sLevel = skill.proficiencyLevel || (sScore >= 90 ? 'Expert' : sScore >= 75 ? 'Advanced' : sScore >= 50 ? 'Intermediate' : 'Beginner');
                const badgeCls = levelBadgeStyles[sLevel] || levelBadgeStyles.Beginner;
                const trendKey = skill.trend || 'steady';
                const trendMeta = trendIcons[trendKey] || trendIcons.steady;
                const TrendIconComp = trendMeta.icon;

                return (
                  <div
                    key={skill._id || skill.skillId || sName}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500">
                          {skill.category || 'Software Engineering'}
                        </span>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">
                          {sName}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${badgeCls}`}>
                          {sLevel}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-1 text-[11px]">
                          <TrendIconComp className={`w-3.5 h-3.5 ${trendMeta.className}`} />
                          <span className="text-slate-500 dark:text-slate-400">{trendMeta.label}</span>
                        </div>
                        <span className="font-black text-slate-900 dark:text-white text-sm">
                          {sScore}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            sLevel === 'Expert'
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                              : sScore >= 75
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                          }`}
                          style={{ width: `${sScore}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
                      <span>{skill.evidenceCount || 1} verified evidence items</span>
                      <Link
                        to={`/student/progress?skill=${skill.slug || sName.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
              <BrainCircuit className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">No Skill Telemetry Yet</h4>
              <p className="text-xs text-slate-500">
                Complete diagnostic quizzes and practical challenges to calibrate your skill matrix.
              </p>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 4. WEAK AREAS */}
        {/* ============================================================ */}
        <section className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Weak Areas
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono text-xs font-semibold border border-amber-200 dark:border-amber-800">
                Targeted Remediation
              </span>
            </div>
            <Link
              to="/student/adaptive-learning"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Adaptive Remediation Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {weakAreas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weakAreas.slice(0, 4).map((weak, idx) => (
                <div
                  key={weak.skillId || idx}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-amber-800/80 shadow-xs flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold">
                        {weak.category || 'Identified Gap'}
                      </span>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        {weak.skillName}
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono text-xs font-black border border-amber-200 dark:border-amber-800">
                      {weak.overallScore}% SCORE
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1">
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      {weak.reason || `Performance in ${weak.dimensionLabel || 'practical labs'} is below the 70% threshold.`}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Recommendation: {weak.suggestion || 'Engage with targeted lab exercises to advance proficiency.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Dimension: {weak.dimensionLabel || 'Practical Labs'} ({weak.dimensionScore || weak.overallScore}%)
                    </span>
                    <Link
                      to="/student/adaptive-learning"
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Remediate Skill</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">All Tracked Skills Above Benchmark</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No critical weaknesses detected. All demonstrated competencies meet target role thresholds.
                  </p>
                </div>
              </div>
              <Link
                to="/student/progress"
                className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 transition-colors shrink-0"
              >
                View Skill Matrix
              </Link>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 5. YOUR NEXT ACTION (THE MOST IMPORTANT CTA) */}
        {/* ============================================================ */}
        <section className="w-full">
          <NextActionCard action={nextAction} loading={loading} />
        </section>

        {/* ============================================================ */}
        {/* 6. PRACTICAL CHALLENGES */}
        {/* ============================================================ */}
        <section className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Practical Challenges
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-mono text-xs font-semibold border border-cyan-200 dark:border-cyan-800">
                Automated Test Harness
              </span>
            </div>
            <Link
              to="/student/challenges"
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>All Coding Labs ({challenges.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {challenges.slice(0, 4).map((ch) => {
                const isPassed = ch.userSubmission?.passed || ch.isCompleted;
                return (
                  <div
                    key={ch._id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                          {ch.category || 'Algorithms'}
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${
                          ch.difficulty === 'Expert' ? 'text-purple-600 dark:text-purple-400' :
                          ch.difficulty === 'Advanced' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {ch.difficulty || 'Intermediate'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                        {ch.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {ch.description || 'Implement optimized algorithms and pass production test suites.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      {isPassed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Passed
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {ch.timeLimit ? `${ch.timeLimit}s execution` : 'Automated test suite'}
                        </span>
                      )}

                      <Link
                        to={`/student/challenge/${ch._id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Code className="w-3.5 h-3.5" />
                        <span>Open IDE</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
              <Code className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Coding Labs Ready</h4>
              <p className="text-xs text-slate-500">Visit the coding lab directory to practice browser-based code execution.</p>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 7. PROJECTS */}
        {/* ============================================================ */}
        <section className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Real-World Projects
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-mono text-xs font-semibold border border-violet-200 dark:border-violet-800">
                Milestone Deliverables
              </span>
            </div>
            <Link
              to="/student/projects"
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
            >
              <span>Projects Catalog ({projects.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.slice(0, 3).map((proj) => (
                <div
                  key={proj._id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-mono text-[10px] font-bold border border-violet-200 dark:border-violet-800">
                        {proj.difficulty || 'Advanced'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {proj.estimatedDuration || '2 weeks'}
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2">
                      {proj.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {proj.description || 'Fullstack microservices architecture, CI/CD pipelines, and cloud telemetry.'}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap gap-1">
                      {(proj.requiredSkills || []).slice(0, 3).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                          {typeof s === 'string' ? s : s?.name || 'Skill'}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/student/projects/${proj._id}`}
                      className="w-full py-2 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Open Project Workspace</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
              <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Applied Projects</h4>
              <p className="text-xs text-slate-500">Real-world production engineering projects are ready for deployment.</p>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 8. RECENT ASSESSMENTS */}
        {/* ============================================================ */}
        <section className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Recent Assessments
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                Diagnostic &amp; Evaluations
              </span>
            </div>
            <Link
              to="/student/progress"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View Evaluation History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentAssessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAssessments.slice(0, 3).map((item, idx) => {
                const scorePercent = item.percentage ?? Math.round((item.score / (item.maxScore || 100)) * 100);
                const isPassed = scorePercent >= 60;
                return (
                  <div
                    key={item._id || idx}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500">
                        {item.type?.replace('_', ' ') || 'Evaluation'} • {item.skillName || 'Engineering'}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'Evaluated'}
                      </p>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <span className={`text-base font-black font-mono block ${
                        isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {scorePercent}%
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isPassed ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}>
                        {isPassed ? 'PASSED' : 'REVISION'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
              <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">No Recent Evaluations</h4>
              <p className="text-xs text-slate-500">Complete curriculum quizzes to log your initial performance baseline.</p>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 9. LEARNING ANALYTICS */}
        {/* ============================================================ */}
        <section className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Learning Analytics
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold">
                Telemetry Breakdown
              </span>
            </div>
            <Link
              to="/student/progress"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Full Analytics Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Dimension 1: Practical Laboratories */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400">Practical Labs</span>
                <span className="font-mono font-black text-cyan-600 dark:text-cyan-400 text-lg">
                  {skillStats.dimensionalAverages?.practical || 0}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${skillStats.dimensionalAverages?.practical || 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Demonstrated performance on hands-on coding tests &amp; algorithms.
              </p>
            </div>

            {/* Dimension 2: Theoretical Knowledge */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400">Knowledge / Theory</span>
                <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-lg">
                  {skillStats.dimensionalAverages?.knowledge || 0}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${skillStats.dimensionalAverages?.knowledge || 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Conceptual accuracy on modular diagnostic assessments.
              </p>
            </div>

            {/* Dimension 3: Engineering Projects */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400">Applied Projects</span>
                <span className="font-mono font-black text-violet-600 dark:text-violet-400 text-lg">
                  {skillStats.dimensionalAverages?.project || 0}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-600 transition-all duration-300"
                  style={{ width: `${skillStats.dimensionalAverages?.project || 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Milestone architectures, code reviews, and repo deliverables.
              </p>
            </div>

            {/* Dimension 4: Formal Assessments */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400">Evaluations</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-lg">
                  {skillStats.dimensionalAverages?.assessment || 0}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${skillStats.dimensionalAverages?.assessment || 0}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                End-of-unit comprehensive evaluation and peer benchmarks.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 10. RECOMMENDED LEARNING */}
        {/* ============================================================ */}
        <section className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Recommended Learning
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-xs font-semibold border border-teal-200 dark:border-teal-800">
                Role Curated
              </span>
            </div>
            <Link
              to="/student/courses"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recommendedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedCourses.slice(0, 4).map((course) => (
                <div
                  key={course._id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold border border-teal-200 dark:border-teal-800">
                        {course.category || 'Specialization'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {course.level || 'Intermediate'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {course.description || 'Comprehensive curriculum with hands-on labs and direct credentialing.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {course.lessonsCount ? `${course.lessonsCount} modules` : 'Full track'}
                    </span>
                    <Link
                      to={`/course/${course._id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Curriculum Up to Date</h4>
              <p className="text-xs text-slate-500">Visit the course catalog to explore emerging technology tracks.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}