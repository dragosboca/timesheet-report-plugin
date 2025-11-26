/**
 * Retainer Module Type Extensions
 *
 * This file contains type extensions that augment core types with retainer-specific properties.
 * These are kept separate to maintain clean isolation from core functionality.
 */

// ============================================================================
// QUERY EXTENSIONS
// ============================================================================

/**
 * Retainer-specific WHERE clause extensions
 * These properties are added to the core WHERE clause when retainer is enabled
 */
export interface RetainerWhereExtensions {
  /** Filter by service category (e.g., "development", "support") */
  service?: string;

  /** Filter by work category */
  category?: string;

  /** Filter by utilization threshold (0-1 or percentage) */
  utilization?: number;

  /** Filter by rollover hours available */
  rollover?: number;

  /** Filter by value delivered */
  value?: number;

  /** Filter by priority level */
  priority?: string;
}

/**
 * Retainer-specific VIEW types
 */
export type RetainerViewType =
  | 'retainer'      // Retainer overview
  | 'health'        // Health metrics dashboard
  | 'rollover'      // Rollover status and history
  | 'services'      // Service category breakdown
  | 'contract'      // Contract details and status
  | 'performance'   // Performance metrics
  | 'renewal';      // Renewal preparation

/**
 * Retainer-specific CHART types
 */
export type RetainerChartType =
  | 'service_mix'      // Service category distribution
  | 'rollover_trend'   // Rollover hours over time
  | 'health_score'     // Health metrics visualization
  | 'value_delivery'   // Value delivered over time
  | 'response_time'    // Response time trends
  | 'satisfaction'     // Client satisfaction trends
  | 'forecast'         // Usage forecast
  | 'burn_rate';       // Hour consumption rate

/**
 * Retainer-specific PERIOD types
 */
export type RetainerPeriodType =
  | 'next-month'       // Next month forecast
  | 'next-quarter'     // Next quarter forecast
  | 'contract-term';   // Entire contract duration

/**
 * Retainer query clause data
 */
export interface RetainerQueryData {
  retainer?: {
    type?: 'health' | 'status' | 'forecast' | 'analysis' | 'performance' | 'optimization';
    options?: any;
  };
  service?: {
    categories?: string[];
    options?: any;
  };
  rollover?: {
    type?: 'status' | 'available' | 'expiring' | 'history' | 'forecast';
    options?: any;
  };
  utilization?: {
    type?: 'current' | 'target' | 'average' | 'trend' | 'efficiency';
    threshold?: any;
  };
  contract?: {
    type?: 'status' | 'renewal' | 'performance' | 'health' | 'terms';
    options?: any;
  };
  value?: {
    type?: 'delivered' | 'projected' | 'impact' | 'roi' | 'efficiency';
    options?: any;
  };
  alerts?: Array<{
    type: string;
    threshold: number;
  }>;
}

/**
 * Complete retainer-enhanced query interface
 * This extends the core TimesheetQuery with retainer-specific properties
 */
export interface RetainerEnhancedQuery {
  where?: RetainerWhereExtensions & {
    year?: number;
    month?: number;
    project?: string;
    dateRange?: { start: string; end: string };
  };
  show?: string[];
  view?: 'summary' | 'chart' | 'table' | 'full' | RetainerViewType;
  chartType?: 'trend' | 'monthly' | 'budget' | RetainerChartType;
  period?: 'current-year' | 'all-time' | 'last-6-months' | 'last-12-months' | RetainerPeriodType;
  size?: 'compact' | 'normal' | 'detailed';

  // Retainer-specific query data
  retainerData?: RetainerQueryData;
}

// ============================================================================
// TIMESHEET ENTRY EXTENSIONS
// ============================================================================

/**
 * Retainer-specific metadata for timesheet entries
 */
export interface RetainerEntryMetadata {
  /** Service category (e.g., "development", "support", "consulting") */
  serviceCategory?: string;

  /** Priority level */
  priority?: 'routine' | 'urgent' | 'emergency';

