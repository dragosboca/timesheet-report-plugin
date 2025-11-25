// Abstract base class for all table types

import TimesheetReportPlugin from '../../main';
import { Formatter } from '../../rendering/Formatter';
import { Validator } from '../../rendering/Validator';
import { RenderUtils } from '../../rendering/RenderUtils';
import {
  TableColumn,
  TableOptions,
  TableRenderOptions,
  TableValidationResult,
  ITableRenderer,
  TableRow
} from './TableConfig';

/**
 * Abstract base class for all table implementations
 */
export abstract class BaseTable<T = TableRow> implements ITableRenderer {
  protected plugin: TimesheetReportPlugin;
  protected formatter: Formatter;
  protected data: T[];
  protected columns: TableColumn[];
  protected options: TableOptions;

  constructor(plugin: TimesheetReportPlugin, data: T[], options: TableOptions) {
    this.plugin = plugin;
    this.data = data;
    this.options = options;
    this.formatter = new Formatter(plugin.settings.currencySymbol || '€');

    // Use columns from options or get defaults
    this.columns = options.columns || this.getDefaultColumns();
  }

  /**
   * Render the table
   */
  render(renderOptions: TableRenderOptions): string {
    try {
      // Validate data before rendering
      const validation = this.validateData();
      if (!validation.valid) {
        throw new Error(`Table validation failed: ${validation.errors.join(', ')}`);
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          this.plugin.debugLogger?.log(`Table warning: ${warning}`);
        });
      }

