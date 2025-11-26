// Template Types and Interfaces

import { TFile } from 'obsidian';

/**
 * Template metadata information
 */
export interface TemplateMetadata {
  name: string;
  path: string;
  file: TFile;
  description?: string;
  tags?: string[];
}

/**
 * Template placeholder information
 */
export interface TemplatePlaceholder {
  name: string;
  description: string;
  example?: string;
  required?: boolean;
}

/**
 * Template validation result
 */
export interface TemplateValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingPlaceholders?: string[];
}

/**
 * Template context for processing
 */
export interface TemplateContext {
  // Report information
  reportName?: string;
  reportPeriod?: string;
  startDate?: string;
  endDate?: string;
  generationDate: string;

  // Summary data
  totalHours?: number;
  entryCount?: number;
  utilization?: number;
  totalRevenue?: number;
  totalInvoiced?: number;

  // Budget information
  budgetHours?: number;
  remainingHours?: number;
  budgetProgress?: number;

  // Project information
  projectName?: string;
  projectType?: string;
  currency?: string;

  // Date/time information
  currentYear: number;
  currentMonth: number;
  currentDate: string;

  // Monthly report specific
  monthYear?: string;
  monthName?: string;
  year?: number;
  month?: number;

  // Table content
  tableContent?: string;

  // Custom fields
  [key: string]: any;
}

/**
 * Template processing options
 */
export interface TemplateProcessingOptions {
  context: TemplateContext;
  preserveUnknownPlaceholders?: boolean;
  throwOnMissingPlaceholder?: boolean;
}

/**
 * Template creation options
 */
export interface TemplateCreationOptions {
  name: string;
  content?: string;
  useSampleContent?: boolean;
  folder?: string;
}

/**
 * Template search options
 */
export interface TemplateSearchOptions {
  searchTerm?: string;
  folder?: string;
  tags?: string[];
  sortBy?: 'name' | 'modified' | 'created';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Template types
 */
export enum TemplateType {
  MONTHLY = 'monthly',
  INTERVAL = 'interval',
  CUSTOM = 'custom',
  INVOICE = 'invoice',
  CLIENT_REPORT = 'client-report',
  WEEKLY = 'weekly',
  QUARTERLY = 'quarterly'
}

/**
 * Template configuration
 */
export interface TemplateConfig {
  type: TemplateType;
  requiredPlaceholders: string[];
  optionalPlaceholders: string[];
  supportedFormats: string[];
}
