/**
 * Retainer Module - Optional Feature
 *
 * This module provides advanced retainer project management features.
 * It is completely isolated and can be removed without affecting core functionality.
 *
 * TO REMOVE THIS FEATURE:
 * 1. Delete the entire /src/retainer directory
 * 2. Remove retainer imports from /src/query/clauses/index.ts
 * 3. Remove retainer references from main.ts (if any)
 * 4. Remove RETAINER-QUERY-EXAMPLES.md documentation
 * 5. The plugin will continue to work normally
 *
 * DESIGN PRINCIPLES:
 * - Zero coupling with core features
 * - Opt-in only - must be explicitly enabled
 * - Graceful degradation if disabled
 * - All functionality contained within this module
 */

// ============================================================================
// PUBLIC API - Only export what's necessary for integration
// ============================================================================

// Type Extensions (augment core types)
export type {
  RetainerWhereExtensions,
  RetainerViewType,
  RetainerChartType,
  RetainerPeriodType,
  RetainerQueryData,
  RetainerEnhancedQuery,
  RetainerEntryMetadata,
  RetainerTimeEntry,
  RetainerSettingsExtension,
  ExtendedTimesheetReportSettings,
  RetainerFeatureFlags,
  RetainerModuleStatus
} from './types';

export {
  hasRetainerSettings,
  hasRetainerQuery,
  hasRetainerMetadata
} from './types';

// Core Types (from API)
export type {
  RetainerSettings,
  ServiceCategory,
  RetainerPeriod,
  RetainerUsage,
  ValueImpact,
  RolloverAccount,
  RetainerContract,
  RetainerHealthMetrics,
  RetainerForecast,
  RetainerRenewalData
} from './api';

// Core API
export {
  RetainerAPI,
  createRetainerAPI,
  RetainerUtils
} from './api';

// Integration Layer (connects to main plugin)
export {
  RetainerIntegration,
  createRetainerIntegration,
  RetainerQueryExtensions,
  extendPluginForRetainer
} from './integration';

// Settings UI
export {
  RetainerSettingsTab,
  DEFAULT_RETAINER_SETTINGS
} from './settings';

// Query Extensions (for query language integration)
export type {
  RetainerClauseResult,
  RetainerConfig
} from './query/clauses';

export {
  RetainerClauseHandler,
  ServiceClauseHandler,
  RolloverClauseHandler,
  UtilizationClauseHandler,
  ContractClauseHandler,
  ValueClauseHandler,
  AlertClauseHandler,
  ForecastClauseHandler,
  meetsUtilizationThreshold,
  calculateHealthScore,
  isRolloverExpiring,
  calculateServiceMix,
  forecastUtilization,
  isRenewalApproaching,
  calculateROI
} from './query/clauses';

// ============================================================================
// FEATURE FLAG - Check if retainer is enabled
// ============================================================================

import type { TimesheetReportSettings } from '../settings';

/**
 * Check if retainer features are enabled in settings
 * Returns false if the feature is not configured or disabled
 */
export function isRetainerEnabled(settings: any): boolean {
  try {
    return settings?.project?.type === 'retainer' &&
      settings?.retainer?.enabled === true;
  } catch {
    return false;
  }
}

/**
 * Safe wrapper to check if retainer module should be loaded
 * Use this before importing or initializing any retainer features
 */
export function shouldLoadRetainerModule(settings: any): boolean {
  // Check if retainer is explicitly enabled
  if (!isRetainerEnabled(settings)) {
    return false;
  }

  // Additional validation: ensure contract exists
  try {
    return !!settings.retainer?.contract;
  } catch {
    return false;
  }
}

// ============================================================================
// MODULE METADATA
// ============================================================================

export const RETAINER_MODULE = {
  name: 'Retainer Management',
  version: '1.0.0',
  description: 'Advanced retainer project tracking and management',
  optional: true,
  experimental: true,

  // Feature flags for granular control
  features: {
    rolloverTracking: true,
    serviceCategories: true,
    healthMetrics: true,
    forecastAnalysis: true,
    renewalManagement: true,
    valueTracking: true,
    alerts: true
  }
} as const;

/**
 * Get a human-readable status of the retainer module
 */
export function getRetainerModuleStatus(settings: any): {
  enabled: boolean;
  configured: boolean;
  status: 'active' | 'disabled' | 'misconfigured';
  message: string;
} {
  const enabled = isRetainerEnabled(settings);
  const configured = shouldLoadRetainerModule(settings);

  if (enabled && configured) {
    return {
      enabled: true,
      configured: true,
      status: 'active',
      message: 'Retainer features are active and properly configured'
    };
  }

  if (enabled && !configured) {
    return {
      enabled: true,
      configured: false,
      status: 'misconfigured',
      message: 'Retainer is enabled but contract configuration is missing'
    };
  }

  return {
    enabled: false,
    configured: false,
    status: 'disabled',
    message: 'Retainer features are disabled'
  };
}
