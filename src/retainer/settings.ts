// Enhanced Settings UI for Retainer Project Configuration
// Extends the existing settings with comprehensive retainer management options

import { App, PluginSettingTab, Setting, TFile, Notice } from 'obsidian';
import TimesheetReportPlugin from '../main';
import { RetainerSettings, ServiceCategory, RetainerContract, RetainerPeriod } from './api';
import { RetainerUtils } from './api';
import { TimesheetReportSettings } from '../settings';

export interface ExtendedTimesheetReportSettings {
  // Existing core settings
  timesheetFolder: string;
  currencySymbol: string;
  hoursPerWorkday: number;
  refreshInterval: number;
  debugMode: boolean;
  reportTemplateFolder: string;
  reportOutputFolder: string;
  defaultReportTemplate: string;
  useStyleSettings: boolean;
  chartColors: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
    background: string;
  };

  // Enhanced project settings
  project: {
    name: string;
    type: 'hourly' | 'fixed-hours' | 'retainer';
    budgetHours?: number;
    defaultRate?: number;
    deadline?: string;
    renewalDate?: string;
    description?: string;
  };

  // Retainer-specific configuration
  retainer?: {
    enabled: boolean;
    settings: RetainerSettings;
    contract: RetainerContract;
    currentPeriodId: string;
    lastSyncDate: string;
    autoReporting: boolean;
    notificationsEnabled: boolean;
  };
}

export const DEFAULT_RETAINER_SETTINGS: RetainerSettings = {
  monthlyHours: 40,
  rolloverPolicy: true,
  maxRolloverHours: 20,
  rolloverExpiryMonths: 3,
  utilizationTarget: 80,
  renewalNotificationDays: 30,
  emergencyResponseSLA: 4,
  serviceCategories: [
    {
      id: 'development',
      name: 'Development',
      description: 'Feature development, coding, and implementation',
      priority: 'medium',
      billable: true
    },
    {
      id: 'support',
      name: 'Support',
      description: 'Bug fixes, troubleshooting, and maintenance',
      priority: 'high',
      billable: true
    },
    {
      id: 'consulting',
      name: 'Consulting',
      description: 'Strategic guidance and technical consultation',
      priority: 'medium',
      billable: true
    },
    {
      id: 'training',
      name: 'Training',
      description: 'Knowledge transfer and team training',
      priority: 'low',
      billable: true
    }
  ],
  billingCycle: 'monthly',
  autoRenewal: false
};

export class RetainerSettingsTab extends PluginSettingTab {
  plugin: TimesheetReportPlugin;
  private retainerEnabled: boolean = false;
  private retainerSettings: RetainerSettings = DEFAULT_RETAINER_SETTINGS;
  private serviceCategories: ServiceCategory[] = [...DEFAULT_RETAINER_SETTINGS.serviceCategories];

  constructor(app: App, plugin: TimesheetReportPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.loadRetainerSettings();
  }

  private loadRetainerSettings(): void {
    const settings = this.plugin.settings as unknown as ExtendedTimesheetReportSettings;
    if (settings.retainer) {
      this.retainerEnabled = settings.retainer.enabled;
      this.retainerSettings = { ...settings.retainer.settings };
      this.serviceCategories = [...settings.retainer.settings.serviceCategories];
    }
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Header
    containerEl.createEl('h2', { text: 'Retainer Project Configuration' });

    // Enable/Disable Retainer Features
    new Setting(containerEl)
      .setName('Enable Retainer Management')
      .setDesc('Enable advanced retainer project features including rollover tracking, service categorization, and utilization analysis')
      .addToggle(toggle => toggle
        .setValue(this.retainerEnabled)
        .onChange(async (value) => {
          this.retainerEnabled = value;
          await this.saveSettings();
          this.display(); // Refresh to show/hide retainer settings
        }));

    if (!this.retainerEnabled) {
      containerEl.createEl('p', {
        text: 'Enable retainer management to configure advanced retainer project features.',
        cls: 'setting-item-description'
      });
      return;
    }

    // Basic Retainer Configuration
    this.addBasicRetainerSettings(containerEl);

    // Rollover Policy Settings
    this.addRolloverSettings(containerEl);

    // Service Categories Management
    this.addServiceCategorySettings(containerEl);

    // Utilization & Performance Settings
    this.addPerformanceSettings(containerEl);

    // Billing & Renewal Settings
    this.addBillingSettings(containerEl);

    // Contract Management
    this.addContractSettings(containerEl);

    // Advanced Settings
    this.addAdvancedSettings(containerEl);

    // Actions
    this.addActionButtons(containerEl);
  }

