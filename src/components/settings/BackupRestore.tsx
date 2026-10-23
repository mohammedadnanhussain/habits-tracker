import React, { useState } from 'react';
import {
  exportAllDataAsJSON,
  exportLogsAsCSV,
  downloadFile,
  validateBackupPayload,
  importDataPayload,
} from '../../lib/backup';
import { seedSampleHabits, clearAllUserData } from '../../lib/db';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Download, Upload, FileText, RotateCcw, AlertTriangle } from 'lucide-react';
import { getLocalToday } from '../../lib/dates';

export const BackupRestore: React.FC = () => {
  const { showToast } = useToast();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isWipeConfirmOpen, setIsWipeConfirmOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportJSON = async () => {
    try {
      const json = await exportAllDataAsJSON();
      const filename = `cadence_backup_${getLocalToday()}.json`;
      downloadFile(json, filename, 'application/json');
      showToast('JSON backup exported', 'success');
    } catch (err: any) {
      showToast(`Export failed: ${err.message}`, 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await exportLogsAsCSV();
      const filename = `cadence_logs_${getLocalToday()}.csv`;
      downloadFile(csv, filename, 'text/csv');
      showToast('CSV logs exported', 'success');
    } catch (err: any) {
      showToast(`CSV export failed: ${err.message}`, 'error');
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        showToast('Invalid JSON file format', 'error');
        return;
      }

      const validation = validateBackupPayload(parsed);
      if (!validation.valid || !validation.payload) {
        showToast(`Import rejected: ${validation.error}`, 'error');
        return;
      }

      const res = await importDataPayload(validation.payload, 'merge');
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(`Import error: ${err.message}`, 'error');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleRestoreDefaults = async () => {
    try {
      await clearAllUserData();
      await seedSampleHabits();
      setIsResetConfirmOpen(false);
      showToast('Console calibrated to sample studio presets', 'success');
    } catch (err: any) {
      showToast(`Reset failed: ${err.message}`, 'error');
    }
  };

  const handleWipeAll = async () => {
    try {
      await clearAllUserData();
      setIsWipeConfirmOpen(false);
      showToast('All habit logs and data permanently cleared', 'info');
    } catch (err: any) {
      showToast(`Wipe failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Backup and Data Mobility */}
      <div className="instrument-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
            LOCAL-FIRST DATA MOBILITY
          </span>
          <h3 className="font-display text-base font-bold text-ink mt-0.5">
            Export &amp; Disaster Recovery
          </h3>
          <p className="text-xs text-steel mt-1 leading-relaxed">
            All data resides securely in your computer's local browser IndexedDB storage. Generate regular JSON snapshots to ensure continuity across machine switches.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="tactile-btn p-3 rounded-xl bg-ink text-white font-mono text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Download size={16} />
            <span>Export JSON Archive</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="tactile-btn p-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-ink font-mono text-xs font-semibold flex items-center justify-center gap-2"
          >
            <FileText size={16} />
            <span>Export Logs (CSV)</span>
          </button>

          <label className="tactile-btn p-3 rounded-xl bg-cobalt hover:bg-cobalt-dark text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
            <Upload size={16} />
            <span>{isImporting ? 'Importing...' : 'Restore JSON Archive'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone / Reset */}
      <div className="instrument-card rounded-2xl p-5 sm:p-6 space-y-4 border-red-300">
        <div>
          <div className="flex items-center gap-1.5 text-red-600">
            <AlertTriangle size={16} />
            <span className="font-mono text-xs uppercase tracking-wider font-semibold">DANGER ZONE</span>
          </div>
          <h3 className="font-display text-base font-bold text-ink mt-0.5">
            Console Calibrations &amp; Reset
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="tactile-btn px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-ink font-mono text-xs font-semibold flex items-center gap-2"
          >
            <RotateCcw size={14} />
            <span>Load Sample Studio Habits</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWipeConfirmOpen(true)}
            className="tactile-btn px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-semibold"
          >
            Wipe Entire Database
          </button>
        </div>
      </div>

      {/* Modals */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Restore Default Console Data?"
        message="This will overwrite current habits, weekly logs, and field notes with the calibrated studio presets."
        confirmLabel="Restore Defaults"
        onConfirm={handleRestoreDefaults}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <ConfirmDialog
        isOpen={isWipeConfirmOpen}
        title="Permanently Delete All Data?"
        message="This will permanently delete all habits, records, reflections, and goals from local storage. This action cannot be undone."
        confirmLabel="Permanently Delete"
        isDestructive
        onConfirm={handleWipeAll}
        onCancel={() => setIsWipeConfirmOpen(false)}
      />
    </div>
  );
};
