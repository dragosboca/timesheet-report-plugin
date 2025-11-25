---
# Basic timesheet fields
worked: true          # Set to false for non-working days (holidays, sick days, etc.)
hours: 8              # Total hours worked (required for calculation)
per-hour: 75          # Hourly rate (can also use 'rate' or 'hourlyRate')

# Project information (use arrays or single values)
work-order: "Project Alpha"    # Main project identifier
client: "Acme Corporation"     # Client name (alternative to work-order)

# Optional fields
notes: "Completed documentation and development tasks"
description: "Additional task details"
tags:
  - timesheet
  - billable
---

# Daily Work Log - March 15, 2024

## Tasks Completed

### Documentation (2.5 hours)
- Updated API documentation
- Created user guide sections
- Reviewed and edited existing docs

### Development (4 hours)  
- Implemented new authentication feature
- Fixed bugs in payment processing
- Code review and refactoring

### Testing (1.5 hours)
- Unit tests for new features
- Integration testing
- Bug verification and validation

## Alternative Table Format

You can also include timesheet data in tables (will be parsed automatically):

| Task | Hours | Rate | Notes |
|------|-------|------|-------|
| Documentation | 2.5 | 75 | API docs and guides |
| Development | 4.0 | 75 | Auth feature & bug fixes |
| Testing | 1.5 | 75 | Unit and integration tests |

**Total: 8 hours @ €75/hour = €600**

## Frontmatter Field Reference

### Required Fields
- `hours`: Number of hours worked (number or string)
- `worked`: true/false (defaults to true if omitted)

### Rate Fields (in order of preference)
- `per-hour`: Hourly rate (matches historical format)
- `rate`: Alternative rate field  
- `hourlyRate`: Camel case alternative
- Default rate from plugin settings (if none specified)

### Project Fields (in order of preference)
- `work-order`: Project identifier (string or array)
- `client`: Client name (string or array)  
- `project`: Generic project field

### Optional Fields
- `notes`: Task notes/description
- `description`: Alternative description field
- `duration`: Alternative to `hours`

## Examples

### Hourly Project
```yaml
worked: true
hours: 6.5
per-hour: 85
work-order: "Website Redesign"
client: "Tech Startup Inc"
```

### Fixed-Hour Budget Project
```yaml
worked: true  
hours: 4
per-hour: 90
work-order: ["Mobile App", "Phase 2"]
notes: "Sprint planning and development"
```

### Non-Working Day
```yaml
worked: false
# No hours or rate needed
notes: "Public holiday"
```

### Multiple Formats
```yaml
# Arrays are supported
client: ["Primary Client", "Secondary Client"] 
work-order: ["Project A", "Project B"]

# Or single strings  
client: "Single Client"
work-order: "Single Project"
```
