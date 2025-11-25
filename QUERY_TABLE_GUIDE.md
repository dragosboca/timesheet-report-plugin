# QueryTable Guide

## Overview

`QueryTable` is a smart, generic table type that automatically adapts to any data structure. It's the **recommended choice** for displaying query results in the Timesheet Report Plugin.

## Why QueryTable?

### Problems with Specific Table Types

Before QueryTable, you had to:
1. Detect what fields were in your data
2. Choose the right table type (TimesheetTable, DailyTable, MonthlyTable)
3. Handle edge cases when data didn't match expectations
4. Write complex detection logic

### QueryTable Solution

QueryTable **automatically**:
- ✅ Generates columns from your data
- ✅ Detects field types (dates, currency, percentages, hours)
- ✅ Applies appropriate formatting
- ✅ Aligns columns intelligently
- ✅ Calculates totals for numeric fields
- ✅ Handles compact mode
- ✅ Works with ANY data structure

## Quick Start

```typescript
import { TableFactory } from './tables/TableFactory';

const factory = new TableFactory(plugin);

// Your data - any structure!
const data = [
  { date: new Date('2024-01-15'), project: 'Client A', hours: 8.5, invoiced: 680 },
  { date: new Date('2024-01-16'), project: 'Client B', hours: 6.0, invoiced: 480 }
];

// Create table - it figures everything out!
const table = factory.createQueryTable(data, {
  format: 'html',
  showTotal: true
});

const html = table.render({ format: 'html' });
```

**Result:**
- `date` → Formatted as "2024-01-15"
- `project` → Left-aligned text
- `hours` → Right-aligned, formatted as "8.50"
- `invoiced` → Right-aligned, formatted as "€680.00"
- Total row shows: "14.50" hours, "€1,160.00" invoiced

## Auto-Detection Rules

### Field Type Detection

QueryTable looks at field names to determine how to format them:

#### Dates
**Triggers:** `date`, `day`, or contains `date`
**Format:** `DateUtils.formatDate()` - "YYYY-MM-DD"
**Example:**
```typescript
{ date: new Date() }        // → "2024-01-15"
{ startDate: new Date() }   // → "2024-01-15"
{ day: new Date() }         // → "2024-01-15"
```

#### Currency
**Triggers:** `invoiced`, `revenue`, `amount`, `rate`, contains `price` or `cost`
**Format:** Symbol + number with 2 decimals
**Example:**
```typescript
{ invoiced: 680 }      // → "€680.00"
{ revenue: 1250.5 }    // → "€1,250.50"
{ rate: 80 }           // → "€80.00"
{ amount: 99.99 }      // → "€99.99"
```

#### Hours
**Triggers:** `hours` or contains `hours`
**Format:** Number with 2 decimals
**Example:**
```typescript
{ hours: 8.5 }         // → "8.50"
{ totalHours: 40 }     // → "40.00"
{ billableHours: 6 }   // → "6.00"
```

#### Percentages
**Triggers:** `utilization`, `progress`, `percent`, `percentage`
**Format:** Whole number + "%"
**Example:**
```typescript
{ utilization: 0.75 }     // → "75%"
{ progress: 0.5 }         // → "50%"
{ percentage: 0.832 }     // → "83%"
{ budgetProgress: 1.0 }   // → "100%"
```

#### Numbers
**Triggers:** `count`, `total`, `budget`, or any numeric field
**Format:** Number with 2 decimals
**Alignment:** Right
**Example:**
```typescript
{ count: 42 }          // → "42.00"
{ totalEntries: 150 }  // → "150.00"
```

#### Text
**Default:** All other fields
**Format:** As-is
**Alignment:** Left
**Example:**
```typescript
{ project: "Client A" }    // → "Client A"
{ description: "Work" }    // → "Work"
{ client: "Acme Corp" }    // → "Acme Corp"
```

### Label Generation

QueryTable converts field names to human-readable labels:

```typescript
// camelCase → Title Case
{ firstName: "John" }           // Column: "First Name"
{ projectName: "Alpha" }        // Column: "Project Name"
{ totalHours: 40 }              // Column: "Total Hours"

// snake_case → Title Case
{ first_name: "John" }          // Column: "First Name"
{ project_name: "Alpha" }       // Column: "Project Name"

// Single word → Capitalized
{ hours: 8 }                    // Column: "Hours"
{ project: "Beta" }             // Column: "Project"
```

### Alignment

```typescript
// Right-aligned (numeric fields)
hours, rate, invoiced, revenue, amount, budget, 
utilization, progress, percentage, count, total

// Left-aligned (everything else)
date, project, client, description, task, etc.
```

### Totals

QueryTable automatically totals these fields:
```typescript
hours, invoiced, revenue, amount, total, budget
```

