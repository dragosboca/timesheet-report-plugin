// embed-processor.ts

import { MarkdownPostProcessorContext } from 'obsidian';
import TimesheetReportPlugin from './main';
import { DataProcessor } from './data-processor';
import { ChartRenderer } from './chart-renderer';

interface TimesheetQuery {
  where?: {
    year?: number;
    month?: number;
    project?: string;
    dateRange?: { start: string; end: string };
  };
  show?: string[];
  view?: 'summary' | 'chart' | 'table' | 'full';
  chartType?: 'trend' | 'monthly' | 'budget';
  period?: 'current-year' | 'all-time' | 'last-6-months' | 'last-12-months';
  size?: 'compact' | 'normal' | 'detailed';
}

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
    this.plugin.registerMarkdownCodeBlockProcessor('timesheet', (source, el, ctx) => {
      this.processTimesheetBlock(source, el, ctx);
    });
  }

  private async processTimesheetBlock(
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ): Promise<void> {
    try {
      const query = this.parseQuery(source);
      await this.renderTimesheetEmbed(query, el);
    } catch (error) {
      this.renderError(el, `Error processing timesheet query: ${error.message}`);
    }
  }

  private parseQuery(source: string): TimesheetQuery {
    const lines = source.trim().split('\n');
    const query: TimesheetQuery = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) continue;

      if (trimmed.toUpperCase().startsWith('WHERE')) {
        query.where = this.parseWhereClause(trimmed);
      } else if (trimmed.toUpperCase().startsWith('SHOW')) {
        query.show = this.parseShowClause(trimmed);
      } else if (trimmed.toUpperCase().startsWith('VIEW')) {
        query.view = this.parseViewClause(trimmed);
      } else if (trimmed.toUpperCase().startsWith('CHART')) {
        query.chartType = this.parseChartClause(trimmed);
      } else if (trimmed.toUpperCase().startsWith('PERIOD')) {
        query.period = this.parsePeriodClause(trimmed);
      } else if (trimmed.toUpperCase().startsWith('SIZE')) {
        query.size = this.parseSizeClause(trimmed);
      }
    }

    // Set defaults
    query.view = query.view || 'summary';
    query.period = query.period || 'current-year';
    query.size = query.size || 'normal';

    return query;
  }

  private parseWhereClause(line: string): any {
    const whereContent = line.substring(5).trim(); // Remove 'WHERE'
    const conditions: any = {};

    // Parse year condition
    const yearMatch = whereContent.match(/year\s*=\s*(\d{4})/i);
    if (yearMatch) {
      conditions.year = parseInt(yearMatch[1]);
    }

    // Parse month condition
    const monthMatch = whereContent.match(/month\s*=\s*(\d{1,2})/i);
    if (monthMatch) {
      conditions.month = parseInt(monthMatch[1]);
    }

    // Parse project condition
    const projectMatch = whereContent.match(/project\s*=\s*["']([^"']+)["']/i);
    if (projectMatch) {
      conditions.project = projectMatch[1];
    }

    // Parse date range
    const dateRangeMatch = whereContent.match(/date\s+between\s+["']([^"']+)["']\s+and\s+["']([^"']+)["']/i);
    if (dateRangeMatch) {
      conditions.dateRange = {
        start: dateRangeMatch[1],
        end: dateRangeMatch[2]
      };
    }

    return conditions;
  }

  private parseShowClause(line: string): string[] {
    const showContent = line.substring(4).trim(); // Remove 'SHOW'
    return showContent.split(',').map(item => item.trim());
  }

  private parseViewClause(line: string): 'summary' | 'chart' | 'table' | 'full' {
    const viewContent = line.substring(4).trim(); // Remove 'VIEW'
    const view = viewContent.toLowerCase() as 'summary' | 'chart' | 'table' | 'full';
    return ['summary', 'chart', 'table', 'full'].includes(view) ? view : 'summary';
  }

  private parseChartClause(line: string): 'trend' | 'monthly' | 'budget' {
    const chartContent = line.substring(5).trim(); // Remove 'CHART'
    const chart = chartContent.toLowerCase() as 'trend' | 'monthly' | 'budget';
    return ['trend', 'monthly', 'budget'].includes(chart) ? chart : 'monthly';
  }

  private parsePeriodClause(line: string): 'current-year' | 'all-time' | 'last-6-months' | 'last-12-months' {
    const periodContent = line.substring(6).trim(); // Remove 'PERIOD'
    const period = periodContent.toLowerCase() as 'current-year' | 'all-time' | 'last-6-months' | 'last-12-months';
    return ['current-year', 'all-time', 'last-6-months', 'last-12-months'].includes(period) ? period : 'current-year';
  }

  private parseSizeClause(line: string): 'compact' | 'normal' | 'detailed' {
    const sizeContent = line.substring(4).trim(); // Remove 'SIZE'
    const size = sizeContent.toLowerCase() as 'compact' | 'normal' | 'detailed';
    return ['compact', 'normal', 'detailed'].includes(size) ? size : 'normal';
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

  private applyFilters(reportData: any, query: TimesheetQuery): any {
    const filteredData = { ...reportData };

    if (query.where) {
      // Filter monthly data based on conditions
      if (query.where.year) {
        filteredData.monthlyData = filteredData.monthlyData.filter((month: any) =>
          month.year === query.where!.year
        );
      }

      if (query.where.month) {
        filteredData.monthlyData = filteredData.monthlyData.filter((month: any) =>
          month.month === query.where!.month
        );
      }

      if (query.where.dateRange) {
        const startDate = new Date(query.where!.dateRange.start);
        const endDate = new Date(query.where!.dateRange.end);
        filteredData.monthlyData = filteredData.monthlyData.filter((month: any) => {
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
          filteredData.monthlyData = filteredData.monthlyData.filter((month: any) =>
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
      cls: `timesheet-summary-grid timesheet-summary-${query.size}`
    });

    // Determine what summaries to show based on period
    const showCurrentYear = query.period === 'current-year' || query.period === 'all-time';
    const showAllTime = query.period === 'all-time' || query.size === 'detailed';

    if (showCurrentYear) {
      this.renderSummaryColumn(summaryGrid, 'Current Year', data.yearSummary, query.size || 'normal');
    }

    if (showAllTime && query.size !== 'compact') {
      this.renderSummaryColumn(summaryGrid, 'All Time', data.allTimeSummary, query.size || 'normal');
    }

    // For compact mode, show only the most relevant summary
    if (query.size === 'compact' && !showCurrentYear) {
      this.renderSummaryColumn(summaryGrid, 'Summary', data.allTimeSummary, query.size || 'normal');
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
    hoursRow.createEl('td', { text: this.formatNumber(summary.totalHours), cls: 'summary-value' });

    // Invoiced row
    const invoicedRow = tbody.createEl('tr');
    invoicedRow.createEl('td', { text: 'Invoiced', cls: 'summary-label' });
    invoicedRow.createEl('td', { text: `€${this.formatNumber(summary.totalInvoiced)}`, cls: 'summary-value' });

    // Budget or Utilization row (only in normal/detailed mode)
    if (size !== 'compact') {
      if (summary.budgetHours !== undefined) {
        const progressRow = tbody.createEl('tr');
        progressRow.createEl('td', { text: 'Progress', cls: 'summary-label' });
        progressRow.createEl('td', { text: `${Math.round((summary.budgetProgress || 0) * 100)}%`, cls: 'summary-value' });

        if (size === 'detailed') {
          const remainingRow = tbody.createEl('tr');
          remainingRow.createEl('td', { text: 'Remaining', cls: 'summary-label' });
          remainingRow.createEl('td', { text: `${this.formatNumber(summary.budgetRemaining || 0)}h`, cls: 'summary-value' });
        }
      } else {
        const utilizationRow = tbody.createEl('tr');
        utilizationRow.createEl('td', { text: 'Utilization', cls: 'summary-label' });
        utilizationRow.createEl('td', { text: `${Math.round(summary.utilization * 100)}%`, cls: 'summary-value' });
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
      switch (query.chartType) {
        case 'trend':
          await this.chartRenderer.renderTrendChart(chartWrapper, data.trendData);
          break;
        case 'monthly':
        case 'budget':
        default:
          await this.chartRenderer.renderMonthlyChart(chartWrapper, data.monthlyData);
          break;
      }
    } catch (error) {
      this.renderError(chartWrapper, `Error rendering chart: ${error.message}`);
    }
  }

  private renderEmbedTable(container: HTMLElement, data: any, query: TimesheetQuery): void {
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
    let displayData = data.monthlyData;
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
