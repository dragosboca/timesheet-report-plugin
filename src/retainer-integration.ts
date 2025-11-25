// Retainer Integration Layer
// Extends the existing timesheet plugin to support sophisticated retainer management

import { Notice } from 'obsidian';
import TimesheetReportPlugin from './main';
import { RetainerAPI, RetainerContract, RetainerUsage, RetainerSettings, ValueImpact } from './retainer-api';
import { ExtractedTimeEntry } from './core/unified-data-extractor';
import { QueryNode } from './query';
import { TimesheetQuery } from './query/interpreter';

export interface ExtendedTimesheetReportSettings {
  // Existing settings
  timesheetFolder: string;
  currencySymbol: string;
  hoursPerWorkday: number;
  refreshInterval: number;
  debugMode: boolean;
  reportTemplateFolder: string;
  reportOutputFolder: string;
  defaultReportTemplate: string;
  useStyleSettings: boolean;
  chartColors: any;
  project: {
    name: string;
    type: 'hourly' | 'fixed-hours' | 'retainer';
    budgetHours?: number;
    defaultRate?: number;
    deadline?: string;
    renewalDate?: string;
  };

  // New retainer-specific settings
  retainer?: {
    enabled: boolean;
    settings: RetainerSettings;
    contract: RetainerContract;
    currentPeriodId: string;
  };
}

export class RetainerIntegration {
  private plugin: TimesheetReportPlugin;
  private retainerAPI: RetainerAPI | null = null;
  private settings: ExtendedTimesheetReportSettings;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
    this.settings = plugin.settings as ExtendedTimesheetReportSettings;

