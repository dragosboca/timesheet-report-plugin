# Timesheet Report Plugin - User Guide

This guide provides detailed examples and advanced usage scenarios for the Timesheet Report Plugin. While the README.md covers the basics, this guide dives deep into real-world workflows and advanced features.

## Table of Contents

- [Advanced Timesheet Formats](#advanced-timesheet-formats)
- [Project Workflow Examples](#project-workflow-examples)
- [Advanced Embedding Techniques](#advanced-embedding-techniques)
- [Custom Report Templates](#custom-report-templates)
- [Multi-Project Management](#multi-project-management)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting Guide](#troubleshooting-guide)

## Advanced Timesheet Formats

### Complex Project Structure

For projects with multiple clients and varying rates:

```md
---
tags: [Daily, Billable]
hours: 8.5
worked: true
client:
  - "Client A"
  - "Client B"
work-order:
  - "Website Redesign"
  - "API Development"
project-phase: "Phase 2 - Implementation"
---

# Multi-Client Work Day - 2024-03-15

## Client A - Website Redesign (5.5 hours @ $85/hr)
| Task | Hours | Rate | Notes |
|------|-------|------|-------|
| UI Design | 3.0 | 85 | Header redesign |
| Client Review | 1.5 | 85 | Feedback session |
| Revisions | 1.0 | 85 | Layout adjustments |

## Client B - API Development (3.0 hours @ $95/hr)
| Task | Hours | Rate | Notes |
|------|-------|------|-------|
| Endpoint Development | 2.0 | 95 | User authentication |
| Testing | 1.0 | 95 | Unit tests |

**Total Invoiced**: $702.50
**Utilization**: 106% (8.5/8 hours)
```

### Time Tracking with Breaks

Detailed time tracking including non-billable time:

```md
---
tags: [Daily]
hours: 6.5  # Billable hours only
total-time: 9.0  # Including breaks and admin
worked: true
per-hour: 75
efficiency: 72  # 6.5/9.0 * 100
---

# Detailed Time Log - 2024-03-15

## Time Breakdown
- **9:00-10:30**: Client work (1.5h)
- **10:30-10:45**: Break (0.25h) ❌
- **10:45-12:00**: Development (1.25h)
- **12:00-13:00**: Lunch (1h) ❌
- **13:00-15:00**: Meetings (2h)
- **15:00-15:15**: Break (0.25h) ❌
- **15:15-17:00**: Documentation (1.75h)

## Billable Summary
| Activity | Hours | Rate | Amount |
|----------|-------|------|--------|
| Client Work | 1.5 | 75 | $112.50 |
| Development | 1.25 | 75 | $93.75 |
| Meetings | 2.0 | 75 | $150.00 |
| Documentation | 1.75 | 75 | $131.25 |
| **Total** | **6.5** | **75** | **$487.50** |

**Efficiency**: 72% (6.5 billable / 9.0 total hours)
```

### Project Milestone Tracking

For budget projects with milestone tracking:

```md
---
tags: [Daily, Milestone]
hours: 7
worked: true
per-hour: 90
milestone: "MVP Beta Release"
milestone-progress: 85
budget-consumed: 67.5  # Hours used so far
budget-total: 120
deadline: "2024-04-30"
---

# MVP Development - Sprint 3 Final - 2024-03-15

## Milestone: MVP Beta Release (85% Complete)

### Today's Accomplishments
- ✅ User authentication flow
- ✅ Database migration scripts
- ✅ API endpoint testing
- 🔄 UI Polish (in progress)

### Budget Status
- **Used**: 67.5 / 120 hours (56.25%)
- **Remaining**: 52.5 hours
- **Days to Deadline**: 46 days
- **Required Pace**: 1.14 hours/day

### Risk Assessment
- **On Track**: Current pace sustainable
- **Quality**: High, thorough testing
- **Scope**: Minor features may be deferred
```

## Project Workflow Examples

### Agile Development Workflow

**Sprint Planning Integration:**

```md
---
tags: [Sprint, Planning]
hours: 8
worked: true
per-hour: 85
sprint: "Sprint 15"
sprint-goal: "User Profile Enhancement"
story-points: 13
velocity-target: 25
---

# Sprint 15 - Day 3 - 2024-03-15

## Sprint Goal: User Profile Enhancement

### Completed Stories
- [x] **US-234**: Profile photo upload (5 pts) - 3.5 hours
- [x] **US-235**: Email preferences (3 pts) - 2.0 hours

### In Progress
- [🔄] **US-236**: Privacy settings (5 pts) - 2.5 hours (ongoing)

### Sprint Metrics
- **Points Completed**: 8/13 (62%)
- **Hours Logged**: 8.0
- **Velocity**: On track for 25 points
- **Burndown**: Slightly ahead of schedule

### Blockers & Risks
- None currently

### Tomorrow's Plan
- Complete US-236 privacy settings
- Begin US-237 notification preferences
```

### Client Consulting Workflow

**Weekly Client Retainer:**

```md
---
tags: [Consulting, Retainer]
hours: 6
worked: true
per-hour: 120
client: ["TechCorp Inc"]
retainer-month: "March 2024"
retainer-used: 18.5  # Hours used this month
retainer-total: 40   # Monthly allocation
engagement-type: "Strategic Advisory"
---

# TechCorp Strategic Advisory - Week 2 - 2024-03-15

## Retainer Status (March 2024)
- **Used**: 18.5 / 40 hours (46.25%)
- **Remaining**: 21.5 hours
- **Weeks Left**: 2.5
- **Recommended Pace**: 8.6 hours/week

## This Week's Focus Areas

### 1. Technology Architecture Review (3.5 hours)
- Evaluated current microservices setup
- Identified scalability bottlenecks
- Proposed migration to event-driven architecture

### 2. Team Process Optimization (2.5 hours)
- Facilitated Agile retrospective
- Implemented new CI/CD pipeline
- Coached team leads on sprint planning

## Deliverables
- ✅ Architecture assessment document
- ✅ Process improvement roadmap
- 🔄 Technology stack recommendations (draft)

## Next Week's Priorities
1. Finalize technology recommendations
2. Budget planning for Q2 initiatives
3. Team training session on new processes
```

### Freelance Business Workflow

**Multi-Client Day Management:**

```md
---
tags: [Freelance, Multi-Client]
hours: 9
worked: true
context-switches: 4
focus-time: 7.5  # Deep work hours
admin-time: 1.5  # Non-billable admin
---

# Multi-Client Freelance Day - 2024-03-15

## Client Distribution
| Client | Hours | Rate | Amount | Project |
|--------|-------|------|--------|---------|
| StartupA | 4.0 | 95 | $380 | Mobile App |
| CorpB | 3.0 | 110 | $330 | API Integration |
| AgencyC | 2.0 | 85 | $170 | Website Maintenance |
| **Total** | **9.0** | **97.8** | **$880** | |

## Context Switching Analysis
- **Switches**: 4 (optimal: ≤3)
- **Avg Session**: 2.25 hours
- **Focus Quality**: Good (minimal interruptions)

## Administrative Tasks (1.5 hours - Non-billable)
- Invoice generation and sending
- New client onboarding call
- Portfolio website updates
- Expense tracking

## Daily Metrics
- **Revenue**: $880
- **Utilization**: 100% (9/9 planned hours)
- **Efficiency**: 83% (7.5 focus / 9 total)
- **Admin Overhead**: 14.3% (1.5/10.5 total time)

## Tomorrow's Plan
- Focus day: Single client (StartupA)
- Deep work: 6 hours continuous
- Target: Feature completion milestone
```

## Advanced Embedding Techniques

### Executive Dashboard

Create a comprehensive business dashboard:

```markdown
# Freelance Business Dashboard - Q1 2024

## Financial Summary
```timesheet
WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
VIEW summary
SIZE detailed
```

## Performance Trends
```timesheet
PERIOD current-year
VIEW chart
CHART trend
SIZE detailed
```

## Budget Projects Status
```timesheet
WHERE year = 2024
VIEW chart
CHART budget
SIZE normal
```

## Monthly Breakdown
```timesheet
PERIOD last-6-months
VIEW table
SIZE detailed
```

## Key Metrics
- **Q1 Revenue**: $28,450
- **Avg Hourly Rate**: $92
- **Utilization**: 78%
- **Client Satisfaction**: 4.8/5
```

### Client Status Report

Automated client reporting with live data:

```markdown
# Client ABC - Monthly Status Report

*Generated: {{date}}*

## Project Overview
```timesheet
WHERE project = "Client ABC" AND year = 2024
VIEW summary
SIZE normal
```

## Budget Consumption
```timesheet
WHERE project = "Client ABC" AND year = 2024
VIEW chart
CHART budget
```

## Recent Activity (Last 30 Days)
```timesheet
WHERE project = "Client ABC" AND date BETWEEN "{{last_30_days_start}}" AND "{{today}}"
VIEW table
SIZE compact
```

## Executive Summary
Based on the data above, the project is progressing well with strong utilization and on-budget performance. Key achievements this month include successful feature deliveries and positive client feedback.

## Next Steps
1. Continue current development pace
2. Schedule mid-month check-in
3. Prepare for final delivery phase
```

### Daily Planning Integration

Embed timesheet data in daily notes:

```markdown
# Daily Note - {{date}}

## Yesterday's Performance
```timesheet
WHERE date = "{{yesterday}}"
VIEW summary
SIZE compact
```

## This Week's Progress
```timesheet
WHERE date BETWEEN "{{week_start}}" AND "{{today}}"
VIEW table
SIZE compact
```

## Today's Plan
- [ ] Complete feature X (Est: 3 hours)
- [ ] Client meeting (1 hour)
- [ ] Code review (1 hour)
- [ ] Documentation update (2 hours)

**Target**: 7 billable hours
**Utilization Goal**: 87.5% (7/8 hours)
```

## Custom Report Templates

### Professional Invoice Template

```markdown
# Invoice #INV-{{MONTH_YEAR | replace(" ", "-")}}
**Client**: {{CLIENT_NAME}}
**Period**: {{MONTH_YEAR}}
**Generated**: {{GENERATION_DATE}}

## Professional Services Summary
This invoice covers professional consulting services provided during {{MONTH_YEAR}} totaling **{{MONTH_HOURS}} hours** of engagement.

## Detailed Timesheet
{{TABLE_PLACEHOLDER}}

## Summary
- **Total Hours**: {{MONTH_HOURS}}
- **Hourly Rate**: ${{HOURLY_RATE}}
- **Subtotal**: ${{SUBTOTAL}}
- **Tax ({{TAX_RATE}}%)**: ${{TAX_AMOUNT}}
- **Total Amount**: ${{TOTAL_AMOUNT}}

## Payment Terms
- **Due Date**: {{DUE_DATE}}
- **Payment Method**: {{PAYMENT_METHOD}}
- **Late Fee**: 1.5% per month on overdue amounts

---
*Thank you for your business. Please remit payment within 30 days.*
```

### Project Completion Report

```markdown
# Project Completion Report - {{PROJECT_NAME}}

**Client**: {{CLIENT_NAME}}
**Period**: {{PROJECT_START}} - {{PROJECT_END}}
**Total Duration**: {{PROJECT_DURATION}} weeks

## Executive Summary
The {{PROJECT_NAME}} project has been successfully completed on {{GENERATION_DATE}}. This report provides a comprehensive overview of the work performed, timeline adherence, and final deliverables.

## Project Metrics
- **Total Hours Invested**: {{MONTH_HOURS}}
- **Budget Utilization**: {{BUDGET_PERCENTAGE}}%
- **Timeline Performance**: {{TIMELINE_STATUS}}
- **Scope Changes**: {{SCOPE_CHANGES}}

## Detailed Work Breakdown
{{TABLE_PLACEHOLDER}}

## Key Achievements
- ✅ All primary objectives delivered
- ✅ Quality standards exceeded
- ✅ Timeline targets met
- ✅ Client satisfaction: {{SATISFACTION_SCORE}}/5

## Lessons Learned
- **What Worked Well**: {{SUCCESSES}}
- **Areas for Improvement**: {{IMPROVEMENTS}}
- **Recommendations**: {{RECOMMENDATIONS}}

## Next Steps
{{NEXT_STEPS}}

---
*This concludes the {{PROJECT_NAME}} engagement. Thank you for the opportunity to contribute to your success.*
```

### Weekly Team Status Template

```markdown
# Team Status Report - Week of {{WEEK_START}}

**Team**: {{TEAM_NAME}}
**Sprint**: {{SPRINT_NAME}}
**Report Generated**: {{GENERATION_DATE}}

## Team Performance Overview
```timesheet
PERIOD last-7-days
VIEW summary
SIZE normal
```

## Individual Contributions
{{TABLE_PLACEHOLDER}}

## Sprint Progress
- **Story Points Completed**: {{COMPLETED_POINTS}}/{{PLANNED_POINTS}}
- **Velocity**: {{CURRENT_VELOCITY}} (Target: {{TARGET_VELOCITY}})
- **Burndown Status**: {{BURNDOWN_STATUS}}

## Blockers & Risks
{{BLOCKERS_LIST}}

## Upcoming Milestones
- **{{MILESTONE_1}}**: {{DATE_1}}
- **{{MILESTONE_2}}**: {{DATE_2}}
- **Sprint Review**: {{REVIEW_DATE}}

## Action Items
{{ACTION_ITEMS}}
```

## Multi-Project Management

### Vault Organization Strategy

For managing multiple clients/projects effectively:

```
📁 Business/
├── 📁 Client-TechCorp-Retainer/
│   ├── .obsidian/
│   │   └── plugins/timesheet-report/
│   ├── Timesheets/
│   ├── Meeting Notes/
│   ├── Deliverables/
│   └── Reports/
├── 📁 Client-StartupXYZ-MVP/
│   ├── .obsidian/
│   ├── Timesheets/
│   ├── Development/
│   ├── Testing/
│   └── Documentation/
├── 📁 Personal-Learning/
│   ├── .obsidian/
│   ├── Timesheets/
│   ├── Courses/
│   └── Projects/
└── 📁 Business-Development/
    ├── .obsidian/
    ├── Timesheets/
    ├── Prospects/
    └── Marketing/
```

### Cross-Vault Reporting

PowerShell script for consolidating reports across vaults:

```powershell
# consolidate-reports.ps1
$vaults = @(
    "C:\Obsidian\Client-TechCorp-Retainer",
    "C:\Obsidian\Client-StartupXYZ-MVP",
    "C:\Obsidian\Personal-Learning"
)

$consolidatedData = @()

foreach ($vault in $vaults) {
    $timesheetPath = Join-Path $vault "Timesheets"
    $files = Get-ChildItem -Path $timesheetPath -Filter "*.md"
    
    foreach ($file in $files) {
        # Extract timesheet data and add to consolidated array
        # Process YAML frontmatter and calculate metrics
    }
}

# Generate consolidated dashboard
# Export to CSV for external analysis
# Create summary report
```

### Project Templates

**Hourly Consulting Template:**

```markdown
# {{CLIENT_NAME}} - Hourly Consulting Setup

## Project Configuration
- **Type**: Hourly/Time & Materials
- **Rate**: ${{HOURLY_RATE}}
- **Hours/Day**: {{DAILY_HOURS}}
- **Start Date**: {{START_DATE}}

## Goals & Objectives
{{OBJECTIVES}}

## Weekly Dashboard
```timesheet
PERIOD current-year
VIEW summary
SIZE normal
```

## Monthly Trends
```timesheet
PERIOD last-6-months
VIEW chart
CHART trend
```
```

## Performance Optimization

### Large Dataset Management

For vaults with extensive timesheet history:

```markdown
# Performance Optimization Checklist

## Archive Strategy
- Move files older than 2 years to `Archive/` folders
- Keep current year + previous year in active `Timesheets/`
- Use date-based folder structure: `Timesheets/2024/03/`

## Embedding Best Practices
- Use specific date filters instead of `PERIOD all-time`
- Limit concurrent embeds on single pages
- Use `SIZE compact` for frequently-viewed pages
- Cache-friendly: Avoid real-time updates in templates

## Settings Optimization
- Set refresh interval to 5-10 minutes for large datasets
- Enable debug mode only when troubleshooting
- Use normalized folder paths in settings
```

### Memory Management

```javascript
// Performance monitoring in console
// Check plugin memory usage
console.log('Timesheet Plugin Memory Usage:', {
    heapUsed: process.memoryUsage().heapUsed / 1024 / 1024,
    charts: document.querySelectorAll('canvas').length,
    embeds: document.querySelectorAll('.timesheet-embed').length
});

// Clear chart cache if needed
if (app.plugins.plugins['timesheet-report']) {
    app.plugins.plugins['timesheet-report'].chartRenderer.clearCache();
}
```

## Troubleshooting Guide

### Common Issues & Solutions

**Issue**: Embedded reports showing "No data found"
```markdown
**Solution Checklist**:
1. Verify timesheet folder path in settings
2. Check YAML frontmatter syntax in files
3. Confirm date format (YYYY-MM-DD)
4. Test with simplified query: `VIEW summary`
5. Enable debug mode for detailed logging
```

**Issue**: Charts not rendering properly
```markdown
**Solution Steps**:
1. Check browser console for JavaScript errors
2. Verify Chart.js library loaded: `window.Chart !== undefined`
3. Clear browser cache and reload
4. Try different chart type: `CHART trend` vs `CHART monthly`
5. Reduce data complexity with date filters
```

**Issue**: Performance problems with large datasets
```markdown
**Optimization Steps**:
1. Archive old timesheet files
2. Use specific date filters in embeds
3. Reduce concurrent embeds per page
4. Increase auto-refresh interval
5. Consider vault splitting for large businesses
```

### Debug Mode Analysis

Enable debug mode and check console output:

```javascript
// Debug information structure
{
  timestamp: "2024-03-15T10:30:00Z",
  operation: "processTimesheetData",
  filesFound: 45,
  entriesProcessed: 238,
  errors: [],
  performance: {
    dataProcessing: "125ms",
    chartRendering: "89ms",
    totalTime: "214ms"
  }
}
```

### Data Validation

Create validation timesheet for testing:

```md
---
tags: [Test, Validation]
hours: 8
worked: true
per-hour: 75
client: ["Test Client"]
work-order: ["Validation Project"]
test-case: "Standard format validation"
---

# Test Timesheet - 2024-03-15

This file validates that the plugin correctly processes standard timesheet formats.

## Expected Results
- Hours: 8
- Rate: $75
- Revenue: $600
- Client: Test Client
- Project: Validation Project

## Validation Checklist
- [x] YAML frontmatter parsed correctly
- [x] Hours extracted and calculated
- [x] Rate applied properly
- [x] Date derived from filename
- [x] Metadata processed completely
```

### Support Resources

- **GitHub Issues**: Report bugs and request features
- **Obsidian Discord**: #plugin-dev channel for community support
- **Documentation**: README.md for quick reference
- **Examples**: This USER_GUIDE.md for detailed scenarios

---

**This user guide covers advanced usage scenarios. For basic setup and configuration, refer to the [README.md](README.md) file.**
