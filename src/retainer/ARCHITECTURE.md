# Retainer Module Architecture

## Overview

The retainer module is designed as a **completely isolated, optional plugin extension** that can be removed without affecting core functionality.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE PLUGIN                               │
│  (Works independently - no retainer dependencies)            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │   Settings  │  │ Query Engine │  │ Report Generator│    │
│  │             │  │              │  │                 │    │
│  └─────────────┘  └──────────────┘  └─────────────────┘    │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │ Data Extract│  │   Renderer   │  │   View Manager  │    │
│  │             │  │              │  │                 │    │
│  └─────────────┘  └──────────────┘  └─────────────────┘    │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Optional Integration
                            │ (Feature Flag Gated)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              RETAINER MODULE (Optional)                      │
│   src/retainer/ - Can be deleted entirely                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │              index.ts (Public API)               │       │
│  │  - Feature flags                                 │       │
│  │  - isRetainerEnabled()                           │       │
│  │  - Module metadata                               │       │
│  └──────────────────────────────────────────────────┘       │
│                            │                                 │
│          ┌─────────────────┼─────────────────┐             │
│          ▼                 ▼                 ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   api.ts     │  │integration.ts│  │ settings.ts  │     │
│  │              │  │              │  │              │     │
│  │ - RetainerAPI│  │ - Plugin     │  │ - Settings   │     │
│  │ - Contracts  │  │   bridge     │  │   UI         │     │
│  │ - Metrics    │  │ - Data conv. │  │ - Config     │     │
│  │ - Forecasts  │  │ - Reports    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                               │
│  ┌──────────────┐  ┌──────────────────────────────────┐    │
│  │  types.ts    │  │      query/                       │    │
│  │              │  │  ┌──────────────┐                │    │
│  │ - Extensions │  │  │  clauses.ts  │                │    │
│  │ - Type guards│  │  │              │                │    │
│  │ - Interfaces │  │  │ - Query      │                │    │
│  │              │  │  │   handlers   │                │    │
│  └──────────────┘  │  │ - Validators │                │    │
│                    │  │ - Utils      │                │    │
│                    │  └──────────────┘                │    │
│                    └──────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Integration Points

### 1. Feature Flag Check (Entry Point)

```typescript
// Main plugin initialization
if (isRetainerEnabled(settings)) {
  const integration = createRetainerIntegration(plugin);
  // Retainer features now available
}
```

**Coupling:** Minimal - single boolean check  
**Removal:** Delete the if block

---

### 2. Settings Extension (Optional)

```typescript
// Core settings
interface TimesheetReportSettings {
  timesheetFolder: string;
  currencySymbol: string;
  // ... core settings
}

// Extended settings (if retainer enabled)
interface ExtendedTimesheetReportSettings extends TimesheetReportSettings {
  retainer?: RetainerSettingsExtension;  // Optional property
}
```

**Coupling:** Optional property  
**Removal:** Remove `retainer?` property

---

### 3. Query Language Extension (Opt-in)

```typescript
// Core query (always works)
WHERE year = 2024 AND project = "MyProject"

// Retainer query (only if registered)
WHERE year = 2024 AND utilization > 80%
```

**Coupling:** Clause registration  
**Removal:** Don't register retainer clauses

---

### 4. Data Flow (Non-invasive)

```
TimeEntry (Core) → ExtractedTimeEntry (Core) → RetainerUsage (Retainer)
                                                       ↓
                                               Retainer Processing
                                                       ↓
                                               Enhanced Reports
```

**Coupling:** Data transformation layer  
**Removal:** Remove transformation, keep core data

---

## Design Principles

### 1. Zero Core Dependencies
```
❌ BAD: Core imports retainer
import { RetainerAPI } from './retainer';

✅ GOOD: Retainer imports core
import { TimesheetReportPlugin } from '../main';
```

### 2. Feature Flags Everywhere
```typescript
// Every retainer feature is gated
if (isRetainerEnabled(settings)) {
  // Use retainer features
} else {
  // Use core features
}
```

### 3. Graceful Degradation
```typescript
// Retainer module not found? No problem!
try {
  const { RetainerIntegration } = await import('./retainer');
  return new RetainerIntegration(plugin);
} catch {
  return null; // Core functionality continues
}
```

### 4. Self-contained
```
All retainer code lives in src/retainer/
- No scattered files
- No mixed concerns
- Easy to find and delete
```

---

## Module Structure

```
src/retainer/
│
├── index.ts              # Public API & feature flags
│   ├── Exports: Types, functions, classes
│   ├── isRetainerEnabled()
│   ├── shouldLoadRetainerModule()
│   └── Module metadata
│
├── types.ts              # Type extensions (non-invasive)
│   ├── RetainerWhereExtensions
│   ├── RetainerQueryData
│   ├── RetainerEnhancedQuery
│   └── Type guards
│
├── api.ts                # Core retainer logic
│   ├── RetainerAPI class
│   ├── Contract management
│   ├── Metrics calculation
│   ├── Rollover tracking
│   └── Forecasting
│
├── integration.ts        # Bridge to main plugin
│   ├── RetainerIntegration class
│   ├── Entry processing
│   ├── Report generation
│   └── Query enhancement
│
├── settings.ts           # Settings UI
│   ├── RetainerSettingsTab
│   ├── Configuration forms
│   └── Validation
│
├── query/                # Query extensions
│   ├── index.ts          # Query module API
│   └── clauses.ts        # Clause handlers
│       ├── RetainerClauseHandler
│       ├── ServiceClauseHandler
│       ├── UtilizationClauseHandler
│       └── 8 total handlers
│
├── README.md             # Module documentation
└── ARCHITECTURE.md       # This file
```

