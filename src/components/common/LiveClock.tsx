import React from 'react';
import { useLiveClock } from '../../hooks/useLiveClock';

export const LiveClock: React.FC = () => {
  const clock = useLiveClock();

  return (
    <div className="flex items-center gap-3 font-mono text-xs text-steel">
      <div className="flex items-center gap-1.5 bg-plate px-2.5 py-1 rounded-lg border border-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-bold text-ink">{clock.timeString}</span>
        <span className="text-[10px] text-steel">({clock.timeZone.split('/')[1] || clock.timeZone})</span>
      </div>
    </div>
  );
};
