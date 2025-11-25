---
project: Acme Corp Website Redesign
tags: [queries, examples, hourly-billing]
---

# Sample Queries for Hourly Projects

This file demonstrates various query patterns for hourly/time-and-materials projects. Copy and paste these queries into your notes to test the timesheet report functionality.

## Basic Time Tracking Queries

### Daily Summary
```timesheet-report
WHERE year = 2024 AND month = 1 AND date = "2024-01-15"
SHOW hours, invoiced
VIEW summary
```

### Weekly Overview
```timesheet-report
WHERE year = 2024 AND month = 1
SHOW hours, invoiced, utilization
VIEW table
SIZE detailed
```

### Monthly Billing Report
```timesheet-report
WHERE year = 2024 AND month = 1
SHOW hours, invoiced
VIEW full
SIZE detailed
```

## Client Billing Queries

### Invoice Preparation
```timesheet-report
WHERE project = "Acme Corp Website Redesign" AND year = 2024 AND month = 1
SHOW hours, invoiced, utilization
VIEW table
SIZE detailed
```

### Year-to-Date Summary
```timesheet-report
WHERE project = "Acme Corp Website Redesign" AND year = 2024
SHOW hours, invoiced
VIEW summary
PERIOD current-year
```

### Hourly Rate Analysis
```timesheet-report
WHERE year = 2024
SHOW hours, invoiced, utilization
VIEW chart
CHART trend
PERIOD current-year
```

## Time Analysis Queries

### Daily Productivity Tracking
```timesheet-report
WHERE year = 2024 AND month = 1
SHOW hours, utilization
VIEW chart
CHART monthly
SIZE compact
```

### Project Efficiency Metrics
```timesheet-report
WHERE project = "Acme Corp Website Redesign"
SHOW hours, invoiced, utilization
VIEW full
CHART trend
PERIOD all-time
```

### Workload Distribution
```timesheet-report
WHERE year = 2024
SHOW hours, utilization
VIEW chart
CHART monthly
PERIOD last-6-months
```

## Comparative Analysis

### Month-over-Month Comparison
```timesheet-report
WHERE year = 2024
SHOW hours, invoiced, utilization
VIEW chart
CHART trend
PERIOD last-6-months
SIZE detailed
```

### Project Timeline View
```timesheet-report
WHERE project = "Acme Corp Website Redesign"
SHOW hours, invoiced
VIEW full
CHART trend
PERIOD all-time
```

## Specialized Reports

### Compact Daily View
```timesheet-report
WHERE year = 2024 AND month = 1
SHOW hours
VIEW table
SIZE compact
```

### Detailed Financial Summary
```timesheet-report
WHERE year = 2024
SHOW hours, invoiced, utilization
VIEW full
PERIOD current-year
SIZE detailed
```

### Quick Status Check
```timesheet-report
WHERE year = 2024 AND month = 1
SHOW hours, invoiced
VIEW summary
SIZE compact
```

## Advanced Query Patterns

### Multi-Project View (if applicable)
```timesheet-report
WHERE year = 2024
SHOW hours, invoiced, utilization
VIEW table
CHART monthly
PERIOD current-year
```

### Performance Trending
```timesheet-report
WHERE year = 2024
SHOW hours, utilization
VIEW chart
CHART trend
PERIOD last-12-months
SIZE detailed
```

### Client Communication Report
```timesheet-report
WHERE project = "Acme Corp Website Redesign" AND year = 2024 AND month = 1
SHOW hours, invoiced
VIEW full
SIZE detailed
```

## Query Tips for Hourly Projects

### Best Practices
1. **Daily Tracking**: Use date-specific queries for daily summaries
2. **Weekly Reviews**: Month + week ranges for sprint reviews
3. **Monthly Billing**: Full month queries for invoice preparation
4. **Trend Analysis**: Multi-month views for pattern recognition

### Common Use Cases
- **Client Invoicing**: Focus on `invoiced` field for billing
- **Time Management**: Use `utilization` for productivity analysis
- **Project Planning**: `trend` charts for future estimation
- **Performance Review**: Year-over-year comparisons

### Rate Optimization Queries
```timesheet-report
WHERE year = 2024
SHOW hours, invoiced, utilization
VIEW chart
CHART trend
PERIOD current-year
```

This helps track:
- Billable vs. non-billable time ratios
- Rate effectiveness over time
- Client project profitability
- Time allocation efficiency

## Integration Examples

### Dashboard Embedding
Create a project dashboard by combining multiple queries:

**Quick Stats:**
```timesheet-report
WHERE year = 2024 AND month = 1
SHOW hours, invoiced
VIEW summary
SIZE compact
```

**Detailed Breakdown:**
```timesheet-report
WHERE year = 2024 AND month = 1
SHOW hours, invoiced, utilization
VIEW table
SIZE detailed
```

**Trend Analysis:**
```timesheet-report
WHERE project = "Acme Corp Website Redesign"
SHOW hours, invoiced
VIEW chart
CHART trend
PERIOD last-6-months
```

### Template Integration
Use these queries in your daily/weekly note templates:

```markdown
## Today's Time Summary
<!-- Query for today's hours -->

## This Week's Progress  
<!-- Query for week-to-date -->

## Project Status
<!-- Query for project totals -->
```

---

**Note:** These queries work with the sample timesheet data in this vault. Adjust dates, project names, and parameters based on your actual data structure.
