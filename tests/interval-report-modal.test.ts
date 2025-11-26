// Tests for IntervalReportModal date handling

describe('IntervalReportModal Date Handling', () => {
  describe('formatDate', () => {
    // We'll test this by creating a mock class that exposes the private method
    class TestableIntervalReportModal {
      formatDate(date: Date): string {
        // Use local time instead of UTC to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }

    let modal: TestableIntervalReportModal;

    beforeEach(() => {
      modal = new TestableIntervalReportModal();
    });

    test('should format date using local time, not UTC', () => {
      // Test first day of month
      const jan1 = new Date(2024, 0, 1); // January 1, 2024 (local time)
      expect(modal.formatDate(jan1)).toBe('2024-01-01');

      // Test last day of month
      const jan31 = new Date(2024, 0, 31); // January 31, 2024
      expect(modal.formatDate(jan31)).toBe('2024-01-31');
    });

    test('should pad single digit months and days with zero', () => {
      const march5 = new Date(2024, 2, 5); // March 5, 2024
      expect(modal.formatDate(march5)).toBe('2024-03-05');
    });

    test('should handle leap year dates correctly', () => {
      const feb29 = new Date(2024, 1, 29); // February 29, 2024 (leap year)
      expect(modal.formatDate(feb29)).toBe('2024-02-29');
    });

    test('should handle year boundary correctly', () => {
      const dec31 = new Date(2023, 11, 31); // December 31, 2023
      expect(modal.formatDate(dec31)).toBe('2023-12-31');

      const jan1 = new Date(2024, 0, 1); // January 1, 2024
      expect(modal.formatDate(jan1)).toBe('2024-01-01');
    });

    test('should not be affected by timezone offset', () => {
      // Create a date at midnight local time
      const midnightLocal = new Date(2024, 5, 1, 0, 0, 0); // June 1, 2024 00:00:00
      expect(modal.formatDate(midnightLocal)).toBe('2024-06-01');

      // Even if we're in a timezone ahead of UTC, the date should stay the same
      const lateEvening = new Date(2024, 5, 1, 23, 59, 59); // June 1, 2024 23:59:59
      expect(modal.formatDate(lateEvening)).toBe('2024-06-01');
    });
  });

  describe('createPreset', () => {
    class TestableIntervalReportModal {
      createPreset(label: string, offset: number, unit: 'month' | 'months' | 'quarter' | 'year' | 'days'): {
        start: Date;
        end: Date;
        label: string;
      } {
        const now = new Date();
        let start: Date, end: Date;

        switch (unit) {
          case 'month':
            start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
            end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
            break;

          case 'months':
            // For multi-month ranges: offset is negative, gives range from (offset) months ago to now
            start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;

          case 'quarter':
            const quarterStart = Math.floor(now.getMonth() / 3) * 3;
            start = new Date(now.getFullYear(), quarterStart + (offset * 3), 1);
            end = new Date(now.getFullYear(), quarterStart + (offset * 3) + 3, 0);
            break;

          case 'year':
            start = new Date(now.getFullYear() + offset, 0, 1);
            end = new Date(now.getFullYear() + offset, 11, 31);
            break;

          case 'days':
            end = new Date(now);
            start = new Date(now);
            start.setDate(start.getDate() + offset);
            break;
        }

        return { start, end, label };
      }
    }

    let modal: TestableIntervalReportModal;

    beforeEach(() => {
      modal = new TestableIntervalReportModal();
    });

    describe('Current Month preset', () => {
      test('should start on first day of current month', () => {
        const preset = modal.createPreset('Current Month', 0, 'month');
        const now = new Date();

        expect(preset.start.getDate()).toBe(1);
        expect(preset.start.getMonth()).toBe(now.getMonth());
        expect(preset.start.getFullYear()).toBe(now.getFullYear());
      });

      test('should end on last day of current month', () => {
        const preset = modal.createPreset('Current Month', 0, 'month');
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        expect(preset.end.getDate()).toBe(lastDay);
        expect(preset.end.getMonth()).toBe(now.getMonth());
        expect(preset.end.getFullYear()).toBe(now.getFullYear());
      });
    });

    describe('Last Month preset', () => {
      test('should start on first day of previous month', () => {
        const preset = modal.createPreset('Last Month', -1, 'month');
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        expect(preset.start.getDate()).toBe(1);
        expect(preset.start.getMonth()).toBe(lastMonth.getMonth());
        expect(preset.start.getFullYear()).toBe(lastMonth.getFullYear());
      });

      test('should end on last day of previous month', () => {
        const preset = modal.createPreset('Last Month', -1, 'month');
        const now = new Date();
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        expect(preset.end.getDate()).toBe(lastMonthEnd.getDate());
        expect(preset.end.getMonth()).toBe(lastMonthEnd.getMonth());
        expect(preset.end.getFullYear()).toBe(lastMonthEnd.getFullYear());
      });

      test('should handle year boundary (January looking at December)', () => {
        // Mock a date in January
        const januaryDate = new Date(2024, 0, 15); // January 15, 2024
        const testModal = new TestableIntervalReportModal();

        // Temporarily override Date for this test
        const originalDate = global.Date;
        global.Date = class extends originalDate {
          constructor(...args: any[]) {
            if (args.length === 0) {
              super(januaryDate.getTime());
            } else {
              super(...args as [number]);
            }
          }
        } as any;

        const preset = testModal.createPreset('Last Month', -1, 'month');

        expect(preset.start.getMonth()).toBe(11); // December
        expect(preset.start.getFullYear()).toBe(2023);
        expect(preset.end.getMonth()).toBe(11); // December
        expect(preset.end.getDate()).toBe(31);

        // Restore original Date
        global.Date = originalDate;
      });
    });

    describe('Last 3 Months preset', () => {
      test('should start 3 months ago and end at end of current month', () => {
        const preset = modal.createPreset('Last 3 Months', -3, 'months');
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        expect(preset.start.getDate()).toBe(1);
        expect(preset.start.getMonth()).toBe(threeMonthsAgo.getMonth());
        expect(preset.start.getFullYear()).toBe(threeMonthsAgo.getFullYear());

        expect(preset.end.getDate()).toBe(endOfCurrentMonth.getDate());
        expect(preset.end.getMonth()).toBe(now.getMonth());
        expect(preset.end.getFullYear()).toBe(now.getFullYear());
      });

      test('should span approximately 3 months', () => {
        const preset = modal.createPreset('Last 3 Months', -3, 'months');

        // Calculate the difference in months
        const monthsDiff = (preset.end.getFullYear() - preset.start.getFullYear()) * 12
          + (preset.end.getMonth() - preset.start.getMonth());

        // Should be approximately 3 months (2 for the gap + current month)
        expect(monthsDiff).toBeGreaterThanOrEqual(2);
        expect(monthsDiff).toBeLessThanOrEqual(3);
      });
    });

    describe('Current Quarter preset', () => {
      test('should start on first day of current quarter', () => {
        const preset = modal.createPreset('Current Quarter', 0, 'quarter');
        const now = new Date();
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;

        expect(preset.start.getDate()).toBe(1);
        expect(preset.start.getMonth()).toBe(quarterStart);
      });

      test('should end on last day of current quarter', () => {
        const preset = modal.createPreset('Current Quarter', 0, 'quarter');
        const now = new Date();
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        const quarterEnd = new Date(now.getFullYear(), quarterStart + 3, 0);

        expect(preset.end.getDate()).toBe(quarterEnd.getDate());
        expect(preset.end.getMonth()).toBe(quarterEnd.getMonth());
      });
    });

    describe('Current Year preset', () => {
      test('should start on January 1st', () => {
        const preset = modal.createPreset('Current Year', 0, 'year');
        const now = new Date();

        expect(preset.start.getDate()).toBe(1);
        expect(preset.start.getMonth()).toBe(0); // January
        expect(preset.start.getFullYear()).toBe(now.getFullYear());
      });

      test('should end on December 31st', () => {
        const preset = modal.createPreset('Current Year', 0, 'year');
        const now = new Date();

        expect(preset.end.getDate()).toBe(31);
        expect(preset.end.getMonth()).toBe(11); // December
        expect(preset.end.getFullYear()).toBe(now.getFullYear());
      });
    });

    describe('Last 30 Days preset', () => {
      test('should span 30 days ending today', () => {
        const preset = modal.createPreset('Last 30 Days', -30, 'days');
        const now = new Date();

        const daysDiff = Math.floor((preset.end.getTime() - preset.start.getTime()) / (1000 * 60 * 60 * 24));

        expect(daysDiff).toBeGreaterThanOrEqual(29);
        expect(daysDiff).toBeLessThanOrEqual(30);
      });
    });

    describe('Edge cases', () => {
      test('should handle February in leap year', () => {
        const originalDate = global.Date;
        const febLeapYear = new Date(2024, 1, 15); // February 2024 (leap year)

        global.Date = class extends originalDate {
          constructor(...args: any[]) {
            if (args.length === 0) {
              super(febLeapYear.getTime());
            } else {
              super(...args as [number]);
            }
          }
        } as any;

        const testModal = new TestableIntervalReportModal();
        const preset = testModal.createPreset('Current Month', 0, 'month');

        expect(preset.end.getDate()).toBe(29); // February has 29 days in 2024

        global.Date = originalDate;
      });

      test('should handle February in non-leap year', () => {
        const originalDate = global.Date;
        const febNonLeapYear = new Date(2023, 1, 15); // February 2023 (non-leap year)

        global.Date = class extends originalDate {
          constructor(...args: any[]) {
            if (args.length === 0) {
              super(febNonLeapYear.getTime());
            } else {
              super(...args as [number]);
            }
          }
        } as any;

        const testModal = new TestableIntervalReportModal();
        const preset = testModal.createPreset('Current Month', 0, 'month');

        expect(preset.end.getDate()).toBe(28); // February has 28 days in 2023

        global.Date = originalDate;
      });

      test('should handle months with 30 days', () => {
        const originalDate = global.Date;
        const april = new Date(2024, 3, 15); // April 2024

        global.Date = class extends originalDate {
          constructor(...args: any[]) {
            if (args.length === 0) {
              super(april.getTime());
            } else {
              super(...args as [number]);
            }
          }
        } as any;

        const testModal = new TestableIntervalReportModal();
        const preset = testModal.createPreset('Current Month', 0, 'month');

        expect(preset.end.getDate()).toBe(30);

        global.Date = originalDate;
      });

      test('should handle months with 31 days', () => {
        const originalDate = global.Date;
        const january = new Date(2024, 0, 15); // January 2024

        global.Date = class extends originalDate {
          constructor(...args: any[]) {
            if (args.length === 0) {
              super(january.getTime());
            } else {
              super(...args as [number]);
            }
          }
        } as any;

        const testModal = new TestableIntervalReportModal();
        const preset = testModal.createPreset('Current Month', 0, 'month');

        expect(preset.end.getDate()).toBe(31);

        global.Date = originalDate;
      });
    });
  });

  describe('Integration: formatDate with createPreset', () => {
    class TestableIntervalReportModal {
      formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      createPreset(label: string, offset: number, unit: 'month' | 'months' | 'quarter' | 'year' | 'days'): {
        start: Date;
        end: Date;
        label: string;
      } {
        const now = new Date();
        let start: Date, end: Date;

        switch (unit) {
          case 'month':
            start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
            end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
            break;

          case 'months':
            start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;

          case 'quarter':
            const quarterStart = Math.floor(now.getMonth() / 3) * 3;
            start = new Date(now.getFullYear(), quarterStart + (offset * 3), 1);
            end = new Date(now.getFullYear(), quarterStart + (offset * 3) + 3, 0);
            break;

          case 'year':
            start = new Date(now.getFullYear() + offset, 0, 1);
            end = new Date(now.getFullYear() + offset, 11, 31);
            break;

          case 'days':
            end = new Date(now);
            start = new Date(now);
            start.setDate(start.getDate() + offset);
            break;
        }

        return { start, end, label };
      }
    }

    test('formatted dates should always show first day of month as 01', () => {
      const modal = new TestableIntervalReportModal();
      const preset = modal.createPreset('Current Month', 0, 'month');
      const formatted = modal.formatDate(preset.start);

      // Should always end with -01 for first day of month
      expect(formatted).toMatch(/-01$/);
    });

    test('formatted dates should use consistent YYYY-MM-DD format', () => {
      const modal = new TestableIntervalReportModal();
      const preset = modal.createPreset('Current Month', 0, 'month');

      const startFormatted = modal.formatDate(preset.start);
      const endFormatted = modal.formatDate(preset.end);

      // Should match YYYY-MM-DD format
      expect(startFormatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(endFormatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('start date should always be before or equal to end date', () => {
      const modal = new TestableIntervalReportModal();
      const presets = [
        modal.createPreset('Current Month', 0, 'month'),
        modal.createPreset('Last Month', -1, 'month'),
        modal.createPreset('Last 3 Months', -3, 'months'),
        modal.createPreset('Current Quarter', 0, 'quarter'),
        modal.createPreset('Current Year', 0, 'year'),
      ];

      presets.forEach(preset => {
        expect(preset.start.getTime()).toBeLessThanOrEqual(preset.end.getTime());
      });
    });
  });
});
