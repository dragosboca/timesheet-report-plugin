// Advanced Retainer Management API for Timesheet Report Plugin
// Provides comprehensive interfaces and utilities for managing retainer-based projects

export interface RetainerSettings {
  monthlyHours: number;                    // Base monthly hour allocation
  rolloverPolicy: boolean;                 // Whether unused hours roll over
  maxRolloverHours: number;               // Maximum hours that can roll over
  rolloverExpiryMonths: number;           // How many months rollover hours last
  utilizationTarget: number;              // Target utilization percentage (0-100)
  renewalNotificationDays: number;        // Days before renewal to notify
  emergencyResponseSLA: number;           // Emergency response time in hours
  serviceCategories: ServiceCategory[];   // Allowed service categories
  billingCycle: 'monthly' | 'quarterly' | 'annually';
  autoRenewal: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  defaultRate?: number;                   // Optional category-specific rate
  priority: 'low' | 'medium' | 'high';   // For resource allocation
  billable: boolean;                      // Whether this category counts against retainer
}

export interface RetainerPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  allocatedHours: number;
  rolloverHours: number;                  // Hours carried from previous period
  totalAvailableHours: number;           // allocated + rollover
  status: 'active' | 'completed' | 'cancelled';
}

export interface RetainerUsage {
  periodId: string;
  date: Date;
  hours: number;
  serviceCategory: string;
  description: string;
  priority: 'routine' | 'urgent' | 'emergency';
  responseTime?: number;                  // Minutes to first response
  resolutionTime?: number;               // Minutes to resolution
  valueImpact?: ValueImpact;             // Business impact metrics
  clientSatisfactionScore?: number;      // 1-5 rating
}

export interface ValueImpact {
  type: 'cost_savings' | 'revenue_protection' | 'efficiency_gain' | 'risk_mitigation';
  estimatedValue: number;                // Dollar value of impact
  description: string;
  measurable: boolean;                   // Whether impact can be quantified
}

export interface RolloverAccount {
  totalRolloverHours: number;
  rolloverDetails: RolloverEntry[];
  nextExpiryDate: Date;
  maxCapacity: number;
}

export interface RolloverEntry {
  hours: number;
  originPeriod: string;                  // Period ID where hours originated
  expiryDate: Date;
  used: number;                          // How many of these hours have been used
  remaining: number;
}

export interface RetainerHealthMetrics {
  utilizationRate: number;               // Percentage of hours used
  utilizationTrend: 'increasing' | 'decreasing' | 'stable';
  serviceMix: ServiceMixAnalysis[];
  responseTimeAverage: number;           // Average response time in hours
  clientSatisfactionAverage: number;     // Average satisfaction score
  valueDeliveredTotal: number;          // Total business value generated
  renewalRisk: 'low' | 'medium' | 'high';
  recommendedActions: string[];
}

export interface ServiceMixAnalysis {
  categoryId: string;
  categoryName: string;
  hoursUsed: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  efficiency: number;                    // Value per hour ratio
}

export interface RetainerForecast {
  projectedUtilization: number;
  projectedRollover: number;
  burnRate: number;                      // Hours per day
  projectedCompletionDate: Date;
  budgetHealth: 'healthy' | 'warning' | 'critical';
  recommendations: ForecastRecommendation[];
}

export interface ForecastRecommendation {
  type: 'increase_allocation' | 'decrease_allocation' | 'adjust_service_mix' | 'improve_efficiency';
  priority: 'low' | 'medium' | 'high';
  description: string;
  impact: string;                        // Expected impact of implementing
}

export interface RetainerRenewalData {
  currentTermStart: Date;
  currentTermEnd: Date;
  autoRenewal: boolean;
  renewalNotificationSent: boolean;
  proposedChanges: RetainerProposal[];
  historicalPerformance: RetainerPerformanceSummary;
}

export interface RetainerProposal {
  type: 'hour_adjustment' | 'rate_change' | 'service_expansion' | 'term_extension';
  currentValue: any;
  proposedValue: any;
  justification: string;
  financialImpact: number;               // Monthly dollar impact
}

export interface RetainerPerformanceSummary {
  averageUtilization: number;
  totalValueDelivered: number;
  emergencyResponseCount: number;
  averageResponseTime: number;
  clientSatisfactionTrend: number[];     // Monthly satisfaction scores
  serviceEvolution: ServiceEvolutionData[];
}

