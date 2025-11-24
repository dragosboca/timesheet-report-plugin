# Project Configuration Examples

This document provides practical examples of how to configure the Timesheet Report Plugin for different types of freelance projects.

## Project Type Examples

### 1. Hourly/Time & Materials Project

**Use Case**: Traditional consulting work billed by the hour
**Client**: Web development agency
**Scope**: Ongoing website maintenance and updates

#### Settings Configuration:
- **Project Name**: "Agency ABC - Website Maintenance"
- **Project Type**: "Hourly/Time & Materials"
- **Default Hourly Rate**: 85 (optional)
- **Hours Per Workday**: 8

#### Timesheet Entry Example:
```yaml
---
hours: 6
per-hour: 85
client:
  - Agency ABC
work-order:
  - Website Updates
worked: true
---

# Website Maintenance - January 15, 2024

## Tasks Completed
- Updated contact form validation
- Fixed responsive design issues on mobile
- Optimized image loading performance
```

#### What You'll See:
- Utilization tracking based on working capacity
- "Potential Additional" revenue in charts
- Month-over-month efficiency analysis

---

### 2. Fixed-Hour Budget Project

**Use Case**: Fixed-scope project with hour budget
**Client**: Startup needing MVP development
**Scope**: 120 hours allocated for mobile app prototype

#### Settings Configuration:
- **Project Name**: "StartupXYZ - Mobile App MVP"
- **Project Type**: "Fixed Hour Budget"
- **Budget Hours**: 120
- **Default Hourly Rate**: 95
- **Project Deadline**: "2024-04-30"

#### Timesheet Entry Example:
```yaml
---
hours: 7.5
per-hour: 95
client:
  - StartupXYZ
work-order:
  - Mobile App Development
worked: true
---

# MVP Development - Sprint 2

## Features Implemented
- User authentication system
- Core navigation structure
- Data persistence layer
```

#### What You'll See:
- Budget consumption tracking (e.g., "67/120 hours used")
- Progress percentage (e.g., "56% complete")
- Remaining hours countdown
- Budget burn-down charts
- Pace indicators (on track, ahead, behind)

---

### 3. Retainer/Block Hours Project

**Use Case**: Ongoing client relationship with pre-purchased hours
**Client**: E-commerce company with monthly retainer
**Scope**: 40 hours per month for various tasks

#### Settings Configuration:
- **Project Name**: "EcomCorp - Monthly Retainer"
- **Project Type**: "Retainer/Block Hours"
- **Budget Hours**: 40 (for current month/block)
- **Default Hourly Rate**: 110

#### Timesheet Entry Example:
```yaml
---
hours: 4
per-hour: 110
client:
  - EcomCorp
work-order:
  - SEO Optimization
worked: true
---

# Retainer Work - Week 2

## Tasks Completed
- Keyword research and analysis
- Meta description optimization
- Site speed improvements
```

#### What You'll See:
- Retainer hour consumption
- Hours remaining in current block
- Usage efficiency tracking
- Monthly reset capabilities

---

## Multi-Project Workflow

### Vault Structure Recommendation:
```
📁 Projects/
├── 📁 AgencyABC-Maintenance/     (Hourly project)
│   ├── .obsidian/
│   ├── Timesheets/
│   └── Meeting Notes/
├── 📁 StartupXYZ-MVP/            (Fixed-hour project)
│   ├── .obsidian/
│   ├── Timesheets/
│   └── Development Notes/
└── 📁 EcomCorp-Retainer/         (Retainer project)
    ├── .obsidian/
    ├── Timesheets/
    └── Monthly Reports/
```

### Benefits of Separate Vaults:
- **Clear separation** between projects
- **Independent settings** for each project type
- **Client-specific** templates and workflows
- **Easy billing** and reporting per project
- **Privacy** - each vault is self-contained

---

## Advanced Configuration Tips

### 1. Default Rates Strategy
- **Set project default rate** to most common billing rate
- **Override in timesheet YAML** for special circumstances
- **Use different rates** for different types of work within same project

### 2. Budget Management
- **Fixed-hour projects**: Set conservative budgets with buffer time
- **Retainer projects**: Reset budget monthly or per billing cycle
- **Track scope creep** by monitoring actual vs. budgeted hours

### 3. Deadline Tracking
- Set realistic deadlines with buffer time
- Use deadline field for project planning
- Monitor pace indicators to stay on track

### 4. Utilization Optimization
- **Hourly projects**: Aim for 80-90% utilization
- **Budget projects**: Focus on staying within allocated hours
- **Retainer projects**: Maximize value within hour constraints

---

## Migration Examples

### From Other Time Tracking Tools

