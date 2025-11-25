// Common rendering utilities for charts and tables

/**
 * Common rendering utilities
 */
export class RenderUtils {
  /**
   * Escape HTML characters
   */
  static escapeHtml(text: string): string {
    if (!text) {
      return '';
    }

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Escape Markdown characters
   */
  static escapeMarkdown(text: string): string {
    if (!text) {
      return '';
    }

    return text
      .replace(/\|/g, '\\|')
      .replace(/\n/g, ' ')
      .replace(/\r/g, '');
  }

  /**
   * Create canvas element for charts
   */
  static createCanvas(container: HTMLElement, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.style.height = `${height}px`;
    container.appendChild(canvas);
    return canvas;
  }

  /**
   * Get value from nested object using dot notation
   */
  static getNestedValue(obj: unknown, path: string): unknown {
    if (!obj || typeof obj !== 'object') {
      return undefined;
    }

    const keys = path.split('.');
    let value: unknown = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Calculate working days in a month
   */
  static getWorkingDaysInMonth(year: number, month: number): number {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Not Sunday or Saturday
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  /**
   * Calculate total from array of objects
   */
  static calculateTotal(data: unknown[], field: string): number {
    if (!data || data.length === 0) {
      return 0;
    }

    return data.reduce<number>((sum, item) => {
      const value = this.getNestedValue(item, field);
      const num = typeof value === 'number' && !isNaN(value) ? value : 0;
      return sum + num;
    }, 0);
  }

  /**
   * Group data by a field value
   */
  static groupBy<T>(data: T[], getKey: (item: T) => string): Map<string, T[]> {
    const groups = new Map<string, T[]>();

    for (const item of data) {
      const key = getKey(item);
      const group = groups.get(key);

      if (group) {
        group.push(item);
      } else {
        groups.set(key, [item]);
      }
    }

    return groups;
  }

  /**
   * Clamp a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Check if value is numeric
   */
  static isNumeric(value: unknown): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  /**
   * Check if value is valid date
   */
  static isValidDate(value: unknown): boolean {
    if (!value) {
      return false;
    }

    const date = value instanceof Date ? value : new Date(value as string);
    return !isNaN(date.getTime());
  }

  /**
   * Deep clone an object
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }

    const cloned: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone((obj as Record<string, unknown>)[key]);
      }
    }

    return cloned as T;
  }

  /**
   * Truncate text to specified length
   */
  static truncate(text: string, maxLength: number, suffix = '...'): string {
    if (!text || text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Generate unique ID
   */
  static generateId(prefix = 'id'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Debounce function
   */
  static debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        func(...args);
      };

      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Create HTML element with attributes
   */
  static createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options?: {
      className?: string;
      text?: string;
      innerHTML?: string;
      attributes?: Record<string, string>;
      styles?: Record<string, string>;
    }
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);

    if (options) {
      if (options.className) {
        element.className = options.className;
      }

      if (options.text) {
        element.textContent = options.text;
      }

      if (options.innerHTML) {
        element.innerHTML = options.innerHTML;
      }

      if (options.attributes) {
        for (const [key, value] of Object.entries(options.attributes)) {
          element.setAttribute(key, value);
        }
      }

      if (options.styles) {
        for (const [key, value] of Object.entries(options.styles)) {
          if (value !== undefined) {
            element.style.setProperty(key, value);
          }
        }
      }
    }

    return element;
  }
}