export interface ServiceEvolutionData {
  period: string;                        // YYYY-MM format
  serviceMix: { [categoryId: string]: number }; // Hours per category
  majorInitiatives: string[];
  emergencyCount: number;
}

export interface RetainerContract {
  id: string;
  clientName: string;
  startDate: Date;
  endDate: Date;
  monthlyRate: number;
  hourlyRate: number;                    // Effective rate (monthly / hours)
  settings: RetainerSettings;
  periods: RetainerPeriod[];
  status: 'active' | 'paused' | 'terminated' | 'completed';
  renewalHistory: RetainerRenewalData[];
}

// Main Retainer API Class
export class RetainerAPI {
  private contract: RetainerContract;
  private usageHistory: RetainerUsage[];

  constructor(contract: RetainerContract) {
    this.contract = contract;
    this.usageHistory = [];
  }

  // Core Usage Tracking
  logUsage(usage: Omit<RetainerUsage, 'periodId'>): RetainerUsage {
    const currentPeriod = this.getCurrentPeriod();
    const fullUsage: RetainerUsage = {
      ...usage,
      periodId: currentPeriod.id
    };

    this.usageHistory.push(fullUsage);
    return fullUsage;
  }

  // Rollover Management
  calculateRollover(periodId: string): RolloverAccount {
    const period = this.contract.periods.find(p => p.id === periodId);
    if (!period) throw new Error('Period not found');

    const usedHours = this.getUsageForPeriod(periodId)
      .reduce((sum, usage) => sum + usage.hours, 0);

    const unusedHours = period.allocatedHours - usedHours;
    const rolloverHours = Math.min(unusedHours, this.contract.settings.maxRolloverHours);

    // Build rollover account from previous periods
    const existingRollover = this.buildRolloverAccount(periodId);

    return {
      totalRolloverHours: existingRollover.totalRolloverHours + rolloverHours,
      rolloverDetails: [...existingRollover.rolloverDetails, {
        hours: rolloverHours,
        originPeriod: periodId,
        expiryDate: this.calculateExpiryDate(period.endDate),
        used: 0,
        remaining: rolloverHours
      }],
      nextExpiryDate: this.getNextExpiryDate(existingRollover),
      maxCapacity: this.contract.settings.maxRolloverHours
    };
  }

  // Health Metrics
  calculateHealthMetrics(): RetainerHealthMetrics {
    const currentPeriod = this.getCurrentPeriod();
    const currentUsage = this.getUsageForPeriod(currentPeriod.id);

    const totalUsed = currentUsage.reduce((sum, u) => sum + u.hours, 0);
    const utilizationRate = totalUsed / currentPeriod.totalAvailableHours;

    const serviceMix = this.analyzeServiceMix(currentUsage);
    const responseTime = this.calculateAverageResponseTime(currentUsage);
    const satisfaction = this.calculateAverageSatisfaction(currentUsage);
    const valueDelivered = this.calculateTotalValue(currentUsage);

    return {
      utilizationRate: utilizationRate * 100,
      utilizationTrend: this.calculateUtilizationTrend(),
      serviceMix,
      responseTimeAverage: responseTime,
      clientSatisfactionAverage: satisfaction,
      valueDeliveredTotal: valueDelivered,
      renewalRisk: this.assessRenewalRisk(utilizationRate, satisfaction),
      recommendedActions: this.generateRecommendations(utilizationRate, serviceMix)
    };
  }

  // Forecasting
  generateForecast(): RetainerForecast {
    const currentPeriod = this.getCurrentPeriod();
    const currentUsage = this.getUsageForPeriod(currentPeriod.id);

    const daysElapsed = this.getDaysElapsed(currentPeriod.startDate);
    const daysTotal = this.getDaysInPeriod(currentPeriod);
    const daysRemaining = daysTotal - daysElapsed;

    const hoursUsed = currentUsage.reduce((sum, u) => sum + u.hours, 0);
    const burnRate = hoursUsed / daysElapsed;
    const projectedTotalUsage = burnRate * daysTotal;
    const projectedUtilization = projectedTotalUsage / currentPeriod.allocatedHours;

    return {
      projectedUtilization: projectedUtilization * 100,
      projectedRollover: Math.max(0, currentPeriod.allocatedHours - projectedTotalUsage),
      burnRate,
      projectedCompletionDate: new Date(Date.now() + (daysRemaining * 24 * 60 * 60 * 1000)),
      budgetHealth: this.assessBudgetHealth(projectedUtilization),
      recommendations: this.generateForecastRecommendations(projectedUtilization, burnRate)
    };
  }

