// Query executor that processes timesheet queries and returns aggregated data
// This bridges the query system with the data layer

import { TimesheetQuery } from './interpreter';
import { TimeEntry, QueryOptions, TimesheetDataSource, createTimesheetDataSource } from '../../datasource';
import { DateUtils } from '../../utils/date-utils';
import TimesheetReportPlugin from '../../main';
import { MonthData } from '../../types';

export interface ProcessedData {
  entries: TimeEntry[];
  monthlyData: MonthlyDataPoint[];
  trendData: TrendData;
  summary: SummaryData;
  yearSummary: SummaryData;
  allTimeSummary: SummaryData;
}

export interface MonthlyDataPoint {
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

export interface TrendData {
  labels: string[];
  hours: number[];
  utilization: number[];
  invoiced: number[];
}

export interface SummaryData {
  totalHours: number;
  totalInvoiced: number;
  utilization: number;
  budgetHours?: number;
  budgetProgress?: number;
  budgetRemaining?: number;
}

export class QueryExecutor {
  private plugin: TimesheetReportPlugin;
  private dataSource: TimesheetDataSource;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
    this.dataSource = createTimesheetDataSource(plugin);
  }

  async execute(query: TimesheetQuery): Promise<ProcessedData> {
    const queryOptions = this.convertQueryToQueryOptions(query);
    const entries = await this.dataSource.query(queryOptions);
    const filteredEntries = this.applyQueryFilters(entries, query);

    const monthlyData = this.generateMonthlyData(filteredEntries);
    const trendData = this.generateTrendData(monthlyData, query);
    const summary = this.generateSummary(filteredEntries, query);
    const yearSummary = this.generateYearSummary(filteredEntries);
    const allTimeSummary = this.generateAllTimeSummary(filteredEntries);

    return {
      entries: filteredEntries,
      monthlyData,
      trendData,
      summary,
      yearSummary,
      allTimeSummary
    };
  }

  private convertQueryToQueryOptions(query: TimesheetQuery): QueryOptions {
    const options: QueryOptions = {};

    if (query.where) {
      options.year = query.where.year;
      options.month = query.where.month;
      options.projectFilter = query.where.project;

      if (query.where.dateRange) {
        options.dateRange = {
          start: new Date(query.where.dateRange.start),
          end: new Date(query.where.dateRange.end)
        };
      }
    }

    if (query.period) {
      const now = new Date();
      const currentYear = now.getFullYear();

      switch (query.period) {
        case 'current-year':
          options.year = currentYear;
          break;
        case 'last-6-months': {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          options.dateRange = {
            start: sixMonthsAgo,
            end: now
          };
          break;
        }
        case 'last-12-months': {
          const twelveMonthsAgo = new Date();
          twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
          options.dateRange = {
            start: twelveMonthsAgo,
            end: now
          };
          break;
        }
      }
    }

    return options;
  }

  private applyQueryFilters(entries: TimeEntry[], query: TimesheetQuery): TimeEntry[] {
    let filtered = entries;

    if (query.where) {
      if (query.where.service) {
        filtered = filtered.filter(entry =>
          entry.notes?.toLowerCase().includes(query.where!.service!.toLowerCase()) ||
          entry.project?.toLowerCase().includes(query.where!.service!.toLowerCase())
        );
      }

      if (query.where.category) {
        filtered = filtered.filter(entry =>
          entry.notes?.toLowerCase().includes(query.where!.category!.toLowerCase())
        );
      }

      if (query.where.utilization !== undefined) {
        const threshold = query.where.utilization;
        filtered = filtered.filter(entry => {
          const dailyTarget = this.plugin.settings.hoursPerWorkday || 8;
          const dailyUtilization = entry.hours / dailyTarget;
          return dailyUtilization >= threshold;
        });
      }

      if (query.where.value !== undefined && query.where.value > 0) {
        filtered = filtered.filter(entry => {
          const hourlyValue = entry.rate || 0;
          return hourlyValue >= query.where!.value!;
        });
      }
    }

    return filtered;
  }

