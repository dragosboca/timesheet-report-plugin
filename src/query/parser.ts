// Timesheet Query Language Parser
// Grammar-based parser using Peggy (PEG.js successor)

import { QueryNode } from './ast';
import { parse as peggyParse, ParseError as PeggyParseError } from './generated-parser';

export class ParseError extends Error {
  public line: number;
  public column: number;
  public expected?: string;

  constructor(message: string, line: number = 1, column: number = 1, expected?: string) {
    super(message);
    this.name = 'ParseError';
    this.line = line;
    this.column = column;
    this.expected = expected;
  }
}

export class QueryParser {
  /**
   * Parse a query string into an AST
   * @param input - The query string to parse
   * @returns The parsed query AST
   * @throws ParseError on syntax errors
   */
  parse(input: string): QueryNode {
    try {
      // Clean up the input
      const cleanInput = this.preprocessInput(input);

      // Parse using the generated Peggy parser
      const ast = peggyParse(cleanInput);

      // Validate the resulting AST
      this.validateAST(ast);

      return ast;
    } catch (error: any) {
      if (error instanceof PeggyParseError) {
        // Convert Peggy parse error to our format
        const line = error.location?.start?.line || 1;
        const column = error.location?.start?.column || 1;
        throw new ParseError(error.message, line, column);
      }

      // Re-throw other errors as-is
      throw error;
    }
  }

  /**
   * Preprocess the input string to handle common formatting issues
   */
  private preprocessInput(input: string): string {
    // Normalize line endings
    let processed = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove excessive whitespace but preserve structure
    processed = processed.replace(/[ \t]+/g, ' ').trim();

    // Ensure there's a newline at the end for consistent parsing
    if (processed && !processed.endsWith('\n')) {
      processed += '\n';
    }

    return processed;
  }

  /**
   * Validate the generated AST for correctness
   */
  private validateAST(ast: QueryNode): void {
    if (!ast || ast.type !== 'Query') {
      throw new ParseError('Invalid query structure: root must be a Query node');
    }

    if (!Array.isArray(ast.clauses)) {
      throw new ParseError('Invalid query structure: clauses must be an array');
    }

    // Validate each clause
    for (const clause of ast.clauses) {
      this.validateClause(clause);
    }

    // Check for logical constraints
    this.validateLogicalConstraints(ast);
  }

  /**
   * Validate individual clauses
   */
  private validateClause(clause: any): void {
    if (!clause || !clause.type) {
      throw new ParseError('Invalid clause: missing type');
    }

    switch (clause.type) {
      case 'WhereClause':
        this.validateWhereClause(clause);
        break;
      case 'ShowClause':
        this.validateShowClause(clause);
        break;
      case 'ViewClause':
        this.validateViewClause(clause);
        break;
      case 'ChartClause':
        this.validateChartClause(clause);
        break;
      case 'PeriodClause':
        this.validatePeriodClause(clause);
        break;
      case 'SizeClause':
        this.validateSizeClause(clause);
        break;
      default:
        throw new ParseError(`Unknown clause type: ${clause.type}`);
    }
  }

  private validateWhereClause(clause: any): void {
    if (!Array.isArray(clause.conditions)) {
      throw new ParseError('WHERE clause must have conditions array');
    }

    for (const condition of clause.conditions) {
      if (!condition || condition.type !== 'BinaryExpression') {
        throw new ParseError('WHERE conditions must be binary expressions');
      }

      // Validate field names
      if (condition.left?.type === 'Identifier') {
        const validFields = ['year', 'month', 'project', 'date', 'hours', 'budget'];
        if (!validFields.includes(condition.left.name)) {
          throw new ParseError(`Unknown field: ${condition.left.name}. Valid fields: ${validFields.join(', ')}`);
        }
      }
    }
  }

  private validateShowClause(clause: any): void {
    if (!Array.isArray(clause.fields)) {
      throw new ParseError('SHOW clause must have fields array');
    }

    const validFields = ['hours', 'invoiced', 'progress', 'utilization', 'remaining'];
    for (const field of clause.fields) {
      if (!field || field.type !== 'Identifier') {
        throw new ParseError('SHOW fields must be identifiers');
      }
      if (!validFields.includes(field.name)) {
        throw new ParseError(`Unknown SHOW field: ${field.name}. Valid fields: ${validFields.join(', ')}`);
      }
    }
  }

  private validateViewClause(clause: any): void {
    const validViews = ['summary', 'chart', 'table', 'full'];
    if (!validViews.includes(clause.viewType)) {
      throw new ParseError(`Invalid view type: ${clause.viewType}. Valid types: ${validViews.join(', ')}`);
    }
  }

  private validateChartClause(clause: any): void {
    const validCharts = ['trend', 'monthly', 'budget'];
    if (!validCharts.includes(clause.chartType)) {
      throw new ParseError(`Invalid chart type: ${clause.chartType}. Valid types: ${validCharts.join(', ')}`);
    }
  }

  private validatePeriodClause(clause: any): void {
    const validPeriods = ['current-year', 'all-time', 'last-6-months', 'last-12-months'];
    if (!validPeriods.includes(clause.period)) {
      throw new ParseError(`Invalid period: ${clause.period}. Valid periods: ${validPeriods.join(', ')}`);
    }
  }

  private validateSizeClause(clause: any): void {
    const validSizes = ['compact', 'normal', 'detailed'];
    if (!validSizes.includes(clause.size)) {
      throw new ParseError(`Invalid size: ${clause.size}. Valid sizes: ${validSizes.join(', ')}`);
    }
  }

  /**
   * Validate logical constraints across clauses
   */
  private validateLogicalConstraints(ast: QueryNode): void {
    const clauseTypes = ast.clauses.map(c => c.type);

    // Check for duplicate clause types (most should be unique)
    const duplicates = clauseTypes.filter((type, index) =>
      clauseTypes.indexOf(type) !== index &&
      !['WhereClause'].includes(type) // WHERE can have multiple conditions, but we handle that differently
    );

    if (duplicates.length > 0) {
      throw new ParseError(`Duplicate clause types found: ${duplicates.join(', ')}. Each clause type should appear only once.`);
    }

    // CHART clause only makes sense with VIEW chart or VIEW full
    const hasChartClause = clauseTypes.includes('ChartClause');
    const viewClause = ast.clauses.find(c => c.type === 'ViewClause') as any;

    if (hasChartClause && viewClause && !['chart', 'full'].includes(viewClause.viewType)) {
      throw new ParseError('CHART clause can only be used with VIEW chart or VIEW full');
    }
  }

  /**
   * Quick validation check without full parsing
   * Useful for syntax highlighting or real-time feedback
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
   * Get syntax errors without throwing
   * Useful for providing feedback in editors
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
}

// Export a default instance for convenience
export const queryParser = new QueryParser();

// Convenience function that matches the old parser interface
export function parseQuery(input: string): QueryNode {
  return queryParser.parse(input);
}
