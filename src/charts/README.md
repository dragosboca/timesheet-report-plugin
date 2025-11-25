# Chart System Documentation

## Overview

The chart system has been refactored into a modular, object-oriented architecture using proper inheritance and separation of concerns. This makes the codebase more maintainable, testable, and extensible.

## Architecture

### Directory Structure

```
src/charts/
├── base/
│   ├── BaseChart.ts          # Abstract base class for all charts
│   ├── ChartConfig.ts         # Type definitions and interfaces
│   └── ChartTheme.ts          # Theme and color management
├── types/
│   ├── TrendChart.ts          # Trend chart implementation
│   ├── MonthlyChart.ts        # Monthly chart implementation
│   └── BudgetChart.ts         # Budget chart implementation
├── ChartFactory.ts            # Factory for creating chart instances
├── index.ts                   # Module exports
└── README.md                  # This file
```

## Key Components

### 1. BaseChart (Abstract Base Class)

All chart types inherit from `BaseChart`, which provides:

- **Common Functionality:**
  - Canvas creation and management
  - Chart instance lifecycle (render, update, destroy, resize)
  - Color palette and theme integration
  - Data validation framework
  - Utility methods (formatting, calculations)

- **Abstract Methods** (must be implemented by derived classes):
  - `buildChartConfig()` - Build Chart.js configuration
  - `validateData()` - Validate chart data
  - `getChartType()` - Return chart type name

**Example:**
```typescript
export class MyChart extends BaseChart {
  protected getChartType(): string {
    return 'MyChart';
  }

  protected validateData(): ChartValidationResult {
    // Validate data...
    return { valid: true, errors: [], warnings: [] };
  }

  protected buildChartConfig(): ChartConfiguration {
    // Build chart configuration...
    return { type: 'line', data: {...}, options: {...} };
  }
}
```

### 2. ChartTheme

Manages theming and colors:

- **Automatic Theme Detection:** Detects Obsidian dark/light theme
- **Style Settings Integration:** Uses custom colors if Style Settings plugin is available
- **Color Utilities:** Convert colors, apply opacity, get contrasting colors
- **Caching:** Caches theme config for performance

**Usage:**
```typescript
const theme = new ChartTheme(plugin);
const colors = theme.getAllColors();
const primary = theme.getColor('primary');
const transparentPrimary = theme.applyOpacity(colors.primary, 0.5);
```

### 3. ChartFactory

Creates chart instances using the factory pattern:

**Benefits:**
- Single point of chart creation
- Type-safe chart creation
- Easy to add new chart types
- Dependency injection (plugin instance)

**Usage:**
```typescript
const factory = new ChartFactory(plugin);

// Create specific charts
const trendChart = factory.createTrendChart(trendData);
const monthlyChart = factory.createMonthlyChart(monthlyData);
const budgetChart = factory.createBudgetChart(budgetData);

// Or create by type name
const chart = factory.createChart(ChartType.TREND, data);
```

## Chart Types

### TrendChart

Shows hours worked and utilization percentage over time.

**Data Structure:**
```typescript
interface TrendChartData {
  labels: string[];          // Time period labels
  hours: number[];          // Hours worked per period
  utilization: number[];    // Utilization (0-1) per period
  invoiced: number[];       // Invoice amounts (optional)
}
```

**Features:**
- Dual Y-axes (hours on left, percentage on right)
- Line chart with smooth curves
- Hours and utilization on same chart
- Automatic scaling

**Usage:**
```typescript
const data: TrendChartData = {
  labels: ['Jan', 'Feb', 'Mar'],
  hours: [160, 144, 168],
  utilization: [0.8, 0.75, 0.85],
  invoiced: [12000, 10800, 12600]
};

const chart = new TrendChart(plugin, data);
await chart.render({ container: element });

// Update data
chart.updateData(newData);

// Clean up
chart.destroy();
```

### MonthlyChart

Shows monthly breakdown of hours and revenue.

**Data Structure:**
```typescript
interface MonthlyChartDataPoint {
  label: string;              // Month label (e.g., "January 2024")
  hours: number;             // Hours worked
  invoiced: number;          // Amount invoiced
  rate: number;              // Hourly rate
  budgetHours?: number;      // Budget hours (optional)
  budgetUsed?: number;       // Hours used from budget (optional)
  budgetRemaining?: number;  // Remaining budget (optional)
  budgetProgress?: number;   // Budget progress 0-1 (optional)
  cumulativeHours?: number;  // Cumulative hours (optional)
}
```

**Features:**
- Stacked bar chart
- Automatically detects budget vs hourly projects
- Shows budget consumption OR potential additional revenue
- Last 12 months by default (configurable)
- Detailed tooltips with working days

