import { TFile, TFolder, normalizePath, App } from 'obsidian';
import TimesheetReportPlugin from '../main';
import { ProcessedData } from '../query/interpreter/executor';

export class TemplateManager {
  private plugin: TimesheetReportPlugin;
  private app: App;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
    this.app = plugin.app;
  }

  /**
   * Get all available templates from the configured template folder
   */
  async getAvailableTemplates(): Promise<TFile[]> {
    const templateFolderPath = normalizePath(this.plugin.settings.reportTemplateFolder);

    if (!templateFolderPath) {
      this.plugin.debugLogger?.log('No template folder configured');
      return [];
    }

    // Use Obsidian's folder API
    const templatesFolder = this.app.vault.getFolderByPath(templateFolderPath);

    if (!templatesFolder) {
      this.plugin.debugLogger?.log(`Template folder not found: ${templateFolderPath}`);
      return [];
    }

    const templates: TFile[] = [];

    // Recursively get all markdown files in the template folder
    const getAllTemplatesRecursive = (folder: TFolder): TFile[] => {
      const files: TFile[] = [];

      for (const child of folder.children) {
        if (child instanceof TFile && child.extension === 'md') {
          files.push(child);
        } else if (child instanceof TFolder) {
          // Recursively get templates from subfolders
          files.push(...getAllTemplatesRecursive(child));
        }
      }

      return files;
    };

    try {
      templates.push(...getAllTemplatesRecursive(templatesFolder));

      // Sort by name for consistent ordering
      templates.sort((a, b) => a.basename.localeCompare(b.basename));

      this.plugin.debugLogger?.log(`Found ${templates.length} template(s) in ${templateFolderPath}`);
      return templates;
    } catch (error) {
      this.plugin.debugLogger?.log(`Error scanning template folder: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Get template content, using default if none specified
   */
  async getTemplateContent(templatePath?: string): Promise<string> {
    // Use default template from settings if no path specified
    const finalTemplatePath = templatePath || this.plugin.settings.defaultReportTemplate;

    if (finalTemplatePath) {
      const normalizedPath = normalizePath(finalTemplatePath);
      const template = this.app.vault.getFileByPath(normalizedPath);

      if (template) {
        try {
          const content = await this.app.vault.cachedRead(template);
          this.plugin.debugLogger?.log(`Loaded template: ${finalTemplatePath}`);
          return content;
        } catch (error) {
          this.plugin.debugLogger?.log(`Error reading template ${finalTemplatePath}: ${error instanceof Error ? error.message : String(error)}`);
          // Fall back to default template
        }
      } else {
        this.plugin.debugLogger?.log(`Template not found: ${finalTemplatePath}`);
      }
    }

    // Return built-in default template
    this.plugin.debugLogger?.log('Using built-in default template');
    return this.getDefaultTemplate();
  }

  /**
   * Default template if no template is selected or found
   */
  private getDefaultTemplate(): string {
    const project = this.plugin.settings.project;

    return `# Monthly Timesheet Report - {{MONTH_YEAR}}

## Project Information
**Project:** ${project?.name || 'Unknown Project'}
**Project Type:** ${this.getProjectTypeDisplay()}
**Report Period:** {{REPORT_PERIOD}}

## Summary
This report covers the month of **{{REPORT_PERIOD}}**.

**Total Hours Worked:** {{MONTH_HOURS}}
${this.getProjectSpecificSummary()}

## Timesheet Details

{{TABLE_PLACEHOLDER}}

---
*Report generated on {{GENERATION_DATE}} using Obsidian Timesheet Report Plugin*`;
  }

  /**
   * Get display-friendly project type
   */
  private getProjectTypeDisplay(): string {
    const projectType = this.plugin.settings.project?.type;

    switch (projectType) {
      case 'hourly':
        return 'Hourly/Time & Materials';
      case 'fixed-hours':
        return 'Fixed Hour Budget';
      case 'retainer':
        return 'Retainer/Block Hours';
      default:
        return projectType || 'Standard';
    }
  }

  /**
   * Get project-specific summary information
   */
  private getProjectSpecificSummary(): string {
    const project = this.plugin.settings.project;

    if (!project) {
      return '';
    }

    let summary = '';

    if (project.type === 'fixed-hours' || project.type === 'retainer') {
      if (project.budgetHours && typeof project.budgetHours === 'number') {
        summary += `**Budget Hours:** ${project.budgetHours}\n`;
        summary += `**Remaining Hours:** {{REMAINING_HOURS}}\n`;
      }

      if (project.deadline) {
        summary += `**Project Deadline:** ${project.deadline}\n`;
      }
    }

    if (project.defaultRate && typeof project.defaultRate === 'number') {
      const currencySymbol = this.plugin.settings.currencySymbol || '$';
      summary += `**Standard Rate:** ${currencySymbol}${project.defaultRate}/hour\n`;
      summary += `**Total Value:** {{TOTAL_VALUE}}\n`;
    }

    return summary;
  }

  /**
   * Replace template placeholders with actual values
   */
  replaceTemplateValues(
    templateContent: string,
    table: string,
    totalHours: number,
    year: number,
    month: number
  ): string {
    if (!templateContent) {
      throw new Error('Template content is required');
    }

    if (typeof year !== 'number' || typeof month !== 'number') {
      throw new Error('Valid year and month are required');
    }

    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }

    let content = templateContent;

    // Calculate additional values
    const project = this.plugin.settings.project;
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthName = monthNames[month - 1];
    const reportPeriod = `${monthName} ${year}`;
    const now = new Date();

    // Basic replacements
    content = this.replaceAll(content, '{{TABLE_PLACEHOLDER}}', table || '');
    content = this.replaceAll(content, '{{MONTH_YEAR}}', reportPeriod);
    content = this.replaceAll(content, '{{MONTH_HOURS}}', this.formatNumber(totalHours));
    content = this.replaceAll(content, '{{REPORT_PERIOD}}', reportPeriod);
    content = this.replaceAll(content, '{{GENERATION_DATE}}', now.toLocaleDateString());

    // Project-specific replacements
    if (project?.budgetHours && typeof project.budgetHours === 'number') {
      const remainingHours = project.budgetHours - totalHours;
      content = this.replaceAll(content, '{{REMAINING_HOURS}}', this.formatNumber(remainingHours));
    } else {
      content = this.replaceAll(content, '{{REMAINING_HOURS}}', 'N/A');
    }

    if (project?.defaultRate && typeof project.defaultRate === 'number') {
      const totalValue = totalHours * project.defaultRate;
      const currencySymbol = this.plugin.settings.currencySymbol || '$';
      const formattedValue = `${currencySymbol}${this.formatNumber(totalValue)}`;
      content = this.replaceAll(content, '{{TOTAL_VALUE}}', formattedValue);
    } else {
      content = this.replaceAll(content, '{{TOTAL_VALUE}}', 'N/A');
    }

    // Additional useful placeholders
    content = this.replaceAll(content, '{{PROJECT_NAME}}', project?.name || 'Unknown Project');
    content = this.replaceAll(content, '{{PROJECT_TYPE}}', this.getProjectTypeDisplay());
    content = this.replaceAll(content, '{{CURRENCY}}', this.plugin.settings.currencySymbol || '$');

    // Date/time placeholders
    content = this.replaceAll(content, '{{CURRENT_YEAR}}', now.getFullYear().toString());
    content = this.replaceAll(content, '{{CURRENT_MONTH}}', (now.getMonth() + 1).toString());
    content = this.replaceAll(content, '{{CURRENT_DATE}}', now.toISOString().split('T')[0]);

    return content;
  }

  /**
   * Replace template placeholders for interval reports
   */
  replaceIntervalTemplateValues(
    templateContent: string,
    table: string,
    data: ProcessedData,
    reportName: string,
    startDate: string,
    endDate: string
  ): string {
    if (!templateContent) {
      throw new Error('Template content is required');
    }

    let content = templateContent;

    // Calculate additional values
    const project = this.plugin.settings.project;
    const now = new Date();

    // Basic replacements
    content = this.replaceAll(content, '{{TABLE_PLACEHOLDER}}', table || '');
    content = this.replaceAll(content, '{{REPORT_NAME}}', reportName);
    content = this.replaceAll(content, '{{START_DATE}}', startDate);
    content = this.replaceAll(content, '{{END_DATE}}', endDate);
    content = this.replaceAll(content, '{{REPORT_PERIOD}}', `${startDate} to ${endDate}`);
    content = this.replaceAll(content, '{{GENERATION_DATE}}', now.toLocaleDateString());

    // Summary data replacements
    const totalHours = data.summary?.totalHours || 0;
    const totalInvoiced = data.summary?.totalInvoiced || 0;
    const utilization = data.summary?.utilization || 0;
    const entryCount = data.entries?.length || 0;

    content = this.replaceAll(content, '{{TOTAL_HOURS}}', this.formatNumber(totalHours));
    content = this.replaceAll(content, '{{MONTH_HOURS}}', this.formatNumber(totalHours)); // Alias for compatibility
    content = this.replaceAll(content, '{{ENTRY_COUNT}}', entryCount.toString());
    content = this.replaceAll(content, '{{UTILIZATION}}', `${Math.round(utilization * 100)}%`);

    // Currency and value replacements
    const currencySymbol = this.plugin.settings.currencySymbol || '$';
    content = this.replaceAll(content, '{{CURRENCY}}', currencySymbol);
    content = this.replaceAll(content, '{{TOTAL_INVOICED}}', `${currencySymbol}${this.formatNumber(totalInvoiced)}`);
    content = this.replaceAll(content, '{{TOTAL_REVENUE}}', `${currencySymbol}${this.formatNumber(totalInvoiced)}`);
    content = this.replaceAll(content, '{{TOTAL_VALUE}}', `${currencySymbol}${this.formatNumber(totalInvoiced)}`);

    // Project-specific replacements
    if (project?.budgetHours && typeof project.budgetHours === 'number') {
      const remainingHours = project.budgetHours - totalHours;
      content = this.replaceAll(content, '{{REMAINING_HOURS}}', this.formatNumber(remainingHours));
      content = this.replaceAll(content, '{{BUDGET_HOURS}}', this.formatNumber(project.budgetHours));
    } else {
      content = this.replaceAll(content, '{{REMAINING_HOURS}}', 'N/A');
      content = this.replaceAll(content, '{{BUDGET_HOURS}}', 'N/A');
    }

    // Project information
    content = this.replaceAll(content, '{{PROJECT_NAME}}', project?.name || 'Unknown Project');
    content = this.replaceAll(content, '{{PROJECT_TYPE}}', this.getProjectTypeDisplay());

    // Date/time placeholders
    content = this.replaceAll(content, '{{CURRENT_YEAR}}', now.getFullYear().toString());
    content = this.replaceAll(content, '{{CURRENT_MONTH}}', (now.getMonth() + 1).toString());
    content = this.replaceAll(content, '{{CURRENT_DATE}}', now.toISOString().split('T')[0]);

    return content;
  }

  /**
   * Helper method to replace all occurrences of a placeholder
   */
  private replaceAll(text: string, placeholder: string, replacement: string): string {
    return text.split(placeholder).join(replacement);
  }

  /**
   * Format a number for display
   */
  private formatNumber(value: number): string {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0';
    }

    // Round to 2 decimal places and remove trailing zeros
    return Number(value.toFixed(2)).toString();
  }

  /**
   * Validate that a template path exists and is accessible
   */
  async validateTemplatePath(templatePath: string): Promise<boolean> {
    if (!templatePath) {
      return true; // Empty path is valid (uses default)
    }

    try {
      const normalizedPath = normalizePath(templatePath);
      const template = this.app.vault.getFileByPath(normalizedPath);

      if (!template) {
        return false;
      }

      // Try to read the file to ensure it's accessible
      await this.app.vault.cachedRead(template);
      return true;
    } catch (error) {
      this.plugin.debugLogger?.log(`Template validation failed for ${templatePath}: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Get template suggestions based on partial path
   */
  async getTemplateSuggestions(partialPath: string): Promise<TFile[]> {
    const allTemplates = await this.getAvailableTemplates();

    if (!partialPath) {
      return allTemplates;
    }

    const searchTerm = partialPath.toLowerCase();

    return allTemplates.filter(template => {
      const matchesPath = template.path.toLowerCase().includes(searchTerm);
      const matchesName = template.basename.toLowerCase().includes(searchTerm);

      return matchesPath || matchesName;
    });
  }

  /**
   * Create a new template file with sample content
   */
  async createSampleTemplate(templateName: string): Promise<TFile> {
    const templateFolderPath = normalizePath(this.plugin.settings.reportTemplateFolder);

    if (!templateFolderPath) {
      throw new Error('Template folder is not configured');
    }

    // Ensure template folder exists
    const templateFolder = this.app.vault.getFolderByPath(templateFolderPath);
    if (!templateFolder) {
      await this.app.vault.createFolder(templateFolderPath);
    }

    const sanitizedName = this.sanitizeFileName(templateName);
    const templatePath = normalizePath(`${templateFolderPath}/${sanitizedName}.md`);

    // Check if file already exists
    const existingFile = this.app.vault.getFileByPath(templatePath);
    if (existingFile) {
      throw new Error(`Template file already exists: ${templatePath}`);
    }

    const sampleContent = this.getSampleTemplateContent();

    try {
      const newFile = await this.app.vault.create(templatePath, sampleContent);
      this.plugin.debugLogger?.log(`Created sample template: ${templatePath}`);
      return newFile;
    } catch (error) {
      throw new Error(`Failed to create template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get sample template content for new templates
   */
  private getSampleTemplateContent(): string {
    return `# {{PROJECT_NAME}} - {{REPORT_NAME}}

## Project Details
- **Project:** {{PROJECT_NAME}}
- **Type:** {{PROJECT_TYPE}}
- **Period:** {{REPORT_PERIOD}}
- **Generated:** {{GENERATION_DATE}}

## Executive Summary
During the period from **{{START_DATE}}** to **{{END_DATE}}**, a total of **{{TOTAL_HOURS}} hours** were logged for this project.

- **Total Hours:** {{TOTAL_HOURS}}
- **Total Revenue:** {{TOTAL_REVENUE}}
- **Number of Entries:** {{ENTRY_COUNT}}
- **Utilization:** {{UTILIZATION}}

{{TOTAL_VALUE}}

## Time Breakdown

{{TABLE_PLACEHOLDER}}

## Budget Information
- **Budget Hours:** {{BUDGET_HOURS}}
- **Remaining Hours:** {{REMAINING_HOURS}}

## Notes
<!-- Add any additional notes or observations here -->

---
*This report was generated automatically on {{GENERATION_DATE}} using the Obsidian Timesheet Report Plugin.*

<!-- Available placeholders for custom templates:
- {{PROJECT_NAME}} - Name of the project
- {{PROJECT_TYPE}} - Type of project (Hourly, Fixed Hours, etc.)
- {{REPORT_NAME}} - Name of this report
- {{REPORT_PERIOD}} - Full period description (e.g., "2024-01-01 to 2024-01-31")
- {{START_DATE}} - Start date of the interval
- {{END_DATE}} - End date of the interval
- {{TOTAL_HOURS}} - Total hours worked in this period
- {{TOTAL_REVENUE}} - Total revenue/invoiced amount with currency
- {{TOTAL_VALUE}} - Same as TOTAL_REVENUE
- {{ENTRY_COUNT}} - Number of timesheet entries
- {{UTILIZATION}} - Utilization percentage
- {{BUDGET_HOURS}} - Total budget hours (if applicable)
- {{REMAINING_HOURS}} - Remaining budget hours (if applicable)
- {{CURRENCY}} - Currency symbol from settings
- {{GENERATION_DATE}} - Date the report was generated
- {{TABLE_PLACEHOLDER}} - Where the timesheet table will be inserted
-->`;
  }

  /**
   * Sanitize a filename to be safe for file system
   */
  private sanitizeFileName(name: string): string {
    return name
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single
      .replace(/^-|-$/g, '')    // Remove leading/trailing hyphens
      .toLowerCase()
      .trim();
  }

  /**
   * Get list of all available placeholder variables
   */
  getAvailablePlaceholders(): Array<{ name: string; description: string }> {
    return [
      { name: '{{PROJECT_NAME}}', description: 'Name of the project from settings' },
      { name: '{{PROJECT_TYPE}}', description: 'Type of project (e.g., Hourly, Fixed Hours)' },
      { name: '{{MONTH_YEAR}}', description: 'Month and year of the report (e.g., January 2024)' },
      { name: '{{REPORT_PERIOD}}', description: 'Report period (month/year or date range)' },
      { name: '{{REPORT_NAME}}', description: 'Name of the report' },
      { name: '{{START_DATE}}', description: 'Start date of the interval' },
      { name: '{{END_DATE}}', description: 'End date of the interval' },
      { name: '{{TOTAL_HOURS}}', description: 'Total hours worked' },
      { name: '{{MONTH_HOURS}}', description: 'Total hours worked (alias)' },
      { name: '{{ENTRY_COUNT}}', description: 'Number of timesheet entries' },
      { name: '{{UTILIZATION}}', description: 'Utilization percentage' },
      { name: '{{TOTAL_INVOICED}}', description: 'Total invoiced amount with currency' },
      { name: '{{TOTAL_REVENUE}}', description: 'Total revenue (alias for invoiced)' },
      { name: '{{TOTAL_VALUE}}', description: 'Total monetary value' },
      { name: '{{BUDGET_HOURS}}', description: 'Total budget hours (if applicable)' },
      { name: '{{REMAINING_HOURS}}', description: 'Remaining budget hours (if applicable)' },
      { name: '{{CURRENCY}}', description: 'Currency symbol from settings' },
      { name: '{{GENERATION_DATE}}', description: 'Date the report was generated' },
      { name: '{{CURRENT_YEAR}}', description: 'Current year' },
      { name: '{{CURRENT_MONTH}}', description: 'Current month number' },
      { name: '{{CURRENT_DATE}}', description: 'Current date in YYYY-MM-DD format' },
      { name: '{{TABLE_PLACEHOLDER}}', description: 'Where the timesheet table will be inserted' }
    ];
  }
}
