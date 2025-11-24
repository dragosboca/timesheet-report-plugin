import { ItemView, WorkspaceLeaf } from 'obsidian';
import TimesheetReportPlugin from './main';
import { ChartRenderer } from './chart-renderer';
import { DataProcessor } from './data-processor';

export const VIEW_TYPE_TIMESHEET = 'timesheet-report-view';

export class TimesheetReportView extends ItemView {
  /**
   * Helper to create a button and attach a click handler
   */
  private createButton(parent: HTMLElement, options: { cls: string, text: string, onClick: () => void }): HTMLButtonElement {
    const btn = parent.createEl('button', {
      cls: options.cls,
      text: options.text
    });
    btn.addEventListener('click', options.onClick);
    return btn;
  }
  private plugin: TimesheetReportPlugin;
  public contentEl: HTMLElement;
  private chartRenderer: ChartRenderer;
  private dataProcessor: DataProcessor;
  private isLoading = false;

  constructor(leaf: WorkspaceLeaf, plugin: TimesheetReportPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.dataProcessor = new DataProcessor(this.plugin);
    this.chartRenderer = new ChartRenderer(this.plugin.settings, this.dataProcessor);
  }

  getViewType(): string {
    return VIEW_TYPE_TIMESHEET;
  }

  getDisplayText(): string {
    return 'Timesheet Report';
  }

  getIcon(): string {
    return 'calendar-clock';
  }

  async onOpen() {
    this.contentEl = this.containerEl.children[1] as HTMLElement;
    this.contentEl.empty();

    this.contentEl.createEl('div', {
      cls: 'timesheet-report-header',
      text: 'Timesheet Report'
    });

    // Create debug log container if debug mode is enabled
    if (this.plugin.settings.debugMode) {
      const debugContainer = this.contentEl.createEl('div', {
        cls: 'timesheet-debug-container'
      });

      const debugHeader = debugContainer.createEl('div', {
        cls: 'timesheet-debug-header'
      });

      debugHeader.createEl('span', {
        text: 'Debug Log'
      });

      const clearButton = debugHeader.createEl('button', {
        cls: 'timesheet-debug-clear-button',
        text: 'Clear'
      });

      clearButton.addEventListener('click', () => {
        this.plugin.debugLogger.clear();
      });

      const debugLogContainer = debugContainer.createEl('div', {
        cls: 'timesheet-debug-log'
      });

      this.plugin.debugLogger.setLogElement(debugLogContainer);
      this.plugin.debugLogger.log('View opened');
    }

    await this.renderReport();
  }

