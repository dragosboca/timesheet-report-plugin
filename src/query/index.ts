// Timesheet Query Language - Main Entry Point
// Unified, well-structured query system combining all features

// ============================================================================
// AST - Abstract Syntax Tree (Types)
// ============================================================================

export type {
  // Node Types
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
  BasicClauseNode,
  EnhancedClauseNode,
  RetainerClauseNode_Union,
  ClauseNode,

  // Visitor types
  ASTVisitor,

  // Utility types
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ASTStatistics,
  QueryAnalysis
} from './ast';

// ============================================================================
// AST - Abstract Syntax Tree (Values)
// ============================================================================

export {
  // Type Guards
  isLiteral,
  isIdentifier,
  isBinaryExpression,
  isCalculatedField,
  isAggregationFunction,
  isWhereClause,
  isShowClause,
  isEnhancedField,
  isRetainerClause,
  isServiceClause,
  isQuery,

  // Builders
  createLiteral,
  createIdentifier,
  createBinaryExpression,
  createCalculatedField,
  createAggregationFunction,
  createInExpression,
  createNotInExpression,
  createLikeExpression,
  createIsNullExpression,
  createList,
  createDateRange,
  createWhereClause,
  createShowClause,
  createViewClause,
  createChartClause,
  createPeriodClause,
  createSizeClause,
  createEnhancedField,
  createColumnAlias,
  createFormatSpecifier,
  createOrderByClause,
  createOrderField,
  createGroupByClause,
  createHavingClause,
  createLimitClause,
  createRetainerClause,
  createServiceClause,
  createRolloverClause,
  createUtilizationClause,
  createContractClause,
  createValueClause,
  createAlertClause,
  createForecastClause,
  createQuery,
  createStringLiteral,
  createNumberLiteral,
  createDateLiteral,
  createPercentageLiteral,
  createRelativeDateLiteral,
  createThresholdAbove,
  createThresholdBelow,
  createThresholdBetween,

  // Visitors
  BaseASTVisitor,
  TraversalVisitor,
  walkAST,
  findNodesByType,
  findNode,
  hasNodeType,
  transformAST,

  // Utilities
  validateAST,
  isValidAST,
  getASTStatistics,
  analyzeQuery,
  extractClause,
  extractClauses,
  hasClause,
  getReferencedFields,
  getFilteredFields,
  getDisplayedFields,
  areNodesEqual,
  printAST
} from './ast';

// ============================================================================
// PARSER - Query Parsing
// ============================================================================

export type {
  ParserOptions
} from './parser';

export {
  ParseError,
  QueryParser,
  parseQuery,
  isValidQuery,
  getQueryErrors,
  createParser
} from './parser';

// ============================================================================
// CLAUSES - Clause Handlers
// ============================================================================

export type {
  ClauseHandler,
  ClauseContext,
  ClauseValidationResult
} from './clauses';

export {
  BaseClauseHandler,
  ClauseHandlerRegistry,
  createClauseContext,
  mergeValidationResults,
  globalClauseRegistry
} from './clauses';

// ============================================================================
// COLUMN MAPPER
// ============================================================================

export {
  columnMapper,
  ColumnMapper
} from './column-mapper';

// ============================================================================
// INTERPRETER - Query Interpretation and Execution
// ============================================================================

export type {
  TimesheetQuery
} from './interpreter';

export {
  QueryInterpreter,
  InterpreterError
} from './interpreter';

export {
  QueryExecutor
} from './interpreter';

export type {
  ProcessedData,
  MonthlyDataPoint,
  TrendData,
  SummaryData
} from './interpreter';

// ============================================================================
// DATASOURCE - Data Access Layer
// ============================================================================

export type {
  TimeEntry,
  QueryOptions,
  TimesheetDataSource
} from '../datasource';

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

// Re-export from old location for backward compatibility
export { parseQuery as parse } from './parser';

// ============================================================================
// CONVENIENCE API
// ============================================================================

import { QueryParser, parseQuery as internalParseQuery } from './parser';
import type { QueryNode } from './ast';

/**
 * Simple API for parsing queries
 */
export const Query = {
  /**
   * Parse a query string
   */
  parse(input: string): QueryNode {
    return internalParseQuery(input);
  },

  /**
   * Validate a query string
   */
  validate(input: string): boolean {
    try {
      internalParseQuery(input);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Create a custom parser
   */
  createParser(options?: any): QueryParser {
    return new QueryParser(options);
  }
};

/**
 * Default query parser instance
 */
export const queryParser = new QueryParser();
