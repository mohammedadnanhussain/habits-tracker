import React from 'react';
import { Milestone } from '../../types/goal';
import { Habit, HabitLog } from '../../types/habit';
import { calculateHabitStreaks } from '../../lib/streaks';
import { Trophy, Award, Flame, Calendar, Star } from 'lucide-react';

interface MilestoneListProps {
  habits: Habit[];
  logs: HabitLog[];
}

export const MilestoneList: React.FC<MilestoneListProps> = ({ habits, logs }) => {
  // Compute unlocked milestones dynamically from real data
  let totalCompletions = 0;
  let maxStreak = 0;
  for (const h of habits) {
    const st = calculateHabitStreaks(h, logs);
    if (st.longestStreak > maxStreak) maxStreak = st.longestStreak;
    totalCompletions += st.totalCompletions;
  }

  const badges = [
    {
      id: 'first_ritual',
      title: 'First Ritual Configured',
      description: 'Added your first personal daily habit.',
      unlocked: habits.length >= 1,
      icon: Star,
    },
    {
      id: 'first_checkin',
      title: 'First Log Recorded',
      description: 'Completed your first daily ritual check-in.',
      unlocked: totalCompletions >= 1,
      icon: Award,
    },
    {
      id: 'streak_3',
      title: '3-Day Momentum',
      description: 'Maintained an unbroken 3-day ritual streak.',
      unlocked: maxStreak >= 3,
      icon: Flame,
    },
    {
      id: 'streak_7',
      title: 'Full 7-Day Bridge',
      description: 'Fused consecutive daily logs into a full 7-day continuity rail.',
      unlocked: maxStreak >= 7,
      icon: Trophy,
    },
    {
      id: 'streak_14',
      title: 'Fortnight Mastery',
      description: 'Built a 14-day unbroken discipline streak.',
      unlocked: maxStreak >= 14,
      icon: Flame,
    },
    {
      id: 'total_50',
      title: '50 Total Check-ins',
      description: 'Reached 50 cumulative completions across all active rituals.',
      unlocked: totalCompletions >= 50,
      icon: Award,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {badges.map(b => {
        const Icon = b.icon;
        return (
          <div
            key={b.id}
            className={`instrument-card rounded-2xl p-4 border transition flex items-start gap-3.5 ${
              b.unlocked ? 'border-amber/50 bg-white' : 'border-slate-300 opacity-60 bg-plate'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                b.unlocked
                  ? 'bg-amber/15 text-amber-900 border-amber/30'
                  : 'bg-slate-200 text-steel border-slate-300'
              }`}
            >
              <Icon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-bold text-sm text-ink">{b.title}</h4>
                {b.unlocked && (
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber text-ink uppercase">
                    Unlocked
                  </span>
                )}
              </div>
              <p className="text-xs text-steel mt-0.5 leading-relaxed">{b.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
