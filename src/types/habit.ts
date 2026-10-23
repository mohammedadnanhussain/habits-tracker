// ── Tracking Types ──────────────────────────────────────────
export type TrackingType = 'binary' | 'quantified' | 'counter' | 'duration' | 'avoidance' | 'checklist';
export type HabitStatus = 'active' | 'paused' | 'archived';
export type CompletionStatus = 'not_started' | 'partial' | 'completed' | 'skipped';
export type ScheduleType = 'daily' | 'specific_days' | 'x_per_week' | 'custom_dates';
export type Priority = 'low' | 'medium' | 'high';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

// ── Schedule ────────────────────────────────────────────────
export interface HabitSchedule {
  type: ScheduleType;
  /** For 'specific_days': 0=Sunday..6=Saturday */
  days?: number[];
  /** For 'x_per_week': target number of days */
  daysPerWeek?: number;
  /** For 'custom_dates': array of YYYY-MM-DD */
  customDates?: string[];
}

// ── Checklist Sub-item ──────────────────────────────────────
export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

// ── Habit ───────────────────────────────────────────────────
export interface Habit {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  trackingType: TrackingType;
  target: number;
  step: number;
  unit: string;
  schedule: HabitSchedule;
  startDate: string;       // YYYY-MM-DD
  endDate?: string;         // YYYY-MM-DD
  reminderTime?: string;    // HH:mm
  preferredTime: TimeOfDay;
  priority: Priority;
  estimatedMinutes?: number;
  triggerCue: string;
  notes: string;
  icon?: string;
  color?: string;
  status: HabitStatus;
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
}

// ── Habit Log ───────────────────────────────────────────────
export interface HabitLog {
  id: string;
  habitId: string;
  localDate: string;        // YYYY-MM-DD
  value: number;
  completionStatus: CompletionStatus;
  checklistItems?: ChecklistItem[];
  note: string;
  completedAt?: string;     // ISO 8601
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
}

// ── Duration Session (for duration tracking type) ───────────
export interface DurationSession {
  id: string;
  habitLogId: string;
  startedAt: string;        // ISO 8601
  endedAt?: string;         // ISO 8601
  durationSeconds: number;
  status: 'running' | 'paused' | 'completed';
}

// ── Category ────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  icon?: string;
  color: string;
  sortOrder: number;
}
