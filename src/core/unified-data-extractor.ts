import { TFile, TFolder, normalizePath } from 'obsidian';
import TimesheetReportPlugin from '../main';
import { DateUtils } from '../utils/date-utils';
import { DailyEntry, MonthData } from '../types';

export interface ExtractedTimeEntry {
  date: Date;
  hours: number;
  rate?: number;
  project?: string;
  notes?: string;
  taskDescription?: string;
  file?: TFile;
}

export interface ExtractionOptions {
  year?: number;
  month?: number;
  projectFilter?: string;
  dateRange?: { start: Date; end: Date };
  includeMetadata?: boolean;
}

export class UnifiedDataExtractor {
  private plugin: TimesheetReportPlugin;
  private cache = new Map<string, ExtractedTimeEntry[]>();

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
  }

  /**
   * Get timesheet data with flexible filtering options
   */
  async getTimesheetData(options: ExtractionOptions = {}): Promise<ExtractedTimeEntry[]> {
    const cacheKey = this.generateCacheKey(options);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Get all timesheet files
    const timesheetFiles = await this.getTimesheetFiles();

    // Extract entries from all files
    const allEntries: ExtractedTimeEntry[] = [];

    for (const file of timesheetFiles) {
      const entries = await this.extractEntriesFromFile(file, options);
      allEntries.push(...entries);
    }

    // Apply filters
    const filteredEntries = this.applyFilters(allEntries, options);

    // Sort by date
    filteredEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Cache results
    this.cache.set(cacheKey, filteredEntries);

    return filteredEntries;
  }

  /**
   * Get monthly data for reports (legacy compatibility)
   */
  async getMonthlyData(year: number, month: number): Promise<DailyEntry[]> {
    const entries = await this.getTimesheetData({ year, month });

    // Convert to legacy DailyEntry format
    const dailyEntries: DailyEntry[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayEntries = entries.filter(entry =>
        entry.date.getFullYear() === year &&
        entry.date.getMonth() === month - 1 &&
        entry.date.getDate() === day
      );

      const totalHours = dayEntries.reduce((sum, entry) => sum + entry.hours, 0);
      const taskDescription = dayEntries
        .map(entry => entry.taskDescription || entry.notes || '')
        .filter(desc => desc.trim())
        .join('; ');

      dailyEntries.push({
        date,
        hours: totalHours,
        taskDescription
      });
    }

    return dailyEntries;
  }

  /**
   * Get all timesheet files from configured folders
   */
  private async getTimesheetFiles(): Promise<TFile[]> {
    const files: TFile[] = [];
    const timesheetFolder = this.plugin.settings.timesheetFolder || 'timesheets';

    try {
      const folder = this.plugin.app.vault.getAbstractFileByPath(normalizePath(timesheetFolder));

      if (folder instanceof TFolder) {
        await this.collectFilesFromFolder(folder, files);
      } else {
        // Fallback: search root folders for timesheet-like files
        const rootFolders = [
          'Daily Notes', 'daily', 'daily-notes', 'journal', 'timesheets'
        ];

        for (const folderName of rootFolders) {
          const rootFolder = this.plugin.app.vault.getAbstractFileByPath(folderName);
          if (rootFolder instanceof TFolder) {
            await this.collectFilesFromFolder(rootFolder, files);
          }
        }
      }
    } catch (error) {
      console.error('Error getting timesheet files:', error);
    }

    return files;
  }

  /**
   * Recursively collect files from folder
   */
  private async collectFilesFromFolder(folder: TFolder, files: TFile[]): Promise<void> {
    for (const child of folder.children) {
      if (child instanceof TFile && child.extension === 'md') {
        files.push(child);
      } else if (child instanceof TFolder) {
        await this.collectFilesFromFolder(child, files);
      }
    }
  }

  /**
   * Extract timesheet entries from a single file
   */
  private async extractEntriesFromFile(file: TFile, options: ExtractionOptions): Promise<ExtractedTimeEntry[]> {
    const entries: ExtractedTimeEntry[] = [];

    try {
      // Extract date from file
      const fileDate = await this.extractDateFromFile(file);
      if (!fileDate) {
        if (this.plugin.settings.debugMode) {
          console.log(`[Timesheet] Skipping ${file.path} - no extractable date`);
        }
        return entries; // Skip files without extractable dates
      }

      // Get file metadata
      const cache = this.plugin.app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter;

      if (this.plugin.settings.debugMode) {
        console.log(`[Timesheet] Processing ${file.path}`, {
          date: fileDate.toISOString().split('T')[0],
          hasFrontmatter: !!frontmatter,
          frontmatter: frontmatter
        });
      }

      // Extract from frontmatter
      if (frontmatter) {
        const frontmatterEntry = this.extractFromFrontmatter(file, fileDate, frontmatter);
        if (frontmatterEntry) {
          entries.push(frontmatterEntry);
          if (this.plugin.settings.debugMode) {
            console.log(`[Timesheet] Extracted from frontmatter:`, frontmatterEntry);
          }
        } else if (this.plugin.settings.debugMode) {
          console.log(`[Timesheet] No valid frontmatter entry found`);
        }
      }

      // Extract from tables in content
      const content = await this.plugin.app.vault.read(file);
      const tableEntries = this.extractFromTables(file, content, fileDate);
      if (tableEntries.length > 0) {
        entries.push(...tableEntries);
        if (this.plugin.settings.debugMode) {
          console.log(`[Timesheet] Extracted ${tableEntries.length} entries from tables`);
        }
      }

    } catch (error) {
      console.warn(`Error processing file ${file.path}:`, error);
    }

    return entries;
  }

  /**
   * Extract date from file using DateUtils
   */
  private async extractDateFromFile(file: TFile): Promise<Date | null> {
    // Try frontmatter first
    const cache = this.plugin.app.metadataCache.getFileCache(file);
    const frontmatter = cache?.frontmatter;

    if (frontmatter?.date) {
      const date = DateUtils.parseDate(frontmatter.date);
      if (date) return date;
    }

    // Try filename and path
    return DateUtils.extractDateFromFilename(file.name) ||
      DateUtils.extractDateFromPath(file.path);
  }

  /**
   * Extract timesheet data from frontmatter
   */
  private extractFromFrontmatter(file: TFile, date: Date, frontmatter: any): ExtractedTimeEntry | null {
    const worked = frontmatter.worked !== false; // Default to true
    if (!worked) {
      if (this.plugin.settings.debugMode) {
        console.log(`[Timesheet] Skipping ${file.path} - worked: false`);
      }
      return null;
    }

    let hours = 0;
    let rate: number | undefined;
    let project: string | undefined;

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

    // Fall back to default rate from settings if no rate specified
    if (!rate && this.plugin.settings.project.defaultRate) {
      rate = this.plugin.settings.project.defaultRate;
      if (this.plugin.settings.debugMode) {
        console.log(`[Timesheet] Using default rate: ${rate}`);
      }
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

    if (this.plugin.settings.debugMode) {
      console.log(`[Timesheet] Extracted from ${file.path}:`, {
        hours,
        rate,
        project,
        notes: notes.substring(0, 50) + (notes.length > 50 ? '...' : '')
      });
    }

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

    if (this.plugin.settings.debugMode) {
      console.log(`[Timesheet] No valid hours found in ${file.path} (hours: ${hours})`);
    }

    return null;
  }

  /**
   * Extract timesheet data from markdown tables
   */
  private extractFromTables(file: TFile, content: string, fileDate: Date): ExtractedTimeEntry[] {
    const entries: ExtractedTimeEntry[] = [];
    const lines = content.split('\n');

    let inTable = false;
    let tableHeaders: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect table start
      if (line.includes('|') && !inTable) {
        tableHeaders = line.split('|').map(h => h.trim().toLowerCase()).filter(h => h);

        // Check if this looks like a timesheet table
        const hasTimeFields = tableHeaders.some(h =>
          h.includes('hour') || h.includes('time') || h.includes('duration')
        );

        if (hasTimeFields && lines[i + 1]?.includes('---')) {
          inTable = true;
          i++; // Skip separator line
          continue;
        }
      }

      // Process table row
      if (inTable && line.includes('|')) {
        if (line.includes('---')) {
          continue; // Skip separator lines
        }

        const rowData = line.split('|').map(cell => cell.trim()).filter(cell => cell);

        if (rowData.length >= tableHeaders.length) {
          const entry = this.parseTableRow(file, fileDate, tableHeaders, rowData);
          if (entry) {
            entries.push(entry);
          }
        }
      }

      // End of table
      if (inTable && (!line.includes('|') || line.trim() === '')) {
        inTable = false;
        tableHeaders = [];
      }
    }

    return entries;
  }

  /**
   * Parse a single table row into a timesheet entry
   */
  private parseTableRow(file: TFile, date: Date, headers: string[], row: string[]): ExtractedTimeEntry | null {
    let hours = 0;
    let rate: number | undefined;
    let notes = '';
    let project: string | undefined;

    for (let i = 0; i < Math.min(row.length, headers.length); i++) {
      const header = headers[i];
      const value = row[i];

      if (header.includes('hour') || header.includes('time') || header.includes('duration')) {
        hours = parseFloat(value) || 0;
      } else if (header.includes('rate') || header.includes('per-hour')) {
        // Remove currency symbols and parse
        rate = parseFloat(value.replace(/[€$£,\s]/g, '')) || undefined;
      } else if (header.includes('note') || header.includes('description') || header.includes('task')) {
        notes = value;
      } else if (header.includes('project') || header.includes('client') || header.includes('work-order')) {
        project = value;
      }
    }

    // Fall back to default rate from settings if no rate in table
    if (!rate && this.plugin.settings.project?.defaultRate) {
      rate = this.plugin.settings.project.defaultRate;
      if (this.plugin.settings.debugMode) {
        console.log(`[Timesheet] Using default rate for table entry: ${rate}`);
      }
    }

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

  /**
   * Apply filters to extracted entries
   */
  private applyFilters(entries: ExtractedTimeEntry[], options: ExtractionOptions): ExtractedTimeEntry[] {
    let filtered = entries;

    // Year filter
    if (options.year !== undefined) {
      filtered = filtered.filter(entry => entry.date.getFullYear() === options.year);
    }

    // Month filter
    if (options.month !== undefined) {
      filtered = filtered.filter(entry => entry.date.getMonth() === (options.month! - 1));
    }

    // Project filter
    if (options.projectFilter) {
      filtered = filtered.filter(entry =>
        entry.project?.toLowerCase().includes(options.projectFilter!.toLowerCase())
      );
    }

    // Date range filter
    if (options.dateRange) {
      filtered = filtered.filter(entry =>
        entry.date >= options.dateRange!.start && entry.date <= options.dateRange!.end
      );
    }

    return filtered;
  }

  /**
   * Generate cache key for options
   */
  private generateCacheKey(options: ExtractionOptions): string {
    const parts = [
      options.year?.toString() || 'all',
      options.month?.toString() || 'all',
      options.projectFilter || 'all',
      options.dateRange ? `${options.dateRange.start.getTime()}-${options.dateRange.end.getTime()}` : 'all'
    ];
    return parts.join('|');
  }

  /**
   * Get available months/years from timesheet data (for backward compatibility)
   */
  async getAvailableMonths(): Promise<MonthData[]> {
    const entries = await this.getTimesheetData({});
    const monthMap = new Map<string, { year: number; month: number; entries: ExtractedTimeEntry[] }>();

    // Group entries by month
    for (const entry of entries) {
      const year = entry.date.getFullYear();
      const month = entry.date.getMonth() + 1;
      const key = `${year}-${month.toString().padStart(2, '0')}`;

      if (!monthMap.has(key)) {
        monthMap.set(key, { year, month, entries: [] });
      }
      monthMap.get(key)!.entries.push(entry);
    }

    // Convert to MonthData format
    const monthlyData: MonthData[] = [];
    for (const [key, monthData] of monthMap.entries()) {
      const totalHours = monthData.entries.reduce((sum, entry) => sum + entry.hours, 0);
      const totalInvoiced = monthData.entries.reduce((sum, entry) => sum + (entry.hours * (entry.rate || 0)), 0);
      const avgRate = totalHours > 0 ? totalInvoiced / totalHours : 0;

      monthlyData.push({
        year: monthData.year,
        month: monthData.month,
        label: `${DateUtils.getMonthName(monthData.month)} ${monthData.year}`,
        hours: totalHours,
        invoiced: totalInvoiced,
        utilization: 0, // Will be calculated by caller if needed
        rate: avgRate
      } as any);
    }

    return monthlyData.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
