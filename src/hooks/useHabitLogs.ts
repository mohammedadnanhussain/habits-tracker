import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Habit, HabitLog } from '../types/habit';
import { useToast } from '../contexts/ToastContext';
import { isLogCompleted } from '../lib/streaks';

export function useHabitLogs() {
  const { showToast } = useToast();

  const logs = useLiveQuery(async () => {
    return await db.habitLogs.toArray();
  }, []);

  const getLogForHabitAndDate = (habitId: string, localDate: string): HabitLog | undefined => {
    if (!logs) return undefined;
    return logs.find(l => l.habitId === habitId && l.localDate === localDate);
  };

  const toggleHabitOnDate = async (habit: Habit, localDate: string) => {
    const existing = await db.habitLogs
      .where('[habitId+localDate]')
      .equals([habit.id, localDate])
      .first();

    const isDone = isLogCompleted(habit, existing);
    const now = new Date().toISOString();

    if (isDone) {
      // Toggle off / clear
      const updatedLog: HabitLog = {
        id: existing?.id || `log_${habit.id}_${localDate}`,
        habitId: habit.id,
        localDate,
        value: 0,
        completionStatus: 'not_started',
        note: existing?.note || '',
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
      await db.habitLogs.put(updatedLog);
      showToast(`Cleared: ${habit.name}`, 'info');
    } else {
      // Toggle on / complete
      const updatedLog: HabitLog = {
        id: existing?.id || `log_${habit.id}_${localDate}`,
        habitId: habit.id,
        localDate,
        value: Number(habit.target || 1),
        completionStatus: 'completed',
        note: existing?.note || '',
        completedAt: now,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
      await db.habitLogs.put(updatedLog);
      showToast(`Completed: ${habit.name}`, 'success');
    }
  };

  const stepHabitValue = async (habit: Habit, localDate: string, direction: 1 | -1) => {
    const existing = await db.habitLogs
      .where('[habitId+localDate]')
      .equals([habit.id, localDate])
      .first();

    const currentVal = Number(existing?.value || 0);
    const stepVal = Number(habit.step || 1);
    const targetVal = Number(habit.target || 1);
    const nextVal = Math.max(0, Number((currentVal + direction * stepVal).toFixed(2)));
    const now = new Date().toISOString();

    const isCompleted = nextVal >= targetVal;

    const updatedLog: HabitLog = {
      id: existing?.id || `log_${habit.id}_${localDate}`,
      habitId: habit.id,
      localDate,
      value: nextVal,
      completionStatus: isCompleted ? 'completed' : nextVal > 0 ? 'partial' : 'not_started',
      note: existing?.note || '',
      completedAt: isCompleted ? (existing?.completedAt || now) : undefined,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await db.habitLogs.put(updatedLog);
    showToast(`${habit.name}: ${nextVal}/${targetVal} ${habit.unit}`, isCompleted ? 'success' : 'info');
  };

  const setHabitValue = async (habit: Habit, localDate: string, value: number, note?: string) => {
    const existing = await db.habitLogs
      .where('[habitId+localDate]')
      .equals([habit.id, localDate])
      .first();

    const targetVal = Number(habit.target || 1);
    const isCompleted = value >= targetVal;
    const now = new Date().toISOString();

    const updatedLog: HabitLog = {
      id: existing?.id || `log_${habit.id}_${localDate}`,
      habitId: habit.id,
      localDate,
      value,
      completionStatus: isCompleted ? 'completed' : value > 0 ? 'partial' : 'not_started',
      note: note !== undefined ? note : (existing?.note || ''),
      completedAt: isCompleted ? (existing?.completedAt || now) : undefined,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await db.habitLogs.put(updatedLog);
  };

  const markAllScheduledComplete = async (scheduledHabits: Habit[], localDate: string) => {
    const now = new Date().toISOString();
    const logsToPut: HabitLog[] = [];

    for (const habit of scheduledHabits) {
      logsToPut.push({
        id: `log_${habit.id}_${localDate}`,
        habitId: habit.id,
        localDate,
        value: Number(habit.target || 1),
        completionStatus: 'completed',
        note: '',
        completedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    await db.habitLogs.bulkPut(logsToPut);
    showToast(`All ${scheduledHabits.length} rituals marked complete for ${localDate}`, 'success');
  };

  return {
    logs: logs || [],
    isLoading: logs === undefined,
    getLogForHabitAndDate,
    toggleHabitOnDate,
    stepHabitValue,
    setHabitValue,
    markAllScheduledComplete,
  };
}
