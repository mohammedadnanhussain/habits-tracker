import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Theme, ClockFormat, WeekStartDay, StreakPolicy } from '../../types/settings';
import { useToast } from '../../contexts/ToastContext';
import { requestNotificationPermission, isNotificationSupported } from '../../lib/notifications';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, theme, setTheme } = useApp();
  const { showToast } = useToast();

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      if (!isNotificationSupported()) {
        showToast('Browser notifications are not supported in this environment', 'error');
        return;
      }
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        await updateSettings({ notificationsEnabled: true });
        showToast('Browser notifications enabled for habit cues', 'success');
      } else {
        showToast('Notification permission denied by browser', 'warning');
      }
    } else {
      await updateSettings({ notificationsEnabled: false });
      showToast('Notifications disabled', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile & Display Settings */}
      <div className="instrument-card rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="font-display text-base font-bold text-ink border-b border-slate-200 pb-2">
          Interface &amp; Display
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-xs font-semibold text-ink mb-1">
              Visual Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as Theme[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTheme(t);
                    updateSettings({ theme: t });
                  }}
                  className={`py-2 rounded-xl font-mono text-xs font-semibold capitalize border transition ${
                    theme === t
                      ? 'bg-ink text-white border-ink shadow-sm'
                      : 'bg-white text-steel border-slate-300 hover:text-ink'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold text-ink mb-1">
              Clock Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['12h', '24h'] as ClockFormat[]).map(cf => (
                <button
                  key={cf}
                  type="button"
                  onClick={() => updateSettings({ clockFormat: cf })}
                  className={`py-2 rounded-xl font-mono text-xs font-semibold border transition ${
                    settings.clockFormat === cf
                      ? 'bg-ink text-white border-ink shadow-sm'
                      : 'bg-white text-steel border-slate-300 hover:text-ink'
                  }`}
                >
                  {cf === '12h' ? '12-Hour (AM/PM)' : '24-Hour (Military)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Date & Time Settings */}
      <div className="instrument-card rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="font-display text-base font-bold text-ink border-b border-slate-200 pb-2">
          Calendar &amp; Timezone Calibration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-xs font-semibold text-ink mb-1">
              Detected IANA Time Zone
            </label>
            <div className="instrument-inset rounded-xl p-3 font-mono text-xs font-bold text-ink">
              {settings.timeZone}
            </div>
            <p className="text-[11px] text-steel mt-1">
              Automatically synchronized with your local computer clock.
            </p>
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold text-ink mb-1">
              Week Starts On
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ weekStartsOn: 1 })}
                className={`py-2 rounded-xl font-mono text-xs font-semibold border transition ${
                  settings.weekStartsOn === 1
                    ? 'bg-ink text-white border-ink shadow-sm'
                    : 'bg-white text-steel border-slate-300 hover:text-ink'
                }`}
              >
                Monday (Default)
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ weekStartsOn: 0 })}
                className={`py-2 rounded-xl font-mono text-xs font-semibold border transition ${
                  settings.weekStartsOn === 0
                    ? 'bg-ink text-white border-ink shadow-sm'
                    : 'bg-white text-steel border-slate-300 hover:text-ink'
                }`}
              >
                Sunday
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Streak Policy & Rules */}
      <div className="instrument-card rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="font-display text-base font-bold text-ink border-b border-slate-200 pb-2">
          Discipline &amp; Streak Rules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-xs font-semibold text-ink mb-1">
              Streak Calculation Policy
            </label>
            <select
              value={settings.streakPolicy}
              onChange={e => updateSettings({ streakPolicy: e.target.value as StreakPolicy })}
              className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-cobalt font-mono"
            >
              <option value="strict">Strict (100% target required)</option>
              <option value="lenient">Lenient (Partial completion counts)</option>
            </select>
            <p className="text-[11px] text-steel mt-1">
              Unscheduled rest days never break streaks under any policy.
            </p>
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold text-ink mb-1">
              Future Date Logging
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="futureLogCheck"
                checked={settings.allowFutureLogging}
                onChange={e => updateSettings({ allowFutureLogging: e.target.checked })}
                className="w-4 h-4 rounded text-cobalt focus:ring-cobalt border-slate-300"
              />
              <label htmlFor="futureLogCheck" className="text-xs text-ink font-medium">
                Allow advance logging for future dates
              </label>
            </div>
            <p className="text-[11px] text-steel mt-1">
              Disabled by default to prevent fictitious forward logging.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display text-sm font-bold text-ink">Habit Cue Reminders</h4>
              <p className="text-xs text-steel">
                Dispatches browser notifications for habits with configured trigger times.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationToggle(!settings.notificationsEnabled)}
              className={`tactile-btn px-4 py-2 rounded-xl font-mono text-xs font-semibold border ${
                settings.notificationsEnabled
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-steel border-slate-300 hover:text-ink'
              }`}
            >
              {settings.notificationsEnabled ? 'Enabled' : 'Enable Notifications'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
