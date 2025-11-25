# Timesheet Report Plugin - Troubleshooting Guide

## Common Issues and Solutions

### 1. Utilization Values Show Zero or Incorrect

**Symptoms:**
- Utilization values in trend chart are flat or show 0%
- Monthly utilization values don't match expected work hours

**Causes & Solutions:**

#### Missing Hours in Frontmatter
Check that your timesheet files have the `hours` field in frontmatter:
```yaml
---
hours: 8
worked: true
per-hour: 75
---
```

#### Incorrect Date Detection
Enable debug mode to see if dates are being extracted properly:
1. Go to Settings → Timesheet Report → Debug Mode → Enable
2. Open Developer Console (Ctrl/Cmd + Shift + I)
3. Refresh the timesheet view
4. Look for `[Timesheet]` log messages

**Expected date formats:**
- Filename: `2024-03-15-daily-note.md`
- Frontmatter: `date: 2024-03-15`
- Path: `Daily Notes/2024/03/15.md`

#### Wrong Hours Per Workday Setting
Verify your "Hours Per Workday" setting matches your actual schedule:
- Settings → Timesheet Report → Hours Per Workday (default: 8)

### 2. Monthly Invoice Analysis Graph is Empty

**Symptoms:**
- Invoice chart shows no data
- Revenue calculations are zero

**Causes & Solutions:**

#### Missing Rate Information
Ensure your timesheet files include rate data in frontmatter:

**Correct formats (in order of preference):**
```yaml
---
per-hour: 75        # Preferred (historical format)
rate: 75            # Alternative
hourlyRate: 75      # Camel case alternative
---
```

#### No Default Rate Set
If individual files don't have rates, set a default:
1. Settings → Timesheet Report → Project Configuration
2. Set "Default Hourly Rate"

#### Array Format Issues
If using arrays in frontmatter, use proper YAML syntax:
```yaml
---
client: ["Acme Corp"]           # ✅ Correct
work-order: "Project Alpha"     # ✅ Also correct
---
```

### 3. Files Not Being Detected

**Symptoms:**
- Timesheet folder seems empty
- Files exist but don't appear in reports

**Solutions:**

#### Check Folder Path
Verify the timesheet folder path in settings:
- Settings → Timesheet Report → Timesheet Folder
- Default: `Timesheets`
- Ensure the folder exists and contains `.md` files

#### Verify File Format
Files must be Markdown (`.md`) with proper frontmatter:
```markdown
---
hours: 8
worked: true
per-hour: 75
---

# Your content here
```

#### Enable Debug Logging
Turn on debug mode to see which files are being processed:
1. Settings → Debug Mode → Enable
2. Check console for `[Timesheet] Processing` messages

### 4. Incorrect Project/Client Detection

**Symptoms:**
- All entries show as "Unknown" project
- Project filtering doesn't work

**Solutions:**

#### Use Correct Frontmatter Fields
The plugin checks fields in this order:
1. `work-order` (preferred)
2. `client` 
3. `project`

```yaml
---
work-order: "Website Project"   # ✅ Best
client: "Acme Corporation"      # ✅ Alternative  
project: "General Work"         # ✅ Fallback
---
```

#### Handle Arrays Properly
If using arrays, the first element is used:
```yaml
---
work-order: ["Main Project", "Sub Project"]  # Uses "Main Project"
client: ["Primary Client"]                   # Uses "Primary Client"
---
```

### 5. Budget Progress Not Showing

**Symptoms:**
- Budget progress bars are missing
- Fixed-hour projects show as hourly

**Solutions:**

#### Configure Project Type
1. Settings → Timesheet Report → Project Configuration
2. Set "Project Type" to "Fixed Hour Budget" or "Retainer"
3. Set "Budget Hours" (required for budget tracking)

#### Verify Project Settings
```
Project Type: Fixed Hour Budget
Budget Hours: 120
```

### 6. Charts Not Loading

**Symptoms:**
- Chart areas show loading or error messages
- Charts appear blank

**Solutions:**

#### Check Internet Connection
Charts require Chart.js library from CDN. Ensure internet access.

#### Browser Console Errors
1. Open Developer Console (F12)
2. Look for JavaScript errors
3. Common fixes:
   - Refresh the page
   - Clear browser cache
   - Disable ad blockers temporarily

### 7. Performance Issues

**Symptoms:**
- Slow loading times
- Obsidian becomes unresponsive
- High memory usage

**Solutions:**

#### Large File Count
If you have many timesheet files:
1. Enable debug mode to see processing times
2. Consider archiving old files to subfolders
3. Reduce auto-refresh interval:
   - Settings → Auto-refresh Interval → Higher value or 0 (disabled)

#### Clear Cache
Force refresh of data:
1. Close timesheet view
2. Disable and re-enable the plugin
3. Reopen timesheet view

## Debugging Steps

### Enable Debug Mode
1. Go to Settings → Timesheet Report
2. Enable "Debug Mode"
3. Open Developer Console (Ctrl/Cmd + Shift + I)
4. Refresh timesheet view
5. Look for `[Timesheet]` messages

### Check Sample File
Create a test file with known good data:
```markdown
---
hours: 8
worked: true
per-hour: 75
work-order: "Test Project"
date: 2024-03-15
---

# Test Entry
This is a test timesheet entry.
```

### Verify Settings
Double-check all plugin settings:
- Timesheet Folder path
- Hours Per Workday
- Project configuration
- Default rates

### Console Commands
In developer console, you can inspect data:
```javascript
// Get current plugin instance
const plugin = app.plugins.plugins['timesheet-report'];

// Check settings
console.log(plugin.settings);

// Check if files are found
// (Replace with your actual folder path)
const folder = app.vault.getAbstractFileByPath('Timesheets');
console.log(folder);
```

## Sample Frontmatter Templates

### Basic Hourly Work
```yaml
---
hours: 8
worked: true
per-hour: 85
work-order: "Client Project"
client: "Acme Corp"
notes: "Development and testing"
---
```

### Fixed Budget Project
```yaml
---
hours: 6.5
worked: true
per-hour: 90
work-order: "Website Redesign"
notes: "UI improvements and bug fixes"
---
```

### Non-Working Day
```yaml
---
worked: false
notes: "Sick day"
---
```

### Multiple Rates/Projects
```yaml
---
hours: 8
worked: true
---

| Task | Hours | Rate | Project |
|------|-------|------|---------|
| Consulting | 4 | 100 | Project A |
| Development | 4 | 80 | Project B |
```

## Getting Help

If you're still experiencing issues:

1. **Check the Console:** Enable debug mode and look for error messages
2. **Create a Minimal Example:** Test with a simple timesheet file
3. **Verify File Paths:** Ensure all folder paths are correct
4. **Update Plugin:** Make sure you're using the latest version
5. **Report Issues:** Include debug logs and sample files when reporting bugs

## Common Error Messages

### "No timesheet files found"
- Check timesheet folder path
- Verify folder exists and contains .md files
- Check file permissions

### "Could not extract date from file"
- Rename files to include date (YYYY-MM-DD format)
- Add `date` field to frontmatter
- Enable debug mode to see date extraction attempts

### "Chart.js library not loaded"
- Check internet connection
- Disable ad blockers
- Try refreshing the page

### "Error processing timesheet data"
- Check for malformed frontmatter
- Look for invalid YAML syntax
- Enable debug mode for detailed error info

Remember to turn off debug mode after troubleshooting to avoid console clutter.
