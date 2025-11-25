import { Parser, ParseError } from '../src/query/parser';
import type { QueryNode, WhereClauseNode, ViewClauseNode, BinaryExpressionNode } from '../src/query/ast';

describe('Parser', () => {
  describe('Basic parsing', () => {
    it('should parse empty query', () => {
      const parser = new Parser('');
      const ast = parser.parse();

      expect(ast.type).toBe('Query');
      expect(ast.clauses).toHaveLength(0);
    });

    it('should parse simple WHERE clause', () => {
      const parser = new Parser('WHERE year = 2024');
      const ast = parser.parse();

      expect(ast.type).toBe('Query');
      expect(ast.clauses).toHaveLength(1);
      expect(ast.clauses[0].type).toBe('WhereClause');

      const whereClause = ast.clauses[0] as WhereClauseNode;
      expect(whereClause.conditions).toHaveLength(1);

      const condition = whereClause.conditions[0];
      expect(condition.type).toBe('BinaryExpression');
      expect(condition.left.type).toBe('Identifier');
      expect(condition.operator).toBe('=');
      expect(condition.right.type).toBe('Literal');
    });

    it('should parse multiple clauses', () => {
      const parser = new Parser('WHERE year = 2024 VIEW chart CHART trend');
      const ast = parser.parse();

      expect(ast.clauses).toHaveLength(3);
      expect(ast.clauses[0].type).toBe('WhereClause');
      expect(ast.clauses[1].type).toBe('ViewClause');
      expect(ast.clauses[2].type).toBe('ChartClause');
    });

    it('should handle whitespace and newlines', () => {
      const query = `
        WHERE year = 2024
        VIEW chart
        SIZE detailed
      `;

      const parser = new Parser(query);
      const ast = parser.parse();

      expect(ast.clauses).toHaveLength(3);
    });

    it('should ignore comments', () => {
      const query = `
        // This is a comment
        WHERE year = 2024 // Another comment
        VIEW chart
      `;

      const parser = new Parser(query);
      const ast = parser.parse();

      expect(ast.clauses).toHaveLength(2);
    });
  });

  describe('WHERE clause parsing', () => {
    it('should parse single condition', () => {
      const parser = new Parser('WHERE year = 2024');
      const ast = parser.parse();

      const whereClause = ast.clauses[0] as WhereClauseNode;
      expect(whereClause.conditions).toHaveLength(1);

      const condition = whereClause.conditions[0];
      expect(condition.left.name).toBe('year');
      expect(condition.operator).toBe('=');
      expect(condition.right.value).toBe(2024);
    });

    it('should parse multiple conditions with AND', () => {
      const parser = new Parser('WHERE year = 2024 AND month = 12');
      const ast = parser.parse();

      const whereClause = ast.clauses[0] as WhereClauseNode;
      expect(whereClause.conditions).toHaveLength(2);

      expect(whereClause.conditions[0].left.name).toBe('year');
      expect(whereClause.conditions[1].left.name).toBe('month');
    });

    it('should parse string conditions', () => {
      const parser = new Parser('WHERE project = "Client Alpha"');
      const ast = parser.parse();

      const whereClause = ast.clauses[0] as WhereClauseNode;
      const condition = whereClause.conditions[0];

      expect(condition.left.name).toBe('project');
      expect(condition.right.value).toBe('Client Alpha');
      expect(condition.right.dataType).toBe('string');
    });

    it('should parse BETWEEN expressions', () => {
      const parser = new Parser('WHERE date BETWEEN "2024-01-01" AND "2024-12-31"');
      const ast = parser.parse();

      const whereClause = ast.clauses[0] as WhereClauseNode;
      const condition = whereClause.conditions[0];

      expect(condition.operator).toBe('BETWEEN');
      expect(condition.right.type).toBe('DateRange');
      expect(condition.right.start.value).toBe('2024-01-01');
      expect(condition.right.end.value).toBe('2024-12-31');
    });

    it('should handle all comparison operators', () => {
      const operators = ['=', '!=', '>', '<', '>=', '<='];

      operators.forEach(op => {
        const parser = new Parser(`WHERE year ${op} 2024`);
        const ast = parser.parse();

        const whereClause = ast.clauses[0] as WhereClauseNode;
        expect(whereClause.conditions[0].operator).toBe(op);
      });
    });
  });

  describe('VIEW clause parsing', () => {
    const viewTypes = ['summary', 'chart', 'table', 'full'];

    viewTypes.forEach(viewType => {
      it(`should parse VIEW ${viewType}`, () => {
        const parser = new Parser(`VIEW ${viewType}`);
        const ast = parser.parse();

        const viewClause = ast.clauses[0] as ViewClauseNode;
        expect(viewClause.type).toBe('ViewClause');
        expect(viewClause.viewType).toBe(viewType);
      });
    });

    it('should be case insensitive', () => {
      const parser = new Parser('VIEW Chart');
      const ast = parser.parse();

      const viewClause = ast.clauses[0] as ViewClauseNode;
      expect(viewClause.viewType).toBe('chart');
    });
  });

  describe('CHART clause parsing', () => {
    const chartTypes = ['trend', 'monthly', 'budget'];

    chartTypes.forEach(chartType => {
      it(`should parse CHART ${chartType}`, () => {
        const parser = new Parser(`CHART ${chartType}`);
        const ast = parser.parse();

        const chartClause = ast.clauses[0] as any;
        expect(chartClause.type).toBe('ChartClause');
        expect(chartClause.chartType).toBe(chartType);
      });
    });
  });

  describe('PERIOD clause parsing', () => {
    const periods = ['current-year', 'all-time', 'last-6-months', 'last-12-months'];

    periods.forEach(period => {
      it(`should parse PERIOD ${period}`, () => {
        const parser = new Parser(`PERIOD ${period}`);
        const ast = parser.parse();

        const periodClause = ast.clauses[0] as any;
        expect(periodClause.type).toBe('PeriodClause');
        expect(periodClause.period).toBe(period);
      });
    });
  });

  describe('SIZE clause parsing', () => {
    const sizes = ['compact', 'normal', 'detailed'];

    sizes.forEach(size => {
      it(`should parse SIZE ${size}`, () => {
        const parser = new Parser(`SIZE ${size}`);
        const ast = parser.parse();

        const sizeClause = ast.clauses[0] as any;
        expect(sizeClause.type).toBe('SizeClause');
        expect(sizeClause.size).toBe(size);
      });
    });
  });

  describe('SHOW clause parsing', () => {
    it('should parse single field', () => {
      const parser = new Parser('SHOW hours');
      const ast = parser.parse();

      const showClause = ast.clauses[0] as any;
      expect(showClause.type).toBe('ShowClause');
      expect(showClause.fields).toHaveLength(1);
      expect(showClause.fields[0].name).toBe('hours');
    });

    it('should parse multiple fields', () => {
      const parser = new Parser('SHOW hours, invoiced, progress');
      const ast = parser.parse();

      const showClause = ast.clauses[0] as any;
      expect(showClause.fields).toHaveLength(3);
      expect(showClause.fields.map((f: any) => f.name)).toEqual(['hours', 'invoiced', 'progress']);
    });

    it('should handle spaces around commas', () => {
      const parser = new Parser('SHOW hours , invoiced , progress');
      const ast = parser.parse();

      const showClause = ast.clauses[0] as any;
      expect(showClause.fields).toHaveLength(3);
    });
  });

  describe('Complex queries', () => {
    it('should parse complete dashboard query', () => {
      const query = `
        WHERE year = 2024 AND project = "Client Alpha"
        VIEW full
        CHART trend
        PERIOD last-6-months
        SIZE detailed
      `;

      const parser = new Parser(query);
      const ast = parser.parse();

      expect(ast.clauses).toHaveLength(5);

      const clauseTypes = ast.clauses.map(c => c.type);
      expect(clauseTypes).toContain('WhereClause');
      expect(clauseTypes).toContain('ViewClause');
      expect(clauseTypes).toContain('ChartClause');
      expect(clauseTypes).toContain('PeriodClause');
      expect(clauseTypes).toContain('SizeClause');
    });

    it('should parse budget tracking query', () => {
      const query = `
        WHERE project = "Q1 Budget" AND date BETWEEN "2024-01-01" AND "2024-03-31"
        SHOW hours, invoiced, progress, remaining
        VIEW table
        CHART budget
        SIZE normal
      `;

      const parser = new Parser(query);
      const ast = parser.parse();

      expect(ast.clauses).toHaveLength(5);

      const whereClause = ast.clauses[0] as WhereClauseNode;
      expect(whereClause.conditions).toHaveLength(2);

      // Check project condition
      expect(whereClause.conditions[0].left.name).toBe('project');
      expect(whereClause.conditions[0].right.value).toBe('Q1 Budget');

      // Check date range condition
      expect(whereClause.conditions[1].operator).toBe('BETWEEN');
    });

    it('should handle mixed case and formatting', () => {
      const query = `where Year = 2024 view Chart chart Trend`;

      const parser = new Parser(query);
      const ast = parser.parse();

      expect(ast.clauses).toHaveLength(3);
      expect((ast.clauses[1] as ViewClauseNode).viewType).toBe('chart');
    });
  });

  describe('Error handling', () => {
    it('should throw ParseError for invalid keywords', () => {
      expect(() => {
        const parser = new Parser('INVALID year = 2024');
        parser.parse();
      }).toThrow(ParseError);
    });

    it('should throw ParseError for missing operator', () => {
      expect(() => {
        const parser = new Parser('WHERE year 2024');
        parser.parse();
      }).toThrow(ParseError);
    });

    it('should throw ParseError for missing value', () => {
      expect(() => {
        const parser = new Parser('WHERE year =');
        parser.parse();
      }).toThrow(ParseError);
    });

    it('should throw ParseError for invalid view type', () => {
      expect(() => {
        const parser = new Parser('VIEW invalid_view');
        parser.parse();
      }).toThrow(ParseError);

      try {
        const parser = new Parser('VIEW invalid_view');
        parser.parse();
      } catch (error) {
        expect(error).toBeInstanceOf(ParseError);
        expect((error as ParseError).message).toMatch(/Invalid view type/);
      }
    });

    it('should throw ParseError for invalid chart type', () => {
      expect(() => {
        const parser = new Parser('CHART invalid_chart');
        parser.parse();
      }).toThrow(ParseError);
    });

    it('should throw ParseError for invalid BETWEEN syntax', () => {
      expect(() => {
        const parser = new Parser('WHERE date BETWEEN "2024-01-01"');
        parser.parse();
      }).toThrow(ParseError);
    });

    it('should provide helpful error messages', () => {
      try {
        const parser = new Parser('WHERE year');
        parser.parse();
      } catch (error) {
        expect(error).toBeInstanceOf(ParseError);
        expect((error as ParseError).message).toMatch(/Expected comparison operator/);
      }
    });

    it('should include token information in errors', () => {
      try {
        const parser = new Parser('WHERE year = 2024\nINVALID clause');
        parser.parse();
      } catch (error) {
        expect(error).toBeInstanceOf(ParseError);
        const parseError = error as ParseError;
        expect(parseError.token).toBeDefined();
        expect(parseError.token.line).toBeGreaterThan(1);
      }
    });

    it('should handle malformed BETWEEN expressions', () => {
      const malformedQueries = [
        'WHERE date BETWEEN',
        'WHERE date BETWEEN "2024-01-01" AND',
        'WHERE date BETWEEN AND "2024-12-31"'
      ];

      malformedQueries.forEach(query => {
        expect(() => {
          const parser = new Parser(query);
          parser.parse();
        }).toThrow(ParseError);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle queries with only comments', () => {
      const parser = new Parser('// Just a comment\n// Another comment');
      const ast = parser.parse();

      expect(ast.clauses).toHaveLength(0);
    });

    it('should handle trailing operators', () => {
      expect(() => {
        const parser = new Parser('WHERE year = 2024 AND');
        parser.parse();
      }).toThrow(ParseError);
    });

    it('should handle nested quotes in strings', () => {
      const parser = new Parser('WHERE project = "Project \\"Alpha\\""');
      const ast = parser.parse();

      const whereClause = ast.clauses[0] as WhereClauseNode;
      expect(whereClause.conditions[0].right.value).toBe('Project "Alpha"');
    });

    it('should handle numeric edge cases', () => {
      const queries = [
        'WHERE year = 0',
        'WHERE hours = 24.5',
        'WHERE count = 999999'
      ];

      queries.forEach(query => {
        expect(() => {
          const parser = new Parser(query);
          parser.parse();
        }).not.toThrow();
      });
    });

    it('should handle very long strings', () => {
      const longString = 'A'.repeat(1000);
      const parser = new Parser(`WHERE project = "${longString}"`);
      const ast = parser.parse();

      const whereClause = ast.clauses[0] as WhereClauseNode;
      expect(whereClause.conditions[0].right.value).toBe(longString);
    });

    it('should handle Unicode characters', () => {
      const parser = new Parser('WHERE project = "Projet Français 🇫🇷"');
      const ast = parser.parse();

      const whereClause = ast.clauses[0] as WhereClauseNode;
      expect(whereClause.conditions[0].right.value).toBe('Projet Français 🇫🇷');
    });
  });

  describe('AST structure validation', () => {
    it('should create well-formed AST nodes', () => {
      const parser = new Parser('WHERE year = 2024 VIEW chart');
      const ast = parser.parse();

      // Validate root node
      expect(ast).toEqual(expect.objectContaining({
        type: 'Query',
        clauses: expect.any(Array)
      }));

      // Validate WHERE clause structure
      const whereClause = ast.clauses[0] as WhereClauseNode;
      expect(whereClause).toEqual(expect.objectContaining({
        type: 'WhereClause',
        conditions: expect.any(Array)
      }));

      // Validate binary expression structure
      const condition = whereClause.conditions[0];
      expect(condition).toEqual(expect.objectContaining({
        type: 'BinaryExpression',
        left: expect.objectContaining({ type: 'Identifier' }),
        operator: '=',
        right: expect.objectContaining({ type: 'Literal' })
      }));
    });

    it('should maintain immutability of parsed nodes', () => {
      const parser = new Parser('WHERE year = 2024');
      const ast1 = parser.parse();
      const ast2 = parser.parse();

      expect(ast1).not.toBe(ast2); // Different object instances
      expect(ast1).toEqual(ast2); // But equal content
    });
  });
});
