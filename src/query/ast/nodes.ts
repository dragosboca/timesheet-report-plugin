// AST Node Type Definitions for Timesheet Query Language
// Comprehensive type system for all query constructs

// ============================================================================
// BASE TYPES
// ============================================================================

export interface ASTNode {
  type: string;
}

// ============================================================================
// PRIMITIVE NODES
// ============================================================================

export interface LiteralNode extends ASTNode {
  type: 'Literal';
  value: string | number;
  dataType: 'string' | 'number' | 'date' | 'percentage' | 'relative_date';
}

export interface IdentifierNode extends ASTNode {
  type: 'Identifier';
  name: string;
}

// ============================================================================
// EXPRESSION NODES
// ============================================================================

export interface BinaryExpressionNode extends ASTNode {
  type: 'BinaryExpression';
  left: ExpressionNode;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'BETWEEN' | 'IN' | 'contains' | 'startsWith' | 'endsWith';
  right: ExpressionNode | ExpressionNode[];
}

export interface CalculatedFieldNode extends ASTNode {
  type: 'CalculatedField';
  operator: '+' | '-' | '*' | '/';
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface AggregationFunctionNode extends ASTNode {
  type: 'AggregationFunction';
  function: 'sum' | 'avg' | 'count' | 'min' | 'max';
  field: IdentifierNode;
}

export interface InExpressionNode extends ASTNode {
  type: 'InExpression';
  field: IdentifierNode;
  values: ExpressionNode[];
}

export interface NotInExpressionNode extends ASTNode {
  type: 'NotInExpression';
  field: IdentifierNode;
  values: ExpressionNode[];
}

export interface LikeExpressionNode extends ASTNode {
  type: 'LikeExpression';
  field: IdentifierNode;
  pattern: LiteralNode;
}

export interface IsNullExpressionNode extends ASTNode {
  type: 'IsNullExpression';
  field: IdentifierNode;
  isNull: boolean;
}

// ============================================================================
// COLLECTION NODES
// ============================================================================

export interface ListNode extends ASTNode {
  type: 'List';
  items: ExpressionNode[];
}

export interface DateRangeNode extends ASTNode {
  type: 'DateRange';
  start: LiteralNode;
  end: LiteralNode;
}

// ============================================================================
// BASIC CLAUSE NODES
// ============================================================================

export interface WhereClauseNode extends ASTNode {
  type: 'WhereClause';
  conditions: ConditionNode[];
}

export interface ShowClauseNode extends ASTNode {
  type: 'ShowClause';
  fields: (IdentifierNode | EnhancedFieldNode)[];
}

export interface ViewClauseNode extends ASTNode {
  type: 'ViewClause';
  viewType: 'summary' | 'chart' | 'table' | 'full';
}

export interface ChartClauseNode extends ASTNode {
  type: 'ChartClause';
  chartType: 'trend' | 'monthly' | 'budget';
}

export interface PeriodClauseNode extends ASTNode {
  type: 'PeriodClause';
  period: 'current-year' | 'all-time' | 'last-6-months' | 'last-12-months';
}

export interface SizeClauseNode extends ASTNode {
  type: 'SizeClause';
  size: 'compact' | 'normal' | 'detailed';
}

// ============================================================================
// ENHANCED CLAUSE NODES
// ============================================================================

export interface EnhancedFieldNode extends ASTNode {
  type: 'EnhancedField';
  expression: ExpressionNode;
  alias: ColumnAliasNode | null;
  format: FormatSpecifierNode | null;
  aggregation: string | null;
}

export interface ColumnAliasNode extends ASTNode {
  type: 'ColumnAlias';
  name: string;
}

export interface FormatSpecifierNode extends ASTNode {
  type: 'FormatSpecifier';
  formatType: 'currency' | 'percentage' | 'hours' | 'decimal' | 'integer' | 'date' | 'text';
  options?: FormatOptions;
}

export interface FormatOptions {
  decimals?: number;
  precision?: number;
  currency?: string;
  symbol?: string;
  locale?: string;
}

export interface OrderByClauseNode extends ASTNode {
  type: 'OrderByClause';
  fields: OrderFieldNode[];
}

export interface OrderFieldNode {
  field: IdentifierNode;
  direction: 'asc' | 'desc';
}

export interface GroupByClauseNode extends ASTNode {
  type: 'GroupByClause';
  fields: IdentifierNode[];
}

export interface HavingClauseNode extends ASTNode {
  type: 'HavingClause';
  conditions: ConditionNode[];
}

export interface LimitClauseNode extends ASTNode {
  type: 'LimitClause';
  limit: number;
  offset: number;
}

// ============================================================================
// RETAINER CLAUSE NODES
// ============================================================================

export interface RetainerClauseNode extends ASTNode {
  type: 'RetainerClause';
  retainerType: 'health' | 'status' | 'forecast' | 'analysis' | 'performance' | 'optimization';
  options?: RetainerOptions;
}

export interface RetainerOptions {
  threshold?: number;
  period?: string;
  [key: string]: any;
}

export interface ServiceClauseNode extends ASTNode {
  type: 'ServiceClause';
  categories: string[];
  options?: ServiceOptions;
}

export interface ServiceOptions {
  efficiency?: 'high' | 'medium' | 'low';
  priority?: 'urgent' | 'normal' | 'low';
  [key: string]: any;
}

export interface RolloverClauseNode extends ASTNode {
  type: 'RolloverClause';
  rolloverType: 'status' | 'available' | 'expiring' | 'history' | 'forecast';
  options?: RolloverOptions;
}

export interface RolloverOptions {
  period?: string;
  expiringDays?: number;
  [key: string]: any;
}

export interface UtilizationClauseNode extends ASTNode {
  type: 'UtilizationClause';
  utilizationType: 'current' | 'target' | 'average' | 'trend' | 'efficiency';
  threshold?: ThresholdSpecifier;
}

export interface ThresholdSpecifier {
  type: 'above' | 'below' | 'between';
  value?: number;
  min?: number;
  max?: number;
}

export interface ContractClauseNode extends ASTNode {
  type: 'ContractClause';
  contractType: 'status' | 'renewal' | 'performance' | 'health' | 'terms';
  options?: ContractOptions;
}

export interface ContractOptions {
  dueInDays?: number;
  riskLevel?: 'high' | 'medium' | 'low';
  [key: string]: any;
}

export interface ValueClauseNode extends ASTNode {
  type: 'ValueClause';
  valueType: 'delivered' | 'projected' | 'impact' | 'roi' | 'efficiency';
  options?: ValueOptions;
}

export interface ValueOptions {
  threshold?: number;
  type?: 'above' | 'below';
  category?: string;
  [key: string]: any;
}

export interface AlertClauseNode extends ASTNode {
  type: 'AlertClause';
  alertType: 'utilization' | 'rollover' | 'budget' | 'satisfaction' | 'response';
  threshold: number;
}

export interface ForecastClauseNode extends ASTNode {
  type: 'ForecastClause';
  forecastType: 'utilization' | 'rollover' | 'renewal' | 'budget' | 'value';
  horizon?: 'month' | 'quarter' | 'year' | 'contract-term';
}

// ============================================================================
// ROOT NODE
// ============================================================================

export interface QueryNode extends ASTNode {
  type: 'Query';
  clauses: ClauseNode[];
}

// ============================================================================
// UNION TYPES
// ============================================================================

export type ExpressionNode =
  | LiteralNode
  | IdentifierNode
  | CalculatedFieldNode
  | AggregationFunctionNode
  | DateRangeNode
  | ListNode;

export type ConditionNode =
  | BinaryExpressionNode
  | InExpressionNode
  | NotInExpressionNode
  | LikeExpressionNode
  | IsNullExpressionNode;

export type BasicClauseNode =
  | WhereClauseNode
  | ShowClauseNode
  | ViewClauseNode
  | ChartClauseNode
  | PeriodClauseNode
  | SizeClauseNode;

export type EnhancedClauseNode =
  | OrderByClauseNode
  | GroupByClauseNode
  | HavingClauseNode
  | LimitClauseNode;

export type RetainerClauseNode_Union =
  | RetainerClauseNode
  | ServiceClauseNode
  | RolloverClauseNode
  | UtilizationClauseNode
  | ContractClauseNode
  | ValueClauseNode
  | AlertClauseNode
  | ForecastClauseNode;

export type ClauseNode =
  | BasicClauseNode
  | EnhancedClauseNode
  | RetainerClauseNode_Union;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isLiteral(node: ASTNode): node is LiteralNode {
  return node.type === 'Literal';
}

export function isIdentifier(node: ASTNode): node is IdentifierNode {
  return node.type === 'Identifier';
}

export function isBinaryExpression(node: ASTNode): node is BinaryExpressionNode {
  return node.type === 'BinaryExpression';
}

export function isCalculatedField(node: ASTNode): node is CalculatedFieldNode {
  return node.type === 'CalculatedField';
}

export function isAggregationFunction(node: ASTNode): node is AggregationFunctionNode {
  return node.type === 'AggregationFunction';
}

export function isWhereClause(node: ASTNode): node is WhereClauseNode {
  return node.type === 'WhereClause';
}

export function isShowClause(node: ASTNode): node is ShowClauseNode {
  return node.type === 'ShowClause';
}

export function isEnhancedField(node: ASTNode): node is EnhancedFieldNode {
  return node.type === 'EnhancedField';
}

export function isRetainerClause(node: ASTNode): node is RetainerClauseNode {
  return node.type === 'RetainerClause';
}

export function isServiceClause(node: ASTNode): node is ServiceClauseNode {
  return node.type === 'ServiceClause';
}

export function isQuery(node: ASTNode): node is QueryNode {
  return node.type === 'Query';
}