  private generateMonthlyData(entries: TimeEntry[]): MonthlyDataPoint[] {
    const monthlyMap = new Map<string, {
      entries: TimeEntry[];
      year: number;
      month: number;
    }>();

    for (const entry of entries) {
      const year = entry.date.getFullYear();
      const month = entry.date.getMonth() + 1;
      const key = `${year}-${month.toString().padStart(2, '0')}`;

      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          entries: [],
          year,
          month
        });
      }

      monthlyMap.get(key)!.entries.push(entry);
    }

    const monthlyData: MonthlyDataPoint[] = [];
    const sortedKeys = Array.from(monthlyMap.keys()).sort().reverse();

    let cumulativeHours = 0;

    for (const key of sortedKeys) {
      const monthData = monthlyMap.get(key)!;
      const { year, month, entries: monthEntries } = monthData;

      const totalHours = monthEntries.reduce((sum, entry) => sum + entry.hours, 0);
      const totalInvoiced = monthEntries.reduce((sum, entry) => sum + (entry.hours * (entry.rate || 0)), 0);
      const avgRate = totalHours > 0 ? totalInvoiced / totalHours : 0;

      const hoursPerWorkday = this.plugin.settings.hoursPerWorkday || 8;
      const workingDays = DateUtils.getWorkingDaysInMonth(year, month);
      const targetHoursForMonth = workingDays * hoursPerWorkday;
      const utilization = targetHoursForMonth > 0 ? totalHours / targetHoursForMonth : 0;

      cumulativeHours += totalHours;

      const monthName = DateUtils.getMonthName(month);
      const label = `${monthName} ${year}`;

      if (this.plugin.settings.debugMode) {
        console.log(`[Timesheet] ${label} - Hours: ${totalHours}, Target: ${targetHoursForMonth}, Utilization: ${Math.round(utilization * 100)}%`);
      }

      const projectType = this.plugin.settings.project?.type;
      const budgetHours = projectType === 'fixed-hours' ? this.plugin.settings.project?.budgetHours : undefined;

      let budgetProgress: number | undefined;
      let budgetRemaining: number | undefined;

      if (budgetHours && budgetHours > 0) {
        budgetProgress = cumulativeHours / budgetHours;
        budgetRemaining = budgetHours - cumulativeHours;
      }

      monthlyData.push({
        year,
        month,
        label,
        hours: totalHours,
        invoiced: totalInvoiced,
        utilization,
        rate: avgRate,
        budgetProgress,
        budgetHours,
        budgetRemaining,
        cumulativeHours
      });
    }

    return monthlyData;
  }

  private generateTrendData(monthlyData: MonthlyDataPoint[], query: TimesheetQuery): TrendData {
    const sortedData = [...monthlyData].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    let limitedData = sortedData;

    if (query.period === 'last-6-months') {
      limitedData = sortedData.slice(-6);
    } else if (query.period === 'last-12-months') {
      limitedData = sortedData.slice(-12);
    } else if (query.size === 'compact') {
      limitedData = sortedData.slice(-6);
    }

    const trendData = {
      labels: limitedData.map(point => point.label),
      hours: limitedData.map(point => point.hours),
      utilization: limitedData.map(point => point.utilization),
      invoiced: limitedData.map(point => point.invoiced)
    };

    if (this.plugin.settings.debugMode) {
      console.log('[Timesheet] Trend data generated:', {
        periods: trendData.labels.length,
        hours: trendData.hours,
        utilization: trendData.utilization,
        invoiced: trendData.invoiced
      });
    }

    return trendData;
  }

  private generateSummary(entries: TimeEntry[], query: TimesheetQuery): SummaryData {
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    const totalInvoiced = entries.reduce((sum, entry) => sum + (entry.hours * (entry.rate || 0)), 0);

    let utilization = 0;
    const hoursPerWorkday = this.plugin.settings.hoursPerWorkday || 8;

    if (entries.length > 0) {
      const monthsWithData = new Set<string>();
      for (const entry of entries) {
        const year = entry.date.getFullYear();
        const month = entry.date.getMonth() + 1;
        const key = `${year}-${month.toString().padStart(2, '0')}`;
        monthsWithData.add(key);
      }

      let targetHours = 0;
      for (const monthKey of monthsWithData) {
        const [yearStr, monthStr] = monthKey.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        const workingDays = DateUtils.getWorkingDaysInMonth(year, month);
        targetHours += workingDays * hoursPerWorkday;
      }

      utilization = targetHours > 0 ? totalHours / targetHours : 0;

      if (this.plugin.settings.debugMode) {
        console.log(`[Timesheet] Summary calculation - Months with data: ${monthsWithData.size}, Target hours: ${targetHours}, Actual hours: ${totalHours}, Utilization: ${Math.round(utilization * 100)}%`);
      }
    }

    const projectType = this.plugin.settings.project?.type;
    const budgetHours = projectType === 'fixed-hours' ? this.plugin.settings.project?.budgetHours : undefined;

    let budgetProgress: number | undefined;
    let budgetRemaining: number | undefined;

    if (budgetHours && budgetHours > 0) {
      budgetProgress = totalHours / budgetHours;
      budgetRemaining = budgetHours - totalHours;
    }

    return {
      totalHours,
      totalInvoiced,
      utilization,
      budgetHours,
      budgetProgress,
      budgetRemaining
    };
  }

  private generateYearSummary(entries: TimeEntry[]): SummaryData {
    const currentYear = new Date().getFullYear();
    const yearEntries = entries.filter(entry => entry.date.getFullYear() === currentYear);
    return this.generateSummary(yearEntries, { period: 'current-year' });
  }

  private generateAllTimeSummary(entries: TimeEntry[]): SummaryData {
    return this.generateSummary(entries, { period: 'all-time' });
  }

  async getAvailableMonths(): Promise<MonthData[]> {
    const entries = await this.dataSource.query({});
    const monthlyData = this.generateMonthlyData(entries);

    return monthlyData.map(point => ({
      year: point.year,
      month: point.month,
      label: point.label,
      hours: point.hours,
      invoiced: point.invoiced,
      utilization: point.utilization,
      rate: point.rate
    } as MonthData));
  }

  clearCache(): void {
    this.dataSource.clearCache();
  }
}
