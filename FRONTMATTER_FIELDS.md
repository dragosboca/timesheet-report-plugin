# Frontmatter Fields Reference

This document provides a complete reference for the frontmatter fields used by the Timesheet Report Plugin. Understanding these fields is crucial for proper utilization and invoice analysis in your reports.

## Required Fields

### `hours`
- **Type:** Number or String
- **Description:** Total hours worked for the day
- **Examples:**
  ```yaml
  hours: 8
  hours: 6.5
  hours: "7.25"
  ```
- **Notes:** 
  - Must be greater than 0 for the entry to be processed
  - String values will be converted to numbers
  - Used for utilization calculations and invoicing

### `worked`
- **Type:** Boolean
- **Description:** Whether work was performed on this day
- **Default:** `true` (if omitted)
- **Examples:**
  ```yaml
  worked: true   # Working day
  worked: false  # Holiday, sick day, vacation
  ```
- **Notes:** 
  - Set to `false` for non-working days to exclude from calculations
  - When `false`, other fields are ignored

## Rate Fields (in order of precedence)

### `per-hour` (Primary)
- **Type:** Number or String
- **Description:** Hourly rate for this timesheet entry
- **Examples:**
  ```yaml
  per-hour: 75
  per-hour: "85.50"
  ```
- **Notes:** 
  - **This is the preferred field name**
  - Required for accurate invoice analysis graphs

### `rate` (Alternative)
- **Type:** Number
- **Description:** Alternative hourly rate field
- **Example:**
  ```yaml
  rate: 90
  ```

### `hourlyRate` (Alternative)
- **Type:** Number
- **Description:** Camel case alternative rate field
- **Example:**
  ```yaml
  hourlyRate: 100
  ```

### Default Rate Fallback
If no rate is specified in frontmatter, the plugin will use:
- Settings → Project Configuration → Default Hourly Rate
- ⚠️ **Without a rate, invoice calculations will show $0**

## Project Identification Fields (in order of precedence)

### `work-order` (Primary)
- **Type:** String or Array
- **Description:** Project identifier or work order number
- **Examples:**
  ```yaml
  work-order: "Website Redesign"
  work-order: ["Project Alpha", "Phase 2"]
  ```
- **Notes:** 
  - If array, first element is used
  - **This is the preferred field name**

### `client` (Alternative)
- **Type:** String or Array
- **Description:** Client name or identifier
- **Examples:**
  ```yaml
  client: "Acme Corporation"
  client: ["Primary Client", "Secondary Client"]
  ```

### `project` (Fallback)
- **Type:** String
- **Description:** Generic project field
- **Example:**
  ```yaml
  project: "General Consulting"
  ```

## Optional Fields

### `notes`
- **Type:** String
- **Description:** Work notes or description
- **Example:**
  ```yaml
  notes: "Completed API integration and bug fixes"
  ```

### `description`
- **Type:** String
- **Description:** Alternative description field
- **Example:**
  ```yaml
  description: "Development and testing tasks"
  ```

### `duration`
- **Type:** Number
- **Description:** Alternative to `hours` field
- **Example:**
  ```yaml
  duration: 8
  ```

### `date`
- **Type:** String (ISO format)
- **Description:** Explicit date for the timesheet entry
- **Example:**
  ```yaml
  date: "2024-03-15"
  date: "2024-03-15T09:00:00"
  ```
- **Notes:** 
  - Usually not needed if filename contains date
  - Useful for manual date override

## Complete Examples

### Standard Hourly Work
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

### Fixed-Budget Project
```yaml
---
hours: 6.5
worked: true
per-hour: 90
work-order: ["Mobile App", "Phase 1"]
description: "UI development and user testing"
---
```

### Consulting Work with Multiple Clients
```yaml
---
hours: 4
worked: true
per-hour: 125
client: ["Consulting Client A"]
work-order: "Strategy Session"
notes: "Business process analysis and recommendations"
---
```

### Non-Working Day
```yaml
---
worked: false
notes: "Public holiday - Independence Day"
---
```

### Default Rate Example
```yaml
---
hours: 7
worked: true
work-order: "Maintenance Tasks"
# No rate specified - will use default from settings
---
```

## Table Format Support

The plugin also supports timesheet data in markdown tables:

```markdown
---
# Frontmatter can contain default values
worked: true
client: "Multi-Task Client"
---

| Task | Hours | Rate | Notes |
|------|-------|------|-------|
| Development | 4 | 85 | Feature implementation |
| Testing | 2 | 75 | Unit and integration tests |
| Documentation | 2 | 70 | API documentation update |
```

**Table Headers Recognized:**
- Hours: `hour`, `hours`, `time`, `duration`
- Rate: `rate`, `per-hour`
- Notes: `note`, `notes`, `description`, `task`
- Project: `project`, `client`, `work-order`

## Common Issues and Solutions

### Utilization Shows 0%
- ✅ Ensure `hours` field is present and > 0
- ✅ Check that files are in the correct timesheet folder
- ✅ Verify date extraction (filename should contain YYYY-MM-DD)

### Invoice Analysis Shows $0
- ✅ Use `per-hour` field (preferred over `rate`)
- ✅ Set default rate in plugin settings if not in frontmatter
- ✅ Ensure rate values are numeric (not text)

### Project Shows as "Unknown"
- ✅ Use `work-order` or `client` fields
- ✅ Check array syntax if using multiple values
- ✅ Ensure field values are not empty strings

### Files Not Detected
- ✅ Files must be `.md` format
- ✅ Files must be in configured timesheet folder
- ✅ Filename must contain date or frontmatter must have `date` field

## Best Practices

1. **Use Consistent Field Names**
   - Prefer `per-hour` over `rate`
   - Prefer `work-order` over `client` or `project`

2. **Include All Required Data**
   - Always specify `hours` for working days
   - Always specify rate (either in frontmatter or settings default)
   - Include project identification

3. **Use Proper Date Format**
   - Filename: `YYYY-MM-DD-description.md`
   - Or frontmatter: `date: YYYY-MM-DD`

4. **Enable Debug Mode for Troubleshooting**
   - Settings → Debug Mode → Enable
   - Check browser console for `[Timesheet]` messages

5. **Test with Sample Data**
   - Use the provided `sample-timesheet.md` as a template
   - Verify data appears correctly in reports before adding more files

## Validation Checklist

Before expecting accurate reports, verify:

- [ ] Timesheet folder path is correct in settings
- [ ] Files are `.md` format with proper frontmatter
- [ ] `hours` field is present and numeric
- [ ] Rate is specified via `per-hour` or default settings
- [ ] Project identification via `work-order` or `client`
- [ ] Dates are extractable from filename or frontmatter
- [ ] `worked: true` or field omitted for working days
