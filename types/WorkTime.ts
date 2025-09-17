
export interface WorkTimeEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  hasBreak: boolean;
  notes: string;
  totalHours: number;
}

export interface MonthlyData {
  month: string; // YYYY-MM format
  entries: WorkTimeEntry[];
  totalHours: number;
}

export interface YearlyData {
  year: string; // YYYY format
  months: MonthlyData[];
  totalHours: number;
}

export interface UserSettings {
  userName: string;
  defaultStartTime: string;
  defaultEndTime: string;
  defaultBreakDuration: number; // in minutes
}
