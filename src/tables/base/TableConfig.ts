// Table configuration types and interfaces

/**
 * Table column definition
 */
export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown) => string;
  sortable?: boolean;
  hidden?: boolean;
}

/**
 * Table format types
 */
export type TableFormat = 'html' | 'markdown';

/**
 * Table dimensions
 */
export interface TableDimensions {
  width?: string;
  maxHeight?: string;
  compact?: boolean;
}

/**
 * Table render options
 */
export interface TableRenderOptions {
  container?: HTMLElement;
  format: TableFormat;
  dimensions?: TableDimensions;
  className?: string;
}

/**
 * Table configuration options
 */
export interface TableOptions {
  format: TableFormat;
  columns?: TableColumn[];
  title?: string;
  cssClass?: string;
  showTotal?: boolean;
  compact?: boolean;
  sortable?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
}

/**
 * Table data row (generic)
 */
export interface TableRow {
  [key: string]: unknown;
}

/**
 * Table validation result
 */
export interface TableValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Table renderer interface
 */
export interface ITableRenderer {
  render(options: TableRenderOptions): string;
  destroy?(): void;
}

/**
 * Table data interface
 */
export interface TableData<T = TableRow> {
  rows: T[];
  columns?: TableColumn[];
  metadata?: TableMetadata;
}

/**
 * Table metadata
 */
export interface TableMetadata {
  totalRows?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

/**
 * Table totals configuration
 */
export interface TableTotals {
  columns: string[];
  format?: (value: number, column: string) => string;
}

/**
 * Table export options
 */
export interface TableExportOptions {
  format: 'csv' | 'json' | 'markdown' | 'html';
  includeHeaders?: boolean;
  filename?: string;
}

/**
 * Column alignment type guard
 */
export function isValidAlignment(align: string): align is 'left' | 'center' | 'right' {
  return align === 'left' || align === 'center' || align === 'right';
}

/**
 * Table format type guard
 */
export function isValidTableFormat(format: string): format is TableFormat {
  return format === 'html' || format === 'markdown';
}
