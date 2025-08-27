import { App, PluginSettingTab, Setting } from 'obsidian';
import TimesheetReportPlugin from './main';

export interface TimesheetReportSettings {
    timesheetFolder: string;
    currencySymbol: string;
    targetHoursPerMonth: number;  // Legacy setting, kept for backwards compatibility
    hoursPerWorkday: number;      // New setting for hours per working day
    refreshInterval: number;
    debugMode: boolean;
    reportTemplateFolder: string; // Folder containing report templates
    reportOutputFolder: string;   // Where to save generated reports
    defaultReportTemplate: string; // Default template for report generation
    chartColors: {
        primary: string;
        secondary: string;
        tertiary: string;
        quaternary: string;
        background: string;
    };
}

export const DEFAULT_SETTINGS: TimesheetReportSettings = {
    timesheetFolder: 'Timesheets',
    currencySymbol: '€',
    targetHoursPerMonth: 168,  // Legacy setting
    hoursPerWorkday: 8,        // Default 8 hours per workday
    refreshInterval: 60,       // in minutes
    debugMode: false,
    reportTemplateFolder: 'Templates',
    reportOutputFolder: 'Reports/Timesheet',
    defaultReportTemplate: '',
    chartColors: {
        primary: '#4f81bd',
        secondary: '#c0504d',
        tertiary: '#9bbb59',
        quaternary: '#8064a2',
        background: 'rgba(0, 0, 0, 0.05)',
    }
};

export class TimesheetReportSettingTab extends PluginSettingTab {
    plugin: TimesheetReportPlugin;

    constructor(app: App, plugin: TimesheetReportPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Timesheet Report Settings' });

        // Timesheet folder path
        new Setting(containerEl)
            .setName('Timesheet Folder')
            .setDesc('The folder where your timesheet files are stored')
            .addText(text => text
                .setPlaceholder('Timesheets')
                .setValue(this.plugin.settings.timesheetFolder)
                .onChange(async (value) => {
                    this.plugin.settings.timesheetFolder = value;
                    await this.plugin.saveSettings();
                }));

        // Currency symbol
        new Setting(containerEl)
            .setName('Currency Symbol')
            .setDesc('Symbol to use for monetary values')
            .addText(text => text
                .setPlaceholder('€')
                .setValue(this.plugin.settings.currencySymbol)
                .onChange(async (value) => {
                    this.plugin.settings.currencySymbol = value;
                    await this.plugin.saveSettings();
                }));

        // Target hours per month (legacy)
        new Setting(containerEl)
            .setName('Target Hours Per Month (Legacy)')
            .setDesc('This setting is now calculated automatically based on working days in the month (M-F) and hours per workday')
            .addText(text => text
                .setPlaceholder('168')
                .setValue(String(this.plugin.settings.targetHoursPerMonth))
                .setDisabled(true));

        // Hours per workday
        new Setting(containerEl)
            .setName('Hours Per Workday')
            .setDesc('Number of working hours per day (used for utilization calculation)')
            .addText(text => text
                .setPlaceholder('8')
                .setValue(String(this.plugin.settings.hoursPerWorkday))
                .onChange(async (value) => {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue > 0) {
                        this.plugin.settings.hoursPerWorkday = numValue;
                        await this.plugin.saveSettings();
                    }
                }));

        // Auto-refresh interval
        new Setting(containerEl)
            .setName('Auto-refresh Interval (minutes)')
            .setDesc('How often to automatically refresh the report (0 to disable)')
            .addText(text => text
                .setPlaceholder('60')
                .setValue(String(this.plugin.settings.refreshInterval))
                .onChange(async (value) => {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue >= 0) {
                        this.plugin.settings.refreshInterval = numValue;
                        await this.plugin.saveSettings();
                    }
                }));

        // Debug mode
        new Setting(containerEl)
            .setName('Debug Mode')
            .setDesc('Enable debug logging for troubleshooting')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.debugMode)
                .onChange(async (value) => {
                    this.plugin.settings.debugMode = value;
                    await this.plugin.saveSettings();
                }));

        // Report Generation section
        containerEl.createEl('h3', { text: 'Report Generation Settings' });

        // Report template folder
        new Setting(containerEl)
            .setName('Report Template Folder')
            .setDesc('The folder where your report templates are stored')
            .addText(text => text
                .setPlaceholder('Templates')
                .setValue(this.plugin.settings.reportTemplateFolder)
                .onChange(async (value) => {
                    this.plugin.settings.reportTemplateFolder = value;
                    await this.plugin.saveSettings();
                }));

        // Report output folder
        new Setting(containerEl)
            .setName('Report Output Folder')
            .setDesc('The folder where generated reports will be saved')
            .addText(text => text
                .setPlaceholder('Reports/Timesheet')
                .setValue(this.plugin.settings.reportOutputFolder)
                .onChange(async (value) => {
                    this.plugin.settings.reportOutputFolder = value;
                    await this.plugin.saveSettings();
                }));

        // Default report template
        new Setting(containerEl)
            .setName('Default Report Template')
            .setDesc('Default template to use for report generation (leave empty to use built-in template)')
            .addText(text => text
                .setPlaceholder('Templates/Monthly Report Template.md')
                .setValue(this.plugin.settings.defaultReportTemplate)
                .onChange(async (value) => {
                    this.plugin.settings.defaultReportTemplate = value;
                    await this.plugin.saveSettings();
                }));

        // Color settings section
        containerEl.createEl('h3', { text: 'Chart Colors' });

        // Primary color
        new Setting(containerEl)
            .setName('Primary Color')
            .setDesc('Main chart color (for hours)')
            .addText(text => text
                .setPlaceholder('#4f81bd')
                .setValue(this.plugin.settings.chartColors.primary)
                .onChange(async (value) => {
                    this.plugin.settings.chartColors.primary = value;
                    await this.plugin.saveSettings();
                }));

        // Secondary color
        new Setting(containerEl)
            .setName('Secondary Color')
            .setDesc('Secondary chart color (for utilization)')
            .addText(text => text
                .setPlaceholder('#c0504d')
                .setValue(this.plugin.settings.chartColors.secondary)
                .onChange(async (value) => {
                    this.plugin.settings.chartColors.secondary = value;
                    await this.plugin.saveSettings();
                }));

        // Tertiary color
        new Setting(containerEl)
            .setName('Tertiary Color')
            .setDesc('Third chart color (for invoiced amounts)')
            .addText(text => text
                .setPlaceholder('#9bbb59')
                .setValue(this.plugin.settings.chartColors.tertiary)
                .onChange(async (value) => {
                    this.plugin.settings.chartColors.tertiary = value;
                    await this.plugin.saveSettings();
                }));

        // Quaternary color
        new Setting(containerEl)
            .setName('Quaternary Color')
            .setDesc('Fourth chart color (for additional metrics)')
            .addText(text => text
                .setPlaceholder('#8064a2')
                .setValue(this.plugin.settings.chartColors.quaternary)
                .onChange(async (value) => {
                    this.plugin.settings.chartColors.quaternary = value;
                    await this.plugin.saveSettings();
                }));

        // Background color
        new Setting(containerEl)
            .setName('Background Color')
            .setDesc('Chart background color')
            .addText(text => text
                .setPlaceholder('rgba(0, 0, 0, 0.05)')
                .setValue(this.plugin.settings.chartColors.background)
                .onChange(async (value) => {
                    this.plugin.settings.chartColors.background = value;
                    await this.plugin.saveSettings();
                }));
    }
}
