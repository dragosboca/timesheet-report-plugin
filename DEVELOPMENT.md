# Development Setup Guide

This guide explains how to set up a development environment for the Timesheet Report Plugin.

## Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Obsidian** installed
- **Git** for version control

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd timesheet-report-plugin
npm install
```

### 2. Build the Plugin

```bash
# One-time build
npm run build

# Development build with watching
npm run dev
```

### 3. Install Locally

**Option A: Automated Installation**
```bash
# macOS/Linux
./install-local.sh

# Windows
install-local.bat
```

**Option B: Manual Installation**
1. Build the plugin: `npm run build`
2. Copy these files to your vault:
   ```
   main.js
   manifest.json  
   styles.css
   ```
3. Destination: `YourVault/.obsidian/plugins/timesheet-report/`
4. Enable in Settings → Community Plugins

## Development Workflow

### Hot Reload Setup (Recommended)

1. **Install Hot Reload Plugin in Obsidian**:
   - Go to Settings → Community Plugins
   - Search for "Hot Reload"
   - Install and enable it

2. **Start Development Mode**:
   ```bash
   npm run dev
   ```

3. **Enable Hot Reload**:
   - In Obsidian, open Command Palette (Ctrl/Cmd + P)
   - Search for "Hot Reload: Toggle Automatic Hot Reload"
   - Enable it

4. **Develop**:
   - Edit TypeScript files in `src/`
   - Changes automatically compile and reload in Obsidian
   - No need to manually copy files

### File Structure

```
timesheet-report-plugin/
├── src/                    # Source TypeScript files
│   ├── main.ts            # Plugin entry point
│   ├── view.ts            # Main report view
│   ├── settings.ts        # Settings configuration
│   ├── data-processor.ts  # Data processing logic
│   ├── chart-renderer.ts  # Chart visualization
│   ├── report-generator.ts # Report creation
│   └── embed-processor.ts # Embedding system
├── styles.css             # Plugin CSS
├── manifest.json          # Plugin metadata
├── main.js               # Compiled output (git ignored)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── esbuild.config.mjs    # Build configuration
└── version-bump.mjs      # Version management
```

### Development Scripts

```bash
# Build for production
npm run build

# Build for development with file watching
npm run dev

# Type checking only
npx tsc --noEmit

# Lint code
npx eslint src/

# Update version and manifest
npm version patch  # or minor, major
```

## Testing

### Manual Testing Checklist

1. **Basic Functionality**:
   - [ ] Plugin loads without errors
   - [ ] Ribbon icon appears and works
   - [ ] Settings page loads correctly
   - [ ] Reports generate with sample data

2. **Theme Integration**:
   - [ ] Charts adapt to light/dark theme
   - [ ] Style Settings integration works
   - [ ] Colors update on theme change
   - [ ] Manual color override works

3. **Embedding System**:
   - [ ] Basic embed syntax works
   - [ ] Complex queries parse correctly
   - [ ] Charts render in embeds
   - [ ] Error handling for bad syntax

4. **Report Generation**:
   - [ ] Monthly reports generate correctly
   - [ ] Templates work with placeholders
   - [ ] Files save to correct location
   - [ ] Multiple months work

### Sample Test Data

Create test timesheet files in your vault:

```markdown
# Timesheets/2024-01-15.md
---
hours: 8
worked: true
per-hour: 75
client: [Test Client]
work-order: [Development]
---

# Daily Work Log
- Feature development
- Code review
- Client meeting
```

### Debug Mode Testing

1. Enable debug mode in plugin settings
2. Check browser console for detailed logs
3. Monitor performance with large datasets
4. Test error scenarios (missing files, invalid data)

## Troubleshooting

### Common Issues

**Build Fails**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Plugin Won't Load**:
- Check browser console for errors
- Verify all files are in the correct location
- Restart Obsidian completely
- Check manifest.json is valid

**Hot Reload Not Working**:
- Ensure Hot Reload plugin is installed and enabled
- Check that `.hotreload` file exists in plugin directory
- Restart development server: `npm run dev`

**TypeScript Errors**:
- Run `npx tsc --noEmit` for detailed error info
- Check imports and types
- Ensure Obsidian API types are up to date

### Debugging Tips

1. **Console Logging**:
   ```typescript
   console.log('Debug info:', data);
   
   // Use debug logger for plugin-specific logs
   this.plugin.debugLogger.log('Processing data', data);
   ```

2. **Browser DevTools**:
   - Open DevTools (F12)
   - Check Console tab for errors
   - Use Sources tab to set breakpoints
   - Monitor Network tab for external resources

3. **Plugin State**:
   ```typescript
   // Check plugin state in console
   app.plugins.plugins['timesheet-report']
   
   // Check settings
   app.plugins.plugins['timesheet-report'].settings
   ```

## Code Style Guidelines

### TypeScript Conventions

```typescript
// Use interfaces for data structures
interface TimeEntry {
  date: Date;
  hours: number;
  rate: number;
}

