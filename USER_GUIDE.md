# Timesheet Report Plugin User Guide

This guide will help you get started with the Timesheet Report plugin for Obsidian.

## Installation

1. In Obsidian, go to Settings > Community plugins
2. Disable Safe mode if it's enabled
3. Click "Browse" and search for "Timesheet Report"
4. Click Install, then Enable the plugin

## Quick Start

1. Add timesheet files to the designated folder (default: `Timesheets/`)
2. Click the calendar-clock icon in the ribbon or use the command palette to open the "Timesheet Report"
3. The report will automatically analyze your timesheet data and display visualizations

## Timesheet File Format

For best results, format your timesheet files with:

```md
---
tags:
  - Daily
hours: 8  # Total hours (optional, calculated from table if not provided)
worked: true
per-hour: 60  # Hourly rate
client:
  - ClientName
work-order:
  - ProjectName
---

# Work Breakdown

| Task | Hours | Rate |
|------|-------|------|
| Task 1 | 2.5 | 60 |
| Task 2 | 4.0 | 60 |
| Task 3 | 1.5 | 60 |
```

The plugin looks for:
- A date in the file name (format: YYYY-MM-DD) or in YAML frontmatter
- A table with columns for hours and rate
- Optional YAML metadata for project/client

## Key Features

### Summary Statistics

The top of the report shows:
- Current year totals (hours, invoiced amount, utilization)
- All-time totals across all timesheet files

### Trend Analysis

The trend chart displays:
- Hours worked over time (primary Y-axis)
- Utilization percentage (secondary Y-axis)

This helps you visualize your work patterns and productivity trends.

### Monthly Breakdown

The monthly chart shows:
- Hours worked per month (bars)
- Amount invoiced per month (bars on secondary axis)

### Detailed Data Table

The table below the charts provides detailed metrics for each month:
- Total hours
- Month-over-month change percentage
- Amount invoiced
- Average hourly rate
- Utilization percentage
- Utilization change

## Configuration

Customize the plugin in Settings > Timesheet Report:

- **Timesheet Folder**: Path to the folder containing timesheet files
- **Currency Symbol**: Change the currency symbol (€, $, etc.)
- **Hours Per Workday**: Set your standard working hours per day (used for utilization calculations)
- **Auto-refresh Interval**: How often to refresh the report (in minutes)
- **Chart Colors**: Customize the color scheme for charts

## Target Hours Calculation

The plugin dynamically calculates monthly target hours based on:

1. The actual number of working days (Monday-Friday) in each month
2. Your configured hours per workday

This feature:
- Provides more accurate utilization metrics by accounting for different month lengths and working days
- Displays the calculation breakdown in the report
- Adjusts automatically when a new month starts
- Can be customized by changing the "Hours Per Workday" setting

For example, if May 2023 has 23 working days and your setting is 8 hours per day, the target hours would be calculated as 23 × 8 = 184 hours.

## Tips and Tricks

- **Consistent Formatting**: Keep your timesheet files formatted consistently for best results
- **Regular Updates**: Update your timesheets regularly for accurate reporting
- **Folder Structure**: Keep all timesheets in a dedicated folder for optimal performance
- **Date Format**: Use YYYY-MM-DD in filenames for automatic date detection

## Troubleshooting

- **Report not showing data**: Check if your timesheet folder path is correct in settings
- **Incorrect calculations**: Verify that your timesheet files have the proper format
- **Missing months**: Ensure you have timesheet files for each month you want to track
- **Performance issues**: If you have many timesheet files, try increasing the refresh interval

## Future Updates

The plugin will be regularly updated with new features based on user feedback. Planned enhancements include:
- Client/project filtering
- Export to PDF/CSV
- Custom date range selection
- Additional visualization options

## Support

If you encounter issues or have suggestions:
- Check the documentation in the README.md file
- Open an issue on the GitHub repository
- Reach out to the developer through Obsidian community channels
