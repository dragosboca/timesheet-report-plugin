// Retainer Clause Handlers
// Handles retainer-specific features: service mix, rollover, utilization, contracts, value, alerts, forecasts

import {
  RetainerClauseNode,
  ServiceClauseNode,
  RolloverClauseNode,
  UtilizationClauseNode,
  ContractClauseNode,
  ValueClauseNode,
  AlertClauseNode,
  ForecastClauseNode
} from '../../query/ast';
import {
  BaseClauseHandler,
  ClauseContext,
  ClauseValidationResult
} from '../../query/clauses/base';

// ============================================================================
// RETAINER CLAUSE RESULT
// ============================================================================

export interface RetainerClauseResult {
  type: string;
  config: RetainerConfig;
}

export interface RetainerConfig {
  retainerType?: string;
  categories?: string[];
  rolloverType?: string;
  utilizationType?: string;
  contractType?: string;
  valueType?: string;
  alertType?: string;
  forecastType?: string;
  threshold?: any;
  horizon?: string;
  options?: any;
}

// ============================================================================
// RETAINER CLAUSE HANDLER
// ============================================================================

export class RetainerClauseHandler extends BaseClauseHandler<RetainerClauseNode, RetainerClauseResult> {
  constructor() {
    super('RetainerClause');
  }

  handle(clause: RetainerClauseNode, context?: ClauseContext): RetainerClauseResult {
    return {
      type: 'retainer',
      config: {
        retainerType: clause.retainerType,
        options: clause.options
      }
    };
  }

  protected validateSpecific(clause: RetainerClauseNode): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validTypes = ['health', 'status', 'forecast', 'analysis', 'performance', 'optimization'];
    if (!validTypes.includes(clause.retainerType)) {
      errors.push(`Invalid retainer type: ${clause.retainerType}. Valid types: ${validTypes.join(', ')}`);
    }

    return this.createValidationResult(errors, warnings);
  }
}

// ============================================================================
// SERVICE CLAUSE HANDLER
// ============================================================================

export class ServiceClauseHandler extends BaseClauseHandler<ServiceClauseNode, RetainerClauseResult> {
  constructor() {
    super('ServiceClause');
  }

  handle(clause: ServiceClauseNode, context?: ClauseContext): RetainerClauseResult {
    return {
      type: 'service',
      config: {
        categories: clause.categories,
        options: clause.options
      }
    };
  }

  protected validateSpecific(clause: ServiceClauseNode): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(clause.categories)) {
      errors.push('SERVICE clause must have categories array');
      return this.createValidationResult(errors, warnings);
    }

    if (clause.categories.length === 0) {
      warnings.push('SERVICE clause has no categories specified');
    }

    const validCategories = ['development', 'design', 'consulting', 'support', 'maintenance'];
    for (const category of clause.categories) {
      if (!validCategories.includes(category.toLowerCase())) {
        warnings.push(`Non-standard service category: ${category}`);
      }
    }

    return this.createValidationResult(errors, warnings);
  }
}

// ============================================================================
// ROLLOVER CLAUSE HANDLER
// ============================================================================

export class RolloverClauseHandler extends BaseClauseHandler<RolloverClauseNode, RetainerClauseResult> {
  constructor() {
    super('RolloverClause');
  }

  handle(clause: RolloverClauseNode, context?: ClauseContext): RetainerClauseResult {
    return {
      type: 'rollover',
      config: {
        rolloverType: clause.rolloverType,
        options: clause.options
      }
    };
  }

  protected validateSpecific(clause: RolloverClauseNode): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validTypes = ['status', 'available', 'expiring', 'history', 'forecast'];
    if (!validTypes.includes(clause.rolloverType)) {
      errors.push(`Invalid rollover type: ${clause.rolloverType}. Valid types: ${validTypes.join(', ')}`);
    }

    if (clause.options?.expiringDays !== undefined) {
      const days = clause.options.expiringDays;
      if (typeof days !== 'number' || days < 0) {
        errors.push('expiringDays must be a non-negative number');
      }
    }

    return this.createValidationResult(errors, warnings);
  }
}

// ============================================================================
// UTILIZATION CLAUSE HANDLER
// ============================================================================

export class UtilizationClauseHandler extends BaseClauseHandler<UtilizationClauseNode, RetainerClauseResult> {
  constructor() {
    super('UtilizationClause');
  }

  handle(clause: UtilizationClauseNode, context?: ClauseContext): RetainerClauseResult {
    return {
      type: 'utilization',
      config: {
        utilizationType: clause.utilizationType,
        threshold: clause.threshold
      }
    };
  }

  protected validateSpecific(clause: UtilizationClauseNode): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validTypes = ['current', 'target', 'average', 'trend', 'efficiency'];
    if (!validTypes.includes(clause.utilizationType)) {
      errors.push(`Invalid utilization type: ${clause.utilizationType}. Valid types: ${validTypes.join(', ')}`);
    }

