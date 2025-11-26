// Test file demonstrating enhanced query language functionality

import { columnMapper, ColumnMapper, QueryInterpreter } from '../src/query';
import { TableColumn } from '../src/tables/base/TableConfig';

describe('Enhanced Query Language', () => {
  let interpreter: QueryInterpreter;
  let mapper: ColumnMapper;

  beforeEach(() => {
    interpreter = new QueryInterpreter();
    mapper = columnMapper;
  });

  describe('Column Mapper', () => {
    test('should provide available fields', () => {
      const fields = mapper.getAvailableFields();

      expect(fields).toContain('hours');
      expect(fields).toContain('invoiced');
      expect(fields).toContain('project');
      expect(fields).toContain('rate');
      expect(fields).toContain('utilization');
      expect(fields).toContain('budgetProgress');
      expect(fields.length).toBeGreaterThan(20);
    });

    test('should validate field names', () => {
      expect(mapper.isValidField('hours')).toBe(true);
      expect(mapper.isValidField('invoiced')).toBe(true);
      expect(mapper.isValidField('invalid_field')).toBe(false);
    });

    test('should categorize fields by type', () => {
      const currencyFields = mapper.getFieldsByType('currency');
      const percentageFields = mapper.getFieldsByType('percentage');
      const hoursFields = mapper.getFieldsByType('hours');

      expect(currencyFields).toContain('rate');
      expect(currencyFields).toContain('invoiced');
      expect(percentageFields).toContain('utilization');
      expect(percentageFields).toContain('budgetProgress');
      expect(hoursFields).toContain('hours');
      expect(hoursFields).toContain('budgetHours');
    });

    test('should identify aggregatable fields', () => {
      const aggregatable = mapper.getAggregatableFields();

      expect(aggregatable).toContain('hours');
      expect(aggregatable).toContain('invoiced');
      expect(aggregatable).toContain('utilization');
      expect(aggregatable).not.toContain('date');
      expect(aggregatable).not.toContain('project');
    });

    test('should provide default columns for different view types', () => {
      const timesheetColumns = mapper.getDefaultColumns('timesheet');
      const monthlyColumns = mapper.getDefaultColumns('monthly');
      const dailyColumns = mapper.getDefaultColumns('daily');

      expect(timesheetColumns.length).toBeGreaterThan(4);
      expect(monthlyColumns.length).toBeGreaterThan(2);
      expect(dailyColumns.length).toBeGreaterThan(2);

      expect(timesheetColumns.some(col => col.key === 'project')).toBe(true);
      expect(monthlyColumns.some(col => col.key === 'label')).toBe(true);
      expect(dailyColumns.some(col => col.key === 'date')).toBe(true);
    });

    test('should provide compact columns', () => {
      const compactTimesheet = mapper.getCompactColumns('timesheet');
      const compactMonthly = mapper.getCompactColumns('monthly');

      expect(compactTimesheet.length).toBeLessThan(4);
      expect(compactMonthly.length).toBeLessThan(4);

      expect(compactTimesheet.some(col => col.key === 'hours')).toBe(true);
      expect(compactMonthly.some(col => col.key === 'hours')).toBe(true);
    });
  });

  describe('Column Formatting', () => {
    test('should format currency values', () => {
      const column = mapper.createTableColumn({ field: 'rate' });
      expect(column).toBeDefined();

      if (column?.format) {
        expect(column.format(50.5)).toBe('€50.50');
        expect(column.format(100)).toBe('€100.00');
        expect(column.format(0)).toBe('€0.00');
      }
    });

    test('should format percentage values', () => {
      const column = mapper.createTableColumn({ field: 'utilization' });
      expect(column).toBeDefined();

      if (column?.format) {
        expect(column.format(0.75)).toBe('75%');
        expect(column.format(0.5)).toBe('50%');
        expect(column.format(1.0)).toBe('100%');
      }
    });

    test('should format hours', () => {
      const column = mapper.createTableColumn({ field: 'hours' });
      expect(column).toBeDefined();

      if (column?.format) {
        expect(column.format(8.5)).toBe('8.50');
        expect(column.format(40)).toBe('40.00');
        expect(column.format(0.25)).toBe('0.25');
      }
    });

    test('should handle null and undefined values', () => {
      const currencyColumn = mapper.createTableColumn({ field: 'rate' });
      const hoursColumn = mapper.createTableColumn({ field: 'hours' });

      if (currencyColumn?.format && hoursColumn?.format) {
        expect(currencyColumn.format(null)).toBe('');
        expect(currencyColumn.format(undefined)).toBe('');
        expect(hoursColumn.format(null)).toBe('');
        expect(hoursColumn.format(undefined)).toBe('');
      }
    });
  });

  describe('SHOW Clause Processing', () => {
    test('should process basic SHOW clause', () => {
      const showNode = {
        type: 'ShowClause' as const,
        fields: [
          { type: 'Identifier' as const, name: 'hours' },
          { type: 'Identifier' as const, name: 'invoiced' },
          { type: 'Identifier' as const, name: 'project' }
        ]
      };

      const columns = mapper.mapShowClauseToColumns(showNode);

      expect(columns).toHaveLength(3);
      expect(columns[0].key).toBe('hours');
      expect(columns[1].key).toBe('invoiced');
      expect(columns[2].key).toBe('project');
    });

    test('should handle invalid fields gracefully', () => {
      const showNode = {
        type: 'ShowClause' as const,
        fields: [
          { type: 'Identifier' as const, name: 'hours' },
          { type: 'Identifier' as const, name: 'invalid_field' },
          { type: 'Identifier' as const, name: 'invoiced' }
        ]
      };

      const columns = mapper.mapShowClauseToColumns(showNode);

      // Should have 2 valid columns, invalid one filtered out
      expect(columns).toHaveLength(2);
      expect(columns[0].key).toBe('hours');
      expect(columns[1].key).toBe('invoiced');
    });

    test('should set proper column properties', () => {
      const showNode = {
        type: 'ShowClause' as const,
        fields: [
          { type: 'Identifier' as const, name: 'rate' },
          { type: 'Identifier' as const, name: 'utilization' }
        ]
      };

      const columns = mapper.mapShowClauseToColumns(showNode);

      expect(columns[0].align).toBe('right'); // Currency should be right-aligned
      expect(columns[1].align).toBe('right'); // Percentage should be right-aligned
      expect(columns[0].width).toBeDefined();
      expect(columns[1].width).toBeDefined();
    });
  });

  describe('Query Integration', () => {
    test('should integrate with query interpreter', () => {
      const query = interpreter.parseAndInterpret(`
        WHERE year = 2024
        SHOW hours, invoiced, utilization
        VIEW table
      `);

      expect(query.show).toEqual(['hours', 'invoiced', 'utilization']);
      expect(query.columns).toBeDefined();
      expect(query.columns?.length).toBe(3);
      expect(query.view).toBe('table');
    });

    test('should handle complex queries', () => {
      const query = interpreter.parseAndInterpret(`
        WHERE project = "Client Work" AND year = 2024
        SHOW project, hours, rate, invoiced, budgetProgress
        VIEW table
        SIZE detailed
      `);

      expect(query.show).toEqual(['project', 'hours', 'rate', 'invoiced', 'budgetProgress']);
      expect(query.columns?.length).toBe(5);
      expect(query.view).toBe('table');
      expect(query.size).toBe('detailed');
    });

    test('should fallback when SHOW fails', () => {
      const query = interpreter.parseAndInterpret(`
        WHERE year = 2024
        VIEW table
      `);

      expect(query.show).toBeUndefined();
      expect(query.columns).toBeUndefined();
      expect(query.view).toBe('table');
    });
  });

  describe('Example Usage Scenarios', () => {
    test('Monthly summary report', () => {
      const query = interpreter.parseAndInterpret(`
        WHERE year = 2024
        SHOW label, hours, invoiced, utilization
        VIEW table
        SIZE normal
      `);

      expect(query.columns).toBeDefined();
      const columns = query.columns!;

      expect(columns.some(col => col.key === 'label')).toBe(true);
      expect(columns.some(col => col.key === 'hours')).toBe(true);
      expect(columns.some(col => col.key === 'invoiced')).toBe(true);
      expect(columns.some(col => col.key === 'utilization')).toBe(true);
    });

    test('Budget tracking report', () => {
      const query = interpreter.parseAndInterpret(`
        WHERE project = "Budget Project"
        SHOW project, budgetHours, budgetUsed, budgetProgress
        VIEW chart
        CHART budget
      `);

      expect(query.columns).toBeDefined();
      const columns = query.columns!;

      expect(columns.some(col => col.key === 'project')).toBe(true);
      expect(columns.some(col => col.key === 'budgetHours')).toBe(true);
      expect(columns.some(col => col.key === 'budgetProgress')).toBe(true);
      expect(query.chartType).toBe('budget');
    });

    test('Client revenue analysis', () => {
      const query = interpreter.parseAndInterpret(`
        WHERE date BETWEEN "2024-01-01" AND "2024-06-30"
        SHOW client, hours, rate, invoiced
        VIEW summary
        SIZE detailed
      `);

      expect(query.columns?.length).toBe(4);
      expect(query.view).toBe('summary');
      expect(query.size).toBe('detailed');
    });

    test('Compact mobile view', () => {
      const query = interpreter.parseAndInterpret(`
        WHERE year = 2024
        SHOW hours, invoiced
        VIEW table
        SIZE compact
      `);

      expect(query.columns?.length).toBe(2);
      expect(query.size).toBe('compact');
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle empty SHOW clause', () => {
      const showNode = {
        type: 'ShowClause' as const,
        fields: []
      };

      const columns = mapper.mapShowClauseToColumns(showNode);
      expect(columns).toHaveLength(0);
    });

    test('should handle large column lists', () => {
      const allFields = mapper.getAvailableFields();
      const showNode = {
        type: 'ShowClause' as const,
        fields: allFields.map(name => ({ type: 'Identifier' as const, name }))
      };

      const columns = mapper.mapShowClauseToColumns(showNode);
      expect(columns.length).toBeGreaterThan(20);
      expect(columns.length).toBe(allFields.length);
    });

    test('should handle duplicate fields', () => {
      const showNode = {
        type: 'ShowClause' as const,
        fields: [
          { type: 'Identifier' as const, name: 'hours' },
          { type: 'Identifier' as const, name: 'hours' },
          { type: 'Identifier' as const, name: 'invoiced' }
        ]
      };

      const columns = mapper.mapShowClauseToColumns(showNode);
      expect(columns).toHaveLength(3); // Should include duplicates as separate columns
    });
  });

  describe('Future Extensions', () => {
    test('should support field aliasing (when implemented)', () => {
      // This test demonstrates the structure for future alias support
      const mapping = {
        field: 'hours',
        alias: 'Work Hours'
      };

      const column = mapper.createTableColumn(mapping);
      expect(column?.key).toBe('hours');
      // When aliases are implemented: expect(column?.label).toBe('Work Hours');
    });

    test('should support custom formatting (when implemented)', () => {
      // This test demonstrates the structure for future custom formatting
      const mapping = {
        field: 'invoiced',
        format: 'currency'
      };

      const column = mapper.createTableColumn(mapping);
      expect(column?.key).toBe('invoiced');
      // Custom formatting would apply here
    });

    test('should support calculated fields (when implemented)', () => {
      // This test demonstrates the structure for future calculated fields
      const mapping = {
        field: 'revenue',
        calculation: 'hours * rate'
      };

      // For now, this would fail since 'revenue' exists as a predefined field
      const column = mapper.createTableColumn(mapping);
      expect(column?.key).toBe('revenue');
    });
  });
});

