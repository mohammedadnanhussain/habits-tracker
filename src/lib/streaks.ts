import { Habit, HabitLog } from '../types/habit';
import { isHabitScheduledOnDate, isHabitActiveOnDate } from './scheduling';
import { getLocalToday, parseLocalDate, shiftDate, daysBetween } from './dates';

export interface HabitStreakResult {
  currentStreak: number;
  longestStreak: number;
  longestStreakStart?: string;
  longestStreakEnd?: string;
  lastCompletedDate?: string;
  isAtRisk: boolean;
  totalCompletions: number;
}

/**
 * Check if a habit is completed according to its tracking type and log
 */
export function isLogCompleted(habit: Habit, log?: HabitLog): boolean {
  if (!log) return false;
  if (log.completionStatus === 'completed') return true;

  const val = Number(log.value || 0);
  const target = Number(habit.target || 1);

  switch (habit.trackingType) {
    case 'binary':
    case 'avoidance':
      return val >= 1;

    case 'quantified':
    case 'counter':
    case 'duration':
      return val >= target;

    case 'checklist':
      if (log.checklistItems && log.checklistItems.length > 0) {
        return log.checklistItems.every(item => item.completed);
      }
      return val >= target;

    default:
      return val >= target;
  }
}

/**
 * Get completion ratio 0..1
 */
export function getLogCompletionRatio(habit: Habit, log?: HabitLog): number {
  if (!log) return 0;
  if (isLogCompleted(habit, log)) return 1;

  const val = Number(log.value || 0);
  const target = Number(habit.target || 1);
  if (target <= 0) return 0;

  if (habit.trackingType === 'checklist' && log.checklistItems && log.checklistItems.length > 0) {
    const doneCount = log.checklistItems.filter(i => i.completed).length;
    return doneCount / log.checklistItems.length;
  }

  return Math.min(1, Math.max(0, val / target));
}

/**
 * Calculate streak metrics for a single habit
 */
export function calculateHabitStreaks(
  habit: Habit,
  logs: HabitLog[],
  todayStr: string = getLocalToday()
): HabitStreakResult {
  // Map logs by localDate
  const logMap = new Map<string, HabitLog>();
  let totalCompletions = 0;
  let lastCompletedDate: string | undefined;

  for (const log of logs) {
    if (log.habitId === habit.id) {
      logMap.set(log.localDate, log);
      if (isLogCompleted(habit, log)) {
        totalCompletions++;
        if (!lastCompletedDate || log.localDate > lastCompletedDate) {
          lastCompletedDate = log.localDate;
        }
      }
    }
  }

  // Determine earliest date to evaluate (habit startDate or first log date or 365 days ago)
  const earliestDate = habit.startDate || (logs.length > 0 ? logs.reduce((min, l) => l.localDate < min ? l.localDate : min, todayStr) : todayStr);

  // We scan day by day from earliestDate to todayStr
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let longestStart: string | undefined;
  let longestEnd: string | undefined;
  let tempStart: string | undefined;

  let cursor = earliestDate;
  while (cursor <= todayStr) {
    const isScheduled = isHabitScheduledOnDate(habit, cursor);

    if (isScheduled) {
      const log = logMap.get(cursor);
      const done = isLogCompleted(habit, log);

      if (done) {
        if (tempStreak === 0) {
          tempStart = cursor;
        }
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
          longestStart = tempStart;
          longestEnd = cursor;
        }
      } else {
        // Not done. If it's today, it hasn't broken yet (day is still ongoing)
        if (cursor === todayStr) {
          // Keep tempStreak as candidate for currentStreak
        } else {
          tempStreak = 0;
          tempStart = undefined;
        }
      }
    }
    // If not scheduled, rest day: does NOT reset streak!

    cursor = shiftDate(cursor, 1);
  }

  // Calculate current active streak backwards from today
  // Check if today was done
  const todayLog = logMap.get(todayStr);
  const todayDone = isLogCompleted(habit, todayLog);
  const todayScheduled = isHabitScheduledOnDate(habit, todayStr);

  let activeStreak = 0;
  let scanDate = todayStr;

  if (todayScheduled && todayDone) {
    activeStreak = 1;
    scanDate = shiftDate(todayStr, -1);
  } else if (!todayScheduled) {
    // Unscheduled today: scan back from yesterday
    scanDate = shiftDate(todayStr, -1);
  } else {
    // Today scheduled but not done yet: retain streak if previous opportunity was done
    scanDate = shiftDate(todayStr, -1);
  }

  // Scan backwards through previous scheduled opportunities
  while (scanDate >= earliestDate) {
    const isScheduled = isHabitScheduledOnDate(habit, scanDate);
    if (isScheduled) {
      const log = logMap.get(scanDate);
      if (isLogCompleted(habit, log)) {
        activeStreak++;
      } else {
        // Missed opportunity -> streak broken
        break;
      }
    }
    // If unscheduled, skip backwards without breaking
    scanDate = shiftDate(scanDate, -1);
  }

  // Habit is "at risk" if scheduled today, not yet done, and had an active streak coming into today
  const isAtRisk = todayScheduled && !todayDone && activeStreak > 0;

  return {
    currentStreak: activeStreak,
    longestStreak: Math.max(longestStreak, activeStreak),
    longestStreakStart: longestStart,
    longestStreakEnd: longestEnd,
    lastCompletedDate,
    isAtRisk,
    totalCompletions,
  };
}

/**
 * Calculate weekly consistency for an array of 7 days
 */
export function getWeekStreakRun(habit: Habit, weekDays: { date: string }[], logMap: Map<string, HabitLog>): number {
  let maxRun = 0;
  let currentRun = 0;

  for (const day of weekDays) {
    const isScheduled = isHabitScheduledOnDate(habit, day.date);
    if (!isScheduled) continue;

    const log = logMap.get(`${habit.id}_${day.date}`);
    if (isLogCompleted(habit, log)) {
      currentRun++;
      if (currentRun > maxRun) maxRun = currentRun;
    } else {
      currentRun = 0;
    }
  }

  return maxRun;
}
