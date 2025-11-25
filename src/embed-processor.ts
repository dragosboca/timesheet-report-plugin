// embed-processor.ts

import { MarkdownPostProcessorContext } from 'obsidian';
import TimesheetReportPlugin from './main';
import { DataProcessor } from './data-processor';
import { ChartRenderer } from './chart-renderer';
import { QueryParser, parseQuery, ParseError } from './query/parser';
import { QueryInterpreter, TimesheetQuery, InterpreterError } from './query/interpreter';

export class EmbedProcessor {
  private plugin: TimesheetReportPlugin;
  private dataProcessor: DataProcessor;
  private chartRenderer: ChartRenderer;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
    this.dataProcessor = new DataProcessor(plugin);
    this.chartRenderer = new ChartRenderer(plugin, this.dataProcessor);
  }

  registerProcessor() {
    this.plugin.registerMarkdownCodeBlockProcessor('timesheet', (source, el, _ctx) => {
      this.processTimesheetBlock(source, el, _ctx);
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
      cls: `timesheet-embed timesheet-embed-${query.size}`
    });

    try {
      // Get filtered data based on query
      const reportData = await this.dataProcessor.processTimesheetData();
      const filteredData = this.applyFilters(reportData, query);

      // Render based on view type
      switch (query.view) {
        case 'summary':
          this.renderEmbedSummary(container, filteredData, query);
          break;
        case 'chart':
          await this.renderEmbedChart(container, filteredData, query);
          break;
        case 'table':
          this.renderEmbedTable(container, filteredData, query);
          break;
        case 'full':
          this.renderEmbedSummary(container, filteredData, query);
          await this.renderEmbedChart(container, filteredData, query);
          this.renderEmbedTable(container, filteredData, query);
          break;
      }
    } catch (error) {
      this.renderError(container, `Error rendering timesheet data: ${error.message}`);
    }
  }

  private applyFilters(reportData: unknown, query: TimesheetQuery): unknown {
    // Type guard to ensure reportData is an object before spreading
    if (!reportData || typeof reportData !== 'object') {
      return reportData;
    }

    const filteredData = { ...reportData as Record<string, unknown> } as Record<string, unknown> & {
      monthlyData: Array<{
        year: number;
        month: number;
        label: string;
        hours: number;
        invoiced: number;
        utilization: number;
        budgetProgress?: number;
      }>;
    };

    if (query.where) {
      // Filter monthly data based on conditions
      if (query.where.year) {
        filteredData.monthlyData = filteredData.monthlyData.filter((month: {
          year: number;
          month: number;
          label: string;
          hours: number;
          invoiced: number;
          utilization: number;
          budgetProgress?: number;
        }) =>
          month.year === query.where?.year
        );
      }

      if (query.where.month) {
        filteredData.monthlyData = filteredData.monthlyData.filter((month: {
          year: number;
          month: number;
          label: string;
          hours: number;
          invoiced: number;
          utilization: number;
          budgetProgress?: number;
        }) =>
          month.month === query.where?.month
        );
      }

      if (query.where.dateRange) {
        const startDate = new Date(query.where.dateRange.start);
        const endDate = new Date(query.where.dateRange.end);
        filteredData.monthlyData = filteredData.monthlyData.filter((month: {
          year: number;
          month: number;
          label: string;
          hours: number;
          invoiced: number;
          utilization: number;
          budgetProgress?: number;
        }) => {
          const monthDate = new Date(month.year, month.month - 1);
          return monthDate >= startDate && monthDate <= endDate;
        });
      }
    }

    // Apply period filters
    if (query.period) {
      const now = new Date();
      const currentYear = now.getFullYear();

      switch (query.period) {
        case 'current-year':
          filteredData.monthlyData = filteredData.monthlyData.filter((month: {
            year: number;
            month: number;
            label: string;
            hours: number;
            invoiced: number;
            utilization: number;
            budgetProgress?: number;
          }) =>
            month.year === currentYear
          );
          break;
        case 'last-6-months':
          filteredData.monthlyData = filteredData.monthlyData.slice(0, 6);
          break;
        case 'last-12-months':
          filteredData.monthlyData = filteredData.monthlyData.slice(0, 12);
          break;
        // 'all-time' shows everything (no filter)
      }
    }

    return filteredData;
  }

  private renderEmbedSummary(container: HTMLElement, data: unknown, query: TimesheetQuery): void {
    const dataTyped = data as any;
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
      cls: `timesheet-summary-grid timesheet-summary-${query.size}`
    });

    // Determine what summaries to show based on period
    const showCurrentYear = query.period === 'current-year' || query.period === 'all-time';
    const showAllTime = query.period === 'all-time' || query.size === 'detailed';

    if (showCurrentYear) {
      this.renderSummaryColumn(summaryGrid, 'Current Year', dataTyped.yearSummary, query.size || 'normal');
    }

    if (showAllTime && query.size !== 'compact') {
      this.renderSummaryColumn(summaryGrid, 'All Time', dataTyped.allTimeSummary, query.size || 'normal');
    }

    // For compact mode, show only the most relevant summary
    if (query.size === 'compact' && !showCurrentYear) {
      this.renderSummaryColumn(summaryGrid, 'Summary', dataTyped.allTimeSummary, query.size || 'normal');
    }
  }

  private renderSummaryColumn(
    container: HTMLElement,
    title: string,
    summary: unknown,
    size: string
  ): void {
    const summaryTyped = summary as any;
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
    hoursRow.createEl('td', { text: this.formatNumber(summaryTyped.totalHours), cls: 'summary-value' });

    // Invoiced row
    const invoicedRow = tbody.createEl('tr');
    invoicedRow.createEl('td', { text: 'Invoiced', cls: 'summary-label' });
    invoicedRow.createEl('td', { text: `€${this.formatNumber(summaryTyped.totalInvoiced)}`, cls: 'summary-value' });

    // Budget or Utilization row (only in normal/detailed mode)
    if (size !== 'compact') {
      if (summaryTyped.budgetHours !== undefined) {
        const progressRow = tbody.createEl('tr');
        progressRow.createEl('td', { text: 'Progress', cls: 'summary-label' });
        progressRow.createEl('td', { text: `${Math.round((summaryTyped.budgetProgress || 0) * 100)}%`, cls: 'summary-value' });

        if (size === 'detailed') {
          const remainingRow = tbody.createEl('tr');
          remainingRow.createEl('td', { text: 'Remaining', cls: 'summary-label' });
          remainingRow.createEl('td', { text: `${this.formatNumber(summaryTyped.budgetRemaining || 0)}h`, cls: 'summary-value' });
        }
      } else {
        const utilizationRow = tbody.createEl('tr');
        utilizationRow.createEl('td', { text: 'Utilization', cls: 'summary-label' });
        utilizationRow.createEl('td', { text: `${Math.round(summaryTyped.utilization * 100)}%`, cls: 'summary-value' });
      }
    }
  }

  private async renderEmbedChart(container: HTMLElement, data: unknown, query: TimesheetQuery): Promise<void> {
    const dataTyped = data as any;
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
      switch (query.chartType) {
        case 'trend':
          await this.chartRenderer.renderTrendChart(chartWrapper, dataTyped.trendData);
          break;
        case 'monthly':
        case 'budget':
        default:
          await this.chartRenderer.renderMonthlyChart(chartWrapper, dataTyped.monthlyData);
          break;
      }
    } catch (error) {
      this.renderError(chartWrapper, `Error rendering chart: ${error.message}`);
    }
  }

  private renderEmbedTable(container: HTMLElement, data: unknown, query: TimesheetQuery): void {
    const dataTyped = data as any;
    const tableContainer = container.createEl('div', {
      cls: 'timesheet-embed-table'
    });

    if (query.size !== 'compact') {
      tableContainer.createEl('h4', {
        text: 'Monthly Data',
        cls: 'timesheet-embed-title'
      });
    }

    // Limit rows based on size
    let displayData = dataTyped.monthlyData;
    if (query.size === 'compact') {
      displayData = displayData.slice(0, 3);
    } else if (query.size === 'normal') {
      displayData = displayData.slice(0, 6);
    }

    const table = tableContainer.createEl('table', {
      cls: 'timesheet-data-table timesheet-embed-data-table'
    });

    // Check if this is a budget project
    const isBudgetProject = displayData.some((month: any) => month.budgetHours !== undefined);

    // Table header
    const thead = table.createEl('thead');
    const headerRow = thead.createEl('tr');

    if (query.size === 'compact') {
      // Compact header
      ['Period', 'Hours', 'Revenue'].forEach(header => {
        headerRow.createEl('th', { text: header });
      });
    } else {
      // Full header based on project type
      if (isBudgetProject) {
        ['Period', 'Hours', 'Invoiced', 'Progress'].forEach(header => {
          headerRow.createEl('th', { text: header });
        });
      } else {
        ['Period', 'Hours', 'Invoiced', 'Utilization'].forEach(header => {
          headerRow.createEl('th', { text: header });
        });
      }
    }

    // Table body
    const tbody = table.createEl('tbody');

    displayData.forEach((month: any) => {
      const row = tbody.createEl('tr');

      row.createEl('td', { text: month.label });
      row.createEl('td', { text: this.formatNumber(month.hours) });
      row.createEl('td', { text: `€${this.formatNumber(month.invoiced)}` });

      if (query.size !== 'compact') {
        if (isBudgetProject && month.budgetProgress !== undefined) {
          row.createEl('td', { text: `${Math.round(month.budgetProgress * 100)}%` });
        } else {
          row.createEl('td', { text: `${Math.round(month.utilization * 100)}%` });
        }
      }
    });
  }

  private renderError(container: HTMLElement, message: string): void {
    container.createEl('div', {
      cls: 'timesheet-embed-error',
      text: message
    });
  }

  private formatNumber(num: number): string {
    return num.toLocaleString('en-US', { maximumFractionDigits: 1 });
  }
}