**Usage:**
```typescript
const data: MonthlyChartDataPoint[] = [
  {
    label: 'January 2024',
    hours: 160,
    invoiced: 12000,
    rate: 75
  },
  // ... more months
];

const chart = new MonthlyChart(plugin, data);
chart.setMaxMonths(6); // Show only 6 months
await chart.render({ container: element });

// Check if budget project
if (chart.isBudgetProject()) {
  console.log('Budget tracking enabled');
}
```

### BudgetChart

Shows budget consumption and remaining hours over time.

**Data Structure:**
```typescript
interface BudgetChartDataPoint extends MonthlyChartDataPoint {
  budgetHours: number;       // Required: Total budget
  cumulativeHours: number;   // Required: Cumulative hours used
}
```

**Features:**
- Stacked bar chart (used vs remaining)
- Budget progress tracking
- Warns when budget exceeded
- Shows cumulative consumption
- Detailed budget metrics

**Usage:**
```typescript
const data: BudgetChartDataPoint[] = [
  {
    label: 'January 2024',
    hours: 40,
    budgetHours: 200,
    cumulativeHours: 40,
    invoiced: 3000,
    rate: 75
  },
  // ... more months
];

const chart = new BudgetChart(plugin, data);
await chart.render({ container: element });

// Get budget info
const utilization = chart.getTotalUtilization(); // Returns percentage
const remaining = chart.getRemainingBudget();    // Returns hours
const exceeded = chart.isBudgetExceeded();       // Returns boolean
```

## Creating a New Chart Type

To add a new chart type:

1. **Create the chart class** in `src/charts/types/`:

```typescript
// NewChart.ts
import { ChartConfiguration } from 'chart.js';
import { BaseChart } from '../base/BaseChart';
import { ChartValidationResult } from '../base/ChartConfig';

export class NewChart extends BaseChart {
  private data: YourDataType;

  constructor(plugin: TimesheetReportPlugin, data: YourDataType) {
    super(plugin);
    this.data = data;
  }

  protected getChartType(): string {
    return 'New';
  }

  protected validateData(): ChartValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate your data
    if (!this.data) {
      errors.push('Data is missing');
    }
    
    return { valid: errors.length === 0, errors, warnings };
  }

  protected buildChartConfig(): ChartConfiguration {
    const colors = this.getColorPalette();
    
    return {
      type: 'bar', // or 'line', 'pie', etc.
      data: {
        labels: this.data.labels,
        datasets: [{
          label: 'My Data',
          data: this.data.values,
          backgroundColor: colors.primary
        }]
      },
      options: this.getCommonOptions({
        showTitle: true,
        titleText: 'My New Chart'
      })
    };
  }
}
```

2. **Add to ChartFactory:**

```typescript
// ChartFactory.ts
export enum ChartType {
  TREND = 'trend',
  MONTHLY = 'monthly',
  BUDGET = 'budget',
  NEW = 'new'  // Add new type
}

export class ChartFactory {
  createNewChart(data: YourDataType): NewChart {
    return new NewChart(this.plugin, data);
  }

  createChart(type: ChartType | string, data: any): IChartRenderer {
    switch (type.toLowerCase()) {
      case ChartType.NEW:
        return this.createNewChart(data as YourDataType);
      // ... other cases
    }
  }
}
```

3. **Export from index.ts:**

```typescript
// index.ts
export { NewChart } from './types/NewChart';
export type { YourDataType } from './base/ChartConfig';
```

## Data Validation

All charts implement data validation:

```typescript
const validation = chart.validateData();

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  // Handle errors
}

if (validation.warnings.length > 0) {
  console.warn('Validation warnings:', validation.warnings);
  // Handle warnings
}
```

**Validation checks:**
- Data existence and type
- Array lengths match
- Required fields present
- Value ranges (e.g., percentages 0-1)
- Negative values warnings

## Theme and Colors

### Color Palette

```typescript
interface ChartColorPalette {
  primary: string;      // Main color for primary data
  secondary: string;    // Secondary data color
  tertiary: string;     // Third data series
  quaternary: string;   // Fourth data series
  grid: string;         // Grid lines color
  text: string;         // Text and labels color
  background: string;   // Background color
}
```

### Customizing Colors

Colors can be customized via Style Settings plugin:

```css
:root {
  --timesheet-color-primary: #4f81bd;
  --timesheet-color-secondary: #c0504d;
  --timesheet-color-tertiary: #9bbb59;
  --timesheet-color-quaternary: #8064a2;
}
```

### Dark Theme Support

