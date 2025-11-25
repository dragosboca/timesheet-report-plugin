// Monthly table implementation

import TimesheetReportPlugin from '../../main';
import { BaseTable } from '../base/BaseTable';
import { TableColumn, TableOptions } from '../base/TableConfig';

/**
 * Monthly table data interface
 */
export interface MonthlyTableData {
  year: number;
  month: number;
  label: string;
  hours: number;
  invoiced: number;
  utilization?: number;
  budgetProgress?: number;
  budgetHours?: number;
  budgetRemaining?: number;
  rate?: number;
}

/**
 * Table for displaying monthly data
 */
export class MonthlyTable extends BaseTable<MonthlyTableData> {
  constructor(plugin: TimesheetReportPlugin, data: MonthlyTableData[], options: TableOptions) {
    super(plugin, data, options);
  }

  /**
   * Get default columns for monthly table
   */
  protected getDefaultColumns(): TableColumn[] {
    if (this.options.compact) {
      return this.getCompactColumns();
    }

    const isBudgetProject = this.data.some(month => month.budgetHours !== undefined);

    const columns: TableColumn[] = [
      {
        key: 'label',
        label: 'Period'
      },
      {
        key: 'hours',
        label: 'Hours',
        align: 'right',
        format: (value: unknown) => this.formatter.formatHours(value as number)
      },
      {
        key: 'invoiced',
        label: 'Invoiced',
        align: 'right',
        format: (value: unknown) => this.formatter.formatCurrency(value as number)
      }
    ];

    if (isBudgetProject) {
      columns.push({
        key: 'budgetProgress',
        label: 'Progress',
        align: 'right',
        format: (value: unknown) => {
          if (!value) return '';
          return this.formatter.formatPercentage(value as number);
        }
      });
    } else {
      columns.push({
        key: 'utilization',
        label: 'Utilization',
        align: 'right',
        format: (value: unknown) => {
          if (!value) return '';
          return this.formatter.formatPercentage(value as number);
        }
      });
    }

    return columns;
  }

  /**
   * Get compact columns for small displays
   */
  protected getCompactColumns(): TableColumn[] {
    return [
      {
        key: 'label',
        label: 'Period'
      },
      {
        key: 'hours',
        label: 'Hours',
        align: 'right',
        format: (value: unknown) => this.formatter.formatHours(value as number)
      },
      {
        key: 'invoiced',
        label: 'Revenue',
        align: 'right',
        format: (value: unknown) => this.formatter.formatCurrency(value as number)
      }
    ];
  }

  /**
   * Get table type name
   */
  protected getTableType(): string {
    return 'Monthly';
  }

  /**
   * Get totalable columns
   */
  protected getTotalableColumns(): string[] {
    return ['hours', 'invoiced'];
  }
}
