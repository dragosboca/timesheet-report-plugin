import { TFile, TFolder, normalizePath } from 'obsidian';
import TimesheetReportPlugin from '../main';
import { DateUtils } from '../utils/date-utils';
import { TimeEntry, QueryOptions, TimesheetDataSource } from './types';

export class VaultTimesheetDataSource implements TimesheetDataSource {
  private plugin: TimesheetReportPlugin;
  private cache = new Map<string, TimeEntry[]>();

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
  }

  async query(options: QueryOptions = {}): Promise<TimeEntry[]> {
    const cacheKey = this.generateCacheKey(options);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const timesheetFiles = await this.getTimesheetFiles();
    const allEntries: TimeEntry[] = [];

    for (const file of timesheetFiles) {
      const entries = await this.extractEntriesFromFile(file, options);
      allEntries.push(...entries);
    }

    const filteredEntries = this.applyFilters(allEntries, options);
    filteredEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

    this.cache.set(cacheKey, filteredEntries);

    return filteredEntries;
  }

  clearCache(): void {
    this.cache.clear();
  }

  private async getTimesheetFiles(): Promise<TFile[]> {
    const files: TFile[] = [];
    const timesheetFolder = this.plugin.settings.timesheetFolder || 'timesheets';

    try {
      const folder = this.plugin.app.vault.getAbstractFileByPath(normalizePath(timesheetFolder));

      if (folder instanceof TFolder) {
        await this.collectFilesFromFolder(folder, files);
      } else {
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

  private async collectFilesFromFolder(folder: TFolder, files: TFile[]): Promise<void> {
    for (const child of folder.children) {
      if (child instanceof TFile && child.extension === 'md') {
        files.push(child);
      } else if (child instanceof TFolder) {
        await this.collectFilesFromFolder(child, files);
      }
    }
  }

  private async extractEntriesFromFile(file: TFile, options: QueryOptions): Promise<TimeEntry[]> {
    const entries: TimeEntry[] = [];

    try {
      const fileDate = await this.extractDateFromFile(file);
      if (!fileDate) {
        if (this.plugin.settings.debugMode) {
          console.log(`[Timesheet] Skipping ${file.path} - no extractable date`);
        }
        return entries;
      }

      const cache = this.plugin.app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter;

      if (this.plugin.settings.debugMode) {
        console.log(`[Timesheet] Processing ${file.path}`, {
          date: fileDate.toISOString().split('T')[0],
          hasFrontmatter: !!frontmatter,
          frontmatter: frontmatter
        });
      }

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

  private async extractDateFromFile(file: TFile): Promise<Date | null> {
    const cache = this.plugin.app.metadataCache.getFileCache(file);
    const frontmatter = cache?.frontmatter;

    if (frontmatter?.date) {
      const date = DateUtils.parseDate(frontmatter.date);
      if (date) return date;
    }

    return DateUtils.extractDateFromFilename(file.name) ||
      DateUtils.extractDateFromPath(file.path);
  }

  private extractFromFrontmatter(file: TFile, date: Date, frontmatter: any): TimeEntry | null {
    const worked = frontmatter.worked !== false;
    if (!worked) {
      if (this.plugin.settings.debugMode) {
        console.log(`[Timesheet] Skipping ${file.path} - worked: false`);
      }
      return null;
    }

    let hours = 0;
    let rate: number | undefined;
    let project: string | undefined;

    if (typeof frontmatter.hours === 'number') {
      hours = frontmatter.hours;
    } else if (typeof frontmatter.duration === 'number') {
      hours = frontmatter.duration;
    } else if (typeof frontmatter.hours === 'string') {
      hours = parseFloat(frontmatter.hours) || 0;
    }

    if (typeof frontmatter['per-hour'] === 'number') {
      rate = frontmatter['per-hour'];
    } else if (typeof frontmatter['per-hour'] === 'string') {
      rate = parseFloat(frontmatter['per-hour']) || undefined;
    } else if (typeof frontmatter.rate === 'number') {
      rate = frontmatter.rate;
    } else if (typeof frontmatter.hourlyRate === 'number') {
      rate = frontmatter.hourlyRate;
    }

    if (!rate && this.plugin.settings.project.defaultRate) {
      rate = this.plugin.settings.project.defaultRate;
      if (this.plugin.settings.debugMode) {
        console.log(`[Timesheet] Using default rate: ${rate}`);
      }
    }

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

  private extractFromTables(file: TFile, content: string, fileDate: Date): TimeEntry[] {
    const entries: TimeEntry[] = [];
    const lines = content.split('\n');

    let inTable = false;
    let tableHeaders: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.includes('|') && !inTable) {
        tableHeaders = line.split('|').map(h => h.trim().toLowerCase()).filter(h => h);

        const hasTimeFields = tableHeaders.some(h =>
          h.includes('hour') || h.includes('time') || h.includes('duration')
        );

        if (hasTimeFields && lines[i + 1]?.includes('---')) {
          inTable = true;
          i++;
          continue;
        }
      }

      if (inTable && line.includes('|')) {
        if (line.includes('---')) {
          continue;
        }

        const rowData = line.split('|').map(cell => cell.trim()).filter(cell => cell);

        if (rowData.length >= tableHeaders.length) {
          const entry = this.parseTableRow(file, fileDate, tableHeaders, rowData);
          if (entry) {
            entries.push(entry);
          }
        }
      }

      if (inTable && (!line.includes('|') || line.trim() === '')) {
        inTable = false;
        tableHeaders = [];
      }
    }

    return entries;
  }

  private parseTableRow(file: TFile, date: Date, headers: string[], row: string[]): TimeEntry | null {
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
        rate = parseFloat(value.replace(/[€$£,\s]/g, '')) || undefined;
      } else if (header.includes('note') || header.includes('description') || header.includes('task')) {
        notes = value;
      } else if (header.includes('project') || header.includes('client') || header.includes('work-order')) {
        project = value;
      }
    }

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

  private applyFilters(entries: TimeEntry[], options: QueryOptions): TimeEntry[] {
    let filtered = entries;

    if (options.year !== undefined) {
      filtered = filtered.filter(entry => entry.date.getFullYear() === options.year);
    }

    if (options.month !== undefined) {
      filtered = filtered.filter(entry => entry.date.getMonth() === (options.month! - 1));
    }

    if (options.projectFilter) {
      filtered = filtered.filter(entry =>
        entry.project?.toLowerCase().includes(options.projectFilter!.toLowerCase())
      );
    }

    if (options.dateRange) {
      filtered = filtered.filter(entry =>
        entry.date >= options.dateRange!.start && entry.date <= options.dateRange!.end
      );
    }

    return filtered;
  }

  private generateCacheKey(options: QueryOptions): string {
    const parts = [
      options.year?.toString() || 'all',
      options.month?.toString() || 'all',
      options.projectFilter || 'all',
      options.dateRange ? `${options.dateRange.start.getTime()}-${options.dateRange.end.getTime()}` : 'all'
    ];
    return parts.join('|');
  }
}
