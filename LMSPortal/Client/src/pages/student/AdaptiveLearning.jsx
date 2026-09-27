import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'sonner';
import {
  TrendingUp,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Play,
  RotateCcw,
  Target,
  Terminal,
  FileSpreadsheet,
  Layers,
  BookOpen,
  Briefcase,
  Flame,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import { getCache, setCache } from '../../utils/fastCache';

const AdaptiveLearning = () => {
  const cachedData = getCache('adaptive_learning_data', null) || {};

  const [activeIntervention, setActiveIntervention] = useState(cachedData.activeIntervention || null);
  const [interventionsList, setInterventionsList] = useState(
    cachedData.interventionsList || { active: [], resolved: [], summary: {} }
  );
  const [weaknesses, setWeaknesses] = useState(cachedData.weaknesses || []);
  const [loading, setLoading] = useState(!cachedData.interventionsList);
  const [scanning, setScanning] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const fetchAdaptiveData = async (silent = false) => {
    if (!silent && !activeIntervention && !interventionsList.active?.length) {
      setLoading(true);
    }
    try {
      const [activeRes, allRes, weakRes] = await Promise.all([
        API.get('/adaptive/active').catch(() => ({ data: { intervention: null } })),
        API.get('/adaptive/all').catch(() => ({ data: { active: [], resolved: [], summary: {} } })),
        API.post('/adaptive/scan').catch(() => ({ data: { weaknesses: [] } })),
      ]);

      const actIntervention = activeRes.data?.intervention || null;
      const allInterventions = allRes.data || { active: [], resolved: [], summary: {} };
      const weakList = weakRes.data?.weaknesses || [];

      setActiveIntervention(actIntervention);
      setInterventionsList(allInterventions);
      setWeaknesses(weakList);

      setCache('adaptive_learning_data', {
        activeIntervention: actIntervention,
        interventionsList: allInterventions,
        weaknesses: weakList,
      });
    } catch (err) {
      console.error('Failed to load adaptive learning data:', err);
      toast.error('Failed to load adaptive learning data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdaptiveData(Boolean(cachedData.interventionsList));
  }, []);

  const handleManualScan = async () => {
    setScanning(true);
    try {
      const res = await API.post('/adaptive/scan');
      const wList = res.data?.weaknesses || [];
      setWeaknesses(wList);
      toast.success(`Diagnostic scan completed: ${res.data?.count || wList.length} area(s) evaluated.`);

      // Also refresh active intervention
      const activeRes = await API.get('/adaptive/active');
      const act = activeRes.data?.intervention || null;
      setActiveIntervention(act);

      setCache('adaptive_learning_data', {
        activeIntervention: act,
        interventionsList,
        weaknesses: wList,
      });
    } catch (err) {
      toast.error('Diagnostic scan encountered an error.');
    } finally {
      setScanning(false);
    }
  };

  const handleAdvanceStage = async (interventionId) => {
    setAdvancing(true);
    try {
      const res = await API.post(`/adaptive/interventions/${interventionId}/advance`, {
        score: 85,
        passed: true,
      });

      toast.success(res.data?.message || 'Milestone verified and advanced!');
      await fetchAdaptiveData(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update milestone progress.');
    } finally {
      setAdvancing(false);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'coding_challenge':
        return <Terminal className="w-4 h-4 text-blue-600" />;
      case 'quiz':
        return <Award className="w-4 h-4 text-amber-600" />;
      case 'assignment':
        return <Layers className="w-4 h-4 text-indigo-600" />;
      case 'job_simulation':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case 'lesson':
        return <BookOpen className="w-4 h-4 text-violet-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-600" />;
    }
  };

  if (loading && !activeIntervention && !interventionsList.active?.length) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton variant="card" className="h-32 bg-slate-200/70 rounded-3xl" />
        <Skeleton variant="card" className="h-[400px] bg-slate-200/70 rounded-3xl" />
      </div>
    );
  }

  const currentStage =
    activeIntervention?.stages?.[activeIntervention.currentStageIndex] ||
    activeIntervention?.stages?.[0];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 min-h-screen text-slate-800">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-10 border border-slate-200/90 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-blue-50 border border-blue-200 text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Closed-Loop Dynamic Skill Recovery</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Nova{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Adaptive Remediation
            </span>{' '}
            Engine
          </h1>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            When you struggle with a specific competency, Nova dynamically generates a progressive remediation ladder: from targeted beginner practice, to intermediate challenges, to practical assignments, and final reassessment. Every graduation updates your verified skill scores.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">Active Remediation</span>
              <span className="text-lg font-bold text-blue-600">
                {interventionsList.summary?.activeCount || (activeIntervention ? 1 : 0)} Plan(s)
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">Graduated Turnarounds</span>
              <span className="text-lg font-bold text-emerald-600">
                {interventionsList.summary?.resolvedCount || 0} Resolved
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">Skill Recovery Gain</span>
              <span className="text-lg font-bold text-indigo-600">
                +{interventionsList.summary?.averageScoreImprovement || 0}% Score Delta
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Remediation Ladder Card */}
      {activeIntervention ? (
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 space-y-6 shadow-sm relative overflow-hidden">
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-blue-700">
                  Targeted Remediation In Progress
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getSeverityBadge(
                    activeIntervention.severity
                  )}`}
                >
                  {activeIntervention.severity} Severity
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span>{activeIntervention.skillName}</span>
                <span className="text-sm font-mono text-slate-500 font-normal">
                  (Baseline: {activeIntervention.triggerTelemetry?.initialScore || 0}%)
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleAdvanceStage(activeIntervention._id)}
                disabled={advancing}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs transition-all flex items-center gap-1.5"
                title="Simulate successful completion of current milestone for verification"
              >
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>{advancing ? 'Verifying...' : 'Verify Stage Completion'}</span>
              </button>
            </div>
          </div>

          {/* Trigger Telemetry Diagnostic Banner */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 text-xs space-y-1">
            <div className="flex items-center gap-2 text-blue-700 font-mono font-bold text-[11px] uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Root Cause Diagnosis</span>
            </div>
            <p className="text-slate-700 leading-relaxed font-sans">
              {activeIntervention.detectionReason}
            </p>
          </div>

          {/* 4-Step Remediation Ladder Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold uppercase text-slate-500">
                Progressive Practice Ladder ({activeIntervention.stages?.length || 4} Milestones)
              </span>
              <span className="font-mono text-blue-700 font-bold">
                Step {(activeIntervention.currentStageIndex || 0) + 1} of{' '}
                {activeIntervention.stages?.length || 4}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {(activeIntervention.stages || []).map((st, idx) => {
                const isCompleted = st.status === 'Completed';
                const isActive = idx === activeIntervention.currentStageIndex;

                return (
                  <div
                    key={st._id || idx}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-xs ${
                      isActive
                        ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-300'
                        : isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50/80 border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : isActive
                                ? 'bg-blue-600 text-white font-extrabold'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isCompleted ? <Check className="w-3 h-3" /> : st.stageNumber}
                          </span>
                          <span className={isActive ? 'text-blue-700 font-semibold' : 'text-slate-600'}>
                            {st.stageName}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono uppercase text-slate-500">
                          {st.difficulty}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2">
                        {st.activityTitle}
                      </h4>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {st.objective}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80">
                      {isCompleted ? (
                        <div className="text-[11px] font-mono text-emerald-700 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Passed ({st.earnedScore}%)</span>
                        </div>
                      ) : isActive ? (
                        <Link
                          to={st.activityLink}
                          className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Launch Activity</span>
                        </Link>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Pending Previous Step</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graduation Condition Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-mono font-bold uppercase text-indigo-700 text-[10px] block">
                Reassessment Graduation Criteria:
              </span>
              <p className="text-slate-700">
                {activeIntervention.reassessmentCondition?.description ||
                  'Score >= 75% on the benchmark evaluation to graduate.'}
              </p>
            </div>
            <Link
              to="/student/mentor"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1 shrink-0"
            >
              <span>Consult AI Mentor on Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* No active intervention state */
        <div className="p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Critical Bottlenecks Active</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your demonstrated performance across coding labs, quizzes, and projects is currently meeting standards. Run a diagnostic scan to evaluate emerging skill gaps.
          </p>
          <button
            onClick={handleManualScan}
            disabled={scanning}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Analyzing Submissions...' : 'Run Diagnostic Weakness Scan'}</span>
          </button>
        </div>
      )}

      {/* Weakness Detection Radar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Multi-Signal Weakness Diagnostic Radar</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates recurring assessment failures, low sandbox test pass rates, declining scores, and target role benchmark deficits.
            </p>
          </div>

          <button
            onClick={handleManualScan}
            disabled={scanning}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium shadow-xs transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${scanning ? 'animate-spin' : ''}`} />
            <span>Re-scan Telemetry</span>
          </button>
        </div>

        {(weaknesses || []).length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center text-xs text-slate-500">
            All evaluated skills are performing within expected tolerance limits.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(weaknesses || []).map((w, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded border ${getSeverityBadge(
                      w.severity
                    )}`}
                  >
                    {w.severity} Severity
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    Score: <strong className="text-slate-900">{w.overallScore}%</strong> / Req: {w.requiredScore}%
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{w.skillName}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {w.detectionReason}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-mono text-[10px]">
                    Struggling: {w.strugglingDimension}
                  </span>
                  <Link
                    to="/student/challenges"
                    className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 text-[11px]"
                  >
                    <span>Practice Drill</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Turnaround Showcase */}
      {(interventionsList.resolved || []).length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Graduated Skill Turnarounds</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(interventionsList.resolved || []).map((res, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{res.skillName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      GRADUATED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Baseline: {res.improvement?.baselineScore}% → Final: {res.improvement?.currentScore}%
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-lg text-emerald-600 block">
                    +{res.improvement?.scoreDelta || 0}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    Demonstrated Gain
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdaptiveLearning;
