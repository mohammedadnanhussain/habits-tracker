import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { DailyReflection } from '../types/reflection';
import { useToast } from '../contexts/ToastContext';

export function useReflections(selectedDate?: string) {
  const { showToast } = useToast();

  const reflections = useLiveQuery(async () => {
    return await db.reflections.toArray();
  }, []);

  const currentReflection = useLiveQuery(async () => {
    if (!selectedDate) return undefined;
    return await db.reflections.where('localDate').equals(selectedDate).first();
  }, [selectedDate]);

  const saveReflection = async (reflectionData: Partial<DailyReflection> & { localDate: string }) => {
    try {
      const existing = await db.reflections.where('localDate').equals(reflectionData.localDate).first();
      const now = new Date().toISOString();

      const record: DailyReflection = {
        id: existing?.id || `ref_${reflectionData.localDate}`,
        localDate: reflectionData.localDate,
        mood: reflectionData.mood ?? existing?.mood,
        energy: reflectionData.energy ?? existing?.energy,
        focus: reflectionData.focus ?? existing?.focus,
        sleepHours: reflectionData.sleepHours ?? existing?.sleepHours,
        wins: reflectionData.wins ?? existing?.wins ?? '',
        obstacles: reflectionData.obstacles ?? existing?.obstacles ?? '',
        lessons: reflectionData.lessons ?? existing?.lessons ?? '',
        tomorrowPriority: reflectionData.tomorrowPriority ?? existing?.tomorrowPriority ?? '',
        notes: reflectionData.notes ?? existing?.notes ?? '',
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      await db.reflections.put(record);
      return record;
    } catch (err: any) {
      showToast(`Failed to save reflection: ${err.message}`, 'error');
      throw err;
    }
  };

  return {
    reflections: reflections || [],
    currentReflection,
    saveReflection,
  };
}
