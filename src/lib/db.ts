import Dexie, { type EntityTable } from 'dexie';
import { Habit, HabitLog, Category } from '../types/habit';
import { DailyReflection } from '../types/reflection';
import { Goal, Milestone } from '../types/goal';
import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';
import { DEFAULT_CATEGORIES, DB_NAME } from './constants';
import { getLocalToday, shiftDate } from './dates';

export interface SettingItem {
  key: string;
  value: any;
}

export class CadenceDatabase extends Dexie {
  habits!: EntityTable<Habit, 'id'>;
  habitLogs!: EntityTable<HabitLog, 'id'>;
  reflections!: EntityTable<DailyReflection, 'id'>;
  goals!: EntityTable<Goal, 'id'>;
  milestones!: EntityTable<Milestone, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  settings!: EntityTable<SettingItem, 'key'>;

  constructor() {
    super(DB_NAME);

    this.version(1).stores({
      habits: 'id, name, categoryId, status, createdAt',
      habitLogs: 'id, habitId, localDate, [habitId+localDate], completionStatus',
      reflections: 'id, &localDate',
      goals: 'id, status, deadline',
      milestones: 'id, type, unlockedAt',
      categories: 'id, name, sortOrder',
      settings: 'key',
    });
  }
}

export const db = new CadenceDatabase();

/**
 * Initialize default categories if table is empty
 */
export async function initializeDatabaseDefaults() {
  const catCount = await db.categories.count();
  if (catCount === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  }

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await db.settings.put({ key, value });
    }
  }

  const habitCount = await db.habits.count();
  const initFlag = await db.settings.get('has_initialized');
  if (habitCount === 0 && !initFlag) {
    await seedSampleHabits();
    await db.settings.put({ key: 'has_initialized', value: true });
  }
}

/**
 * Seeds optional high-fidelity sample habits calibrated to the user's current week/dates
 * (Inspired by the reference data, but dynamically assigned to actual current dates)
 */
