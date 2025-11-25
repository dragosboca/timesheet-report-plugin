# Timesheet Report Plugin for Obsidian

A comprehensive timesheet reporting plugin that generates interactive visualizations, tracks project budgets, and creates detailed reports from your timesheet data stored in Obsidian. Features a powerful SQL-like query language with grammar-based parser for flexible data filtering and reporting.

## Features

- **📊 Interactive Charts**: Visualize your work patterns with trend analysis and monthly breakdowns
- **💰 Budget Tracking**: Monitor fixed-hour projects, retainers, and hourly work with progress indicators
- **📈 Performance Metrics**: Track utilization rates, revenue, and productivity trends
- **📝 Report Generation**: Create formatted monthly timesheet reports from customizable templates
- **🔗 Embedded Reports**: Insert live timesheet data anywhere in your vault using query syntax
- **🎨 Advanced Theme Integration**: Seamlessly adapts to your current theme with Style Settings plugin support
- **⚙️ Flexible Configuration**: Support for hourly, fixed-budget, and retainer project types
- **🚀 Grammar-Based Parser**: Professional query language with tokenization, AST parsing, and type safety
- **🔍 Advanced Query Language**: SQL-like syntax with proper error messages and extensible architecture
- **📁 Official API Integration**: Uses Obsidian's official TypeScript API for all file operations and metadata access

## Quick Start

### Installation

1. Open Obsidian Settings → Community Plugins
2. Disable Safe Mode if enabled
3. Browse and search for "Timesheet Report"
4. Install and enable the plugin

### Basic Setup

1. **Configure Settings**: Go to Settings → Timesheet Report
   - Set your timesheet folder path (default: `Timesheets`)
   - Choose your currency symbol
   - Set hours per workday for utilization calculations

2. **Create Timesheet Files**: Add markdown files to your timesheet folder with this format:

```md
---
tags: [timesheet]
hours: 8.5
worked: true
per-hour: 75
client: Client Name
work-order: Project Alpha
---

# Daily Work Log - 2024-03-15

## Tasks Completed
- Feature development for user authentication
- Client meeting to discuss requirements
- Code review and bug fixes

## Notes
Productive day with solid progress on the authentication module.
```

3. **View Reports**: Click the calendar-clock icon in the ribbon or use "Open Timesheet Report" from the command palette

## Timesheet File Format

The plugin uses **Obsidian's official metadata cache** to read frontmatter, ensuring compatibility and performance. All frontmatter properties are automatically detected and processed.

### Required Elements

Your timesheet files need:
- **Date**: Either in filename (YYYY-MM-DD.md) or YAML frontmatter (`date: 2024-03-15`)
- **Hours**: Total hours worked that day (`hours: 8.5`)
- **Rate**: Hourly billing rate (optional, uses project default if not specified)

### YAML Frontmatter Properties

**All properties go in the frontmatter block** (between `---` lines at the top of your file):

```yaml
---
# Core tracking fields
hours: 8.5           # Required: Total hours worked (number or string)
worked: true         # Optional: Whether work was performed (default: true)
per-hour: 75         # Optional: Hourly rate (number or string)

# Project identification
client: Client Name      # Optional: Client name (string)
work-order: Project Alpha # Optional: Project/work order name (string)
project: MVP Development  # Optional: Alternative to work-order

# Date (if not in filename)
date: 2024-03-15     # Optional: Date in YYYY-MM-DD format

# Additional metadata
tags: [timesheet, consulting]  # Optional: For organizing files
---
```

### Alternative: Table Format

You can also include detailed breakdowns in the file content:

```md
| Task | Hours | Rate | Notes |
|------|-------|------|-------|
| Development | 4.0 | 75 | Authentication features |
| Meetings | 2.0 | 75 | Requirements gathering |
| Testing | 2.5 | 75 | QA and bug fixes |
```

**Note**: Tables are parsed from content, but frontmatter data takes precedence for totals.

## Project Types & Configuration

### 1. Hourly/Time & Materials Projects

**Best for**: Traditional consulting, ongoing maintenance, open-ended work

**Configuration**:
- Project Type: "Hourly/Time & Materials" 
- Set default hourly rate
- Configure hours per workday for utilization tracking

**What you get**:
- Utilization percentage based on working capacity
- "Potential Additional" revenue calculations
- Month-over-month efficiency analysis

