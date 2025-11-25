import { ExtractedTimeEntry } from './unified-data-extractor';
import { DailyEntry } from '../types';
import { DateUtils } from '../utils/date-utils';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown) => string;
}

export interface TableOptions {
  format: 'html' | 'markdown';
  columns?: TableColumn[];
  title?: string;
  cssClass?: string;
  showTotal?: boolean;
  compact?: boolean;
}

export interface MonthlyTableData {
  year: number;
  month: number;
  label: string;
  hours: number;
  invoiced: number;
  utilization: number;
  budgetProgress?: number;
  budgetHours?: number;
}

export class UnifiedTableGenerator {
  /**
   * Generate table from extracted timesheet entries
   */
  generateTimesheetTable(entries: ExtractedTimeEntry[], options: TableOptions): string {
    const columns = options.columns || this.getDefaultTimesheetColumns();

    if (options.format === 'html') {
      return this.generateHTMLTable(entries, columns, options);
    } else {
      return this.generateMarkdownTable(entries, columns, options);
    }
  }

  /**
   * Generate table from daily entries (legacy format)
   */
  generateDailyTable(entries: DailyEntry[], options: TableOptions): string {
    const columns = options.columns || this.getDefaultDailyColumns();

    if (options.format === 'html') {
      return this.generateHTMLTable(entries, columns, options);
    } else {
      return this.generateMarkdownTable(entries, columns, options);
    }
  }

  /**
   * Generate table from monthly data
   */
  generateMonthlyTable(data: MonthlyTableData[], options: TableOptions): string {
    const columns = options.columns || this.getDefaultMonthlyColumns(data);

    if (options.format === 'html') {
      return this.generateHTMLTable(data, columns, options);
    } else {
      return this.generateMarkdownTable(data, columns, options);
    }
  }

  /**
   * Generate HTML table
   */
  private generateHTMLTable(data: unknown[], columns: TableColumn[], options: TableOptions): string {
    const cssClass = options.cssClass || 'timesheet-table';
    let html = `<table class="${cssClass}">`;

    // Add title if provided
    if (options.title) {
      html += `<caption>${this.escapeHtml(options.title)}</caption>`;
    }

    // Table header
    html += '<thead><tr>';
    for (const column of columns) {
      const style = column.width ? ` style="width: ${column.width}"` : '';
      html += `<th${style}>${this.escapeHtml(column.label)}</th>`;
    }
    html += '</tr></thead>';

    // Table body
    html += '<tbody>';

    if (data.length === 0) {
      html += `<tr><td colspan="${columns.length}">No data found</td></tr>`;
    } else {
      let totalHours = 0;
      let totalInvoiced = 0;

      for (const row of data) {
        html += '<tr>';
        for (const column of columns) {
          const value = this.getColumnValue(row, column);
          const formattedValue = column.format ? column.format(value) : this.formatValue(value);
          const alignClass = column.align ? ` class="align-${column.align}"` : '';
          html += `<td${alignClass}>${this.escapeHtml(formattedValue)}</td>`;
        }
        html += '</tr>';

        // Calculate totals
        if ((row as any).hours) totalHours += (row as any).hours;
        if ((row as any).invoiced) totalInvoiced += (row as any).invoiced;
      }

      // Add total row if requested
      if (options.showTotal && (totalHours > 0 || totalInvoiced > 0)) {
        html += '<tr class="total-row">';
        for (let i = 0; i < columns.length; i++) {
          const column = columns[i];
          let cellValue = '';

          if (i === 0) {
            cellValue = 'Total';
          } else if (column.key === 'hours') {
            cellValue = this.formatNumber(totalHours);
          } else if (column.key === 'invoiced') {
            cellValue = `€${this.formatNumber(totalInvoiced)}`;
          }

          html += `<td>${cellValue}</td>`;
        }
        html += '</tr>';
      }
    }

    html += '</tbody></table>';
    return html;
  }

