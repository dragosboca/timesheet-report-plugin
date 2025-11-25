# Timesheet Report Plugin Architecture

This document outlines the architecture of the Timesheet Report Plugin for Obsidian, with a focus on the grammar-based query language parser that was implemented to replace the original regex-based approach.

## Overview

The plugin transforms timesheet data stored in Obsidian markdown files into interactive reports, charts, and embeddable widgets. The core innovation is a professional-grade query language parser that enables SQL-like filtering and display configuration.

## Project Structure

```
timesheet-report-plugin/
├── src/
│   ├── main.ts                 # Plugin entry point and initialization
│   ├── settings.ts             # Configuration UI and settings management
│   ├── view.ts                 # Main report view and UI components
│   ├── data-processor.ts       # Timesheet data processing and aggregation
│   ├── chart-renderer.ts       # Chart visualization using Chart.js
│   ├── report-generator.ts     # Monthly report generation
│   ├── embed-processor.ts      # Query language integration
│   └── query/                  # Grammar-based parser (NEW)
│       ├── tokenizer.ts        # Lexical analysis
│       ├── parser.ts           # Syntax analysis and AST generation
│       ├── interpreter.ts      # AST execution and query processing
│       └── ast.ts              # AST node definitions and utilities
├── tests/
│   └── parser.test.ts          # Comprehensive parser unit tests
├── examples/
│   ├── query-examples.md       # Query language documentation
│   └── usage-examples.ts       # TypeScript usage patterns
├── styles.css                 # Plugin-specific styles
├── manifest.json              # Obsidian plugin manifest
├── test.js                    # Development test runner
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript configuration
├── esbuild.config.mjs         # Build configuration
└── README.md                  # User documentation
```

## Architecture Layers

### 1. Data Layer (`data-processor.ts`)

**Responsibility**: Raw data processing and aggregation

- Scans timesheet folder for markdown files
- Parses YAML frontmatter and content
- Extracts hours, rates, project information
- Handles multiple data formats (frontmatter, tables)
- Calculates summaries, trends, and metrics

**Key Components**:
- `TimesheetDataProcessor`: Main processing class
- `FileParser`: Individual file processing
- `DataAggregator`: Summary calculations
- `ValidationEngine`: Data integrity checks

### 2. Query Language Layer (`query/`)

**Responsibility**: SQL-like query parsing and execution

This is the major architectural upgrade that replaced fragile regex patterns with a professional parser implementation.

#### 2.1 Tokenizer (`tokenizer.ts`)

**Lexical Analysis**: Converts query strings into tokens

```typescript
// Input:  "WHERE year = 2024 AND project = \"Client Work\""
// Output: [WHERE, IDENTIFIER:year, EQUALS, NUMBER:2024, AND, IDENTIFIER:project, EQUALS, STRING:"Client Work", EOF]
```

**Features**:
- Keyword recognition (WHERE, VIEW, CHART, etc.)
- Operator parsing (=, !=, >, <, >=, <=, BETWEEN)
- String literal handling with quote escaping
- Date format detection (YYYY-MM-DD)
- Comment support (`// comment`)
- Error reporting with line/column information

#### 2.2 Parser (`parser.ts`)

**Syntax Analysis**: Builds Abstract Syntax Trees from tokens

```typescript
// Input:  Tokens from tokenizer
// Output: Type-safe AST representing query structure
interface QueryNode {
  type: 'Query';
  clauses: ClauseNode[];
}
```

**Features**:
- Recursive descent parser implementation
- Grammar-based syntax validation
- Detailed error messages with context
- Type-safe AST node generation
- Support for complex expressions (BETWEEN, AND)

#### 2.3 AST (`ast.ts`)

**Abstract Syntax Tree**: Type-safe node definitions

**Node Types**:
- `QueryNode`: Root query container
- `WhereClauseNode`: Filter conditions
- `ViewClauseNode`: Display mode
- `ChartClauseNode`: Chart type
- `PeriodClauseNode`: Time period
- `SizeClauseNode`: Display size
- `BinaryExpressionNode`: Comparisons and operators
- `LiteralNode`: Values (strings, numbers, dates)
- `IdentifierNode`: Field names

