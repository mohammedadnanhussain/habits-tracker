import React from 'react';
import { DEFAULT_CATEGORIES } from '../../lib/constants';

interface HabitFiltersProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export const HabitFilters: React.FC<HabitFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition ${
            selectedCategory === 'all'
              ? 'bg-ink text-white'
              : 'bg-slate-200/80 text-steel hover:text-ink'
          }`}
        >
          All
        </button>
        {DEFAULT_CATEGORIES.slice(0, 4).map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition ${
              selectedCategory === cat.id
                ? 'bg-ink text-white'
                : 'bg-slate-200/80 text-steel hover:text-ink'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <label htmlFor="statusFilter" className="font-mono text-[11px] text-steel">
          Show:
        </label>
        <select
          id="statusFilter"
          value={selectedStatus}
          onChange={e => onSelectStatus(e.target.value)}
          className="instrument-inset rounded-lg px-2.5 py-1.5 font-mono text-xs text-ink font-medium focus:outline-none focus:ring-2 focus:ring-cobalt"
        >
          <option value="all">All Goals</option>
          <option value="pending">Remaining Only</option>
          <option value="done">Completed Only</option>
        </select>
      </div>
    </div>
  );
};
