# Tables Module

Modern, extensible table generation system for the Timesheet Report Plugin.

## Overview

The tables module provides a clean, object-oriented architecture for generating HTML and Markdown tables. It follows the same design patterns as the chart system, using a factory pattern and inheritance for maximum flexibility and maintainability.

## Architecture

```
tables/
├── base/
│   ├── BaseTable.ts       # Abstract base class
│   └── TableConfig.ts     # Types and interfaces
├── types/
│   ├── TimesheetTable.ts  # Timesheet entries table
│   ├── DailyTable.ts      # Daily entries table
│   └── MonthlyTable.ts    # Monthly data table
├── TableFactory.ts        # Factory for creating tables
└── index.ts               # Module exports
```

## Quick Start

### Basic Usage

```typescript
import { TableFactory } from './tables/TableFactory';
import { TableOptions } from './tables/base/TableConfig';

// Create factory
const factory = new TableFactory(plugin);

// Define options
const options: TableOptions = {
  format: 'html',           // or 'markdown'
  cssClass: 'my-table',
  showTotal: true,
  compact: false
};

// Create and render table
const table = factory.createTimesheetTable(entries, options);
const html = table.render({ format: 'html' });

// Use the output
container.innerHTML = html;
```

### Factory Methods

```typescript
// Create query table (recommended for dynamic data)
const queryTable = factory.createQueryTable(data, options);

// Create specific table types
const timesheetTable = factory.createTimesheetTable(entries, options);
const dailyTable = factory.createDailyTable(dailyEntries, options);
const monthlyTable = factory.createMonthlyTable(monthlyData, options);

// Create by type name
const table = factory.createTable('query', data, options);
const table2 = factory.createTable('timesheet', data, options);

// Check valid types
if (factory.isValidTableType('monthly')) {
  // create table
}

// Get available types
const types = factory.getAvailableTableTypes(); // ['timesheet', 'daily', 'monthly', 'query']
```

## Table Types

### TimesheetTable

Displays individual timesheet entries with date, hours, project, and task description.

**Data Type:** `ExtractedTimeEntry[]`

**Default Columns:**
- Date (formatted)
- Hours (formatted, right-aligned)
- Project
- Task Description

**Compact Columns:**
- Date (short format)
- Hours (formatted, right-aligned)
- Project

**Example:**
```typescript
const table = factory.createTimesheetTable(entries, {
  format: 'html',
  showTotal: true,
  compact: false
});
```

### DailyTable

Displays daily entries aggregated by date.

**Data Type:** `DailyEntry[]`

**Default Columns:**
- Date (formatted)
- Hours (formatted, right-aligned)
- Task Description

**Compact Columns:**
- Date (short format)
- Hours (formatted, right-aligned)

**Example:**
```typescript
const table = factory.createDailyTable(dailyEntries, {
  format: 'markdown',
  showTotal: true
});
```

### QueryTable

**Recommended for most use cases** - A generic table that automatically adapts to any query results.

**Data Type:** `Record<string, unknown>[]` (any object array)

**Features:**
- **Auto-generates columns** from data keys if not specified
- **Auto-detects field types** based on key names (date, currency, percentage, hours)
- **Smart formatting** - automatically formats dates, currency, percentages, etc.
- **Intelligent alignment** - numbers right-aligned, text left-aligned
- **Auto-totals** numeric columns (hours, invoiced, revenue, etc.)
- **Works with any data structure** - perfect for dynamic queries

**Auto-Detection:**
- Fields named `date`, `day` → formatted as dates
- Fields with `invoiced`, `revenue`, `amount`, `rate` → formatted as currency
- Fields with `hours` → formatted with 2 decimals
- Fields with `utilization`, `progress`, `percent` → formatted as percentage
- Numeric fields → right-aligned and included in totals

