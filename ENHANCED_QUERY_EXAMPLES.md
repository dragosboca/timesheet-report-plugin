# Enhanced Query Language Examples

This document provides comprehensive examples of the enhanced timesheet query language with advanced column selection and flexible report generation capabilities.

## Overview

The enhanced query language extends the basic timesheet query syntax with:
- Dynamic column selection with aliases and formatting
- Calculated fields and aggregation functions
- Advanced filtering with multiple operators
- Sorting and grouping capabilities
- Custom formatting options

## Basic Column Selection

### Simple Field Selection
```sql
-- Show only specific columns
SHOW hours, invoiced, project

-- Show with different order
SHOW project, date, hours, rate, invoiced
```

### Available Fields
```sql
-- Basic fields
SHOW date, project, task, hours, rate, invoiced

-- Budget-related fields
SHOW budgetHours, budgetUsed, budgetRemaining, budgetProgress

-- Utilization fields
SHOW utilization, efficiency

-- Time aggregations
SHOW year, month, week, label

-- Client and categorization
SHOW client, category, tag

-- Retainer fields
SHOW retainerHours, rolloverHours, contractValue
```

## Column Aliases

### Simple Aliases
```sql
-- Rename columns for better readability
SHOW hours AS "Work Hours", invoiced AS "Amount Billed"
SHOW project AS Client, rate AS "Hourly Rate"
```

### Descriptive Aliases
```sql
-- More descriptive column names
SHOW 
  date AS "Work Date",
  project AS "Project Name", 
  hours AS "Hours Worked",
  invoiced AS "Revenue Generated"
```

## Formatting Options

### Currency Formatting
```sql
-- Format monetary values
SHOW 
  hours,
  rate FORMAT CURRENCY,
  invoiced FORMAT MONEY
```

### Percentage Formatting
```sql
-- Format percentages
SHOW 
  project,
  utilization FORMAT PERCENT,
  budgetProgress FORMAT PERCENTAGE
```

### Custom Number Formatting
```sql
-- Control decimal places
SHOW 
  hours FORMAT DECIMAL(1),
  rate FORMAT CURRENCY(DECIMALS=0),
  utilization FORMAT PERCENT(PRECISION=1)
```

### Date Formatting
```sql
-- Format dates
SHOW 
  date FORMAT DATE,
  project,
  hours
```

## Calculated Fields

### Simple Calculations
```sql
-- Calculate revenue (hours * rate)
SHOW 
  project,
  hours,
  rate,
  hours * rate AS "Total Revenue"
```

### Complex Calculations
```sql
-- Budget efficiency calculation
SHOW 
  project,
  budgetHours,
  budgetUsed,
  (budgetUsed / budgetHours * 100) AS "Budget Efficiency" FORMAT PERCENT
```

### Multiple Calculations
```sql
-- Various calculated metrics
SHOW 
  project,
  hours,
  rate,
  hours * rate AS revenue,
  (hours * rate) - invoiced AS "Pending Invoice",
  utilization * 100 AS "Utilization %" FORMAT DECIMAL(1)
```

## Aggregation Functions

### Basic Aggregations
```sql
-- Total hours and revenue
SHOW 
  SUM(hours) AS "Total Hours",
  SUM(invoiced) AS "Total Revenue"
```

### Multiple Aggregations
```sql
-- Comprehensive summary
SHOW 
  COUNT(project) AS "Projects",
  SUM(hours) AS "Total Hours",
  AVG(rate) AS "Average Rate" FORMAT CURRENCY,
  MAX(invoiced) AS "Highest Invoice" FORMAT MONEY
```

### Grouped Aggregations
```sql
-- Project-level aggregations
SHOW 
  project,
  SUM(hours) AS "Project Hours",
  AVG(utilization) AS "Avg Utilization" FORMAT PERCENT
GROUP BY project
```

## Advanced Filtering

### Multiple Conditions
```sql
WHERE year = 2024 AND month >= 6
SHOW project, hours, invoiced
```

