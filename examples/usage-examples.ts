// Canonical usage examples for the timesheet query parser
// This file demonstrates how to use the parser in TypeScript code

import { Parser, ParseError } from '../src/query/parser';
import { QueryInterpreter, TimesheetQuery } from '../src/query/interpreter';
import { validateAST, walkAST, findNodesByType } from '../src/query/ast';
import type { QueryNode, LiteralNode, IdentifierNode } from '../src/query/ast';

/**
 * Basic usage: Parse a simple query string
 */
export function basicUsage(): TimesheetQuery {
  const queryString = 'WHERE year = 2024 VIEW chart';

  // Step 1: Parse the query string into an AST
  const parser = new Parser(queryString);
  const ast = parser.parse();

  // Step 2: Interpret the AST into a query object
  const interpreter = new QueryInterpreter();
  const query = interpreter.interpret(ast);

  return query;
}

/**
 * Error handling: How to handle parsing errors gracefully
 */
export function errorHandling(queryString: string): TimesheetQuery | null {
  try {
    const parser = new Parser(queryString);
    const ast = parser.parse();

    const interpreter = new QueryInterpreter();
    return interpreter.interpret(ast);

  } catch (error) {
    if (error instanceof ParseError) {
      console.error(`Parse error at line ${error.token.line}, column ${error.token.column}: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
}

/**
 * Query validation: Validate a query before execution
 */
export function validateQuery(queryString: string): { isValid: boolean; errors: string[] } {
  try {
    const parser = new Parser(queryString);
    const ast = parser.parse();

    // Validate the AST structure
    const validation = validateAST(ast);

    return validation;

  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Query analysis: Extract information from parsed queries
 */
export function analyzeQuery(queryString: string): {
  nodeCount: number;
  literalValues: string[];
  fieldReferences: string[];
  complexity: number;
} {
  const parser = new Parser(queryString);
  const ast = parser.parse();

  // Count total nodes
  let nodeCount = 0;
  walkAST(ast, () => nodeCount++);

  // Extract literal values
  const literals = findNodesByType<LiteralNode>(ast, 'Literal');
  const literalValues = literals.map(lit => String(lit.value));

  // Extract field references
  const identifiers = findNodesByType<IdentifierNode>(ast, 'Identifier');
  const fieldReferences = identifiers
    .filter(id => ['year', 'month', 'project', 'date'].includes(id.name.toLowerCase()))
    .map(id => id.name);

  // Calculate complexity score
  const complexity = Math.min(10, Math.floor(nodeCount / 2) + fieldReferences.length);

  return {
    nodeCount,
    literalValues,
    fieldReferences,
    complexity
  };
}

/**
 * Common query patterns as reusable functions
 */
export class QueryPatterns {

  static currentYear(): TimesheetQuery {
    return this.parseQuery('WHERE year = {{currentYear}} VIEW summary');
  }

  static projectSummary(projectName: string): TimesheetQuery {
    return this.parseQuery(`WHERE project = "${projectName}" VIEW full CHART trend`);
  }

  static dateRange(startDate: string, endDate: string): TimesheetQuery {
    return this.parseQuery(`WHERE date BETWEEN "${startDate}" AND "${endDate}" VIEW chart`);
  }

  static quarterlyReview(year: number, quarter: number): TimesheetQuery {
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;
    return this.parseQuery(`WHERE year = ${year} AND month >= ${startMonth} AND month <= ${endMonth} VIEW full`);
  }

  static budgetTracking(projectName: string): TimesheetQuery {
    return this.parseQuery(`WHERE project = "${projectName}" VIEW chart CHART budget SIZE detailed`);
  }

  private static parseQuery(queryString: string): TimesheetQuery {
    // Replace template variables
    const processedQuery = queryString.replace('{{currentYear}}', String(new Date().getFullYear()));

    const parser = new Parser(processedQuery);
    const ast = parser.parse();
    const interpreter = new QueryInterpreter();
    return interpreter.interpret(ast);
  }
}

/**
 * Integration with data processing pipeline
 */
export class QueryProcessor {

  /**
   * Process a query string and return filtered data
   */
  static async processQuery(queryString: string, rawData: any[]): Promise<any> {
    // Parse the query
    const parser = new Parser(queryString);
    const ast = parser.parse();
    const interpreter = new QueryInterpreter();
    const query = interpreter.interpret(ast);

    // Apply filters based on the parsed query
    let filteredData = [...rawData];

    if (query.where) {
      filteredData = this.applyFilters(filteredData, query.where);
    }

    // Apply period filtering
    if (query.period && query.period !== 'all-time') {
      filteredData = this.applyPeriodFilter(filteredData, query.period);
    }

    // Format based on view type and size
    return this.formatResults(filteredData, query);
  }

  private static applyFilters(data: any[], where: NonNullable<TimesheetQuery['where']>): any[] {
    return data.filter(item => {
      if (where.year && item.year !== where.year) return false;
      if (where.month && item.month !== where.month) return false;
      if (where.project && item.project !== where.project) return false;

      if (where.dateRange) {
        const itemDate = new Date(item.date);
        const startDate = new Date(where.dateRange.start);
        const endDate = new Date(where.dateRange.end);
        if (itemDate < startDate || itemDate > endDate) return false;
      }

      return true;
    });
  }

  private static applyPeriodFilter(data: any[], period: string): any[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    switch (period) {
      case 'current-year':
        return data.filter(item => item.year === currentYear);

      case 'last-6-months':
        return data.filter(item => {
          const itemDate = new Date(item.year, item.month - 1);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return itemDate >= sixMonthsAgo;
        });

      case 'last-12-months':
        return data.filter(item => {
          const itemDate = new Date(item.year, item.month - 1);
          const twelveMonthsAgo = new Date();
          twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
          return itemDate >= twelveMonthsAgo;
        });

      default:
        return data;
    }
  }

  private static formatResults(data: any[], query: TimesheetQuery): any {
    const summary = this.calculateSummary(data);

    const result: any = {
      summary,
      rawData: data
    };

    // Include specific fields if requested
    if (query.show) {
      result.fields = query.show;
    }

    // Add metadata about the query
    result.metadata = {
      view: query.view,
      chartType: query.chartType,
      period: query.period,
      size: query.size,
      recordCount: data.length
    };

    return result;
  }

  private static calculateSummary(data: any[]): any {
    return {
      totalHours: data.reduce((sum, item) => sum + (item.hours || 0), 0),
      totalInvoiced: data.reduce((sum, item) => sum + (item.invoiced || 0), 0),
      recordCount: data.length,
      dateRange: {
        start: data.length > 0 ? Math.min(...data.map(item => new Date(item.date).getTime())) : null,
        end: data.length > 0 ? Math.max(...data.map(item => new Date(item.date).getTime())) : null
      }
    };
  }
}

/**
 * Query builder for programmatic query construction
 */
export class QueryBuilder {
  private clauses: string[] = [];

  where(field: string, operator: string, value: string | number): QueryBuilder {
    if (typeof value === 'string') {
      this.clauses.push(`WHERE ${field} ${operator} "${value}"`);
    } else {
      this.clauses.push(`WHERE ${field} ${operator} ${value}`);
    }
    return this;
  }

  and(field: string, operator: string, value: string | number): QueryBuilder {
    if (typeof value === 'string') {
      this.clauses.push(`AND ${field} ${operator} "${value}"`);
    } else {
      this.clauses.push(`AND ${field} ${operator} ${value}`);
    }
    return this;
  }

  dateRange(startDate: string, endDate: string): QueryBuilder {
    this.clauses.push(`WHERE date BETWEEN "${startDate}" AND "${endDate}"`);
    return this;
  }

  view(viewType: 'summary' | 'chart' | 'table' | 'full'): QueryBuilder {
    this.clauses.push(`VIEW ${viewType}`);
    return this;
  }

  chart(chartType: 'trend' | 'monthly' | 'budget'): QueryBuilder {
    this.clauses.push(`CHART ${chartType}`);
    return this;
  }

  period(period: 'current-year' | 'all-time' | 'last-6-months' | 'last-12-months'): QueryBuilder {
    this.clauses.push(`PERIOD ${period}`);
    return this;
  }

  size(size: 'compact' | 'normal' | 'detailed'): QueryBuilder {
    this.clauses.push(`SIZE ${size}`);
    return this;
  }

  show(...fields: string[]): QueryBuilder {
    this.clauses.push(`SHOW ${fields.join(', ')}`);
    return this;
  }

  build(): string {
    return this.clauses.join('\n');
  }

  parse(): TimesheetQuery {
    const queryString = this.build();
    const parser = new Parser(queryString);
    const ast = parser.parse();
    const interpreter = new QueryInterpreter();
    return interpreter.interpret(ast);
  }
}

/**
 * Example usage scenarios
 */
export function exampleUsage(): void {
  console.log('=== Timesheet Query Parser Usage Examples ===\n');

  // Example 1: Basic parsing
  console.log('1. Basic Usage:');
  const basicQuery = basicUsage();
  console.log('Query result:', basicQuery);
  console.log();

  // Example 2: Error handling
  console.log('2. Error Handling:');
  const invalidQuery = errorHandling('INVALID syntax here');
  console.log('Invalid query result:', invalidQuery);
  console.log();

  // Example 3: Query analysis
  console.log('3. Query Analysis:');
  const analysis = analyzeQuery('WHERE year = 2024 AND project = "Test" VIEW chart');
  console.log('Analysis:', analysis);
  console.log();

  // Example 4: Query patterns
  console.log('4. Query Patterns:');
  const projectQuery = QueryPatterns.projectSummary('Client Alpha');
  console.log('Project summary:', projectQuery);
  console.log();

  // Example 5: Query builder
  console.log('5. Query Builder:');
  const builtQuery = new QueryBuilder()
    .where('year', '=', 2024)
    .and('month', '>=', 10)
    .view('chart')
    .chart('trend')
    .size('detailed')
    .parse();
  console.log('Built query:', builtQuery);
}

// Export everything for use in other modules
export {
  Parser,
  ParseError,
  QueryInterpreter,
  TimesheetQuery,
  validateAST,
  walkAST,
  findNodesByType,
  QueryNode,
  LiteralNode,
  IdentifierNode
};
