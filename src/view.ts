import { ItemView, WorkspaceLeaf } from 'obsidian';
import TimesheetReportPlugin from './main';
import { ChartFactory } from './charts';
import { QueryProcessor } from './core/query-processor';
import { TimesheetQuery } from './query/interpreter';

export const VIEW_TYPE_TIMESHEET = 'timesheet-report-view';

export class TimesheetReportView extends ItemView {
  private plugin: TimesheetReportPlugin;
  public contentEl: HTMLElement;
  private chartFactory: ChartFactory;
  private queryProcessor: QueryProcessor;
  private isLoading = false;

  constructor(leaf: WorkspaceLeaf, plugin: TimesheetReportPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.queryProcessor = new QueryProcessor(this.plugin);
    this.chartFactory = new ChartFactory(this.plugin);
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

  /**
   * Refresh the view (useful for theme changes)
   */
  async refresh() {
    if (this.plugin.settings.debugMode) {
      this.plugin.debugLogger.log('Refreshing view due to theme change');
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

      // Create query for current year data
      const query: TimesheetQuery = {
        view: 'full',
        period: 'current-year',
        size: 'normal'
      };

      // Process data using QueryProcessor
      const reportData = await this.queryProcessor.processQuery(query);

      if (this.plugin.settings.debugMode) {
        this.plugin.debugLogger.log('Data processed successfully', {
          totalEntries: reportData.monthlyData.length,
          currentYear: new Date().getFullYear(),
          yearTotalHours: reportData.yearSummary.totalHours,
          allTimeTotalHours: reportData.allTimeSummary.totalHours
        });
      }

      // Render summary cards
      this.renderSummaryCards(container, {
        currentYear: new Date().getFullYear(),
        yearSummary: reportData.yearSummary,
        allTimeSummary: reportData.allTimeSummary
      });

      // Render target hours information
      if (this.plugin.settings.debugMode) {
        this.renderTargetHoursSection(container);
      }

      // Render trend chart using new ChartFactory
      const chartContainer = container.createEl('div', {
        cls: 'timesheet-chart-container'
      });
      const trendChart = this.chartFactory.createTrendChart(reportData.trendData);
      await trendChart.render({ container: chartContainer, dimensions: { height: 300 } });

      // Render monthly breakdown chart using new ChartFactory
      const monthlyChartContainer = container.createEl('div', {
        cls: 'timesheet-monthly-chart-container'
      });
      const monthlyChart = this.chartFactory.createMonthlyChart(reportData.monthlyData);
      await monthlyChart.render({ container: monthlyChartContainer, dimensions: { height: 300 } });

      // Render data table
      this.renderDataTable(container, reportData.monthlyData);

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
        text: 'Generate Report',
        onClick: async () => {
          await this.plugin.showReportGeneratorModal();
        }
      });
    }
  }

  private renderSummaryCards(
    container: HTMLElement,
    data: {
      currentYear: number;
      yearSummary: {
        totalHours: number;
        totalInvoiced: number;
        utilization: number;
        budgetHours?: number;
        budgetProgress?: number;
        budgetRemaining?: number;
      };
      allTimeSummary: {
        totalHours: number;
        totalInvoiced: number;
        utilization: number;
        budgetHours?: number;
        budgetProgress?: number;
        budgetRemaining?: number;
      };
    }
  ) {
    const summaryContainer = container.createEl('div', {
      cls: 'timesheet-summary-container'
    });

    // Title
    summaryContainer.createEl('h2', { text: 'Summary' });

    // Two-column layout
    const summaryGrid = summaryContainer.createEl('div', {
      cls: 'timesheet-summary-grid'
    });

    // Current Year Column
    const currentYearColumn = summaryGrid.createEl('div', {
      cls: 'timesheet-summary-column'
    });

    currentYearColumn.createEl('h3', {
      text: `${data.currentYear}`
    });

    const currentYearTable = currentYearColumn.createEl('table', {
      cls: 'timesheet-summary-table'
    });

    const currentYearBody = currentYearTable.createEl('tbody');

    // Hours row
    const hoursRow = currentYearBody.createEl('tr');
    hoursRow.createEl('td', { text: 'Hours', cls: 'summary-label' });
    hoursRow.createEl('td', { text: `${this.formatNumber(data.yearSummary.totalHours)}h`, cls: 'summary-value' });

    // Invoiced row
    const invoicedRow = currentYearBody.createEl('tr');
    invoicedRow.createEl('td', { text: 'Invoiced', cls: 'summary-label' });
    invoicedRow.createEl('td', { text: `€${this.formatNumber(data.yearSummary.totalInvoiced)}`, cls: 'summary-value' });

    // Budget or Utilization
    if (data.yearSummary.budgetHours !== undefined && data.yearSummary.budgetHours > 0) {
      const progressRow = currentYearBody.createEl('tr');
      progressRow.createEl('td', { text: 'Progress', cls: 'summary-label' });
      progressRow.createEl('td', { text: `${Math.round((data.yearSummary.budgetProgress || 0) * 100)}%`, cls: 'summary-value' });

      const remainingRow = currentYearBody.createEl('tr');
      remainingRow.createEl('td', { text: 'Remaining', cls: 'summary-label' });
      remainingRow.createEl('td', { text: `${this.formatNumber(data.yearSummary.budgetRemaining || 0)}h`, cls: 'summary-value' });
    } else {
      const utilizationRow = currentYearBody.createEl('tr');
      utilizationRow.createEl('td', { text: 'Utilization', cls: 'summary-label' });
      utilizationRow.createEl('td', { text: `${Math.round(data.yearSummary.utilization * 100)}%`, cls: 'summary-value' });
    }

    // All Time Column
    const allTimeColumn = summaryGrid.createEl('div', {
      cls: 'timesheet-summary-column'
    });

    allTimeColumn.createEl('h3', {
      text: 'All Time'
    });

    const allTimeTable = allTimeColumn.createEl('table', {
      cls: 'timesheet-summary-table'
    });

    const allTimeBody = allTimeTable.createEl('tbody');

    // All time hours
    const allTimeHoursRow = allTimeBody.createEl('tr');
    allTimeHoursRow.createEl('td', { text: 'Hours', cls: 'summary-label' });
    allTimeHoursRow.createEl('td', { text: `${this.formatNumber(data.allTimeSummary.totalHours)}h`, cls: 'summary-value' });

    // All time invoiced
    const allTimeInvoicedRow = allTimeBody.createEl('tr');
    allTimeInvoicedRow.createEl('td', { text: 'Invoiced', cls: 'summary-label' });
    allTimeInvoicedRow.createEl('td', { text: `€${this.formatNumber(data.allTimeSummary.totalInvoiced)}`, cls: 'summary-value' });

    // All time budget or utilization
    if (data.allTimeSummary.budgetHours !== undefined && data.allTimeSummary.budgetHours > 0) {
      const progressRow = allTimeBody.createEl('tr');
      progressRow.createEl('td', { text: 'Progress', cls: 'summary-label' });
      progressRow.createEl('td', { text: `${Math.round((data.allTimeSummary.budgetProgress || 0) * 100)}%`, cls: 'summary-value' });

      const remainingRow = allTimeBody.createEl('tr');
      remainingRow.createEl('td', { text: 'Remaining', cls: 'summary-label' });
      remainingRow.createEl('td', { text: `${this.formatNumber(data.allTimeSummary.budgetRemaining || 0)}h`, cls: 'summary-value' });
    } else {
      const utilizationRow = allTimeBody.createEl('tr');
      utilizationRow.createEl('td', { text: 'Utilization', cls: 'summary-label' });
      utilizationRow.createEl('td', { text: `${Math.round(data.allTimeSummary.utilization * 100)}%`, cls: 'summary-value' });
    }
  }

  private renderDataTable(container: HTMLElement, monthlyData: any[]) {
    const tableContainer = container.createEl('div', {
      cls: 'timesheet-data-table-container'
    });

    const table = tableContainer.createEl('table', {
      cls: 'timesheet-data-table'
    });

    // Determine if this is a budget project
    const isBudgetProject = monthlyData.some(month => month.budgetHours !== undefined);

    // Table header
    const thead = table.createEl('thead');
    const headerRow = thead.createEl('tr');

    headerRow.createEl('th', { text: 'Period' });
    headerRow.createEl('th', { text: 'Hours' });
    headerRow.createEl('th', { text: 'Invoiced' });
    if (isBudgetProject) {
      headerRow.createEl('th', { text: 'Progress' });
    } else {
      headerRow.createEl('th', { text: 'Utilization' });
    }

    // Table body
    const tbody = table.createEl('tbody');

    for (const month of monthlyData) {
      const row = tbody.createEl('tr');

      row.createEl('td', { text: month.label });
      row.createEl('td', { text: `${this.formatNumber(month.hours)}h` });
      row.createEl('td', { text: `€${this.formatNumber(month.invoiced)}` });
      if (isBudgetProject) {
        row.createEl('td', { text: `${Math.round((month.budgetProgress || 0) * 100)}%` });
      } else {
        row.createEl('td', { text: `${Math.round(month.utilization * 100)}%` });
      }
    }
  }

  private formatNumber(num: number): string {
    return num.toLocaleString('en-US', {
      maximumFractionDigits: 1
    });
  }

  /**
   * Render target hours section for debugging
   */
  private renderTargetHoursSection(container: HTMLElement): void {
    const infoContainer = container.createEl('div', {
      cls: 'timesheet-info-container'
    });

    infoContainer.createEl('h3', { text: 'Target Hours Information' });

    // Get current month info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Get working days and calculate target
    const { settings } = this.plugin;
    if (!settings) {
      infoContainer.createEl('p', { text: 'Settings not available' });
      return;
    }

    const hoursPerDay = settings.hoursPerWorkday || 8;

    // Calculate working days for current month
    const workingDays = this.getWorkingDaysInMonth(currentYear, currentMonth);
    const targetHours = workingDays * hoursPerDay;

    const monthName = new Date(currentYear, currentMonth - 1, 1).toLocaleString('default', {
      month: 'long'
    });

    infoContainer.createEl('p', {
      text: `${monthName} ${currentYear}: ${workingDays} working days`
    });

    infoContainer.createEl('p', {
      text: `Target hours: ${targetHours}h (${hoursPerDay}h per day)`
    });
  }

  private getWorkingDaysInMonth(year: number, month: number): number {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  /**
   * Helper to create a button and attach a click handler
   */
  private createButton(
    parent: HTMLElement,
    options: { cls: string; text: string; onClick: () => void }
  ): HTMLButtonElement {
    const btn = parent.createEl('button', {
      cls: options.cls,
      text: options.text
    });
    btn.addEventListener('click', options.onClick);
    return btn;
  }

  /**
   * Diagnose timesheet folder for troubleshooting
   */
  private async diagnoseTimesheetFolder(): Promise<string> {
    const diagnosticContainer = this.contentEl.createEl('div', {
      cls: 'timesheet-diagnostic-container'
    });
    diagnosticContainer.createEl('h3', { text: 'Diagnostic Information' });

    const timesheetFolder = this.plugin.settings.timesheetFolder;

    // Check if folder exists
    const folder = this.app.vault.getAbstractFileByPath(timesheetFolder);
    if (!folder) {
      diagnosticContainer.createEl('p', {
        text: `❌ Timesheet folder not found: ${timesheetFolder}`,
        cls: 'diagnostic-error'
      });

      // List all folders
      const rootFolders = this.app.vault.getRoot().children.filter(
        f => f instanceof this.app.vault.adapter.constructor
      );

      const foldersEl = diagnosticContainer.createEl('div', {
        cls: 'diagnostic-folders'
      });

      foldersEl.createEl('p', { text: 'Available root folders:' });
      const foldersList = foldersEl.createEl('ul');

      for (const f of rootFolders) {
        const item = foldersList.createEl('li');
        item.createEl('code', { text: f.path });
      }

      return `Folder not found: ${timesheetFolder}`;
    }

    diagnosticContainer.createEl('p', {
      text: `✅ Timesheet folder found: ${timesheetFolder}`,
      cls: 'diagnostic-success'
    });

    // Check for files in folder
    const allFiles = this.app.vault.getMarkdownFiles();
    const folderFiles = allFiles.filter(file =>
      file.path.startsWith(timesheetFolder)
    );

    diagnosticContainer.createEl('p', {
      text: `📄 Found ${folderFiles.length} markdown files in folder`,
      cls: 'diagnostic-info'
    });

    if (folderFiles.length === 0) {
      diagnosticContainer.createEl('p', {
        text: '⚠️ No markdown files found in timesheet folder',
        cls: 'diagnostic-warning'
      });
    } else {
      // Show first few files
      const exampleFiles = folderFiles.slice(0, 5);
      const moreFiles = folderFiles.length - exampleFiles.length;

      diagnosticContainer.createEl('p', {
        text: 'Example files:',
        cls: 'diagnostic-info'
      });

      const filesList = diagnosticContainer.createEl('ul');
      for (const file of exampleFiles) {
        filesList.createEl('li').createEl('code', { text: file.path });
      }

      if (moreFiles > 0) {
        diagnosticContainer.createEl('p', {
          text: `... and ${moreFiles} more files`,
          cls: 'diagnostic-info'
        });
      }
    }

    return 'OK';
  }

  async onClose() {
    // Clean up
  }
}
