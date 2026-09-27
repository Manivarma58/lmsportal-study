import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { Skeleton, ProgressBar, EmptyState } from '../../components/ui';
import { toast } from 'sonner';

export default function ProjectWorkspace() {
  const { id } = useParams();

  const [projectData, setProjectData] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  // Workflow active step:
  // 'overview' | 'requirements' | 'milestones' | 'workarea' | 'evaluation'
  const [activeWorkflowStep, setActiveWorkflowStep] = useState('overview');

  // Deliverables form state
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [architectureNotes, setArchitectureNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingMilestoneId, setTogglingMilestoneId] = useState(null);

  // Fetch project workspace data
  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/projects/${id}`);
      if (res.data?.success) {
        setProjectData(res.data.project);
        const sub = res.data.submission;
        setSubmission(sub);
        if (sub) {
          setRepositoryUrl(sub.repositoryUrl || '');
          setDeploymentUrl(sub.deploymentUrl || '');
          setDocumentationUrl(sub.documentationUrl || '');
          setArchitectureNotes(sub.notes || '');

          // If project was evaluated or submitted, open evaluation tab by default
          if (['Submitted', 'Under Review', 'Needs Revision', 'Passed', 'Failed'].includes(sub.status)) {
            setActiveWorkflowStep('evaluation');
          }
        }
      }
    } catch (err) {
      console.error('Failed to load project workspace:', err);
      toast.error('Unable to load project workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [id]);

  // Toggle milestone completion
  const handleToggleMilestone = async (milestoneId, currentCompleted) => {
    setTogglingMilestoneId(milestoneId);
    try {
      const res = await API.patch(`/projects/${id}/milestones`, {
        milestoneId,
        completed: !currentCompleted,
      });

      if (res.data?.success) {
        setSubmission(res.data.submission);
        toast.success(
          !currentCompleted
            ? 'Milestone marked completed!'
            : 'Milestone marked as in-progress.'
        );
      }
    } catch (err) {
      console.error('Failed to update milestone:', err);
      toast.error('Could not update milestone progress.');
    } finally {
      setTogglingMilestoneId(null);
    }
  };

  // Submit deliverables
  const handleSubmitDeliverables = async (e) => {
    e.preventDefault();
    if (!repositoryUrl.trim() && !deploymentUrl.trim() && !documentationUrl.trim()) {
      toast.error('Please provide at least a repository URL, live deployment URL, or documentation link.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        repositoryUrl: repositoryUrl.trim(),
        deploymentUrl: deploymentUrl.trim(),
        documentationUrl: documentationUrl.trim(),
        notes: architectureNotes.trim(),
      };

      const res = await API.post(`/projects/${id}/submit`, payload);
      if (res.data?.success) {
        toast.success('Capstone project deliverables submitted successfully for evaluation!');
        setSubmission(res.data.submission);
        setActiveWorkflowStep('evaluation');
      }
    } catch (err) {
      console.error('Submit project error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit deliverables.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <Skeleton height="80px" rounded="16px" />
        <Skeleton height="350px" rounded="16px" />
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <EmptyState
          title="Project Not Found"
          description="The requested practical project does not exist or is unavailable."
          actionLabel="Back to Projects"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const milestones = projectData.milestones || [];
  const milestoneProgress = submission?.milestoneProgress || [];
  const completedMilestones = milestoneProgress.filter((m) => m.completed).length;
  const totalMilestones = milestones.length;
  const progressPct =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const currentStatus = submission?.status || 'In Progress';
  const isPassed = currentStatus === 'Passed';
  const isNeedsRevision = currentStatus === 'Needs Revision';
  const isUnderReview = currentStatus === 'Under Review' || currentStatus === 'Submitted';

  const workflowSteps = [
    { id: 'overview', label: '1. Overview', icon: 'info' },
    { id: 'requirements', label: '2. Requirements', icon: 'checklist' },
    { id: 'milestones', label: `3. Milestones (${completedMilestones}/${totalMilestones})`, icon: 'flag' },
    { id: 'workarea', label: '4. Work Area & Submit', icon: 'terminal' },
    { id: 'evaluation', label: '5. Evaluation & Feedback', icon: 'grade' },
  ];

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased pb-20 px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb & Navigation Header */}
      <div className="flex flex-col gap-2 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Link to="/student/projects" className="hover:text-blue-600 transition-colors">
            Projects Catalog
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{projectData.title}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {projectData.difficulty.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 font-mono">• Duration: {projectData.estimatedDuration}</span>
              {projectData.course?.title && (
                <span className="text-xs text-slate-400 font-mono">• {projectData.course.title}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {projectData.title}
            </h1>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Milestones Completed</span>
              <span className="text-sm font-bold font-mono text-indigo-600">
                {completedMilestones} / {totalMilestones} ({progressPct}%)
              </span>
            </div>
            <span
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold border ${
                isPassed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isNeedsRevision
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : isUnderReview
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              {currentStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-2">
          <ProgressBar progress={progressPct} color={isPassed ? 'bg-emerald-500' : 'bg-indigo-600'} />
        </div>
      </div>

      {/* ================= WORKFLOW STEPPER TABS ================= */}
      {/* Project Overview → Requirements → Milestones → Work Area → Submit → Evaluation → Feedback → Skill Update */}
      <div className="my-6">
        <div className="flex items-center overflow-x-auto gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
          {workflowSteps.map((step) => {
            const isActive = activeWorkflowStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveWorkflowStep(step.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{step.icon}</span>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= WORKFLOW STAGE 1: OVERVIEW ================= */}
      {activeWorkflowStep === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 shadow-xs animate-in fade-in duration-150">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
              Project Architecture Overview
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-sans">
              {projectData.description}
            </p>
          </div>

          {/* Learning Objectives */}
          {projectData.objectives?.length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                Core Engineering Objectives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {projectData.objectives.map((obj, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span className="leading-relaxed">{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Associated Skills */}
          {projectData.requiredSkills?.length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Demonstrated Skill Competencies
              </h3>
              <div className="flex flex-wrap gap-2">
                {projectData.requiredSkills.map((sk) => (
                  <span
                    key={sk._id || sk}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <span className="material-symbols-outlined text-[14px]">psychology</span>
                    <span>{typeof sk === 'object' ? sk.name : sk}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Faculty Mentor */}
          {projectData.instructor && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                  {projectData.instructor.name?.charAt(0) || 'F'}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{projectData.instructor.name}</span>
                  <span className="text-slate-400 font-mono">Faculty Capstone Evaluator</span>
                </div>
              </div>
              <button
                onClick={() => setActiveWorkflowStep('requirements')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Review Requirements</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= WORKFLOW STAGE 2: REQUIREMENTS ================= */}
      {activeWorkflowStep === 'requirements' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 shadow-xs animate-in fade-in duration-150">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
              System Specifications &amp; Technical Requirements
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Your submission must adhere to the following architecture guidelines and engineering constraints:
            </p>

            <div className="space-y-3">
              {projectData.requirements?.map((req, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-sans">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Configured Evaluation Rubric Preview */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
              Configured Capstone Evaluation Criteria
            </h3>
            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Evaluation Dimension</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Max Points</th>
                    <th className="p-3 text-right">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projectData.evaluationCriteria?.map((crit, idx) => (
                    <tr key={idx}>
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

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setActiveWorkflowStep('overview')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Back to Overview
            </button>
            <button
              onClick={() => setActiveWorkflowStep('milestones')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Track Milestones</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= WORKFLOW STAGE 3: MILESTONES & PROGRESS ================= */}
      {activeWorkflowStep === 'milestones' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 shadow-xs animate-in fade-in duration-150">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Milestone Execution Pipeline
              </h3>
              <span className="text-xs font-mono font-bold text-indigo-600">
                {completedMilestones} / {totalMilestones} Completed
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Check off deliverables as you build each phase of the project. Your progress updates in real time.
            </p>

            <div className="space-y-4">
              {milestones.map((m, idx) => {
                const subProgress = milestoneProgress.find(
                  (sp) => sp.milestoneId?.toString() === m._id?.toString()
                );
                const isCompleted = subProgress?.completed || false;

                return (
                  <div
                    key={m._id || idx}
                    className={`p-4 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          disabled={togglingMilestoneId === m._id}
                          onClick={() => handleToggleMilestone(m._id, isCompleted)}
                          className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-300 hover:border-blue-500'
                          }`}
                        >
                          {isCompleted && (
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                              Phase {idx + 1}
                            </span>
                            <h4
                              className={`font-bold text-sm tracking-tight ${
                                isCompleted ? 'text-emerald-900 line-through' : 'text-slate-900'
                              }`}
                            >
                              {m.title}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{m.description}</p>

                          {/* Deliverables checklist */}
                          {m.deliverables?.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1 text-xs">
                              <span className="text-[11px] font-mono text-slate-400 font-semibold">
                                Expected Deliverables:
                              </span>
                              {m.deliverables.map((del, dIdx) => (
                                <div key={dIdx} className="flex items-center gap-2 text-slate-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                  <span>{del}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isCompleted ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setActiveWorkflowStep('requirements')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Back to Requirements
            </button>
            <button
              onClick={() => setActiveWorkflowStep('workarea')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Proceed to Work Area</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= WORKFLOW STAGE 4: WORK AREA & SUBMIT ================= */}
      {activeWorkflowStep === 'workarea' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 shadow-xs animate-in fade-in duration-150">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Deliverables Submission Workspace
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Submit your production repository, cloud deployment link, and architecture documentation. Clicking submit requires real verifiable links.
            </p>

            <form onSubmit={handleSubmitDeliverables} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub / Git Repository URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    code
                  </span>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/username/capstone-project"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Live Production Deployment URL (Optional)
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      rocket_launch
                    </span>
                    <input
                      type="url"
                      placeholder="https://my-capstone.onrender.com"
                      value={deploymentUrl}
                      onChange={(e) => setDeploymentUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Documentation / Wiki URL (Optional)
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      menu_book
                    </span>
                    <input
                      type="url"
                      placeholder="https://github.com/username/project/wiki"
                      value={documentationUrl}
                      onChange={(e) => setDocumentationUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Architecture Overview &amp; Runbook Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail your system architecture, setup instructions, test execution commands, and trade-offs..."
                  value={architectureNotes}
                  onChange={(e) => setArchitectureNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                />
              </div>

              {/* Strict Submission Warning */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>
                  Submitting sets your capstone project status to <strong>Submitted</strong> for instructor review. Passing marks automatically credit verified project evidence to your skill profile.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveWorkflowStep('milestones')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Review Milestones
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Capstone for Faculty Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= WORKFLOW STAGE 5: EVALUATION & FEEDBACK ================= */}
      {activeWorkflowStep === 'evaluation' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 shadow-xs animate-in fade-in duration-150">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Faculty Evaluation &amp; Competency Credentials
              </h3>
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${
                  isPassed
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isNeedsRevision
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {currentStatus.toUpperCase()}
              </span>
            </div>

            {/* Score & Verdict Banner */}
            {submission?.score !== null && submission?.score !== undefined ? (
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isPassed
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : isNeedsRevision
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[24px] text-emerald-600">
                      {isPassed ? 'verified' : 'published_with_changes'}
                    </span>
                    <h4 className="font-extrabold text-lg">
                      {isPassed ? 'Capstone Mastered & Passed!' : 'Revisions Requested by Faculty'}
                    </h4>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90 max-w-xl">
                    {isPassed
                      ? 'Congratulations! Your capstone project was verified against all architectural and functionality rubrics. Performance evidence has been credited to your skill portfolio.'
                      : 'Please review the faculty comments and criteria scores below, refine your repository implementation, and resubmit.'}
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-6 shrink-0">
                  <span className="text-[11px] font-mono uppercase block opacity-80">Final Rubric Score</span>
                  <span className="text-3xl font-extrabold font-mono text-emerald-700">
                    {submission.score}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 text-[20px] animate-pulse">
                  hourglass_top
                </span>
                <div>
                  <span className="font-bold block">Deliverables Under Faculty Review</span>
                  <span className="text-blue-700">
                    Your code repository has been queued for rubric grading. Evaluated scores and skill updates will appear here once reviewed.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Instructor Feedback Commentary */}
          {submission?.feedback && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">rate_review</span>
                <span>Faculty Mentor Commentary</span>
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-sans pl-5">
                "{submission.feedback}"
              </p>
            </div>
          )}

          {/* Criteria Breakdown Table */}
          {submission?.criteriaGrades?.length > 0 && (
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Detailed Rubric Criteria Breakdown
              </h4>
              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                    <tr>
                      <th className="p-3">Evaluation Criterion</th>
                      <th className="p-3 text-right">Earned / Max</th>
                      <th className="p-3">Faculty Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submission.criteriaGrades.map((cg, idx) => (
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

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveWorkflowStep('workarea')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {isNeedsRevision ? 'Revise Deliverables' : 'View Submitted Deliverables'}
            </button>

            {isPassed && (
              <Link
                to="/student/dashboard"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Skill Profile</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
