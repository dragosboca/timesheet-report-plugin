import { DailyEntry } from './types';

export class ReportTableGenerator {
  /**
   * Generate the HTML table for the report
   */
  generateReportTable(entries: DailyEntry[]): string {
    if (!entries || entries.length === 0) {
      return `| Date | Hours | Task Description |
|------|-------|------------------|
| No timesheet data found | | |
`;
    }

    let table = `| Date | Hours | Task Description |
|------|-------|------------------|
`;

    for (const entry of entries) {
      try {
        const dateStr = this.formatDate(entry.date);
        const hoursStr = this.formatHours(entry.hours);
        const taskDescription = this.escapeMarkdown(entry.taskDescription || '');

        table += `| ${dateStr} | ${hoursStr} | ${taskDescription} |\n`;
      } catch (error) {
        console.warn('Error processing entry:', entry, error);
        // Continue processing other entries
      }
    }

    return table;
  }

  /**
   * Calculate total hours from daily entries
   */
  calculateTotalHours(entries: DailyEntry[]): number {
    if (!entries || entries.length === 0) {
      return 0;
    }

    return entries.reduce((sum, entry) => {
      const hours = typeof entry.hours === 'number' && !isNaN(entry.hours) ? entry.hours : 0;
      return sum + hours;
    }, 0);
  }

  /**
   * Format a date for display in the table
   */
  private formatDate(date: Date): string {
    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      // YYYY-MM-DD format (ISO date format)
      return date.toLocaleDateString('en-CA');
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return 'Invalid Date';
    }
  }

  /**
   * Format hours for display in the table
   */
  private formatHours(hours: number): string {
    if (typeof hours !== 'number' || isNaN(hours)) {
      return '';
    }

    if (hours === 0) {
      return '';
    }

    // Round to 2 decimal places and remove trailing zeros
    return Number(hours.toFixed(2)).toString();
  }

  /**
   * Escape markdown special characters in task descriptions
   */
  private escapeMarkdown(text: string): string {
    if (typeof text !== 'string') {
      return '';
    }

    // Escape pipe characters which would break the table
    return text
      .replace(/\|/g, '\\|')
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim();
  }

  /**
   * Get statistics about the timesheet data
   */
  getStatistics(entries: DailyEntry[]): {
    totalHours: number;
    totalDays: number;
    workingDays: number;
    averageHoursPerDay: number;
    averageHoursPerWorkingDay: number;
    highestSingleDay: number;
  } {
    if (!entries || entries.length === 0) {
      return {
        totalHours: 0,
        totalDays: 0,
        workingDays: 0,
        averageHoursPerDay: 0,
        averageHoursPerWorkingDay: 0,
        highestSingleDay: 0
      };
    }

    const totalHours = this.calculateTotalHours(entries);
    const totalDays = entries.length;
    const workingDays = entries.filter(entry => entry.hours > 0).length;
    const averageHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0;
    const averageHoursPerWorkingDay = workingDays > 0 ? totalHours / workingDays : 0;
    const highestSingleDay = entries.reduce((max, entry) => {
      const hours = typeof entry.hours === 'number' && !isNaN(entry.hours) ? entry.hours : 0;
      return Math.max(max, hours);
    }, 0);

    return {
      totalHours: Number(totalHours.toFixed(2)),
      totalDays,
      workingDays,
      averageHoursPerDay: Number(averageHoursPerDay.toFixed(2)),
      averageHoursPerWorkingDay: Number(averageHoursPerWorkingDay.toFixed(2)),
      highestSingleDay: Number(highestSingleDay.toFixed(2))
    };
  }

  /**
   * Generate a summary table with statistics
   */
  generateSummaryTable(entries: DailyEntry[]): string {
    const stats = this.getStatistics(entries);

    return `| Metric | Value |
|--------|-------|
| Total Hours | ${stats.totalHours} |
| Total Days | ${stats.totalDays} |
| Working Days | ${stats.workingDays} |
| Average Hours/Day | ${stats.averageHoursPerDay} |
| Average Hours/Working Day | ${stats.averageHoursPerWorkingDay} |
| Highest Single Day | ${stats.highestSingleDay} |
`;
  }

  /**
   * Validate entries before processing
   */
  validateEntries(entries: DailyEntry[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(entries)) {
      return { valid: false, errors: ['Entries must be an array'] };
    }

    entries.forEach((entry, index) => {
      if (!entry) {
        errors.push(`Entry at index ${index} is null or undefined`);
        return;
      }

      if (!(entry.date instanceof Date) || isNaN(entry.date.getTime())) {
        errors.push(`Entry at index ${index} has invalid date`);
      }

      if (typeof entry.hours !== 'number' || isNaN(entry.hours)) {
        errors.push(`Entry at index ${index} has invalid hours value`);
      }

      if (entry.hours < 0) {
        errors.push(`Entry at index ${index} has negative hours`);
      }

      if (typeof entry.taskDescription !== 'string') {
        errors.push(`Entry at index ${index} has invalid task description`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
