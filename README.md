# CADENCE — Daily Ritual & Streak Console
### Local-First Personal Habit Management & Daily Progress System

**CADENCE** is an instrument-panel-inspired productivity dashboard and personal habit-tracking console. Built with a local-first architecture, it stores your real habit records, tracks actual dates and times via your computer's local clock, and continues to function reliably across browser restarts without any cloud account, remote database, or external API requirement.

Inspired by the tactile aesthetic of precision telemetry equipment, CADENCE fuses uninterrupted habit streaks into an illuminated **Continuity Rail**, computes live consistency analytics, and provides a date-linked **Field Log** for daily reflection.

---

## 1. Architecture & Storage Choice

- **Frontend Core**: React 18 with TypeScript and Vite 6.
- **Persistence Layer**: **IndexedDB** via **Dexie.js v4** (`EntityTable` API with `useLiveQuery`).
  - *Why IndexedDB over SQLite?* Pure frontend execution with zero separate backend processes required. All habits, multi-day logs, daily reflections, goals, milestones, and settings persist safely in your browser storage.
  - Compound indexes (e.g. `[habitId+localDate]`) allow instant retrieval and multi-month streak recalculation.
- **Styling**: Tailwind CSS v4 featuring the official `@tailwindcss/vite` Lightning CSS engine and custom CADENCE design tokens (`chassis`, `plate`, `ink`, `cobalt`, `amber`, `steel`).
- **Charts & Telemetry**: Recharts 2 for composable SVG performance graphs and velocity metrics.
- **Icons**: Lucide React.
- **Date & Clock System**: Native system clock synchronization and `date-fns v4` using local calendar dates (zero UTC day-shift risks).

---

## 2. Key Features Implemented

1. **Live Precision Clock & Dynamic Dates**:
   - Updates every second reading directly from your computer clock.
   - Detects your current IANA timezone (e.g. `Asia/Kolkata`) automatically.
   - Dynamic midnight rollover: automatically switches dashboard to the new day when midnight passes without losing historical progress.
   - Automatic refresh on browser tab resume (`visibilitychange`) and computer wake from sleep (`focus`).
   - Pure local date keys (`YYYY-MM-DD`) preventing UTC timezone day-shifting errors.

2. **Instrument-Panel Dashboard (Faithfully Recreated from Reference)**:
   - Header with week badge (`W42`), date range, week switcher, and "New Daily Goal" button.
   - 4 Telemetry Gauges:
     - **Selected Day Log**: Real-time progress bar, ratio of completed/scheduled habits, percentage.
     - **Peak Active Streak**: Live longest active streak badge and consistency grade (`S+`, `A`, `B+`, etc.).
     - **Weekly Cadence**: Percentage of weekly opportunities fulfilled and check-in count.
     - **All-Clear Days**: Mini dot strip showing each day's status (Amber = 100% all-clear, Cobalt = partial, Slate = unlogged).

3. **Daily Habit Logging Deck**:
   - 7-Day tactile day switcher strip with per-day completion counts.
   - Category filter pills (`All`, `Body`, `Mind`, `Craft`, `Rest`) and status filter (`All`, `Remaining`, `Completed`).
   - One-click habit check-in with instantaneous tactile feedback.
   - Support for 6 tracking types:
     1. **Binary**: Done / Not Done checkmark.
     2. **Quantified**: Numeric target with custom step increments and units (e.g., 3.0 L water, 30 min reading).
     3. **Counter**: Increment / decrement tally.
     4. **Duration**: Stopwatch / minutes tracker.
     5. **Avoidance**: Bad habit resisted (e.g., zero refined sugar).
     6. **Checklist**: Sub-step routines.
   - Inline fast goal adder (`+ Quick Log`).
   - "Mark All Done" batch logging action.

4. **Signature Continuity Rail & Streak Matrix**:
   - 7-day continuity rail matrix matching the reference design.
   - Consecutive completions fuse into an **illuminated glowing bridge** between nodes.
   - Click any node directly in the matrix to toggle completion on that date.
   - Rest days do NOT break streaks for flexible schedules.

5. **3-Mode Weekly Streak & Telemetry Chart**:
   - **7-Day Cadence**: Dual-axis bar and line chart showing daily completion rates and habits on 2+ day streak chains.
   - **Habit Streaks**: Horizontal comparison of total active streak vs. week check-ins.
   - **By Pillar**: Consistency rates across Body, Mind, Craft, and Rest pillars.
   - Dynamic automated insights generated purely from stored user data.

6. **Date-Linked Field Notes & Reflections**:
   - Auto-saving journal entry tied to each selected date.
   - Historical journal archive with instant search and inspection.

7. **Multi-Habit Weekly Ledger & Monthly Heatmap**:
   - Dedicated weekly matrix table displaying all active habits across Monday–Sunday.
   - Monthly calendar grid with color-coded completion status.
   - GitHub-style 26-week / 52-week annual consistency heatmap.

8. **Goals, Milestones & Disaster Recovery**:
   - Link habits to milestone deadline targets.
   - Dynamic discipline badges unlocked by real check-in counts and streak lengths.
   - Complete JSON data export and validated import.
   - Habit check-in logs export to CSV format.
   - Optional onboarding sample studio habits calibration.

