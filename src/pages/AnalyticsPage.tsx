import React, { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { useHabitLogs } from '../hooks/useHabitLogs';
import { computeDailyCompletionTrend, computePillarConsistency } from '../lib/analytics';
import { getWeekDays, getLocalToday } from '../lib/dates';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Award } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { habits } = useHabits();
  const { logs } = useHabitLogs();
  const [trendDays, setTrendDays] = useState<7 | 14 | 30>(30);

  const today = getLocalToday();
  const weekDays = getWeekDays(today, 1);
  const trendData = computeDailyCompletionTrend(habits, logs, trendDays, today);
  const pillarData = computePillarConsistency(habits, logs, weekDays, today);

  const PILLAR_COLORS = ['#10B981', '#6366F1', '#2356F6', '#F59E0B'];

  return (
    <div className="space-y-6">
      {/* 30-Day Completion Trend */}
      <div className="instrument-card rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-cobalt" />
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-steel font-semibold">
                CHRONOLOGICAL CADENCE
              </span>
              <h2 className="font-display text-lg font-bold text-ink">
                Completion Trend Velocity
              </h2>
            </div>
          </div>

          <div className="instrument-inset rounded-xl p-1 flex items-center gap-1 self-start sm:self-auto">
            {([7, 14, 30] as const).map(days => (
              <button
                key={days}
                type="button"
                onClick={() => setTrendDays(days)}
                className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition ${
                  trendDays === days ? 'bg-white text-ink shadow-xs font-bold' : 'text-steel hover:text-ink'
                }`}
              >
                Last {days}d
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#5E7185', fontFamily: 'JetBrains Mono' }} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#5E7185', fontFamily: 'JetBrains Mono' }} unit="%" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
              <Line type="monotone" dataKey="rate" name="Completion Rate (%)" stroke="#2356F6" strokeWidth={2.5} dot={{ r: 3, fill: '#2356F6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Pillar Consistency + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pillar Consistency */}
        <div className="instrument-card rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <BarChart3 size={18} className="text-cobalt" />
            <h3 className="font-display text-base font-bold text-ink">Consistency by Pillar</h3>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pillarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#121C2B', fontFamily: 'JetBrains Mono' }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#5E7185', fontFamily: 'JetBrains Mono' }} unit="%" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
                <Bar dataKey="rate" name="Weekly Rate (%)" radius={[6, 6, 0, 0]}>
                  {pillarData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PILLAR_COLORS[index % PILLAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pillar Breakdown Donut */}
        <div className="instrument-card rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <PieIcon size={18} className="text-amber" />
            <h3 className="font-display text-base font-bold text-ink">Habit Registry Composition</h3>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pillarData.filter(p => p.scheduled > 0 || habits.length > 0)}
                  dataKey="scheduled"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {pillarData.map((_, index) => (
                    <Cell key={`donut-${index}`} fill={PILLAR_COLORS[index % PILLAR_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