    if (clause.threshold) {
      const threshold = clause.threshold;

      if (threshold.type === 'above' || threshold.type === 'below') {
        if (threshold.value === undefined || typeof threshold.value !== 'number') {
          errors.push('Threshold value must be a number');
        }
      } else if (threshold.type === 'between') {
        if (threshold.min === undefined || threshold.max === undefined) {
          errors.push('Between threshold must have min and max values');
        }
        if (typeof threshold.min !== 'number' || typeof threshold.max !== 'number') {
          errors.push('Threshold min and max must be numbers');
        }
        if (threshold.min !== undefined && threshold.max !== undefined && threshold.min >= threshold.max) {
          errors.push('Threshold min must be less than max');
        }
      }
    }

    return this.createValidationResult(errors, warnings);
  }
}

// ============================================================================
// CONTRACT CLAUSE HANDLER
// ============================================================================

export class ContractClauseHandler extends BaseClauseHandler<ContractClauseNode, RetainerClauseResult> {
  constructor() {
    super('ContractClause');
  }

  handle(clause: ContractClauseNode, context?: ClauseContext): RetainerClauseResult {
    return {
      type: 'contract',
      config: {
        contractType: clause.contractType,
        options: clause.options
      }
    };
  }

  protected validateSpecific(clause: ContractClauseNode): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validTypes = ['status', 'renewal', 'performance', 'health', 'terms'];
    if (!validTypes.includes(clause.contractType)) {
      errors.push(`Invalid contract type: ${clause.contractType}. Valid types: ${validTypes.join(', ')}`);
    }

    if (clause.options?.dueInDays !== undefined) {
      const days = clause.options.dueInDays;
      if (typeof days !== 'number' || days < 0) {
        errors.push('dueInDays must be a non-negative number');
      }
    }

    if (clause.options?.riskLevel !== undefined) {
      const validRisks = ['high', 'medium', 'low'];
      if (!validRisks.includes(clause.options.riskLevel)) {
        errors.push(`Invalid risk level: ${clause.options.riskLevel}. Valid levels: ${validRisks.join(', ')}`);
      }
    }

    return this.createValidationResult(errors, warnings);
  }
}

// ============================================================================
// VALUE CLAUSE HANDLER
// ============================================================================

export class ValueClauseHandler extends BaseClauseHandler<ValueClauseNode, RetainerClauseResult> {
  constructor() {
    super('ValueClause');
  }

  handle(clause: ValueClauseNode, context?: ClauseContext): RetainerClauseResult {
    return {
      type: 'value',
      config: {
        valueType: clause.valueType,
        options: clause.options
      }
    };
  }

  protected validateSpecific(clause: ValueClauseNode): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validTypes = ['delivered', 'projected', 'impact', 'roi', 'efficiency'];
    if (!validTypes.includes(clause.valueType)) {
      errors.push(`Invalid value type: ${clause.valueType}. Valid types: ${validTypes.join(', ')}`);
    }

    if (clause.options?.threshold !== undefined) {
      if (typeof clause.options.threshold !== 'number') {
        errors.push('Value threshold must be a number');
      }
    }

    if (clause.options?.type !== undefined) {
      const validThresholdTypes = ['above', 'below'];
      if (!validThresholdTypes.includes(clause.options.type)) {
        errors.push(`Invalid threshold type: ${clause.options.type}. Valid types: ${validThresholdTypes.join(', ')}`);
      }
    }

    return this.createValidationResult(errors, warnings);
  }
}

// ============================================================================
// ALERT CLAUSE HANDLER
// ============================================================================

export class AlertClauseHandler extends BaseClauseHandler<AlertClauseNode, RetainerClauseResult> {
  constructor() {
    super('AlertClause');
  }

  handle(clause: AlertClauseNode, context?: ClauseContext): RetainerClauseResult {
    return {
      type: 'alert',
      config: {
        alertType: clause.alertType,
        threshold: clause.threshold
      }
    };
  }

  protected validateSpecific(clause: AlertClauseNode): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validTypes = ['utilization', 'rollover', 'budget', 'satisfaction', 'response'];
    if (!validTypes.includes(clause.alertType)) {
      errors.push(`Invalid alert type: ${clause.alertType}. Valid types: ${validTypes.join(', ')}`);
    }

    if (clause.threshold === undefined || typeof clause.threshold !== 'number') {
      errors.push('Alert threshold must be a number');
    } else {
      if (clause.threshold < 0 || clause.threshold > 100) {
        warnings.push('Alert threshold is typically between 0 and 100');
      }
    }

    return this.createValidationResult(errors, warnings);
  }
}

// ============================================================================
// FORECAST CLAUSE HANDLER
// ============================================================================

