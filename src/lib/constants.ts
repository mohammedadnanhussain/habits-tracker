import { Category, TrackingType } from '../types/habit';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_body', name: 'Body', color: '#10B981', sortOrder: 1 },
  { id: 'cat_mind', name: 'Mind', color: '#6366F1', sortOrder: 2 },
  { id: 'cat_craft', name: 'Craft', color: '#2356F6', sortOrder: 3 },
  { id: 'cat_rest', name: 'Rest', color: '#F59E0B', sortOrder: 4 },
  { id: 'cat_finance', name: 'Finance', color: '#059669', sortOrder: 5 },
  { id: 'cat_relation', name: 'Relations', color: '#EC4899', sortOrder: 6 },
];

export const TRACKING_TYPE_INFO: Record<TrackingType, { label: string; description: string; defaultUnit: string }> = {
  binary: {
    label: 'Done / Not Done',
    description: 'Simple binary checkmark for habits that either happened or did not.',
    defaultUnit: 'session',
  },
  quantified: {
    label: 'Numeric Target',
    description: 'Track towards a target with custom increments (e.g., 3.0 L water, 30 pages).',
    defaultUnit: 'units',
  },
  counter: {
    label: 'Tally Counter',
    description: 'Count occurrences with fast +1/-1 buttons (e.g., cups of coffee, pullups).',
    defaultUnit: 'reps',
  },
  duration: {
    label: 'Timer / Duration',
    description: 'Track minutes or hours with an integrated stopwatch/timer.',
    defaultUnit: 'min',
  },
  avoidance: {
    label: 'Habit Avoidance',
    description: 'Track resisting an unwanted behavior (e.g., zero junk food, no doomscrolling).',
    defaultUnit: 'day',
  },
  checklist: {
    label: 'Sub-task Checklist',
    description: 'Break a routine down into sequential steps (e.g., morning routine, shutdown ritual).',
    defaultUnit: 'steps',
  },
};

export const STORAGE_VERSION = 1;
export const DB_NAME = 'cadence_habit_db';
