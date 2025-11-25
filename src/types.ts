export interface DailyEntry {
  date: Date;
  hours: number;
  taskDescription: string;
}

export interface MonthData {
  year: number;
  month: number;
  label: string;
}
