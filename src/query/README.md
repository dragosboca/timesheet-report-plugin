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

Select specific fields to display with enhanced column customization.

```sql
SHOW <field>[, <field>]*
SHOW <field> AS <alias>[, <field> AS <alias>]*
SHOW <field> FORMAT <format_type>[, <field> FORMAT <format_type>]*
```

#### Available Fields

**Basic Fields:**
- `date` - Entry date
- `project` - Project name
- `task` - Task description
- `hours` - Hours worked
- `rate` - Hourly rate
- `invoiced` - Invoiced amount
- `revenue` - Calculated revenue (hours * rate)

**Utilization & Efficiency:**
- `utilization` - Time utilization percentage
- `efficiency` - Work efficiency percentage

**Budget Fields:**
- `budgetHours` - Total budget hours
- `budgetUsed` - Hours used from budget
- `budgetRemaining` - Remaining budget hours
- `budgetProgress` - Budget completion percentage

**Time Aggregations:**
- `label` - Time period label
- `year` - Year
- `month` - Month
- `week` - Week number

**Client & Categorization:**
- `client` - Client name
- `category` - Work category
- `tag` - Entry tag

**Retainer Fields:**
- `retainerHours` - Retainer hours used
- `rolloverHours` - Hours rolled over
- `contractValue` - Total contract value

#### Column Aliases

```sql
-- Rename columns for better readability
SHOW hours AS "Work Hours", invoiced AS "Amount Billed"
SHOW project AS "Client Name", rate AS "Hourly Rate"
```

#### Formatting Options

```sql
-- Format currency values
SHOW rate FORMAT CURRENCY, invoiced FORMAT MONEY

-- Format percentages
SHOW utilization FORMAT PERCENT, budgetProgress FORMAT PERCENTAGE

-- Format with custom precision
SHOW hours FORMAT DECIMAL(1), rate FORMAT CURRENCY(DECIMALS=0)
```

#### Examples

```sql
-- Basic field selection
SHOW hours, invoiced, project

-- With aliases and formatting
SHOW 
  project AS "Client",
  hours AS "Work Hours",
  rate FORMAT CURRENCY,
  invoiced AS "Revenue" FORMAT MONEY

-- Comprehensive project view
SHOW 
  project AS "Project Name",
  budgetHours AS "Budget",
  budgetUsed AS "Used",
  budgetProgress FORMAT PERCENT AS "Progress"
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
SHOW 
  project AS "Project",
  hours AS "Hours Worked",
  invoiced FORMAT CURRENCY AS "Revenue"
VIEW table
SIZE compact
```

### Enhanced Project Analysis

```sql
// Comprehensive project breakdown with custom formatting
WHERE project = "Client Alpha"
SHOW 
  project AS "Project Name",
  hours AS "Total Hours",
  rate FORMAT CURRENCY AS "Rate",
  hours * rate FORMAT MONEY AS "Calculated Revenue",
  budgetProgress FORMAT PERCENT AS "Budget Progress"
VIEW table
SIZE detailed
```

### Current Year Overview

```sql
// Show current year summary with charts
WHERE year = 2024
SHOW 
  label AS "Month",
  hours AS "Work Hours",
  utilization FORMAT PERCENT AS "Utilization"
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

## Enhanced Query Features

### Column Selection & Formatting
- ✅ **Dynamic column selection**: Choose specific fields to display
- ✅ **Column aliases**: Rename columns with `AS "Custom Name"`
- ✅ **Format specifications**: `FORMAT CURRENCY`, `FORMAT PERCENT`, etc.
- ✅ **Type-aware formatting**: Automatic formatting based on field type
- ✅ **Comprehensive field library**: 25+ available fields

### Advanced Filtering
- ✅ **Multiple operators**: `=`, `!=`, `>`, `<`, `>=`, `<=`, `BETWEEN`
- ✅ **Date ranges**: `BETWEEN "2024-01-01" AND "2024-12-31"`
- 🚧 **List filtering**: `WHERE project IN ("Alpha", "Beta")`
- 🚧 **Pattern matching**: `WHERE project LIKE "Client%"`
- 🚧 **Logical OR**: `WHERE year = 2024 OR year = 2023`

### Future Extensions

Planned features for upcoming versions:

1. **Calculated Fields**: `SHOW hours * rate AS revenue`
2. **Aggregation Functions**: `SHOW SUM(hours), AVG(rate)`
3. **Grouping**: `GROUP BY project`
4. **Advanced Sorting**: `ORDER BY revenue DESC`
5. **Conditional Formatting**: Color-coding based on values
6. **Nested Expressions**: Complex calculated fields
7. **Custom Functions**: `WHERE YEAR(date) = 2024`

## Architecture

The enhanced query language is implemented using:

1. **Grammar** (`grammar.pegjs`) - PEG-based grammar definition
2. **AST** (`ast.ts`) - Abstract Syntax Tree node definitions
3. **Parser** (`parser.ts`) - Syntax analysis and AST generation
4. **Interpreter** (`interpreter.ts`) - AST execution and query object generation
5. **Column Mapper** (`column-mapper.ts`) - Dynamic column selection and formatting
6. **Enhanced Grammar** (`enhanced-grammar.pegjs`) - Extended grammar for advanced features

### Key Components

- **Column Mapper**: Converts SHOW clauses to table columns with proper formatting
- **Field Definitions**: Comprehensive field library with type information
- **Format Processors**: Type-aware formatting for different data types
- **Table Integration**: Seamless integration with existing table generation

This modular architecture ensures the language is robust, maintainable, and easily extensible for future enhancements.