---

## 3. Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or newer (v24.14.0 tested).
- **npm**: v9.0.0 or newer (v11.9.0 tested).

### Quickstart Commands

```bash
# 1. Clone or navigate to the project directory
cd "s:\Mohammed Adnan Hussain\Habits Tracker"

# 2. Install dependencies (if not already installed)
npm install

# 3. Start local development server
npm run dev
```

The application will launch locally at:
```
http://localhost:5173
```

To stop the server at any time, press `Ctrl + C` in the terminal.

---

## 4. Building for Production

To create an optimized, minified production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 5. Running Automated Tests

A comprehensive unit test suite covering date math, streak calculations, flexible scheduling, telemetry, and backup validation is included:

```bash
npm run test
```

---

## 6. Data Storage & Privacy

- **Database Location**: Browser IndexedDB storage under database name `cadence_habit_db`.
- **Zero Cloud Leakage**: No tracking scripts, analytics, or external network requests are made.
- **Disaster Recovery**: Navigate to **Settings & Backup** to download a `.json` backup file. Browser cache clearing can erase IndexedDB, so export regular backups if using incognito or automated clearing extensions.

---

## 7. Project File Manifest

```
Habits Tracker/
├── index.html                   # Vite HTML entry point with fonts
├── package.json                 # Manifest with dependencies & scripts
├── vite.config.ts               # Vite configuration with Tailwind v4
├── vitest.config.ts             # Vitest test runner configuration
├── tsconfig.json                # TypeScript project configuration
├── public/
│   └── favicon.svg              # CADENCE telemetry console icon
├── src/
│   ├── main.tsx                 # Application entry point
│   ├── App.tsx                  # Root component with Providers
│   ├── routes.tsx               # React Router v7 routes
│   ├── index.css                # Tailwind CSS v4 & CADENCE tokens
│   ├── types/
│   │   ├── habit.ts             # Habit, HabitLog, and Schedule definitions
│   │   ├── reflection.ts        # DailyReflection definition
│   │   ├── goal.ts              # Goal & Milestone definitions
│   │   ├── settings.ts          # AppSettings definitions
│   │   └── analytics.ts         # Analytics and telemetry types
│   ├── lib/
│   │   ├── db.ts                # Dexie.js database schema & seed presets
│   │   ├── dates.ts             # Local date handling & timezone utilities
│   │   ├── scheduling.ts        # Habit scheduling & frequency engine
│   │   ├── streaks.ts           # Streak calculation engine & rest day logic
│   │   ├── analytics.ts         # Telemetry metrics and chart computations
│   │   ├── backup.ts            # JSON/CSV export, import, & validation
│   │   ├── notifications.ts     # Browser reminder notifications helper
│   │   └── constants.ts         # Pillar categories & tracking modes
│   ├── contexts/
│   │   ├── AppContext.tsx       # Global state (date, settings, theme)
│   │   └── ToastContext.tsx     # Toast banner notifications
│   ├── hooks/
│   │   ├── useLiveClock.ts      # Precision 1-second clock with midnight sync
│   │   ├── useHabits.ts         # Habit CRUD operations
│   │   ├── useHabitLogs.ts      # Daily check-in & progress operations
│   │   ├── useReflections.ts    # Date-linked field notes
│   │   └── useGoals.ts          # Milestones & target outcomes
│   ├── components/
│   │   ├── layout/              # AppShell, Sidebar, MobileNav
│   │   ├── common/              # LiveClock, SummaryStatCard, ConfirmDialog, EmptyState
│   │   ├── habits/              # HabitCard, HabitForm, HabitFilters, QuickAddForm
│   │   ├── calendar/            # WeekSelector, MonthlyCalendar, YearHeatmap
│   │   ├── streaks/             # StreakMatrix (Continuity Rail)
│   │   ├── analytics/           # WeeklyStreakChart
│   │   ├── reflections/         # DailyReflectionCard
│   │   ├── goals/               # GoalCard, GoalForm, MilestoneList
│   │   └── settings/            # SettingsPanel, BackupRestore
│   └── pages/
│       ├── DashboardPage.tsx    # Flagship CADENCE Console
│       ├── DailyLogPage.tsx     # Focused daily checklist
│       ├── WeeklyTrackerPage.tsx# Multi-habit weekly spread
│       ├── CalendarPage.tsx     # Month calendar & year heatmap
│       ├── StreakMatrixPage.tsx # Streak continuity console
│       ├── AnalyticsPage.tsx    # Telemetry velocity charts
│       ├── ReflectionsPage.tsx  # Historical journal archive
│       ├── GoalsPage.tsx        # Milestone targets & badges
│       ├── HabitManagementPage.tsx # Habit registry
│       └── SettingsPage.tsx     # System settings & backup
└── tests/
    ├── setup.ts                 # Vitest polyfill setup
    └── lib/
        ├── dates.test.ts        # Date calculation tests
        ├── streaks.test.ts      # Streak engine tests
        ├── scheduling.test.ts   # Scheduling tests
        ├── analytics.test.ts    # Analytics tests
        └── backup.test.ts       # Backup validation tests
```
