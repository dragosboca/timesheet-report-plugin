// AST node definitions for the timesheet query language

export interface ASTNode {
  type: string;
}

// Literal values
export interface LiteralNode extends ASTNode {
  type: 'Literal';
  value: string | number;
  dataType: 'string' | 'number' | 'date';
}

export interface IdentifierNode extends ASTNode {
  type: 'Identifier';
  name: string;
}

// Expressions
export interface BinaryExpressionNode extends ASTNode {
  type: 'BinaryExpression';
  left: ExpressionNode;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'BETWEEN' | 'IN';
  right: ExpressionNode | ExpressionNode[];
}

export interface ListNode extends ASTNode {
  type: 'List';
  items: ExpressionNode[];
}

export interface DateRangeNode extends ASTNode {
  type: 'DateRange';
  start: LiteralNode;
  end: LiteralNode;
}

// Clauses
export interface WhereClauseNode extends ASTNode {
  type: 'WhereClause';
  conditions: BinaryExpressionNode[];
}

export interface ShowClauseNode extends ASTNode {
  type: 'ShowClause';
  fields: IdentifierNode[];
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

// Main query node
export interface QueryNode extends ASTNode {
  type: 'Query';
  clauses: ClauseNode[];
}

// Union types
export type ExpressionNode = LiteralNode | IdentifierNode | DateRangeNode | ListNode;

export type ClauseNode =
  | WhereClauseNode
  | ShowClauseNode
  | ViewClauseNode
  | ChartClauseNode
  | PeriodClauseNode
  | SizeClauseNode;

// Visitor pattern interface for AST traversal
export interface ASTVisitor<T> {
  visitQuery(node: QueryNode): T;
  visitWhereClause(node: WhereClauseNode): T;
  visitShowClause(node: ShowClauseNode): T;
  visitViewClause(node: ViewClauseNode): T;
  visitChartClause(node: ChartClauseNode): T;
  visitPeriodClause(node: PeriodClauseNode): T;
  visitSizeClause(node: SizeClauseNode): T;
  visitBinaryExpression(node: BinaryExpressionNode): T;
  visitLiteral(node: LiteralNode): T;
  visitIdentifier(node: IdentifierNode): T;
  visitList(node: ListNode): T;
  visitDateRange(node: DateRangeNode): T;
}

// Helper function to create AST nodes
export const createLiteral = (value: string | number, dataType: 'string' | 'number' | 'date'): LiteralNode => ({
  type: 'Literal',
  value,
  dataType
});

export const createIdentifier = (name: string): IdentifierNode => ({
  type: 'Identifier',
  name
});

export const createBinaryExpression = (
  left: ExpressionNode,
  operator: BinaryExpressionNode['operator'],
  right: ExpressionNode | ExpressionNode[]
): BinaryExpressionNode => ({
  type: 'BinaryExpression',
  left,
  operator,
  right
});

export const createList = (items: ExpressionNode[]): ListNode => ({
  type: 'List',
  items
});

export const createDateRange = (start: LiteralNode, end: LiteralNode): DateRangeNode => ({
  type: 'DateRange',
  start,
  end
});

export const createWhereClause = (conditions: BinaryExpressionNode[]): WhereClauseNode => ({
  type: 'WhereClause',
  conditions
});

export const createShowClause = (fields: IdentifierNode[]): ShowClauseNode => ({
  type: 'ShowClause',
  fields
});

export const createViewClause = (viewType: ViewClauseNode['viewType']): ViewClauseNode => ({
  type: 'ViewClause',
  viewType
});

export const createChartClause = (chartType: ChartClauseNode['chartType']): ChartClauseNode => ({
  type: 'ChartClause',
  chartType
});

export const createPeriodClause = (period: PeriodClauseNode['period']): PeriodClauseNode => ({
  type: 'PeriodClause',
  period
});

export const createSizeClause = (size: SizeClauseNode['size']): SizeClauseNode => ({
  type: 'SizeClause',
  size
});

export const createQuery = (clauses: ClauseNode[]): QueryNode => ({
  type: 'Query',
  clauses
});

// Utility functions that work with ASTNode
export function walkAST(node: ASTNode, visitor: (node: ASTNode) => void): void {
  visitor(node);

  switch (node.type) {
    case 'Query': {
      const query = node as QueryNode;
      if (Array.isArray(query.clauses)) {
        query.clauses.forEach(clause => walkAST(clause, visitor));
      }
      break;
    }
    case 'WhereClause': {
      const whereClause = node as WhereClauseNode;
      if (Array.isArray(whereClause.conditions)) {
        whereClause.conditions.forEach(condition => walkAST(condition, visitor));
      }
      break;
    }
    case 'BinaryExpression': {
      const binExpr = node as BinaryExpressionNode;
      walkAST(binExpr.left, visitor);
      if (Array.isArray(binExpr.right)) {
        binExpr.right.forEach(expr => walkAST(expr, visitor));
      } else {
        walkAST(binExpr.right, visitor);
      }
      break;
    }
    case 'DateRange': {
      const dateRange = node as DateRangeNode;
      walkAST(dateRange.start, visitor);
      walkAST(dateRange.end, visitor);
      break;
    }
    case 'List':
      (node as ListNode).items.forEach(item => walkAST(item, visitor));
      break;
    case 'ShowClause':
      (node as ShowClauseNode).fields.forEach(field => walkAST(field, visitor));
      break;
    // Leaf nodes (no recursion needed)
    case 'Literal':
    case 'Identifier':
    case 'ViewClause':
    case 'ChartClause':
    case 'PeriodClause':
    case 'SizeClause':
      break;
  }
}

export function findNodesByType<T extends ASTNode>(node: ASTNode, nodeType: string): T[] {
  const results: T[] = [];

  walkAST(node, (currentNode) => {
    if (currentNode.type === nodeType) {
      results.push(currentNode as T);
    }
  });

  return results;
}

export function getASTStatistics(node: ASTNode): { [nodeType: string]: number } {
  const stats: { [nodeType: string]: number } = {};

  walkAST(node, (currentNode) => {
    stats[currentNode.type] = (stats[currentNode.type] || 0) + 1;
  });

  return stats;
}

export function validateAST(node: ASTNode): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  walkAST(node, (currentNode) => {
    if (!currentNode.type) {
      errors.push('Node missing type property');
    }

    // Type-specific validation
    switch (currentNode.type) {
      case 'Literal': {
        const literal = currentNode as LiteralNode;
        if (literal.value === undefined || literal.value === null) {
          errors.push('Literal node missing value');
        }
        if (!['string', 'number', 'date'].includes(literal.dataType)) {
          errors.push(`Invalid literal dataType: ${literal.dataType}`);
        }
        break;
      }
      case 'Identifier': {
        const identifier = currentNode as IdentifierNode;
        if (!identifier.name || identifier.name.trim() === '') {
          errors.push('Identifier node missing or empty name');
        }
        break;
      }
      case 'Query': {
        const query = currentNode as QueryNode;
        if (!Array.isArray(query.clauses)) {
          errors.push('Query node must have clauses array');
        }
        break;
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}
