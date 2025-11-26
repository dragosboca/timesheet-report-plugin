# Retainer Module Removal Guide

**Quick Answer:** If you're unsure about the retainer feature or find it too complex, it's safe to remove. The core timesheet functionality works perfectly without it.

## What is the Retainer Module?

The retainer module adds advanced features for managing retainer-based client contracts:
- Monthly hour allocations and rollover tracking
- Service category breakdowns (development, support, consulting)
- Utilization metrics and health scores
- Contract lifecycle management
- Forecasting and renewal tracking

**Use Case:** Primarily for consultants/agencies who sell pre-paid hour packages to clients.

## Should You Remove It?

### ✅ Remove if:
- You don't work with retainer contracts
- You prefer simple time tracking
- The extra features feel overwhelming
- You're confused about when to use it
- Your workflow is primarily hourly or project-based
- The settings UI feels cluttered

### ❌ Keep if:
- You actively manage retainer contracts with clients
- You need to track unused hours that roll over
- You prepare monthly retainer reports for clients
- You need utilization metrics for capacity planning
- You track different service types (dev vs support)

**When in doubt, remove it.** You can always add it back later.

---

## Step-by-Step Removal

### Step 1: Backup (Optional but Recommended)

```bash
# Create a backup branch
git checkout -b backup-before-retainer-removal
git push origin backup-before-retainer-removal

# Return to main branch
git checkout main
```

### Step 2: Delete the Retainer Directory

```bash
cd src/
rm -rf retainer/
```

Or manually delete: `src/retainer/` (entire folder)

### Step 3: Update Query Clauses Export

File: `src/query/clauses/index.ts`

The file is already prepared for removal. It should look like this:

```typescript
// Clauses Module Index
export * from './base';
export * from './where';
export * from './show';
export * from './aggregation';

// Retainer clauses are in separate module - already removed
```

**Action:** No changes needed - it's already isolated.

### Step 4: Check for Retainer Imports

Search your codebase for any remaining imports:

```bash
# Search for retainer imports
grep -r "from.*retainer" src/

# Search for retainer usage
grep -r "retainer" src/ --include="*.ts" --include="*.tsx"
```

Common places to check:
- `src/main.ts` - Plugin initialization
- `src/settings.ts` - Settings interface
- `src/types.ts` - Type definitions

**Remove any lines importing from retainer:**

```typescript
// DELETE THESE:
import { RetainerIntegration } from './retainer';
import { isRetainerEnabled } from './retainer';
// etc.
```

### Step 5: Clean Up Types (If Needed)

If `src/query/interpreter/interpreter.ts` has retainer types in `TimesheetQuery`:

**Before:**
```typescript
export interface TimesheetQuery {
  where?: {
    year?: number;
    month?: number;
    project?: string;
    service?: string;        // RETAINER
    category?: string;        // RETAINER
    utilization?: number;     // RETAINER
    rollover?: number;        // RETAINER
  };
  view?: 'summary' | 'chart' | 'retainer' | 'health';  // RETAINER VIEWS
  // ... more retainer stuff
}
```

**After:**
```typescript
export interface TimesheetQuery {
  where?: {
    year?: number;
    month?: number;
    project?: string;
    dateRange?: { start: string; end: string };
  };
  view?: 'summary' | 'chart' | 'table' | 'full';
  chartType?: 'trend' | 'monthly' | 'budget';
  period?: 'current-year' | 'all-time' | 'last-6-months' | 'last-12-months';
  size?: 'compact' | 'normal' | 'detailed';
}
```

**Remove:**
- `service`, `category`, `utilization`, `rollover`, `priority` from `where`
- Retainer view types: `'retainer' | 'health' | 'rollover' | 'services' | 'contract' | 'performance' | 'renewal'`
- Retainer chart types: `'service_mix' | 'rollover_trend' | 'health_score'` etc.
- Retainer period types: `'next-month' | 'next-quarter' | 'contract-term'`
- All retainer-specific query properties

### Step 6: Remove Query Executor Filters

File: `src/query/interpreter/executor.ts`

Find and remove retainer-specific filters (around line 150-175):

```typescript
// DELETE THIS SECTION:
if (query.where.service) {
  filtered = filtered.filter(entry =>
    entry.notes?.toLowerCase().includes(query.where!.service!.toLowerCase()) ||
    entry.project?.toLowerCase().includes(query.where!.service!.toLowerCase())
  );
}

if (query.where.category) {
  filtered = filtered.filter(entry =>
    entry.notes?.toLowerCase().includes(query.where!.category!.toLowerCase())
  );
}

if (query.where.utilization !== undefined) {
  // ... utilization filtering code
}
```

### Step 7: Remove Documentation

```bash
# Delete retainer documentation
rm RETAINER-QUERY-EXAMPLES.md
```

### Step 8: Clean Settings (If Extended)

If you added retainer to your settings interface:

File: `src/settings.ts` or `src/types.ts`

```typescript
export interface TimesheetReportSettings {
  // ... core settings ...
  
  // DELETE THIS:
  retainer?: {
    enabled: boolean;
    settings: RetainerSettings;
    contract: RetainerContract;
  };
}
```

Also remove from settings UI if there's a retainer tab.

### Step 9: Build and Test

```bash
# Install dependencies (if needed)
npm install

# Build the plugin
npm run build

# Check for errors
# If build succeeds, you're good!
```

