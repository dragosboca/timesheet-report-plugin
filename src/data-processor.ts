import { TFile, TFolder, normalizePath, CachedMetadata } from 'obsidian';
import TimesheetReportPlugin from './main';

interface TimeEntry {
  date: Date;
  hours: number;
  rate: number;
  notes: string;
  project: string;
}

interface MonthData {
  label: string;
  year: number;
  month: number;
  hours: number;
  invoiced: number;
  rate: number;
  utilization: number;
  budgetHours?: number;        // Total budget for project (fixed-hour projects only)
  budgetUsed?: number;         // Hours consumed so far
  budgetRemaining?: number;    // Hours remaining
  budgetProgress?: number;     // Progress as percentage (0-1)
}

interface SummaryData {
  totalHours: number;
  totalInvoiced: number;
  utilization: number;
  budgetHours?: number;        // Total project budget
  budgetUsed?: number;         // Total hours used
  budgetRemaining?: number;    // Hours remaining
  budgetProgress?: number;     // Overall project progress (0-1)
}

interface ReportData {
  currentYear: number;
  yearSummary: SummaryData;
  allTimeSummary: SummaryData;
  monthlyData: MonthData[];
  trendData: {
    labels: string[];
    hours: number[];
    utilization: number[];
    invoiced: number[];
  };
}

