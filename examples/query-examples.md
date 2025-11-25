# Timesheet Query Language Examples

This document provides canonical examples of the timesheet query language syntax and usage patterns.

## Basic Queries

### Simple Filtering

Filter timesheet data by year:
```sql
WHERE year = 2024
```

Filter by specific month:
```sql
WHERE year = 2024 AND month = 12
```

Filter by project name:
```sql
WHERE project = "Client Alpha"
```

### Date Ranges

Filter by date range using BETWEEN operator:
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-06-30"
```

Combine date range with other conditions:
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-12-31" AND project = "Internal Tools"
```

## Display Options

### View Types

Summary view (default):
```sql
WHERE year = 2024
VIEW summary
```

Chart visualization:
```sql
WHERE year = 2024
VIEW chart
```

Table format:
```sql
WHERE year = 2024
VIEW table
```

Complete dashboard:
```sql
WHERE year = 2024
VIEW full
```

### Chart Types

Monthly breakdown (default):
```sql
VIEW chart
CHART monthly
```

Trend analysis:
```sql
VIEW chart
CHART trend
```

Budget progress:
```sql
VIEW chart
CHART budget
```

### Display Sizes

Compact display:
```sql
WHERE year = 2024
SIZE compact
```

Normal display (default):
```sql
WHERE year = 2024
SIZE normal
```

Detailed display:
```sql
WHERE year = 2024
SIZE detailed
```

## Time Periods

### Predefined Periods

Current year only (default):
```sql
WHERE project = "Client Work"
PERIOD current-year
```

All historical data:
```sql
WHERE project = "Client Work"
PERIOD all-time
```

Last 6 months:
```sql
WHERE project = "Client Work"
PERIOD last-6-months
```

Last 12 months:
```sql
WHERE project = "Client Work"
PERIOD last-12-months
```

## Field Selection

### Show Specific Fields

Display only hours and invoiced amounts:
```sql
WHERE year = 2024
SHOW hours, invoiced
```

Include progress tracking:
```sql
WHERE project = "Budget Project"
SHOW hours, invoiced, progress
```

Complete field set:
```sql
WHERE year = 2024
SHOW hours, invoiced, progress, utilization, remaining
```

## Complex Examples

### Project Analysis Dashboard

Complete analysis for a specific project:
```sql
WHERE project = "Client Alpha" AND year = 2024
VIEW full
CHART trend
PERIOD last-12-months
SIZE detailed
```

### Quarterly Review

Q4 2024 analysis with trend visualization:
```sql
WHERE year = 2024 AND month >= 10
VIEW chart
CHART trend
PERIOD current-year
SIZE normal
```

### Budget Tracking

Monitor budget progress for a project:
```sql
WHERE project = "Budget Project"
SHOW hours, invoiced, progress, remaining
VIEW table
CHART budget
SIZE detailed
```

### Year-over-Year Comparison

Compare current year with all-time data:
```sql
WHERE year = 2024
VIEW full
PERIOD all-time
SIZE detailed
```

### Compact Status Report

Quick summary for status meetings:
```sql
WHERE project = "Active Project"
VIEW summary
SIZE compact
PERIOD last-6-months
```

## Advanced Syntax

### Comments

Queries support single-line comments:
```sql
// Q4 2024 project analysis
WHERE year = 2024 AND month >= 10  // Last quarter only
VIEW chart
CHART trend  // Show trends over time
SIZE detailed
```

### Multi-line Queries

Complex queries can span multiple lines:
```sql
WHERE project = "Large Enterprise Project"
  AND year = 2024
  AND month BETWEEN 1 AND 6
SHOW hours, invoiced, progress
VIEW full
CHART monthly
PERIOD current-year
SIZE detailed
```

### Case Insensitive Keywords

Keywords are case insensitive:
```sql
where year = 2024
view Chart
chart TREND
period Last-6-Months
```

## Data Types

### Numbers

Year and month values:
```sql
WHERE year = 2024 AND month = 12
```

### Strings

Project names with quotes:
```sql
WHERE project = "Project with Spaces"
WHERE project = 'Single Quotes Work Too'
```

### Dates

ISO date format (YYYY-MM-DD):
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-12-31"
```

## Best Practices

### Readable Queries

Use clear formatting and comments:
```sql
// Monthly analysis for client work
WHERE project = "Client Alpha"
  AND year = 2024
VIEW chart
CHART monthly
SIZE normal
```

### Efficient Filtering

Start with the most selective filters:
```sql
// Good: Filter by project first, then date range
WHERE project = "Specific Project"
  AND date BETWEEN "2024-01-01" AND "2024-12-31"

// Less efficient: Very broad date range first
WHERE date BETWEEN "2020-01-01" AND "2024-12-31"
  AND project = "Specific Project"
```

### Appropriate Display Modes

Choose the right view for your use case:

- **Summary**: Quick overview, status checks
- **Chart**: Trend analysis, visual insights  
- **Table**: Detailed data review, exports
- **Full**: Comprehensive dashboards, presentations

### Size Guidelines

- **Compact**: Embedded in documents, quick references
- **Normal**: Standard reports, regular use
- **Detailed**: Deep analysis, full context needed

## Error Examples

Common syntax errors to avoid:

Invalid keyword:
```sql
INVALID year = 2024  // Error: Unknown keyword
```

Missing operator:
```sql
WHERE year 2024  // Error: Expected operator
```

Invalid view type:
```sql
VIEW invalid_view  // Error: Invalid view type
```

Unterminated string:
```sql
WHERE project = "unterminated  // Error: Missing closing quote
```

Missing value:
```sql
WHERE year =  // Error: Expected value
```

## Integration with Obsidian

### Code Block Usage

Embed queries in your notes using timesheet code blocks:

````markdown
```timesheet
WHERE year = 2024
VIEW summary
```
````

### Live Updates

Queries automatically update as timesheet data changes, providing real-time insights into your work patterns and project progress.

### Template Queries

Save common query patterns as templates:

**Daily Review Template:**
```sql
WHERE date = "{{date:YYYY-MM-DD}}"
VIEW summary
SIZE compact
```

**Weekly Summary Template:**
```sql
WHERE date BETWEEN "{{date:YYYY-MM-DD|-7d}}" AND "{{date:YYYY-MM-DD}}"
VIEW chart
CHART trend
SIZE normal
```

**Monthly Report Template:**
```sql
WHERE year = {{date:YYYY}} AND month = {{date:MM}}
VIEW full
CHART monthly
SIZE detailed
```