**Test checklist:**
- ✅ Plugin loads in Obsidian
- ✅ Basic timesheet queries work
- ✅ Settings panel opens without errors
- ✅ Reports generate correctly
- ✅ No console errors about missing modules

### Step 10: Commit Changes

```bash
git add -A
git commit -m "Remove retainer module - simplify to core functionality

- Deleted src/retainer/ directory
- Removed retainer types from TimesheetQuery interface
- Removed retainer filters from query executor
- Deleted RETAINER-QUERY-EXAMPLES.md
- Plugin now focuses on core time tracking features"

git push
```

---

## Verification Checklist

After removal, verify everything works:

### Basic Functionality
- [ ] Plugin builds without errors (`npm run build`)
- [ ] Plugin loads in Obsidian without console errors
- [ ] Settings panel opens and displays correctly
- [ ] Basic query works: `WHERE year = 2024`
- [ ] Time entries display correctly

### Query Language
- [ ] `WHERE project = "MyProject"` works
- [ ] `WHERE date BETWEEN "2024-01-01" AND "2024-12-31"` works
- [ ] `SHOW hours, project, date` works
- [ ] `VIEW chart` works
- [ ] `CHART monthly` works

### Reports
- [ ] Monthly reports generate
- [ ] Charts render correctly
- [ ] Tables display properly
- [ ] Budget tracking works (if using fixed-hours projects)

### No Errors
- [ ] No TypeScript compilation errors
- [ ] No console errors in Obsidian developer tools
- [ ] No "cannot find module 'retainer'" errors
- [ ] No undefined property warnings

---

## What Gets Removed?

### Features Lost:
- ❌ Retainer-specific queries (`WHERE utilization > 80%`)
- ❌ Service category tracking
- ❌ Rollover hour management
- ❌ Health metrics and scoring
- ❌ Utilization forecasting
- ❌ Contract lifecycle management
- ❌ Retainer-specific views and charts

### Features Kept:
- ✅ All basic time tracking
- ✅ Project filtering
- ✅ Date range queries
- ✅ Budget tracking (for fixed-hour projects)
- ✅ Standard charts and reports
- ✅ Monthly/yearly summaries
- ✅ Invoice calculations
- ✅ All core query language features

---

## Troubleshooting

### Build Errors After Removal

**Error:** `Cannot find module './retainer'`

**Fix:** Search for remaining imports:
```bash
grep -r "from.*retainer" src/
```
Remove all found imports.

---

**Error:** `Property 'retainer' does not exist on type 'TimesheetQuery'`

**Fix:** Remove retainer properties from query processing code:
- Check `src/query/interpreter/interpreter.ts`
- Check `src/query/interpreter/executor.ts`
- Remove any code accessing `query.retainer`, `query.where.service`, etc.

---

**Error:** `'retainer' is declared but never used`

**Fix:** Remove retainer from type definitions:
- Check `src/types.ts`
- Remove `retainer?:` property from settings interface

---

### Plugin Won't Load

1. Open Obsidian Developer Console (Ctrl+Shift+I / Cmd+Opt+I)
2. Look for red error messages
3. Note the file and line number
4. Check if that file still references retainer code
5. Remove the reference and rebuild

### TypeScript Errors

```bash
# Run TypeScript compiler to see all errors
npx tsc --noEmit
```

Fix each error by removing retainer-related code.

---

## Rollback (If Needed)

If you need to restore the retainer module:

```bash
# If you created a backup branch
git checkout backup-before-retainer-removal

# Or restore from git history
git checkout HEAD~1  # Go back one commit
```

Or clone a fresh copy from your repository before the removal.

---

## Questions?

### "Will this break my existing timesheet data?"
**No.** Your timesheet markdown files are unchanged. Only the plugin's advanced features are removed.

### "Can I add it back later?"
**Yes.** The retainer module is self-contained. You can restore it by copying back the `src/retainer/` directory.

### "Do I need to export my data first?"
**No.** This only removes code, not data. Your timesheet entries remain intact.

### "What about my existing queries with retainer syntax?"
They will fail to parse, but won't crash the plugin. You'll need to update them to standard syntax:
- Change `WHERE service = "development"` → `WHERE project = "development"`
- Change `VIEW retainer` → `VIEW summary` or `VIEW chart`

### "Is this reversible?"
**Yes.** Keep a backup branch before removal, and you can always switch back.

---

## Alternative: Disable Without Removing

If you want to keep the code but disable the feature:

1. Don't delete any files
2. In settings, set project type to `hourly` or `fixed-hours` (not `retainer`)
3. Set `retainer.enabled = false`
4. The feature won't load, but code remains for future use

**Pros:** Easy to re-enable later  
**Cons:** Code still takes up space and adds maintenance burden

---

## Summary

1. ✅ Delete `src/retainer/` directory
2. ✅ Remove retainer imports from other files
3. ✅ Clean up retainer types from `TimesheetQuery`
4. ✅ Remove retainer filters from query executor
5. ✅ Delete `RETAINER-QUERY-EXAMPLES.md`
6. ✅ Build and test
7. ✅ Commit changes

**Result:** A simpler, more focused timesheet plugin that does one thing well - track your time.

---

**Remember:** There's no shame in simplifying. A tool that's too complex for your needs is worse than a simple tool that works perfectly for your workflow.
