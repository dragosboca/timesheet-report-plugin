// Table Factory - creates table instances based on type

import TimesheetReportPlugin from '../main';
import { TimesheetTable } from './types/TimesheetTable';
import { DailyTable } from './types/DailyTable';
import { MonthlyTable } from './types/MonthlyTable';
import { MonthlyTableData } from './types/MonthlyTable';
import { QueryTable } from './types/QueryTable';
import { TableOptions } from './base/TableConfig';
import { ExtractedTimeEntry } from '../core/unified-data-extractor';
import { DailyEntry } from '../types';

/**
 * Table type enumeration
 */
export enum TableType {
  TIMESHEET = 'timesheet',
  DAILY = 'daily',
  MONTHLY = 'monthly',
  QUERY = 'query'
}

/**
 * Factory for creating table instances
 */
export class TableFactory {
  private plugin: TimesheetReportPlugin;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
  }

  /**
   * Create a timesheet table
   */
  createTimesheetTable(data: ExtractedTimeEntry[], options: TableOptions): TimesheetTable {
    return new TimesheetTable(this.plugin, data, options);
  }

  /**
   * Create a daily table
   */
  createDailyTable(data: DailyEntry[], options: TableOptions): DailyTable {
    return new DailyTable(this.plugin, data, options);
  }

  /**
   * Create a monthly table
   */
  createMonthlyTable(data: MonthlyTableData[], options: TableOptions): MonthlyTable {
    return new MonthlyTable(this.plugin, data, options);
  }

  /**
   * Create a generic query table
   */
  createQueryTable(data: Record<string, unknown>[], options: TableOptions): QueryTable {
    return new QueryTable(this.plugin, data, options);
  }

  /**
   * Create a table by type name
   */
  createTable(
    type: TableType | string,
    data: ExtractedTimeEntry[] | DailyEntry[] | MonthlyTableData[] | Record<string, unknown>[],
    options: TableOptions
  ): TimesheetTable | DailyTable | MonthlyTable | QueryTable {
    switch (type.toLowerCase()) {
      case TableType.TIMESHEET:
        return this.createTimesheetTable(data as ExtractedTimeEntry[], options);

      case TableType.DAILY:
        return this.createDailyTable(data as DailyEntry[], options);

      case TableType.MONTHLY:
        return this.createMonthlyTable(data as MonthlyTableData[], options);

      case TableType.QUERY:
        return this.createQueryTable(data as Record<string, unknown>[], options);

      default:
        throw new Error(`Unknown table type: ${type}`);
    }
  }

  /**
   * Get available table types
   */
  getAvailableTableTypes(): TableType[] {
    return [TableType.TIMESHEET, TableType.DAILY, TableType.MONTHLY, TableType.QUERY];
  }

  /**
   * Check if table type is valid
   */
  isValidTableType(type: string): boolean {
    return Object.values(TableType).includes(type as TableType);
  }
}
