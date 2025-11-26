// Query Parser
// Unified parser using the consolidated grammar

import { QueryNode } from '../ast';
import { parse as peggyParse } from '../generated-parser';

// ============================================================================
// PARSE ERROR
// ============================================================================

export class ParseError extends Error {
  public line: number;
  public column: number;
  public expected?: string;
  public found?: string;

  constructor(
    message: string,
    line: number = 1,
    column: number = 1,
    expected?: string,
    found?: string
  ) {
    super(message);
    this.name = 'ParseError';
    this.line = line;
    this.column = column;
    this.expected = expected;
    this.found = found;
  }

  toString(): string {
    let result = `${this.name}: ${this.message}`;
    result += ` at line ${this.line}, column ${this.column}`;
    if (this.expected) {
      result += `\nExpected: ${this.expected}`;
    }
    if (this.found) {
      result += `\nFound: ${this.found}`;
    }
    return result;
  }
}

// ============================================================================
// PARSER OPTIONS
// ============================================================================

export interface ParserOptions {
  /**
   * Preprocess input before parsing (normalize whitespace, etc.)
   */
  preprocess?: boolean;

  /**
   * Validate AST after parsing
   */
  validate?: boolean;

  /**
   * Provide additional context for error messages
   */
  context?: string;

  /**
   * Allow experimental features
   */
  experimental?: boolean;
}

// ============================================================================
// QUERY PARSER
// ============================================================================

export class QueryParser {
  private options: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.options = {
      preprocess: true,
      validate: true,
      experimental: false,
      ...options
    };
  }

  /**
   * Parse a query string into an AST
   */
  parse(input: string): QueryNode {
    try {
      // Preprocess input if enabled
      const cleanInput = this.options.preprocess
        ? this.preprocessInput(input)
        : input;

      // Parse using the generated Peggy parser
      const ast = peggyParse(cleanInput) as QueryNode;

      // Validate if enabled
      if (this.options.validate) {
        this.validateQuery(ast);
      }

      return ast;
    } catch (error: any) {
      // Convert Peggy parse errors to our format
      if (error.location) {
        const line = error.location.start?.line || 1;
        const column = error.location.start?.column || 1;
        const expected = error.expected?.map((e: any) => e.description).join(', ');
        const found = error.found || 'end of input';

        throw new ParseError(
          this.formatErrorMessage(error.message),
          line,
          column,
          expected,
          found
        );
      }

      // Re-throw other errors
      if (error instanceof ParseError) {
        throw error;
      }

      throw new ParseError(error.message || 'Unknown parse error');
    }
  }

  /**
   * Check if input is valid without throwing
   */
  isValid(input: string): boolean {
    try {
      this.parse(input);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get parse errors without throwing
   */
  getErrors(input: string): ParseError[] {
    try {
      this.parse(input);
      return [];
    } catch (error) {
      if (error instanceof ParseError) {
        return [error];
      }
      return [new ParseError(error.message || 'Unknown parse error')];
    }
  }

  /**
   * Preprocess input string
   */
  private preprocessInput(input: string): string {
    // Normalize line endings
    let processed = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Normalize whitespace (but preserve structure)
    processed = processed
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    // Remove trailing whitespace
    processed = processed.trim();

    return processed;
  }

  /**
   * Format error message for better readability
   */
  private formatErrorMessage(message: string): string {
    // Clean up Peggy error messages
    message = message.replace(/Expected\s+/g, 'Expected: ');
    message = message.replace(/but\s+"(.+?)"\s+found/g, 'but found "$1"');

    return message;
  }

  /**
   * Validate parsed query
   */
  private validateQuery(query: QueryNode): void {
    if (!query || query.type !== 'Query') {
      throw new ParseError('Invalid query: root must be a Query node');
    }

    if (!Array.isArray(query.clauses)) {
      throw new ParseError('Invalid query: clauses must be an array');
    }

    // Check for duplicate clause types (most should be unique)
    const clauseTypes = query.clauses.map(c => c.type);
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const type of clauseTypes) {
      // Allow multiple WHERE conditions combined with AND
      if (type === 'WhereClause') continue;

      if (seen.has(type)) {
        duplicates.add(type);
      }
      seen.add(type);
    }

    if (duplicates.size > 0) {
      throw new ParseError(
        `Duplicate clause types found: ${Array.from(duplicates).join(', ')}`
      );
    }

    // Validate clause compatibility
    this.validateClauseCompatibility(query);
  }

  /**
   * Validate that clauses are compatible with each other
   */
  private validateClauseCompatibility(query: QueryNode): void {
    const clauseTypes: Set<string> = new Set(query.clauses.map(c => c.type));

    // CHART clause requires VIEW clause
    if (clauseTypes.has('ChartClause') && !clauseTypes.has('ViewClause')) {
      // This is just a warning, not an error
      // We'll add a default ViewClause if needed
    }

    // GROUP BY requires aggregation in SHOW
    if (clauseTypes.has('GroupByClause')) {
      const showClause = query.clauses.find(c => c.type === 'ShowClause');
      if (showClause) {
        // Check if any fields have aggregation
        const hasAggregation = (showClause as any).fields?.some(
          (field: any) => field.type === 'AggregationFunction' || field.aggregation
        );

        if (!hasAggregation) {
          throw new ParseError(
            'GROUP BY clause requires aggregation functions in SHOW clause'
          );
        }
      }
    }

    // HAVING requires GROUP BY
    if (clauseTypes.has('HavingClause') && !clauseTypes.has('GroupByClause')) {
      throw new ParseError('HAVING clause requires GROUP BY clause');
    }

    // Retainer clauses compatibility checks
    const retainerClauses: string[] = [
      'RetainerClause',
      'ServiceClause',
      'RolloverClause',
      'UtilizationClause',
      'ContractClause',
      'ValueClause',
      'AlertClause',
      'ForecastClause'
    ];

    const hasRetainerFeatures = retainerClauses.some((type: string) => clauseTypes.has(type));

    // If using retainer features, warn if basic timesheet fields are used
    if (hasRetainerFeatures) {
      // This is informational - retainer features extend basic functionality
    }
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

// Default parser instance
const defaultParser = new QueryParser();

/**
 * Parse a query string using default options
 */
export function parseQuery(input: string): QueryNode {
  return defaultParser.parse(input);
}

/**
 * Check if a query string is valid
 */
export function isValidQuery(input: string): boolean {
  return defaultParser.isValid(input);
}

/**
 * Get parse errors for a query string
 */
export function getQueryErrors(input: string): ParseError[] {
  return defaultParser.getErrors(input);
}

/**
 * Create a parser with custom options
 */
export function createParser(options: ParserOptions): QueryParser {
  return new QueryParser(options);
}
