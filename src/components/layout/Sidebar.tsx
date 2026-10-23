import React from 'react';
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Calendar,
  Flame,
  BarChart3,
  BookOpen,
  Trophy,
  Sliders,
  Settings,
} from 'lucide-react';
import { LiveClock } from '../common/LiveClock';

const navItems = [
  { to: '/', label: 'Console Dashboard', icon: LayoutDashboard },
  { to: '/today', label: 'Daily Logging Deck', icon: CheckSquare },
  { to: '/weekly', label: 'Weekly Tracker', icon: CalendarDays },
  { to: '/calendar', label: 'Calendar & Heatmap', icon: Calendar },
  { to: '/streaks', label: 'Streak Matrix', icon: Flame },
  { to: '/analytics', label: 'Telemetry & Charts', icon: BarChart3 },
  { to: '/reflections', label: 'Field Notes & Journal', icon: BookOpen },
  { to: '/goals', label: 'Goals & Milestones', icon: Trophy },
  { to: '/habits', label: 'Habit Management', icon: Sliders },
  { to: '/settings', label: 'Settings & Backup', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 instrument-card rounded-2xl p-4 m-4 mr-0 border-r border-slate-300 space-y-5">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 pt-1 pb-2 border-b border-slate-200">
        <div className="w-10 h-10 rounded-xl bg-ink text-white flex flex-col items-center justify-center shrink-0 border border-slate-700 shadow-inner">
          <span className="font-mono text-[9px] tracking-widest text-amber font-semibold leading-none">CAD</span>
          <span className="font-display font-bold text-sm leading-tight mt-0.5">04</span>
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-ink/10 text-ink font-semibold">
            CADENCE
          </span>
          <h2 className="font-display text-sm font-bold text-ink">Streak Console</h2>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl font-mono text-xs font-semibold transition ${
                isActive
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-steel hover:text-ink hover:bg-slate-200/70'
              }`
            }
          >
            <Icon size={16} strokeWidth={2} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Live Clock Strip in Sidebar */}
      <div className="pt-3 border-t border-slate-200 flex flex-col gap-1.5">
        <span className="font-mono text-[10px] text-steel uppercase tracking-wider px-2">Local System Time</span>
        <LiveClock />
      </div>
    </aside>
  );
};
