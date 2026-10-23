import React from 'react';
import { DayInfo } from '../../lib/dates';
import { Habit, HabitLog } from '../../types/habit';
import { isHabitScheduledOnDate } from '../../lib/scheduling';
import { isLogCompleted } from '../../lib/streaks';

interface WeekSelectorProps {
  days: DayInfo[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  habits: Habit[];
  logs: HabitLog[];
  onJumpToday: () => void;
  todayDateStr: string;
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({
  days,
  selectedDate,
  onSelectDate,
  habits,
  logs,
  onJumpToday,
  todayDateStr,
}) => {
  const logMap = new Map<string, HabitLog>();
  for (const l of logs) {
    logMap.set(`${l.habitId}_${l.localDate}`, l);
  }

  const activeHabits = habits.filter(h => h.status === 'active');

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] text-steel uppercase tracking-wider">
          Select Day to Log or Inspect
        </span>
        <button
          type="button"
          onClick={onJumpToday}
          className="font-mono text-[11px] font-semibold text-cobalt hover:underline cursor-pointer"
        >
          Jump to Today
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map(d => {
          const isSelected = d.date === selectedDate;
          const scheduledHabits = activeHabits.filter(h => isHabitScheduledOnDate(h, d.date));
          const totalScheduled = scheduledHabits.length;
          const doneCount = scheduledHabits.filter(h => isLogCompleted(h, logMap.get(`${h.id}_${d.date}`))).length;
          const isPerfect = totalScheduled > 0 && doneCount === totalScheduled;

          const baseClasses = isSelected
            ? 'bg-ink text-white border-ink shadow-md ring-2 ring-cobalt/40'
            : 'bg-white hover:bg-slate-100 text-ink border-slate-300';

          const badgeColor = isPerfect
            ? 'bg-amber text-ink font-bold'
            : doneCount > 0
              ? isSelected
                ? 'bg-cobalt text-white'
                : 'bg-cobalt/15 text-cobalt font-semibold'
              : isSelected
                ? 'bg-slate-700 text-slate-300'
                : 'bg-slate-100 text-steel';

          return (
            <button
              key={d.date}
              type="button"
              onClick={() => onSelectDate(d.date)}
              className={`tactile-btn rounded-xl p-2 border flex flex-col items-center justify-between transition cursor-pointer ${baseClasses}`}
            >
              <div className="flex items-center gap-1">
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider ${
                    isSelected ? 'text-slate-300' : 'text-steel'
                  }`}
                >
                  {d.short}
                </span>
                {d.date === todayDateStr && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber" title="Today"></span>
                )}
              </div>

              <span className="font-display text-base sm:text-lg font-bold my-0.5">{d.dayNum}</span>

              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${badgeColor}`}>
                {doneCount}/{totalScheduled}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
