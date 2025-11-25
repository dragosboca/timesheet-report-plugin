# Rendering Module

Common utilities for rendering charts and tables in the Timesheet Report Plugin.

## Overview

This module provides shared functionality used by both the chart and table generation systems, eliminating code duplication and ensuring consistent behavior across the plugin.

## Components

### Formatter

Handles all value formatting operations.

**Usage:**
```typescript
import { Formatter } from './rendering/Formatter';

const formatter = new Formatter('€'); // currency symbol

// Format numbers
formatter.formatNumber(1234.567, 2); // "1,234.57"

// Format currency
formatter.formatCurrency(100.50); // "€100.50"

// Format percentages
formatter.formatPercentage(0.75); // "75%"
formatter.formatPercentage(75); // "75%"

// Format hours
formatter.formatHours(8.5); // "8.50"

// Format dates
formatter.formatDate(new Date()); // "2024-01-15"
formatter.formatDateShort(new Date()); // "Jan 15"

// Auto-format based on type
formatter.formatValue(123); // "123.00"
formatter.formatValue(new Date()); // formatted date
formatter.formatValue("text"); // "text"
```

**Key Features:**
- Handles null/undefined gracefully (returns empty string)
- Configurable decimal places
- Locale-aware number formatting
- Percentage values can be 0-1 or 0-100
- Consistent formatting across the application

### Validator

Provides data validation utilities.

**Usage:**
```typescript
import { Validator } from './rendering/Validator';

// Validate data isn't empty
const result = Validator.validateNotEmpty(data, 'myData');

// Validate required fields exist
const result = Validator.validateRequiredFields(
  data,
  ['date', 'hours', 'project'],
  'timesheet entries'
);

// Validate numeric fields are numbers
const result = Validator.validateNumericFields(
  data,
  ['hours', 'rate'],
  'entries'
);

// Validate date fields are valid dates
const result = Validator.validateDateFields(
  data,
  ['date', 'createdAt'],
  'records'
);

// Check validation result
if (!result.valid) {
  console.error('Errors:', result.errors);
}
if (result.warnings.length > 0) {
  console.warn('Warnings:', result.warnings);
}

// Merge multiple validation results
const merged = Validator.mergeResults(result1, result2, result3);
```

**Validation Result:**
```typescript
interface ValidationResult {
  valid: boolean;      // true if no errors
  errors: string[];    // array of error messages
  warnings: string[];  // array of warning messages
}
```

### RenderUtils

General-purpose rendering utilities.

**Usage:**
```typescript
import { RenderUtils } from './rendering/RenderUtils';

// Escape HTML
RenderUtils.escapeHtml('<script>alert("xss")</script>');

// Escape Markdown
RenderUtils.escapeMarkdown('text | with | pipes');

// Get nested values
const value = RenderUtils.getNestedValue(obj, 'user.profile.name');

// Calculate totals
const total = RenderUtils.calculateTotal(entries, 'hours');

// Get working days in month
const days = RenderUtils.getWorkingDaysInMonth(2024, 1); // 23

// Group data
const grouped = RenderUtils.groupBy(entries, entry => entry.project);

// Deep clone
const cloned = RenderUtils.deepClone(original);

// Truncate text
RenderUtils.truncate('Long text here', 10); // "Long te..."

// Generate unique ID
const id = RenderUtils.generateId('table'); // "table-1234567890-abc123"

// Debounce function
const debouncedFn = RenderUtils.debounce(myFunction, 300);

// Create canvas for charts
const canvas = RenderUtils.createCanvas(container, 300);

// Create HTML element with options
const div = RenderUtils.createElement('div', {
  className: 'my-class',
  text: 'Hello',
  attributes: { 'data-id': '123' },
  styles: { color: 'blue', fontSize: '14px' }
});
```

## Design Principles

### 1. Single Responsibility
Each class has a focused purpose:
- `Formatter` - value formatting
- `Validator` - data validation  
- `RenderUtils` - general utilities

### 2. Null Safety
All methods handle null/undefined inputs gracefully, typically returning empty strings or safe defaults.

### 3. Type Safety
Full TypeScript typing throughout with proper generic support where needed.

### 4. Stateless Operations
Most methods are static and stateless for easy testing and reuse.

### 5. Consistent API
Similar operations follow consistent patterns across the module.

## Integration

### Used by Charts
`BaseChart` uses:
- `Formatter` for all value formatting
- `RenderUtils.createCanvas()` for canvas creation
- `RenderUtils.getWorkingDaysInMonth()` for calculations

### Used by Tables
`BaseTable` uses:
- `Formatter` for column value formatting
- `Validator` for data validation
- `RenderUtils` for HTML escaping, nested values, totals

## Testing

Example test structure:
```typescript
import { Formatter, Validator, RenderUtils } from '../rendering';

describe('Formatter', () => {
  test('formats currency correctly', () => {
    const formatter = new Formatter('$');
    expect(formatter.formatCurrency(100)).toBe('$100.00');
  });
  
  test('handles null values', () => {
    const formatter = new Formatter();
    expect(formatter.formatNumber(null)).toBe('');
  });
});

describe('Validator', () => {
  test('detects missing fields', () => {
    const result = Validator.validateRequiredFields(
      [{ name: 'John' }],
      ['name', 'email']
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('data[0] is missing required field: email');
  });
});

describe('RenderUtils', () => {
  test('escapes HTML', () => {
    expect(RenderUtils.escapeHtml('<div>')).toBe('&lt;div&gt;');
  });
  
  test('calculates totals', () => {
    const data = [{ hours: 5 }, { hours: 3 }];
    expect(RenderUtils.calculateTotal(data, 'hours')).toBe(8);
  });
});
```

## Extension

### Adding New Formatters
```typescript
// Add to Formatter class
formatPhoneNumber(value: string): string {
  // implementation
}
```

### Adding New Validators
```typescript
// Add to Validator class
static validateEmailFields(data: unknown[], fields: string[]): ValidationResult {
  // implementation
}
```

### Adding New Utilities
```typescript
// Add to RenderUtils class
static someNewUtility(...args): ReturnType {
  // implementation
}
```

## Performance Considerations

- Formatters create locale-aware number formatters which may have overhead
- Consider caching formatter instances when formatting many values
- Validators iterate through data - ensure data is reasonably sized
- Deep cloning is expensive - use sparingly
- Debounce helps reduce expensive operations

## Dependencies

- `DateUtils` from `../utils/date-utils` - for date formatting
- Native browser DOM APIs - for HTML operations
- TypeScript built-ins - for type safety

## Exports

All components are exported from the index file:
```typescript
export { Formatter, defaultFormatter } from './Formatter';
export { Validator } from './Validator';
export type { ValidationResult } from './Validator';
export { RenderUtils } from './RenderUtils';
```
