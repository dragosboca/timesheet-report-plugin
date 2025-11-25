# Timesheet Report Plugin Test Vault

This test vault provides comprehensive examples of the three supported project types in the Timesheet Report Plugin. Each directory represents a complete Obsidian vault configured for a specific billing model, complete with realistic timesheet data, settings, and documentation.

## 🏗️ Test Vault Structure

The test vault is organized into three distinct project scenarios:

```
test-vault/
├── hourly-project/          # Time & Materials billing
├── fixed-hours-project/     # Fixed budget with hour limits
├── retainer-project/        # Monthly retainer with allocations
└── README.md               # This file
```

## 📊 Project Type Examples

### 1. Hourly Project (`hourly-project/`)
**Scenario:** Freelance web design for Acme Corp
- **Billing Model:** Time & Materials at $125/hour
- **Use Case:** Traditional hourly billing with detailed time tracking
- **Features Demonstrated:**
  - Flexible hour tracking without budget constraints
  - Client billing and invoice preparation
  - Detailed daily time logs
  - Project milestone tracking

**Sample Data:**
- Daily timesheet entries for web design project
- Client communication logs
- Design iteration tracking
- Billable hour calculations

### 2. Fixed Hours Project (`fixed-hours-project/`)
**Scenario:** Mobile App MVP with 120-hour budget
- **Billing Model:** Fixed scope with hour limitations
- **Use Case:** Project-based work with defined deliverables and budget
- **Features Demonstrated:**
  - Budget tracking and burn rate monitoring
  - Progress reporting against scope
  - Risk management and early warnings
  - Milestone-based deliverables

**Sample Data:**
- Sprint planning with budget allocation
- Daily budget consumption tracking
- Risk assessment and mitigation
- Stakeholder reporting

### 3. Retainer Project (`retainer-project/`)
**Scenario:** Ongoing technical consulting for TechStart
- **Billing Model:** 40 hours/month retainer with rollover
- **Use Case:** Ongoing support and consulting services
- **Features Demonstrated:**
  - Monthly hour allocation management
  - Service category tracking
  - Rollover hour policies
  - Utilization optimization

**Sample Data:**
- Monthly retainer usage tracking
- Service category breakdown
- Emergency support scenarios
- Client relationship management

## 🚀 Getting Started