  private addBasicRetainerSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Basic Retainer Configuration' });

    new Setting(containerEl)
      .setName('Monthly Hour Allocation')
      .setDesc('Base number of hours allocated per month')
      .addText(text => text
        .setValue(this.retainerSettings.monthlyHours.toString())
        .onChange(async (value) => {
          const hours = parseInt(value);
          if (!isNaN(hours) && hours > 0) {
            this.retainerSettings.monthlyHours = hours;
            await this.saveSettings();
          }
        }));

    new Setting(containerEl)
      .setName('Utilization Target')
      .setDesc('Target utilization percentage (recommended: 75-85%)')
      .addSlider(slider => slider
        .setLimits(50, 100, 5)
        .setValue(this.retainerSettings.utilizationTarget)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.retainerSettings.utilizationTarget = value;
          await this.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Emergency Response SLA')
      .setDesc('Target response time for emergency issues (hours)')
      .addText(text => text
        .setValue(this.retainerSettings.emergencyResponseSLA.toString())
        .onChange(async (value) => {
          const hours = parseInt(value);
          if (!isNaN(hours) && hours > 0) {
            this.retainerSettings.emergencyResponseSLA = hours;
            await this.saveSettings();
          }
        }));
  }

  private addRolloverSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Rollover Policy' });

    new Setting(containerEl)
      .setName('Enable Rollover')
      .setDesc('Allow unused hours to roll over to the next period')
      .addToggle(toggle => toggle
        .setValue(this.retainerSettings.rolloverPolicy)
        .onChange(async (value) => {
          this.retainerSettings.rolloverPolicy = value;
          await this.saveSettings();
          this.display(); // Refresh to show/hide rollover options
        }));

