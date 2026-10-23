import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Habit } from '../types/habit';
import { useToast } from '../contexts/ToastContext';

export function useHabits() {
  const { showToast } = useToast();

  const habits = useLiveQuery(async () => {
    return await db.habits.toArray();
  }, []);

  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = 'h_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      const now = new Date().toISOString();
      const newHabit: Habit = {
        ...habitData,
        id,
        createdAt: now,
        updatedAt: now,
      };
      await db.habits.add(newHabit);
      showToast(`Created ritual: ${newHabit.name}`, 'success');
      return newHabit;
    } catch (err: any) {
      showToast(`Failed to create habit: ${err.message}`, 'error');
      throw err;
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    try {
      const now = new Date().toISOString();
      await db.habits.update(id, { ...updates, updatedAt: now });
      showToast('Goal updated', 'success');
    } catch (err: any) {
      showToast(`Failed to update habit: ${err.message}`, 'error');
      throw err;
    }
  };

  const archiveHabit = async (id: string) => {
    try {
      await db.habits.update(id, { status: 'archived', updatedAt: new Date().toISOString() });
      showToast('Habit archived', 'info');
    } catch (err: any) {
      showToast(`Failed to archive habit: ${err.message}`, 'error');
    }
  };

  const restoreHabit = async (id: string) => {
    try {
      await db.habits.update(id, { status: 'active', updatedAt: new Date().toISOString() });
      showToast('Habit restored', 'success');
    } catch (err: any) {
      showToast(`Failed to restore habit: ${err.message}`, 'error');
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      await db.habits.delete(id);
      // Also delete logs associated with habit
      await db.habitLogs.where('habitId').equals(id).delete();
      showToast('Daily goal deleted', 'info');
    } catch (err: any) {
      showToast(`Failed to delete habit: ${err.message}`, 'error');
    }
  };

  return {
    habits: habits || [],
    isLoading: habits === undefined,
    addHabit,
    updateHabit,
    archiveHabit,
    restoreHabit,
    deleteHabit,
  };
}
