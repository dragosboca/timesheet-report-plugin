// WHERE Clause Handler
// Handles filtering conditions in queries

import {
  WhereClauseNode,
  BinaryExpressionNode,
  IdentifierNode,
  LiteralNode,
  ConditionNode
} from '../ast';
import {
  BaseClauseHandler,
  ClauseContext,
  ClauseValidationResult
} from './base';

// ============================================================================
// WHERE CLAUSE RESULT
// ============================================================================

export interface WhereClauseResult {
  conditions: FilterCondition[];
  fields: string[];
}

export interface FilterCondition {
  field: string;
  operator: string;
  value: any;
  dataType?: string;
}

// ============================================================================
// WHERE CLAUSE HANDLER
// ============================================================================

export class WhereClauseHandler extends BaseClauseHandler<WhereClauseNode, WhereClauseResult> {
  constructor() {
    super('WhereClause');
  }

  handle(clause: WhereClauseNode, context?: ClauseContext): WhereClauseResult {
    const conditions: FilterCondition[] = [];
    const fields = new Set<string>();

    for (const condition of clause.conditions) {
      const result = this.processCondition(condition);
      if (result) {
        conditions.push(result);
        fields.add(result.field);
      }
    }

    return {
      conditions,
      fields: Array.from(fields)
    };
  }

  protected validateSpecific(clause: WhereClauseNode): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(clause.conditions)) {
      errors.push('WHERE clause must have conditions array');
      return this.createValidationResult(errors, warnings);
    }

    if (clause.conditions.length === 0) {
      warnings.push('WHERE clause has no conditions');
    }

    // Validate each condition
    for (const condition of clause.conditions) {
      const conditionValidation = this.validateCondition(condition);
      errors.push(...conditionValidation.errors);
      warnings.push(...conditionValidation.warnings);
    }

    return this.createValidationResult(errors, warnings);
  }

  private processCondition(condition: ConditionNode): FilterCondition | null {
    switch (condition.type) {
      case 'BinaryExpression':
        return this.processBinaryExpression(condition as BinaryExpressionNode);
      case 'InExpression':
      case 'NotInExpression':
      case 'LikeExpression':
      case 'IsNullExpression':
        return this.processSpecialExpression(condition);
      default:
        return null;
    }
  }

  private processBinaryExpression(expr: BinaryExpressionNode): FilterCondition | null {
    // Extract field name
    let field: string;
    if (expr.left.type === 'Identifier') {
      field = (expr.left as IdentifierNode).name;
    } else {
      return null; // Complex expressions not yet supported
    }

    // Extract value
    let value: any;
    let dataType: string | undefined;

    if (Array.isArray(expr.right)) {
      value = expr.right.map((item: any) =>
        item.type === 'Literal' ? item.value : item
      );
      dataType = 'list';
    } else if (expr.right.type === 'Literal') {
      const literal = expr.right as LiteralNode;
      value = literal.value;
      dataType = literal.dataType;
    } else if (expr.right.type === 'DateRange') {
      const dateRange = expr.right as any;
      value = {
        start: dateRange.start.value,
        end: dateRange.end.value
      };
      dataType = 'daterange';
    } else {
      value = expr.right;
    }

    return {
      field,
      operator: expr.operator,
      value,
      dataType
    };
  }

  private processSpecialExpression(expr: any): FilterCondition | null {
    const field = expr.field?.name || expr.field;

    switch (expr.type) {
      case 'InExpression':
      case 'NotInExpression':
        return {
          field,
          operator: expr.type === 'InExpression' ? 'IN' : 'NOT IN',
          value: expr.values.map((v: any) => v.type === 'Literal' ? v.value : v),
          dataType: 'list'
        };

      case 'LikeExpression':
        return {
          field,
          operator: 'LIKE',
          value: expr.pattern.value,
          dataType: 'string'
        };

      case 'IsNullExpression':
        return {
          field,
          operator: expr.isNull ? 'IS NULL' : 'IS NOT NULL',
          value: null,
          dataType: 'null'
        };

      default:
        return null;
    }
  }

  private validateCondition(condition: ConditionNode): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!condition || !condition.type) {
      errors.push('Condition missing type');
      return this.createValidationResult(errors, warnings);
    }

    // Validate binary expressions
    if (condition.type === 'BinaryExpression') {
      const binary = condition as BinaryExpressionNode;

      if (!binary.left) {
        errors.push('Binary expression missing left operand');
      }

      if (!binary.right) {
        errors.push('Binary expression missing right operand');
      }

      if (!binary.operator) {
        errors.push('Binary expression missing operator');
      }

      // Validate field names
      if (binary.left?.type === 'Identifier') {
        const fieldName = (binary.left as IdentifierNode).name;
        if (!this.isValidFieldName(fieldName)) {
          warnings.push(`Unknown field name: ${fieldName}`);
        }
      }
    }

    return this.createValidationResult(errors, warnings);
  }

  private isValidFieldName(fieldName: string): boolean {
    const validFields = [
      'year', 'month', 'week', 'date',
      'project', 'client', 'task', 'taskDescription', 'workOrder',
      'hours', 'rate', 'invoiced', 'revenue',
      'progress', 'utilization', 'remaining',
      'label', 'period',
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
 * Convert filter conditions to a filter function
 */
export function createFilterFunction(conditions: FilterCondition[]): (item: any) => boolean {
  return (item: any) => {
    for (const condition of conditions) {
      if (!evaluateCondition(item, condition)) {
        return false;
      }
    }
    return true;
  };
}

/**
 * Evaluate a single condition against an item
 */
export function evaluateCondition(item: any, condition: FilterCondition): boolean {
  const fieldValue = getFieldValue(item, condition.field);

  switch (condition.operator) {
    case '=':
      return fieldValue == condition.value;
    case '!=':
      return fieldValue != condition.value;
    case '>':
      return fieldValue > condition.value;
    case '<':
      return fieldValue < condition.value;
    case '>=':
      return fieldValue >= condition.value;
    case '<=':
      return fieldValue <= condition.value;
    case 'BETWEEN':
      return fieldValue >= condition.value.start && fieldValue <= condition.value.end;
    case 'IN':
      return Array.isArray(condition.value) && condition.value.includes(fieldValue);
    case 'NOT IN':
      return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
    case 'LIKE':
      return matchesPattern(fieldValue, condition.value);
    case 'IS NULL':
      return fieldValue === null || fieldValue === undefined;
    case 'IS NOT NULL':
      return fieldValue !== null && fieldValue !== undefined;
    case 'contains':
      return String(fieldValue).includes(String(condition.value));
    case 'startsWith':
      return String(fieldValue).startsWith(String(condition.value));
    case 'endsWith':
      return String(fieldValue).endsWith(String(condition.value));
    default:
      return true;
  }
}

/**
 * Get field value from an item, supporting nested paths
 */
function getFieldValue(item: any, field: string): any {
  if (!item) return undefined;

  // Support dot notation for nested fields
  const parts = field.split('.');
  let value = item;

  for (const part of parts) {
    if (value === null || value === undefined) {
      return undefined;
    }
    value = value[part];
  }

  return value;
}

/**
 * Match a value against a LIKE pattern
 */
function matchesPattern(value: any, pattern: string): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  const stringValue = String(value);

  // Convert SQL LIKE pattern to regex
  // % matches any sequence of characters
  // _ matches any single character
  const regexPattern = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
    .replace(/%/g, '.*') // % becomes .*
    .replace(/_/g, '.'); // _ becomes .

  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(stringValue);
}
