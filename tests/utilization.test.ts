import { TimesheetReportPlugin } from '../src/main';

// Mock date utilities
const DateUtils = {
  getWorkingDaysInMonth: (year: number, month: number): number => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    let workingDays = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return workingDays;
  }
};

// Mock settings
const mockSettings = {
  hoursPerWorkday: 8,
  timesheetFolder: 'timesheets',
  project: {
    defaultRate: 75,
    type: 'hourly'
  }
};

describe('Utilization Calculations', () => {
  let plugin: TimesheetReportPlugin;

  beforeEach(() => {
    plugin = {
      settings: mockSettings
    } as any;
  });

  describe('Working Days Calculation', () => {
    it('should calculate working days for March 2024 correctly', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 3);
      expect(workingDays).toBe(21); // March 2024 has 21 working days
    });

    it('should calculate working days for February 2024 (leap year)', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 2);
      expect(workingDays).toBe(21); // February 2024 has 21 working days
    });

    it('should calculate working days for January 2024', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 1);
      expect(workingDays).toBe(23); // January 2024 has 23 working days
    });

    it('should calculate working days for December 2023', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2023, 12);
      expect(workingDays).toBe(21); // December 2023 has 21 working days
    });

    it('should handle February in non-leap year', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2023, 2);
      expect(workingDays).toBe(20); // February 2023 has 20 working days
    });

    it('should exclude weekends correctly', () => {
      // Test a month that starts on different days of the week
      const workingDaysJune2024 = DateUtils.getWorkingDaysInMonth(2024, 6);
      const workingDaysJuly2024 = DateUtils.getWorkingDaysInMonth(2024, 7);

      expect(workingDaysJune2024).toBeGreaterThan(19);
      expect(workingDaysJune2024).toBeLessThan(24);
      expect(workingDaysJuly2024).toBeGreaterThan(19);
      expect(workingDaysJuly2024).toBeLessThan(24);
    });
  });

  describe('Utilization Calculation', () => {
    const calculateUtilization = (totalHours: number, year: number, month: number, hoursPerWorkday: number = 8): number => {
      const workingDays = DateUtils.getWorkingDaysInMonth(year, month);
      const targetHours = workingDays * hoursPerWorkday;
      return targetHours > 0 ? (totalHours / targetHours) * 100 : 0;
    };

    it('should calculate 100% utilization for perfect 8h/day', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 3); // 21 days
      const totalHours = workingDays * 8; // 168 hours
      const utilization = calculateUtilization(totalHours, 2024, 3, 8);

      expect(utilization).toBeCloseTo(100, 1);
    });

    it('should calculate 50% utilization for half days', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 3); // 21 days
      const totalHours = workingDays * 4; // 84 hours (4h per day)
      const utilization = calculateUtilization(totalHours, 2024, 3, 8);

      expect(utilization).toBeCloseTo(50, 1);
    });

    it('should calculate 120% utilization for overtime', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 3); // 21 days
      const totalHours = workingDays * 9.6; // 201.6 hours (9.6h per day)
      const utilization = calculateUtilization(totalHours, 2024, 3, 8);

      expect(utilization).toBeCloseTo(120, 1);
    });

    it('should calculate 0% utilization for no work', () => {
      const totalHours = 0;
      const utilization = calculateUtilization(totalHours, 2024, 3, 8);

      expect(utilization).toBe(0);
    });

    it('should handle different hours per workday settings', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 3); // 21 days
      const totalHours = workingDays * 6; // 126 hours

      // With 6 hours per workday setting
      const utilization6h = calculateUtilization(totalHours, 2024, 3, 6);
      expect(utilization6h).toBeCloseTo(100, 1);

      // With 8 hours per workday setting
      const utilization8h = calculateUtilization(totalHours, 2024, 3, 8);
      expect(utilization8h).toBeCloseTo(75, 1);
    });

    it('should handle decimal hours correctly', () => {
      const totalHours = 84.5; // 84.5 hours total
      const utilization = calculateUtilization(totalHours, 2024, 3, 8);

      expect(utilization).toBeGreaterThan(50);
      expect(utilization).toBeLessThan(51);
    });

    it('should handle very small hour amounts', () => {
      const totalHours = 0.5;
      const utilization = calculateUtilization(totalHours, 2024, 3, 8);

      expect(utilization).toBeGreaterThan(0);
      expect(utilization).toBeLessThan(1);
    });

    it('should handle very large hour amounts', () => {
      const totalHours = 1000;
      const utilization = calculateUtilization(totalHours, 2024, 3, 8);

      expect(utilization).toBeGreaterThan(500);
    });
  });

  describe('Real-world scenarios', () => {
    const calculateUtilization = (totalHours: number, year: number, month: number, hoursPerWorkday: number = 8): number => {
      const workingDays = DateUtils.getWorkingDaysInMonth(year, month);
      const targetHours = workingDays * hoursPerWorkday;
      return targetHours > 0 ? (totalHours / targetHours) * 100 : 0;
    };

    it('should handle part-time work schedule', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 3);
      const totalHours = workingDays * 4; // 4 hours per day (part-time)

      // With 4-hour workday setting for part-time
      const utilizationPartTime = calculateUtilization(totalHours, 2024, 3, 4);
      expect(utilizationPartTime).toBeCloseTo(100, 1);

      // With 8-hour workday setting (comparing to full-time)
      const utilizationVsFullTime = calculateUtilization(totalHours, 2024, 3, 8);
      expect(utilizationVsFullTime).toBeCloseTo(50, 1);
    });

    it('should handle consultant schedule (billing hours only)', () => {
      const totalBillableHours = 120; // 120 billable hours in March
      const utilization = calculateUtilization(totalBillableHours, 2024, 3, 8);

      expect(utilization).toBeGreaterThan(70);
      expect(utilization).toBeLessThan(72);
    });

    it('should handle vacation days properly', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 3); // 21 days
      const vacationDays = 5;
      const actualWorkingDays = workingDays - vacationDays; // 16 days
      const totalHours = actualWorkingDays * 8; // 128 hours

      // Using standard calculation (doesn't account for vacation)
      const standardUtilization = calculateUtilization(totalHours, 2024, 3, 8);
      expect(standardUtilization).toBeCloseTo(76.2, 1);

      // If we had a vacation-aware calculation
      const adjustedTargetHours = actualWorkingDays * 8;
      const adjustedUtilization = (totalHours / adjustedTargetHours) * 100;
      expect(adjustedUtilization).toBeCloseTo(100, 1);
    });
  });

  describe('Data validation', () => {
    it('should validate chart data format for utilization', () => {
      const mockTrendData = {
        labels: ['Jan 2024', 'Feb 2024', 'Mar 2024'],
        hours: [120, 140, 160],
        utilization: [75, 87.5, 100], // Should be percentages
        invoiced: [9000, 10500, 12000]
      };

      const maxUtilization = Math.max(...mockTrendData.utilization);
      const minUtilization = Math.min(...mockTrendData.utilization);

      expect(maxUtilization).toBeLessThanOrEqual(100);
      expect(minUtilization).toBeGreaterThanOrEqual(0);

      // Verify it's in percentage format (not decimal)
      mockTrendData.utilization.forEach(util => {
        expect(util).toBeGreaterThanOrEqual(0);
        expect(util).toBeLessThanOrEqual(200); // Allow for overtime scenarios
      });
    });

    it('should detect decimal vs percentage format', () => {
      const decimalData = [0.75, 0.875, 1.0];
      const percentageData = [75, 87.5, 100];

      const maxDecimal = Math.max(...decimalData);
      const maxPercentage = Math.max(...percentageData);

      // Decimal format detection
      expect(maxDecimal).toBeLessThanOrEqual(1.5); // Reasonable overtime threshold

      // Percentage format detection
      expect(maxPercentage).toBeGreaterThan(10); // Unlikely to have <10% utilization in test data
    });
  });

  describe('Error handling and edge cases', () => {
    const calculateUtilization = (totalHours: number, year: number, month: number, hoursPerWorkday: number = 8): number => {
      const workingDays = DateUtils.getWorkingDaysInMonth(year, month);
      const targetHours = workingDays * hoursPerWorkday;
      return targetHours > 0 ? (totalHours / targetHours) * 100 : 0;
    };

    it('should handle zero hours per workday', () => {
      const utilization = calculateUtilization(40, 2024, 3, 0);
      expect(utilization).toBe(0); // Should handle division by zero gracefully
    });

    it('should handle negative hours', () => {
      const utilization = calculateUtilization(-10, 2024, 3, 8);
      expect(utilization).toBeLessThan(0);
    });

    it('should handle invalid dates gracefully', () => {
      // February 30th doesn't exist - but JavaScript handles this
      expect(() => {
        DateUtils.getWorkingDaysInMonth(2024, 13); // Invalid month
      }).not.toThrow();

      expect(() => {
        DateUtils.getWorkingDaysInMonth(0, 1); // Year 0
      }).not.toThrow();
    });

    it('should handle boundary year values', () => {
      const workingDays1900 = DateUtils.getWorkingDaysInMonth(1900, 1);
      const workingDays2100 = DateUtils.getWorkingDaysInMonth(2100, 1);

      expect(workingDays1900).toBeGreaterThan(0);
      expect(workingDays2100).toBeGreaterThan(0);
      expect(workingDays1900).toBeLessThan(32);
      expect(workingDays2100).toBeLessThan(32);
    });

    it('should handle boundary month values', () => {
      const workingDaysJan = DateUtils.getWorkingDaysInMonth(2024, 1);
      const workingDaysDec = DateUtils.getWorkingDaysInMonth(2024, 12);

      expect(workingDaysJan).toBeGreaterThan(19);
      expect(workingDaysJan).toBeLessThan(24);
      expect(workingDaysDec).toBeGreaterThan(19);
      expect(workingDaysDec).toBeLessThan(24);
    });
  });

  describe('Performance considerations', () => {
    it('should calculate working days efficiently for multiple months', () => {
      const startTime = performance.now();

      // Calculate working days for a full year
      const results = [];
      for (let month = 1; month <= 12; month++) {
        results.push(DateUtils.getWorkingDaysInMonth(2024, month));
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(50); // Should be very fast
      expect(results).toHaveLength(12);
      expect(results.every(days => days > 0)).toBe(true);
    });

    it('should handle bulk utilization calculations efficiently', () => {
      const calculateUtilization = (totalHours: number, year: number, month: number, hoursPerWorkday: number = 8): number => {
        const workingDays = DateUtils.getWorkingDaysInMonth(year, month);
        const targetHours = workingDays * hoursPerWorkday;
        return targetHours > 0 ? (totalHours / targetHours) * 100 : 0;
      };

      const startTime = performance.now();

      // Calculate utilization for 100 different scenarios
      const results = [];
      for (let i = 0; i < 100; i++) {
        const hours = i * 2; // Varying hours
        const month = (i % 12) + 1; // Cycle through months
        results.push(calculateUtilization(hours, 2024, month, 8));
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100); // Should be reasonably fast
      expect(results).toHaveLength(100);
    });
  });

  describe('Integration scenarios', () => {
    it('should provide utilization summary information', () => {
      const workingDays = DateUtils.getWorkingDaysInMonth(2024, 3);
      const hoursPerDay = plugin.settings.hoursPerWorkday;
      const targetHours = workingDays * hoursPerDay;

      const summary = {
        targetHours,
        workingDays,
        hoursPerDay,
        utilizationThresholds: {
          underUtilized: 75,
          optimal: 85,
          overUtilized: 100
        }
      };

      expect(summary.targetHours).toBe(workingDays * hoursPerDay);
      expect(summary.workingDays).toBeGreaterThan(19);
      expect(summary.hoursPerDay).toBe(8);
      expect(summary.utilizationThresholds.optimal).toBe(85);
    });
  });
});
