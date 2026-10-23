import {
  format,
  parseISO,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getISOWeek,
  getYear,
  getMonth,
  getDate,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  differenceInCalendarDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';

/**
 * Returns current date in local YYYY-MM-DD string format
 */
export function getLocalToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format an ISO YYYY-MM-DD string or Date object to local YYYY-MM-DD
 */
export function toLocalDateString(date: Date | string): string {
  if (typeof date === 'string') {
    // If already YYYY-MM-DD, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    date = parseISO(date);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string into a local Date at 00:00:00 local time
 */
export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return new Date(y, m, d, 0, 0, 0, 0);
}

export interface DayInfo {
  date: string;       // YYYY-MM-DD
  short: string;      // MON, TUE
  dayNum: string;     // 16
  fullLabel: string;  // Friday, Oct 16
  dayOfWeek: number;  // 0=Sun..6=Sat
  isToday: boolean;
  isFuture: boolean;
}

/**
 * Get 7 days of the week containing referenceDate (default Monday start)
 */
export function getWeekDays(referenceDate: string | Date = new Date(), weekStartsOn: 0 | 1 = 1): DayInfo[] {
  const ref = typeof referenceDate === 'string' ? parseLocalDate(referenceDate) : referenceDate;
  const start = startOfWeek(ref, { weekStartsOn });
  const end = endOfWeek(ref, { weekStartsOn });
  const todayStr = getLocalToday();

  const days = eachDayOfInterval({ start, end });
  return days.map(d => {
    const dateStr = toLocalDateString(d);
    return {
      date: dateStr,
      short: format(d, 'EEE').toUpperCase(),
      dayNum: String(getDate(d)).padStart(2, '0'),
      fullLabel: format(d, 'EEEE, MMM d'),
      dayOfWeek: getDay(d),
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
    };
  });
}

/**
 * Get week label and range text (e.g., 'W42', 'OCT 12 – OCT 18, 2026')
 */
export function getWeekMetadata(referenceDate: string | Date = new Date(), weekStartsOn: 0 | 1 = 1) {
  const ref = typeof referenceDate === 'string' ? parseLocalDate(referenceDate) : referenceDate;
  const weekNum = getISOWeek(ref);
  const start = startOfWeek(ref, { weekStartsOn });
  const end = endOfWeek(ref, { weekStartsOn });

  const rangeText = `${format(start, 'MMM dd').toUpperCase()} – ${format(end, 'MMM dd, yyyy').toUpperCase()}`;
  return {
    weekNumber: weekNum,
    id: `W${weekNum}`,
    label: `Week ${weekNum} (${rangeText})`,
    rangeText,
    startDate: toLocalDateString(start),
    endDate: toLocalDateString(end),
  };
}

/**
 * Get array of days in a month for calendar views
 */
export function getMonthDaysGrid(year: number, monthZeroIndexed: number, weekStartsOn: 0 | 1 = 1) {
  const monthStart = new Date(year, monthZeroIndexed, 1);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });
  const todayStr = getLocalToday();

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  return days.map(d => {
    const dateStr = toLocalDateString(d);
    return {
      date: dateStr,
      dayNumber: getDate(d),
      isCurrentMonth: getMonth(d) === monthZeroIndexed,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
      dayOfWeek: getDay(d),
    };
  });
}

/**
 * Detect user's current IANA timezone
 */
export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Format local time
 */
export function formatLocalClock(date: Date, is24Hour: boolean = false): string {
  return format(date, is24Hour ? 'HH:mm:ss' : 'hh:mm:ss a');
}

/**
 * Safe date diff in calendar days (local)
 */
export function daysBetween(date1: string, date2: string): number {
  return differenceInCalendarDays(parseLocalDate(date2), parseLocalDate(date1));
}

/**
 * Add / subtract days to YYYY-MM-DD
 */
export function shiftDate(dateStr: string, offsetDays: number): string {
  const d = parseLocalDate(dateStr);
  const shifted = offsetDays >= 0 ? addDays(d, offsetDays) : subDays(d, Math.abs(offsetDays));
  return toLocalDateString(shifted);
}
