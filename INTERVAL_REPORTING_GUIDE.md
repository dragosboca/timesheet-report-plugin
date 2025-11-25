# Interval Reporting Guide

This guide demonstrates the enhanced interval-based reporting system that replaces the old month-only reporting. The new system provides much more flexibility for generating custom timesheet reports.

## Overview

The enhanced reporting system includes:
- **Flexible date intervals** (not just months)
- **Advanced query language** with dynamic column selection
- **Query presets** for common reporting scenarios
- **Real-time preview** of report data
- **Custom formatting** and aliases

## Getting Started

### Opening the Report Generator

1. Use the command palette: `Ctrl/Cmd + P`
2. Search for "Generate Timesheet Report"
3. Or use the ribbon icon if enabled

### Basic Report Generation

#### 1. Select Date Range

**Quick Presets:**
- Current Month
- Last Month  
- Last 3 Months
- Current Quarter
- Last Quarter
- Current Year
- Last 30 Days
- Last 90 Days

**Custom Dates:**
- Enter start date: `2024-01-01`
- Enter end date: `2024-03-31`

#### 2. Choose Query Type

**Query Presets:**
- **Basic Summary**: Simple hours and revenue overview
- **Detailed Breakdown**: Day-by-day entries with full details
- **Client Analysis**: Client-focused reporting
- **Budget Tracking**: Budget progress and utilization
- **Utilization Report**: Time utilization analysis

#### 3. Configure Report Options

- **Report Name**: Choose a descriptive name
- **Template**: Select formatting template (optional)

## Query Language Examples

### Basic Column Selection

```sql
-- Show specific columns
WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
SHOW project, hours, invoiced
VIEW table
```

### Enhanced Formatting

```sql
-- Custom aliases and formatting
WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
SHOW 
  project AS "Client Name",
  hours AS "Work Hours",
  rate FORMAT CURRENCY AS "Rate",
  invoiced FORMAT MONEY AS "Revenue"
VIEW table
SIZE detailed
```

### Available Fields

| Field | Description | Type |
|-------|-------------|------|
| `date` | Entry date | Date |
| `project` | Project name | Text |
| `task` | Task description | Text |
| `hours` | Hours worked | Number |
| `rate` | Hourly rate | Currency |
| `invoiced` | Invoiced amount | Currency |
| `revenue` | Calculated revenue | Currency |
| `utilization` | Time utilization | Percentage |
| `efficiency` | Work efficiency | Percentage |
| `budgetHours` | Total budget hours | Number |
| `budgetUsed` | Used budget hours | Number |
| `budgetRemaining` | Remaining budget | Number |
| `budgetProgress` | Budget completion | Percentage |
| `client` | Client name | Text |
| `category` | Work category | Text |
| `tag` | Entry tag | Text |

## Common Reporting Scenarios

### Monthly Summary

```sql
WHERE date BETWEEN "2024-03-01" AND "2024-03-31"
SHOW 
  project AS "Project",
  hours AS "Hours",
  invoiced FORMAT CURRENCY AS "Revenue"
VIEW summary
SIZE normal
```

**Result:** Clean monthly overview with key metrics

### Quarterly Client Analysis

```sql
WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
SHOW 
  client AS "Client",
  project AS "Project", 
  hours AS "Total Hours",
  invoiced FORMAT MONEY AS "Revenue Generated",
  utilization FORMAT PERCENT AS "Utilization"
VIEW table
SIZE detailed
```

**Result:** Comprehensive client performance breakdown

### Budget Tracking Report

```sql
WHERE project CONTAINS "Budget"
SHOW 
  project AS "Project",
  budgetHours AS "Allocated",
  budgetUsed AS "Used",
  budgetRemaining AS "Remaining",
  budgetProgress FORMAT PERCENT AS "Progress"
VIEW table
CHART budget
```

**Result:** Visual budget consumption tracking

### Year-to-Date Performance

```sql
WHERE date BETWEEN "2024-01-01" AND "2024-12-31"
SHOW 
  month AS "Month",
  hours AS "Hours",
  invoiced FORMAT CURRENCY AS "Revenue",
  utilization FORMAT PERCENT AS "Utilization"
VIEW chart
CHART trend
PERIOD current-year
```

**Result:** Monthly trends with charts

### Utilization Deep Dive

```sql
WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
SHOW 
  date AS "Date",
  project AS "Project",
  hours AS "Hours",
  utilization FORMAT PERCENT AS "Daily Utilization"
WHERE utilization > 0.5
VIEW table
SIZE detailed
```

