// Trend Chart implementation - shows hours and utilization over time

import { ChartConfiguration } from 'chart.js';
import { BaseChart } from '../base/BaseChart';
import { TrendChartData, ChartValidationResult } from '../base/ChartConfig';
import TimesheetReportPlugin from '../../main';

/**
 * Trend chart showing hours worked and utilization percentage over time
 */
export class TrendChart extends BaseChart {
  private data: TrendChartData;

  constructor(plugin: TimesheetReportPlugin, data: TrendChartData) {
    super(plugin);
    this.data = data;
  }

  /**
   * Get chart type name
   */
  protected getChartType(): string {
    return 'Trend';
  }

  /**
   * Validate trend chart data
   */
  protected validateData(): ChartValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if data exists
    if (!this.data) {
      errors.push('Chart data is missing');
      return { valid: false, errors, warnings };
    }

    // Validate labels
    if (!Array.isArray(this.data.labels) || this.data.labels.length === 0) {
      errors.push('Labels array is empty or invalid');
    }

    // Validate hours
    if (!Array.isArray(this.data.hours)) {
      errors.push('Hours data is missing or invalid');
    } else if (this.data.hours.length !== this.data.labels.length) {
      errors.push('Hours data length does not match labels length');
    }

    // Validate utilization
    if (!Array.isArray(this.data.utilization)) {
      errors.push('Utilization data is missing or invalid');
    } else if (this.data.utilization.length !== this.data.labels.length) {
      errors.push('Utilization data length does not match labels length');
    }

    // Check for negative hours
    if (this.data.hours && this.data.hours.some(h => h < 0)) {
      warnings.push('Dataset contains negative hours values');
    }

    // Check for invalid utilization percentages
    if (this.data.utilization) {
      const invalidUtil = this.data.utilization.some(u => u < 0 || u > 1);
      if (invalidUtil) {
        warnings.push('Utilization values should be between 0 and 1');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Build chart configuration
   */
  protected buildChartConfig(): ChartConfiguration {
    const colors = this.getColorPalette();
    const maxHours = Math.max(...this.data.hours);

    return {
      type: 'line',
      data: {
        labels: this.data.labels,
        datasets: [
          {
            label: 'Hours Worked',
            data: this.data.hours,
            borderColor: colors.primary,
            backgroundColor: this.theme.applyOpacity(colors.primary, 0.2),
            borderWidth: 2,
            tension: 0.1,
            yAxisID: 'hours'
          },
          {
            label: 'Utilization %',
            data: this.data.utilization.map(u => u * 100), // Convert to percentage
            borderColor: colors.secondary,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.1,
            yAxisID: 'percentage'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Hours & Utilization Trend',
            color: colors.text,
            font: {
              size: 16
            }
          },
          legend: {
            position: 'top',
            labels: {
              color: colors.text
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  if (context.datasetIndex === 0) {
                    // Hours
                    label += context.parsed.y.toLocaleString('en-US', {
                      maximumFractionDigits: 2
                    });
                  } else {
                    // Utilization percentage
                    label += context.parsed.y.toLocaleString('en-US', {
                      maximumFractionDigits: 1
                    }) + '%';
                  }
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: colors.grid
            },
            ticks: {
              color: colors.text
            }
          },
          hours: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Hours',
              color: colors.text
            },
            min: 0,
            max: Math.ceil(maxHours * 1.1), // 10% padding
            grid: {
              color: colors.grid
            },
            ticks: {
              color: colors.text
            }
          },
          percentage: {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'Utilization %',
              color: colors.text
            },
            min: 0,
            max: 100,
            grid: {
              display: false
            },
            ticks: {
              color: colors.text
            }
          }
        }
      }
    };
  }

  /**
   * Update chart with new data
   */
  updateData(newData: TrendChartData): void {
    this.data = newData;

    if (this.chartInstance) {
      const validation = this.validateData();
      if (!validation.valid) {
        throw new Error(`Invalid data: ${validation.errors.join(', ')}`);
      }

      // Update chart data
      this.chartInstance.data.labels = newData.labels;
      this.chartInstance.data.datasets[0].data = newData.hours;
      this.chartInstance.data.datasets[1].data = newData.utilization.map(u => u * 100);

      // Update max hours scale
      const maxHours = Math.max(...newData.hours);
      if (this.chartInstance.options.scales?.hours) {
        (this.chartInstance.options.scales.hours as any).max = Math.ceil(maxHours * 1.1);
      }

      this.chartInstance.update();
    }
  }

  /**
   * Get current data
   */
  getData(): TrendChartData {
    return this.data;
  }
}
