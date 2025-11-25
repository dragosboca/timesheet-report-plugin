// Formatting utilities for consistent display across the application

export class FormatUtils {
  /**
   * Format a number for display with consistent precision
   */
  static formatNumber(num: number, options: {
    decimals?: number;
    currency?: boolean;
    currencySymbol?: string;
    compact?: boolean;
  } = {}): string {
    const {
      decimals = 1,
      currency = false,
      currencySymbol = '€',
      compact = false
    } = options;

    if (typeof num !== 'number' || isNaN(num)) {
      return '0';
    }

    let formatted: string;

    if (compact && num >= 1000) {
      // Format large numbers compactly (e.g., 1.2K, 1.5M)
      if (num >= 1000000) {
        formatted = (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        formatted = (num / 1000).toFixed(1) + 'K';
      } else {
        formatted = num.toFixed(decimals);
      }
    } else {
      formatted = num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
      });
    }

    if (currency) {
      return `${currencySymbol}${formatted}`;
    }

    return formatted;
  }

  /**
   * Format hours with appropriate units
   */
  static formatHours(hours: number, options: {
    showUnits?: boolean;
    compact?: boolean;
    precision?: number;
  } = {}): string {
    const {
      showUnits = true,
      compact = false,
      precision = 1
    } = options;

    const formatted = this.formatNumber(hours, { decimals: precision, compact });

    if (!showUnits) {
      return formatted;
    }

    if (compact) {
      return `${formatted}h`;
    }

    const unit = Math.abs(hours) === 1 ? 'hour' : 'hours';
    return `${formatted} ${unit}`;
  }

  /**
   * Format currency amount
   */
  static formatCurrency(amount: number, options: {
    symbol?: string;
    compact?: boolean;
    precision?: number;
  } = {}): string {
    const {
      symbol = '€',
      compact = false,
      precision = 2
    } = options;

    return this.formatNumber(amount, {
      decimals: precision,
      currency: true,
      currencySymbol: symbol,
      compact
    });
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number, options: {
    precision?: number;
    showSign?: boolean;
  } = {}): string {
    const {
      precision = 0,
      showSign = false
    } = options;

    if (typeof value !== 'number' || isNaN(value)) {
      return '0%';
    }

    // Convert decimal to percentage if needed
    const percentage = value > 1 ? value : value * 100;
    const formatted = percentage.toFixed(precision);

    return showSign && percentage > 0 ? `+${formatted}%` : `${formatted}%`;
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date | string, options: {
    format?: 'short' | 'medium' | 'long' | 'iso';
    includeTime?: boolean;
  } = {}): string {
    const {
      format = 'medium',
      includeTime = false
    } = options;

    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit'
        });

      case 'medium':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        });

      case 'iso':
        return dateObj.toISOString().split('T')[0];

      default:
        return dateObj.toLocaleDateString();
    }
  }

  /**
   * Format time duration (e.g., "2h 30m")
   */
  static formatDuration(hours: number, options: {
    format?: 'short' | 'long';
    showSeconds?: boolean;
  } = {}): string {
    const {
      format = 'short',
      showSeconds = false
    } = options;

    if (typeof hours !== 'number' || isNaN(hours) || hours < 0) {
      return format === 'short' ? '0h' : '0 hours';
    }

    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const s = showSeconds ? Math.round((hours * 3600) % 60) : 0;

    if (format === 'short') {
      let result = '';
      if (h > 0) result += `${h}h`;
      if (m > 0) result += `${result ? ' ' : ''}${m}m`;
      if (showSeconds && s > 0) result += `${result ? ' ' : ''}${s}s`;
      return result || '0h';
    } else {
      const parts: string[] = [];
      if (h > 0) parts.push(`${h} ${h === 1 ? 'hour' : 'hours'}`);
      if (m > 0) parts.push(`${m} ${m === 1 ? 'minute' : 'minutes'}`);
      if (showSeconds && s > 0) parts.push(`${s} ${s === 1 ? 'second' : 'seconds'}`);
      return parts.join(', ') || '0 hours';
    }
  }

  /**
   * Format relative date (e.g., "2 days ago", "in 3 weeks")
   */
  static formatRelativeDate(date: Date | string): string {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays === -1) {
      return 'Tomorrow';
    } else if (diffDays > 1 && diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < -1 && diffDays > -7) {
      return `In ${Math.abs(diffDays)} days`;
    } else if (diffWeeks > 0 && diffWeeks < 4) {
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffWeeks < 0 && diffWeeks > -4) {
      return `In ${Math.abs(diffWeeks)} ${Math.abs(diffWeeks) === 1 ? 'week' : 'weeks'}`;
    } else if (diffMonths > 0 && diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    } else if (diffMonths < 0 && diffMonths > -12) {
      return `In ${Math.abs(diffMonths)} ${Math.abs(diffMonths) === 1 ? 'month' : 'months'}`;
    } else {
      // More than a year, show actual date
      return this.formatDate(dateObj, { format: 'medium' });
    }
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Format a list of items with proper grammar
   */
  static formatList(items: string[], options: {
    conjunction?: 'and' | 'or';
    maxItems?: number;
  } = {}): string {
    const {
      conjunction = 'and',
      maxItems = Infinity
    } = options;

    if (items.length === 0) return '';
    if (items.length === 1) return items[0];

    const displayItems = items.slice(0, maxItems);
    const remaining = items.length - maxItems;

    if (displayItems.length === 2) {
      return `${displayItems[0]} ${conjunction} ${displayItems[1]}${remaining > 0 ? ` and ${remaining} more` : ''}`;
    }

    const lastItem = displayItems.pop();
    return `${displayItems.join(', ')}, ${conjunction} ${lastItem}${remaining > 0 ? ` and ${remaining} more` : ''}`;
  }

  /**
   * Truncate text with ellipsis
   */
  static truncateText(text: string, maxLength: number, options: {
    ellipsis?: string;
    wordBoundary?: boolean;
  } = {}): string {
    const {
      ellipsis = '...',
      wordBoundary = true
    } = options;

    if (text.length <= maxLength) {
      return text;
    }

    if (wordBoundary) {
      const truncated = text.substring(0, maxLength - ellipsis.length);
      const lastSpaceIndex = truncated.lastIndexOf(' ');

      if (lastSpaceIndex > 0) {
        return truncated.substring(0, lastSpaceIndex) + ellipsis;
      }
    }

    return text.substring(0, maxLength - ellipsis.length) + ellipsis;
  }

  /**
   * Escape HTML characters in text
   */
  static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Escape Markdown characters in text
   */
  static escapeMarkdown(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/~/g, '\\~')
      .replace(/`/g, '\\`')
      .replace(/>/g, '\\>')
      .replace(/#/g, '\\#')
      .replace(/\+/g, '\\+')
      .replace(/-/g, '\\-')
      .replace(/=/g, '\\=')
      .replace(/\|/g, '\\|')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\./g, '\\.')
      .replace(/!/g, '\\!');
  }
}
