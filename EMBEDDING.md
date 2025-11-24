# Embedding Timesheet Reports

This guide shows you how to embed timesheet reports directly in your Obsidian notes using the Timesheet Report Plugin's query syntax.

## Quick Start

Simply add a `timesheet` code block anywhere in your notes:

```timesheet
VIEW summary
SIZE compact
```

This will embed a compact summary of your timesheet data right in your note.

## Query Syntax

The embedding system uses a SQL-like query syntax with the following structure:

```
WHERE <filter_conditions>
SHOW <components>
VIEW <display_type>
CHART <chart_type>
PERIOD <time_period>
SIZE <size_option>
```

### WHERE Clauses (Optional)

Filter your data using specific conditions:

- `WHERE year = 2024` - Show only 2024 data
- `WHERE month = 3` - Show only March data
- `WHERE project = "Client ABC"` - Filter by project name
- `WHERE date BETWEEN "2024-01-01" AND "2024-03-31"` - Date range filter

You can combine multiple conditions:
```timesheet
WHERE year = 2024 AND month = 2
VIEW summary
```

### VIEW Types

Choose what type of display you want:

- `VIEW summary` - Summary cards with key metrics
- `VIEW chart` - Visual charts only
- `VIEW table` - Data table only
- `VIEW full` - All components (summary + chart + table)

### CHART Types

When using `VIEW chart`, specify the chart type:

- `CHART trend` - Hours and utilization trends over time
- `CHART monthly` - Monthly invoice/budget analysis
- `CHART budget` - Budget consumption for fixed-hour projects

### PERIOD Options

Set the time range for your data:

- `PERIOD current-year` - Current year only
- `PERIOD all-time` - All historical data
- `PERIOD last-6-months` - Last 6 months
- `PERIOD last-12-months` - Last 12 months

### SIZE Options

Control how much space the embed takes:

- `SIZE compact` - Minimal space, perfect for widgets
- `SIZE normal` - Standard size for most use cases
- `SIZE detailed` - Full information with all metrics

## Common Use Cases

### 1. Daily Note Widget

Add this to your daily note template:

```timesheet
PERIOD current-year
VIEW summary
SIZE compact
```

### 2. Project Status Page

For comprehensive project dashboards:

```timesheet
WHERE year = 2024
VIEW full
SIZE detailed
```

### 3. Budget Monitoring

Track budget consumption:

```timesheet
CHART budget
VIEW chart
SIZE normal
```

### 4. Quick Revenue Check

See recent earnings:

```timesheet
PERIOD last-6-months
VIEW table
SIZE compact
```

### 5. Client Presentation

Professional summary for clients:

```timesheet
WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
VIEW summary
SIZE detailed
```

## Advanced Examples

### Monthly Deep Dive

```timesheet
WHERE year = 2024 AND month = 2
VIEW full
```

### Trend Analysis

```timesheet
PERIOD all-time
VIEW chart
CHART trend
```

### Project-Specific Report

```timesheet
WHERE project = "Website Redesign" AND year = 2024
VIEW full
SIZE detailed
```

## Best Practices

### 1. Choose the Right Size

- Use `SIZE compact` for:
  - Dashboard widgets
  - Daily note summaries
  - Sidebar embeds

- Use `SIZE normal` for:
  - Project status updates
  - Weekly reviews
  - Standard reports

- Use `SIZE detailed` for:
  - Comprehensive analysis
  - Client presentations
  - End-of-month reports

### 2. Optimize for Context

- **Daily Notes**: Compact summaries with current year data
- **Project Pages**: Full views with specific filtering
- **Client Documents**: Detailed summaries with date ranges
- **Team Dashboards**: Charts showing trends and progress

### 3. Combine Multiple Embeds

Create rich dashboards by combining different views:

```markdown
# Project Alpha Dashboard

## Current Status
```timesheet
WHERE year = 2024
VIEW summary
SIZE normal
```

## Budget Progress
```timesheet
CHART budget
VIEW chart
```

## Recent Activity
```timesheet
PERIOD last-6-months
VIEW table
SIZE compact
```
```

### 4. Use Comments for Complex Queries

Document your queries with comments (use `//`):

```timesheet
// Q1 2024 performance review
WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
VIEW full
SIZE detailed
```

## Responsive Design

All embedded reports automatically adapt to:

- Container width
- Screen size
- Available space

The `compact` size is especially mobile-friendly.

## Performance Tips

1. **Filter data** when possible to improve loading speed
2. **Use specific periods** rather than `all-time` for large datasets
3. **Combine embeds thoughtfully** - multiple full views can slow page loading
4. **Use compact size** for frequently-viewed pages

## Troubleshooting

### Common Issues

**Embed not showing**: Check your query syntax for typos

**Wrong data displayed**: Verify your WHERE conditions and PERIOD settings

**Layout issues**: Try different SIZE options or check container width

**Performance problems**: Use more specific filters and avoid multiple detailed embeds

### Error Messages

The plugin will show helpful error messages if:
- Query syntax is invalid
- Filters don't match any data
- Chart rendering fails

## Integration with Templates

### Daily Note Template

```markdown
# {{date}}

## Quick Status
```timesheet
PERIOD current-year
VIEW summary
SIZE compact
```

## Today's Plan
- [ ] Task 1
- [ ] Task 2
```

### Project Review Template

```markdown
# {{project_name}} - Monthly Review

## Performance Summary
```timesheet
WHERE year = {{year}} AND month = {{month}}
VIEW summary
SIZE detailed
```

## Budget Status
```timesheet
CHART budget
VIEW chart
```
```

### Client Report Template

```markdown
# {{client_name}} - Quarterly Report

## Executive Summary
```timesheet
WHERE date BETWEEN "{{start_date}}" AND "{{end_date}}"
VIEW summary
SIZE detailed
```

## Work Breakdown
```timesheet
WHERE date BETWEEN "{{start_date}}" AND "{{end_date}}"
VIEW table
```
```

This embedding system makes your timesheet data available anywhere in your Obsidian vault, enabling powerful workflows for project management, client communication, and personal productivity tracking.