**Example:**
```typescript
const queryData = [
  { date: new Date(), project: 'Client A', hours: 8.5, invoiced: 680 },
  { date: new Date(), project: 'Client B', hours: 6.0, invoiced: 480 }
];

const table = factory.createQueryTable(queryData, {
  format: 'html',
  showTotal: true
});
// Automatically formats date, right-aligns numbers, shows currency, and totals hours/invoiced
```

**With Custom Columns:**
```typescript
const table = factory.createQueryTable(data, {
  format: 'html',
  columns: query.columns // Use columns from SHOW clause
});
```

### MonthlyTable

Displays monthly aggregated data with revenue and utilization metrics.

**Data Type:** `MonthlyTableData[]`

**Default Columns:**
- Period (month label)
- Hours (formatted, right-aligned)
- Invoiced (currency formatted, right-aligned)
- Utilization or Progress (percentage, right-aligned)

The last column automatically switches between:
- **Utilization** - For time-based projects
- **Progress** - For budget-based projects (when `budgetHours` is present)

**Compact Columns:**
- Period
- Hours (formatted, right-aligned)
- Revenue (currency formatted, right-aligned)

**Example:**
```typescript
const table = factory.createMonthlyTable(monthlyData, {
  format: 'html',
  cssClass: 'monthly-table',
  showTotal: true
});
```

## Table Options

### TableOptions Interface

```typescript
interface TableOptions {
  format: 'html' | 'markdown';    // Output format
  columns?: TableColumn[];         // Custom columns (optional)
  title?: string;                  // Table title/caption
  cssClass?: string;               // CSS class for HTML tables
  showTotal?: boolean;             // Show totals row
  compact?: boolean;               // Use compact column set
  sortable?: boolean;              // Enable sorting (future)
  striped?: boolean;               // Striped rows (future)
  bordered?: boolean;              // Bordered table (future)
  hoverable?: boolean;             // Hoverable rows (future)
}
```

### Custom Columns

You can override default columns with the `columns` option:

```typescript
const customColumns: TableColumn[] = [
  {
    key: 'date',
    label: 'Date',
    width: '100px',
    align: 'left',
    format: (value) => formatDate(value as Date)
  },
  {
    key: 'hours',
    label: 'Time',
    align: 'right',
    format: (value) => `${value}h`
  },
  {
    key: 'project',
    label: 'Project Name',
    hidden: false
  }
];

const table = factory.createTimesheetTable(entries, {
  format: 'html',
  columns: customColumns
});
```

### TableColumn Interface

```typescript
interface TableColumn {
  key: string;                           // Data property key
  label: string;                         // Column header
  width?: string;                        // Column width (HTML only)
  align?: 'left' | 'center' | 'right';  // Text alignment
  format?: (value: unknown) => string;   // Custom formatter
  sortable?: boolean;                    // Enable sorting
  hidden?: boolean;                      // Hide column
}
```

## Render Options

```typescript
interface TableRenderOptions {
  container?: HTMLElement;  // Container element (for future use)
  format: 'html' | 'markdown';
  dimensions?: {
    width?: string;
    maxHeight?: string;
    compact?: boolean;
  };
  className?: string;
}
```

## Output Formats

### HTML Format

Generates semantic HTML table with proper escaping:

```html
<table class="timesheet-table">
  <caption>My Table</caption>
  <thead>
    <tr>
      <th>Date</th>
      <th class="align-right">Hours</th>
      <th>Project</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2024-01-15</td>
      <td class="align-right">8.50</td>
      <td>Project A</td>
    </tr>
  </tbody>
</table>
```

Features:
- Proper HTML escaping
- CSS classes for styling
- Alignment classes
- Caption support
- Total row with special class

### Markdown Format

Generates GitHub-flavored Markdown tables:

```markdown
### My Table

| Date | Hours | Project |
|---|---:|---|
| 2024-01-15 | 8.50 | Project A |
| **Total** | **8.50** | |
```

