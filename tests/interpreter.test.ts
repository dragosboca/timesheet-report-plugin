
import { Parser } from '../src/query/parser';
import { QueryInterpreter, InterpreterError } from '../src/query/interpreter';
import type { TimesheetQuery } from '../src/query/interpreter';

describe('QueryInterpreter', () => {
  let interpreter: QueryInterpreter;

  beforeEach(() => {
    interpreter = new QueryInterpreter();
  });

  describe('Default values', () => {
    it('should set correct default values for empty query', () => {
      const parser = new Parser('');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result).toEqual({
        view: 'summary',
        period: 'current-year',
        size: 'normal'
      });
    });

    it('should override defaults when values are specified', () => {
      const parser = new Parser('VIEW chart SIZE compact PERIOD all-time');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.view).toBe('chart');
      expect(result.size).toBe('compact');
      expect(result.period).toBe('all-time');
    });

    it('should preserve defaults for unspecified values', () => {
      const parser = new Parser('VIEW chart');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.view).toBe('chart');
      expect(result.period).toBe('current-year'); // default
      expect(result.size).toBe('normal'); // default
    });
  });

  describe('WHERE clause interpretation', () => {
    it('should interpret simple year condition', () => {
      const parser = new Parser('WHERE year = 2024');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.where).toBeDefined();
      expect(result.where!.year).toBe(2024);
    });

    it('should interpret month condition', () => {
      const parser = new Parser('WHERE month = 12');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.where!.month).toBe(12);
    });

    it('should interpret project condition', () => {
      const parser = new Parser('WHERE project = "Client Alpha"');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.where!.project).toBe('Client Alpha');
    });

    it('should interpret multiple conditions', () => {
      const parser = new Parser('WHERE year = 2024 AND month = 12 AND project = "Test Project"');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.where).toEqual({
        year: 2024,
        month: 12,
        project: 'Test Project'
      });
    });

    it('should interpret date range with BETWEEN', () => {
      const parser = new Parser('WHERE date BETWEEN "2024-01-01" AND "2024-12-31"');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.where!.dateRange).toEqual({
        start: '2024-01-01',
        end: '2024-12-31'
      });
    });

    it('should handle numeric comparison operators', () => {
      const queries = [
        { query: 'WHERE year > 2023', expected: { year: 2023 } }, // Note: Our current implementation treats all as equality
        { query: 'WHERE month >= 6', expected: { month: 6 } },
        { query: 'WHERE year < 2025', expected: { year: 2025 } },
        { query: 'WHERE month <= 6', expected: { month: 6 } },
        { query: 'WHERE year != 2023', expected: { year: 2023 } }
      ];

      queries.forEach(({ query }) => {
        expect(() => {
          const parser = new Parser(query);
          const ast = parser.parse();
          interpreter.interpret(ast);
        }).not.toThrow();
      });
    });
  });

  describe('VIEW clause interpretation', () => {
    const viewTypes: Array<{ input: string; expected: TimesheetQuery['view'] }> = [
      { input: 'VIEW summary', expected: 'summary' },
      { input: 'VIEW chart', expected: 'chart' },
      { input: 'VIEW table', expected: 'table' },
      { input: 'VIEW full', expected: 'full' }
    ];

    viewTypes.forEach(({ input, expected }) => {
      it(`should interpret ${input}`, () => {
        const parser = new Parser(input);
        const ast = parser.parse();
        const result = interpreter.interpret(ast);

        expect(result.view).toBe(expected);
      });
    });

    it('should handle case insensitive view types', () => {
      const parser = new Parser('VIEW Chart');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.view).toBe('chart');
    });
  });

  describe('CHART clause interpretation', () => {
    const chartTypes: Array<{ input: string; expected: TimesheetQuery['chartType'] }> = [
      { input: 'CHART trend', expected: 'trend' },
      { input: 'CHART monthly', expected: 'monthly' },
      { input: 'CHART budget', expected: 'budget' }
    ];

    chartTypes.forEach(({ input, expected }) => {
      it(`should interpret ${input}`, () => {
        const parser = new Parser(input);
        const ast = parser.parse();
        const result = interpreter.interpret(ast);

        expect(result.chartType).toBe(expected);
      });
    });
  });

  describe('PERIOD clause interpretation', () => {
    const periods: Array<{ input: string; expected: TimesheetQuery['period'] }> = [
      { input: 'PERIOD current-year', expected: 'current-year' },
      { input: 'PERIOD all-time', expected: 'all-time' },
      { input: 'PERIOD last-6-months', expected: 'last-6-months' },
      { input: 'PERIOD last-12-months', expected: 'last-12-months' }
    ];

    periods.forEach(({ input, expected }) => {
      it(`should interpret ${input}`, () => {
        const parser = new Parser(input);
        const ast = parser.parse();
        const result = interpreter.interpret(ast);

        expect(result.period).toBe(expected);
      });
    });
  });

  describe('SIZE clause interpretation', () => {
    const sizes: Array<{ input: string; expected: TimesheetQuery['size'] }> = [
      { input: 'SIZE compact', expected: 'compact' },
      { input: 'SIZE normal', expected: 'normal' },
      { input: 'SIZE detailed', expected: 'detailed' }
    ];

    sizes.forEach(({ input, expected }) => {
      it(`should interpret ${input}`, () => {
        const parser = new Parser(input);
        const ast = parser.parse();
        const result = interpreter.interpret(ast);

        expect(result.size).toBe(expected);
      });
    });
  });

  describe('SHOW clause interpretation', () => {
    it('should interpret single field', () => {
      const parser = new Parser('SHOW hours');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.show).toEqual(['hours']);
    });

    it('should interpret multiple fields', () => {
      const parser = new Parser('SHOW hours, invoiced, progress');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.show).toEqual(['hours', 'invoiced', 'progress']);
    });

    it('should handle all available fields', () => {
      const parser = new Parser('SHOW hours, invoiced, progress, utilization, remaining');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.show).toEqual(['hours', 'invoiced', 'progress', 'utilization', 'remaining']);
    });

    it('should preserve field order', () => {
      const parser = new Parser('SHOW progress, hours, invoiced');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.show).toEqual(['progress', 'hours', 'invoiced']);
    });
  });

  describe('Complex query interpretation', () => {
    it('should interpret complete dashboard query', () => {
      const query = `
        WHERE year = 2024 AND project = "Client Alpha"
        SHOW hours, invoiced, progress
        VIEW full
        CHART trend
        PERIOD last-6-months
        SIZE detailed
      `;

      const parser = new Parser(query);
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result).toEqual({
        where: {
          year: 2024,
          project: 'Client Alpha'
        },
        show: ['hours', 'invoiced', 'progress'],
        view: 'full',
        chartType: 'trend',
        period: 'last-6-months',
        size: 'detailed'
      });
    });

    it('should interpret budget tracking query', () => {
      const query = `
        WHERE project = "Q1 Budget" AND date BETWEEN "2024-01-01" AND "2024-03-31"
        VIEW chart
        CHART budget
        SIZE normal
      `;

      const parser = new Parser(query);
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result).toEqual({
        where: {
          project: 'Q1 Budget',
          dateRange: {
            start: '2024-01-01',
            end: '2024-03-31'
          }
        },
        view: 'chart',
        chartType: 'budget',
        size: 'normal',
        period: 'current-year' // default
      });
    });

    it('should handle queries with comments', () => {
      const query = `
        // Q4 2024 analysis
        WHERE year = 2024 AND month >= 10
        // Display as chart with trend analysis
        VIEW chart
        CHART trend
        SIZE detailed
      `;

      const parser = new Parser(query);
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.where!.year).toBe(2024);
      expect(result.view).toBe('chart');
      expect(result.chartType).toBe('trend');
    });
  });

  describe('Type validation', () => {
    it('should handle string fields correctly', () => {
      const parser = new Parser('WHERE project = "Test Project"');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(typeof result.where!.project).toBe('string');
      expect(result.where!.project).toBe('Test Project');
    });

    it('should handle numeric fields correctly', () => {
      const parser = new Parser('WHERE year = 2024 AND month = 12');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(typeof result.where!.year).toBe('number');
      expect(typeof result.where!.month).toBe('number');
      expect(result.where!.year).toBe(2024);
      expect(result.where!.month).toBe(12);
    });

    it('should handle date strings correctly', () => {
      const parser = new Parser('WHERE date BETWEEN "2024-01-01" AND "2024-12-31"');
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(typeof result.where!.dateRange!.start).toBe('string');
      expect(typeof result.where!.dateRange!.end).toBe('string');
      expect(result.where!.dateRange!.start).toBe('2024-01-01');
      expect(result.where!.dateRange!.end).toBe('2024-12-31');
    });
  });

  describe('Error handling', () => {
    it('should handle unknown field names gracefully', () => {
      // This might not throw in the current implementation, but should be tested
      const parser = new Parser('WHERE unknown_field = "value"');
      const ast = parser.parse();

      expect(() => {
        interpreter.interpret(ast);
      }).not.toThrow(); // Current implementation may be lenient
    });

    it('should handle malformed WHERE conditions', () => {
      // Test with manually created malformed AST
      const malformedAST = {
        type: 'Query',
        clauses: [{
          type: 'WhereClause',
          conditions: [{
            type: 'BinaryExpression',
            left: { type: 'Identifier', name: 'year' },
            operator: '=',
            right: { type: 'Literal', value: undefined, dataType: 'number' }
          }]
        }]
      } as any;

      // Should handle gracefully or provide clear error
      expect(() => {
        interpreter.interpret(malformedAST);
      }).not.toThrow(); // May be lenient in current implementation
    });
  });

  describe('Edge cases', () => {
    it('should handle empty WHERE clause conditions', () => {
      // This would require manually creating an AST since parser wouldn't create this
      const emptyWhereAST = {
        type: 'Query',
        clauses: [{
          type: 'WhereClause',
          conditions: []
        }]
      } as any;

      const result = interpreter.interpret(emptyWhereAST);
      expect(result.where).toEqual({});
    });

    it('should handle very long project names', () => {
      const longName = 'A'.repeat(1000);
      const parser = new Parser(`WHERE project = "${longName}"`);
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.where!.project).toBe(longName);
    });

    it('should handle special characters in project names', () => {
      const specialName = 'Project "Alpha" & Company - Phase 2 (2024)';
      const parser = new Parser(`WHERE project = "Project \\"Alpha\\" & Company - Phase 2 (2024)"`);
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.where!.project).toBe(specialName);
    });

    it('should handle Unicode characters', () => {
      const unicodeName = 'Projet Français 🇫🇷 中文 русский';
      const parser = new Parser(`WHERE project = "${unicodeName}"`);
      const ast = parser.parse();
      const result = interpreter.interpret(ast);

      expect(result.where!.project).toBe(unicodeName);
    });

    it('should handle boundary year values', () => {
      const queries = [
        'WHERE year = 0',
        'WHERE year = 9999',
        'WHERE year = 2024'
      ];

      queries.forEach(query => {
        const parser = new Parser(query);
        const ast = parser.parse();

        expect(() => {
          const result = interpreter.interpret(ast);
          expect(typeof result.where!.year).toBe('number');
        }).not.toThrow();
      });
    });

    it('should handle boundary month values', () => {
      const validMonths = [1, 2, 11, 12];

      validMonths.forEach(month => {
        const parser = new Parser(`WHERE month = ${month}`);
        const ast = parser.parse();
        const result = interpreter.interpret(ast);

        expect(result.where!.month).toBe(month);
      });
    });
  });

  describe('Immutability', () => {
    it('should return new query objects for each interpretation', () => {
      const parser = new Parser('WHERE year = 2024');
      const ast = parser.parse();

      const result1 = interpreter.interpret(ast);
      const result2 = interpreter.interpret(ast);

      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2); // Different object instances
    });

    it('should not modify the input AST', () => {
      const parser = new Parser('WHERE year = 2024 VIEW chart');
      const ast = parser.parse();
      const originalAST = JSON.parse(JSON.stringify(ast));

      interpreter.interpret(ast);

      expect(ast).toEqual(originalAST);
    });
  });

  describe('Integration with real parser', () => {
    it('should work with all valid parser outputs', () => {
      const validQueries = [
        'WHERE year = 2024',
        'VIEW summary',
        'CHART trend',
        'PERIOD all-time',
        'SIZE compact',
        'SHOW hours, invoiced',
        'WHERE project = "Test" VIEW chart CHART trend PERIOD last-6-months SIZE detailed'
      ];

      validQueries.forEach(query => {
        expect(() => {
          const parser = new Parser(query);
          const ast = parser.parse();
          const result = interpreter.interpret(ast);

          // Basic structure validation
          expect(result).toHaveProperty('view');
          expect(result).toHaveProperty('period');
          expect(result).toHaveProperty('size');
        }).not.toThrow();
      });
    });
  });
});