  /**
   * Generate Markdown table
   */
  private generateMarkdownTable(data: unknown[], columns: TableColumn[], options: TableOptions): string {
    if (data.length === 0) {
      return this.generateEmptyMarkdownTable(columns);
    }

    let markdown = '';

    // Add title if provided
    if (options.title) {
      markdown += `### ${options.title}\n\n`;
    }

    // Table header
    const headers = columns.map(col => col.label).join(' | ');
    markdown += `| ${headers} |\n`;

    // Separator line
    const separators = columns.map(col => {
      switch (col.align) {
        case 'center': return ':---:';
        case 'right': return '---:';
        default: return '---';
      }
    });
    markdown += `|${separators.join('|')}|\n`;

    // Table rows
    let totalHours = 0;
    let totalInvoiced = 0;

    for (const row of data) {
      const values = columns.map(column => {
        const value = this.getColumnValue(row, column);
        const formattedValue = column.format ? column.format(value) : this.formatValue(value);
        return this.escapeMarkdown(formattedValue);
      });
      markdown += `| ${values.join(' | ')} |\n`;

      // Calculate totals
      if ((row as any).hours) totalHours += (row as any).hours;
      if ((row as any).invoiced) totalInvoiced += (row as any).invoiced;
    }

    // Add total row if requested
    if (options.showTotal && (totalHours > 0 || totalInvoiced > 0)) {
      const totalValues = columns.map((column, i) => {
        if (i === 0) return '**Total**';
        if (column.key === 'hours') return `**${this.formatNumber(totalHours)}**`;
        if (column.key === 'invoiced') return `**€${this.formatNumber(totalInvoiced)}**`;
        return '';
      });
      markdown += `| ${totalValues.join(' | ')} |\n`;
    }

    return markdown;
  }

  /**
   * Generate empty table for markdown
   */
  private generateEmptyMarkdownTable(columns: TableColumn[]): string {
    const headers = columns.map(col => col.label).join(' | ');
    const separators = columns.map(() => '---').join('|');
    return `| ${headers} |\n|${separators}|\n| No data found | ${' |'.repeat(columns.length - 1)}\n`;
  }

