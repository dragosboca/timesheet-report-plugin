// SHOW Clause Handler
// Handles field selection and display formatting in queries

import {
  ShowClauseNode,
  EnhancedFieldNode,
  IdentifierNode,
  CalculatedFieldNode,
  AggregationFunctionNode,
  FormatSpecifierNode
} from '../ast';
import {
  BaseClauseHandler,
  ClauseContext,
  ClauseValidationResult
} from './base';

// ============================================================================
// SHOW CLAUSE RESULT
// ============================================================================

export interface ShowClauseResult {
  fields: DisplayField[];
  hasCalculations: boolean;
  hasAggregations: boolean;
  hasFormatting: boolean;
}

export interface DisplayField {
  name: string;
  alias?: string;
  format?: FieldFormat;
  calculation?: CalculationSpec;
  aggregation?: AggregationSpec;
  dataType?: string;
}

export interface FieldFormat {
  type: 'currency' | 'percentage' | 'hours' | 'decimal' | 'integer' | 'date' | 'text';
  options?: {
    decimals?: number;
    precision?: number;
    currency?: string;
    symbol?: string;
    locale?: string;
  };
}

export interface CalculationSpec {
  operator: '+' | '-' | '*' | '/';
  left: string;
  right: string;
}

export interface AggregationSpec {
  function: 'sum' | 'avg' | 'count' | 'min' | 'max';
  field: string;
}

// ============================================================================
// SHOW CLAUSE HANDLER
// ============================================================================

export class ShowClauseHandler extends BaseClauseHandler<ShowClauseNode, ShowClauseResult> {
  constructor() {
    super('ShowClause');
  }

  handle(clause: ShowClauseNode, context?: ClauseContext): ShowClauseResult {
    const fields: DisplayField[] = [];
    let hasCalculations = false;
    let hasAggregations = false;
    let hasFormatting = false;

    for (const field of clause.fields) {
      const displayField = this.processField(field);
      if (displayField) {
        fields.push(displayField);

        if (displayField.calculation) hasCalculations = true;
        if (displayField.aggregation) hasAggregations = true;
        if (displayField.format) hasFormatting = true;
      }
    }

    return {
      fields,
      hasCalculations,
      hasAggregations,
      hasFormatting
    };
  }

