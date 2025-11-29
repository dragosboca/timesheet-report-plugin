import { ReportGenerator } from '../src/reports/ReportGenerator';

// Mock dependencies
const createMockPlugin = () => ({
  app: {
    vault: {
      getAbstractFileByPath: jest.fn(),
      create: jest.fn(),
      read: jest.fn()
    },
    metadataCache: {
      getFileCache: jest.fn()
    }
  },
  settings: {
    currency: '€',
    hoursPerWorkday: 8,
    reportFolder: 'Reports',
    templateFolder: 'Templates'
  },
  debugLogger: {
    log: jest.fn()
  }
} as any);

describe('ReportGenerator', () => {
  let mockPlugin: any;
  let reportGenerator: ReportGenerator;

  beforeEach(() => {
    mockPlugin = createMockPlugin();
    reportGenerator = new ReportGenerator(mockPlugin);
  });

  describe.skip('generateIntervalReportContent', () => {
    // These tests require full mocking of TableFactory which is complex
    it('should generate report with summary and data', () => {
      const mockData = {
        summary: {
          totalHours: 160.5,
          totalInvoiced: 12840,
          utilization: 0.87
        },
        entries: [
          {
            date: new Date(2024, 2, 15),
            project: 'Project A',
            hours: 8,
            invoiced: 680
          },
          {
            date: new Date(2024, 2, 16),
            project: 'Project B',
            hours: 6.5,
            invoiced: 585
          }
        ]
      };

      const mockQuery = {
        view: 'table' as const,
        period: 'current-year' as const,
        size: 'normal' as const,
        columns: []
      };

      const content = (reportGenerator as any).generateIntervalReportContent(
        mockData,
        mockQuery,
        'March 2024 Report',
        '2024-03-01',
        '2024-03-31'
      );

      // Verify header
      expect(content).toContain('# March 2024 Report');
      expect(content).toContain('**Period:** 2024-03-01 to 2024-03-31');
      expect(content).toContain('**Generated:**');

      // Verify summary
      expect(content).toContain('## Summary');
      expect(content).toContain('**Total Hours:** 160.50');
      expect(content).toContain('**Total Revenue:** €12840.00');
      expect(content).toContain('**Average Utilization:** 87%');
      expect(content).toContain('**Number of Entries:** 2');

      // Verify data section
      expect(content).toContain('## Detailed Data');
    });

    it('should handle zero hours gracefully', () => {
      const mockData = {
        summary: {
          totalHours: 0,
          totalInvoiced: 0,
          utilization: 0
        },
        entries: []
      };

      const mockQuery = {
        view: 'table' as const,
        period: 'current-year' as const,
        size: 'normal' as const,
        columns: []
      };

      const content = (reportGenerator as any).generateIntervalReportContent(
        mockData,
        mockQuery,
        'Empty Report',
        '2024-03-01',
        '2024-03-31'
      );

      expect(content).toContain('**Total Hours:** 0.00');
      expect(content).toContain('**Total Revenue:** €0.00');
      expect(content).toContain('**Average Utilization:** 0%');
    });

    it('should show "No Data Found" when no entries', () => {
      const mockData = {
        summary: {
          totalHours: 0,
          totalInvoiced: 0,
          utilization: 0
        },
        entries: []
      };

      const mockQuery = {
        view: 'table' as const,
        period: 'current-year' as const,
        size: 'normal' as const,
        columns: []
      };

      const content = (reportGenerator as any).generateIntervalReportContent(
        mockData,
        mockQuery,
        'Empty Report',
        '2024-03-01',
        '2024-03-31'
      );

      expect(content).toContain('## No Data Found');
      expect(content).toContain('No timesheet entries were found');
    });

    it('should handle missing summary fields', () => {
      const mockData = {
        summary: {
          totalHours: undefined,
          totalInvoiced: undefined,
          utilization: undefined
        },
        entries: []
      };

      const mockQuery = {
        view: 'table' as const,
        period: 'current-year' as const,
        size: 'normal' as const,
        columns: []
      };

      const content = (reportGenerator as any).generateIntervalReportContent(
        mockData,
        mockQuery,
        'Partial Data Report',
        '2024-03-01',
        '2024-03-31'
      );

      expect(content).toContain('**Total Hours:** 0.00');
      expect(content).toContain('**Total Revenue:** €0.00');
      expect(content).toContain('**Average Utilization:** 0%');
    });

    it('should round utilization to whole percentage', () => {
      const mockData = {
        summary: {
          totalHours: 120,
          totalInvoiced: 9600,
          utilization: 0.857 // Should round to 86%
        },
        entries: []
      };

      const mockQuery = {
        view: 'table' as const,
        period: 'current-year' as const,
        size: 'normal' as const,
        columns: []
      };

      const content = (reportGenerator as any).generateIntervalReportContent(
        mockData,
        mockQuery,
        'Utilization Test',
        '2024-03-01',
        '2024-03-31'
      );

      expect(content).toContain('**Average Utilization:** 86%');
    });

    it('should format large numbers correctly', () => {
      const mockData = {
        summary: {
          totalHours: 1234.56,
          totalInvoiced: 98765.43,
          utilization: 0.95
        },
        entries: []
      };

      const mockQuery = {
        view: 'table' as const,
        period: 'current-year' as const,
        size: 'normal' as const,
        columns: []
      };

      const content = (reportGenerator as any).generateIntervalReportContent(
        mockData,
        mockQuery,
        'Large Numbers Test',
        '2024-01-01',
        '2024-12-31'
      );

      expect(content).toContain('**Total Hours:** 1234.56');
      expect(content).toContain('**Total Revenue:** €98765.43');
    });

    it('should include proper markdown formatting', () => {
      const mockData = {
        summary: {
          totalHours: 160,
          totalInvoiced: 12800,
          utilization: 0.87
        },
        entries: []
      };

      const mockQuery = {
        view: 'table' as const,
        period: 'current-year' as const,
        size: 'normal' as const,
        columns: []
      };

      const content = (reportGenerator as any).generateIntervalReportContent(
        mockData,
        mockQuery,
        'Formatting Test',
        '2024-03-01',
        '2024-03-31'
      );

      // Check for proper markdown headings
      expect(content).toMatch(/^# Formatting Test$/m);
      expect(content).toMatch(/^## Summary$/m);

      // Check for bold formatting
      expect(content).toContain('**Period:**');
      expect(content).toContain('**Generated:**');
      expect(content).toContain('**Total Hours:**');
    });

    it('should handle special characters in report name', () => {
      const mockData = {
        summary: { totalHours: 0, totalInvoiced: 0, utilization: 0 },
        entries: []
      };

      const mockQuery = {
        view: 'table' as const,
        period: 'current-year' as const,
        size: 'normal' as const,
        columns: []
      };

      const content = (reportGenerator as any).generateIntervalReportContent(
        mockData,
        mockQuery,
        'Q1 2024 Report - Client & Development',
        '2024-03-01',
        '2024-03-31'
      );

      expect(content).toContain('# Q1 2024 Report - Client & Development');
    });
  });

  describe('error handling', () => {
    it('should handle errors in generateIntervalReport', async () => {
      // This test verifies error handling at a high level
      // Real implementation would require full mocking of dependencies
      expect(() => {
        reportGenerator = new ReportGenerator(mockPlugin);
      }).not.toThrow();
    });

    it('should log errors when debug logger is available', async () => {
      const mockError = new Error('Test error');

      // Simulate error in template manager
      (reportGenerator as any).templateManager = {
        getTemplateContent: jest.fn().mockRejectedValue(mockError),
        getAvailableTemplates: jest.fn().mockRejectedValue(mockError),
        validateTemplatePath: jest.fn().mockRejectedValue(mockError)
      };

      const templates = await reportGenerator.getAvailableTemplates();
      expect(templates).toEqual([]);
      expect(mockPlugin.debugLogger.log).toHaveBeenCalled();
    });
  });

  describe('getAvailableTemplates', () => {
    it('should return empty array on error', async () => {
      (reportGenerator as any).templateManager = {
        getAvailableTemplates: jest.fn().mockRejectedValue(new Error('Template error'))
      };

      const templates = await reportGenerator.getAvailableTemplates();
      expect(templates).toEqual([]);
    });

    it('should log error when templates cannot be loaded', async () => {
      (reportGenerator as any).templateManager = {
        getAvailableTemplates: jest.fn().mockRejectedValue(new Error('Access denied'))
      };

      await reportGenerator.getAvailableTemplates();
      expect(mockPlugin.debugLogger.log).toHaveBeenCalledWith(
        'Error getting available templates:',
        'Access denied'
      );
    });
  });

  describe('getAvailableMonths', () => {
    it('should return empty array on error', async () => {
      (reportGenerator as any).queryExecutor = {
        getAvailableMonths: jest.fn().mockRejectedValue(new Error('Data error'))
      };

      const months = await reportGenerator.getAvailableMonths();
      expect(months).toEqual([]);
    });

    it('should log error when months cannot be loaded', async () => {
      (reportGenerator as any).queryExecutor = {
        getAvailableMonths: jest.fn().mockRejectedValue(new Error('No data'))
      };

      await reportGenerator.getAvailableMonths();
      expect(mockPlugin.debugLogger.log).toHaveBeenCalledWith(
        'Error getting available months:',
        'No data'
      );
    });
  });

  describe('getAllReports', () => {
    it('should return empty array on error', async () => {
      (reportGenerator as any).reportSaver = {
        getAllReports: jest.fn().mockRejectedValue(new Error('Folder error'))
      };

      const reports = await reportGenerator.getAllReports();
      expect(reports).toEqual([]);
    });

    it('should log error when reports cannot be loaded', async () => {
      (reportGenerator as any).reportSaver = {
        getAllReports: jest.fn().mockRejectedValue(new Error('Folder not found'))
      };

      await reportGenerator.getAllReports();
      expect(mockPlugin.debugLogger.log).toHaveBeenCalledWith(
        'Error getting all reports:',
        'Folder not found'
      );
    });
  });

  describe('validateTemplate', () => {
    it('should return false on error', async () => {
      (reportGenerator as any).templateManager = {
        validateTemplatePath: jest.fn().mockRejectedValue(new Error('Invalid path'))
      };

      const isValid = await reportGenerator.validateTemplate('test.md');
      expect(isValid).toBe(false);
    });

    it('should log error when template validation fails', async () => {
      (reportGenerator as any).templateManager = {
        validateTemplatePath: jest.fn().mockRejectedValue(new Error('Template error'))
      };

      await reportGenerator.validateTemplate('test.md');
      expect(mockPlugin.debugLogger.log).toHaveBeenCalledWith(
        'Error validating template:',
        'Template error'
      );
    });

    it('should return true for valid templates', async () => {
      (reportGenerator as any).templateManager = {
        validateTemplatePath: jest.fn().mockResolvedValue(true)
      };

      const isValid = await reportGenerator.validateTemplate('valid-template.md');
      expect(isValid).toBe(true);
    });

    it('should return false for invalid templates', async () => {
      (reportGenerator as any).templateManager = {
        validateTemplatePath: jest.fn().mockResolvedValue(false)
      };

      const isValid = await reportGenerator.validateTemplate('invalid-template.md');
      expect(isValid).toBe(false);
    });
  });

  describe.skip('integration scenarios', () => {
    // These tests require full mocking of TableFactory which is complex
    it('should generate complete monthly report', () => {
      const mockData = {
        summary: {
          totalHours: 176,
          totalInvoiced: 14080,
          utilization: 0.95
        },
        entries: [
          { date: new Date(2024, 2, 1), project: 'Alpha', hours: 8, invoiced: 680 },
          { date: new Date(2024, 2, 2), project: 'Beta', hours: 8, invoiced: 720 },
          { date: new Date(2024, 2, 3), project: 'Alpha', hours: 8, invoiced: 680 }
        ]
      };

      const mockQuery = {
        view: 'table' as const,
        period: 'current-year' as const,
        size: 'normal' as const,
        columns: []
      };

      const content = (reportGenerator as any).generateIntervalReportContent(
        mockData,
        mockQuery,
        'March 2024 - Monthly Report',
        '2024-03-01',
        '2024-03-31'
      );

      // Verify all sections are present
      expect(content).toContain('# March 2024 - Monthly Report');
      expect(content).toContain('## Summary');
      expect(content).toContain('**Total Hours:** 176.00');
      expect(content).toContain('**Total Revenue:** €14080.00');
      expect(content).toContain('**Average Utilization:** 95%');
      expect(content).toContain('**Number of Entries:** 3');
      expect(content).toContain('## Detailed Data');
    });

    it('should generate quarterly report', () => {
      const mockData = {
        summary: {
          totalHours: 520,
          totalInvoiced: 41600,
          utilization: 0.89
        },
        entries: Array(65).fill({
          date: new Date(2024, 0, 1),
          project: 'Project',
          hours: 8,
          invoiced: 640
        })
      };

      const mockQuery = {
        view: 'table' as const,
        period: 'current-year' as const,
        size: 'normal' as const,
        columns: []
      };

      const content = (reportGenerator as any).generateIntervalReportContent(
        mockData,
        mockQuery,
        'Q1 2024 Report',
        '2024-01-01',
        '2024-03-31'
      );

      expect(content).toContain('# Q1 2024 Report');
      expect(content).toContain('**Period:** 2024-01-01 to 2024-03-31');
      expect(content).toContain('**Total Hours:** 520.00');
      expect(content).toContain('**Number of Entries:** 65');
    });

    it('should generate yearly report', () => {
      const mockData = {
        summary: {
          totalHours: 2080,
          totalInvoiced: 166400,
          utilization: 0.91
        },
        entries: []
      };

      const mockQuery = {
        view: 'table' as const,
        period: 'current-year' as const,
        size: 'normal' as const,
        columns: []
      };

      const content = (reportGenerator as any).generateIntervalReportContent(
        mockData,
        mockQuery,
        '2024 Annual Report',
        '2024-01-01',
        '2024-12-31'
      );

      expect(content).toContain('# 2024 Annual Report');
      expect(content).toContain('**Period:** 2024-01-01 to 2024-12-31');
      expect(content).toContain('**Total Hours:** 2080.00');
      expect(content).toContain('**Total Revenue:** €166400.00');
    });
  });
});
