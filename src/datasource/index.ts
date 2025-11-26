import TimesheetReportPlugin from '../main';
import { DateUtils } from '../utils/date-utils';
import { DailyEntry, MonthData } from '../types';
import { TimeEntry, TimesheetDataSource } from './types';
import { VaultTimesheetDataSource } from './vault-datasource';

export type { TimeEntry, QueryOptions, TimesheetDataSource } from './types';
export { VaultTimesheetDataSource } from './vault-datasource';

export function createTimesheetDataSource(plugin: TimesheetReportPlugin): TimesheetDataSource {
  return new VaultTimesheetDataSource(plugin);
}

export async function getMonthlyData(
  dataSource: TimesheetDataSource,
  year: number,
  month: number
): Promise<DailyEntry[]> {
  const entries = await dataSource.query({ year, month });

  const dailyEntries: DailyEntry[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayEntries = entries.filter(entry =>
      entry.date.getFullYear() === year &&
      entry.date.getMonth() === month - 1 &&
      entry.date.getDate() === day
    );

    const totalHours = dayEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const taskDescription = dayEntries
      .map(entry => entry.taskDescription || entry.notes || '')
      .filter(desc => desc.trim())
      .join('; ');

    dailyEntries.push({
      date,
      hours: totalHours,
      taskDescription
    });
  }

  return dailyEntries;
}

export async function getAvailableMonths(dataSource: TimesheetDataSource): Promise<MonthData[]> {
  const entries = await dataSource.query({});
  const monthMap = new Map<string, { year: number; month: number; entries: TimeEntry[] }>();

  for (const entry of entries) {
    const year = entry.date.getFullYear();
    const month = entry.date.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, '0')}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, { year, month, entries: [] });
    }
    const monthEntry = monthMap.get(key);
    if (monthEntry) {
      monthEntry.entries.push(entry);
    }
  }

  const monthlyData: MonthData[] = [];
  for (const [, monthData] of monthMap.entries()) {
    const totalHours = monthData.entries.reduce((sum, entry) => sum + entry.hours, 0);
    const totalInvoiced = monthData.entries.reduce((sum, entry) => sum + (entry.hours * (entry.rate || 0)), 0);
    const avgRate = totalHours > 0 ? totalInvoiced / totalHours : 0;

    monthlyData.push({
      year: monthData.year,
      month: monthData.month,
      label: `${DateUtils.getMonthName(monthData.month)} ${monthData.year}`,
      totalHours: totalHours,
      totalInvoiced: totalInvoiced,
      avgUtilization: 0,
      avgRate: avgRate
    } as MonthData);
  }

  return monthlyData.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}
