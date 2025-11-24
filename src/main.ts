import { Plugin } from 'obsidian';
import { TimesheetReportView, VIEW_TYPE_TIMESHEET } from './view';
import { TimesheetReportSettings, DEFAULT_SETTINGS, TimesheetReportSettingTab } from './settings';
import { DebugLogger } from './debug-logger';
import { ReportGenerator } from './report-generator';
import { EmbedProcessor } from './embed-processor';

export default class TimesheetReportPlugin extends Plugin {
  settings: TimesheetReportSettings;
  debugLogger: DebugLogger;
  reportGenerator: ReportGenerator;
  embedProcessor: EmbedProcessor;

  async onload() {
    await this.loadSettings();

    // Initialize debug logger
    this.debugLogger = DebugLogger.getInstance();
    this.debugLogger.enable(this.settings.debugMode);

    // Initialize report generator
    this.reportGenerator = new ReportGenerator(this);

    // Initialize embed processor
    this.embedProcessor = new EmbedProcessor(this);
    this.embedProcessor.registerProcessor();

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
    const loadedData = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);

    // Migration: Remove legacy targetHoursPerMonth setting
    let needsSave = false;
    if (loadedData && 'targetHoursPerMonth' in loadedData) {
      console.log('Migrating legacy targetHoursPerMonth setting');
      // Remove the legacy property
      delete (this.settings as any).targetHoursPerMonth;
      needsSave = true;
    }

    // Ensure hoursPerWorkday exists, add it if not
    if (this.settings.hoursPerWorkday === undefined) {
      console.log('Setting default hoursPerWorkday');
      this.settings.hoursPerWorkday = 8;
      needsSave = true;
    }

    // Save settings if migration was needed
    if (needsSave) {
      await this.saveSettings();
    }

    // Log settings after loading and migration
    if (this.settings.debugMode) {
      console.log('Loaded settings:', this.settings);
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
