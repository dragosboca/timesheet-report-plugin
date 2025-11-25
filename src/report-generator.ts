import { TFile, App, Notice } from 'obsidian';
import TimesheetReportPlugin from './main';
import { ObsidianTemplateManager } from './template-manager';
import { ObsidianTimesheetDataExtractor } from './timesheet-data-extractor';
import { ObsidianReportSaver } from './report-saver';
import { ReportTableGenerator } from './report-table-generator';
import { MonthData } from './types';

export class ReportGenerator {
  private plugin: TimesheetReportPlugin;
  private app: App;
  private templateManager: ObsidianTemplateManager;
  private dataExtractor: ObsidianTimesheetDataExtractor;
  private reportSaver: ObsidianReportSaver;
  private tableGenerator: ReportTableGenerator;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
    this.app = plugin.app;
    this.templateManager = new ObsidianTemplateManager(plugin);
    this.dataExtractor = new ObsidianTimesheetDataExtractor(plugin);
    this.reportSaver = new ObsidianReportSaver(plugin);
    this.tableGenerator = new ReportTableGenerator();
  }

  /**
   * Generate a monthly report for the specified year and month
   */
  async generateMonthlyReport(year: number, month: number, templatePath?: string): Promise<TFile> {
    try {
      this.plugin.debugLogger?.log(`Generating monthly report for ${month}/${year}`);

      // Validate inputs
      this.validateReportInputs(year, month);

      // Validate output folder
      const folderValidation = await this.reportSaver.validateOutputFolder();
      if (!folderValidation.valid) {
        throw new Error(`Output folder validation failed: ${folderValidation.error}`);
      }

      // Get template content
      this.plugin.debugLogger?.log(`Loading template: ${templatePath || 'default'}`);
      const templateContent = await this.templateManager.getTemplateContent(templatePath);

      if (!templateContent || templateContent.trim().length === 0) {
        throw new Error('Template content is empty or could not be loaded');
      }

      // Extract monthly data
      this.plugin.debugLogger?.log('Extracting timesheet data...');
      const monthlyData = await this.dataExtractor.getMonthlyData(year, month);

      // Validate extracted data
      const validation = this.tableGenerator.validateEntries(monthlyData);
      if (!validation.valid) {
        this.plugin.debugLogger?.log('Data validation warnings:', validation.errors);
        // Continue with generation but log warnings
        new Notice(`Data validation warnings: ${validation.errors.slice(0, 3).join(', ')}${validation.errors.length > 3 ? '...' : ''}`, 5000);
      }

      if (monthlyData.length === 0) {
        this.plugin.debugLogger?.log(`No timesheet data found for ${month}/${year}`);
        // Still generate report with empty data
      }

      // Generate report table
      const reportTable = this.tableGenerator.generateReportTable(monthlyData);

      // Calculate total hours
      const totalHours = this.tableGenerator.calculateTotalHours(monthlyData);

      this.plugin.debugLogger?.log(`Total hours calculated: ${totalHours}`);

      // Replace template values
      const finalContent = this.templateManager.replaceTemplateValues(
        templateContent,
        reportTable,
        totalHours,
        year,
        month
      );

      // Validate final content
      if (!finalContent || finalContent.trim().length === 0) {
        throw new Error('Generated report content is empty');
      }

      // Save the report
      this.plugin.debugLogger?.log('Saving report...');
      const savedFile = await this.reportSaver.saveReport(year, month, finalContent);

      this.plugin.debugLogger?.log(`Report successfully generated: ${savedFile.path}`);
      return savedFile;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log('Error generating monthly report:', errorMessage);

      // Show user-friendly error message
      new Notice(`Failed to generate report: ${errorMessage}`, 8000);

      throw new Error(`Failed to generate monthly report: ${errorMessage}`);
    }
  }

  /**
   * Validate report generation inputs
   */
  private validateReportInputs(year: number, month: number): void {
    if (!year || typeof year !== 'number' || year < 1000 || year > 9999) {
      throw new Error('Invalid year provided. Year must be a 4-digit number.');
    }

    if (!month || typeof month !== 'number' || month < 1 || month > 12) {
      throw new Error('Invalid month provided. Month must be between 1 and 12.');
    }

    // Check if date is not too far in the future
    const currentDate = new Date();
    const reportDate = new Date(year, month - 1, 1);
    const maxFutureDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1);

    if (reportDate > maxFutureDate) {
      throw new Error('Cannot generate reports more than 1 year in the future.');
    }
  }

  /**
   * Get all available templates from the
   configured template folder
     */
  async getAvailableTemplates(): Promise<TFile[]> {
    try {
      return await this.templateManager.getAvailableTemplates();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log('Error getting available templates:', errorMessage);
      return [];
    }
  }

  /**
   * Get available months/years from timesheet data
   */
  async getAvailableMonths(): Promise<MonthData[]> {
    try {
      return await this.dataExtractor.getAvailableMonths();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log('Error getting available months:', errorMessage);
      return [];
    }
  }

  /**
   * Check if a report already exists for the given month/year
   */
  async reportExists(year: number, month: number): Promise<boolean> {
    try {
      this.validateReportInputs(year, month);
      return await this.reportSaver.reportExists(year, month);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log('Error checking if report exists:', errorMessage);
      return false;
    }
  }

  /**
   * Get an existing report file if it exists
   */
  async getExistingReport(year: number, month: number): Promise<TFile | null> {
    try {
      this.validateReportInputs(year, month);
      return await this.reportSaver.getExistingReport(year, month);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log('Error getting existing report:', errorMessage);
      return null;
    }
  }

  /**
   * Delete an existing report
   */
  async deleteReport(year: number, month: number): Promise<boolean> {
    try {
      this.validateReportInputs(year, month);
      const result = await this.reportSaver.deleteReport(year, month);

      if (result) {
        new Notice(`Report for ${this.getMonthName(month)} ${year} has been deleted.`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log('Error deleting report:', errorMessage);
      new Notice(`Failed to delete report: ${errorMessage}`, 5000);
      throw error;
    }
  }

  /**
   * Get all existing reports
   */
  async getAllReports(): Promise<TFile[]> {
    try {
      return await this.reportSaver.getAllReports();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log('Error getting all reports:', errorMessage);
      return [];
    }
  }

  /**
   * Get the path where a report would be saved
   */
  getReportPath(year: number, month: number): string {
    try {
      this.validateReportInputs(year, month);
      return this.reportSaver.getReportPath(year, month);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log('Error getting report path:', errorMessage);
      return '';
    }
  }

  /**
   * Validate template path
   */
  async validateTemplate(templatePath: string): Promise<boolean> {
    try {
      return await this.templateManager.validateTemplatePath(templatePath);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log('Error validating template:', errorMessage);
      return false;
    }
  }

  /**
   * Get template suggestions based on partial path
   */
  async getTemplateSuggestions(partialPath: string): Promise<TFile[]> {
    try {
      return await this.templateManager.getTemplateSuggestions(partialPath);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log('Error getting template suggestions:', errorMessage);
      return [];
    }
  }

  /**
   * Preview report content without saving
   */
  async previewReport(year: number, month: number, templatePath?: string): Promise<string> {
    try {
      this.plugin.debugLogger?.log(`Previewing report for ${month}/${year}`);

      // Validate inputs
      this.validateReportInputs(year, month);

      // Get template content
      const templateContent = await this.templateManager.getTemplateContent(templatePath);

      if (!templateContent || templateContent.trim().length === 0) {
        throw new Error('Template content is empty or could not be loaded');
      }

      // Extract monthly data
      const monthlyData = await this.dataExtractor.getMonthlyData(year, month);

      // Generate report table
      const reportTable = this.tableGenerator.generateReportTable(monthlyData);

      // Calculate total hours
      const totalHours = this.tableGenerator.calculateTotalHours(monthlyData);

      // Replace template values and return content
      const finalContent = this.templateManager.replaceTemplateValues(
        templateContent,
        reportTable,
        totalHours,
        year,
        month
      );

      if (!finalContent || finalContent.trim().length === 0) {
        throw new Error('Generated preview content is empty');
      }

      return finalContent;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log('Error previewing report:', errorMessage);
      throw new Error(`Failed to preview report: ${errorMessage}`);
    }
  }

  /**
   * Get report statistics for a given month
   */
  async getReportStatistics(year: number, month: number): Promise<{
    totalHours: number;
    workingDays: number;
    averageHoursPerDay: number;
    totalEntries: number;
    utilization?: number;
    efficiency?: number;
  }> {
    try {
      this.validateReportInputs(year, month);

      const monthlyData = await this.dataExtractor.getMonthlyData(year, month);
      const stats = this.tableGenerator.getStatistics(monthlyData);
      const workingDaysInMonth = this.getWorkingDaysInMonth(year, month);

      const result = {
        totalHours: stats.totalHours,
        workingDays: stats.workingDays,
        averageHoursPerDay: stats.averageHoursPerWorkingDay,
        totalEntries: stats.totalDays,
        utilization: undefined as number | undefined,
        efficiency: undefined as number | undefined
      };

      // Calculate utilization if we have target hours
      const hoursPerWorkday = this.plugin.settings.hoursPerWorkday || 8;
      if (hoursPerWorkday > 0 && workingDaysInMonth > 0) {
        const targetHours = workingDaysInMonth * hoursPerWorkday;
        result.utilization = Math.round((stats.totalHours / targetHours) * 100);
      }

      // Calculate efficiency (actual working days vs total days with entries)
      if (stats.totalDays > 0) {
        result.efficiency = Math.round((stats.workingDays / stats.totalDays) * 100);
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log('Error getting report statistics:', errorMessage);
      throw new Error(`Failed to get report statistics: ${errorMessage}`);
    }
  }

  /**
   * Create a sample template file
   */
  async createSampleTemplate(templateName: string): Promise<TFile> {
    try {
      if (!templateName || templateName.trim().length === 0) {
        throw new Error('Template name is required');
      }

      const template = await this.templateManager.createSampleTemplate(templateName.trim());
      new Notice(`Sample template created: ${template.basename}`);
      return template;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.plugin.debugLogger?.log('Error creating sample template:', errorMessage);
      new Notice(`Failed to create template: ${errorMessage}`, 5000);
      throw error;
    }
  }

  /**
   * Get available placeholder variables for templates
   */
  getAvailablePlaceholders(): Array<{ name: string; description: string }> {
    return this.templateManager.getAvailablePlaceholders();
  }

  /**
   * Bulk generate reports for multiple months
   */
  async bulkGenerateReports(
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number,
    templatePath?: string,
    overwriteExisting = false
  ): Promise<{ success: TFile[]; failed: Array<{ year: number; month: number; error: string }> }> {
    const results = {
      success: [] as TFile[],
      failed: [] as Array<{ year: number; month: number; error: string }>
    };

    // Validate date range
    if (startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
      throw new Error('Start date cannot be after end date');
    }

    // Generate list of months to process
    const monthsToProcess: Array<{ year: number; month: number }> = [];
    let currentYear = startYear;
    let currentMonth = startMonth;

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      monthsToProcess.push({ year: currentYear, month: currentMonth });

      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    this.plugin.debugLogger?.log(`Bulk generating ${monthsToProcess.length} reports`);

    // Process each month
    for (const { year, month } of monthsToProcess) {
      try {
        // Check if report exists and skip if not overwriting
        if (!overwriteExisting) {
          const exists = await this.reportExists(year, month);
          if (exists) {
            this.plugin.debugLogger?.log(`Skipping ${month}/${year} - report already exists`);
            continue;
          }
        }

        const report = await this.generateMonthlyReport(year, month, templatePath);
        results.success.push(report);

        this.plugin.debugLogger?.log(`Generated report for ${month}/${year}`);

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.failed.push({ year, month, error: errorMessage });
        this.plugin.debugLogger?.log(`Failed to generate report for ${month}/${year}:`, errorMessage);
      }
    }

    // Show summary
    const successCount = results.success.length;
    const failedCount = results.failed.length;

    if (failedCount === 0) {
      new Notice(`Successfully generated ${successCount} reports!`);
    } else {
      new Notice(`Generated ${successCount} reports, ${failedCount} failed. Check console for details.`, 8000);
    }

    return results;
  }

  /**
   * Check if a date is a weekend (Saturday or Sunday)
   */
  private isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  }

  /**
   * Calculate working days in a month (excluding weekends)
   */
  private getWorkingDaysInMonth(year: number, month: number): number {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (!this.isWeekend(currentDate)) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  /**
   * Get month name from month number
   */
  private getMonthName(month: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (month < 1 || month > 12) {
      return 'Invalid Month';
    }

    return monthNames[month - 1];
  }
}
