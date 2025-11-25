// Common formatting utilities for charts and tables

import { DateUtils } from '../utils/date-utils';

/**
 * Common formatter for numbers, currency, percentages, dates, etc.
 */
export class Formatter {
  private currencySymbol: string;

  constructor(currencySymbol = '€') {
    this.currencySymbol = currencySymbol;
  }

  /**
   * Format number for display
   */
  formatNumber(value: number | null | undefined, decimals = 2): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Format currency for display
   */
  formatCurrency(value: number | null | undefined, decimals = 2): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    return this.currencySymbol + this.formatNumber(value, decimals);
  }

  /**
   * Format percentage for display
   */
  formatPercentage(value: number | null | undefined, decimals = 0): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    const percentage = value < 1 ? value * 100 : value;
    return Math.round(percentage) + '%';
  }

  /**
   * Format date for display
   */
  formatDate(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }

    return DateUtils.formatDate(date);
  }

  /**
   * Format hours for display
   */
  formatHours(value: number | null | undefined): string {
    return this.formatNumber(value, 2);
  }

  /**
   * Format date in short format (e.g., "Jan 15")
   */
  formatDateShort(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /**
   * Format value based on type detection
   */
  formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'number') {
      return this.formatNumber(value);
    }

    if (value instanceof Date) {
      return this.formatDate(value);
    }

    return String(value);
  }

  /**
   * Set currency symbol
   */
  setCurrencySymbol(symbol: string): void {
    this.currencySymbol = symbol;
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol(): string {
    return this.currencySymbol;
  }
}

/**
 * Default formatter instance
 */
export const defaultFormatter = new Formatter('€');
