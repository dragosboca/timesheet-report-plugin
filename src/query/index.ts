// Main query language index file
// Exports the new Peggy-based parser as the default implementation

export type {
  QueryNode,
  ClauseNode,
  WhereClauseNode,
  ShowClauseNode,
  ViewClauseNode,
  ChartClauseNode,
  PeriodClauseNode,
  SizeClauseNode,
  BinaryExpressionNode,
  ExpressionNode,
  LiteralNode,
  IdentifierNode,
  DateRangeNode,
  ListNode,
  ASTVisitor
} from './ast';

export {
  // Helper functions
  createLiteral,
  createIdentifier,
  createBinaryExpression,
  createList,
  createDateRange,
  createWhereClause,
  createShowClause,
  createViewClause,
  createChartClause,
  createPeriodClause,
  createSizeClause,
  createQuery,
  // Utility functions
  walkAST,
  findNodesByType,
  getASTStatistics,
  validateAST
} from './ast';

export {
  QueryInterpreter,
  QueryOptions,
  DateRange
} from './interpreter';

// Export the Peggy-based parser
export {
  QueryParser,
  parseQuery,
  ParseError
} from './parser';

// Convenience function that uses the Peggy parser
export function parse(input: string): import('./ast').QueryNode {
  const { parseQuery } = require('./parser');
  return parseQuery(input);
}
