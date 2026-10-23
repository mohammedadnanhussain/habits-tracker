import { db } from './db';
import { Habit, HabitLog } from '../types/habit';
import { DailyReflection } from '../types/reflection';
import { Goal, Milestone } from '../types/goal';
import { getLocalToday } from './dates';

export interface BackupPayload {
  version: number;
  exportedAt: string;
  source: string;
  data: {
    habits: Habit[];
    habitLogs: HabitLog[];
    reflections: DailyReflection[];
    goals: Goal[];
    milestones: Milestone[];
  };
}

/**
 * Export all user data as a JSON file
 */
export async function exportAllDataAsJSON(): Promise<string> {
  const habits = await db.habits.toArray();
  const habitLogs = await db.habitLogs.toArray();
  const reflections = await db.reflections.toArray();
  const goals = await db.goals.toArray();
  const milestones = await db.milestones.toArray();

  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    source: 'CADENCE Daily Ritual & Streak Console',
    data: {
      habits,
      habitLogs,
      reflections,
      goals,
      milestones,
    },
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Validate imported data structure
 */
export function validateBackupPayload(raw: unknown): { valid: boolean; error?: string; payload?: BackupPayload } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'File does not contain valid JSON object.' };
  }

  const obj = raw as Partial<BackupPayload>;
  if (!obj.data || typeof obj.data !== 'object') {
    return { valid: false, error: 'Backup is missing data property.' };
  }

  const { habits, habitLogs } = obj.data;
  if (!Array.isArray(habits)) {
    return { valid: false, error: 'Backup is missing valid habits array.' };
  }
  if (!Array.isArray(habitLogs)) {
    return { valid: false, error: 'Backup is missing valid habitLogs array.' };
  }

  return { valid: true, payload: obj as BackupPayload };
}

/**
 * Import validated JSON backup into database
 */
export async function importDataPayload(payload: BackupPayload, mode: 'merge' | 'replace' = 'merge'): Promise<{ success: boolean; message: string }> {
  try {
    if (mode === 'replace') {
      await db.habits.clear();
      await db.habitLogs.clear();
      await db.reflections.clear();
      await db.goals.clear();
      await db.milestones.clear();
    }

    if (payload.data.habits?.length > 0) {
      await db.habits.bulkPut(payload.data.habits);
    }
    if (payload.data.habitLogs?.length > 0) {
      await db.habitLogs.bulkPut(payload.data.habitLogs);
    }
    if (payload.data.reflections?.length > 0) {
      await db.reflections.bulkPut(payload.data.reflections);
    }
    if (payload.data.goals?.length > 0) {
      await db.goals.bulkPut(payload.data.goals);
    }
    if (payload.data.milestones?.length > 0) {
      await db.milestones.bulkPut(payload.data.milestones);
    }

    return {
      success: true,
      message: `Successfully imported ${payload.data.habits?.length ?? 0} habits and ${payload.data.habitLogs?.length ?? 0} logs.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to import data: ${err?.message || 'Database error'}`,
    };
  }
}

/**
 * Export Habit Logs as CSV format
 */
export async function exportLogsAsCSV(): Promise<string> {
  const habits = await db.habits.toArray();
  const logs = await db.habitLogs.toArray();
  const habitMap = new Map(habits.map(h => [h.id, h]));

  const headers = ['LogID', 'HabitName', 'Category', 'LocalDate', 'Value', 'Unit', 'Target', 'Status', 'Note', 'CompletedAt'];
  const rows = logs.map(l => {
    const h = habitMap.get(l.habitId);
    const habitName = h ? `"${h.name.replace(/"/g, '""')}"` : 'Unknown';
    const category = h ? h.categoryId : '';
    const unit = h ? h.unit : '';
    const target = h ? h.target : 1;
    const note = l.note ? `"${l.note.replace(/"/g, '""')}"` : '';
    const completedAt = l.completedAt || '';

    return [l.id, habitName, category, l.localDate, l.value, unit, target, l.completionStatus, note, completedAt].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger browser file download helper
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
