import { describe, it, expect } from 'vitest';
import { calculateHabitStreaks, isLogCompleted } from '../../src/lib/streaks';
import { Habit, HabitLog } from '../../src/types/habit';

const baseHabit: Habit = {
  id: 'h_test',
  name: 'Morning Workout',
  description: '',
  categoryId: 'cat_body',
  trackingType: 'binary',
  target: 1,
  step: 1,
  unit: 'session',
  schedule: { type: 'daily' },
  startDate: '2026-10-01',
  preferredTime: 'morning',
  priority: 'high',
  triggerCue: '',
  notes: '',
  status: 'active',
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
};

describe('Streak Calculation Engine', () => {
  it('isLogCompleted accurately checks binary and quantified types', () => {
    expect(isLogCompleted(baseHabit, undefined)).toBe(false);

    const binaryLog: HabitLog = {
      id: 'l1',
      habitId: 'h_test',
      localDate: '2026-10-16',
      value: 1,
      completionStatus: 'completed',
      note: '',
      createdAt: '',
      updatedAt: '',
    };
    expect(isLogCompleted(baseHabit, binaryLog)).toBe(true);

    const quantHabit: Habit = { ...baseHabit, trackingType: 'quantified', target: 3.0, unit: 'L' };
    const partialLog: HabitLog = { ...binaryLog, value: 2.5, completionStatus: 'partial' };
    expect(isLogCompleted(quantHabit, partialLog)).toBe(false);

    const fullLog: HabitLog = { ...binaryLog, value: 3.0, completionStatus: 'completed' };
    expect(isLogCompleted(quantHabit, fullLog)).toBe(true);
  });

  it('calculates unbroken daily streak leading up to today', () => {
    const logs: HabitLog[] = [
      { id: '1', habitId: 'h_test', localDate: '2026-10-14', value: 1, completionStatus: 'completed', note: '', createdAt: '', updatedAt: '' },
      { id: '2', habitId: 'h_test', localDate: '2026-10-15', value: 1, completionStatus: 'completed', note: '', createdAt: '', updatedAt: '' },
      { id: '3', habitId: 'h_test', localDate: '2026-10-16', value: 1, completionStatus: 'completed', note: '', createdAt: '', updatedAt: '' },
    ];

    const result = calculateHabitStreaks(baseHabit, logs, '2026-10-16');
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    expect(result.isAtRisk).toBe(false);
  });

  it('retains active streak if today is not completed yet but yesterday was completed', () => {
    const logs: HabitLog[] = [
      { id: '1', habitId: 'h_test', localDate: '2026-10-14', value: 1, completionStatus: 'completed', note: '', createdAt: '', updatedAt: '' },
      { id: '2', habitId: 'h_test', localDate: '2026-10-15', value: 1, completionStatus: 'completed', note: '', createdAt: '', updatedAt: '' },
      // Today (2026-10-16) is not yet logged
    ];

    const result = calculateHabitStreaks(baseHabit, logs, '2026-10-16');
    expect(result.currentStreak).toBe(2);
    expect(result.isAtRisk).toBe(true); // Scheduled today, not done yet -> at risk!
  });

  it('resets current streak to 0 if an earlier scheduled day was missed', () => {
    const logs: HabitLog[] = [
      { id: '1', habitId: 'h_test', localDate: '2026-10-12', value: 1, completionStatus: 'completed', note: '', createdAt: '', updatedAt: '' },
      // Missed 10-13, 10-14, 10-15
      // Today not logged
    ];

    const result = calculateHabitStreaks(baseHabit, logs, '2026-10-16');
    expect(result.currentStreak).toBe(0);
  });

  it('rest days do NOT break streak for habits with specific days schedule', () => {
    // Habit scheduled only on Mon (1), Wed (3), Fri (5)
    const mwfHabit: Habit = {
      ...baseHabit,
      schedule: { type: 'specific_days', days: [1, 3, 5] },
    };

    // 2026-10-12 is Monday, 2026-10-14 is Wednesday, 2026-10-16 is Friday
    // Tue (10-13) and Thu (10-15) are unscheduled rest days
    const logs: HabitLog[] = [
      { id: '1', habitId: 'h_test', localDate: '2026-10-12', value: 1, completionStatus: 'completed', note: '', createdAt: '', updatedAt: '' },
      { id: '2', habitId: 'h_test', localDate: '2026-10-14', value: 1, completionStatus: 'completed', note: '', createdAt: '', updatedAt: '' },
      { id: '3', habitId: 'h_test', localDate: '2026-10-16', value: 1, completionStatus: 'completed', note: '', createdAt: '', updatedAt: '' },
    ];

    const result = calculateHabitStreaks(mwfHabit, logs, '2026-10-16');
    // All 3 scheduled opportunities were met; rest days must NOT break it!
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
  });
});
