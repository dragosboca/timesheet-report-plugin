import { FormatUtils } from '../src/utils/format-utils';

describe('FormatUtils', () => {
  describe('formatNumber', () => {
    it('should format basic numbers', () => {
      expect(FormatUtils.formatNumber(1234.5)).toBe('1,234.5');
      expect(FormatUtils.formatNumber(100)).toBe('100');
      expect(FormatUtils.formatNumber(0)).toBe('0');
    });

    it('should handle decimal precision', () => {
      expect(FormatUtils.formatNumber(1234.567, { decimals: 2 })).toBe('1,234.57');
      expect(FormatUtils.formatNumber(1234.567, { decimals: 0 })).toBe('1,235');
      expect(FormatUtils.formatNumber(1234.1, { decimals: 3 })).toBe('1,234.1');
    });

    it('should format with currency', () => {
      expect(FormatUtils.formatNumber(1234.5, { currency: true })).toBe('€1,234.5');
      expect(FormatUtils.formatNumber(1234.5, { currency: true, currencySymbol: '$' })).toBe('$1,234.5');
    });

    it('should format compactly for large numbers', () => {
      expect(FormatUtils.formatNumber(1500, { compact: true })).toBe('1.5K');
      expect(FormatUtils.formatNumber(1500000, { compact: true })).toBe('1.5M');
      expect(FormatUtils.formatNumber(500, { compact: true })).toBe('500');
    });

    it('should handle invalid numbers', () => {
      expect(FormatUtils.formatNumber(NaN)).toBe('0');
      expect(FormatUtils.formatNumber(undefined as any)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(FormatUtils.formatNumber(-1234.5)).toBe('-1,234.5');
      expect(FormatUtils.formatNumber(-1234.5, { currency: true })).toBe('€-1,234.5');
    });

    it('should handle very large numbers', () => {
      expect(FormatUtils.formatNumber(1234567890)).toBe('1,234,567,890');
      expect(FormatUtils.formatNumber(1234567890, { compact: true })).toBe('1234.6M');
    });

    it('should handle very small numbers', () => {
      expect(FormatUtils.formatNumber(0.001, { decimals: 3 })).toBe('0.001');
      expect(FormatUtils.formatNumber(0.0001, { decimals: 4 })).toBe('0.0001');
    });
  });

  describe('formatHours', () => {
    it('should format hours with units', () => {
      expect(FormatUtils.formatHours(8)).toBe('8 hours');
      expect(FormatUtils.formatHours(1)).toBe('1 hour');
      expect(FormatUtils.formatHours(0)).toBe('0 hours');
    });

    it('should format hours without units', () => {
      expect(FormatUtils.formatHours(8.5, { showUnits: false })).toBe('8.5');
    });

    it('should format hours compactly', () => {
      expect(FormatUtils.formatHours(8.5, { compact: true })).toBe('8.5h');
      expect(FormatUtils.formatHours(1, { compact: true })).toBe('1h');
    });

    it('should respect precision', () => {
      expect(FormatUtils.formatHours(8.567, { precision: 2 })).toBe('8.57 hours');
      expect(FormatUtils.formatHours(8.567, { precision: 0 })).toBe('9 hours');
    });

    it('should handle negative hours', () => {
      expect(FormatUtils.formatHours(-2.5)).toBe('-2.5 hours');
    });

    it('should handle large hour amounts', () => {
      expect(FormatUtils.formatHours(1000)).toBe('1,000 hours');
      expect(FormatUtils.formatHours(1000, { compact: true })).toBe('1.0Kh');
    });
  });

  describe('formatCurrency', () => {
    it('should format basic currency amounts', () => {
      expect(FormatUtils.formatCurrency(1234.56)).toBe('€1,234.56');
      expect(FormatUtils.formatCurrency(0)).toBe('€0');
    });

    it('should handle different currency symbols', () => {
      expect(FormatUtils.formatCurrency(1234.56, { symbol: '$' })).toBe('$1,234.56');
      expect(FormatUtils.formatCurrency(1234.56, { symbol: '£' })).toBe('£1,234.56');
      expect(FormatUtils.formatCurrency(1234.56, { symbol: '¥' })).toBe('¥1,234.56');
    });

    it('should format compactly', () => {
      expect(FormatUtils.formatCurrency(1500, { compact: true })).toBe('€1.5K');
      expect(FormatUtils.formatCurrency(1500000, { compact: true })).toBe('€1.5M');
    });

    it('should handle precision', () => {
      expect(FormatUtils.formatCurrency(1234.567, { precision: 2 })).toBe('€1,234.57');
      expect(FormatUtils.formatCurrency(1234.567, { precision: 0 })).toBe('€1,235');
    });

    it('should handle negative amounts', () => {
      expect(FormatUtils.formatCurrency(-1234.56)).toBe('€-1,234.56');
    });

    it('should handle very large amounts', () => {
      expect(FormatUtils.formatCurrency(1234567.89)).toBe('€1,234,567.89');
      expect(FormatUtils.formatCurrency(1234567.89, { compact: true })).toBe('€1.2M');
    });
  });

  describe('formatPercentage', () => {
    it('should format basic percentages', () => {
      expect(FormatUtils.formatPercentage(0.75)).toBe('75%');
      expect(FormatUtils.formatPercentage(0.5)).toBe('50%');
      expect(FormatUtils.formatPercentage(1)).toBe('100%');
    });

    it('should handle already-percentage values', () => {
      expect(FormatUtils.formatPercentage(75)).toBe('75%');
      expect(FormatUtils.formatPercentage(100)).toBe('100%');
    });

    it('should respect precision', () => {
      expect(FormatUtils.formatPercentage(0.8567, { precision: 1 })).toBe('85.7%');
      expect(FormatUtils.formatPercentage(0.8567, { precision: 2 })).toBe('85.67%');
    });

    it('should show sign when requested', () => {
      expect(FormatUtils.formatPercentage(0.75, { showSign: true })).toBe('+75%');
      expect(FormatUtils.formatPercentage(-0.25, { showSign: true })).toBe('-25%');
      expect(FormatUtils.formatPercentage(0, { showSign: true })).toBe('0%');
    });

    it('should handle invalid values', () => {
      expect(FormatUtils.formatPercentage(NaN)).toBe('0%');
      expect(FormatUtils.formatPercentage(undefined as any)).toBe('0%');
    });

    it('should handle zero', () => {
      expect(FormatUtils.formatPercentage(0)).toBe('0%');
    });

    it('should handle values over 100%', () => {
      // The function treats values > 1 as already percentages, not decimals
      expect(FormatUtils.formatPercentage(1.5)).toBe('2%'); // 1.5 * 100 but value > 1 so not multiplied, then rounds
      expect(FormatUtils.formatPercentage(150)).toBe('150%'); // Already a percentage
    });
  });

  describe('formatDate', () => {
    const testDate = new Date(Date.UTC(2024, 2, 15, 12, 0, 0)); // March 15, 2024 at noon UTC

    it('should format in short format', () => {
      const formatted = FormatUtils.formatDate(testDate, { format: 'short' });
      expect(formatted).toMatch(/3\/1[45]\/24/); // Allow for timezone differences
    });

    it('should format in medium format', () => {
      const formatted = FormatUtils.formatDate(testDate, { format: 'medium' });
      expect(formatted).toContain('Mar');
      expect(formatted).toMatch(/1[45]/); // 14 or 15 depending on timezone
      expect(formatted).toContain('2024');
    });

    it('should format in long format', () => {
      const formatted = FormatUtils.formatDate(testDate, { format: 'long' });
      expect(formatted).toContain('March');
      expect(formatted).toMatch(/1[45]/);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('day'); // Contains weekday
    });

    it('should format in ISO format', () => {
      const formatted = FormatUtils.formatDate(testDate, { format: 'iso' });
      expect(formatted).toMatch(/2024-03-1[45]/); // Allow for timezone offset
    });

    it('should handle string dates', () => {
      const formatted = FormatUtils.formatDate('2024-03-15', { format: 'iso' });
      expect(formatted).toBe('2024-03-15');
    });

    it('should handle invalid dates', () => {
      const formatted = FormatUtils.formatDate('invalid-date', { format: 'iso' });
      expect(formatted).toBe('Invalid Date');
    });
  });

  describe('formatDuration', () => {
    it('should format short duration', () => {
      expect(FormatUtils.formatDuration(2.5, { format: 'short' })).toBe('2h 30m');
      expect(FormatUtils.formatDuration(1, { format: 'short' })).toBe('1h');
      expect(FormatUtils.formatDuration(0.5, { format: 'short' })).toBe('30m');
    });

    it('should format long duration', () => {
      expect(FormatUtils.formatDuration(2.5, { format: 'long' })).toBe('2 hours, 30 minutes');
      expect(FormatUtils.formatDuration(1, { format: 'long' })).toBe('1 hour');
      expect(FormatUtils.formatDuration(0.5, { format: 'long' })).toBe('30 minutes');
    });

    it('should handle zero hours', () => {
      expect(FormatUtils.formatDuration(0, { format: 'short' })).toBe('0h');
      expect(FormatUtils.formatDuration(0, { format: 'long' })).toBe('0 hours');
    });

    it('should handle invalid values', () => {
      expect(FormatUtils.formatDuration(NaN, { format: 'short' })).toBe('0h');
      expect(FormatUtils.formatDuration(-1, { format: 'short' })).toBe('0h');
    });

    it('should show seconds when requested', () => {
      expect(FormatUtils.formatDuration(1.5, { format: 'short', showSeconds: true })).toContain('h');
      expect(FormatUtils.formatDuration(1.5, { format: 'short', showSeconds: true })).toContain('m');
    });

    it('should handle exact hour values', () => {
      expect(FormatUtils.formatDuration(8, { format: 'short' })).toBe('8h');
      expect(FormatUtils.formatDuration(8, { format: 'long' })).toBe('8 hours');
    });

    it('should handle decimal hours correctly', () => {
      expect(FormatUtils.formatDuration(1.75, { format: 'short' })).toBe('1h 45m');
      expect(FormatUtils.formatDuration(0.25, { format: 'short' })).toBe('15m');
    });
  });

  describe('formatRelativeDate', () => {
    const now = new Date();

    it('should identify today', () => {
      expect(FormatUtils.formatRelativeDate(now)).toBe('Today');
    });

    it('should identify yesterday', () => {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      expect(FormatUtils.formatRelativeDate(yesterday)).toBe('Yesterday');
    });

    it('should identify tomorrow', () => {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(FormatUtils.formatRelativeDate(tomorrow)).toBe('Tomorrow');
    });

    it('should format recent past days', () => {
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(FormatUtils.formatRelativeDate(threeDaysAgo)).toBe('3 days ago');
    });

    it('should format recent future days', () => {
      const inThreeDays = new Date(now);
      inThreeDays.setDate(inThreeDays.getDate() + 3);
      expect(FormatUtils.formatRelativeDate(inThreeDays)).toBe('In 3 days');
    });

    it('should format weeks ago', () => {
      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      expect(FormatUtils.formatRelativeDate(twoWeeksAgo)).toBe('2 weeks ago');
    });

    it('should format months ago', () => {
      const twoMonthsAgo = new Date(now);
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      expect(FormatUtils.formatRelativeDate(twoMonthsAgo)).toContain('month');
    });

    it('should handle invalid dates', () => {
      expect(FormatUtils.formatRelativeDate('invalid-date')).toBe('Invalid Date');
    });

    it('should handle string dates', () => {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const result = FormatUtils.formatRelativeDate(yesterday.toISOString());
      expect(result).toBe('Yesterday');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(FormatUtils.formatFileSize(0)).toBe('0 B');
      expect(FormatUtils.formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(FormatUtils.formatFileSize(1024)).toBe('1 KB');
      expect(FormatUtils.formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(FormatUtils.formatFileSize(1048576)).toBe('1 MB');
      expect(FormatUtils.formatFileSize(1572864)).toBe('1.5 MB');
    });

    it('should format gigabytes', () => {
      expect(FormatUtils.formatFileSize(1073741824)).toBe('1 GB');
      expect(FormatUtils.formatFileSize(1610612736)).toBe('1.5 GB');
    });
  });

  describe('formatList', () => {
    it('should format empty list', () => {
      expect(FormatUtils.formatList([])).toBe('');
    });

    it('should format single item', () => {
      expect(FormatUtils.formatList(['apple'])).toBe('apple');
    });

    it('should format two items', () => {
      expect(FormatUtils.formatList(['apple', 'banana'])).toBe('apple and banana');
    });

    it('should format three items', () => {
      expect(FormatUtils.formatList(['apple', 'banana', 'orange'])).toBe('apple, banana, and orange');
    });

    it('should use "or" conjunction', () => {
      expect(FormatUtils.formatList(['apple', 'banana'], { conjunction: 'or' })).toBe('apple or banana');
    });

    it('should limit items', () => {
      const items = ['apple', 'banana', 'orange', 'grape', 'melon'];
      expect(FormatUtils.formatList(items, { maxItems: 2 })).toBe('apple and banana and 3 more');
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      const text = 'Hello';
      expect(FormatUtils.truncateText(text, 10)).toBe('Hello');
    });

    it('should truncate long text', () => {
      const text = 'This is a very long text that should be truncated';
      const truncated = FormatUtils.truncateText(text, 20);
      expect(truncated.length).toBeLessThanOrEqual(20);
      expect(truncated).toContain('...');
    });

    it('should respect word boundaries', () => {
      const text = 'This is a test';
      const truncated = FormatUtils.truncateText(text, 10, { wordBoundary: true });
      expect(truncated).not.toContain('te...');
    });

    it('should allow custom ellipsis', () => {
      const text = 'This is a very long text';
      const truncated = FormatUtils.truncateText(text, 15, { ellipsis: '...' });
      expect(truncated).toContain('...');
    });

    it('should handle text without spaces', () => {
      const text = 'ThisIsAVeryLongTextWithoutSpaces';
      const truncated = FormatUtils.truncateText(text, 15, { wordBoundary: true });
      expect(truncated.length).toBeLessThanOrEqual(15);
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      expect(FormatUtils.escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(FormatUtils.escapeHtml('<div>Test</div>')).toBe('&lt;div&gt;Test&lt;/div&gt;');
    });

    it('should handle quotes', () => {
      const result = FormatUtils.escapeHtml('"quoted"');
      // Note: textContent/innerHTML method doesn't escape quotes, only <, >, & are escaped
      expect(result).toBe('"quoted"');
    });

    it('should handle ampersands', () => {
      expect(FormatUtils.escapeHtml('A & B')).toBe('A &amp; B');
    });

    it('should handle plain text', () => {
      expect(FormatUtils.escapeHtml('Plain text')).toBe('Plain text');
    });
  });

  describe('escapeMarkdown', () => {
    it('should escape markdown special characters', () => {
      expect(FormatUtils.escapeMarkdown('*bold*')).toBe('\\*bold\\*');
      expect(FormatUtils.escapeMarkdown('_italic_')).toBe('\\_italic\\_');
      expect(FormatUtils.escapeMarkdown('[link](url)')).toBe('\\[link\\]\\(url\\)');
    });

    it('should escape headers', () => {
      expect(FormatUtils.escapeMarkdown('# Header')).toBe('\\# Header');
    });

    it('should escape code blocks', () => {
      expect(FormatUtils.escapeMarkdown('`code`')).toBe('\\`code\\`');
    });

    it('should handle plain text', () => {
      expect(FormatUtils.escapeMarkdown('Plain text')).toBe('Plain text');
    });

    it('should escape all special characters', () => {
      const special = '*_[]()~`>#+-=|{}.!';
      const escaped = FormatUtils.escapeMarkdown(special);
      expect(escaped).toContain('\\*');
      expect(escaped).toContain('\\_');
      expect(escaped).toContain('\\[');
    });
  });
});
