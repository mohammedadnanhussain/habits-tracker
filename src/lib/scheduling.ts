import { Habit } from '../types/habit';
import { parseLocalDate, toLocalDateString, getWeekDays } from './dates';
import { getDay } from 'date-fns';

/**
 * Checks if a habit is active and valid for the given date range (start/end dates)
 */
export function isHabitActiveOnDate(habit: Habit, dateStr: string): boolean {
  if (habit.status === 'archived') return false;
  if (habit.startDate && dateStr < habit.startDate) return false;
  if (habit.endDate && dateStr > habit.endDate) return false;
  return true;
}

/**
 * Determines whether a habit is scheduled to be performed on a specific date
 */
export function isHabitScheduledOnDate(habit: Habit, dateStr: string): boolean {
  if (!isHabitActiveOnDate(habit, dateStr)) return false;

  const schedule = habit.schedule;
  if (!schedule) return true; // Default to daily

  switch (schedule.type) {
    case 'daily':
      return true;

    case 'specific_days': {
      if (!schedule.days || schedule.days.length === 0) return true;
      const d = parseLocalDate(dateStr);
      const dayOfWeek = getDay(d); // 0=Sunday, 1=Monday...
      return schedule.days.includes(dayOfWeek);
    }

    case 'x_per_week': {
      // In flexible weekly frequency (e.g. 3 days a week), every day within active range
      // is an opportunity until the quota is reached.
      return true;
    }

    case 'custom_dates': {
      if (!schedule.customDates) return false;
      return schedule.customDates.includes(dateStr);
    }

    default:
      return true;
  }
}

/**
 * Get all habits scheduled for a given date
 */
export function getScheduledHabitsForDate(habits: Habit[], dateStr: string): Habit[] {
  return habits.filter(h => isHabitScheduledOnDate(h, dateStr));
}

/**
 * Calculate expected schedule count for a week
 */
export function getExpectedScheduledDaysInWeek(habit: Habit, weekDays: { date: string }[]): number {
  if (!habit.schedule) return 7;

  if (habit.schedule.type === 'x_per_week' && habit.schedule.daysPerWeek) {
    return habit.schedule.daysPerWeek;
  }

  let count = 0;
  for (const day of weekDays) {
    if (isHabitScheduledOnDate(habit, day.date)) {
      count++;
    }
  }
  return count;
}
