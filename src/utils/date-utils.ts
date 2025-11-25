import { TFile } from 'obsidian';

export class DateUtils {
  private static readonly MONTH_NAMES = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  /**
   * Extract date from file using multiple strategies
   */
  static async extractDateFromFile(file: TFile): Promise<Date | null> {
    // Try frontmatter first
    const frontmatterDate = this.extractDateFromFrontmatter(file);
    if (frontmatterDate) {
      return frontmatterDate;
    }

    // Try filename
    const filenameDate = this.extractDateFromFilename(file.name);
    if (filenameDate) {
      return filenameDate;
    }

    // Try file path
    const pathDate = this.extractDateFromPath(file.path);
    if (pathDate) {
      return pathDate;
    }

    return null;
  }

  /**
   * Extract date from frontmatter
   */
  private static extractDateFromFrontmatter(file: TFile): Date | null {
    try {
      // This would need access to metadata cache - will be injected by caller
      return null; // Placeholder - to be implemented by caller with cache access
    } catch {
      return null;
    }
  }

  /**
   * Extract date from filename using various patterns
   */
  static extractDateFromFilename(filename: string): Date | null {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Try YYYY-MM-DD format
    const isoMatch = nameWithoutExt.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1]);
      const month = parseInt(isoMatch[2]);
      const day = parseInt(isoMatch[3]);

      if (this.isValidDate(year, month, day)) {
        return new Date(year, month - 1, day);
      }
    }

    // Try DD-MM-YYYY format
    const ddmmyyyyMatch = nameWithoutExt.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1]);
      const month = parseInt(ddmmyyyyMatch[2]);
      const year = parseInt(ddmmyyyyMatch[3]);

      if (this.isValidDate(year, month, day)) {
        return new Date(year, month - 1, day);
      }
    }

    // Try MM-DD-YYYY format
    const mmddyyyyMatch = nameWithoutExt.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (mmddyyyyMatch) {
      const month = parseInt(mmddyyyyMatch[1]);
      const day = parseInt(mmddyyyyMatch[2]);
      const year = parseInt(mmddyyyyMatch[3]);

      if (this.isValidDate(year, month, day)) {
        return new Date(year, month - 1, day);
      }
    }

    // Try month name formats
    const monthNameMatch = nameWithoutExt.toLowerCase().match(
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s*(\d{4})/
    );
    if (monthNameMatch) {
      const monthName = monthNameMatch[1];
      const day = parseInt(monthNameMatch[2]);
      const year = parseInt(monthNameMatch[3]);
      const month = this.MONTH_NAMES.indexOf(monthName) + 1;

      if (this.isValidDate(year, month, day)) {
        return new Date(year, month - 1, day);
      }
    }

    return null;
  }

  /**
   * Extract date from file path
   */
  static extractDateFromPath(path: string): Date | null {
    // Try to extract from path structure like "2024/01/15-daily-note.md"
    const pathMatch = path.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (pathMatch) {
      const year = parseInt(pathMatch[1]);
      const month = parseInt(pathMatch[2]);
      const day = parseInt(pathMatch[3]);

      if (this.isValidDate(year, month, day)) {
        return new Date(year, month - 1, day);
      }
    }

    return null;
  }

  /**
   * Validate if date components form a valid date
   */
  private static isValidDate(year: number, month: number, day: number): boolean {
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;
  }

  /**
   * Get working days in a month (excluding weekends)
   */
  static getWorkingDaysInMonth(year: number, month: number): number {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Debug logging if enabled globally (we don't have direct access to plugin settings here)
    if (typeof console !== 'undefined' && console.log) {
      const isDebugContext = document.querySelector('.timesheet-report-container'); // Simple check if we're in debug context
      if (isDebugContext) {
        console.log(`[DateUtils] ${year}-${month.toString().padStart(2, '0')} working days: ${workingDays}`);
      }
    }

    return workingDays;
  }

  /**
   * Calculate target hours for a month based on working days and hours per day
   */
  static calculateTargetHoursForMonth(year: number, month: number, hoursPerWorkday: number): number {
    const workingDays = this.getWorkingDaysInMonth(year, month);
    return workingDays * hoursPerWorkday;
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Get month name
   */
  static getMonthName(month: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1] || 'Unknown';
  }

  /**
   * Check if a date is a weekend
   */
  static isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  }

  /**
   * Parse date string in various formats
   */
  static parseDate(dateString: string): Date | null {
    if (!dateString) return null;

    // Try ISO format first
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }

    // Try other common formats
    const formats = [
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,  // YYYY-MM-DD
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,  // DD-MM-YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/ // MM/DD/YYYY
    ];

    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        let year, month, day;

        if (format === formats[0]) { // YYYY-MM-DD
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        } else if (format === formats[1]) { // DD-MM-YYYY
          day = parseInt(match[1]);
          month = parseInt(match[2]);
          year = parseInt(match[3]);
        } else { // MM/DD/YYYY
          month = parseInt(match[1]);
          day = parseInt(match[2]);
          year = parseInt(match[3]);
        }

        if (this.isValidDate(year, month, day)) {
          return new Date(year, month - 1, day);
        }
      }
    }

    return null;
  }

  /**
   * Format date as ISO string (YYYY-MM-DD)
   */
  static formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get start and end of current month
   */
  static getCurrentMonthInterval(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  }

  /**
   * Get start and end of last month
   */
  static getLastMonthInterval(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start, end };
  }

  /**
   * Get start and end of current quarter
   */
  static getCurrentQuarterInterval(): { start: Date; end: Date } {
    const now = new Date();
    const quarterStart = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), quarterStart, 1);
    const end = new Date(now.getFullYear(), quarterStart + 3, 0);
    return { start, end };
  }

  /**
   * Get start and end of last quarter
   */
  static getLastQuarterInterval(): { start: Date; end: Date } {
    const now = new Date();
    const quarterStart = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), quarterStart - 3, 1);
    const end = new Date(now.getFullYear(), quarterStart, 0);
    return { start, end };
  }

  /**
   * Get start and end of current year
   */
  static getCurrentYearInterval(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return { start, end };
  }

  /**
   * Get date range for last N days
   */
  static getLastNDaysInterval(days: number): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    return { start, end: now };
  }

  /**
   * Validate date range
   */
  static isValidDateRange(startDate: string, endDate: string): boolean {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    if (!start || !end) return false;

    return start <= end;
  }

  /**
   * Get readable interval label
   */
  static getIntervalLabel(start: Date, end: Date): string {
    const startStr = this.formatDateISO(start);
    const endStr = this.formatDateISO(end);

    // Check if it's a single month
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${this.MONTH_NAMES[start.getMonth()].charAt(0).toUpperCase() + this.MONTH_NAMES[start.getMonth()].slice(1)} ${start.getFullYear()}`;
    }

    // Check if it's a single year
    if (start.getFullYear() === end.getFullYear() &&
      start.getMonth() === 0 && start.getDate() === 1 &&
      end.getMonth() === 11 && end.getDate() === 31) {
      return `${start.getFullYear()}`;
    }

    return `${startStr} to ${endStr}`;
  }
}