  async renderReport() {
    if (this.isLoading) return;

    this.isLoading = true;

    if (this.plugin.settings.debugMode) {
      this.plugin.debugLogger.log('Starting report generation');
    }

    // Clear previous content
    const mainContainer = this.contentEl.querySelector('.timesheet-report-container');
    if (mainContainer) {
      mainContainer.remove();
    }

    const loadingEl = this.contentEl.createEl('div', {
      cls: 'timesheet-loading',
      text: 'Loading timesheet data...'
    });

    try {
      // Create main container
      const container = this.contentEl.createEl('div', {
        cls: 'timesheet-report-container'
      });

      if (this.plugin.settings.debugMode) {
        this.plugin.debugLogger.log('Processing timesheet data...');
      }

      // Process data
      const reportData = await this.dataProcessor.processTimesheetData();

      if (this.plugin.settings.debugMode) {
        this.plugin.debugLogger.log('Data processed successfully', {
          totalEntries: reportData.monthlyData.length,
          currentYear: reportData.currentYear,
          yearTotalHours: reportData.yearSummary.totalHours,
          allTimeTotalHours: reportData.allTimeSummary.totalHours
        });
      }

      // Render summary cards
      this.renderSummaryCards(container, reportData);

      // Render target hours information
      if (this.plugin.settings.debugMode) {
        this.renderTargetHoursSection(container);
      }
      // Render trend charts
      const chartContainer = container.createEl('div', {
        cls: 'timesheet-chart-container'
      });
      await this.chartRenderer.renderTrendChart(chartContainer, reportData.trendData);

      // Render monthly breakdown charts
      const monthlyChartContainer = container.createEl('div', {
        cls: 'timesheet-monthly-chart-container'
      });
      await this.chartRenderer.renderMonthlyChart(monthlyChartContainer, reportData.monthlyData);

      // Render data table
      this.renderDataTable(container, reportData);

      if (this.plugin.settings.debugMode) {
        this.plugin.debugLogger.log('Report rendered successfully');
      }

    } catch (error) {
      const errorContainer = this.contentEl.createEl('div', {
        cls: 'timesheet-error',
        text: `Error generating report: ${error.message}`
      });

      // Add diagnostic information
      const diagnosticResult = await this.diagnoseTimesheetFolder();

      errorContainer.createEl('div', {
        cls: 'timesheet-error-diagnostic',
        text: `Diagnostic information: ${diagnosticResult}`
      });

      // Add a hint about settings
      errorContainer.createEl('p', {
        text: 'You may need to check your plugin settings in Obsidian settings.'
      });

      console.error('Timesheet report error:', error);

      if (this.plugin.settings.debugMode) {
        this.plugin.debugLogger.log('Error generating report', error);
      }
    } finally {
      // Remove loading indicator
      loadingEl.remove();
      this.isLoading = false;

      // Remove any existing button containers to prevent duplicates
      const existingButtonContainers = this.contentEl.querySelectorAll('.timesheet-button-container');
      existingButtonContainers.forEach(container => container.remove());

      // Add button container and buttons at the bottom after everything is loaded
      const buttonContainer = this.contentEl.createEl('div', {
        cls: 'timesheet-button-container'
      });
      this.createButton(buttonContainer, {
        cls: 'timesheet-refresh-button',
        text: 'Refresh Report',
        onClick: async () => {
          await this.renderReport();
        }
      });
      this.createButton(buttonContainer, {
        cls: 'timesheet-generate-report-button',
        text: 'Generate Monthly Report',
        onClick: async () => {
          await this.plugin.showReportGeneratorModal();
        }
      });
    }
  }

  private renderSummaryCards(container: HTMLElement, data: { currentYear: string | number; yearSummary: { totalHours: number; totalInvoiced: number; utilization: number; }; allTimeSummary: { totalHours: number; totalInvoiced: number; utilization: number; }; }) {
    const summaryContainer = container.createEl('div', {
      cls: 'timesheet-summary-container'
    });

    // Current year summary
    const currentYearSummary = summaryContainer.createEl('div', {
      cls: 'timesheet-summary-card'
    });

    currentYearSummary.createEl('h3', {
      text: `${data.currentYear} Summary`
    });

    const currentYearStats = currentYearSummary.createEl('div', {
      cls: 'timesheet-summary-stats'
    });

    currentYearStats.createEl('div', {
      cls: 'timesheet-stat',
      attr: { 'data-label': 'Hours' },
      text: this.formatNumber(data.yearSummary.totalHours)
    });

    currentYearStats.createEl('div', {
      cls: 'timesheet-stat',
      attr: { 'data-label': 'Invoiced' },
      text: `€${this.formatNumber(data.yearSummary.totalInvoiced)}`
    });

    currentYearStats.createEl('div', {
      cls: 'timesheet-stat',
      attr: { 'data-label': 'Utilization' },
      text: `${Math.round(data.yearSummary.utilization * 100)}%`
    });

    // All-time summary
    const allTimeSummary = summaryContainer.createEl('div', {
      cls: 'timesheet-summary-card'
    });

    allTimeSummary.createEl('h3', {
      text: 'All-Time Summary'
    });

    const allTimeStats = allTimeSummary.createEl('div', {
      cls: 'timesheet-summary-stats'
    });

    allTimeStats.createEl('div', {
      cls: 'timesheet-stat',
      attr: { 'data-label': 'Hours' },
      text: this.formatNumber(data.allTimeSummary.totalHours)
    });

    allTimeStats.createEl('div', {
      cls: 'timesheet-stat',
      attr: { 'data-label': 'Invoiced' },
      text: `€${this.formatNumber(data.allTimeSummary.totalInvoiced)}`
    });

    allTimeStats.createEl('div', {
      cls: 'timesheet-stat',
      attr: { 'data-label': 'Utilization' },
      text: `${Math.round(data.allTimeSummary.utilization * 100)}%`
    });
  }

