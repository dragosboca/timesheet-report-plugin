# Retainer Module

**Status:** 🧪 Experimental | ⚠️ Optional Feature

This module provides advanced retainer project management features for the Timesheet Report Plugin. It is completely isolated from core functionality and can be safely removed.

## ⚠️ Important Notice

**This feature is experimental and may be removed in future versions.**

The retainer module was created to support sophisticated retainer contract management, but the use-case and workflow may be too complex for most users. If you find this feature adds unnecessary complexity, follow the removal instructions below.

## What is a Retainer Project?

A retainer is a service agreement where clients pre-purchase a set number of hours per month. This module tracks:

- **Monthly hour allocations** - Track available vs. used hours
- **Rollover management** - Unused hours that carry forward
- **Service categorization** - Different types of work (development, support, consulting)
- **Health metrics** - Utilization rates, response times, satisfaction scores
- **Forecasting** - Project future usage and budget health
- **Contract lifecycle** - Renewal tracking and performance analysis

## Module Structure

```
src/retainer/
├── README.md           # This file
├── index.ts            # Public API and feature flags
├── api.ts              # Core retainer API and data structures
├── integration.ts      # Plugin integration layer
├── settings.ts         # Settings UI components
└── query/              # Query language extensions
    ├── index.ts        # Query module exports
    └── clauses.ts      # Retainer-specific query clauses
```

## Usage

### Enabling Retainer Features

1. Set project type to `retainer` in settings
2. Enable retainer features in plugin settings
3. Configure contract details (client, hours, rates)
4. The module will automatically load

### Query Language Extensions

When enabled, retainer adds new query clauses:

```sql
-- Check utilization status
WHERE utilization > 80%

-- Filter by service category
WHERE service = "development"

-- Analyze rollover hours
SHOW rollover, utilization
VIEW retainer

-- Health metrics
VIEW health
CHART service_mix
```

See `RETAINER-QUERY-EXAMPLES.md` for comprehensive examples.

### Programmatic Usage

```typescript
import { 
  isRetainerEnabled, 
  RetainerIntegration,
  RetainerAPI 
} from './retainer';

// Check if retainer is enabled
if (isRetainerEnabled(settings)) {
  const integration = new RetainerIntegration(plugin);
  const report = integration.generateRetainerReport('monthly');
}
```

## Architecture

### Design Principles

1. **Zero Core Coupling** - Core features work without retainer module
2. **Opt-in Only** - Must be explicitly enabled
3. **Graceful Degradation** - Plugin works if retainer is disabled/removed
4. **Clear Boundaries** - All code contained in this directory
5. **Self-contained** - No scattered dependencies

### Integration Points

The module integrates with core through:

1. **Settings Extension** - `ExtendedTimesheetReportSettings` interface
2. **Query Clauses** - Registered via `ClauseHandlerRegistry`
3. **Plugin Commands** - Added via `plugin.addCommand()`
4. **Data Extraction** - Consumes `ExtractedTimeEntry` from core

These integration points are minimal and can be easily removed.

## 🗑️ How to Remove This Feature

If the retainer workflow is too complex or not needed:

### Step 1: Delete the Module

```bash
# Delete the entire retainer directory
rm -rf src/retainer/
```

### Step 2: Remove Imports

Search for and remove any imports from `retainer`:

```typescript
// Remove lines like these:
import { ... } from './retainer';
import { ... } from '../retainer';
```

Common files that might have retainer imports:
- `src/main.ts` (plugin initialization)
- `src/query/clauses/index.ts` (already prepared for removal)
- `src/settings.ts` (if extended settings were used)

### Step 3: Remove Documentation

```bash
# Remove retainer-specific documentation
rm RETAINER-QUERY-EXAMPLES.md
```

### Step 4: Clean Settings Type

If using TypeScript, you may need to update settings type:

```typescript
// In src/settings.ts or types.ts
export interface TimesheetReportSettings {
  // Remove retainer property if it exists
  // retainer?: { ... }  // DELETE THIS
}
```

### Step 5: Test

```bash
npm run build
# Verify the plugin builds successfully
# Test basic timesheet functionality
```

### Step 6: (Optional) Remove from Version Control

```bash
git rm -r src/retainer/
git rm RETAINER-QUERY-EXAMPLES.md
git commit -m "Remove retainer feature - workflow too complex"
```

## Verification Checklist

After removal, verify:

- ✅ Plugin builds without errors
- ✅ Basic timesheet queries work
- ✅ Settings panel loads
- ✅ Reports generate correctly
- ✅ No console errors about missing retainer modules

## Why You Might Want to Remove This

**Reasons to remove:**
- ❌ Adds significant complexity (1000+ lines of code)
- ❌ Use-case is unclear or not applicable
- ❌ Most users don't work with retainer contracts
- ❌ Maintenance burden for experimental feature
- ❌ Settings UI becomes cluttered
- ❌ Query language becomes harder to learn

**Reasons to keep:**
- ✅ You manage retainer-based client contracts
- ✅ You need rollover hour tracking
- ✅ You track multiple service categories
- ✅ You need utilization metrics and forecasting
- ✅ You prepare formal monthly client reports

## Feature Comparison

| Feature | With Retainer | Without Retainer |
|---------|--------------|------------------|
| Time tracking | ✅ | ✅ |
| Project filtering | ✅ | ✅ |
| Basic reports | ✅ | ✅ |
| Charts | ✅ | ✅ |
| Budget tracking | ✅ | ✅ |
| Rollover hours | ✅ | ❌ |
| Service categories | ✅ | ❌ |
| Utilization metrics | ✅ | ❌ |
| Health scoring | ✅ | ❌ |
| Contract lifecycle | ✅ | ❌ |
| Forecasting | ✅ | ❌ |

## Future Considerations

If you decide to keep this feature:

### Improvements Needed
1. Better documentation of use-cases
2. Simplified settings UI
3. Example templates and workflows
4. Video tutorials
5. Migration from simple projects

### Simplification Options
1. Extract just rollover tracking (simpler use-case)
2. Remove complex metrics (keep basic tracking)
3. Separate into a dedicated plugin
4. Make it a premium/enterprise feature

## Support

This is an experimental feature with limited support. Consider:

1. **Keep it simple** - Use only basic retainer tracking
2. **Document your workflow** - Create your own guide
3. **Contribute improvements** - PRs welcome
4. **Or remove it** - No shame in simplifying!

---

**Remember:** The core timesheet functionality is solid. The retainer module is an optional experiment. Choose what works for your workflow.
