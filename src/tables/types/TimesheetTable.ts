// Timesheet table implementation

import TimesheetReportPlugin from '../../main';
import { BaseTable } from '../base/BaseTable';
import { TableColumn, TableOptions } from '../base/TableConfig';
import { ExtractedTimeEntry } from '../../core/unified-data-extractor';
import { DateUtils } from '../../utils/date-utils';

/**
 * Table for displaying timesheet entries
 */
export class TimesheetTable extends BaseTable<ExtractedTimeEntry> {
  constructor(plugin: TimesheetReportPlugin, data: ExtractedTimeEntry[], options: TableOptions) {
    super(plugin, data, options);
  }

  /**
   * Get default columns for timesheet table
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
        key: 'project',
        label: 'Project'
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
      },
      {
        key: 'project',
        label: 'Project'
      }
    ];
  }

  /**
   * Get table type name
   */
  protected getTableType(): string {
    return 'Timesheet';
  }

  /**
   * Get totalable columns
   */
  protected getTotalableColumns(): string[] {
    return ['hours'];
  }
}
