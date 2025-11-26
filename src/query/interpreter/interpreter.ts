// Query interpreter for executing parsed AST

import {
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
  ListNode,
  DateRangeNode,
  ASTVisitor,
  RetainerClauseNode,
  ServiceClauseNode,
  RolloverClauseNode,
  UtilizationClauseNode,
  ContractClauseNode,
  ValueClauseNode,
  AlertClauseNode,
  ForecastClauseNode,

} from '../ast';
import { columnMapper } from '../column-mapper';
import { TableColumn } from '../../tables/base/TableConfig';
import { QueryParser } from '../parser';

export interface TimesheetQuery {
  where?: {
    year?: number;
    month?: number;
    project?: string;
    dateRange?: { start: string; end: string };
    service?: string;
    category?: string;
    utilization?: number;
    rollover?: number;
    value?: number;
    priority?: string;
  };
  show?: string[];
  columns?: TableColumn[];
  view?: 'summary' | 'chart' | 'table' | 'full' | 'retainer' | 'health' | 'rollover' | 'services' | 'contract' | 'performance' | 'renewal';
  chartType?: 'trend' | 'monthly' | 'budget' | 'service_mix' | 'rollover_trend' | 'health_score' | 'value_delivery' | 'response_time' | 'satisfaction' | 'forecast' | 'burn_rate';
  period?: 'current-year' | 'all-time' | 'last-6-months' | 'last-12-months' | 'next-month' | 'next-quarter' | 'contract-term';
  size?: 'compact' | 'normal' | 'detailed';
  // Retainer-specific query results
  retainer?: {
    type?: 'health' | 'status' | 'forecast' | 'analysis' | 'performance' | 'optimization';
    options?: any;
  };
  service?: {
    categories?: string[];
    options?: any;
  };
  rollover?: {
    type?: 'status' | 'available' | 'expiring' | 'history' | 'forecast';
    options?: any;
  };
  utilization?: {
    type?: 'current' | 'target' | 'average' | 'trend' | 'efficiency';
    threshold?: any;
  };
  contract?: {
    type?: 'status' | 'renewal' | 'performance' | 'health' | 'terms';
    options?: any;
  };
  value?: {
    type?: 'delivered' | 'projected' | 'impact' | 'roi' | 'efficiency';
    options?: any;
  };
  alerts?: Array<{
    type: string;
    threshold: number;
  }>;
  forecasts?: Array<{
    type: string;
    horizon?: string;
  }>;
}

export class QueryInterpreter {
  private query: TimesheetQuery = {};
  private parser: QueryParser = new QueryParser();

  /**
   * Parse and interpret a query string
   */
  parseAndInterpret(queryString: string): TimesheetQuery {
    const ast = this.parser.parse(queryString);
    return this.interpret(ast);
  }

  interpret(ast: QueryNode): TimesheetQuery {
    this.query = {};
    this.visitQuery(ast);

    // Set defaults
    this.query.view = this.query.view || 'summary';
    this.query.period = this.query.period || 'current-year';
    this.query.size = this.query.size || 'normal';

    return this.query;
  }

  visitQuery(node: QueryNode): any {
    for (const clause of node.clauses) {
      this.visitClause(clause);
    }
    return this.query;
  }

  private visitClause(node: ClauseNode): any {
    switch (node.type) {
      case 'WhereClause':
        return this.visitWhereClause(node);
      case 'ShowClause':
        return this.visitShowClause(node);
      case 'ViewClause':
        return this.visitViewClause(node);
      case 'ChartClause':
        return this.visitChartClause(node);
      case 'PeriodClause':
        return this.visitPeriodClause(node);
      case 'SizeClause':
        return this.visitSizeClause(node);
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
        throw new Error(`Unknown clause type: ${(node as any).type}`);
    }
  }

  visitWhereClause(node: WhereClauseNode): any {
    this.query.where = {};

    for (const condition of node.conditions) {
      this.processWhereCondition(condition);
    }

    return this.query.where;
  }

  visitShowClause(node: ShowClauseNode): any {
    this.query.show = node.fields.map(field => {
      if (field.type === 'Identifier') {
        return field.name;
      } else if (field.type === 'EnhancedField') {
        return this.extractFieldName(field.expression);
      }
      return 'unknown';
    });

    // Generate table columns from the SHOW clause
    try {
      this.query.columns = columnMapper.mapShowClauseToColumns(node);
    } catch (error) {
      console.warn('Error mapping SHOW clause to columns:', error);
      // Fallback to default columns if mapping fails
      this.query.columns = undefined;
    }

    return this.query.show;
  }

  private extractFieldName(expression: any): string {
    if (expression.type === 'Identifier') {
      return expression.name;
    }
    if (expression.type === 'CalculatedField') {
      return this.extractFieldName(expression.left);
    }
    if (expression.type === 'AggregationFunction') {
      return `${expression.function}_${expression.field.name}`;
    }
    return 'unknown';
  }

  visitViewClause(node: ViewClauseNode): any {
    this.query.view = node.viewType;
    return this.query.view;
  }

  visitChartClause(node: ChartClauseNode): any {
    this.query.chartType = node.chartType;
    return this.query.chartType;
  }

  visitPeriodClause(node: PeriodClauseNode): any {
    this.query.period = node.period;
    return this.query.period;
  }

  visitSizeClause(node: SizeClauseNode): any {
    this.query.size = node.size;
    return this.query.size;
  }

  visitBinaryExpression(node: BinaryExpressionNode): any {
    const left = this.visitExpression(node.left);
    const right = Array.isArray(node.right)
      ? node.right.map(expr => this.visitExpression(expr))
      : this.visitExpression(node.right as ExpressionNode);

    return {
      left,
      operator: node.operator,
      right
    };
  }

