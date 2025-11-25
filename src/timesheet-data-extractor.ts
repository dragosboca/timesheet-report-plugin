import { TFile, TFolder, normalizePath } from 'obsidian';
import TimesheetReportPlugin from './main';
import { DailyEntry, MonthData } from './types';

export class ObsidianTimesheetDataExtractor {
  private plugin: TimesheetReportPlugin;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
  }

  /**
   * Get timesheet data for the specified month using Obsidian's APIs
   */
  async getMonthlyData(year: number, month: number): Promise<DailyEntry[]> {
    const entries: DailyEntry[] = [];

    // Get all days in the month
    const daysInMonth = new Date(year, month, 0).getDate();

    // Get timesheet files for the month
    const timesheetFiles = await this.getTimesheetFiles();
    const monthlyFiles = new Map<string, TFile>();

    // Index files by date using proper date extraction
    for (const file of timesheetFiles) {
      const fileDate = await this.extractDateFromFile(file);

      if (fileDate && fileDate.getFullYear() === year && fileDate.getMonth() + 1 === month) {
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(fileDate.getDate()).padStart(2, '0')}`;
        monthlyFiles.set(dateKey, file);
      }
    }

    // Create entries for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const file = monthlyFiles.get(dateKey);
      let hours = 0;
      let taskDescription = '';

      if (file) {
        // Extract data from file using Obsidian's metadata cache
        const cache = this.plugin.app.metadataCache.getFileCache(file);
        const frontmatter = cache?.frontmatter;

        if (frontmatter) {
          const worked = frontmatter.worked !== false; // Default to true if not specified

          if (worked && frontmatter.hours) {
            hours = parseFloat(frontmatter.hours) || 0;

            // Extract task description from frontmatter and content
            taskDescription = await this.extractTaskDescription(file, frontmatter);
          }
        }
      }

      // Determine task description based on day type and hours
      if (this.isWeekend(date)) {
        taskDescription = 'N/A';
      } else if (hours === 0) {
        taskDescription = 'PTO';
      } else if (!taskDescription) {
        taskDescription = 'Work performed';
      }

      entries.push({
        date,
        hours,
        taskDescription
      });
    }

    return entries;
  }

  /**
   * Extract task description from frontmatter and file content
   */
  private async extractTaskDescription(file: TFile, frontmatter: Record<string, any>): Promise<string> {
    // Try to get from work-order first
    if (frontmatter['work-order']) {
      const workOrder = Array.isArray(frontmatter['work-order'])
        ? frontmatter['work-order'][0]
        : frontmatter['work-order'];
      if (workOrder && typeof workOrder === 'string') {
        return workOrder.trim();
      }
    }

    // Try to get from client
    if (frontmatter.client) {
      const client = Array.isArray(frontmatter.client)
        ? frontmatter.client[0]
        : frontmatter.client;
      if (client && typeof client === 'string') {
        return client.trim();
      }
    }

    // Try to get from project
    if (frontmatter.project) {
      const project = Array.isArray(frontmatter.project)
        ? frontmatter.project[0]
        : frontmatter.project;
      if (project && typeof project === 'string') {
        return project.trim();
      }
    }

    // Look for headings in the file content using Obsidian's cache
    const cache = this.plugin.app.metadataCache.getFileCache(file);
    if (cache?.headings) {
      for (const heading of cache.headings) {
        if (heading.level === 2 && !heading.heading.toLowerCase().includes('meeting')) {
          return heading.heading.trim();
        }
      }
    }

    return 'Work performed';
  }

  /**
   * Check if a date is a weekend (Saturday or Sunday)
   */
  private isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  }

  /**
   * Get all timesheet files from the configured folder
   */
  private async getTimesheetFiles(): Promise<TFile[]> {
    const timesheetFolderPath = normalizePath(this.plugin.settings.timesheetFolder);

    // Use Obsidian's folder API
    const folder = this.plugin.app.vault.getAbstractFileByPath(timesheetFolderPath);

    if (!(folder instanceof TFolder)) {
      this.plugin.debugLogger?.log(`Timesheet folder not found: ${timesheetFolderPath}`);
      return [];
    }

    const timesheetFiles: TFile[] = [];

    // Get all markdown files in the folder and subfolders recursively
    const getAllFilesRecursive = (currentFolder: TFolder): TFile[] => {
      const files: TFile[] = [];

      for (const child of currentFolder.children) {
        if (child instanceof TFile && child.extension === 'md') {
          files.push(child);
        } else if (child instanceof TFolder) {
          // Recursively get files from subfolders
          files.push(...getAllFilesRecursive(child));
        }
      }

      return files;
    };

    timesheetFiles.push(...getAllFilesRecursive(folder));

    return timesheetFiles;
  }

  /**
   * Extract date from file using frontmatter first, then fallback methods
   */
  private async extractDateFromFile(file: TFile): Promise<Date | null> {
    // First try to get date from frontmatter using metadata cache
    const cache = this.plugin.app.metadataCache.getFileCache(file);
    const frontmatter = cache?.frontmatter;

    if (frontmatter?.date) {
      const dateValue = frontmatter.date;

      // Handle different date formats
      if (dateValue instanceof Date) {
        return dateValue;
      } else if (typeof dateValue === 'string') {
        const parsed = new Date(dateValue);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    }

    // Try to extract from filename (YYYY-MM-DD format)
    const fileNameMatch = file.basename.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (fileNameMatch) {
      const [, year, month, day] = fileNameMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Try to extract from file path (folders like 2024/03/filename.md)
    const pathMatch = file.path.match(/(\d{4})\/(\d{2})\//);
    if (pathMatch) {
      const [, year, month] = pathMatch;
      // Try to get day from filename
      const dayMatch = file.basename.match(/(\d{1,2})/);
      if (dayMatch) {
        const day = parseInt(dayMatch[1]);
        const date = new Date(parseInt(year), parseInt(month) - 1, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    // Try alternative filename formats (DD-MM-YYYY, MM-DD-YYYY, etc.)
    const altFormats = [
      /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY or MM-DD-YYYY
      /(\d{4})(\d{2})(\d{2})/, // YYYYMMDD
      /(\d{2})(\d{2})(\d{4})/, // MMDDYYYY or DDMMYYYY
    ];

    for (const format of altFormats) {
      const match = file.basename.match(format);
      if (match) {
        const [, a, b, c] = match;

        // Try different interpretations
        const attempts = [
          new Date(parseInt(c), parseInt(b) - 1, parseInt(a)), // DD-MM-YYYY
          new Date(parseInt(c), parseInt(a) - 1, parseInt(b)), // MM-DD-YYYY
          new Date(parseInt(a), parseInt(b) - 1, parseInt(c)), // YYYY-MM-DD (for YYYYMMDD)
        ];

        for (const attempt of attempts) {
          if (!isNaN(attempt.getTime()) && attempt.getFullYear() > 2000) {
            return attempt;
          }
        }
      }
    }

    // If all else fails, try to use file creation time
    try {
      // Use the file's stat property which contains creation time
      if (file.stat) {
        return new Date(file.stat.ctime);
      }
    } catch (error) {
      this.plugin.debugLogger?.log(`Error getting file stats for ${file.path}:`, error);
    }

    this.plugin.debugLogger?.log(`Could not extract date from file: ${file.path}`);
    return null;
  }

  /**
   * Get available months/years from timesheet data
   */
  async getAvailableMonths(): Promise<MonthData[]> {
    const timesheetFiles = await this.getTimesheetFiles();
    const monthsSet = new Set<string>();

    for (const file of timesheetFiles) {
      try {
        const fileDate = await this.extractDateFromFile(file);

        if (fileDate && !isNaN(fileDate.getTime())) {
          const year = fileDate.getFullYear();
          const month = fileDate.getMonth() + 1;
          const key = `${year}-${String(month).padStart(2, '0')}`;
          monthsSet.add(key);
        }
      } catch (error) {
        this.plugin.debugLogger?.log(`Error processing file ${file.path}:`, error);
        // Skip files with errors
        continue;
      }
    }

    const months = Array.from(monthsSet).map(key => {
      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);

      const date = new Date(year, month - 1, 1);
      const monthName = date.toLocaleString('default', { month: 'long' });

      return {
        year,
        month,
        label: `${monthName} ${year}`
      };
    });

    // Sort by year and month (most recent first)
    months.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    return months;
  }
}
