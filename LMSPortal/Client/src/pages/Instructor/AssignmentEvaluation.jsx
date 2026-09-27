import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import { EmptyState, Skeleton } from '../../components/ui';
import { toast } from 'sonner';

export default function AssignmentEvaluation() {
  const { user } = useSelector((state) => state.auth);

  // Active view tab: 'submissions' or 'manage'
  const [activeView, setActiveView] = useState('submissions');
  const [evaluationType, setEvaluationType] = useState('assignments'); // 'assignments' | 'projects'

  // Submissions State
  const [submissions, setSubmissions] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    Submitted: 0,
    'Under Review': 0,
    'Needs Revision': 0,
    Passed: 0,
    Failed: 0,
  });
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Assignments State for Manage tab
  const [assignments, setAssignments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [courses, setCourses] = useState([]);
  const [skills, setSkills] = useState([]);

  // Evaluation Drawer/Modal State
  const [evaluatingSubmission, setEvaluatingSubmission] = useState(null);
  const [criteriaGrades, setCriteriaGrades] = useState([]);
  const [evalStatus, setEvalStatus] = useState('Passed');
  const [evalFeedback, setEvalFeedback] = useState('');
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

  // Create / Edit Assignment Modal State
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('Medium');
  const [formEstimatedTime, setFormEstimatedTime] = useState('4 hours');
  const [formCourseId, setFormCourseId] = useState('');
  const [formSkills, setFormSkills] = useState([]);
  const [formDeadline, setFormDeadline] = useState('');
  const [formCriteria, setFormCriteria] = useState([
    { name: 'Functionality', description: 'Core requirements and edge case handling', maxPoints: 30, weight: 1.0 },
    { name: 'Code Quality', description: 'Clean architecture, readability, and design patterns', maxPoints: 20, weight: 1.0 },
    { name: 'API Design', description: 'RESTful conventions, status codes, and input validation', maxPoints: 20, weight: 1.0 },
    { name: 'Database', description: 'Schema normalization, indices, and query efficiency', maxPoints: 15, weight: 1.0 },
    { name: 'Testing', description: 'Automated test suite coverage and mock strategies', maxPoints: 15, weight: 1.0 },
    { name: 'Documentation', description: 'Architectural specifications and runbook guide', maxPoints: 10, weight: 1.0 },
  ]);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  // Fetch Submissions
  const fetchSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const endpoint =
        evaluationType === 'projects'
          ? '/projects/instructor/submissions'
          : '/assignments/instructor/submissions';
      const res = await API.get(endpoint);
      if (res.data?.success) {
        setSubmissions(res.data.submissions || []);
        if (res.data.counts) {
          setStatusCounts(res.data.counts);
        }
      }
    } catch (err) {
      console.error('Failed to load instructor submissions:', err);
      toast.error('Unable to fetch submissions queue.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Fetch Assignments & Projects Metadata
  const fetchAssignmentsAndMeta = async () => {
    try {
      setLoadingAssignments(true);
      const [asgRes, prjRes, crsRes, sklRes] = await Promise.all([
        API.get('/assignments'),
        API.get('/projects'),
        API.get('/courses/instructor/my-courses').catch(() => API.get('/courses')),
        API.get('/skills').catch(() => ({ data: { skills: [] } })),
      ]);

      if (asgRes.data?.success) {
        setAssignments(asgRes.data.assignments || []);
      }
      if (prjRes.data?.success) {
        setProjects(prjRes.data.projects || []);
      }
      if (crsRes.data?.courses || crsRes.data?.data) {
        setCourses(crsRes.data.courses || crsRes.data.data || []);
      }
      if (sklRes.data?.skills || sklRes.data?.data) {
        setSkills(sklRes.data.skills || sklRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch assignments metadata:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchAssignmentsAndMeta();
  }, [evaluationType]);

  // Filter Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      if (selectedStatusFilter !== 'all' && sub.status !== selectedStatusFilter) {
        return false;
      }
      if (selectedAssignmentFilter !== 'all' && sub.assignment?._id !== selectedAssignmentFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const studentName = sub.user?.name?.toLowerCase() || '';
        const studentEmail = sub.user?.email?.toLowerCase() || '';
        const assignmentTitle = sub.assignment?.title?.toLowerCase() || '';
        return studentName.includes(q) || studentEmail.includes(q) || assignmentTitle.includes(q);
      }
      return true;
    });
  }, [submissions, selectedStatusFilter, selectedAssignmentFilter, searchQuery]);

  // Open Evaluation Drawer
  const handleOpenEvaluation = (sub) => {
    setEvaluatingSubmission(sub);
    setEvalStatus(sub.status === 'Submitted' ? 'Passed' : sub.status);
    setEvalFeedback(sub.feedback || '');

    // Setup criteria grading from assignment's evaluationCriteria
    const rubric = sub.assignment?.evaluationCriteria || [
      { name: 'Functionality', maxPoints: 30, weight: 1.0 },
      { name: 'Code Quality', maxPoints: 20, weight: 1.0 },
      { name: 'API Design', maxPoints: 20, weight: 1.0 },
      { name: 'Database', maxPoints: 15, weight: 1.0 },
      { name: 'Testing', maxPoints: 15, weight: 1.0 },
    ];

    // If submission already has criteriaGrades, map them; otherwise prefill with maxPoints
    const existingGradesMap = new Map();
    (sub.criteriaGrades || []).forEach((g) => {
      existingGradesMap.set(g.criterionName?.toLowerCase(), g);
    });

    const initialCriteria = rubric.map((r) => {
      const existing = existingGradesMap.get(r.name.toLowerCase());
      return {
        criterionName: r.name,
        description: r.description || '',
        maxPoints: r.maxPoints,
        weight: r.weight || 1.0,
        pointsEarned: existing ? existing.pointsEarned : Math.round(r.maxPoints * 0.9), // Default to 90%
        comment: existing ? existing.comment : '',
      };
    });

    setCriteriaGrades(initialCriteria);
  };

  // Calculated Weighted Score
  const calculatedEvaluationScore = useMemo(() => {
    if (!criteriaGrades || criteriaGrades.length === 0) return 0;
    let earned = 0;
    let max = 0;
    criteriaGrades.forEach((c) => {
      const wt = c.weight || 1.0;
      earned += (Number(c.pointsEarned) || 0) * wt;
      max += (Number(c.maxPoints) || 1) * wt;
    });
    return max > 0 ? Math.min(100, Math.max(0, Math.round((earned / max) * 100))) : 0;
  }, [criteriaGrades]);

  // Submit Evaluation
  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!evaluatingSubmission) return;

    setIsSubmittingEval(true);
    try {
      const payload = {
        status: evalStatus,
        feedback: evalFeedback.trim(),
        criteriaGrades: criteriaGrades.map((cg) => ({
          criterionName: cg.criterionName,
          pointsEarned: Number(cg.pointsEarned) || 0,
          maxPoints: Number(cg.maxPoints) || 1,
          comment: cg.comment?.trim() || '',
        })),
        score: calculatedEvaluationScore,
      };

      const evalEndpoint =
        evaluationType === 'projects'
          ? `/projects/submissions/${evaluatingSubmission._id}/evaluate`
          : `/assignments/submissions/${evaluatingSubmission._id}/evaluate`;
      const res = await API.post(evalEndpoint, payload);

      if (res.data?.success) {
        toast.success(
          `Evaluated ${evaluatingSubmission.user?.name}'s submission: ${evalStatus} (${calculatedEvaluationScore}%)`
        );
        setEvaluatingSubmission(null);
        await fetchSubmissions();
      }
    } catch (err) {
      console.error('Failed to submit evaluation:', err);
      toast.error(err.response?.data?.message || 'Evaluation submission failed.');
    } finally {
      setIsSubmittingEval(false);
    }
  };

  // Open Create/Edit Assignment Modal
  const handleOpenCreateAssignment = (asg = null) => {
    if (asg) {
      setEditingAssignmentId(asg._id);
      setFormTitle(asg.title || '');
      setFormDescription(asg.description || '');
      setFormInstructions(asg.instructions || '');
      setFormDifficulty(asg.difficulty || 'Medium');
      setFormEstimatedTime(asg.estimatedTime || '4 hours');
      setFormCourseId(asg.course?._id || asg.course || '');
      setFormSkills((asg.skills || []).map((s) => (s._id ? s._id : s)));
      setFormDeadline(asg.deadline ? asg.deadline.split('T')[0] : '');
      setFormCriteria(
        asg.evaluationCriteria?.length > 0
          ? asg.evaluationCriteria
          : [
              { name: 'Functionality', description: 'Core requirements', maxPoints: 30, weight: 1.0 },
              { name: 'Code Quality', description: 'Clean architecture', maxPoints: 20, weight: 1.0 },
              { name: 'API Design', description: 'RESTful standards', maxPoints: 20, weight: 1.0 },
            ]
      );
    } else {
      setEditingAssignmentId(null);
      setFormTitle('');
      setFormDescription('');
      setFormInstructions('');
      setFormDifficulty('Medium');
      setFormEstimatedTime('4 hours');
      setFormCourseId(courses[0]?._id || '');
      setFormSkills([]);
      const nextWeek = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFormDeadline(nextWeek);
      setFormCriteria([
        { name: 'Functionality', description: 'Core requirements and edge case handling', maxPoints: 30, weight: 1.0 },
        { name: 'Code Quality', description: 'Clean architecture, readability, and design patterns', maxPoints: 20, weight: 1.0 },
        { name: 'API Design', description: 'RESTful conventions, status codes, and input validation', maxPoints: 20, weight: 1.0 },
        { name: 'Database', description: 'Schema normalization, indices, and query efficiency', maxPoints: 15, weight: 1.0 },
        { name: 'Testing', description: 'Automated test suite coverage and mock strategies', maxPoints: 15, weight: 1.0 },
        { name: 'Documentation', description: 'Architectural specifications and runbook guide', maxPoints: 10, weight: 1.0 },
      ]);
    }
    setAssignmentModalOpen(true);
  };

  // Save Assignment
  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCourseId || !formInstructions.trim()) {
      toast.error('Please enter a title, course, and instructions.');
      return;
    }

    setIsSavingAssignment(true);
    try {
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        instructions: formInstructions.trim(),
        difficulty: formDifficulty,
        estimatedTime: formEstimatedTime,
        courseId: formCourseId,
        skills: formSkills,
        deadline: new Date(formDeadline),
        evaluationCriteria: formCriteria.map((c) => ({
          name: c.name.trim(),
          description: c.description?.trim() || '',
          maxPoints: Number(c.maxPoints) || 20,
          weight: Number(c.weight) || 1.0,
        })),
      };

      if (editingAssignmentId) {
        await API.put(`/assignments/${editingAssignmentId}`, payload);
        toast.success('Practical assignment updated successfully.');
      } else {
        await API.post('/assignments', payload);
        toast.success('New practical assignment created.');
      }

      setAssignmentModalOpen(false);
      await fetchAssignmentsAndMeta();
      await fetchSubmissions();
    } catch (err) {
      console.error('Failed to save assignment:', err);
      toast.error(err.response?.data?.message || 'Failed to save assignment.');
    } finally {
      setIsSavingAssignment(false);
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" and all student submissions?`)) {
      return;
    }
    try {
      await API.delete(`/assignments/${id}`);
      toast.success('Assignment deleted successfully.');
      await fetchAssignmentsAndMeta();
      await fetchSubmissions();
    } catch (err) {
      toast.error('Failed to delete assignment.');
    }
  };

  // Add/Remove Criteria in Form
  const handleAddCriterion = () => {
    setFormCriteria((prev) => [
      ...prev,
      { name: 'New Criterion', description: 'Evaluation standard', maxPoints: 20, weight: 1.0 },
    ]);
  };

  const handleRemoveCriterion = (idx) => {
    setFormCriteria((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateCriterion = (idx, field, val) => {
    setFormCriteria((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c))
    );
  };

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased pb-20 px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-600 font-bold uppercase tracking-wider mb-1">
            Faculty Evaluation Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Practical Assignment &amp; Rubric Studio
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">
            Grade student deliverables against weighted rubrics, configure custom criteria, and credit verified skill competencies.
          </p>
        </div>

        {/* Category & View Switcher Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
          {/* Category Toggle: Assignments vs Capstones */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setEvaluationType('assignments');
                setSelectedAssignmentFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                evaluationType === 'assignments'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">assignment</span>
              <span>Assignments</span>
            </button>
            <button
              onClick={() => {
                setEvaluationType('projects');
                setSelectedAssignmentFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                evaluationType === 'projects'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
              <span>Capstones</span>
            </button>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveView('submissions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'submissions'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">rate_review</span>
              <span>Grading Queue ({statusCounts.total})</span>
            </button>
            <button
              onClick={() => setActiveView('manage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'manage'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">playlist_add</span>
              <span>Manage ({evaluationType === 'projects' ? projects.length : assignments.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= VIEW 1: SUBMISSIONS & GRADING QUEUE ================= */}
      {activeView === 'submissions' && (
        <div className="flex flex-col gap-6 mt-6">
          {/* Submissions KPI Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Submitted', count: statusCounts.total, color: 'text-slate-800', bg: 'bg-white' },
              { label: 'Needs Review', count: statusCounts.Submitted, color: 'text-blue-600', bg: 'bg-blue-50/50' },
              { label: 'Under Review', count: statusCounts['Under Review'], color: 'text-purple-600', bg: 'bg-purple-50/50' },
              { label: 'Needs Revision', count: statusCounts['Needs Revision'], color: 'text-amber-600', bg: 'bg-amber-50/50' },
              { label: 'Passed', count: statusCounts.Passed, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
              { label: 'Failed', count: statusCounts.Failed, color: 'text-rose-600', bg: 'bg-rose-50/50' },
            ].map((kpi, idx) => (
              <div key={idx} className={`p-3.5 rounded-xl border border-slate-200/90 shadow-xs ${kpi.bg}`}>
                <span className="text-[11px] font-mono font-semibold uppercase text-slate-500 block">
                  {kpi.label}
                </span>
                <span className={`text-2xl font-bold ${kpi.color} block mt-0.5`}>
                  {kpi.count}
                </span>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {[
                { id: 'all', label: 'All' },
                { id: 'Submitted', label: 'Submitted' },
                { id: 'Under Review', label: 'In Review' },
                { id: 'Needs Revision', label: 'Revisions' },
                { id: 'Passed', label: 'Passed' },
                { id: 'Failed', label: 'Failed' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedStatusFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedStatusFilter === pill.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Search and Assignment Filter */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search student or task..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {assignments.length > 0 && (
                <select
                  value={selectedAssignmentFilter}
                  onChange={(e) => setSelectedAssignmentFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Assignments</option>
                  {assignments.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Submissions List */}
          {loadingSubmissions ? (
            <div className="space-y-3">
              <Skeleton height="80px" rounded="14px" />
              <Skeleton height="80px" rounded="14px" />
              <Skeleton height="80px" rounded="14px" />
            </div>
          ) : filteredSubmissions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredSubmissions.map((sub) => {
                const asg = sub.assignment;
                const student = sub.user;
                const isPassed = sub.status === 'Passed';
                const isRevision = sub.status === 'Needs Revision';
                const isSubmitted = sub.status === 'Submitted';

                return (
                  <div
                    key={sub._id}
                    className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    {/* Student Info & Assignment details */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {student?.name?.charAt(0) || 'S'}
                      </div>

                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{student?.name}</span>
                          <span className="text-xs text-slate-400 font-mono">({student?.email})</span>
                          <span
                            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                              isPassed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isRevision
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : isSubmitted
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {sub.status.toUpperCase()}
                          </span>
                          {sub.score !== null && sub.score !== undefined && (
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {sub.score}% SCORE
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="font-semibold text-slate-800">{asg?.title}</span>
                          <span>•</span>
                          <span className="text-slate-500">{asg?.course?.title || 'Course'}</span>
                        </div>

                        {/* Deliverables links */}
                        <div className="flex items-center gap-3 pt-1 text-xs font-mono">
                          {sub.repositoryUrl && (
                            <a
                              href={sub.repositoryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <span className="material-symbols-outlined text-[14px]">code</span>
                              <span>Repository</span>
                            </a>
                          )}
                          {sub.deploymentUrl && (
                            <a
                              href={sub.deploymentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                            >
                              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                              <span>Live Preview</span>
                            </a>
                          )}
                          <span className="text-slate-400">
                            Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleOpenEvaluation(sub)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                          isSubmitted
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isSubmitted ? 'grade' : 'edit_document'}
                        </span>
                        <span>{isSubmitted ? 'Grade Deliverable' : 'Update Evaluation'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No Submissions Match Filters"
              description="No learner submissions matched your selected filters."
              actionLabel="Reset Filters"
              onAction={() => {
                setSelectedStatusFilter('all');
                setSelectedAssignmentFilter('all');
                setSearchQuery('');
              }}
            />
          )}
        </div>
      )}

      {/* ================= VIEW 2: MANAGE ASSIGNMENTS & RUBRICS ================= */}
      {activeView === 'manage' && (
        <div className="flex flex-col gap-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Configured Practical Assignments ({assignments.length})
            </h2>
            <button
              onClick={() => handleOpenCreateAssignment()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Create Practical Assignment</span>
            </button>
          </div>

          {loadingAssignments ? (
            <div className="space-y-3">
              <Skeleton height="100px" rounded="16px" />
              <Skeleton height="100px" rounded="16px" />
            </div>
          ) : assignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((asg) => (
                <div
                  key={asg._id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {asg.difficulty}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Due: {new Date(asg.deadline).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {asg.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {asg.description}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-xs font-medium text-slate-700">Course:</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {asg.course?.title || 'Assigned Course'}
                      </span>
                    </div>

                    {/* Criteria Rubric summary */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 mt-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">
                        Evaluation Rubric ({asg.evaluationCriteria?.length || 0} criteria):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {asg.evaluationCriteria?.map((crit, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700"
                          >
                            {crit.name} ({crit.maxPoints} pts)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenCreateAssignment(asg)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(asg._id, asg.title)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Practical Assignments Created"
              description="Create your first practical engineering task to evaluate hands-on learner skills."
              actionLabel="Create Assignment"
              onAction={() => handleOpenCreateAssignment()}
            />
          )}
        </div>
      )}

      {/* ================= MODAL: INTERACTIVE RUBRIC EVALUATION WORKSPACE ================= */}
      {evaluatingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                    Rubric Evaluation Studio
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-medium text-slate-500">
                    {evaluatingSubmission.assignment?.course?.title}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {evaluatingSubmission.assignment?.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                  <span>Student: <strong>{evaluatingSubmission.user?.name}</strong></span>
                  <span>•</span>
                  <span>Submitted: {new Date(evaluatingSubmission.submittedAt).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => setEvaluatingSubmission(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Deliverables Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Submitted Deliverables
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                {evaluatingSubmission.repositoryUrl ? (
                  <a
                    href={evaluatingSubmission.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold border border-blue-200"
                  >
                    <span className="material-symbols-outlined text-[16px]">code</span>
                    <span>View GitHub Repository</span>
                  </a>
                ) : (
                  <span className="text-slate-400">No repo link provided</span>
                )}

                {evaluatingSubmission.deploymentUrl && (
                  <a
                    href={evaluatingSubmission.deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold border border-emerald-200"
                  >
                    <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                    <span>View Live Deployment</span>
                  </a>
                )}

                {evaluatingSubmission.documentationUrl && (
                  <a
                    href={evaluatingSubmission.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold border border-indigo-200"
                  >
                    <span className="material-symbols-outlined text-[16px]">menu_book</span>
                    <span>Documentation Wiki</span>
                  </a>
                )}
              </div>

              {(evaluatingSubmission.content || evaluatingSubmission.notes) && (
                <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-700">
                  <span className="font-semibold block mb-0.5 font-mono text-[11px] text-slate-500">
                    Learner Architecture Notes:
                  </span>
                  <p className="whitespace-pre-wrap leading-relaxed font-sans bg-white p-2.5 rounded-lg border border-slate-200">
                    {evaluatingSubmission.content || evaluatingSubmission.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitEvaluation} className="flex flex-col gap-4">
              {/* Configured Criteria Scoring Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                    Configured Criteria Rubric &amp; Points
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">Weighted Total:</span>
                    <span
                      className={`text-sm font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                        calculatedEvaluationScore >= 60
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {calculatedEvaluationScore}% {calculatedEvaluationScore >= 60 ? 'PASSING' : 'BELOW THRESHOLD'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {criteriaGrades.map((crit, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{crit.criterionName}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            Weight: {crit.weight || 1.0}x
                          </span>
                        </div>
                        {crit.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{crit.description}</p>
                        )}
                        <input
                          type="text"
                          placeholder="Criterion comment (e.g. clean controller split)..."
                          value={crit.comment}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCriteriaGrades((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, comment: val } : c))
                            );
                          }}
                          className="w-full mt-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Points earned input */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                          <input
                            type="number"
                            min="0"
                            max={crit.maxPoints}
                            value={crit.pointsEarned}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(crit.maxPoints, Number(e.target.value) || 0));
                              setCriteriaGrades((prev) =>
                                prev.map((c, i) => (i === idx ? { ...c, pointsEarned: val } : c))
                              );
                            }}
                            className="w-14 text-center font-mono font-bold text-sm bg-white border border-slate-200 rounded-lg py-1 focus:outline-none focus:border-blue-500"
                          />
                          <span className="text-xs font-mono text-slate-400">/ {crit.maxPoints} pts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Decision Selector */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Evaluation Verdict Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Passed', label: 'Passed', icon: 'check_circle', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                    { id: 'Needs Revision', label: 'Needs Revision', icon: 'published_with_changes', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                    { id: 'Under Review', label: 'Under Review', icon: 'hourglass_top', color: 'border-purple-500 bg-purple-50 text-purple-800' },
                    { id: 'Failed', label: 'Failed', icon: 'cancel', color: 'border-rose-500 bg-rose-50 text-rose-800' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setEvalStatus(st.id)}
                      className={`p-2.5 rounded-xl border-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        evalStatus === st.id
                          ? st.color
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{st.icon}</span>
                      <span>{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comprehensive Feedback Editor */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Overall Faculty Feedback &amp; Suggestions
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide constructive feedback highlighting implementation strengths and areas for improvement..."
                  value={evalFeedback}
                  onChange={(e) => setEvalFeedback(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed"
                />

                {/* Quick suggestions tags */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] font-mono text-slate-400">Quick Tags:</span>
                  {[
                    'Exemplary clean architecture',
                    'Add rate limiting & security headers',
                    'Increase automated test coverage',
                    'Address null input edge cases',
                    'Flawless OpenAPI documentation',
                  ].map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setEvalFeedback((prev) => (prev ? `${prev}\n• ${tag}` : `• ${tag}`))
                      }
                      className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition-all"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Automated Skill Ingestion Notice */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/70 text-xs text-blue-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>
                  Awarding <strong>Passed</strong> will automatically ingest performance evidence and recalculate the learner's relevant skills in real time.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEvaluatingSubmission(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEval}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingEval ? 'Publishing Grade...' : 'Publish Evaluation & Award Skills'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT PRACTICAL ASSIGNMENT ================= */}
      {assignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                {editingAssignmentId ? 'Edit Practical Assignment' : 'Create Practical Engineering Assignment'}
              </h3>
              <button
                onClick={() => setAssignmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assignment Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus Protocol & Byzantine Fault Recovery"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCourseId}
                    onChange={(e) => setFormCourseId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select course...</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    value={formEstimatedTime}
                    onChange={(e) => setFormEstimatedTime(e.target.value)}
                    placeholder="e.g. 4 hours"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Submission Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  className="w-full sm:w-60 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Overview Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summary of practical objectives..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Step-by-Step Instructions &amp; Constraints <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Provide explicit engineering requirements, expected routes, unit test guidelines, and deliverables..."
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Skills Association */}
              {skills.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Associated Skills (Learner competency points will update in these areas)
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 max-h-32 overflow-y-auto">
                    {skills.map((sk) => {
                      const isSelected = formSkills.includes(sk._id);
                      return (
                        <button
                          key={sk._id}
                          type="button"
                          onClick={() => {
                            setFormSkills((prev) =>
                              isSelected ? prev.filter((id) => id !== sk._id) : [...prev, sk._id]
                            );
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white font-semibold shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {sk.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Configurable Evaluation Criteria & Weights */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Configurable Evaluation Criteria &amp; Weights
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCriterion}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>Add Criterion</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formCriteria.map((crit, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                    >
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          required
                          placeholder="Criterion Name (e.g. API Design)"
                          value={crit.name}
                          onChange={(e) => handleUpdateCriterion(idx, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          placeholder="Description / Requirements"
                          value={crit.description}
                          onChange={(e) => handleUpdateCriterion(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-mono">Max:</span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={crit.maxPoints}
                            onChange={(e) => handleUpdateCriterion(idx, 'maxPoints', Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-center"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-mono">Wt:</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="5.0"
                            value={crit.weight || 1.0}
                            onChange={(e) => handleUpdateCriterion(idx, 'weight', Number(e.target.value))}
                            className="w-14 px-1.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono text-center"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-1 text-right">
                        {formCriteria.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCriterion(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAssignmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAssignment}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSavingAssignment ? 'Saving...' : editingAssignmentId ? 'Save Changes' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
