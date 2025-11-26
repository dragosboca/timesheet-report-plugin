# Retainer Module - Quick Reference

## TL;DR

**What is it?** An optional feature for managing retainer-based client contracts.

**Do I need it?** Probably not. Only if you sell pre-paid hour packages to clients.

**Can I remove it?** Yes. See "Quick Removal" below.

---

## Quick Decisions

### ❓ Should I Keep It?

**YES, keep it if:**
- ✅ You manage retainer contracts (pre-paid monthly hours)
- ✅ You need to track unused hours that roll over
- ✅ You prepare monthly retainer reports for clients
- ✅ You track different service types (dev, support, consulting)

**NO, remove it if:**
- ❌ You do hourly or project-based billing
- ❌ You don't understand what a retainer is
- ❌ The feature feels too complex
- ❌ You just want simple time tracking

**When in doubt → REMOVE IT**

---

## Quick Removal (2 minutes)

```bash
# 1. Delete the module
rm -rf src/retainer/

# 2. Delete documentation
rm RETAINER-QUERY-EXAMPLES.md
rm RETAINER_REMOVAL_GUIDE.md
rm RETAINER_QUICK_REFERENCE.md

# 3. Build
npm run build

# Done! ✅
```

**Detailed steps:** See `RETAINER_REMOVAL_GUIDE.md`

---

## Quick Enable (If You Want To Try It)

1. **Settings** → Set project type to `retainer`
2. **Configure** → Add client name, monthly hours, hourly rate
3. **Tag entries** → Use `[Development]`, `[Support]` tags
4. **Query** → Try `WHERE utilization > 80%`

**Full guide:** See `src/retainer/README.md`

---

## File Structure

```
src/retainer/           ← DELETE THIS to remove feature
├── index.ts            (Public API)
├── api.ts              (Core logic)
├── integration.ts      (Plugin bridge)
├── settings.ts         (Settings UI)
├── types.ts            (Type definitions)
└── query/
    ├── clauses.ts      (Query handlers)
    └── index.ts        (Query API)
```

**To remove:** Delete `src/retainer/` directory.

---

## What You Lose By Removing

### Features Lost ❌
- Rollover hour tracking
- Service category breakdown (dev/support/consulting)
- Utilization metrics and health scores
- Contract lifecycle management
- Forecasting and renewal tracking
- Retainer-specific queries and views

### Features Kept ✅
- All basic time tracking
- Project filtering and reports
- Budget tracking (for fixed-hour projects)
- Standard charts and summaries
- All core query language features
- Invoice calculations

**Bottom line:** You keep 95% of functionality, lose 5% specialized features.

---

## Quick Examples

### Retainer Query (Only works if module enabled)
```sql
-- Check high utilization
WHERE utilization > 80%

-- Filter by service type
WHERE service = "development"

-- Retainer dashboard
VIEW retainer
CHART service_mix
```

### Standard Query (Always works)
```sql
-- Basic time tracking
WHERE year = 2024 AND project = "MyProject"

-- Monthly summary
VIEW summary
CHART monthly
```

---

## Decision Tree

```
Do you work with retainer contracts?
├─ YES → Do you need rollover tracking?
│        ├─ YES → KEEP IT
│        └─ NO → MAYBE REMOVE (rollover is main benefit)
│
└─ NO → Do you want to learn about retainers?
         ├─ YES → KEEP IT for now, try it out
         └─ NO → REMOVE IT (simplify your life)
```

---

## Common Questions

**Q: Will removing it break my timesheet data?**  
A: No. Your markdown files are untouched.

**Q: Can I add it back later?**  
A: Yes. Restore from git: `git checkout <commit> -- src/retainer/`

**Q: How much code am I removing?**  
A: ~3,000 lines (about 25% of the plugin).

**Q: Will it make the plugin faster?**  
A: Slightly. Smaller bundle, less to load.

**Q: Is this feature stable?**  
A: It's experimental. Use at your own risk.

**Q: What's a retainer anyway?**  
A: A pre-paid monthly hour package. Client pays $X/month for Y hours.

---

## Support

**If keeping:**
- Read: `src/retainer/README.md`
- Examples: `RETAINER-QUERY-EXAMPLES.md`
- Architecture: `src/retainer/ARCHITECTURE.md`

**If removing:**
- Guide: `RETAINER_REMOVAL_GUIDE.md`
- Help: Check for compile errors after deletion
- Rollback: `git checkout HEAD~1` (if you committed)

---

## Status Check

**Where is it?**
- Code: `src/retainer/` directory
- Docs: `RETAINER-*.md` files
- Integrated: Optional (feature flag gated)

**Is it used?**
```bash
# Check if enabled in your settings
cat .obsidian/plugins/timesheet-report/data.json | grep '"type":"retainer"'

# Found → It's enabled
# Not found → It's disabled (safe to remove)
```

---

## One-Liner Decision

**If you have to Google "what is a retainer contract" → Remove it.**

---

**Last Updated:** After refactoring (2024)  
**Build Status:** ✅ Compiles successfully  
**Removal Time:** 2 minutes  
**Restore Time:** 5 minutes  
**Complexity:** High (that's why removal is an option!)
