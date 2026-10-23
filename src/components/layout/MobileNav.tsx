import React from 'react';
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  BarChart3,
  Settings,
} from 'lucide-react';

const mobileNavItems = [
  { to: '/', label: 'Console', icon: LayoutDashboard },
  { to: '/today', label: 'Log', icon: CheckSquare },
  { to: '/streaks', label: 'Streaks', icon: Flame },
  { to: '/analytics', label: 'Charts', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const MobileNav: React.FC = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-plate border-t border-slate-300 px-3 py-2 flex items-center justify-around shadow-lg">
      {mobileNavItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg font-mono text-[10px] font-semibold transition ${
              isActive ? 'text-cobalt font-bold' : 'text-steel'
            }`
          }
        >
          <Icon size={18} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
