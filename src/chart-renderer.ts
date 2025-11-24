// chart-renderer.ts
import { DataProcessor } from './data-processor';
import TimesheetReportPlugin from './main';

declare global {
  interface Window {
    Chart: unknown;
  }
}

export class ChartRenderer {
  private chartScriptLoaded = false;
  private plugin: TimesheetReportPlugin;
  private dataProcessor: DataProcessor;

  constructor(plugin: TimesheetReportPlugin, dataProcessor: DataProcessor) {
    this.plugin = plugin;
    this.dataProcessor = dataProcessor;
    this.ensureChartScriptLoaded();
  }

  private async ensureChartScriptLoaded(): Promise<void> {
    if (this.chartScriptLoaded || window.Chart) {
      this.chartScriptLoaded = true;
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
      script.integrity = 'sha256-+8RZJua0aEWg+QVVKg4LEzEEm/8RFez5Tb4JBNiV5xA=';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        this.chartScriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Chart.js script'));
      };
      document.head.appendChild(script);
    });
  }

  private isDarkTheme(): boolean {
    return document.body.classList.contains('theme-dark');
  }

  private getCSSVariable(variable: string, fallback = ''): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || fallback;
  }

  private hexToRgba(hex: string, alpha = 1): string {
    // Remove # if present
    hex = hex.replace('#', '');

    // Handle 3-digit hex
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private getColorPalette(): {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
    grid: string;
    text: string;
    background: string;
  } {
    const isDark = this.isDarkTheme();

    // Check if Style Settings integration is enabled
    const useStyleSettings = this.plugin.settings.useStyleSettings;

    let primaryColor, secondaryColor, tertiaryColor, quaternaryColor;

    if (useStyleSettings) {
      // Try to get colors from Style Settings CSS variables first, then theme variables, then fallbacks
      primaryColor = this.getCSSVariable('--timesheet-color-primary') ||
        this.getCSSVariable('--interactive-accent') ||
        (isDark ? '#6496dc' : '#4f81bd');

      secondaryColor = this.getCSSVariable('--timesheet-color-secondary') ||
        this.getCSSVariable('--text-error') ||
        (isDark ? '#dc6464' : '#c0504d');

      tertiaryColor = this.getCSSVariable('--timesheet-color-tertiary') ||
        this.getCSSVariable('--text-success') ||
        (isDark ? '#96c864' : '#9bbb59');

      quaternaryColor = this.getCSSVariable('--timesheet-color-quaternary') ||
        this.getCSSVariable('--text-accent') ||
        (isDark ? '#aa82be' : '#8064a2');
    } else {
      // Use manual settings from plugin configuration
      primaryColor = this.plugin.settings.chartColors.primary;
      secondaryColor = this.plugin.settings.chartColors.secondary;
      tertiaryColor = this.plugin.settings.chartColors.tertiary;
      quaternaryColor = this.plugin.settings.chartColors.quaternary;
    }

    // Get theme colors for grid, text, and background (always from theme)
    const gridColor = this.getCSSVariable('--background-modifier-border') ||
      (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');

    const textColor = this.getCSSVariable('--text-normal') ||
      (isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)');

    const backgroundColor = this.getCSSVariable('--background-primary') ||
      (isDark ? 'rgba(30, 30, 30, 0.2)' : 'rgba(240, 240, 240, 0.2)');

    return {
      primary: this.hexToRgba(primaryColor, 0.8),
      secondary: this.hexToRgba(secondaryColor, 0.8),
      tertiary: this.hexToRgba(tertiaryColor, 0.8),
      quaternary: this.hexToRgba(quaternaryColor, 0.8),
      grid: gridColor,
      text: textColor,
      background: backgroundColor
    };
  }

  async renderTrendChart(container: HTMLElement, data: {
    labels: string[];
    hours: number[];
    utilization: number[];
    invoiced: number[];
  }): Promise<void> {
    await this.ensureChartScriptLoaded();

    const colors = this.getColorPalette();

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'timesheet-trend-chart';
    canvas.height = 300;
    container.appendChild(canvas);

    // Format data for chart
    const maxHours = Math.max(...data.hours);

    // Create chart
    new (window.Chart as any)(canvas, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Hours Worked',
            data: data.hours,
            borderColor: colors.primary,
            backgroundColor: colors.primary.replace('0.8', '0.2'),
            borderWidth: 2,
            tension: 0.1,
            yAxisID: 'hours'
          },
          {
            label: 'Utilization %',
            data: data.utilization,
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
              label: function (context: any) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.datasetIndex === 0) {
                  label += context.raw.toLocaleString('en-US', {
                    maximumFractionDigits: 1
                  });
                } else if (context.datasetIndex === 1) {
                  label += context.raw.toLocaleString('en-US', {
                    maximumFractionDigits: 1
                  }) + '%';
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
            max: Math.ceil(maxHours * 1.1 / 10) * 10, // Round up to nearest 10
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
    });
  }

  async renderMonthlyChart(container: HTMLElement, monthlyData: Array<{ label: string; hours: number; invoiced: number; rate: number; budgetHours?: number; budgetUsed?: number; budgetRemaining?: number; budgetProgress?: number; }>): Promise<void> {
    await this.ensureChartScriptLoaded();

    const colors = this.getColorPalette();

    // Get last 12 months (or all if less than 12)
    const recentData = [...monthlyData].slice(0, 12);

    // Reverse to show oldest to newest
    recentData.reverse();

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'timesheet-monthly-chart';
    canvas.height = 300;
    container.appendChild(canvas);

    // Check if this is a budget-tracked project
    const isBudgetProject = recentData.some(item => item.budgetHours !== undefined);

    // Extract data for chart
    const labels = recentData.map(item => item.label);
    const invoiced = recentData.map(item => item.invoiced);

    let datasets: any[];

    if (isBudgetProject) {
      // For budget projects, show budget consumption instead of potential additional
      const budgetUsed = recentData.map(item => (item.budgetUsed || 0) * (item.rate || 0));
      const budgetRemaining = recentData.map(item => (item.budgetRemaining || 0) * (item.rate || 0));

      datasets = [
        {
          label: 'Budget Used',
          data: budgetUsed,
          backgroundColor: colors.primary,
          borderColor: colors.primary.replace('0.8', '1.0'),
          borderWidth: 1
        },
        {
          label: 'Budget Remaining',
          data: budgetRemaining,
          backgroundColor: colors.tertiary,
          borderColor: colors.tertiary.replace('0.8', '1.0'),
          borderWidth: 1
        }
      ];
    } else {
      // For hourly projects, show potential additional revenue
      const totalWorkingHours = recentData.map(item => {
        const [monthName, year] = item.label.split(' ');
        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth() + 1;

        return this.dataProcessor.calculateTargetHoursForMonth(
          parseInt(year),
          monthIndex,
          this.plugin.settings.hoursPerWorkday
        );
      });

      const maxPossibleInvoice = recentData.map((item, index) => totalWorkingHours[index] * item.rate);
      const uninvoiced = maxPossibleInvoice.map((max, index) => Math.max(0, max - invoiced[index]));

      datasets = [
        {
          label: 'Invoiced',
          data: invoiced,
          backgroundColor: colors.primary,
          borderColor: colors.primary.replace('0.8', '1.0'),
          borderWidth: 1
        },
        {
          label: 'Potential Additional',
          data: uninvoiced,
          backgroundColor: colors.secondary,
          borderColor: colors.secondary.replace('0.8', '1.0'),
          borderWidth: 1
        }
      ];
    }

    // Create chart
    new (window.Chart as any)(canvas, {
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
              text: 'Invoice Amount (€)',
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
              title: function (tooltipItems: any[]) {
                const index = tooltipItems[0].dataIndex;
                const monthData = recentData[index];
                const days = Math.round(monthData.hours / 8 * 10) / 10; // Assuming 8 hours per day

                if (isBudgetProject && monthData.budgetProgress !== undefined) {
                  return `${monthData.label}\n${monthData.hours.toFixed(1)} hours • ${(monthData.budgetProgress * 100).toFixed(1)}% complete`;
                } else {
                  return `${monthData.label}\n${monthData.hours.toFixed(1)} hours • ${days.toFixed(1)} days`;
                }
              },
              label: function (context: any) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += '€' + context.raw.toLocaleString('en-US', {
                  maximumFractionDigits: 2
                });
                return label;
              },
              footer: function (tooltipItems: any[]) {
                const index = tooltipItems[0].dataIndex;
                const monthData = recentData[index];

                if (isBudgetProject && monthData.budgetHours !== undefined) {
                  return [
                    `Hours Used: ${monthData.budgetUsed || 0}/${monthData.budgetHours}`,
                    `Budget Remaining: ${monthData.budgetRemaining || 0} hours`
                  ];
                } else {
                  const total = invoiced[index] + (datasets[1]?.data[index] || 0);
                  return [
                    `Worked: €${invoiced[index].toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
                    `Total Potential: €${total.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
                  ];
                }
              }
            }
          }
        }
      }
    });
  }
}