  visitLiteral(node: LiteralNode): any {
    return node.value;
  }

  visitIdentifier(node: IdentifierNode): any {
    return node.name;
  }

  visitList(node: ListNode): any {
    return node.items.map(item => this.visitExpression(item));
  }

  visitEnhancedField(node: any): any {
    return node;
  }

  visitOrderByClause(node: any): any {
    return node;
  }

  visitGroupByClause(node: any): any {
    return node;
  }

  visitHavingClause(node: any): any {
    return node;
  }

  visitLimitClause(node: any): any {
    return node;
  }

  visitInExpression(node: any): any {
    return node;
  }

  visitNotInExpression(node: any): any {
    return node;
  }

  visitLikeExpression(node: any): any {
    return node;
  }

  visitIsNullExpression(node: any): any {
    return node;
  }

  visitCalculatedField(node: any): any {
    return node;
  }

  visitAggregationFunction(node: any): any {
    return node;
  }

  visitDateRange(node: DateRangeNode): any {
    return {
      start: this.visitLiteral(node.start),
      end: this.visitLiteral(node.end)
    };
  }

  private visitExpression(node: ExpressionNode): string | number | boolean | string[] | { start: string; end: string } {
    switch (node.type) {
      case 'Literal':
        return this.visitLiteral(node);
      case 'Identifier':
        return this.visitIdentifier(node);
      case 'List':
        return this.visitList(node);
      case 'DateRange':
        return this.visitDateRange(node);
      default:
        throw new Error(`Unknown expression type: ${(node as ExpressionNode).type}`);
    }
  }

  private processWhereCondition(condition: any): void {
    if (!this.query.where) {
      this.query.where = {};
    }

    // Handle different condition types
    if (condition.type !== 'BinaryExpression') {
      // Skip non-binary expressions for now
      return;
    }

    const result = this.visitBinaryExpression(condition);
    const fieldName = result.left;
    const operator = result.operator;
    const value = result.right;

    switch (fieldName.toLowerCase()) {
      case 'year':
        // Handle both number and string representations
        const yearValue = typeof value === 'number' ? value : parseFloat(value);
        if (!isNaN(yearValue) && ['=', '!=', '>', '<', '>=', '<='].includes(operator)) {
          // For simplicity, all numeric comparisons are treated as equality for now
          this.query.where.year = yearValue;
        } else if (value === undefined || value === null) {
          // Handle malformed conditions gracefully
          console.warn(`Malformed year condition: ${operator} ${value}`);
        } else {
          throw new Error(`Invalid year condition: ${operator} ${value}`);
        }
        break;

      case 'month':
        // Handle both number and string representations
        const monthValue = typeof value === 'number' ? value : parseFloat(value);
        if (!isNaN(monthValue) && ['=', '!=', '>', '<', '>=', '<='].includes(operator)) {
          // For simplicity, all numeric comparisons are treated as equality for now
          this.query.where.month = monthValue;
        } else if (value === undefined || value === null) {
          // Handle malformed conditions gracefully
          console.warn(`Malformed month condition: ${operator} ${value}`);
        } else {
          throw new Error(`Invalid month condition: ${operator} ${value}`);
        }
        break;

      case 'project':
        if (operator === '=' && typeof value === 'string') {
          this.query.where.project = value;
        } else {
          throw new Error(`Invalid project condition: ${operator} ${value}`);
        }
        break;

      case 'date':
        if (operator === 'BETWEEN' && value && typeof value === 'object' && 'start' in value && 'end' in value) {
          this.query.where.dateRange = {
            start: value.start as string,
            end: value.end as string
          };
        } else {
          throw new Error(`Invalid date condition: ${operator} ${JSON.stringify(value)}`);
        }
        break;

      default:
        // Be lenient with unknown fields - just ignore them
        console.warn(`Unknown field in WHERE clause: ${fieldName}`);
    }
  }

  // Retainer-specific visitor methods
  visitRetainerClause(node: RetainerClauseNode): any {
    this.query.retainer = {
      type: node.retainerType,
      options: node.options
    };
    return this.query.retainer;
  }

  visitServiceClause(node: ServiceClauseNode): any {
    this.query.service = {
      categories: node.categories,
      options: node.options
    };
    return this.query.service;
  }

  visitRolloverClause(node: RolloverClauseNode): any {
    this.query.rollover = {
      type: node.rolloverType,
      options: node.options
    };
    return this.query.rollover;
  }

  visitUtilizationClause(node: UtilizationClauseNode): any {
    this.query.utilization = {
      type: node.utilizationType,
      threshold: node.threshold
    };
    return this.query.utilization;
  }

  visitContractClause(node: ContractClauseNode): any {
    this.query.contract = {
      type: node.contractType,
      options: node.options
    };
    return this.query.contract;
  }

  visitValueClause(node: ValueClauseNode): any {
    this.query.value = {
      type: node.valueType,
      options: node.options
    };
    return this.query.value;
  }

  visitAlertClause(node: AlertClauseNode): any {
    if (!this.query.alerts) {
      this.query.alerts = [];
    }
    this.query.alerts.push({
      type: node.alertType,
      threshold: node.threshold
    });
    return this.query.alerts;
  }

  visitForecastClause(node: ForecastClauseNode): any {
    if (!this.query.forecasts) {
      this.query.forecasts = [];
    }
    this.query.forecasts.push({
      type: node.forecastType,
      horizon: node.horizon
    });
    return this.query.forecasts;
  }
}

export class InterpreterError extends Error {
  constructor(message: string, public node?: any) {
    super(message);
    this.name = 'InterpreterError';
  }
}
