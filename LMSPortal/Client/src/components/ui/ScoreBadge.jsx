import React from 'react';
import { Trophy, Award, CheckCircle2, XCircle, Zap, Star } from 'lucide-react';

const badgeTypes = {
  score: {
    icon: Trophy,
    bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
  },
  pass: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
  },
  fail: {
    icon: XCircle,
    bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
  },
  honor: {
    icon: Award,
    bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
  },
  streak: {
    icon: Zap,
    bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60',
  },
  rating: {
    icon: Star,
    bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs gap-1 rounded-lg',
  md: 'px-3 py-1 text-xs font-semibold gap-1.5 rounded-xl',
  lg: 'px-3.5 py-1.5 text-sm font-bold gap-2 rounded-2xl',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

export const ScoreBadge = ({
  score = null,
  maxScore = null,
  percentage = null,
  type = 'score',
  customLabel = null,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const activeType = badgeTypes[type] || badgeTypes.score;
  const Icon = activeType.icon;

  let label = customLabel;
  if (!label) {
    if (score !== null && maxScore !== null) {
      label = `${score} / ${maxScore}`;
    } else if (percentage !== null) {
      label = `${percentage}%`;
    } else if (score !== null) {
      label = `${score} pts`;
    } else {
      label = type.toUpperCase();
    }
  }

  return (
    <span
      className={`inline-flex items-center border font-mono select-none shadow-xs transition-colors ${
        activeType.bg
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {showIcon && <Icon className={`shrink-0 ${iconSizes[size] || iconSizes.md}`} />}
      <span>{label}</span>
    </span>
  );
};

export default ScoreBadge;
