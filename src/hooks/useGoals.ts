import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Goal, Milestone } from '../types/goal';
import { useToast } from '../contexts/ToastContext';

export function useGoals() {
  const { showToast } = useToast();

  const goals = useLiveQuery(async () => {
    return await db.goals.toArray();
  }, []);

  const milestones = useLiveQuery(async () => {
    return await db.milestones.toArray();
  }, []);

  const addGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = 'g_' + Date.now();
      const now = new Date().toISOString();
      const newGoal: Goal = {
        ...goalData,
        id,
        createdAt: now,
        updatedAt: now,
      };
      await db.goals.add(newGoal);
      showToast(`Goal set: ${newGoal.title}`, 'success');
      return newGoal;
    } catch (err: any) {
      showToast(`Failed to create goal: ${err.message}`, 'error');
      throw err;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      await db.goals.update(id, { ...updates, updatedAt: new Date().toISOString() });
      showToast('Goal updated', 'success');
    } catch (err: any) {
      showToast(`Failed to update goal: ${err.message}`, 'error');
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await db.goals.delete(id);
      showToast('Goal removed', 'info');
    } catch (err: any) {
      showToast(`Failed to delete goal: ${err.message}`, 'error');
    }
  };

  return {
    goals: goals || [],
    milestones: milestones || [],
    addGoal,
    updateGoal,
    deleteGoal,
  };
}
