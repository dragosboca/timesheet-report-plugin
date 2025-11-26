// AST Utility Functions
// Provides validation, statistics, and analysis for AST nodes

import {
  ASTNode,
  QueryNode,
  WhereClauseNode,
  ShowClauseNode,
  ClauseNode,
  IdentifierNode,
  LiteralNode,
  BinaryExpressionNode
} from './nodes';
import { walkAST, findNodesByType } from './visitors';

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  message: string;
  node?: ASTNode;
  path?: string;
}

export interface ValidationWarning {
  message: string;
  node?: ASTNode;
  path?: string;
}

/**
 * Validate an AST for correctness and common issues
 */
export function validateAST(node: ASTNode): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check root node first before walking
  if (!node || !node.type) {
    errors.push({
      message: 'Node missing type property',
      node
    });
    return {
      isValid: false,
      errors,
      warnings
    };
  }

  try {
    walkAST(node, (currentNode) => {
      // Check for required properties
      if (!currentNode.type) {
        errors.push({
          message: 'Node missing type property',
          node: currentNode
        });
        return;
      }

      // Type-specific validation
      switch (currentNode.type) {
        case 'Literal': {
          const literal = currentNode as LiteralNode;
          if (literal.value === undefined || literal.value === null) {
            errors.push({
              message: 'Literal node missing value',
              node: currentNode
            });
          }
          if (!['string', 'number', 'date', 'percentage', 'relative_date'].includes(literal.dataType)) {
            errors.push({
              message: `Invalid literal dataType: ${literal.dataType}`,
              node: currentNode
            });
          }
          break;
        }
        case 'Identifier': {
          const identifier = currentNode as IdentifierNode;
          if (!identifier.name || identifier.name.trim() === '') {
            errors.push({
              message: 'Identifier node missing or empty name',
              node: currentNode
            });
          }
          break;
        }
        case 'Query': {
          const query = currentNode as QueryNode;
          if (!Array.isArray(query.clauses)) {
            errors.push({
              message: 'Query node must have clauses array',
              node: currentNode
            });
          }
          if (query.clauses.length === 0) {
            warnings.push({
              message: 'Query has no clauses',
              node: currentNode
            });
          }
          break;
        }
        case 'WhereClause': {
          const where = currentNode as WhereClauseNode;
          if (!Array.isArray(where.conditions)) {
            errors.push({
              message: 'WHERE clause must have conditions array',
              node: currentNode
            });
          }
          if (where.conditions.length === 0) {
            warnings.push({
              message: 'WHERE clause has no conditions',
              node: currentNode
            });
          }
          break;
        }
        case 'ShowClause': {
          const show = currentNode as ShowClauseNode;
          if (!Array.isArray(show.fields)) {
            errors.push({
              message: 'SHOW clause must have fields array',
              node: currentNode
            });
          }
          if (show.fields.length === 0) {
            errors.push({
              message: 'SHOW clause has no fields',
              node: currentNode
            });
          }
          break;
        }
        case 'BinaryExpression': {
          const binary = currentNode as BinaryExpressionNode;
          if (!binary.left || !binary.right) {
            errors.push({
              message: 'Binary expression missing left or right operand',
              node: currentNode
            });
          }
          if (!binary.operator) {
            errors.push({
              message: 'Binary expression missing operator',
              node: currentNode
            });
          }
          break;
        }
      }
    });
  } catch (error: any) {
    // Handle malformed nodes that cause traversal errors
    // Check if it's an unknown node type error
    if (error.message && error.message.includes('Unknown node type')) {
      errors.push({
        message: 'Node missing type property',
        node
      });
    } else {
      errors.push({
        message: error.message || 'Error validating AST structure',
        node
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check if an AST is semantically valid
 */
export function isValidAST(node: ASTNode): boolean {
  return validateAST(node).isValid;
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface ASTStatistics {
  totalNodes: number;
  nodesByType: { [nodeType: string]: number };
  depth: number;
  clauseCount: number;
  conditionCount: number;
  fieldCount: number;
  // Backward compatibility - expose node counts at root level
  [nodeType: string]: number | { [key: string]: number };
}

/**
 * Get statistics about an AST
 */
export function getASTStatistics(node: ASTNode): ASTStatistics {
  const nodesByType: { [nodeType: string]: number } = {};
  let totalNodes = 0;
  let maxDepth = 0;

  function traverse(currentNode: ASTNode, depth: number) {
    totalNodes++;
    nodesByType[currentNode.type] = (nodesByType[currentNode.type] || 0) + 1;
    maxDepth = Math.max(maxDepth, depth);
  }

  walkAST(node, (currentNode) => traverse(currentNode, 0));

  const clauseCount = Object.keys(nodesByType).filter(type =>
    type.endsWith('Clause')
  ).reduce((sum, type) => sum + nodesByType[type], 0);

  const conditionCount = nodesByType['BinaryExpression'] || 0;
  const fieldCount = nodesByType['Identifier'] || 0;

  // Create result with backward compatibility
  const result: ASTStatistics = {
    totalNodes,
    nodesByType,
    depth: maxDepth,
    clauseCount,
    conditionCount,
    fieldCount
  };

  // Add node counts at root level for backward compatibility
  Object.keys(nodesByType).forEach(nodeType => {
    result[nodeType] = nodesByType[nodeType];
  });

  return result;
}

// ============================================================================
// QUERY ANALYSIS
// ============================================================================

export interface QueryAnalysis {
  hasFiltering: boolean;
  hasAggregation: boolean;
  hasGrouping: boolean;
  hasOrdering: boolean;
  hasFormatting: boolean;
  hasRetainerFeatures: boolean;
  fields: string[];
  filters: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

/**
 * Analyze a query to understand its features and complexity
 */
export function analyzeQuery(query: QueryNode): QueryAnalysis {
  const hasFiltering = findNodesByType(query, 'WhereClause').length > 0;
  const hasAggregation = findNodesByType(query, 'AggregationFunction').length > 0;
  const hasGrouping = findNodesByType(query, 'GroupByClause').length > 0;
  const hasOrdering = findNodesByType(query, 'OrderByClause').length > 0;
  const hasFormatting = findNodesByType(query, 'FormatSpecifier').length > 0;

  const retainerClauses = [
    'RetainerClause',
    'ServiceClause',
    'RolloverClause',
    'UtilizationClause',
    'ContractClause',
    'ValueClause',
    'AlertClause',
    'ForecastClause'
  ];
  const hasRetainerFeatures = retainerClauses.some(type =>
    findNodesByType(query, type).length > 0
  );

  const identifiers = findNodesByType<IdentifierNode>(query, 'Identifier');
  const fields = [...new Set(identifiers.map(id => id.name))];

  const conditions = findNodesByType<BinaryExpressionNode>(query, 'BinaryExpression');
  const filters = conditions
    .map(c => {
      if (c.left.type === 'Identifier') {
        return (c.left as IdentifierNode).name;
      }
      return null;
    })
    .filter(Boolean) as string[];

  // Determine complexity
  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
  const stats = getASTStatistics(query);

  if (hasAggregation || hasGrouping || hasRetainerFeatures) {
    complexity = 'complex';
  } else if (hasFiltering && (hasOrdering || hasFormatting)) {
    complexity = 'moderate';
  } else if (stats.totalNodes > 20) {
    complexity = 'moderate';
  }

  return {
    hasFiltering,
    hasAggregation,
    hasGrouping,
    hasOrdering,
    hasFormatting,
    hasRetainerFeatures,
    fields: [...new Set(fields)],
    filters: [...new Set(filters)],
    complexity
  };
}

// ============================================================================
// CLAUSE EXTRACTION
// ============================================================================

/**
 * Extract a specific clause type from a query
 */
export function extractClause<T extends ClauseNode>(
  query: QueryNode,
  clauseType: string
): T | null {
  const clauses = query.clauses.filter(c => c.type === clauseType);
  return clauses.length > 0 ? (clauses[0] as T) : null;
}

/**
 * Extract all clauses of a specific type from a query
 */
export function extractClauses<T extends ClauseNode>(
  query: QueryNode,
  clauseType: string
): T[] {
  return query.clauses.filter(c => c.type === clauseType) as T[];
}

/**
 * Check if a query has a specific clause type
 */
export function hasClause(query: QueryNode, clauseType: string): boolean {
  return query.clauses.some(c => c.type === clauseType);
}

// ============================================================================
// FIELD EXTRACTION
// ============================================================================

/**
 * Get all field names referenced in the query
 */
export function getReferencedFields(node: ASTNode): string[] {
  const identifiers = findNodesByType<IdentifierNode>(node, 'Identifier');
  const fieldNames = identifiers.map(id => id.name);
  return [...new Set(fieldNames)];
}

/**
 * Get all field names in WHERE clause filters
 */
export function getFilteredFields(query: QueryNode): string[] {
  const whereClause = extractClause<WhereClauseNode>(query, 'WhereClause');
  if (!whereClause) return [];

  return getReferencedFields(whereClause);
}

/**
 * Get all field names in SHOW clause
 */
export function getDisplayedFields(query: QueryNode): string[] {
  const showClause = extractClause<ShowClauseNode>(query, 'ShowClause');
  if (!showClause) return [];

  return getReferencedFields(showClause);
}

// ============================================================================
// AST COMPARISON
// ============================================================================

/**
 * Compare two AST nodes for structural equality
 */
export function areNodesEqual(node1: ASTNode, node2: ASTNode): boolean {
  if (node1.type !== node2.type) return false;

  switch (node1.type) {
    case 'Literal': {
      const lit1 = node1 as LiteralNode;
      const lit2 = node2 as LiteralNode;
      return lit1.value === lit2.value && lit1.dataType === lit2.dataType;
    }
    case 'Identifier': {
      const id1 = node1 as IdentifierNode;
      const id2 = node2 as IdentifierNode;
      return id1.name === id2.name;
    }
    case 'BinaryExpression': {
      const bin1 = node1 as BinaryExpressionNode;
      const bin2 = node2 as BinaryExpressionNode;
      const right1 = bin1.right;
      const right2 = bin2.right;

      return (
        bin1.operator === bin2.operator &&
        areNodesEqual(bin1.left, bin2.left) &&
        (Array.isArray(right1) && Array.isArray(right2)
          ? right1.length === right2.length &&
          right1.every((r, i) => areNodesEqual(r, right2[i]))
          : !Array.isArray(right1) &&
          !Array.isArray(right2) &&
          areNodesEqual(right1, right2))
      );
    }
    default:
      // For other node types, do a shallow comparison
      return JSON.stringify(node1) === JSON.stringify(node2);
  }
}

// ============================================================================
// AST PRINTING
// ============================================================================

/**
 * Convert AST to a readable string representation
 */
export function printAST(node: ASTNode, indent: number = 0): string {
  const indentStr = '  '.repeat(indent);
  let result = `${indentStr}${node.type}`;

  switch (node.type) {
    case 'Literal':
      result += `: ${(node as LiteralNode).value} (${(node as LiteralNode).dataType})`;
      break;
    case 'Identifier':
      result += `: ${(node as IdentifierNode).name}`;
      break;
    case 'BinaryExpression':
      result += ` [${(node as BinaryExpressionNode).operator}]`;
      break;
  }

  result += '\n';

  // Recursively print children
  walkAST(node, (child) => {
    if (child !== node) {
      result += printAST(child, indent + 1);
    }
  });

  return result;
}