  // Renewal Management
  prepareRenewalData(): RetainerRenewalData {
    const historical = this.calculateHistoricalPerformance();
    const proposals = this.generateRenewalProposals(historical);

    return {
      currentTermStart: this.contract.startDate,
      currentTermEnd: this.contract.endDate,
      autoRenewal: this.contract.settings.autoRenewal,
      renewalNotificationSent: false, // Would be tracked elsewhere
      proposedChanges: proposals,
      historicalPerformance: historical
    };
  }

  // Utility Methods
  private getCurrentPeriod(): RetainerPeriod {
    const now = new Date();
    return this.contract.periods.find(p =>
      p.startDate <= now && p.endDate >= now && p.status === 'active'
    ) || this.contract.periods[this.contract.periods.length - 1];
  }

  private getUsageForPeriod(periodId: string): RetainerUsage[] {
    return this.usageHistory.filter(u => u.periodId === periodId);
  }

  private buildRolloverAccount(beforePeriodId: string): RolloverAccount {
    // Implementation would build rollover from previous periods
    // considering expiry dates and usage
    return {
      totalRolloverHours: 0,
      rolloverDetails: [],
      nextExpiryDate: new Date(),
      maxCapacity: this.contract.settings.maxRolloverHours
    };
  }

  private calculateExpiryDate(periodEnd: Date): Date {
    const expiry = new Date(periodEnd);
    expiry.setMonth(expiry.getMonth() + this.contract.settings.rolloverExpiryMonths);
    return expiry;
  }

  private analyzeServiceMix(usage: RetainerUsage[]): ServiceMixAnalysis[] {
    const categoryTotals: { [key: string]: number } = {};
    usage.forEach(u => {
      categoryTotals[u.serviceCategory] = (categoryTotals[u.serviceCategory] || 0) + u.hours;
    });

    const totalHours = Object.values(categoryTotals).reduce((sum, h) => sum + h, 0);

    return Object.entries(categoryTotals).map(([categoryId, hours]) => {
      const category = this.contract.settings.serviceCategories
        .find(c => c.id === categoryId);

      return {
        categoryId,
        categoryName: category?.name || categoryId,
        hoursUsed: hours,
        percentage: (hours / totalHours) * 100,
        trend: 'stable', // Would calculate from historical data
        efficiency: this.calculateCategoryEfficiency(categoryId, usage)
      };
    });
  }

  private calculateAverageResponseTime(usage: RetainerUsage[]): number {
    const urgentUsage = usage.filter(u => u.priority === 'urgent' || u.priority === 'emergency');
    if (urgentUsage.length === 0) return 0;

    const totalResponseTime = urgentUsage
      .filter(u => u.responseTime !== undefined)
      .reduce((sum, u) => sum + (u.responseTime || 0), 0);

    return totalResponseTime / urgentUsage.length / 60; // Convert to hours
  }

  private calculateAverageSatisfaction(usage: RetainerUsage[]): number {
    const ratedUsage = usage.filter(u => u.clientSatisfactionScore !== undefined);
    if (ratedUsage.length === 0) return 0;

    return ratedUsage.reduce((sum, u) => sum + (u.clientSatisfactionScore || 0), 0) / ratedUsage.length;
  }

  private calculateTotalValue(usage: RetainerUsage[]): number {
    return usage
      .filter(u => u.valueImpact)
      .reduce((sum, u) => sum + (u.valueImpact?.estimatedValue || 0), 0);
  }

  private calculateUtilizationTrend(): 'increasing' | 'decreasing' | 'stable' {
    // Would analyze last 3-6 months of utilization data
    return 'stable'; // Simplified for now
  }

  private assessRenewalRisk(utilization: number, satisfaction: number): 'low' | 'medium' | 'high' {
    if (utilization < 0.5 || satisfaction < 3.5) return 'high';
    if (utilization < 0.7 || satisfaction < 4.0) return 'medium';
    return 'low';
  }

  private generateRecommendations(utilization: number, serviceMix: ServiceMixAnalysis[]): string[] {
    const recommendations: string[] = [];

    if (utilization < 0.6) {
      recommendations.push('Consider proactive initiatives to increase value delivery');
      recommendations.push('Explore additional service categories client might need');
    }

    if (utilization > 0.9) {
      recommendations.push('Consider increasing monthly allocation for better work-life balance');
      recommendations.push('Evaluate emergency response patterns for better resource planning');
    }

    const emergencyMix = serviceMix.find(s => s.categoryName.toLowerCase().includes('support'));
    if (emergencyMix && emergencyMix.percentage > 40) {
      recommendations.push('High reactive work - consider more proactive maintenance');
    }

    return recommendations;
  }

