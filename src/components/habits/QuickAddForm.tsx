import React, { useState } from 'react';

interface QuickAddFormProps {
  onQuickAdd: (title: string, categoryId: string) => Promise<void>;
}

export const QuickAddForm: React.FC<QuickAddFormProps> = ({ onQuickAdd }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('cat_body');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onQuickAdd(title.trim(), category);
      setTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="instrument-inset rounded-xl p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
    >
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Quick-add a daily ritual (e.g., 20m Evening Walk)..."
        className="flex-1 bg-white rounded-lg px-3 py-2 text-sm text-ink placeholder-steel/70 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cobalt"
        required
      />
      <div className="flex items-center gap-2">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          aria-label="Quick add category"
          className="bg-white rounded-lg px-2.5 py-2 font-mono text-xs text-ink border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cobalt"
        >
          <option value="cat_body">Body</option>
          <option value="cat_mind">Mind</option>
          <option value="cat_craft">Craft</option>
          <option value="cat_rest">Rest</option>
        </select>
        <button
          type="submit"
          disabled={isSubmitting}
          className="tactile-btn px-3.5 py-2 rounded-lg bg-ink hover:bg-slate-800 text-white font-mono text-xs font-semibold whitespace-nowrap"
        >
          {isSubmitting ? 'Adding...' : '+ Quick Log'}
        </button>
      </div>
    </form>
  );
};