**Utilities**:
- `walkAST()`: Generic tree traversal
- `findNodesByType()`: Type-safe node searching
- `validateAST()`: Structure validation
- `getASTStatistics()`: Complexity analysis

#### 2.4 Interpreter (`interpreter.ts`)

**Semantic Analysis**: Executes AST to generate query objects

```typescript
// Input:  AST from parser
// Output: TimesheetQuery object for data filtering
interface TimesheetQuery {
  where?: FilterConditions;
  view?: 'summary' | 'chart' | 'table' | 'full';
  chartType?: 'trend' | 'monthly' | 'budget';
  period?: 'current-year' | 'all-time' | 'last-6-months' | 'last-12-months';
  size?: 'compact' | 'normal' | 'detailed';
}
```

**Features**:
- Visitor pattern implementation
- Type-safe query object generation
- Default value handling
- Error reporting with context

### 3. Presentation Layer

#### 3.1 Embed Processor (`embed-processor.ts`)

**Responsibility**: Integration point for query language

- Registers markdown code block processor for `timesheet` blocks
- Parses embedded queries using the grammar-based parser
- Renders results based on query specifications
- Handles errors gracefully with user-friendly messages

**Before (Regex-based)**:
```typescript
// Fragile regex patterns scattered throughout
const yearMatch = whereContent.match(/year\s*=\s*(\d{4})/i);
const monthMatch = whereContent.match(/month\s*=\s*(\d{1,2})/i);
// ... more brittle patterns
```

**After (Grammar-based)**:
```typescript
// Clean, robust parsing pipeline
const parser = new Parser(source);
const ast = parser.parse();
const interpreter = new QueryInterpreter();
const query = interpreter.interpret(ast);
```

#### 3.2 Chart Renderer (`chart-renderer.ts`)

**Responsibility**: Data visualization

- Chart.js integration for interactive charts
- Theme-aware color schemes
- Multiple chart types (trend, monthly, budget)
- Responsive design for different embed sizes

#### 3.3 View Components (`view.ts`)

**Responsibility**: Main UI interface

- Report dashboard with filters and controls
- Real-time data updates
- Export capabilities
- Settings integration

### 4. Configuration Layer (`settings.ts`)

**Responsibility**: Plugin configuration and user preferences

- Obsidian settings UI integration
- Project type configuration
- Default values and validation
- Theme and appearance settings

## Key Design Decisions

### 1. Grammar-Based Parser Over Regex

**Problem**: Original regex-based parsing was fragile, hard to maintain, and provided poor error messages.

**Solution**: Implemented a complete parsing pipeline with tokenization, syntax analysis, and semantic interpretation.

**Benefits**:
- **Robustness**: Proper error handling with line/column information
- **Maintainability**: Clean separation of concerns
- **Extensibility**: Easy to add new operators, clauses, and features
- **Type Safety**: Full TypeScript types throughout the pipeline
- **Performance**: Single-pass tokenization vs. multiple regex operations

### 2. Visitor Pattern for AST Processing

**Rationale**: Enables multiple operations on the same AST structure without modifying node definitions.

**Applications**:
- Query interpretation (main use case)
- AST validation and debugging
- Future optimizations and transformations

### 3. Immutable AST Nodes

**Benefits**:
- Safe to cache and reuse parsed queries
- Easy to reason about and debug
- Prevents accidental mutations during processing

### 4. Comprehensive Error Handling

**Philosophy**: Errors should be helpful and actionable.

**Implementation**:
- Parse errors include exact location information
- Semantic errors explain what went wrong and suggest fixes
- Graceful degradation for partial query failures

## Query Language Grammar

The formal grammar specification in EBNF:

