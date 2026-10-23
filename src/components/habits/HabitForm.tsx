import React, { useState, useEffect } from 'react';
import { Habit, TrackingType, TimeOfDay, Priority, ScheduleType } from '../../types/habit';
import { DEFAULT_CATEGORIES, TRACKING_TYPE_INFO } from '../../lib/constants';
import { getLocalToday } from '../../lib/dates';
import { X } from 'lucide-react';

interface HabitFormProps {
  isOpen: boolean;
  habitToEdit?: Habit | null;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const HabitForm: React.FC<HabitFormProps> = ({
  isOpen,
  habitToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('cat_body');
  const [trackingType, setTrackingType] = useState<TrackingType>('binary');
  const [target, setTarget] = useState<number>(1);
  const [step, setStep] = useState<number>(1);
  const [unit, setUnit] = useState('session');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);
  const [startDate, setStartDate] = useState(getLocalToday());
  const [endDate, setEndDate] = useState('');
  const [triggerCue, setTriggerCue] = useState('');
  const [preferredTime, setPreferredTime] = useState<TimeOfDay>('morning');
  const [priority, setPriority] = useState<Priority>('medium');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || '');
      setCategoryId(habitToEdit.categoryId);
      setTrackingType(habitToEdit.trackingType);
      setTarget(habitToEdit.target);
      setStep(habitToEdit.step);
      setUnit(habitToEdit.unit);
      setScheduleType(habitToEdit.schedule?.type || 'daily');
      setSelectedDays(habitToEdit.schedule?.days || [1, 2, 3, 4, 5]);
      setDaysPerWeek(habitToEdit.schedule?.daysPerWeek || 5);
      setStartDate(habitToEdit.startDate || getLocalToday());
      setEndDate(habitToEdit.endDate || '');
      setTriggerCue(habitToEdit.triggerCue || '');
      setPreferredTime(habitToEdit.preferredTime || 'morning');
      setPriority(habitToEdit.priority || 'medium');
      setNotes(habitToEdit.notes || '');
    } else {
      setName('');
      setDescription('');
      setCategoryId('cat_body');
      setTrackingType('binary');
      setTarget(1);
      setStep(1);
      setUnit('session');
      setScheduleType('daily');
      setSelectedDays([1, 2, 3, 4, 5]);
      setDaysPerWeek(5);
      setStartDate(getLocalToday());
      setEndDate('');
      setTriggerCue('');
      setPreferredTime('morning');
      setPriority('medium');
      setNotes('');
    }
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        categoryId,
        trackingType,
        target: Number(target) || 1,
        step: Number(step) || 1,
        unit: unit.trim() || 'units',
        schedule: {
          type: scheduleType,
          days: scheduleType === 'specific_days' ? selectedDays : undefined,
          daysPerWeek: scheduleType === 'x_per_week' ? Number(daysPerWeek) : undefined,
        },
        startDate,
        endDate: endDate || undefined,
        triggerCue: triggerCue.trim(),
        preferredTime,
        priority,
        notes: notes.trim(),
        status: habitToEdit?.status || 'active',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev =>
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="instrument-card rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 border-2 border-ink animate-pop my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-cobalt font-bold">
              RITUAL CONFIGURATION
            </span>
            <h3 className="font-display text-lg font-bold text-ink">
              {habitToEdit ? 'Configure Daily Goal' : 'Configure New Daily Goal'}
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
            <label className="block font-mono text-xs font-semibold text-ink mb-1">
              Goal / Habit Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Deep Architecture Work"
              className="w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-cobalt"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs font-semibold text-ink mb-1">Pillar Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-cobalt"
              >
                {DEFAULT_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs font-semibold text-ink mb-1">Tracking Mode</label>
              <select
                value={trackingType}
                onChange={e => {
                  const t = e.target.value as TrackingType;
                  setTrackingType(t);
                  setUnit(TRACKING_TYPE_INFO[t].defaultUnit);
                }}
                className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-cobalt"
              >
                <option value="binary">Checkmark (Done / Not Done)</option>
                <option value="quantified">Numeric Target (Steps / Units)</option>
                <option value="counter">Tally Counter (+1 / -1)</option>
                <option value="duration">Timer / Duration (Minutes)</option>
                <option value="avoidance">Avoidance (Bad Habit Resisted)</option>
              </select>
            </div>
          </div>

          {/* Quantified/Counter/Duration fields */}
          {trackingType !== 'binary' && trackingType !== 'avoidance' && (
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-200/60 border border-slate-300">
              <div>
                <label className="block font-mono text-[11px] font-semibold text-ink mb-1">Daily Target</label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={target}
                  onChange={e => setTarget(parseFloat(e.target.value) || 1)}
                  className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-sm font-mono text-ink"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] font-semibold text-ink mb-1">Increment (+)</label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={step}
                  onChange={e => setStep(parseFloat(e.target.value) || 1)}
                  className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-sm font-mono text-ink"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] font-semibold text-ink mb-1">Unit Label</label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="L, min, pg"
                  className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-sm font-mono text-ink"
                />
              </div>
            </div>
          )}

          {/* Schedule Configuration */}
          <div className="p-3 rounded-xl bg-plate border border-slate-300 space-y-2">
            <label className="block font-mono text-xs font-semibold text-ink">Schedule & Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScheduleType('daily')}
                className={`py-1.5 px-2 rounded-lg font-mono text-xs font-semibold border ${
                  scheduleType === 'daily'
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-steel border-slate-300 hover:text-ink'
                }`}
              >
                Every Day
              </button>
              <button
                type="button"
                onClick={() => setScheduleType('specific_days')}
                className={`py-1.5 px-2 rounded-lg font-mono text-xs font-semibold border ${
                  scheduleType === 'specific_days'
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-steel border-slate-300 hover:text-ink'
                }`}
              >
                Specific Days
              </button>
              <button
                type="button"
                onClick={() => setScheduleType('x_per_week')}
                className={`py-1.5 px-2 rounded-lg font-mono text-xs font-semibold border ${
                  scheduleType === 'x_per_week'
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-steel border-slate-300 hover:text-ink'
                }`}
              >
                X Days / Wk
              </button>
            </div>

            {scheduleType === 'specific_days' && (
              <div className="flex items-center justify-between gap-1 pt-1">
                {dayNames.map((name, idx) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`flex-1 py-1 rounded text-xs font-mono font-bold border ${
                      selectedDays.includes(idx)
                        ? 'bg-cobalt border-cobalt text-white'
                        : 'bg-white border-slate-300 text-steel hover:border-slate-400'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {scheduleType === 'x_per_week' && (
              <div className="flex items-center gap-2 pt-1">
                <span className="font-mono text-xs text-steel">Target:</span>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={daysPerWeek}
                  onChange={e => setDaysPerWeek(parseInt(e.target.value, 10) || 1)}
                  className="w-16 rounded-lg bg-white border border-slate-300 px-2 py-1 text-sm font-mono text-ink"
                />
                <span className="font-mono text-xs text-steel">days per week</span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold text-ink mb-1">
              Trigger Cue / Time Window (Optional)
            </label>
            <input
              type="text"
              value={triggerCue}
              onChange={e => setTriggerCue(e.target.value)}
              placeholder="e.g., 07:30 AM // Upon waking"
              className="w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-cobalt"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs font-semibold text-ink mb-1">Preferred Time</label>
              <select
                value={preferredTime}
                onChange={e => setPreferredTime(e.target.value as TimeOfDay)}
                className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-cobalt"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs font-semibold text-ink mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-cobalt"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
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
              {isSubmitting ? 'Saving...' : 'Save Daily Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