    if (this.isRetainerProject()) {
      this.initializeRetainerAPI();
    }
  }

  // Check if current project is a retainer project
  isRetainerProject(): boolean {
    return this.settings.project?.type === 'retainer' &&
      this.settings.retainer?.enabled === true;
  }

  // Initialize the retainer API with contract data
  private initializeRetainerAPI(): void {
    if (!this.settings.retainer?.contract) {
      console.warn('Retainer project detected but no contract configuration found');
      return;
    }

    this.retainerAPI = new RetainerAPI(this.settings.retainer.contract);
  }

  // Convert ExtractedTimeEntry to RetainerUsage
  private convertTimeEntryToRetainerUsage(entry: ExtractedTimeEntry, metadata: RetainerEntryMetadata): RetainerUsage {
    return {
      date: new Date(entry.date),
      hours: entry.hours,
      serviceCategory: metadata.serviceCategory || 'general',
      description: entry.notes || '',
      priority: metadata.priority || 'routine',
      responseTime: metadata.responseTime,
      resolutionTime: metadata.resolutionTime,
      valueImpact: metadata.valueImpact,
      clientSatisfactionScore: metadata.clientSatisfactionScore,
      periodId: '' // Will be set by RetainerAPI
    };
  }

  // Process timesheet entries for retainer tracking
  processRetainerEntries(entries: ExtractedTimeEntry[]): RetainerUsage[] {
    if (!this.retainerAPI) {
      throw new Error('Retainer API not initialized');
    }

    const retainerUsages: RetainerUsage[] = [];

    for (const entry of entries) {
      // Extract retainer-specific metadata from entry description or frontmatter
      const metadata = this.extractRetainerMetadata(entry);

      if (metadata.billable) {
        const usage = this.convertTimeEntryToRetainerUsage(entry, metadata);
        const loggedUsage = this.retainerAPI.logUsage(usage);
        retainerUsages.push(loggedUsage);
      }
    }

    return retainerUsages;
  }

  // Extract retainer metadata from timesheet entry
  private extractRetainerMetadata(entry: ExtractedTimeEntry): RetainerEntryMetadata {
    const metadata: RetainerEntryMetadata = {
      serviceCategory: 'general',
      priority: 'routine',
      billable: true
    };

    const description = entry.notes || '';

    // Parse description for category tags like [Development], [Support], etc.
    const categoryMatch = description.match(/\[([^\]]+)\]/);
    if (categoryMatch) {
      const category = categoryMatch[1].toLowerCase();
      metadata.serviceCategory = this.mapCategoryName(category);
    }

    // Parse for priority indicators
    if (description.toLowerCase().includes('emergency')) {
      metadata.priority = 'emergency';
    } else if (description.toLowerCase().includes('urgent')) {
      metadata.priority = 'urgent';
    }

    // Parse for value impact indicators
    const valueMatch = description.match(/\$([0-9,]+)/);
    if (valueMatch) {
      metadata.valueImpact = {
        type: 'cost_savings',
        estimatedValue: parseInt(valueMatch[1].replace(/,/g, '')),
        description: 'Value extracted from description',
        measurable: true
      };
    }

    return metadata;
  }

  // Map category names to standardized IDs
  private mapCategoryName(category: string): string {
    const mappings: { [key: string]: string } = {
      'development': 'development',
      'dev': 'development',
      'coding': 'development',
      'support': 'support',
      'emergency': 'support',
      'consulting': 'consulting',
      'strategy': 'strategy',
      'training': 'training',
      'maintenance': 'maintenance',
      'maint': 'maintenance'
    };

    return mappings[category] || 'general';
  }

  // Generate retainer-specific reports
  generateRetainerReport(type: 'monthly' | 'quarterly' | 'renewal'): string {
    if (!this.retainerAPI) {
      throw new Error('Retainer API not initialized');
    }

    const health = this.retainerAPI.calculateHealthMetrics();
    const forecast = this.retainerAPI.generateForecast();

    switch (type) {
      case 'monthly':
        return this.generateMonthlyReport(health, forecast);
      case 'quarterly':
        return this.generateQuarterlyReport(health, forecast);
      case 'renewal': {
        const renewal = this.retainerAPI.prepareRenewalData();
        return this.generateRenewalReport(renewal);
      }
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }

  // Generate monthly retainer report
  private generateMonthlyReport(health: any, forecast: any): string {
    const contract = this.settings.retainer!.contract;
    const currentDate = new Date();
    const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return `# ${contract.clientName} Retainer Report - ${monthYear}

## Executive Summary
This month's retainer utilization was **${health.utilizationRate.toFixed(1)}%**, which is ${this.getUtilizationAssessment(health.utilizationRate)}.

### Key Metrics
- **Hours Used:** ${(health.utilizationRate * contract.settings.monthlyHours / 100).toFixed(1)} of ${contract.settings.monthlyHours} allocated
- **Average Response Time:** ${health.responseTimeAverage.toFixed(1)} hours
- **Client Satisfaction:** ${health.clientSatisfactionAverage.toFixed(1)}/5.0
- **Value Delivered:** $${health.valueDeliveredTotal.toLocaleString()}

## Service Breakdown
${health.serviceMix.map((service: any) =>
      `- **${service.categoryName}:** ${service.hoursUsed.toFixed(1)}h (${service.percentage.toFixed(1)}%)`
    ).join('\n')}

## Rollover Status
${this.generateRolloverSection()}

## Forecast for Next Month
- **Projected Utilization:** ${forecast.projectedUtilization.toFixed(1)}%
- **Budget Health:** ${forecast.budgetHealth}
- **Recommended Actions:**
${health.recommendedActions.map((action: string) => `  - ${action}`).join('\n')}

## Value Highlights
${this.generateValueHighlights(health)}

---
*Report generated on ${new Date().toLocaleDateString()} by Timesheet Report Plugin*`;
  }

  // Generate quarterly summary report
  private generateQuarterlyReport(health: any, forecast: any): string {
    return `# Quarterly Retainer Performance Review

## Quarter Overview
[Quarterly analysis would include trend data across 3 months]

## Performance Trends
- **Utilization Trend:** ${health.utilizationTrend}
- **Service Mix Evolution:** [Analysis of how service categories changed]
- **Client Satisfaction Trend:** [3-month satisfaction progression]

## Strategic Recommendations
${health.recommendedActions.map((action: string) => `- ${action}`).join('\n')}

---
*Quarterly report generated on ${new Date().toLocaleDateString()}*`;
  }

  // Generate renewal preparation report
  private generateRenewalReport(renewal: any): string {
    return `# Contract Renewal Preparation

## Current Contract Performance
- **Term:** ${renewal.currentTermStart.toDateString()} to ${renewal.currentTermEnd.toDateString()}
- **Overall Performance:** ${this.assessOverallPerformance(renewal.historicalPerformance)}

## Proposed Contract Changes
${renewal.proposedChanges.map((proposal: any) =>
      `- **${proposal.type}:** ${proposal.description} (Impact: $${proposal.financialImpact}/month)`
    ).join('\n')}

## Historical Performance Summary
${this.formatHistoricalPerformance(renewal.historicalPerformance)}

---
*Renewal analysis generated on ${new Date().toLocaleDateString()}*`;
  }

  // Enhanced query processing for retainer projects
  processRetainerQuery(query: TimesheetQuery): RetainerEnhancedQuery | null {
    if (!this.retainerAPI) {
      return null;
    }

    // Add retainer-specific enhancements
    if (this.isRetainerProject()) {
      const health = this.retainerAPI!.calculateHealthMetrics();
      const forecast = this.retainerAPI!.generateForecast();

      const enhancedQuery: RetainerEnhancedQuery = {
        where: query.where,
        show: query.show,
        view: query.view,
        chartType: query.chartType,
        period: query.period,
        size: query.size,
        retainer: {
          health,
          forecast,
          rollover: this.getCurrentRolloverStatus(),
          serviceMix: health.serviceMix,
          utilizationStatus: this.getUtilizationStatus(health.utilizationRate)
        }
      };
      return enhancedQuery;
    }

    return {
      where: query.where,
      show: query.show,
      view: query.view,
      chartType: query.chartType,
      period: query.period,
      size: query.size
    };
  }

  // Get current rollover status
  private getCurrentRolloverStatus(): any {
    if (!this.retainerAPI || !this.settings.retainer?.currentPeriodId) {
      return null;
    }

    return this.retainerAPI.calculateRollover(this.settings.retainer.currentPeriodId);
  }

  // Utility methods
  private getUtilizationAssessment(utilization: number): string {
    if (utilization < 60) return 'below optimal range';
    if (utilization > 90) return 'above optimal range';
    return 'within optimal range';
  }

  private getUtilizationStatus(utilization: number): 'low' | 'optimal' | 'high' | 'critical' {
    if (utilization < 50) return 'low';
    if (utilization > 95) return 'critical';
    if (utilization > 85) return 'high';
    return 'optimal';
  }

  private generateRolloverSection(): string {
    const rollover = this.getCurrentRolloverStatus();
    if (!rollover) return 'No rollover data available';

    return `- **Available Rollover:** ${rollover.totalRolloverHours} hours
- **Next Expiry:** ${rollover.nextExpiryDate.toLocaleDateString()}
- **Maximum Capacity:** ${rollover.maxCapacity} hours`;
  }

  private generateValueHighlights(health: any): string {
    if (health.valueDeliveredTotal === 0) {
      return 'No quantified value impacts recorded this month.';
    }

    return `This month's services delivered $${health.valueDeliveredTotal.toLocaleString()} in measurable business value, representing a ${(health.valueDeliveredTotal / (this.settings.retainer!.contract.monthlyRate) * 100).toFixed(0)}% ROI on the retainer investment.`;
  }

  private assessOverallPerformance(performance: any): string {
    const score = (performance.averageUtilization * 0.4) +
      (performance.clientSatisfactionTrend.slice(-1)[0] / 5 * 0.3) +
      (Math.min(performance.averageResponseTime, 4) / 4 * 0.3);

    if (score > 0.8) return 'Excellent';
    if (score > 0.6) return 'Good';
    if (score > 0.4) return 'Satisfactory';
    return 'Needs Improvement';
  }

  private formatHistoricalPerformance(performance: any): string {
    return `- **Average Utilization:** ${(performance.averageUtilization * 100).toFixed(1)}%
- **Total Value Delivered:** $${performance.totalValueDelivered.toLocaleString()}
- **Emergency Responses:** ${performance.emergencyResponseCount}
- **Average Response Time:** ${performance.averageResponseTime.toFixed(1)} hours`;
  }
}

