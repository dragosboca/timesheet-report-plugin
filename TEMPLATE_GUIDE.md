# Timesheet Report Template Guide

This guide explains how to create custom report templates for the Timesheet Report Plugin, with a focus on daily detailed reports showing hours worked and work order information.

## Table of Contents

1. [Overview](#overview)
2. [Template Basics](#template-basics)
3. [Using the Query Language](#using-the-query-language)
4. [Daily Detailed Report Setup](#daily-detailed-report-setup)
5. [Available Placeholders](#available-placeholders)
6. [Example Templates](#example-templates)
7. [Best Practices](#best-practices)

---

## Overview

The plugin supports two reporting approaches:

1. **Query-Based Reports** (Recommended) - Use the advanced query language to dynamically select columns and format data
2. **Template-Based Reports** (Legacy) - Use placeholder-based templates with fixed formatting

For **daily detailed reports with work orders**, we recommend the **query-based approach** as it provides maximum flexibility.

---

## Template Basics

### Creating a Template

1. Create a new markdown file in your templates folder (default: `Templates/`)
2. Name it descriptively (e.g., `Daily-Detailed-Report.md`)
3. Add your template content with placeholders
4. Select it in the report generator modal

### Template Location

Configure the template folder in Settings → Timesheet Report → Report Templates:
- Default: `Templates/`
- Can be any folder in your vault
- Supports nested folders

---

## Using the Query Language

### Basic Query Structure

Instead of using templates with placeholders, use the query language directly in the report generator:

```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  date AS "Date",
  project AS "Work Order",
  task AS "Description",
  hours AS "Hours Worked",
  rate FORMAT CURRENCY AS "Rate",
  invoiced FORMAT MONEY AS "Amount"
VIEW table
SIZE detailed
```

### Query Components

**WHERE Clause** - Filter data
- `date BETWEEN "start" AND "end"` - Date range
- `project = "WO-12345"` - Specific project
- `year = 2024 AND month = 1` - Specific month

**SHOW Clause** - Select columns
- `field AS "Alias"` - Rename column
- `field FORMAT type` - Format data
- Available formats: `CURRENCY`, `MONEY`, `PERCENT`, `DECIMAL`, `HOURS`

**VIEW Clause** - Display type
- `summary` - High-level overview
- `table` - Detailed table
- `chart` - Visual charts
- `full` - All views

**SIZE Clause** - Detail level
- `compact` - Minimal info
- `normal` - Standard detail
- `detailed` - Maximum info

---

## Daily Detailed Report Setup

### Step 1: Structure Your Timesheet Entries

For daily reports with work orders, structure your entries like this:

```markdown
---
date: 2024-01-15
project: WO-12345
hours: 8
rate: 75
category: development
---

# Work Log - January 15, 2024

## WO-12345: Database Optimization
- Optimized slow queries in user dashboard
- Added indexes to improve performance
- Tested changes in staging environment

**Hours:** 6 hours

## WO-12346: Client Meeting
- Discussed Q1 requirements
- Reviewed sprint backlog
- Planned upcoming features

**Hours:** 2 hours
```

### Step 2: Generate the Report

**Using Report Generator Modal:**

1. Open: `Ctrl/Cmd + P` → "Generate Timesheet Report"
2. Set date range: 
   - Click "Current Month" or enter dates manually
   - Start: `2024-01-01`, End: `2024-01-31`
3. Enter query:

```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  date AS "Date",
  project AS "Work Order",
  task AS "Description",
  hours AS "Hours",
  rate FORMAT CURRENCY AS "Rate",
  hours * rate FORMAT MONEY AS "Amount"
VIEW table
SIZE detailed
```

4. Name report: "January 2024 - Daily Work Log"
5. Click "Generate Report"

### Step 3: Review Generated Report

The plugin will create a markdown file with:

```markdown
# January 2024 - Daily Work Log

**Period:** 2024-01-01 to 2024-01-31
**Generated:** 2024-02-01

## Summary

- **Total Hours:** 168.50
- **Total Revenue:** €12,637.50
- **Average Utilization:** 87%
- **Number of Entries:** 22

## Detailed Data

| Date | Work Order | Description | Hours | Rate | Amount |
|------|------------|-------------|-------|------|--------|
| 2024-01-02 | WO-12345 | Database optimization | 8.00 | €75.00 | €600.00 |
| 2024-01-02 | WO-12346 | Client meeting | 2.00 | €75.00 | €150.00 |
| 2024-01-03 | WO-12345 | API development | 7.50 | €75.00 | €562.50 |
...
```

---

## Available Placeholders

### For Legacy Template-Based Reports

If you're using template files with placeholders:

#### Basic Information
- `{{REPORT_PERIOD}}` - Report period (e.g., "January 2024")
- `{{MONTH_YEAR}}` - Month and year
- `{{GENERATION_DATE}}` - Date report was generated
- `{{CURRENT_DATE}}` - Current date (ISO format)
- `{{CURRENT_YEAR}}` - Current year
- `{{CURRENT_MONTH}}` - Current month number

#### Project Information
- `{{PROJECT_NAME}}` - Project name from settings
- `{{PROJECT_TYPE}}` - Project type (Hourly, Fixed, Retainer)
- `{{CURRENCY}}` - Currency symbol from settings

#### Metrics
- `{{MONTH_HOURS}}` - Total hours in report period
- `{{TOTAL_VALUE}}` - Total revenue/value
- `{{REMAINING_HOURS}}` - Remaining budget hours (fixed-hour projects)
- `{{BUDGET_HOURS}}` - Total budget hours allocated

#### Table Placeholder
- `{{TABLE_PLACEHOLDER}}` - Where the data table is inserted

### Available Query Fields

For query-based reports, you can use any of these fields:

#### Basic Fields
- `date` - Entry date
- `project` - Project/Work Order name
- `task` - Task description
- `hours` - Hours worked
- `rate` - Hourly rate
- `invoiced` - Amount invoiced
- `revenue` - Calculated revenue

#### Utilization & Efficiency
- `utilization` - Time utilization percentage
- `efficiency` - Work efficiency metric

#### Budget Fields
- `budgetHours` - Total allocated hours
- `budgetUsed` - Hours consumed
- `budgetRemaining` - Hours remaining
- `budgetProgress` - Percentage complete

#### Time Fields
- `label` - Period label (e.g., "January 2024")
- `year` - Year number
- `month` - Month number
- `week` - Week number

#### Categorization
- `client` - Client name
- `category` - Work category
- `tag` - Entry tags

#### Retainer Fields
- `retainerHours` - Retainer hours used
- `rolloverHours` - Rolled over hours
- `contractValue` - Contract value

---

## Example Templates

### Example 1: Simple Daily Log

**Query:**
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW date, project, hours, task
VIEW table
```

### Example 2: Detailed Work Order Report

**Query:**
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  date AS "Date",
  project AS "Work Order #",
  category AS "Category",
  task AS "Work Description",
  hours AS "Hours",
  rate FORMAT CURRENCY AS "Hourly Rate",
  invoiced FORMAT MONEY AS "Amount Billed"
VIEW table
SIZE detailed
```

### Example 3: Weekly Summary

**Query:**
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  week AS "Week #",
  hours AS "Total Hours",
  invoiced FORMAT CURRENCY AS "Revenue"
VIEW summary
```

### Example 4: Work Order Grouped Report

**Query:**
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  project AS "Work Order",
  hours AS "Total Hours",
  invoiced FORMAT MONEY AS "Total Amount"
VIEW summary
SIZE normal
```

### Example 5: With Budget Tracking

**Query:**
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  date AS "Date",
  project AS "Work Order",
  hours AS "Hours",
  budgetProgress FORMAT PERCENT AS "Budget %",
  budgetRemaining AS "Hours Left"
VIEW table
SIZE detailed
```

### Example 6: Client Invoice Format

**Query:**
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  date AS "Service Date",
  project AS "Description",
  hours AS "Quantity (hrs)",
  rate FORMAT CURRENCY AS "Rate",
  invoiced FORMAT MONEY AS "Amount"
VIEW table
SIZE normal
```

---

## Best Practices

### 1. Consistent Work Order Naming

Use a consistent format for work order/project names:

```markdown
✅ Good:
- WO-12345
- PROJECT-ABC-001
- Client-Alpha-Phase1

❌ Avoid:
- work order 12345 (inconsistent capitalization)
- WO12345 (missing separator)
- Various random formats
```

### 2. Detailed Task Descriptions

Include meaningful task descriptions in your daily entries:

```markdown
✅ Good:
- Implemented user authentication with OAuth2
- Fixed critical bug in payment processing
- Conducted code review for PR #234

❌ Avoid:
- Work
- Development
- Various tasks
```

### 3. Use Categories/Tags

Categorize your work for better reporting:

```markdown
---
date: 2024-01-15
project: WO-12345
category: development
tags: [backend, database, optimization]
hours: 8
---
```

Then filter reports by category:
```sql
WHERE category = "development"
```

### 4. Track Multiple Work Orders Per Day

If you work on multiple work orders in one day, create separate entries:

```markdown
# 2024-01-15

## WO-12345: Backend Development (5 hours)
- API endpoint creation
- Database schema updates

## WO-12346: Client Support (2 hours)
- Bug investigation
- Hotfix deployment

## WO-12347: Documentation (1 hour)
- Updated API documentation
```

### 5. Use Query Presets

Save frequently used queries by:
1. Create the query in the report generator
2. Test with "Preview"
3. Use the same query for future reports
4. Document the query in your report file as a comment

### 6. Version Your Reports

Include version info in report names:
```
- January-2024-Daily-Report-v1.md (initial)
- January-2024-Daily-Report-v2.md (revised)
```

### 7. Add Context to Reports

Include notes and observations:

```markdown
## Summary
[Generated table here]

## Notes
- Increased hours on WO-12345 due to unexpected complexity
- Client meeting on 15th changed priorities for WO-12346
- Next month: Focus on WO-12347 completion

## Action Items
- [ ] Review WO-12345 budget allocation
- [ ] Schedule follow-up meeting for WO-12346
- [ ] Complete WO-12347 by February 15
```

### 8. Regular Backup

- Export reports to PDF/external storage regularly
- Keep original markdown files version controlled
- Maintain an archive of completed reports

---

## Troubleshooting

### Issue: Work orders not showing properly

**Solution:** Check your timesheet entry format:
```markdown
---
date: 2024-01-15
project: WO-12345  # ← Must be in frontmatter
hours: 8
---
```

### Issue: Hours not calculating correctly

**Solution:** Ensure hours are numeric:
```markdown
---
hours: 8        # ✅ Correct
hours: "8"      # ❌ String won't calculate
hours: 8 hours  # ❌ Include only number
---
```

### Issue: Query returns no data

**Solution:** Check date range and field names:
```sql
-- Verify dates are in YYYY-MM-DD format
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"

-- Check field names match available fields
SHOW date, project, hours  -- ✅
SHOW data, projekct, hrs   -- ❌ Typos
```

### Issue: Template placeholders not replaced

**Solution:** Use query-based approach instead:
- Templates with placeholders have limited support
- Query language provides better flexibility
- Use the report generator modal with queries

---

## Advanced Features

### Custom Formatting

```sql
-- Format numbers with specific precision
SHOW hours FORMAT DECIMAL(1)

-- Custom currency symbols (set in settings)
SHOW rate FORMAT CURRENCY

-- Percentage with precision
SHOW utilization FORMAT PERCENT(PRECISION=2)
```

### Calculated Fields (Future)

Coming soon:
```sql
SHOW 
  hours,
  rate,
  hours * rate AS "Total Revenue"
```

### Aggregations (Future)

Coming soon:
```sql
SHOW 
  project,
  SUM(hours) AS "Total Hours",
  AVG(rate) AS "Avg Rate"
GROUP BY project
```

### Sorting (Future)

Coming soon:
```sql
SHOW project, hours, invoiced
ORDER BY invoiced DESC
```

---

## Quick Reference Card

### Common Queries for Daily Reports

**Current Month - All Details:**
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW date, project, task, hours, rate, invoiced
VIEW table
SIZE detailed
```

**This Week - Summary:**
```sql
WHERE date BETWEEN "2024-01-15" AND "2024-01-21"
SHOW date, project, hours
VIEW summary
SIZE compact
```

**Specific Work Order:**
```sql
WHERE project = "WO-12345"
SHOW date, task, hours, invoiced
VIEW table
```

**Budget Progress:**
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW project, budgetProgress, budgetRemaining
VIEW summary
```

---

## Support

For additional help:
- Check `INTERVAL_REPORTING_GUIDE.md` for query language details
- See `ENHANCED_QUERY_EXAMPLES.md` for more examples
- Review `src/query/README.md` for technical details
- Open an issue on GitHub for bugs or feature requests

---

*Last Updated: 2024*
*Plugin Version: 1.0.0+*
