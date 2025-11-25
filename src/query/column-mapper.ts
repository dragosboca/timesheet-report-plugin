// Enhanced column mapper for dynamic SHOW clause implementation
// Provides flexible column selection, aliases, formatting, and calculated fields

import { TableColumn } from '../tables/base/TableConfig';
import { ShowClauseNode, IdentifierNode } from './ast';

export interface ColumnDefinition {
  key: string;
  label: string;
  type: 'number' | 'currency' | 'percentage' | 'date' | 'text' | 'hours';
  width?: string;
  align?: 'left' | 'center' | 'right';
  aggregatable?: boolean;
  calculable?: boolean;
  description?: string;
}

export interface ColumnMapping {
  field: string;
  alias?: string;
  format?: string;
  calculation?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface EnhancedShowField {
  field: string;
  alias?: string;
  format?: string;
  calculation?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export class ColumnMapper {
  private availableColumns: Map<string, ColumnDefinition>;

  constructor() {
    this.availableColumns = new Map();
    this.initializeAvailableColumns();
  }

  /**
   * Initialize all available columns that can be used in SHOW clauses
   */
  private initializeAvailableColumns(): void {
    const columns: ColumnDefinition[] = [
      // Basic fields
      {
        key: 'date',
        label: 'Date',
        type: 'date',
        width: '120px',
        align: 'left',
        description: 'Entry date'
      },
      {
        key: 'project',
        label: 'Project',
        type: 'text',
        width: '200px',
        align: 'left',
        description: 'Project name'
      },
      {
        key: 'task',
        label: 'Task',
        type: 'text',
        width: '250px',
        align: 'left',
        description: 'Task description'
      },
      {
        key: 'hours',
        label: 'Hours',
        type: 'hours',
        width: '80px',
        align: 'right',
        aggregatable: true,
        calculable: true,
        description: 'Hours worked'
      },
      {
        key: 'rate',
        label: 'Rate',
        type: 'currency',
        width: '100px',
        align: 'right',
        aggregatable: true,
        calculable: true,
        description: 'Hourly rate'
      },
      {
        key: 'invoiced',
        label: 'Invoiced',
        type: 'currency',
        width: '120px',
        align: 'right',
        aggregatable: true,
        calculable: true,
        description: 'Invoiced amount'
      },
      {
        key: 'revenue',
        label: 'Revenue',
        type: 'currency',
        width: '120px',
        align: 'right',
        aggregatable: true,
        calculable: true,
        description: 'Calculated revenue (hours * rate)'
      },

      // Utilization and efficiency
      {
        key: 'utilization',
        label: 'Utilization',
        type: 'percentage',
        width: '100px',
        align: 'right',
        aggregatable: true,
        description: 'Time utilization percentage'
      },
      {
        key: 'efficiency',
        label: 'Efficiency',
        type: 'percentage',
        width: '100px',
        align: 'right',
        aggregatable: true,
        description: 'Work efficiency percentage'
      },

      // Budget-related fields
      {
        key: 'budgetHours',
        label: 'Budget Hours',
        type: 'hours',
        width: '120px',
        align: 'right',
        aggregatable: true,
        description: 'Total budget hours'
      },
      {
        key: 'budgetUsed',
        label: 'Budget Used',
        type: 'hours',
        width: '120px',
        align: 'right',
        aggregatable: true,
        calculable: true,
        description: 'Hours used from budget'
      },
      {
        key: 'budgetRemaining',
        label: 'Budget Remaining',
        type: 'hours',
        width: '140px',
        align: 'right',
        aggregatable: true,
        calculable: true,
        description: 'Remaining budget hours'
      },
      {
        key: 'budgetProgress',
        label: 'Budget Progress',
        type: 'percentage',
        width: '130px',
        align: 'right',
        aggregatable: true,
        description: 'Budget completion percentage'
      },

      // Time-based aggregations
      {
        key: 'label',
        label: 'Period',
        type: 'text',
        width: '150px',
        align: 'left',
        description: 'Time period label'
      },
      {
        key: 'year',
        label: 'Year',
        type: 'number',
        width: '80px',
        align: 'center',
        description: 'Year'
      },
      {
        key: 'month',
        label: 'Month',
        type: 'number',
        width: '80px',
        align: 'center',
        description: 'Month'
      },
      {
        key: 'week',
        label: 'Week',
        type: 'number',
        width: '80px',
        align: 'center',
        description: 'Week number'
      },

      // Client and category fields
      {
        key: 'client',
        label: 'Client',
        type: 'text',
        width: '150px',
        align: 'left',
        description: 'Client name'
      },
      {
        key: 'category',
        label: 'Category',
        type: 'text',
        width: '120px',
        align: 'left',
        description: 'Work category'
      },
      {
        key: 'tag',
        label: 'Tag',
        type: 'text',
        width: '100px',
        align: 'left',
        description: 'Entry tag'
      },

      // Retainer-specific fields
      {
        key: 'retainerHours',
        label: 'Retainer Hours',
        type: 'hours',
        width: '130px',
        align: 'right',
        aggregatable: true,
        description: 'Retainer hours used'
      },
      {
        key: 'rolloverHours',
        label: 'Rollover Hours',
        type: 'hours',
        width: '130px',
        align: 'right',
        aggregatable: true,
        description: 'Hours rolled over from previous period'
      },
      {
        key: 'contractValue',
        label: 'Contract Value',
        type: 'currency',
        width: '130px',
        align: 'right',
        aggregatable: true,
        description: 'Total contract value'
      },

      // Calculated/derived fields
      {
        key: 'avgRate',
        label: 'Avg Rate',
        type: 'currency',
        width: '100px',
        align: 'right',
        calculable: true,
        description: 'Average hourly rate'
      },
      {
        key: 'totalRevenue',
        label: 'Total Revenue',
        type: 'currency',
        width: '130px',
        align: 'right',
        calculable: true,
        description: 'Total revenue generated'
      },
      {
        key: 'variance',
        label: 'Variance',
        type: 'percentage',
        width: '100px',
        align: 'right',
        description: 'Budget vs actual variance'
      }
    ];

    columns.forEach(col => this.availableColumns.set(col.key, col));
  }

  /**
   * Convert SHOW clause to table columns
   */
  mapShowClauseToColumns(showClause: ShowClauseNode): TableColumn[] {
    const columns: TableColumn[] = [];

    for (const field of showClause.fields) {
      const mapping = this.parseField(field);
      const column = this.createTableColumn(mapping);
      if (column) {
        columns.push(column);
      }
    }

    return columns;
  }

  /**
   * Parse a field identifier into a column mapping
   */
  private parseField(field: IdentifierNode): ColumnMapping {
    // Handle simple field names for now
    // TODO: Parse complex expressions like "hours AS 'Work Hours'", "SUM(hours)", etc.
    return {
      field: this.normalizeFieldName(field.name)
    };
  }

  /**
   * Create a table column from a column mapping
   */
  public createTableColumn(mapping: ColumnMapping): TableColumn | null {
    const normalizedField = this.normalizeFieldName(mapping.field);
    const columnDef = this.availableColumns.get(normalizedField);

    if (!columnDef) {
      console.warn(`Unknown field: ${mapping.field}`);
      return null;
    }

    const label = mapping.alias || columnDef.label;

    return {
      key: normalizedField,
      label: label,
      width: columnDef.width,
      align: columnDef.align,
      format: this.createFormatter(columnDef, mapping)
    };
  }

  /**
   * Create a formatter function for a column
   */
  private createFormatter(columnDef: ColumnDefinition, mapping: ColumnMapping): (value: unknown) => string {
    return (value: unknown): string => {
      if (value === null || value === undefined || value === '') {
        return '';
      }

      // Apply custom format if specified
      if (mapping.format) {
        return this.applyCustomFormat(value, mapping.format);
      }

      // Apply default formatting based on type
      switch (columnDef.type) {
        case 'currency':
          return this.formatCurrency(Number(value));

        case 'percentage':
          return this.formatPercentage(Number(value));

        case 'hours':
          return this.formatHours(Number(value));

        case 'number':
          return this.formatNumber(Number(value));

        case 'date':
          return this.formatDate(value);

        case 'text':
        default:
          return String(value);
      }
    };
  }

  /**
   * Apply custom formatting
   */
  private applyCustomFormat(value: unknown, format: string): string {
    switch (format.toLowerCase()) {
      case 'currency':
      case 'money':
        return this.formatCurrency(Number(value));

      case 'percent':
      case 'percentage':
        return this.formatPercentage(Number(value));

      case 'hours':
      case 'time':
        return this.formatHours(Number(value));

      case 'decimal':
        return Number(value).toFixed(2);

      case 'integer':
        return Math.round(Number(value)).toString();

      case 'date':
        return this.formatDate(value);

      default:
        return String(value);
    }
  }

  /**
   * Format currency values
   */
  private formatCurrency(value: number): string {
    if (isNaN(value)) return '';
    return `€${value.toFixed(2)}`;
  }

  /**
   * Format percentage values
   */
  private formatPercentage(value: number): string {
    if (isNaN(value)) return '';
    return `${Math.round(value * 100)}%`;
  }

  /**
   * Format hours
   */
  private formatHours(value: number): string {
    if (isNaN(value)) return '';
    return value.toFixed(2);
  }

  /**
   * Format numbers
   */
  private formatNumber(value: number): string {
    if (isNaN(value)) return '';
    return value.toFixed(2);
  }

  /**
   * Format dates
   */
  private formatDate(value: unknown): string {
    if (!value) return '';

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    }

    return String(value);
  }

  /**
   * Get default columns for a specific view type
   */
  getDefaultColumns(viewType: 'timesheet' | 'daily' | 'monthly' | 'summary'): TableColumn[] {
    switch (viewType) {
      case 'timesheet':
        return this.mapFieldsToColumns(['date', 'project', 'task', 'hours', 'rate', 'invoiced']);

      case 'daily':
        return this.mapFieldsToColumns(['date', 'hours', 'invoiced', 'utilization']);

      case 'monthly':
        return this.mapFieldsToColumns(['label', 'hours', 'invoiced', 'utilization']);

      case 'summary':
        return this.mapFieldsToColumns(['project', 'hours', 'invoiced', 'budgetProgress']);

      default:
        return this.mapFieldsToColumns(['date', 'hours', 'invoiced']);
    }
  }

  /**
   * Map field names to table columns
   */
  private mapFieldsToColumns(fieldNames: string[]): TableColumn[] {
    return fieldNames
      .map(fieldName => this.createTableColumn({ field: this.normalizeFieldName(fieldName) }))
      .filter(col => col !== null) as TableColumn[];
  }

  /**
   * Normalize legacy field names to current field names
   */
  private normalizeFieldName(fieldName: string): string {
    const fieldMap: { [key: string]: string } = {
      'progress': 'budgetProgress',
      'remaining': 'budgetRemaining',
      'used': 'budgetUsed',
      'allocated': 'budgetHours'
    };

    return fieldMap[fieldName] || fieldName;
  }

  /**
   * Get compact columns for mobile/small screens
   */
  getCompactColumns(viewType: 'timesheet' | 'daily' | 'monthly' | 'summary'): TableColumn[] {
    switch (viewType) {
      case 'timesheet':
        return this.mapFieldsToColumns(['project', 'hours', 'invoiced']);

      case 'daily':
        return this.mapFieldsToColumns(['date', 'hours']);

      case 'monthly':
        return this.mapFieldsToColumns(['label', 'hours']);

      case 'summary':
        return this.mapFieldsToColumns(['project', 'hours']);

      default:
        return this.mapFieldsToColumns(['hours', 'invoiced']);
    }
  }

  /**
   * Get all available field names
   */
  getAvailableFields(): string[] {
    return Array.from(this.availableColumns.keys());
  }

  /**
   * Get column definition for a field
   */
  getColumnDefinition(fieldName: string): ColumnDefinition | undefined {
    return this.availableColumns.get(fieldName);
  }

  /**
   * Check if a field is valid
   */
  isValidField(fieldName: string): boolean {
    return this.availableColumns.has(fieldName);
  }

  /**
   * Get fields by type
   */
  getFieldsByType(type: ColumnDefinition['type']): string[] {
    return Array.from(this.availableColumns.entries())
      .filter(([_, def]) => def.type === type)
      .map(([key, _]) => key);
  }

  /**
   * Get aggregatable fields
   */
  getAggregatableFields(): string[] {
    return Array.from(this.availableColumns.entries())
      .filter(([_, def]) => def.aggregatable)
      .map(([key, _]) => key);
  }

  /**
   * Get calculable fields
   */
  getCalculableFields(): string[] {
    return Array.from(this.availableColumns.entries())
      .filter(([_, def]) => def.calculable)
      .map(([key, _]) => key);
  }
}

// Export singleton instance
export const columnMapper = new ColumnMapper();
