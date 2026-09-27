import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Layers,
  Code,
  BookOpen,
  Award,
} from 'lucide-react';
import ProgressBar from './ProgressBar';

const levelStyles = {
  Beginner: {
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300/80 dark:border-slate-700',
    barColor: 'indigo',
    dot: 'bg-slate-400',
  },
  Intermediate: {
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    barColor: 'cyan',
    dot: 'bg-blue-500',
  },
  Advanced: {
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    barColor: 'emerald',
    dot: 'bg-emerald-500',
  },
  Expert: {
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    barColor: 'purple',
    dot: 'bg-purple-500',
  },
};

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

export const SkillProgress = ({
  skill = {},
  variant = 'detailed', // 'detailed' | 'compact' | 'card'
  showBreakdown = true,
  onClick = null,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);

  const name = skill.skill?.name || skill.name || 'Core Engineering Competency';
  const category = skill.skill?.category || skill.category || 'Technology';
  const score = Math.min(100, Math.max(0, Math.round(Number(skill.overallScore ?? skill.score ?? 0))));
  const level = skill.proficiencyLevel || 'Beginner';
  const trend = skill.trend || 'new';
  const evidenceCount = skill.evidenceCount || (Array.isArray(skill.evidence) ? skill.evidence.length : 0);
  const confidence = skill.confidenceLevel || 'Low';

  const knowledgeScore = skill.knowledgeScore ?? 0;
  const practicalScore = skill.practicalScore ?? 0;
  const projectScore = skill.projectScore ?? 0;
  const assessmentScore = skill.assessmentScore ?? 0;

  const activeLevel = levelStyles[level] || levelStyles.Beginner;
  const activeTrend = trendIcons[trend] || trendIcons.steady;
  const TrendIcon = activeTrend.icon;

  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-between gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 transition-all hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-xs ${
          onClick ? 'cursor-pointer' : ''
        } ${className}`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${activeLevel.dot}`} />
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {name}
            </h4>
          </div>
          <div className="mt-1.5 w-full">
            <ProgressBar value={score} max={100} size="xs" color={activeLevel.barColor} />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
            {score}%
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider ${activeLevel.badge}`}
          >
            {level}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 sm:p-6 transition-all hover:shadow-md ${className}`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold">
              {category}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1">
              <TrendIcon className={`w-3.5 h-3.5 ${activeTrend.className}`} />
              <span className={`text-[11px] font-mono font-medium ${activeTrend.className}`}>
                {activeTrend.label}
              </span>
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {name}
          </h3>
        </div>

        {/* Level Badge */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border uppercase tracking-wider shadow-xs ${activeLevel.badge}`}
          >
            {level}
          </span>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            Confidence: {confidence}
          </span>
        </div>
      </div>

      {/* Main Score Progress Bar */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Demonstrated Mastery</span>
          <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
            {score}%
          </span>
        </div>
        <ProgressBar
          value={score}
          max={100}
          size="md"
          color={activeLevel.barColor}
          glow={level === 'Expert' || level === 'Advanced'}
        />
      </div>

      {/* Evidence & Breakdown Toggle */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <span>
            {evidenceCount} verified {evidenceCount === 1 ? 'assessment' : 'assessments'}
          </span>
        </div>

        {showBreakdown && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold cursor-pointer"
          >
            <span>Dimensions</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>

      {/* Expandable 4-Dimension Performance Breakdown */}
      {showBreakdown && expanded && (
        <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in duration-200">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[11px] font-medium">Knowledge</span>
            </div>
            <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              {knowledgeScore}%
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 mb-1">
              <Code className="w-3.5 h-3.5 text-cyan-500" />
              <span className="text-[11px] font-medium">Practical</span>
            </div>
            <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              {practicalScore}%
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 mb-1">
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-[11px] font-medium">Project</span>
            </div>
            <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              {projectScore}%
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 mb-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-medium">Assessment</span>
            </div>
            <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              {assessmentScore}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillProgress;
