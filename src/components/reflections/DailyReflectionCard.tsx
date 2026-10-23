import React, { useState, useEffect } from 'react';
import { useReflections } from '../../hooks/useReflections';
import { parseLocalDate } from '../../lib/dates';
import { format } from 'date-fns';

interface DailyReflectionCardProps {
  selectedDate: string;
}

export const DailyReflectionCard: React.FC<DailyReflectionCardProps> = ({ selectedDate }) => {
  const { currentReflection, saveReflection } = useReflections(selectedDate);
  const [noteText, setNoteText] = useState('');
  const [showSavedBadge, setShowSavedBadge] = useState(false);

  useEffect(() => {
    setNoteText(currentReflection?.notes || currentReflection?.wins || '');
  }, [currentReflection, selectedDate]);

  const handleSave = async () => {
    await saveReflection({
      localDate: selectedDate,
      notes: noteText,
      wins: noteText,
    });
    setShowSavedBadge(true);
    setTimeout(() => setShowSavedBadge(false), 1800);
  };

  const parsedDate = parseLocalDate(selectedDate);
  const dayLabel = format(parsedDate, 'EEEE, MMM d');

  return (
    <div className="instrument-card rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-steel font-semibold">
            FIELD LOG // DAILY NOTE
          </span>
          <h3 className="font-display text-base font-bold text-ink">{dayLabel} Reflection</h3>
        </div>
        <span
          className={`font-mono text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded transition-opacity duration-200 ${
            showSavedBadge ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Saved
        </span>
      </div>

      <textarea
        rows={2}
        value={noteText}
        onChange={e => setNoteText(e.target.value)}
        onBlur={handleSave}
        placeholder="Record energy levels, friction points, or wins for this day..."
        className="w-full rounded-xl bg-white border border-slate-300 p-3 text-xs sm:text-sm text-ink placeholder-steel/70 focus:outline-none focus:ring-2 focus:ring-cobalt"
      />

      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-steel">Auto-syncs per selected day</span>
        <button
          type="button"
          onClick={handleSave}
          className="tactile-btn px-3 py-1.5 rounded-lg bg-ink text-white font-mono text-xs font-semibold hover:bg-slate-800"
        >
          Save Note
        </button>
      </div>
    </div>
  );
};
