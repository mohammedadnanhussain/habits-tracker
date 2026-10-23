import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useReflections } from '../hooks/useReflections';
import { DailyReflectionCard } from '../components/reflections/DailyReflectionCard';
import { parseLocalDate } from '../lib/dates';
import { BookOpen, Search, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export const ReflectionsPage: React.FC = () => {
  const { selectedDate, setSelectedDate } = useApp();
  const { reflections } = useReflections();
  const [searchQuery, setSearchQuery] = useState('');

  const sortedReflections = [...reflections]
    .filter(r => r.notes?.trim() || r.wins?.trim())
    .sort((a, b) => b.localDate.localeCompare(a.localDate))
    .filter(r => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.localDate.includes(q) ||
        r.notes?.toLowerCase().includes(q) ||
        r.wins?.toLowerCase().includes(q) ||
        r.obstacles?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6">
      {/* Active Day Reflection Card */}
      <DailyReflectionCard selectedDate={selectedDate} />

      {/* Historical Journal Archive */}
      <div className="instrument-card rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-cobalt" />
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
                ARCHIVE
              </span>
              <h2 className="font-display text-lg font-bold text-ink">Field Notes &amp; Journal</h2>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search field notes..."
              className="w-full bg-white rounded-xl pl-9 pr-3 py-1.5 text-xs text-ink border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cobalt placeholder-steel"
            />
          </div>
        </div>

        {/* Entries list */}
        <div className="space-y-3">
          {sortedReflections.length === 0 ? (
            <div className="instrument-inset rounded-xl p-8 text-center space-y-1">
              <p className="font-display text-sm font-bold text-ink">No historical journal entries</p>
              <p className="text-xs text-steel">Save notes in the active reflection box above to build your journal.</p>
            </div>
          ) : (
            sortedReflections.map(r => {
              const d = parseLocalDate(r.localDate);
              const label = format(d, 'EEEE, MMMM d, yyyy');
              const isSelected = r.localDate === selectedDate;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedDate(r.localDate)}
                  className={`instrument-inset rounded-xl p-4 transition cursor-pointer border ${
                    isSelected ? 'border-cobalt/60 bg-white ring-1 ring-cobalt' : 'border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-cobalt" />
                      <span className="font-mono text-xs font-bold text-ink">{label}</span>
                    </div>
                    {isSelected && (
                      <span className="font-mono text-[10px] text-cobalt font-bold bg-cobalt/10 px-2 py-0.5 rounded">
                        Active Day
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-ink leading-relaxed">
                    {r.notes || r.wins}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