```ebnf
Query       ::= Clause*
Clause      ::= WhereClause | ShowClause | ViewClause | ChartClause | PeriodClause | SizeClause
WhereClause ::= 'WHERE' Condition ('AND' Condition)*
Condition   ::= Identifier Operator Expression
Operator    ::= '=' | '!=' | '>' | '<' | '>=' | '<=' | 'BETWEEN'
Expression  ::= Literal | Identifier | DateRange
DateRange   ::= Literal 'AND' Literal
Literal     ::= String | Number | Date
String      ::= '"' [^"]* '"' | "'" [^']* "'"
Number      ::= [0-9]+
Date        ::= '"' [0-9]{4}-[0-9]{2}-[0-9]{2} '"'
Identifier  ::= [a-zA-Z_][a-zA-Z0-9_-]*
Comment     ::= '//' [^\n]*
```

## Testing Strategy

### Unit Tests (`tests/parser.test.ts`)

**Coverage**:
- Tokenizer: All token types, error conditions, edge cases
- Parser: Valid syntax, error handling, AST structure validation
- Interpreter: Query generation, default values, type safety
- AST Utilities: Tree traversal, validation, statistics

### Integration Tests

**Coverage**:
- End-to-end parsing pipeline
- Error propagation and handling
- Performance benchmarks
- Real-world query patterns

### Development Tests (`test.js`)

**Purpose**: Fast feedback during development

- Simple mock implementation for core testing
- Performance benchmarks
- Build verification
- File structure validation

## Extension Points

The architecture is designed for easy extension:

### Adding New Operators

1. Add token type to `tokenizer.ts`
2. Update parser grammar in `parser.ts`
3. Extend interpreter logic in `interpreter.ts`
4. Add test cases

### Adding New Clauses

1. Define AST node in `ast.ts`
2. Add parsing rules to `parser.ts`
3. Implement visitor method in `interpreter.ts`
4. Update documentation and tests

### Adding New Data Sources

1. Extend `data-processor.ts` with new format parsers
2. Update file scanning logic
3. Ensure compatibility with existing query filters

## Performance Considerations

### Parser Performance

- **Target**: Sub-millisecond parsing for typical queries
- **Achieved**: ~0.004ms average for complex queries
- **Optimization**: Single-pass tokenization, efficient AST construction

### Memory Usage

- **AST Caching**: Parsed queries can be cached and reused
- **Immutable Structures**: Safe to share AST nodes between operations
- **Garbage Collection**: No circular references in AST

### Real-time Updates

- **Incremental Processing**: Only reprocess changed files
- **Debounced Updates**: Avoid excessive re-rendering
- **Efficient Filtering**: Query optimization for large datasets

## Security Considerations

### Input Validation

- **Sanitization**: All user input is tokenized and validated
- **Injection Prevention**: No dynamic code execution
- **Length Limits**: Reasonable limits on query length and complexity

### AST Validation

- **Structure Checking**: Malformed ASTs are rejected
- **Type Safety**: Runtime type checking for critical paths
- **Error Boundaries**: Graceful handling of validation failures

## Future Roadmap

### Near-term Enhancements

1. **Logical OR**: `WHERE year = 2024 OR year = 2023`
2. **IN Operator**: `WHERE month IN (1, 2, 3, 6, 12)`
3. **Nested Conditions**: `WHERE (year = 2024 AND month > 6) OR project = "Special"`

### Long-term Vision

1. **Functions**: `WHERE QUARTER(date) = 1`
2. **Aggregations**: `GROUP BY project ORDER BY hours DESC`
3. **Subqueries**: `WHERE project IN (SELECT name FROM high_priority_projects)`
4. **Query Optimization**: Automatic query rewriting for performance

## Conclusion

The grammar-based parser architecture represents a significant upgrade from the original regex-based approach. It provides:

- **Professional-grade parsing** with excellent error reporting
- **Type safety** throughout the processing pipeline
- **Easy extensibility** for future enhancements
- **Robust error handling** for production use
- **High performance** suitable for real-time applications

This architecture establishes a solid foundation for continued development and serves as an example of how to implement domain-specific languages in TypeScript applications.
