import React, { useState, useEffect } from 'react';
import { Goal, GoalStatus } from '../../types/goal';
import { Habit } from '../../types/habit';
import { X } from 'lucide-react';

interface GoalFormProps {
  isOpen: boolean;
  goalToEdit?: Goal | null;
  habits: Habit[];
  onClose: () => void;
  onSave: (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const GoalForm: React.FC<GoalFormProps> = ({
  isOpen,
  goalToEdit,
  habits,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState<number>(100);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState('days');
  const [deadline, setDeadline] = useState('');
  const [linkedHabitIds, setLinkedHabitIds] = useState<string[]>([]);
  const [status, setStatus] = useState<GoalStatus>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setDescription(goalToEdit.description || '');
      setTargetValue(goalToEdit.targetValue);
      setCurrentValue(goalToEdit.currentValue);
      setUnit(goalToEdit.unit);
      setDeadline(goalToEdit.deadline || '');
      setLinkedHabitIds(goalToEdit.linkedHabitIds || []);
      setStatus(goalToEdit.status);
    } else {
      setTitle('');
      setDescription('');
      setTargetValue(30);
      setCurrentValue(0);
      setUnit('days');
      setDeadline('');
      setLinkedHabitIds([]);
      setStatus('active');
    }
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        targetValue: Number(targetValue) || 1,
        currentValue: Number(currentValue) || 0,
        unit: unit.trim() || 'units',
        deadline: deadline || undefined,
        linkedHabitIds,
        status,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLinkedHabit = (habitId: string) => {
    setLinkedHabitIds(prev =>
      prev.includes(habitId) ? prev.filter(id => id !== habitId) : [...prev, habitId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="instrument-card rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 border-2 border-ink animate-pop my-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-cobalt font-bold">
              MILESTONE TARGET
            </span>
            <h3 className="font-display text-lg font-bold text-ink">
              {goalToEdit ? 'Configure Goal' : 'Create New Target Goal'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-ink font-mono text-sm font-bold flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-semibold text-ink mb-1">Goal Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., 30-Day Deep Work Lock-in"
              className="w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-cobalt"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold text-ink mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What milestone does this goal represent?"
              className="w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-cobalt"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-mono text-[11px] font-semibold text-ink mb-1">Target</label>
              <input
                type="number"
                min="1"
                value={targetValue}
                onChange={e => setTargetValue(parseFloat(e.target.value) || 1)}
                className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-sm font-mono text-ink"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] font-semibold text-ink mb-1">Current</label>
              <input
                type="number"
                min="0"
                value={currentValue}
                onChange={e => setCurrentValue(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-sm font-mono text-ink"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] font-semibold text-ink mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-sm font-mono text-ink"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold text-ink mb-1">Target Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-sm font-mono text-ink"
            />
          </div>

          {/* Linked Habits */}
          {habits.length > 0 && (
            <div>
              <label className="block font-mono text-xs font-semibold text-ink mb-1.5">
                Link Supporting Rituals:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-100 rounded-xl border border-slate-300">
                {habits.map(h => {
                  const isSelected = linkedHabitIds.includes(h.id);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => toggleLinkedHabit(h.id)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-xs transition ${
                        isSelected
                          ? 'bg-cobalt text-white font-bold'
                          : 'bg-white text-steel hover:text-ink border border-slate-300'
                      }`}
                    >
                      {h.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-ink font-mono text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="tactile-btn px-5 py-2 rounded-xl bg-cobalt hover:bg-cobalt-dark text-white font-display text-xs sm:text-sm font-semibold"
            >
              {isSubmitting ? 'Saving...' : 'Save Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