#### From Toggl/Clockify:
1. Export your historical data
2. Create new Obsidian vault for each project
3. Configure project settings based on billing model
4. Import/recreate key time entries as markdown files

#### From Excel Spreadsheets:
1. Identify project types and billing models
2. Set up corresponding vault configurations
3. Convert spreadsheet rows to daily timesheet files
4. Configure appropriate hourly rates and budgets

### Upgrading from Basic Setup:
1. **Determine your project type** based on current billing model
2. **Configure project settings** in the new Project Configuration section
3. **Existing timesheet files** will work without changes
4. **Charts and reports** will automatically adapt to new project type

---

## Troubleshooting

### Common Issues:

**Q: My budget tracking isn't showing up**
- A: Make sure Project Type is set to "Fixed Hour Budget" or "Retainer/Block Hours"
- A: Verify Budget Hours is configured with a value > 0

**Q: Utilization seems wrong**
- A: Check Hours Per Workday setting matches your actual working hours
- A: For budget projects, focus on budget progress instead of utilization

**Q: Charts look different**
- A: Charts automatically adapt based on project type
- A: Hourly projects show "Potential Additional", budget projects show "Budget Remaining"

**Q: Can I change project type mid-project?**
- A: Yes, but historical data interpretation may change
- A: Consider creating a new vault if billing model fundamentally changes

---

## Embedding Examples

The plugin supports embedding timesheet reports directly in your notes using a Dataview-style query syntax. Here are practical examples for different use cases:

### Daily Note Integration

**Quick status check in daily notes:**
```timesheet
PERIOD current-year
VIEW summary
SIZE compact
```

This provides a minimal summary that fits nicely in daily notes without taking up too much space.

**Current month progress:**
```timesheet
WHERE year = 2024 AND month = 3
VIEW summary
SIZE normal
```

### Project Dashboard Pages

**Complete project overview:**
```timesheet
WHERE year = 2024
VIEW full
SIZE detailed
```

This shows everything: summary, charts, and data table with full detail.

**Budget tracking for fixed-hour projects:**
```timesheet
WHERE year = 2024
VIEW chart
CHART budget
SIZE normal
```

Perfect for monitoring budget consumption in project status pages.

### Client Reports & Presentations

**Professional quarterly summary:**
```timesheet
WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
VIEW summary
SIZE detailed
```

**Visual progress tracking:**
```timesheet
PERIOD last-6-months
VIEW chart
CHART trend
```

### Weekly/Monthly Reviews

**Recent performance table:**
```timesheet
PERIOD last-6-months
VIEW table
SIZE normal
```

**Compact monthly overview:**
```timesheet
PERIOD current-year
VIEW summary
SIZE compact
```

### Specific Project Analysis

**Single month deep dive:**
```timesheet
WHERE year = 2024 AND month = 2
VIEW full
```

**Year-to-date summary:**
```timesheet
WHERE year = 2024
VIEW summary
SIZE detailed
```

### Template Integration

**Project Status Template:**
```markdown
# {{project_name}} - Weekly Status

## Current Progress
```timesheet
WHERE year = 2024
VIEW summary
SIZE normal
```

## Budget Tracking
```timesheet
CHART budget
VIEW chart
```

## Recent Activity
```timesheet
PERIOD last-6-months
VIEW table
SIZE compact
```
```

**Client Dashboard Template:**
```markdown
# Client ABC - Project Dashboard

## Executive Summary
```timesheet
PERIOD current-year
VIEW summary
SIZE detailed
```

## Performance Trends
```timesheet
PERIOD all-time
VIEW chart
CHART trend
```
```

### Advanced Query Examples

**Complex filtering:**
```timesheet
WHERE year = 2024 AND project = "Client XYZ"
VIEW full
SIZE detailed
```

**Multi-month analysis:**
```timesheet
WHERE date BETWEEN "2023-10-01" AND "2024-03-31"
VIEW chart
CHART monthly
```

**Compact dashboard widgets:**
```timesheet
// Current year summary
PERIOD current-year
VIEW summary
SIZE compact
```

### Best Practices for Embedding

1. **Use SIZE compact** for dashboard widgets and daily notes
2. **Use SIZE detailed** for comprehensive project reports
3. **Use specific WHERE clauses** to focus on relevant data
4. **Combine multiple embeds** for different perspectives on the same page
5. **Use comments** (// prefix) to document complex queries

### Common Use Cases by Role

#### For Project Managers:
- Embed budget tracking in project status pages
- Use trend charts in weekly team updates
- Include compact summaries in meeting notes

#### For Freelancers:
- Daily note widgets for quick status checks
- Client dashboard pages with multiple views
- Invoice preparation with detailed tables

#### For Teams:
- Shared project dashboards with real-time data
- Performance tracking across multiple periods
- Resource allocation planning with utilization data
