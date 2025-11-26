import { Plugin } from 'obsidian';
import { TimesheetReportView, VIEW_TYPE_TIMESHEET } from './view';
import { TimesheetReportSettings, DEFAULT_SETTINGS, TimesheetReportSettingTab } from './settings';
import { DebugLogger } from './debug-logger';
import { ReportGenerator } from './reports';
import { EmbedProcessor } from './embed-processor';
import { QueryExecutor } from './query';
// Import Chart.js initialization to register all required components
import './charts/chartjs-init';

export default class TimesheetReportPlugin extends Plugin {
  settings: TimesheetReportSettings;
  debugLogger: DebugLogger;
  reportGenerator: ReportGenerator;
  embedProcessor: EmbedProcessor;
  queryExecutor: QueryExecutor;

  async onload() {
    await this.loadSettings();

    // Initialize debug logger
    this.debugLogger = DebugLogger.getInstance();
    this.debugLogger.enable(this.settings.debugMode);

    // Initialize query executor
    this.queryExecutor = new QueryExecutor(this);

    // Initialize report generator
    this.reportGenerator = new ReportGenerator(this);

    // Initialize embed processor
    this.embedProcessor = new EmbedProcessor(this);
    this.embedProcessor.registerProcessor();

    this.debugLogger.log('Plugin loading with unified architecture');

    // Listen for theme changes to refresh chart colors
    this.registerEvent(this.app.workspace.on('css-change', () => {
      // Refresh any open timesheet views when theme changes
      this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMESHEET).forEach(leaf => {
        if (leaf.view instanceof TimesheetReportView) {
          leaf.view.refresh();
        }
      });
    }));

    // Plugin loaded successfully

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

    // Add command to generate interval report
    this.addCommand({
      id: 'generate-interval-report',
      name: 'Generate Timesheet Report',
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

    // Ensure hoursPerWorkday exists, add it if not
    if (this.settings.hoursPerWorkday === undefined) {
      console.log('Setting default hoursPerWorkday');
      this.settings.hoursPerWorkday = 8;
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
    // Clear any cached data
    if (this.queryExecutor) {
      this.queryExecutor.clearCache();
    }
    // Plugin cleanup - views will be automatically cleaned up
  }

  /**
   * Show modal for generating interval reports
   */
  async showReportGeneratorModal(): Promise<void> {
    const { IntervalReportModal } = await import('./reports');
    new IntervalReportModal(this).open();
  }
}
