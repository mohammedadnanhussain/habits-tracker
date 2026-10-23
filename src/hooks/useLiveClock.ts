import { useState, useEffect, useRef, useCallback } from 'react';
import { getLocalToday, getUserTimeZone, formatLocalClock, parseLocalDate } from '../lib/dates';
import { format, getISOWeek, getYear } from 'date-fns';

export interface LiveClockState {
  now: Date;
  timeString: string;
  todayDateStr: string;        // YYYY-MM-DD
  weekdayShort: string;        // FRI
  weekdayFull: string;         // Friday
  dayNum: string;              // 16
  monthShort: string;          // OCT
  monthFull: string;           // October
  year: number;                // 2026
  weekNumber: number;          // 42
  timeZone: string;            // Asia/Kolkata
  fullDateLabel: string;       // Friday, Oct 16, 2026
}

export function useLiveClock(onDateChange?: (newDate: string) => void) {
  const [clock, setClock] = useState<LiveClockState>(() => {
    const now = new Date();
    const today = getLocalToday();
    return {
      now,
      timeString: formatLocalClock(now, false),
      todayDateStr: today,
      weekdayShort: format(now, 'EEE').toUpperCase(),
      weekdayFull: format(now, 'EEEE'),
      dayNum: String(now.getDate()).padStart(2, '0'),
      monthShort: format(now, 'MMM').toUpperCase(),
      monthFull: format(now, 'MMMM'),
      year: getYear(now),
      weekNumber: getISOWeek(now),
      timeZone: getUserTimeZone(),
      fullDateLabel: format(now, 'EEEE, MMM d, yyyy'),
    };
  });

  const lastDateRef = useRef<string>(clock.todayDateStr);
  const onDateChangeRef = useRef(onDateChange);
  onDateChangeRef.current = onDateChange;

  const updateClock = useCallback(() => {
    const now = new Date();
    const today = getLocalToday();

    // Detect midnight rollover or sleep-wake date change
    if (today !== lastDateRef.current) {
      lastDateRef.current = today;
      if (onDateChangeRef.current) {
        onDateChangeRef.current(today);
      }
    }

    setClock({
      now,
      timeString: formatLocalClock(now, false),
      todayDateStr: today,
      weekdayShort: format(now, 'EEE').toUpperCase(),
      weekdayFull: format(now, 'EEEE'),
      dayNum: String(now.getDate()).padStart(2, '0'),
      monthShort: format(now, 'MMM').toUpperCase(),
      monthFull: format(now, 'MMMM'),
      year: getYear(now),
      weekNumber: getISOWeek(now),
      timeZone: getUserTimeZone(),
      fullDateLabel: format(now, 'EEEE, MMM d, yyyy'),
    });
  }, []);

  useEffect(() => {
    // 1. Tick every second
    const timer = setInterval(updateClock, 1000);

    // 2. Tab suspension and resume handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateClock();
      }
    };

    // 3. System wake / window focus handler
    const handleFocus = () => {
      updateClock();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [updateClock]);

  return clock;
}
