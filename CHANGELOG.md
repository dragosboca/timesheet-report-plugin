# Changelog

All notable changes to the Timesheet Report Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- **Project Configuration System**: New per-vault project settings for different billing models
  - **Hourly/Time & Materials**: Traditional hourly billing with utilization tracking
  - **Fixed-Hour Budget**: Projects with allocated hour budgets and consumption tracking
  - **Retainer/Block Hours**: Pre-purchased hour blocks with remaining balance tracking
- **Budget Tracking Features**:
  - Cumulative hour consumption tracking across project timeline
  - Budget remaining calculations and progress visualization
  - Budget burn-down charts for fixed-hour projects
  - Budget progress indicators in summary cards and data tables
- **Enhanced Visualizations**:
  - Adaptive charts that change based on project type
  - Budget consumption charts for fixed-hour projects
  - Project progress indicators and remaining hour displays
- **Project Settings UI**:
  - Project name configuration
  - Project type selection with dynamic form fields
  - Budget hours setting for fixed-hour/retainer projects
  - Optional project deadline tracking
  - Default hourly rate setting

### Removed
- **BREAKING CHANGE**: Removed legacy `targetHoursPerMonth` setting
  - This setting was replaced by dynamic calculation based on working days in each month
  - The plugin now automatically calculates target hours using `hoursPerWorkday` × working days in month
  - Migration logic automatically removes the legacy setting from existing configurations

### Fixed
- Fixed `potentialAdditional` calculation in monthly chart to use correct average hourly rates
  - Now uses the actual average hourly rate for each specific month instead of maximum rate across all months
  - Uses proper working hours calculation based on plugin settings instead of hardcoded estimates
  - Consistent with the rest of the application's calculation methods

### Changed
- **Enhanced Data Model**: Updated interfaces to support budget tracking
  - Extended `MonthData` and `SummaryData` interfaces with budget fields
  - Added cumulative hour calculation methods
  - Improved data processor to handle different project types
- **Adaptive UI**: Interface now adapts based on project configuration
  - Summary cards show budget progress for fixed-hour projects
  - Data table columns change based on project type
  - Chart titles and tooltips adapt to context
- **Improved Settings**: More intuitive settings organization
  - Added dedicated "Project Configuration" section
  - Dynamic form fields based on project type selection
  - Better organization of existing settings
- **Better TypeScript**: Improved type definitions and error handling
  - Enhanced chart renderer with proper budget visualization support
  - Updated constructor initialization order in TimesheetReportView
  - Cleaned up settings interface to remove legacy references

## [1.0.0-rc001] - 2023-12-XX

### Added
- Initial release candidate with comprehensive timesheet reporting
- Visual trend analysis with Chart.js integration
- Monthly breakdown charts with invoice analysis
- Template-based report generation
- Dynamic target hours calculation based on working days
- Multi-project support with different rates
- Theme-aware UI that adapts to Obsidian's light/dark modes
- Configurable settings for customization
- Debug logging capabilities
- Automatic data refresh functionality

### Features
- **Summary Statistics**: View total hours, invoiced amounts, and utilization rates
- **Trend Analysis**: Interactive charts tracking hours and utilization over time
- **Monthly Breakdown**: Detailed monthly performance with change indicators
- **Report Generation**: Generate formatted monthly timesheet reports from templates
- **Working Days Calculation**: Automatic calculation of working days (Monday-Friday) per month
- **Utilization Metrics**: Accurate utilization tracking based on actual working days
- **Customizable Charts**: Color customization and theme adaptation
- **Template Support**: Custom report templates with placeholder replacement
- **Data Validation**: Comprehensive error handling and validation

### Technical Details
- Built with TypeScript for type safety
- Modular architecture with separation of concerns
- Chart.js integration for visualizations
- Obsidian plugin API compliance
- Efficient data processing and caching
