// Test script to verify frontmatter parsing
// Run this in the browser console when the plugin is loaded

(function () {
  console.log('=== Timesheet Frontmatter Test ===');

  // Test frontmatter data samples
  const testSamples = [
    {
      name: "Historical format (per-hour)",
      frontmatter: {
        hours: 8,
        "per-hour": 75,
        "work-order": "Project Alpha",
        client: "Acme Corp",
        worked: true
      }
    },
    {
      name: "Array format",
      frontmatter: {
        hours: 6.5,
        "per-hour": 85,
        "work-order": ["Main Project", "Sub Task"],
        client: ["Primary Client"],
        worked: true
      }
    },
    {
      name: "Alternative rate fields",
      frontmatter: {
        hours: 7,
        rate: 90,
        project: "Alternative Format",
        worked: true
      }
    },
    {
      name: "String numbers",
      frontmatter: {
        hours: "8.5",
        "per-hour": "80",
        "work-order": "String Numbers Test",
        worked: true
      }
    },
    {
      name: "Non-working day",
      frontmatter: {
        worked: false,
        notes: "Holiday"
      }
    },
    {
      name: "Missing rate (should use default)",
      frontmatter: {
        hours: 4,
        "work-order": "No Rate Project",
        worked: true
      }
    }
  ];

  // Get plugin instance
  const plugin = app.plugins.plugins['timesheet-report'];
  if (!plugin) {
    console.error('❌ Timesheet plugin not found!');
    return;
  }

  console.log('✅ Plugin found:', plugin.constructor.name);
  console.log('⚙️ Current settings:', {
    timesheetFolder: plugin.settings.timesheetFolder,
    hoursPerWorkday: plugin.settings.hoursPerWorkday,
    defaultRate: plugin.settings.project?.defaultRate,
    projectType: plugin.settings.project?.type
  });

  // Mock file object
  const mockFile = {
    path: 'test-file.md',
    basename: '2024-03-15',
    name: '2024-03-15.md'
  };

  // Mock date
  const testDate = new Date('2024-03-15');

  // Test each sample
  testSamples.forEach((sample, index) => {
    console.log(`\n--- Test ${index + 1}: ${sample.name} ---`);
    console.log('📝 Input frontmatter:', sample.frontmatter);

    try {
      // Create mock data extractor to test extraction logic
      const mockExtractor = {
        plugin: plugin,
        extractFromFrontmatter: function (file, date, frontmatter) {
          const worked = frontmatter.worked !== false;
          if (!worked) {
            console.log('⏭️ Skipped - worked: false');
            return null;
          }

          let hours = 0;
          let rate = undefined;
          let project = undefined;

          // Extract hours
          if (typeof frontmatter.hours === 'number') {
            hours = frontmatter.hours;
          } else if (typeof frontmatter.duration === 'number') {
            hours = frontmatter.duration;
          } else if (typeof frontmatter.hours === 'string') {
            hours = parseFloat(frontmatter.hours) || 0;
          }

          // Extract rate
          if (typeof frontmatter['per-hour'] === 'number') {
            rate = frontmatter['per-hour'];
          } else if (typeof frontmatter['per-hour'] === 'string') {
            rate = parseFloat(frontmatter['per-hour']) || undefined;
          } else if (typeof frontmatter.rate === 'number') {
            rate = frontmatter.rate;
          } else if (typeof frontmatter.hourlyRate === 'number') {
            rate = frontmatter.hourlyRate;
          }

          // Fall back to default rate
          if (!rate && this.plugin.settings.project?.defaultRate) {
            rate = this.plugin.settings.project.defaultRate;
            console.log('📋 Using default rate:', rate);
          }

          // Extract project
          if (frontmatter['work-order']) {
            if (Array.isArray(frontmatter['work-order'])) {
              project = frontmatter['work-order'][0];
            } else {
              project = String(frontmatter['work-order']);
            }
          } else if (frontmatter.client) {
            if (Array.isArray(frontmatter.client)) {
              project = frontmatter.client[0];
            } else {
              project = String(frontmatter.client);
            }
          } else if (typeof frontmatter.project === 'string') {
            project = frontmatter.project;
          }

          const notes = frontmatter.notes || frontmatter.description || '';

          if (hours > 0) {
            return {
              date,
              hours,
              rate,
              project,
              notes,
              taskDescription: notes,
              file
            };
          }

          return null;
        }
      };

      const result = mockExtractor.extractFromFrontmatter(mockFile, testDate, sample.frontmatter);

      if (result) {
        console.log('✅ Extracted entry:', {
          hours: result.hours,
          rate: result.rate,
          project: result.project,
          invoiced: result.hours * (result.rate || 0)
        });

        // Validate common issues
        if (!result.rate) {
          console.warn('⚠️ Warning: No rate found (invoicing will be $0)');
        }
        if (!result.project || result.project === 'undefined') {
          console.warn('⚠️ Warning: Project is undefined or missing');
        }
        if (result.hours <= 0) {
          console.warn('⚠️ Warning: Hours is zero or negative');
        }
      } else {
        console.log('❌ No entry extracted (hours = 0 or worked = false)');
      }

    } catch (error) {
      console.error('💥 Error processing sample:', error);
    }
  });

  console.log('\n=== Summary ===');
  console.log('ℹ️ For utilization and invoice graphs to work properly, ensure:');
  console.log('1. Files have "hours" field with numeric value > 0');
  console.log('2. Files have "per-hour" field or default rate is set in settings');
  console.log('3. Files have "work-order" or "client" field for project identification');
  console.log('4. File names or frontmatter contain extractable dates');
  console.log('5. Debug mode is enabled to see processing details');

  console.log('\n🔍 To enable debug mode: Settings → Timesheet Report → Debug Mode');
})();
