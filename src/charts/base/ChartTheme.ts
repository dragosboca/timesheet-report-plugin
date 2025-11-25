// Chart theme and color utilities

import TimesheetReportPlugin from '../../main';
import { ChartColorPalette, ChartThemeConfig } from './ChartConfig';

/**
 * Manages chart theming and color palettes
 */
export class ChartTheme {
  private plugin: TimesheetReportPlugin;
  private cachedTheme?: ChartThemeConfig;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
  }

  /**
   * Get current theme configuration
   */
  getThemeConfig(): ChartThemeConfig {
    if (this.cachedTheme) {
      return this.cachedTheme;
    }

    const isDark = this.isDarkTheme();
    const useStyleSettings = this.hasStyleSettings();

    this.cachedTheme = {
      isDark,
      useStyleSettings,
      colors: this.getColorPalette(isDark, useStyleSettings)
    };

    return this.cachedTheme;
  }

  /**
   * Clear cached theme (call when theme changes)
   */
  clearCache(): void {
    this.cachedTheme = undefined;
  }

  /**
   * Check if dark theme is active
   */
  private isDarkTheme(): boolean {
    return document.body.classList.contains('theme-dark');
  }

  /**
   * Check if Style Settings plugin is available
   */
  private hasStyleSettings(): boolean {
    return document.body.classList.contains('css-settings-manager');
  }

  /**
   * Get CSS variable value
   */
  private getCSSVariable(variable: string): string | null {
    return getComputedStyle(document.body).getPropertyValue(variable).trim();
  }

  /**
   * Convert hex color to RGBA
   */
  private hexToRgba(hex: string, alpha: number = 0.8): string {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Return RGBA string
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Get color palette based on theme
   */
  private getColorPalette(isDark: boolean, useStyleSettings: boolean): ChartColorPalette {
    let primaryColor: string;
    let secondaryColor: string;
    let tertiaryColor: string;
    let quaternaryColor: string;

    if (useStyleSettings) {
      // Try to get colors from Style Settings
      primaryColor = this.getCSSVariable('--timesheet-color-primary') || '';
      secondaryColor = this.getCSSVariable('--timesheet-color-secondary') || '';
      tertiaryColor = this.getCSSVariable('--timesheet-color-tertiary') || '';
      quaternaryColor = this.getCSSVariable('--timesheet-color-quaternary') || '';
    } else {
      primaryColor = '';
      secondaryColor = '';
      tertiaryColor = '';
      quaternaryColor = '';
    }

    // Fallback to default colors if Style Settings not available or colors not set
    if (!primaryColor) {
      primaryColor = isDark ? '#6496dc' : '#4f81bd';
    }
    if (!secondaryColor) {
      secondaryColor = isDark ? '#dc6464' : '#c0504d';
    }
    if (!tertiaryColor) {
      tertiaryColor = isDark ? '#96c864' : '#9bbb59';
    }
    if (!quaternaryColor) {
      quaternaryColor = isDark ? '#aa82be' : '#8064a2';
    }

    // Get grid, text, and background colors
    const gridColor = isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)';

    const textColor = isDark
      ? 'rgba(255, 255, 255, 0.9)'
      : 'rgba(0, 0, 0, 0.9)';

    const backgroundColor = isDark
      ? 'rgba(0, 0, 0, 0.2)'
      : 'rgba(255, 255, 255, 0.2)';

    return {
      primary: this.hexToRgba(primaryColor, 0.8),
      secondary: this.hexToRgba(secondaryColor, 0.8),
      tertiary: this.hexToRgba(tertiaryColor, 0.8),
      quaternary: this.hexToRgba(quaternaryColor, 0.8),
      grid: gridColor,
      text: textColor,
      background: backgroundColor
    };
  }

  /**
   * Get color by name
   */
  getColor(colorName: keyof ChartColorPalette): string {
    const theme = this.getThemeConfig();
    return theme.colors[colorName];
  }

  /**
   * Get all colors
   */
  getAllColors(): ChartColorPalette {
    const theme = this.getThemeConfig();
    return theme.colors;
  }

  /**
   * Apply opacity to a color
   */
  applyOpacity(color: string, opacity: number): string {
    // If it's already an rgba color, replace the opacity
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/g, `${opacity})`);
    }

    // If it's a hex color, convert to rgba
    if (color.startsWith('#')) {
      return this.hexToRgba(color, opacity);
    }

    // Return as-is if unrecognized format
    return color;
  }

  /**
   * Get contrasting text color for a background
   */
  getContrastingColor(backgroundColor: string): string {
    // Simple contrast calculation
    // In a real implementation, you'd calculate luminance
    const theme = this.getThemeConfig();
    return theme.isDark ? theme.colors.text : theme.colors.text;
  }
}
