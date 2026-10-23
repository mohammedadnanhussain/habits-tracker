import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useHabits } from '../hooks/useHabits';
import { useHabitLogs } from '../hooks/useHabitLogs';
import { getWeekDays } from '../lib/dates';
import { StreakMatrix } from '../components/streaks/StreakMatrix';
import { calculateHabitStreaks } from '../lib/streaks';
import { Flame, Trophy } from 'lucide-react';

export const StreakMatrixPage: React.FC = () => {
  const { selectedWeekRefDate, selectedDate, settings } = useApp();
  const { habits } = useHabits();
  const { logs, toggleHabitOnDate } = useHabitLogs();

  const weekDays = getWeekDays(selectedWeekRefDate, settings.weekStartsOn as 0 | 1);
  const activeHabits = habits.filter(h => h.status === 'active');

  return (
    <div className="space-y-6">
      {/* Signature Continuity Rail */}
      <StreakMatrix
        days={weekDays}
        habits={habits}
        logs={logs}
        selectedDate={selectedDate}
        onToggleDate={(h, dateStr) => toggleHabitOnDate(h, dateStr)}
      />

      {/* Streak Leaderboard & Historical Best */}
      <div className="instrument-card rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Trophy size={18} className="text-amber" />
          <h2 className="font-display text-lg font-bold text-ink">Streak Leaderboard &amp; Personal Bests</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeHabits.map(habit => {
            const st = calculateHabitStreaks(habit, logs, selectedDate);
            return (
              <div
                key={habit.id}
                className="instrument-inset rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="font-mono text-[10px] uppercase text-steel font-semibold">
                    {habit.categoryId.replace(/^cat_/, '')}
                  </span>
                  <h3 className="font-display font-bold text-sm text-ink mt-0.5">{habit.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-300/80">
                  <div>
                    <span className="font-mono text-[10px] text-steel">Active Streak</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <Flame size={16} className="text-amber" />
                      <span className="font-display text-xl font-bold text-ink">{st.currentStreak}</span>
                      <span className="font-mono text-xs text-steel">days</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-steel">Personal Best</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <Trophy size={16} className="text-cobalt" />
                      <span className="font-display text-xl font-bold text-ink">{st.longestStreak}</span>
                      <span className="font-mono text-xs text-steel">days</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
