// Query table implementation - generic table for any query results

import TimesheetReportPlugin from '../../main';
import { BaseTable } from '../base/BaseTable';
import { TableColumn, TableOptions } from '../base/TableConfig';
import { DateUtils } from '../../utils/date-utils';

/**
 * Generic table for displaying query results with any columns
 * This table automatically adapts to whatever columns are provided
 */
export class QueryTable extends BaseTable<Record<string, unknown>> {
  constructor(plugin: TimesheetReportPlugin, data: Record<string, unknown>[], options: TableOptions) {
    super(plugin, data, options);
  }

  /**
   * Get default columns for query table
   * Generates columns from data keys if no columns specified
   */
  protected getDefaultColumns(): TableColumn[] {
    // If no data, return empty columns
    if (!this.data || this.data.length === 0) {
      return [];
    }

    // Generate columns from first data row keys
    const firstRow = this.data[0];
    const keys = Object.keys(firstRow);

    return keys.map(key => this.createColumnFromKey(key));
  }

  /**
   * Create a table column from a data key
   */
  private createColumnFromKey(key: string): TableColumn {
    // Determine column properties based on key name
    const label = this.formatLabel(key);
    const align = this.determineAlignment(key);
    const format = this.determineFormatter(key);

    return {
      key,
      label,
      align,
      format
    };
  }

  /**
   * Format key into human-readable label
   */
  private formatLabel(key: string): string {
    // Convert camelCase or snake_case to Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
      .trim();
  }

  /**
   * Determine column alignment based on key name
   */
  private determineAlignment(key: string): 'left' | 'center' | 'right' {
    const lowerKey = key.toLowerCase();

    // Right-align numeric fields
    if (
      lowerKey.includes('hours') ||
      lowerKey.includes('rate') ||
      lowerKey.includes('invoiced') ||
      lowerKey.includes('revenue') ||
      lowerKey.includes('amount') ||
      lowerKey.includes('budget') ||
      lowerKey.includes('utilization') ||
      lowerKey.includes('progress') ||
      lowerKey.includes('percentage') ||
      lowerKey.includes('percent') ||
      lowerKey.includes('count') ||
      lowerKey.includes('total')
    ) {
      return 'right';
    }

    // Default to left
    return 'left';
  }

  /**
   * Determine appropriate formatter based on key name
   */
  private determineFormatter(key: string): ((value: unknown) => string) | undefined {
    const lowerKey = key.toLowerCase();

    // Date fields
    if (lowerKey === 'date' || lowerKey.includes('date') || lowerKey === 'day') {
      return (value: unknown) => {
        if (!value) return '';
        const date = value instanceof Date ? value : new Date(value as string);
        return DateUtils.formatDate(date);
      };
    }

    // Currency fields
    if (
      lowerKey === 'invoiced' ||
      lowerKey === 'revenue' ||
      lowerKey === 'amount' ||
      lowerKey.includes('price') ||
      lowerKey.includes('cost')
    ) {
      return (value: unknown) => this.formatter.formatCurrency(value as number);
    }

    // Rate fields (currency)
    if (lowerKey === 'rate' || lowerKey.includes('rate')) {
      return (value: unknown) => this.formatter.formatCurrency(value as number);
    }

    // Hours fields
    if (lowerKey === 'hours' || lowerKey.includes('hours')) {
      return (value: unknown) => this.formatter.formatHours(value as number);
    }

    // Percentage/utilization fields
    if (
      lowerKey === 'utilization' ||
      lowerKey === 'progress' ||
      lowerKey.includes('percentage') ||
      lowerKey.includes('percent') ||
      lowerKey.endsWith('progress')
    ) {
      return (value: unknown) => this.formatter.formatPercentage(value as number);
    }

    // Numeric fields (general)
    if (
      lowerKey.includes('count') ||
      lowerKey.includes('total') ||
      lowerKey.includes('budget')
    ) {
      return (value: unknown) => this.formatter.formatNumber(value as number, 2);
    }

    // No special formatting
    return undefined;
  }

  /**
   * Get table type name
   */
  protected getTableType(): string {
    return 'Query';
  }

  /**
   * Get totalable columns
   * Auto-detect numeric columns
   */
  protected getTotalableColumns(): string[] {
    if (!this.data || this.data.length === 0) {
      return [];
    }

    const totalable: string[] = [];
    const firstRow = this.data[0];

    for (const key in firstRow) {
      const value = firstRow[key];
      const lowerKey = key.toLowerCase();

      // Check if it's a numeric field that should be totaled
      if (
        typeof value === 'number' &&
        (lowerKey.includes('hours') ||
          lowerKey.includes('invoiced') ||
          lowerKey.includes('revenue') ||
          lowerKey.includes('amount') ||
          lowerKey.includes('total') ||
          lowerKey.includes('budget'))
      ) {
        totalable.push(key);
      }
    }

    return totalable;
  }

  /**
   * Override to handle compact mode
   */
  protected getCompactColumns(): TableColumn[] {
    const allColumns = this.options.columns || this.getDefaultColumns();

    // In compact mode, show first 3-4 most important columns
    const priorityOrder = [
      'date',
      'project',
      'client',
      'hours',
      'invoiced',
      'revenue',
      'label',
      'period'
    ];

    // Sort columns by priority
    const sorted = [...allColumns].sort((a, b) => {
      const aIndex = priorityOrder.findIndex(p => a.key.toLowerCase().includes(p));
      const bIndex = priorityOrder.findIndex(p => b.key.toLowerCase().includes(p));

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    // Return first 3-4 columns
    return sorted.slice(0, 4);
  }
}
