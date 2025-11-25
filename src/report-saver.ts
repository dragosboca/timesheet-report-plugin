import { TFile, TFolder, normalizePath, App } from 'obsidian';
import TimesheetReportPlugin from './main';

export class ObsidianReportSaver {
  private plugin: TimesheetReportPlugin;
  private app: App;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
    this.app = plugin.app;
  }

  /**
   * Save the generated report to the configured output folder
   */
  async saveReport(year: number, month: number, content: string): Promise<TFile> {
    const outputFolderPath = normalizePath(this.plugin.settings.reportOutputFolder);

    // Ensure the output folder structure exists
    await this.ensureFolderExists(outputFolderPath);

    // Generate filename and full path
    const filename = this.generateReportFilename(year, month);
    const filepath = normalizePath(`${outputFolderPath}/${filename}`);

    try {
      // Check if file already exists
      const existingFile = this.app.vault.getAbstractFileByPath(filepath);

      if (existingFile instanceof TFile) {
        // Update existing file
        this.plugin.debugLogger?.log(`Updating existing report: ${filepath}`);
        await this.app.vault.modify(existingFile, content);
        return existingFile;
      } else {
        // Create new file
        this.plugin.debugLogger?.log(`Creating new report: ${filepath}`);
        const newFile = await this.app.vault.create(filepath, content);
        return newFile;
      }
    } catch (error) {
      this.plugin.debugLogger?.log('Error saving report:', error);
      throw new Error(`Failed to save report to ${filepath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Ensure that the folder structure exists, creating it if necessary
   */
  private async ensureFolderExists(folderPath: string): Promise<void> {
    const normalizedPath = normalizePath(folderPath);

    // Check if folder already exists
    const existingFolder = this.app.vault.getAbstractFileByPath(normalizedPath);

    if (existingFolder instanceof TFolder) {
      // Folder already exists
      return;
    } else if (existingFolder instanceof TFile) {
      // Path exists but is a file, not a folder
      throw new Error(`Path ${normalizedPath} exists but is not a folder`);
    }

    // Split path and create folders recursively
    const pathParts = normalizedPath.split('/').filter(part => part.length > 0);
    let currentPath = '';

    for (const part of pathParts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const normalizedCurrentPath = normalizePath(currentPath);

      const existing = this.app.vault.getAbstractFileByPath(normalizedCurrentPath);

      if (!existing) {
        try {
          await this.app.vault.createFolder(normalizedCurrentPath);
          this.plugin.debugLogger?.log(`Created folder: ${normalizedCurrentPath}`);
        } catch (error) {
          // Check if folder was created between our check and create attempt
          const recheckExisting = this.app.vault.getAbstractFileByPath(normalizedCurrentPath);
          if (!(recheckExisting instanceof TFolder)) {
            throw error;
          }
        }
      } else if (!(existing instanceof TFolder)) {
        throw new Error(`Path ${normalizedCurrentPath} exists but is not a folder`);
      }
    }
  }

  /**
   * Generate filename for the report based on settings and date
   */
  private generateReportFilename(year: number, month: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthName = monthNames[month - 1];
    const paddedMonth = String(month).padStart(2, '0');

    // Include project name in filename for better organization
    const projectName = this.plugin.settings.project.name
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .trim();

    return `${year}-${paddedMonth}-${monthName}-${projectName}-Report.md`;
  }

  /**
   * Get the full path where a report would be saved
   */
  getReportPath(year: number, month: number): string {
    const outputFolderPath = normalizePath(this.plugin.settings.reportOutputFolder);
    const filename = this.generateReportFilename(year, month);
    return normalizePath(`${outputFolderPath}/${filename}`);
  }

  /**
   * Check if a report already exists for the given month/year
   */
  async reportExists(year: number, month: number): Promise<boolean> {
    const filepath = this.getReportPath(year, month);
    const existingFile = this.app.vault.getAbstractFileByPath(filepath);
    return existingFile instanceof TFile;
  }

  /**
   * Get an existing report file if it exists
   */
  async getExistingReport(year: number, month: number): Promise<TFile | null> {
    const filepath = this.getReportPath(year, month);
    const existingFile = this.app.vault.getAbstractFileByPath(filepath);
    return existingFile instanceof TFile ? existingFile : null;
  }

  /**
   * Delete a report if it exists
   */
  async deleteReport(year: number, month: number): Promise<boolean> {
    const existingFile = await this.getExistingReport(year, month);

    if (existingFile) {
      try {
        await this.app.vault.delete(existingFile);
        this.plugin.debugLogger?.log(`Deleted report: ${existingFile.path}`);
        return true;
      } catch (error) {
        this.plugin.debugLogger?.log('Error deleting report:', error);
        throw new Error(`Failed to delete report: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return false;
  }

  /**
   * Get all existing reports in the output folder
   */
  async getAllReports(): Promise<TFile[]> {
    const outputFolderPath = normalizePath(this.plugin.settings.reportOutputFolder);
    const folder = this.app.vault.getAbstractFileByPath(outputFolderPath);

    if (!(folder instanceof TFolder)) {
      return [];
    }

    const reports: TFile[] = [];

    // Recursively get all markdown files that look like reports
    const getAllReportsRecursive = (currentFolder: TFolder): TFile[] => {
      const files: TFile[] = [];

      for (const child of currentFolder.children) {
        if (child instanceof TFile && child.extension === 'md') {
          // Only include files that contain "Report" in the name
          if (child.basename.toLowerCase().includes('report')) {
            files.push(child);
          }
        } else if (child instanceof TFolder) {
          files.push(...getAllReportsRecursive(child));
        }
      }

      return files;
    };

    reports.push(...getAllReportsRecursive(folder));

    // Sort by modification time (newest first)
    reports.sort((a, b) => b.stat.mtime - a.stat.mtime);

    return reports;
  }

  /**
   * Validate that the output folder path is valid and writable
   */
  async validateOutputFolder(): Promise<{ valid: boolean; error?: string }> {
    const outputFolderPath = normalizePath(this.plugin.settings.reportOutputFolder);

    try {
      // Try to ensure the folder exists
      await this.ensureFolderExists(outputFolderPath);

      // Test if we can create a temp file in the folder
      const testFilePath = `${outputFolderPath}/.temp-test-${Date.now()}.md`;
      const testFile = await this.app.vault.create(testFilePath, 'test');
      await this.app.vault.delete(testFile);

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Cannot access or create files in ${outputFolderPath}: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
