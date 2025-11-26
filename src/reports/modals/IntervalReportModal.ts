import { Modal, App, Setting, Notice, TFile, DropdownComponent, TextComponent, ButtonComponent } from 'obsidian';
import TimesheetReportPlugin from '../../main';
import { TimesheetQuery, QueryInterpreter, QueryExecutor } from '../../query';
import { TableFactory } from '../../tables/TableFactory';
import { TableOptions } from '../../tables/base/TableConfig';
import { ReportGenerator } from '../ReportGenerator';
import { DateUtils } from '../../utils/date-utils';

interface DateInterval {
  start: Date;
  end: Date;
  label: string;
}

interface ReportPreset {
  id: string;
  name: string;
  query: string;
  description: string;
}

export class IntervalReportModal extends Modal {
  private plugin: TimesheetReportPlugin;
  private startDate: string;
  private endDate: string;
  private selectedTemplate?: string;
  private queryText: string;
  private reportName: string;
  private availableTemplates: string[];
  private isGenerating: boolean = false;

  // UI Components
  private startDateInput!: TextComponent;
  private endDateInput!: TextComponent;
  private queryTextarea!: HTMLTextAreaElement;
  private templateDropdown!: DropdownComponent;
  private reportNameInput!: TextComponent;
  private generateButton!: ButtonComponent;
  private previewButton!: ButtonComponent;
  private previewContainer!: HTMLElement;

  // Query processing
  private queryExecutor: QueryExecutor;
  private queryInterpreter: QueryInterpreter;
  private tableFactory: TableFactory;
  private reportGenerator: ReportGenerator;

  constructor(plugin: TimesheetReportPlugin) {
    super(plugin.app);
    this.plugin = plugin;

    // Initialize date range to current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.startDate = this.formatDate(startOfMonth);
    this.endDate = this.formatDate(endOfMonth);
    this.reportName = `Report ${this.startDate} to ${this.endDate}`;

    // Default query for current month
    this.queryText = [
      `WHERE date BETWEEN "${this.startDate}" AND "${this.endDate}"`,
      'SHOW project, date, hours, rate, invoiced',
      'VIEW table',
      'SIZE normal'
    ].join('\n');

    this.availableTemplates = [];

    // Initialize services
    this.queryExecutor = new QueryExecutor(plugin);
    this.queryInterpreter = new QueryInterpreter();
    this.tableFactory = new TableFactory(plugin);
    this.reportGenerator = new ReportGenerator(plugin);
  }

  async onOpen(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();

    try {
      this.showLoadingState();
      await this.loadAvailableData();
      await this.renderModalContent();
    } catch (error) {
      this.handleError('Failed to initialize modal', error);
    }
  }

  private showLoadingState(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('div', {
      text: 'Loading available data...',
      cls: 'timesheet-modal-loading'
    });
  }

  private async loadAvailableData(): Promise<void> {
    // Load available templates
    const templates = await this.reportGenerator.getAvailableTemplates();
    this.availableTemplates = templates.map(t => t.name || t.path);
  }

  private async renderModalContent(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();

    // Modal header
    contentEl.createEl('h2', {
      text: 'Generate Interval Report',
      cls: 'timesheet-modal-title'
    });

    // Date interval selection
    await this.renderDateIntervalSelection(contentEl);

    // Query editor
    await this.renderQueryEditor(contentEl);

    // Report options
    await this.renderReportOptions(contentEl);

    // Preview section
    await this.renderReportPreview(contentEl);

    // Action buttons
    this.renderActionButtons(contentEl);

    // Initial preview update
    await this.updateReportPreview();
  }

