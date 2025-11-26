// Timesheet Reports - Main Entry Point
// Unified report generation, template management, and file operations

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Report types
  BaseReportOptions,
  IntervalReportOptions,
  MonthlyReportOptions,
  ReportMetadata,
  SaveOptions,
  ValidationResult,
  ReportGenerationResult,
  ReportOutputConfig,

  // Template types
  TemplateMetadata,
  TemplatePlaceholder,
  TemplateValidationResult,
  TemplateContext,
  TemplateProcessingOptions,
  TemplateCreationOptions,
  TemplateSearchOptions,
  TemplateConfig
} from './types';

export {
  TemplateType
} from './types';

// ============================================================================
// CORE COMPONENTS
// ============================================================================

export {
  ReportGenerator
} from './ReportGenerator';

export {
  TemplateManager
} from './TemplateManager';

export {
  ReportSaver
} from './ReportSaver';

// ============================================================================
// MODALS
// ============================================================================

export {
  IntervalReportModal
} from './modals/IntervalReportModal';

// ============================================================================
// CONVENIENCE API
// ============================================================================

import { ReportGenerator } from './ReportGenerator';
import { TemplateManager } from './TemplateManager';
import { ReportSaver } from './ReportSaver';
import TimesheetReportPlugin from '../main';

/**
 * Simple API for report operations
 */
export const Report = {
  /**
   * Create a report generator instance
   */
  createGenerator(plugin: TimesheetReportPlugin): ReportGenerator {
    return new ReportGenerator(plugin);
  },

  /**
   * Create a template manager instance
   */
  createTemplateManager(plugin: TimesheetReportPlugin): TemplateManager {
    return new TemplateManager(plugin);
  },

  /**
   * Create a report saver instance
   */
  createSaver(plugin: TimesheetReportPlugin): ReportSaver {
    return new ReportSaver(plugin);
  }
};

/**
 * Default instances (require plugin initialization)
 */
export class Reports {
  private static generator: ReportGenerator | null = null;
  private static templateManager: TemplateManager | null = null;
  private static saver: ReportSaver | null = null;

  /**
   * Initialize the reports system
   */
  static initialize(plugin: TimesheetReportPlugin): void {
    this.generator = new ReportGenerator(plugin);
    this.templateManager = new TemplateManager(plugin);
    this.saver = new ReportSaver(plugin);
  }

  /**
   * Get the report generator instance
   */
  static getGenerator(): ReportGenerator {
    if (!this.generator) {
      throw new Error('Reports system not initialized. Call Reports.initialize(plugin) first.');
    }
    return this.generator;
  }

  /**
   * Get the template manager instance
   */
  static getTemplateManager(): TemplateManager {
    if (!this.templateManager) {
      throw new Error('Reports system not initialized. Call Reports.initialize(plugin) first.');
    }
    return this.templateManager;
  }

  /**
   * Get the report saver instance
   */
  static getSaver(): ReportSaver {
    if (!this.saver) {
      throw new Error('Reports system not initialized. Call Reports.initialize(plugin) first.');
    }
    return this.saver;
  }

  /**
   * Clean up and reset instances
   */
  static cleanup(): void {
    this.generator = null;
    this.templateManager = null;
    this.saver = null;
  }
}
