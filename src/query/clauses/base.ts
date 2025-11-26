// Base Clause Handler
// Provides common functionality for all clause handlers

import {
  ClauseNode
} from '../ast';

// ============================================================================
// BASE CLAUSE HANDLER INTERFACE
// ============================================================================

export interface ClauseHandler<T extends ClauseNode, R = any> {
  /**
   * Check if this handler can process the given clause
   */
  canHandle(clause: ClauseNode): boolean;

  /**
   * Process the clause and return a result
   */
  handle(clause: T, context?: ClauseContext): R;

  /**
   * Validate the clause for correctness
   */
  validate(clause: T): ClauseValidationResult;
}

// ============================================================================
// CLAUSE CONTEXT
// ============================================================================

export interface ClauseContext {
  /**
   * All clauses in the query
   */
  allClauses: ClauseNode[];

  /**
   * Data source for query execution
   */
  dataSource?: any;

  /**
   * Options for clause processing
   */
  options?: {
    [key: string]: any;
  };
}

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ClauseValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// BASE CLAUSE HANDLER IMPLEMENTATION
// ============================================================================

export abstract class BaseClauseHandler<T extends ClauseNode, R = any>
  implements ClauseHandler<T, R> {
  constructor(protected readonly clauseType: string) { }

  canHandle(clause: ClauseNode): boolean {
    return clause.type === this.clauseType;
  }

  abstract handle(clause: T, context?: ClauseContext): R;

  validate(clause: T): ClauseValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!clause.type) {
      errors.push('Clause missing type property');
    }

    if (clause.type !== this.clauseType) {
      errors.push(`Expected clause type '${this.clauseType}', got '${clause.type}'`);
    }

    // Perform type-specific validation
    const specificValidation = this.validateSpecific(clause);
    errors.push(...specificValidation.errors);
    warnings.push(...specificValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Type-specific validation to be implemented by subclasses
   */
  protected validateSpecific(clause: T): ClauseValidationResult {
    return { isValid: true, errors: [], warnings: [] };
  }

  /**
   * Helper to create a validation result
   */
  protected createValidationResult(
    errors: string[] = [],
    warnings: string[] = []
  ): ClauseValidationResult {
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// ============================================================================
// CLAUSE HANDLER REGISTRY
// ============================================================================

export class ClauseHandlerRegistry {
  private handlers: Map<string, ClauseHandler<any, any>> = new Map();

  /**
   * Register a clause handler
   */
  register<T extends ClauseNode, R = any>(handler: ClauseHandler<T, R>): void {
    const clauseType = this.extractClauseType(handler);
    if (this.handlers.has(clauseType)) {
      throw new Error(`Handler for clause type '${clauseType}' already registered`);
    }
    this.handlers.set(clauseType, handler);
  }

  /**
   * Get a handler for a specific clause type
   */
  getHandler<T extends ClauseNode, R = any>(
    clauseType: string
  ): ClauseHandler<T, R> | null {
    return this.handlers.get(clauseType) || null;
  }

  /**
   * Find a handler that can handle the given clause
   */
  findHandler<T extends ClauseNode, R = any>(
    clause: ClauseNode
  ): ClauseHandler<T, R> | null {
    for (const handler of this.handlers.values()) {
      if (handler.canHandle(clause)) {
        return handler as ClauseHandler<T, R>;
      }
    }
    return null;
  }

  /**
   * Handle a clause using the appropriate handler
   */
  handle<R = any>(clause: ClauseNode, context?: ClauseContext): R {
    const handler = this.findHandler(clause);
    if (!handler) {
      throw new Error(`No handler found for clause type: ${clause.type}`);
    }
    return handler.handle(clause, context);
  }

  /**
   * Validate a clause using the appropriate handler
   */
  validate(clause: ClauseNode): ClauseValidationResult {
    const handler = this.findHandler(clause);
    if (!handler) {
      return {
        isValid: false,
        errors: [`No handler found for clause type: ${clause.type}`],
        warnings: []
      };
    }
    return handler.validate(clause);
  }

  /**
   * Check if a handler is registered for a clause type
   */
  hasHandler(clauseType: string): boolean {
    return this.handlers.has(clauseType);
  }

  /**
   * Get all registered clause types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Clear all registered handlers
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Extract clause type from handler (helper method)
   */
  private extractClauseType(handler: ClauseHandler<any, any>): string {
    // Try to get from handler if it's a BaseClauseHandler
    if (handler instanceof BaseClauseHandler) {
      return (handler as any).clauseType;
    }

    // Otherwise, we need to infer it somehow
    // This is a fallback and might not work in all cases
    throw new Error('Cannot extract clause type from non-BaseClauseHandler');
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a default clause context
 */
export function createClauseContext(
  allClauses: ClauseNode[],
  dataSource?: any,
  options?: any
): ClauseContext {
  return {
    allClauses,
    dataSource,
    options
  };
}

/**
 * Merge validation results
 */
export function mergeValidationResults(
  ...results: ClauseValidationResult[]
): ClauseValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const result of results) {
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================================
// GLOBAL REGISTRY INSTANCE
// ============================================================================

export const globalClauseRegistry = new ClauseHandlerRegistry();
