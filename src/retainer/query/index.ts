/**
 * Retainer Query Module
 *
 * Query language extensions for retainer-specific functionality.
 * This module provides clause handlers and utilities for querying retainer data.
 */

// ============================================================================
// CLAUSE HANDLERS
// ============================================================================

export type {
  RetainerClauseResult,
  RetainerConfig
} from './clauses';

export {
  RetainerClauseHandler,
  ServiceClauseHandler,
  RolloverClauseHandler,
  UtilizationClauseHandler,
  ContractClauseHandler,
  ValueClauseHandler,
  AlertClauseHandler,
  ForecastClauseHandler
} from './clauses';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export {
  meetsUtilizationThreshold,
  calculateHealthScore,
  isRolloverExpiring,
  calculateServiceMix,
  forecastUtilization,
  isRenewalApproaching,
  calculateROI
} from './clauses';

// ============================================================================
// CLAUSE REGISTRATION
// ============================================================================

import type { ClauseHandlerRegistry } from '../../query/clauses';
import {
  RetainerClauseHandler,
  ServiceClauseHandler,
  RolloverClauseHandler,
  UtilizationClauseHandler,
  ContractClauseHandler,
  ValueClauseHandler,
  AlertClauseHandler,
  ForecastClauseHandler
} from './clauses';

/**
 * Register all retainer clause handlers with the global registry.
 * Call this function to enable retainer query language features.
 *
 * @param registry - The clause handler registry to register with
 */
export function registerRetainerClauses(registry: ClauseHandlerRegistry): void {
  // Only register if not already registered
  try {
    registry.register(new RetainerClauseHandler());
    registry.register(new ServiceClauseHandler());
    registry.register(new RolloverClauseHandler());
    registry.register(new UtilizationClauseHandler());
    registry.register(new ContractClauseHandler());
    registry.register(new ValueClauseHandler());
    registry.register(new AlertClauseHandler());
    registry.register(new ForecastClauseHandler());
  } catch (error) {
    console.warn('Failed to register retainer clauses:', error);
  }
}

/**
 * Unregister all retainer clause handlers from the registry.
 * Note: The current ClauseHandlerRegistry doesn't support unregistration.
 * This is a placeholder for future implementation.
 *
 * @param registry - The clause handler registry to unregister from
 */
export function unregisterRetainerClauses(registry: ClauseHandlerRegistry): void {
  console.warn('Retainer clause unregistration not yet supported by ClauseHandlerRegistry');
  // TODO: Implement unregister method in ClauseHandlerRegistry if needed
}

// ============================================================================
// MODULE STATUS
// ============================================================================

/**
 * Check if retainer query clauses are registered
 * Note: This is a best-effort check using getHandler
 */
export function areRetainerClausesRegistered(registry: ClauseHandlerRegistry): boolean {
  try {
    return registry.getHandler('retainer') !== null &&
      registry.getHandler('service') !== null &&
      registry.getHandler('rollover') !== null;
  } catch {
    return false;
  }
}
