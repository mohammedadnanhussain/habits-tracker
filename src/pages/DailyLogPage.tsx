import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useHabits } from '../hooks/useHabits';
import { useHabitLogs } from '../hooks/useHabitLogs';
import { isHabitScheduledOnDate } from '../lib/scheduling';
import { calculateHabitStreaks } from '../lib/streaks';
import { getWeekDays, parseLocalDate, shiftDate } from '../lib/dates';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitForm } from '../components/habits/HabitForm';
import { HabitFilters } from '../components/habits/HabitFilters';
import { WeekSelector } from '../components/calendar/WeekSelector';
import { Habit } from '../types/habit';
import { Check, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';

export const DailyLogPage: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    selectedWeekRefDate,
    setSelectedWeekRefDate,
    jumpToToday,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    settings,
    todayDateStr,
  } = useApp();

  const { habits, addHabit, updateHabit, deleteHabit } = useHabits();
  const { logs, toggleHabitOnDate, stepHabitValue, markAllScheduledComplete } = useHabitLogs();

  const [searchQuery, setSearchQuery] = useState('');
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const weekDays = getWeekDays(selectedWeekRefDate, settings.weekStartsOn as 0 | 1);
  const activeHabits = habits.filter(h => h.status === 'active');
  const scheduledHabits = activeHabits.filter(h => isHabitScheduledOnDate(h, selectedDate));

  const logMap = new Map();
  for (const l of logs) {
    if (l.localDate === selectedDate) {
      logMap.set(l.habitId, l);
    }
  }

  const filteredHabits = scheduledHabits.filter(h => {
    if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== 'all' && h.categoryId !== categoryFilter) return false;
    const l = logMap.get(h.id);
    const isDone = l?.completionStatus === 'completed';
    if (statusFilter === 'pending' && isDone) return false;
    if (statusFilter === 'done' && !isDone) return false;
    return true;
  });

  const parsedDate = parseLocalDate(selectedDate);
  const fullLabel = format(parsedDate, 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-5">
      {/* Header Deck */}
      <div className="instrument-card rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cobalt"></span>
              <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
                DEDICATED LOGGING DECK
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink mt-0.5">
              {fullLabel}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
              className="tactile-btn p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-ink"
              title="Previous Day"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={jumpToToday}
              className="tactile-btn px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-ink font-mono text-xs font-semibold"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
              className="tactile-btn p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-ink"
              title="Next Day"
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => markAllScheduledComplete(scheduledHabits, selectedDate)}
              className="tactile-btn px-3.5 py-2 rounded-xl bg-ink hover:bg-slate-800 text-white font-mono text-xs font-semibold flex items-center gap-1.5"
            >
              <Check size={14} className="text-cobalt" strokeWidth={2.5} />
              <span>Mark All Done</span>
            </button>
          </div>
        </div>

        {/* 7-Day Navigation Strip */}
        <WeekSelector
          days={weekDays}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          habits={habits}
          logs={logs}
          onJumpToday={jumpToToday}
          todayDateStr={todayDateStr}
        />

        {/* Search & Filters */}
        <div className="space-y-3 pt-2">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search rituals by name or cue..."
              className="w-full bg-white rounded-xl pl-9 pr-4 py-2 text-sm text-ink border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cobalt placeholder-steel"
            />
          </div>

          <HabitFilters
            selectedCategory={categoryFilter}
            onSelectCategory={setCategoryFilter}
            selectedStatus={statusFilter}
            onSelectStatus={setStatusFilter}
          />
        </div>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        {filteredHabits.length === 0 ? (
          <div className="instrument-card rounded-2xl p-8 text-center space-y-2">
            <p className="font-display text-base font-bold text-ink">No rituals match your criteria</p>
            <p className="text-xs text-steel">Clear your search query or switch category filters.</p>
          </div>
        ) : (
          filteredHabits.map(habit => {
            const log = logMap.get(habit.id);
            const streaks = calculateHabitStreaks(habit, logs, todayDateStr);
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                log={log}
                selectedDate={selectedDate}
                streak={streaks.currentStreak}
                onToggle={h => toggleHabitOnDate(h, selectedDate)}
                onStep={(h, dir) => stepHabitValue(h, selectedDate, dir)}
                onEdit={h => {
                  setHabitToEdit(h);
                  setIsHabitModalOpen(true);
                }}
                onDelete={h => deleteHabit(h.id)}
              />
            );
          })
        )}
      </div>

      <HabitForm
        isOpen={isHabitModalOpen}
        habitToEdit={habitToEdit}
        onClose={() => setIsHabitModalOpen(false)}
        onSave={async data => {
          if (habitToEdit) await updateHabit(habitToEdit.id, data);
          else await addHabit(data);
        }}
      />
    </div>
  );
};
