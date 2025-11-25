# Utilization Debug Guide

This guide helps you troubleshoot why utilization is not showing up in your timesheet reports.

## Quick Check - Enable Debug Mode

1. **Open Settings:** Settings → Community Plugins → Timesheet Report → Options (gear icon)
2. **Enable Debug Mode:** Turn on "Debug Mode" 
3. **Open Console:** Press F12 or Ctrl+Shift+I (Cmd+Shift+I on Mac)
4. **Refresh Report:** Open the timesheet report view
5. **Check Console:** Look for `[Timesheet]` messages

## What Debug Messages Tell You

### ✅ Good Messages:
```
[Timesheet] Processing /path/to/2024-03-15.md
[Timesheet] Extracted from frontmatter: {hours: 8, rate: 75, project: "Test"}
[Timesheet] March 2024 - Hours: 168, Target: 168, Utilization: 100%
[Timesheet] Trend data generated: {periods: 3, utilization: [75, 85, 100]}
```

### ❌ Problem Messages:
```
[Timesheet] Skipping file.md - no extractable date
[Timesheet] No valid frontmatter entry found
[Timesheet] No valid hours found (hours: 0)
[Timesheet] March 2024 - Hours: 0, Target: 168, Utilization: 0%
```

## Common Issues & Fixes

### 1. All Utilization Shows 0%

**Symptoms:** Charts flat, summary shows 0% utilization
**Debug Check:** Look for messages like "Hours: 0" or "No valid hours found"

**Solutions:**
- ✅ Ensure files have `hours: 8` in frontmatter (not just text)
- ✅ Use `worked: true` (or omit - defaults to true)
- ✅ Check file is in correct timesheet folder

**Example Good Frontmatter:**
```yaml
---
hours: 8
worked: true
per-hour: 75
work-order: "Project Name"
---
```

### 2. Files Not Being Processed

**Symptoms:** Console shows "Skipping file - no extractable date"
**Debug Check:** Count of processed files vs files in folder

**Solutions:**
- ✅ Name files with date: `2024-03-15-daily.md`
- ✅ Or add `date: 2024-03-15` to frontmatter
- ✅ Verify timesheet folder path in settings

### 3. Wrong Utilization Calculation

**Symptoms:** Utilization seems too high/low
**Debug Check:** Look at "Target: X" values in console

**Solutions:**
- ✅ Check "Hours Per Workday" setting (default: 8)
- ✅ Verify working days calculation for your region
- ✅ Ensure you're comparing same time periods

**Manual Check:**
```
Target Hours = Working Days × Hours Per Workday
Utilization % = (Actual Hours ÷ Target Hours) × 100

Example March 2024:
- Working Days: 21 (excluding weekends)
- Hours Per Workday: 8
- Target Hours: 21 × 8 = 168h
- Actual Hours: 140h
- Utilization: (140 ÷ 168) × 100 = 83.3%
```

### 4. Timesheet Folder Issues

**Symptoms:** "No timesheet files found" error
**Debug Check:** Verify folder path in console messages

**Solutions:**
- ✅ Check folder exists: `Timesheets` (case-sensitive)
- ✅ Files must be `.md` format
- ✅ Check folder permissions

## Test Script

Paste this in the browser console to test calculations:

```javascript
// Quick utilization test
const plugin = app.plugins.plugins['timesheet-report'];
if (plugin) {
  console.log('Settings:', {
    folder: plugin.settings.timesheetFolder,
    hoursPerDay: plugin.settings.hoursPerWorkday
  });
  
  // Test March 2024 working days
  const march2024 = new Date(2024, 2, 31).getDate(); // 31 days
  let workingDays = 0;
  for (let day = 1; day <= march2024; day++) {
    const date = new Date(2024, 2, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
  }
  console.log('March 2024 working days:', workingDays);
  console.log('Target hours:', workingDays * (plugin.settings.hoursPerWorkday || 8));
} else {
  console.log('Plugin not found!');
}
```

## Expected File Format

**Filename:** `2024-03-15.md` or `2024-03-15-daily-note.md`

**Content:**
```markdown
---
hours: 8.5
per-hour: 75
work-order: "Client Project"
client: "Acme Corp"
worked: true
---

# Work completed today
- Development tasks
- Client meeting
- Documentation
```

## Validation Checklist

Before expecting utilization data:

- [ ] Debug mode enabled
- [ ] Files in correct folder (`Timesheets` by default)
- [ ] Files named with dates (`YYYY-MM-DD`)
- [ ] Files have `hours: X` in frontmatter (X > 0)
- [ ] Files have `worked: true` (or omit)
- [ ] "Hours Per Workday" setting is correct (8 is typical)
- [ ] Browser console shows processing messages
- [ ] Console shows "Target: X" values > 0

## Still Not Working?

1. **Test with minimal file:**
   ```yaml
   ---
   hours: 8
   worked: true
   ---
   # Test
   ```

2. **Check console for errors:** Any red error messages?

3. **Try different month:** Maybe current month has no complete data?

4. **Restart Obsidian:** Sometimes helps clear caches

5. **Report issue:** Include console logs and sample file when asking for help

## Debug Mode Messages Reference

| Message | Meaning | Action |
|---------|---------|--------|
| `Processing file.md` | File being read | ✅ Good |
| `Skipping - no date` | Can't extract date | Fix filename or add date field |
| `No frontmatter` | Missing --- blocks | Add frontmatter |
| `worked: false` | Marked as non-working | ✅ Good (if intentional) |
| `No valid hours` | hours missing/zero | Add hours: X |
| `Hours: 0, Target: 168` | No time logged | Log some hours! |
| `Utilization: X%` | Calculation result | ✅ Good |

Turn off debug mode after fixing to reduce console noise.
