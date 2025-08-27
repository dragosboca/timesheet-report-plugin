import { App, Modal, Setting, TFile, Notice } from 'obsidian';
import TimesheetReportPlugin from './main';

export class ReportGeneratorModal extends Modal {
    private plugin: TimesheetReportPlugin;
    private selectedYear: number;
    private selectedMonth: number;
    private selectedTemplate: string;
    private availableMonths: { year: number, month: number, label: string }[] = [];
    private availableTemplates: TFile[] = [];

    constructor(app: App, plugin: TimesheetReportPlugin) {
        super(app);
        this.plugin = plugin;

        // Default to current month/year
        const now = new Date();
        this.selectedYear = now.getFullYear();
        this.selectedMonth = now.getMonth() + 1;
        this.selectedTemplate = plugin.settings.defaultReportTemplate || '';
    }

    async onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', { text: 'Generate Monthly Timesheet Report' });

        // Load available months and templates
        await this.loadAvailableData();

        // Month/Year selection
        await this.renderMonthSelection(contentEl);

        // Template selection
        await this.renderTemplateSelection(contentEl);

        // Generate button
        this.renderGenerateButton(contentEl);

        // Cancel button
        this.renderCancelButton(contentEl);
    }

    private async loadAvailableData() {
        try {
            // Load available months from timesheet data
            this.availableMonths = await this.plugin.reportGenerator.getAvailableMonths();

            // Load available templates
            this.availableTemplates = await this.plugin.reportGenerator.getAvailableTemplates();
        } catch (error) {
            console.error('Error loading available data:', error);
        }
    }

    private async renderMonthSelection(contentEl: HTMLElement) {
        const monthSetting = new Setting(contentEl)
            .setName('Select Month/Year')
            .setDesc('Choose the month and year for the report');

        // If we have available months, show a dropdown
        if (this.availableMonths.length > 0) {
            monthSetting.addDropdown(dropdown => {
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
                    const firstMonth = this.availableMonths[0];
                    const firstKey = `${firstMonth.year}-${String(firstMonth.month).padStart(2, '0')}`;
                    dropdown.setValue(firstKey);
                    this.selectedYear = firstMonth.year;
                    this.selectedMonth = firstMonth.month;
                }

                dropdown.onChange(value => {
                    const [year, month] = value.split('-');
                    this.selectedYear = parseInt(year);
                    this.selectedMonth = parseInt(month);
                });
            });
        } else {
            // Manual input if no months available
            monthSetting.addText(text => text
                .setPlaceholder('YYYY-MM')
                .setValue(`${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}`)
                .onChange(value => {
                    const [year, month] = value.split('-');
                    if (year && month) {
                        this.selectedYear = parseInt(year) || this.selectedYear;
                        this.selectedMonth = parseInt(month) || this.selectedMonth;
                    }
                }));

            contentEl.createEl('p', {
                cls: 'setting-item-description',
                text: 'No timesheet data found. Please enter month/year manually in YYYY-MM format.'
            });
        }
    }

    private async renderTemplateSelection(contentEl: HTMLElement) {
        const templateSetting = new Setting(contentEl)
            .setName('Select Template')
            .setDesc('Choose a template for the report (optional)');

        if (this.availableTemplates.length > 0) {
            templateSetting.addDropdown(dropdown => {
                // Add empty option for default template
                dropdown.addOption('', 'Use Default Template');

                this.availableTemplates.forEach(template => {
                    dropdown.addOption(template.path, template.basename);
                });

                dropdown.setValue(this.selectedTemplate);
                dropdown.onChange(value => {
                    this.selectedTemplate = value;
                });
            });
        } else {
            templateSetting.addText(text => text
                .setPlaceholder('Templates/My Report Template.md')
                .setValue(this.selectedTemplate)
                .onChange(value => {
                    this.selectedTemplate = value;
                }));

            contentEl.createEl('p', {
                cls: 'setting-item-description',
                text: 'No templates found in Templates folder. You can specify a template path or leave empty for default.'
            });
        }
    }

    private renderGenerateButton(contentEl: HTMLElement) {
        const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });

        const generateButton = buttonContainer.createEl('button', {
            cls: 'mod-cta',
            text: 'Generate Report'
        });

        generateButton.addEventListener('click', async () => {
            await this.generateReport();
        });
    }

    private renderCancelButton(contentEl: HTMLElement) {
        const buttonContainer = contentEl.querySelector('.modal-button-container') ||
            contentEl.createDiv({ cls: 'modal-button-container' });

        const cancelButton = buttonContainer.createEl('button', {
            text: 'Cancel'
        });

        cancelButton.addEventListener('click', () => {
            this.close();
        });
    }

    private async generateReport() {
        try {
            // Show loading state
            const generateButton = this.contentEl.querySelector('.mod-cta') as HTMLButtonElement;

            generateButton.textContent = 'Generating...';
            generateButton.disabled = true;

            // Generate the report
            await this.plugin.reportGenerator.generateMonthlyReport(
                this.selectedYear,
                this.selectedMonth,
                this.selectedTemplate || undefined
            );

            // Show success message
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const monthName = monthNames[this.selectedMonth - 1];

            new Notice(`Monthly report generated successfully for ${monthName} ${this.selectedYear}`);

            // Close modal
            this.close();

        } catch (error) {
            console.error('Error generating report:', error);
            new Notice(`Error generating report: ${error.message}`);

            // Restore button state
            const generateButton = this.contentEl.querySelector('.mod-cta') as HTMLButtonElement;
            generateButton.textContent = 'Generate Report';
            generateButton.disabled = false;
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
