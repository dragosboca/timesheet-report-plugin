# Timesheet Report Plugin for Obsidian

A comprehensive timesheet reporting plugin that generates interactive visualizations, tracks project budgets, and creates detailed reports from your timesheet data stored in Obsidian.

## Features

- **📊 Interactive Charts**: Visualize your work patterns with trend analysis and monthly breakdowns
- **💰 Budget Tracking**: Monitor fixed-hour projects, retainers, and hourly work with progress indicators
- **📈 Performance Metrics**: Track utilization rates, revenue, and productivity trends
- **📝 Report Generation**: Create formatted monthly timesheet reports from customizable templates
- **🔗 Embedded Reports**: Insert live timesheet data anywhere in your vault using query syntax
- **🎨 Theme Integration**: Automatically adapts to Obsidian's light and dark themes
- **⚙️ Flexible Configuration**: Support for hourly, fixed-budget, and retainer project types

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
tags: [Daily]
hours: 8
worked: true
per-hour: 75
client: [Client Name]
work-order: [Project Name]
---

# Daily Work Log

## Tasks Completed
- Feature development
- Client meeting
- Code review
```

3. **View Reports**: Click the calendar-clock icon in the ribbon or use "Open Timesheet Report" from the command palette

## Timesheet File Format

### Required Elements

Your timesheet files need:
- **Date**: Either in filename (YYYY-MM-DD.md) or YAML frontmatter
- **Hours**: Total hours worked that day
- **Rate**: Hourly billing rate (optional, uses project default if not specified)

### YAML Frontmatter Options

```yaml
---
hours: 8          # Total hours worked
worked: true      # Whether work was performed (default: true)
per-hour: 75      # Hourly rate
client:           # Client name(s)
  - ClientName
work-order:       # Project/work order
  - ProjectName
---
```

### Alternative: Table Format

You can also use tables for detailed breakdowns:

```md
| Task | Hours | Rate | Notes |
|------|-------|------|-------|
| Development | 4.0 | 75 | New features |
| Meetings | 2.0 | 75 | Client calls |
| Testing | 2.0 | 75 | QA review |
```

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

## Embedding Reports in Notes

Embed live timesheet reports anywhere in your vault using a SQL-like query syntax:

### Basic Examples

**Quick summary in daily notes**:
```timesheet
PERIOD current-year
VIEW summary
SIZE compact
```

**Project dashboard with full details**:
```timesheet
WHERE year = 2024
VIEW full
SIZE detailed
```

**Budget tracking chart**:
```timesheet
CHART budget
VIEW chart
SIZE normal
```

### Query Syntax Reference

#### WHERE Clauses (Filters)
- `WHERE year = 2024` - Filter by year
- `WHERE month = 3` - Filter by month (1-12)
- `WHERE project = "Client ABC"` - Filter by project
- `WHERE date BETWEEN "2024-01-01" AND "2024-03-31"` - Date range

#### VIEW Types
- `VIEW summary` - Key metrics cards
- `VIEW chart` - Visual charts only  
- `VIEW table` - Data table only
- `VIEW full` - Everything (summary + chart + table)

#### CHART Types
- `CHART trend` - Hours and utilization over time
- `CHART monthly` - Monthly revenue/budget analysis
- `CHART budget` - Budget consumption (fixed-hour projects)

#### PERIOD Options
- `PERIOD current-year` - Current year data
- `PERIOD all-time` - All historical data
- `PERIOD last-6-months` - Recent 6 months
- `PERIOD last-12-months` - Recent 12 months

#### SIZE Options
- `SIZE compact` - Minimal space for widgets
- `SIZE normal` - Standard display
- `SIZE detailed` - Full information

### Advanced Embedding

**Monthly review template**:
```markdown
# March 2024 Review

## Performance Summary
```timesheet
WHERE year = 2024 AND month = 3
VIEW summary
SIZE detailed
```

## Budget Progress  
```timesheet
CHART budget
VIEW chart
```

## Detailed Breakdown
```timesheet
WHERE year = 2024 AND month = 3
VIEW table
```
```

## Report Generation

### Creating Monthly Reports

1. Click "Generate Monthly Report" in the timesheet view, or
2. Use Command Palette → "Generate Monthly Timesheet Report"
3. Select month/year and optional template
4. Report saves to `Reports/Timesheet/` folder

### Custom Templates

Create templates in your Templates folder with these placeholders:

- `{{MONTH_YEAR}}` - Report period (e.g., "March 2024")
- `{{MONTH_HOURS}}` - Total hours worked
- `{{TABLE_PLACEHOLDER}}` - Detailed timesheet table
- `{{GENERATION_DATE}}` - Report creation date

**Example template**:
```markdown
# Monthly Report - {{MONTH_YEAR}}

