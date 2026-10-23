import React from 'react';
import { createBrowserRouter } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { DailyLogPage } from './pages/DailyLogPage';
import { WeeklyTrackerPage } from './pages/WeeklyTrackerPage';
import { CalendarPage } from './pages/CalendarPage';
import { StreakMatrixPage } from './pages/StreakMatrixPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReflectionsPage } from './pages/ReflectionsPage';
import { GoalsPage } from './pages/GoalsPage';
import { HabitManagementPage } from './pages/HabitManagementPage';
import { SettingsPage } from './pages/SettingsPage';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'today', element: <DailyLogPage /> },
        { path: 'weekly', element: <WeeklyTrackerPage /> },
        { path: 'calendar', element: <CalendarPage /> },
        { path: 'streaks', element: <StreakMatrixPage /> },
        { path: 'analytics', element: <AnalyticsPage /> },
        { path: 'reflections', element: <ReflectionsPage /> },
        { path: 'goals', element: <GoalsPage /> },
        { path: 'habits', element: <HabitManagementPage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
);
