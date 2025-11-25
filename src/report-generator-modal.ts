import { App, Modal, Setting, TFile, Notice, ButtonComponent, DropdownComponent, TextComponent } from 'obsidian';
import TimesheetReportPlugin from './main';
import { MonthData } from './types';

export class ReportGeneratorModal extends Modal {
  private plugin: TimesheetReportPlugin;
  private selectedYear: number;
  private selectedMonth: number;
  private selectedTemplate: string;
  private availableMonths: MonthData[] = [];
  private availableTemplates: TFile[] = [];
  private isGenerating = false;

  // UI Components
  private monthDropdown?: DropdownComponent;
  private templateDropdown?: DropdownComponent;
  private generateButton?: ButtonComponent;
  private previewButton?: ButtonComponent;
  private cancelButton?: ButtonComponent;

  constructor(app: App, plugin: TimesheetReportPlugin) {
    super(app);
    this.plugin = plugin;

    // Default to current month/year
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedTemplate = plugin.settings.defaultReportTemplate || '';

    // Set modal properties
    this.modalEl.addClass('timesheet-report-modal');
    this.setTitle('Generate Monthly Timesheet Report');
  }

  async onOpen(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();

    try {
      // Show loading state
      this.showLoadingState();

      // Load available months and templates
      await this.loadAvailableData();

      // Clear loading state
      contentEl.empty();

      // Render the modal content
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
      cls: 'mod-loading'
    });
  }

  private async loadAvailableData(): Promise<void> {
    try {
      // Load data in parallel for better performance
      const [availableMonths, availableTemplates] = await Promise.all([
        this.plugin.reportGenerator.getAvailableMonths(),
        this.plugin.reportGenerator.getAvailableTemplates()
      ]);

      this.availableMonths = availableMonths;
      this.availableTemplates = availableTemplates;

      this.plugin.debugLogger?.log(
        `Loaded ${this.availableMonths.length} months, ${this.availableTemplates.length} templates`
      );
    } catch (error) {
      this.plugin.debugLogger?.log('Error loading available data:', error);
      throw new Error(`Failed to load data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async renderModalContent(): Promise<void> {
    const { contentEl } = this;

    // Add description
    contentEl.createEl('p', {
      text: 'Generate a monthly timesheet report from your logged hours. Select the month and template below.',
      cls: 'modal-description'
    });

    // Month/Year selection
    await this.renderMonthSelection(contentEl);

    // Template selection
    await this.renderTemplateSelection(contentEl);

    // Report statistics (if data available)
    await this.renderReportPreview(contentEl);

    // Action buttons
    this.renderActionButtons(contentEl);
  }

  private async renderMonthSelection(contentEl: HTMLElement): Promise<void> {
    const monthSetting = new Setting(contentEl)
      .setName('Select Month/Year')
      .setDesc('Choose the month and year for the report');

    if (this.availableMonths.length > 0) {
      // Dropdown with available months
      monthSetting.addDropdown(dropdown => {
        this.monthDropdown = dropdown;

        // Add current selection if it exists
        const currentKey = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}`;
        let hasCurrentSelection = false;

        this.availableMonths.forEach(monthData => {
          const key = `${monthData.year}-${String(monthData.month).padStart(2, '0')}`;
          dropdown.addOption(key, monthData.label);

          if (key === currentKey) {
            hasCurrentSelection = true;
          }
        });

        // Set default value
        if (hasCurrentSelection) {
          dropdown.setValue(currentKey);
        } else if (this.availableMonths.length > 0) {
          // Use most recent month
          const recentMonth = this.availableMonths[0];
          const recentKey = `${recentMonth.year}-${String(recentMonth.month).padStart(2, '0')}`;
          dropdown.setValue(recentKey);
          this.selectedYear = recentMonth.year;
          this.selectedMonth = recentMonth.month;
        }

        dropdown.onChange(async (value) => {
          const [year, month] = value.split('-');
          this.selectedYear = parseInt(year);
          this.selectedMonth = parseInt(month);

          // Update preview
          await this.updateReportPreview();
        });
      });
    } else {
      // Manual input fallback
      monthSetting.addText(text => {
        const currentValue = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}`;
        text
          .setPlaceholder('YYYY-MM')
          .setValue(currentValue)
          .onChange(async (value) => {
            const [year, month] = value.split('-');
            if (year && month) {
              const newYear = parseInt(year);
              const newMonth = parseInt(month);

              if (this.isValidDate(newYear, newMonth)) {
                this.selectedYear = newYear;
                this.selectedMonth = newMonth;
                await this.updateReportPreview();
              }
            }
          });
      });

      // Add help text
      const helpEl = contentEl.createEl('div', { cls: 'setting-item-description' });
      helpEl.createEl('span', {
        text: 'No timesheet data found in vault. Enter month/year manually (YYYY-MM format).'
      });
      helpEl.createEl('br');
      helpEl.createEl('small', {
        text: 'Note: Reports can still be generated for months without data.'
      });
    }
  }

  private async renderTemplateSelection(contentEl: HTMLElement): Promise<void> {
    const templateSetting = new Setting(contentEl)
      .setName('Select Template')
      .setDesc('Choose a template for the report layout');

    if (this.availableTemplates.length > 0) {
      templateSetting.addDropdown(dropdown => {
        this.templateDropdown = dropdown;

        // Add default option
        dropdown.addOption('', 'Use Default Template');

        // Add available templates
        this.availableTemplates.forEach(template => {
          dropdown.addOption(template.path, template.basename);
        });

        dropdown.setValue(this.selectedTemplate);
        dropdown.onChange(async (value) => {
          this.selectedTemplate = value;

          // Validate template if specified
          if (value) {
            const isValid = await this.plugin.reportGenerator.validateTemplate(value);
            if (!isValid) {
              new Notice(`Warning: Template not found or unreadable: ${value}`, 5000);
            }
          }
        });
      });

      // Add template management buttons
      const templateActions = contentEl.createDiv({ cls: 'template-actions' });

      new ButtonComponent(templateActions)
        .setButtonText('Create Sample Template')
        .setTooltip('Create a new template file with sample content')
        .onClick(async () => {
          await this.createSampleTemplate();
        });

    } else {
      // Manual input fallback
      templateSetting.addText(text => {
        text
          .setPlaceholder(`${this.plugin.settings.reportTemplateFolder}/My Report Template.md`)
          .setValue(this.selectedTemplate)
          .onChange(async (value) => {
            this.selectedTemplate = value;

            // Validate template if specified
            if (value && value.trim()) {
              const isValid = await this.plugin.reportGenerator.validateTemplate(value);
              if (!isValid) {
                new Notice(`Warning: Template not found or unreadable: ${value}`, 3000);
              }
            }
          });
      });

      // Add help text
      contentEl.createEl('div', {
        cls: 'setting-item-description',
        text: `No templates found in ${this.plugin.settings.reportTemplateFolder} folder. You can specify a template path or leave empty for default.`
      });
    }
  }

  private async renderReportPreview(contentEl: HTMLElement): Promise<void> {
    // Create preview container
    const previewContainer = contentEl.createDiv({ cls: 'report-preview' });
    previewContainer.style.display = 'none'; // Initially hidden

    // Preview will be populated by updateReportPreview
    await this.updateReportPreview();
  }

  private async updateReportPreview(): Promise<void> {
    const previewContainer = this.contentEl.querySelector('.report-preview') as HTMLElement;
    if (!previewContainer) return;

    try {
      // Get statistics for the selected month
      const stats = await this.plugin.reportGenerator.getReportStatistics(
        this.selectedYear,
        this.selectedMonth
      );

      // Clear previous content
      previewContainer.empty();

      if (stats.totalHours > 0) {
        // Show statistics
        const statsEl = previewContainer.createDiv({ cls: 'stats-preview' });
        statsEl.createEl('h4', { text: 'Report Preview' });

        const statsTable = statsEl.createEl('table', { cls: 'stats-table' });
        const tbody = statsTable.createEl('tbody');

        this.addStatRow(tbody, 'Total Hours', stats.totalHours.toString());
        this.addStatRow(tbody, 'Working Days', stats.workingDays.toString());
        this.addStatRow(tbody, 'Avg. Hours/Day', stats.averageHoursPerDay.toString());

        if (stats.utilization !== undefined) {
          this.addStatRow(tbody, 'Utilization', `${stats.utilization}%`);
        }

        previewContainer.style.display = 'block';
      } else {
        // Show "no data" message
        previewContainer.style.display = 'block';
        previewContainer.createEl('div', {
          cls: 'no-data-message',
          text: `No timesheet data found for ${this.getMonthName(this.selectedMonth)} ${this.selectedYear}. Report will be generated with empty data.`
        });
      }
    } catch (error) {
      // Hide preview on error
      previewContainer.style.display = 'none';
      this.plugin.debugLogger?.log('Error updating preview:', error);
    }
  }

  private addStatRow(tbody: HTMLElement, label: string, value: string): void {
    const row = tbody.createEl('tr');
    row.createEl('td', { text: label });
    row.createEl('td', { text: value });
  }

  private renderActionButtons(contentEl: HTMLElement): void {
    const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });

    // Generate Report button
    this.generateButton = new ButtonComponent(buttonContainer)
      .setButtonText('Generate Report')
      .setCta()
      .onClick(async () => {
        await this.generateReport();
      });

    // Preview Report button
    this.previewButton = new ButtonComponent(buttonContainer)
      .setButtonText('Preview Report')
      .onClick(async () => {
        await this.previewReport();
      });

    // Cancel button
    this.cancelButton = new ButtonComponent(buttonContainer)
      .setButtonText('Cancel')
      .onClick(() => {
        this.close();
      });
  }

  private async generateReport(): Promise<void> {
    if (this.isGenerating) return;

    try {
      this.setGeneratingState(true);

      // Check if report already exists
      const exists = await this.plugin.reportGenerator.reportExists(this.selectedYear, this.selectedMonth);
      if (exists) {
        const monthName = this.getMonthName(this.selectedMonth);
        const proceed = await this.showConfirmDialog(
          `A report for ${monthName} ${this.selectedYear} already exists. Do you want to overwrite it?`
        );

        if (!proceed) {
          return;
        }
      }

      // Generate the report
      const reportFile = await this.plugin.reportGenerator.generateMonthlyReport(
        this.selectedYear,
        this.selectedMonth,
        this.selectedTemplate || undefined
      );

      // Show success message
      const monthName = this.getMonthName(this.selectedMonth);
      new Notice(`Report generated successfully for ${monthName} ${this.selectedYear}!`);

      // Ask if user wants to open the report
      const openReport = await this.showConfirmDialog(
        'Would you like to open the generated report?'
      );

      if (openReport) {
        const leaf = this.app.workspace.getLeaf('tab');
        await leaf.openFile(reportFile);
      }

      // Close modal
      this.close();

    } catch (error) {
      this.handleError('Failed to generate report', error);
    } finally {
      this.setGeneratingState(false);
    }
  }

  private async previewReport(): Promise<void> {
    if (this.isGenerating) return;

    try {
      this.setGeneratingState(true, 'Generating Preview...');

      // Generate preview content
      const previewContent = await this.plugin.reportGenerator.previewReport(
        this.selectedYear,
        this.selectedMonth,
        this.selectedTemplate || undefined
      );

      // Create a temporary file for preview
      const timestamp = Date.now();
      const tempPath = `temp-preview-${timestamp}.md`;

      try {
        const tempFile = await this.app.vault.create(tempPath, previewContent);

        // Open preview
        const leaf = this.app.workspace.getLeaf('tab');
        await leaf.openFile(tempFile);

        new Notice('Preview opened. Temporary file will be deleted automatically in 30 seconds.');

        // Clean up temp file after delay
        setTimeout(async () => {
          try {
            await this.app.vault.delete(tempFile);
          } catch (error) {
            // Ignore cleanup errors
            this.plugin.debugLogger?.log('Failed to clean up temp preview file:', error);
          }
        }, 30000); // 30 seconds

      } catch (createError) {
        // If file creation fails, show content in notice
        new Notice('Preview generated successfully. Check the console for details.', 5000);
        console.log('Report Preview:\n', previewContent);
      }

    } catch (error) {
      this.handleError('Failed to generate preview', error);
    } finally {
      this.setGeneratingState(false);
    }
  }

  private async createSampleTemplate(): Promise<void> {
    try {
      // Get template name from user
      const templateName = await this.showInputDialog('Enter template name:', 'My Custom Template');

      if (!templateName) return;

      const template = await this.plugin.reportGenerator.createSampleTemplate(templateName);

      // Update templates dropdown
      this.availableTemplates.push(template);
      if (this.templateDropdown) {
        this.templateDropdown.addOption(template.path, template.basename);
        this.templateDropdown.setValue(template.path);
        this.selectedTemplate = template.path;
      }

      // Ask if user wants to edit the template
      const editTemplate = await this.showConfirmDialog(
        'Template created successfully! Would you like to edit it now?'
      );

      if (editTemplate) {
        const leaf = this.app.workspace.getLeaf('tab');
        await leaf.openFile(template);
      }

    } catch (error) {
      this.handleError('Failed to create template', error);
    }
  }

  private setGeneratingState(generating: boolean, text?: string): void {
    this.isGenerating = generating;

    if (this.generateButton) {
      this.generateButton.setDisabled(generating);
      this.generateButton.setButtonText(generating ? (text || 'Generating...') : 'Generate Report');
    }

    if (this.previewButton) {
      this.previewButton.setDisabled(generating);
    }

    if (this.monthDropdown) {
      this.monthDropdown.setDisabled(generating);
    }

    if (this.templateDropdown) {
      this.templateDropdown.setDisabled(generating);
    }
  }

  private async showConfirmDialog(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const modal = new Modal(this.app);
      modal.setTitle('Confirmation');
      modal.setContent(message);

      const buttonContainer = modal.contentEl.createDiv({ cls: 'modal-button-container' });

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

  private async showInputDialog(prompt: string, defaultValue?: string): Promise<string | null> {
    return new Promise((resolve) => {
      const modal = new Modal(this.app);
      modal.setTitle('Input Required');

      modal.contentEl.createEl('p', { text: prompt });

      let inputComponent: TextComponent | undefined;
      new Setting(modal.contentEl)
        .addText(text => {
          inputComponent = text;
          text.setValue(defaultValue || '');
          text.inputEl.focus();
          text.inputEl.select();

          // Handle Enter key
          text.inputEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
              modal.close();
              resolve(text.getValue() || null);
            }
          });
        });

      const buttonContainer = modal.contentEl.createDiv({ cls: 'modal-button-container' });

      new ButtonComponent(buttonContainer)
        .setButtonText('OK')
        .setCta()
        .onClick(() => {
          modal.close();
          resolve(inputComponent?.getValue() || null);
        });

      new ButtonComponent(buttonContainer)
        .setButtonText('Cancel')
        .onClick(() => {
          modal.close();
          resolve(null);
        });

      modal.open();
    });
  }

  private handleError(message: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.plugin.debugLogger?.log(message, errorMessage);
    new Notice(`${message}: ${errorMessage}`, 8000);
  }

  private isValidDate(year: number, month: number): boolean {
    return year >= 1000 && year <= 9999 && month >= 1 && month <= 12;
  }

  private getMonthName(month: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return monthNames[month - 1] || 'Invalid Month';
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();

    // Reset state
    this.isGenerating = false;
    this.availableMonths = [];
    this.availableTemplates = [];
  }
}
