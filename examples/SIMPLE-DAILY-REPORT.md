# Simple Daily Report - Ready to Use

This is the simplest way to generate a detailed daily report showing hours worked and work orders for the current month.

## Quick Start (3 Steps)

### Step 1: Open Report Generator
- Press `Ctrl/Cmd + P`
- Type "Generate Timesheet Report"
- Press Enter

### Step 2: Copy & Paste This Query

```
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW date AS "Date", project AS "Work Order", task AS "Description", hours AS "Hours Worked"
VIEW table
```

**Note:** Change the dates to your desired month!

### Step 3: Generate
- Click "Current Month" preset (automatically sets dates)
- Name your report: "January 2024 Daily Report"
- Click "Generate Report"

---

## What You'll Get

A report that looks like this:

```
# January 2024 Daily Report

**Period:** 2024-01-01 to 2024-01-31
**Generated:** 2024-02-01

## Summary

- **Total Hours:** 168.00
- **Total Revenue:** €12,600.00
- **Number of Entries:** 22
- **Average Utilization:** 87%

## Detailed Data

| Date | Work Order | Description | Hours Worked |
|------|------------|-------------|--------------|
| 2024-01-02 | WO-12345 | Database optimization | 8.00 |
| 2024-01-03 | WO-12345 | API development | 7.50 |
| 2024-01-04 | WO-12346 | Client meeting | 2.00 |
| 2024-01-05 | WO-12347 | Testing and QA | 8.00 |
...
```

---

## Customize Your Report

### Add More Columns

Want to include rates and amounts?

```
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW date AS "Date", project AS "Work Order", hours AS "Hours", rate FORMAT CURRENCY AS "Rate", invoiced FORMAT MONEY AS "Amount"
VIEW table
```

### Show Only Specific Work Orders

```
WHERE project = "WO-12345"
SHOW date AS "Date", task AS "Description", hours AS "Hours"
VIEW table
```

### Group by Work Order

```
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
SHOW project AS "Work Order", hours AS "Total Hours"
VIEW summary
```

### Last 7 Days

```
WHERE date BETWEEN "2024-01-20" AND "2024-01-27"
SHOW date, project, hours
VIEW table
```

---

## Tips for Daily Tracking

### Format Your Daily Entries Like This

Create a file for each day: `2024-01-15.md`

```markdown
---
date: 2024-01-15
project: WO-12345
hours: 8
rate: 75
---

# Daily Log - January 15, 2024

## Morning (4 hours)
- Fixed bug in user authentication
- Code review for PR #123

## Afternoon (4 hours)
- Client meeting - discussed new features
- Updated documentation
```

### For Multiple Work Orders Per Day

```markdown
---
date: 2024-01-15
---

# Daily Log - January 15, 2024

## WO-12345: Backend Work (5 hours)
- Database optimization
- API endpoints

## WO-12346: Support (2 hours)
- Bug fixes
- Client call

## WO-12347: Documentation (1 hour)
- Updated README
```

The plugin will automatically extract hours and work order info from your entries.

---

## Quick Query Reference

**Basic daily report:**
```
SHOW date, project, hours
```

**With descriptions:**
```
SHOW date, project, task, hours
```

**With money:**
```
SHOW date, project, hours, invoiced FORMAT MONEY
```

**With rates:**
```
SHOW date, project, hours, rate FORMAT CURRENCY
```

**Everything:**
```
SHOW date AS "Date", project AS "Work Order", task AS "Description", hours AS "Hours", rate FORMAT CURRENCY AS "Rate", invoiced FORMAT MONEY AS "Amount"
```

---

## Common Date Ranges

**Current Month:**
```
WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
```

**Last Month:**
```
WHERE date BETWEEN "2023-12-01" AND "2023-12-31"
```

**Quarter 1:**
```
WHERE date BETWEEN "2024-01-01" AND "2024-03-31"
```

**Last 30 Days:**
```
WHERE date BETWEEN "2024-01-01" AND "2024-01-30"
```

**This Week:**
```
WHERE date BETWEEN "2024-01-15" AND "2024-01-21"
```

**Or just click the preset buttons!**
- Current Month
- Last Month
- Last 3 Months
- Current Quarter
- Last 30 Days
- Last 90 Days

---

## That's It!

You're ready to generate daily detailed reports showing:
✅ Every day's work
✅ Work order numbers
✅ Hours worked
✅ Task descriptions
✅ Rates and amounts

**Need help?** Check the other example files in this folder for more advanced features.
