// Aggregation Clause Handler
// Handles GROUP BY, HAVING, and aggregation functions

import {
  GroupByClauseNode,
  HavingClauseNode,
  IdentifierNode,
  ConditionNode
} from '../ast';
import {
  BaseClauseHandler,
  ClauseContext,
  ClauseValidationResult
} from './base';

// ============================================================================
// GROUP BY CLAUSE RESULT
// ============================================================================

export interface GroupByClauseResult {
  fields: string[];
}

// ============================================================================
// HAVING CLAUSE RESULT
// ============================================================================

export interface HavingClauseResult {
  conditions: AggregationCondition[];
}

export interface AggregationCondition {
  field: string;
  operator: string;
  value: any;
  aggregation?: string;
}

// ============================================================================
// GROUP BY CLAUSE HANDLER
// ============================================================================

export class GroupByClauseHandler extends BaseClauseHandler<GroupByClauseNode, GroupByClauseResult> {
  constructor() {
    super('GroupByClause');
  }

  handle(clause: GroupByClauseNode, context?: ClauseContext): GroupByClauseResult {
    const fields = clause.fields.map(field => field.name);

    return {
      fields
    };
  }

  protected validateSpecific(clause: GroupByClauseNode): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(clause.fields)) {
      errors.push('GROUP BY clause must have fields array');
      return this.createValidationResult(errors, warnings);
    }

    if (clause.fields.length === 0) {
      errors.push('GROUP BY clause must have at least one field');
    }

    // Validate each field
    for (const field of clause.fields) {
      if (!field || field.type !== 'Identifier') {
        errors.push('GROUP BY fields must be identifiers');
        continue;
      }

      if (!field.name || field.name.trim() === '') {
        errors.push('GROUP BY field has empty name');
      }
    }

    return this.createValidationResult(errors, warnings);
  }
}

// ============================================================================
// HAVING CLAUSE HANDLER
// ============================================================================

export class HavingClauseHandler extends BaseClauseHandler<HavingClauseNode, HavingClauseResult> {
  constructor() {
    super('HavingClause');
  }

  handle(clause: HavingClauseNode, context?: ClauseContext): HavingClauseResult {
    const conditions: AggregationCondition[] = [];

    for (const condition of clause.conditions) {
      const aggCondition = this.processCondition(condition);
      if (aggCondition) {
        conditions.push(aggCondition);
      }
    }

    return {
      conditions
    };
  }

  protected validateSpecific(clause: HavingClauseNode): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(clause.conditions)) {
      errors.push('HAVING clause must have conditions array');
      return this.createValidationResult(errors, warnings);
    }

    if (clause.conditions.length === 0) {
      warnings.push('HAVING clause has no conditions');
    }

    // Validate that conditions involve aggregation functions
    for (const condition of clause.conditions) {
      if (!this.hasAggregation(condition)) {
        warnings.push('HAVING condition should involve aggregation functions');
      }
    }

    return this.createValidationResult(errors, warnings);
  }

  private processCondition(condition: ConditionNode): AggregationCondition | null {
    if (condition.type !== 'BinaryExpression') {
      return null;
    }

    const binary = condition as any;
    const field = binary.left?.name || 'unknown';
    const operator = binary.operator;
    const value = binary.right?.value || binary.right;

    return {
      field,
      operator,
      value,
      aggregation: this.extractAggregation(binary.left)
    };
  }

  private extractAggregation(expr: any): string | undefined {
    if (expr?.type === 'AggregationFunction') {
      return expr.function;
    }
    return undefined;
  }

  private hasAggregation(condition: ConditionNode): boolean {
    // Check if the condition involves an aggregation function
    if (condition.type === 'BinaryExpression') {
      const binary = condition as any;
      return binary.left?.type === 'AggregationFunction';
    }
    return false;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Group items by specified fields
 */
export function groupBy<T>(items: T[], fields: string[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = createGroupKey(item, fields);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key)!.push(item);
  }

  return groups;
}

/**
 * Create a unique key for grouping based on field values
 */
function createGroupKey(item: any, fields: string[]): string {
  const values = fields.map(field => {
    const value = item[field];
    return value === null || value === undefined ? 'NULL' : String(value);
  });

  return values.join('|');
}

/**
 * Apply HAVING conditions to grouped data
 */
export function applyHavingConditions(
  groups: Map<string, any[]>,
  conditions: AggregationCondition[]
): Map<string, any[]> {
  const result = new Map<string, any[]>();

  for (const [key, items] of groups.entries()) {
    let matches = true;

    for (const condition of conditions) {
      if (!evaluateAggregationCondition(items, condition)) {
        matches = false;
        break;
      }
    }

    if (matches) {
      result.set(key, items);
    }
  }

  return result;
}

/**
 * Evaluate an aggregation condition against a group of items
 */
function evaluateAggregationCondition(
  items: any[],
  condition: AggregationCondition
): boolean {
  const aggregatedValue = calculateAggregation(items, condition.field, condition.aggregation);

  switch (condition.operator) {
    case '=':
      return aggregatedValue == condition.value;
    case '!=':
      return aggregatedValue != condition.value;
    case '>':
      return aggregatedValue > condition.value;
    case '<':
      return aggregatedValue < condition.value;
    case '>=':
      return aggregatedValue >= condition.value;
    case '<=':
      return aggregatedValue <= condition.value;
    default:
      return true;
  }
}

/**
 * Calculate aggregation for a field in a group of items
 */
function calculateAggregation(
  items: any[],
  field: string,
  aggregation?: string
): number {
  if (!aggregation) {
    aggregation = 'count';
  }

  const values = items.map(item => Number(item[field]) || 0);

  switch (aggregation) {
    case 'sum':
      return values.reduce((sum, val) => sum + val, 0);
    case 'avg':
    case 'average':
      return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    case 'count':
      return items.length;
    case 'min':
      return values.length > 0 ? Math.min(...values) : 0;
    case 'max':
      return values.length > 0 ? Math.max(...values) : 0;
    default:
      return 0;
  }
}

/**
 * Aggregate grouped data into summary records
 */
export function aggregateGroups(
  groups: Map<string, any[]>,
  groupFields: string[],
  aggregations: { field: string; function: string; alias?: string }[]
): any[] {
  const results: any[] = [];

  for (const [key, items] of groups.entries()) {
    const result: any = {};

    // Add group field values
    const keyValues = key.split('|');
    groupFields.forEach((field, index) => {
      const value = keyValues[index];
      result[field] = value === 'NULL' ? null : value;
    });

    // Add aggregated values
    for (const agg of aggregations) {
      const value = calculateAggregation(items, agg.field, agg.function);
      const fieldName = agg.alias || `${agg.function}_${agg.field}`;
      result[fieldName] = value;
    }

    results.push(result);
  }

  return results;
}
