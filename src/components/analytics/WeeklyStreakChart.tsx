import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DayInfo } from '../../lib/dates';
import { Habit, HabitLog } from '../../types/habit';
import { isHabitScheduledOnDate } from '../../lib/scheduling';
import { isLogCompleted, calculateHabitStreaks } from '../../lib/streaks';

interface WeeklyStreakChartProps {
  days: DayInfo[];
  habits: Habit[];
  logs: HabitLog[];
  selectedDate: string;
}

export const WeeklyStreakChart: React.FC<WeeklyStreakChartProps> = ({
  days,
  habits,
  logs,
  selectedDate,
}) => {
  const [chartMode, setChartMode] = useState<'daily' | 'streaks' | 'categories'>('daily');

  const logMap = new Map<string, HabitLog>();
  for (const l of logs) {
    logMap.set(`${l.habitId}_${l.localDate}`, l);
  }

  const activeHabits = habits.filter(h => h.status === 'active');
  const totalHabits = activeHabits.length || 1;

  // Mode 1: Daily Cadence (7-day bar + streak line)
  const dailyData = days.map(d => {
    const scheduled = activeHabits.filter(h => isHabitScheduledOnDate(h, d.date));
    const doneCount = scheduled.filter(h => isLogCompleted(h, logMap.get(`${h.id}_${d.date}`))).length;
    const rate = scheduled.length > 0 ? Math.round((doneCount / scheduled.length) * 100) : 0;

    let chains = 0;
    for (const h of activeHabits) {
      const st = calculateHabitStreaks(h, logs, d.date);
      if (st.currentStreak >= 2) chains++;
    }

    return {
      day: `${d.short} ${d.dayNum}`,
      date: d.date,
      rate,
      chains,
      isCurrentDay: d.date === selectedDate,
    };
  });

  // Mode 2: Habit Streaks (current streak vs week checkins)
  const streakData = activeHabits.map(h => {
    const st = calculateHabitStreaks(h, logs, selectedDate);
    let weekLogged = 0;
    for (const d of days) {
      if (isLogCompleted(h, logMap.get(`${h.id}_${d.date}`))) {
        weekLogged++;
      }
    }

    return {
      name: h.name.length > 20 ? h.name.slice(0, 18) + '…' : h.name,
      currentStreak: st.currentStreak,
      weekLogged,
    };
  });

  // Mode 3: By Pillar
  const categories = ['Body', 'Mind', 'Craft', 'Rest'];
  const categoryData = categories.map(cat => {
    const catHabits = activeHabits.filter(h => h.categoryId.toLowerCase().includes(cat.toLowerCase()));
    if (catHabits.length === 0) return { category: cat.toUpperCase(), rate: 0 };

    let completed = 0;
    let scheduled = 0;
    for (const d of days) {
      for (const h of catHabits) {
        if (isHabitScheduledOnDate(h, d.date)) {
          scheduled++;
          if (isLogCompleted(h, logMap.get(`${h.id}_${d.date}`))) {
            completed++;
          }
        }
      }
    }
    const rate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
    return { category: cat.toUpperCase(), rate };
  });

  // Insights computation
  let insightText = '';
  if (chartMode === 'daily') {
    const best = [...dailyData].sort((a, b) => b.rate - a.rate)[0];
    insightText = best
      ? `Peak cadence: ${best.day} reached ${best.rate}% completion with ${best.chains} simultaneous multi-day habit chains.`
      : 'Log rituals to track weekly cadence telemetry.';
  } else if (chartMode === 'streaks') {
    const top = streakData.length > 0 ? Math.max(...streakData.map(s => s.currentStreak)) : 0;
    insightText = `Streak leaderboard: Your longest unbroken chain stands at ${top} consecutive days.`;
  } else {
    insightText = `Pillar balance: Compare weekly adherence across Body, Mind, Craft, and Rest to spot where daily energy is concentrated.`;
  }

  return (
    <div className="instrument-card rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cobalt"></span>
            <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
              STREAK TELEMETRY
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-ink mt-0.5">
            Weekly Streak &amp; Completion Chart
          </h2>
        </div>

        <div className="instrument-inset rounded-lg p-1 flex items-center gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartMode('daily')}
            className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold transition ${
              chartMode === 'daily' ? 'bg-white text-ink shadow-xs font-bold' : 'text-steel hover:text-ink'
            }`}
          >
            7-Day Cadence
          </button>
          <button
            type="button"
            onClick={() => setChartMode('streaks')}
            className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold transition ${
              chartMode === 'streaks' ? 'bg-white text-ink shadow-xs font-bold' : 'text-steel hover:text-ink'
            }`}
          >
            Habit Streaks
          </button>
          <button
            type="button"
            onClick={() => setChartMode('categories')}
            className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold transition ${
              chartMode === 'categories' ? 'bg-white text-ink shadow-xs font-bold' : 'text-steel hover:text-ink'
            }`}
          >
            By Pillar
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-64 w-full">
        {chartMode === 'daily' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#5E7185', fontFamily: 'JetBrains Mono' }} />
              <YAxis yAxisId="left" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#5E7185', fontFamily: 'JetBrains Mono' }} unit="%" />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#B45309', fontFamily: 'JetBrains Mono' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
              <Bar yAxisId="left" dataKey="rate" name="Completion Rate (%)" fill="#2356F6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="chains" name="2+ Day Streaks" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: '#121C2B', stroke: '#F59E0B' }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {chartMode === 'streaks' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={streakData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#5E7185', fontFamily: 'JetBrains Mono' }} />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#121C2B', fontFamily: 'Inter' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
              <Bar dataKey="currentStreak" name="Active Streak (Days)" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              <Bar dataKey="weekLogged" name="Days Logged (This Week)" fill="#2356F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartMode === 'categories' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#121C2B', fontFamily: 'JetBrains Mono' }} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#5E7185', fontFamily: 'JetBrains Mono' }} unit="%" />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
              />
              <Bar dataKey="rate" name="Consistency (%)" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Insight Readout Box */}
      <div className="instrument-inset rounded-xl p-3 flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-cobalt/15 text-cobalt flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold">
          i
        </div>
        <p className="text-xs text-ink leading-relaxed">{insightText}</p>
      </div>
    </div>
  );
};
