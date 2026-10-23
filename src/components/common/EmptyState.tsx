import React from 'react';
import { PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="instrument-inset rounded-2xl p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-cobalt/15 text-cobalt flex items-center justify-center mx-auto">
        <PlusCircle size={28} />
      </div>
      <div>
        <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
        <p className="text-xs sm:text-sm text-steel mt-1 max-w-md mx-auto leading-relaxed">{description}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="tactile-btn px-4 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt-dark text-white font-display font-semibold text-xs sm:text-sm"
          >
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="tactile-btn px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-ink font-mono text-xs font-semibold"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
