import { Plugin, TFile, WorkspaceLeaf } from 'obsidian';
import { TimesheetReportView, VIEW_TYPE_TIMESHEET } from './view';
import { DEFAULT_SETTINGS, TimesheetReportSettings, TimesheetReportSettingTab } from './settings';
import { DebugLogger } from './debug-logger';
import { ReportGenerator } from './report-generator';

export default class TimesheetReportPlugin extends Plugin {
    settings: TimesheetReportSettings;
    debugLogger: DebugLogger;
    reportGenerator: ReportGenerator;

    async onload() {
        await this.loadSettings();

        // Initialize debug logger
        this.debugLogger = DebugLogger.getInstance();
        this.debugLogger.enable(this.settings.debugMode);

        // Initialize report generator
        this.reportGenerator = new ReportGenerator(this);

        this.debugLogger.log('Plugin loading');

        // Enable debug mode for quick diagnostics
        console.log('Timesheet Report Plugin loaded with settings:', this.settings);

        // Register view
        this.registerView(
            VIEW_TYPE_TIMESHEET,
            (leaf) => new TimesheetReportView(leaf, this)
        );

        // Add ribbon icon
        this.addRibbonIcon('calendar-clock', 'Timesheet Report', () => {
            this.activateView();
        });

        // Add command to open timesheet report
        this.addCommand({
            id: 'open-timesheet-report',
            name: 'Open Timesheet Report',
            callback: () => {
                this.activateView();
            },
        });

        // Add command to generate monthly report
        this.addCommand({
            id: 'generate-monthly-report',
            name: 'Generate Monthly Timesheet Report',
            callback: () => {
                this.showReportGeneratorModal();
            },
        });

        // Add settings tab
        this.addSettingTab(new TimesheetReportSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

        // Log settings after loading
        if (this.settings.debugMode) {
            console.log('Loaded settings:', this.settings);

            // Ensure hoursPerWorkday exists, add it if not
            if (this.settings.hoursPerWorkday === undefined) {
                console.log('Setting default hoursPerWorkday');
                this.settings.hoursPerWorkday = 8;
                await this.saveSettings();
            }
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);
    } async activateView() {
        const { workspace } = this.app;

        // Check if view is already open
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_TIMESHEET)[0];

        if (!leaf) {
            // Create new leaf in a new tab by default
            leaf = workspace.getLeaf('tab');
            await leaf.setViewState({
                type: VIEW_TYPE_TIMESHEET,
                active: true,
            });
        }

        // Reveal the leaf in case it's in a collapsed sidebar
        workspace.revealLeaf(leaf);
    }

    onunload() {
        // Clean up when the plugin is disabled
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMESHEET);
    }

    /**
     * Show modal for generating monthly reports
     */
    async showReportGeneratorModal(): Promise<void> {
        const { ReportGeneratorModal } = await import('./report-generator-modal');
        new ReportGeneratorModal(this.app, this).open();
    }
}
