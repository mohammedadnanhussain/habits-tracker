import { describe, it, expect } from 'vitest';
import { computeDailyDeckMetrics, computeTelemetrySummary } from '../../src/lib/analytics';
import { getWeekDays } from '../../src/lib/dates';
import { Habit, HabitLog } from '../../src/types/habit';

const habits: Habit[] = [
  {
    id: 'h1',
    name: 'Habit 1',
    description: '',
    categoryId: 'cat_body',
    trackingType: 'binary',
    target: 1,
    step: 1,
    unit: 'session',
    schedule: { type: 'daily' },
    startDate: '2026-10-01',
    preferredTime: 'morning',
    priority: 'medium',
    triggerCue: '',
    notes: '',
    status: 'active',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'h2',
    name: 'Habit 2',
    description: '',
    categoryId: 'cat_craft',
    trackingType: 'quantified',
    target: 50,
    step: 10,
    unit: 'min',
    schedule: { type: 'daily' },
    startDate: '2026-10-01',
    preferredTime: 'morning',
    priority: 'high',
    triggerCue: '',
    notes: '',
    status: 'active',
    createdAt: '',
    updatedAt: '',
  },
];

describe('Analytics Metrics Computation', () => {
  it('computes daily deck rate accurately', () => {
    const logs: HabitLog[] = [
      { id: 'l1', habitId: 'h1', localDate: '2026-10-16', value: 1, completionStatus: 'completed', note: '', createdAt: '', updatedAt: '' },
      { id: 'l2', habitId: 'h2', localDate: '2026-10-16', value: 25, completionStatus: 'partial', note: '', createdAt: '', updatedAt: '' }, // 25/50 is not completed
    ];

    const deck = computeDailyDeckMetrics(habits, logs, '2026-10-16');
    expect(deck.scheduled).toBe(2);
    expect(deck.completed).toBe(1);
    expect(deck.rate).toBe(50);
    expect(deck.remaining).toBe(1);
  });

  it('handles empty habits gracefully without NaN', () => {
    const deck = computeDailyDeckMetrics([], [], '2026-10-16');
    expect(deck.scheduled).toBe(0);
    expect(deck.completed).toBe(0);
    expect(deck.rate).toBe(0);
    expect(deck.remaining).toBe(0);
  });

  it('computes telemetry summary for week and total check-ins', () => {
    const weekDays = getWeekDays('2026-10-16', 1);
    const logs: HabitLog[] = [
      { id: 'l1', habitId: 'h1', localDate: '2026-10-16', value: 1, completionStatus: 'completed', note: '', createdAt: '', updatedAt: '' },
      { id: 'l2', habitId: 'h2', localDate: '2026-10-16', value: 50, completionStatus: 'completed', note: '', createdAt: '', updatedAt: '' },
    ];

    const summary = computeTelemetrySummary(habits, logs, weekDays, '2026-10-16');
    expect(summary.todayCompleted).toBe(2);
    expect(summary.todayRate).toBe(100);
    expect(summary.totalCheckIns).toBe(2);
    expect(summary.perfectDaysCount).toBeGreaterThanOrEqual(1);
  });
});
