// AST Node Factory Functions
// Pure functions for creating AST nodes with proper types

import {
  ASTNode,
  LiteralNode,
  IdentifierNode,
  BinaryExpressionNode,
  CalculatedFieldNode,
  AggregationFunctionNode,
  InExpressionNode,
  NotInExpressionNode,
  LikeExpressionNode,
  IsNullExpressionNode,
  ListNode,
  DateRangeNode,
  WhereClauseNode,
  ShowClauseNode,
  ViewClauseNode,
  ChartClauseNode,
  PeriodClauseNode,
  SizeClauseNode,
  EnhancedFieldNode,
  ColumnAliasNode,
  FormatSpecifierNode,
  FormatOptions,
  OrderByClauseNode,
  OrderFieldNode,
  GroupByClauseNode,
  HavingClauseNode,
  LimitClauseNode,
  RetainerClauseNode,
  RetainerOptions,
  ServiceClauseNode,
  ServiceOptions,
  RolloverClauseNode,
  RolloverOptions,
  UtilizationClauseNode,
  ThresholdSpecifier,
  ContractClauseNode,
  ContractOptions,
  ValueClauseNode,
  ValueOptions,
  AlertClauseNode,
  ForecastClauseNode,
  QueryNode,
  ExpressionNode,
  ConditionNode,
  ClauseNode
} from './nodes';

// ============================================================================
// PRIMITIVE NODE FACTORIES
// ============================================================================

export function createLiteral(
  value: string | number,
  dataType: 'string' | 'number' | 'date' | 'percentage' | 'relative_date'
): LiteralNode {
  return {
    type: 'Literal',
    value,
    dataType
  };
}

export function createIdentifier(name: string): IdentifierNode {
  return {
    type: 'Identifier',
    name
  };
}

// ============================================================================
// EXPRESSION NODE FACTORIES
// ============================================================================

export function createBinaryExpression(
  left: ExpressionNode,
  operator: BinaryExpressionNode['operator'],
  right: ExpressionNode | ExpressionNode[]
): BinaryExpressionNode {
  return {
    type: 'BinaryExpression',
    left,
    operator,
    right
  };
}

export function createCalculatedField(
  operator: '+' | '-' | '*' | '/',
  left: ExpressionNode,
  right: ExpressionNode
): CalculatedFieldNode {
  return {
    type: 'CalculatedField',
    operator,
    left,
    right
  };
}

export function createAggregationFunction(
  func: 'sum' | 'avg' | 'count' | 'min' | 'max',
  field: IdentifierNode
): AggregationFunctionNode {
  return {
    type: 'AggregationFunction',
    function: func,
    field
  };
}

export function createInExpression(
  field: IdentifierNode,
  values: ExpressionNode[]
): InExpressionNode {
  return {
    type: 'InExpression',
    field,
    values
  };
}

export function createNotInExpression(
  field: IdentifierNode,
  values: ExpressionNode[]
): NotInExpressionNode {
  return {
    type: 'NotInExpression',
    field,
    values
  };
}

export function createLikeExpression(
  field: IdentifierNode,
  pattern: LiteralNode
): LikeExpressionNode {
  return {
    type: 'LikeExpression',
    field,
    pattern
  };
}

export function createIsNullExpression(
  field: IdentifierNode,
  isNull: boolean
): IsNullExpressionNode {
  return {
    type: 'IsNullExpression',
    field,
    isNull
  };
}

// ============================================================================
// COLLECTION NODE FACTORIES
// ============================================================================

export function createList(items: ExpressionNode[]): ListNode {
  return {
    type: 'List',
    items
  };
}

export function createDateRange(start: LiteralNode, end: LiteralNode): DateRangeNode {
  return {
    type: 'DateRange',
    start,
    end
  };
}

// ============================================================================
// BASIC CLAUSE NODE FACTORIES
// ============================================================================

export function createWhereClause(conditions: ConditionNode[]): WhereClauseNode {
  return {
    type: 'WhereClause',
    conditions
  };
}

export function createShowClause(
  fields: (IdentifierNode | EnhancedFieldNode)[]
): ShowClauseNode {
  return {
    type: 'ShowClause',
    fields
  };
}

export function createViewClause(
  viewType: ViewClauseNode['viewType']
): ViewClauseNode {
  return {
    type: 'ViewClause',
    viewType
  };
}

export function createChartClause(
  chartType: ChartClauseNode['chartType']
): ChartClauseNode {
  return {
    type: 'ChartClause',
    chartType
  };
}

export function createPeriodClause(
  period: PeriodClauseNode['period']
): PeriodClauseNode {
  return {
    type: 'PeriodClause',
    period
  };
}

