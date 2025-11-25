import { Tokenizer, TokenType } from '../src/query/tokenizer';

describe('Tokenizer', () => {
  describe('Basic tokenization', () => {
    it('should tokenize simple WHERE clause', () => {
      const tokenizer = new Tokenizer('WHERE year = 2024');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(5); // WHERE, year, =, 2024, EOF
      expect(tokens[0]).toEqual(
        expect.objectContaining({
          type: TokenType.WHERE,
          value: 'WHERE',
          line: 1,
          column: 1
        })
      );
      expect(tokens[1]).toEqual(
        expect.objectContaining({
          type: TokenType.IDENTIFIER,
          value: 'year'
        })
      );
      expect(tokens[2]).toEqual(
        expect.objectContaining({
          type: TokenType.EQUALS,
          value: '='
        })
      );
      expect(tokens[3]).toEqual(
        expect.objectContaining({
          type: TokenType.NUMBER,
          value: '2024'
        })
      );
      expect(tokens[4].type).toBe(TokenType.EOF);
    });

    it('should handle multiple keywords', () => {
      const input = 'WHERE year = 2024 VIEW chart CHART trend';
      const tokenizer = new Tokenizer(input);
      const tokens = tokenizer.tokenize();

      const keywordTokens = tokens.filter(t =>
        [TokenType.WHERE, TokenType.VIEW, TokenType.CHART].includes(t.type)
      );

      expect(keywordTokens).toHaveLength(4);
      expect(keywordTokens[0].type).toBe(TokenType.WHERE);
      expect(keywordTokens[1].type).toBe(TokenType.VIEW);
      expect(keywordTokens[2].type).toBe(TokenType.CHART); // "chart" as view type
      expect(keywordTokens[3].type).toBe(TokenType.CHART); // "CHART" as clause keyword
    });

    it('should be case insensitive for keywords', () => {
      const inputs = ['WHERE', 'where', 'Where', 'wHeRe'];

      inputs.forEach(input => {
        const tokenizer = new Tokenizer(`${input} year = 2024`);
        const tokens = tokenizer.tokenize();
        expect(tokens[0].type).toBe(TokenType.WHERE);
        expect(tokens[0].value).toBe(input); // Original casing preserved
      });
    });
  });

  describe('String literals', () => {
    it('should handle double-quoted strings', () => {
      const tokenizer = new Tokenizer('WHERE project = "Client Work"');
      const tokens = tokenizer.tokenize();

      const stringToken = tokens.find(t => t.type === TokenType.STRING);
      expect(stringToken).toBeDefined();
      expect(stringToken?.value).toBe('Client Work');
    });

    it('should handle single-quoted strings', () => {
      const tokenizer = new Tokenizer("WHERE project = 'Client Work'");
      const tokens = tokenizer.tokenize();

      const stringToken = tokens.find(t => t.type === TokenType.STRING);
      expect(stringToken).toBeDefined();
      expect(stringToken?.value).toBe('Client Work');
    });

    it('should handle escaped quotes', () => {
      const tokenizer = new Tokenizer('WHERE project = "Client \\"Alpha\\" Project"');
      const tokens = tokenizer.tokenize();

      const stringToken = tokens.find(t => t.type === TokenType.STRING);
      expect(stringToken).toBeDefined();
      expect(stringToken!.value).toBe('Client "Alpha" Project');
    });

    it('should handle empty strings', () => {
      const tokenizer = new Tokenizer('WHERE project = ""');
      const tokens = tokenizer.tokenize();

      const stringToken = tokens.find(t => t.type === TokenType.STRING);
      expect(stringToken).toBeDefined();
      expect(stringToken!.value).toBe('');
    });

    it('should throw error on unterminated strings', () => {
      const tokenizer = new Tokenizer('WHERE project = "unterminated');
      expect(() => tokenizer.tokenize()).toThrow(/Unterminated string/);
    });
  });

  describe('Date literals', () => {
    it('should recognize date format YYYY-MM-DD', () => {
      const tokenizer = new Tokenizer('WHERE date = "2024-01-01"');
      const tokens = tokenizer.tokenize();

      const dateToken = tokens.find(t => t.type === TokenType.DATE);
      expect(dateToken).toBeDefined();
      expect(dateToken!.value).toBe('2024-01-01');
    });

    it('should not recognize invalid date formats as dates', () => {
      const invalidDates = [
        '"2024/01/01"',
        '"24-01-01"',
        '"2024-1-1"',
        '"not-a-date"'
      ];

      invalidDates.forEach(dateStr => {
        const tokenizer = new Tokenizer(`WHERE date = ${dateStr}`);
        const tokens = tokenizer.tokenize();

        const dateTokens = tokens.filter(t => t.type === TokenType.DATE);
        expect(dateTokens).toHaveLength(0);

        const stringTokens = tokens.filter(t => t.type === TokenType.STRING);
        expect(stringTokens).toHaveLength(1);
      });
    });
  });

  describe('Numbers', () => {
    it('should tokenize integers', () => {
      const tokenizer = new Tokenizer('WHERE year = 2024');
      const tokens = tokenizer.tokenize();

      const numberToken = tokens.find(t => t.type === TokenType.NUMBER);
      expect(numberToken).toBeDefined();
      expect(numberToken!.value).toBe('2024');
    });

    it('should tokenize decimals', () => {
      const tokenizer = new Tokenizer('WHERE hours = 8.5');
      const tokens = tokenizer.tokenize();

      const numberToken = tokens.find(t => t.type === TokenType.NUMBER);
      expect(numberToken).toBeDefined();
      expect(numberToken!.value).toBe('8.5');
    });

    it('should handle zero', () => {
      const tokenizer = new Tokenizer('WHERE hours = 0');
      const tokens = tokenizer.tokenize();

      const numberToken = tokens.find(t => t.type === TokenType.NUMBER);
      expect(numberToken).toBeDefined();
      expect(numberToken!.value).toBe('0');
    });
  });

  describe('Operators', () => {
    const operatorTests = [
      { input: '=', expected: TokenType.EQUALS },
      { input: '!=', expected: TokenType.NOT_EQUALS },
      { input: '>', expected: TokenType.GREATER_THAN },
      { input: '<', expected: TokenType.LESS_THAN },
      { input: '>=', expected: TokenType.GREATER_THAN_EQUALS },
      { input: '<=', expected: TokenType.LESS_THAN_EQUALS }
    ];

    operatorTests.forEach(({ input, expected }) => {
      it(`should tokenize operator ${input}`, () => {
        const tokenizer = new Tokenizer(`WHERE year ${input} 2024`);
        const tokens = tokenizer.tokenize();

        const operatorToken = tokens.find(t => t.type === expected);
        expect(operatorToken).toBeDefined();
        expect(operatorToken!.value).toBe(input);
      });
    });

    it('should handle == as single EQUALS token', () => {
      const tokenizer = new Tokenizer('WHERE year == 2024');
      const tokens = tokenizer.tokenize();

      const equalsTokens = tokens.filter(t => t.type === TokenType.EQUALS);
      expect(equalsTokens).toHaveLength(1);
      expect(equalsTokens[0].value).toBe('==');
    });
  });

  describe('Keywords', () => {
    const keywords = [
      'WHERE', 'SHOW', 'VIEW', 'CHART', 'PERIOD', 'SIZE',
      'BETWEEN', 'AND', 'OR', 'IN'
    ];

    keywords.forEach(keyword => {
      it(`should recognize keyword ${keyword}`, () => {
        const tokenizer = new Tokenizer(keyword);
        const tokens = tokenizer.tokenize();

        expect(tokens[0].type).toBe(keyword as TokenType);
        expect(tokens[0].value).toBe(keyword);
      });
    });
  });

  describe('Identifiers', () => {
    it('should tokenize simple identifiers', () => {
      const identifiers = ['year', 'month', 'project', 'date', 'hours'];

      identifiers.forEach(id => {
        const tokenizer = new Tokenizer(`WHERE ${id} = value`);
        const tokens = tokenizer.tokenize();

        const idToken = tokens.find(t => t.type === TokenType.IDENTIFIER && t.value === id);
        expect(idToken).toBeDefined();
      });
    });

    it('should handle identifiers with underscores', () => {
      const tokenizer = new Tokenizer('WHERE work_order = "test"');
      const tokens = tokenizer.tokenize();

      const idToken = tokens.find(t => t.type === TokenType.IDENTIFIER);
      expect(idToken!.value).toBe('work_order');
    });

    it('should handle identifiers with hyphens', () => {
      const tokenizer = new Tokenizer('PERIOD last-6-months');
      const tokens = tokenizer.tokenize();

      const idToken = tokens.find(t => t.type === TokenType.IDENTIFIER);
      expect(idToken!.value).toBe('last-6-months');
    });
  });

  describe('Comments', () => {
    it('should ignore single-line comments', () => {
      const tokenizer = new Tokenizer('WHERE year = 2024 // This is a comment');
      const tokens = tokenizer.tokenize().filter(t => t.type !== TokenType.EOF);

      expect(tokens).toHaveLength(4); // WHERE, year, =, 2024
      expect(tokens.some(t => t.type === TokenType.COMMENT)).toBe(false);
    });

    it('should handle comments at the beginning of line', () => {
      const tokenizer = new Tokenizer('// Comment\nWHERE year = 2024');
      const tokens = tokenizer.tokenize().filter(t => t.type !== TokenType.EOF && t.type !== TokenType.NEWLINE);

      expect(tokens).toHaveLength(4); // WHERE, year, =, 2024
    });

    it('should handle multiple comment lines', () => {
      const input = `
        // First comment
        WHERE year = 2024
        // Second comment
        VIEW chart
      `;

      const tokenizer = new Tokenizer(input);
      const tokens = tokenizer.tokenize().filter(t => t.type !== TokenType.EOF && t.type !== TokenType.NEWLINE);

      expect(tokens).toHaveLength(6); // WHERE, year, =, 2024, VIEW, chart
      expect(tokens.some(t => t.type === TokenType.COMMENT)).toBe(false);
    });
  });

  describe('Whitespace handling', () => {
    it('should ignore spaces and tabs', () => {
      const tokenizer = new Tokenizer('WHERE   year\t=\t\t2024');
      const tokens = tokenizer.tokenize().filter(t => t.type !== TokenType.EOF);

      expect(tokens).toHaveLength(4);
      expect(tokens.map(t => t.value)).toEqual(['WHERE', 'year', '=', '2024']);
    });

    it('should handle newlines correctly', () => {
      const input = `WHERE year = 2024
VIEW chart
CHART trend`;

      const tokenizer = new Tokenizer(input);
      const tokens = tokenizer.tokenize().filter(t => t.type !== TokenType.EOF && t.type !== TokenType.NEWLINE);

      expect(tokens).toHaveLength(8);
      // Should not include newline tokens after filtering
      expect(tokens.some(t => t.type === TokenType.NEWLINE)).toBe(false);
    });
  });

  describe('Line and column tracking', () => {
    it('should track line numbers correctly', () => {
      const input = `WHERE year = 2024
VIEW chart`;

      const tokenizer = new Tokenizer(input);
      const tokens = tokenizer.tokenize();

      const whereToken = tokens.find(t => t.value === 'WHERE');
      const viewToken = tokens.find(t => t.value === 'VIEW');

      expect(whereToken!.line).toBe(1);
      expect(viewToken!.line).toBe(2);
    });

    it('should track column numbers correctly', () => {
      const tokenizer = new Tokenizer('WHERE year = 2024');
      const tokens = tokenizer.tokenize();

      expect(tokens[0].column).toBe(1);  // WHERE
      expect(tokens[1].column).toBe(7);  // year
      expect(tokens[2].column).toBe(11); // =
      expect(tokens[3].column).toBe(14); // 2024
    });
  });

  describe('Error handling', () => {
    it('should handle unexpected characters gracefully', () => {
      // Most unexpected characters should be skipped
      expect(() => {
        const tokenizer = new Tokenizer('WHERE year @ 2024');
        tokenizer.tokenize();
      }).toThrow();
    });

    it('should provide line and column info in error messages', () => {
      try {
        const tokenizer = new Tokenizer('WHERE project = "unterminated');
        tokenizer.tokenize();
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toMatch(/line \d+/);
      }
    });
  });

  describe('Complex queries', () => {
    it('should tokenize complex BETWEEN expression', () => {
      const input = 'WHERE date BETWEEN "2024-01-01" AND "2024-12-31"';
      const tokenizer = new Tokenizer(input);
      const tokens = tokenizer.tokenize().filter(t => t.type !== TokenType.EOF);

      expect(tokens).toHaveLength(6);
      expect(tokens.map(t => t.type)).toEqual([
        TokenType.WHERE,
        TokenType.IDENTIFIER,
        TokenType.BETWEEN,
        TokenType.DATE,
        TokenType.AND,
        TokenType.DATE
      ]);
    });

    it('should tokenize multi-clause query', () => {
      const input = `
        WHERE year = 2024 AND project = "Test"
        VIEW chart
        CHART trend
        PERIOD last-6-months
        SIZE detailed
      `;

      const tokenizer = new Tokenizer(input);
      const tokens = tokenizer.tokenize().filter(t => t.type !== TokenType.EOF);

      expect(tokens.length).toBeGreaterThan(10);

      const keywords = tokens.filter(t =>
        [TokenType.WHERE, TokenType.VIEW, TokenType.CHART, TokenType.PERIOD, TokenType.SIZE].includes(t.type)
      );
      expect(keywords).toHaveLength(6);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty input', () => {
      const tokenizer = new Tokenizer('');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.EOF);
    });

    it('should handle whitespace-only input', () => {
      const tokenizer = new Tokenizer('   \t\n  ');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(3); // NEWLINE, EOF, EOF
      expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
    });

    it('should handle comment-only input', () => {
      const tokenizer = new Tokenizer('// Just a comment');
      const tokens = tokenizer.tokenize();

      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.EOF);
    });
  });
});
