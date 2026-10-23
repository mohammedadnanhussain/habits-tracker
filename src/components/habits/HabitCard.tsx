import React from 'react';
import { Habit, HabitLog } from '../../types/habit';
import { isLogCompleted, getLogCompletionRatio } from '../../lib/streaks';
import { Check, Edit, Trash2, Clock, CheckCircle } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  selectedDate: string;
  streak: number;
  onToggle: (habit: Habit) => void;
  onStep: (habit: Habit, direction: 1 | -1) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  log,
  selectedDate,
  streak,
  onToggle,
  onStep,
  onEdit,
  onDelete,
}) => {
  const isDone = isLogCompleted(habit, log);
  const ratio = getLogCompletionRatio(habit, log);
  const pct = Math.min(100, Math.round(ratio * 100));
  const currentVal = Number(log?.value || 0);
  const targetVal = Number(habit.target || 1);

  const getCategoryBadgeClass = (catId: string) => {
    const c = catId.toLowerCase();
    if (c.includes('body')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (c.includes('mind')) return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    if (c.includes('craft')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (c.includes('rest')) return 'bg-amber-100 text-amber-900 border-amber-300';
    return 'bg-slate-200 text-slate-700 border-slate-300';
  };

  const getCategoryName = (catId: string) => {
    return catId.replace(/^cat_/, '').toUpperCase();
  };

  const cardBorder = isDone
    ? 'border-cobalt/60 bg-white shadow-xs'
    : 'border-slate-300 bg-white/90 hover:border-slate-400';

  return (
    <div className={`rounded-xl border ${cardBorder} p-3.5 sm:p-4 transition-all duration-200`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left: Check button & info */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onToggle(habit)}
            aria-label={`Toggle ${habit.name}`}
            className={`tactile-btn mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border-2 transition ${
              isDone
                ? 'bg-cobalt border-cobalt text-white shadow-xs'
                : 'bg-slate-100 border-slate-400 text-transparent hover:border-cobalt'
            }`}
          >
            <Check size={16} strokeWidth={3} className={isDone ? 'opacity-100' : 'opacity-0'} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${getCategoryBadgeClass(
                  habit.categoryId
                )}`}
              >
                {getCategoryName(habit.categoryId)}
              </span>

              <span
                className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                  streak >= 5 ? 'bg-amber/20 text-amber-900 font-bold' : 'bg-slate-200/80 text-steel'
                }`}
              >
                {streak}d streak
              </span>

              {habit.triggerCue && (
                <span className="font-mono text-[11px] text-steel truncate max-w-[200px]" title={habit.triggerCue}>
                  {habit.triggerCue}
                </span>
              )}
            </div>

            <h3
              className={`font-display font-bold text-sm sm:text-base mt-1 ${
                isDone ? 'line-through text-steel' : 'text-ink'
              }`}
            >
              {habit.name}
            </h3>

            {/* Quantified / Counter / Duration Progress */}
            {habit.trackingType !== 'binary' && habit.trackingType !== 'avoidance' && (
              <div className="mt-2.5 flex items-center gap-2.5 max-w-sm">
                <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full ${isDone ? 'bg-cobalt' : 'bg-amber'} transition-all duration-200 rounded-full`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-ink whitespace-nowrap">
                  {currentVal} / {targetVal} {habit.unit}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls & actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {habit.trackingType !== 'binary' && habit.trackingType !== 'avoidance' ? (
            <div className="instrument-inset rounded-lg p-0.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => onStep(habit, -1)}
                className="tactile-btn w-7 h-7 rounded-md bg-white hover:bg-slate-100 text-ink font-mono text-sm font-bold flex items-center justify-center border border-slate-300"
                title={`Decrease by ${habit.step} ${habit.unit}`}
              >
                &minus;
              </button>
              <button
                type="button"
                onClick={() => onStep(habit, 1)}
                className="tactile-btn px-2 h-7 rounded-md bg-cobalt hover:bg-cobalt-dark text-white font-mono text-xs font-bold flex items-center justify-center"
                title={`Add ${habit.step} ${habit.unit}`}
              >
                +{habit.step}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onToggle(habit)}
              className={`tactile-btn px-2.5 py-1 rounded-lg font-mono text-xs font-semibold border ${
                isDone
                  ? 'bg-cobalt/10 text-cobalt border-cobalt/30'
                  : 'bg-slate-100 text-steel border-slate-300 hover:text-ink'
              }`}
            >
              {isDone ? 'Logged' : 'Log Now'}
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(habit)}
            className="p-1.5 rounded-lg text-steel hover:text-ink hover:bg-slate-200/70 transition"
            title="Configure Goal"
          >
            <Edit size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(habit)}
            className="p-1.5 rounded-lg text-steel hover:text-red-600 hover:bg-red-50 transition"
            title="Remove Goal"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