  private async renderDateIntervalSelection(contentEl: HTMLElement): Promise<void> {
    // Date range section
    const dateSection = contentEl.createEl('div', { cls: 'timesheet-date-section' });
    dateSection.createEl('h3', { text: 'Date Range' });

    // Quick presets
    const presetsContainer = dateSection.createEl('div', { cls: 'timesheet-date-presets' });
    this.createDatePresets(presetsContainer);

    // Custom date inputs
    const customDateContainer = dateSection.createEl('div', { cls: 'timesheet-custom-dates' });

    new Setting(customDateContainer)
      .setName('Start Date')
      .setDesc('Report start date (YYYY-MM-DD)')
      .addText(text => {
        this.startDateInput = text;
        text
          .setPlaceholder('YYYY-MM-DD')
          .setValue(this.startDate)
          .onChange(async (value) => {
            this.startDate = value;
            await this.updateDateRange();
          });
      });

    new Setting(customDateContainer)
      .setName('End Date')
      .setDesc('Report end date (YYYY-MM-DD)')
      .addText(text => {
        this.endDateInput = text;
        text
          .setPlaceholder('YYYY-MM-DD')
          .setValue(this.endDate)
          .onChange(async (value) => {
            this.endDate = value;
            await this.updateDateRange();
          });
      });
  }

  private createDatePresets(container: HTMLElement): void {
    const presets: DateInterval[] = [
      this.createPreset('Current Month', 0, 'month'),
      this.createPreset('Last Month', -1, 'month'),
      this.createPreset('Last 3 Months', -3, 'months'),
      this.createPreset('Current Quarter', 0, 'quarter'),
      this.createPreset('Last Quarter', -1, 'quarter'),
      this.createPreset('Current Year', 0, 'year'),
      this.createPreset('Last 30 Days', -30, 'days'),
      this.createPreset('Last 90 Days', -90, 'days')
    ];

    presets.forEach(preset => {
      const button = container.createEl('button', {
        text: preset.label,
        cls: 'timesheet-preset-button'
      });

      button.addEventListener('click', () => {
        this.startDate = this.formatDate(preset.start);
        this.endDate = this.formatDate(preset.end);

        this.startDateInput.setValue(this.startDate);
        this.endDateInput.setValue(this.endDate);

        this.updateDateRange();
      });
    });
  }

  private createPreset(label: string, offset: number, unit: 'month' | 'months' | 'quarter' | 'year' | 'days'): DateInterval {
    const now = new Date();
    let start: Date, end: Date;

    switch (unit) {
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
        break;

      case 'months':
        // For multi-month ranges: offset is negative, gives range from (offset) months ago to now
        start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;

      case 'quarter': {
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), quarterStart + (offset * 3), 1);
        end = new Date(now.getFullYear(), quarterStart + (offset * 3) + 3, 0);
        break;
      }

      case 'year':
        start = new Date(now.getFullYear() + offset, 0, 1);
        end = new Date(now.getFullYear() + offset, 11, 31);
        break;