Only if they contain numeric values!

## Usage with Queries

### Basic Query

```typescript
const query = `
  WHERE year = 2024
  SHOW date, project, hours, invoiced
  VIEW table
`;

const data = await queryProcessor.processQuery(query);

const table = factory.createQueryTable(data.entries, {
  format: 'html',
  columns: query.columns  // Use columns from SHOW clause
});
```

### Query Without SHOW

If no SHOW clause, QueryTable generates columns automatically:

```typescript
const query = `
  WHERE year = 2024
  VIEW table
`;

const data = await queryProcessor.processQuery(query);

// Auto-generates columns from data.entries keys!
const table = factory.createQueryTable(data.entries, {
  format: 'html'
  // columns not needed - will be auto-generated
});
```

### Custom Columns

Override auto-detection with custom columns:

```typescript
const customColumns: TableColumn[] = [
  {
    key: 'date',
    label: 'Work Date',
    format: (value) => formatter.formatDateShort(value as Date)
  },
  {
    key: 'revenue',
    label: 'Income',
    format: (value) => `$${value}` // US dollars instead of Euro
  }
];

const table = factory.createQueryTable(data, {
  format: 'html',
  columns: customColumns
});
```

## Compact Mode

In compact mode, QueryTable shows only the most important columns:

```typescript
const table = factory.createQueryTable(data, {
  format: 'html',
  compact: true  // Shows 3-4 most important columns
});
```

**Priority order:**
1. `date` / `period` / `label`
2. `project` / `client`
3. `hours`
4. `invoiced` / `revenue`

## Output Formats

### HTML

```typescript
const table = factory.createQueryTable(data, {
  format: 'html',
  cssClass: 'my-custom-table',
  showTotal: true
});

const html = table.render({ format: 'html' });
// <table class="my-custom-table">...</table>
```

### Markdown

```typescript
const table = factory.createQueryTable(data, {
  format: 'markdown',
  title: 'Monthly Report',
  showTotal: true
});

const markdown = table.render({ format: 'markdown' });
// ### Monthly Report
// | Date | Project | Hours | Invoiced |
// |---|---|---:|---:|
```

## Examples

### Example 1: Timesheet Entries

```typescript
const entries = [
  {
    date: new Date('2024-01-15'),
    project: 'Website Redesign',
    task: 'Frontend development',
    hours: 8.5,
    rate: 80,
    invoiced: 680
  },
  {
    date: new Date('2024-01-16'),
    project: 'Mobile App',
    task: 'Bug fixes',
    hours: 6.0,
    rate: 80,
    invoiced: 480
  }
];

const table = factory.createQueryTable(entries, {
  format: 'html',
  showTotal: true
});
```

**Output:**
| Date | Project | Task | Hours | Rate | Invoiced |
|------|---------|------|------:|-----:|---------:|
| 2024-01-15 | Website Redesign | Frontend development | 8.50 | €80.00 | €680.00 |
| 2024-01-16 | Mobile App | Bug fixes | 6.00 | €80.00 | €480.00 |
| **Total** | | | **14.50** | | **€1,160.00** |

### Example 2: Monthly Summary

```typescript
const monthly = [
  {
    period: 'January 2024',
    hours: 160,
    invoiced: 12800,
    utilization: 0.87,
    budgetProgress: 0.45
  },
  {
    period: 'February 2024',
    hours: 152,
    invoiced: 12160,
    utilization: 0.85,
    budgetProgress: 0.88
  }
];

const table = factory.createQueryTable(monthly, {
  format: 'html',
  showTotal: true
});
```

**Output:**
| Period | Hours | Invoiced | Utilization | Budget Progress |
|--------|------:|---------:|------------:|----------------:|
| January 2024 | 160.00 | €12,800.00 | 87% | 45% |
| February 2024 | 152.00 | €12,160.00 | 85% | 88% |
| **Total** | **312.00** | **€24,960.00** | | |

### Example 3: Custom Aggregation

```typescript
const projectSummary = [
  {
    client: 'Acme Corp',
    projectCount: 3,
    totalHours: 240,
    averageRate: 85,
    totalRevenue: 20400
  },
  {
    client: 'TechStart Inc',
    projectCount: 1,
    totalHours: 80,
    averageRate: 90,
    totalRevenue: 7200
  }
];

const table = factory.createQueryTable(projectSummary, {
  format: 'html',
  showTotal: true
});
```

**Output:**
| Client | Project Count | Total Hours | Average Rate | Total Revenue |
|--------|-------------:|------------:|-------------:|--------------:|
| Acme Corp | 3.00 | 240.00 | €85.00 | €20,400.00 |
| TechStart Inc | 1.00 | 80.00 | €90.00 | €7,200.00 |
| **Total** | **4.00** | **320.00** | | **€27,600.00** |