// Mock data for testing
export const mockTimesheetData = [
  {
    date: '2024-01-15',
    project: 'Client Alpha',
    task: 'Development work',
    hours: 8,
    rate: 75,
    invoiced: 600,
    utilization: 0.85,
    client: 'Alpha Corp',
    category: 'development'
  },
  {
    date: '2024-01-16',
    project: 'Client Beta',
    task: 'Consulting',
    hours: 6,
    rate: 100,
    invoiced: 600,
    utilization: 0.75,
    client: 'Beta Inc',
    category: 'consulting'
  },
  {
    date: '2024-01-17',
    project: 'Internal',
    task: 'Admin work',
    hours: 2,
    rate: 0,
    invoiced: 0,
    utilization: 0.25,
    client: 'Internal',
    category: 'admin'
  }
];

export const mockMonthlyData = [
  {
    year: 2024,
    month: 1,
    label: 'January 2024',
    hours: 160,
    invoiced: 12000,
    utilization: 0.8,
    rate: 75,
    budgetHours: 200,
    budgetUsed: 160,
    budgetRemaining: 40,
    budgetProgress: 0.8,
    cumulativeHours: 160
  },
  {
    year: 2024,
    month: 2,
    label: 'February 2024',
    hours: 144,
    invoiced: 10800,
    utilization: 0.75,
    rate: 75,
    budgetHours: 200,
    budgetUsed: 144,
    budgetRemaining: 56,
    budgetProgress: 0.72,
    cumulativeHours: 304
  }
];

// Helper functions for testing
export function createMockShowClause(fields: string[]) {
  return {
    type: 'ShowClause' as const,
    fields: fields.map(name => ({ type: 'Identifier' as const, name }))
  };
}

export function createMockQuery(queryString: string) {
  const interpreter = new QueryInterpreter();
  return interpreter.parseAndInterpret(queryString);
}

export function validateColumnStructure(column: TableColumn) {
  expect(column).toHaveProperty('key');
  expect(column).toHaveProperty('label');
  expect(typeof column.key).toBe('string');
  expect(typeof column.label).toBe('string');

  if (column.width) {
    expect(typeof column.width).toBe('string');
  }

  if (column.align) {
    expect(['left', 'center', 'right']).toContain(column.align);
  }

  if (column.format) {
    expect(typeof column.format).toBe('function');
  }
}

export function testFormattingFunction(formatter: (value: unknown) => string, testCases: Array<[unknown, string]>) {
  testCases.forEach(([input, expected]) => {
    expect(formatter(input)).toBe(expected);
  });
}
