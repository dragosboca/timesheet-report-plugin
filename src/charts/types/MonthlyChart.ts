// Monthly Chart implementation - shows monthly breakdown of hours and revenue

import { ChartConfiguration } from 'chart.js';
import { BaseChart } from '../base/BaseChart';
import { MonthlyChartDataPoint, ChartValidationResult } from '../base/ChartConfig';
import TimesheetReportPlugin from '../../main';

/**
 * Monthly chart showing hours, revenue, and budget information per month
 */
export class MonthlyChart extends BaseChart {
  private data: MonthlyChartDataPoint[];
  private maxMonthsToShow: number = 12;

  constructor(plugin: TimesheetReportPlugin, data: MonthlyChartDataPoint[]) {
    super(plugin);
    this.data = data;
  }

  /**
   * Get chart type name
   */
  protected getChartType(): string {
    return 'Monthly';
  }

  /**
   * Validate monthly chart data
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
      if (typeof point.invoiced !== 'number') {
        errors.push(`Data point ${index} has invalid invoiced value`);
      }
      if (point.hours < 0) {
        warnings.push(`Data point ${index} has negative hours`);
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

    // Get recent data (last 12 months or less)
    const recentData = [...this.data].slice(0, this.maxMonthsToShow);
    recentData.reverse(); // Show oldest to newest

    const labels = recentData.map(item => item.label);
    const invoiced = recentData.map(item => item.invoiced);

    // Check if this is a budget project
    const isBudgetProject = recentData.some(item => item.budgetHours !== undefined);

    let datasets: any[];

    if (isBudgetProject) {
      // For budget projects, show budget consumption
      const budgetUsed = recentData.map(item => (item.budgetUsed || 0) * (item.rate || 0));
      const budgetRemaining = recentData.map(item => (item.budgetRemaining || 0) * (item.rate || 0));

      datasets = [
        {
          label: 'Budget Used',
          data: budgetUsed,
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          borderWidth: 1
        },
        {
          label: 'Budget Remaining',
          data: budgetRemaining,
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
          borderWidth: 1
        }
      ];
    } else {
      // For hourly projects, show potential additional revenue
      const totalWorkingHours = recentData.map(item => {
        const [monthName, year] = item.label.split(' ');
        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth() + 1;

        const hoursPerWorkday = this.plugin.settings.hoursPerWorkday || 8;
        return this.getWorkingDaysInMonth(parseInt(year), monthIndex) * hoursPerWorkday;
      });

      const maxPossibleInvoice = recentData.map((item, index) => totalWorkingHours[index] * item.rate);
      const uninvoiced = recentData.map((item, index) => Math.max(0, maxPossibleInvoice[index] - item.invoiced));

      datasets = [
        {
          label: 'Invoiced',
          data: invoiced,
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          borderWidth: 1
        },
        {
          label: 'Potential Additional',
          data: uninvoiced,
          backgroundColor: colors.tertiary,
          borderColor: colors.tertiary,
          borderWidth: 1
        }
      ];
    }

    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets
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
              text: 'Amount (€)',
              color: colors.text
            },
            min: 0,
            grid: {
              color: colors.grid
            },
            ticks: {
              color: colors.text,
              callback: function (value: number) {
                return '€' + value.toLocaleString('en-US', {
                  maximumFractionDigits: 0
                });
              }
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: isBudgetProject ? 'Monthly Budget Analysis' : 'Monthly Invoice Analysis',
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
              title: (tooltipItems) => {
                const index = tooltipItems[0].dataIndex;
                const monthData = recentData[index];
                const days = this.getWorkingDaysInMonth(
                  parseInt(monthData.label.split(' ')[1]),
                  new Date(`${monthData.label.split(' ')[0]} 1, 2000`).getMonth() + 1
                );
                return `${monthData.label} (${days} working days)`;
              },
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += '€' + context.parsed.y.toLocaleString('en-US', {
                    maximumFractionDigits: 2
                  });
                }
                return label;
              },
              footer: (tooltipItems) => {
                const index = tooltipItems[0].dataIndex;
                const monthData = recentData[index];

                const footer = [
                  `Hours: ${monthData.hours.toFixed(1)}`,
                  `Rate: €${monthData.rate.toFixed(0)}/hr`
                ];

                if (isBudgetProject && monthData.budgetProgress !== undefined) {
                  const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                  footer.push(`Total: €${this.formatNumber(total, 2)}`);
                  footer.push(`Progress: ${this.formatNumber(monthData.budgetProgress * 100, 1)}%`);
                }

                return footer;
              }
            }
          }
        }
      }
    };
  }

  /**
   * Set maximum months to display
   */
  setMaxMonths(max: number): void {
    this.maxMonthsToShow = max;
  }

  /**
   * Update chart with new data
   */
  updateData(newData: MonthlyChartDataPoint[]): void {
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
  getData(): MonthlyChartDataPoint[] {
    return this.data;
  }

  /**
   * Check if displaying budget project
   */
  isBudgetProject(): boolean {
    return this.data.some(item => item.budgetHours !== undefined);
  }
}
