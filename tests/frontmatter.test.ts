// Mock settings
const mockSettings = {
  timesheetFolder: 'timesheets',
  hoursPerWorkday: 8,
  project: {
    defaultRate: 75,
    type: 'hourly'
  }
};

// Mock file object
const mockFile = {
  path: 'timesheets/2024-03-15.md',
  basename: '2024-03-15',
  name: '2024-03-15.md'
};

describe('Frontmatter Parsing', () => {
  let mockDataExtractor: any;

  beforeEach(() => {
    // Create mock plugin instance
    const mockPlugin = {
      settings: mockSettings
    } as any;

    // Create mock data extractor with the core extraction logic
    mockDataExtractor = {
      plugin: mockPlugin,
      extractFromFrontmatter: function (file: any, date: Date, frontmatter: any) {
        if (!frontmatter) {
          return null;
        }
        const worked = frontmatter.worked !== false;
        if (!worked) {
          return null;
        }

        let hours = 0;
        let rate = undefined;
        let project = undefined;

        // Extract hours
        if (typeof frontmatter.hours === 'number') {
          hours = frontmatter.hours;
        } else if (typeof frontmatter.duration === 'number') {
          hours = frontmatter.duration;
        } else if (typeof frontmatter.hours === 'string') {
          hours = parseFloat(frontmatter.hours) || 0;
        }

        // Extract rate
        if (typeof frontmatter['per-hour'] === 'number') {
          rate = frontmatter['per-hour'];
        } else if (typeof frontmatter['per-hour'] === 'string') {
          rate = parseFloat(frontmatter['per-hour']) || undefined;
        } else if (typeof frontmatter.rate === 'number') {
          rate = frontmatter.rate;
        } else if (typeof frontmatter.hourlyRate === 'number') {
          rate = frontmatter.hourlyRate;
        }

        // Fall back to default rate
        if (!rate && this.plugin.settings.project?.defaultRate) {
          rate = this.plugin.settings.project.defaultRate;
        }

        // Extract project
        if (frontmatter['work-order']) {
          if (Array.isArray(frontmatter['work-order'])) {
            project = frontmatter['work-order'][0];
          } else {
            project = String(frontmatter['work-order']);
          }
        } else if (frontmatter.client) {
          if (Array.isArray(frontmatter.client)) {
            project = frontmatter.client[0];
          } else {
            project = String(frontmatter.client);
          }
        } else if (typeof frontmatter.project === 'string') {
          project = frontmatter.project;
        }

        const notes = frontmatter.notes || frontmatter.description || '';

        if (hours > 0) {
          return {
            date,
            hours,
            rate,
            project,
            notes,
            taskDescription: notes,
            file
          };
        }

        return null;
      }
    };
  });

  describe('Historical format (per-hour)', () => {
    it('should extract valid timesheet entry', () => {
      const frontmatter = {
        hours: 8,
        'per-hour': 75,
        'work-order': 'Project Alpha',
        client: 'Acme Corp',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.hours).toBe(8);
      expect(result.rate).toBe(75);
      expect(result.project).toBe('Project Alpha');
      expect(result.date).toBe(testDate);
      expect(result.file).toBe(mockFile);
    });
  });

  describe('Array format', () => {
    it('should handle array values for work-order and client', () => {
      const frontmatter = {
        hours: 6.5,
        'per-hour': 85,
        'work-order': ['Main Project', 'Sub Task'],
        client: ['Primary Client'],
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.hours).toBe(6.5);
      expect(result.rate).toBe(85);
      expect(result.project).toBe('Main Project'); // Should take first array element
    });
  });

  describe('Alternative rate fields', () => {
    it('should support "rate" field instead of "per-hour"', () => {
      const frontmatter = {
        hours: 7,
        rate: 90,
        project: 'Alternative Format',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.hours).toBe(7);
      expect(result.rate).toBe(90);
      expect(result.project).toBe('Alternative Format');
    });

    it('should support "hourlyRate" field', () => {
      const frontmatter = {
        hours: 5,
        hourlyRate: 100,
        project: 'Hourly Rate Test',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.hours).toBe(5);
      expect(result.rate).toBe(100);
      expect(result.project).toBe('Hourly Rate Test');
    });
  });

  describe('String numbers', () => {
    it('should parse string numbers correctly', () => {
      const frontmatter = {
        hours: '8.5',
        'per-hour': '80',
        'work-order': 'String Numbers Test',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.hours).toBe(8.5);
      expect(result.rate).toBe(80);
      expect(result.project).toBe('String Numbers Test');
    });

    it('should handle invalid string numbers gracefully', () => {
      const frontmatter = {
        hours: 'invalid',
        'per-hour': 'also-invalid',
        'work-order': 'Invalid Numbers Test',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).toBeNull(); // Should return null because hours is 0
    });
  });

  describe('Non-working day', () => {
    it('should skip entry when worked is false', () => {
      const frontmatter = {
        worked: false,
        notes: 'Holiday'
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).toBeNull();
    });

    it('should process entry when worked is not specified (defaults to true)', () => {
      const frontmatter = {
        hours: 4,
        'per-hour': 75,
        'work-order': 'Default Worked Test'
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.hours).toBe(4);
    });
  });

  describe('Missing rate (should use default)', () => {
    it('should use default rate when no rate specified', () => {
      const frontmatter = {
        hours: 4,
        'work-order': 'No Rate Project',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.hours).toBe(4);
      expect(result.rate).toBe(75); // Should use default rate from settings
      expect(result.project).toBe('No Rate Project');
    });

    it('should handle missing default rate gracefully', () => {
      // Override plugin settings to have no default rate
      mockDataExtractor.plugin.settings.project.defaultRate = undefined;

      const frontmatter = {
        hours: 4,
        'work-order': 'No Rate Project',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.hours).toBe(4);
      expect(result.rate).toBeUndefined();
    });
  });

  describe('Alternative duration field', () => {
    it('should support "duration" field instead of "hours"', () => {
      const frontmatter = {
        duration: 6,
        'per-hour': 80,
        'work-order': 'Duration Test',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.hours).toBe(6);
      expect(result.rate).toBe(80);
    });

    it('should prefer "hours" over "duration" when both are present', () => {
      const frontmatter = {
        hours: 8,
        duration: 6,
        'per-hour': 80,
        'work-order': 'Hours Priority Test',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.hours).toBe(8); // Should use hours, not duration
    });
  });

  describe('Project field priority', () => {
    it('should prefer work-order over client', () => {
      const frontmatter = {
        hours: 5,
        'per-hour': 70,
        'work-order': 'Work Order Project',
        client: 'Client Project',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.project).toBe('Work Order Project');
    });

    it('should use client when work-order is not present', () => {
      const frontmatter = {
        hours: 5,
        'per-hour': 70,
        client: 'Client Project Only',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.project).toBe('Client Project Only');
    });

    it('should use project field as fallback', () => {
      const frontmatter = {
        hours: 5,
        'per-hour': 70,
        project: 'Fallback Project',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.project).toBe('Fallback Project');
    });
  });

  describe('Notes and descriptions', () => {
    it('should extract notes field', () => {
      const frontmatter = {
        hours: 4,
        'per-hour': 75,
        'work-order': 'Notes Test',
        notes: 'This is a note about the work',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.notes).toBe('This is a note about the work');
      expect(result.taskDescription).toBe('This is a note about the work');
    });

    it('should use description field when notes is not present', () => {
      const frontmatter = {
        hours: 4,
        'per-hour': 75,
        'work-order': 'Description Test',
        description: 'This is a description of the work',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.notes).toBe('This is a description of the work');
      expect(result.taskDescription).toBe('This is a description of the work');
    });

    it('should default to empty string when no notes or description', () => {
      const frontmatter = {
        hours: 4,
        'per-hour': 75,
        'work-order': 'No Notes Test',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.notes).toBe('');
      expect(result.taskDescription).toBe('');
    });
  });

  describe('Zero or negative hours', () => {
    it('should return null for zero hours', () => {
      const frontmatter = {
        hours: 0,
        'per-hour': 75,
        'work-order': 'Zero Hours Test',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).toBeNull();
    });

    it('should return null for negative hours', () => {
      const frontmatter = {
        hours: -2,
        'per-hour': 75,
        'work-order': 'Negative Hours Test',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty frontmatter', () => {
      const frontmatter = {};
      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).toBeNull();
    });

    it('should handle null frontmatter', () => {
      const frontmatter = null;
      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).toBeNull();
    });

    it('should handle undefined frontmatter', () => {
      const frontmatter = undefined;
      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).toBeNull();
    });

    it('should handle very large hour values', () => {
      const frontmatter = {
        hours: 999,
        'per-hour': 75,
        'work-order': 'Large Hours Test',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.hours).toBe(999);
    });

    it('should handle very high hourly rates', () => {
      const frontmatter = {
        hours: 8,
        'per-hour': 10000,
        'work-order': 'High Rate Test',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.rate).toBe(10000);
    });

    it('should handle special characters in project names', () => {
      const frontmatter = {
        hours: 6,
        'per-hour': 80,
        'work-order': 'Project #1 (Test & Development) - [Phase 2] émojis 📊',
        worked: true
      };

      const testDate = new Date('2024-03-15');
      const result = mockDataExtractor.extractFromFrontmatter(mockFile, testDate, frontmatter);

      expect(result).not.toBeNull();
      expect(result.project).toBe('Project #1 (Test & Development) - [Phase 2] émojis 📊');
    });
  });
});
