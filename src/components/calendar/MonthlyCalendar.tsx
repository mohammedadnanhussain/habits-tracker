import React, { useState } from 'react';
import { getMonthDaysGrid, getLocalToday, parseLocalDate } from '../../lib/dates';
import { Habit, HabitLog } from '../../types/habit';
import { isHabitScheduledOnDate } from '../../lib/scheduling';
import { isLogCompleted } from '../../lib/streaks';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface MonthlyCalendarProps {
  habits: Habit[];
  logs: HabitLog[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  habits,
  logs,
  selectedDate,
  onSelectDate,
}) => {
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());

  const daysGrid = getMonthDaysGrid(currentYear, currentMonth, 1);
  const logMap = new Map<string, HabitLog>();
  for (const l of logs) {
    logMap.set(`${l.habitId}_${l.localDate}`, l);
  }

  const activeHabits = habits.filter(h => h.status === 'active');

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const monthLabel = format(new Date(currentYear, currentMonth, 1), 'MMMM yyyy');

  return (
    <div className="instrument-card rounded-2xl p-4 sm:p-6 space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
            MONTHLY CALENDAR
          </span>
          <h2 className="font-display text-lg sm:text-xl font-bold text-ink mt-0.5">
            {monthLabel}
          </h2>
        </div>
        <div className="instrument-inset rounded-xl p-1 flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="tactile-btn p-1.5 rounded-lg text-ink hover:bg-white/80"
            title="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="tactile-btn p-1.5 rounded-lg text-ink hover:bg-white/80"
            title="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-steel font-semibold uppercase">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {daysGrid.map(d => {
          const isSelected = d.date === selectedDate;
          const scheduled = activeHabits.filter(h => isHabitScheduledOnDate(h, d.date));
          const totalScheduled = scheduled.length;
          const doneCount = scheduled.filter(h => isLogCompleted(h, logMap.get(`${h.id}_${d.date}`))).length;
          const rate = totalScheduled > 0 ? Math.round((doneCount / totalScheduled) * 100) : 0;
          const isAllClear = totalScheduled > 0 && doneCount === totalScheduled;

          let bgBadge = 'bg-slate-100 text-steel';
          if (isAllClear) {
            bgBadge = 'bg-amber text-ink font-bold';
          } else if (doneCount > 0) {
            bgBadge = 'bg-cobalt/15 text-cobalt font-semibold';
          }

          return (
            <button
              key={d.date}
              type="button"
              onClick={() => onSelectDate(d.date)}
              className={`tactile-btn p-2 rounded-xl border flex flex-col items-center justify-between min-h-[58px] transition cursor-pointer ${
                isSelected
                  ? 'bg-ink text-white border-ink ring-2 ring-cobalt/40 shadow-md'
                  : d.isCurrentMonth
                    ? 'bg-white text-ink border-slate-300 hover:bg-slate-100'
                    : 'bg-slate-100/50 text-steel/60 border-transparent hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-xs font-bold">{d.dayNumber}</span>
                {d.isToday && <span className="w-1.5 h-1.5 rounded-full bg-amber" title="Today"></span>}
              </div>

              {d.isCurrentMonth && totalScheduled > 0 && (
                <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${bgBadge}`}>
                  {doneCount}/{totalScheduled}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
