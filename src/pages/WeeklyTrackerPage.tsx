import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useHabits } from '../hooks/useHabits';
import { useHabitLogs } from '../hooks/useHabitLogs';
import { getWeekDays, getWeekMetadata, shiftDate } from '../lib/dates';
import { isHabitScheduledOnDate } from '../lib/scheduling';
import { isLogCompleted, getLogCompletionRatio } from '../lib/streaks';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const WeeklyTrackerPage: React.FC = () => {
  const { selectedWeekRefDate, setSelectedWeekRefDate, settings, todayDateStr } = useApp();
  const { habits } = useHabits();
  const { logs, toggleHabitOnDate } = useHabitLogs();

  const weekDays = getWeekDays(selectedWeekRefDate, settings.weekStartsOn as 0 | 1);
  const weekMeta = getWeekMetadata(selectedWeekRefDate, settings.weekStartsOn as 0 | 1);

  const prevWeek = () => setSelectedWeekRefDate(shiftDate(selectedWeekRefDate, -7));
  const nextWeek = () => setSelectedWeekRefDate(shiftDate(selectedWeekRefDate, 7));

  const logMap = new Map();
  for (const l of logs) {
    logMap.set(`${l.habitId}_${l.localDate}`, l);
  }

  const activeHabits = habits.filter(h => h.status === 'active');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="instrument-card rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
            MULTI-HABIT SPREAD
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink mt-0.5">
            Weekly Habit Ledger
          </h1>
          <p className="font-mono text-xs text-steel mt-0.5">{weekMeta.rangeText}</p>
        </div>

        <div className="instrument-inset rounded-xl p-1 flex items-center gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={prevWeek}
            className="tactile-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold text-ink hover:bg-white/80 flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>
          <span className="px-3 py-1 font-mono text-xs font-bold text-ink">
            {weekMeta.id}
          </span>
          <button
            type="button"
            onClick={nextWeek}
            className="tactile-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold text-ink hover:bg-white/80 flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="instrument-card rounded-2xl p-4 sm:p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-200 font-mono text-xs text-steel uppercase tracking-wider">
              <th className="py-3 px-3 font-semibold">Habit / Ritual</th>
              <th className="py-3 px-2 font-semibold">Pillar</th>
              {weekDays.map(d => (
                <th key={d.date} className="py-3 px-2 text-center font-semibold">
                  <div>{d.short}</div>
                  <div className={`text-xs ${d.date === todayDateStr ? 'text-amber font-bold' : ''}`}>
                    {d.dayNum}
                  </div>
                </th>
              ))}
              <th className="py-3 px-3 text-right font-semibold">Week Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 font-mono text-xs">
            {activeHabits.map(habit => {
              let weekDone = 0;
              let weekScheduled = 0;

              const cells = weekDays.map(d => {
                const isScheduled = isHabitScheduledOnDate(habit, d.date);
                if (isScheduled) weekScheduled++;

                const log = logMap.get(`${habit.id}_${d.date}`);
                const isDone = isLogCompleted(habit, log);
                const ratio = getLogCompletionRatio(habit, log);

                if (isDone) weekDone++;

                return (
                  <td key={d.date} className="py-2.5 px-2 text-center">
                    {isScheduled ? (
                      <button
                        type="button"
                        onClick={() => toggleHabitOnDate(habit, d.date)}
                        className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center border font-bold transition ${
                          isDone
                            ? 'bg-cobalt border-cobalt text-white shadow-xs'
                            : ratio > 0
                              ? 'bg-amber border-amber text-ink'
                              : 'bg-white border-slate-300 text-steel hover:border-cobalt'
                        }`}
                      >
                        {isDone ? <Check size={14} strokeWidth={3} /> : ratio > 0 ? '•' : ''}
                      </button>
                    ) : (
                      <span className="text-slate-300 text-[10px]">—</span>
                    )}
                  </td>
                );
              });

              const rate = weekScheduled > 0 ? Math.round((weekDone / weekScheduled) * 100) : 0;

              return (
                <tr key={habit.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-sans font-semibold text-ink">
                    <div>{habit.name}</div>
                    {habit.triggerCue && (
                      <div className="font-mono text-[10px] text-steel">{habit.triggerCue}</div>
                    )}
                  </td>
                  <td className="py-3 px-2 text-steel">
                    <span className="px-2 py-0.5 rounded bg-plate border border-slate-300 text-[10px]">
                      {habit.categoryId.replace(/^cat_/, '').toUpperCase()}
                    </span>
                  </td>
                  {cells}
                  <td className="py-3 px-3 text-right font-bold">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        rate >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-steel'
                      }`}
                    >
                      {weekDone}/{weekScheduled} ({rate}%)
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