  private renderDataTable(container: HTMLElement, data: { monthlyData: Array<{ label: string; hours: number; invoiced: number; rate: number; utilization: number; }> }) {
    const tableContainer = container.createEl('div', {
      cls: 'timesheet-table-container'
    });

    const table = tableContainer.createEl('table', {
      cls: 'timesheet-data-table'
    });

    // Table header
    const thead = table.createEl('thead');
    const headerRow = thead.createEl('tr');

    ['Period', 'Hours', 'Invoiced', 'Rate', 'Utilization'].forEach(header => {
      headerRow.createEl('th', { text: header });
    });

    // Table body
    const tbody = table.createEl('tbody');

    data.monthlyData.forEach((month) => {
      const row = tbody.createEl('tr');

      row.createEl('td', { text: month.label });
      row.createEl('td', { text: this.formatNumber(month.hours) });
      row.createEl('td', { text: `€${this.formatNumber(month.invoiced)}` });
      row.createEl('td', { text: `€${this.formatNumber(month.rate)}` });
      row.createEl('td', { text: `${Math.round(month.utilization * 100)}%` });
    });
  }

  private formatNumber(num: number): string {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  /**
   * Renders a section showing target hours calculation based on working days
   * @param container - The parent container to add the section to
   */
  private renderTargetHoursSection(container: HTMLElement): void {
    const infoContainer = container.createEl('div', {
      cls: 'timesheet-report-info-section'
    });

    infoContainer.createEl('h3', { text: 'Target Hours Calculation' });

    try {
      // Get current month and year
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based

      if (this.plugin.settings.debugMode) {
        this.plugin.debugLogger.log('Rendering target hours section', {
          currentYear,
          currentMonth,
          settings: this.plugin.settings
        });
      }

      // Check if hoursPerWorkday exists in settings
      const hoursPerDay = this.plugin.settings.hoursPerWorkday || 8; // Default to 8 if setting doesn't exist

      // Use the data processor to calculate working days and target hours
      const workingDays = this.dataProcessor.getWorkingDaysInMonth(currentYear, currentMonth);
      const targetHours = this.dataProcessor.calculateTargetHoursForMonth(
        currentYear,
        currentMonth,
        hoursPerDay
      );

      // Create info text
      const monthName = new Date(currentYear, currentMonth - 1, 1).toLocaleString('default', { month: 'long' });

      infoContainer.createEl('p', {
        text: `${monthName} ${currentYear} has ${workingDays} working days (Mon-Fri)`
      });

      infoContainer.createEl('p', {
        text: `Target hours: ${workingDays} days × ${hoursPerDay} hours = ${targetHours} hours`
      });

      // Add note about customization
      infoContainer.createEl('p', {
        cls: 'timesheet-report-note',
        text: 'Note: You can change the hours per workday in plugin settings.'
      });
    } catch (error) {
      infoContainer.createEl('p', {
        cls: 'timesheet-error',
        text: `Error calculating target hours: ${error.message}`
      });

      if (this.plugin.settings.debugMode) {
        this.plugin.debugLogger.log('Error in renderTargetHoursSection', error);
      }
      console.error('Error in renderTargetHoursSection:', error);
    }
  }

  // Diagnose potential issues with the timesheet folder configuration
  private async diagnoseTimesheetFolder() {
    const diagnosticContainer = this.contentEl.createDiv({ cls: 'timesheet-diagnostic' });
    diagnosticContainer.createEl('h2', { text: 'Timesheet Folder Diagnostics' });

    const timesheetFolder = this.plugin.settings.timesheetFolder;

    try {
      // Check if folder exists
      const folder = this.plugin.app.vault.getAbstractFileByPath(timesheetFolder);

      if (!folder) {
        diagnosticContainer.createEl('p', {
          text: `❌ Folder not found: "${timesheetFolder}"`,
          cls: 'diagnostic-error'
        });

        // List available top-level folders to help the user choose the correct one
        const rootFolders = this.plugin.app.vault.getRoot().children
          .filter(file => 'children' in file) // Check if it's a folder
          .map(folder => folder.path);

        const foldersEl = diagnosticContainer.createEl('div', {
          cls: 'diagnostic-folders'
        });

        foldersEl.createEl('p', { text: 'Available top-level folders:' });
        const foldersList = foldersEl.createEl('ul');

        rootFolders.forEach(folderPath => {
          const item = foldersList.createEl('li');
          item.createEl('code', { text: folderPath });
        });

        return;
      }

      diagnosticContainer.createEl('p', {
        text: `✅ Folder exists: "${timesheetFolder}"`,
        cls: 'diagnostic-success'
      });

      // Check for markdown files in the folder
      const allFiles = this.plugin.app.vault.getMarkdownFiles();
      const folderFiles = allFiles
        .filter(file => file.path.startsWith(timesheetFolder + '/'))
        .map(file => file.path);

      if (folderFiles.length === 0) {
        diagnosticContainer.createEl('p', {
          text: `❌ No markdown files found in folder "${timesheetFolder}"`,
          cls: 'diagnostic-error'
        });
        return;
      }

      diagnosticContainer.createEl('p', {
        text: `✅ Found ${folderFiles.length} markdown files in folder`,
        cls: 'diagnostic-success'
      });

      // Show a few example files
      const exampleFiles = folderFiles.slice(0, 5).join(", ");
      const moreFiles = folderFiles.length > 5 ? ` and ${folderFiles.length - 5} more...` : "";

      diagnosticContainer.createEl('p', {
        text: `Example files: ${exampleFiles}${moreFiles}`,
        cls: 'diagnostic-info'
      });

    } catch (error) {
      diagnosticContainer.createEl('p', {
        text: `❌ Error diagnosing folder: ${error.message}`,
        cls: 'diagnostic-error'
      });
    }
  }

  // Diagnose date extraction from timesheet files
  private async diagnoseTimesheetDates() {
    const diagnosticContainer = this.contentEl.createDiv({ cls: 'timesheet-diagnostic' });
    diagnosticContainer.createEl('h2', { text: 'Timesheet Date Extraction Diagnostics' });

    const timesheetFolder = this.plugin.settings.timesheetFolder;

    try {
      // Check if folder exists
      const folder = this.plugin.app.vault.getAbstractFileByPath(timesheetFolder);

      if (!folder) {
        diagnosticContainer.createEl('p', {
          text: `❌ Folder not found: "${timesheetFolder}"`,
          cls: 'diagnostic-error'
        });
        return;
      }

      // Get timesheet files
      const allFiles = this.plugin.app.vault.getMarkdownFiles();
      const timesheetFiles = allFiles.filter(file =>
        file.path.startsWith(timesheetFolder + '/') && file.extension === 'md'
      );

      if (timesheetFiles.length === 0) {
        diagnosticContainer.createEl('p', {
          text: `❌ No markdown files found in folder "${timesheetFolder}"`,
          cls: 'diagnostic-error'
        });
        return;
      }

      diagnosticContainer.createEl('p', {
        text: `Checking ${timesheetFiles.length} timesheet files for valid dates...`,
        cls: 'diagnostic-info'
      });

      // Create a table for results
      const table = diagnosticContainer.createEl('table', { cls: 'diagnostic-table' });
      const thead = table.createEl('thead');
      const headerRow = thead.createEl('tr');
      headerRow.createEl('th', { text: 'File' });
      headerRow.createEl('th', { text: 'Date Extracted' });
      headerRow.createEl('th', { text: 'Source' });
      headerRow.createEl('th', { text: 'Status' });

      const tbody = table.createEl('tbody');

      // Check the first 10 files (to avoid too much processing)
      const filesToCheck = timesheetFiles.slice(0, 10);
      let successCount = 0;
      let failCount = 0;

      for (const file of filesToCheck) {
        // Read file content
        const content = await this.plugin.app.vault.read(file);

        // Extract YAML frontmatter if present
        let yamlSection = '';
        let inYaml = false;
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim() === '---') {
            if (!inYaml) {
              inYaml = true;
            } else {
              break;
            }
          } else if (inYaml) {
            yamlSection += lines[i] + '\n';
          }
        }

        // Try to extract date using dataProcessor methods
        // We're accessing a method that's intended for internal use, but for diagnostics it's helpful
        const date = this.dataProcessor.extractDateFromFile(file, yamlSection);

        const row = tbody.createEl('tr');
        row.createEl('td', { text: file.basename });

        if (date && !isNaN(date.getTime())) {
          successCount++;

          // Determine source of date extraction
          let source = 'unknown';
          if (file.basename.match(/\d{4}-\d{2}-\d{2}/)) {
            source = 'filename';
          } else if (yamlSection.match(/date:\s*[\d-/]+/)) {
            source = 'yaml';
          } else if (file.path.match(/\/\d{4}-\d{2}-\d{2}/)) {
            source = 'path';
          }

          row.createEl('td', { text: date.toISOString().split('T')[0] });
          row.createEl('td', { text: source });
          row.createEl('td', { text: '✅ Valid' });
        } else {
          failCount++;
          row.createEl('td', { text: 'Not found' });
          row.createEl('td', { text: 'N/A' });
          row.createEl('td', { text: '❌ Invalid' });
        }
      }

      // Show summary
      const remainingFiles = timesheetFiles.length - filesToCheck.length;
      const summaryText = `Results: ${successCount} valid, ${failCount} invalid${remainingFiles > 0 ? ` (${remainingFiles} more files not shown)` : ''}`;

      diagnosticContainer.createEl('p', {
        text: summaryText,
        cls: failCount > 0 ? 'diagnostic-warning' : 'diagnostic-success'
      });

      // Show technical details about regex patterns used
      if (this.plugin.settings.debugMode) {
        const technicalDetails = diagnosticContainer.createEl('details');
        technicalDetails.createEl('summary', { text: 'Technical Details' });

        const patterns = technicalDetails.createEl('div', { cls: 'diagnostic-patterns' });
        patterns.createEl('p', { text: 'Regular expressions used for date extraction:' });

        const patternsList = patterns.createEl('ul');

        const liFilename = patternsList.createEl('li');
        liFilename.createEl('span', { text: 'Filename: ' });
        liFilename.createEl('code', { text: '/(\\d{4})-(\\d{2})-(\\d{2})/' });

        const liYaml = patternsList.createEl('li');
        liYaml.createEl('span', { text: 'YAML: ' });
        liYaml.createEl('code', { text: '/date:\\s*([\\d-/]+)/' });

        const liPath = patternsList.createEl('li');
        liPath.createEl('span', { text: 'Path: ' });
        liPath.createEl('code', { text: '/\\/(\\d{4})-(\\d{2})-(\\d{2})/' });
      }

    } catch (error) {
      diagnosticContainer.createEl('p', {
        text: `❌ Error diagnosing dates: ${error.message}`,
        cls: 'diagnostic-error'
      });

      if (this.plugin.settings.debugMode) {
        diagnosticContainer.createEl('pre', {
          text: error.stack,
          cls: 'diagnostic-stack'
        });
      }
    }
  }
}
