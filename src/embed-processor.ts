// embed-processor.ts - Refactored to use unified architecture with new render hierarchy

import { MarkdownPostProcessorContext } from 'obsidian';
import TimesheetReportPlugin from './main';
import { QueryProcessor } from './core/query-processor';
import { ChartFactory } from './charts';
import { TableFactory } from './tables';
import { parseQuery, ParseError } from './query/parser';
import { QueryInterpreter, TimesheetQuery, InterpreterError } from './query/interpreter';
import { Formatter } from './rendering';

export class EmbedProcessor {
  private plugin: TimesheetReportPlugin;
  private queryProcessor: QueryProcessor;
  private chartFactory: ChartFactory;
  private tableFactory: TableFactory;
  private formatter: Formatter;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
    this.queryProcessor = new QueryProcessor(plugin);
    this.chartFactory = new ChartFactory(plugin);
    this.tableFactory = new TableFactory(plugin);
    this.formatter = new Formatter(plugin.settings.currencySymbol || '€');
  }

  registerProcessor() {
    this.plugin.registerMarkdownCodeBlockProcessor('timesheet', (source, el, ctx) => {
      this.processTimesheetBlock(source, el, ctx);
    });
  }

  private async processTimesheetBlock(
    source: string,
    el: HTMLElement,
    _ctx: MarkdownPostProcessorContext
  ): Promise<void> {
    try {
      const query = this.parseQuery(source);
      await this.renderTimesheetEmbed(query, el);
    } catch (error) {
      if (error instanceof ParseError || error instanceof InterpreterError) {
        this.renderError(el, `Query error: ${error.message}`);
      } else {
        this.renderError(el, `Error processing timesheet query: ${error.message}`);
      }
    }
  }

  private parseQuery(source: string): TimesheetQuery {
    const ast = parseQuery(source);
    const interpreter = new QueryInterpreter();
    const query = interpreter.interpret(ast);
    return query;
  }

  private async renderTimesheetEmbed(query: TimesheetQuery, el: HTMLElement): Promise<void> {
    // Create container with appropriate styling
    const container = el.createEl('div', {
      cls: `timesheet-embed timesheet-embed-${query.size || 'normal'}`
    });

    try {
      // Process query to get filtered data
      const processedData = await this.queryProcessor.processQuery(query);

      // Render based on view type
      switch (query.view) {
        case 'summary':
          this.renderEmbedSummary(container, processedData, query);
          break;
        case 'chart':
          await this.renderEmbedChart(container, processedData, query);
          break;
        case 'table':
          await this.renderEmbedTable(container, processedData, query);
          break;
        case 'retainer':
          this.renderRetainerView(container, processedData, query);
          break;
        case 'health':
          this.renderHealthView(container, processedData, query);
          break;
        case 'full':
          this.renderEmbedSummary(container, processedData, query);
          await this.renderEmbedChart(container, processedData, query);
          await this.renderEmbedTable(container, processedData, query);
          break;
        default:
          this.renderEmbedSummary(container, processedData, query);
      }
    } catch (error) {
      this.renderError(container, `Error rendering timesheet data: ${error.message}`);
    }
  }

  private renderEmbedSummary(container: HTMLElement, data: any, query: TimesheetQuery): void {
    const summaryContainer = container.createEl('div', {
      cls: 'timesheet-embed-summary'
    });

    if (query.size !== 'compact') {
      summaryContainer.createEl('h4', {
        text: 'Timesheet Summary',
        cls: 'timesheet-embed-title'
      });
    }

    // Create summary grid
    const summaryGrid = summaryContainer.createEl('div', {
      cls: `timesheet-summary-grid timesheet-summary-${query.size || 'normal'}`
    });

    // Determine what summaries to show based on period and size
    const showCurrentYear = query.period === 'current-year' || query.period === 'all-time';
    const showAllTime = query.period === 'all-time' || query.size === 'detailed';
    const showMain = query.period !== 'current-year' && query.period !== 'all-time';

    if (showMain) {
      this.renderSummaryColumn(summaryGrid, 'Summary', data.summary, query.size || 'normal');
    }

    if (showCurrentYear) {
      this.renderSummaryColumn(summaryGrid, 'Current Year', data.yearSummary, query.size || 'normal');
    }

    if (showAllTime && query.size !== 'compact') {
      this.renderSummaryColumn(summaryGrid, 'All Time', data.allTimeSummary, query.size || 'normal');
    }

    // For compact mode, show only the most relevant summary
    if (query.size === 'compact' && !showCurrentYear && !showMain) {
      this.renderSummaryColumn(summaryGrid, 'Summary', data.allTimeSummary, query.size);
    }
  }

  private renderSummaryColumn(
    container: HTMLElement,
    title: string,
    summary: any,
    size: string
  ): void {
    const column = container.createEl('div', {
      cls: 'timesheet-summary-column'
    });

    if (size !== 'compact') {
      column.createEl('h5', { text: title });
    }

    const table = column.createEl('table', {
      cls: 'timesheet-summary-table'
    });

    const tbody = table.createEl('tbody');

    // Hours row
    const hoursRow = tbody.createEl('tr');
    hoursRow.createEl('td', { text: 'Hours', cls: 'summary-label' });
    hoursRow.createEl('td', {
      text: this.formatter.formatHours(summary.totalHours),
      cls: 'summary-value'
    });

    // Invoiced row
    const invoicedRow = tbody.createEl('tr');
    invoicedRow.createEl('td', { text: 'Invoiced', cls: 'summary-label' });
    invoicedRow.createEl('td', {
      text: this.formatter.formatCurrency(summary.totalInvoiced),
      cls: 'summary-value'
    });

    // Budget or Utilization row (only in normal/detailed mode)
    if (size !== 'compact') {
      if (summary.budgetHours !== undefined && summary.budgetHours > 0) {
        const progressRow = tbody.createEl('tr');
        progressRow.createEl('td', { text: 'Progress', cls: 'summary-label' });
        progressRow.createEl('td', {
          text: this.formatter.formatPercentage(summary.budgetProgress || 0),
          cls: 'summary-value'
        });

        if (size === 'detailed') {
          const remainingRow = tbody.createEl('tr');
          remainingRow.createEl('td', { text: 'Remaining', cls: 'summary-label' });
          remainingRow.createEl('td', {
            text: this.formatter.formatHours(summary.budgetRemaining || 0),
            cls: 'summary-value'
          });
        }
      } else {
        const utilizationRow = tbody.createEl('tr');
        utilizationRow.createEl('td', { text: 'Utilization', cls: 'summary-label' });
        utilizationRow.createEl('td', {
          text: this.formatter.formatPercentage(summary.utilization),
          cls: 'summary-value'
        });
      }
    }
  }

  private async renderEmbedChart(container: HTMLElement, data: any, query: TimesheetQuery): Promise<void> {
    const chartContainer = container.createEl('div', {
      cls: 'timesheet-embed-chart'
    });

    if (query.size !== 'compact') {
      chartContainer.createEl('h4', {
        text: 'Chart',
        cls: 'timesheet-embed-title'
      });
    }

    const chartWrapper = chartContainer.createEl('div', {
      cls: `timesheet-chart-container timesheet-chart-${query.size || 'normal'}`
    });

    try {
      // Determine height based on size
      const height = query.size === 'compact' ? 200 : query.size === 'detailed' ? 400 : 300;

      // Use the chart factory with processed data
      switch (query.chartType) {
        case 'trend': {
          const trendChart = this.chartFactory.createTrendChart(data.trendData);
          await trendChart.render({ container: chartWrapper, dimensions: { height } });
          break;
        }
        case 'budget': {
          const budgetChart = this.chartFactory.createBudgetChart(data.monthlyData);
          await budgetChart.render({ container: chartWrapper, dimensions: { height } });
          break;
        }
        case 'monthly':
        default: {
          const monthlyChart = this.chartFactory.createMonthlyChart(data.monthlyData);
          await monthlyChart.render({ container: chartWrapper, dimensions: { height } });
          break;
        }
      }
    } catch (error) {
      this.renderError(chartWrapper, `Error rendering chart: ${error.message}`);
    }
  }

  private async renderEmbedTable(container: HTMLElement, data: any, query: TimesheetQuery): Promise<void> {
    const tableContainer = container.createEl('div', {
      cls: 'timesheet-embed-table'
    });

    if (query.size !== 'compact') {
      tableContainer.createEl('h4', {
        text: 'Monthly Data',
        cls: 'timesheet-embed-title'
      });
    }

    try {
      // Limit data based on size
      let displayData = data.monthlyData;
      if (query.size === 'compact') {
        displayData = displayData.slice(0, 3);
      } else if (query.size === 'normal') {
        displayData = displayData.slice(0, 6);
      }

      // Create monthly table using TableFactory
      const tableOptions = {
        format: 'html' as const,
        compact: query.size === 'compact',
        showTotal: query.size !== 'compact'
      };

      const monthlyTable = this.tableFactory.createMonthlyTable(displayData, tableOptions);

      // Render options
      const renderOptions = {
        container: tableContainer,
        format: 'html' as const
      };

      const tableHtml = await monthlyTable.render(renderOptions);
      tableContainer.innerHTML = tableHtml;
    } catch (error) {
      this.renderError(tableContainer, `Error rendering table: ${error.message}`);
    }
  }

  private renderRetainerView(container: HTMLElement, data: any, query: TimesheetQuery): void {
    const retainerContainer = container.createEl('div', {
      cls: 'timesheet-retainer-view'
    });

    retainerContainer.createEl('h4', {
      text: 'Retainer Status',
      cls: 'timesheet-embed-title'
    });

    // Show summary with retainer-specific metrics
    this.renderEmbedSummary(retainerContainer, data, query);

    // Add retainer-specific information
    const retainerInfo = retainerContainer.createEl('div', {
      cls: 'retainer-info'
    });

    if (data.summary.budgetHours) {
      const progressBar = retainerInfo.createEl('div', { cls: 'progress-bar' });
      const progressPercent = Math.min(100, (data.summary.budgetProgress || 0) * 100);
      progressBar.createEl('div', {
        cls: 'progress-fill',
        attr: {
          style: `width: ${progressPercent}%`
        }
      });

      retainerInfo.createEl('p', {
        text: `${this.formatter.formatHours(data.summary.totalHours)} of ${this.formatter.formatHours(data.summary.budgetHours)} hours used`
      });
    }
  }

  private renderHealthView(container: HTMLElement, data: any, query: TimesheetQuery): void {
    const healthContainer = container.createEl('div', {
      cls: 'timesheet-health-view'
    });

    healthContainer.createEl('h4', {
      text: 'Project Health',
      cls: 'timesheet-embed-title'
    });

    // Calculate health metrics
    const utilization = data.summary.utilization || 0;
    const budgetProgress = data.summary.budgetProgress || 0;

    // Health indicators
    const healthGrid = healthContainer.createEl('div', {
      cls: 'health-grid'
    });

    // Utilization health
    const utilizationHealth = this.getHealthStatus(utilization, 0.7, 0.9);
    const utilizationItem = healthGrid.createEl('div', {
      cls: `health-item health-${utilizationHealth}`
    });
    utilizationItem.createEl('span', { text: 'Utilization', cls: 'health-label' });
    utilizationItem.createEl('span', {
      text: this.formatter.formatPercentage(utilization),
      cls: 'health-value'
    });

    // Budget health (if applicable)
    if (data.summary.budgetHours) {
      const budgetHealth = this.getHealthStatus(1 - budgetProgress, 0.2, 0.5);
      const budgetItem = healthGrid.createEl('div', {
        cls: `health-item health-${budgetHealth}`
      });
      budgetItem.createEl('span', { text: 'Budget', cls: 'health-label' });
      budgetItem.createEl('span', {
        text: this.formatter.formatPercentage(budgetProgress),
        cls: 'health-value'
      });
    }
  }

  private getHealthStatus(value: number, lowThreshold: number, highThreshold: number): 'good' | 'warning' | 'danger' {
    if (value >= highThreshold) return 'good';
    if (value >= lowThreshold) return 'warning';
    return 'danger';
  }

  private renderError(container: HTMLElement, message: string): void {
    container.empty();
    container.createEl('div', {
      cls: 'timesheet-embed-error',
      text: message
    });
  }
}