// Additional interfaces for retainer integration
interface RetainerEnhancedQuery {
  where?: {
    year?: number;
    month?: number;
    project?: string;
    dateRange?: { start: string; end: string };
  };
  show?: string[];
  view?: 'summary' | 'chart' | 'table' | 'full' | 'retainer' | 'health' | 'rollover' | 'services' | 'contract' | 'performance' | 'renewal';
  chartType?: 'trend' | 'monthly' | 'budget' | 'service_mix' | 'rollover_trend' | 'health_score' | 'value_delivery' | 'response_time' | 'satisfaction' | 'forecast' | 'burn_rate';
  period?: 'current-year' | 'all-time' | 'last-6-months' | 'last-12-months' | 'next-month' | 'next-quarter' | 'contract-term';
  size?: 'compact' | 'normal' | 'detailed';
  retainer?: {
    health: any;
    forecast: any;
    rollover: any;
    serviceMix: any;
    utilizationStatus: 'low' | 'optimal' | 'high' | 'critical';
  };
}

// Metadata interface for retainer-specific entry data
interface RetainerEntryMetadata {
  serviceCategory: string;
  priority: 'routine' | 'urgent' | 'emergency';
  billable: boolean;
  responseTime?: number;
  resolutionTime?: number;
  valueImpact?: ValueImpact;
  clientSatisfactionScore?: number;
}