### 2. Fixed-Hour Budget Projects

**Best for**: Fixed-scope projects, MVPs, specific deliverables

**Configuration**:
- Project Type: "Fixed Hour Budget"
- Set total budget hours (e.g., 120 hours)
- Optional project deadline

**What you get**:
- Budget consumption tracking (e.g., "67/120 hours used")
- Progress percentage and remaining hours
- Budget burn-down charts and pace indicators

### 3. Retainer/Block Hours Projects

**Best for**: Monthly retainers, pre-purchased hour blocks, ongoing relationships

**Configuration**:
- Project Type: "Retainer/Block Hours"
- Set hours per block/month (e.g., 40 hours)
- Track consumption against purchased hours

**What you get**:
- Block hour usage and remaining balance
- Consumption efficiency tracking
- Monthly/period reset capabilities

## Report Templates vs. Frontmatter

### What Goes in Frontmatter

**Frontmatter** (YAML block) contains **data** that the plugin processes:

```yaml
---
hours: 8.5           # Processed into charts and calculations
per-hour: 75         # Used for revenue calculations
client: Acme Corp    # Used for project identification
work-order: Project X # Used for task descriptions
worked: true         # Controls whether day counts as worked
date: 2024-03-15     # Used if date not in filename
tags: [consulting]   # For file organization
---
```

### What Goes in Report Templates

**Report templates** contain **presentation formatting** with placeholders:

```markdown
# {{PROJECT_NAME}} - {{MONTH_YEAR}} Report

## Summary
Total hours worked: **{{MONTH_HOURS}}**
Total value: **{{TOTAL_VALUE}}**

## Details
{{TABLE_PLACEHOLDER}}

*Generated on {{GENERATION_DATE}}*
```

**Available template placeholders**:
- `{{PROJECT_NAME}}` - From plugin settings
- `{{MONTH_YEAR}}` - Report period (e.g., "March 2024")
- `{{MONTH_HOURS}}` - Calculated from frontmatter hours
- `{{TOTAL_VALUE}}` - Calculated from hours × rates
- `{{REMAINING_HOURS}}` - For budget projects
- `{{TABLE_PLACEHOLDER}}` - Generated timesheet table
- `{{GENERATION_DATE}}` - Current date
- `{{CURRENCY}}` - From plugin settings

## Embedding Reports in Notes

Embed live timesheet reports anywhere in your vault using our powerful SQL-like query language:

### Basic Examples

```timesheet
// Current year summary
WHERE year = 2024
VIEW summary
SIZE compact
```

```timesheet
// Project analysis with charts
WHERE project = "Client Alpha" AND year = 2024
VIEW full
CHART trend
SIZE detailed
```

```timesheet
// Budget tracking
WHERE date BETWEEN "2024-10-01" AND "2024-12-31"
CHART budget
VIEW chart
```

### Query Syntax Reference

#### WHERE Clauses (Filters)
- `WHERE year = 2024` - Filter by year
- `WHERE month = 3` - Filter by month (1-12)
- `WHERE project = "Client ABC"` - Filter by project name
- `WHERE client = "Acme Corp"` - Filter by client
- `WHERE date BETWEEN "2024-01-01" AND "2024-03-31"` - Date range
- `WHERE hours > 0` - Only worked days
- `// Comments supported` - Add explanations

#### Operators
- `=`, `!=` - Equality and inequality
- `>`, `<`, `>=`, `<=` - Comparison operators
- `BETWEEN ... AND ...` - Range queries
- `AND` - Logical conjunction

#### VIEW Types
- `VIEW summary` - Key metrics cards
- `VIEW chart` - Visual charts only  
- `VIEW table` - Data table only
- `VIEW full` - Everything (summary + chart + table)

#### CHART Types
- `CHART trend` - Hours and utilization over time (combined chart)
- `CHART monthly` - Monthly revenue/budget analysis
- `CHART budget` - Budget consumption (fixed-hour projects)

#### PERIOD Options
- `PERIOD current-year` - Current year data
- `PERIOD all-time` - All historical data
- `PERIOD last-6-months` - Recent 6 months
- `PERIOD last-12-months` - Recent 12 months

#### SIZE Options
- `SIZE compact` - Minimal space
- `SIZE normal` - Standard display
- `SIZE detailed` - Full information

