// AST Visitor Pattern Implementation
// Provides a structured way to traverse and transform AST nodes

import {
  ASTNode,
  QueryNode,
  WhereClauseNode,
  ShowClauseNode,
  ViewClauseNode,
  ChartClauseNode,
  PeriodClauseNode,
  SizeClauseNode,
  BinaryExpressionNode,
  CalculatedFieldNode,
  AggregationFunctionNode,
  InExpressionNode,
  NotInExpressionNode,
  LikeExpressionNode,
  IsNullExpressionNode,
  LiteralNode,
  IdentifierNode,
  ListNode,
  DateRangeNode,
  EnhancedFieldNode,
  OrderByClauseNode,
  GroupByClauseNode,
  HavingClauseNode,
  LimitClauseNode,
  RetainerClauseNode,
  ServiceClauseNode,
  RolloverClauseNode,
  UtilizationClauseNode,
  ContractClauseNode,
  ValueClauseNode,
  AlertClauseNode,
  ForecastClauseNode
} from './nodes';

// ============================================================================
// VISITOR INTERFACE
// ============================================================================

export interface ASTVisitor<T> {
  // Root
  visitQuery(node: QueryNode): T;

  // Basic Clauses
  visitWhereClause(node: WhereClauseNode): T;
  visitShowClause(node: ShowClauseNode): T;
  visitViewClause(node: ViewClauseNode): T;
  visitChartClause(node: ChartClauseNode): T;
  visitPeriodClause(node: PeriodClauseNode): T;
  visitSizeClause(node: SizeClauseNode): T;

  // Enhanced Clauses
  visitEnhancedField(node: EnhancedFieldNode): T;
  visitOrderByClause(node: OrderByClauseNode): T;
  visitGroupByClause(node: GroupByClauseNode): T;
  visitHavingClause(node: HavingClauseNode): T;
  visitLimitClause(node: LimitClauseNode): T;

  // Expressions
  visitBinaryExpression(node: BinaryExpressionNode): T;
  visitCalculatedField(node: CalculatedFieldNode): T;
  visitAggregationFunction(node: AggregationFunctionNode): T;
  visitInExpression(node: InExpressionNode): T;
  visitNotInExpression(node: NotInExpressionNode): T;
  visitLikeExpression(node: LikeExpressionNode): T;
  visitIsNullExpression(node: IsNullExpressionNode): T;

  // Primitives
  visitLiteral(node: LiteralNode): T;
  visitIdentifier(node: IdentifierNode): T;
  visitList(node: ListNode): T;
  visitDateRange(node: DateRangeNode): T;

  // Retainer Clauses
  visitRetainerClause(node: RetainerClauseNode): T;
  visitServiceClause(node: ServiceClauseNode): T;
  visitRolloverClause(node: RolloverClauseNode): T;
  visitUtilizationClause(node: UtilizationClauseNode): T;
  visitContractClause(node: ContractClauseNode): T;
  visitValueClause(node: ValueClauseNode): T;
  visitAlertClause(node: AlertClauseNode): T;
  visitForecastClause(node: ForecastClauseNode): T;
}

// ============================================================================
// BASE VISITOR CLASS
// ============================================================================

export abstract class BaseASTVisitor<T> implements ASTVisitor<T> {
  visit(node: ASTNode): T {
    switch (node.type) {
      case 'Query':
        return this.visitQuery(node as QueryNode);
      case 'WhereClause':
        return this.visitWhereClause(node as WhereClauseNode);
      case 'ShowClause':
        return this.visitShowClause(node as ShowClauseNode);
      case 'ViewClause':
        return this.visitViewClause(node as ViewClauseNode);
      case 'ChartClause':
        return this.visitChartClause(node as ChartClauseNode);
      case 'PeriodClause':
        return this.visitPeriodClause(node as PeriodClauseNode);
      case 'SizeClause':
        return this.visitSizeClause(node as SizeClauseNode);
      case 'EnhancedField':
        return this.visitEnhancedField(node as EnhancedFieldNode);
      case 'OrderByClause':
        return this.visitOrderByClause(node as OrderByClauseNode);
      case 'GroupByClause':
        return this.visitGroupByClause(node as GroupByClauseNode);
      case 'HavingClause':
        return this.visitHavingClause(node as HavingClauseNode);
      case 'LimitClause':
        return this.visitLimitClause(node as LimitClauseNode);
      case 'BinaryExpression':
        return this.visitBinaryExpression(node as BinaryExpressionNode);
      case 'CalculatedField':
        return this.visitCalculatedField(node as CalculatedFieldNode);
      case 'AggregationFunction':
        return this.visitAggregationFunction(node as AggregationFunctionNode);
      case 'InExpression':
        return this.visitInExpression(node as InExpressionNode);
      case 'NotInExpression':
        return this.visitNotInExpression(node as NotInExpressionNode);
      case 'LikeExpression':
        return this.visitLikeExpression(node as LikeExpressionNode);
      case 'IsNullExpression':
        return this.visitIsNullExpression(node as IsNullExpressionNode);
      case 'Literal':
        return this.visitLiteral(node as LiteralNode);
      case 'Identifier':
        return this.visitIdentifier(node as IdentifierNode);
      case 'List':
        return this.visitList(node as ListNode);
      case 'DateRange':
        return this.visitDateRange(node as DateRangeNode);
      case 'RetainerClause':
        return this.visitRetainerClause(node as RetainerClauseNode);
      case 'ServiceClause':
        return this.visitServiceClause(node as ServiceClauseNode);
      case 'RolloverClause':
        return this.visitRolloverClause(node as RolloverClauseNode);
      case 'UtilizationClause':
        return this.visitUtilizationClause(node as UtilizationClauseNode);
      case 'ContractClause':
        return this.visitContractClause(node as ContractClauseNode);
      case 'ValueClause':
        return this.visitValueClause(node as ValueClauseNode);
      case 'AlertClause':
        return this.visitAlertClause(node as AlertClauseNode);
      case 'ForecastClause':
        return this.visitForecastClause(node as ForecastClauseNode);
      default:
        // Handle unknown node types gracefully - return undefined
        return undefined as any;
    }
  }

