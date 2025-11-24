import { TFile, TFolder, normalizePath } from 'obsidian';
import TimesheetReportPlugin from './main';
import { DataProcessor } from './data-processor';

interface DailyEntry {
  date: Date;
  hours: number;
  taskDescription: string;
}

export class ReportGenerator {
  private plugin: TimesheetReportPlugin;
  private dataProcessor: DataProcessor;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
    this.dataProcessor = new DataProcessor(plugin);
  }

  /**
   * Generate a monthly report for the specified year and month
   */
  async generateMonthlyReport(year: number, month: number, templatePath?: string): Promise<void> {
    try {
      const templateContent = await this.getTemplateContent(templatePath);
      const monthlyData = await this.getMonthlyData(year, month);
      const reportTable = this.generateReportTable(monthlyData);

      const finalContent = this.replaceTemplateValues(templateContent, reportTable, monthlyData, year, month);

      await this.saveReport(year, month, finalContent);
    } catch (error) {
      console.error('Error generating monthly report:', error);
      throw error;
    }
  }

  /**
   * Get all available templates from the Templates folder
   */
  async getAvailableTemplates(): Promise<TFile[]> {
    const templatesFolder = this.plugin.app.vault.getAbstractFileByPath('Templates');

    if (!templatesFolder || !(templatesFolder instanceof TFolder)) {
      return [];
    }

    const allFiles = this.plugin.app.vault.getMarkdownFiles();
    return allFiles.filter(file => file.path.startsWith('Templates/'));
  }

  /**
   * Get template content, using default if none specified
   */
  private async getTemplateContent(templatePath?: string): Promise<string> {
    let template: TFile | null = null;

    if (templatePath) {
      template = this.plugin.app.vault.getAbstractFileByPath(templatePath) as TFile;
    }

    // If no template specified or not found, use a default template
    if (!template) {
      return this.getDefaultTemplate();
    }

    return await this.plugin.app.vault.read(template);
  }

  /**
   * Default template if no template is selected
   */
  private getDefaultTemplate(): string {
    return `# Monthly Timesheet Report - {{MONTH_YEAR}}

## Summary
This report covers the month of **{{REPORT_PERIOD}}**.

**Total Hours Worked:** {{MONTH_HOURS}}

## Timesheet Details

{{TABLE_PLACEHOLDER}}

---
*Report generated on {{GENERATION_DATE}}*`;
  }

  /**
   * Get timesheet data for the specified month
   */
  private async getMonthlyData(year: number, month: number): Promise<DailyEntry[]> {
    const entries: DailyEntry[] = [];

    // Get all days in the month
    const daysInMonth = new Date(year, month, 0).getDate();

    // Get timesheet files for the month
    const timesheetFiles = await this.getTimesheetFiles();
    const monthlyFiles = new Map<string, TFile>();

    // Index files by date
    for (const file of timesheetFiles) {
      const content = await this.plugin.app.vault.read(file);
      const yamlSection = this.extractYAMLSection(content);
      const fileDate = this.dataProcessor.extractDateFromFile(file, yamlSection);

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
        // Extract data from file
        const content = await this.plugin.app.vault.read(file);
        const yamlSection = this.extractYAMLSection(content);
        const hoursMatch = yamlSection.match(/hours:\s*(\d+(\.\d+)?)/);
        const workedMatch = yamlSection.match(/worked:\s*(true|false)/i);

        const worked = workedMatch ? workedMatch[1].toLowerCase() === 'true' : true;

        if (worked && hoursMatch) {
          hours = parseFloat(hoursMatch[1]);

          // Extract task description from work orders or content
          taskDescription = this.extractTaskDescription(content, yamlSection);
        }
      }

      // Determine task description based on day type and hours
      if (this.isWeekend(date)) {
        taskDescription = 'N/A';
      } else if (hours === 0) {
        taskDescription = 'PTO';
      } else if (!taskDescription) {
        // Try to extract from work orders or use a default
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
   * Extract YAML frontmatter section from content
   */
  private extractYAMLSection(content: string): string {
    const lines = content.split('\n');
    let yamlSection = '';
    let inYaml = false;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        if (!inYaml) {
          inYaml = true;
        } else {
          break;
        }
      } else if (inYaml) {
        yamlSection += lines[i] + '\n';
      }
    }

    return yamlSection;
  }

  /**
   * Extract task description from file content
   */
  private extractTaskDescription(content: string, yamlSection: string): string {
    // Try to get from work-order first
    const workOrderMatch = yamlSection.match(/work-order:(?:\s*-\s*|\s*)([^\n]+)/);
    if (workOrderMatch && workOrderMatch[1]) {
      return workOrderMatch[1].trim();
    }

    // Try to get from client
    const clientMatch = yamlSection.match(/client:(?:\s*-\s*|\s*)([^\n]+)/);
    if (clientMatch && clientMatch[1]) {
      return clientMatch[1].trim();
    }

    // Look for work order headings in the content
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('## ') && !line.toLowerCase().includes('meeting')) {
        return line.replace('## ', '').trim();
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
   * Get all timesheet files
   */
  private async getTimesheetFiles(): Promise<TFile[]> {
    const timesheetFolder = normalizePath(this.plugin.settings.timesheetFolder);
    const allFiles = this.plugin.app.vault.getMarkdownFiles();

    return allFiles.filter(file =>
      file.path.startsWith(timesheetFolder + '/') &&
      file.extension === 'md'
    );
  }

  /**
   * Generate the HTML table for the report
   */
  private generateReportTable(entries: DailyEntry[]): string {
    let table = `| Date | Hours | Task Description |
|------|-------|------------------|
`;

    for (const entry of entries) {
      const dateStr = entry.date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      const hoursStr = entry.hours > 0 ? entry.hours.toString() : '';

      table += `| ${dateStr} | ${hoursStr} | ${entry.taskDescription} |\n`;
    }

    return table;
  }

  /**
   * Replace template placeholders with actual values
   */
  private replaceTemplateValues(
    templateContent: string,
    table: string,
    monthlyData: DailyEntry[],
    year: number,
    month: number
  ): string {
    let content = templateContent;

    // Calculate total hours for the month
    const totalHours = monthlyData.reduce((sum, entry) => sum + entry.hours, 0);

    // Format report period
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[month - 1];
    const reportPeriod = `${monthName} ${year}`;

    // Replace {{TABLE_PLACEHOLDER}} with the table
    content = content.replace(/{{TABLE_PLACEHOLDER}}/g, table);

    // Replace all placeholders
    const now = new Date();

    content = content.replace(/{{MONTH_YEAR}}/g, reportPeriod);
    content = content.replace(/{{MONTH_HOURS}}/g, totalHours.toString());
    content = content.replace(/{{REPORT_PERIOD}}/g, reportPeriod);
    content = content.replace(/{{GENERATION_DATE}}/g, now.toLocaleDateString());

    return content;
  }

  /**
   * Save the generated report to the Reports/Timesheet folder
   */
  private async saveReport(year: number, month: number, content: string): Promise<void> {
    // Ensure the Reports/Timesheet folder exists
    const reportsPath = 'Reports';
    const timesheetReportsPath = 'Reports/Timesheet';

    try {
      // Check if Reports folder exists, create if it doesn't
      const reportsFolder = this.plugin.app.vault.getAbstractFileByPath(reportsPath);
      if (!reportsFolder) {
        await this.plugin.app.vault.createFolder(reportsPath);
      }

      // Check if Reports/Timesheet folder exists, create if it doesn't
      const timesheetReportsFolder = this.plugin.app.vault.getAbstractFileByPath(timesheetReportsPath);
      if (!timesheetReportsFolder) {
        await this.plugin.app.vault.createFolder(timesheetReportsPath);
      }

      // Generate filename
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const monthName = monthNames[month - 1];
      const filename = `${year}-${String(month).padStart(2, '0')}-${monthName}-Timesheet-Report.md`;
      const filepath = `${timesheetReportsPath}/${filename}`;

      // Replace month/year placeholders in content
      const finalContent = content.replace(/{{MONTH_YEAR}}/g, `${monthName} ${year}`);

      // Check if file already exists
      const existingFile = this.plugin.app.vault.getAbstractFileByPath(filepath);

      if (existingFile instanceof TFile) {
        // Update existing file
        await this.plugin.app.vault.modify(existingFile, finalContent);
      } else {
        // Create new file
        await this.plugin.app.vault.create(filepath, finalContent);
      }

    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  }

  /**
   * Get available months/years from timesheet data
   */
  async getAvailableMonths(): Promise<{ year: number, month: number, label: string }[]> {
    const timesheetFiles = await this.getTimesheetFiles();
    const monthsSet = new Set<string>();

    for (const file of timesheetFiles) {
      try {
        const content = await this.plugin.app.vault.read(file);
        const yamlSection = this.extractYAMLSection(content);
        const fileDate = this.dataProcessor.extractDateFromFile(file, yamlSection);

        if (fileDate && !isNaN(fileDate.getTime())) {
          const year = fileDate.getFullYear();
          const month = fileDate.getMonth() + 1;
          const key = `${year}-${String(month).padStart(2, '0')}`;
          monthsSet.add(key);
        }
      } catch (error) {
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
