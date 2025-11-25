// Tokenizer for the timesheet query language

export enum TokenType {
  // Keywords
  WHERE = 'WHERE',
  SHOW = 'SHOW',
  VIEW = 'VIEW',
  CHART = 'CHART',
  PERIOD = 'PERIOD',
  SIZE = 'SIZE',
  BETWEEN = 'BETWEEN',
  AND = 'AND',
  OR = 'OR',
  IN = 'IN',

  // Operators
  EQUALS = '=',
  NOT_EQUALS = '!=',
  LESS_THAN = '<',
  GREATER_THAN = '>',
  LESS_THAN_EQUALS = '<=',
  GREATER_THAN_EQUALS = '>=',

  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  DATE = 'DATE',
  IDENTIFIER = 'IDENTIFIER',

  // Punctuation
  COMMA = ',',
  SEMICOLON = ';',
  LEFT_PAREN = '(',
  RIGHT_PAREN = ')',

  // Special
  NEWLINE = 'NEWLINE',
  EOF = 'EOF',
  COMMENT = 'COMMENT'
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export class Tokenizer {
  private input: string;
  private position = 0;
  private line = 1;
  private column = 1;

  private keywords = new Map<string, TokenType>([
    ['WHERE', TokenType.WHERE],
    ['SHOW', TokenType.SHOW],
    ['VIEW', TokenType.VIEW],
    ['CHART', TokenType.CHART],
    ['PERIOD', TokenType.PERIOD],
    ['SIZE', TokenType.SIZE],
    ['BETWEEN', TokenType.BETWEEN],
    ['AND', TokenType.AND],
    ['OR', TokenType.OR],
    ['IN', TokenType.IN]
  ]);

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.position < this.input.length) {
      const token = this.nextToken();
      if (token.type !== TokenType.COMMENT) { // Skip comments
        tokens.push(token);
      }
    }

    tokens.push(this.createToken(TokenType.EOF, ''));
    return tokens;
  }

  private nextToken(): Token {
    this.skipWhitespace();

    if (this.position >= this.input.length) {
      return this.createToken(TokenType.EOF, '');
    }

    const char = this.input[this.position];

    // Comments
    if (char === '/' && this.peek() === '/') {
      return this.readComment();
    }

    // Newlines
    if (char === '\n') {
      const token = this.createToken(TokenType.NEWLINE, char);
      this.advance();
      this.line++;
      this.column = 1;
      return token;
    }

    // Operators
    if (char === '=' && this.peek() === '=') {
      return this.readTwoCharToken('==', TokenType.EQUALS);
    }
    if (char === '!') {
      if (this.peek() === '=') {
        return this.readTwoCharToken('!=', TokenType.NOT_EQUALS);
      }
    }
    if (char === '<') {
      if (this.peek() === '=') {
        return this.readTwoCharToken('<=', TokenType.LESS_THAN_EQUALS);
      }
      return this.readSingleCharToken(TokenType.LESS_THAN);
    }
    if (char === '>') {
      if (this.peek() === '=') {
        return this.readTwoCharToken('>=', TokenType.GREATER_THAN_EQUALS);
      }
      return this.readSingleCharToken(TokenType.GREATER_THAN);
    }
    if (char === '=') {
      return this.readSingleCharToken(TokenType.EQUALS);
    }

    // Punctuation
    if (char === ',') return this.readSingleCharToken(TokenType.COMMA);
    if (char === ';') return this.readSingleCharToken(TokenType.SEMICOLON);
    if (char === '(') return this.readSingleCharToken(TokenType.LEFT_PAREN);
    if (char === ')') return this.readSingleCharToken(TokenType.RIGHT_PAREN);

    // Strings
    if (char === '"' || char === "'") {
      return this.readString(char);
    }

    // Numbers
    if (this.isDigit(char)) {
      return this.readNumber();
    }

    // Identifiers and Keywords
    if (this.isLetter(char) || char === '_') {
      return this.readIdentifierOrKeyword();
    }

    throw new Error(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
  }

  private readComment(): Token {
    const start = this.position;

    // Skip '//'
    this.advance();
    this.advance();

    // Read until end of line or end of input
    while (this.position < this.input.length && this.input[this.position] !== '\n') {
      this.advance();
    }

    const value = this.input.slice(start, this.position);
    return this.createToken(TokenType.COMMENT, value);
  }

  private readString(quote: string): Token {
    const start = this.position;
    this.advance(); // Skip opening quote

    while (this.position < this.input.length && this.input[this.position] !== quote) {
      if (this.input[this.position] === '\\') {
        this.advance(); // Skip escape character
      }
      this.advance();
    }

    if (this.position >= this.input.length) {
      throw new Error(`Unterminated string starting at line ${this.line}, column ${this.column - (this.position - start)}`);
    }

    this.advance(); // Skip closing quote
    let value = this.input.slice(start + 1, this.position - 1); // Exclude quotes

    // Process escape sequences
    value = value.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\');

    // Check if it's a date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const tokenType = dateRegex.test(value) ? TokenType.DATE : TokenType.STRING;

    return this.createToken(tokenType, value);
  }

  private readNumber(): Token {
    const start = this.position;

    while (this.position < this.input.length && (this.isDigit(this.input[this.position]) || this.input[this.position] === '.')) {
      this.advance();
    }

    const value = this.input.slice(start, this.position);
    return this.createToken(TokenType.NUMBER, value);
  }

  private readIdentifierOrKeyword(): Token {
    const start = this.position;

    while (this.position < this.input.length &&
      (this.isAlphaNumeric(this.input[this.position]) || this.input[this.position] === '_' || this.input[this.position] === '-')) {
      this.advance();
    }

    const value = this.input.slice(start, this.position);
    const upperValue = value.toUpperCase();

    const tokenType = this.keywords.get(upperValue) || TokenType.IDENTIFIER;
    return this.createToken(tokenType, value);
  }

  private readSingleCharToken(type: TokenType): Token {
    const char = this.input[this.position];
    const token = this.createToken(type, char);
    this.advance();
    return token;
  }

  private readTwoCharToken(value: string, type: TokenType): Token {
    const token = this.createToken(type, value);
    this.advance();
    this.advance();
    return token;
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && this.isWhitespace(this.input[this.position]) && this.input[this.position] !== '\n') {
      this.advance();
    }
  }

  private advance(): void {
    this.position++;
    this.column++;
  }

  private peek(): string {
    return this.position + 1 < this.input.length ? this.input[this.position + 1] : '';
  }

  private createToken(type: TokenType, value: string): Token {
    return {
      type,
      value,
      line: this.line,
      column: this.column - value.length
    };
  }

  private isWhitespace(char: string): boolean {
    return char === ' ' || char === '\t' || char === '\r';
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isLetter(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isLetter(char) || this.isDigit(char);
  }
}