export class DataProcessor {
  private plugin: TimesheetReportPlugin;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
  }

  async processTimesheetData(): Promise<ReportData> {
    try {
      // Get timesheet files from the specified folder
      const timesheetFolder = normalizePath(this.plugin.settings.timesheetFolder);

      if (this.plugin.settings.debugMode) {
        console.log('Processing timesheet data from folder:', timesheetFolder);
      }

      const timesheetFiles = await this.getTimesheetFiles(timesheetFolder);

      if (!timesheetFiles.length) {
        throw new Error(`No timesheet files found in folder: ${timesheetFolder}`);
      }

      if (this.plugin.settings.debugMode) {
        console.log(`Found ${timesheetFiles.length} timesheet files`);
      }

      // Extract time entries from files
      const allTimeEntries = await this.extractTimeEntries(timesheetFiles);

      if (this.plugin.settings.debugMode) {
        console.log(`Extracted ${allTimeEntries.length} time entries`);
      }

      // Group entries by month and year
      const entriesByMonth = this.groupEntriesByMonth(allTimeEntries);

      // Calculate monthly metrics
      const monthlyData = this.calculateMonthlyMetrics(entriesByMonth);

      // Sort data by year and month (most recent first)
      monthlyData.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

      // Calculate trend data for charting
      const trendData = this.extractTrendData(monthlyData);

      // Get current year
      const currentYear = new Date().getFullYear();

      // Calculate year summary (current year)
      const yearEntries = allTimeEntries.filter(entry => entry.date.getFullYear() === currentYear);
      const yearSummary = this.calculateSummary(yearEntries);

      // Calculate all-time summary
      const allTimeSummary = this.calculateSummary(allTimeEntries);

      return {
        currentYear,
        yearSummary,
        allTimeSummary,
        monthlyData,
        trendData
      };
    } catch (error) {
      console.error('Error processing timesheet data:', error);
      throw error;
    }
  }

  private async getTimesheetFiles(folderPath: string): Promise<TFile[]> {
    const files: TFile[] = [];
    const folder = this.plugin.app.vault.getAbstractFileByPath(folderPath);

    if (!folder) {
      if (this.plugin.settings.debugMode) {
        console.error(`Folder not found at path: "${folderPath}"`);

        // List all top-level folders to help diagnose issues
        const rootFolders = this.plugin.app.vault.getRoot().children
          .filter(file => file instanceof TFolder)
          .map(folder => folder.path);

        console.log("Available top-level folders:", rootFolders);
      }
      throw new Error(`Folder not found: ${folderPath}`);
    }

    // Get all children of the folder that are markdown files
    const allFiles = this.plugin.app.vault.getMarkdownFiles();

    if (this.plugin.settings.debugMode) {
      console.log(`Found ${allFiles.length} total markdown files in vault, checking for ones in ${folderPath}`);
    }

    for (const file of allFiles) {
      if (file.path.startsWith(folderPath + '/') && file.extension === 'md') {
        files.push(file);
        if (this.plugin.settings.debugMode) {
          console.log(`Found timesheet file: ${file.path}`);
        }
      }
    }

    if (this.plugin.settings.debugMode) {
      console.log(`Found ${files.length} markdown files in folder "${folderPath}"`);
      if (files.length > 0) {
        // Show examples of a few files
        const examples = files.slice(0, 3).map(f => f.basename);
        console.log(`Example files: ${examples.join(', ')}`);
      }
    }

    return files;
  }

  private async extractTimeEntries(files: TFile[]): Promise<TimeEntry[]> {
    const allEntries: TimeEntry[] = [];

    for (const file of files) {
      try {
        // Use Obsidian's metadata cache to get frontmatter
        const cache = this.plugin.app.metadataCache.getFileCache(file);
        const frontmatter = cache?.frontmatter;

        if (!frontmatter) {
          if (this.plugin.settings.debugMode) {
            console.warn(`No frontmatter found in file: ${file.path}`);
          }
          continue;
        }

        // Extract date using our helper method
        const date = this.extractDateFromFile(file, cache);

        if (!date || isNaN(date.getTime())) {
          if (this.plugin.settings.debugMode) {
            console.log(`File basename: "${file.basename}"`);
            console.log(`Frontmatter:`, frontmatter);
          }
          console.warn(`Could not extract date from file: ${file.path}`);
          continue;
        }

        // Only process entries marked as worked: true (default to true if not specified)
        const worked = frontmatter.worked !== false;

        if (worked) {
          let hours = 0;
          if (frontmatter.hours && typeof frontmatter.hours === 'number') {
            hours = frontmatter.hours;
          } else if (frontmatter.hours && typeof frontmatter.hours === 'string') {
            hours = parseFloat(frontmatter.hours);
          }

          let rate = 0;
          if (frontmatter['per-hour'] && typeof frontmatter['per-hour'] === 'number') {
            rate = frontmatter['per-hour'];
          } else if (frontmatter['per-hour'] && typeof frontmatter['per-hour'] === 'string') {
            rate = parseFloat(frontmatter['per-hour']);
          }

          // Extract project/client info
          let project = 'Unknown';
          if (frontmatter['work-order']) {
            project = String(frontmatter['work-order']).trim();
          } else if (frontmatter.client) {
            project = String(frontmatter.client).trim();
          }

          // Add the entry if we have hours and rate
          if (hours > 0) {
            allEntries.push({
              date,
              hours,
              rate,
              notes: '',
              project
            });

            if (this.plugin.settings.debugMode) {
              console.log(`Added entry for ${date.toISOString().split('T')[0]}: ${hours} hours at ${rate}/hour for ${project}`);
            }
          } else {
            // If no hours in frontmatter, check for default hours in settings
            if (this.plugin.settings.hoursPerWorkday && !frontmatter.hours) {
              hours = this.plugin.settings.hoursPerWorkday;

              // Add an entry with default hours if rate is specified
              if (rate > 0) {
                allEntries.push({
                  date,
                  hours,
                  rate,
                  notes: 'Default hours (from settings)',
                  project
                });

                if (this.plugin.settings.debugMode) {
                  console.log(`Added entry with default hours for ${date.toISOString().split('T')[0]}: ${hours} hours at ${rate}/hour for ${project}`);
                }
              } else {
                // Look for tables in the content if no rate in frontmatter either
                await this.extractTimeEntriesFromTables(file, date, rate, project, allEntries);
              }
            } else {
              // If no hours in frontmatter, look for tables in the content
              await this.extractTimeEntriesFromTables(file, date, rate, project, allEntries);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file.path}:`, error);
      }
    }

    return allEntries;
  }

  private async extractTimeEntriesFromTables(
    file: TFile,
    date: Date,
    defaultRate: number,
    project: string,
    allEntries: TimeEntry[]
  ): Promise<void> {
    try {
      // Read the file content
      const content = await this.plugin.app.vault.cachedRead(file);
      const lines = content.split('\n');

      let inTable = false;
      let tableHeaders: string[] = [];
      const tableRows: string[][] = [];

      // Skip frontmatter section
      let contentStartIndex = 0;
      if (lines[0]?.trim() === '---') {
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '---') {
            contentStartIndex = i + 1;
            break;
          }
        }
      }

      for (let i = contentStartIndex; i < lines.length; i++) {
        const line = lines[i].trim();

        // Table header line
        if (line.startsWith('|') && line.endsWith('|') && !inTable) {
          inTable = true;
          tableHeaders = line
            .split('|')
            .map(header => header.trim().toLowerCase())
            .filter(Boolean);
          continue;
        }

        // Table separator line, skip it
        if (inTable && line.startsWith('|') && line.includes('-')) {
          continue;
        }

        // Table data row
        if (inTable && line.startsWith('|') && line.endsWith('|')) {
          const rowData = line
            .split('|')
            .map(cell => cell.trim())
            .filter(Boolean);

          if (rowData.length > 0) {
            tableRows.push(rowData);
          }
          continue;
        }

        // End of table
        if (inTable && (!line.startsWith('|') || !line.endsWith('|'))) {
          inTable = false;
        }
      }

      // Process table rows into time entries
      for (const row of tableRows) {
        let hours = 0;
        let rate = defaultRate;
        let notes = '';

        for (let i = 0; i < Math.min(row.length, tableHeaders.length); i++) {
          const header = tableHeaders[i];
          const value = row[i];

          if (header.includes('hour')) {
            hours = parseFloat(value) || 0;
          } else if (header.includes('rate')) {
            // Remove currency symbol and parse
            rate = parseFloat(value.replace(/[^0-9.]/g, '')) || defaultRate;
          } else if (header.includes('note') || header.includes('description') || header.includes('task')) {
            notes = value;
          }
        }

        if (hours > 0) {
          allEntries.push({
            date,
            hours,
            rate,
            notes,
            project
          });
        }
      }
    } catch (error) {
      console.error(`Error extracting table data from file ${file.path}:`, error);
    }
  }

  private groupEntriesByMonth(entries: TimeEntry[]): Map<string, TimeEntry[]> {
    const entriesByMonth = new Map<string, TimeEntry[]>();

    for (const entry of entries) {
      const year = entry.date.getFullYear();
      const month = entry.date.getMonth() + 1; // 1-12
      const key = `${year}-${month.toString().padStart(2, '0')}`;

      if (!entriesByMonth.has(key)) {
        entriesByMonth.set(key, []);
      }

      entriesByMonth.get(key)?.push(entry);
    }

    return entriesByMonth;
  }

  private calculateMonthlyMetrics(entriesByMonth: Map<string, TimeEntry[]>): MonthData[] {
    const monthlyData: MonthData[] = [];
    const hoursPerWorkday = this.plugin.settings.hoursPerWorkday;
    const projectType = this.plugin.settings.project.type;
    const budgetHours = this.plugin.settings.project.budgetHours;

    // Sort keys by year and month (oldest first)
    const sortedKeys = Array.from(entriesByMonth.keys()).sort();

    for (let i = 0; i < sortedKeys.length; i++) {
      const key = sortedKeys[i];
      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);

      const entries = entriesByMonth.get(key);

      if (!entries) {
        continue;
      }

      // Calculate total hours and invoiced amount
      let totalHours = 0;
      let totalInvoiced = 0;

      for (const entry of entries) {
        totalHours += entry.hours;
        totalInvoiced += entry.hours * entry.rate;
      }

      // Calculate average rate
      const avgRate = totalHours > 0 ? totalInvoiced / totalHours : 0;

      // Calculate target hours based on working days in this month
      const targetHoursForMonth = this.calculateTargetHoursForMonth(year, month, hoursPerWorkday);

      // Calculate utilization (as a percentage of target hours)
      const utilization = totalHours / targetHoursForMonth;

      // Format month label (e.g., "Jan 2023")
      const date = new Date(year, month - 1, 1);
      const monthName = date.toLocaleString('en-US', { month: 'short' });
      const label = `${monthName} ${year}`;

      const monthEntry: MonthData = {
        label,
        year,
        month,
        hours: totalHours,
        invoiced: totalInvoiced,
        rate: avgRate,
        utilization
      };

      // Add budget tracking for fixed-hour and retainer projects
      if ((projectType === 'fixed-hours' || projectType === 'retainer') && budgetHours) {
        // Calculate cumulative hours used up to this month
        const cumulativeHours = this.getCumulativeHoursUpToMonth(entriesByMonth, year, month);

        monthEntry.budgetHours = budgetHours;
        monthEntry.budgetUsed = cumulativeHours;
        monthEntry.budgetRemaining = Math.max(0, budgetHours - cumulativeHours);
        monthEntry.budgetProgress = Math.min(1, cumulativeHours / budgetHours);
      }

      monthlyData.push(monthEntry);
    }

    return monthlyData;
  }

  /**
   * Calculate cumulative hours worked up to and including the specified month
   */
  private getCumulativeHoursUpToMonth(entriesByMonth: Map<string, TimeEntry[]>, targetYear: number, targetMonth: number): number {
    let cumulativeHours = 0;

    // Sort keys chronologically
    const sortedKeys = Array.from(entriesByMonth.keys()).sort();

    for (const key of sortedKeys) {
      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);

      // Only count months up to and including the target month
      if (year < targetYear || (year === targetYear && month <= targetMonth)) {
        const entries = entriesByMonth.get(key);
        if (entries) {
          cumulativeHours += entries.reduce((sum, entry) => sum + entry.hours, 0);
        }
      }
    }

    return cumulativeHours;
  }

  private extractTrendData(monthlyData: MonthData[]): {
    labels: string[];
    hours: number[];
    utilization: number[];
    invoiced: number[];
  } {
    // Make a copy and sort by date (oldest first)
    const sortedData = [...monthlyData].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    // Extract data for charts
    const labels = sortedData.map(item => item.label);
    const hours = sortedData.map(item => item.hours);
    const utilization = sortedData.map(item => item.utilization * 100); // Convert to percentage
    const invoiced = sortedData.map(item => item.invoiced);

    return {
      labels,
      hours,
      utilization,
      invoiced
    };
  }

  private calculateSummary(entries: TimeEntry[]): SummaryData {
    let totalHours = 0;
    let totalInvoiced = 0;

    for (const entry of entries) {
      totalHours += entry.hours;
      totalInvoiced += entry.hours * entry.rate;
    }

    // Group entries by month for utilization calculation
    const entriesByMonth = this.groupEntriesByMonth(entries);
    let totalUtilization = 0;
    const hoursPerWorkday = this.plugin.settings.hoursPerWorkday;

    // Get keys and sort them chronologically
    const sortedKeys = Array.from(entriesByMonth.keys()).sort();
    let countedMonths = 0;

    // Get current year and month for comparison
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    for (let i = 0; i < sortedKeys.length; i++) {
      const key = sortedKeys[i];

      // Skip first month and current month for utilization calculation
      if (i === 0 || key === currentYearMonth) {
        if (this.plugin.settings.debugMode) {
          console.log(`Skipping ${key} for utilization calculation (${i === 0 ? 'first month' : 'current month'})`);
        }
        continue;
      }

      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);

      // Calculate month hours
      let monthHours = 0;
      const monthEntries = entriesByMonth.get(key);
      if (!monthEntries) continue;
      for (const entry of monthEntries) {
        monthHours += entry.hours;
      }

      // Calculate target hours for this specific month
      const targetHoursForMonth = this.calculateTargetHoursForMonth(year, month, hoursPerWorkday);

      // Add to total utilization
      totalUtilization += monthHours / targetHoursForMonth;
      countedMonths++;
    }

    // Average utilization across months (excluding first and current)
    const avgUtilization = countedMonths > 0 ? totalUtilization / countedMonths : 0;

    const summary: SummaryData = {
      totalHours,
      totalInvoiced,
      utilization: avgUtilization
    };

    // Add budget information for fixed-hour and retainer projects
    const projectType = this.plugin.settings.project.type;
    const budgetHours = this.plugin.settings.project.budgetHours;

    if ((projectType === 'fixed-hours' || projectType === 'retainer') && budgetHours) {
      summary.budgetHours = budgetHours;
      summary.budgetUsed = totalHours;
      summary.budgetRemaining = Math.max(0, budgetHours - totalHours);
      summary.budgetProgress = Math.min(1, totalHours / budgetHours);
    }

    return summary;
  }

  /**
   * Calculates the number of working days (Monday-Friday) in a given month and year
   * @param year - The year
   * @param month - The month (1-12)
   * @returns The number of working days in the month
   */
  public getWorkingDaysInMonth(year: number, month: number): number {
    // Create a date for the first day of the month
    const startDate = new Date(year, month - 1, 1);

    // Create a date for the last day of the month
    const endDate = new Date(year, month, 0);

    let workingDays = 0;
    const currentDate = new Date(startDate);

    // Loop through each day of the month
    while (currentDate <= endDate) {
      // Check if the day is a weekday (Monday-Friday)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  /**
   * Makes the calculateTargetHoursForMonth method public so it can be called from the view
   */
  public calculateTargetHoursForMonth(year: number, month: number, hoursPerDay = 8): number {
    return this.getWorkingDaysInMonth(year, month) * hoursPerDay;
  }

  /**
   * Helper method to try extracting a date from different parts of a file
   * @param file - The file to extract date from
   * @param cache - File metadata cache
   * @returns Date object or null if date couldn't be extracted
   */
  public extractDateFromFile(file: TFile, cache: CachedMetadata | null): Date | null {
    let date: Date | null = null;

    // Method 1: Extract from frontmatter using metadata cache
    if (cache?.frontmatter?.date) {
      try {
        const dateValue = cache.frontmatter.date;

        // Handle different date formats
        if (dateValue instanceof Date) {
          date = dateValue;
        } else if (typeof dateValue === 'string') {
          // Try standard ISO format YYYY-MM-DD
          date = new Date(dateValue);

          // Check if the date is valid
          if (isNaN(date.getTime())) {
            // Try MM/DD/YYYY format if ISO format failed
            if (dateValue.includes('/')) {
              const [month, day, year] = dateValue.split('/').map(Number);
              date = new Date(year, month - 1, day);
            }
          }
        }

        if (date && !isNaN(date.getTime())) {
          if (this.plugin.settings.debugMode) {
            console.log(`Extracted date from frontmatter in ${file.basename}: ${date.toISOString().split('T')[0]}`);
          }
          return date;
        }
      } catch (error) {
        console.warn(`Failed to parse date from frontmatter in file ${file.path}`);
      }
    }

    // Method 2: Extract from filename with pattern YYYY-MM-DD
    const fileNameMatch = file.basename.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (fileNameMatch) {
      try {
        date = new Date(`${fileNameMatch[1]}-${fileNameMatch[2]}-${fileNameMatch[3]}`);

        if (this.plugin.settings.debugMode) {
          console.log(`Extracted date parts from filename ${file.basename}:`, {
            year: fileNameMatch[1],
            month: fileNameMatch[2],
            day: fileNameMatch[3],
            resultDate: date ? date.toISOString() : 'invalid date'
          });
        }

        // Return if valid
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch (error) {
        console.warn(`Error parsing date from filename ${file.basename}:`, error);
      }
    } else if (this.plugin.settings.debugMode) {
      console.log(`No date match found in filename: "${file.basename}"`);
    }

    // Method 3: Look for date in path segments
    const pathMatch = file.path.match(/\/(\d{4})-(\d{2})-(\d{2})/);
    if (pathMatch) {
      date = new Date(`${pathMatch[1]}-${pathMatch[2]}-${pathMatch[3]}`);

      if (!isNaN(date.getTime())) {
        if (this.plugin.settings.debugMode) {
          console.log(`Extracted date from path ${file.path}: ${date.toISOString().split('T')[0]}`);
        }
        return date;
      }
    }

    // If we got this far, no valid date was found
    return null;
  }
}