  private assessBudgetHealth(utilization: number): 'healthy' | 'warning' | 'critical' {
    if (utilization > 0.95) return 'critical';
    if (utilization > 0.85) return 'warning';
    return 'healthy';
  }

  private generateForecastRecommendations(utilization: number, burnRate: number): ForecastRecommendation[] {
    const recommendations: ForecastRecommendation[] = [];

    if (utilization > 0.9) {
      recommendations.push({
        type: 'increase_allocation',
        priority: 'high',
        description: 'Current burn rate will exceed allocation - consider increasing monthly hours',
        impact: 'Prevents overages and maintains service quality'
      });
    }

    return recommendations;
  }

  private calculateHistoricalPerformance(): RetainerPerformanceSummary {
    // Would analyze all periods for trends and patterns
    return {
      averageUtilization: 0.8,
      totalValueDelivered: 150000,
      emergencyResponseCount: 12,
      averageResponseTime: 1.5,
      clientSatisfactionTrend: [4.2, 4.5, 4.3, 4.6, 4.4],
      serviceEvolution: []
    };
  }

  private generateRenewalProposals(performance: RetainerPerformanceSummary): RetainerProposal[] {
    const proposals: RetainerProposal[] = [];

    if (performance.averageUtilization > 0.85) {
      proposals.push({
        type: 'hour_adjustment',
        currentValue: this.contract.settings.monthlyHours,
        proposedValue: this.contract.settings.monthlyHours * 1.25,
        justification: 'High utilization indicates need for increased capacity',
        financialImpact: this.contract.monthlyRate * 0.25
      });
    }

    return proposals;
  }

  private getDaysElapsed(startDate: Date): number {
    const now = new Date();
    return Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  }

  private getDaysInPeriod(period: RetainerPeriod): number {
    return Math.floor((period.endDate.getTime() - period.startDate.getTime()) / (24 * 60 * 60 * 1000));
  }

  private getNextExpiryDate(rollover: RolloverAccount): Date {
    if (rollover.rolloverDetails.length === 0) return new Date();

    return rollover.rolloverDetails
      .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())[0]
      .expiryDate;
  }

  private calculateCategoryEfficiency(categoryId: string, usage: RetainerUsage[]): number {
    const categoryUsage = usage.filter(u => u.serviceCategory === categoryId);
    const totalValue = categoryUsage.reduce((sum, u) => sum + (u.valueImpact?.estimatedValue || 0), 0);
    const totalHours = categoryUsage.reduce((sum, u) => sum + u.hours, 0);

    return totalHours > 0 ? totalValue / totalHours : 0;
  }
}

// Factory function for creating retainer APIs
export function createRetainerAPI(contract: RetainerContract): RetainerAPI {
  return new RetainerAPI(contract);
}

// Utility functions for retainer management
export class RetainerUtils {
  static calculateMonthlyValue(settings: RetainerSettings, hourlyRate: number): number {
    return settings.monthlyHours * hourlyRate;
  }

  static validateRetainerSettings(settings: RetainerSettings): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (settings.monthlyHours <= 0) errors.push('Monthly hours must be positive');
    if (settings.maxRolloverHours > settings.monthlyHours) {
      errors.push('Max rollover cannot exceed monthly allocation');
    }
    if (settings.utilizationTarget < 0 || settings.utilizationTarget > 100) {
      errors.push('Utilization target must be between 0 and 100');
    }

    return { valid: errors.length === 0, errors };
  }

  static generateRetainerReport(api: RetainerAPI): string {
    const health = api.calculateHealthMetrics();
    const forecast = api.generateForecast();

    return `
# Retainer Health Report

## Current Status
- Utilization: ${health.utilizationRate.toFixed(1)}%
- Avg Response Time: ${health.responseTimeAverage.toFixed(1)} hours
- Client Satisfaction: ${health.clientSatisfactionAverage.toFixed(1)}/5
- Value Delivered: $${health.valueDeliveredTotal.toLocaleString()}

## Forecast
- Projected Utilization: ${forecast.projectedUtilization.toFixed(1)}%
- Budget Health: ${forecast.budgetHealth}
- Burn Rate: ${forecast.burnRate.toFixed(1)} hours/day

## Recommendations
${health.recommendedActions.map(action => `- ${action}`).join('\n')}
`;
  }
}