## Report Generation

### Monthly Reports

1. **Generate Reports**: Click "Generate Monthly Report" or use Command Palette
2. **Select Options**: Choose month/year and template
3. **Output Location**: Reports save to your configured output folder
4. **Template Processing**: Placeholders are replaced with calculated values

### Custom Templates

Create templates in your configured template folder:

```markdown
# Professional Report - {{MONTH_YEAR}}

**Client:** {{PROJECT_NAME}}
**Period:** {{REPORT_PERIOD}}
**Generated:** {{GENERATION_DATE}}

## Executive Summary
This report summarizes {{MONTH_HOURS}} hours of work completed during {{MONTH_YEAR}}.

**Financial Summary:**
- Total Hours: {{MONTH_HOURS}}
- Total Value: {{TOTAL_VALUE}}
- Average Rate: {{CURRENCY}}X/hour

{{REMAINING_HOURS}}

## Detailed Breakdown
{{TABLE_PLACEHOLDER}}

## Next Steps
<!-- Add your follow-up items here -->
```

## Settings Reference

### Basic Configuration
- **Timesheet Folder**: Where your timesheet files are stored
- **Currency Symbol**: Display currency (€, $, £, etc.)
- **Hours Per Workday**: Standard working hours (for utilization calculations)
- **Auto-refresh**: How often to update reports (minutes)
- **Debug Mode**: Enable detailed logging for troubleshooting

### Project Settings
- **Project Name**: Display name for reports
- **Project Type**: Hourly, Fixed-Hour Budget, or Retainer
- **Budget Hours**: Total hours (for budget/retainer projects)
- **Default Rate**: Fallback hourly rate when not specified in frontmatter
- **Project Deadline**: Optional target completion date

### Report Generation
- **Template Folder**: Location of your report templates
- **Output Folder**: Where generated reports are saved
- **Default Template**: Template to use when none specified

### Theme Integration
- **Style Settings**: Automatic theme color matching (if plugin installed)
- **Manual Colors**: Custom chart colors when Style Settings disabled

## Advanced Features

### Official Obsidian API Integration

This plugin is built using **only official Obsidian APIs**:

- **Metadata Cache**: Fast frontmatter access via `app.metadataCache.getFileCache()`
- **Vault API**: All file operations use `app.vault.getFileByPath()`, `app.vault.cachedRead()`, etc.
- **Folder Management**: Recursive folder creation with `app.vault.createFolder()`
- **UI Components**: Native Obsidian components (`ButtonComponent`, `DropdownComponent`, `Notice`)

**Benefits**:
- **Performance**: Leverages Obsidian's optimized metadata caching
- **Reliability**: No manual YAML parsing or direct file system access
- **Compatibility**: Future-proof against Obsidian API changes
- **Type Safety**: Full TypeScript integration with Obsidian's types

### Dynamic Target Hours

For hourly projects, the plugin automatically calculates monthly targets:
1. Counts working days (Monday-Friday) in each month
2. Multiplies by your "Hours Per Workday" setting
3. Adjusts for holidays and varying month lengths

Example: May 2024 with 23 working days × 8 hours = 184 target hours

### Multi-Vault Workflows

For multiple projects, consider separate vaults:

```
📁 Client-ABC-Retainer/
├── Timesheets/
├── Meeting Notes/
└── Reports/

📁 Client-XYZ-MVP/
├── Timesheets/  
├── Development Notes/
└── Budget Tracking/
```

### Performance Optimization

- **Metadata Cache**: All frontmatter access uses Obsidian's cache for speed
- **Filter Embedded Reports**: Use WHERE clauses to limit data processing
- **Compact Displays**: Use `SIZE compact` for frequently-viewed pages
- **Archive Strategy**: Move old timesheet files to subfolders when needed

## Troubleshooting

### Data Issues

**No data showing in reports**:
- ✅ Check timesheet folder path in settings
- ✅ Verify frontmatter format: `hours: 8.5` (not `hours: "8.5"`)
- ✅ Ensure `worked: true` or omit (defaults to true)
- ✅ Check date format: YYYY-MM-DD in filename or frontmatter

**Incorrect calculations**:
- ✅ Verify `hours` field is a number in frontmatter
- ✅ Check `per-hour` rates are numbers, not strings
- ✅ Confirm file dates are correctly parsed (check debug mode)