  /**
   * Get column value from data row
   */
  private getColumnValue(row: unknown, column: TableColumn): unknown {
    const keys = column.key.split('.');
    let value = row;

    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = (value as any)[key];
      } else {
        return '';
      }
    }

    return value ?? '';
  }

  /**
   * Format value for display
   */
  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'number') {
      return this.formatNumber(value);
    }

    if (value instanceof Date) {
      return DateUtils.formatDate(value);
    }

    return String(value);
  }

  /**
   * Format number for display
   */
  private formatNumber(num: number): string {
    return num.toLocaleString('en-US', {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0
    });
  }

  /**
   * Calculate total hours from entries
   */
  calculateTotalHours(entries: DailyEntry[] | ExtractedTimeEntry[]): number {
    if (!entries || entries.length === 0) {
      return 0;
    }

    if ('hours' in entries[0]) {
      return (entries as DailyEntry[]).reduce((sum: number, entry: DailyEntry) => {
        const hours = typeof entry.hours === 'number' && !isNaN(entry.hours) ? entry.hours : 0;
        return sum + hours;
      }, 0);
    } else {
      return (entries as ExtractedTimeEntry[]).reduce((sum: number, entry: ExtractedTimeEntry) => {
        const hours = typeof entry.hours === 'number' && !isNaN(entry.hours) ? entry.hours : 0;
        return sum + hours;
      }, 0);
    }
  }

  /**
   * Escape HTML characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Escape Markdown characters
   */
  private escapeMarkdown(text: string): string {
    return text
      .replace(/\|/g, '\\|')
      .replace(/\n/g, ' ')
      .replace(/\r/g, '');
  }

  /**
   * Get default columns for timesheet entries
   */
  private getDefaultTimesheetColumns(): TableColumn[] {
    return [
      {
        key: 'date',
        label: 'Date',
        format: (date: Date) => DateUtils.formatDate(date)
      },
      {
        key: 'hours',
        label: 'Hours',
        align: 'right',
        format: (hours: number) => this.formatNumber(hours)
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
   * Get default columns for daily entries
   */
  private getDefaultDailyColumns(): TableColumn[] {
    return [
      {
        key: 'date',
        label: 'Date',
        format: (date: Date) => DateUtils.formatDate(date)
      },
      {
        key: 'hours',
        label: 'Hours',
        align: 'right',
        format: (hours: number) => this.formatNumber(hours)
      },
      {
        key: 'taskDescription',
        label: 'Task Description'
      }
    ];
  }

  /**
   * Get default columns for monthly data
   */
  private getDefaultMonthlyColumns(data: MonthlyTableData[]): TableColumn[] {
    const isBudgetProject = data.some(month => month.budgetHours !== undefined);

    const columns: TableColumn[] = [
      {
        key: 'label',
        label: 'Period'
      },
      {
        key: 'hours',
        label: 'Hours',
        align: 'right',
        format: (hours: number) => this.formatNumber(hours)
      },
      {
        key: 'invoiced',
        label: 'Invoiced',
        align: 'right',
        format: (amount: number) => `€${this.formatNumber(amount)}`
      }
    ];

    if (isBudgetProject) {
      columns.push({
        key: 'budgetProgress',
        label: 'Progress',
        align: 'right',
        format: (progress: number) => progress ? `${Math.round(progress * 100)}%` : ''
      });
    } else {
      columns.push({
        key: 'utilization',
        label: 'Utilization',
        align: 'right',
        format: (util: number) => `${Math.round(util * 100)}%`
      });
    }

    return columns;
  }

  /**
   * Create compact columns for small displays
   */
  getCompactColumns(type: 'timesheet' | 'daily' | 'monthly'): TableColumn[] {
    switch (type) {
      case 'timesheet':
        return [
          {
            key: 'date',
            label: 'Date',
            format: (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          },
          {
            key: 'hours',
            label: 'Hours',
            align: 'right',
            format: (hours: number) => this.formatNumber(hours)
          },
          {
            key: 'project',
            label: 'Project'
          }
        ];

      case 'daily':
        return [
          {
            key: 'date',
            label: 'Date',
            format: (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          },
          {
            key: 'hours',
            label: 'Hours',
            align: 'right',
            format: (hours: number) => this.formatNumber(hours)
          }
        ];

      case 'monthly':
        return [
          {
            key: 'label',
            label: 'Period'
          },
          {
            key: 'hours',
            label: 'Hours',
            align: 'right',
            format: (hours: number) => this.formatNumber(hours)
          },
          {
            key: 'invoiced',
            label: 'Revenue',
            align: 'right',
            format: (amount: number) => `€${this.formatNumber(amount)}`
          }
        ];

      default:
        return [];
    }
  }

  /**
   * Legacy method: generateReportTable for backward compatibility
   */
  generateReportTable(entries: DailyEntry[]): string {
    const tableOptions: TableOptions = {
      format: 'markdown',
      showTotal: true
    };
    return this.generateDailyTable(entries, tableOptions);
  }

  /**
   * Legacy method: getStatistics for backward compatibility
   */
  getStatistics(entries: DailyEntry[]): any {
    const totalHours = this.calculateTotalHours(entries);
    const totalDays = entries.filter(e => e.hours > 0).length;
    const avgHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0;

    return {
      totalHours,
      totalEntries: entries.length,
      workingDays: totalDays,
      averageHoursPerDay: avgHoursPerDay,
      utilization: 0, // Would need additional data to calculate
      efficiency: avgHoursPerDay > 0 ? totalHours / (totalDays * 8) : 0
    };
  }

  /**
   * Legacy method: validateEntries for backward compatibility
   */
  validateEntries(entries: DailyEntry[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const entry of entries) {
      if (!entry.date) {
        errors.push('Missing date in entry');
      }
      if (typeof entry.hours !== 'number' || entry.hours < 0) {
        errors.push('Invalid hours value');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
