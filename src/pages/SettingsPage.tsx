import React from 'react';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { BackupRestore } from '../components/settings/BackupRestore';
import { Settings } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings size={22} className="text-cobalt" />
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
            SYSTEM CONSOLE
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">
            Settings &amp; Disaster Recovery
          </h1>
        </div>
      </div>

      <SettingsPanel />
      <BackupRestore />
    </div>
  );
};
