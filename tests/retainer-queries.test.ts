import { parseQuery, ParseError } from '../src/query/parser';
import { QueryInterpreter } from '../src/query/interpreter';

describe('Retainer Query Language Tests', () => {
  let interpreter: QueryInterpreter;

  beforeEach(() => {
    interpreter = new QueryInterpreter();
  });

  describe('Standard Query Compatibility', () => {
    it('should maintain backward compatibility with standard WHERE queries', () => {
      const standardQueries = [
        'WHERE year = 2024 AND month = 3 SHOW hours, invoiced',
        'WHERE year = 2024 SHOW hours, utilization VIEW chart CHART trend'
      ];

      standardQueries.forEach(query => {
        expect(() => {
          const ast = parseQuery(query);
          const result = interpreter.interpret(ast);
        }).not.toThrow();
      });
    });

    it('should interpret standard WHERE queries correctly', () => {
      const query = 'WHERE year = 2024 AND month = 3 SHOW hours, invoiced';
      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.where?.year).toBe(2024);
      expect(result.where?.month).toBe(3);
      expect(result.show).toContain('hours');
      expect(result.show).toContain('invoiced');
    });

    it('should interpret standard chart queries correctly', () => {
      const query = 'WHERE year = 2024 SHOW hours, utilization VIEW chart CHART trend';
      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.where?.year).toBe(2024);
      expect(result.show).toContain('hours');
      expect(result.show).toContain('utilization');
      expect(result.view).toBe('chart');
      expect(result.chartType).toBe('trend');
    });
  });

  describe('Project-based queries (retainer simulation)', () => {
    it('should filter by project name for retainer clients', () => {
      const query = 'WHERE project = "Retainer Client Alpha" SHOW hours, invoiced';
      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.where?.project).toBe('Retainer Client Alpha');
      expect(result.show).toContain('hours');
      expect(result.show).toContain('invoiced');
    });

    it('should support complex retainer project queries', () => {
      const query = `WHERE year = 2024 AND project = "Monthly Retainer"
                     SHOW hours, invoiced, utilization
                     VIEW full
                     CHART monthly
                     SIZE detailed`;

      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.where?.year).toBe(2024);
      expect(result.where?.project).toBe('Monthly Retainer');
      expect(result.show).toEqual(['hours', 'invoiced', 'utilization']);
      expect(result.view).toBe('full');
      expect(result.chartType).toBe('monthly');
      expect(result.size).toBe('detailed');
    });
  });

  describe('Time-based retainer analysis', () => {
    it('should support monthly retainer tracking', () => {
      const query = 'WHERE year = 2024 AND month >= 1 SHOW hours, utilization CHART monthly';
      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.where?.year).toBe(2024);
      expect(result.where?.month).toBe(1);
      expect(result.chartType).toBe('monthly');
    });

    it('should support quarterly retainer analysis', () => {
      const query = 'WHERE year = 2024 SHOW hours, invoiced, progress VIEW chart PERIOD last-12-months';
      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.where?.year).toBe(2024);
      expect(result.period).toBe('last-12-months');
      expect(result.view).toBe('chart');
    });
  });

  describe('Utilization tracking for retainers', () => {
    it('should support utilization-focused queries', () => {
      const query = 'WHERE year = 2024 SHOW hours, utilization, progress VIEW chart CHART trend';
      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.show).toContain('utilization');
      expect(result.show).toContain('hours');
      expect(result.show).toContain('progress');
      expect(result.chartType).toBe('trend');
    });

    it('should handle detailed utilization reporting', () => {
      const query = `WHERE year = 2024 AND project = "Support Retainer"
                     SHOW hours, utilization, remaining
                     VIEW full
                     SIZE detailed`;

      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.where?.project).toBe('Support Retainer');
      expect(result.show).toContain('utilization');
      expect(result.show).toContain('remaining');
      expect(result.size).toBe('detailed');
    });
  });

  describe('Date range queries for retainer periods', () => {
    it('should support date range queries for retainer periods', () => {
      const query = 'WHERE date BETWEEN "2024-01-01" AND "2024-03-31" SHOW hours, invoiced';
      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.where?.dateRange).toEqual({
        start: '2024-01-01',
        end: '2024-03-31'
      });
    });

    it('should handle retainer contract period analysis', () => {
      const query = `WHERE date BETWEEN "2024-01-01" AND "2024-12-31"
                     SHOW hours, invoiced, utilization, progress
                     VIEW chart
                     CHART trend
                     PERIOD all-time`;

      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.where?.dateRange?.start).toBe('2024-01-01');
      expect(result.where?.dateRange?.end).toBe('2024-12-31');
      expect(result.period).toBe('all-time');
    });
  });

  describe('Multi-field queries for comprehensive retainer tracking', () => {
    it('should support all available fields for retainer analysis', () => {
      const query = 'SHOW hours, invoiced, progress, utilization, remaining VIEW full SIZE detailed';
      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.show).toEqual(['hours', 'invoiced', 'progress', 'utilization', 'remaining']);
      expect(result.view).toBe('full');
      expect(result.size).toBe('detailed');
    });

    it('should handle compact retainer summaries', () => {
      const query = 'WHERE year = 2024 SHOW hours, utilization VIEW summary SIZE compact';
      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.show).toEqual(['hours', 'utilization']);
      expect(result.view).toBe('summary');
      expect(result.size).toBe('compact');
    });
  });

  describe('Complex retainer scenarios', () => {
    it('should handle multi-client retainer tracking', () => {
      const queries = [
        'WHERE project = "Client A Retainer" SHOW hours, utilization',
        'WHERE project = "Client B Support" SHOW hours, invoiced',
        'WHERE project = "Development Retainer" SHOW hours, progress'
      ];

      queries.forEach(query => {
        expect(() => {
          const ast = parseQuery(query);
          const result = interpreter.interpret(ast);
          expect(result.where?.project).toBeDefined();
        }).not.toThrow();
      });
    });

    it('should support retainer budget tracking with all chart types', () => {
      const chartTypes = ['trend', 'monthly', 'budget'];

      chartTypes.forEach(chartType => {
        const query = `WHERE year = 2024 SHOW hours, invoiced, remaining VIEW chart CHART ${chartType}`;
        const ast = parseQuery(query);
        const result = interpreter.interpret(ast);

        expect(result.chartType).toBe(chartType);
        expect(result.view).toBe('chart');
      });
    });
  });

  describe('Performance and error handling', () => {
    it('should parse complex retainer queries efficiently', () => {
      const complexQuery = `WHERE year = 2024 AND month >= 1 AND project = "Complex Retainer Project"
                           SHOW hours, invoiced, progress, utilization, remaining
                           VIEW full
                           CHART trend
                           PERIOD current-year
                           SIZE detailed`;

      const startTime = performance.now();

      expect(() => {
        const ast = parseQuery(complexQuery);
        const result = interpreter.interpret(ast);

        // Verify key components are parsed
        expect(result.where?.year).toBe(2024);
        expect(result.where?.project).toBe('Complex Retainer Project');
        expect(result.show?.length).toBe(5);
        expect(result.view).toBe('full');
        expect(result.chartType).toBe('trend');
      }).not.toThrow();

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle invalid retainer syntax gracefully', () => {
      const invalidQueries = [
        'WHERE invalid_field = "value"',
        'SHOW invalid_field',
        'VIEW invalid_view',
        'CHART invalid_chart'
      ];

      invalidQueries.forEach(query => {
        expect(() => {
          parseQuery(query);
        }).toThrow(ParseError);
      });
    });
  });

  describe('Real-world retainer use cases', () => {
    it('should support monthly retainer health check', () => {
      const query = `WHERE year = 2024 AND month = 3
                     SHOW hours, utilization, remaining
                     VIEW chart
                     CHART monthly
                     SIZE normal`;

      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.where?.year).toBe(2024);
      expect(result.where?.month).toBe(3);
      expect(result.show).toContain('utilization');
      expect(result.show).toContain('remaining');
    });

    it('should support retainer contract review', () => {
      const query = `WHERE date BETWEEN "2024-01-01" AND "2024-12-31" AND project = "Annual Retainer"
                     SHOW hours, invoiced, progress, utilization
                     VIEW full
                     CHART trend
                     PERIOD all-time
                     SIZE detailed`;

      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.where?.dateRange?.start).toBe('2024-01-01');
      expect(result.where?.project).toBe('Annual Retainer');
      expect(result.show).toContain('progress');
      expect(result.period).toBe('all-time');
    });

    it('should support retainer utilization monitoring', () => {
      const query = `WHERE year >= 2023 AND project = "Support Retainer"
                     SHOW hours, utilization
                     VIEW chart
                     CHART trend
                     PERIOD last-12-months`;

      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      expect(result.where?.year).toBe(2023);
      expect(result.where?.project).toBe('Support Retainer');
      expect(result.period).toBe('last-12-months');
    });
  });

  describe('Query validation for retainer scenarios', () => {
    it('should validate logical constraints for retainer queries', () => {
      // Test that CHART without appropriate VIEW throws error
      expect(() => {
        parseQuery('VIEW summary CHART monthly');
      }).toThrow(ParseError);
    });

    it('should prevent duplicate non-WHERE clauses in retainer queries', () => {
      expect(() => {
        parseQuery('VIEW summary VIEW chart');
      }).toThrow(ParseError);

      expect(() => {
        parseQuery('CHART trend CHART monthly');
      }).toThrow(ParseError);
    });

    it('should provide helpful error messages for retainer query issues', () => {
      try {
        parseQuery('WHERE invalid_retainer_field = "value"');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ParseError);
        expect(error.message).toContain('Expected');
      }
    });
  });

  describe('Integration with retainer workflows', () => {
    it('should provide complete query result structure for retainer dashboard', () => {
      const query = `WHERE year = 2024 AND project = "Development Retainer"
                     SHOW hours, utilization, progress, remaining
                     VIEW full
                     CHART trend
                     SIZE detailed`;

      const ast = parseQuery(query);
      const result = interpreter.interpret(ast);

      // Verify all expected properties are present for retainer processing
      expect(result).toHaveProperty('where');
      expect(result).toHaveProperty('show');
      expect(result).toHaveProperty('view');
      expect(result).toHaveProperty('chartType');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('period');

      // Verify structure completeness
      expect(result.where?.project).toBe('Development Retainer');
      expect(result.view).toBe('full');
      expect(result.show).toContain('utilization');
      expect(result.show).toContain('remaining');
    });

    it('should support retainer reporting scenarios', () => {
      const reportingQueries = [
        {
          name: 'Monthly Retainer Summary',
          query: 'WHERE year = 2024 AND month = 3 SHOW hours, utilization VIEW summary',
          expectedFields: ['hours', 'utilization']
        },
        {
          name: 'Quarterly Retainer Analysis',
          query: 'WHERE date BETWEEN "2024-01-01" AND "2024-03-31" SHOW hours, invoiced, progress VIEW chart CHART trend',
          expectedFields: ['hours', 'invoiced', 'progress']
        },
        {
          name: 'Annual Retainer Review',
          query: 'WHERE year = 2024 SHOW hours, invoiced, utilization, remaining VIEW full PERIOD all-time SIZE detailed',
          expectedFields: ['hours', 'invoiced', 'utilization', 'remaining']
        }
      ];

      reportingQueries.forEach(({ name, query, expectedFields }) => {
        const ast = parseQuery(query);
        const result = interpreter.interpret(ast);

        expectedFields.forEach(field => {
          expect(result.show).toContain(field);
        });
      });
    });
  });
});