  abstract visitQuery(node: QueryNode): T;
  abstract visitWhereClause(node: WhereClauseNode): T;
  abstract visitShowClause(node: ShowClauseNode): T;
  abstract visitViewClause(node: ViewClauseNode): T;
  abstract visitChartClause(node: ChartClauseNode): T;
  abstract visitPeriodClause(node: PeriodClauseNode): T;
  abstract visitSizeClause(node: SizeClauseNode): T;
  abstract visitEnhancedField(node: EnhancedFieldNode): T;
  abstract visitOrderByClause(node: OrderByClauseNode): T;
  abstract visitGroupByClause(node: GroupByClauseNode): T;
  abstract visitHavingClause(node: HavingClauseNode): T;
  abstract visitLimitClause(node: LimitClauseNode): T;
  abstract visitBinaryExpression(node: BinaryExpressionNode): T;
  abstract visitCalculatedField(node: CalculatedFieldNode): T;
  abstract visitAggregationFunction(node: AggregationFunctionNode): T;
  abstract visitInExpression(node: InExpressionNode): T;
  abstract visitNotInExpression(node: NotInExpressionNode): T;
  abstract visitLikeExpression(node: LikeExpressionNode): T;
  abstract visitIsNullExpression(node: IsNullExpressionNode): T;
  abstract visitLiteral(node: LiteralNode): T;
  abstract visitIdentifier(node: IdentifierNode): T;
  abstract visitList(node: ListNode): T;
  abstract visitDateRange(node: DateRangeNode): T;
  abstract visitRetainerClause(node: RetainerClauseNode): T;
  abstract visitServiceClause(node: ServiceClauseNode): T;
  abstract visitRolloverClause(node: RolloverClauseNode): T;
  abstract visitUtilizationClause(node: UtilizationClauseNode): T;
  abstract visitContractClause(node: ContractClauseNode): T;
  abstract visitValueClause(node: ValueClauseNode): T;
  abstract visitAlertClause(node: AlertClauseNode): T;
  abstract visitForecastClause(node: ForecastClauseNode): T;
}

// ============================================================================
// TRAVERSAL VISITOR
// ============================================================================

export class TraversalVisitor extends BaseASTVisitor<void> {
  constructor(private callback: (node: ASTNode) => void) {
    super();
  }

  visit(node: ASTNode): void {
    // Always call callback first, even for unknown types
    this.callback(node);
    // Then call parent's visit to traverse known types
    super.visit(node);
  }

  visitQuery(node: QueryNode): void {
    node.clauses.forEach(clause => this.visit(clause));
  }

  visitWhereClause(node: WhereClauseNode): void {
    node.conditions.forEach(condition => this.visit(condition));
  }

  visitShowClause(node: ShowClauseNode): void {
    node.fields.forEach(field => this.visit(field));
  }

  visitViewClause(node: ViewClauseNode): void {
    // Leaf node
  }

  visitChartClause(node: ChartClauseNode): void {
    // Leaf node
  }

  visitPeriodClause(node: PeriodClauseNode): void {
    // Leaf node
  }

  visitSizeClause(node: SizeClauseNode): void {
    // Leaf node
  }

  visitEnhancedField(node: EnhancedFieldNode): void {
    this.visit(node.expression);
  }

  visitOrderByClause(node: OrderByClauseNode): void {
    node.fields.forEach(field => this.visit(field.field));
  }

  visitGroupByClause(node: GroupByClauseNode): void {
    node.fields.forEach(field => this.visit(field));
  }

  visitHavingClause(node: HavingClauseNode): void {
    node.conditions.forEach(condition => this.visit(condition));
  }

  visitLimitClause(node: LimitClauseNode): void {
    // Leaf node
  }

  visitBinaryExpression(node: BinaryExpressionNode): void {
    this.visit(node.left);
    if (Array.isArray(node.right)) {
      node.right.forEach(r => this.visit(r));
    } else {
      this.visit(node.right);
    }
  }