export async function seedSampleHabits() {
  const today = getLocalToday();

  // Create 6 habits matching the reference
  const sampleHabits: Habit[] = [
    {
      id: 'h_deepwork',
      name: '90m Uninterrupted Deep Work',
      description: 'Flight mode block dedicated to high-leverage craft & engineering.',
      categoryId: 'cat_craft',
      trackingType: 'quantified',
      target: 90,
      step: 30,
      unit: 'min',
      schedule: { type: 'daily' },
      startDate: shiftDate(today, -14),
      preferredTime: 'morning',
      priority: 'high',
      estimatedMinutes: 90,
      triggerCue: '08:30 AM // Flight Mode Block',
      notes: 'No communications allowed during this window.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'h_hydrate',
      name: 'Electrolyte & Water Intake',
      description: 'Daily cellular hydration goal.',
      categoryId: 'cat_body',
      trackingType: 'quantified',
      target: 3.0,
      step: 0.5,
      unit: 'L',
      schedule: { type: 'daily' },
      startDate: shiftDate(today, -14),
      preferredTime: 'anytime',
      priority: 'medium',
      triggerCue: 'Throughout day // Carafe on desk',
      notes: 'Add pinch of Celtic sea salt in morning.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'h_mobility',
      name: 'Morning Thoracic & Hip Mobility',
      description: '15-minute spine, hip, and ankle activation flow.',
      categoryId: 'cat_body',
      trackingType: 'binary',
      target: 1,
      step: 1,
      unit: 'session',
      schedule: { type: 'daily' },
      startDate: shiftDate(today, -14),
      preferredTime: 'morning',
      priority: 'high',
      triggerCue: '07:00 AM // Upon waking',
      notes: 'Follow daily routine.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'h_reading',
      name: 'Non-Screen Technical / Book Reading',
      description: 'Physical book reading session before wind-down.',
      categoryId: 'cat_mind',
      trackingType: 'quantified',
      target: 30,
      step: 10,
      unit: 'pg',
      schedule: { type: 'daily' },
      startDate: shiftDate(today, -14),
      preferredTime: 'evening',
      priority: 'medium',
      triggerCue: '21:30 PM // Analog lamp hour',
      notes: 'Paper books only, zero backlights.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'h_nosugar',
      name: 'Zero Refined Sugar & Late Caffeine',
      description: 'Caffeine cutoff at 14:00 and clean evening nutrition.',
      categoryId: 'cat_rest',
      trackingType: 'avoidance',
      target: 1,
      step: 1,
      unit: 'day',
      schedule: { type: 'daily' },
      startDate: shiftDate(today, -14),
      preferredTime: 'afternoon',
      priority: 'high',
      triggerCue: 'Cut-off at 14:00 PM',
      notes: 'Protects deep sleep stages.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'h_journal',
      name: 'Evening Shutdown & Priority Triad',
      description: 'Desk clear-down and selection of tomorrow’s 3 primary outcomes.',
      categoryId: 'cat_mind',
      trackingType: 'binary',
      target: 1,
      step: 1,
      unit: 'entry',
      schedule: { type: 'daily' },
      startDate: shiftDate(today, -14),
      preferredTime: 'evening',
      priority: 'medium',
      triggerCue: '18:30 PM // Desk clear-down',
      notes: 'Close all work tabs before leaving desk.',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  await db.habits.bulkPut(sampleHabits);

  // Generate dynamic logs for the past 12 days up to today
  const sampleLogs: HabitLog[] = [];
  for (let i = 12; i >= 0; i--) {
    const curDate = shiftDate(today, -i);
    const isToday = i === 0;

    // Deepwork: 90min every day except 3 days ago (60min)
    const dwVal = i === 3 ? 60 : 90;
    sampleLogs.push({
      id: `log_dw_${curDate}`,
      habitId: 'h_deepwork',
      localDate: curDate,
      value: dwVal,
      completionStatus: dwVal >= 90 ? 'completed' : 'partial',
      note: 'Solid focus block',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Hydration: 3.0L mostly, 2.5L today and 4 days ago
    const hyVal = isToday || i === 4 ? 2.5 : 3.0;
    sampleLogs.push({
      id: `log_hy_${curDate}`,
      habitId: 'h_hydrate',
      localDate: curDate,
      value: hyVal,
      completionStatus: hyVal >= 3.0 ? 'completed' : 'partial',
      note: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Mobility: Completed every day
    sampleLogs.push({
      id: `log_mob_${curDate}`,
      habitId: 'h_mobility',
      localDate: curDate,
      value: 1,
      completionStatus: 'completed',
      note: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Reading: 30 pages usually, 10 today
    const rdVal = isToday ? 10 : i === 2 ? 20 : 30;
    sampleLogs.push({
      id: `log_rd_${curDate}`,
      habitId: 'h_reading',
      localDate: curDate,
      value: rdVal,
      completionStatus: rdVal >= 30 ? 'completed' : 'partial',
      note: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // No sugar: completed most days, pending/0 today
    const nsVal = isToday ? 0 : 1;
    sampleLogs.push({
      id: `log_ns_${curDate}`,
      habitId: 'h_nosugar',
      localDate: curDate,
      value: nsVal,
      completionStatus: nsVal === 1 ? 'completed' : 'not_started',
      note: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Journal: completed except 2 days ago
    const jrVal = i === 2 ? 0 : 1;
    sampleLogs.push({
      id: `log_jr_${curDate}`,
      habitId: 'h_journal',
      localDate: curDate,
      value: jrVal,
      completionStatus: jrVal === 1 ? 'completed' : 'not_started',
      note: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  await db.habitLogs.bulkPut(sampleLogs);

  // Sample reflections
  await db.reflections.put({
    id: `ref_${today}`,
    localDate: today,
    mood: 5,
    energy: 4,
    focus: 5,
    sleepHours: 7.5,
    wins: 'Finished the architecture console and locked in deep work.',
    obstacles: 'Afternoon hydration slipped slightly.',
    lessons: 'Starting the morning with mobility creates instant momentum.',
    tomorrowPriority: 'Ship the next feature sprint.',
    notes: 'Feeling sharp and focused.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Wipe all habit and log data completely
 */
export async function clearAllUserData() {
  await db.habits.clear();
  await db.habitLogs.clear();
  await db.reflections.clear();
  await db.goals.clear();
  await db.milestones.clear();
  await db.settings.put({ key: 'has_initialized', value: true });
}
