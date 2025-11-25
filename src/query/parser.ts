// Parser for the timesheet query language

import {
  Token,
  TokenType,
  Tokenizer
} from './tokenizer';

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
  createQuery,
  createWhereClause,
  createShowClause,
  createViewClause,
  createChartClause,
  createPeriodClause,
  createSizeClause,
  createBinaryExpression,
  createLiteral,
  createIdentifier,
  createList,
  createDateRange
} from './ast';

export class ParseError extends Error {
  constructor(
    message: string,
    public token: Token,
    public expected?: string
  ) {
    super(`Parse error at line ${token.line}, column ${token.column}: ${message}`);
    this.name = 'ParseError';
  }
}

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(input: string) {
    const tokenizer = new Tokenizer(input);
    this.tokens = tokenizer.tokenize().filter(token =>
      token.type !== TokenType.NEWLINE // Filter out newlines for easier parsing
    );
  }

  parse(): QueryNode {
    // Reset parser state for reusability
    this.current = 0;

    const clauses: ClauseNode[] = [];

    while (!this.isAtEnd()) {
      if (this.check(TokenType.EOF)) break;

      const clause = this.parseClause();
      if (clause) {
        clauses.push(clause);
      }
    }

    return createQuery(clauses);
  }

  private parseClause(): ClauseNode | null {
    const token = this.peek();

    switch (token.type) {
      case TokenType.WHERE:
        return this.parseWhereClause();
      case TokenType.SHOW:
        return this.parseShowClause();
      case TokenType.VIEW:
        return this.parseViewClause();
      case TokenType.CHART:
        return this.parseChartClause();
      case TokenType.PERIOD:
        return this.parsePeriodClause();
      case TokenType.SIZE:
        return this.parseSizeClause();
      default:
        throw new ParseError(`Unexpected token '${token.value}'`, token, 'clause keyword');
    }
  }

  private parseWhereClause(): WhereClauseNode {
    this.consume(TokenType.WHERE, "Expected 'WHERE'");

    const conditions: BinaryExpressionNode[] = [];

    // eslint-disable-next-line no-constant-condition
    do {
      const condition = this.parseBinaryExpression();
      conditions.push(condition);

      // Check for AND/OR (for future extension)
      if (this.match(TokenType.AND, TokenType.OR)) {
        // For now, we'll treat all conditions as AND
        continue;
      }

      break;
    } while (true);

    return createWhereClause(conditions);
  }

  private parseShowClause(): ShowClauseNode {
    this.consume(TokenType.SHOW, "Expected 'SHOW'");

    const fields: IdentifierNode[] = [];

    // eslint-disable-next-line no-constant-condition
    do {
      const field = this.parseIdentifier();
      fields.push(field);

      if (this.match(TokenType.COMMA)) {
        continue;
      }

      break;
    } while (true);

    return createShowClause(fields);
  }

  private parseViewClause(): ViewClauseNode {
    this.consume(TokenType.VIEW, "Expected 'VIEW'");

    // Accept both IDENTIFIER tokens and specific keyword tokens that could be view types
    let viewToken: Token;
    let viewType: string;

    if (this.check(TokenType.IDENTIFIER)) {
      viewToken = this.consume(TokenType.IDENTIFIER, "Expected view type");
      viewType = viewToken.value.toLowerCase();
    } else if (this.check(TokenType.CHART)) {
      // Allow 'chart' keyword as a view type
      viewToken = this.consume(TokenType.CHART, "Expected view type");
      viewType = 'chart';
    } else {
      viewToken = this.peek();
      throw new ParseError("Expected view type", viewToken, 'summary|chart|table|full');
    }

    if (!['summary', 'chart', 'table', 'full'].includes(viewType)) {
      throw new ParseError(`Invalid view type '${viewType}'`, viewToken, 'summary|chart|table|full');
    }

    return createViewClause(viewType as ViewClauseNode['viewType']);
  }

  private parseChartClause(): ChartClauseNode {
    this.consume(TokenType.CHART, "Expected 'CHART'");

    const chartToken = this.consume(TokenType.IDENTIFIER, "Expected chart type");
    const chartType = chartToken.value.toLowerCase();

    if (!['trend', 'monthly', 'budget'].includes(chartType)) {
      throw new ParseError(`Invalid chart type '${chartType}'`, chartToken, 'trend|monthly|budget');
    }

    return createChartClause(chartType as ChartClauseNode['chartType']);
  }

  private parsePeriodClause(): PeriodClauseNode {
    this.consume(TokenType.PERIOD, "Expected 'PERIOD'");

    const periodToken = this.consume(TokenType.IDENTIFIER, "Expected period type");
    const period = periodToken.value.toLowerCase();

    if (!['current-year', 'all-time', 'last-6-months', 'last-12-months'].includes(period)) {
      throw new ParseError(`Invalid period '${period}'`, periodToken, 'current-year|all-time|last-6-months|last-12-months');
    }

    return createPeriodClause(period as PeriodClauseNode['period']);
  }

  private parseSizeClause(): SizeClauseNode {
    this.consume(TokenType.SIZE, "Expected 'SIZE'");

    const sizeToken = this.consume(TokenType.IDENTIFIER, "Expected size type");
    const size = sizeToken.value.toLowerCase();

    if (!['compact', 'normal', 'detailed'].includes(size)) {
      throw new ParseError(`Invalid size '${size}'`, sizeToken, 'compact|normal|detailed');
    }

    return createSizeClause(size as SizeClauseNode['size']);
  }

  private parseBinaryExpression(): BinaryExpressionNode {
    const left = this.parseExpression();

    let operator: BinaryExpressionNode['operator'];

    if (this.match(TokenType.EQUALS)) {
      operator = '=';
    } else if (this.match(TokenType.NOT_EQUALS)) {
      operator = '!=';
    } else if (this.match(TokenType.GREATER_THAN)) {
      operator = '>';
    } else if (this.match(TokenType.LESS_THAN)) {
      operator = '<';
    } else if (this.match(TokenType.GREATER_THAN_EQUALS)) {
      operator = '>=';
    } else if (this.match(TokenType.LESS_THAN_EQUALS)) {
      operator = '<=';
    } else if (this.match(TokenType.BETWEEN)) {
      operator = 'BETWEEN';
    } else if (this.match(TokenType.IN)) {
      operator = 'IN';
    } else {
      const token = this.peek();
      throw new ParseError(`Expected comparison operator`, token, '=|!=|>|<|>=|<=|BETWEEN|IN');
    }

    let right: ExpressionNode | ExpressionNode[];

    if (operator === 'BETWEEN') {
      const start = this.parseExpression();
      this.consume(TokenType.AND, "Expected 'AND' in BETWEEN expression");
      const end = this.parseExpression();

      // Create a date range node for BETWEEN
      if (start.type === 'Literal' && end.type === 'Literal') {
        right = createDateRange(start as LiteralNode, end as LiteralNode);
      } else {
        throw new ParseError(`BETWEEN requires literal values`, this.previous());
      }
    } else if (operator === 'IN') {
      this.consume(TokenType.LEFT_PAREN, "Expected '(' after IN");
      const items: ExpressionNode[] = [];

      // eslint-disable-next-line no-constant-condition
      do {
        items.push(this.parseExpression());
        if (this.match(TokenType.COMMA)) {
          continue;
        }
        break;
      } while (true);

      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after IN list");
      right = createList(items);
    } else {
      right = this.parseExpression();
    }

    return createBinaryExpression(left, operator, right);
  }

  private parseExpression(): ExpressionNode {
    if (this.check(TokenType.STRING)) {
      return this.parseLiteral('string');
    }

    if (this.check(TokenType.DATE)) {
      return this.parseLiteral('date');
    }

    if (this.check(TokenType.NUMBER)) {
      return this.parseLiteral('number');
    }

    if (this.check(TokenType.IDENTIFIER)) {
      return this.parseIdentifier();
    }

    const token = this.peek();
    throw new ParseError(`Unexpected token '${token.value}'`, token, 'literal or identifier');
  }

  private parseLiteral(dataType: 'string' | 'number' | 'date'): LiteralNode {
    const token = this.advance();
    let value: string | number = token.value;

    if (dataType === 'number') {
      value = parseFloat(token.value);
      if (isNaN(value)) {
        throw new ParseError(`Invalid number '${token.value}'`, token);
      }
    }

    return createLiteral(value, dataType);
  }

  private parseIdentifier(): IdentifierNode {
    const token = this.consume(TokenType.IDENTIFIER, "Expected identifier");
    return createIdentifier(token.value);
  }

  // Utility methods for token management
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    const token = this.peek();
    throw new ParseError(message, token, type);
  }
}