Features:
- Column alignment markers
- Proper escaping of pipe characters
- Bold total row
- Title as heading

## Advanced Features

### Data Validation

All tables validate their data before rendering:

```typescript
const table = factory.createTimesheetTable(entries, options);

// Validation happens automatically during render
try {
  const html = table.render({ format: 'html' });
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

Validation checks:
- Columns have required properties (key, label)
- Data types are appropriate
- Required fields are present

### Totals Calculation

Tables automatically calculate totals for numeric columns:

```typescript
const table = factory.createMonthlyTable(data, {
  format: 'html',
  showTotal: true  // Enable totals row
});
```

Default totalable columns:
- **TimesheetTable**: `hours`
- **DailyTable**: `hours`
- **MonthlyTable**: `hours`, `invoiced`

### Empty Data Handling

Tables gracefully handle empty data:

```typescript
const table = factory.createTimesheetTable([], options);
const html = table.render({ format: 'html' });
// Renders table with "No data found" message
```

### Data Access

Access and modify table data:

```typescript
const table = factory.createTimesheetTable(entries, options);

// Get data
const data = table.getData();

// Set new data
table.setData(newEntries);

// Get columns
const columns = table.getColumns();

// Set new columns
table.setColumns(newColumns);

// Update options
table.setOptions({ showTotal: false });

// Re-render with new data/options
const html = table.render({ format: 'html' });
```

## Creating Custom Table Types

Extend `BaseTable` to create new table types:

```typescript
import { BaseTable } from './base/BaseTable';
import { TableColumn, TableOptions } from './base/TableConfig';

interface MyDataType {
  id: number;
  name: string;
  value: number;
}

export class MyCustomTable extends BaseTable<MyDataType> {
  constructor(plugin: TimesheetReportPlugin, data: MyDataType[], options: TableOptions) {
    super(plugin, data, options);
  }

  protected getDefaultColumns(): TableColumn[] {
    return [
      {
        key: 'id',
        label: 'ID',
        align: 'right'
      },
      {
        key: 'name',
        label: 'Name'
      },
      {
        key: 'value',
        label: 'Value',
        align: 'right',
        format: (value) => this.formatter.formatNumber(value as number)
      }
    ];
  }

  protected getTableType(): string {
    return 'Custom';
  }

  protected getTotalableColumns(): string[] {
    return ['value'];
  }
}
```

Then add to factory:

```typescript
// In TableFactory.ts
createMyCustomTable(data: MyDataType[], options: TableOptions): MyCustomTable {
  return new MyCustomTable(this.plugin, data, options);
}
```

## Integration with Query System

Tables integrate seamlessly with the query system:

```typescript
// Query processor provides columns from SHOW clause
const processedData = await queryProcessor.processQuery(query);

const table = factory.createTimesheetTable(processedData.entries, {
  format: 'markdown',
  columns: query.columns  // Use columns from SHOW clause
});
```

## Styling

### HTML Tables

Style HTML tables with CSS:

```css
.timesheet-table {
  width: 100%;
  border-collapse: collapse;
}

.timesheet-table th {
  background-color: var(--background-secondary);
  padding: 8px;
  text-align: left;
}

.timesheet-table td {
  padding: 8px;
  border-bottom: 1px solid var(--background-modifier-border);
}

.timesheet-table .align-right {
  text-align: right;
}

.timesheet-table .total-row {
  font-weight: bold;
  border-top: 2px solid var(--text-normal);
}
```

### Compact Mode

Use compact mode for smaller displays:

```typescript
const table = factory.createMonthlyTable(data, {
  format: 'html',
  compact: true  // Uses fewer columns
});
```

## Best Practices

### 1. Prefer QueryTable for Dynamic Data
For query results or dynamic data, use QueryTable:
```typescript
// Best - automatically adapts to any data
const table = factory.createQueryTable(data, options);