**Result:** Detailed utilization analysis with filtering

## Advanced Features

### Column Aliases

Make your reports more readable with custom column names:

```sql
SHOW 
  hours AS "Time Invested",
  invoiced AS "Revenue Generated",
  rate AS "Billing Rate"
```

### Format Specifications

Control how data is displayed:

- `FORMAT CURRENCY` - €50.00
- `FORMAT MONEY` - €1,234.56
- `FORMAT PERCENT` - 85%
- `FORMAT DECIMAL(1)` - 8.5
- `FORMAT HOURS` - 40.25

### View Types

- `VIEW summary` - High-level overview
- `VIEW table` - Detailed tabular data
- `VIEW chart` - Visual representation
- `VIEW full` - Combined view with all elements

### Size Options

- `SIZE compact` - Minimal information, mobile-friendly
- `SIZE normal` - Standard detail level
- `SIZE detailed` - Maximum information and analysis

## Tips and Best Practices

### 1. Start Simple
Begin with basic queries and gradually add complexity:

```sql
-- Start here
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW project, hours, invoiced

-- Then enhance
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  project AS "Project Name",
  hours FORMAT DECIMAL(1) AS "Hours Worked",
  invoiced FORMAT CURRENCY AS "Amount Billed"
VIEW table
SIZE normal
```

### 2. Use Meaningful Aliases
Make reports self-explanatory:

```sql
SHOW 
  client AS "Client Company",
  hours AS "Billable Hours",
  rate AS "Hourly Rate (EUR)"
```

### 3. Choose Appropriate Views
- Use `summary` for executive overviews
- Use `table` for detailed analysis
- Use `chart` for trend visualization

### 4. Preview Before Generating
Always use the preview function to verify:
- Data looks correct
- Formatting is appropriate
- Columns are properly aligned

### 5. Name Reports Descriptively
Good examples:
- `Q1 2024 Client Revenue Analysis`
- `March 2024 Budget Tracking`
- `YTD Utilization Report 2024`

## Troubleshooting

### Common Issues

**No data in preview:**
- Check date range includes actual work entries
- Verify date format (YYYY-MM-DD)
- Ensure timesheet files are in the correct format

**Query syntax errors:**
- Use query presets as starting points
- Check field names against available fields list
- Ensure proper quote usage around dates and text

**Formatting issues:**
- Verify format specifications are supported
- Check column aliases don't contain special characters
- Use appropriate size settings for your display

### Error Messages

**"Invalid date range":**
- End date must be after start date
- Use YYYY-MM-DD format
- Check for typos in dates

**"Unknown field: [fieldname]":**
- Field name doesn't exist
- Check spelling and capitalization
- Reference available fields list above

**"Preview Error":**
- Query syntax issue
- Try using a preset query
- Simplify the query to identify the problem

## Migration from Monthly Reports

### Old Way (Month-only)
1. Select specific month/year
2. Generate standard monthly report
3. Limited customization options

### New Way (Interval-based)
1. Choose any date range
2. Customize columns and formatting
3. Multiple view types and export options
4. Real-time preview

### Converting Old Workflows

**Monthly Report:**
```sql
-- Old: Fixed monthly format
-- New: Customizable monthly query
WHERE date BETWEEN "2024-03-01" AND "2024-03-31"
SHOW project, date, hours, invoiced
VIEW table
```

**Quarterly Report:**
```sql
-- Now possible with interval selection
WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
SHOW 
  client AS "Client",
  hours AS "Q1 Hours",
  invoiced FORMAT CURRENCY AS "Q1 Revenue"
VIEW summary
```

## Future Enhancements

The query language is designed for extensibility. Planned features include:

- **Calculated Fields**: `hours * rate AS total_revenue`
- **Aggregation Functions**: `SUM(hours)`, `AVG(rate)`
- **Grouping**: `GROUP BY project`
- **Sorting**: `ORDER BY revenue DESC`
- **Advanced Filtering**: `WHERE project IN ("Alpha", "Beta")`

## Getting Help

1. Use query presets as templates
2. Check the preview before generating
3. Reference available fields list
4. Start with simple queries and build complexity
5. Check the plugin documentation for updates

The interval reporting system provides powerful flexibility while maintaining ease of use for basic reports. Start with the presets and gradually explore the advanced query features as you become more comfortable with the system.
