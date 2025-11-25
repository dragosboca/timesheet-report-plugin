// Daily table implementation

import TimesheetReportPlugin from '../../main';
import { BaseTable } from '../base/BaseTable';
import { TableColumn, TableOptions } from '../base/TableConfig';
import { DailyEntry } from '../../types';
import { DateUtils } from '../../utils/date-utils';

/**
 * Table for displaying daily entries
 */
export class DailyTable extends BaseTable<DailyEntry> {
  constructor(plugin: TimesheetReportPlugin, data: DailyEntry[], options: TableOptions) {
    super(plugin, data, options);
  }

  /**
   * Get default columns for daily table
   */
  protected getDefaultColumns(): TableColumn[] {
    if (this.options.compact) {
      return this.getCompactColumns();
    }

    return [
      {
        key: 'date',
        label: 'Date',
        format: (value: unknown) => {
          if (!value) return '';
          const date = value instanceof Date ? value : new Date(value as string);
          return DateUtils.formatDate(date);
        }
      },
      {
        key: 'hours',
        label: 'Hours',
        align: 'right',
        format: (value: unknown) => this.formatter.formatHours(value as number)
      },
      {
        key: 'taskDescription',
        label: 'Task Description'
      }
    ];
  }

  /**
   * Get compact columns for small displays
   */
  protected getCompactColumns(): TableColumn[] {
    return [
      {
        key: 'date',
        label: 'Date',
        format: (value: unknown) => {
          if (!value) return '';
          const date = value instanceof Date ? value : new Date(value as string);
          return this.formatter.formatDateShort(date);
        }
      },
      {
        key: 'hours',
        label: 'Hours',
        align: 'right',
        format: (value: unknown) => this.formatter.formatHours(value as number)
      }
    ];
  }

  /**
   * Get table type name
   */
  protected getTableType(): string {
    return 'Daily';
  }

  /**
   * Get totalable columns
   */
  protected getTotalableColumns(): string[] {
    return ['hours'];
  }
}
