export type Theme = 'light' | 'dark' | 'system';
export type ClockFormat = '12h' | '24h';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun, 1=Mon, etc.
export type StreakPolicy = 'strict' | 'lenient';

export interface AppSettings {
  displayName: string;
  timeZone: string;           // IANA timezone
  weekStartsOn: WeekStartDay;
  clockFormat: ClockFormat;
  dateFormat: DateFormat;
  theme: Theme;
  streakPolicy: StreakPolicy;
  allowFutureLogging: boolean;
  notificationsEnabled: boolean;
  defaultDashboardView: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  displayName: '',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  weekStartsOn: 1,
  clockFormat: '12h',
  dateFormat: 'MM/DD/YYYY',
  theme: 'light',
  streakPolicy: 'strict',
  allowFutureLogging: false,
  notificationsEnabled: false,
  defaultDashboardView: 'dashboard',
};