      // Generate table based on format
      if (renderOptions.format === 'html') {
        return this.generateHTMLTable();
      } else {
        return this.generateMarkdownTable();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log(`Error rendering ${this.getTableType()} table:`, errorMessage);
      throw error;
    }
  }

  /**
   * Generate HTML table
   */
  protected generateHTMLTable(): string {
    const cssClass = this.options.cssClass || 'timesheet-table';
    let html = `<table class="${cssClass}">`;

    // Add title if provided
    if (this.options.title) {
      html += `<caption>${RenderUtils.escapeHtml(this.options.title)}</caption>`;
    }

    // Table header
    html += '<thead><tr>';
    for (const column of this.columns) {
      if (column.hidden) continue;
      const style = column.width ? ` style="width: ${column.width}"` : '';
      const alignClass = column.align ? ` class="align-${column.align}"` : '';
      html += `<th${style}${alignClass}>${RenderUtils.escapeHtml(column.label)}</th>`;
    }
    html += '</tr></thead>';

    // Table body
    html += '<tbody>';

    if (this.data.length === 0) {
      const visibleColumns = this.columns.filter(col => !col.hidden);
      html += `<tr><td colspan="${visibleColumns.length}">No data found</td></tr>`;
    } else {
      for (const row of this.data) {
        html += '<tr>';
        for (const column of this.columns) {
          if (column.hidden) continue;
          const value = RenderUtils.getNestedValue(row, column.key);
          const formattedValue = this.formatColumnValue(column, value);
          const alignClass = column.align ? ` class="align-${column.align}"` : '';
          html += `<td${alignClass}>${RenderUtils.escapeHtml(formattedValue)}</td>`;
        }
        html += '</tr>';
      }

      // Add total row if requested
      if (this.options.showTotal) {
        const totalRow = this.generateTotalRow();
        if (totalRow) {
          html += totalRow;
        }
      }
    }

    html += '</tbody></table>';
    return html;
  }

  /**
   * Generate Markdown table
   */
  protected generateMarkdownTable(): string {
    if (this.data.length === 0) {
      return this.generateEmptyMarkdownTable();
    }

    let markdown = '';

    // Add title if provided
    if (this.options.title) {
      markdown += `### ${this.options.title}\n\n`;
    }

    // Get visible columns
    const visibleColumns = this.columns.filter(col => !col.hidden);

    // Table header
    const headers = visibleColumns.map(col => col.label).join(' | ');
    markdown += `| ${headers} |\n`;

    // Separator line
    const separators = visibleColumns.map(col => {
      switch (col.align) {
        case 'center': return ':---:';
        case 'right': return '---:';
        default: return '---';
      }
    });
    markdown += `|${separators.join('|')}|\n`;

    // Table rows
    for (const row of this.data) {
      const values = visibleColumns.map(column => {
        const value = RenderUtils.getNestedValue(row, column.key);
        const formattedValue = this.formatColumnValue(column, value);
        return RenderUtils.escapeMarkdown(formattedValue);
      });
      markdown += `| ${values.join(' | ')} |\n`;
    }

    // Add total row if requested
    if (this.options.showTotal) {
      const totalRow = this.generateMarkdownTotalRow();
      if (totalRow) {
        markdown += totalRow;
      }
    }

    return markdown;
  }

  /**
   * Generate empty markdown table
   */
  protected generateEmptyMarkdownTable(): string {
    const visibleColumns = this.columns.filter(col => !col.hidden);
    const headers = visibleColumns.map(col => col.label).join(' | ');
    const separators = visibleColumns.map(() => '---').join('|');
    return `| ${headers} |\n|${separators}|\n| No data found | ${' |'.repeat(visibleColumns.length - 1)}\n`;
  }

  /**
   * Format column value
   */
  protected formatColumnValue(column: TableColumn, value: unknown): string {
    if (column.format) {
      return column.format(value);
    }
    return this.formatter.formatValue(value);
  }

  /**
   * Generate HTML total row
   */
  protected generateTotalRow(): string | null {
    const totals = this.calculateTotals();
    if (!totals || Object.keys(totals).length === 0) {
      return null;
    }

    let html = '<tr class="total-row">';
    for (let i = 0; i < this.columns.length; i++) {
      const column = this.columns[i];
      if (column.hidden) continue;

      let cellValue = '';
      if (i === 0) {
        cellValue = 'Total';
      } else if (column.key in totals) {
        const value = totals[column.key];
        cellValue = this.formatColumnValue(column, value);
      }

      const alignClass = column.align ? ` class="align-${column.align}"` : '';
      html += `<td${alignClass}>${RenderUtils.escapeHtml(cellValue)}</td>`;
    }
    html += '</tr>';
    return html;
  }

  /**
   * Generate Markdown total row
   */
  protected generateMarkdownTotalRow(): string | null {
    const totals = this.calculateTotals();
    if (!totals || Object.keys(totals).length === 0) {
      return null;
    }

    const visibleColumns = this.columns.filter(col => !col.hidden);
    const totalValues = visibleColumns.map((column, i) => {
      if (i === 0) {
        return '**Total**';
      }
      if (column.key in totals) {
        const value = totals[column.key];
        const formatted = this.formatColumnValue(column, value);
        return `**${formatted}**`;
      }
      return '';
    });

    return `| ${totalValues.join(' | ')} |\n`;
  }

  /**
   * Calculate totals for numeric columns
   */
  protected calculateTotals(): Record<string, number> {
    const totals: Record<string, number> = {};
    const totalableColumns = this.getTotalableColumns();

    for (const columnKey of totalableColumns) {
      const total = RenderUtils.calculateTotal(this.data, columnKey);
      if (total !== 0) {
        totals[columnKey] = total;
      }
    }

    return totals;
  }

  /**
   * Get list of columns that should be totaled
   */
  protected getTotalableColumns(): string[] {
    // By default, total common numeric fields
    return ['hours', 'invoiced', 'revenue', 'amount'];
  }

  /**
   * Validate table data
   */
  protected validateData(): TableValidationResult {
    const result: TableValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Validate columns
    const columnValidation = Validator.validateColumns(this.columns, 'columns');
    if (!columnValidation.valid) {
      result.valid = false;
      result.errors.push(...columnValidation.errors);
    }
    result.warnings.push(...columnValidation.warnings);

    // Data can be empty (will show "No data" message)
    if (this.data.length === 0) {
      result.warnings.push('Table data is empty');
    }

    return result;
  }

  /**
   * Get data
   */
  getData(): T[] {
    return this.data;
  }

  /**
   * Set data
   */
  setData(data: T[]): void {
    this.data = data;
  }

  /**
   * Get columns
   */
  getColumns(): TableColumn[] {
    return this.columns;
  }

  /**
   * Set columns
   */
  setColumns(columns: TableColumn[]): void {
    this.columns = columns;
  }

  /**
   * Update options
   */
  setOptions(options: Partial<TableOptions>): void {
    this.options = { ...this.options, ...options };
  }

  // Abstract methods that must be implemented by derived classes

  /**
   * Get default columns for this table type
   */
  protected abstract getDefaultColumns(): TableColumn[];

  /**
   * Get table type name
   */
  protected abstract getTableType(): string;
}