// Use async/await over Promises
async function processData(): Promise<void> {
  try {
    const result = await fetchData();
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Use descriptive variable names
const monthlyTimeEntries = await getEntriesForMonth(year, month);

// Add JSDoc for public methods
/**
 * Processes timesheet data and returns summary metrics
 * @param entries - Array of time entries to process
 * @returns Promise resolving to processed summary data
 */
async processTimesheetData(entries: TimeEntry[]): Promise<SummaryData> {
  // Implementation
}
```

### CSS Best Practices

```css
/* Use CSS custom properties for theming */
:root {
  --timesheet-color-primary: #4f81bd;
}

/* Follow BEM-style naming */
.timesheet-report-container {
  /* Container styles */
}

.timesheet-summary-card {
  /* Component styles */
}

.timesheet-summary-card--compact {
  /* Modifier styles */
}

/* Use Obsidian CSS variables when possible */
background-color: var(--background-primary);
color: var(--text-normal);
border-color: var(--background-modifier-border);
```

### Commit Conventions

```bash
# Use conventional commit format
git commit -m "feat: add budget tracking charts"
git commit -m "fix: resolve theme switching issue"
git commit -m "docs: update installation instructions"
git commit -m "refactor: improve data processing performance"
```

## Release Preparation

### Pre-Release Checklist

1. **Code Quality**:
   - [ ] All TypeScript compiles without errors
   - [ ] ESLint passes without warnings
   - [ ] No console.log statements in production code
   - [ ] Debug mode disabled by default

2. **Testing**:
   - [ ] Manual testing complete
   - [ ] Theme integration verified
   - [ ] Performance acceptable with large datasets
   - [ ] Error handling works correctly

3. **Documentation**:
   - [ ] README.md updated
   - [ ] CHANGELOG.md updated
   - [ ] Code comments accurate
   - [ ] Examples tested

4. **Build**:
   - [ ] Production build successful
   - [ ] File sizes reasonable
   - [ ] No development dependencies in output

### Release Process

1. **Update Version**:
   ```bash
   npm version patch  # or minor, major
   ```

2. **Build Production**:
   ```bash
   npm run build
   ```

3. **Create Release**:
   ```bash
   git tag -a v1.0.1 -m "Release v1.0.1"
   git push origin main
   git push origin v1.0.1
   ```

4. **GitHub Actions will automatically**:
   - Build the plugin
   - Create GitHub release
   - Upload main.js, manifest.json, styles.css

## Architecture Notes

### Plugin Lifecycle

1. **onload()**: Initialize components, register views, add commands
2. **User interaction**: Open view, change settings, embed reports
3. **Data processing**: Read timesheet files, calculate metrics
4. **Rendering**: Create charts, generate reports, update UI
5. **onunload()**: Clean up resources

### Component Responsibilities

- **main.ts**: Plugin coordination, lifecycle management
- **view.ts**: Main UI, layout, user interactions
- **data-processor.ts**: File reading, data calculation, caching
- **chart-renderer.ts**: Chart.js integration, theme awareness
- **embed-processor.ts**: Query parsing, embed rendering
- **settings.ts**: Configuration UI, Style Settings integration

### Performance Considerations

- **Lazy Loading**: Chart.js loaded only when needed
- **Caching**: Processed data cached until settings change
- **Debouncing**: UI updates debounced during rapid changes
- **Memory Management**: Large datasets handled efficiently

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Follow the development workflow above
4. Test thoroughly
5. Submit a pull request with clear description

## Resources

- [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Style Settings Plugin](https://github.com/mgmeyers/obsidian-style-settings)
- [Obsidian Developer Discord](https://discord.gg/obsidianmd)

Happy developing! 🚀