      case 'days':
        end = new Date(now);
        start = new Date(now);
        start.setDate(start.getDate() + offset);
        break;
    }

    return { start, end, label };
  }

  private async renderQueryEditor(contentEl: HTMLElement): Promise<void> {
    const querySection = contentEl.createEl('div', { cls: 'timesheet-query-section' });
    querySection.createEl('h3', { text: 'Query Configuration' });

    // Query presets
    const presetsContainer = querySection.createEl('div', { cls: 'timesheet-query-presets' });
    this.createQueryPresets(presetsContainer);

    // Query textarea
    const querySetting = new Setting(querySection)
      .setName('Custom Query')
      .setDesc('Advanced users can customize the query language for specific reporting needs');

    const textareaContainer = querySetting.settingEl.createEl('div', { cls: 'timesheet-query-container' });

    this.queryTextarea = textareaContainer.createEl('textarea', {
      cls: 'timesheet-query-textarea',
      attr: {
        placeholder: 'Enter your timesheet query...',
        rows: '6',
        cols: '80'
      }
    });

    this.queryTextarea.value = this.queryText;
    this.queryTextarea.addEventListener('input', () => {
      this.queryText = this.queryTextarea.value;
      this.updateReportPreview();
    });

    // Query help
    const helpContainer = textareaContainer.createEl('div', { cls: 'timesheet-query-help' });
    helpContainer.createEl('small', {
      text: 'Available fields: project, date, hours, rate, invoiced, client, category, utilization, budgetHours, budgetProgress'
    });
  }

  private createQueryPresets(container: HTMLElement): void {
    const presets: ReportPreset[] = [
      {
        id: 'basic-summary',
        name: 'Basic Summary',
        description: 'Simple hours and revenue summary',
        query: [
          'SHOW project, hours, invoiced',
          'VIEW summary',
          'SIZE normal'
        ].join('\n')
      },
      {
        id: 'detailed-breakdown',
        name: 'Detailed Breakdown',
        description: 'Day-by-day breakdown with all details',
        query: [
          'SHOW date, project, task, hours, rate, invoiced',
          'VIEW table',
          'SIZE detailed'
        ].join('\n')
      },
      {
        id: 'client-analysis',
        name: 'Client Analysis',
        description: 'Client-focused reporting',
        query: [
          'SHOW client AS "Client", project AS "Project", hours AS "Hours", invoiced FORMAT CURRENCY AS "Revenue"',
          'VIEW table',
          'SIZE normal'
        ].join('\n')
      },
      {
        id: 'budget-tracking',
        name: 'Budget Tracking',
        description: 'Budget progress and utilization',
        query: [
          'SHOW project AS "Project", budgetHours AS "Budget", hours AS "Used", budgetProgress FORMAT PERCENT AS "Progress"',
          'VIEW table',
          'CHART budget'
        ].join('\n')
      },
      {
        id: 'utilization-report',
        name: 'Utilization Report',
        description: 'Time utilization analysis',
        query: [
          'SHOW project, hours, utilization FORMAT PERCENT AS "Utilization"',
          'VIEW chart',
          'CHART trend'
        ].join('\n')
      }
    ];

    presets.forEach(preset => {
      const button = container.createEl('button', {
        text: preset.name,
        cls: 'timesheet-query-preset-button',
        attr: { title: preset.description }
      });

      button.addEventListener('click', () => {
        const dateFilter = `WHERE date BETWEEN "${this.startDate}" AND "${this.endDate}"`;
        this.queryText = [dateFilter, preset.query].join('\n');
        this.queryTextarea.value = this.queryText;
        this.updateReportPreview();
      });
    });
  }

  private async renderReportOptions(contentEl: HTMLElement): Promise<void> {
    const optionsSection = contentEl.createEl('div', { cls: 'timesheet-options-section' });
    optionsSection.createEl('h3', { text: 'Report Options' });

    // Report name
    new Setting(optionsSection)
      .setName('Report Name')
      .setDesc('Name for the generated report file')
      .addText(text => {
        this.reportNameInput = text;
        text
          .setPlaceholder('Enter report name...')
          .setValue(this.reportName)
          .onChange((value) => {
            this.reportName = value;
          });
      });

    // Template selection
    new Setting(optionsSection)
      .setName('Template')
      .setDesc('Choose a template for the report format')
      .addDropdown(dropdown => {
        this.templateDropdown = dropdown;

        dropdown.addOption('', 'Default Template');

        this.availableTemplates.forEach(template => {
          dropdown.addOption(template, template);
        });

        dropdown.setValue(this.selectedTemplate || '');

        dropdown.onChange((value) => {
          this.selectedTemplate = value || undefined;
        });
      });
  }

  private async renderReportPreview(contentEl: HTMLElement): Promise<void> {
    const previewSection = contentEl.createEl('div', { cls: 'timesheet-preview-section' });
    previewSection.createEl('h3', { text: 'Preview' });

    this.previewContainer = previewSection.createEl('div', {
      cls: 'timesheet-preview-container'
    });
  }

  private async updateReportPreview(): Promise<void> {
    try {
      this.previewContainer.empty();

      // Parse and execute query
      const query = this.parseQuery();
      const processedData = await this.queryExecutor.execute(query);

      // Generate preview stats
      const statsEl = this.previewContainer.createEl('div', {
        cls: 'timesheet-preview-stats'
      });

      const totalHours = processedData.summary.totalHours || 0;
      const totalRevenue = processedData.summary.totalInvoiced || 0;
      const avgUtilization = processedData.summary.utilization || 0;

      this.addStatRow(statsEl, 'Total Hours', totalHours.toFixed(2));
      this.addStatRow(statsEl, 'Total Revenue', `€${totalRevenue.toFixed(2)}`);
      this.addStatRow(statsEl, 'Avg Utilization', `${Math.round(avgUtilization * 100)}%`);
      this.addStatRow(statsEl, 'Entries Found', processedData.entries.length.toString());

      // Generate table preview (limited)
      if (processedData.entries.length > 0) {
        const tableOptions: TableOptions = {
          format: 'html',
          cssClass: 'timesheet-preview-table',
          columns: query.columns
        };

        const limitedEntries = processedData.entries.slice(0, 5); // Show only first 5 entries
        const table = this.tableFactory.createQueryTable(limitedEntries as unknown as Record<string, unknown>[], tableOptions);
        const tableHtml = table.render({ format: 'html' });

        const tableContainer = this.previewContainer.createEl('div', {
          cls: 'timesheet-preview-table-container'
        });
        tableContainer.innerHTML = tableHtml;

        if (processedData.entries.length > 5) {
          tableContainer.createEl('p', {
            text: `... and ${processedData.entries.length - 5} more entries`,
            cls: 'timesheet-preview-more'
          });
        }
      } else {
        this.previewContainer.createEl('p', {
          text: 'No data found for the specified criteria.',
          cls: 'timesheet-preview-empty'
        });
      }

    } catch (error) {
      this.previewContainer.empty();
      this.previewContainer.createEl('p', {
        text: `Preview Error: ${error.message}`,
        cls: 'timesheet-preview-error'
      });
    }
  }

  private parseQuery(): TimesheetQuery {
    try {
      return this.queryInterpreter.parseAndInterpret(this.queryText);
    } catch (error) {
      // Fallback to basic query if parsing fails
      const fallbackQuery = [
        `WHERE date BETWEEN "${this.startDate}" AND "${this.endDate}"`,
        'SHOW project, date, hours, invoiced',
        'VIEW table'
      ].join('\n');

      return this.queryInterpreter.parseAndInterpret(fallbackQuery);
    }
  }

  private addStatRow(container: HTMLElement, label: string, value: string): void {
    const row = container.createEl('div', { cls: 'timesheet-stat-row' });
    row.createEl('span', { text: label + ':', cls: 'timesheet-stat-label' });
    row.createEl('span', { text: value, cls: 'timesheet-stat-value' });
  }

  private renderActionButtons(contentEl: HTMLElement): Promise<void> {
    const buttonContainer = contentEl.createEl('div', {
      cls: 'timesheet-modal-buttons'
    });

    // Preview button
    this.previewButton = new ButtonComponent(buttonContainer)
      .setButtonText('Preview Report')
      .setCta()
      .onClick(() => this.previewFullReport());

    // Generate button
    this.generateButton = new ButtonComponent(buttonContainer)
      .setButtonText('Generate Report')
      .setCta()
      .onClick(() => this.generateReport());

    // Cancel button
    new ButtonComponent(buttonContainer)
      .setButtonText('Cancel')
      .onClick(() => this.close());

    return Promise.resolve();
  }

  private async updateDateRange(): Promise<void> {
    // Update report name
    this.reportName = `Report ${this.startDate} to ${this.endDate}`;
    if (this.reportNameInput) {
      this.reportNameInput.setValue(this.reportName);
    }

    // Update query with new date range
    const lines = this.queryText.split('\n');
    const updatedLines = lines.map(line => {
      if (line.trim().toUpperCase().startsWith('WHERE') && line.includes('BETWEEN')) {
        return `WHERE date BETWEEN "${this.startDate}" AND "${this.endDate}"`;
      }
      return line;
    });

    // If no WHERE clause exists, add one
    if (!lines.some(line => line.trim().toUpperCase().startsWith('WHERE'))) {
      updatedLines.unshift(`WHERE date BETWEEN "${this.startDate}" AND "${this.endDate}"`);
    }

    this.queryText = updatedLines.join('\n');
    if (this.queryTextarea) {
      this.queryTextarea.value = this.queryText;
    }

    await this.updateReportPreview();
  }

  private async generateReport(): Promise<void> {
    if (this.isGenerating) return;

    try {
      this.setGeneratingState(true);

      // Validate inputs
      if (!this.reportName.trim()) {
        throw new Error('Report name is required');
      }

      if (!this.isValidDateRange()) {
        throw new Error('Invalid date range');
      }

      // Check if report already exists
      const exists = await this.reportExists();
      if (exists) {
        const proceed = await this.showConfirmDialog(
          `A report named "${this.reportName}" already exists. Do you want to overwrite it?`
        );
        if (!proceed) return;
      }

      // Parse query and generate report
      const query = this.parseQuery();

      // Generate report using the report generator
      const reportFile = await this.reportGenerator.generateIntervalReport(
        this.startDate,
        this.endDate,
        query,
        this.reportName,
        this.selectedTemplate
      );

      // Success feedback
      new Notice(`Report "${this.reportName}" generated successfully!`);

      // Ask if user wants to open the report
      const openReport = await this.showConfirmDialog(
        'Would you like to open the generated report?'
      );

      if (openReport) {
        const leaf = this.app.workspace.getLeaf('tab');
        await leaf.openFile(reportFile);
      }

      this.close();

    } catch (error) {
      this.handleError('Failed to generate report', error);
    } finally {
      this.setGeneratingState(false);
    }
  }

  private async previewFullReport(): Promise<void> {
    try {
      const query = this.parseQuery();

      // Generate preview report with temporary name
      const previewName = `Preview-${new Date().getTime()}`;
      const tempFile = await this.reportGenerator.generateIntervalReport(
        this.startDate,
        this.endDate,
        query,
        previewName,
        this.selectedTemplate
      );

      // Open in new tab
      const leaf = this.app.workspace.getLeaf('tab');
      await leaf.openFile(tempFile);

      // Clean up temp file after a delay
      setTimeout(async () => {
        try {
          await this.app.vault.delete(tempFile);
        } catch (error) {
          // Ignore cleanup errors
        }
      }, 30000); // Delete after 30 seconds

    } catch (error) {
      this.handleError('Failed to preview report', error);
    }
  }

  private async reportExists(): Promise<boolean> {
    try {
      // Use the report generator's path logic
      const outputFolder = this.plugin.settings.reportOutputFolder || 'reports';
      const fileName = `${this.reportName}.md`;
      const filePath = `${outputFolder}/${fileName}`;
      const file = this.app.vault.getAbstractFileByPath(filePath);
      return file instanceof TFile;
    } catch {
      return false;
    }
  }

  private isValidDateRange(): boolean {
    try {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
    } catch {
      return false;
    }
  }

  private formatDate(date: Date): string {
    // Use local time instead of UTC to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private setGeneratingState(generating: boolean): void {
    this.isGenerating = generating;

    if (this.generateButton) {
      this.generateButton.setDisabled(generating);
      this.generateButton.setButtonText(generating ? 'Generating...' : 'Generate Report');
    }

    if (this.previewButton) {
      this.previewButton.setDisabled(generating);
    }
  }

  private async showConfirmDialog(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const modal = new Modal(this.app);
      modal.contentEl.createEl('p', { text: message });

      const buttonContainer = modal.contentEl.createEl('div', {
        cls: 'timesheet-confirm-buttons'
      });

      new ButtonComponent(buttonContainer)
        .setButtonText('Yes')
        .setCta()
        .onClick(() => {
          modal.close();
          resolve(true);
        });

      new ButtonComponent(buttonContainer)
        .setButtonText('No')
        .onClick(() => {
          modal.close();
          resolve(false);
        });

      modal.open();
    });
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    new Notice(`${message}: ${error.message}`);
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
