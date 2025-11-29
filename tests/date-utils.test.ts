import { DateUtils } from '../src/utils/date-utils';

describe('DateUtils', () => {
  describe('extractDateFromFilename', () => {
    describe('ISO format (YYYY-MM-DD)', () => {
      it('should extract date from standard ISO format', () => {
        const date = DateUtils.extractDateFromFilename('2024-03-15.md');
        expect(date).not.toBeNull();
        expect(date!.getFullYear()).toBe(2024);
        expect(date!.getMonth()).toBe(2); // March is month 2 (0-indexed)
        expect(date!.getDate()).toBe(15);
      });

      it('should extract date from ISO format with prefix', () => {
        const date = DateUtils.extractDateFromFilename('daily-note-2024-03-15.md');
        expect(date).not.toBeNull();
        expect(date!.getFullYear()).toBe(2024);
        expect(date!.getMonth()).toBe(2);
        expect(date!.getDate()).toBe(15);
      });

      it('should extract date from ISO format with suffix', () => {
        const date = DateUtils.extractDateFromFilename('2024-03-15-work-log.md');
        expect(date).not.toBeNull();
        expect(date!.getFullYear()).toBe(2024);
        expect(date!.getMonth()).toBe(2);
        expect(date!.getDate()).toBe(15);
      });

      it('should handle single digit months and days', () => {
        const date = DateUtils.extractDateFromFilename('2024-3-5.md');
        expect(date).not.toBeNull();
        expect(date!.getFullYear()).toBe(2024);
        expect(date!.getMonth()).toBe(2);
        expect(date!.getDate()).toBe(5);
      });
    });

    describe('DD-MM-YYYY format', () => {
      it('should extract date from DD-MM-YYYY format', () => {
        const date = DateUtils.extractDateFromFilename('15-03-2024.md');
        expect(date).not.toBeNull();
        expect(date!.getFullYear()).toBe(2024);
        expect(date!.getMonth()).toBe(2);
        expect(date!.getDate()).toBe(15);
      });

      it('should extract date from single digit DD-MM-YYYY', () => {
        const date = DateUtils.extractDateFromFilename('5-3-2024.md');
        expect(date).not.toBeNull();
        expect(date!.getFullYear()).toBe(2024);
        expect(date!.getMonth()).toBe(2);
        expect(date!.getDate()).toBe(5);
      });
    });

    describe('MM-DD-YYYY format', () => {
      it('should extract date from MM-DD-YYYY format', () => {
        const date = DateUtils.extractDateFromFilename('03-15-2024.md');
        expect(date).not.toBeNull();
        expect(date!.getFullYear()).toBe(2024);
        expect(date!.getMonth()).toBe(2);
        expect(date!.getDate()).toBe(15);
      });

      it('should extract date from MM/DD/YYYY with slashes', () => {
        const date = DateUtils.extractDateFromFilename('03/15/2024.md');
        expect(date).not.toBeNull();
        expect(date!.getFullYear()).toBe(2024);
        expect(date!.getMonth()).toBe(2);
        expect(date!.getDate()).toBe(15);
      });
    });

    describe('Month name formats', () => {
      it('should extract date from "Month DD, YYYY" format', () => {
        const date = DateUtils.extractDateFromFilename('March 15, 2024.md');
        expect(date).not.toBeNull();
        expect(date!.getFullYear()).toBe(2024);
        expect(date!.getMonth()).toBe(2);
        expect(date!.getDate()).toBe(15);
      });

      it('should extract date from "Month DD YYYY" format (no comma)', () => {
        const date = DateUtils.extractDateFromFilename('March 15 2024.md');
        expect(date).not.toBeNull();
        expect(date!.getFullYear()).toBe(2024);
        expect(date!.getMonth()).toBe(2);
        expect(date!.getDate()).toBe(15);
      });

      it('should handle all month names', () => {
        const months = [
          { name: 'January', index: 0 },
          { name: 'February', index: 1 },
          { name: 'March', index: 2 },
          { name: 'April', index: 3 },
          { name: 'May', index: 4 },
          { name: 'June', index: 5 },
          { name: 'July', index: 6 },
          { name: 'August', index: 7 },
          { name: 'September', index: 8 },
          { name: 'October', index: 9 },
          { name: 'November', index: 10 },
          { name: 'December', index: 11 }
        ];

        months.forEach(({ name, index }) => {
          const date = DateUtils.extractDateFromFilename(`${name} 15, 2024.md`);
          expect(date).not.toBeNull();
          expect(date!.getMonth()).toBe(index);
        });
      });

      it('should handle case insensitive month names', () => {
        const variants = [
          'march 15, 2024.md',
          'MARCH 15, 2024.md',
          'March 15, 2024.md',
          'MaRcH 15, 2024.md'
        ];

        variants.forEach(filename => {
          const date = DateUtils.extractDateFromFilename(filename);
          expect(date).not.toBeNull();
          expect(date!.getMonth()).toBe(2);
        });
      });
    });

    describe('Invalid dates', () => {
      it('should return null for files without dates', () => {
        const date = DateUtils.extractDateFromFilename('no-date-here.md');
        expect(date).toBeNull();
      });

      it('should return null for invalid month', () => {
        const date = DateUtils.extractDateFromFilename('2024-13-15.md');
        expect(date).toBeNull();
      });

      it('should return null for invalid day', () => {
        const date = DateUtils.extractDateFromFilename('2024-02-30.md');
        expect(date).toBeNull();
      });

      it('should return null for year out of range', () => {
        const date1 = DateUtils.extractDateFromFilename('1899-03-15.md');
        const date2 = DateUtils.extractDateFromFilename('2101-03-15.md');
        expect(date1).toBeNull();
        expect(date2).toBeNull();
      });

      it('should return null for invalid leap year date', () => {
        const date = DateUtils.extractDateFromFilename('2023-02-29.md'); // 2023 is not a leap year
        expect(date).toBeNull();
      });
    });

    describe('Edge cases', () => {
      it('should handle leap year dates correctly', () => {
        const date = DateUtils.extractDateFromFilename('2024-02-29.md');
        expect(date).not.toBeNull();
        expect(date!.getFullYear()).toBe(2024);
        expect(date!.getMonth()).toBe(1);
        expect(date!.getDate()).toBe(29);
      });

      it('should handle end of month dates', () => {
        const dates = [
          { filename: '2024-01-31.md', day: 31 },
          { filename: '2024-03-31.md', day: 31 },
          { filename: '2024-04-30.md', day: 30 },
          { filename: '2024-02-29.md', day: 29 }
        ];

        dates.forEach(({ filename, day }) => {
          const date = DateUtils.extractDateFromFilename(filename);
          expect(date).not.toBeNull();
          expect(date!.getDate()).toBe(day);
        });
      });

      it('should handle beginning of year dates', () => {
        const date = DateUtils.extractDateFromFilename('2024-01-01.md');
        expect(date).not.toBeNull();
        expect(date!.getMonth()).toBe(0);
        expect(date!.getDate()).toBe(1);
      });

      it('should handle end of year dates', () => {
        const date = DateUtils.extractDateFromFilename('2024-12-31.md');
        expect(date).not.toBeNull();
        expect(date!.getMonth()).toBe(11);
        expect(date!.getDate()).toBe(31);
      });
    });
  });

  describe('extractDateFromPath', () => {
    it('should extract date from path with YYYY/MM/DD structure', () => {
      const date = DateUtils.extractDateFromPath('timesheets/2024/03/15-daily-note.md');
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2024);
      expect(date!.getMonth()).toBe(2);
      expect(date!.getDate()).toBe(15);
    });

    it('should extract date from path with YYYY-MM-DD structure', () => {
      const date = DateUtils.extractDateFromPath('timesheets/2024-03-15-note.md');
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2024);
      expect(date!.getMonth()).toBe(2);
      expect(date!.getDate()).toBe(15);
    });

    it('should extract date from nested path', () => {
      const date = DateUtils.extractDateFromPath('vault/daily-notes/2024/03/15/note.md');
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2024);
      expect(date!.getMonth()).toBe(2);
      expect(date!.getDate()).toBe(15);
    });

    it('should return null for path without date', () => {
      const date = DateUtils.extractDateFromPath('timesheets/general-notes.md');
      expect(date).toBeNull();
    });
  });

  describe('getWorkingDaysInMonth', () => {
    it('should calculate working days for March 2024', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 3);
      expect(workingDays).toBe(21);
    });

    it('should calculate working days for February 2024 (leap year)', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 2);
      expect(workingDays).toBe(21);
    });

    it('should calculate working days for February 2023 (non-leap year)', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2023, 2);
      expect(workingDays).toBe(20);
    });

    it('should exclude weekends correctly', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 1);
      expect(workingDays).toBeGreaterThan(19);
      expect(workingDays).toBeLessThan(24);
    });

    it('should handle all months in a year', () => {
      for (let month = 1; month <= 12; month++) {
        const workingDays = DateUtils.getWorkingDaysInMonth(2024, month);
        expect(workingDays).toBeGreaterThan(18);
        expect(workingDays).toBeLessThan(24);
      }
    });
  });

  describe('calculateTargetHoursForMonth', () => {
    it('should calculate target hours correctly', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 3);
      const targetHours = DateUtils.calculateTargetHoursForMonth(2024, 3, 8);
      expect(targetHours).toBe(workingDays * 8);
    });

    it('should handle different hours per workday', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 3);
      const targetHours6h = DateUtils.calculateTargetHoursForMonth(2024, 3, 6);
      const targetHours8h = DateUtils.calculateTargetHoursForMonth(2024, 3, 8);

      expect(targetHours6h).toBe(workingDays * 6);
      expect(targetHours8h).toBe(workingDays * 8);
    });
  });

  describe('parseDate', () => {
    it('should parse ISO format dates', () => {
      const date = DateUtils.parseDate('2024-03-15');
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2024);
      expect(date!.getMonth()).toBe(2);
      expect(date!.getDate()).toBe(15);
    });

    it('should parse DD-MM-YYYY format', () => {
      const date = DateUtils.parseDate('15-03-2024');
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2024);
      expect(date!.getMonth()).toBe(2);
      expect(date!.getDate()).toBe(15);
    });

    it('should parse MM/DD/YYYY format', () => {
      const date = DateUtils.parseDate('03/15/2024');
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2024);
      expect(date!.getMonth()).toBe(2);
      expect(date!.getDate()).toBe(15);
    });

    it('should return null for invalid dates', () => {
      const date = DateUtils.parseDate('invalid-date');
      expect(date).toBeNull();
    });

    it('should return null for empty string', () => {
      const date = DateUtils.parseDate('');
      expect(date).toBeNull();
    });
  });

  describe('isWeekend', () => {
    it('should identify Saturday as weekend', () => {
      const saturday = new Date(2024, 2, 16); // March 16, 2024 is a Saturday
      expect(DateUtils.isWeekend(saturday)).toBe(true);
    });

    it('should identify Sunday as weekend', () => {
      const sunday = new Date(2024, 2, 17); // March 17, 2024 is a Sunday
      expect(DateUtils.isWeekend(sunday)).toBe(true);
    });

    it('should identify weekdays as not weekend', () => {
      const weekdays = [
        new Date(2024, 2, 11), // Monday
        new Date(2024, 2, 12), // Tuesday
        new Date(2024, 2, 13), // Wednesday
        new Date(2024, 2, 14), // Thursday
        new Date(2024, 2, 15)  // Friday
      ];

      weekdays.forEach(day => {
        expect(DateUtils.isWeekend(day)).toBe(false);
      });
    });
  });

  describe('formatDateISO', () => {
    it('should format date as ISO string', () => {
      const date = new Date(Date.UTC(2024, 2, 15));
      const formatted = DateUtils.formatDateISO(date);
      expect(formatted).toMatch(/2024-03-1[45]/); // Allow for timezone offset
    });

    it('should pad single digit months and days', () => {
      const date = new Date(Date.UTC(2024, 0, 5));
      const formatted = DateUtils.formatDateISO(date);
      expect(formatted).toMatch(/2024-01-0[45]/); // Allow for timezone offset
    });
  });

  describe('getMonthName', () => {
    it('should return correct month names', () => {
      expect(DateUtils.getMonthName(1)).toBe('January');
      expect(DateUtils.getMonthName(2)).toBe('February');
      expect(DateUtils.getMonthName(3)).toBe('March');
      expect(DateUtils.getMonthName(12)).toBe('December');
    });

    it('should handle invalid month numbers', () => {
      expect(DateUtils.getMonthName(0)).toBe('Unknown');
      expect(DateUtils.getMonthName(13)).toBe('Unknown');
    });
  });

  describe('getCurrentMonthInterval', () => {
    it('should return start and end of current month', () => {
      const interval = DateUtils.getCurrentMonthInterval();
      expect(interval.start.getDate()).toBe(1);
      expect(interval.start.getMonth()).toBe(interval.end.getMonth());
      expect(interval.end.getDate()).toBeGreaterThan(27);
    });
  });

  describe('getLastMonthInterval', () => {
    it('should return start and end of previous month', () => {
      const interval = DateUtils.getLastMonthInterval();
      const now = new Date();
      const expectedMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;

      expect(interval.start.getDate()).toBe(1);
      expect(interval.start.getMonth()).toBe(expectedMonth);
      expect(interval.end.getMonth()).toBe(expectedMonth);
    });
  });

  describe('getCurrentYearInterval', () => {
    it('should return start and end of current year', () => {
      const interval = DateUtils.getCurrentYearInterval();
      const now = new Date();

      expect(interval.start.getMonth()).toBe(0);
      expect(interval.start.getDate()).toBe(1);
      expect(interval.end.getMonth()).toBe(11);
      expect(interval.end.getDate()).toBe(31);
      expect(interval.start.getFullYear()).toBe(now.getFullYear());
    });
  });

  describe('getLastNDaysInterval', () => {
    it('should return correct date range for last N days', () => {
      const interval = DateUtils.getLastNDaysInterval(7);
      const daysDiff = Math.floor((interval.end.getTime() - interval.start.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysDiff).toBe(7);
    });

    it('should handle last 30 days', () => {
      const interval = DateUtils.getLastNDaysInterval(30);
      const daysDiff = Math.floor((interval.end.getTime() - interval.start.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysDiff).toBe(30);
    });
  });

  describe('isValidDateRange', () => {
    it('should validate correct date ranges', () => {
      expect(DateUtils.isValidDateRange('2024-01-01', '2024-12-31')).toBe(true);
      expect(DateUtils.isValidDateRange('2024-03-15', '2024-03-15')).toBe(true);
    });

    it('should reject invalid date ranges', () => {
      expect(DateUtils.isValidDateRange('2024-12-31', '2024-01-01')).toBe(false);
    });

    it('should reject invalid dates', () => {
      expect(DateUtils.isValidDateRange('invalid', '2024-12-31')).toBe(false);
      expect(DateUtils.isValidDateRange('2024-01-01', 'invalid')).toBe(false);
    });
  });

  describe('getIntervalLabel', () => {
    it('should format single month correctly', () => {
      const start = new Date(2024, 2, 1);
      const end = new Date(2024, 2, 31);
      const label = DateUtils.getIntervalLabel(start, end);

      expect(label).toBe('March 2024');
    });

    it('should format full year correctly', () => {
      const start = new Date(2024, 0, 1);
      const end = new Date(2024, 11, 31);
      const label = DateUtils.getIntervalLabel(start, end);

      expect(label).toBe('2024');
    });

    it('should format custom date range', () => {
      const start = new Date(Date.UTC(2024, 0, 15));
      const end = new Date(Date.UTC(2024, 2, 15));
      const label = DateUtils.getIntervalLabel(start, end);

      // Allow for timezone differences in date rendering
      expect(label).toMatch(/2024-01-1[45]/);
      expect(label).toMatch(/2024-03-1[45]/);
    });
  });
});
