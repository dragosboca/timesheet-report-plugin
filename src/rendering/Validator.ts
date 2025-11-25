// Common validation utilities for charts and tables

/**
 * Validation result structure
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Common validator for data structures
 */
export class Validator {
  /**
   * Create a new validation result
   */
  static createResult(): ValidationResult {
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * Add error to validation result
   */
  static addError(result: ValidationResult, error: string): void {
    result.valid = false;
    result.errors.push(error);
  }

  /**
   * Add warning to validation result
   */
  static addWarning(result: ValidationResult, warning: string): void {
    result.warnings.push(warning);
  }

  /**
   * Validate that data array is not empty
   */
  static validateNotEmpty(data: unknown[], fieldName = 'data'): ValidationResult {
    const result = this.createResult();

    if (!data || data.length === 0) {
      this.addError(result, `${fieldName} is empty or undefined`);
    }

    return result;
  }

  /**
   * Validate that all required fields exist in data objects
   */
  static validateRequiredFields(
    data: unknown[],
    requiredFields: string[],
    dataName = 'data'
  ): ValidationResult {
    const result = this.createResult();

    if (!data || data.length === 0) {
      this.addError(result, `${dataName} is empty or undefined`);
      return result;
    }

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item || typeof item !== 'object') {
        this.addError(result, `${dataName}[${i}] is not a valid object`);
        continue;
      }

      for (const field of requiredFields) {
        if (!(field in item)) {
          this.addError(result, `${dataName}[${i}] is missing required field: ${field}`);
        }
      }
    }

    return result;
  }

  /**
   * Validate numeric field values
   */
  static validateNumericFields(
    data: unknown[],
    numericFields: string[],
    dataName = 'data'
  ): ValidationResult {
    const result = this.createResult();

    if (!data || data.length === 0) {
      return result; // Skip validation if no data
    }

    for (let i = 0; i < data.length; i++) {
      const item = data[i] as Record<string, unknown>;
      if (!item || typeof item !== 'object') {
        continue;
      }

      for (const field of numericFields) {
        if (field in item) {
          const value = item[field];
          if (value !== null && value !== undefined && typeof value !== 'number') {
            this.addError(result, `${dataName}[${i}].${field} is not a number: ${value}`);
          } else if (typeof value === 'number' && isNaN(value)) {
            this.addWarning(result, `${dataName}[${i}].${field} is NaN`);
          }
        }
      }
    }

    return result;
  }

  /**
   * Validate date field values
   */
  static validateDateFields(
    data: unknown[],
    dateFields: string[],
    dataName = 'data'
  ): ValidationResult {
    const result = this.createResult();

    if (!data || data.length === 0) {
      return result; // Skip validation if no data
    }

    for (let i = 0; i < data.length; i++) {
      const item = data[i] as Record<string, unknown>;
      if (!item || typeof item !== 'object') {
        continue;
      }

      for (const field of dateFields) {
        if (field in item) {
          const value = item[field];
          if (value !== null && value !== undefined) {
            const date = value instanceof Date ? value : new Date(value as string | number);
            if (isNaN(date.getTime())) {
              this.addError(result, `${dataName}[${i}].${field} is not a valid date: ${value}`);
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Validate array length matches expected count
   */
  static validateArrayLength(
    data: unknown[],
    expectedLength: number,
    fieldName = 'data'
  ): ValidationResult {
    const result = this.createResult();

    if (!data) {
      this.addError(result, `${fieldName} is undefined`);
      return result;
    }

    if (data.length !== expectedLength) {
      this.addWarning(
        result,
        `${fieldName} length (${data.length}) does not match expected length (${expectedLength})`
      );
    }

    return result;
  }

  /**
   * Merge multiple validation results
   */
  static mergeResults(...results: ValidationResult[]): ValidationResult {
    const merged = this.createResult();

    for (const result of results) {
      if (!result.valid) {
        merged.valid = false;
      }
      merged.errors.push(...result.errors);
      merged.warnings.push(...result.warnings);
    }

    return merged;
  }

  /**
   * Validate that columns exist and have required properties
   */
  static validateColumns(columns: unknown[], columnsName = 'columns'): ValidationResult {
    const result = this.createResult();

    if (!columns || columns.length === 0) {
      this.addError(result, `${columnsName} is empty or undefined`);
      return result;
    }

    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (!col || typeof col !== 'object') {
        this.addError(result, `${columnsName}[${i}] is not a valid object`);
        continue;
      }

      const column = col as Record<string, unknown>;

      if (!column.key) {
        this.addError(result, `${columnsName}[${i}] is missing required 'key' property`);
      }

      if (!column.label) {
        this.addError(result, `${columnsName}[${i}] is missing required 'label' property`);
      }
    }

    return result;
  }

  /**
   * Validate that a value is within a range
   */
  static validateRange(
    value: number,
    min: number,
    max: number,
    fieldName = 'value'
  ): ValidationResult {
    const result = this.createResult();

    if (isNaN(value)) {
      this.addError(result, `${fieldName} is NaN`);
      return result;
    }

    if (value < min || value > max) {
      this.addWarning(result, `${fieldName} (${value}) is outside expected range [${min}, ${max}]`);
    }

    return result;
  }
}
