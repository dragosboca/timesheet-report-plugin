// Extended AST node definitions for retainer-specific query language features
// This extends the base AST with sophisticated retainer management capabilities

import { ASTNode, ClauseNode, ExpressionNode, LiteralNode, IdentifierNode } from './ast';

// ===== RETAINER-SPECIFIC AST NODE INTERFACES =====

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

// ===== EXTENDED EXPRESSION NODES =====

export interface PercentageLiteralNode extends ASTNode {
  type: 'Literal';
  value: number;
  dataType: 'percentage';
}

export interface RelativeDateNode extends ASTNode {
  type: 'Literal';
  value: 'today' | 'yesterday' | 'last_month';
  dataType: 'relative_date';
}

export interface ServiceCategoryNode extends ASTNode {
  type: 'ServiceCategory';
  category: 'development' | 'support' | 'consulting' | 'strategy' | 'training' | 'maintenance' | 'emergency' | 'general';
}

export interface UtilizationThresholdNode extends ASTNode {
  type: 'UtilizationThreshold';
  thresholdType: 'above' | 'below' | 'between';
  value?: number;
  min?: number;
  max?: number;
}

export interface RolloverOptionsNode extends ASTNode {
  type: 'RolloverOptions';
  period?: string;
  expiringDays?: number;
}

// ===== EXTENDED UNION TYPES =====

export type RetainerClauseNode_Extended =
  | RetainerClauseNode
  | ServiceClauseNode
  | RolloverClauseNode
  | UtilizationClauseNode
  | ContractClauseNode
  | ValueClauseNode
  | AlertClauseNode
  | ForecastClauseNode;

export type RetainerExpressionNode =
  | ExpressionNode
  | PercentageLiteralNode
  | RelativeDateNode
  | ServiceCategoryNode
  | UtilizationThresholdNode
  | RolloverOptionsNode;

export type ExtendedClauseNode =
  | ClauseNode
  | RetainerClauseNode_Extended;

// ===== ENHANCED QUERY NODE =====

export interface ExtendedQueryNode extends ASTNode {
  type: 'Query';
  clauses: ExtendedClauseNode[];
}

// ===== RETAINER-SPECIFIC FIELD IDENTIFIERS =====

export type RetainerFieldIdentifier =
  | 'service'
  | 'category'
  | 'utilization'
  | 'usage'
  | 'rollover'
  | 'banked'
  | 'remaining'
  | 'available'
  | 'allocated'
  | 'burned'
  | 'efficiency'
  | 'response_time'
  | 'satisfaction'
  | 'value'
  | 'impact'
  | 'priority';

export type RetainerShowField =
  | 'service_mix'
  | 'rollover'
  | 'banked'
  | 'allocated'
  | 'burned'
  | 'efficiency'
  | 'response_time'
  | 'satisfaction'
  | 'value_delivered'
  | 'health_score'
  | 'forecast';

export type RetainerViewType =
  | 'retainer'
  | 'health'
  | 'rollover'
  | 'services'
  | 'contract'
  | 'performance'
  | 'renewal';

export type RetainerChartType =
  | 'utilization'
  | 'service_mix'
  | 'rollover_trend'
  | 'health_score'
  | 'value_delivery'
  | 'response_time'
  | 'satisfaction'
  | 'forecast'
  | 'burn_rate';

// ===== FACTORY FUNCTIONS FOR RETAINER NODES =====

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

export const createServiceCategory = (category: ServiceCategoryNode['category']): ServiceCategoryNode => ({
  type: 'ServiceCategory',
  category
});

// ===== EXTENDED VISITOR PATTERN =====

export interface RetainerASTVisitor<T> {
  // Original visitor methods
  visitQuery(node: ExtendedQueryNode): T;
  visitWhereClause(node: any): T;
  visitShowClause(node: any): T;
  visitViewClause(node: any): T;
  visitChartClause(node: any): T;
  visitPeriodClause(node: any): T;
  visitSizeClause(node: any): T;
  visitBinaryExpression(node: any): T;
  visitLiteral(node: LiteralNode): T;
  visitIdentifier(node: IdentifierNode): T;
  visitList(node: any): T;
  visitDateRange(node: any): T;

  // New retainer-specific visitor methods
  visitRetainerClause(node: RetainerClauseNode): T;
  visitServiceClause(node: ServiceClauseNode): T;
  visitRolloverClause(node: RolloverClauseNode): T;
  visitUtilizationClause(node: UtilizationClauseNode): T;
  visitContractClause(node: ContractClauseNode): T;
  visitValueClause(node: ValueClauseNode): T;
  visitAlertClause(node: AlertClauseNode): T;
  visitForecastClause(node: ForecastClauseNode): T;
  visitServiceCategory(node: ServiceCategoryNode): T;
  visitPercentageLiteral(node: PercentageLiteralNode): T;
  visitRelativeDate(node: RelativeDateNode): T;
}

// ===== ENHANCED UTILITY FUNCTIONS =====

