// Abstract base class for all chart types

import { ChartConfiguration } from 'chart.js';
import { Chart } from '../chartjs-init';
import TimesheetReportPlugin from '../../main';
import { ChartTheme } from './ChartTheme';
import { Formatter } from '../../rendering/Formatter';
import { RenderUtils } from '../../rendering/RenderUtils';
import {
  ChartRenderOptions,
  ChartValidationResult,
  CommonChartOptions,
  ChartColorPalette,
  IChartRenderer
} from './ChartConfig';

/**
 * Abstract base class for all chart implementations
 */
export abstract class BaseChart implements IChartRenderer {
  protected plugin: TimesheetReportPlugin;
  protected theme: ChartTheme;
  protected formatter: Formatter;
  protected chartInstance?: Chart;
  protected canvas?: HTMLCanvasElement;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
    this.theme = new ChartTheme(plugin);
    this.formatter = new Formatter(plugin.settings.currencySymbol || '€');
  }

  /**
   * Render the chart
   */
  async render(options: ChartRenderOptions): Promise<void> {
    try {
      // Validate data before rendering
      const validation = this.validateData();
      if (!validation.valid) {
        throw new Error(`Chart validation failed: ${validation.errors.join(', ')}`);
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          this.plugin.debugLogger?.log(`Chart warning: ${warning}`);
        });
      }

      // Create canvas
      this.canvas = this.createCanvas(options.container, options.dimensions?.height || 300);

      // Get chart configuration
      const config = this.buildChartConfig();

      // Create chart instance
      this.chartInstance = new Chart(this.canvas, config);

      this.plugin.debugLogger?.log(`${this.getChartType()} chart rendered successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log(`Error rendering ${this.getChartType()} chart:`, errorMessage);
      throw error;
    }
  }

  /**
   * Destroy the chart instance
   */
  destroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = undefined;
    }

    if (this.canvas) {
      this.canvas.remove();
      this.canvas = undefined;
    }
  }

  /**
   * Update chart data
   */
  update(): void {
    if (this.chartInstance) {
      this.chartInstance.update();
    }
  }

  /**
   * Resize chart
   */
  resize(): void {
    if (this.chartInstance) {
      this.chartInstance.resize();
    }
  }

  /**
   * Get color palette
   */
  protected getColorPalette(): ChartColorPalette {
    return this.theme.getAllColors();
  }

  /**
   * Create canvas element
   */
  protected createCanvas(container: HTMLElement, height: number): HTMLCanvasElement {
    return RenderUtils.createCanvas(container, height);
  }

  /**
   * Get common chart options
   */
  protected getCommonOptions(options: CommonChartOptions = {}): Record<string, unknown> {
    const colors = this.getColorPalette();

    return {
      responsive: options.responsive !== false,
      maintainAspectRatio: options.maintainAspectRatio !== false,
      plugins: {
        title: {
          display: options.showTitle || false,
          text: options.titleText || '',
          color: colors.text,
          font: {
            size: 16
          }
        },
        legend: {
          display: options.showLegend !== false,
          position: options.legendPosition || 'top',
          labels: {
            color: colors.text
          }
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          backgroundColor: colors.background,
          titleColor: colors.text,
          bodyColor: colors.text,
          borderColor: colors.grid,
          borderWidth: 1
        }
      }
    };
  }

  /**
   * Format number for display
   */
  protected formatNumber(value: number, decimals = 2): string {
    return this.formatter.formatNumber(value, decimals);
  }

  /**
   * Format currency for display
   */
  protected formatCurrency(value: number): string {
    return this.formatter.formatCurrency(value);
  }

  /**
   * Format percentage for display
   */
  protected formatPercentage(value: number): string {
    return this.formatter.formatPercentage(value);
  }

  /**
   * Calculate working days in a month
   */
  protected getWorkingDaysInMonth(year: number, month: number): number {
    return RenderUtils.getWorkingDaysInMonth(year, month);
  }

  /**
   * Get axis configuration
   */
  protected getAxisConfig(
    type: 'linear' | 'category' = 'linear',
    title?: string,
    stacked = false
  ): Record<string, unknown> {
    const colors = this.getColorPalette();

    return {
      type,
      stacked,
      ...(title && {
        title: {
          display: true,
          text: title,
          color: colors.text
        }
      }),
      grid: {
        color: colors.grid
      },
      ticks: {
        color: colors.text
      }
    };
  }

  // Abstract methods that must be implemented by derived classes

  /**
   * Build chart configuration (must be implemented by derived classes)
   */
  protected abstract buildChartConfig(): ChartConfiguration;

  /**
   * Validate chart data (must be implemented by derived classes)
   */
  protected abstract validateData(): ChartValidationResult;

  /**
   * Get chart type name (must be implemented by derived classes)
   */
  protected abstract getChartType(): string;
}
