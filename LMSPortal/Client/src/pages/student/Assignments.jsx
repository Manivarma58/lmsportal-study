import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import { EmptyState, Skeleton } from '../../components/ui';
import { toast } from 'sonner';

export default function Assignments() {
  const { user } = useSelector((state) => state.auth);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, submitted, under_review, needs_revision, passed, failed
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');

  // Interactive submission modal state
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [contentNotes, setContentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rubric & Details Modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [inspectedAssignment, setInspectedAssignment] = useState(null);

  // Fetch real practical assignments
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/assignments');
      if (res.data?.success && Array.isArray(res.data.assignments)) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      console.error('Failed to load practical assignments:', err);
      toast.error('Unable to load assignments catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Filter & search logic
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((a) => {
        const status = a.userStatus || 'Not Started';
        if (activeTab === 'pending') return status === 'Not Started';
        if (activeTab === 'submitted') return status === 'Submitted';
        if (activeTab === 'under_review') return status === 'Under Review';
        if (activeTab === 'needs_revision') return status === 'Needs Revision';
        if (activeTab === 'passed') return status === 'Passed';
        if (activeTab === 'failed') return status === 'Failed';
        return true;
      })
      .filter((a) => {
        if (selectedCourseFilter === 'all') return true;
        const cTitle = a.course?.title || '';
        return cTitle === selectedCourseFilter;
      })
      .filter((a) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const courseTitle = a.course?.title?.toLowerCase() || '';
        return (
          a.title.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          courseTitle.includes(q) ||
          a.difficulty?.toLowerCase().includes(q)
        );
      });
  }, [assignments, activeTab, selectedCourseFilter, searchQuery]);

  // Distinct enrolled/available courses from assignments
  const distinctCourses = useMemo(() => {
    const map = new Map();
    assignments.forEach((a) => {
      if (a.course?.title) {
        map.set(a.course.title, a.course);
      }
    });
    return Array.from(map.values());
  }, [assignments]);

  // KPI Calculations
  const totalCount = assignments.length;
  const pendingCount = assignments.filter((a) => !a.userStatus || a.userStatus === 'Not Started').length;
  const inQueueCount = assignments.filter((a) => ['Submitted', 'Under Review'].includes(a.userStatus)).length;
  const revisionCount = assignments.filter((a) => a.userStatus === 'Needs Revision').length;
  const passedCount = assignments.filter((a) => a.userStatus === 'Passed').length;

  const gradedItems = assignments.filter(
    (a) => a.userSubmission && a.userSubmission.score !== null && a.userSubmission.score !== undefined
  );
  const avgGrade =
    gradedItems.length > 0
      ? Math.round(gradedItems.reduce((sum, a) => sum + a.userSubmission.score, 0) / gradedItems.length)
      : null;

  // Open submission modal
  const handleOpenSubmit = (asg) => {
    setActiveAssignment(asg);
    // Pre-populate if student is revising existing submission
    if (asg.userSubmission) {
      setRepositoryUrl(asg.userSubmission.repositoryUrl || '');
      setDeploymentUrl(asg.userSubmission.deploymentUrl || '');
      setContentNotes(asg.userSubmission.content || '');
    } else {
      setRepositoryUrl('');
      setDeploymentUrl('');
      setContentNotes('');
    }
    setSubmissionModalOpen(true);
  };

  // Submit Practical Work
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!repositoryUrl.trim() && !deploymentUrl.trim() && !contentNotes.trim()) {
      toast.error('Please provide at least a repository URL, deployment URL, or architecture notes.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        submissionType: 'combined',
        repositoryUrl: repositoryUrl.trim(),
        deploymentUrl: deploymentUrl.trim(),
        content: contentNotes.trim(),
      };

      const res = await API.post(`/assignments/${activeAssignment._id}/submit`, payload);
      if (res.data?.success) {
        toast.success(`Assignment "${activeAssignment.title}" submitted successfully for instructor evaluation!`);
        setSubmissionModalOpen(false);
        // Refresh catalog state
        await fetchAssignments();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to submit assignment. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for Status Badge
  const renderStatusBadge = (status, score) => {
    switch (status) {
      case 'Passed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            PASSED {score !== null && score !== undefined ? `(${score}%)` : ''}
          </span>
        );
      case 'Needs Revision':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            NEEDS REVISION
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            UNDER REVIEW
          </span>
        );
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            SUBMITTED
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            NOT PASSED {score !== null && score !== undefined ? `(${score}%)` : ''}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            PENDING SUBMISSION
          </span>
        );
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Medium':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Hard':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Expert':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased pb-16 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-2 pb-6 border-b border-slate-200/90">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Link to="/student/dashboard" className="hover:text-blue-600 transition-colors">
            Student Portal
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Practical Assignments</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Practical Engineering Assignments
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Apply acquired engineering competencies to real-world tasks, submit production repositories, and earn verified skill points.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200/70 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {pendingCount} PENDING ACTION
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 my-6">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Tasks</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          <span className="text-[11px] text-slate-400 font-mono">Curriculum practicals</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-600 uppercase">Pending Action</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{pendingCount}</p>
          <span className="text-[11px] text-slate-400 font-mono">Ready to implement</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-blue-600 uppercase">In Evaluation</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{inQueueCount}</p>
          <span className="text-[11px] text-slate-400 font-mono">Faculty review queue</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 uppercase">Needs Revision</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{revisionCount}</p>
          <span className="text-[11px] text-slate-400 font-mono">Action required</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase">Passed</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {passedCount} {avgGrade !== null ? <span className="text-xs font-normal text-slate-500">({avgGrade}% avg)</span> : ''}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">Mastered &amp; Credited</span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          {[
            { id: 'all', label: 'All Tasks', count: totalCount },
            { id: 'pending', label: 'Pending', count: pendingCount },
            { id: 'submitted', label: 'Submitted', count: assignments.filter((a) => a.userStatus === 'Submitted').length },
            { id: 'under_review', label: 'Under Review', count: assignments.filter((a) => a.userStatus === 'Under Review').length },
            { id: 'needs_revision', label: 'Needs Revision', count: revisionCount },
            { id: 'passed', label: 'Passed', count: passedCount },
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
                  activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'bg-slate-200 text-slate-600'
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

          {distinctCourses.length > 0 && (
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Courses</option>
              {distinctCourses.map((c, idx) => (
                <option key={idx} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          <Skeleton height="120px" rounded="16px" />
          <Skeleton height="120px" rounded="16px" />
          <Skeleton height="120px" rounded="16px" />
        </div>
      )}

      {/* Assignment List */}
      {!loading && (
        <div className="flex flex-col gap-4">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((asg) => {
              const status = asg.userStatus || 'Not Started';
              const isNotStarted = status === 'Not Started';
              const isNeedsRevision = status === 'Needs Revision';
              const isPassed = status === 'Passed';
              const isUnderReview = status === 'Under Review' || status === 'Submitted';
              const submission = asg.userSubmission;

              return (
                <div
                  key={asg._id}
                  className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Left details */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80 shadow-xs">
                        <span className="material-symbols-outlined text-[24px]">
                          {isPassed ? 'task_alt' : isNeedsRevision ? 'edit_note' : isUnderReview ? 'hourglass_top' : 'terminal'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${getDifficultyColor(asg.difficulty)}`}>
                            {asg.difficulty}
                          </span>
                          <span className="text-xs text-slate-500 font-medium truncate max-w-xs">
                            {asg.course?.title || 'Advanced Engineering'}
                          </span>
                          {renderStatusBadge(status, submission?.score)}
                        </div>

                        <h3 className="font-bold text-base text-slate-900 tracking-tight">
                          {asg.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl line-clamp-2">
                          {asg.description}
                        </p>

                        {/* Skills and Metadata */}
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          {asg.skills?.map((sk) => (
                            <span key={sk._id || sk} className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              #{typeof sk === 'object' ? sk.name : sk}
                            </span>
                          ))}
                          <span className="text-xs text-slate-400 font-mono">• Est: {asg.estimatedTime}</span>
                          <span className="text-xs text-slate-400 font-mono">• Due: {new Date(asg.deadline).toLocaleDateString()}</span>
                          {asg.instructor?.name && (
                            <span className="text-xs text-slate-400 font-mono">• Faculty: {asg.instructor.name}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => {
                          setInspectedAssignment(asg);
                          setDetailsModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        <span>Rubric &amp; Guide</span>
                      </button>

                      {(isNotStarted || isNeedsRevision) && (
                        <button
                          onClick={() => handleOpenSubmit(asg)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">upload_file</span>
                          <span>{isNeedsRevision ? 'Submit Revision' : 'Submit Practical Work'}</span>
                        </button>
                      )}

                      {isUnderReview && (
                        <button
                          onClick={() => handleOpenSubmit(asg)}
                          className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          <span>Update Deliverable</span>
                        </button>
                      )}

                      {isPassed && (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-right">
                          <span className="text-[10px] text-emerald-600 uppercase font-mono block">Final Grade</span>
                          <span className="text-sm font-bold text-emerald-700">{submission?.score ?? 100}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instructor Feedback Banner if evaluated or needs revision */}
                  {submission?.feedback && (
                    <div className={`p-3.5 rounded-xl text-xs flex flex-col gap-1 border ${
                      isNeedsRevision
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : isPassed
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      <div className="flex items-center gap-1.5 font-semibold text-[11px] font-mono uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[16px]">
                          {isNeedsRevision ? 'warning' : 'rate_review'}
                        </span>
                        <span>Faculty Evaluation Feedback</span>
                      </div>
                      <p className="leading-relaxed pl-5 text-xs font-sans">
                        "{submission.feedback}"
                      </p>
                    </div>
                  )}

                  {/* Submission Links Preview */}
                  {submission && (submission.repositoryUrl || submission.deploymentUrl) && (
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs font-mono">
                      <span className="text-slate-400">Deliverables:</span>
                      {submission.repositoryUrl && (
                        <a
                          href={submission.repositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <span className="material-symbols-outlined text-[14px]">code</span>
                          <span>Repository</span>
                        </a>
                      )}
                      {submission.deploymentUrl && (
                        <a
                          href={submission.deploymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          <span>Live Deployment</span>
                        </a>
                      )}
                      <span className="text-slate-400 ml-auto">
                        Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <EmptyState
              title="No Practical Assignments Found"
              description="No assignments matched your current filters. Try selecting a different course or status filter."
              actionLabel={searchQuery || activeTab !== 'all' || selectedCourseFilter !== 'all' ? 'Clear Filters' : null}
              onAction={() => {
                setSearchQuery('');
                setActiveTab('all');
                setSelectedCourseFilter('all');
              }}
            />
          )}
        </div>
      )}

      {/* ================= SUBMISSION MODAL ================= */}
      {submissionModalOpen && activeAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono text-blue-600 uppercase font-semibold">
                  {activeAssignment.difficulty} • {activeAssignment.course?.title || 'NOVA Course'}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{activeAssignment.title}</h3>
              </div>
              <button
                onClick={() => setSubmissionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub / Git Repository URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    link
                  </span>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/username/project-repo"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ensure the repository is public or accessible to faculty evaluators.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Live Deployment / Preview URL (Optional)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    rocket_launch
                  </span>
                  <input
                    type="url"
                    placeholder="https://my-service.onrender.com or cloud IP"
                    value={deploymentUrl}
                    onChange={(e) => setDeploymentUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Architecture Notes, Design Patterns &amp; Verification Runbook
                </label>
                <textarea
                  rows={5}
                  value={contentNotes}
                  onChange={(e) => setContentNotes(e.target.value)}
                  placeholder="Explain architectural decisions, technology stack, database schemas, and instructions on running automated tests..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* Evaluation Criteria Checklist Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                <span className="font-semibold text-slate-700 block mb-1.5 font-mono uppercase text-[11px]">
                  Configured Evaluation Rubric:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                  {activeAssignment.evaluationCriteria?.map((crit, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                      <span className="font-medium text-[11px]">{crit.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">Max: {crit.maxPoints} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/70 text-xs text-blue-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>
                  Submitting sets your assignment status to <strong>Submitted</strong> for faculty evaluation. Skill scores update upon evaluation passing.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSubmissionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DETAILS & RUBRIC MODAL ================= */}
      {detailsModalOpen && inspectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono text-blue-600 uppercase font-semibold">
                  {inspectedAssignment.course?.title}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{inspectedAssignment.title}</h3>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Overview & Instructions */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Assignment Overview
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {inspectedAssignment.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Detailed Instructions &amp; Requirements
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {inspectedAssignment.instructions}
                </div>
              </div>

              {/* Rubric Table */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Faculty Evaluation Criteria Rubric
                </h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                      <tr>
                        <th className="p-3">Criterion</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Max Points</th>
                        <th className="p-3 text-right">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inspectedAssignment.evaluationCriteria?.map((crit, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-900">{crit.name}</td>
                          <td className="p-3 text-slate-600">{crit.description}</td>
                          <td className="p-3 text-right font-mono font-semibold text-blue-600">{crit.maxPoints} pts</td>
                          <td className="p-3 text-right font-mono text-slate-500">{crit.weight || 1.0}x</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* If student has already been graded, show their criteria breakdown */}
              {inspectedAssignment.userSubmission?.criteriaGrades?.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 mb-2">
                    Your Graded Evaluation Breakdown (Score: {inspectedAssignment.userSubmission.score}%)
                  </h4>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-emerald-50 text-emerald-900 font-mono text-[11px]">
                        <tr>
                          <th className="p-3">Criterion</th>
                          <th className="p-3 text-right">Earned / Max</th>
                          <th className="p-3">Evaluator Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100">
                        {inspectedAssignment.userSubmission.criteriaGrades.map((cg, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-semibold text-slate-900">{cg.criterionName}</td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-700">
                              {cg.pointsEarned} / {cg.maxPoints}
                            </td>
                            <td className="p-3 text-slate-600">{cg.comment || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              {(!inspectedAssignment.userStatus || inspectedAssignment.userStatus === 'Not Started' || inspectedAssignment.userStatus === 'Needs Revision') && (
                <button
                  onClick={() => {
                    setDetailsModalOpen(false);
                    handleOpenSubmit(inspectedAssignment);
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Submit Practical Work
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}