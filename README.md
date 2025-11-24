# Timesheet Report Plugin for Obsidian

This plugin generates comprehensive timesheet reports based on your timesheet data stored in Obsidian. It provides visualizations of hours worked, invoiced amounts, and utilization metrics across different time periods.

## Features

- **Summary Statistics**: View total hours, invoiced amounts, and utilization/budget progress for the current year and all-time
- **Trend Analysis**: Track your hours and utilization over time with interactive charts
- **Monthly Breakdown**: See detailed monthly performance with change indicators
- **Project Budget Tracking**: Monitor fixed-hour and retainer project consumption
- **Monthly Report Generation**: Generate formatted monthly timesheet reports based on templates
- **Multiple Project Types**: Support for hourly, fixed-hour budget, and retainer billing models
- **Customizable Settings**: Configure your timesheet folder, currency symbol, project type, and more
- **Theme-Aware**: Automatically adapts to Obsidian's light and dark themes

## Usage

### Viewing Reports

1. Install the plugin
2. Access the report by clicking the calendar-clock icon in the ribbon or using the command palette
3. The plugin will analyze all timesheet files in your designated folder
4. View your timesheet statistics in a dedicated view

### Embedding Reports

You can embed timesheet reports directly in your notes using a Dataview-style query syntax:

```timesheet
WHERE year = 2024
SHOW summary, chart
VIEW summary
```

#### Embedding Examples:

**Quick summary in daily notes:**
```timesheet
PERIOD current-year
VIEW summary
SIZE compact
```

**Detailed project dashboard:**
```timesheet
WHERE year = 2024
VIEW full
SIZE detailed
```

**Budget tracking for fixed-hour projects:**
```timesheet
CHART budget
VIEW chart
SIZE normal
```

### Generating Monthly Reports

1. Click the "Generate Monthly Report" button in the timesheet report view, or
2. Use the command palette and search for "Generate Monthly Timesheet Report"
3. Select the month/year and optionally choose a template
4. The report will be saved to your configured Reports/Timesheet folder

## Timesheet File Format

The plugin expects timesheet files to be Markdown files with YAML frontmatter containing:

- **hours**: Number of hours worked
- **worked**: Boolean indicating if work was performed (defaults to true)
- **per-hour**: Hourly rate (optional)
- **client**: Client name (optional)
- **work-order**: Work order or project description (optional)

Example timesheet file (`2023-04-15.md`):

```md
---
tags:
  - Daily
hours: 8
worked: true
per-hour: 60
client:
  - Omnisource  
work-order:
  - Newberger-Berman
---

# Meetings
```dataview
LIST
FROM "Meeting Notes"
WHERE meeting-date = date(2023-04-15)
```

# Work Orders
## Newberger Berman

[Details of work performed]
```

## Monthly Report Format

Generated monthly reports contain:

- **Date**: Each day of the month
- **Hours**: Hours worked (empty for non-work days)
- **Task Description**: 
  - "N/A" for weekends (Saturday/Sunday)
  - "PTO" for weekdays with 0 hours worked
  - Work order/client name for days with recorded hours

## Settings

### Basic Settings
- **Timesheet Folder**: Path to the folder containing your timesheet files
- **Currency Symbol**: Symbol used for monetary values (€, $, etc.)
- **Hours Per Workday**: Number of hours in your standard workday (used for utilization and target hours calculation)
- **Auto-refresh Interval**: How often to refresh the report (in minutes)

### Project Configuration
- **Project Name**: Name of the current project (displayed in reports)
- **Project Type**: Choose between three billing models:
  - **Hourly/Time & Materials**: Traditional hourly billing with utilization tracking
  - **Fixed Hour Budget**: Project with a set number of allocated hours
  - **Retainer/Block Hours**: Pre-purchased hour blocks
- **Budget Hours**: Total hours allocated for fixed-hour or retainer projects
- **Project Deadline**: Optional target completion date for budget tracking
- **Default Hourly Rate**: Default rate for timesheet entries (can be overridden per entry)

### Report Generation Settings
- **Report Template Folder**: Folder containing your report templates
- **Report Output Folder**: Where generated reports are saved
- **Default Report Template**: Default template for report generation

### Chart Colors
- Customize the colors used in charts and visualizations

## Report Templates

