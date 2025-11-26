// Report Types and Interfaces

import { TFile } from 'obsidian';
import { TimesheetQuery } from '../../query';

/**
 * Base options for all report types
 */
export interface BaseReportOptions {
  reportName: string;
  templatePath?: string;
}

/**
 * Options for interval-based reports
 */
export interface IntervalReportOptions extends BaseReportOptions {
  startDate: string;
  endDate: string;
  query: TimesheetQuery;
}

/**
 * Options for monthly reports
 */
export interface MonthlyReportOptions extends BaseReportOptions {
  year: number;
  month: number;
  query?: TimesheetQuery;
}

/**
 * Report metadata
 */
export interface ReportMetadata {
  name: string;
  path: string;
  created: Date;
  modified: Date;
  type: 'interval' | 'monthly' | 'custom';
  period?: {
    start: string;
    end: string;
  };
}

/**
 * Options for saving reports
 */
export interface SaveOptions {
  overwrite?: boolean;
  openAfterSave?: boolean;
}

/**
 * Validation result for reports
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Result from report generation
 */
export interface ReportGenerationResult {
  file: TFile;
  metadata: ReportMetadata;
  success: boolean;
  message?: string;
}

/**
 * Report output configuration
 */
export interface ReportOutputConfig {
  folder: string;
  format: 'markdown';
  encoding?: 'utf8';
}
