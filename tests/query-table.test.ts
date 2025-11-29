import { QueryTable } from '../src/tables/types/QueryTable';

// Mock plugin and dependencies
const createMockPlugin = () => ({
  settings: {
    currency: '€',
    hoursPerWorkday: 8
  }
} as any);

describe('QueryTable', () => {
  let mockPlugin: any;

  beforeEach(() => {
    mockPlugin = createMockPlugin();
  });

  describe('getDefaultColumns', () => {
    it('should generate columns from data keys', () => {
      const data = [
        { date: new Date(2024, 2, 15), project: 'Test', hours: 8, invoiced: 680 }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const columns = (table as any).getDefaultColumns();

      expect(columns).toHaveLength(4);
      expect(columns.map((c: any) => c.key)).toEqual(['date', 'project', 'hours', 'invoiced']);
    });

    it('should return empty array for empty data', () => {
      const table = new QueryTable(mockPlugin, [], { size: 'normal' });
      const columns = (table as any).getDefaultColumns();

      expect(columns).toHaveLength(0);
    });

    it('should handle complex data structures', () => {
      const data = [
        {
          date: new Date(2024, 2, 15),
          project: 'Test',
          hours: 8,
          invoiced: 680,
          utilization: 0.85,
          budgetRemaining: 40
        }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const columns = (table as any).getDefaultColumns();

      expect(columns).toHaveLength(6);
      expect(columns.map((c: any) => c.key)).toEqual([
        'date',
        'project',
        'hours',
        'invoiced',
        'utilization',
        'budgetRemaining'
      ]);
    });
  });

  describe('formatLabel', () => {
    it('should format camelCase to Title Case', () => {
      const table = new QueryTable(mockPlugin, [], { size: 'normal' });

      expect((table as any).formatLabel('firstName')).toBe('First Name');
      expect((table as any).formatLabel('projectName')).toBe('Project Name');
      expect((table as any).formatLabel('budgetRemaining')).toBe('Budget Remaining');
    });

    it('should format snake_case to Title Case', () => {
      const table = new QueryTable(mockPlugin, [], { size: 'normal' });

      expect((table as any).formatLabel('first_name')).toBe('First Name');
      expect((table as any).formatLabel('work_order')).toBe('Work Order');
      expect((table as any).formatLabel('per_hour')).toBe('Per Hour');
    });

    it('should capitalize single words', () => {
      const table = new QueryTable(mockPlugin, [], { size: 'normal' });

      expect((table as any).formatLabel('hours')).toBe('Hours');
      expect((table as any).formatLabel('project')).toBe('Project');
      expect((table as any).formatLabel('date')).toBe('Date');
    });

    it('should handle mixed formats', () => {
      const table = new QueryTable(mockPlugin, [], { size: 'normal' });

      expect((table as any).formatLabel('project_name')).toBe('Project Name');
      expect((table as any).formatLabel('totalHours')).toBe('Total Hours');
      // Note: Mixed case with underscore creates double space due to both rules applying
      expect((table as any).formatLabel('budget_Remaining')).toBe('Budget  Remaining');
    });

    it('should handle empty string', () => {
      const table = new QueryTable(mockPlugin, [], { size: 'normal' });

      expect((table as any).formatLabel('')).toBe('');
    });
  });

  describe('determineAlignment', () => {
    let table: QueryTable;

    beforeEach(() => {
      table = new QueryTable(mockPlugin, [], { size: 'normal' });
    });

    it('should right-align numeric fields', () => {
      const numericFields = [
        'hours',
        'rate',
        'invoiced',
        'revenue',
        'amount',
        'budget',
        'utilization',
        'progress',
        'percentage',
        'percent',
        'count',
        'total'
      ];

      numericFields.forEach(field => {
        expect((table as any).determineAlignment(field)).toBe('right');
      });
    });

    it('should left-align text fields', () => {
      const textFields = ['project', 'client', 'notes', 'description', 'name', 'label'];

      textFields.forEach(field => {
        expect((table as any).determineAlignment(field)).toBe('left');
      });
    });

    it('should be case insensitive', () => {
      expect((table as any).determineAlignment('Hours')).toBe('right');
      expect((table as any).determineAlignment('HOURS')).toBe('right');
      expect((table as any).determineAlignment('HoUrS')).toBe('right');
    });

    it('should handle fields containing keywords', () => {
      expect((table as any).determineAlignment('totalHours')).toBe('right');
      expect((table as any).determineAlignment('budgetRemaining')).toBe('right');
      expect((table as any).determineAlignment('hoursWorked')).toBe('right');
    });
  });

  describe('determineFormatter', () => {
    let table: QueryTable;

    beforeEach(() => {
      table = new QueryTable(mockPlugin, [], { size: 'normal' });
    });

    it('should format date fields', () => {
      const formatter = (table as any).determineFormatter('date');
      const testDate = new Date(2024, 2, 15);

      expect(formatter).toBeDefined();
      const result = formatter!(testDate);
      expect(result).toContain('2024');
      expect(result).toContain('15');
    });

    it('should format currency fields', () => {
      const currencyFields = ['invoiced', 'revenue', 'amount', 'price', 'cost'];

      currencyFields.forEach(field => {
        const formatter = (table as any).determineFormatter(field);
        expect(formatter).toBeDefined();
      });
    });

    it('should format rate fields as currency', () => {
      const formatter = (table as any).determineFormatter('rate');
      expect(formatter).toBeDefined();
    });

    it('should format hours fields', () => {
      const formatter = (table as any).determineFormatter('hours');
      expect(formatter).toBeDefined();
    });

    it('should format percentage fields', () => {
      const percentageFields = ['utilization', 'progress', 'percentage', 'percent'];

      percentageFields.forEach(field => {
        const formatter = (table as any).determineFormatter(field);
        expect(formatter).toBeDefined();
      });
    });

    it('should format numeric fields', () => {
      const numericFields = ['count', 'total', 'budget'];

      numericFields.forEach(field => {
        const formatter = (table as any).determineFormatter(field);
        expect(formatter).toBeDefined();
      });
    });

    it('should return undefined for text fields', () => {
      const textFields = ['project', 'client', 'notes', 'description'];

      textFields.forEach(field => {
        const formatter = (table as any).determineFormatter(field);
        expect(formatter).toBeUndefined();
      });
    });

    it('should be case insensitive', () => {
      const formatter1 = (table as any).determineFormatter('hours');
      const formatter2 = (table as any).determineFormatter('HOURS');
      const formatter3 = (table as any).determineFormatter('Hours');

      expect(formatter1).toBeDefined();
      expect(formatter2).toBeDefined();
      expect(formatter3).toBeDefined();
    });

    it('should handle fields containing keywords', () => {
      expect((table as any).determineFormatter('totalHours')).toBeDefined();
      expect((table as any).determineFormatter('budgetRemaining')).toBeDefined();
      expect((table as any).determineFormatter('pricePerUnit')).toBeDefined();
    });
  });

  describe('getTotalableColumns', () => {
    it('should identify numeric columns to total', () => {
      const data = [
        { date: new Date(), project: 'Test', hours: 8, invoiced: 680, rate: 85 }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const totalable = (table as any).getTotalableColumns();

      expect(totalable).toContain('hours');
      expect(totalable).toContain('invoiced');
    });

    it('should not total non-numeric columns', () => {
      const data = [
        { date: new Date(), project: 'Test', hours: 8 }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const totalable = (table as any).getTotalableColumns();

      expect(totalable).not.toContain('date');
      expect(totalable).not.toContain('project');
    });

    it('should total revenue and amount fields', () => {
      const data = [
        { revenue: 1000, amount: 500, totalCost: 300 }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const totalable = (table as any).getTotalableColumns();

      expect(totalable).toContain('revenue');
      expect(totalable).toContain('amount');
      expect(totalable).toContain('totalCost');
    });

    it('should total budget fields', () => {
      const data = [
        { budget: 100, budgetUsed: 50, budgetRemaining: 50 }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const totalable = (table as any).getTotalableColumns();

      expect(totalable).toContain('budget');
      expect(totalable).toContain('budgetUsed');
      expect(totalable).toContain('budgetRemaining');
    });

    it('should return empty array for empty data', () => {
      const table = new QueryTable(mockPlugin, [], { size: 'normal' });
      const totalable = (table as any).getTotalableColumns();

      expect(totalable).toHaveLength(0);
    });

    it('should not total percentage fields', () => {
      const data = [
        { hours: 8, utilization: 0.85, progress: 0.75 }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const totalable = (table as any).getTotalableColumns();

      expect(totalable).toContain('hours');
      expect(totalable).not.toContain('utilization');
      expect(totalable).not.toContain('progress');
    });
  });

  describe('getCompactColumns', () => {
    it('should return most important columns in compact mode', () => {
      const data = [
        {
          date: new Date(),
          project: 'Test',
          client: 'Client',
          hours: 8,
          invoiced: 680,
          notes: 'Notes',
          category: 'Dev'
        }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'compact' });
      const compactColumns = (table as any).getCompactColumns();

      expect(compactColumns.length).toBeLessThanOrEqual(4);
    });

    it('should prioritize date, project, hours, invoiced', () => {
      const data = [
        {
          category: 'Dev',
          notes: 'Notes',
          date: new Date(),
          project: 'Test',
          hours: 8,
          invoiced: 680,
          extra: 'Extra'
        }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'compact' });
      const compactColumns = (table as any).getCompactColumns();

      const keys = compactColumns.map((c: any) => c.key);
      expect(keys).toContain('date');
      expect(keys).toContain('project');
      expect(keys).toContain('hours');
      expect(keys).toContain('invoiced');
    });

    it('should handle data without priority columns', () => {
      const data = [
        { category: 'Dev', notes: 'Notes', extra: 'Extra', other: 'Other' }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'compact' });
      const compactColumns = (table as any).getCompactColumns();

      expect(compactColumns.length).toBeLessThanOrEqual(4);
    });

    it('should return all columns if less than 4', () => {
      const data = [
        { date: new Date(), hours: 8 }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'compact' });
      const compactColumns = (table as any).getCompactColumns();

      expect(compactColumns.length).toBe(2);
    });

    it('should prioritize label and period for summary views', () => {
      const data = [
        {
          label: 'Q1 2024',
          period: 'January',
          hours: 160,
          invoiced: 12000,
          extra1: 'Extra',
          extra2: 'Extra'
        }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'compact' });
      const compactColumns = (table as any).getCompactColumns();

      const keys = compactColumns.map((c: any) => c.key);
      expect(keys).toContain('label');
      expect(keys).toContain('hours');
      expect(keys).toContain('invoiced');
    });
  });

  describe('createColumnFromKey', () => {
    it('should create complete column configuration', () => {
      const data = [{ hours: 8 }];
      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const column = (table as any).createColumnFromKey('hours');

      expect(column.key).toBe('hours');
      expect(column.label).toBe('Hours');
      expect(column.align).toBe('right');
      expect(column.format).toBeDefined();
    });

    it('should handle date columns', () => {
      const data = [{ date: new Date() }];
      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const column = (table as any).createColumnFromKey('date');

      expect(column.key).toBe('date');
      expect(column.label).toBe('Date');
      expect(column.align).toBe('left');
      expect(column.format).toBeDefined();
    });

    it('should handle currency columns', () => {
      const data = [{ invoiced: 680 }];
      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const column = (table as any).createColumnFromKey('invoiced');

      expect(column.key).toBe('invoiced');
      expect(column.label).toBe('Invoiced');
      expect(column.align).toBe('right');
      expect(column.format).toBeDefined();
    });

    it('should handle text columns', () => {
      const data = [{ project: 'Test' }];
      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const column = (table as any).createColumnFromKey('project');

      expect(column.key).toBe('project');
      expect(column.label).toBe('Project');
      expect(column.align).toBe('left');
      expect(column.format).toBeUndefined();
    });

    it('should handle percentage columns', () => {
      const data = [{ utilization: 0.85 }];
      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const column = (table as any).createColumnFromKey('utilization');

      expect(column.key).toBe('utilization');
      expect(column.label).toBe('Utilization');
      expect(column.align).toBe('right');
      expect(column.format).toBeDefined();
    });
  });

  describe('getTableType', () => {
    it('should return "Query" as table type', () => {
      const table = new QueryTable(mockPlugin, [], { size: 'normal' });
      expect((table as any).getTableType()).toBe('Query');
    });
  });

  describe('integration scenarios', () => {
    it('should handle daily timesheet data', () => {
      const data = [
        {
          date: new Date(2024, 2, 15),
          project: 'Project Alpha',
          hours: 8,
          rate: 85,
          invoiced: 680,
          notes: 'Development work'
        },
        {
          date: new Date(2024, 2, 16),
          project: 'Project Beta',
          hours: 6,
          rate: 90,
          invoiced: 540,
          notes: 'Testing'
        }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const columns = (table as any).getDefaultColumns();

      expect(columns).toHaveLength(6);
      expect(columns.find((c: any) => c.key === 'date').format).toBeDefined();
      expect(columns.find((c: any) => c.key === 'hours').format).toBeDefined();
      expect(columns.find((c: any) => c.key === 'invoiced').format).toBeDefined();
    });

    it('should handle monthly summary data', () => {
      const data = [
        {
          period: 'January 2024',
          hours: 160,
          invoiced: 12800,
          utilization: 0.87,
          projects: 5
        },
        {
          period: 'February 2024',
          hours: 152,
          invoiced: 12160,
          utilization: 0.85,
          projects: 4
        }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const columns = (table as any).getDefaultColumns();
      const totalable = (table as any).getTotalableColumns();

      expect(columns).toHaveLength(5);
      expect(totalable).toContain('hours');
      expect(totalable).toContain('invoiced');
      expect(totalable).not.toContain('utilization'); // Percentages shouldn't be totaled
    });

    it('should handle budget tracking data', () => {
      const data = [
        {
          project: 'Project A',
          budgetHours: 120,
          hoursUsed: 67,
          budgetRemaining: 53,
          progress: 0.558
        }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const columns = (table as any).getDefaultColumns();

      expect(columns).toHaveLength(5);
      expect(columns.find((c: any) => c.key === 'progress').format).toBeDefined();
      expect(columns.find((c: any) => c.key === 'budgetHours').align).toBe('right');
    });

    it('should handle mixed data types correctly', () => {
      const data = [
        {
          id: 1,
          name: 'Test Entry',
          totalValue: 100.5,
          percentage: 0.85,
          date: new Date(2024, 2, 15),
          active: true,
          tags: ['tag1', 'tag2']
        }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const columns = (table as any).getDefaultColumns();

      expect(columns).toHaveLength(7);

      // Verify numeric field alignment (totalValue has 'total' keyword so it's right-aligned)
      const valueColumn = columns.find((c: any) => c.key === 'totalValue');
      expect(valueColumn.align).toBe('right');

      // Verify date formatting
      const dateColumn = columns.find((c: any) => c.key === 'date');
      expect(dateColumn.format).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle null/undefined values in data', () => {
      const data = [
        { project: 'Test', hours: null, invoiced: undefined }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const columns = (table as any).getDefaultColumns();

      expect(columns).toHaveLength(3);
    });

    it('should handle empty strings', () => {
      const data = [
        { project: '', hours: 0, notes: '' }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const columns = (table as any).getDefaultColumns();

      expect(columns).toHaveLength(3);
    });

    it('should handle very long column names', () => {
      const table = new QueryTable(mockPlugin, [], { size: 'normal' });
      const longName = 'thisIsAVeryLongColumnNameThatShouldStillBeFormattedCorrectly';
      const label = (table as any).formatLabel(longName);

      expect(label).toContain('This');
      expect(label).toContain('Very');
      expect(label).toContain('Long');
    });

    it('should handle numeric strings', () => {
      const data = [
        { id: '123', hours: '8.5', rate: '85' }
      ];

      const table = new QueryTable(mockPlugin, data, { size: 'normal' });
      const totalable = (table as any).getTotalableColumns();

      // Strings should not be totalable
      expect(totalable).toHaveLength(0);
    });

    it('should handle special characters in keys', () => {
      const table = new QueryTable(mockPlugin, [], { size: 'normal' });

      const label1 = (table as any).formatLabel('work_order');
      const label2 = (table as any).formatLabel('per-hour'); // Note: '-' might not be in keys normally
      const label3 = (table as any).formatLabel('project_name_2024');

      expect(label1).toBe('Work Order');
      expect(label3).toContain('Project');
    });
  });
});