Charts automatically adapt to Obsidian's theme:
- Light theme: Darker colors, lighter backgrounds
- Dark theme: Lighter colors, darker backgrounds
- Grid and text colors adjust automatically

## Best Practices

### 1. Always Validate Data

```typescript
const validation = chart.validateData();
if (!validation.valid) {
  throw new Error(`Invalid data: ${validation.errors.join(', ')}`);
}
```

### 2. Clean Up Charts

```typescript
// When component unmounts or chart is no longer needed
chart.destroy();
```

### 3. Use Factory for Creation

```typescript
// ✅ Good - Use factory
const factory = new ChartFactory(plugin);
const chart = factory.createTrendChart(data);

// ❌ Avoid - Direct instantiation
const chart = new TrendChart(plugin, data);
```

### 4. Handle Errors Gracefully

```typescript
try {
  await chart.render({ container: element });
} catch (error) {
  console.error('Failed to render chart:', error);
  // Show user-friendly message
  element.createEl('p', { text: 'Unable to display chart' });
}
```

### 5. Update Instead of Recreate

```typescript
// ✅ Good - Update existing chart
chart.updateData(newData);

// ❌ Avoid - Recreating chart
chart.destroy();
chart = new TrendChart(plugin, newData);
await chart.render({ container });
```

## Testing

### Unit Testing Example

```typescript
describe('TrendChart', () => {
  let plugin: TimesheetReportPlugin;
  let chart: TrendChart;

  beforeEach(() => {
    plugin = createMockPlugin();
  });

  afterEach(() => {
    chart?.destroy();
  });

  test('validates data correctly', () => {
    const data = {
      labels: ['Jan', 'Feb'],
      hours: [160, 144],
      utilization: [0.8, 0.75],
      invoiced: [12000, 10800]
    };

    chart = new TrendChart(plugin, data);
    const validation = chart.validateData();

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('detects invalid data', () => {
    const data = {
      labels: ['Jan'],
      hours: [160, 144], // Length mismatch
      utilization: [0.8],
      invoiced: [12000]
    };

    chart = new TrendChart(plugin, data);
    const validation = chart.validateData();

    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
});
```

## Usage Examples

### Creating and Rendering Charts

**Using ChartFactory:**
```typescript
import { ChartFactory } from './charts';

const factory = new ChartFactory(plugin);
const chart = factory.createTrendChart(data);
await chart.render({ container });

// Clean up when done
chart.destroy();
```

### Benefits of Migration

1. **Better Type Safety** - Full TypeScript support
2. **Data Validation** - Built-in validation framework
3. **Lifecycle Management** - Proper create/update/destroy
4. **Testability** - Each chart type independently testable
5. **Extensibility** - Easy to add new chart types
6. **Maintainability** - Clear separation of concerns

## Troubleshooting

### Chart Not Rendering

1. **Check data validation:**
   ```typescript
   const validation = chart.validateData();
   console.log('Validation:', validation);
   ```

2. **Verify container exists:**
   ```typescript
   console.log('Container:', container, 'Exists:', document.contains(container));
   ```

3. **Check console for errors:**
   - Open DevTools (Ctrl/Cmd + Shift + I)
   - Look for Chart.js or plugin errors

### Colors Not Applying

1. **Clear theme cache:**
   ```typescript
   chart.theme.clearCache();
   ```

2. **Check CSS variables:**
   ```javascript
   console.log(getComputedStyle(document.body).getPropertyValue('--timesheet-color-primary'));
   ```

### Chart Not Updating

1. **Ensure chart instance exists:**
   ```typescript
   if (chart.chartInstance) {
     chart.update();
   }
   ```

2. **Call update after data change:**
   ```typescript
   chart.updateData(newData);
   // update() is called automatically
   ```

## Performance Considerations

1. **Limit Data Points** - Don't render thousands of points
2. **Debounce Updates** - If data changes frequently
3. **Destroy Unused Charts** - Free up memory
4. **Use Compact Mode** - For mobile/small screens
5. **Lazy Load** - Render charts only when visible

## Future Enhancements

Planned features:

- [ ] Export charts as images
- [ ] Interactive tooltips with custom actions
- [ ] Animation controls
- [ ] Responsive breakpoints
- [ ] Custom tooltip templates
- [ ] Data point click handlers
- [ ] Legend filtering
- [ ] Zoom and pan
- [ ] Time-based X-axis
- [ ] Real-time data updates

## Resources

- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Chart.js Examples](https://www.chartjs.org/docs/latest/samples/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Object-Oriented Design Patterns](https://refactoring.guru/design-patterns)

---

**Version:** 1.0.0  
**Last Updated:** 2024-11-25  
**Maintainer:** Timesheet Report Plugin Team