export function createSizeClause(
  size: SizeClauseNode['size']
): SizeClauseNode {
  return {
    type: 'SizeClause',
    size
  };
}

// ============================================================================
// ENHANCED CLAUSE NODE FACTORIES
// ============================================================================

export function createEnhancedField(
  expression: ExpressionNode,
  alias: ColumnAliasNode | null = null,
  format: FormatSpecifierNode | null = null,
  aggregation: string | null = null
): EnhancedFieldNode {
  return {
    type: 'EnhancedField',
    expression,
    alias,
    format,
    aggregation
  };
}

export function createColumnAlias(name: string): ColumnAliasNode {
  return {
    type: 'ColumnAlias',
    name
  };
}

export function createFormatSpecifier(
  formatType: FormatSpecifierNode['formatType'],
  options?: FormatOptions
): FormatSpecifierNode {
  return {
    type: 'FormatSpecifier',
    formatType,
    options
  };
}

export function createOrderByClause(fields: OrderFieldNode[]): OrderByClauseNode {
  return {
    type: 'OrderByClause',
    fields
  };
}

export function createOrderField(
  field: IdentifierNode,
  direction: 'asc' | 'desc' = 'asc'
): OrderFieldNode {
  return {
    field,
    direction
  };
}

export function createGroupByClause(fields: IdentifierNode[]): GroupByClauseNode {
  return {
    type: 'GroupByClause',
    fields
  };
}

export function createHavingClause(conditions: ConditionNode[]): HavingClauseNode {
  return {
    type: 'HavingClause',
    conditions
  };
}

export function createLimitClause(limit: number, offset: number = 0): LimitClauseNode {
  return {
    type: 'LimitClause',
    limit,
    offset
  };
}

// ============================================================================
// RETAINER CLAUSE NODE FACTORIES
// ============================================================================

export function createRetainerClause(
  retainerType: RetainerClauseNode['retainerType'],
  options?: RetainerOptions
): RetainerClauseNode {
  return {
    type: 'RetainerClause',
    retainerType,
    options
  };
}

export function createServiceClause(
  categories: string[],
  options?: ServiceOptions
): ServiceClauseNode {
  return {
    type: 'ServiceClause',
    categories,
    options
  };
}

export function createRolloverClause(
  rolloverType: RolloverClauseNode['rolloverType'],
  options?: RolloverOptions
): RolloverClauseNode {
  return {
    type: 'RolloverClause',
    rolloverType,
    options
  };
}

export function createUtilizationClause(
  utilizationType: UtilizationClauseNode['utilizationType'],
  threshold?: ThresholdSpecifier
): UtilizationClauseNode {
  return {
    type: 'UtilizationClause',
    utilizationType,
    threshold
  };
}

export function createContractClause(
  contractType: ContractClauseNode['contractType'],
  options?: ContractOptions
): ContractClauseNode {
  return {
    type: 'ContractClause',
    contractType,
    options
  };
}

export function createValueClause(
  valueType: ValueClauseNode['valueType'],
  options?: ValueOptions
): ValueClauseNode {
  return {
    type: 'ValueClause',
    valueType,
    options
  };
}

export function createAlertClause(
  alertType: AlertClauseNode['alertType'],
  threshold: number
): AlertClauseNode {
  return {
    type: 'AlertClause',
    alertType,
    threshold
  };
}

export function createForecastClause(
  forecastType: ForecastClauseNode['forecastType'],
  horizon?: ForecastClauseNode['horizon']
): ForecastClauseNode {
  return {
    type: 'ForecastClause',
    forecastType,
    horizon
  };
}

// ============================================================================
// ROOT NODE FACTORY
// ============================================================================

export function createQuery(clauses: ClauseNode[]): QueryNode {
  return {
    type: 'Query',
    clauses
  };
}

// ============================================================================
// CONVENIENCE FACTORIES
// ============================================================================

export function createStringLiteral(value: string): LiteralNode {
  return createLiteral(value, 'string');
}

export function createNumberLiteral(value: number): LiteralNode {
  return createLiteral(value, 'number');
}

export function createDateLiteral(value: string): LiteralNode {
  return createLiteral(value, 'date');
}

export function createPercentageLiteral(value: number): LiteralNode {
  return createLiteral(value, 'percentage');
}

export function createRelativeDateLiteral(
  value: 'today' | 'yesterday' | 'last_month'
): LiteralNode {
  return createLiteral(value, 'relative_date');
}

export function createThresholdAbove(value: number): ThresholdSpecifier {
  return {
    type: 'above',
    value
  };
}

export function createThresholdBelow(value: number): ThresholdSpecifier {
  return {
    type: 'below',
    value
  };
}

export function createThresholdBetween(min: number, max: number): ThresholdSpecifier {
  return {
    type: 'between',
    min,
    max
  };
}
