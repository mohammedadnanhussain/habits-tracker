import React from 'react';
import { Goal } from '../../types/goal';
import { Habit } from '../../types/habit';
import { Trophy, Check, Trash2, Edit } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  habits: Habit[];
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onToggleStatus: (goal: Goal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  habits,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const isDone = goal.status === 'completed';
  const pct = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0;
  const linkedHabits = habits.filter(h => goal.linkedHabitIds?.includes(h.id));

  return (
    <div
      className={`instrument-card rounded-2xl p-4 sm:p-5 space-y-3 transition border ${
        isDone ? 'border-cobalt/60' : 'border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => onToggleStatus(goal)}
            className={`tactile-btn mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border-2 transition ${
              isDone ? 'bg-cobalt border-cobalt text-white' : 'bg-slate-100 border-slate-400 text-transparent'
            }`}
          >
            <Check size={16} strokeWidth={3} className={isDone ? 'opacity-100' : 'opacity-0'} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-steel'
                }`}
              >
                {goal.status.toUpperCase()}
              </span>
              {goal.deadline && (
                <span className="font-mono text-[11px] text-steel">Deadline: {goal.deadline}</span>
              )}
            </div>

            <h3 className={`font-display font-bold text-base mt-1 ${isDone ? 'line-through text-steel' : 'text-ink'}`}>
              {goal.title}
            </h3>

            {goal.description && (
              <p className="text-xs text-steel mt-0.5 leading-relaxed">{goal.description}</p>
            )}

            {/* Target Progress */}
            {goal.targetValue > 1 && (
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full ${isDone ? 'bg-cobalt' : 'bg-amber'} rounded-full transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-ink whitespace-nowrap">
                  {goal.currentValue} / {goal.targetValue} {goal.unit}
                </span>
              </div>
            )}

            {/* Linked habits tags */}
            {linkedHabits.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="font-mono text-[10px] text-steel">Driven by:</span>
                {linkedHabits.map(h => (
                  <span
                    key={h.id}
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-plate border border-slate-300 text-ink"
                  >
                    {h.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="p-1.5 rounded-lg text-steel hover:text-ink hover:bg-slate-200/70"
            title="Edit Goal"
          >
            <Edit size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal)}
            className="p-1.5 rounded-lg text-steel hover:text-red-600 hover:bg-red-50"
            title="Delete Goal"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