You can create custom templates in the Templates folder. Templates support these placeholders:

- `{{MONTH_YEAR}}`: Replaced with the month and year (e.g., "January 2024")
- `{{REPORT_PERIOD}}`: Same as MONTH_YEAR - the reporting period (e.g., "January 2024")
- `{{MONTH_HOURS}}`: Total hours worked in the month (e.g., "160")
- `{{TABLE_PLACEHOLDER}}`: Replaced with the timesheet table
- `{{GENERATION_DATE}}`: Replaced with the date the report was generated

Example template:
```md
# Monthly Timesheet Report - {{MONTH_YEAR}}

## Summary
This report covers **{{REPORT_PERIOD}}**.
Total hours worked: **{{MONTH_HOURS}}**

## Timesheet Details
{{TABLE_PLACEHOLDER}}

---
*Generated on {{GENERATION_DATE}}*
```

## Project Types & Features

### Hourly/Time & Materials Projects
- Track actual hours worked vs. potential capacity
- Utilization metrics based on working days calculation
- "Potential Additional" revenue visualization
- Traditional freelance billing model

### Fixed-Hour Budget Projects
- Set a total hour budget for the entire project
- Track cumulative hours consumed vs. budget
- Visual budget burn-down charts
- Progress tracking with remaining hours display
- Ideal for fixed-scope contracts

### Retainer/Block Hour Projects
- Manage pre-purchased hour blocks
- Track consumption against purchased hours
- Budget remaining visualization
- Perfect for ongoing client relationships

## Dynamic Target Hours Calculation

For hourly projects, the plugin dynamically calculates target hours based on working days:

- Automatically counts workdays (Monday-Friday) in each month
- Multiplies by your configured hours per workday
- Shows a breakdown of the calculation in the report
- Provides accurate utilization metrics that account for varying month lengths and holidays

For budget projects, tracking focuses on cumulative consumption against allocated hours rather than monthly targets.

## Embedding Query Syntax

The plugin supports embedding timesheet reports using a SQL-like query syntax within `timesheet` code blocks.

### Query Structure

```timesheet
WHERE <conditions>
SHOW <components>
VIEW <display_type>
CHART <chart_type>
PERIOD <time_period>
SIZE <size_option>
```

### Query Options

#### WHERE Conditions
- `WHERE year = 2024` - Filter by specific year
- `WHERE month = 3` - Filter by specific month (1-12)
- `WHERE project = "Client ABC"` - Filter by project name
- `WHERE date BETWEEN "2024-01-01" AND "2024-03-31"` - Filter by date range

#### VIEW Types
- `VIEW summary` - Show summary cards only
- `VIEW chart` - Show chart only
- `VIEW table` - Show data table only
- `VIEW full` - Show all components

#### CHART Types
- `CHART trend` - Hours and utilization trend over time
- `CHART monthly` - Monthly invoice/budget analysis
- `CHART budget` - Budget consumption tracking

#### PERIOD Options
- `PERIOD current-year` - Current year data only
- `PERIOD all-time` - All historical data
- `PERIOD last-6-months` - Last 6 months
- `PERIOD last-12-months` - Last 12 months

#### SIZE Options
- `SIZE compact` - Minimal space usage
- `SIZE normal` - Standard display
- `SIZE detailed` - Full information

### Example Queries

#### Project Dashboard
```timesheet
WHERE year = 2024
VIEW full
SIZE detailed
```

#### Quick Status Check
```timesheet
PERIOD current-year
VIEW summary
SIZE compact
```

#### Budget Monitoring
```timesheet
WHERE year = 2024
VIEW chart
CHART budget
```

#### Monthly Performance
```timesheet
PERIOD last-6-months
VIEW table
```

## Commands

- **Open Timesheet Report**: Opens the main timesheet report view
- **Generate Monthly Timesheet Report**: Opens the monthly report generator modal

## Development

This plugin is built with TypeScript and uses Chart.js for visualizations.

### Building

```bash
# Install dependencies
npm install

# Build
npm run build

# Development with hot-reload
npm run dev
```

## License

MIT



## Development

This plugin is built with TypeScript and uses Chart.js for visualizations.

### Building

```bash
# Install dependencies
npm install

# Build
npm run build

# Development with hot-reload
npm run dev
```

## License

MIT
