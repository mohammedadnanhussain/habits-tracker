import { describe, it, expect } from 'vitest';
import {
  getLocalToday,
  toLocalDateString,
  parseLocalDate,
  getWeekDays,
  getWeekMetadata,
  daysBetween,
  shiftDate,
  getUserTimeZone,
} from '../../src/lib/dates';

describe('Date Utilities', () => {
  it('getLocalToday returns YYYY-MM-DD format', () => {
    const today = getLocalToday();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('toLocalDateString handles Date object and string without UTC shifts', () => {
    const date = new Date(2026, 9, 16); // Oct 16, 2026
    expect(toLocalDateString(date)).toBe('2026-10-16');
    expect(toLocalDateString('2026-10-16')).toBe('2026-10-16');
  });

  it('parseLocalDate returns local midnight Date without UTC offset', () => {
    const parsed = parseLocalDate('2026-10-16');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(9); // 0-indexed October
    expect(parsed.getDate()).toBe(16);
  });

  it('getWeekDays generates 7 days starting from Monday by default', () => {
    const week = getWeekDays('2026-10-16', 1);
    expect(week).toHaveLength(7);
    expect(week[0].short).toBe('MON');
    expect(week[0].date).toBe('2026-10-12');
    expect(week[4].short).toBe('FRI');
    expect(week[4].date).toBe('2026-10-16');
    expect(week[6].short).toBe('SUN');
    expect(week[6].date).toBe('2026-10-18');
  });

  it('getWeekMetadata computes correct ISO week numbers', () => {
    const meta = getWeekMetadata('2026-10-16', 1);
    expect(meta.weekNumber).toBe(42);
    expect(meta.id).toBe('W42');
  });

  it('daysBetween computes accurate calendar distance', () => {
    expect(daysBetween('2026-10-10', '2026-10-16')).toBe(6);
    expect(daysBetween('2026-10-16', '2026-10-10')).toBe(-6);
    expect(daysBetween('2026-10-16', '2026-10-16')).toBe(0);
  });

  it('shiftDate advances or regresses by exact days', () => {
    expect(shiftDate('2026-10-16', 1)).toBe('2026-10-17');
    expect(shiftDate('2026-10-16', -5)).toBe('2026-10-11');
    expect(shiftDate('2026-10-01', -1)).toBe('2026-09-30');
  });

  it('getUserTimeZone returns valid non-empty IANA string', () => {
    const tz = getUserTimeZone();
    expect(typeof tz).toBe('string');
    expect(tz.length).toBeGreaterThan(0);
  });
});
