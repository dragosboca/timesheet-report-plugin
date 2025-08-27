# Timesheet Report Plugin for Obsidian

This plugin generates comprehensive timesheet reports based on your timesheet data stored in Obsidian. It provides visualizations of hours worked, invoiced amounts, and utilization metrics across different time periods.

## Features

- **Summary Statistics**: View total hours, invoiced amounts, and utilization rates for the current year and all-time
- **Trend Analysis**: Track your hours and utilization over time with interactive charts
- **Monthly Breakdown**: See detailed monthly performance with change indicators
- **Monthly Report Generation**: Generate formatted monthly timesheet reports based on templates
- **Customizable Settings**: Configure your timesheet folder, currency symbol, target hours, and more
- **Theme-Aware**: Automatically adapts to Obsidian's light and dark themes

## Usage

### Viewing Reports

1. Install the plugin
2. Access the report by clicking the calendar-clock icon in the ribbon or using the command palette
3. The plugin will analyze all timesheet files in your designated folder
4. View your timesheet statistics in a dedicated view

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
- **Hours Per Workday**: Number of hours in your standard workday (used for utilization calculation)
- **Auto-refresh Interval**: How often to refresh the report (in minutes)

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

## Dynamic Target Hours Calculation

The plugin now dynamically calculates target hours based on working days in each month rather than using a fixed value:

- Automatically counts workdays (Monday-Friday) in each month
- Multiplies by your configured hours per workday
- Shows a breakdown of the calculation in the report
- Provides more accurate utilization metrics that account for varying month lengths

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

## Settings

- **Timesheet Folder**: Path to the folder containing your timesheet files
- **Currency Symbol**: Symbol used for monetary values (€, $, etc.)
- **Hours Per Workday**: Number of hours in your standard workday (used for utilization calculation)
- **Auto-refresh Interval**: How often to refresh the report (in minutes)
- **Chart Colors**: Customize the colors used in charts

## Dynamic Target Hours Calculation

The plugin now dynamically calculates target hours based on working days in each month rather than using a fixed value:

- Automatically counts workdays (Monday-Friday) in each month
- Multiplies by your configured hours per workday
- Shows a breakdown of the calculation in the report
- Provides more accurate utilization metrics that account for varying month lengths

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
