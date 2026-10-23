export interface DailyStats {
  date: string;
  completed: number;
  total: number;
  rate: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  dailyStats: DailyStats[];
  totalCompleted: number;
  totalScheduled: number;
  rate: number;
  perfectDays: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  color: string;
  completed: number;
  total: number;
  rate: number;
}

export interface HabitInsight {
  type: 'most_consistent' | 'needs_attention' | 'improving' | 'streak_at_risk' | 'top_category';
  title: string;
  description: string;
  habitId?: string;
  value?: number;
}

export interface StreakInfo {
  habitId: string;
  habitName: string;
  currentStreak: number;
  longestStreak: number;
  longestStreakStart?: string;
  longestStreakEnd?: string;
  lastCompletedDate?: string;
  isAtRisk: boolean;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondary?: number;
}