### Range Filtering
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-06-30"
SHOW date, project, hours, rate * hours AS revenue
```

### List Filtering
```sql
WHERE project IN ("Client Alpha", "Client Beta", "Internal")
SHOW project, SUM(hours) AS "Total Hours", SUM(invoiced) AS "Total Revenue"
GROUP BY project
```

### Pattern Matching
```sql
WHERE project LIKE "Client%"
SHOW project, hours, invoiced
```

### Complex Conditions
```sql
WHERE 
  (year = 2024 AND month >= 6) 
  OR utilization > 0.8
SHOW project, date, hours, utilization FORMAT PERCENT
```

## Sorting and Ordering

### Simple Sorting
```sql
SHOW project, hours, invoiced
ORDER BY hours DESC
```

### Multiple Sort Fields
```sql
SHOW project, date, hours
ORDER BY project ASC, date DESC
```

### Calculated Field Sorting
```sql
SHOW 
  project,
  hours,
  rate,
  hours * rate AS revenue
ORDER BY revenue DESC
```

## Complete Query Examples

### Monthly Performance Report
```sql
-- Comprehensive monthly breakdown
WHERE year = 2024
SHOW 
  month AS "Month",
  SUM(hours) AS "Total Hours",
  AVG(rate) AS "Avg Rate" FORMAT CURRENCY,
  SUM(invoiced) AS "Revenue" FORMAT MONEY,
  SUM(invoiced) / SUM(hours) AS "Effective Rate" FORMAT CURRENCY,
  AVG(utilization) AS "Utilization" FORMAT PERCENT
GROUP BY month
ORDER BY month ASC
VIEW table
SIZE detailed
```

### Project Profitability Analysis
```sql
-- Project-level profit analysis
WHERE date BETWEEN "2024-01-01" AND "2024-12-31"
SHOW 
  project AS "Project Name",
  SUM(hours) AS "Hours",
  AVG(rate) AS "Avg Rate" FORMAT CURRENCY(DECIMALS=0),
  SUM(invoiced) AS "Revenue" FORMAT MONEY,
  SUM(hours * rate) - SUM(invoiced) AS "Pending" FORMAT CURRENCY,
  AVG(utilization) AS "Utilization" FORMAT PERCENT(PRECISION=1)
GROUP BY project
HAVING SUM(hours) > 10
ORDER BY SUM(invoiced) DESC
VIEW table
SIZE normal
```

### Budget Tracking Report
```sql
-- Budget progress tracking
WHERE project CONTAINS "Budget"
SHOW 
  project AS "Project",
  budgetHours AS "Budget" FORMAT DECIMAL(0),
  budgetUsed AS "Used" FORMAT DECIMAL(1),
  budgetRemaining AS "Remaining" FORMAT DECIMAL(1),
  budgetProgress AS "Progress" FORMAT PERCENT,
  (budgetUsed / budgetHours) AS "Actual %" FORMAT PERCENT(PRECISION=1)
ORDER BY budgetProgress DESC
VIEW table
CHART budget
```

### Client Summary Dashboard
```sql
-- High-level client overview
SHOW 
  client AS "Client",
  COUNT(project) AS "Projects",
  SUM(hours) AS "Total Hours",
  SUM(invoiced) AS "Total Revenue" FORMAT CURRENCY(SYMBOL="$"),
  AVG(rate) AS "Average Rate" FORMAT MONEY,
  MAX(date) AS "Last Activity" FORMAT DATE
GROUP BY client
ORDER BY SUM(invoiced) DESC
VIEW summary
SIZE detailed
```

### Utilization Trend Analysis
```sql
-- Monthly utilization trends
WHERE date BETWEEN "2024-01-01" AND "2024-12-31"
SHOW 
  month AS "Month",
  SUM(hours) AS "Hours",
  AVG(utilization) AS "Utilization" FORMAT PERCENT(PRECISION=1),
  MAX(utilization) AS "Peak Util" FORMAT PERCENT,
  MIN(utilization) AS "Low Util" FORMAT PERCENT