// Factory function for creating retainer integration
export function createRetainerIntegration(plugin: TimesheetReportPlugin): RetainerIntegration {
  return new RetainerIntegration(plugin);
}

// Retainer-specific query extensions
export class RetainerQueryExtensions {
  static isRetainerQuery(query: QueryNode): boolean {
    // Check if query contains retainer-specific fields
    const queryStr = JSON.stringify(query);
    return queryStr.includes('utilization') ||
      queryStr.includes('rollover') ||
      queryStr.includes('service_category');
  }

  static enhanceQueryForRetainer(query: TimesheetQuery, retainerAPI: RetainerAPI): RetainerEnhancedQuery {
    // Add retainer-specific data to query results
    const health = retainerAPI.calculateHealthMetrics();

    return {
      where: query.where,
      show: query.show,
      view: query.view,
      chartType: query.chartType,
      period: query.period,
      size: query.size,
      retainer: {
        health: health,
        forecast: retainerAPI.generateForecast(),
        rollover: null,
        serviceMix: health.serviceMix,
        utilizationStatus: health.utilizationRate > 95 ? 'critical' :
          health.utilizationRate > 85 ? 'high' :
            health.utilizationRate < 50 ? 'low' : 'optimal'
      }
    };
  }
}

// Plugin extension point for retainer functionality
export function extendPluginForRetainer(plugin: TimesheetReportPlugin): void {
  const integration = createRetainerIntegration(plugin);

  // Note: Plugin extension would happen here in a real implementation
  // The existing plugin would need to be modified to support retainer features

  // Add retainer-specific commands
  plugin.addCommand({
    id: 'generate-retainer-report',
    name: 'Generate Retainer Report',
    callback: () => {
      if (integration.isRetainerProject()) {
        const report = integration.generateRetainerReport('monthly');
        // Create new note with report content
        plugin.app.vault.create(`Reports/Retainer-${new Date().getMonth() + 1}-${new Date().getFullYear()}.md`, report);
      }
    }
  });

  plugin.addCommand({
    id: 'retainer-health-check',
    name: 'Retainer Health Check',
    callback: () => {
      if (integration.isRetainerProject()) {
        // Show health metrics in notice
        const health = integration.processRetainerQuery({} as any)?.retainer?.health;
        if (health) {
          new Notice(`Retainer Health: ${health.utilizationRate.toFixed(1)}% utilization, ${health.clientSatisfactionAverage.toFixed(1)}/5 satisfaction`);
        }
      }
    }
  });
}
