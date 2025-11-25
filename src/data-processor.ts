import { TFile } from 'obsidian';
import TimesheetReportPlugin from './main';
import { QueryProcessor, ProcessedData } from './core/query-processor';
import { TimesheetQuery } from './query/interpreter';
import { DateUtils } from './utils/date-utils';

export interface TimeEntry {
  date: Date;
  hours: number;
  rate?: number;
  project?: string;
  notes?: string;
}

export interface MonthData {
  year: number;
  month: number;
  label: string;
  hours: number;
  invoiced: number;
  utilization: number;
  rate: number;
  budgetProgress?: number;
  budgetHours?: number;
  budgetRemaining?: number;
  cumulativeHours: number;
}

export interface SummaryData {
  totalHours: number;
  totalInvoiced: number;
  utilization: number;
  budgetHours?: number;
  budgetProgress?: number;
  budgetRemaining?: number;
}

export interface ReportData {
  entries: TimeEntry[];
  monthlyData: MonthData[];
  trendData: {
    labels: string[];
    hours: number[];
    utilization: number[];
    invoiced: number[];
  };
  summary: SummaryData;
  yearSummary: SummaryData;
  allTimeSummary: SummaryData;
}

/**
 * Simplified DataProcessor that delegates to the unified QueryProcessor
 * Maintains backward compatibility while using the new architecture
 */
export class DataProcessor {
  private plugin: TimesheetReportPlugin;
  private queryProcessor: QueryProcessor;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
    this.queryProcessor = new QueryProcessor(plugin);
  }

  /**
   * Process timesheet data with default query (all current year data)
   */
  async processTimesheetData(): Promise<ReportData> {
    const defaultQuery: TimesheetQuery = {
      view: 'full',
      period: 'current-year',
      size: 'normal'
    };

    return this.processWithQuery(defaultQuery);
  }

  /**
   * Process timesheet data with specific query
   */
  async processWithQuery(query: TimesheetQuery): Promise<ReportData> {
    const processedData = await this.queryProcessor.processQuery(query);

    // Convert to legacy format for backward compatibility
    return this.convertToReportData(processedData);
  }

  /**
   * Get timesheet data for a specific year
   */
  async processTimesheetDataForYear(year: number): Promise<ReportData> {
    const query: TimesheetQuery = {
      where: { year },
      view: 'full',
      period: 'all-time',
      size: 'normal'
    };

    return this.processWithQuery(query);
  }

  /**
   * Get timesheet data for a specific month
   */
  async processTimesheetDataForMonth(year: number, month: number): Promise<ReportData> {
    const query: TimesheetQuery = {
      where: { year, month },
      view: 'full',
      period: 'all-time',
      size: 'normal'
    };

    return this.processWithQuery(query);
  }

  /**
   * Get timesheet data for a specific project
   */
  async processTimesheetDataForProject(project: string): Promise<ReportData> {
    const query: TimesheetQuery = {
      where: { project },
      view: 'full',
      period: 'all-time',
      size: 'normal'
    };

    return this.processWithQuery(query);
  }

  /**
   * Get timesheet data for a date range
   */
  async processTimesheetDataForDateRange(startDate: Date, endDate: Date): Promise<ReportData> {
    const query: TimesheetQuery = {
      where: {
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      },
      view: 'full',
      period: 'all-time',
      size: 'normal'
    };

    return this.processWithQuery(query);
  }

  /**
   * Convert ProcessedData to legacy ReportData format
   */
  private convertToReportData(processedData: ProcessedData): ReportData {
    // Convert entries to legacy TimeEntry format
    const entries: TimeEntry[] = processedData.entries.map(entry => ({
      date: entry.date,
      hours: entry.hours,
      rate: entry.rate,
      project: entry.project,
      notes: entry.notes || entry.taskDescription
    }));

    // Monthly data is already in the correct format
    const monthlyData: MonthData[] = processedData.monthlyData;

    return {
      entries,
      monthlyData,
      trendData: processedData.trendData,
      summary: processedData.summary,
      yearSummary: processedData.yearSummary,
      allTimeSummary: processedData.allTimeSummary
    };
  }

  /**
   * Legacy method: Get working days in month
   * Now delegates to DateUtils
   */
  public getWorkingDaysInMonth(year: number, month: number): number {
    return DateUtils.getWorkingDaysInMonth(year, month);
  }

  /**
   * Legacy method: Calculate target hours for month
   * Now delegates to DateUtils
   */
  public calculateTargetHoursForMonth(year: number, month: number): number {
    const hoursPerWorkday = this.plugin.settings.hoursPerWorkday || 8;
    return DateUtils.calculateTargetHoursForMonth(year, month, hoursPerWorkday);
  }

  /**
   * Legacy method: Extract date from file
   * Now delegates to DateUtils
   */
  public extractDateFromFile(file: TFile): Promise<Date | null> {
    return DateUtils.extractDateFromFile(file);
  }

  /**
   * Clear cached data
   */
  public clearCache(): void {
    this.queryProcessor.clearCache();
  }

  /**
   * Get summary statistics
   */
  async getSummaryStatistics(): Promise<{
    currentYear: SummaryData;
    allTime: SummaryData;
    lastSixMonths: SummaryData;
  }> {
    const currentYearData = await this.processTimesheetDataForYear(new Date().getFullYear());
    const allTimeData = await this.processTimesheetData();

    const lastSixMonthsQuery: TimesheetQuery = {
      period: 'last-6-months',
      view: 'summary',
      size: 'normal'
    };
    const lastSixMonthsProcessed = await this.queryProcessor.processQuery(lastSixMonthsQuery);

    return {
      currentYear: currentYearData.yearSummary,
      allTime: allTimeData.allTimeSummary,
      lastSixMonths: lastSixMonthsProcessed.summary
    };
  }

  /**
   * Get monthly breakdown for a specific year
   */
  async getMonthlyBreakdown(year: number): Promise<MonthData[]> {
    const data = await this.processTimesheetDataForYear(year);
    return data.monthlyData.filter(month => month.year === year);
  }

  /**
   * Get project breakdown
   */
  async getProjectBreakdown(): Promise<Array<{ project: string; hours: number; invoiced: number }>> {
    const data = await this.processTimesheetData();
    const projectMap = new Map<string, { hours: number; invoiced: number }>();

    for (const entry of data.entries) {
      const project = entry.project || 'Unknown';
      const existing = projectMap.get(project) || { hours: 0, invoiced: 0 };

      existing.hours += entry.hours;
      existing.invoiced += entry.hours * (entry.rate || 0);

      projectMap.set(project, existing);
    }

    return Array.from(projectMap.entries()).map(([project, data]) => ({
      project,
      ...data
    })).sort((a, b) => b.hours - a.hours);
  }
}
