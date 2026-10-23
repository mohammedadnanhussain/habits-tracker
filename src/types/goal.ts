export type GoalStatus = 'active' | 'completed' | 'abandoned';

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;         // YYYY-MM-DD
  linkedHabitIds: string[];
  status: GoalStatus;
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
}

export type MilestoneType =
  | 'first_habit'
  | 'first_completion'
  | 'streak_7'
  | 'streak_30'
  | 'streak_60'
  | 'streak_100'
  | 'perfect_week'
  | 'perfect_month'
  | 'total_50'
  | 'total_100'
  | 'total_500'
  | 'total_1000'
  | 'personal_best';

export interface Milestone {
  id: string;
  type: MilestoneType;
  habitId?: string;
  title: string;
  description: string;
  value?: number;
  unlockedAt: string;        // ISO 8601
}
