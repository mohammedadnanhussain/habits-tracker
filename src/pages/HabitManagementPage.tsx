import React, { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { HabitForm } from '../components/habits/HabitForm';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Habit, HabitStatus } from '../types/habit';
import { TRACKING_TYPE_INFO } from '../lib/constants';
import { Sliders, Plus, Edit, Archive, RotateCcw, Trash2 } from 'lucide-react';

export const HabitManagementPage: React.FC = () => {
  const { habits, addHabit, updateHabit, archiveHabit, restoreHabit, deleteHabit } = useHabits();
  const [activeTab, setActiveTab] = useState<HabitStatus>('active');
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const filteredHabits = habits.filter(h => h.status === activeTab);

  const handleEdit = (h: Habit) => {
    setHabitToEdit(h);
    setIsHabitModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="instrument-card rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sliders size={20} className="text-cobalt" />
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
              REGISTRY CONFIGURATION
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">
              Habit Management Console
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setHabitToEdit(null);
            setIsHabitModalOpen(true);
          }}
          className="tactile-btn px-4 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt-dark text-white font-display font-semibold text-xs sm:text-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Daily Goal</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="instrument-inset rounded-xl p-1 inline-flex items-center gap-1">
        {(['active', 'paused', 'archived'] as HabitStatus[]).map(tab => {
          const count = habits.filter(h => h.status === tab).length;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold capitalize transition ${
                activeTab === tab
                  ? 'bg-ink text-white shadow-xs font-bold'
                  : 'text-steel hover:text-ink'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Habits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHabits.length === 0 ? (
          <div className="col-span-full instrument-card rounded-2xl p-8 text-center space-y-1">
            <p className="font-display text-sm font-bold text-ink">
              No {activeTab} habits in registry
            </p>
          </div>
        ) : (
          filteredHabits.map(habit => (
            <div
              key={habit.id}
              className="instrument-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-plate border border-slate-300 font-semibold uppercase text-steel">
                    {habit.categoryId.replace(/^cat_/, '')}
                  </span>
                  <span className="font-mono text-[11px] text-steel">
                    {TRACKING_TYPE_INFO[habit.trackingType]?.label}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-ink mt-2">{habit.name}</h3>
                {habit.description && (
                  <p className="text-xs text-steel mt-0.5 leading-relaxed">{habit.description}</p>
                )}
                {habit.triggerCue && (
                  <div className="mt-2 font-mono text-xs text-cobalt flex items-center gap-1">
                    <span>Cue:</span>
                    <span>{habit.triggerCue}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="font-mono text-xs text-steel">
                  Target: {habit.target} {habit.unit} / {habit.schedule?.type}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleEdit(habit)}
                    className="p-1.5 rounded-lg text-steel hover:text-ink hover:bg-slate-200/70"
                    title="Edit Habit"
                  >
                    <Edit size={16} />
                  </button>

                  {habit.status === 'active' ? (
                    <button
                      type="button"
                      onClick={() => archiveHabit(habit.id)}
                      className="p-1.5 rounded-lg text-steel hover:text-amber hover:bg-amber/10"
                      title="Archive Habit"
                    >
                      <Archive size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => restoreHabit(habit.id)}
                      className="p-1.5 rounded-lg text-steel hover:text-emerald-600 hover:bg-emerald-50"
                      title="Restore to Active"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setHabitToDelete(habit)}
                    className="p-1.5 rounded-lg text-steel hover:text-red-600 hover:bg-red-50"
                    title="Delete Habit"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Habit Create/Edit Modal */}
      <HabitForm
        isOpen={isHabitModalOpen}
        habitToEdit={habitToEdit}
        onClose={() => setIsHabitModalOpen(false)}
        onSave={async data => {
          if (habitToEdit) await updateHabit(habitToEdit.id, data);
          else await addHabit(data);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!habitToDelete}
        title={`Delete "${habitToDelete?.name}"?`}
        message="This will permanently delete this habit and all its historical logging records from the database."
        confirmLabel="Permanently Delete"
        isDestructive
        onConfirm={async () => {
          if (habitToDelete) {
            await deleteHabit(habitToDelete.id);
            setHabitToDelete(null);
          }
        }}
        onCancel={() => setHabitToDelete(null)}
      />
    </div>
  );
};
