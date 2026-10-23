import React, { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import { useHabits } from '../hooks/useHabits';
import { useHabitLogs } from '../hooks/useHabitLogs';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalForm } from '../components/goals/GoalForm';
import { MilestoneList } from '../components/goals/MilestoneList';
import { Goal } from '../types/goal';
import { Trophy, Plus, Award } from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();
  const { habits } = useHabits();
  const { logs } = useHabitLogs();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  const handleEdit = (g: Goal) => {
    setGoalToEdit(g);
    setIsGoalModalOpen(true);
  };

  const handleToggleStatus = async (g: Goal) => {
    const nextStatus = g.status === 'completed' ? 'active' : 'completed';
    await updateGoal(g.id, {
      status: nextStatus,
      currentValue: nextStatus === 'completed' ? g.targetValue : g.currentValue,
    });
  };

  return (
    <div className="space-y-6">
      {/* Goals Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-amber" />
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
                TARGET OUTCOMES
              </span>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">
                Goals &amp; Habit Targets
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setGoalToEdit(null);
              setIsGoalModalOpen(true);
            }}
            className="tactile-btn px-4 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt-dark text-white font-display font-semibold text-xs sm:text-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Create Target Goal</span>
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="instrument-card rounded-2xl p-8 text-center space-y-2">
            <p className="font-display text-base font-bold text-ink">No target goals established</p>
            <p className="text-xs text-steel">
              Link habits to quantifiable milestone deadlines to accelerate discipline.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                habits={habits}
                onEdit={handleEdit}
                onDelete={g => deleteGoal(g.id)}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Milestones */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Award size={20} className="text-cobalt" />
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
              UNLOCKED ACHIEVEMENTS
            </span>
            <h2 className="font-display text-lg font-bold text-ink">Discipline Milestones</h2>
          </div>
        </div>

        <MilestoneList habits={habits} logs={logs} />
      </div>

      <GoalForm
        isOpen={isGoalModalOpen}
        goalToEdit={goalToEdit}
        habits={habits}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={async data => {
          if (goalToEdit) await updateGoal(goalToEdit.id, data);
          else await addGoal(data);
        }}
      />
    </div>
  );
};
