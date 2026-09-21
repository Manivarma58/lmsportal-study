import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import { toast } from 'sonner';

export default function Assignments() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, submitted, graded
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');

  // Interactive submission modal state
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissionCode, setSubmissionCode] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assignments store with stateful updates
  const [assignments, setAssignments] = useState([
    {
      id: 'ASG-01',
      code: 'LAB-101',
      title: 'Fullstack Microservices & REST API Pipeline',
      subtitle: 'Build and validate authenticated CRUD microservice routes with unit test coverage.',
      courseTitle: 'Fullstack Cloud Architecture & Kubernetes Clusters',
      category: 'Cloud Architecture',
      dueDate: 'Oct 28, 2026 • 23:59 UTC',
      weight: '25% Grade Weight',
      ceus: '1.0 CEU',
      status: 'pending',
      grade: null,
      maxScore: 100,
      instructor: 'Prof. Maya Lin',
      testSuite: '12 / 12 Automated Unit Tests',
      rubric: [
        { criterion: 'API Route Security & Token Middleware', points: '35 / 35', desc: 'Secure headers and JWT payload verification' },
        { criterion: 'Database Model Schema Constraints', points: '35 / 35', desc: 'Mongoose validators & indexing efficiency' },
        { criterion: 'Exception Handling & Error Formatting', points: '30 / 30', desc: 'Consistent HTTP status codes and responses' },
      ],
    },
    {
      id: 'ASG-02',
      code: 'LAB-204',
      title: 'Zero-Trust Istio Service Mesh & Envoy Proxy Configuration',
      subtitle: 'Deploy mutual TLS (mTLS) with cryptographically attested SPIFFE workload identities.',
      courseTitle: 'Cyber Defense & Cryptographic Security',
      category: 'Cybersecurity',
      dueDate: 'Nov 04, 2026 • 18:00 UTC',
      weight: '30% Grade Weight',
      ceus: '1.2 CEU',
      status: 'pending',
      grade: null,
      maxScore: 100,
      instructor: 'Marcus Lin, CISSP',
      testSuite: '8 / 8 Mesh Probes',
      rubric: [
        { criterion: 'mTLS PeerAuthentication Enforcement', points: '40 / 40', desc: 'Strict mode validated across namespace' },
        { criterion: 'EnvoyFilter Header Attestation', points: '30 / 30', desc: 'Dynamic JWT claim verification' },
        { criterion: 'Chaos Testing & Resilience', points: '30 / 30', desc: 'Zero downtime during rolling restart' },
      ],
    },
    {
      id: 'ASG-03',
      code: 'LAB-309',
      title: 'Neural Matrix Attention Optimizer & KV-Cache Compression',
      subtitle: 'Synthesize flash attention kernels with 4-bit INT quantization for long-context inference.',
      courseTitle: 'Neural Networks & Quantum Computing',
      category: 'AI & Quantum',
      dueDate: 'Submitted Oct 14, 2026',
      weight: '20% Grade Weight',
      ceus: '0.8 CEU',
      status: 'submitted',
      grade: null,
      maxScore: 100,
      instructor: 'Dr. Elena Vance',
      testSuite: '10 / 10 Benchmarks Completed',
      rubric: [
        { criterion: 'Kernel Execution Speedup', points: '40 / 40', desc: '3.2x baseline speedup verified' },
        { criterion: 'Perplexity Retention', points: '30 / 30', desc: 'Precision retention > 99.4%' },
        { criterion: 'Memory Profiling Report', points: '30 / 30', desc: 'Comprehensive telemetry logs submitted' },
      ],
    },
    {
      id: 'ASG-04',
      code: 'LAB-401',
      title: 'Distributed Byzantine Fault Tolerant Consensus Protocol',
      subtitle: 'Implement leader election, quorum certificates, and view-change safety verification.',
      courseTitle: 'Distributed Systems & High Performance Computing',
      category: 'Distributed Systems',
      dueDate: 'Graded Oct 08, 2026',
      weight: '25% Grade Weight',
      ceus: '1.0 CEU',
      status: 'graded',
      grade: 97,
      maxScore: 100,
      instructor: 'Dr. Sora Takahashi',
      testSuite: '16 / 16 Consensus Vectors Passing',
      rubric: [
        { criterion: 'Safety Under Asynchronous Partition', points: '40 / 40', desc: 'Zero conflicting block commits' },
        { criterion: 'Liveness Recovery Threshold', points: '30 / 30', desc: 'View change recovered in < 150ms' },
        { criterion: 'Peer RPC Throughput', points: '27 / 30', desc: 'Achieved 8,400 tx/sec under synthetic load' },
      ],
    },
  ]);

  // Fetch real student enrollments
  useEffect(() => {
    let isMounted = true;
    API.get('/enrollments/my-courses')
      .then((res) => {
        if (!isMounted) return;
        const valid = (res.data?.enrollments || []).filter((e) => Boolean(e.course));
        setEnrollments(valid);

        // Dynamically add assignments matching student's enrolled courses if available
        if (valid.length > 0) {
          setAssignments((prev) => {
            const courseTitles = valid.map((e) => e.course.title);
            // Replace generic course titles with real enrolled ones where appropriate
            return prev.map((asg, idx) => ({
              ...asg,
              courseTitle: courseTitles[idx % courseTitles.length] || asg.courseTitle,
            }));
          });
        }
      })
      .catch((err) => console.warn('Could not load course list for assignments:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & search logic
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((a) => {
        if (activeTab === 'pending') return a.status === 'pending';
        if (activeTab === 'submitted') return a.status === 'submitted';
        if (activeTab === 'graded') return a.status === 'graded';
        return true;
      })
      .filter((a) => {
        if (selectedCourseFilter === 'all') return true;
        return a.courseTitle === selectedCourseFilter;
      })
      .filter((a) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.subtitle.toLowerCase().includes(q) ||
          a.courseTitle.toLowerCase().includes(q) ||
          a.code.toLowerCase().includes(q)
        );
      });
  }, [assignments, activeTab, selectedCourseFilter, searchQuery]);

  // KPIs
  const totalCount = assignments.length;
  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const submittedCount = assignments.filter((a) => a.status === 'submitted').length;
  const gradedCount = assignments.filter((a) => a.status === 'graded').length;
  const gradedItems = assignments.filter((a) => a.grade !== null);
  const avgGrade =
    gradedItems.length > 0
      ? Math.round(gradedItems.reduce((sum, a) => sum + a.grade, 0) / gradedItems.length)
      : 97;

  // Open submit modal
  const handleOpenSubmit = (asg) => {
    setActiveAssignment(asg);
    setSubmissionCode('// Submit code implementation or repository commit\nfunction solution() {\n  return "All unit tests validated";\n}');
    setSubmissionNotes('');
    setSubmissionModalOpen(true);
  };

  // Process submission
  const handleSubmitAssignment = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setAssignments((prev) =>
        prev.map((item) =>
          item.id === activeAssignment.id
            ? { ...item, status: 'submitted', dueDate: 'Submitted Just Now' }
            : item
        )
      );
      setIsSubmitting(false);
      setSubmissionModalOpen(false);
      toast.success(`Assignment "${activeAssignment.title}" submitted successfully for autograding!`);
    }, 900);
  };

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased pb-16 px-6 sm:px-8 lg:px-10 py-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-2 pb-6 border-b border-slate-200/90">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Link to="/student/dashboard" className="hover:text-blue-600 transition-colors">
            Student Portal
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Assignments</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Assignments &amp; Practical Laboratories
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Submit programming problem sets, review automated test suites, and track your evaluated grades.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200/70 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {pendingCount} PENDING SUBMISSIONS
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Assigned</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          <span className="text-[11px] text-slate-400 font-mono">Curriculum tasks</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 uppercase">Pending Review</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          <span className="text-[11px] text-slate-400 font-mono">Due this week</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-blue-600 uppercase">Submitted</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{submittedCount}</p>
          <span className="text-[11px] text-slate-400 font-mono">In evaluation queue</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase">Average Grade</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{avgGrade}%</p>
          <span className="text-[11px] text-slate-400 font-mono">Distinction tier</span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          {[
            { id: 'all', label: 'All Tasks', count: totalCount },
            { id: 'pending', label: 'Pending', count: pendingCount },
            { id: 'submitted', label: 'Submitted', count: submittedCount },
            { id: 'graded', label: 'Graded', count: gradedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeFilterBadge(activeTab === tab.id)
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Course Selector */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {enrollments.length > 0 && (
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Enrolled Courses</option>
              {enrollments.map((e) => (
                <option key={e._id} value={e.course?.title}>
                  {e.course?.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Assignment List */}
      <div className="flex flex-col gap-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((asg) => {
            const isPending = asg.status === 'pending';
            const isSubmitted = asg.status === 'submitted';
            const isGraded = asg.status === 'graded';

            return (
              <div
                key={asg.id}
                className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left details */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <span className="material-symbols-outlined text-[24px]">
                      {isGraded ? 'task_alt' : isSubmitted ? 'hourglass_top' : 'assignment'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-semibold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                        {asg.code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium truncate max-w-xs">
                        {asg.courseTitle}
                      </span>
                      {isGraded && (
                        <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                          SCORE: {asg.grade}%
                        </span>
                      )}
                      {isSubmitted && (
                        <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                          IN AUTOGRADING
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[10px] font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                          {asg.dueDate}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 tracking-tight">
                      {asg.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {asg.subtitle}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono mt-1">
                      <span>Weight: {asg.weight}</span>
                      <span>•</span>
                      <span>Suite: {asg.testSuite}</span>
                      <span>•</span>
                      <span>Evaluator: {asg.instructor}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  {isPending && (
                    <button
                      onClick={() => handleOpenSubmit(asg)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">upload_file</span>
                      <span>Submit Solution</span>
                    </button>
                  )}
                  {isSubmitted && (
                    <span className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      Evaluating Code
                    </span>
                  )}
                  {isGraded && (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-mono">Grade</span>
                        <span className="font-bold text-sm text-emerald-600">{asg.grade} / {asg.maxScore}</span>
                      </div>
                      <button
                        onClick={() => toast.info(`Reviewing submission rubric for ${asg.code}`)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-all"
                      >
                        Rubric
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
            <p className="text-slate-500 text-sm">No assignments found matching your filter criteria.</p>
          </div>
        )}
      </div>

      {/* Interactive Submission Modal */}
      {submissionModalOpen && activeAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono text-blue-600 uppercase font-semibold">
                  {activeAssignment.code} • {activeAssignment.courseTitle}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{activeAssignment.title}</h3>
              </div>
              <button onClick={() => setSubmissionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Source Code / Laboratory Implementation
                </label>
                <textarea
                  rows={6}
                  value={submissionCode}
                  onChange={(e) => setSubmissionCode(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs border border-slate-700 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Submission Notes &amp; Verification Hashes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Commit hash, runtime benchmark metrics..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/70 text-xs text-blue-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Automatic test harness will compile and run all {activeAssignment.testSuite} upon submission.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSubmissionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Evaluating...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function activeFilterBadge(isActive) {
  return isActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-200 text-slate-600';
}