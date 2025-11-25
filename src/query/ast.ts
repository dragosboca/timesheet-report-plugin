// AST node definitions for the timesheet query language

export interface ASTNode {
  type: string;
}

// Literal values
export interface LiteralNode extends ASTNode {
  type: 'Literal';
  value: string | number;
  dataType: 'string' | 'number' | 'date' | 'percentage' | 'relative_date';
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

// Retainer-specific AST node interfaces
export interface RetainerClauseNode extends ASTNode {
  type: 'RetainerClause';
  retainerType: 'health' | 'status' | 'forecast' | 'analysis' | 'performance' | 'optimization';
  options?: {
    threshold?: number;
    period?: string;
    [key: string]: any;
  };
}

export interface ServiceClauseNode extends ASTNode {
  type: 'ServiceClause';
  categories: string[];
  options?: {
    efficiency?: 'high' | 'medium' | 'low';
    priority?: 'urgent' | 'normal' | 'low';
    [key: string]: any;
  };
}

export interface RolloverClauseNode extends ASTNode {
  type: 'RolloverClause';
  rolloverType: 'status' | 'available' | 'expiring' | 'history' | 'forecast';
  options?: {
    period?: string;
    expiringDays?: number;
    [key: string]: any;
  };
}

export interface UtilizationClauseNode extends ASTNode {
  type: 'UtilizationClause';
  utilizationType: 'current' | 'target' | 'average' | 'trend' | 'efficiency';
  threshold?: {
    type: 'above' | 'below' | 'between';
    value?: number;
    min?: number;
    max?: number;
  };
}

export interface ContractClauseNode extends ASTNode {
  type: 'ContractClause';
  contractType: 'status' | 'renewal' | 'performance' | 'health' | 'terms';
  options?: {
    dueInDays?: number;
    riskLevel?: 'high' | 'medium' | 'low';
    [key: string]: any;
  };
}

export interface ValueClauseNode extends ASTNode {
  type: 'ValueClause';
  valueType: 'delivered' | 'projected' | 'impact' | 'roi' | 'efficiency';
  options?: {
    threshold?: number;
    type?: 'above' | 'below';
    category?: string;
    [key: string]: any;
  };
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

export interface PercentageLiteralNode extends LiteralNode {
  dataType: 'percentage';
}

export interface RelativeDateNode extends LiteralNode {
  dataType: 'relative_date';
  value: 'today' | 'yesterday' | 'last_month';
}

// Union types
export type ExpressionNode = LiteralNode | IdentifierNode | DateRangeNode | ListNode | PercentageLiteralNode | RelativeDateNode;

export type RetainerClauseTypes =
  | RetainerClauseNode
  | ServiceClauseNode
  | RolloverClauseNode
  | UtilizationClauseNode
  | ContractClauseNode
  | ValueClauseNode
  | AlertClauseNode
  | ForecastClauseNode;

export type ClauseNode =
  | WhereClauseNode
  | ShowClauseNode
  | ViewClauseNode
  | ChartClauseNode
  | PeriodClauseNode
  | SizeClauseNode
  | RetainerClauseTypes;

// Enhanced visitor pattern interface for AST traversal with retainer support
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
  // Retainer-specific visitor methods
  visitRetainerClause(node: RetainerClauseNode): T;
  visitServiceClause(node: ServiceClauseNode): T;
  visitRolloverClause(node: RolloverClauseNode): T;
  visitUtilizationClause(node: UtilizationClauseNode): T;
  visitContractClause(node: ContractClauseNode): T;
  visitValueClause(node: ValueClauseNode): T;
  visitAlertClause(node: AlertClauseNode): T;
  visitForecastClause(node: ForecastClauseNode): T;
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

// Retainer-specific factory functions
export const createRetainerClause = (
  retainerType: RetainerClauseNode['retainerType'],
  options?: RetainerClauseNode['options']
): RetainerClauseNode => ({
  type: 'RetainerClause',
  retainerType,
  options
});

export const createServiceClause = (
  categories: string[],
  options?: ServiceClauseNode['options']
): ServiceClauseNode => ({
  type: 'ServiceClause',
  categories,
  options
});

export const createRolloverClause = (
  rolloverType: RolloverClauseNode['rolloverType'],
  options?: RolloverClauseNode['options']
): RolloverClauseNode => ({
  type: 'RolloverClause',
  rolloverType,
  options
});

export const createUtilizationClause = (
  utilizationType: UtilizationClauseNode['utilizationType'],
  threshold?: UtilizationClauseNode['threshold']
): UtilizationClauseNode => ({
  type: 'UtilizationClause',
  utilizationType,
  threshold
});

export const createContractClause = (
  contractType: ContractClauseNode['contractType'],
  options?: ContractClauseNode['options']
): ContractClauseNode => ({
  type: 'ContractClause',
  contractType,
  options
});

export const createValueClause = (
  valueType: ValueClauseNode['valueType'],
  options?: ValueClauseNode['options']
): ValueClauseNode => ({
  type: 'ValueClause',
  valueType,
  options
});

export const createAlertClause = (
  alertType: AlertClauseNode['alertType'],
  threshold: number
): AlertClauseNode => ({
  type: 'AlertClause',
  alertType,
  threshold
});

export const createForecastClause = (
  forecastType: ForecastClauseNode['forecastType'],
  horizon?: ForecastClauseNode['horizon']
): ForecastClauseNode => ({
  type: 'ForecastClause',
  forecastType,
  horizon
});

export const createPercentageLiteral = (value: number): PercentageLiteralNode => ({
  type: 'Literal',
  value,
  dataType: 'percentage'
});

export const createRelativeDate = (value: RelativeDateNode['value']): RelativeDateNode => ({
  type: 'Literal',
  value,
  dataType: 'relative_date'
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
    case 'RetainerClause': {
      const retainerClause = node as RetainerClauseNode;
      if (retainerClause.options) {
        Object.values(retainerClause.options).forEach(value => {
          if (typeof value === 'object' && value !== null && (value as any).type) {
            walkAST(value as ASTNode, visitor);
          }
        });
      }
      break;
    }
    case 'ServiceClause':
    case 'AlertClause':
    case 'ForecastClause':
      // These clauses have primitive options only
      break;
    case 'RolloverClause':
    case 'UtilizationClause':
    case 'ContractClause':
    case 'ValueClause': {
      const clause = node as any;
      if (clause.options) {
        Object.values(clause.options).forEach(value => {
          if (typeof value === 'object' && value !== null && (value as any).type) {
            walkAST(value as ASTNode, visitor);
          }
        });
      }
      if (clause.threshold && typeof clause.threshold === 'object') {
        // Threshold objects are not ASTNodes, they're plain objects
      }
      break;
    }
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