### Report Generation Issues

**Template errors**:
- ✅ Verify template folder path exists
- ✅ Check template file permissions
- ✅ Ensure template contains `{{TABLE_PLACEHOLDER}}`
- ✅ Validate placeholder syntax (double curly braces)

**Output folder issues**:
- ✅ Confirm output folder path in settings
- ✅ Check folder permissions for writing
- ✅ Ensure no file name conflicts

### Chart Display Issues

**Charts not showing**:
- ✅ Verify timesheet data exists for selected period
- ✅ Check browser console for JavaScript errors
- ✅ Try refreshing the view (Ctrl+R or Cmd+R)
- ✅ Ensure hours > 0 in your frontmatter

**Embedding syntax errors**:
- ✅ Check query syntax: `WHERE`, `VIEW`, `CHART` (case-sensitive)
- ✅ Verify string values in quotes: `project = "Project Name"`
- ✅ Ensure proper date format: `"2024-03-15"`

### Debug Mode

Enable debug mode in settings for detailed logging:
- File processing information
- Frontmatter parsing details
- Date extraction attempts
- Error messages with suggestions

Console output shows:
```
[Timesheet Plugin] Processing file: Timesheets/2024-03-15.md
[Timesheet Plugin] Frontmatter found: {hours: 8.5, client: "Acme"}
[Timesheet Plugin] Date extracted: 2024-03-15
```

## API & Development

### File Structure
```
src/
├── main.ts                    # Plugin entry point
├── view.ts                    # Main report view
├── settings.ts                # Configuration UI with official components
├── embed-processor.ts         # Code block processor for timesheet queries
├── report-generator.ts        # Report creation using vault API
├── template-manager.ts        # Template handling via file API
├── core/                      # Core services
│   ├── unified-data-extractor.ts    # Data extraction via metadata cache
│   ├── unified-table-generator.ts   # Table generation (HTML/Markdown)
│   └── query-processor.ts           # Query processing pipeline
├── charts/                    # Modular chart system
│   ├── base/
│   │   ├── BaseChart.ts       # Abstract base class for all charts
│   │   ├── ChartConfig.ts     # Type definitions and interfaces
│   │   └── ChartTheme.ts      # Theme and color management
│   ├── types/
│   │   ├── TrendChart.ts      # Trend chart implementation
│   │   ├── MonthlyChart.ts    # Monthly chart implementation
│   │   └── BudgetChart.ts     # Budget chart implementation
│   ├── ChartFactory.ts        # Factory for creating chart instances
│   └── index.ts               # Module exports
├── query/                     # Grammar-based query parser
│   ├── parser.ts              # PEG parser (auto-generated)
│   ├── interpreter.ts         # Query execution & AST interpretation
│   └── grammar.pegjs          # Query language grammar definition
└── utils/                     # Shared utilities
    ├── date-utils.ts          # Date parsing and formatting
    └── format-utils.ts        # Number and text formatting
```

### Building from Source
```bash
git clone [repository-url]
cd timesheet-report-plugin
npm install
npm run build
npm test
```

### API Usage Examples

**Reading frontmatter** (official way):
```typescript
const cache = app.metadataCache.getFileCache(file);
const frontmatter = cache?.frontmatter;
const hours = frontmatter?.hours || 0;
```

**File operations** (official way):
```typescript
const file = app.vault.getFileByPath(path);
const content = await app.vault.cachedRead(file);
await app.vault.create(newPath, content);
```

## Contributing

Contributions welcome! The refactored codebase uses:

- **Official Obsidian APIs only** - No direct file system access
- **TypeScript strict mode** - Full type safety
- **Metadata Cache** - Fast frontmatter access
- **Grammar-based parser** - Extensible query language
- **Jest testing** - Comprehensive test coverage

## License

MIT License - see `LICENSE` file for details.

## Support

- **Issues**: GitHub repository issues
- **Documentation**: Complete examples in this README
- **Community**: Obsidian Discord #plugin-dev channel
- **API Questions**: All file operations use official Obsidian TypeScript APIs

---

**Made with ❤️ for the Obsidian community**

Transform your timesheet data into actionable insights with visual reports, budget tracking, and seamless integration into your knowledge management workflow - all powered by Obsidian's official APIs for maximum reliability and performance.