GROUP BY month
ORDER BY month ASC
VIEW chart
CHART trend
PERIOD current-year
```

### Retainer Status Report
```sql
-- Retainer client management
WHERE retainerHours IS NOT NULL
SHOW 
  client AS "Retainer Client",
  retainerHours AS "Monthly Allocation",
  SUM(hours) AS "Used This Month",
  retainerHours - SUM(hours) AS "Remaining",
  rolloverHours AS "Rollover Available",
  contractValue AS "Contract Value" FORMAT CURRENCY
GROUP BY client
ORDER BY retainerHours - SUM(hours) ASC
VIEW retainer
```

### Quick Daily Summary
```sql
-- Simple daily view
WHERE date = "2024-12-15"
SHOW 
  project AS "Project",
  hours AS "Hours",
  task AS "Description"
ORDER BY hours DESC
VIEW summary
SIZE compact
```

### Revenue Forecast
```sql
-- Projected revenue analysis
SHOW 
  project,
  SUM(hours) AS "Hours YTD",
  SUM(invoiced) AS "Revenue YTD" FORMAT MONEY,
  AVG(rate) AS "Rate" FORMAT CURRENCY,
  (SUM(hours) * 1.2 * AVG(rate)) AS "Projected EOY" FORMAT MONEY
GROUP BY project
HAVING SUM(hours) > 20
ORDER BY (SUM(hours) * 1.2 * AVG(rate)) DESC
VIEW chart
CHART forecast
```

## Advanced Features

### Conditional Formatting
```sql
-- Color-code based on utilization
SHOW 
  project,
  utilization FORMAT PERCENT,
  hours
WHERE utilization != 0
ORDER BY utilization DESC
```

### Nested Calculations
```sql
-- Complex derived metrics
SHOW 
  project,
  ((SUM(invoiced) / SUM(hours)) / AVG(rate)) AS "Billing Efficiency" FORMAT PERCENT,
  (SUM(hours) / (COUNT(date) * 8)) AS "Daily Utilization" FORMAT PERCENT
GROUP BY project
```

### Multi-Level Grouping
```sql
-- Hierarchical grouping
SHOW 
  client,
  project,
  SUM(hours) AS "Hours",
  SUM(invoiced) AS "Revenue" FORMAT MONEY
GROUP BY client, project
ORDER BY client, SUM(invoiced) DESC
```

## Error Handling

### Invalid Field Names
```sql
-- This will show a warning for unknown field
SHOW invalid_field, hours, invoiced
-- Result: Warning logged, invalid_field ignored, other columns shown
```

### Type Mismatches
```sql
-- Automatic type conversion where possible
SHOW hours FORMAT CURRENCY  -- Will format hours as currency
SHOW date AS "Work Date"     -- Date will be formatted appropriately
```

### Fallback Behavior
```sql
-- If SHOW clause fails, falls back to default columns
SHOW some_invalid_field
-- Result: Default columns for the view type will be used
```

## Migration Guide

### From Basic to Enhanced
```sql
-- Old syntax
SHOW hours, invoiced

-- Enhanced equivalent
SHOW 
  hours AS "Work Hours",
  invoiced AS "Amount Billed" FORMAT CURRENCY
```

### Adding Calculations
```sql
-- Before: Static columns
SHOW hours, rate, invoiced

-- After: With calculations
SHOW 
  hours,
  rate FORMAT CURRENCY,
  hours * rate AS "Calculated Revenue" FORMAT MONEY,
  invoiced,
  (hours * rate) - invoiced AS "Pending" FORMAT CURRENCY
```

### Complex Reports
```sql
-- Simple query
WHERE year = 2024
SHOW hours, invoiced

-- Enhanced comprehensive report
WHERE year = 2024
SHOW 
  month AS "Month",
  COUNT(project) AS "Projects",
  SUM(hours) AS "Total Hours",
  SUM(invoiced) AS "Revenue" FORMAT MONEY,
  AVG(utilization) AS "Avg Utilization" FORMAT PERCENT(PRECISION=1),
  SUM(invoiced) / SUM(hours) AS "Effective Rate" FORMAT CURRENCY
GROUP BY month
ORDER BY month ASC
VIEW table
SIZE detailed
```

This enhanced query language provides powerful flexibility for creating custom reports while maintaining the simplicity of the original syntax for basic use cases.
