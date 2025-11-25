// Budget Chart implementation - shows budget consumption and remaining hours

import { ChartConfiguration } from 'chart.js';
import { BaseChart } from '../base/BaseChart';
import { BudgetChartDataPoint, ChartValidationResult } from '../base/ChartConfig';
import TimesheetReportPlugin from '../../main';

/**
 * Budget chart showing hours used vs remaining budget over time
 */
export class BudgetChart extends BaseChart {
  private data: BudgetChartDataPoint[];

  constructor(plugin: TimesheetReportPlugin, data: BudgetChartDataPoint[]) {
    super(plugin);
    this.data = data;
  }

  /**
   * Get chart type name
   */
  protected getChartType(): string {
    return 'Budget';
  }

  /**
   * Validate budget chart data
   */
  protected validateData(): ChartValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if data exists
    if (!this.data) {
      errors.push('Chart data is missing');
      return { valid: false, errors, warnings };
    }

    // Validate data array
    if (!Array.isArray(this.data) || this.data.length === 0) {
      errors.push('Data array is empty or invalid');
      return { valid: false, errors, warnings };
    }

    // Validate each data point
    this.data.forEach((point, index) => {
      if (!point.label) {
        errors.push(`Data point ${index} is missing label`);
      }
      if (typeof point.hours !== 'number') {
        errors.push(`Data point ${index} has invalid hours value`);
      }
      if (typeof point.budgetHours !== 'number') {
        errors.push(`Data point ${index} has invalid budgetHours value`);
      }
      if (typeof point.cumulativeHours !== 'number') {
        errors.push(`Data point ${index} has invalid cumulativeHours value`);
      }
      if (point.cumulativeHours > point.budgetHours) {
        warnings.push(`Data point ${index} has exceeded budget`);
      }
    });

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

    // Filter only budget project data
    const budgetData = this.data.filter(item => item.budgetHours !== undefined);

    return {
      type: 'bar',
      data: {
        labels: budgetData.map(item => item.label),
        datasets: [
          {
            label: 'Hours Used',
            data: budgetData.map(item => item.hours),
            backgroundColor: colors.primary,
            borderColor: colors.primary,
            borderWidth: 1
          },
          {
            label: 'Budget Remaining',
            data: budgetData.map(item =>
              Math.max(0, (item.budgetHours || 0) - item.cumulativeHours)
            ),
            backgroundColor: colors.secondary,
            borderColor: colors.secondary,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: {
              color: colors.grid
            },
            ticks: {
              color: colors.text
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Hours',
              color: colors.text
            },
            grid: {
              color: colors.grid
            },
            ticks: {
              color: colors.text
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Budget Consumption',
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
                  label += context.parsed.y.toFixed(1) + ' hours';
                }
                return label;
              },
              footer: (tooltipItems) => {
                const index = tooltipItems[0].dataIndex;
                const monthData = budgetData[index];

                const total = monthData.cumulativeHours;
                const budget = monthData.budgetHours;
                const percentage = (total / budget) * 100;

                return [
                  `Total Used: ${total.toFixed(1)} hours`,
                  `Budget: ${budget.toFixed(1)} hours`,
                  `Progress: ${percentage.toFixed(1)}%`
                ];
              }
            }
          }
        }
      }
    };
  }

  /**
   * Update chart with new data
   */
  updateData(newData: BudgetChartDataPoint[]): void {
    this.data = newData;

    if (this.chartInstance) {
      const validation = this.validateData();
      if (!validation.valid) {
        throw new Error(`Invalid data: ${validation.errors.join(', ')}`);
      }

      // Rebuild configuration with new data
      const config = this.buildChartConfig();
      this.chartInstance.data = config.data!;
      this.chartInstance.options = config.options!;
      this.chartInstance.update();
    }
  }

  /**
   * Get current data
   */
  getData(): BudgetChartDataPoint[] {
    return this.data;
  }

  /**
   * Calculate total budget utilization
   */
  getTotalUtilization(): number {
    if (this.data.length === 0) return 0;

    const latestData = this.data[this.data.length - 1];
    return (latestData.cumulativeHours / latestData.budgetHours) * 100;
  }

  /**
   * Check if budget is exceeded
   */
  isBudgetExceeded(): boolean {
    return this.data.some(item => item.cumulativeHours > item.budgetHours);
  }

  /**
   * Get remaining budget hours
   */
  getRemainingBudget(): number {
    if (this.data.length === 0) return 0;

    const latestData = this.data[this.data.length - 1];
    return Math.max(0, latestData.budgetHours - latestData.cumulativeHours);
  }
}
