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
   * Save interval report with custom name
   */
  async saveIntervalReport(reportName: string, content: string): Promise<TFile> {
    const outputFolderPath = normalizePath(this.plugin.settings.reportOutputFolder);

    // Ensure the output folder structure exists
    await this.ensureFolderExists(outputFolderPath);

    // Generate filename and full path
    const filename = `${reportName}.md`;
    const filepath = normalizePath(`${outputFolderPath}/${filename}`);

    try {
      // Check if file already exists
      const existingFile = this.app.vault.getAbstractFileByPath(filepath);

      if (existingFile instanceof TFile) {
        // Update existing file
        await this.app.vault.modify(existingFile, content);
        return existingFile;
      } else {
        // Create new file
        return await this.app.vault.create(filepath, content);
      }
    } catch (error) {
      throw new Error(`Failed to save interval report: ${error.message}`);
    }
  }



  /**
   * Generate interval report path for checking existence
   */
  getIntervalReportPath(reportName: string): string {
    const outputFolderPath = normalizePath(this.plugin.settings.reportOutputFolder);
    const filename = `${reportName}.md`;
    return normalizePath(`${outputFolderPath}/${filename}`);
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
