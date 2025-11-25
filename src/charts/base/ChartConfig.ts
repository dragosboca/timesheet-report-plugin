// Chart configuration types and interfaces

import { ChartConfiguration, ChartType, ChartData, ChartOptions } from 'chart.js';

/**
 * Color palette for charts
 */
export interface ChartColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  grid: string;
  text: string;
  background: string;
}

/**
 * Chart theme configuration
 */
export interface ChartThemeConfig {
  isDark: boolean;
  useStyleSettings: boolean;
  colors: ChartColorPalette;
}

/**
 * Base chart data structure
 */
export interface BaseChartData {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Chart dataset configuration
 */
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  borderDash?: number[];
  tension?: number;
  yAxisID?: string;
  stack?: string;
  type?: ChartType;
}

/**
 * Chart dimensions
 */
export interface ChartDimensions {
  width?: number;
  height: number;
  maintainAspectRatio?: boolean;
}

/**
 * Chart render options
 */
export interface ChartRenderOptions {
  container: HTMLElement;
  dimensions?: ChartDimensions;
  theme?: ChartThemeConfig;
}

/**
 * Trend chart specific data
 */
export interface TrendChartData {
  labels: string[];
  hours: number[];
  utilization: number[];
  invoiced: number[];
}

/**
 * Monthly chart data point
 */
export interface MonthlyChartDataPoint {
  label: string;
  hours: number;
  invoiced: number;
  rate: number;
  budgetHours?: number;
  budgetUsed?: number;
  budgetRemaining?: number;
  budgetProgress?: number;
  cumulativeHours?: number;
}

/**
 * Budget chart data point
 */
export interface BudgetChartDataPoint extends MonthlyChartDataPoint {
  budgetHours: number;
  cumulativeHours: number;
}

/**
 * Chart configuration builder
 */
export interface IChartConfigBuilder {
  buildConfiguration(): ChartConfiguration;
  setData(data: ChartData): this;
  setOptions(options: ChartOptions): this;
  setTheme(theme: ChartThemeConfig): this;
}

/**
 * Chart renderer interface
 */
export interface IChartRenderer {
  render(options: ChartRenderOptions): Promise<void>;
  destroy(): void;
}

/**
 * Common chart options
 */
export interface CommonChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  showTitle?: boolean;
  titleText?: string;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Axis configuration
 */
export interface AxisConfig {
  type?: 'linear' | 'logarithmic' | 'category' | 'time';
  position?: 'left' | 'right' | 'top' | 'bottom';
  stacked?: boolean;
  title?: {
    display: boolean;
    text: string;
    color?: string;
  };
  grid?: {
    display?: boolean;
    color?: string;
  };
  ticks?: {
    color?: string;
    callback?: (value: any) => string;
  };
  min?: number;
  max?: number;
}

/**
 * Chart validation result
 */
export interface ChartValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Chart export options
 */
export interface ChartExportOptions {
  format: 'png' | 'jpg' | 'svg';
  quality?: number;
  width?: number;
  height?: number;
}
