// chart-renderer.ts

declare global {
    interface Window {
        Chart: unknown;
    }
}

export class ChartRenderer {
    private chartScriptLoaded = false;

    constructor() {
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

        return {
            primary: isDark ? 'rgba(100, 150, 220, 0.8)' : 'rgba(79, 129, 189, 0.8)',
            secondary: isDark ? 'rgba(220, 100, 100, 0.8)' : 'rgba(192, 80, 77, 0.8)',
            tertiary: isDark ? 'rgba(150, 200, 100, 0.8)' : 'rgba(155, 187, 89, 0.8)',
            quaternary: isDark ? 'rgba(170, 130, 190, 0.8)' : 'rgba(128, 100, 162, 0.8)',
            grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            text: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
            background: isDark ? 'rgba(30, 30, 30, 0.2)' : 'rgba(240, 240, 240, 0.2)'
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

    async renderMonthlyChart(container: HTMLElement, monthlyData: Array<{ label: string; hours: number; invoiced: number; }>): Promise<void> {
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

        // Extract data for chart
        const labels = recentData.map(item => item.label);
        const hours = recentData.map(item => item.hours);
        const invoiced = recentData.map(item => item.invoiced);

        // Create chart
        new (window.Chart as any)(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Hours',
                        data: hours,
                        backgroundColor: colors.primary,
                        borderColor: colors.primary.replace('0.8', '1.0'),
                        borderWidth: 1,
                        yAxisID: 'hours'
                    },
                    {
                        label: 'Invoiced',
                        data: invoiced,
                        backgroundColor: colors.tertiary,
                        borderColor: colors.tertiary.replace('0.8', '1.0'),
                        borderWidth: 1,
                        yAxisID: 'invoiced'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Breakdown',
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
                                    label += '€' + context.raw.toLocaleString('en-US', {
                                        maximumFractionDigits: 2
                                    });
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
                        grid: {
                            color: colors.grid
                        },
                        ticks: {
                            color: colors.text
                        }
                    },
                    invoiced: {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Invoiced (€)',
                            color: colors.text
                        },
                        min: 0,
                        grid: {
                            display: false
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
                }
            }
        });
    }
}