  /** Whether this entry counts against retainer hours */
  billable?: boolean;

  /** Time taken to respond (hours) */
  responseTime?: number;

  /** Time taken to resolve (hours) */
  resolutionTime?: number;

  /** Value impact information */
  valueImpact?: {
    type: 'cost_savings' | 'revenue_generation' | 'efficiency_gain' | 'risk_mitigation';
    estimatedValue: number;
    description: string;
    measurable: boolean;
  };

  /** Client satisfaction score (1-5) */
  clientSatisfactionScore?: number;

  /** Retainer period ID this entry belongs to */
  periodId?: string;
}

/**
 * Extended timesheet entry with retainer metadata
 */
export interface RetainerTimeEntry {
  // Core fields
  date: string | Date;
  hours: number;
  project?: string;
  notes?: string;

  // Retainer-specific
  retainer?: RetainerEntryMetadata;
}

// ============================================================================
// SETTINGS EXTENSIONS
// ============================================================================

/**
 * Retainer-specific settings that extend core settings
 */
export interface RetainerSettingsExtension {
  /** Whether retainer features are enabled */
  enabled: boolean;

  /** Retainer configuration */
  settings: {
    monthlyHours: number;
    rolloverPolicy: 'none' | 'unlimited' | 'capped' | 'expiring';
    maxRolloverHours?: number;
    rolloverExpiryMonths?: number;
    utilizationTarget: { min: number; max: number };
    renewalNotificationDays: number;
    emergencyResponseSLA: number;
    serviceCategories: Array<{
      id: string;
      name: string;
      description: string;
      priority: number;
      billable: boolean;
    }>;
    billingCycle: 'monthly' | 'quarterly' | 'annual';
    autoRenewal: boolean;
  };

  /** Contract details */
  contract?: {
    id: string;
    clientName: string;
    startDate: Date;
    endDate: Date;
    monthlyRate: number;
    hourlyRate: number;
    status: 'active' | 'pending' | 'expired' | 'cancelled';
  };

  /** Current period tracking */
  currentPeriodId?: string;

  /** Last sync timestamp */
  lastSyncDate?: Date;

  /** Automation settings */
  autoReporting?: boolean;
  notificationsEnabled?: boolean;
}

/**
 * Extended settings interface that includes retainer
 * This is what the plugin settings become when retainer is enabled
 */
export interface ExtendedTimesheetReportSettings {
  // Core settings (from base plugin)
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

  // Project configuration
  project: {
    name: string;
    type: 'hourly' | 'fixed-hours' | 'retainer';
    budgetHours?: number;
    defaultRate?: number;
    deadline?: string;
    renewalDate?: string;
  };

  // Retainer extension (optional)
  retainer?: RetainerSettingsExtension;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if settings have retainer enabled
 */
export function hasRetainerSettings(settings: any): settings is ExtendedTimesheetReportSettings {
  return settings?.retainer?.enabled === true && settings?.project?.type === 'retainer';
}

/**
 * Check if a query has retainer extensions
 */
export function hasRetainerQuery(query: any): query is RetainerEnhancedQuery {
  return !!(
    query?.retainerData ||
    query?.where?.service ||
    query?.where?.utilization ||
    query?.where?.rollover
  );
}

/**
 * Check if an entry has retainer metadata
 */
export function hasRetainerMetadata(entry: any): entry is RetainerTimeEntry {
  return !!entry?.retainer;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Retainer feature flags
 */
export interface RetainerFeatureFlags {
  rolloverTracking: boolean;
  serviceCategories: boolean;
  healthMetrics: boolean;
  forecastAnalysis: boolean;
  renewalManagement: boolean;
  valueTracking: boolean;
  alerts: boolean;
}

/**
 * Retainer module status
 */
export interface RetainerModuleStatus {
  enabled: boolean;
  configured: boolean;
  status: 'active' | 'disabled' | 'misconfigured';
  message: string;
  features?: RetainerFeatureFlags;
}
