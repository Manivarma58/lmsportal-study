import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'sonner';
import {
  Clock,
  ArrowRight,
  Target,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
} from 'lucide-react';

export const YourNextAction = ({
  action: initialAction = null,
  loading: parentLoading = false,
  className = '',
  onActionChange = null,
}) => {
  const [actionData, setActionData] = useState(initialAction);
  const [queuedActions, setQueuedActions] = useState([]);
  const [loading, setLoading] = useState(parentLoading || !initialAction);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showQueued, setShowQueued] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  // Fetch from GET /recommendations/me if not passed via props or to refresh
  const fetchMyRecommendation = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await API.get('/recommendations/me');
      if (res.data.recommendation) {
        setActionData(res.data.recommendation);
        setQueuedActions(res.data.queuedActions || []);
        if (onActionChange) onActionChange(res.data.recommendation);
      } else {
        setActionData(null);
      }
    } catch (err) {
      console.warn('Failed to fetch recommendation:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (initialAction) {
      setActionData(initialAction);
      setLoading(false);
    } else {
      fetchMyRecommendation();
    }
  }, [initialAction]);

  // Handle Dismiss action
  const handleDismiss = async () => {
    if (!actionData?.id) return;
    setDismissing(true);
    try {
      const res = await API.post(`/recommendations/${actionData.id}/dismiss`);
      toast.info('Task skipped. Next priority action loaded.');
      if (res.data.recommendation) {
        setActionData(res.data.recommendation);
        setQueuedActions(res.data.queuedActions || []);
        if (onActionChange) onActionChange(res.data.recommendation);
      } else {
        await fetchMyRecommendation(true);
      }
    } catch (err) {
      toast.error('Could not dismiss recommendation.');
    } finally {
      setDismissing(false);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-7 animate-pulse ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-36 bg-slate-800 rounded-full"></div>
          <div className="h-4 w-24 bg-slate-800 rounded-full"></div>
        </div>
        <div className="h-7 w-2/3 bg-slate-800 rounded mb-4"></div>
        <div className="h-16 w-full bg-slate-800/60 rounded-2xl mb-4"></div>
        <div className="h-10 w-44 bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  if (!actionData) {
    return (
      <div className={`rounded-3xl bg-slate-900/90 border border-slate-800 p-6 text-center space-y-2 ${className}`}>
        <span className="material-symbols-outlined text-3xl text-emerald-400">task_alt</span>
        <h3 className="text-base font-bold text-white">All Priority Actions Completed</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Your demonstrated skills are currently aligned with your target role benchmarks. Explore advanced projects or coding challenges to push your scores higher.
        </p>
      </div>
    );
  }

  const {
    title,
    reason,
    priority = 'High',
    estimatedDuration = '35 minutes',
    relatedSkill,
    skillName = relatedSkill?.name || 'Technical Competency',
    relatedResource = {},
    explanation = {},
  } = actionData;

  const actionUrl = relatedResource?.actionUrl || actionData.actionUrl || actionData.link || '/student/challenges';
  const buttonText = relatedResource?.buttonText || actionData.buttonText || 'Start Challenge';

  const isCritical = priority?.toLowerCase() === 'critical';
  const isHigh = priority?.toLowerCase() === 'high';

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border ${
        isCritical
          ? 'border-rose-500/50 shadow-xl shadow-rose-950/30'
          : isHigh
          ? 'border-indigo-500/40 shadow-xl shadow-indigo-950/30'
          : 'border-slate-800 shadow-lg'
      } p-6 sm:p-7 transition-all ${className}`}
    >
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

      {/* Top Telemetry Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {/* Pulsing indicator */}
          <span className="flex h-2.5 w-2.5 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                isCritical ? 'bg-rose-400' : isHigh ? 'bg-amber-400' : 'bg-cyan-400'
              } opacity-75`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
            ></span>
          </span>

          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400">
            YOUR NEXT ACTION
          </span>

          {/* Priority Pill */}
          <span
            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
              isCritical
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : isHigh
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
            }`}
          >
            {priority} Priority
          </span>

          {explanation?.ruleTriggered === 'ADAPTIVE_REMEDIATION_PLAN' && (
            <Link
              to="/student/adaptive-learning"
              className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 flex items-center gap-1 transition-all"
            >
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              <span>Adaptive Plan</span>
            </Link>
          )}

          {/* Related Skill Pill */}
          {skillName && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {skillName}
            </span>
          )}
        </div>

        {/* Right Badges & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-850/80 text-slate-300 font-mono text-xs font-semibold border border-slate-700/60">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{estimatedDuration}</span>
          </div>

          <button
            onClick={() => fetchMyRecommendation()}
            title="Refresh recommendation from actual telemetry"
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {actionData.id && (
            <button
              onClick={handleDismiss}
              disabled={dismissing}
              title="Skip this action"
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
            >
              {dismissing ? (
                <span className="w-3 h-3 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Title */}
      <div className="relative z-10 space-y-3">
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
          {title}
        </h3>

        {/* Deterministic Reason Box */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Target className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Why this action was recommended
              </span>
              <button
                type="button"
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1"
              >
                <span>{showExplanation ? 'Hide telemetry details' : 'How this was calculated'}</span>
                {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              "{reason}"
            </p>
          </div>
        </div>

        {/* Expandable Deterministic Explanation Section */}
        {showExplanation && (
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-slate-300 space-y-2.5 animate-fadeIn">
            <div className="flex items-center gap-2 font-mono font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Deterministic Rule Provenance (No Generative Hallucination)
            </div>
            <p className="text-slate-400 leading-relaxed">
              NOVA evaluated your verified coding challenge submissions, quiz attempts, and project milestones against your active target role requirements:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Rule Triggered</span>
                <span className="text-slate-200 font-semibold truncate block">
                  {explanation?.ruleTriggered || 'TARGET_ROLE_GAP'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Demonstrated Score</span>
                <span className="text-amber-400 font-semibold">{explanation?.currentScore ?? 0}%</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Benchmark Required</span>
                <span className="text-emerald-400 font-semibold">{explanation?.targetScore ?? 75}%</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Skill Gap</span>
                <span className="text-rose-400 font-semibold">-{explanation?.gapSize ?? 0} pts</span>
              </div>
            </div>

            {explanation?.historicalTrigger && (
              <p className="text-[11px] text-slate-400 italic pt-1">
                Context: {explanation.historicalTrigger}
              </p>
            )}
          </div>
        )}
      </div>

      {/* CTA Bar */}
      <div className="relative z-10 mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            Resource: <strong className="text-slate-200">{relatedResource?.title || title}</strong>
          </span>
          {queuedActions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowQueued(!showQueued)}
              className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1"
            >
              <span>{queuedActions.length} queued follow-ups</span>
              {showQueued ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        <Link
          to={actionUrl}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-700 hover:from-cyan-500 hover:via-indigo-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>{buttonText}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Queued Follow-Up Actions Accordion */}
      {showQueued && queuedActions.length > 0 && (
        <div className="relative z-10 mt-4 pt-3 border-t border-slate-800/80 space-y-2 animate-fadeIn">
          <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
            Upcoming Action Pipeline
          </span>
          <div className="space-y-2">
            {queuedActions.map((qa, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold text-[10px]">
                      #{idx + 2}
                    </span>
                    <h5 className="font-semibold text-slate-200 truncate">{qa.title}</h5>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {qa.estimatedDuration}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{qa.reason}</p>
                </div>
                <Link
                  to={qa.actionUrl}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs transition-colors shrink-0"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YourNextAction;
