import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const instructorName = user?.name || 'Faculty Member';

  // API State
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('intelligence'); // 'intelligence' | 'courses'
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Filters State
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedPerformance, setSelectedPerformance] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [studentSearch, setStudentSearch] = useState('');

  // Course Catalog Filter (for courses tab)
  const [courseCategory, setCourseCategory] = useState('all');
  const [courseSearch, setCourseSearch] = useState('');

  // Fetch Instructor Learning Intelligence
  const fetchIntelligence = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCourse !== 'all') params.append('courseId', selectedCourse);
      if (selectedSkill !== 'all') params.append('skillId', selectedSkill);
      if (selectedPerformance !== 'all') params.append('performance', selectedPerformance);
      if (selectedDate !== 'all') params.append('date', selectedDate);
      if (studentSearch.trim()) params.append('student', studentSearch.trim());

      const res = await API.get(`/analytics/instructor/intelligence?${params.toString()}`);
      if (res.data?.success) {
        setIntelligenceData(res.data);
      }
    } catch (err) {
      console.error('Failed to load instructor intelligence:', err);
      toast.error('Unable to fetch live learning intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, [selectedCourse, selectedSkill, selectedPerformance, selectedDate]);

  // Debounced search on typing
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchIntelligence();
    }, 350);
    return () => clearTimeout(handler);
  }, [studentSearch]);

  const summary = intelligenceData?.summary || {
    totalStudents: 0,
    avgCourseProgress: 0,
    avgPracticalScore: 0,
    avgSkillScore: 0,
    avgAssessmentPassRate: 0,
    studentsAtRiskCount: 0,
    divergenceCount: 0,
    practicalBreakdown: { high: 0, moderate: 0, low: 0 },
  };

  const students = intelligenceData?.students || [];
  const divergenceAlerts = intelligenceData?.divergenceAlerts || [];
  const skillDistribution = intelligenceData?.skillDistribution || [];
  const mostDifficultSkills = intelligenceData?.mostDifficultSkills || [];
  const mostFailedAssessments = intelligenceData?.mostFailedAssessments || [];
  const recommendedInterventions = intelligenceData?.recommendedInterventions || [];
  const coursesList = intelligenceData?.courses || [];
  const skillsList = intelligenceData?.skillsList || [];

  // Export CSV
  const handleExportCSV = () => {
    if (students.length === 0) {
      toast.error('No student telemetry available to export.');
      return;
    }
    const headers = ['Student Name', 'Email', 'Course Progress (%)', 'Practical Score (%)', 'Skill Score (%)', 'Risk Status', 'Risk Reason'];
    const rows = students.map((s) => [
      `"${s.name}"`,
      `"${s.email}"`,
      s.courseProgress,
      s.practicalScore,
      s.skillScore,
      `"${s.riskStatus}"`,
      `"${(s.riskReason || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NOVA_Instructor_Intelligence_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Learning intelligence CSV exported successfully.');
  };

  // Scatter chart data for Divergence Matrix
  const scatterData = useMemo(() => {
    return students.map((s) => ({
      x: s.courseProgress,
      y: s.practicalScore,
      z: 10,
      name: s.name,
      email: s.email,
      status: s.riskStatus,
      isDivergent: (s.courseProgress >= 60 && s.practicalScore < 55) || (s.courseProgress >= 80 && s.practicalScore < 60),
    }));
  }, [students]);

  // Skill Distribution Bar Chart data
  const skillChartData = useMemo(() => {
    return skillDistribution.slice(0, 6).map((sk) => ({
      name: sk.name.length > 14 ? sk.name.substring(0, 12) + '..' : sk.name,
      fullName: sk.name,
      mastered: sk.mastered,
      proficient: sk.proficient,
      developing: sk.developing,
      novice: sk.novice,
      avgPractical: sk.avgPractical,
    }));
  }, [skillDistribution]);

  // Practical performance distribution data
  const practicalPieData = useMemo(() => {
    return [
      { name: 'High (≥80%)', value: summary.practicalBreakdown?.high || 0, color: '#10b981' },
      { name: 'Moderate (60-79%)', value: summary.practicalBreakdown?.moderate || 0, color: '#f59e0b' },
      { name: 'Struggling (<60%)', value: summary.practicalBreakdown?.low || 0, color: '#f43f5e' },
    ].filter((d) => d.value > 0);
  }, [summary]);

  const handleInterventionAction = (intervention) => {
    toast.success(`Action initiated: ${intervention.actionLabel} for "${intervention.targetEntity}".`);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 min-h-screen bg-transparent space-y-6">
      {/* =========================================================================
          1. INTELLIGENCE COMMAND HEADER
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200/80 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                LEARNING INTELLIGENCE DESK
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs border border-slate-200">
                Pedagogical Telemetry
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs border border-emerald-200 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Skill Engine Synced
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, <span className="text-blue-600">{instructorName}</span>.
            </h1>

            <p className="text-sm text-slate-500 leading-relaxed">
              Real-time learning analytics, practical vs curriculum divergence diagnostics, assessment failure tracking, and data-driven student interventions.
            </p>
          </div>

          {/* Quick Actions & View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('intelligence')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'intelligence'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-sm">psychology</span>
                <span>Learning Intelligence</span>
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'courses'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-sm">layers</span>
                <span>Curriculum Catalog</span>
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm border border-slate-200 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600">download</span>
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => navigate('/instructor/create-course')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Create Course</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'intelligence' ? (
        <>
          {/* =========================================================================
              2. LEARNING INTELLIGENCE KPI GRID (5 METRICS - LEARNING-FOCUSED)
          ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Metric 1: Student Performance (Course Progress) */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Course Progress
                </span>
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <span className="material-symbols-outlined text-[18px]">school</span>
                </span>
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-slate-900">
                  {summary.avgCourseProgress}%
                </span>
                <span className="text-[11px] font-semibold text-slate-400 font-mono">
                  {summary.totalStudents} Scholars
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${summary.avgCourseProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Metric 2: Practical Performance */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Practical Score
                </span>
                <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <span className="material-symbols-outlined text-[18px]">terminal</span>
                </span>
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-indigo-600">
                  {summary.avgPracticalScore}%
                </span>
                <span className="text-[11px] font-semibold text-slate-500 font-mono">Hands-on</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span>High: {summary.practicalBreakdown?.high || 0}</span>
                <span>Low: {summary.practicalBreakdown?.low || 0}</span>
              </div>
            </div>

            {/* Metric 3: Demonstrated Skill Score */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Cohort Skill Score
                </span>
                <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-purple-700">
                  {summary.avgSkillScore}%
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 font-mono">Verified</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${summary.avgSkillScore}%` }}
                ></div>
              </div>
            </div>

            {/* Metric 4: Assessment & Project Pass Rate */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Assessment Pass Rate
                </span>
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <span className="material-symbols-outlined text-[18px]">quiz</span>
                </span>
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-slate-900">
                  {summary.avgAssessmentPassRate}%
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 font-mono">Pass / Fail</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span>Quizzes & Labs</span>
                <span className="font-mono text-emerald-600 font-medium">Standard &gt; 70%</span>
              </div>
            </div>

            {/* Metric 5: At Risk / Divergence Alert */}
            <div className={`rounded-2xl p-5 shadow-sm border transition-shadow flex flex-col justify-between ${
              summary.divergenceCount > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-white border-slate-200/90'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-wider font-mono ${
                  summary.divergenceCount > 0 ? 'text-rose-700' : 'text-slate-500'
                }`}>
                  Divergence Risk
                </span>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                  summary.divergenceCount > 0 ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                </span>
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className={`text-3xl font-bold font-mono ${
                  summary.divergenceCount > 0 ? 'text-rose-600' : 'text-slate-900'
                }`}>
                  {summary.divergenceCount}
                </span>
                <span className="text-[11px] font-semibold text-rose-600 font-mono">
                  {summary.studentsAtRiskCount} Total at Risk
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="text-rose-700 font-medium">Curriculum Illusion</span>
                <button
                  onClick={() => setSelectedPerformance('high_risk')}
                  className="font-mono text-blue-600 hover:underline cursor-pointer"
                >
                  Filter View &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* =========================================================================
              3. CURRICULUM ILLUSION DIVERGENCE ALERT BANNER (IF ANY)
          ========================================================================= */}
          {divergenceAlerts.length > 0 && (
            <div className="rounded-2xl p-5 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border border-rose-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-2xl">troubleshoot</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Curriculum Illusion Detected ({divergenceAlerts.length} Students)
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-700 border border-rose-300">
                      HIGH RISK
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Learners completing lesson modules (&gt;60% progress) but severely failing practical coding & assignment benchmarks (&lt;55% score).
                    Direct hands-on intervention required to prevent false sense of mastery.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {divergenceAlerts.map((d) => (
                      <span
                        key={d.studentId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-xs font-semibold text-slate-800 shadow-xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        <span>{d.studentName}</span>
                        <span className="font-mono text-[10px] text-slate-500">
                          (Prog: {d.courseProgress}% / Practical: {d.practicalScore}%)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => setSelectedPerformance('high_risk')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">filter_alt</span>
                  <span>Isolate Divergent Learners</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              4. RECOMMENDED INSTRUCTOR INTERVENTIONS
          ========================================================================= */}
          {recommendedInterventions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-lg">auto_fix_high</span>
                    <span>Recommended Pedagogical Interventions</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data-driven pedagogical actions derived from student failure patterns and skill gap vectors.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold border border-blue-200">
                  {recommendedInterventions.length} Action Items
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {recommendedInterventions.map((int) => (
                  <div
                    key={int.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          int.priority === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : int.priority === 'HIGH'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {int.priority}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {int.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {int.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {int.description}
                      </p>
                      <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-mono">
                        <span className="font-bold text-slate-800">Action: </span>
                        {int.suggestedAction}
                      </div>
                    </div>

                    <button
                      onClick={() => handleInterventionAction(int)}
                      className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                      <span>{int.actionLabel}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              5. INTERACTIVE FILTERS BAR
          ========================================================================= */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Student Search */}
              <div className="relative w-full lg:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student name or email..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              {/* Filter Selects */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Course Filter */}
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">All Courses ({coursesList.length})</option>
                  {coursesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title.length > 30 ? c.title.substring(0, 30) + '...' : c.title}
                    </option>
                  ))}
                </select>

                {/* Skill Filter */}
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">All Skills ({skillsList.length})</option>
                  {skillsList.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name}
                    </option>
                  ))}
                </select>

                {/* Performance / Risk Filter */}
                <select
                  value={selectedPerformance}
                  onChange={(e) => setSelectedPerformance(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="high_risk">High Risk / Divergence</option>
                  <option value="needs_attention">Needs Attention</option>
                  <option value="moderate_risk">Moderate Risk</option>
                  <option value="on_track">On Track</option>
                  <option value="high_performer">High Performer</option>
                </select>

                {/* Date Filter */}
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">All Time</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>

                {(selectedCourse !== 'all' || selectedSkill !== 'all' || selectedPerformance !== 'all' || selectedDate !== 'all' || studentSearch) && (
                  <button
                    onClick={() => {
                      setSelectedCourse('all');
                      setSelectedSkill('all');
                      setSelectedPerformance('all');
                      setSelectedDate('all');
                      setStudentSearch('');
                    }}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                    title="Reset all filters"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* =========================================================================
              6. CORE LEARNING INTELLIGENCE TABLE
                 Student | Course Progress | Practical Score | Skill Score | Risk Status
          ========================================================================= */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Student Learning Intelligence Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {students.length} scholars evaluated on course completion, hands-on practical execution, and validated skill mastery.
                </p>
              </div>

              <span className="text-xs font-mono font-semibold text-slate-500">
                Sorted by Risk Priority
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course Progress</th>
                    <th className="py-3 px-4">Practical Score</th>
                    <th className="py-3 px-4">Skill Score</th>
                    <th className="py-3 px-4">Risk Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        <span className="material-symbols-outlined animate-spin text-2xl text-blue-600 mb-1">
                          progress_activity
                        </span>
                        <p className="text-xs font-mono">Aggregating cohort learning intelligence...</p>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        <span className="material-symbols-outlined text-3xl mb-1">sentiment_dissatisfied</span>
                        <p className="text-xs font-mono">No students match the current filter criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    students.map((st) => (
                      <tr
                        key={st.id}
                        className={`hover:bg-slate-50/90 transition-colors ${
                          st.riskStatus === 'High Risk' ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        {/* 1. Student Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {st.avatar ? (
                                <img
                                  src={st.avatar}
                                  alt={st.name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                  {st.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              {st.activeInterventions?.length > 0 && (
                                <span
                                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[7px] text-white font-bold"
                                  title="Active Adaptive Remediation Ladder"
                                >
                                  !
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => setSelectedStudent(st)}>
                                {st.name}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400">{st.email}</div>
                              {st.enrolledCourses?.length > 0 && (
                                <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                  {st.enrolledCourses[0].title}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Course Progress Column */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 w-36">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="font-bold text-slate-800">{st.courseProgress}%</span>
                              <span className="text-[10px] text-slate-400">Curriculum</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  st.courseProgress >= 70
                                    ? 'bg-blue-600'
                                    : st.courseProgress >= 40
                                    ? 'bg-indigo-500'
                                    : 'bg-slate-400'
                                }`}
                                style={{ width: `${st.courseProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Practical Score Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="space-y-1 w-28">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className={`font-bold ${
                                  st.practicalScore >= 80
                                    ? 'text-emerald-600'
                                    : st.practicalScore >= 60
                                    ? 'text-amber-600'
                                    : 'text-rose-600'
                                }`}>
                                  {st.practicalScore}%
                                </span>
                                <span className="text-[10px] text-slate-400">Labs &amp; Code</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    st.practicalScore >= 80
                                      ? 'bg-emerald-500'
                                      : st.practicalScore >= 60
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${st.practicalScore}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 4. Skill Score Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="space-y-1 w-28">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="font-bold text-slate-800">{st.skillScore}%</span>
                                <span className="text-[10px] text-slate-400">Overall</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="bg-purple-600 h-full rounded-full"
                                  style={{ width: `${st.skillScore}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 5. Risk Status Column (Data-Driven with Explanation) */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${st.riskBadge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                st.riskStatus === 'High Risk'
                                  ? 'bg-rose-500 animate-pulse'
                                  : st.riskStatus === 'Needs Attention'
                                  ? 'bg-amber-500'
                                  : st.riskStatus === 'Moderate Risk'
                                  ? 'bg-yellow-500'
                                  : st.riskStatus === 'High Performer'
                                  ? 'bg-emerald-500'
                                  : 'bg-cyan-500'
                              }`}></span>
                              <span>{st.riskStatus}</span>
                            </span>
                            <p className="text-[10px] text-slate-500 leading-tight max-w-[240px]">
                              {st.riskReason}
                            </p>
                          </div>
                        </td>

                        {/* 6. Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedStudent(st)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition cursor-pointer"
                              title="Inspect full learning telemetry"
                            >
                              Diagnostics
                            </button>
                            <button
                              onClick={() => {
                                toast.success(`Remediation challenge dispatched to ${st.name}.`);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                              title="Assign targeted practical practice"
                            >
                              <span className="material-symbols-outlined text-sm">send</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* =========================================================================
              7. LEARNING INTELLIGENCE VISUAL CHARTS ARENA
          ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Divergence Quadrant (Course Progress vs Practical Execution) */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-rose-500 text-base">scatter_plot</span>
                    <span>Curriculum Progress vs. Practical Execution Matrix</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Quadrant analysis: Identifies students suffering from Curriculum Illusion (Bottom Right: High progress, Low practical).
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                  {students.length} Evaluated Points
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Course Progress"
                      unit="%"
                      domain={[0, 100]}
                      label={{ value: 'Course Progress (%)', position: 'bottom', offset: 0, fontSize: 11 }}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Practical Score"
                      unit="%"
                      domain={[0, 100]}
                      label={{ value: 'Practical Score (%)', angle: -90, position: 'left', fontSize: 11 }}
                      tick={{ fontSize: 10 }}
                    />
                    <ZAxis range={[100, 100]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-1 shadow-lg border border-slate-700">
                              <p className="font-bold">{data.name}</p>
                              <p className="text-[11px] text-slate-300">Course Progress: {data.x}%</p>
                              <p className="text-[11px] text-slate-300">Practical Score: {data.y}%</p>
                              <p className={`text-[10px] font-mono font-bold ${
                                data.isDivergent ? 'text-rose-400' : 'text-emerald-400'
                              }`}>
                                {data.isDivergent ? 'Divergence Alert (Curriculum Illusion)' : data.status}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Students" data={scatterData}>
                      {scatterData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.isDivergent
                              ? '#f43f5e'
                              : entry.status === 'High Performer'
                              ? '#10b981'
                              : entry.status === 'Needs Attention'
                              ? '#f59e0b'
                              : '#3b82f6'
                          }
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Curriculum Illusion (High Progress, Low Practical)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>High Performer (≥80% Practical)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>On Track</span>
                </span>
              </div>
            </div>

            {/* Chart 2: Practical Mastery Distribution Donut */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-500 text-base">pie_chart</span>
                  <span>Practical Performance Tiers</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Breakdown of scholars by practical execution mastery level.
                </p>
              </div>

              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={practicalPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {practicalPieData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                {practicalPieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </span>
                    <span className="font-mono font-bold text-slate-800">{item.value} Scholars</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* =========================================================================
              8. MOST DIFFICULT SKILLS & MOST FAILED ASSESSMENTS RANKINGS
          ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Difficult Skills */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-base">fitness_center</span>
                    <span>Most Difficult Skills</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ranked by highest percentage of scholars in Novice / Developing tiers.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-400">Lowest Practical Avg</span>
              </div>

              <div className="space-y-3">
                {mostDifficultSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 font-mono">No skill weaknesses recorded yet.</p>
                ) : (
                  mostDifficultSkills.map((sk, idx) => (
                    <div key={sk.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-xs text-slate-900">{sk.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-200/70 text-slate-600">
                            {sk.category}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-rose-600">
                          {sk.strugglingPercentage}% Struggling
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${sk.strugglingPercentage}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Class Practical Avg: {sk.avgPractical}%</span>
                        <span>Novice: {sk.novice} | Developing: {sk.developing}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Most Failed Assessments */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-rose-500 text-base">report_problem</span>
                    <span>Most Failed Assessments</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Quizzes and practical assignments causing highest student attrition.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-400">Highest Fail Rate</span>
              </div>

              <div className="space-y-3">
                {mostFailedAssessments.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 font-mono">No failed assessments recorded.</p>
                ) : (
                  mostFailedAssessments.map((fa, idx) => (
                    <div key={fa.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-rose-100 text-rose-700 font-mono text-xs font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-xs text-slate-900 truncate max-w-[220px]">
                            {fa.title}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-rose-600">
                          {fa.failRate}% Fail Rate
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${fa.failRate}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Failed: {fa.failedAttempts} / {fa.totalAttempts} total</span>
                        <span>Avg Score: {fa.avgScore}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* =========================================================================
            CURRICULUM CATALOG VIEW (PRESERVES EXISTING COURSE MANAGEMENT)
        ========================================================================= */
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Curriculum Catalog & Syllabi</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect course syllabi, module health, and direct student enrollments.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  search
                </span>
                <input
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  placeholder="Filter courses..."
                  type="text"
                />
              </div>

              <select
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">All Domains</option>
                <option value="Cloud">Cloud & DevOps</option>
                <option value="Web">Web Development</option>
                <option value="Data">Data Engineering</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Course Title & Domain</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {coursesList
                  .filter((c) => {
                    const matchCat = courseCategory === 'all' || (c.category && c.category.includes(courseCategory));
                    const matchSearch = !courseSearch || c.title.toLowerCase().includes(courseSearch.toLowerCase());
                    return matchCat && matchSearch;
                  })
                  .map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{course.title}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{course.category}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/instructor/courses/${course.id}/editor`)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold transition cursor-pointer"
                        >
                          Edit Curriculum
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          9. STUDENT DIAGNOSTIC MODAL / DRAWER
      ========================================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                {selectedStudent.avatar ? (
                  <img
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    {selectedStudent.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-xs font-mono text-slate-400">{selectedStudent.email}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedStudent.headline}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Risk Assessment Summary */}
            <div className={`p-4 rounded-xl border ${selectedStudent.riskBadge}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Pedagogical Diagnosis: {selectedStudent.riskStatus}
                </span>
                <span className="text-xs font-mono">Risk Level: {selectedStudent.riskLevel}/4</span>
              </div>
              <p className="text-xs mt-1 leading-relaxed">{selectedStudent.riskReason}</p>
            </div>

            {/* Telemetry Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-mono">Course Progress</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                  {selectedStudent.courseProgress}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-mono">Practical Score</div>
                <div className={`text-xl font-bold font-mono mt-1 ${
                  selectedStudent.practicalScore >= 70 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {selectedStudent.practicalScore}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-mono">Skill Score</div>
                <div className="text-xl font-bold font-mono text-purple-700 mt-1">
                  {selectedStudent.skillScore}%
                </div>
              </div>
            </div>

            {/* Enrolled Courses */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                Enrolled Curricula
              </h4>
              <div className="space-y-1.5">
                {selectedStudent.enrolledCourses?.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-medium text-slate-800">{c.title}</span>
                    <span className="font-mono font-bold text-blue-600">{c.progress}% completed</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Remediation Ladders */}
            {selectedStudent.activeInterventions?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-800 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-amber-600">published_with_changes</span>
                  <span>Active Adaptive Remediation</span>
                </h4>
                {selectedStudent.activeInterventions.map((ai) => (
                  <div key={ai.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Target Skill: {ai.skillName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-200 text-amber-900">
                        Stage {ai.stage} of {ai.totalStages}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">Severity: {ai.severity} // Practice ladder actively progressing.</p>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast.success(`Targeted remediation challenge sent to ${selectedStudent.name}.`);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Prescribe Targeted Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}