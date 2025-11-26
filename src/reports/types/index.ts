// Reports Types - Main Entry Point
// Centralized type definitions for the reports package

// ============================================================================
// REPORT TYPES
// ============================================================================

export type {
  BaseReportOptions,
  IntervalReportOptions,
  MonthlyReportOptions,
  ReportMetadata,
  SaveOptions,
  ValidationResult,
  ReportGenerationResult,
  ReportOutputConfig
} from './ReportTypes';

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export type {
  TemplateMetadata,
  TemplatePlaceholder,
  TemplateValidationResult,
  TemplateContext,
  TemplateProcessingOptions,
  TemplateCreationOptions,
  TemplateSearchOptions,
  TemplateConfig
} from './TemplateTypes';

export {
  TemplateType
} from './TemplateTypes';
