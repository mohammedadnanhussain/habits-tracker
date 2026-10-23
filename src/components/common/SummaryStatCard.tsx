import React from 'react';

interface SummaryStatCardProps {
  label: string;
  badge?: React.ReactNode;
  value: React.ReactNode;
  unit?: string;
  subValue?: React.ReactNode;
  footer?: React.ReactNode;
  progressBar?: {
    percent: number;
    color?: string;
  };
}

export const SummaryStatCard: React.FC<SummaryStatCardProps> = ({
  label,
  badge,
  value,
  unit,
  subValue,
  footer,
  progressBar,
}) => {
  return (
    <div className="instrument-card rounded-2xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-steel font-semibold truncate">
          {label}
        </span>
        {badge}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline">
          <span className="font-display text-2xl sm:text-3xl font-bold text-ink">{value}</span>
          {unit && <span className="font-mono text-xs text-steel ml-1">{unit}</span>}
        </div>
        {subValue && <div>{subValue}</div>}
      </div>

      {progressBar && (
        <div className="w-full h-2 rounded-full bg-slate-200 mt-3 overflow-hidden">
          <div
            className={`h-full ${progressBar.color || 'bg-cobalt'} transition-all duration-300 rounded-full`}
            style={{ width: `${Math.min(100, Math.max(0, progressBar.percent))}%` }}
          />
        </div>
      )}

      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
};
