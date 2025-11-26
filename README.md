# Timesheet Report Plugin for Obsidian

A comprehensive timesheet reporting plugin that generates interactive visualizations, tracks project budgets, and creates detailed reports from your timesheet data stored in Obsidian. Features a powerful SQL-like query language with grammar-based parser for flexible data filtering and reporting.

> **⚠️ Disclaimer**  
> This plugin is vibe-coded and built for personal use. While it's fully functional, the codebase may not follow all best practices. For the moment, I'm not accepting pull requests, but I **welcome all feedback, suggestions, and bug reports**! Feel free to open issues or reach out with your thoughts.

## Table of Contents

1. [Features](#features)
2. [Quick Start](#quick-start)
3. [Frontmatter Reference](#frontmatter-reference)
4. [Query Language](#query-language)
5. [Report Templates](#report-templates)
6. [Project Types](#project-types)
7. [QueryTable System](#querytable-system)
8. [Embedding Reports](#embedding-reports)
9. [Performance & Best Practices](#performance--best-practices)
10. [Troubleshooting](#troubleshooting)
11. [Development](#development)

---

## Features

### Core Capabilities
- **📊 Interactive Charts** - Visualize work patterns with trend analysis and monthly breakdowns
- **💰 Budget Tracking** - Monitor fixed-hour projects, retainers, and hourly work with progress indicators
- **📈 Performance Metrics** - Track utilization rates, revenue, and productivity trends
- **📝 Report Generation** - Create formatted monthly timesheet reports from customizable templates
- **🔗 Embedded Reports** - Insert live timesheet data anywhere in your vault using query syntax

### Technical Features
- **🚀 Grammar-Based Parser** - Professional query language with tokenization, AST parsing, and type safety
- **🎨 Advanced Theme Integration** - Seamlessly adapts to your current theme with Style Settings plugin support
- **⚙️ Flexible Configuration** - Support for hourly, fixed-budget, and retainer project types
- **📁 Official API Integration** - Uses Obsidian's official TypeScript API for all file operations and metadata access
- **🔍 Smart QueryTable** - Automatic table generation with intelligent field detection and formatting

---

## Quick Start

### Installation

1. Open Obsidian Settings
2. Navigate to Community Plugins
3. Search for "Timesheet Report"
4. Click Install, then Enable

### Initial Configuration

1. **Configure Plugin Settings:**
   - **Timesheet Folder:** `Timesheets` (or your preferred location)
   - **Currency Symbol:** `$` (or `€`, `£`, etc.)
   - **Hours Per Workday:** `8` (for utilization calculations)

2. **Set Up Your Project:**
   - **Project Name:** Your current project/client name
   - **Project Type:** Choose from Hourly, Fixed-Hour Budget, or Retainer
   - **Default Rate:** Your standard hourly rate (optional)

### Create Your First Timesheet

Create a file named `2024-03-15.md` in your Timesheets folder:

```markdown
---
hours: 8.5
per-hour: 75
client: Acme Corporation
work-order: Website Redesign
worked: true
---

# Daily Work Log - March 15, 2024

## Tasks Completed
- Implemented new user authentication system
- Fixed responsive design issues on mobile
- Client meeting to review progress

**Total: 8.5 hours @ $75/hour = $637.50**
```

### View Your Report

1. Click the calendar-clock icon in the ribbon, or
2. Use Command Palette (Ctrl/Cmd + P) → "Open Timesheet Report"
3. Your data will automatically appear in charts and summaries

---

## Frontmatter Reference

### What Is Frontmatter?

Frontmatter is the YAML data block at the top of your markdown files (between `---` lines). This is where you put data that the plugin processes for calculations, charts, and reports.

### Required Fields

#### `hours`
- **Type:** Number or String
- **Description:** Total hours worked for the day
- **Examples:**
  ```yaml
  hours: 8
  hours: 6.5
  hours: "7.25"
  ```
- **Notes:** Must be greater than 0 for the entry to be processed

#### `worked`
- **Type:** Boolean
- **Default:** `true` (if omitted)
- **Description:** Whether work was performed on this day
- **Examples:**
  ```yaml
  worked: true   # Working day
  worked: false  # Holiday, sick day, vacation
  ```
- **Notes:** Set to `false` for non-working days to exclude from calculations

### Rate Fields (Priority Order)

The plugin checks these fields in order and uses the first one found:

#### 1. `per-hour` (Primary - Recommended)
```yaml
per-hour: 75
per-hour: "85.50"
```
**This is the preferred field name** for historical compatibility.

#### 2. `rate` (Alternative)
```yaml
rate: 90
```

#### 3. `hourlyRate` (Alternative)
```yaml
hourlyRate: 100
```

#### Default Rate Fallback
If no rate is specified, the plugin uses: **Settings → Default Hourly Rate**

⚠️ **Without a rate, invoice calculations will show $0**

### Project Identification Fields (Priority Order)

#### 1. `work-order` (Primary - Recommended)
```yaml
work-order: "Website Redesign"
work-order: ["Project Alpha", "Phase 2"]  # Array: first element used
```

#### 2. `client` (Alternative)
```yaml
client: "Acme Corporation"
client: ["Primary Client", "Secondary Client"]
```

#### 3. `project` (Fallback)
```yaml
project: "General Consulting"
```

### Optional Fields

#### `notes`
```yaml
notes: "Completed API integration and bug fixes"
```

#### `description`
```yaml
description: "Development and testing tasks"
```

#### `duration`
```yaml
duration: 8  # Alternative to 'hours'
```

#### `date`
```yaml
date: "2024-03-15"  # ISO format
date: "2024-03-15T09:00:00"
```
Usually not needed if filename contains date.

### Complete Examples

**Standard Hourly Work:**
```yaml
---
hours: 8
worked: true
per-hour: 85
work-order: "E-commerce Platform"
client: "Tech Startup Inc"
notes: "Implemented payment gateway integration"
---
```

**Fixed-Budget Project:**
```yaml
---
hours: 6.5
worked: true
per-hour: 90
work-order: ["Mobile App", "Phase 1"]
description: "UI development and user testing"
---
```

**Non-Working Day:**
```yaml
---
worked: false
notes: "Public holiday - Independence Day"
---
```

### Table Format Support

The plugin also supports timesheet data in markdown tables:

```markdown
---
worked: true
client: "Multi-Task Client"
---

| Task | Hours | Rate | Notes |
|------|-------|------|-------|
| Development | 4 | 85 | Feature implementation |
| Testing | 2 | 75 | Unit and integration tests |
| Documentation | 2 | 70 | API documentation update |
```

**Recognized Table Headers:**
- Hours: `hour`, `hours`, `time`, `duration`
- Rate: `rate`, `per-hour`
- Notes: `note`, `notes`, `description`, `task`
- Project: `project`, `client`, `work-order`

---

## Query Language

### Basic Query Structure

```sql
WHERE year = 2024 AND month = 3
SHOW date, project, hours, invoiced
VIEW table
SIZE detailed
```

### WHERE Clause (Filters)

**Time Filters:**
```sql
WHERE year = 2024
WHERE month = 3
WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
```

**Project Filters:**
```sql
WHERE project = "Website Redesign"
WHERE client = "Acme Corp"
WHERE work-order = "WO-12345"
```

**Combined Filters:**
```sql
WHERE year = 2024 AND month >= 6
WHERE client = "Acme Corp" AND hours > 0
```

### SHOW Clause (Column Selection)

**Basic Selection:**
```sql
SHOW date, project, hours, invoiced
```

**With Aliases:**
```sql
SHOW 
  date AS "Work Date",
  project AS "Work Order",
  hours AS "Hours Worked"
```

**With Formatting:**
```sql
SHOW 
  date AS "Date",
  hours AS "Hours",
  rate FORMAT CURRENCY AS "Rate",
  invoiced FORMAT MONEY AS "Amount"
```

**Available Formats:**
- `FORMAT CURRENCY` - Currency with symbol (e.g., "$75.00")
- `FORMAT MONEY` - Currency formatting (e.g., "$1,250.00")
- `FORMAT PERCENT` - Percentage (e.g., "85%")
- `FORMAT DECIMAL` - Decimal numbers (e.g., "8.50")
- `FORMAT HOURS` - Hours formatting (e.g., "8.50")

### Available Query Fields

**Basic Fields:**
- `date` - Entry date
- `project` - Project/Work Order name
- `task` - Task description
- `hours` - Hours worked
- `rate` - Hourly rate
- `invoiced` - Amount invoiced
- `revenue` - Calculated revenue

**Budget Fields:**
- `budgetHours` - Total allocated hours
- `budgetUsed` - Hours consumed
- `budgetRemaining` - Hours remaining
- `budgetProgress` - Percentage complete

**Time Fields:**
- `label` - Period label (e.g., "January 2024")
- `year` - Year number
- `month` - Month number
- `week` - Week number

**Categorization:**
- `client` - Client name
- `category` - Work category
- `tag` - Entry tags

**Metrics:**
- `utilization` - Time utilization percentage
- `efficiency` - Work efficiency metric

### VIEW Clause (Display Type)

```sql
VIEW summary    # High-level overview with key metrics
VIEW table      # Detailed data table
VIEW chart      # Visual charts and graphs
VIEW full       # All views combined
```

### CHART Clause (Chart Type)

```sql
CHART trend     # Hours and utilization over time
CHART monthly   # Monthly revenue and budget analysis
CHART budget    # Budget consumption tracking
```

### SIZE Clause (Detail Level)

```sql
SIZE compact    # Minimal info, fewer columns
SIZE normal     # Standard detail (default)
SIZE detailed   # Maximum information
```

### PERIOD Clause (Time Range)

```sql
PERIOD current-year      # Current year only (default)
PERIOD all-time          # All historical data
PERIOD last-6-months     # Last 6 months
PERIOD last-12-months    # Last 12 months
```

### Complete Query Examples

**Monthly Performance Report:**
```sql
WHERE year = 2024
SHOW 
  month AS "Month",
  hours AS "Total Hours",
  invoiced FORMAT MONEY AS "Revenue",
  utilization FORMAT PERCENT AS "Utilization"
VIEW table
SIZE detailed
```

**Project Status Dashboard:**
```sql
WHERE project = "Website Redesign"
SHOW date, hours, budgetProgress, budgetRemaining
VIEW full
CHART budget
PERIOD last-6-months
```

**Weekly Summary:**
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  week AS "Week #",
  hours AS "Total Hours",
  invoiced FORMAT CURRENCY AS "Revenue"
VIEW summary
SIZE compact
```

**Client Invoice Format:**
```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  date AS "Service Date",
  project AS "Description",
  hours AS "Quantity (hrs)",
  rate FORMAT CURRENCY AS "Rate",
  invoiced FORMAT MONEY AS "Amount"
VIEW table
SIZE normal
```

---

## Report Templates

### Overview

The plugin supports two reporting approaches:

1. **Query-Based Reports (Recommended)** - Use the query language for dynamic, flexible reports
2. **Template-Based Reports (Legacy)** - Use placeholder-based templates with fixed formatting

### Template Basics

**Template Location:** Settings → Report Template Folder (default: `Templates/`)

**Creating a Template:**
1. Create a new markdown file in your templates folder
2. Name it descriptively (e.g., `Monthly-Report.md`)
3. Add content with placeholders
4. Select it in the report generator modal

### Available Placeholders

**Basic Information:**
- `{{REPORT_PERIOD}}` - Report period (e.g., "January 2024")
- `{{MONTH_YEAR}}` - Month and year
- `{{GENERATION_DATE}}` - Date report was generated
- `{{CURRENT_DATE}}` - Current date (ISO format)
- `{{CURRENT_YEAR}}` - Current year
- `{{CURRENT_MONTH}}` - Current month number

**Project Information:**
- `{{PROJECT_NAME}}` - Project name from settings
- `{{PROJECT_TYPE}}` - Project type (Hourly, Fixed, Retainer)
- `{{CURRENCY}}` - Currency symbol from settings

**Metrics:**
- `{{MONTH_HOURS}}` - Total hours in report period
- `{{TOTAL_VALUE}}` - Total revenue/value
- `{{REMAINING_HOURS}}` - Remaining budget hours (fixed-hour projects)
- `{{BUDGET_HOURS}}` - Total budget hours allocated

**Content:**
- `{{TABLE_PLACEHOLDER}}` - Where the data table is inserted

### Example Templates

**Simple Professional Report:**
```markdown
# {{PROJECT_NAME}} - {{MONTH_YEAR}} Report

**Client:** {{PROJECT_NAME}}  
**Period:** {{REPORT_PERIOD}}  
**Generated:** {{GENERATION_DATE}}

## Executive Summary

During {{MONTH_YEAR}}, a total of **{{MONTH_HOURS}} hours** were logged.

**Financial Summary:**
- Total Hours: {{MONTH_HOURS}}
- Total Value: {{TOTAL_VALUE}}

## Detailed Breakdown

{{TABLE_PLACEHOLDER}}

---
*Generated by Obsidian Timesheet Report Plugin*
```

**Budget Project Report:**
```markdown
# Project Status Report - {{MONTH_YEAR}}

## Project: {{PROJECT_NAME}}

**Type:** {{PROJECT_TYPE}}  
**Period:** {{MONTH_YEAR}}

## Budget Status
- Hours This Month: {{MONTH_HOURS}}
- Remaining Budget: {{REMAINING_HOURS}} hours
- Total Value: {{TOTAL_VALUE}}

## Work Breakdown
{{TABLE_PLACEHOLDER}}

## Next Steps
<!-- Add follow-up items -->

---
Report generated on {{GENERATION_DATE}}
```

### Using Query-Based Reports

Instead of templates, use queries directly in the report generator:

```sql
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW 
  date AS "Date",
  project AS "Work Order",
  task AS "Description",
  hours AS "Hours",
  rate FORMAT CURRENCY AS "Rate",
  invoiced FORMAT MONEY AS "Amount"
VIEW table
SIZE detailed
```

**Advantages:**
- Dynamic column selection
- Flexible formatting
- Custom calculations
- No template management

---

## Project Types

### 1. Hourly/Time & Materials

**Best for:** Traditional consulting, ongoing maintenance, open-ended work

**Configuration:**
```
Project Type: Hourly/Time & Materials
Default Rate: 75
Hours Per Workday: 8
```

**Features:**
- Utilization tracking (hours vs. target)
- Revenue calculations
- Efficiency trends
- "Potential Additional" revenue analysis

**Example Timesheet:**
```yaml
---
hours: 8.5
per-hour: 75
client: Consulting Client
work-order: Database Optimization
---
```

### 2. Fixed-Hour Budget

**Best for:** Fixed-scope projects, MVPs, specific deliverables

**Configuration:**
```
Project Type: Fixed Hour Budget
Budget Hours: 120
Project Deadline: 2024-06-30
```

**Features:**
- Budget consumption tracking ("67/120 hours used")
- Progress percentage
- Burn-down charts
- Deadline pace indicators
- Remaining hours alerts

**Example Timesheet:**
```yaml
---
hours: 6.0
client: MVP Client
work-order: User Authentication
per-hour: 85
---
```

### 3. Retainer/Block Hours

**Best for:** Monthly retainers, pre-purchased hour blocks, ongoing relationships

**Configuration:**
```
Project Type: Retainer/Block Hours
Budget Hours: 40  # Monthly retainer
```

**Features:**
- Block hour usage tracking
- Monthly consumption trends
- Efficiency analysis
- Renewal timing insights

**Example Timesheet:**
```yaml
---
hours: 4.5
client: Retainer Client
work-order: Monthly Support
per-hour: 100
---
```

---

## QueryTable System

### Overview

QueryTable is a smart, generic table type that automatically adapts to any data structure. It's the **recommended choice** for displaying query results.

### Why QueryTable?

**Automatic Features:**
- ✅ Generates columns from your data
- ✅ Detects field types (dates, currency, percentages, hours)
- ✅ Applies appropriate formatting
- ✅ Aligns columns intelligently
- ✅ Calculates totals for numeric fields
- ✅ Handles compact mode
- ✅ Works with ANY data structure

### Auto-Detection Rules

#### Field Type Detection

**Dates:**
- Triggers: `date`, `day`, or contains `date`
- Format: "YYYY-MM-DD"
- Example: `{ date: new Date() }` → "2024-01-15"

**Currency:**
- Triggers: `invoiced`, `revenue`, `amount`, `rate`, contains `price` or `cost`
- Format: Symbol + number with 2 decimals
- Example: `{ invoiced: 680 }` → "€680.00"

**Hours:**
- Triggers: `hours` or contains `hours`
- Format: Number with 2 decimals
- Example: `{ hours: 8.5 }` → "8.50"

**Percentages:**
- Triggers: `utilization`, `progress`, `percent`, `percentage`
- Format: Whole number + "%"
- Example: `{ utilization: 0.75 }` → "75%"

**Numbers:**
- Triggers: `count`, `total`, `budget`, or any numeric field
- Format: Number with 2 decimals
- Alignment: Right

**Text:**
- Default: All other fields
- Format: As-is
- Alignment: Left

### Label Generation

QueryTable converts field names to human-readable labels:

```typescript
// camelCase → Title Case
{ firstName: "John" }      // Column: "First Name"
{ projectName: "Alpha" }   // Column: "Project Name"

// snake_case → Title Case
{ first_name: "John" }     // Column: "First Name"

// Single word → Capitalized
{ hours: 8 }               // Column: "Hours"
```

### Totals

QueryTable automatically totals these fields:
```
hours, invoiced, revenue, amount, total, budget
```

### Compact Mode

In compact mode, shows only the most important columns:

**Priority order:**
1. `date` / `period` / `label`
2. `project` / `client`
3. `hours`
4. `invoiced` / `revenue`

### Usage Examples

**Basic Example:**
```typescript
const data = [
  { date: new Date('2024-01-15'), project: 'Client A', hours: 8.5, invoiced: 680 },
  { date: new Date('2024-01-16'), project: 'Client B', hours: 6.0, invoiced: 480 }
];
```

**Output:**
| Date | Project | Hours | Invoiced |
|------|---------|------:|---------:|
| 2024-01-15 | Client A | 8.50 | €680.00 |
| 2024-01-16 | Client B | 6.00 | €480.00 |
| **Total** | | **14.50** | **€1,160.00** |

**Monthly Summary:**
```typescript
const monthly = [
  { period: 'January 2024', hours: 160, invoiced: 12800, utilization: 0.87 },
  { period: 'February 2024', hours: 152, invoiced: 12160, utilization: 0.85 }
];
```

**Output:**
| Period | Hours | Invoiced | Utilization |
|--------|------:|---------:|------------:|
| January 2024 | 160.00 | €12,800.00 | 87% |
| February 2024 | 152.00 | €12,160.00 | 85% |
| **Total** | **312.00** | **€24,960.00** | |

### Best Practices

1. **Let Auto-Detection Work** - Use meaningful field names
2. **Consistent Data Types** - Keep types consistent across entries
3. **Clear Field Names** - Use standard names like `hours`, `invoiced`, `project`
4. **Avoid Abbreviations** - Use `hours` not `hrs`, `amount` not `amt`

---

## Embedding Reports

### Basic Syntax

Insert live timesheet data anywhere in your vault using code blocks
:

````markdown
```timesheet
WHERE year = 2024
VIEW summary
```
````

### Practical Examples

**Dashboard Widget:**
```timesheet
WHERE year = 2024 AND month = 3
VIEW summary
SIZE compact
```

**Project Status Board:**
```timesheet
WHERE project = "Website Redesign"
VIEW chart
CHART budget
```

**Monthly Review:**
```timesheet
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW date, project, hours, invoiced
VIEW table
SIZE normal
```

**Year-to-Date Summary:**
```timesheet
WHERE year = 2024
VIEW full
PERIOD current-year
SIZE detailed
```

**Client-Specific Report:**
```timesheet
WHERE client = "Acme Corp"
SHOW project, hours, invoiced
VIEW table
CHART trend
```

### Advanced Dashboard Example

```markdown
# Freelance Business Dashboard - Q1 2024

## Financial Summary

### Current Quarter Performance
```timesheet
WHERE year = 2024 AND month <= 3
VIEW summary
SIZE normal
```

### Revenue Trends
```timesheet
WHERE year = 2024
VIEW chart
CHART trend
PERIOD current-year
```

## Project Status

### Active Projects
```timesheet
WHERE project = "Current Project"
VIEW chart
CHART budget
```

## Key Metrics

### Utilization Trends
```timesheet
WHERE year = 2024
SHOW month, hours, utilization
VIEW table
SIZE compact
```


---

## Performance & Best Practices

### File Organization

**Recommended Folder Structure:**
```
Vault/
├── Timesheets/
│   ├── 2024/
│   │   ├── 01-January/
│   │   │   ├── 2024-01-01.md
│   │   │   ├── 2024-01-02.md
│   │   │   └── ...
│   │   ├── 02-February/
│   │   └── ...
│   └── Archive/
│       └── 2023/
├── Reports/
│   ├── Monthly/
│   └── Quarterly/
└── Templates/
    └── Report-Templates/
```

**Timesheet File Naming:**
- ✅ `2024-03-15.md` (ISO date format)
- ✅ `2024-03-15-client-work.md` (with description)
- ✅ `Daily Notes/2024/03/15.md` (nested structure)
- ❌ `March 15 2024.md` (non-ISO format)
- ❌ `15-03-2024.md` (day-first format)

### Performance Optimization

**Metadata Cache Benefits:**
- Uses Obsidian's official metadata cache
- Fast frontmatter access without file reads
- Automatic updates when files change
- No manual cache management needed

**Optimization Tips:**
1. **Organize by date** - Use YYYY-MM-DD in filenames
2. **Archive old data** - Move completed projects to Archive folder
3. **Limit queries** - Use specific date ranges instead of `PERIOD all-time`
4. **Use compact mode** - For embedded reports in notes
5. **Reduce auto-refresh** - Increase interval or disable if not needed

### Memory Management

**Understanding Resource Usage:**
- Plugin loads frontmatter data on demand
- Charts render only when visible
- Tables paginate large datasets
- Cache cleared when plugin reloads

**Monitoring Performance:**
Enable Debug Mode to see:
- File processing times
- Query execution duration
- Cache hits/misses
- Memory usage warnings

---

## Troubleshooting

### Common Issues

#### 1. Utilization Shows 0%

**Symptoms:**
- Utilization values flat or showing 0%
- Monthly values don't match expected hours

**Solutions:**

✅ **Check Hours in Frontmatter:**
```yaml
---
hours: 8
worked: true
per-hour: 75
---
```

✅ **Verify Date Detection:**
Enable Debug Mode (Settings → Debug Mode) and check console for date extraction messages.

Expected formats:
- Filename: `2024-03-15-daily-note.md`
- Frontmatter: `date: 2024-03-15`
- Path: `Daily Notes/2024/03/15.md`

✅ **Check Hours Per Workday:**
Settings → Hours Per Workday (should match your schedule, default: 8)

#### 2. Invoice Chart Empty

**Symptoms:**
- Revenue calculations show zero
- Invoice chart has no data

**Solutions:**

✅ **Use Correct Rate Field:**
```yaml
---
per-hour: 75        # ✅ Preferred
rate: 75            # ✅ Alternative
hourlyRate: 75      # ✅ Also works
---
```

✅ **Set Default Rate:**
Settings → Project Configuration → Default Hourly Rate

✅ **Avoid Array Format Issues:**
```yaml
---
client: ["Acme Corp"]        # ✅ Correct
work-order: "Project Alpha"  # ✅ Correct
---
```

#### 3. Files Not Detected

**Symptoms:**
- Timesheet folder appears empty
- Files exist but don't show in reports

**Solutions:**

✅ **Verify Folder Path:**
Settings → Timesheet Folder (default: `Timesheets`)

✅ **Check File Format:**
```markdown
---
hours: 8
worked: true
per-hour: 75
---

# Your content here
```

✅ **Enable Debug Logging:**
Settings → Debug Mode → Check console for file processing messages

#### 4. Project Shows "Unknown"

**Symptoms:**
- All entries show as "Unknown" project
- Project filtering doesn't work

**Solutions:**

✅ **Use Correct Field Order:**
The plugin checks in this order: `work-order` → `client` → `project`

```yaml
---
work-order: "Website Project"   # ✅ Best
client: "Acme Corporation"      # ✅ Alternative  
project: "General Work"         # ✅ Fallback
---
```

✅ **Handle Arrays:**
```yaml
---
work-order: ["Main Project", "Sub"]  # Uses "Main Project"
client: ["Primary Client"]           # Uses "Primary Client"
---
```

#### 5. Budget Progress Missing

**Symptoms:**
- Budget progress bars don't appear
- Fixed-hour projects show as hourly

**Solutions:**

✅ **Configure Project Type:**
Settings → Project Configuration → Project Type: "Fixed Hour Budget"

✅ **Set Budget Hours:**
Settings → Budget Hours: 120 (or your budget)

#### 6. Charts Not Loading

**Symptoms:**
- Chart areas show loading or errors
- Charts appear blank

**Solutions:**

✅ **Check Internet Connection:**
Charts require Chart.js library from CDN

✅ **Check Browser Console:**
1. Open Developer Console (F12)
2. Look for JavaScript errors
3. Try: Refresh page, clear cache, disable ad blockers

#### 7. Performance Issues

**Symptoms:**
- Slow loading times
- Obsidian becomes unresponsive
- High memory usage

**Solutions:**

✅ **Archive Old Files:**
Move completed projects to Archive folder

✅ **Reduce Auto-Refresh:**
Settings → Auto-refresh Interval → Higher value or 0 (disabled)

✅ **Clear Cache:**
1. Close timesheet view
2. Disable and re-enable plugin
3. Reopen timesheet view

### Debug Mode

**Enable Debug Mode:**
1. Settings → Timesheet Report → Debug Mode → Enable
2. Open Developer Console (Ctrl/Cmd + Shift + I)
3. Refresh timesheet view
4. Look for `[Timesheet]` messages

**What Debug Mode Shows:**
- File processing details
- Frontmatter parsing results
- Query execution steps
- Date extraction attempts
- Cache operations
- Error details

### Sample Test File

Create this test file to verify everything works:

```markdown
---
hours: 8
worked: true
per-hour: 75
work-order: "Test Project"
date: 2024-03-15
---

# Test Entry

This is a test timesheet entry to verify the plugin is working correctly.

## Tasks
- Created test file
- Verified frontmatter fields
- Checked report generation
```

### Common Error Messages

**"No timesheet files found"**
- Check timesheet folder path in settings
- Verify folder exists and contains .md files
- Check file permissions

**"Could not extract date from file"**
- Rename files to include date (YYYY-MM-DD format)
- Add `date` field to frontmatter
- Enable debug mode to see extraction attempts

**"Chart.js library not loaded"**
- Check internet connection
- Disable ad blockers temporarily
- Try refreshing the page

**"Error processing timesheet data"**
- Check for malformed frontmatter
- Look for invalid YAML syntax
- Enable debug mode for detailed error info

### Getting Help

If issues persist:

1. **Enable Debug Mode** - Check console for error details
2. **Create Minimal Example** - Test with simple timesheet file
3. **Verify File Paths** - Ensure all folder paths are correct
4. **Update Plugin** - Use latest version from Community Plugins
5. **Report Issues** - Include debug logs and sample files

**Support Resources:**
- GitHub Issues: Report bugs and request features
- Community: Obsidian Discord #plugin-dev channel
- Documentation: This README and code comments

Remember to disable Debug Mode after troubleshooting to avoid console clutter.

---

## Development

### File Structure

```
src/
├── main.ts                    # Plugin entry point
├── settings.ts                # Settings interface
├── types.ts                   # Core type definitions
├── charts/                    # Chart rendering module
│   ├── ChartFactory.ts
│   ├── ChartRenderer.ts
│   └── README.md
├── query/                     # Query processing module
│   ├── interpreter/
│   ├── parser/
│   └── README.md
├── reports/                   # Report generation module
│   ├── ReportGenerator.ts
│   ├── TemplateManager.ts
│   ├── ReportSaver.ts
│   └── README.md
├── tables/                    # Table rendering module
│   ├── TableFactory.ts
│   ├── QueryTable.ts
│   └── README.md
├── rendering/                 # View rendering
│   └── README.md
└── retainer/                  # Optional retainer module
    ├── api.ts
    ├── integration.ts
    └── README.md
```

### Building from Source

```bash
# Clone repository
git clone https://github.com/yourusername/timesheet-report-plugin.git
cd timesheet-report-plugin

# Install dependencies
npm install

# Build plugin
npm run build

# Development mode with watch
npm run dev

# Install to local vault
npm run dev:install
```

### Local Development Setup

1. Copy `install-config.json.example` to `install-config.json`
2. Set your vault path in `install-config.json`:
   ```json
   {
     "vaultPath": "/path/to/your/obsidian/vault"
   }
   ```
3. Run `npm run dev:install` to build and install to your vault
4. Reload Obsidian (Ctrl/Cmd + R) to see changes

### API Usage Examples

```typescript
// Access metadata cache
const cache = this.app.metadataCache;
const frontmatter = cache.getFileCache(file)?.frontmatter;
const hours = frontmatter?.hours;

// Read file content
const file = this.app.vault.getAbstractFileByPath(path);
const content = await this.app.vault.cachedRead(file);

// Create new file
await this.app.vault.create(newPath, content);

// Modify file
await this.app.vault.modify(file, newContent);
```

### Official Obsidian APIs

This plugin uses **only official Obsidian APIs**:

- **Metadata Cache** - Fast frontmatter access via `app.metadataCache`
- **Vault API** - All file operations use `app.vault` methods
- **UI Components** - Native Obsidian components (`ButtonComponent`, `Notice`, etc.)
- **Type Safety** - Full TypeScript integration with Obsidian's types

**Benefits:**
- ⚡ Performance - Leverages Obsidian's optimized caching
- 🔒 Reliability - No manual YAML parsing or direct file system access
- 🔄 Compatibility - Future-proof against Obsidian updates
- 📘 Type Safety - Full TypeScript support

### Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Development Stack:**
- TypeScript with strict mode
- Official Obsidian APIs only
- Grammar-based query parser (PEG)
- Modular architecture
- Jest for testing

**How to Contribute:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

**Code Style:**
- Follow existing TypeScript conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Ensure `npm run build` succeeds

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Support

**Documentation:**
- This comprehensive README
- Module-specific README files in `src/*/README.md`
- Code examples in `examples/`

**Community:**
- **Issues:** [GitHub Issues](https://github.com/yourusername/timesheet-report-plugin/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/timesheet-report-plugin/discussions)
- **Discord:** Obsidian Discord #plugin-dev channel

**Reporting Bugs:**
Include:
- Plugin version
- Obsidian version
- Operating system
- Steps to reproduce
- Debug mode console output
- Sample timesheet file (if relevant)

**Feature Requests:**
Open a GitHub issue with:
- Clear description of the feature
- Use case and benefits
- Examples of how it would work

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.

---

## Acknowledgments

- Built for the Obsidian community
- Uses Chart.js for visualizations
- Grammar parser powered by PEG.js
- Icons from Lucide

---

**Made with ❤️ for time-tracking and productivity**

Transform your timesheet data into actionable insights with visual reports, budget tracking, and seamless integration into your Obsidian workflow - all powered by official APIs for maximum reliability and performance.