## Advanced Features

### Dynamic Data Sources

QueryTable works with ANY data:

```typescript
// Timesheet entries
const table1 = factory.createQueryTable(data.entries, options);

// Monthly aggregation
const table2 = factory.createQueryTable(data.monthlyData, options);

// Custom query result
const customData = entries
  .filter(e => e.billable)
  .map(e => ({
    client: e.client,
    week: getWeek(e.date),
    hours: e.hours,
    revenue: e.hours * e.rate
  }));
const table3 = factory.createQueryTable(customData, options);
```

### Handling Missing Data

```typescript
const data = [
  { date: new Date(), hours: 8, invoiced: 640 },
  { date: new Date(), hours: 6 } // invoiced missing
];

const table = factory.createQueryTable(data, {
  format: 'html',
  showTotal: true
});
// Missing values shown as empty, still totals correctly
```

### Empty Data

```typescript
const table = factory.createQueryTable([], {
  format: 'html'
});
// Renders table with "No data found" message
```

## Comparison with Specific Tables

### When to Use QueryTable

✅ **Use QueryTable when:**
- Displaying query results
- Working with dynamic data structures
- You want automatic formatting
- Column configuration may change
- You want the simplest solution

### When to Use Specific Tables

⚠️ **Use TimesheetTable/DailyTable/MonthlyTable when:**
- You need exact control over column behavior
- You're implementing custom validation
- You need very specific formatting that differs from auto-detection
- You're extending the table class with custom methods

**Recommendation:** Start with QueryTable. Only use specific tables if you have a strong reason!

## Best Practices

### 1. Let Auto-Detection Work

```typescript
// Good - let QueryTable do its thing
const table = factory.createQueryTable(data, { format: 'html' });

// Avoid - only customize if needed
const table = factory.createQueryTable(data, {
  format: 'html',
  columns: manuallyDefinedColumns
});
```

### 2. Use Meaningful Field Names

```typescript
// Good - clear field names
{ hours: 8, invoiced: 640, utilization: 0.8 }

// Avoid - unclear abbreviations
{ hrs: 8, inv: 640, util: 0.8 }
```

### 3. Consistent Data Types

```typescript
// Good - consistent types
[
  { hours: 8.5, project: 'A' },
  { hours: 6.0, project: 'B' }
]

// Avoid - mixed types
[
  { hours: 8.5, project: 'A' },
  { hours: '6', project: 123 }  // string and number mixed!
]
```

### 4. Provide Options

```typescript
// Good - specify what you need
const table = factory.createQueryTable(data, {
  format: 'html',
  cssClass: 'report-table',
  showTotal: true,
  title: 'Monthly Report'
});
```

## Troubleshooting

### Wrong Format Applied

**Problem:** Field formatted incorrectly
**Solution:** Field name doesn't match detection rules. Either:
1. Rename the field (e.g., `amt` → `amount`)
2. Provide custom column with format function

### Missing Totals

**Problem:** Numeric field not totaled
**Solution:** Field name doesn't match totalable rules. Either:
1. Rename field to include: hours, invoiced, revenue, amount, total, budget
2. Use specific table type with custom `getTotalableColumns()`

### Wrong Alignment

**Problem:** Column aligned wrong way
**Solution:** Field name doesn't match alignment rules. Provide custom column:
```typescript
columns: [{
  key: 'myField',
  label: 'My Field',
  align: 'right'
}]
```

## API Reference

### Factory Method

```typescript
createQueryTable(
  data: Record<string, unknown>[],
  options: TableOptions
): QueryTable
```

### TableOptions

```typescript
interface TableOptions {
  format: 'html' | 'markdown';
  columns?: TableColumn[];      // Optional custom columns
  title?: string;               // Table title
  cssClass?: string;            // HTML CSS class
  showTotal?: boolean;          // Show totals row
  compact?: boolean;            // Compact mode (fewer columns)
}
```

### Methods

```typescript
// Render table
table.render({ format: 'html' | 'markdown' }): string

// Get/set data
table.getData(): Record<string, unknown>[]
table.setData(data: Record<string, unknown>[]): void

// Get/set columns
table.getColumns(): TableColumn[]
table.setColumns(columns: TableColumn[]): void

// Update options
table.setOptions(options: Partial<TableOptions>): void
```

## Conclusion

QueryTable is the **smartest and simplest** way to display data in the Timesheet Report Plugin. It automatically handles:

- ✅ Any data structure
- ✅ Field type detection
- ✅ Formatting
- ✅ Alignment
- ✅ Totals
- ✅ Compact mode

**Use it for 99% of your table needs!**
