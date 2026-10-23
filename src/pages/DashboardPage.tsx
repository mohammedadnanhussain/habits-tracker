import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useHabits } from '../hooks/useHabits';
import { useHabitLogs } from '../hooks/useHabitLogs';
import { useLiveClock } from '../hooks/useLiveClock';
import {
  getWeekDays,
  getWeekMetadata,
  parseLocalDate,
  shiftDate,
  DayInfo,
} from '../lib/dates';
import { computeTelemetrySummary, computeDailyDeckMetrics } from '../lib/analytics';
import { isHabitScheduledOnDate } from '../lib/scheduling';
import { calculateHabitStreaks } from '../lib/streaks';
import { SummaryStatCard } from '../components/common/SummaryStatCard';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitForm } from '../components/habits/HabitForm';
import { HabitFilters } from '../components/habits/HabitFilters';
import { QuickAddForm } from '../components/habits/QuickAddForm';
import { WeekSelector } from '../components/calendar/WeekSelector';
import { StreakMatrix } from '../components/streaks/StreakMatrix';
import { WeeklyStreakChart } from '../components/analytics/WeeklyStreakChart';
import { DailyReflectionCard } from '../components/reflections/DailyReflectionCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { seedSampleHabits } from '../lib/db';
import { Habit } from '../types/habit';
import { Plus, Check, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export const DashboardPage: React.FC = () => {
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
  const clock = useLiveClock();

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Compute 7 days for current selected week
  const weekDays = getWeekDays(selectedWeekRefDate, settings.weekStartsOn as 0 | 1);
  const weekMeta = getWeekMetadata(selectedWeekRefDate, settings.weekStartsOn as 0 | 1);

  // Week navigation
  const prevWeek = () => {
    setSelectedWeekRefDate(shiftDate(selectedWeekRefDate, -7));
  };
  const nextWeek = () => {
    setSelectedWeekRefDate(shiftDate(selectedWeekRefDate, 7));
  };

  // Telemetry summary metrics
  const telemetry = computeTelemetrySummary(habits, logs, weekDays, todayDateStr);

  // Active day metrics
  const activeDayDeck = computeDailyDeckMetrics(habits, logs, selectedDate);
  const parsedSelected = parseLocalDate(selectedDate);
  const selectedShort = format(parsedSelected, 'EEE').toUpperCase();
  const selectedDayNum = format(parsedSelected, 'dd');
  const selectedFullLabel = format(parsedSelected, 'EEEE, MMM d');

  // Filter habits for daily deck
  const activeHabits = habits.filter(h => h.status === 'active');
  const scheduledForSelectedDay = activeHabits.filter(h => isHabitScheduledOnDate(h, selectedDate));

  const logMap = new Map();
  for (const l of logs) {
    if (l.localDate === selectedDate) {
      logMap.set(l.habitId, l);
    }
  }

  const filteredHabits = scheduledForSelectedDay.filter(h => {
    if (categoryFilter !== 'all' && h.categoryId !== categoryFilter) return false;
    const l = logMap.get(h.id);
    const isDone = l?.completionStatus === 'completed';
    if (statusFilter === 'pending' && isDone) return false;
    if (statusFilter === 'done' && !isDone) return false;
    return true;
  });

  const handleQuickAdd = async (title: string, categoryId: string) => {
    await addHabit({
      name: title,
      description: '',
      categoryId,
      trackingType: 'binary',
      target: 1,
      step: 1,
      unit: 'session',
      schedule: { type: 'daily' },
      startDate: selectedDate,
      triggerCue: 'Daily ritual',
      preferredTime: 'morning',
      priority: 'medium',
      notes: '',
      status: 'active',
    });
  };

  const handleEditHabit = (h: Habit) => {
    setHabitToEdit(h);
    setIsHabitModalOpen(true);
  };

  const handleSaveHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (habitToEdit) {
      await updateHabit(habitToEdit.id, habitData);
    } else {
      await addHabit(habitData);
    }
  };

  const handleMarkAllDone = async () => {
    await markAllScheduledComplete(scheduledForSelectedDay, selectedDate);
  };

  // Generate mini dots for telemetry gauge
  const miniDots = weekDays.map(d => {
    const scheduled = activeHabits.filter(h => isHabitScheduledOnDate(h, d.date));
    const done = scheduled.filter(h => {
      const l = logs.find(log => log.habitId === h.id && log.localDate === d.date);
      return l?.completionStatus === 'completed';
    }).length;
    const isAllClear = scheduled.length > 0 && done === scheduled.length;

    let dotColor = 'bg-slate-200 border-slate-300 text-steel';
    if (isAllClear) {
      dotColor = 'bg-amber border-amber text-white font-bold';
    } else if (done > 0) {
      dotColor = 'bg-cobalt border-cobalt text-white';
    }

    return (
      <div
        key={d.date}
        className={`flex-1 h-5 rounded flex items-center justify-center font-mono text-[10px] border ${dotColor}`}
        title={`${d.short}: ${done}/${scheduled.length} done`}
      >
        {d.short[0]}
      </div>
    );
  });

  return (
    <div className="space-y-5">
      {/* ── HEADER INSTRUMENT BAR ────────────────────────────────────── */}
      <header className="instrument-card rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-ink text-white flex flex-col items-center justify-center shrink-0 border border-slate-700 shadow-inner">
            <span className="font-mono text-[10px] tracking-widest text-amber font-semibold leading-none">
              {weekMeta.id}
            </span>
            <span className="font-display font-bold text-base leading-tight mt-0.5">
              {clock.dayNum}
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-widest px-2 py-0.5 rounded bg-ink/10 text-ink font-semibold">
                CADENCE // 04
              </span>
              <span className="font-mono text-[11px] text-steel">{weekMeta.rangeText}</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink mt-0.5">
              Daily Ritual &amp; Streak Console
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Week Switcher */}
          <div className="instrument-inset rounded-xl p-1 flex items-center gap-1">
            <button
              type="button"
              onClick={prevWeek}
              className="tactile-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold text-ink hover:bg-white/80 flex items-center gap-1 cursor-pointer"
              title="Previous Week"
            >
              <span>&larr;</span>
              <span className="hidden sm:inline">Prev</span>
            </button>
            <span className="px-2.5 py-1 font-mono text-xs font-bold text-ink whitespace-nowrap">
              {weekMeta.label.split('(')[0].trim()}
            </span>
            <button
              type="button"
              onClick={nextWeek}
              className="tactile-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold text-ink hover:bg-white/80 flex items-center gap-1 cursor-pointer"
              title="Next Week"
            >
              <span className="hidden sm:inline">Next</span>
              <span>&rarr;</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setHabitToEdit(null);
              setIsHabitModalOpen(true);
            }}
            className="tactile-btn px-4 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt-dark text-white font-display font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Daily Goal</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="tactile-btn px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-steel hover:text-ink border border-slate-300 font-mono text-xs font-medium cursor-pointer"
            title="Restore sample habits"
          >
            Reset
          </button>
        </div>
      </header>

      {/* ── TELEMETRY READOUT STRIP (4 Instrument Gauges) ───────────── */}
      <section aria-label="Telemetry Summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Gauge 1: Selected Day Log */}
        <SummaryStatCard
          label={`${selectedShort} ${format(parsedSelected, 'MMM').toUpperCase()} ${selectedDayNum} LOG`}
          badge={<span className="w-2.5 h-2.5 rounded-full bg-cobalt"></span>}
          value={`${activeDayDeck.completed}/${activeDayDeck.scheduled}`}
          unit="goals"
          subValue={
            <span className="font-mono text-sm font-bold text-cobalt bg-cobalt/10 px-2 py-0.5 rounded">
              {activeDayDeck.rate}%
            </span>
          }
          progressBar={{ percent: activeDayDeck.rate }}
        />

        {/* Gauge 2: Peak Active Streak */}
        <SummaryStatCard
          label="PEAK ACTIVE STREAK"
          badge={
            <span className="text-amber font-mono text-xs font-bold flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse"></span> LIVE
            </span>
          }
          value={telemetry.peakStreak}
          unit="days"
          subValue={
            <span className="font-sans text-xs font-medium text-steel truncate max-w-[120px]" title={telemetry.peakStreakHabitName}>
              {telemetry.peakStreakHabitName}
            </span>
          }
          footer={
            <div className="font-mono text-[11px] text-steel flex items-center justify-between">
              <span>Consistency index</span>
              <span className="font-bold text-ink">{telemetry.consistencyGrade}</span>
            </div>
          }
        />

        {/* Gauge 3: Weekly Cadence */}
        <SummaryStatCard
          label="WEEKLY CADENCE"
          badge={
            <span className="font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              Active
            </span>
          }
          value={`${telemetry.weeklyRate}%`}
          subValue={
            <span className="font-mono text-xs text-steel">
              {telemetry.weeklyCompleted} check-ins
            </span>
          }
          footer={
            <div className="font-mono text-[11px] text-steel flex items-center justify-between">
              <span>Weekly target threshold</span>
              <span className="font-bold text-cobalt">80% goal</span>
            </div>
          }
        />

        {/* Gauge 4: All-Clear Days */}
        <SummaryStatCard
          label="ALL-CLEAR DAYS"
          badge={<span className="font-mono text-[11px] text-amber font-bold">100% LOGGED</span>}
          value={telemetry.perfectDaysCount}
          unit="/ 7 days"
          subValue={
            <span className="font-mono text-xs font-semibold text-amber bg-amber/15 px-2 py-0.5 rounded">
              Streak Chain
            </span>
          }
          footer={<div className="flex items-center gap-1.5">{miniDots}</div>}
        />
      </section>

      {/* ── MAIN SPLIT CONSOLE ──────────────────────────────────────── */}
      {habits.length === 0 ? (
        <EmptyState
          title="Daily Ritual Console Uncalibrated"
          description="Your local habit registry is currently empty. Initialize with the calibrated studio presets or create your first personal ritual to begin tracking."
          actionLabel="Load Sample Studio Habits"
          onAction={async () => {
            await seedSampleHabits();
          }}
          secondaryActionLabel="+ Create Custom Goal"
          onSecondaryAction={() => {
            setHabitToEdit(null);
            setIsHabitModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN (7 cols): DAILY GOAL LOGGING DECK */}
          <section className="lg:col-span-7 instrument-card rounded-2xl p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cobalt"></span>
                  <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
                    DAILY LOGGING DECK
                  </span>
                </div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-ink mt-0.5">
                  {selectedFullLabel} — Active Rituals
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllDone}
                  className="tactile-btn px-3 py-1.5 rounded-lg bg-ink/5 hover:bg-ink/10 text-ink font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} className="text-cobalt" strokeWidth={2.5} />
                  <span>Mark All Done</span>
                </button>
              </div>
            </div>

            {/* 7-Day Tactile Day Switcher Strip */}
            <WeekSelector
              days={weekDays}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              habits={habits}
              logs={logs}
              onJumpToday={jumpToToday}
              todayDateStr={todayDateStr}
            />

            {/* Filter Toolbar */}
            <HabitFilters
              selectedCategory={categoryFilter}
              onSelectCategory={setCategoryFilter}
              selectedStatus={statusFilter}
              onSelectStatus={setStatusFilter}
            />

            {/* Daily Goal Cards List */}
            <div className="space-y-3">
              {filteredHabits.length === 0 ? (
                <div className="instrument-inset rounded-xl p-8 text-center space-y-2">
                  <p className="font-display text-base font-bold text-ink">
                    No rituals match the current filter
                  </p>
                  <p className="text-xs text-steel">
                    Switch category filters above or add a new daily goal to start logging.
                  </p>
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
                      onEdit={handleEditHabit}
                      onDelete={h => deleteHabit(h.id)}
                    />
                  );
                })
              )}
            </div>

            {/* Fast Inline Goal Adder */}
            <QuickAddForm onQuickAdd={handleQuickAdd} />
          </section>

          {/* RIGHT COLUMN (5 cols): WEEKLY STREAK CHART & CONTINUITY RAIL */}
          <section className="lg:col-span-5 space-y-5">
            {/* SIGNATURE MODULE: 7-DAY STREAK CONTINUITY MATRIX */}
            <StreakMatrix
              days={weekDays}
              habits={habits}
              logs={logs}
              selectedDate={selectedDate}
              onToggleDate={(h, dateStr) => toggleHabitOnDate(h, dateStr)}
            />

            {/* INTERACTIVE WEEKLY STREAK & VELOCITY CHART */}
            <WeeklyStreakChart
              days={weekDays}
              habits={habits}
              logs={logs}
              selectedDate={selectedDate}
            />

            {/* DAILY REFLECTION / FIELD NOTE MODULE */}
            <DailyReflectionCard selectedDate={selectedDate} />
          </section>
        </div>
      )}

      {/* Habit Create/Edit Modal */}
      <HabitForm
        isOpen={isHabitModalOpen}
        habitToEdit={habitToEdit}
        onClose={() => setIsHabitModalOpen(false)}
        onSave={handleSaveHabit}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmDialog
        isOpen={isResetModalOpen}
        title="Restore Default Console Data?"
        message="This will reset your habits, weekly logs, and reflections back to the calibrated studio presets."
        confirmLabel="Restore Defaults"
        onConfirm={async () => {
          await seedSampleHabits();
          setIsResetModalOpen(false);
        }}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};
