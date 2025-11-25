# Testing Documentation

## Overview

The Timesheet Report Plugin uses **Jest** as the primary testing framework for comprehensive unit testing of the grammar-based query parser. This document outlines the testing strategy, setup, and how to run tests.

## Test Framework

### Jest Configuration

The project uses **Jest** with **ts-jest** for TypeScript support:

- **Framework**: Jest 29.x
- **TypeScript**: ts-jest transformer
- **Environment**: Node.js
- **Coverage**: Built-in Jest coverage

### Why Jest?

1. **Mature & Stable**: Industry-standard testing framework
2. **TypeScript Support**: Excellent ts-jest integration
3. **Built-in Features**: Mocking, coverage, snapshots
4. **Node.js Compatibility**: Works with older Node versions
5. **Rich Ecosystem**: Extensive documentation and community

## Test Structure

```
tests/
├── tokenizer.test.ts    # Lexical analysis tests
├── parser.test.ts       # Syntax parsing tests  
├── interpreter.test.ts  # Query execution tests
└── ast.test.ts         # AST utilities tests
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run legacy simple tests
npm run test:legacy
```

### Test Output

Jest provides detailed output including:
- Test results with pass/fail status
- Error messages with stack traces
- Performance timing
- Coverage reports (when enabled)

## Test Categories

### 1. Tokenizer Tests (`tokenizer.test.ts`)

Tests lexical analysis functionality:

- **Basic tokenization**: Keywords, operators, literals
- **String handling**: Quotes, escaping, empty strings
- **Date recognition**: YYYY-MM-DD format validation
- **Number parsing**: Integers, decimals, edge cases
- **Error handling**: Unterminated strings, invalid characters
- **Position tracking**: Line and column numbers

**Example test:**
```typescript
it('should tokenize simple WHERE clause', () => {
  const tokenizer = new Tokenizer('WHERE year = 2024');
  const tokens = tokenizer.tokenize();
  
  expect(tokens).toHaveLength(5);
  expect(tokens[0].type).toBe(TokenType.WHERE);
  expect(tokens[1].value).toBe('year');
});
```

### 2. Parser Tests (`parser.test.ts`)

Tests syntax analysis and AST generation:

- **Basic parsing**: Simple and complex queries
- **Clause parsing**: WHERE, VIEW, CHART, PERIOD, SIZE
- **Expression handling**: Binary expressions, BETWEEN ranges
- **Error handling**: Invalid syntax, helpful error messages
- **Edge cases**: Unicode, long strings, malformed input

**Example test:**
```typescript
it('should parse BETWEEN expressions', () => {
  const parser = new Parser('WHERE date BETWEEN "2024-01-01" AND "2024-12-31"');
  const ast = parser.parse();
  
  const condition = ast.clauses[0].conditions[0];
  expect(condition.operator).toBe('BETWEEN');
  expect(condition.right.type).toBe('DateRange');
});
```

### 3. Interpreter Tests (`interpreter.test.ts`)

Tests AST execution and query object generation:

- **Query interpretation**: AST to TimesheetQuery conversion
- **Default values**: Proper fallback handling
- **Type validation**: String, number, date handling
- **Complex queries**: Multi-clause interpretation
- **Error handling**: Malformed AST, invalid values

**Example test:**
```typescript
it('should interpret complex dashboard query', () => {
  const query = `
    WHERE year = 2024 AND project = "Client Alpha"
    VIEW full
    CHART trend
    SIZE detailed
  `;
  
  const result = parseAndInterpret(query);
  
  expect(result).toEqual({
    where: { year: 2024, project: 'Client Alpha' },
    view: 'full',
    chartType: 'trend', 
    size: 'detailed',
    period: 'current-year' // default
  });
});
```

### 4. AST Utilities Tests (`ast.test.ts`)

Tests AST manipulation and utility functions:

- **Tree traversal**: walkAST functionality
- **Node searching**: findNodesByType with type safety
- **Statistics**: Node counting and analysis
- **Validation**: AST structure verification
- **Factory functions**: Node creation helpers

