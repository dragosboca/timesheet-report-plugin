// Clauses Module Index
// Central export point for all clause-related functionality

// ============================================================================
// CORE CLAUSES (Always Available)
// ============================================================================

export * from './base';
export * from './where';
export * from './show';
export * from './aggregation';

// ============================================================================
// OPTIONAL CLAUSES (Feature-dependent)
// ============================================================================

/**
 * Retainer clauses are exported from a separate module.
 * Import them directly from the retainer module if needed:
 *
 * import { RetainerClauseHandler, ServiceClauseHandler } from '../retainer/query/clauses';
 *
 * This allows the retainer feature to be completely removed without breaking core functionality.
 *
 * To restore the old behavior (direct export), uncomment the line below:
 * export * from '../retainer/query/clauses';
 */
