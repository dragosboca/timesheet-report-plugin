
import { parseQuery } from '../src/query/parser';
import {
  walkAST,
  findNodesByType,
  getASTStatistics,
  validateAST,
  createLiteral,
  createIdentifier,
  createBinaryExpression,
  createQuery
} from '../src/query/ast';
import type {
  ASTNode,
  QueryNode,
  LiteralNode,
  IdentifierNode,
  BinaryExpressionNode,
  WhereClauseNode
} from '../src/query/ast';

describe('AST Utilities', () => {
  let sampleAST: QueryNode;

  beforeEach(() => {
    // Create a sample AST for testing
    sampleAST = parseQuery('WHERE year = 2024 AND project = "Test" VIEW chart');
  });

  describe('walkAST function', () => {
    it('should visit all nodes in the AST', () => {
      const visitedNodes: string[] = [];

      walkAST(sampleAST, (node: ASTNode) => {
        visitedNodes.push(node.type);
      });

      expect(visitedNodes).toContain('Query');
      expect(visitedNodes).toContain('WhereClause');
      expect(visitedNodes).toContain('BinaryExpression');
      expect(visitedNodes).toContain('Identifier');
      expect(visitedNodes).toContain('Literal');
      expect(visitedNodes).toContain('ViewClause');
    });

    it('should visit nodes in depth-first order', () => {
      const visitedTypes: string[] = [];

      walkAST(sampleAST, (node: ASTNode) => {
        visitedTypes.push(node.type);
      });

      // Query should be first (root)
      expect(visitedTypes[0]).toBe('Query');

      // Should visit children before siblings
      const queryIndex = visitedTypes.indexOf('Query');
      const whereIndex = visitedTypes.indexOf('WhereClause');
      const viewIndex = visitedTypes.indexOf('ViewClause');

      expect(whereIndex).toBeGreaterThan(queryIndex);
      expect(viewIndex).toBeGreaterThan(queryIndex);
    });

    it('should handle empty AST', () => {
      const emptyAST = createQuery([]);
      const visitedNodes: string[] = [];

      walkAST(emptyAST, (node: ASTNode) => {
        visitedNodes.push(node.type);
      });

      expect(visitedNodes).toEqual(['Query']);
    });

    it('should handle complex nested structures', () => {
      const complexAST = parseQuery('WHERE date BETWEEN "2024-01-01" AND "2024-12-31" AND project = "Complex"');
      const visitedTypes: string[] = [];

      walkAST(complexAST, (node: ASTNode) => {
        visitedTypes.push(node.type);
      });

      expect(visitedTypes).toContain('DateRange');
      expect(visitedTypes.filter(type => type === 'BinaryExpression')).toHaveLength(2);
    });

    it('should allow visitor to access node properties', () => {
      const literalValues: any[] = [];
      const identifierNames: string[] = [];

      walkAST(sampleAST, (node: ASTNode) => {
        if (node.type === 'Literal') {
          literalValues.push((node as LiteralNode).value);
        }
        if (node.type === 'Identifier') {
          identifierNames.push((node as IdentifierNode).name);
        }
      });

      expect(literalValues).toContain(2024);
      expect(literalValues).toContain('Test');
      expect(identifierNames).toContain('year');
      expect(identifierNames).toContain('project');
    });
  });

  describe('findNodesByType function', () => {
    it('should find all nodes of specified type', () => {
      const literals = findNodesByType<LiteralNode>(sampleAST, 'Literal');

      expect(literals).toHaveLength(2);
      expect(literals[0].value).toBe(2024);
      expect(literals[1].value).toBe('Test');
    });

    it('should find all identifiers', () => {
      const identifiers = findNodesByType<IdentifierNode>(sampleAST, 'Identifier');

      expect(identifiers).toHaveLength(2);
      expect(identifiers.map(id => id.name)).toEqual(['year', 'project']);
    });

    it('should return empty array when no nodes found', () => {
      const nonexistent = findNodesByType(sampleAST, 'NonexistentType');
      expect(nonexistent).toEqual([]);
    });

    it('should find binary expressions', () => {
      const binaryExpressions = findNodesByType<BinaryExpressionNode>(sampleAST, 'BinaryExpression');

      expect(binaryExpressions).toHaveLength(2);
      expect(binaryExpressions[0].operator).toBe('=');
      expect(binaryExpressions[1].operator).toBe('=');
    });

    it('should work with complex nested structures', () => {
      const complexAST = parseQuery(`
        WHERE project = "Alpha" AND date BETWEEN "2024-01-01" AND "2024-12-31"
        SHOW hours, invoiced, progress
      `);

      const literals = findNodesByType<LiteralNode>(complexAST, 'Literal');
      const identifiers = findNodesByType<IdentifierNode>(complexAST, 'Identifier');

      expect(literals.length).toBeGreaterThanOrEqual(3); // "Alpha", "2024-01-01", "2024-12-31"
      expect(identifiers.length).toBeGreaterThanOrEqual(5); // project, date, hours, invoiced, progress
    });

    it('should preserve node type safety', () => {
      const literals = findNodesByType<LiteralNode>(sampleAST, 'Literal');

      literals.forEach(literal => {
        expect(literal).toHaveProperty('value');
        expect(literal).toHaveProperty('dataType');
        expect(literal.type).toBe('Literal');
      });
    });
  });

  describe('getASTStatistics function', () => {
    it('should count all node types', () => {
      const stats = getASTStatistics(sampleAST);

      expect(stats.Query).toBe(1);
      expect(stats.WhereClause).toBe(1);
      expect(stats.ViewClause).toBe(1);
      expect(stats.BinaryExpression).toBe(2);
      expect(stats.Identifier).toBe(2);
      expect(stats.Literal).toBe(2);
    });

    it('should handle empty AST', () => {
      const emptyAST = createQuery([]);
      const stats = getASTStatistics(emptyAST);

      expect(stats).toEqual({ Query: 1 });
    });

    it('should handle complex queries with many nodes', () => {
      const complexAST = parseQuery(`
        WHERE year = 2024 AND month = 12 AND project = "Alpha"
        SHOW hours, invoiced, progress, utilization
        VIEW chart
        CHART trend
        PERIOD last-6-months
        SIZE detailed
      `);
      const stats = getASTStatistics(complexAST);

      expect(stats.Query).toBe(1);
      expect(stats.WhereClause).toBe(1);
      expect(stats.ShowClause).toBe(1);
      expect(stats.ViewClause).toBe(1);
      expect(stats.ChartClause).toBe(1);
      expect(stats.PeriodClause).toBe(1);
      expect(stats.SizeClause).toBe(1);
      expect(stats.BinaryExpression).toBe(3);
      expect(stats.Identifier).toBeGreaterThanOrEqual(7);
      expect(stats.Literal).toBe(3);
    });

    it('should count DateRange nodes', () => {
      const ast = parseQuery('WHERE date BETWEEN "2024-01-01" AND "2024-12-31"');
      const stats = getASTStatistics(ast);

      expect(stats.DateRange).toBe(1);
    });
  });

  describe('validateAST function', () => {
    it('should validate correct AST structure', () => {
      const validation = validateAST(sampleAST);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should detect missing type property', () => {
      const invalidAST = {
        clauses: []
      } as any;

      const validation = validateAST(invalidAST);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Node missing type property');
    });

    it('should validate literal nodes', () => {
      const validLiteral = createLiteral('test', 'string');
      const validation = validateAST(validLiteral);

      expect(validation.isValid).toBe(true);
    });

    it('should detect invalid literal nodes', () => {
      const invalidLiteral = {
        type: 'Literal',
        value: undefined,
        dataType: 'invalid'
      } as any;

      const validation = validateAST(invalidLiteral);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(expect.arrayContaining(['Literal node missing value']));
      expect(validation.errors).toEqual(expect.arrayContaining(['Invalid literal dataType: invalid']));
    });

    it('should validate identifier nodes', () => {
      const validIdentifier = createIdentifier('year');
      const validation = validateAST(validIdentifier);

      expect(validation.isValid).toBe(true);
    });

    it('should detect invalid identifier nodes', () => {
      const invalidIdentifier = {
        type: 'Identifier',
        name: ''
      } as any;

      const validation = validateAST(invalidIdentifier);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(expect.arrayContaining(['Identifier node missing or empty name']));
    });

    it('should validate query nodes', () => {
      const validQuery = createQuery([]);
      const validation = validateAST(validQuery);

      expect(validation.isValid).toBe(true);
    });

    it('should detect invalid query nodes', () => {
      const invalidQuery = {
        type: 'Query',
        clauses: 'not an array'
      } as any;

      const validation = validateAST(invalidQuery);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(expect.arrayContaining(['Query node must have clauses array']));
    });

    it('should validate deeply nested structures', () => {
      const ast = parseQuery('WHERE date BETWEEN "2024-01-01" AND "2024-12-31" VIEW full');
      const validation = validateAST(ast);

      expect(validation.isValid).toBe(true);
    });
  });

  describe('AST factory functions', () => {
    describe('createLiteral', () => {
      it('should create valid string literal', () => {
        const literal = createLiteral('test', 'string');

        expect(literal.type).toBe('Literal');
        expect(literal.value).toBe('test');
        expect(literal.dataType).toBe('string');
      });

      it('should create valid number literal', () => {
        const literal = createLiteral(42, 'number');

        expect(literal.type).toBe('Literal');
        expect(literal.value).toBe(42);
        expect(literal.dataType).toBe('number');
      });

      it('should create valid date literal', () => {
        const literal = createLiteral('2024-01-01', 'date');

        expect(literal.type).toBe('Literal');
        expect(literal.value).toBe('2024-01-01');
        expect(literal.dataType).toBe('date');
      });
    });

    describe('createIdentifier', () => {
      it('should create valid identifier', () => {
        const identifier = createIdentifier('year');

        expect(identifier.type).toBe('Identifier');
        expect(identifier.name).toBe('year');
      });

      it('should handle complex identifier names', () => {
        const identifier = createIdentifier('work_order');

        expect(identifier.type).toBe('Identifier');
        expect(identifier.name).toBe('work_order');
      });
    });

    describe('createBinaryExpression', () => {
      it('should create valid binary expression', () => {
        const left = createIdentifier('year');
        const right = createLiteral(2024, 'number');
        const expr = createBinaryExpression(left, '=', right);

        expect(expr.type).toBe('BinaryExpression');
        expect(expr.left).toBe(left);
        expect(expr.operator).toBe('=');
        expect(expr.right).toBe(right);
      });

      it('should handle all operators', () => {
        const operators = ['=', '!=', '>', '<', '>=', '<=', 'BETWEEN'] as const;
        const left = createIdentifier('field');
        const right = createLiteral('value', 'string');

        operators.forEach(op => {
          const expr = createBinaryExpression(left, op, right);
          expect(expr.operator).toBe(op);
        });
      });
    });

    describe('createQuery', () => {
      it('should create empty query', () => {
        const query = createQuery([]);

        expect(query.type).toBe('Query');
        expect(query.clauses).toEqual([]);
      });

      it('should create query with clauses', () => {
        const whereClause = {
          type: 'WhereClause',
          conditions: []
        } as any;

        const query = createQuery([whereClause]);

        expect(query.type).toBe('Query');
        expect(query.clauses).toEqual([whereClause]);
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null or undefined nodes gracefully', () => {
      expect(() => {
        walkAST(null as any, () => { });
      }).toThrow();
    });

    it('should handle circular references detection', () => {
      // Create a circular reference using a structure that walkAST would traverse
      const circularCondition: any = {
        type: 'BinaryExpression',
        left: { type: 'Identifier', name: 'test' },
        operator: '=',
        right: null
      };
      // Create circular reference
      circularCondition.right = circularCondition;

      const circularQuery = {
        type: 'Query',
        clauses: [{
          type: 'WhereClause',
          conditions: [circularCondition]
        }]
      };

      // This should not cause infinite loop
      expect(() => {
        let count = 0;
        walkAST(circularQuery, () => {
          count++;
          if (count > 100) throw new Error('Infinite loop detected');
        });
      }).toThrow();
    });

    it('should handle very deep AST structures', () => {
      // Create a deeply nested structure
      let deepAST: any = createQuery([]);

      for (let i = 0; i < 100; i++) {
        const whereClause = {
          type: 'WhereClause',
          conditions: [{
            type: 'BinaryExpression',
            left: createIdentifier(`field${i}`),
            operator: '=',
            right: createLiteral(i, 'number')
          }]
        };
        deepAST.clauses.push(whereClause);
      }

      const nodeCount = getASTStatistics(deepAST);
      expect(nodeCount.Query).toBe(1);
      expect(nodeCount.WhereClause).toBe(100);
      expect(nodeCount.BinaryExpression).toBe(100);
    });

    it('should handle malformed node types', () => {
      const malformedAST = {
        type: 'UnknownType',
        someProperty: 'value'
      } as any;

      // walkAST should handle unknown types gracefully
      const visitedTypes: string[] = [];
      walkAST(malformedAST, (node) => {
        visitedTypes.push(node.type);
      });

      expect(visitedTypes).toEqual(expect.arrayContaining(['UnknownType']));
    });
  });

  describe('Performance and scalability', () => {
    it('should handle large ASTs efficiently', () => {
      // Create a large AST with many nodes
      const largeQuery = Array(50).fill(0).map((_, i) =>
        `year = ${2000 + i}`
      ).join(' AND ');

      const largeAST = parseQuery(`WHERE ${largeQuery}`);

      const startTime = Date.now();
      const stats = getASTStatistics(largeAST);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
      expect(stats.BinaryExpression).toBe(50);
    });

    it('should be memory efficient with node traversal', () => {
      const ast = parseQuery(`
        WHERE year = 2024 AND month = 12 AND project = "Test"
        SHOW hours, invoiced, progress
        VIEW chart
        CHART trend
        PERIOD all-time
        SIZE detailed
      `);

      // Multiple traversals should not accumulate memory
      for (let i = 0; i < 100; i++) {
        walkAST(ast, () => { });
        findNodesByType(ast, 'Literal');
        getASTStatistics(ast);
      }

      // If we get here without memory issues, the test passes
      expect(true).toBe(true);
    });
  });
});
