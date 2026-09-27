import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'sonner';
import {
  Briefcase,
  Building2,
  Clock,
  ChevronRight,
  Database,
  Terminal,
  Code2,
  FileSpreadsheet,
  Layers,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  TrendingUp,
  ArrowLeft,
  Play,
  Save,
  Send,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Check,
  UserCheck,
} from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';

const JobSimulationWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [simulation, setSimulation] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'workspace' | 'submit' | 'evaluation'
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);

  // Deliverable editor state for the active task
  const [deliverableContent, setDeliverableContent] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  // Final submission state
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [deployUrl, setDeployUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Dataset preview modal/drawer
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [showDatasetDrawer, setShowDatasetDrawer] = useState(false);

  const fetchSimulationData = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/simulations/${id}`);
      const sim = res.data.simulation;
      const sub = res.data.learnerSubmission;

      setSimulation(sim);
      setSubmission(sub);

      if (sub) {
        setExecutiveSummary(sub.finalExecutiveSummary || '');
        setRepoUrl(sub.repositoryUrl || '');
        setDeployUrl(sub.deploymentUrl || '');

        if (sub.status === 'Evaluated') {
          setActiveTab('evaluation');
        } else if (sub.status === 'In Progress') {
          setActiveTab('workspace');
          setCurrentTaskIdx(sub.currentTaskIndex || 0);
        }
      }

      if (sim.datasets && sim.datasets.length > 0) {
        setSelectedDataset(sim.datasets[0]);
      }
    } catch (err) {
      console.error('Failed to load simulation:', err);
      toast.error('Simulation not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulationData();
  }, [id]);

  // Sync editor content whenever the active task changes
  useEffect(() => {
    if (!simulation?.tasks || !simulation.tasks[currentTaskIdx]) return;
    const task = simulation.tasks[currentTaskIdx];

    if (submission?.taskProgress) {
      const userTask = submission.taskProgress.find((tp) => tp.taskId === task.id);
      if (userTask && userTask.content) {
        setDeliverableContent(userTask.content);
        setDeliverableNotes(userTask.notes || '');
        return;
      }
    }

    // Default to starter template
    setDeliverableContent(task.starterTemplate || '');
    setDeliverableNotes('');
  }, [currentTaskIdx, simulation, submission]);

  // Start or resume simulation session
  const handleStartSimulation = async () => {
    try {
      const res = await API.post(`/simulations/${simulation._id}/start`);
      setSubmission(res.data.submission);
      setActiveTab('workspace');
      toast.success('Simulation initialized. Welcome to the team!');
    } catch (err) {
      toast.error('Failed to initialize simulation workspace.');
    }
  };

  // Save current task deliverable
  const handleSaveCurrentTask = async (markComplete = false) => {
    if (!simulation || !submission) return;
    const task = simulation.tasks[currentTaskIdx];
    if (!task) return;

    setSavingTask(true);
    try {
      const res = await API.put(`/simulations/${simulation._id}/tasks/${task.id}`, {
        content: deliverableContent,
        notes: deliverableNotes,
        status: markComplete ? 'Completed' : 'In Progress',
        currentTaskIndex: currentTaskIdx,
      });

      setSubmission(res.data.submission);
      toast.success(
        markComplete
          ? `Milestone ${task.taskNumber} marked complete!`
          : 'Task deliverable draft saved.'
      );

      // If marked complete and there's a next task, auto-advance
      if (markComplete && currentTaskIdx < simulation.tasks.length - 1) {
        setCurrentTaskIdx((prev) => prev + 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save deliverable.');
    } finally {
      setSavingTask(false);
    }
  };

  // Submit full simulation
  const handleSubmitSimulation = async () => {
    if (!executiveSummary.trim()) {
      toast.error('Please draft an executive summary / memorandum before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post(`/simulations/${simulation._id}/submit`, {
        executiveSummary,
        repositoryUrl: repoUrl,
        deploymentUrl: deployUrl,
      });

      setSubmission(res.data.submission);
      setActiveTab('evaluation');
      toast.success('Simulation submitted and evaluated successfully!');
    } catch (err) {
      console.error('Submission failed:', err);
      toast.error(err.response?.data?.message || 'Failed to submit simulation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton variant="card" className="h-20 bg-slate-200/70 rounded-2xl" />
        <Skeleton variant="card" className="h-96 bg-slate-200/70 rounded-3xl" />
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-4">
        <p>Simulation not found.</p>
        <Link to="/student/simulations" className="text-blue-600 font-bold hover:underline">
          Back to Simulations Catalog
        </Link>
      </div>
    );
  }

  const tasks = simulation.tasks || [];
  const currentTask = tasks[currentTaskIdx] || tasks[0];
  const isEvaluated = submission?.status === 'Evaluated';
  const hasStarted = Boolean(submission);

  const getDeliverableBadge = (type) => {
    switch (type) {
      case 'code':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'sql':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'report':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'dataset':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen text-slate-800">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/student/simulations"
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">
                {simulation.simulationType} • {simulation.role}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-500">{simulation.companyScenario?.companyName}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 line-clamp-1">{simulation.title}</h1>
          </div>
        </div>

        {/* Workflow Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Overview &amp; Intel
          </button>

          <button
            onClick={() => {
              if (!hasStarted) {
                handleStartSimulation();
              } else {
                setActiveTab('workspace');
              }
            }}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'workspace'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Task Workspace
          </button>

          <button
            onClick={() => setActiveTab('submit')}
            disabled={!hasStarted}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all disabled:opacity-40 ${
              activeTab === 'submit'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Review &amp; Submit
          </button>

          {isEvaluated && (
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'evaluation'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:text-emerald-800'
              }`}
            >
              4. Scorecard ({submission.evaluation.overallScore}%)
            </button>
          )}
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW & SCENARIO INTEL ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Company Briefing Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Company Intel: {simulation.companyScenario?.companyName}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Workplace Mission Context</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {simulation.companyScenario?.context}
                </p>
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs text-rose-800">
                  <span className="font-mono uppercase font-bold text-rose-700 block mb-1">
                    Operational Stakes:
                  </span>
                  {simulation.companyScenario?.stakes}
                </div>
              </div>

              {/* Mentor Persona Card */}
              {simulation.companyScenario?.mentorPersona && (
                <div className="w-full md:w-80 p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{simulation.companyScenario.mentorPersona.avatar}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {simulation.companyScenario.mentorPersona.name}
                      </h4>
                      <span className="text-xs text-blue-700 font-mono font-medium">
                        {simulation.companyScenario.mentorPersona.role}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                    "{simulation.companyScenario.mentorPersona.welcomeMessage}"
                  </p>
                  <button
                    onClick={() => {
                      if (!hasStarted) {
                        handleStartSimulation();
                      } else {
                        setActiveTab('workspace');
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{hasStarted ? 'Resume Workspace' : 'Begin Simulation'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Datasets & Task Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Datasets Catalog */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>Available Enterprise Datasets ({simulation.datasets?.length || 0})</span>
                </h3>
              </div>

              <div className="space-y-3">
                {(simulation.datasets || []).map((ds, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-xs text-slate-900">{ds.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-200 text-slate-700 font-semibold">
                        {ds.format}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{ds.description}</p>

                    {/* Column Schema Preview */}
                    {ds.columns && ds.columns.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block font-medium">
                          Schema Columns:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {ds.columns.map((col, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-700 shadow-xs"
                            >
                              {col.name} ({col.type})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sample Data Viewer Button */}
                    {ds.sampleData && (
                      <button
                        onClick={() => {
                          setSelectedDataset(ds);
                          setShowDatasetDrawer(true);
                        }}
                        className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 pt-1"
                      >
                        <span>Inspect Sample Records</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluation Rubric Preview */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Evaluation Rubric Criteria</span>
              </h3>

              <div className="space-y-3">
                {(simulation.evaluationCriteria || []).map((crit, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{crit.criterion}</span>
                      <span className="font-mono text-indigo-700 font-bold">
                        Max {crit.maxScore} pts (Weight {crit.weight}x)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{crit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: TASK WORKSPACE RUNNER ================= */}
      {activeTab === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Task Roadmap / Navigation */}
          <div className="lg:col-span-1 space-y-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-500">
                Task Milestones
              </span>
              <span className="text-xs font-mono text-blue-700 font-bold">
                {currentTaskIdx + 1} / {tasks.length}
              </span>
            </div>

            <div className="space-y-2">
              {tasks.map((task, idx) => {
                const userTask = submission?.taskProgress?.find((tp) => tp.taskId === task.id);
                const isCompleted = userTask?.status === 'Completed';
                const isCurrent = idx === currentTaskIdx;

                return (
                  <button
                    key={task.id}
                    onClick={() => setCurrentTaskIdx(idx)}
                    className={`w-full p-3 rounded-2xl text-left transition-all border flex items-center justify-between shadow-xs ${
                      isCurrent
                        ? 'bg-blue-50/70 border-blue-400 text-slate-900 ring-1 ring-blue-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3 h-3" /> : task.taskNumber}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs truncate block text-slate-900">{task.title}</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {task.deliverableType} • {task.maxScore} pts
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Intel Launcher */}
            <button
              onClick={() => setShowDatasetDrawer(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-blue-700 border border-slate-200 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4 text-blue-600" />
              <span>Inspect Company Datasets</span>
            </button>
          </div>

          {/* Center Workspace Editor Area */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              {/* Task Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-700">
                      Milestone {currentTask.taskNumber} of {tasks.length}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${getDeliverableBadge(
                        currentTask.deliverableType
                      )}`}
                    >
                      {currentTask.deliverableType}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{currentTask.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDeliverableContent(currentTask.starterTemplate || '');
                      toast.info('Template reset to initial boilerplate.');
                    }}
                    title="Reset to Starter Template"
                    className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs border border-slate-200 shadow-xs transition-all flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    onClick={() => handleSaveCurrentTask(false)}
                    disabled={savingTask}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-blue-600" />
                    <span>Save Draft</span>
                  </button>

                  <button
                    onClick={() => handleSaveCurrentTask(true)}
                    disabled={savingTask}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Complete</span>
                  </button>
                </div>
              </div>

              {/* Instructions and Rubric Hint */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-2 text-xs">
                <p className="text-slate-700 leading-relaxed font-sans">{currentTask.instructions}</p>
                {currentTask.rubricHint && (
                  <p className="text-blue-800 text-[11px] font-mono pt-1 border-t border-blue-200/60 font-medium">
                    💡 Rubric Guidance: {currentTask.rubricHint}
                  </p>
                )}
              </div>

              {/* Work Area Deliverable Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Deliverable Work Area:</span>
                  <span className="text-[11px]">Type: {currentTask.deliverableType}</span>
                </div>
                <textarea
                  value={deliverableContent}
                  onChange={(e) => setDeliverableContent(e.target.value)}
                  placeholder={
                    currentTask.placeholderText ||
                    'Write your implementation, queries, analysis, or strategic documentation here...'
                  }
                  rows={14}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white font-mono text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed shadow-inner"
                ></textarea>
              </div>

              {/* Notes / Assumptions */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-500 font-medium">
                  Engineering Notes &amp; Assumptions (Optional):
                </label>
                <input
                  type="text"
                  value={deliverableNotes}
                  onChange={(e) => setDeliverableNotes(e.target.value)}
                  placeholder="e.g. Assumed UTC time zone; indexed sku column for performance..."
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
                />
              </div>

              {/* Bottom Stepper Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentTaskIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentTaskIdx === 0}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-40 text-xs font-semibold text-slate-700 shadow-xs transition-all"
                >
                  Previous Milestone
                </button>

                {currentTaskIdx < tasks.length - 1 ? (
                  <button
                    onClick={() => setCurrentTaskIdx((prev) => prev + 1)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>Next Milestone</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>Proceed to Review &amp; Submit</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: REVIEW & FINAL SUBMIT ================= */}
      {activeTab === 'submit' && (
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Review &amp; Submit Deliverables</h2>
            <p className="text-xs text-slate-600">
              Compile your technical outputs and author an executive memorandum for the leadership team. Upon submission, our objective rubric evaluation engine assesses your work and syncs verified evidence to your demonstrated Skill scores.
            </p>
          </div>

          {/* Task Completion Checklist */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-mono uppercase font-bold text-blue-700">
              Milestone Deliverables Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tasks.map((task) => {
                const userTask = submission?.taskProgress?.find((tp) => tp.taskId === task.id);
                const isCompleted = userTask?.status === 'Completed' || Boolean(userTask?.content);

                return (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-xs"
                  >
                    <span className="text-slate-800 truncate max-w-[200px] font-medium">{task.title}</span>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isCompleted ? 'Ready' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Executive Summary */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">
              Final Executive Summary / Memorandum <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Summarize your key findings, commercial impact, and architectural decisions for the CFO/CTO.
            </p>
            <textarea
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              placeholder="Author your formal executive briefing here..."
              rows={6}
              className="w-full p-4 rounded-2xl bg-white border border-slate-300 focus:border-blue-500 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all leading-relaxed shadow-xs"
            ></textarea>
          </div>

          {/* Repository & Deployment URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-500 font-medium">Repository Link (Optional):</label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-500 font-medium">Deployment / Demo (Optional):</label>
              <input
                type="url"
                value={deployUrl}
                onChange={(e) => setDeployUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitSimulation}
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>
              {submitting ? 'Evaluating Against Rubric...' : 'Submit for Professional Rubric Evaluation'}
            </span>
          </button>
        </div>
      )}

      {/* ================= TAB 4: EVALUATION & SCORECARD ================= */}
      {activeTab === 'evaluation' && submission?.evaluation && (
        <div className="space-y-6">
          {/* Scorecard Hero Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Workplace Evaluation Complete</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">Professional Performance Scorecard</h2>
                <p className="text-xs text-slate-500">
                  Role: <span className="text-blue-700 font-bold">{simulation.role}</span> at {simulation.companyScenario?.companyName}
                </p>
              </div>

              {/* Overall Score Dial */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 shrink-0">
                <div className="text-center">
                  <span className="text-4xl font-extrabold font-mono text-blue-700">
                    {submission.evaluation.overallScore}%
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase font-bold block mt-1 px-2.5 py-0.5 rounded ${
                      submission.evaluation.passed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {submission.evaluation.passed ? 'PASSED ✅' : 'NEEDS REVISION ❌'}
                  </span>
                </div>
              </div>
            </div>

            {/* General Feedback Quote */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
              "{submission.evaluation.generalFeedback}"
            </div>
          </div>

          {/* Criteria Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(submission.evaluation.criteriaScores || []).map((cs, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-slate-900">{cs.criterion}</h4>
                  <span className="font-mono text-blue-700 font-bold">
                    {cs.score} / {cs.maxScore} pts
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                    style={{ width: `${Math.round((cs.score / cs.maxScore) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{cs.feedback}</p>
              </div>
            ))}
          </div>

          {/* Strengths & Improvement Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-3">
              <h4 className="text-xs font-mono uppercase font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Demonstrated Strengths</span>
              </h4>
              <ul className="space-y-2">
                {(submission.evaluation.strengths || []).map((str, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-emerald-600 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-xs space-y-3">
              <h4 className="text-xs font-mono uppercase font-bold text-amber-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Areas for Development</span>
              </h4>
              <ul className="space-y-2">
                {(submission.evaluation.areasForImprovement || []).map((imp, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ================= DATASET INSPECTOR DRAWER ================= */}
      {showDatasetDrawer && selectedDataset && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white border-l border-slate-200 p-6 overflow-y-auto space-y-5 shadow-2xl animate-slideLeft">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">{selectedDataset.name}</h3>
              </div>
              <button
                onClick={() => setShowDatasetDrawer(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">{selectedDataset.description}</p>

            {/* Schema Columns */}
            {selectedDataset.columns?.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-slate-500 block">
                  Column Definitions:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {selectedDataset.columns.map((col, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-blue-700 font-bold">{col.name}</span>
                      <span className="text-slate-600">{col.description}</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 font-mono text-[10px]">
                        {col.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Records JSON Snippet */}
            {selectedDataset.sampleData && (
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-slate-500 block">
                  Sample Data Records:
                </span>
                <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedDataset.sampleData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSimulationWorkspace;
