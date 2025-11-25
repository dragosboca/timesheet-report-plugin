# Timesheet Query Language

A robust SQL-like query language for filtering and displaying timesheet data in Obsidian.

## Overview

The timesheet query language allows you to create flexible, readable queries to filter and display your timesheet data. It uses a proper grammar parser and interpreter, making it much more robust than simple regex-based parsing.

## Grammar

### Basic Syntax

```
Query ::= Clause*
Clause ::= WhereClause | ShowClause | ViewClause | ChartClause | PeriodClause | SizeClause
```

### Keywords (Case Insensitive)

- `WHERE` - Filter conditions
- `SHOW` - Select specific fields to display
- `VIEW` - Set display mode
- `CHART` - Set chart type
- `PERIOD` - Set time period
- `SIZE` - Set display size
- `BETWEEN` - Range operator
- `AND` - Logical AND
- `OR` - Logical OR (future)
- `IN` - List membership (future)

### Data Types

- **Numbers**: `2024`, `12`, `42.5`
- **Strings**: `"Project Name"`, `'Client Work'`
- **Dates**: `"2024-01-01"` (YYYY-MM-DD format)
- **Identifiers**: `year`, `month`, `project`

### Operators

- `=` - Equality
- `!=` - Inequality
- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal
- `<=` - Less than or equal
- `BETWEEN` - Range (for dates)
- `IN` - List membership (future)

## Clause Reference

### WHERE Clause

Filter data based on conditions.

```sql
WHERE <condition> [AND <condition>]*
```

#### Supported Fields

- `year` - Filter by year (number)
- `month` - Filter by month (1-12)
- `project` - Filter by project name (string)
- `date` - Filter by date range (BETWEEN operator)

#### Examples

```sql
-- Filter by specific year
WHERE year = 2024

-- Filter by year and month
WHERE year = 2024 AND month = 12

-- Filter by project name
WHERE project = "Client Work"

-- Filter by date range
WHERE date BETWEEN "2024-01-01" AND "2024-12-31"

-- Multiple conditions
WHERE year >= 2023 AND project = "Internal"
```

### SHOW Clause

Select specific fields to display.

```sql
SHOW <field>[, <field>]*
```

#### Available Fields

- `hours` - Total hours
- `invoiced` - Invoiced amount
- `progress` - Budget progress
- `utilization` - Utilization percentage
- `remaining` - Remaining budget hours

#### Examples

```sql
-- Show specific fields
SHOW hours, invoiced

-- Show all available fields
SHOW hours, invoiced, progress, utilization
```

### VIEW Clause

Set the display mode.

```sql
VIEW <view_type>
```

#### View Types

- `summary` - Summary view (default)
- `chart` - Chart view
- `table` - Table view
- `full` - All views combined

#### Examples

```sql
VIEW chart
VIEW table
VIEW full
```

### CHART Clause

Set the chart type (only used with chart view).

```sql
CHART <chart_type>
```

#### Chart Types

- `monthly` - Monthly breakdown (default)
- `trend` - Trend analysis
- `budget` - Budget progress

#### Examples

```sql
CHART trend
CHART budget
```

### PERIOD Clause

Set the time period for data display.

```sql
PERIOD <period_type>
```

#### Period Types

- `current-year` - Current year only (default)
- `all-time` - All available data
- `last-6-months` - Last 6 months
- `last-12-months` - Last 12 months

#### Examples

```sql
PERIOD all-time
PERIOD last-6-months
```

### SIZE Clause

Set the display size and detail level.

```sql
SIZE <size_type>
```

#### Size Types

- `compact` - Minimal display
- `normal` - Standard display (default)
- `detailed` - Detailed display with all information

#### Examples

```sql
SIZE compact
SIZE detailed
```

## Complete Examples

### Basic Summary

```sql
WHERE year = 2024
VIEW summary
SIZE normal
```

### Project Analysis

```sql
WHERE project = "Client Alpha"
VIEW full
CHART trend
PERIOD last-12-months
SIZE detailed
```

### Monthly Breakdown

```sql
WHERE date BETWEEN "2024-01-01" AND "2024-06-30"
SHOW hours, invoiced, progress
VIEW table
SIZE compact
```

### Current Year Overview

```sql
// Show current year summary with charts
WHERE year = 2024
VIEW chart
CHART monthly
PERIOD current-year
SIZE normal
```

## Comments

Use `//` for single-line comments:

```sql
// This is a comment
WHERE year = 2024  // Filter by current year
VIEW summary
```

## Error Handling

The parser provides detailed error messages with line and column information:

```
Parse error at line 2, column 15: Expected comparison operator
```

Common errors:
- Missing quotes around strings
- Invalid field names
- Unsupported operators
- Malformed date formats

## Future Extensions

The grammar is designed to be extensible. Planned features:

1. **Logical OR**: `WHERE year = 2024 OR year = 2023`
2. **IN operator**: `WHERE month IN (1, 2, 3)`
3. **Nested conditions**: `WHERE (year = 2024 AND month > 6) OR project = "Special"`
4. **Functions**: `WHERE YEAR(date) = 2024`
5. **Aggregations**: `GROUP BY project`

## Architecture

The query language is implemented using:

1. **Tokenizer** (`tokenizer.ts`) - Lexical analysis
2. **Parser** (`parser.ts`) - Syntax analysis and AST generation
3. **AST** (`ast.ts`) - Abstract Syntax Tree node definitions
4. **Interpreter** (`interpreter.ts`) - AST execution and query object generation

This architecture makes the language robust, maintainable, and easily extensible.