### Quick Setup
1. **Copy a test vault** to your desired location
2. **Open in Obsidian** as a vault
3. **Install the plugin** (ensure it's in `.obsidian/plugins/`)
4. **Enable the plugin** in Obsidian settings
5. **Start testing** query language features

### Plugin Installation
Each test vault includes the plugin configuration in:
```
.obsidian/plugins/timesheet-report/data.json
```

The settings are pre-configured for each project type with realistic values.

## 📝 Query Language Testing

Each vault provides excellent test data for the query language:

### Basic Queries
```
# View all timesheet data
SHOW hours, invoiced
VIEW table

# Filter by date range
WHERE year = 2024 AND month = 3
SHOW hours, progress
VIEW summary

# Budget tracking (fixed-hours and retainer)
WHERE year = 2024
SHOW hours, progress, remaining
VIEW summary
CHART budget
```

### Advanced Queries
```
# Monthly utilization analysis (retainer)
WHERE year = 2024
SHOW hours, utilization, remaining
VIEW chart
CHART monthly
SIZE detailed

# Project progress tracking (fixed-hours)
WHERE year = 2024
SHOW hours, progress, remaining
VIEW full
CHART trend
PERIOD current-year
```

### Project-Specific Examples

#### Hourly Project Queries
```
# Daily billing summary
WHERE year = 2024 AND month = 1
SHOW hours, invoiced
VIEW table
SIZE detailed

# Client invoice preparation
WHERE project = "Acme Corp Website Redesign"
SHOW hours, invoiced, utilization
VIEW full
PERIOD current-year
```

#### Fixed Hours Project Queries
```
# Budget burn rate analysis
WHERE year = 2024
SHOW hours, progress, remaining
VIEW summary
CHART budget
SIZE compact

# Sprint performance tracking
WHERE year = 2024 AND month = 2
SHOW hours, progress
VIEW chart
CHART trend
```

#### Retainer Project Queries
```
# Monthly utilization review
WHERE year = 2024 AND month = 3
SHOW hours, utilization, remaining
VIEW summary
SIZE detailed

# Service category analysis
WHERE year = 2024
SHOW hours, utilization
VIEW chart
CHART monthly
PERIOD last-6-months
```

## 🛠️ Development Testing

### Plugin Development
Use these vaults for:
- **Feature testing** - Realistic data scenarios
- **Query validation** - Complex query patterns
- **UI testing** - Various project configurations
- **Performance testing** - Different data volumes

### Test Scenarios
Each vault includes edge cases:
- **Hourly Project:** Overtime scenarios, rate changes, client revisions
- **Fixed Hours:** Budget overruns, scope changes, deadline pressures
- **Retainer:** Rollover management, utilization optimization, emergency support

### Data Validation
The test data includes:
- **Valid timesheet entries** in multiple formats
- **Edge case scenarios** (overtime, holidays, corrections)
- **Realistic project progressions** with challenges
- **Client communication patterns** and change requests

## 📋 Plugin Settings Reference

### Common Settings
All vaults include these configured settings:
```json
{
  "currencySymbol": "$",
  "hoursPerWorkday": 8,
  "workdaysPerWeek": 5,
  "dateFormat": "YYYY-MM-DD",
  "timeFormat": "24h",
  "reportOutputPath": "Reports"
}
```

### Project-Type Specific Settings

#### Hourly Projects
```json
{
  "project": {
    "type": "hourly",
    "defaultRate": 125
  }
}
```

#### Fixed Hours Projects
```json
{
  "project": {
    "type": "fixed-hours",
    "budgetHours": 120,
    "defaultRate": 150,
    "deadline": "2024-03-15"
  }
}
```

#### Retainer Projects
```json
{
  "project": {
    "type": "retainer",
    "budgetHours": 40,
    "defaultRate": 175,
    "renewalDate": "2024-04-01"
  }
}
```

## 🎯 Use Cases

### For Plugin Users
- **Learn the query language** with realistic examples
- **Understand project types** and their unique features
- **See best practices** for timesheet organization
- **Test reporting templates** with real data

### For Plugin Developers
- **Test new features** against realistic data
- **Validate query parsing** with complex scenarios
- **Performance test** with various data sizes
- **UI test** different project configurations

### For Contributors
- **Reproduce bugs** with consistent test data
- **Validate fixes** across all project types
- **Test edge cases** with known scenarios
- **Document features** with working examples

## 🔧 Customization

### Adding Your Own Data
1. **Follow the timesheet format** used in daily notes
2. **Maintain project metadata** in frontmatter
3. **Use realistic time entries** for better testing
4. **Include edge cases** to test robustness

### Modifying Settings
1. **Backup existing data.json** before changes
2. **Restart Obsidian** after settings changes
3. **Test query functionality** after modifications
4. **Document any custom configurations**

## 📚 Documentation Examples

Each vault demonstrates:
- **Template usage** for automated reports
- **Query embedding** in notes and dashboards
- **Custom report formats** for different audiences
- **Integration patterns** with other Obsidian plugins

## 🤝 Contributing

To contribute to the test vault:
1. **Add realistic scenarios** that test edge cases
2. **Include diverse timesheet patterns** for parsing tests
3. **Document any new features** with working examples
4. **Maintain consistency** with existing data formats

## 📖 Related Documentation

- [Plugin README](../README.md) - Main plugin documentation
- [Query Language Guide](../docs/query-language.md) - Complete syntax reference
- [API Documentation](../docs/api.md) - Developer integration guide
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute to the project

## 🔍 Troubleshooting

### Common Issues
- **Plugin not loading:** Check `.obsidian/plugins/` directory structure
- **Settings not applied:** Restart Obsidian after configuration changes
- **Query errors:** Validate syntax with simple queries first
- **Missing data:** Ensure frontmatter format matches examples

### Getting Help
- **Check example queries** in each vault for working syntax
- **Refer to error messages** for specific syntax issues
- **Use simple queries first** then build complexity
- **Compare with working examples** when debugging

---

**Happy Testing!** 🎉

These test vaults provide everything you need to explore the full capabilities of the Timesheet Report Plugin across all supported project types.