**Total Hours**: {{MONTH_HOURS}}

## Timesheet Details
{{TABLE_PLACEHOLDER}}

---
*Generated on {{GENERATION_DATE}}*
```

## Settings Reference

### Basic Settings
- **Timesheet Folder**: Where your timesheet files are stored
- **Currency Symbol**: Display currency (€, $, £, etc.)
- **Hours Per Workday**: Standard working hours (for utilization calculations)
- **Auto-refresh**: How often to update the report (minutes)

### Project Configuration
- **Project Name**: Display name for current project
- **Project Type**: Hourly, Fixed-Hour Budget, or Retainer
- **Budget Hours**: Total hours (for budget/retainer projects)
- **Default Rate**: Fallback hourly rate
- **Project Deadline**: Optional target date

### Report Settings
- **Template Folder**: Location of report templates
- **Output Folder**: Where generated reports are saved
- **Default Template**: Template for monthly reports

### Chart Customization
Customize colors for:
- Primary data (hours)
- Secondary data (utilization)
- Budget/revenue data
- Background elements

## Advanced Features

### Dynamic Target Hours

For hourly projects, the plugin automatically calculates monthly targets by:
1. Counting working days (Monday-Friday) in each month
2. Multiplying by your "Hours Per Workday" setting
3. Adjusting for holidays and varying month lengths

Example: May 2024 with 23 working days × 8 hours = 184 target hours

### Multi-Vault Workflows

For multiple projects, consider separate vaults:

```
📁 Client-ABC-Retainer/
├── Timesheets/
├── Meeting Notes/
└── Reports/

📁 StartupXYZ-MVP/
├── Timesheets/  
├── Development Notes/
└── Budget Tracking/
```

Benefits:
- Independent project settings
- Client-specific privacy
- Separate billing and reporting
- Tailored templates per project

### Performance Optimization

- **Filter embedded reports** when possible to improve speed
- **Use compact size** for frequently-viewed pages
- **Limit concurrent embeds** on the same page
- **Archive old timesheet files** to dedicated folders

## Troubleshooting

### Common Issues

**No data showing in reports**:
- Check timesheet folder path in settings
- Verify timesheet files have proper YAML frontmatter
- Ensure dates are in YYYY-MM-DD format

**Incorrect calculations**:
- Verify `hours` field in timesheet files
- Check `per-hour` rates are set correctly
- Confirm `worked: true` for active work days

**Charts not displaying**:
- Ensure you have timesheet data for the selected period
- Check browser console for JavaScript errors
- Try refreshing the view

**Budget tracking not visible**:
- Set Project Type to "Fixed Hour Budget" or "Retainer"
- Configure Budget Hours with a value > 0
- Verify timesheet files include project hours

**Embedding syntax errors**:
- Check query syntax for typos
- Ensure proper capitalization (WHERE, VIEW, etc.)
- Verify filter conditions match your data

### Debug Mode

Enable debug mode in settings for detailed logging:
- File processing information
- Data calculation steps  
- Error details and suggestions

## Development & Customization

### File Structure
```
src/
├── main.ts              # Plugin entry point
├── view.ts              # Main report view
├── settings.ts          # Configuration UI
├── data-processor.ts    # Data processing logic
├── chart-renderer.ts    # Chart visualization
├── report-generator.ts  # Report creation
└── embed-processor.ts   # Embedding system
```

### Building from Source
```bash
git clone [repository-url]
cd timesheet-report-plugin
npm install
npm run build
```

### Contributing

Contributions welcome! See `CONTRIBUTING.md` for guidelines.

## License

MIT License - see `LICENSE` file for details.

## Support

- **Issues**: GitHub repository issues
- **Documentation**: See `USER_GUIDE.md` for detailed usage
- **Community**: Obsidian Discord #plugin-dev channel

---

**Made with ❤️ for the Obsidian community**

Transform your timesheet data into actionable insights with visual reports, budget tracking, and seamless integration into your knowledge management workflow.
