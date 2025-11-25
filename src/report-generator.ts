import { TFile, App, Notice } from 'obsidian';
import TimesheetReportPlugin from './main';
import { ObsidianTemplateManager } from './template-manager';
import { UnifiedDataExtractor } from './core/unified-data-extractor';
import { TableFactory } from './tables/TableFactory';
import { TableOptions } from './tables/base/TableConfig';
import { ObsidianReportSaver } from './report-saver';
import { MonthData } from './types';
import { QueryProcessor } from './core/query-processor';
import { TimesheetQuery } from './query/interpreter';

export class ReportGenerator {
  private plugin: TimesheetReportPlugin;
  private app: App;
  private templateManager: ObsidianTemplateManager;
  private dataExtractor: UnifiedDataExtractor;
  private reportSaver: ObsidianReportSaver;
  private tableFactory: TableFactory;
  private queryProcessor: QueryProcessor;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
    this.app = plugin.app;
    this.templateManager = new ObsidianTemplateManager(plugin);
    this.dataExtractor = new UnifiedDataExtractor(plugin);
    this.reportSaver = new ObsidianReportSaver(plugin);
    this.tableFactory = new TableFactory(plugin);
    this.queryProcessor = new QueryProcessor(plugin);
  }

  /**
   * Generate an interval-based report using query language
   */
  async generateIntervalReport(
    startDate: string,
    endDate: string,
    query: TimesheetQuery,
    reportName: string,
    templatePath?: string
  ): Promise<TFile> {
    try {
      this.plugin.debugLogger?.log(`Generating interval report: ${reportName} (${startDate} to ${endDate})`);

      // Validate output folder
      const folderValidation = await this.reportSaver.validateOutputFolder();
      if (!folderValidation.valid) {
        throw new Error(`Output folder validation failed: ${folderValidation.error}`);
      }

      // Process query to get data
      const data = await this.queryProcessor.processQuery(query);

      // Generate report content
      let content = '';

      // Use template if specified
      if (templatePath) {
        const templateContent = await this.templateManager.getTemplateContent(templatePath);
        if (templateContent) {
          // For now, use default content generation
          // TODO: Implement template processing with variables
          content = this.generateIntervalReportContent(data, query, reportName, startDate, endDate);
        } else {
          throw new Error('Template content could not be loaded');
        }
      } else {
        content = this.generateIntervalReportContent(data, query, reportName, startDate, endDate);
      }

      // Save report
      const reportPath = await this.reportSaver.saveIntervalReport(reportName, content);
      return reportPath;

    } catch (error) {
      this.plugin.debugLogger?.log(`Error generating interval report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate default content for interval reports
   */
  private generateIntervalReportContent(
    data: any,
    query: TimesheetQuery,
    reportName: string,
    startDate: string,
    endDate: string
  ): string {
    const lines: string[] = [];

    // Report header
    lines.push(`# ${reportName}`);
    lines.push('');
    lines.push(`**Period:** ${startDate} to ${endDate}`);
    lines.push(`**Generated:** ${new Date().toLocaleDateString()}`);
    lines.push('');

    // Summary section
    lines.push('## Summary');
    lines.push('');
    lines.push(`- **Total Hours:** ${data.summary.totalHours?.toFixed(2) || '0.00'}`);
    lines.push(`- **Total Revenue:** €${data.summary.totalInvoiced?.toFixed(2) || '0.00'}`);
    lines.push(`- **Average Utilization:** ${Math.round((data.summary.utilization || 0) * 100)}%`);
    lines.push(`- **Number of Entries:** ${data.entries.length}`);
    lines.push('');

    // Data table
    if (data.entries.length > 0) {
      lines.push('## Detailed Data');
      lines.push('');

      const tableOptions: TableOptions = {
        format: 'markdown',
        showTotal: true,
        columns: query.columns
      };

      const table = this.tableFactory.createTimesheetTable(data.entries, tableOptions);
      const tableContent = table.render({ format: 'markdown' });
      lines.push(tableContent);
    } else {
      lines.push('## No Data Found');
      lines.push('');
      lines.push('No timesheet entries were found for the specified criteria.');
    }

    return lines.join('\n');
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


}