---

## Data Flow Examples

### Example 1: Basic Time Tracking (No Retainer)

```
User creates timesheet entry
       ↓
Core extracts time data (ExtractedTimeEntry)
       ↓
Core processes query (TimesheetQuery)
       ↓
Core generates report
       ↓
User sees results
```

**Retainer involvement:** None  
**Works without retainer:** ✅ Yes

---

### Example 2: Retainer-Enhanced Tracking

```
User creates timesheet entry with [Development] tag
       ↓
Core extracts time data (ExtractedTimeEntry)
       ↓
RetainerIntegration.processRetainerEntries() (if enabled)
       ↓
Converts to RetainerUsage with service category
       ↓
RetainerAPI tracks against contract
       ↓
Enhanced report with utilization metrics
       ↓
User sees retainer-aware results
```

**Retainer involvement:** Optional processing layer  
**Works without retainer:** ✅ Yes (falls back to basic)

---

### Example 3: Retainer Query

```
User writes: WHERE utilization > 80%
       ↓
Parser encounters "utilization" clause
       ↓
Looks up handler in ClauseHandlerRegistry
       ↓
If retainer registered: UtilizationClauseHandler
If not registered: Parse error (graceful)
       ↓
Query executes with retainer filter
       ↓
Results filtered by utilization threshold
```

**Retainer involvement:** Query clause handler  
**Works without retainer:** Partial (standard queries work)

---

## Removal Impact Analysis

### What Breaks When Removed?

#### ❌ Breaks (Expected)
- Retainer-specific queries (`WHERE utilization > 80%`)
- Retainer views (`VIEW retainer`, `VIEW health`)
- Retainer charts (`CHART service_mix`)
- Rollover tracking
- Service categorization
- Health metrics dashboard

#### ✅ Keeps Working (Core)
- Basic time tracking
- Project filtering (`WHERE project = "X"`)
- Date filtering (`WHERE year = 2024`)
- Standard views (`VIEW summary`, `VIEW chart`, `VIEW table`)
- Standard charts (`CHART monthly`, `CHART trend`, `CHART budget`)
- Report generation
- Invoice calculations
- All core query features

### File Changes Required

```
DELETE:
  src/retainer/                     (entire directory)
  RETAINER-QUERY-EXAMPLES.md

MODIFY:
  src/query/clauses/index.ts        (remove export line)
  src/query/interpreter/interpreter.ts  (remove retainer types)
  src/query/interpreter/executor.ts     (remove retainer filters)

MAYBE MODIFY:
  src/main.ts                       (if retainer init code exists)
  src/settings.ts                   (if retainer settings UI exists)
```

### Lines of Code Removed

```
~450 lines  - api.ts
~470 lines  - integration.ts
~650 lines  - settings.ts
~540 lines  - query/clauses.ts
~320 lines  - types.ts
~180 lines  - index.ts
~240 lines  - README.md
~140 lines  - ARCHITECTURE.md
─────────────────────────────────
~2,990 lines total
```

**Result:** ~3,000 fewer lines, significantly simpler codebase

---

## Testing Strategy

### Before Removal
```bash
npm run build              # Should succeed
npm test                   # All tests pass
```

### After Removal
```bash
npm run build              # Should still succeed
npm test                   # Core tests pass (retainer tests fail - expected)
```

### Manual Testing Checklist
- [ ] Plugin loads without errors
- [ ] Basic queries work
- [ ] Reports generate
- [ ] Charts render
- [ ] Settings panel accessible
- [ ] No console errors

---

## Migration Path (If Needed Later)

If you remove retainer and want it back:

1. **Restore files:** Copy `src/retainer/` from backup/git
2. **Restore exports:** Uncomment in `src/query/clauses/index.ts`
3. **Restore types:** Add back to `TimesheetQuery` interface
4. **Rebuild:** `npm run build`

**Time required:** ~5 minutes

---

## Comparison: With vs Without Retainer

| Aspect | With Retainer | Without Retainer |
|--------|---------------|------------------|
| Lines of code | ~12,000 | ~9,000 |
| Features | 40+ | 25 core |
| Complexity | High | Medium |
| Learning curve | Steep | Gentle |
| Use cases | Retainer contracts | General time tracking |
| Settings panels | 3 | 1 |
| Query clauses | 16+ | 8 core |
| Maintenance | Complex | Simple |
| Target user | Consultant/Agency | Everyone |

---

## Conclusion

The retainer module is architecturally sound and well-isolated. It demonstrates:

✅ **Good isolation** - Can be deleted without breaking core  
✅ **Clear boundaries** - All code in one directory  
✅ **Optional integration** - Feature flag gated  
✅ **Zero coupling** - Core doesn't depend on retainer  
✅ **Easy removal** - Delete folder + update 2-3 imports  

**Recommendation:** If you're unsure about the feature, remove it. You can always add it back later. A simpler plugin is better than a complex plugin you don't fully use.
