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
  ASTVisitor
} from './ast';

export interface TimesheetQuery {
  where?: {
    year?: number;
    month?: number;
    project?: string;
    dateRange?: { start: string; end: string };
  };
  show?: string[];
  view?: 'summary' | 'chart' | 'table' | 'full';
  chartType?: 'trend' | 'monthly' | 'budget';
  period?: 'current-year' | 'all-time' | 'last-6-months' | 'last-12-months';
  size?: 'compact' | 'normal' | 'detailed';
}

export class QueryInterpreter implements ASTVisitor<any> {
  private query: TimesheetQuery = {};

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
    this.query.show = node.fields.map(field => field.name);
    return this.query.show;
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

  private processWhereCondition(condition: BinaryExpressionNode): void {
    if (!this.query.where) {
      this.query.where = {};
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
}

export class InterpreterError extends Error {
  constructor(message: string, public node?: any) {
    super(message);
    this.name = 'InterpreterError';
  }
}
