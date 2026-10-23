import React from 'react';
import { getLocalToday, shiftDate, parseLocalDate } from '../../lib/dates';
import { Habit, HabitLog } from '../../types/habit';
import { isHabitScheduledOnDate } from '../../lib/scheduling';
import { isLogCompleted } from '../../lib/streaks';

interface YearHeatmapProps {
  habits: Habit[];
  logs: HabitLog[];
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

export const YearHeatmap: React.FC<YearHeatmapProps> = ({
  habits,
  logs,
  onSelectDate,
  selectedDate,
}) => {
  const today = getLocalToday();
  const logMap = new Map<string, HabitLog>();
  for (const l of logs) {
    logMap.set(`${l.habitId}_${l.localDate}`, l);
  }

  const activeHabits = habits.filter(h => h.status === 'active');

  // Generate 26 weeks (half year) or 52 weeks (full year)
  const totalDays = 182; // 26 weeks
  const dayCells: { date: string; rate: number; isToday: boolean }[] = [];

  for (let i = totalDays - 1; i >= 0; i--) {
    const curDate = shiftDate(today, -i);
    const scheduled = activeHabits.filter(h => isHabitScheduledOnDate(h, curDate));
    const done = scheduled.filter(h => isLogCompleted(h, logMap.get(`${h.id}_${curDate}`))).length;
    const rate = scheduled.length > 0 ? done / scheduled.length : 0;
    dayCells.push({
      date: curDate,
      rate,
      isToday: curDate === today,
    });
  }

  const getHeatmapColor = (rate: number) => {
    if (rate === 0) return 'bg-slate-200';
    if (rate < 0.35) return 'bg-cobalt/30';
    if (rate < 0.7) return 'bg-cobalt/60';
    if (rate < 1.0) return 'bg-cobalt';
    return 'bg-amber'; // 100% completion
  };

  return (
    <div className="instrument-card rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
            ANNUAL CONSISTENCY
          </span>
          <h2 className="font-display text-lg font-bold text-ink mt-0.5">
            Consistency Ledger Heatmap
          </h2>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-steel">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-slate-200"></span>
          <span className="w-2.5 h-2.5 rounded-xs bg-cobalt/30"></span>
          <span className="w-2.5 h-2.5 rounded-xs bg-cobalt/60"></span>
          <span className="w-2.5 h-2.5 rounded-xs bg-cobalt"></span>
          <span className="w-2.5 h-2.5 rounded-xs bg-amber"></span>
          <span>100%</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-[500px]">
          {Array.from({ length: Math.ceil(dayCells.length / 7) }).map((_, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-1">
              {dayCells.slice(colIdx * 7, colIdx * 7 + 7).map(cell => {
                const isSelected = cell.date === selectedDate;
                return (
                  <button
                    key={cell.date}
                    type="button"
                    onClick={() => onSelectDate(cell.date)}
                    title={`${cell.date}: ${Math.round(cell.rate * 100)}% complete`}
                    className={`w-3.5 h-3.5 rounded-xs transition cursor-pointer ${getHeatmapColor(
                      cell.rate
                    )} ${isSelected ? 'ring-2 ring-ink scale-125 z-10' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
