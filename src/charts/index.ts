// Charts module - Main export file

// Base classes and interfaces
export { BaseChart } from './base/BaseChart';
export { ChartTheme } from './base/ChartTheme';
export type {
  ChartColorPalette,
  ChartThemeConfig,
  BaseChartData,
  ChartDataset,
  ChartDimensions,
  ChartRenderOptions,
  TrendChartData,
  MonthlyChartDataPoint,
  BudgetChartDataPoint,
  IChartConfigBuilder,
  IChartRenderer,
  CommonChartOptions,
  AxisConfig,
  ChartValidationResult,
  ChartExportOptions
} from './base/ChartConfig';

// Chart implementations
export { TrendChart } from './types/TrendChart';
export { MonthlyChart } from './types/MonthlyChart';
export { BudgetChart } from './types/BudgetChart';

// Factory
export { ChartFactory, ChartType } from './ChartFactory';

// Convenience function to create chart factory
import TimesheetReportPlugin from '../main';
import { ChartFactory } from './ChartFactory';

/**
 * Create a chart factory instance
 */
export function createChartFactory(plugin: TimesheetReportPlugin): ChartFactory {
  return new ChartFactory(plugin);
}
