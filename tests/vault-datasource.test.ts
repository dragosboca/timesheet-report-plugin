import { VaultTimesheetDataSource } from '../src/datasource/vault-datasource';
import { TFile, TFolder } from 'obsidian';

// Mock Obsidian types
const createMockFile = (path: string, name: string): TFile => ({
  path,
  name,
  basename: name.replace('.md', ''),
  extension: 'md',
  parent: null,
  vault: null as any,
  stat: { ctime: 0, mtime: 0, size: 0 }
} as any);

const createMockFolder = (path: string, children: any[] = []): TFolder => ({
  path,
  name: path.split('/').pop() || path,
  parent: null,
  children,
  vault: null as any,
  isRoot: () => false
} as any);

describe('VaultTimesheetDataSource', () => {
  let datasource: VaultTimesheetDataSource;
  let mockPlugin: any;
  let mockApp: any;
  let mockVault: any;
  let mockMetadataCache: any;

  beforeEach(() => {
    // Create mock metadata cache
    mockMetadataCache = {
      getFileCache: jest.fn()
    };

    // Create mock vault
    mockVault = {
      getAbstractFileByPath: jest.fn(),
      read: jest.fn()
    };

    // Create mock app
    mockApp = {
      vault: mockVault,
      metadataCache: mockMetadataCache
    };

    // Create mock plugin
    mockPlugin = {
      app: mockApp,
      settings: {
        timesheetFolder: 'timesheets',
        hoursPerWorkday: 8,
        debugMode: false,
        project: {
          defaultRate: 75,
          type: 'hourly'
        }
      }
    };

    datasource = new VaultTimesheetDataSource(mockPlugin);
  });

  describe('cache management', () => {
    it('should cache query results', async () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const mockFolder = createMockFolder('timesheets', [mockFile]);

      mockVault.getAbstractFileByPath.mockReturnValue(mockFolder);
      mockMetadataCache.getFileCache.mockReturnValue({
        frontmatter: {
          hours: 8,
          'per-hour': 75,
          'work-order': 'Test Project',
          worked: true,
          date: '2024-03-15'
        }
      });
      mockVault.read.mockResolvedValue('# Daily Note');

      // First query
      const result1 = await datasource.query({ year: 2024 });

      // Clear mock call counts
      mockVault.getAbstractFileByPath.mockClear();

      // Second query with same options (should use cache)
      const result2 = await datasource.query({ year: 2024 });

      expect(result1).toEqual(result2);
      // Vault should NOT be called for cached query
      expect(mockVault.getAbstractFileByPath).toHaveBeenCalledTimes(0);
    });

    it('should clear cache when requested', async () => {
      datasource.clearCache();
      // No error should be thrown
      expect(true).toBe(true);
    });
  });

  describe('extractFromFrontmatter', () => {
    it('should extract valid timesheet entry', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        hours: 8,
        'per-hour': 75,
        'work-order': 'Test Project',
        worked: true
      };

      const entry = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(entry).not.toBeNull();
      expect(entry.hours).toBe(8);
      expect(entry.rate).toBe(75);
      expect(entry.project).toBe('Test Project');
      expect(entry.date).toBeInstanceOf(Date);
      expect(entry.file).toBe(mockFile);
    });

    it('should skip entries with worked: false', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        hours: 8,
        'per-hour': 75,
        worked: false
      };

      const entry = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(entry).toBeNull();
    });

    it('should use default rate when no rate specified', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        hours: 8,
        'work-order': 'Test Project',
        worked: true
      };

      const entry = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(entry).not.toBeNull();
      expect(entry.rate).toBe(75); // Default from settings
    });

    it('should handle array values for work-order', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        hours: 6.5,
        'per-hour': 85,
        'work-order': ['Main Project', 'Sub Task'],
        worked: true
      };

      const entry = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(entry).not.toBeNull();
      expect(entry.project).toBe('Main Project'); // First element
    });

    it('should prioritize work-order over client', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        hours: 5,
        'per-hour': 70,
        'work-order': 'Work Order Project',
        client: 'Client Project',
        worked: true
      };

      const entry = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(entry).not.toBeNull();
      expect(entry.project).toBe('Work Order Project');
    });

    it('should use client when work-order is not present', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        hours: 5,
        'per-hour': 70,
        client: 'Client Project Only',
        worked: true
      };

      const entry = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(entry).not.toBeNull();
      expect(entry.project).toBe('Client Project Only');
    });

    it('should use project field as fallback', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        hours: 5,
        'per-hour': 70,
        project: 'Fallback Project',
        worked: true
      };

      const entry = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(entry).not.toBeNull();
      expect(entry.project).toBe('Fallback Project');
    });

    it('should support alternative rate fields', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');

      // Test 'rate' field
      const entry1 = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        { hours: 7, rate: 90, project: 'Test', worked: true }
      );
      expect(entry1.rate).toBe(90);

      // Test 'hourlyRate' field
      const entry2 = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        { hours: 5, hourlyRate: 100, project: 'Test', worked: true }
      );
      expect(entry2.rate).toBe(100);
    });

    it('should support duration field as alternative to hours', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        duration: 6,
        'per-hour': 80,
        'work-order': 'Duration Test',
        worked: true
      };

      const entry = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(entry).not.toBeNull();
      expect(entry.hours).toBe(6);
    });

    it('should prefer hours over duration', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        hours: 8,
        duration: 6,
        'per-hour': 80,
        'work-order': 'Priority Test',
        worked: true
      };

      const entry = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(entry).not.toBeNull();
      expect(entry.hours).toBe(8); // Should use hours, not duration
    });

    it('should extract notes and descriptions', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        hours: 4,
        'per-hour': 75,
        'work-order': 'Notes Test',
        notes: 'This is a note about the work',
        worked: true
      };

      const entry = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(entry).not.toBeNull();
      expect(entry.notes).toBe('This is a note about the work');
      expect(entry.taskDescription).toBe('This is a note about the work');
    });

    it('should use description field when notes is not present', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        hours: 4,
        'per-hour': 75,
        'work-order': 'Description Test',
        description: 'This is a description',
        worked: true
      };

      const entry = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(entry).not.toBeNull();
      expect(entry.notes).toBe('This is a description');
    });

    it('should return null for zero hours', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        hours: 0,
        'per-hour': 75,
        'work-order': 'Zero Hours',
        worked: true
      };

      const entry = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(entry).toBeNull();
    });

    it('should handle string numbers', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        hours: '8.5',
        'per-hour': '80',
        'work-order': 'String Numbers',
        worked: true
      };

      const entry = (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(entry).not.toBeNull();
      expect(entry.hours).toBe(8.5);
      expect(entry.rate).toBe(80);
    });
  });

  describe('parseTableRow', () => {
    it('should parse valid table row', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const headers = ['task', 'hours', 'rate', 'notes'];
      const row = ['Development', '4', '85', 'Feature implementation'];

      const entry = (datasource as any).parseTableRow(
        mockFile,
        new Date(2024, 2, 15),
        headers,
        row
      );

      expect(entry).not.toBeNull();
      expect(entry.hours).toBe(4);
      expect(entry.rate).toBe(85);
      expect(entry.notes).toBe('Feature implementation');
    });

    it('should handle missing rate with default', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const headers = ['task', 'hours', 'notes'];
      const row = ['Development', '4', 'Feature implementation'];

      const entry = (datasource as any).parseTableRow(
        mockFile,
        new Date(2024, 2, 15),
        headers,
        row
      );

      expect(entry).not.toBeNull();
      expect(entry.rate).toBe(75); // Default rate
    });

    it('should parse rate with currency symbols', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const headers = ['task', 'hours', 'rate'];
      const row = ['Development', '4', '$85.00'];

      const entry = (datasource as any).parseTableRow(
        mockFile,
        new Date(2024, 2, 15),
        headers,
        row
      );

      expect(entry).not.toBeNull();
      expect(entry.rate).toBe(85);
    });

    it('should return null for zero hours', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const headers = ['task', 'hours', 'rate'];
      const row = ['Development', '0', '85'];

      const entry = (datasource as any).parseTableRow(
        mockFile,
        new Date(2024, 2, 15),
        headers,
        row
      );

      expect(entry).toBeNull();
    });

    it('should handle various column name variations', () => {
      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');

      // Test 'duration' instead of 'hours'
      const entry1 = (datasource as any).parseTableRow(
        mockFile,
        new Date(2024, 2, 15),
        ['task', 'duration', 'rate'],
        ['Test', '5', '80']
      );
      expect(entry1).not.toBeNull();
      expect(entry1.hours).toBe(5);
      expect(entry1.rate).toBe(80);

      // Test 'time' instead of 'hours'
      const entry2 = (datasource as any).parseTableRow(
        mockFile,
        new Date(2024, 2, 15),
        ['task', 'time', 'notes'],
        ['Test', '6', 'Work description']
      );
      expect(entry2).not.toBeNull();
      expect(entry2.hours).toBe(6);
      expect(entry2.notes).toBe('Work description');
    });
  });

  describe('applyFilters', () => {
    const createMockEntry = (date: Date, project?: string) => ({
      date,
      hours: 8,
      rate: 75,
      project,
      notes: '',
      taskDescription: '',
      file: createMockFile('test.md', 'test.md')
    });

    it('should filter by year', () => {
      const entries = [
        createMockEntry(new Date(2023, 2, 15)),
        createMockEntry(new Date(2024, 2, 15)),
        createMockEntry(new Date(2024, 5, 20))
      ];

      const filtered = (datasource as any).applyFilters(entries, { year: 2024 });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((e: any) => e.date.getFullYear() === 2024)).toBe(true);
    });

    it('should filter by month', () => {
      const entries = [
        createMockEntry(new Date(2024, 1, 15)), // February
        createMockEntry(new Date(2024, 2, 15)), // March
        createMockEntry(new Date(2024, 2, 20))  // March
      ];

      const filtered = (datasource as any).applyFilters(entries, { month: 3 }); // March (1-indexed)

      expect(filtered).toHaveLength(2);
      expect(filtered.every((e: any) => e.date.getMonth() === 2)).toBe(true);
    });

    it('should filter by project', () => {
      const entries = [
        createMockEntry(new Date(2024, 2, 15), 'Project A'),
        createMockEntry(new Date(2024, 2, 16), 'Project B'),
        createMockEntry(new Date(2024, 2, 17), 'Project A Extended')
      ];

      const filtered = (datasource as any).applyFilters(entries, { projectFilter: 'Project A' });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((e: any) => e.project?.includes('Project A'))).toBe(true);
    });

    it('should filter by date range', () => {
      const entries = [
        createMockEntry(new Date(2024, 0, 15)),
        createMockEntry(new Date(2024, 2, 15)),
        createMockEntry(new Date(2024, 5, 15))
      ];

      const filtered = (datasource as any).applyFilters(entries, {
        dateRange: {
          start: new Date(2024, 1, 1),
          end: new Date(2024, 3, 30)
        }
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].date.getMonth()).toBe(2); // March
    });

    it('should apply multiple filters', () => {
      const entries = [
        createMockEntry(new Date(2024, 2, 15), 'Project A'),
        createMockEntry(new Date(2024, 2, 16), 'Project B'),
        createMockEntry(new Date(2023, 2, 15), 'Project A')
      ];

      const filtered = (datasource as any).applyFilters(entries, {
        year: 2024,
        projectFilter: 'Project A'
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].project).toBe('Project A');
      expect(filtered[0].date.getFullYear()).toBe(2024);
    });

    it('should handle case-insensitive project filtering', () => {
      const entries = [
        createMockEntry(new Date(2024, 2, 15), 'PROJECT Alpha'),
        createMockEntry(new Date(2024, 2, 16), 'project beta')
      ];

      const filtered = (datasource as any).applyFilters(entries, {
        projectFilter: 'project alpha'
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].project).toBe('PROJECT Alpha');
    });
  });

  describe('generateCacheKey', () => {
    it('should generate unique keys for different options', () => {
      const key1 = (datasource as any).generateCacheKey({ year: 2024 });
      const key2 = (datasource as any).generateCacheKey({ year: 2023 });
      const key3 = (datasource as any).generateCacheKey({ year: 2024, month: 3 });

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });

    it('should generate same key for identical options', () => {
      const key1 = (datasource as any).generateCacheKey({ year: 2024, month: 3 });
      const key2 = (datasource as any).generateCacheKey({ year: 2024, month: 3 });

      expect(key1).toBe(key2);
    });

    it('should handle empty options', () => {
      const key = (datasource as any).generateCacheKey({});
      expect(key).toBeTruthy();
      expect(typeof key).toBe('string');
    });

    it('should include project filter in key', () => {
      const key1 = (datasource as any).generateCacheKey({ projectFilter: 'Project A' });
      const key2 = (datasource as any).generateCacheKey({ projectFilter: 'Project B' });

      expect(key1).not.toBe(key2);
    });

    it('should include date range in key', () => {
      const key1 = (datasource as any).generateCacheKey({
        dateRange: {
          start: new Date(2024, 0, 1),
          end: new Date(2024, 11, 31)
        }
      });
      const key2 = (datasource as any).generateCacheKey({
        dateRange: {
          start: new Date(2024, 0, 1),
          end: new Date(2024, 5, 30)
        }
      });

      expect(key1).not.toBe(key2);
    });
  });

  describe('debug logging', () => {
    it('should log when debug mode is enabled', () => {
      mockPlugin.settings.debugMode = true;
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        hours: 8,
        'per-hour': 75,
        'work-order': 'Test Project',
        worked: true
      };

      (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    it('should not log when debug mode is disabled', () => {
      mockPlugin.settings.debugMode = false;
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const mockFile = createMockFile('timesheets/2024-03-15.md', '2024-03-15.md');
      const frontmatter = {
        hours: 8,
        'per-hour': 75,
        'work-order': 'Test Project',
        worked: true
      };

      (datasource as any).extractFromFrontmatter(
        mockFile,
        new Date(2024, 2, 15),
        frontmatter
      );

      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[Timesheet]')
      );
      consoleLogSpy.mockRestore();
    });
  });
});