    if (this.retainerSettings.rolloverPolicy) {
      new Setting(containerEl)
        .setName('Maximum Rollover Hours')
        .setDesc('Maximum hours that can be carried forward')
        .addText(text => text
          .setValue(this.retainerSettings.maxRolloverHours.toString())
          .onChange(async (value) => {
            const hours = parseInt(value);
            if (!isNaN(hours) && hours >= 0) {
              this.retainerSettings.maxRolloverHours = hours;
              await this.saveSettings();
            }
          }));

      new Setting(containerEl)
        .setName('Rollover Expiry Period')
        .setDesc('Number of months before rollover hours expire')
        .addDropdown(dropdown => dropdown
          .addOption('1', '1 Month')
          .addOption('2', '2 Months')
          .addOption('3', '3 Months')
          .addOption('6', '6 Months')
          .addOption('12', '12 Months')
          .setValue(this.retainerSettings.rolloverExpiryMonths.toString())
          .onChange(async (value) => {
            this.retainerSettings.rolloverExpiryMonths = parseInt(value);
            await this.saveSettings();
          }));
    }
  }

  private addServiceCategorySettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Service Categories' });

    const categoryContainer = containerEl.createDiv('retainer-categories-container');

    this.serviceCategories.forEach((category, index) => {
      const categoryEl = categoryContainer.createDiv('retainer-category-item');
      categoryEl.style.border = '1px solid var(--background-modifier-border)';
      categoryEl.style.padding = '10px';
      categoryEl.style.margin = '5px 0';
      categoryEl.style.borderRadius = '4px';

      // Category header
      const headerEl = categoryEl.createDiv('category-header');
      headerEl.style.display = 'flex';
      headerEl.style.justifyContent = 'space-between';
      headerEl.style.alignItems = 'center';
      headerEl.style.marginBottom = '10px';

      const titleEl = headerEl.createEl('h4', { text: category.name });
      titleEl.style.margin = '0';

      const deleteBtn = headerEl.createEl('button', { text: '×' });
      deleteBtn.style.background = 'var(--interactive-accent)';
      deleteBtn.style.color = 'var(--text-on-accent)';
      deleteBtn.style.border = 'none';
      deleteBtn.style.borderRadius = '3px';
      deleteBtn.style.padding = '2px 8px';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.addEventListener('click', async () => {
        this.serviceCategories.splice(index, 1);
        await this.saveSettings();
        this.display();
      });

      // Category details
      new Setting(categoryEl)
        .setName('Category ID')
        .addText(text => text
          .setValue(category.id)
          .onChange(async (value) => {
            this.serviceCategories[index].id = value;
            await this.saveSettings();
          }));

      new Setting(categoryEl)
        .setName('Display Name')
        .addText(text => text
          .setValue(category.name)
          .onChange(async (value) => {
            this.serviceCategories[index].name = value;
            await this.saveSettings();
          }));

      new Setting(categoryEl)
        .setName('Description')
        .addTextArea(text => text
          .setValue(category.description)
          .onChange(async (value) => {
            this.serviceCategories[index].description = value;
            await this.saveSettings();
          }));

      new Setting(categoryEl)
        .setName('Priority')
        .addDropdown(dropdown => dropdown
          .addOption('low', 'Low')
          .addOption('medium', 'Medium')
          .addOption('high', 'High')
          .setValue(category.priority)
          .onChange(async (value) => {
            this.serviceCategories[index].priority = value as 'low' | 'medium' | 'high';
            await this.saveSettings();
          }));

      new Setting(categoryEl)
        .setName('Billable')
        .addToggle(toggle => toggle
          .setValue(category.billable)
          .onChange(async (value) => {
            this.serviceCategories[index].billable = value;
            await this.saveSettings();
          }));
    });

    // Add new category button
    new Setting(categoryContainer)
      .setName('Add Service Category')
      .setDesc('Create a new service category for time tracking')
      .addButton(button => button
        .setButtonText('Add Category')
        .onClick(async () => {
          const newCategory: ServiceCategory = {
            id: `category_${Date.now()}`,
            name: 'New Category',
            description: 'Description for new category',
            priority: 'medium',
            billable: true
          };
          this.serviceCategories.push(newCategory);
          await this.saveSettings();
          this.display();
        }));
  }

  private addPerformanceSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Performance & Monitoring' });

    new Setting(containerEl)
      .setName('Renewal Notification Period')
      .setDesc('Days before contract renewal to send notifications')
      .addText(text => text
        .setValue(this.retainerSettings.renewalNotificationDays.toString())
        .onChange(async (value) => {
          const days = parseInt(value);
          if (!isNaN(days) && days > 0) {
            this.retainerSettings.renewalNotificationDays = days;
            await this.saveSettings();
          }
        }));

    new Setting(containerEl)
      .setName('Auto-Generate Reports')
      .setDesc('Automatically generate monthly retainer reports')
      .addToggle(toggle => toggle
        .setValue(((this.plugin.settings as unknown as ExtendedTimesheetReportSettings).retainer?.autoReporting) || false)
        .onChange(async (value) => {
          const extSettings = this.plugin.settings as unknown as ExtendedTimesheetReportSettings;
          if (extSettings.retainer) {
            extSettings.retainer.autoReporting = value;
            await this.plugin.saveSettings();
          }
        }));
  }

  private addBillingSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Billing Configuration' });

    new Setting(containerEl)
      .setName('Billing Cycle')
      .setDesc('How often the retainer is billed')
      .addDropdown(dropdown => dropdown
        .addOption('monthly', 'Monthly')
        .addOption('quarterly', 'Quarterly')
        .addOption('annually', 'Annually')
        .setValue(this.retainerSettings.billingCycle)
        .onChange(async (value) => {
          this.retainerSettings.billingCycle = value as 'monthly' | 'quarterly' | 'annually';
          await this.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Auto-Renewal')
      .setDesc('Automatically renew the contract when it expires')
      .addToggle(toggle => toggle
        .setValue(this.retainerSettings.autoRenewal)
        .onChange(async (value) => {
          this.retainerSettings.autoRenewal = value;
          await this.saveSettings();
        }));
  }

  private addContractSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Contract Information' });

    const settings = this.plugin.settings as unknown as ExtendedTimesheetReportSettings;
    const contract = settings.retainer?.contract;

    if (!contract) {
      new Setting(containerEl)
        .setName('Initialize Contract')
        .setDesc('Create a new retainer contract configuration')
        .addButton(button => button
          .setButtonText('Create Contract')
          .onClick(async () => {
            await this.initializeContract();
            this.display();
          }));
      return;
    }

    new Setting(containerEl)
      .setName('Client Name')
      .addText(text => text
        .setValue(contract.clientName)
        .onChange(async (value) => {
          if (settings.retainer?.contract) {
            settings.retainer.contract.clientName = value;
            await this.plugin.saveSettings();
          }
        }));

    new Setting(containerEl)
      .setName('Contract Start Date')
      .addText(text => text
        .setValue(contract.startDate.toISOString().split('T')[0])
        .onChange(async (value) => {
          const date = new Date(value);
          if (!isNaN(date.getTime()) && settings.retainer?.contract) {
            settings.retainer.contract.startDate = date;
            await this.plugin.saveSettings();
          }
        }));

    new Setting(containerEl)
      .setName('Contract End Date')
      .addText(text => text
        .setValue(contract.endDate.toISOString().split('T')[0])
        .onChange(async (value) => {
          const date = new Date(value);
          if (!isNaN(date.getTime()) && settings.retainer?.contract) {
            settings.retainer.contract.endDate = date;
            await this.plugin.saveSettings();
          }
        }));

    new Setting(containerEl)
      .setName('Monthly Rate')
      .setDesc('Total monthly retainer fee')
      .addText(text => text
        .setValue(contract.monthlyRate.toString())
        .onChange(async (value) => {
          const rate = parseFloat(value);
          if (!isNaN(rate) && rate > 0 && settings.retainer?.contract) {
            settings.retainer.contract.monthlyRate = rate;
            settings.retainer.contract.hourlyRate = rate / this.retainerSettings.monthlyHours;
            await this.plugin.saveSettings();
          }
        }));

    // Contract status display
    const statusEl = containerEl.createDiv('contract-status');
    statusEl.innerHTML = `
      <p><strong>Contract Status:</strong> ${contract.status}</p>
      <p><strong>Effective Rate:</strong> ${this.plugin.settings.currencySymbol}${contract.hourlyRate.toFixed(2)}/hour</p>
      <p><strong>Contract Value:</strong> ${this.plugin.settings.currencySymbol}${(contract.monthlyRate * 12).toFixed(2)}/year</p>
    `;
  }

  private addAdvancedSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Advanced Settings' });

    new Setting(containerEl)
      .setName('Enable Notifications')
      .setDesc('Show notifications for utilization warnings and renewal reminders')
      .addToggle(toggle => toggle
        .setValue(((this.plugin.settings as unknown as ExtendedTimesheetReportSettings).retainer?.notificationsEnabled) || false)
        .onChange(async (value) => {
          const extSettings = this.plugin.settings as unknown as ExtendedTimesheetReportSettings;
          if (extSettings.retainer) {
            extSettings.retainer.notificationsEnabled = value;
            await this.plugin.saveSettings();
          }
        }));

    new Setting(containerEl)
      .setName('Debug Mode')
      .setDesc('Enable detailed logging for retainer operations')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.debugMode)
        .onChange(async (value) => {
          this.plugin.settings.debugMode = value;
          await this.plugin.saveSettings();
        }));
  }

  private addActionButtons(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Actions' });

    const buttonContainer = containerEl.createDiv('retainer-actions');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.flexWrap = 'wrap';

    // Validate configuration
    const validateBtn = buttonContainer.createEl('button', { text: 'Validate Configuration' });
    validateBtn.style.padding = '8px 16px';
    validateBtn.style.borderRadius = '4px';
    validateBtn.addEventListener('click', () => this.validateConfiguration());

    // Export configuration
    const exportBtn = buttonContainer.createEl('button', { text: 'Export Configuration' });
    exportBtn.style.padding = '8px 16px';
    exportBtn.style.borderRadius = '4px';
    exportBtn.addEventListener('click', () => this.exportConfiguration());

    // Import configuration
    const importBtn = buttonContainer.createEl('button', { text: 'Import Configuration' });
    importBtn.style.padding = '8px 16px';
    importBtn.style.borderRadius = '4px';
    importBtn.addEventListener('click', () => this.importConfiguration());

    // Reset to defaults
    const resetBtn = buttonContainer.createEl('button', { text: 'Reset to Defaults' });
    resetBtn.style.padding = '8px 16px';
    resetBtn.style.borderRadius = '4px';
    resetBtn.style.background = 'var(--color-red)';
    resetBtn.style.color = 'white';
    resetBtn.addEventListener('click', () => this.resetToDefaults());
  }

  private async initializeContract(): Promise<void> {
    const settings = this.plugin.settings as unknown as ExtendedTimesheetReportSettings;
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const newContract: RetainerContract = {
      id: `contract_${Date.now()}`,
      clientName: settings.project.name || 'New Client',
      startDate: now,
      endDate: oneYearLater,
      monthlyRate: (settings.project.defaultRate || 150) * this.retainerSettings.monthlyHours,
      hourlyRate: settings.project.defaultRate || 150,
      settings: this.retainerSettings,
      periods: [],
      status: 'active',
      renewalHistory: []
    };

    if (!settings.retainer) {
      settings.retainer = {
        enabled: true,
        settings: this.retainerSettings,
        contract: newContract,
        currentPeriodId: '',
        lastSyncDate: now.toISOString(),
        autoReporting: false,
        notificationsEnabled: true
      };
    } else {
      settings.retainer.contract = newContract;
    }

    await this.plugin.saveSettings();
  }

  private validateConfiguration(): void {
    const validation = RetainerUtils.validateRetainerSettings(this.retainerSettings);

    if (validation.valid) {
      new Notice('✅ Retainer configuration is valid');
    } else {
      new Notice(`❌ Configuration errors:\n${validation.errors.join('\n')}`);
    }
  }

  private async exportConfiguration(): Promise<void> {
    const config = {
      retainerSettings: this.retainerSettings,
      serviceCategories: this.serviceCategories,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const content = JSON.stringify(config, null, 2);
    const filename = `retainer-config-${new Date().toISOString().split('T')[0]}.json`;

    await this.app.vault.create(filename, content);
    new Notice(`✅ Configuration exported to ${filename}`);
  }

  private async importConfiguration(): Promise<void> {
    // In a real implementation, this would open a file picker
    new Notice('Import functionality would open a file picker to load configuration');
  }

  private async resetToDefaults(): Promise<void> {
    if (confirm('Are you sure you want to reset all retainer settings to defaults? This cannot be undone.')) {
      this.retainerSettings = { ...DEFAULT_RETAINER_SETTINGS };
      this.serviceCategories = [...DEFAULT_RETAINER_SETTINGS.serviceCategories];
      await this.saveSettings();
      this.display();
      new Notice('✅ Retainer settings reset to defaults');
    }
  }

  private async saveSettings(): Promise<void> {
    const settings = this.plugin.settings as unknown as ExtendedTimesheetReportSettings;

    if (!settings.retainer) {
      settings.retainer = {
        enabled: this.retainerEnabled,
        settings: this.retainerSettings,
        contract: {} as RetainerContract,
        currentPeriodId: '',
        lastSyncDate: new Date().toISOString(),
        autoReporting: false,
        notificationsEnabled: true
      };
    } else {
      settings.retainer.enabled = this.retainerEnabled;
      settings.retainer.settings = { ...this.retainerSettings };
    }

    // Update service categories
    settings.retainer.settings.serviceCategories = [...this.serviceCategories];

    await this.plugin.saveSettings();
  }
}