**Example test:**
```typescript
it('should find all literal nodes', () => {
  const literals = findNodesByType<LiteralNode>(ast, 'Literal');
  
  expect(literals).toHaveLength(2);
  expect(literals[0].value).toBe(2024);
  expect(literals[1].value).toBe('Test');
});
```

## Test Status

### Current State

- **Framework**: ✅ Jest configured and working
- **Test Files**: ✅ Comprehensive test suites created
- **Coverage**: ⚠️ Some test failures due to implementation details
- **CI Ready**: ✅ Can be integrated into CI/CD pipeline

### Known Test Failures

Some tests are failing because they were written for idealized behavior but the actual implementation has different behavior:

1. **Tokenizer Issues**:
   - NEWLINE token handling differs from expected
   - Column tracking has off-by-one differences
   - Error handling more strict than expected

2. **Parser Issues**:
   - Keyword recognition case sensitivity
   - Error message format variations
   - AST structure minor differences

### Fixing Test Failures

To align tests with actual implementation:

1. **Update test expectations** to match real tokenizer behavior
2. **Fix implementation bugs** where tests reveal genuine issues
3. **Refine error handling** to match test expectations
4. **Standardize behavior** between components

## Test Best Practices

### Writing Tests

1. **Descriptive names**: Clear test purpose
2. **Arrange-Act-Assert**: Standard test structure  
3. **Edge cases**: Test boundary conditions
4. **Error scenarios**: Test failure paths
5. **Type safety**: Use proper TypeScript types

### Test Organization

1. **Group related tests** with `describe` blocks
2. **Use `beforeEach`** for test setup
3. **Mock external dependencies** when needed
4. **Test one thing** per test case
5. **Keep tests independent**

### Performance Testing

```typescript
it('should parse complex queries efficiently', () => {
  const start = Date.now();
  
  for (let i = 0; i < 1000; i++) {
    const parser = new Parser(complexQuery);
    parser.parse();
  }
  
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(100); // Under 100ms for 1000 parses
});
```

## Coverage Reports

Enable coverage reporting:

```bash
npm run test:coverage
```

Coverage targets:
- **Lines**: >80%
- **Functions**: >80%
- **Branches**: >70%
- **Statements**: >80%

## Integration with Development

### Pre-commit Testing

Run tests before commits:

```bash
# Quick test
npm test

# Full test with coverage
npm run test:coverage

# Legacy compatibility test
npm run test:legacy
```

### Development Workflow

1. **Write test first** (TDD approach)
2. **Implement feature** to make test pass
3. **Refactor** while keeping tests green
4. **Add edge case tests** as needed
5. **Update documentation** with examples

## CI/CD Integration

Jest integrates well with CI systems:

### GitHub Actions Example

```yaml
- name: Run Tests
  run: |
    npm install
    npm test
    npm run test:coverage
    
- name: Upload Coverage
  uses: codecov/codecov-action@v2
  with:
    file: ./coverage/lcov.info
```

### Test Automation

- **Automatic test runs** on PR creation
- **Coverage reports** in PR comments
- **Test failure notifications** 
- **Performance regression detection**

## Future Enhancements

### Planned Improvements

1. **Fix existing test failures** to achieve 100% pass rate
2. **Add integration tests** for end-to-end scenarios
3. **Property-based testing** with generated test cases
4. **Visual regression testing** for chart rendering
5. **Benchmark testing** for performance tracking

### Additional Test Types

1. **Snapshot testing** for AST structure validation
2. **Mutation testing** to verify test quality
3. **Contract testing** for API interfaces
4. **Load testing** for large query volumes

## Conclusion

The Jest-based testing framework provides a solid foundation for ensuring code quality and preventing regressions. While some tests currently fail due to implementation differences, the framework itself is robust and ready for production use.

**Key Benefits:**
- **Professional testing framework** with industry-standard features
- **Comprehensive test coverage** across all parser components  
- **Type-safe testing** with full TypeScript support
- **Performance monitoring** with built-in timing
- **CI/CD ready** for automated testing workflows

The testing infrastructure demonstrates the commitment to code quality and provides confidence for continued development and maintenance of the grammar-based query parser.
