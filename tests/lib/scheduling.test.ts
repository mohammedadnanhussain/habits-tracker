import { describe, it, expect } from 'vitest';
import {
  isHabitScheduledOnDate,
  isHabitActiveOnDate,
  getScheduledHabitsForDate,
} from '../../src/lib/scheduling';
import { Habit } from '../../src/types/habit';

const habitTemplate: Habit = {
  id: 'h_sched',
  name: 'Focus Sprint',
  description: '',
  categoryId: 'cat_craft',
  trackingType: 'binary',
  target: 1,
  step: 1,
  unit: 'session',
  schedule: { type: 'daily' },
  startDate: '2026-10-01',
  endDate: '2026-10-31',
  preferredTime: 'morning',
  priority: 'high',
  triggerCue: '',
  notes: '',
  status: 'active',
  createdAt: '',
  updatedAt: '',
};

describe('Scheduling Engine', () => {
  it('respects startDate and endDate boundaries', () => {
    expect(isHabitActiveOnDate(habitTemplate, '2026-09-30')).toBe(false);
    expect(isHabitActiveOnDate(habitTemplate, '2026-10-01')).toBe(true);
    expect(isHabitActiveOnDate(habitTemplate, '2026-10-16')).toBe(true);
    expect(isHabitActiveOnDate(habitTemplate, '2026-10-31')).toBe(true);
    expect(isHabitActiveOnDate(habitTemplate, '2026-11-01')).toBe(false);
  });

  it('handles specific weekdays schedule correctly (0=Sunday, 1=Monday... 5=Friday)', () => {
    // Mon (1) and Fri (5)
    const mwHabit: Habit = {
      ...habitTemplate,
      schedule: { type: 'specific_days', days: [1, 5] },
    };

    // 2026-10-12 is Monday (1)
    expect(isHabitScheduledOnDate(mwHabit, '2026-10-12')).toBe(true);
    // 2026-10-13 is Tuesday (2)
    expect(isHabitScheduledOnDate(mwHabit, '2026-10-13')).toBe(false);
    // 2026-10-16 is Friday (5)
    expect(isHabitScheduledOnDate(mwHabit, '2026-10-16')).toBe(true);
  });

  it('filters scheduled habits for a specific date', () => {
    const h1: Habit = { ...habitTemplate, id: 'h1', schedule: { type: 'daily' } };
    const h2: Habit = { ...habitTemplate, id: 'h2', schedule: { type: 'specific_days', days: [1] } }; // Monday only

    // On Friday 2026-10-16
    const fridayList = getScheduledHabitsForDate([h1, h2], '2026-10-16');
    expect(fridayList.map(h => h.id)).toEqual(['h1']);

    // On Monday 2026-10-12
    const mondayList = getScheduledHabitsForDate([h1, h2], '2026-10-12');
    expect(mondayList.map(h => h.id)).toEqual(['h1', 'h2']);
  });
});
