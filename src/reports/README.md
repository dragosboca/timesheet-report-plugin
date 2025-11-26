# Reports Package

This package provides comprehensive report generation, template management, and file operations for the Timesheet Report Plugin.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Core Components](#core-components)
- [Usage Examples](#usage-examples)
- [Report Types](#report-types)
- [Template System](#template-system)
- [API Reference](#api-reference)
- [Extending the System](#extending-the-system)

---

## Overview

The reports package is responsible for:

- **Report Generation**: Creating formatted reports from timesheet data
- **Template Management**: Loading, processing, and managing report templates
- **File Operations**: Saving reports to the vault with proper organization
- **Modal Interfaces**: User-friendly UI for report configuration

### Package Structure

```
src/reports/
├── index.ts                      # Public API exports
├── README.md                     # This file
├── ReportGenerator.ts            # Main report generation logic
├── ReportSaver.ts                # File saving operations
├── TemplateManager.ts            # Template processing
├── types/
│   ├── index.ts                  # Type exports
│   ├── ReportTypes.ts            # Report-specific types
│   └── TemplateTypes.ts          # Template-specific types
└── modals/
    └── IntervalReportModal.ts    # Interval report UI
```

---

## Architecture

### Design Principles

1. **Separation of Concerns**: Each component has a single, well-defined responsibility
2. **Type Safety**: Comprehensive TypeScript types throughout
3. **Composability**: Components can be used independently or together
4. **Extensibility**: Easy to add new report types and templates

### Component Relationships

```
┌─────────────────────┐
│ IntervalReportModal │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ReportGenerator    │◄───────┐
└──────────┬──────────┘        │
           │                    │
           ├──────────┐         │
           ▼          ▼         │
┌──────────────┐  ┌──────────────┐
│TemplateManager│  │ ReportSaver  │
└──────────────┘  └──────────────┘
```

---

## Core Components

### ReportGenerator

**Purpose**: Orchestrates report generation process

**Responsibilities**:
- Query execution and data processing
- Template selection and processing
- Report content generation
- Coordination between components

**Key Methods**:
```typescript
generateIntervalReport(
  startDate: string,
  endDate: string,
  query: TimesheetQuery,
  reportName: string,
  templatePath?: string
): Promise<TFile>

getAvailableMonths(): Promise<MonthData[]>
getAvailableTemplates(): Promise<TFile[]>
validateTemplate(templatePath: string): Promise<boolean>
```

### TemplateManager

**Purpose**: Handles all template operations

**Responsibilities**:
- Loading templates from vault
- Processing placeholder substitution
- Managing template metadata
- Creating sample templates

**Key Methods**:
```typescript
getAvailableTemplates(): Promise<TFile[]>
getTemplateContent(templatePath?: string): Promise<string>
replaceIntervalTemplateValues(
  templateContent: string,
  table: string,
  data: ProcessedData,
  reportName: string,
  startDate: string,
  endDate: string
): string
replaceTemplateValues(
  templateContent: string,
  table: string,
  totalHours: number,
  year: number,
  month: number
): string
createSampleTemplate(templateName: string): Promise<TFile>
getAvailablePlaceholders(): TemplatePlaceholder[]
```

### ReportSaver

**Purpose**: Manages file system operations for reports

**Responsibilities**:
- Validating output folder configuration
- Creating necessary folder structure
- Saving reports to vault
- Managing existing reports

**Key Methods**:
```typescript
saveIntervalReport(reportName: string, content: string): Promise<TFile>
getAllReports(): Promise<TFile[]>
validateOutputFolder(): Promise<ValidationResult>
```

### IntervalReportModal

**Purpose**: Provides UI for interval report generation

**Responsibilities**:
- Date range selection (presets and custom)
- Query editor with presets
- Template selection
- Report preview
- Report name configuration

---

## Usage Examples

### Basic Report Generation

```typescript
import { ReportGenerator } from './reports';
import { parseQuery } from './query';

// Create generator
const generator = new ReportGenerator(plugin);

// Define query
const query = parseQuery(`
  WHERE date BETWEEN "2024-01-01" AND "2024-01-31"
  SHOW project, date, hours, invoiced
  VIEW table
`);

// Generate report
const reportFile = await generator.generateIntervalReport(
  '2024-01-01',
  '2024-01-31',
  query,
  'January 2024 Report'
);
```

### Using Custom Templates

```typescript
import { ReportGenerator } from './reports';

const generator = new ReportGenerator(plugin);

// List available templates
const templates = await generator.getAvailableTemplates();
console.log('Available templates:', templates.map(t => t.name));

// Generate report with template
const reportFile = await generator.generateIntervalReport(
  '2024-01-01',
  '2024-01-31',
  query,
  'Q1 2024 Client Report',
  'Templates/client-report-template.md'
);
```

### Working with Templates Directly

```typescript
import { TemplateManager } from './reports';

const templateManager = new TemplateManager(plugin);

// Get available placeholders
const placeholders = templateManager.getAvailablePlaceholders();
placeholders.forEach(p => {
  console.log(`${p.name}: ${p.description}`);
});

// Create a sample template
const template = await templateManager.createSampleTemplate(
  'My Custom Template'
);

// Validate template
const isValid = await plugin.reportGenerator.validateTemplate(
  template.path
);
```

### Opening the Report Modal

```typescript
import { IntervalReportModal } from './reports';

// Open modal for user interaction
const modal = new IntervalReportModal(plugin);
modal.open();
```

### Using the Convenience API

```typescript
import { Report, Reports } from './reports';

// Initialize the system
Reports.initialize(plugin);

// Get instances
const generator = Reports.getGenerator();
const templateManager = Reports.getTemplateManager();
const saver = Reports.getSaver();

// Or create new instances
const newGenerator = Report.createGenerator(plugin);
```

---

## Report Types

### Interval Reports

**Use Case**: Reports covering any date range

**Features**:
- Flexible start/end dates
- Custom query support
- Full template placeholder support
- Real-time preview

**Example**:
```typescript
await generator.generateIntervalReport(
  '2024-01-01',
  '2024-03-31',
  query,
  'Q1 2024 Report',
  'Templates/quarterly-template.md'
);
```

### Monthly Reports (Legacy)

**Use Case**: Traditional month-based reports

**Features**:
- Month/year selection
- Fixed monthly format
- Budget tracking for monthly cycles

**Note**: Consider migrating to interval reports for more flexibility.

---

## Template System

### Template Structure

Templates are Markdown files with placeholder variables that get replaced during report generation.

**Basic Template**:
```markdown
# {{PROJECT_NAME}} - {{REPORT_NAME}}

**Period:** {{START_DATE}} to {{END_DATE}}
**Generated:** {{GENERATION_DATE}}

## Summary
- Total Hours: {{TOTAL_HOURS}}
- Revenue: {{TOTAL_REVENUE}}
- Utilization: {{UTILIZATION}}

## Details

{{TABLE_PLACEHOLDER}}
```

### Available Placeholders

#### Report Information
- `{{REPORT_NAME}}` - Name of the report
- `{{REPORT_PERIOD}}` - Full period description
- `{{START_DATE}}` - Interval start date
- `{{END_DATE}}` - Interval end date
- `{{GENERATION_DATE}}` - Report generation date
- `{{MONTH_YEAR}}` - Month and year (for monthly reports)

#### Summary Data
- `{{TOTAL_HOURS}}` - Total hours worked
- `{{ENTRY_COUNT}}` - Number of entries
- `{{UTILIZATION}}` - Utilization percentage
- `{{TOTAL_REVENUE}}` - Total revenue/invoiced
- `{{TOTAL_INVOICED}}` - Alias for TOTAL_REVENUE
- `{{TOTAL_VALUE}}` - Alias for TOTAL_REVENUE

#### Budget Information
- `{{BUDGET_HOURS}}` - Total allocated budget
- `{{REMAINING_HOURS}}` - Hours remaining in budget

#### Project Information
- `{{PROJECT_NAME}}` - Project name from settings
- `{{PROJECT_TYPE}}` - Project type (Hourly, Fixed, etc.)
- `{{CURRENCY}}` - Currency symbol

#### Date/Time
- `{{CURRENT_YEAR}}` - Current year
- `{{CURRENT_MONTH}}` - Current month number
- `{{CURRENT_DATE}}` - Current date (ISO format)

#### Table
- `{{TABLE_PLACEHOLDER}}` - **Required** - Query results table

### Template Best Practices

1. **Always include {{TABLE_PLACEHOLDER}}**
   - This is where query results appear
   - Required for all templates

2. **Use descriptive headers**
   - Help readers navigate the report
   - Structure content logically

3. **Provide context**
   - Include notes sections
   - Add action items or next steps

4. **Test with preview**
   - Use modal preview before generating
   - Verify all placeholders resolve correctly

5. **Version your templates**
   - Keep different templates for different purposes
   - Name templates descriptively

### Creating Custom Templates

**Step 1: Create Template File**

Create a new `.md` file in your templates folder (configured in settings):

```
Templates/
├── monthly-summary.md
├── client-invoice.md
├── weekly-status.md
└── quarterly-review.md
```

**Step 2: Add Content with Placeholders**

Use any combination of available placeholders:

```markdown
# {{PROJECT_NAME}} - {{REPORT_NAME}}

**Reporting Period:** {{REPORT_PERIOD}}

## Executive Summary

{{TOTAL_HOURS}} hours completed with {{UTILIZATION}} utilization.

{{TABLE_PLACEHOLDER}}

## Budget Status
- Allocated: {{BUDGET_HOURS}} hrs
- Remaining: {{REMAINING_HOURS}} hrs
```

**Step 3: Use in Report Generation**

Select the template in the modal or specify it programmatically.

---

## API Reference

### ReportGenerator API

```typescript
class ReportGenerator {
  constructor(plugin: TimesheetReportPlugin)
  
  // Generate interval-based report
  async generateIntervalReport(
    startDate: string,
    endDate: string,
    query: TimesheetQuery,
    reportName: string,
    templatePath?: string
  ): Promise<TFile>
  
  // Get available templates
  async getAvailableTemplates(): Promise<TFile[]>
  
  // Get available months from data
  async getAvailableMonths(): Promise<MonthData[]>
  
  // Get all existing reports
  async getAllReports(): Promise<TFile[]>
  
  // Validate template path
  async validateTemplate(templatePath: string): Promise<boolean>
  
  // Get template suggestions
  async getTemplateSuggestions(partialPath: string): Promise<TFile[]>
  
  // Create sample template
  async createSampleTemplate(templateName: string): Promise<TFile>
  
  // Get available placeholders
  getAvailablePlaceholders(): TemplatePlaceholder[]
}
```

### TemplateManager API

```typescript
class TemplateManager {
  constructor(plugin: TimesheetReportPlugin)
  
  // Get all templates from configured folder
  async getAvailableTemplates(): Promise<TFile[]>
  
  // Get template content
  async getTemplateContent(templatePath?: string): Promise<string>
  
  // Process interval report template
  replaceIntervalTemplateValues(
    templateContent: string,
    table: string,
    data: ProcessedData,
    reportName: string,
    startDate: string,
    endDate: string
  ): string
  
  // Process monthly report template
  replaceTemplateValues(
    templateContent: string,
    table: string,
    totalHours: number,
    year: number,
    month: number
  ): string
  
  // Validate template path
  async validateTemplatePath(templatePath: string): Promise<boolean>
  
  // Get template suggestions
  async getTemplateSuggestions(partialPath: string): Promise<TFile[]>
  
  // Create sample template
  async createSampleTemplate(templateName: string): Promise<TFile>
  
  // Get available placeholders
  getAvailablePlaceholders(): TemplatePlaceholder[]
}
```

### ReportSaver API

```typescript
class ReportSaver {
  constructor(plugin: TimesheetReportPlugin)
  
  // Save interval report
  async saveIntervalReport(
    reportName: string,
    content: string
  ): Promise<TFile>
  
  // Validate output folder
  async validateOutputFolder(): Promise<ValidationResult>
  
  // Get all reports
  async getAllReports(): Promise<TFile[]>
}
```

---

## Extending the System

### Adding a New Report Type

**Step 1: Define Types**

Add to `types/ReportTypes.ts`:

```typescript
export interface CustomReportOptions extends BaseReportOptions {
  customField: string;
  // ... other fields
}
```

**Step 2: Add Generator Method**

Add to `ReportGenerator.ts`:

```typescript
async generateCustomReport(
  options: CustomReportOptions
): Promise<TFile> {
  // Implementation
}
```

**Step 3: Create Modal (Optional)**

Create `modals/CustomReportModal.ts`:

```typescript
export class CustomReportModal extends Modal {
  // Implementation
}
```

**Step 4: Export from Index**

Add to `index.ts`:

```typescript
export type { CustomReportOptions } from './types';
export { CustomReportModal } from './modals/CustomReportModal';
```

### Adding New Template Placeholders

**Step 1: Define in Template Types**

Add to `types/TemplateTypes.ts` (TemplateContext):

```typescript
export interface TemplateContext {
  // ... existing fields
  customField?: string;
}
```

**Step 2: Implement Replacement**

Update `TemplateManager.ts`:

```typescript
replaceIntervalTemplateValues(...) {
  // ... existing replacements
  content = this.replaceAll(
    content,
    '{{CUSTOM_FIELD}}',
    context.customField || 'N/A'
  );
}
```

**Step 3: Document**

Update `getAvailablePlaceholders()`:

```typescript
{
  name: '{{CUSTOM_FIELD}}',
  description: 'Description of custom field',
  example: 'Example value'
}
```

### Creating Custom Modal Components

```typescript
import { Modal, Setting } from 'obsidian';
import TimesheetReportPlugin from '../../main';
import { ReportGenerator } from '../ReportGenerator';

export class MyCustomModal extends Modal {
  private plugin: TimesheetReportPlugin;
  private generator: ReportGenerator;

  constructor(plugin: TimesheetReportPlugin) {
    super(plugin.app);
    this.plugin = plugin;
    this.generator = new ReportGenerator(plugin);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    
    contentEl.createEl('h2', { text: 'My Custom Report' });
    
    // Add your UI components
    new Setting(contentEl)
      .setName('Setting Name')
      .addText(text => {
        // Configure component
      });
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
```

---

## Integration with Other Packages

### Query Package Integration

```typescript
import { parseQuery, QueryExecutor } from '../query';
import { ReportGenerator } from './ReportGenerator';

// Parse query and generate report
const query = parseQuery('WHERE date BETWEEN "2024-01-01" AND "2024-01-31"');
const generator = new ReportGenerator(plugin);
await generator.generateIntervalReport(
  '2024-01-01',
  '2024-01-31',
  query,
  'My Report'
);
```

### Tables Package Integration

```typescript
import { TableFactory } from '../tables/TableFactory';
import { ReportGenerator } from './ReportGenerator';

// Tables are automatically used within report generation
// The TableFactory creates properly formatted tables
// for the {{TABLE_PLACEHOLDER}}
```

---

## Testing

### Unit Testing Components

```typescript
import { ReportGenerator } from '../reports';

describe('ReportGenerator', () => {
  let plugin: TimesheetReportPlugin;
  let generator: ReportGenerator;

  beforeEach(() => {
    plugin = createMockPlugin();
    generator = new ReportGenerator(plugin);
  });

  it('should generate interval report', async () => {
    const query = parseQuery('WHERE date BETWEEN "2024-01-01" AND "2024-01-31"');
    const report = await generator.generateIntervalReport(
      '2024-01-01',
      '2024-01-31',
      query,
      'Test Report'
    );
    
    expect(report).toBeDefined();
    expect(report.basename).toBe('Test Report');
  });
});
```

---

## Performance Considerations

1. **Template Caching**: Templates are read from vault on each use. Consider caching for frequently used templates.

2. **Large Datasets**: For reports with many entries, consider pagination or summary views.

3. **File System Operations**: Folder validation and creation are optimized to minimize vault API calls.

4. **Memory Usage**: Large template processing keeps everything in memory. For very large reports, consider streaming approaches.

---

## Troubleshooting

### Common Issues

**Templates not showing in dropdown**
- Check template folder path in settings
- Ensure templates are `.md` files
- Verify folder exists in vault

**Placeholders not being replaced**
- Verify placeholder syntax (double curly braces)
- Check spelling matches available placeholders
- Ensure template includes {{TABLE_PLACEHOLDER}}

**Report not saving**
- Verify output folder exists
- Check file permissions
- Ensure report name is valid (no special characters)

**Query errors in reports**
- Validate query syntax before generating
- Use preview function to test
- Check date formats (YYYY-MM-DD)

---

## Future Enhancements

- [ ] Template validation before report generation
- [ ] Report scheduling and automation
- [ ] PDF export functionality
- [ ] Report versioning and history
- [ ] Template marketplace/sharing
- [ ] Advanced template syntax (loops, conditionals)
- [ ] Report templates with embedded queries
- [ ] Batch report generation
- [ ] Custom export formats (CSV, JSON)
- [ ] Report analytics and insights

---

## Contributing

When adding features to the reports package:

1. Follow TypeScript best practices
2. Add comprehensive types to `types/`
3. Document new features in this README
4. Add examples to documentation
5. Include unit tests
6. Update CHANGELOG.md

---

## Related Documentation

- [Main Plugin README](../../README.md)
- [Query Package](../query/README.md)
- [Tables Package](../tables/README.md)
- [Interval Reporting Guide](../../INTERVAL_REPORTING_GUIDE.md)
- [Template Guide](../../TEMPLATE_GUIDE.md)

---

*Last Updated: 2024*