  protected validateSpecific(clause: ShowClauseNode): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(clause.fields)) {
      errors.push('SHOW clause must have fields array');
      return this.createValidationResult(errors, warnings);
    }

    if (clause.fields.length === 0) {
      errors.push('SHOW clause must have at least one field');
    }

    // Validate each field
    for (const field of clause.fields) {
      const fieldValidation = this.validateField(field);
      errors.push(...fieldValidation.errors);
      warnings.push(...fieldValidation.warnings);
    }

    return this.createValidationResult(errors, warnings);
  }

  private processField(field: any): DisplayField | null {
    // Handle enhanced fields
    if (field.type === 'EnhancedField') {
      return this.processEnhancedField(field as EnhancedFieldNode);
    }

    // Handle simple identifiers
    if (field.type === 'Identifier') {
      return {
        name: (field as IdentifierNode).name
      };
    }

    return null;
  }

  private processEnhancedField(field: EnhancedFieldNode): DisplayField | null {
    const result: DisplayField = {
      name: this.extractFieldName(field.expression)
    };

    // Process alias
    if (field.alias) {
      result.alias = field.alias.name;
    }

    // Process format
    if (field.format) {
      result.format = this.processFormat(field.format);
    }

    // Process calculation
    if (field.expression.type === 'CalculatedField') {
      const calc = this.processCalculation(field.expression as CalculatedFieldNode);
      if (calc) {
        result.calculation = calc;
      }
    }

    // Process aggregation
    if (field.expression.type === 'AggregationFunction') {
      result.aggregation = this.processAggregation(field.expression as AggregationFunctionNode);
    }

    return result;
  }

  private extractFieldName(expression: any): string {
    switch (expression.type) {
      case 'Identifier':
        return expression.name;
      case 'CalculatedField':
        // Use left field name for calculated fields
        return this.extractFieldName(expression.left);
      case 'AggregationFunction':
        return `${expression.function}_${expression.field.name}`;
      default:
        return 'unknown';
    }
  }

  private processFormat(format: FormatSpecifierNode): FieldFormat {
    return {
      type: format.formatType,
      options: format.options
    };
  }

  private processCalculation(calc: CalculatedFieldNode): CalculationSpec | null {
    const left = this.extractFieldName(calc.left);
    const right = this.extractFieldName(calc.right);

    if (!left || !right) return null;

    return {
      operator: calc.operator,
      left,
      right
    };
  }

  private processAggregation(aggr: AggregationFunctionNode): AggregationSpec {
    return {
      function: aggr.function,
      field: aggr.field.name
    };
  }

  private validateField(field: any): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!field || !field.type) {
      errors.push('Field missing type');
      return this.createValidationResult(errors, warnings);
    }

    // Validate field names
    if (field.type === 'Identifier') {
      const fieldName = (field as IdentifierNode).name;
      if (!this.isValidFieldName(fieldName)) {
        warnings.push(`Unknown field name: ${fieldName}`);
      }
    }

    // Validate enhanced fields
    if (field.type === 'EnhancedField') {
      const enhanced = field as EnhancedFieldNode;

      if (!enhanced.expression) {
        errors.push('Enhanced field missing expression');
      }

      // Validate format if present
      if (enhanced.format) {
        const formatValidation = this.validateFormat(enhanced.format);
        errors.push(...formatValidation.errors);
        warnings.push(...formatValidation.warnings);
      }
    }

    return this.createValidationResult(errors, warnings);
  }

  private validateFormat(format: FormatSpecifierNode): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validFormats = ['currency', 'percentage', 'hours', 'decimal', 'integer', 'date', 'text'];
    if (!validFormats.includes(format.formatType)) {
      errors.push(`Invalid format type: ${format.formatType}`);
    }

    // Validate format options
    if (format.options) {
      if (format.options.decimals !== undefined && format.options.decimals < 0) {
        errors.push('Decimals must be non-negative');
      }

      if (format.options.precision !== undefined && format.options.precision < 0) {
        errors.push('Precision must be non-negative');
      }
    }

    return this.createValidationResult(errors, warnings);
  }

  private isValidFieldName(fieldName: string): boolean {
    const validFields = [
      'date', 'project', 'client', 'task', 'taskDescription', 'workOrder',
      'hours', 'rate', 'invoiced', 'revenue',
      'progress', 'utilization', 'remaining',
      'label', 'period', 'year', 'month', 'week',
      'budgetHours', 'budgetUsed', 'budgetRemaining', 'budgetProgress',
      'category', 'tag', 'efficiency',
      // Retainer fields
      'service', 'service_mix', 'rollover', 'rolloverHours',
      'banked', 'allocated', 'burned',
      'response_time', 'satisfaction',
      'value_delivered', 'health_score', 'forecast',
      'retainerHours', 'contractValue',
      'usage', 'value', 'impact'
    ];

    return validFields.includes(fieldName);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Apply formatting to a value based on field format
 */
export function formatValue(value: any, format?: FieldFormat): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (!format) {
    return String(value);
  }

  switch (format.type) {
    case 'currency':
      return formatCurrency(value, format.options);
    case 'percentage':
      return formatPercentage(value, format.options);
    case 'hours':
      return formatHours(value, format.options);
    case 'decimal':
      return formatDecimal(value, format.options);
    case 'integer':
      return formatInteger(value);
    case 'date':
      return formatDate(value, format.options);
    case 'text':
      return String(value);
    default:
      return String(value);
  }
}

function formatCurrency(value: number, options?: any): string {
  const currency = options?.currency || 'USD';
  const decimals = options?.decimals ?? 2;
  const locale = options?.locale || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  } catch {
    return `${options?.symbol || '$'}${value.toFixed(decimals)}`;
  }
}

function formatPercentage(value: number, options?: any): string {
  const decimals = options?.decimals ?? 1;
  return `${value.toFixed(decimals)}%`;
}

function formatHours(value: number, options?: any): string {
  const decimals = options?.decimals ?? 2;
  return `${value.toFixed(decimals)}h`;
}

function formatDecimal(value: number, options?: any): string {
  const precision = options?.precision ?? options?.decimals ?? 2;
  return value.toFixed(precision);
}

function formatInteger(value: number): string {
  return Math.round(value).toString();
}

function formatDate(value: any, options?: any): string {
  const locale = options?.locale || 'en-US';

  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return String(value);
    }
    return date.toLocaleDateString(locale);
  } catch {
    return String(value);
  }
}

/**
 * Calculate a value based on a calculation spec
 */
export function calculateValue(
  item: any,
  calculation: CalculationSpec
): number {
  const leftValue = Number(item[calculation.left]) || 0;
  const rightValue = Number(item[calculation.right]) || 0;

  switch (calculation.operator) {
    case '+':
      return leftValue + rightValue;
    case '-':
      return leftValue - rightValue;
    case '*':
      return leftValue * rightValue;
    case '/':
      return rightValue !== 0 ? leftValue / rightValue : 0;
    default:
      return 0;
  }
}

/**
 * Apply aggregation to a set of items
 */
export function aggregateValues(
  items: any[],
  aggregation: AggregationSpec
): number {
  const values = items.map(item => Number(item[aggregation.field]) || 0);

  switch (aggregation.function) {
    case 'sum':
      return values.reduce((sum, val) => sum + val, 0);
    case 'avg':
      return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    case 'count':
      return values.length;
    case 'min':
      return values.length > 0 ? Math.min(...values) : 0;
    case 'max':
      return values.length > 0 ? Math.max(...values) : 0;
    default:
      return 0;
  }
}
