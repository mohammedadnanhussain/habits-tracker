export interface DailyReflection {
  id: string;
  localDate: string;         // YYYY-MM-DD
  mood?: number;             // 1-5 scale
  energy?: number;           // 1-5 scale
  focus?: number;            // 1-5 scale
  sleepHours?: number;
  wins: string;
  obstacles: string;
  lessons: string;
  tomorrowPriority: string;
  notes: string;
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
}
