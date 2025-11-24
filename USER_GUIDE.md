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
tags: [Daily]
hours: 8.5
worked: true
per-hour: 85
client:
  - "Client A"
work-order:
  - "Website Redesign"
---

# Multi-Client Work Day - 2024-03-15

## Work Summary
- **Hours**: 8.5
- **Rate**: $85/hr
- **Total**: $722.50
- **Client**: Client A
- **Project**: Website Redesign

## Tasks Completed
- UI Design (3 hours)
- Client Review (1.5 hours) 
- Revisions (1 hour)
- API Development (2 hours)
- Testing (1 hour)

## Notes
Multiple tasks across different project areas. Good productivity day with client feedback incorporated.
```

### Time Tracking with Breaks

Detailed time tracking including non-billable time:

```md
---
tags: [Daily]
hours: 6.5
worked: true
per-hour: 75
client:
  - "Client ABC"
work-order:
  - "Platform Development"
---

# Platform Development - 2024-03-15

## Work Summary
- **Hours**: 6.5
- **Rate**: $75/hr
- **Total**: $487.50
- **Client**: Client ABC
- **Project**: Platform Development

## Tasks Completed
- Client consultation and requirements review
- Backend development and API endpoints
- Team meetings and project coordination
- Technical documentation updates

## Notes
Productive day with good progress on platform features. Client meeting went well with positive feedback on current direction.
```

### Project Milestone Tracking

For budget projects with milestone tracking:

```md
---
tags: [Daily]
hours: 7
worked: true
per-hour: 90
client:
  - "Startup XYZ"
work-order:
  - "MVP Development"
---

# MVP Development - Sprint 3 Final - 2024-03-15

## Work Summary
- **Hours**: 7
- **Rate**: $90/hr
- **Total**: $630
- **Client**: Startup XYZ
- **Project**: MVP Development

## Today's Accomplishments
- User authentication flow implementation
- Database migration scripts
- API endpoint testing
- UI Polish and refinements

## Notes
Sprint 3 final day - good progress on MVP features. Authentication system is working well and testing is showing positive results.
```

## Project Workflow Examples

### Agile Development Workflow

**Sprint Planning Integration:**

```md
---
tags: [Daily]
hours: 8
worked: true
per-hour: 85
client:
  - "Client XYZ"
work-order:
  - "User Profile Enhancement"
---

# User Profile Enhancement - 2024-03-15

## Work Summary
- **Hours**: 8
- **Rate**: $85/hr
- **Total**: $680
- **Client**: Client XYZ
- **Project**: User Profile Enhancement

## Tasks Completed
- Profile photo upload functionality
- Email preferences system
- Privacy settings implementation (partial)

## Notes
Good progress on user profile features. Photo upload is working well, email preferences are complete. Privacy settings need another 2-3 hours tomorrow.
```

### Client Consulting Workflow

**Weekly Client Retainer:**

```md
---
tags: [Consulting]
hours: 6
worked: true
per-hour: 120
client:
  - "Acme Company"
work-order:
  - "Strategic Advisory"
---

# Acme Company Strategic Advisory - 2024-03-15

## Work Summary
- **Hours**: 6
- **Rate**: $120/hr
- **Total**: $720
- **Client**: Acme Company
- **Project**: Strategic Advisory

## Focus Areas

### Technology Architecture Review
- Evaluated current microservices setup
- Identified scalability bottlenecks  
- Proposed migration to event-driven architecture

### Team Process Optimization
- Facilitated Agile retrospective
- Implemented new CI/CD pipeline
- Coached team leads on sprint planning

## Deliverables
- Architecture assessment document
- Process improvement roadmap
- Technology stack recommendations (draft)

## Next Steps
- Finalize technology recommendations
- Budget planning for Q2 initiatives
- Team training session on new processes
```

### Freelance Business Workflow

**Multi-Client Day Management:**

```md
---
tags: [Daily]
hours: 9
worked: true
per-hour: 95
client:
  - "ClientA"
  - "ClientB" 
  - "ClientC"