  visitCalculatedField(node: CalculatedFieldNode): void {
    this.visit(node.left);
    this.visit(node.right);
  }

  visitAggregationFunction(node: AggregationFunctionNode): void {
    this.visit(node.field);
  }

  visitInExpression(node: InExpressionNode): void {
    this.visit(node.field);
    node.values.forEach(value => this.visit(value));
  }

  visitNotInExpression(node: NotInExpressionNode): void {
    this.visit(node.field);
    node.values.forEach(value => this.visit(value));
  }

  visitLikeExpression(node: LikeExpressionNode): void {
    this.visit(node.field);
    this.visit(node.pattern);
  }

  visitIsNullExpression(node: IsNullExpressionNode): void {
    this.visit(node.field);
  }

  visitLiteral(node: LiteralNode): void {
    // Leaf node
  }

  visitIdentifier(node: IdentifierNode): void {
    // Leaf node
  }

  visitList(node: ListNode): void {
    node.items.forEach(item => this.visit(item));
  }

  visitDateRange(node: DateRangeNode): void {
    this.visit(node.start);
    this.visit(node.end);
  }

  visitRetainerClause(node: RetainerClauseNode): void {
    // Leaf node
  }

  visitServiceClause(node: ServiceClauseNode): void {
    // Leaf node
  }

  visitRolloverClause(node: RolloverClauseNode): void {
    // Leaf node
  }

  visitUtilizationClause(node: UtilizationClauseNode): void {
    // Leaf node
  }

  visitContractClause(node: ContractClauseNode): void {
    // Leaf node
  }

  visitValueClause(node: ValueClauseNode): void {
    // Leaf node
  }

  visitAlertClause(node: AlertClauseNode): void {
    // Leaf node
  }

  visitForecastClause(node: ForecastClauseNode): void {
    // Leaf node
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Walk through the entire AST and call the callback for each node
 */
export function walkAST(node: ASTNode, callback: (node: ASTNode) => void): void {
  const visitor = new TraversalVisitor(callback);
  visitor.visit(node);
}

/**
 * Find all nodes of a specific type in the AST
 */
export function findNodesByType<T extends ASTNode>(
  node: ASTNode,
  nodeType: string
): T[] {
  const results: T[] = [];
  walkAST(node, (currentNode) => {
    if (currentNode.type === nodeType) {
      results.push(currentNode as T);
    }
  });
  return results;
}

/**
 * Find the first node that matches a predicate
 */
export function findNode<T extends ASTNode>(
  node: ASTNode,
  predicate: (node: ASTNode) => boolean
): T | null {
  let result: T | null = null;
  try {
    walkAST(node, (currentNode) => {
      if (predicate(currentNode)) {
        result = currentNode as T;
        throw new Error('Found'); // Break out of traversal
      }
    });
  } catch (e) {
    if ((e as Error).message !== 'Found') throw e;
  }
  return result;
}

/**
 * Check if the AST contains a node of a specific type
 */
export function hasNodeType(node: ASTNode, nodeType: string): boolean {
  return findNodesByType(node, nodeType).length > 0;
}

/**
 * Transform the AST by applying a transformation function to each node
 */
export function transformAST<T extends ASTNode>(
  node: T,
  transformer: (node: ASTNode) => ASTNode
): T {
  const transformed = transformer(node);

  // Recursively transform children based on node type
  switch (transformed.type) {
    case 'Query': {
      const query = transformed as QueryNode;
      return {
        ...query,
        clauses: query.clauses.map(c => transformAST(c, transformer))
      } as unknown as T;
    }
    case 'WhereClause': {
      const where = transformed as WhereClauseNode;
      return {
        ...where,
        conditions: where.conditions.map(c => transformAST(c, transformer))
      } as unknown as T;
    }
    case 'ShowClause': {
      const show = transformed as ShowClauseNode;
      return {
        ...show,
        fields: show.fields.map(f => transformAST(f, transformer))
      } as unknown as T;
    }
    case 'BinaryExpression': {
      const binary = transformed as BinaryExpressionNode;
      return {
        ...binary,
        left: transformAST(binary.left, transformer),
        right: Array.isArray(binary.right)
          ? binary.right.map(r => transformAST(r, transformer))
          : transformAST(binary.right, transformer)
      } as unknown as T;
    }
    case 'CalculatedField': {
      const calc = transformed as CalculatedFieldNode;
      return {
        ...calc,
        left: transformAST(calc.left, transformer),
        right: transformAST(calc.right, transformer)
      } as unknown as T;
    }
    case 'List': {
      const list = transformed as ListNode;
      return {
        ...list,
        items: list.items.map(i => transformAST(i, transformer))
      } as unknown as T;
    }
    case 'DateRange': {
      const range = transformed as DateRangeNode;
      return {
        ...range,
        start: transformAST(range.start, transformer),
        end: transformAST(range.end, transformer)
      } as unknown as T;
    }
    default:
      return transformed as T;
  }
}
