import { Habit, HabitLog } from '../types/habit';
import { isHabitScheduledOnDate } from './scheduling';
import { isLogCompleted, calculateHabitStreaks } from './streaks';
import { getLocalToday, shiftDate, parseLocalDate, DayInfo } from './dates';
import { getDay } from 'date-fns';

export interface AnalyticsSummary {
  todayScheduled: number;
  todayCompleted: number;
  todayRate: number;
  todayRemaining: number;
  peakStreak: number;
  peakStreakHabitName: string;
  consistencyGrade: string;
  weeklyRate: number;
  weeklyCompleted: number;
  weeklyScheduled: number;
  perfectDaysCount: number;
  totalCheckIns: number;
  habitsAtRiskCount: number;
}

export function computeDailyDeckMetrics(
  habits: Habit[],
  logs: HabitLog[],
  dateStr: string = getLocalToday()
) {
  const activeHabits = habits.filter(h => h.status === 'active');
  const scheduled = activeHabits.filter(h => isHabitScheduledOnDate(h, dateStr));
  const logMap = new Map<string, HabitLog>();
  for (const l of logs) {
    if (l.localDate === dateStr) {
      logMap.set(l.habitId, l);
    }
  }

  const completed = scheduled.filter(h => isLogCompleted(h, logMap.get(h.id))).length;
  const total = scheduled.length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = total - completed;

  return { scheduled: total, completed, rate, remaining };
}

export function computeTelemetrySummary(
  habits: Habit[],
  logs: HabitLog[],
  weekDays: DayInfo[],
  todayStr: string = getLocalToday()
): AnalyticsSummary {
  const activeHabits = habits.filter(h => h.status === 'active');
  const logMap = new Map<string, HabitLog>();
  for (const l of logs) {
    logMap.set(`${l.habitId}_${l.localDate}`, l);
  }

  // Today metrics
  const { scheduled: todayScheduled, completed: todayCompleted, rate: todayRate, remaining: todayRemaining } =
    computeDailyDeckMetrics(habits, logs, todayStr);

  // Peak active streak
  let peakStreak = 0;
  let peakStreakHabitName = '—';
  let habitsAtRiskCount = 0;

  for (const h of activeHabits) {
    const streaks = calculateHabitStreaks(h, logs, todayStr);
    if (streaks.currentStreak > peakStreak) {
      peakStreak = streaks.currentStreak;
      peakStreakHabitName = h.name;
    }
    if (streaks.isAtRisk) {
      habitsAtRiskCount++;
    }
  }

  // Weekly cadence
  let weeklyScheduled = 0;
  let weeklyCompleted = 0;
  let perfectDaysCount = 0;

  for (const day of weekDays) {
    const isFuture = day.date > todayStr;
    const dayScheduled = activeHabits.filter(h => isHabitScheduledOnDate(h, day.date));
    let dayDone = 0;

    for (const h of dayScheduled) {
      const log = logMap.get(`${h.id}_${day.date}`);
      if (isLogCompleted(h, log)) {
        dayDone++;
        weeklyCompleted++;
      }
      if (!isFuture) {
        weeklyScheduled++;
      }
    }

    if (dayScheduled.length > 0 && dayDone === dayScheduled.length) {
      perfectDaysCount++;
    }
  }

  const weeklyRate = weeklyScheduled > 0 ? Math.round((weeklyCompleted / weeklyScheduled) * 100) : 0;
  const grade = weeklyRate >= 90 ? 'S+' : weeklyRate >= 80 ? 'A' : weeklyRate >= 65 ? 'B+' : weeklyRate >= 50 ? 'B' : 'C';

  // Total check-ins ever
  let totalCheckIns = 0;
  for (const l of logs) {
    const h = habits.find(habit => habit.id === l.habitId);
    if (h && isLogCompleted(h, l)) {
      totalCheckIns++;
    }
  }

  return {
    todayScheduled,
    todayCompleted,
    todayRate,
    todayRemaining,
    peakStreak,
    peakStreakHabitName,
    consistencyGrade: `${grade} (${weeklyRate}%)`,
    weeklyRate,
    weeklyCompleted,
    weeklyScheduled,
    perfectDaysCount,
    totalCheckIns,
    habitsAtRiskCount,
  };
}

export function computeDailyCompletionTrend(
  habits: Habit[],
  logs: HabitLog[],
  daysCount: number = 7,
  endDateStr: string = getLocalToday()
) {
  const result: { date: string; label: string; rate: number; count: number; total: number; chains: number }[] = [];
  const logMap = new Map<string, HabitLog>();
  for (const l of logs) {
    logMap.set(`${l.habitId}_${l.localDate}`, l);
  }

  for (let i = daysCount - 1; i >= 0; i--) {
    const curDate = shiftDate(endDateStr, -i);
    const scheduled = habits.filter(h => h.status === 'active' && isHabitScheduledOnDate(h, curDate));
    let done = 0;
    let chains = 0;

    for (const h of scheduled) {
      const log = logMap.get(`${h.id}_${curDate}`);
      if (isLogCompleted(h, log)) {
        done++;
      }
      // Check multi-day streak on this date
      const st = calculateHabitStreaks(h, logs, curDate);
      if (st.currentStreak >= 2) {
        chains++;
      }
    }

    const rate = scheduled.length > 0 ? Math.round((done / scheduled.length) * 100) : 0;
    const d = parseLocalDate(curDate);
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][getDay(d)];
    const dayNum = curDate.split('-')[2];

    result.push({
      date: curDate,
      label: `${dayName} ${dayNum}`,
      rate,
      count: done,
      total: scheduled.length,
      chains,
    });
  }

  return result;
}

export function computePillarConsistency(
  habits: Habit[],
  logs: HabitLog[],
  weekDays: DayInfo[],
  todayStr: string = getLocalToday()
) {
  const categories = ['Body', 'Mind', 'Craft', 'Rest'];
  const logMap = new Map<string, HabitLog>();
  for (const l of logs) {
    logMap.set(`${l.habitId}_${l.localDate}`, l);
  }

  return categories.map(cat => {
    const catHabits = habits.filter(h => h.status === 'active' && h.categoryId.toLowerCase().includes(cat.toLowerCase()));
    if (catHabits.length === 0) return { category: cat, rate: 0, completed: 0, scheduled: 0 };

    let completed = 0;
    let scheduled = 0;

    for (const d of weekDays) {
      if (d.date <= todayStr) {
        for (const h of catHabits) {
          if (isHabitScheduledOnDate(h, d.date)) {
            scheduled++;
            const l = logMap.get(`${h.id}_${d.date}`);
            if (isLogCompleted(h, l)) completed++;
          }
        }
      }
    }

    const rate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
    return { category: cat, rate, completed, scheduled };
  });
}