// Only use specific types when you need their exact behavior
const table = factory.createTimesheetTable(entries, options);
```

### 2. Use Factory Pattern
Always create tables through the factory:
```typescript
// Good
const table = factory.createQueryTable(data, options);

// Bad
const table = new QueryTable(plugin, data, options);
```

### 3. Validate Options
Check format strings before using:
```typescript
import { isValidTableFormat } from './tables/base/TableConfig';

if (isValidTableFormat(userFormat)) {
  // use format
}
```

### 4. Handle Errors
Wrap render calls in try-catch:
```typescript
try {
  const html = table.render({ format: 'html' });
  container.innerHTML = html;
} catch (error) {
  console.error('Failed to render table:', error);
  // Show error to user
}
```

### 5. Reuse Instances
Tables can be re-rendered with different options:
```typescript
const table = factory.createTimesheetTable(data, options);

// Render as HTML
const html = table.render({ format: 'html' });

// Later, render as Markdown
const markdown = table.render({ format: 'markdown' });
```

### 6. Custom Formatting
Use formatters from the rendering module:
```typescript
import { Formatter } from '../rendering/Formatter';

const formatter = new Formatter('€');

const columns: TableColumn[] = [
  {
    key: 'revenue',
    label: 'Revenue',
    format: (value) => formatter.formatCurrency(value as number)
  }
];
```

## Testing

Example test structure:

```typescript
import { TableFactory } from './TableFactory';
import { MockPlugin } from '../test-utils';

describe('TimesheetTable', () => {
  let factory: TableFactory;
  let plugin: MockPlugin;

  beforeEach(() => {
    plugin = new MockPlugin();
    factory = new TableFactory(plugin);
  });

  test('renders HTML table', () => {
    const data = [
      { date: new Date(), hours: 8, project: 'Test', taskDescription: 'Work' }
    ];
    
    const table = factory.createQueryTable(data, { format: 'html' });
    const html = table.render({ format: 'html' });
    
    expect(html).toContain('<table');
    expect(html).toContain('Date</th>');
  });

  test('auto-detects field types', () => {
    const data = [
      { date: new Date(), hours: 8.5, invoiced: 680, utilization: 0.75 }
    ];
    
    const table = factory.createQueryTable(data, { format: 'html' });
    const html = table.render({ format: 'html' });
    
    expect(html).toContain('€680.00'); // currency
    expect(html).toContain('8.50'); // hours
    expect(html).toContain('75%'); // percentage
  });

  test('calculates totals', () => {
    const data = [
      { date: new Date(), hours: 5, project: 'A', taskDescription: 'Work' },
      { date: new Date(), hours: 3, project: 'B', taskDescription: 'Work' }
    ];
    
    const table = factory.createTimesheetTable(data, {
      format: 'html',
      showTotal: true
    });
    const html = table.render({ format: 'html' });
    
    expect(html).toContain('8.00');
    expect(html).toContain('total-row');
  });
});
```

## Performance

- Table generation is synchronous and fast
- Validation adds minimal overhead
- Format functions are called once per cell
- Consider paginating large datasets
- Compact mode reduces column count

## Dependencies

- `TimesheetReportPlugin` - Main plugin instance
- `Formatter` from `../rendering` - Value formatting
- `Validator` from `../rendering` - Data validation
- `RenderUtils` from `../rendering` - Rendering utilities
- `DateUtils` from `../utils/date-utils` - Date formatting

## Exports

```typescript
export { TableFactory, TableType } from './TableFactory';
export { QueryTable } from './types/QueryTable';
export { TimesheetTable } from './types/TimesheetTable';
export { DailyTable } from './types/DailyTable';
export { MonthlyTable, MonthlyTableData } from './types/MonthlyTable';
export { BaseTable } from './base/BaseTable';
export type {
  TableColumn,
  TableFormat,
  TableOptions,
  TableRenderOptions,
  ITableRenderer,
  // ... other types
} from './base/TableConfig';
```
