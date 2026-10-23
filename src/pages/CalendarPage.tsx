import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useHabits } from '../hooks/useHabits';
import { useHabitLogs } from '../hooks/useHabitLogs';
import { MonthlyCalendar } from '../components/calendar/MonthlyCalendar';
import { YearHeatmap } from '../components/calendar/YearHeatmap';

export const CalendarPage: React.FC = () => {
  const { selectedDate, setSelectedDate } = useApp();
  const { habits } = useHabits();
  const { logs } = useHabitLogs();

  return (
    <div className="space-y-6">
      <MonthlyCalendar
        habits={habits}
        logs={logs}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <YearHeatmap
        habits={habits}
        logs={logs}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
    </div>
  );
};
