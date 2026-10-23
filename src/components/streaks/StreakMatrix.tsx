import React from 'react';
import { DayInfo } from '../../lib/dates';
import { Habit, HabitLog } from '../../types/habit';
import { isLogCompleted, getLogCompletionRatio, getWeekStreakRun } from '../../lib/streaks';

interface StreakMatrixProps {
  days: DayInfo[];
  habits: Habit[];
  logs: HabitLog[];
  selectedDate: string;
  onToggleDate: (habit: Habit, dateStr: string) => void;
}

export const StreakMatrix: React.FC<StreakMatrixProps> = ({
  days,
  habits,
  logs,
  selectedDate,
  onToggleDate,
}) => {
  const logMap = new Map<string, HabitLog>();
  for (const l of logs) {
    logMap.set(`${l.habitId}_${l.localDate}`, l);
  }

  const activeHabits = habits.filter(h => h.status === 'active');
  let totalBridges = 0;

  return (
    <div className="instrument-card rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber"></span>
            <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
              SIGNATURE // CONTINUITY RAIL
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-ink mt-0.5">
            7-Day Streak Bridge Matrix
          </h2>
        </div>
        <span className="font-mono text-[11px] text-steel bg-slate-200/70 px-2 py-1 rounded">
          Click any node to toggle
        </span>
      </div>

      <p className="text-xs text-steel leading-relaxed">
        Consecutive daily completions fuse into an illuminated continuity bridge. Keep chains unbroken through Sunday to lock a full-week badge.
      </p>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[340px] space-y-2.5">
          {/* Header Row */}
          <div className="grid grid-cols-12 items-center gap-1 pb-1.5 border-b border-slate-200 font-mono text-[10px] text-steel uppercase tracking-wider">
            <div className="col-span-4">Ritual</div>
            <div className="col-span-6 grid grid-cols-7 text-center">
              {days.map(d => (
                <span
                  key={d.date}
                  className={d.date === selectedDate ? 'text-cobalt font-bold underline' : ''}
                >
                  {d.short[0]}
                </span>
              ))}
            </div>
            <div className="col-span-2 text-right">Chain</div>
          </div>

          {/* Habit Rows */}
          {activeHabits.map(habit => {
            const weekStreak = getWeekStreakRun(habit, days, logMap);

            return (
              <div
                key={habit.id}
                className="grid grid-cols-12 items-center gap-1 py-1 border-b border-slate-200/60 last:border-none"
              >
                {/* Habit Name & Category */}
                <div className="col-span-4 pr-2 min-w-0">
                  <p className="font-sans text-xs font-semibold text-ink truncate" title={habit.name}>
                    {habit.name}
                  </p>
                  <span className="font-mono text-[10px] text-steel">
                    {habit.categoryId.replace(/^cat_/, '').toUpperCase()}
                  </span>
                </div>

                {/* 7 Days Cells with Bridges */}
                <div className="col-span-6 grid grid-cols-7 items-center">
                  {days.map((d, idx) => {
                    const log = logMap.get(`${habit.id}_${d.date}`);
                    const done = isLogCompleted(habit, log);
                    const ratio = getLogCompletionRatio(habit, log);
                    const nextDay = idx < days.length - 1 ? days[idx + 1] : null;
                    const nextLog = nextDay ? logMap.get(`${habit.id}_${nextDay.date}`) : undefined;
                    const nextDone = nextDay ? isLogCompleted(habit, nextLog) : false;

                    const hasBridge = done && nextDone;
                    if (hasBridge) totalBridges++;

                    const bridgeClass = hasBridge
                      ? weekStreak >= 5
                        ? 'streak-bridge-amber'
                        : 'streak-bridge-active'
                      : 'hidden';

                    let nodeStyle = 'bg-white border-slate-300 text-steel hover:border-cobalt';
                    if (done) {
                      nodeStyle = 'bg-cobalt border-cobalt text-white shadow-xs';
                    } else if (ratio > 0) {
                      nodeStyle = 'bg-amber border-amber text-ink font-bold';
                    }

                    const selectedRing = d.date === selectedDate ? 'ring-2 ring-ink/30' : '';

                    return (
                      <div key={d.date} className="relative flex items-center justify-center py-1">
                        <div className={`streak-bridge ${bridgeClass}`} />
                        <button
                          type="button"
                          onClick={() => onToggleDate(habit, d.date)}
                          title={`${habit.name} — ${d.fullLabel}: ${log?.value || 0}/${habit.target} ${habit.unit}`}
                          className={`streak-cell w-6 h-6 rounded-full border text-[10px] font-mono font-bold flex items-center justify-center cursor-pointer ${nodeStyle} ${selectedRing}`}
                        >
                          {done ? '✓' : ratio > 0 ? '•' : ''}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Chain Badge */}
                <div className="col-span-2 text-right">
                  <span
                    className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                      weekStreak >= 5
                        ? 'bg-amber/20 text-amber-900'
                        : weekStreak >= 3
                          ? 'bg-cobalt/15 text-cobalt'
                          : 'bg-slate-200 text-steel'
                    }`}
                  >
                    {weekStreak}d
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Legend */}
      <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-steel">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cobalt inline-block"></span> Goal Met
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber inline-block"></span> Partial
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border border-slate-400 bg-white inline-block"></span> Unlogged
          </span>
        </div>
        <span className="font-bold text-ink">
          {totalBridges} active bridge{totalBridges === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
};