export class ForecastClauseHandler extends BaseClauseHandler<ForecastClauseNode, RetainerClauseResult> {
  constructor() {
    super('ForecastClause');
  }

  handle(clause: ForecastClauseNode, context?: ClauseContext): RetainerClauseResult {
    return {
      type: 'forecast',
      config: {
        forecastType: clause.forecastType,
        horizon: clause.horizon || 'month'
      }
    };
  }

  protected validateSpecific(clause: ForecastClauseNode): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validTypes = ['utilization', 'rollover', 'renewal', 'budget', 'value'];
    if (!validTypes.includes(clause.forecastType)) {
      errors.push(`Invalid forecast type: ${clause.forecastType}. Valid types: ${validTypes.join(', ')}`);
    }

    if (clause.horizon) {
      const validHorizons = ['month', 'quarter', 'year', 'contract-term'];
      if (!validHorizons.includes(clause.horizon)) {
        errors.push(`Invalid forecast horizon: ${clause.horizon}. Valid horizons: ${validHorizons.join(', ')}`);
      }
    }

    return this.createValidationResult(errors, warnings);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if utilization meets threshold criteria
 */
export function meetsUtilizationThreshold(
  utilizationPercent: number,
  threshold?: { type: string; value?: number; min?: number; max?: number }
): boolean {
  if (!threshold) return true;

  switch (threshold.type) {
    case 'above':
      return threshold.value !== undefined && utilizationPercent > threshold.value;
    case 'below':
      return threshold.value !== undefined && utilizationPercent < threshold.value;
    case 'between':
      return threshold.min !== undefined &&
        threshold.max !== undefined &&
        utilizationPercent >= threshold.min &&
        utilizationPercent <= threshold.max;
    default:
      return true;
  }
}

/**
 * Calculate retainer health score
 */
export function calculateHealthScore(metrics: {
  utilization: number;
  rolloverUsage: number;
  satisfaction: number;
  responseTime: number;
}): number {
  // Weighted average of key metrics (0-100)
  const weights = {
    utilization: 0.3,
    rolloverUsage: 0.2,
    satisfaction: 0.3,
    responseTime: 0.2
  };

  const normalizedResponseTime = Math.max(0, 100 - metrics.responseTime);

  const score =
    metrics.utilization * weights.utilization +
    (100 - metrics.rolloverUsage) * weights.rolloverUsage +
    metrics.satisfaction * weights.satisfaction +
    normalizedResponseTime * weights.responseTime;

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Determine if rollover hours are expiring soon
 */
export function isRolloverExpiring(
  expirationDate: Date,
  thresholdDays: number = 30
): boolean {
  const now = new Date();
  const daysUntilExpiration = Math.floor(
    (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysUntilExpiration >= 0 && daysUntilExpiration <= thresholdDays;
}

/**
 * Calculate service mix distribution
 */
export function calculateServiceMix(
  services: { category: string; hours: number }[]
): { [category: string]: number } {
  const totalHours = services.reduce((sum, s) => sum + s.hours, 0);
  const distribution: { [category: string]: number } = {};

  for (const service of services) {
    const percentage = totalHours > 0 ? (service.hours / totalHours) * 100 : 0;
    distribution[service.category] = Math.round(percentage * 10) / 10;
  }

  return distribution;
}

/**
 * Project future utilization based on trend
 */
export function forecastUtilization(
  historicalData: { date: Date; utilization: number }[],
  horizonMonths: number = 3
): { date: Date; projected: number }[] {
  if (historicalData.length < 2) {
    return [];
  }

  // Simple linear regression for trend
  const trend = calculateTrend(historicalData.map(d => d.utilization));
  const lastUtilization = historicalData[historicalData.length - 1].utilization;
  const lastDate = new Date(historicalData[historicalData.length - 1].date);

  const forecast: { date: Date; projected: number }[] = [];

  for (let i = 1; i <= horizonMonths; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setMonth(futureDate.getMonth() + i);

    const projected = Math.max(0, Math.min(100, lastUtilization + trend * i));
    forecast.push({ date: futureDate, projected: Math.round(projected * 10) / 10 });
  }

  return forecast;
}

/**
 * Calculate simple linear trend
 */
function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;

  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = values.reduce((sum, val, idx) => sum + val * idx, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return isFinite(slope) ? slope : 0;
}

/**
 * Check if contract renewal is approaching
 */
export function isRenewalApproaching(
  renewalDate: Date,
  thresholdDays: number = 90
): boolean {
  const now = new Date();
  const daysUntilRenewal = Math.floor(
    (renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysUntilRenewal >= 0 && daysUntilRenewal <= thresholdDays;
}

/**
 * Calculate ROI for retainer value
 */
export function calculateROI(
  valueDelivered: number,
  costInvested: number
): number {
  if (costInvested === 0) return 0;
  return ((valueDelivered - costInvested) / costInvested) * 100;
}