export function walkRetainerAST(node: ASTNode, visitor: (node: ASTNode) => void): void {
  visitor(node);

  switch (node.type) {
    case 'Query': {
      const query = node as ExtendedQueryNode;
      if (Array.isArray(query.clauses)) {
        query.clauses.forEach(clause => walkRetainerAST(clause, visitor));
      }
      break;
    }
    case 'RetainerClause': {
      const retainerClause = node as RetainerClauseNode;
      if (retainerClause.options) {
        Object.values(retainerClause.options).forEach(value => {
          if (typeof value === 'object' && value !== null) {
            walkRetainerAST(value as ASTNode, visitor);
          }
        });
      }
      break;
    }
    case 'ServiceClause': {
      const serviceClause = node as ServiceClauseNode;
      // Service categories are primitive strings, no recursion needed
      break;
    }
    case 'RolloverClause':
    case 'UtilizationClause':
    case 'ContractClause':
    case 'ValueClause':
    case 'AlertClause':
    case 'ForecastClause': {
      // These clauses may contain nested options that need traversal
      const clause = node as any;
      if (clause.options) {
        Object.values(clause.options).forEach(value => {
          if (typeof value === 'object' && value !== null) {
            walkRetainerAST(value as ASTNode, visitor);
          }
        });
      }
      if (clause.threshold && typeof clause.threshold === 'object') {
        walkRetainerAST(clause.threshold as ASTNode, visitor);
      }
      break;
    }
    // Fall back to original walkAST for standard nodes
    default: {
      // Import and use the original walkAST function
      // This would require importing from './ast'
      break;
    }
  }
}

export function findRetainerNodesByType<T extends ASTNode>(
  node: ASTNode,
  nodeType: string
): T[] {
  const results: T[] = [];

  walkRetainerAST(node, (currentNode) => {
    if (currentNode.type === nodeType) {
      results.push(currentNode as T);
    }
  });

  return results;
}

export function validateRetainerAST(node: ASTNode): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  walkRetainerAST(node, (currentNode) => {
    if (!currentNode.type) {
      errors.push('Node missing type property');
    }

    // Type-specific validation for retainer nodes
    switch (currentNode.type) {
      case 'RetainerClause': {
        const retainer = currentNode as RetainerClauseNode;
        const validTypes = ['health', 'status', 'forecast', 'analysis', 'performance', 'optimization'];
        if (!validTypes.includes(retainer.retainerType)) {
          errors.push(`Invalid retainer type: ${retainer.retainerType}`);
        }
        break;
      }
      case 'ServiceClause': {
        const service = currentNode as ServiceClauseNode;
        if (!Array.isArray(service.categories) || service.categories.length === 0) {
          errors.push('Service clause must have at least one category');
        }
        break;
      }
      case 'UtilizationClause': {
        const utilization = currentNode as UtilizationClauseNode;
        const validTypes = ['current', 'target', 'average', 'trend', 'efficiency'];
        if (!validTypes.includes(utilization.utilizationType)) {
          errors.push(`Invalid utilization type: ${utilization.utilizationType}`);
        }
        if (utilization.threshold) {
          if (utilization.threshold.type === 'between') {
            if (!utilization.threshold.min || !utilization.threshold.max) {
              errors.push('Between threshold requires both min and max values');
            }
            if (utilization.threshold.min && utilization.threshold.max &&
              utilization.threshold.min >= utilization.threshold.max) {
              errors.push('Threshold min must be less than max');
            }
          }
        }
        break;
      }
      case 'AlertClause': {
        const alert = currentNode as AlertClauseNode;
        if (typeof alert.threshold !== 'number' || alert.threshold < 0 || alert.threshold > 100) {
          errors.push('Alert threshold must be a number between 0 and 100');
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

// ===== RETAINER QUERY ANALYSIS UTILITIES =====

export function getRetainerQueryComplexity(node: ExtendedQueryNode): {
  retainerClauses: number;
  standardClauses: number;
  totalComplexity: number;
} {
  let retainerClauses = 0;
  let standardClauses = 0;

  walkRetainerAST(node, (currentNode) => {
    switch (currentNode.type) {
      case 'RetainerClause':
      case 'ServiceClause':
      case 'RolloverClause':
      case 'UtilizationClause':
      case 'ContractClause':
      case 'ValueClause':
      case 'AlertClause':
      case 'ForecastClause':
        retainerClauses++;
        break;
      case 'WhereClause':
      case 'ShowClause':
      case 'ViewClause':
      case 'ChartClause':
      case 'PeriodClause':
      case 'SizeClause':
        standardClauses++;
        break;
    }
  });

  return {
    retainerClauses,
    standardClauses,
    totalComplexity: retainerClauses * 2 + standardClauses // Retainer clauses are more complex
  };
}

export function extractRetainerMetrics(node: ExtendedQueryNode): string[] {
  const metrics: string[] = [];

  walkRetainerAST(node, (currentNode) => {
    switch (currentNode.type) {
      case 'RetainerClause':
        metrics.push('retainer_health', 'retainer_analysis');
        break;
      case 'ServiceClause':
        metrics.push('service_mix', 'service_efficiency');
        break;
      case 'RolloverClause':
        metrics.push('rollover_status', 'rollover_forecast');
        break;
      case 'UtilizationClause':
        metrics.push('utilization_rate', 'utilization_trend');
        break;
      case 'ValueClause':
        metrics.push('value_delivered', 'roi_analysis');
        break;
      case 'ForecastClause':
        metrics.push('predictive_analysis', 'trend_forecasting');
        break;
    }
  });

  return [...new Set(metrics)]; // Remove duplicates
}
