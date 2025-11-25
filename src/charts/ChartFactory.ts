// Chart Factory - creates chart instances based on type

import TimesheetReportPlugin from '../main';
import { TrendChart } from './types/TrendChart';
import { MonthlyChart } from './types/MonthlyChart';
import { BudgetChart } from './types/BudgetChart';
import {
  TrendChartData,
  MonthlyChartDataPoint,
  BudgetChartDataPoint,
  IChartRenderer
} from './base/ChartConfig';

/**
 * Chart type enumeration
 */
export enum ChartType {
  TREND = 'trend',
  MONTHLY = 'monthly',
  BUDGET = 'budget'
}

/**
 * Factory for creating chart instances
 */
export class ChartFactory {
  private plugin: TimesheetReportPlugin;

  constructor(plugin: TimesheetReportPlugin) {
    this.plugin = plugin;
  }

  /**
   * Create a trend chart
   */
  createTrendChart(data: TrendChartData): TrendChart {
    return new TrendChart(this.plugin, data);
  }

  /**
   * Create a monthly chart
   */
  createMonthlyChart(data: MonthlyChartDataPoint[]): MonthlyChart {
    return new MonthlyChart(this.plugin, data);
  }

  /**
   * Create a budget chart
   */
  createBudgetChart(data: BudgetChartDataPoint[]): BudgetChart {
    return new BudgetChart(this.plugin, data);
  }

  /**
   * Create a chart by type name
   */
  createChart(
    type: ChartType | string,
    data: TrendChartData | MonthlyChartDataPoint[] | BudgetChartDataPoint[]
  ): IChartRenderer {
    switch (type.toLowerCase()) {
      case ChartType.TREND:
        return this.createTrendChart(data as TrendChartData);

      case ChartType.MONTHLY:
        return this.createMonthlyChart(data as MonthlyChartDataPoint[]);

      case ChartType.BUDGET:
        return this.createBudgetChart(data as BudgetChartDataPoint[]);

      default:
        throw new Error(`Unknown chart type: ${type}`);
    }
  }

  /**
   * Get available chart types
   */
  getAvailableChartTypes(): ChartType[] {
    return [ChartType.TREND, ChartType.MONTHLY, ChartType.BUDGET];
  }

  /**
   * Check if chart type is valid
   */
  isValidChartType(type: string): boolean {
    return Object.values(ChartType).includes(type as ChartType);
  }
}