work-order:
  - "Mobile App"
  - "API Integration"
  - "Website Maintenance"
---

# Multi-Client Freelance Day - 2024-03-15

## Work Summary
- **Total Hours**: 9
- **Average Rate**: $95/hr
- **Total Revenue**: $855
- **Clients**: 3 different projects

## Project Breakdown
- **Mobile App Development** (4 hours): Core feature implementation
- **API Integration** (3 hours): Backend service connections  
- **Website Maintenance** (2 hours): Updates and bug fixes

## Notes
Productive multi-client day with good progress across all projects. Mobile app features are coming together well, API integration is on schedule, and website maintenance completed successfully.

## Tomorrow's Plan
- Focus on single client (StartupA) for deeper work session
- Target: Complete remaining mobile app features
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
├── 📁 Client-ABC-Retainer/
│   ├── .obsidian/
│   │   └── plugins/timesheet-report/
│   ├── Timesheets/
│   ├── Meeting Notes/
│   ├── Deliverables/
│   └── Reports/
├── 📁 Client-XYZ-MVP/
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

**Bash script** for consolidating reports across vaults:

```bash
#!/bin/bash
# consolidate-reports.sh

declare -a vaults=(
    "$HOME/Documents/Obsidian/Client-ABC-Retainer"
    "$HOME/Documents/Obsidian/Client-XYZ-MVP" 
    "$HOME/Documents/Obsidian/Personal-Learning"
)

output_file="consolidated-timesheet-data.csv"
echo "Date,Hours,Rate,Client,Project,Vault" > "$output_file"

for vault in "${vaults[@]}"; do
    timesheet_path="$vault/Timesheets"
    if [[ -d "$timesheet_path" ]]; then
        find "$timesheet_path" -name "*.md" | while read -r file; do
            # Extract YAML frontmatter and append to CSV
            vault_name=$(basename "$vault")
            echo "Processing: $file -> $vault_name"
        done
    fi
done

echo "Consolidated data saved to: $output_file"
```

**Python script** for advanced analysis:

```python
#!/usr/bin/env python3
# consolidate_reports.py

import os
import yaml
import csv
from pathlib import Path
import re

vaults = [
    Path.home() / "Documents/Obsidian/Client-ABC-Retainer",
    Path.home() / "Documents/Obsidian/Client-XYZ-MVP",
    Path.home() / "Documents/Obsidian/Personal-Learning"
]

def extract_yaml_frontmatter(file_path):
    """Extract YAML frontmatter from markdown file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find YAML frontmatter
    match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if match:
        try:
            return yaml.safe_load(match.group(1))
        except yaml.YAMLError:
            return {}
    return {}

consolidated_data = []

for vault in vaults:
    timesheet_path = vault / "Timesheets"
    if timesheet_path.exists():
        for file_path in timesheet_path.glob("*.md"):
            frontmatter = extract_yaml_frontmatter(file_path)
            
            if frontmatter.get('hours'):
                consolidated_data.append({
                    'date': file_path.stem,
                    'hours': frontmatter.get('hours', 0),
                    'rate': frontmatter.get('per-hour', 0),
                    'client': frontmatter.get('client', ['Unknown'])[0],
                    'project': frontmatter.get('work-order', ['Unknown'])[0],
                    'vault': vault.name
                })

# Export to CSV
with open('consolidated-timesheet-data.csv', 'w', newline='') as csvfile:
    fieldnames = ['date', 'hours', 'rate', 'client', 'project', 'vault']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    writer.writeheader()
    for row in consolidated_data:
        writer.writerow(row)

print(f"Consolidated {len(consolidated_data)} timesheet entries")
```

**Node.js script** for JavaScript/TypeScript users:

```javascript
#!/usr/bin/env node
// consolidate-reports.js

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml'); // npm install js-yaml

const vaults = [
    path.join(process.env.HOME, 'Documents/Obsidian/Client-ABC-Retainer'),
    path.join(process.env.HOME, 'Documents/Obsidian/Client-XYZ-MVP'),
    path.join(process.env.HOME, 'Documents/Obsidian/Personal-Learning')
];

function extractYamlFrontmatter(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    
    if (match) {
        try {
            return yaml.load(match[1]);
        } catch (e) {
            return {};
        }
    }
    return {};
}

const consolidatedData = [];

vaults.forEach(vault => {
    const timesheetPath = path.join(vault, 'Timesheets');
    
    if (fs.existsSync(timesheetPath)) {
        const files = fs.readdirSync(timesheetPath)
            .filter(file => file.endsWith('.md'));
        
        files.forEach(file => {
            const filePath = path.join(timesheetPath, file);
            const frontmatter = extractYamlFrontmatter(filePath);
            
            if (frontmatter.hours) {
                consolidatedData.push({
                    date: path.parse(file).name,
                    hours: frontmatter.hours || 0,
                    rate: frontmatter['per-hour'] || 0,
                    client: frontmatter.client ? frontmatter.client[0] : 'Unknown',
                    project: frontmatter['work-order'] ? frontmatter['work-order'][0] : 'Unknown',
                    vault: path.basename(vault)
                });
            }
        });
    }
});

// Export to CSV
const csvContent = [
    'Date,Hours,Rate,Client,Project,Vault',
    ...consolidatedData.map(row => 
        `${row.date},${row.hours},${row.rate},${row.client},${row.project},${row.vault}`
    )
].join('\n');

fs.writeFileSync('consolidated-timesheet-data.csv', csvContent);
console.log(`Consolidated ${consolidatedData.length} timesheet entries`);
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

### Theme Integration & Style Settings

**Using Style Settings Plugin for Advanced Customization:**

1. **Install Style Settings Plugin**:
   - Go to Settings → Community Plugins
   - Search for "Style Settings" and install
   - Enable the plugin

2. **Access Timesheet Report Customization**:
   - Go to Settings → Style Settings
   - Find "Timesheet Report" section
   - Expand to see all customization options

3. **Available Customizations**:
   ```
   Chart Colors:
   ├── Primary Color (Hours) - Main data color
   ├── Secondary Color (Utilization) - Trend lines
   ├── Success Color (Revenue) - Positive metrics
   └── Accent Color (Budget) - Additional data
   
   Interface:
   ├── Summary Card Border Radius - 0-20px
   ├── Default Chart Height - 200-500px
   └── Embed Spacing - 5-30px
   ```

4. **Theme-Aware Color Schemes**:
   ```css
   Light Theme Example:
   --timesheet-color-primary: #4f81bd     /* Professional blue */
   --timesheet-color-secondary: #c0504d   /* Warning red */
   --timesheet-color-tertiary: #9bbb59    /* Success green */
   --timesheet-color-quaternary: #8064a2  /* Accent purple */
   
   Dark Theme Example:
   --timesheet-color-primary: #6496dc     /* Bright blue */
   --timesheet-color-secondary: #dc6464   /* Soft red */
   --timesheet-color-tertiary: #96c864    /* Bright green */
   --timesheet-color-quaternary: #aa82be  /* Soft purple */
   ```

5. **Creating Custom Color Schemes**:
   - **Business Professional**: Blues and grays
   - **High Contrast**: Strong color differences
   - **Minimal**: Muted, subtle colors
   - **Brand Colors**: Match your company colors

**Manual Color Configuration** (without Style Settings):
```markdown
# Timesheet Report Settings
Settings → Timesheet Report → Appearance

1. Disable "Use Style Settings for Colors"
2. Set manual hex colors:
   - Primary Color: #your-brand-color
   - Secondary Color: #accent-color
   - Success Color: #success-color
   - Accent Color: #additional-color
```

### Performance Optimization

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
- Enable Style Settings for better theme integration
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
6. Use Style Settings for better rendering performance
```

**Issue**: Charts don't match theme colors
```markdown
**Solution Steps**:
1. Install Style Settings plugin
2. Enable "Use Style Settings for Colors" in plugin settings
3. Customize colors in Settings → Style Settings → Timesheet Report
4. Colors will automatically update when theme changes
5. For manual control, disable Style Settings integration
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
