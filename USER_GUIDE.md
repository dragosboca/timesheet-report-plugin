# Timesheet Report Plugin - User Guide

This comprehensive guide covers everything you need to know about using the Timesheet Report Plugin effectively, from basic setup to advanced features.

## Table of Contents

1. [Quick Setup](#quick-setup)
2. [Frontmatter Reference](#frontmatter-reference)
3. [Report Templates](#report-templates)
4. [Project Types & Workflows](#project-types--workflows)
5. [Advanced Timesheet Formats](#advanced-timesheet-formats)
6. [Embedding Reports](#embedding-reports)
7. [Report Generation](#report-generation)
8. [Performance & Best Practices](#performance--best-practices)
9. [Troubleshooting](#troubleshooting)

## Quick Setup

### 1. Initial Configuration

1. **Install the plugin** from Community Plugins
2. **Configure basic settings**:
   - Timesheet Folder: `Timesheets` (or your preferred location)
   - Currency Symbol: `$` (or `€`, `£`, etc.)
   - Hours Per Workday: `8` (for utilization calculations)

3. **Set up your project**:
   - Project Name: Your current project/client
   - Project Type: Choose based on your billing model
   - Default Rate: Your standard hourly rate (optional)

### 2. Create Your First Timesheet

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

## Notes
Productive day with good progress on the authentication module. Client was pleased with the mobile improvements.
```

### 3. View Your Report

1. Click the calendar-clock icon in the ribbon, or
2. Use Command Palette → "Open Timesheet Report"
3. Your data will automatically appear in charts and summaries

## Frontmatter Reference

### What Is Frontmatter?

Frontmatter is the YAML data block at the top of your markdown files (between `---` lines). This is where you put **data that the plugin processes** for calculations, charts, and reports.

### Core Properties

```yaml
---
# REQUIRED: Hours worked that day
hours: 8.5              # Number or string, supports decimals

# OPTIONAL: Billing and project info
per-hour: 75            # Hourly rate (number or string)
client: Acme Corp       # Client name (string)
work-order: Project X   # Project/task identifier (string)
project: Website Redesign # Alternative to work-order

# OPTIONAL: Control processing
worked: true            # Whether to count this day (default: true)
date: 2024-03-15       # Date override (usually auto-detected from filename)

# OPTIONAL: Organization
tags: [consulting, web] # For file organization
---
```

### Property Details

#### Required Properties

**`hours`** - Total hours worked that day
```yaml
hours: 8.5          # Decimal hours
hours: "8.5"        # String format also works
hours: 0            # PTO or non-working day
```

#### Billing Properties

**`per-hour`** - Hourly billing rate
```yaml
per-hour: 75        # Standard rate
per-hour: 125       # Premium rate for this day
per-hour: 0         # Non-billable work
```

**`client`** - Client identifier
```yaml
client: Acme Corp           # Single client
client: "Client with spaces" # Use quotes for spaces
```

**`work-order`** - Project or work order
```yaml
work-order: Website Redesign    # Project name
work-order: WO-2024-001        # Work order number
work-order: "Phase 1: Discovery" # Multi-word with quotes
```

**`project`** - Alternative to work-order
```yaml
project: Mobile App Development
# Use either 'project' or 'work-order', not both
```

#### Control Properties

**`worked`** - Whether this counts as a working day
```yaml
worked: true        # Default: counts toward hours/utilization
worked: false       # PTO, holiday, sick day - excluded from calculations
```

**`date`** - Date override (rarely needed)
```yaml
date: 2024-03-15    # Only needed if filename doesn't contain date
date: 2024-12-25    # Useful for holiday tracking
```

### Data Processing Notes

- **Metadata Cache**: The plugin uses Obsidian's official metadata cache for fast, reliable frontmatter access
- **Type Flexibility**: Numbers can be entered as `8.5` or `"8.5"` - both work
- **Default Values**: If `worked` is omitted, it defaults to `true`
- **Project Identification**: The plugin looks for `work-order` first, then `project`, then `client` for task descriptions

## Report Templates

### What Are Report Templates?

Report templates control the **presentation and formatting** of generated monthly reports. They contain placeholder variables that get replaced with calculated values from your timesheet data.

### Template Location

Templates are stored in your configured "Report Template Folder" (default: `Templates`). Create `.md` files with template placeholders.

### Available Placeholders

#### Project Information
```markdown
{{PROJECT_NAME}}        # From plugin settings
{{PROJECT_TYPE}}        # Display-friendly project type
{{CURRENCY}}           # Currency symbol from settings
```

#### Report Data
```markdown
{{MONTH_YEAR}}         # "March 2024"
{{REPORT_PERIOD}}      # Same as MONTH_YEAR
{{MONTH_HOURS}}        # Total hours from frontmatter
{{TOTAL_VALUE}}        # Calculated revenue (hours × rates)
{{REMAINING_HOURS}}    # Budget hours remaining (budget projects only)
```

#### Date/Time
```markdown
{{GENERATION_DATE}}    # Date report was created
{{CURRENT_YEAR}}       # Current year
{{CURRENT_MONTH}}      # Current month number
{{CURRENT_DATE}}       # Today's date (YYYY-MM-DD)
```

#### Content Insertion
```markdown
{{TABLE_PLACEHOLDER}}  # Where the detailed timesheet table appears
```

### Example Templates

#### Simple Professional Report

```markdown
# {{PROJECT_NAME}} - {{MONTH_YEAR}} Report

**Client:** {{PROJECT_NAME}}  
**Period:** {{REPORT_PERIOD}}  
**Generated:** {{GENERATION_DATE}}

## Executive Summary

During {{MONTH_YEAR}}, a total of **{{MONTH_HOURS}} hours** were logged for this project.

**Financial Summary:**
- Total Hours: {{MONTH_HOURS}}
- Total Value: {{TOTAL_VALUE}}

## Detailed Breakdown

{{TABLE_PLACEHOLDER}}

---
*This report was generated using the Obsidian Timesheet Report Plugin.*
```

#### Budget Project Report

```markdown
# Project Status Report - {{MONTH_YEAR}}

## Project: {{PROJECT_NAME}}
**Type:** {{PROJECT_TYPE}}  
**Report Period:** {{MONTH_YEAR}}

## Budget Status
- **Hours This Month:** {{MONTH_HOURS}}
- **Remaining Budget:** {{REMAINING_HOURS}} hours
- **Total Project Value:** {{TOTAL_VALUE}}

## Work Breakdown
{{TABLE_PLACEHOLDER}}

## Next Steps
<!-- Add your follow-up items here -->

---
**Report generated on {{GENERATION_DATE}}**
```

#### Executive Dashboard

```markdown
# Executive Summary - {{MONTH_YEAR}}

## {{PROJECT_NAME}} Status

**Key Metrics:**
- Hours Delivered: {{MONTH_HOURS}}
- Value Created: {{TOTAL_VALUE}}
- Budget Remaining: {{REMAINING_HOURS}}

## Monthly Activity
{{TABLE_PLACEHOLDER}}

**Next Review:** [Add date]  
**Action Items:** [Add items]
```

### Template Management

#### Creating Templates

1. Navigate to your Template folder
2. Create a new `.md` file
3. Add placeholders where you want dynamic content
4. Save the file

#### Setting Default Template

1. Go to Plugin Settings → Report Generation
2. Set "Default Report Template" to your preferred template path
3. This template will be used when no specific template is chosen

#### Template Validation

The plugin automatically:
- Validates template paths exist
- Checks file permissions
- Provides helpful error messages for missing placeholders
- Falls back to built-in template if custom template fails

## Project Types & Workflows

### Hourly/Time & Materials

**Best for:** Traditional consulting, ongoing maintenance, open-ended work

**Setup:**
```yaml
# Plugin Settings
Project Type: Hourly/Time & Materials
Default Rate: 75
Hours Per Workday: 8
```

**Timesheet Example:**
```markdown
---
hours: 8.5
per-hour: 75
client: Consulting Client
work-order: Database Optimization
---
```

**What You Get:**
- Utilization tracking (hours vs. target)
- Revenue calculations
- Efficiency trends
- "Potential Additional" revenue analysis

### Fixed-Hour Budget

**Best for:** Fixed-scope projects, MVPs, specific deliverables

**Setup:**
```yaml
# Plugin Settings
Project Type: Fixed Hour Budget
Budget Hours: 120
Project Deadline: 2024-06-30
```

**Timesheet Example:**
```markdown
---
hours: 6.0
client: MVP Client
work-order: User Authentication
per-hour: 85
---
```

**What You Get:**
- Budget consumption tracking ("67/120 hours used")
- Progress percentage
- Burn-down charts
- Deadline pace indicators
- Remaining hours alerts

### Retainer/Block Hours

**Best for:** Monthly retainers, pre-purchased hour blocks, ongoing relationships

**Setup:**
```yaml
# Plugin Settings
Project Type: Retainer/Block Hours
Budget Hours: 40  # Monthly retainer
```

**Timesheet Example:**
```markdown
---
hours: 4.5
client: Retainer Client
work-order: Monthly Support
per-hour: 100
---
```

**What You Get:**
- Block hour usage tracking
- Monthly consumption trends
- Efficiency analysis
- Renewal timing insights

## Advanced Timesheet Formats

### Complex Project Structure

For projects with multiple work streams or detailed tracking:

```markdown
---
hours: 8.5
per-hour: 75
client: Enterprise Client
work-order: Platform Migration
tags: [consulting, migration, enterprise]
---

# Platform Migration - March 15, 2024

## Work Summary
**Focus:** Database schema migration and API updates
**Environment:** Staging and production systems
**Team Collaboration:** 2 hours with DevOps team

## Tasks Completed

### Database Migration (4.5 hours)
- Analyzed existing schema structure
- Created migration scripts for user tables
- Tested migration on staging environment
- Documented rollback procedures

### API Development (3.0 hours)
- Updated authentication endpoints
- Implemented new data validation
- Added error handling for edge cases

### Team Coordination (1.0 hours)
- Daily standup meeting
- Code review with senior developer
- Planning session for next sprint

## Blockers & Risks
- Waiting on client approval for schema changes
- Production deployment window scheduled for weekend

## Tomorrow's Plan
- Finalize migration scripts
- Complete API testing suite
- Prepare production deployment checklist
```

### Time Tracking with Breaks

For detailed time allocation tracking:

```markdown
---
hours: 7.5
per-hour: 80
client: Detailed Tracking Client
work-order: Web Application Development
---

# Detailed Time Log - March 15, 2024

## Time Allocation

### Morning Session (9:00 AM - 12:30 PM) - 3.5 hours
**Focus:** Frontend development

- **9:00-10:30** (1.5h): Component architecture planning
- **10:30-10:45**: Break
- **10:45-12:30** (1.75h): React component implementation
- **12:30-1:30**: Lunch break

### Afternoon Session (1:30 PM - 5:00 PM) - 3.5 hours
**Focus:** Backend integration

- **1:30-3:00** (1.5h): API endpoint development
- **3:00-3:15**: Break
- **3:15-4:45** (1.5h): Database query optimization
- **4:45-5:00** (0.25h): Daily summary and planning

### Evening Session (7:00 PM - 7:30 PM) - 0.5 hours
**Focus:** Documentation

- Code documentation updates
- Tomorrow's task planning

## Notes
Productive day with solid progress on both frontend and backend. The new component architecture is working well and should speed up future development.
```

### Multi-Client Day

For freelancers working with multiple clients:

```markdown
---
hours: 8.0
# Note: Use average rate or most common rate for multi-client days
per-hour: 75
tags: [freelance, multi-client]
---

# Multi-Client Freelance Day - March 15, 2024

## Work Summary

**Total Hours:** 8.0  
**Clients Served:** 3  
**Primary Focus:** Development and consulting

## Project Breakdown

### Client A - E-commerce Platform (4.0 hours)
**Rate:** $85/hour  
**Work Order:** Checkout System Enhancement

**Tasks:**
- Payment gateway integration (2.5h)
- Shopping cart bug fixes (1.0h)
- Client meeting and demo (0.5h)

**Notes:** Successfully integrated Stripe payment system. Client approved for production deployment.

### Client B - Mobile App Consulting (2.5 hours)
**Rate:** $100/hour  
**Work Order:** iOS App Architecture Review

**Tasks:**
- Code review and analysis (1.5h)
- Architecture recommendations document (1.0h)

**Notes:** Identified several performance optimization opportunities. Provided detailed recommendations for next development phase.

### Client C - Database Migration (1.5 hours)
**Rate:** $75/hour  
**Work Order:** Legacy System Migration

**Tasks:**
- Migration script testing (1.0h)
- Documentation updates (0.5h)

**Notes:** Migration scripts tested successfully on staging. Ready for production deployment next week.

## Daily Summary

**Revenue Breakdown:**
- Client A: $340 (4.0h × $85)
- Client B: $250 (2.5h × $100)  
- Client C: $112.50 (1.5h × $75)
- **Total Daily Revenue:** $702.50

**Key Accomplishments:**
- Completed major milestone for Client A
- Delivered strategic recommendations for Client B
- Moved Client C project to final phase

**Tomorrow's Priorities:**
- Client A: Production deployment
- Client B: Follow-up meeting
- Client C: Production migration
```

## Embedding Reports

### Basic Embedding Syntax

Insert live timesheet data anywhere in your vault using code blocks with the `timesheet` language identifier:

````markdown
```timesheet
WHERE year = 2024
VIEW summary
```
````

### Query Components

#### WHERE Clauses

**Filter by time period:**
```
WHERE year = 2024
WHERE month = 3
WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
```

**Filter by project data:**
```
WHERE client = "Acme Corp"
WHERE project = "Website Redesign" 
WHERE work-order = "MVP Development"
```

**Combine filters:**
```
WHERE year = 2024 AND month >= 6
WHERE client = "Acme Corp" AND hours > 0
WHERE date BETWEEN "2024-01-01" AND "2024-06-30" AND project = "Migration"
```

#### VIEW Options

```
VIEW summary    # Key metrics cards only
VIEW chart     # Visualizations only
VIEW table     # Data table only
VIEW full      # Everything (summary + chart + table)
```

#### CHART Types

```
CHART trend     # Hours and utilization over time
CHART monthly   # Monthly revenue and budget analysis
CHART budget    # Budget consumption for fixed-hour projects
```

#### SIZE Options

```
SIZE compact    # Minimal space for widgets
SIZE normal     # Standard display
SIZE detailed   # Full information with all details
```

### Practical Examples

#### Dashboard Widget

```timesheet
// Quick stats for daily notes
WHERE year = 2024 AND month = 3
VIEW summary
SIZE compact
```

#### Project Status Board

```timesheet
// Current project progress
WHERE client = "Enterprise Client" AND year = 2024
VIEW full
CHART budget
SIZE detailed
```

#### Monthly Review

```timesheet
// Complete monthly analysis
WHERE year = 2024 AND month = 2
VIEW full
CHART trend
SIZE normal
```

#### Year-to-Date Summary

```timesheet
// YTD performance tracking
WHERE year = 2024
VIEW summary
CHART monthly
SIZE detailed
```

#### Client-Specific Report

```timesheet
// All work for specific client
WHERE client = "Acme Corporation"
VIEW table
SIZE normal
```

### Advanced Embedding Techniques

#### Executive Dashboard

Create a comprehensive business dashboard:

```markdown
# Freelance Business Dashboard - Q1 2024

## Financial Summary

### Current Quarter Performance
```timesheet
WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
VIEW summary
SIZE detailed
```

### Revenue Trends
```timesheet
WHERE year = 2024
VIEW chart
CHART monthly
SIZE normal
```

## Project Status

### Active Projects
```timesheet
WHERE year = 2024 AND month >= 2
VIEW table
SIZE compact
```

### Budget Projects Status
```timesheet
// Fixed-hour project tracking
WHERE year = 2024
CHART budget
VIEW chart
SIZE normal
```

## Key Metrics

### Utilization Trends
```timesheet
WHERE year = 2024
CHART trend
VIEW chart
SIZE detailed
```

### This Month's Activity
```timesheet
WHERE year = 2024 AND month = 3
VIEW full
SIZE normal
```
```

#### Weekly Review Template

```markdown
# Week of March 11-15, 2024

## Weekly Summary
```timesheet
WHERE date BETWEEN "2024-03-11" AND "2024-03-15"
VIEW summary
SIZE normal
```

## Daily Breakdown
```timesheet
WHERE date BETWEEN "2024-03-11" AND "2024-03-15"
VIEW table
SIZE detailed
```

## Performance Analysis
```timesheet
WHERE date BETWEEN "2024-03-11" AND "2024-03-15"
CHART trend
VIEW chart
```

## Next Week's Goals
- [ ] Complete Client A milestone
- [ ] Begin Client B discovery phase
- [ ] Review Q1 performance metrics
```

## Report Generation

### Manual Report Generation

1. **Open Report Generator:**
   - Click "Generate Monthly Report" in timesheet view, or
   - Use Command Palette → "Generate Monthly Timesheet Report"

2. **Select Options:**
   - Choose month and year
   - Select template (or use default)
   - Confirm output location

3. **Review Generated Report:**
   - Report appears in your configured output folder
   - All placeholders are replaced with calculated values
   - Table includes all timesheet entries for the period

### Automated Workflows

#### Monthly Reporting Workflow

Create a template for consistent monthly reporting:

```markdown
# Monthly Report Template

## {{PROJECT_NAME}} - {{MONTH_YEAR}}

**Generated:** {{GENERATION_DATE}}

### Executive Summary
This report covers {{MONTH_HOURS}} hours of work completed during {{MONTH_YEAR}}.

### Financial Overview
- **Total Hours:** {{MONTH_HOURS}}
- **Total Value:** {{TOTAL_VALUE}}
- **Average Rate:** {{CURRENCY}}XX/hour

### Project Status
{{REMAINING_HOURS}}

### Work Breakdown
{{TABLE_PLACEHOLDER}}

### Next Month's Goals
<!-- Update this section manually each month -->

---
*Automated report generated by Obsidian Timesheet Plugin*
```

#### Client Deliverables

For client-facing reports, create professional templates:

```markdown
# Professional Client Report

**{{PROJECT_NAME}}**  
**Reporting Period:** {{MONTH_YEAR}}  
**Date:** {{GENERATION_DATE}}

---

## Executive Summary

During {{MONTH_YEAR}}, our team dedicated {{MONTH_HOURS}} hours to advancing your project goals.

## Value Delivered

**Total Investment:** {{TOTAL_VALUE}}  
**Hours Applied:** {{MONTH_HOURS}}  
**Focus Areas:** [Update based on work completed]

## Detailed Activity Report

{{TABLE_PLACEHOLDER}}

## Next Steps

[Update with specific next steps and recommendations]

## Questions or Feedback?

We welcome your feedback on this reporting format and the work completed. Please don't hesitate to reach out with any questions.

---

**Contact Information**  
[Your contact details]
```

### Bulk Report Generation

For multiple time periods or projects:

1. **Set up consistent templates** for each report type
2. **Use the report generator** for each month/period needed
3. **Organize output** in dated subfolders
4. **Review and customize** each report before sending to clients

## Performance & Best Practices

### File Organization

#### Recommended Folder Structure

```
📁 Your Vault/
├── 📁 Timesheets/
│   ├── 📁 2024/
│   │   ├── 📁 01-January/
│   │   ├── 📁 02-February/
│   │   └── 📁 03-March/
│   └── 📁 2023/
│       └── 📁 Archive/
├── 📁 Templates/
│   ├── Monthly Report Template.md
│   └── Client Report Template.md
└── 📁 Reports/
    └── 📁 Timesheet/
        ├── 📁 2024/
        └── 📁 Client Deliverables/
```

#### Timesheet File Naming

**Best practices for timesheet files:**

```
✅ Good naming:
2024-03-15.md
2024-03-15-client-work.md
March-15-2024.md

❌ Avoid:
Work today.md (no date)
timesheet.md (no date)
3-15-24.md (ambiguous format)
```

### Performance Optimization

#### Metadata Cache Benefits

The plugin uses Obsidian's official metadata cache, providing:

- **Fast Startup:** No manual file parsing on load
- **Real-time Updates:** Changes reflected immediately
- **Memory Efficient:** Leverages Obsidian's optimized caching
- **Type Safety:** Proper error handling for malformed frontmatter

#### Optimization Tips

**For Large Vaults:**

1. **Use Date Ranges in Embeds:**
   ```timesheet
   WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
   // More efficient than processing all historical data
   ```

2. **Leverage Compact Views:**
   ```timesheet
   VIEW summary
   SIZE compact
   // Faster rendering for frequently-viewed pages
   ```

3. **Archive Old Data:**
   - Move old timesheet files to Archive subfolders
   - Plugin still processes them but with better organization

**For Many Embeds:**

1. **Limit Concurrent Embeds** on single pages
2. **Use Specific Filters** rather than broad date ranges
3. **Consider Separate Pages** for different time periods

### Memory Management

#### Understanding Resource Usage

The plugin is optimized for efficiency:

```javascript
// Memory usage is minimal due to:
- Metadata cache utilization (no duplicate file reading)
- Lazy chart rendering (charts load only when visible)  
- Efficient data structures (time entries cached intelligently)
- Smart query processing (filters applied early to reduce data set)
```

#### Monitoring Performance

Enable **Debug Mode** in settings to monitor:
- File processing times
- Query execution duration
- Memory allocation patterns
- Cache hit/miss ratios

## Troubleshooting

### Data Issues

#### No Timesheet Data Appearing

**Symptoms:** Empty reports, "No data found" messages

**Solutions:**

1. **Check Folder Path:**
   ```
   ✅ Settings → Timesheet Folder: "Timesheets"
   ✅ Verify folder exists in your vault
   ✅ Check for typos in folder name
   ```

2. **Verify File Format:**
   ```yaml
   ✅ Frontmatter present:
   ---
   hours: 8.5
   ---
   
   ❌ Missing frontmatter:
   # Just content without YAML block
   ```

3. **Check Date Detection:**
   ```
   ✅ Filename includes date: "2024-03-15.md"
   ✅ Or frontmatter has date: "date: 2024-03-15"
   ❌ No date information available
   ```

#### Incorrect Calculations

**Symptoms:** Wrong hour totals, missing revenue calculations

**Solutions:**

1. **Validate Frontmatter Types:**
   ```yaml
   ✅ Correct:
   hours: 8.5
   per-hour: 75
   
   ❌ Problematic:
   hours: "eight and a half"
   per-hour: "seventy-five dollars"
   ```

2. **Check Working Day Flags:**
   ```yaml
   ✅ For working days:
   worked: true     # or omit entirely
   
   ✅ For PTO/holidays:
   worked: false
   hours: 0
   ```

3. **Enable Debug Mode:**
   - Go to Settings → Debug Mode: ON
   - Check console for processing details
   - Look for frontmatter parsing messages

#### Date Extraction Problems

**Symptoms:** Files not appearing in correct time periods

**Debug Steps:**

1. **Check Filename Formats:**
   ```
   ✅ Supported formats:
   2024-03-15.md
   March-15-2024.md  
   20240315.md
   
   ❌ Unsupported:
   3/15/24.md
   Mar 15.md
   Tuesday.md
   ```

2. **Verify Frontmatter Dates:**
   ```yaml
   ✅ Correct format:
   date: 2024-03-15
   
   ❌ Incorrect formats:
   date: "March 15, 2024"
   date: "3/15/24"
   date: 15-03-2024
   ```

3. **Debug Date Extraction:**
   - Enable Debug Mode
   - Look for "Date extracted: YYYY-MM-DD" messages
   - Check "Could not extract date" warnings

### Template Issues

#### Template Not Loading

**Symptoms:** Generated reports use default template instead of custom template

**Solutions:**

1. **Verify Template Path:**
   ```
   ✅ Settings → Report Template Folder: "Templates"
   ✅ Settings → Default Report Template: "Templates/My Template.md"
   ✅ File exists at specified path
   ```

2. **Check File Permissions:**
   ```
   ✅ Template file is readable
   ✅ Template folder is accessible
   ✅ No file locks or permissions issues
   ```

3. **Validate Template Content:**
   ```markdown
   ✅ Must contain:
   {{TABLE_PLACEHOLDER}}
   
   ✅ Valid placeholders:
   {{MONTH_YEAR}}
   {{MONTH_HOURS}}
   {{PROJECT_NAME}}
   
   ❌ Invalid placeholders:
   {MONTH_YEAR}     // Single braces
   [[MONTH_YEAR]]   // Wiki links
   ```

#### Missing Placeholder Replacement

**Symptoms:** Generated reports show `{{PLACEHOLDER}}` instead of values

**Solutions:**

1. **Check Placeholder Spelling:**
   ```markdown
   ✅ Correct:
   {{MONTH_HOURS}}
   {{TOTAL_VALUE}}
   
   ❌ Incorrect:
   {{MONTHLY_HOURS}}    // Wrong name
   {{TOTAL_VALUE }}     // Extra space
   {{ MONTH_HOURS}}     // Extra space
   ```

2. **Verify Data Availability:**
   ```
   ✅ For {{REMAINING_HOURS}}:
   - Project Type must be "Fixed Hour Budget" or "Retainer"
   - Budget Hours must be set in project settings
   
   ✅ For {{TOTAL_VALUE}}:
   - Default Rate must be set, OR
   - Timesheet files must have per-hour rates
   ```

### Query Syntax Issues

#### Embedding Syntax Errors

**Symptoms:** Query blocks show errors instead of data

**Common Issues & Fixes:**

1. **Case Sensitivity:**
   ```
   ✅ Correct:
   WHERE year = 2024
   VIEW summary
   CHART trend
   
   ❌ Incorrect:
   where year = 2024    // lowercase
   view summary         // lowercase
   chart trend          // lowercase
   ```

2. **String Quoting:**
   ```
   ✅ Correct:
   WHERE client = "Acme Corp"
   WHERE project = "Web Development"
   
   ❌ Incorrect:
   WHERE client = Acme Corp      // No quotes
   WHERE project = 'Web Dev'     // Single quotes
   ```

3. **Date Format:**
   ```
   ✅ Correct:
   WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
   
   ❌ Incorrect:
   WHERE date BETWEEN 2024-01-01 AND 2024-03-31   // No quotes
   WHERE date BETWEEN "1/1/24" AND "3/31/24"       // Wrong format
   ```

#### Query Performance Issues

**Symptoms:** Slow-loading embeds, timeout errors

**Optimization Strategies:**

1. **Use Specific Date Ranges:**
   ```
   ✅ Fast:
   WHERE year = 2024 AND month = 3
   WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
   
   ❌ Slow:
   WHERE year >= 2020    // Too broad
   // No date filter     // Processes all data
   ```

2. **Choose Appropriate Views:**
   ```
   ✅ For quick checks:
   VIEW summary
   SIZE compact
   
   ✅ For detailed analysis:
   VIEW full
   SIZE detailed
   ```

### Debug Mode Analysis

#### Enabling Debug Mode

1. Go to Settings → Timesheet Report
2. Enable "Debug Mode"
3. Refresh your timesheet view
4. Check browser console (F12 → Console tab)

#### Understanding Debug Output

**File Processing Messages:**
```javascript
[Timesheet Plugin] Processing file: Timesheets/2024-03-15.md
[Timesheet Plugin] Frontmatter found: {hours: 8.5, client: "Acme"}
[Timesheet Plugin] Date extracted: 2024-03-15T00:00:00.000Z
[Timesheet Plugin] Entry added: 8.5 hours for Acme on 2024-03-15
```

**Error Messages:**
```javascript
[Timesheet Plugin] Warning: No frontmatter found in file: Timesheets/notes.md
[Timesheet Plugin] Error: Could not extract date from file: Timesheets/random-note.md
[Timesheet Plugin] Warning: Invalid hours value in file: Timesheets/2024-03-16.md
```

**Performance Metrics:**
```javascript
[Timesheet Plugin] Performance: 
  - Files processed: 45
  - Entries extracted: 32
  - Processing time: 156ms
  - Cache hits: 28
```

#### Using Debug Information

**For Data Issues:**
1. Look for "No frontmatter" warnings → Add YAML blocks
2. Check "Invalid date" errors → Fix filename or add date property
3. Watch "Invalid hours" warnings → Fix numeric format in frontmatter

**For Performance:**
1. Monitor processing time → Consider archiving old files
2. Check cache hit ratio → Restart Obsidian if cache is cold
3. Count processed files → Use date filters in embeds if too many

### Getting Help

#### Self-Diagnosis Checklist

Before seeking help, verify:

- [ ] Timesheet folder path is correct and folder exists
- [ ] Timesheet files have proper YAML frontmatter
- [ ] Hours are numeric values in frontmatter
- [ ] Dates are detectable (in filename or frontmatter)
- [ ] Template paths are valid and files exist
- [ ] Query syntax follows case-sensitive rules
- [ ] Debug mode enabled for detailed error messages

#### Support Resources

**Documentation:**
- This User Guide for comprehensive coverage
- README.md for quick reference
- Plugin settings descriptions for configuration help

**Community:**
- GitHub Issues for bug reports and feature requests
- Obsidian Discord #plugin-dev channel for general discussion
- Plugin directory reviews for user feedback

**Technical Support:**
- Enable Debug Mode and include console output in reports
- Provide sample timesheet files (anonymized) for troubleshooting
- Include plugin settings configuration in support requests

#### Common Support Requests

**"My data isn't showing up"**
- Include: Debug mode console output
- Include: Sample timesheet file structure
- Include: Plugin settings screenshot

**"Generated reports are wrong"**
- Include: Template file content
- Include: Expected vs. actual output
- Include: Timesheet data for the period

**"Queries aren't working"**
- Include: Exact query syntax used
- Include: Error messages from browser console
- Include: Sample data that should match the query

---

This User Guide covers the complete functionality of the Timesheet Report Plugin. The plugin leverages Obsidian's official APIs for maximum reliability and performance, ensuring your timesheet data is processed accurately and efficiently.
