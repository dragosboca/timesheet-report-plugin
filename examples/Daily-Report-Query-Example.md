# Daily Detailed Timesheet Report

This example shows how to generate a detailed day-by-day report for the current month with hours worked and work order information.

## Query to Generate This Report

```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  date AS "Date",
  project AS "Work Order/Project",
  task AS "Description", 
  hours AS "Hours Worked",
  rate FORMAT CURRENCY AS "Rate",
  invoiced FORMAT MONEY AS "Amount"
VIEW table
SIZE detailed
```

## Report Format

The above query will generate a report that looks like this:

---

# Monthly Timesheet Report - January 2024

**Report Period:** January 1, 2024 - January 31, 2024  
**Generated:** 2024-02-01  

## Summary

- **Total Hours:** 168.50
- **Total Revenue:** €12,637.50
- **Number of Entries:** 22
- **Average Utilization:** 87%

## Detailed Data

| Date | Work Order/Project | Description | Hours Worked | Rate | Amount |
|------|-------------------|-------------|--------------|------|--------|
| 2024-01-02 | WO-12345 | Database optimization | 8.00 | €75.00 | €600.00 |
| 2024-01-02 | WO-12346 | Client meeting | 2.00 | €75.00 | €150.00 |
| 2024-01-03 | WO-12345 | API development | 7.50 | €75.00 | €562.50 |
| 2024-01-03 | WO-12347 | Code review | 1.50 | €75.00 | €112.50 |
| 2024-01-04 | WO-12345 | Testing and debugging | 8.00 | €75.00 | €600.00 |
| 2024-01-05 | WO-12348 | Documentation | 6.00 | €75.00 | €450.00 |
| ... | ... | ... | ... | ... | ... |

---

## Alternative Queries for Different Views

### 1. Grouped by Project/Work Order

```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  project AS "Work Order",
  hours AS "Total Hours",
  invoiced FORMAT MONEY AS "Total Amount"
VIEW summary
```

### 2. Week-by-Week Breakdown

```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  week AS "Week",
  hours AS "Hours",
  invoiced FORMAT CURRENCY AS "Revenue"
VIEW table
```

### 3. With Budget Tracking (if using fixed-hours projects)

```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  date AS "Date",
  project AS "Work Order",
  hours AS "Hours",
  budgetUsed AS "Budget Used",
  budgetRemaining AS "Budget Remaining",
  budgetProgress FORMAT PERCENT AS "Progress"
VIEW table
SIZE detailed
```

### 4. Compact Mobile View

```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  date AS "Date",
  hours AS "Hours",
  project AS "Work Order"
VIEW table
SIZE compact
```

### 5. With Categories/Tags

```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  date AS "Date",
  category AS "Type",
  project AS "Work Order",
  task AS "Description",
  hours AS "Hours"
VIEW table
SIZE detailed
```

## How to Use

1. Open the report generator: `Ctrl/Cmd + P` → "Generate Timesheet Report"
2. Select date range:
   - Click "Current Month" preset, or
   - Manually enter start date (e.g., `2024-01-01`) and end date (e.g., `2024-01-31`)
3. Paste one of the queries above into the query editor
4. Click "Preview" to see the data
5. Enter a report name (e.g., "January 2024 Daily Report")
6. Click "Generate Report"

## Tips for Daily Detailed Reports

### Including Work Order Numbers
Make sure your timesheet entries use consistent project naming:
- Use format: `WO-12345` or `Project-ABC` 
- Keep naming consistent across all entries
- The `project` field will show in the report

### Capturing Task Details
Use the `task` or `taskDescription` field in your daily timesheet entries:
```markdown
---
date: 2024-01-15
project: WO-12345
hours: 8
---

- Database optimization and query tuning
- Fixed performance issues in user dashboard
- Code review for PR #234
```

### Organizing by Work Orders
If you track multiple work orders per day, create separate entries:
```markdown
---
date: 2024-01-15
---

## WO-12345 - Database Work (6 hours)
- Query optimization
- Index creation

## WO-12346 - Client Meeting (2 hours)
- Requirements discussion
- Sprint planning
```

### Using Categories
Add frontmatter tags or categories to your entries:
```markdown
---
date: 2024-01-15
project: WO-12345
category: development
hours: 8
---
```

Then query by category:
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31" AND category = "development"
SHOW date, project, task, hours
```

## Advanced: Custom Template with Query

You can create a custom template that includes the query in comments:

```markdown
# {{REPORT_NAME}}

<!-- Query Used:
WHERE date BETWEEN "{{START_DATE}}" AND "{{END_DATE}}"
SHOW date, project, task, hours, rate, invoiced
VIEW table
SIZE detailed
-->

**Period:** {{START_DATE}} to {{END_DATE}}  
**Generated:** {{GENERATION_DATE}}

## Summary
- Total Hours: {{TOTAL_HOURS}}
- Total Revenue: {{TOTAL_REVENUE}}

## Daily Breakdown

{{TABLE_PLACEHOLDER}}

## Notes
Add any additional notes or observations here.
```

This allows you to:
1. Document which query generated the report
2. Easily regenerate with updated date ranges
3. Keep report generation reproducible

---

**Pro Tip:** Save commonly used queries as presets by clicking the preset buttons in the report generator modal. The plugin includes several built-in presets like "Detailed Breakdown", "Client Analysis", and "Budget Tracking".
