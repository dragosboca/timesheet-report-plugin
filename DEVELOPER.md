# Timesheet Report Plugin Developer Documentation

This document provides technical details for developers working on the Timesheet Report plugin.

## Project Structure

```
timesheet-report-plugin/
├── src/                          # Source code
│   ├── main.ts                   # Main plugin entry point
│   ├── view.ts                   # Timesheet report view implementation
│   ├── settings.ts               # Plugin settings definitions
│   ├── data-processor.ts         # Data processing logic
│   └── chart-renderer.ts         # Chart visualization implementation
├── styles.css                    # Plugin styles
├── manifest.json                 # Plugin manifest
├── package.json                  # NPM package definition
├── tsconfig.json                 # TypeScript configuration
├── esbuild.config.mjs            # Build configuration
└── version-bump.mjs              # Version management script
```

## Development Workflow

1. Make changes to the source code
2. Build the plugin with `npm run build` or `npm run dev` for live reloading
3. Test the plugin in Obsidian using the install script: `./install.sh`
4. Restart Obsidian or reload the plugin to see changes

## Key Components

### Main Plugin Class

The `TimesheetReportPlugin` class in `main.ts` is the entry point for the plugin. It handles:
- Plugin registration and lifecycle
- Settings management
- View activation

### View Component

The `TimesheetReportView` class in `view.ts` implements the UI for the timesheet report. It:
- Creates and renders the report interface
- Manages the report layout and components
- Coordinates with other components to display data

### Data Processor

The `DataProcessor` class in `data-processor.ts` handles:
- Retrieving timesheet files from the vault
- Extracting time entries from the files
- Processing and calculating timesheet metrics
- Preparing data for visualization

### Chart Renderer

The `ChartRenderer` class in `chart-renderer.ts` handles:
- Loading the Chart.js library
- Creating and rendering charts
- Configuring chart appearance and behavior
- Theme-aware rendering

### Settings

The `settings.ts` file defines:
- Settings interface and default values
- Settings tab UI implementation

## Data Flow

1. User opens the timesheet report view
2. View requests data from the DataProcessor
3. DataProcessor loads timesheet files and extracts data
4. Data is processed and calculated metrics are returned
5. View passes data to ChartRenderer to create visualizations
6. View renders summary cards and data tables

## Timesheet File Format

The plugin supports timesheet files in the following format:

```md
---
tags:
  - Daily
hours: 8
worked: true
per-hour: 60
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

## Future Enhancements

Potential areas for future development:

1. **Client/Project Filtering**: Allow filtering reports by client or project
2. **Custom Date Ranges**: Enable user-defined report periods
3. **Export Functionality**: Add options to export reports as PDF or CSV
4. **Additional Visualizations**: Implement pie charts for project distribution
5. **Timesheet Generation**: Create new timesheet files from the report view
6. **API Integration**: Connect with time-tracking services like Toggl

## Troubleshooting

Common issues and solutions:

- **No data displayed**: Check if the timesheet folder path is correct in settings
- **Build errors**: Ensure all dependencies are installed with `npm install`
- **Chart not rendering**: Check if Chart.js is loaded correctly
- **Plugin not loading**: Verify manifest.json has the correct ID and version

## Resources

- [Obsidian Plugin API Documentation](https://github.com/obsidianmd/obsidian-api)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
