import { TFile } from 'obsidian';

export interface TimeEntry {
  date: Date;
  hours: number;
  rate?: number;
  project?: string;
  notes?: string;
  taskDescription?: string;
  file?: TFile;
}

export interface QueryOptions {
  year?: number;
  month?: number;
  projectFilter?: string;
  dateRange?: { start: Date; end: Date };
  includeMetadata?: boolean;
}

export interface TimesheetDataSource {
  query(options?: QueryOptions): Promise<TimeEntry[]>;
  clearCache(): void;
}
