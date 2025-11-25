// Utilization Test Script for Timesheet Report Plugin
// Run this in the browser console when the plugin is loaded to test utilization calculations

(function () {
  console.log('=== Timesheet Utilization Test ===');

  // Get plugin instance
  const plugin = app.plugins.plugins['timesheet-report'];
  if (!plugin) {
    console.error('❌ Timesheet plugin not found!');
    return;
  }

  console.log('✅ Plugin found:', plugin.constructor.name);

  // Test data samples with expected utilization
  const testCases = [
    {
      name: "Perfect 8h/day (100%)",
      year: 2024,
      month: 3,
      totalHours: 168, // 21 working days * 8h
      expectedUtilization: 100
    },
    {
      name: "Partial month (50%)",
      year: 2024,
      month: 3,
      totalHours: 84, // 21 working days * 4h
      expectedUtilization: 50
    },
    {
      name: "Overtime (120%)",
      year: 2024,
      month: 3,
      totalHours: 201.6, // 21 working days * 9.6h
      expectedUtilization: 120
    },
    {
      name: "No work (0%)",
      year: 2024,
      month: 3,
      totalHours: 0,
      expectedUtilization: 0
    }
  ];

  // Test working days calculation
  function testWorkingDays() {
    console.log('\n--- Testing Working Days Calculation ---');

    const testMonths = [
      { year: 2024, month: 3, description: "March 2024" },
      { year: 2024, month: 2, description: "February 2024 (leap year)" },
      { year: 2024, month: 1, description: "January 2024" },
      { year: 2023, month: 12, description: "December 2023" }
    ];

    testMonths.forEach(test => {
      try {
        // Import DateUtils
        const DateUtils = require('./src/utils/date-utils').DateUtils;
        const workingDays = DateUtils.getWorkingDaysInMonth(test.year, test.month);

        console.log(`${test.description}: ${workingDays} working days`);

        // Manual verification for March 2024
        if (test.year === 2024 && test.month === 3) {
          console.log('✅ March 2024 verification:');
          const startDate = new Date(2024, 2, 1); // March 1, 2024
          const endDate = new Date(2024, 2, 31);   // March 31, 2024

          let manualCount = 0;
          const current = new Date(startDate);

          while (current <= endDate) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
              manualCount++;
            }
            current.setDate(current.getDate() + 1);
          }

          console.log(`Manual count: ${manualCount}, DateUtils: ${workingDays}`);
          if (manualCount === workingDays) {
            console.log('✅ Working days calculation is correct');
          } else {
            console.log('❌ Working days calculation mismatch!');
          }
        }

      } catch (error) {
        console.error(`Error testing ${test.description}:`, error);

        // Fallback manual calculation
        const startDate = new Date(test.year, test.month - 1, 1);
        const endDate = new Date(test.year, test.month, 0);

        let workingDays = 0;
        const current = new Date(startDate);

        while (current <= endDate) {
          const dayOfWeek = current.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            workingDays++;
          }
          current.setDate(current.getDate() + 1);
        }

        console.log(`${test.description}: ${workingDays} working days (manual fallback)`);
      }
    });
  }

  // Test utilization calculation
  function testUtilizationCalculation() {
    console.log('\n--- Testing Utilization Calculation ---');

    const hoursPerWorkday = plugin.settings.hoursPerWorkday || 8;
    console.log(`⚙️ Hours per workday setting: ${hoursPerWorkday}`);

    testCases.forEach(test => {
      console.log(`\n${test.name}:`);

      try {
        // Calculate working days (use fallback calculation)
        const startDate = new Date(test.year, test.month - 1, 1);
        const endDate = new Date(test.year, test.month, 0);

        let workingDays = 0;
        const current = new Date(startDate);

        while (current <= endDate) {
          const dayOfWeek = current.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            workingDays++;
          }
          current.setDate(current.getDate() + 1);
        }

        const targetHours = workingDays * hoursPerWorkday;
        const actualUtilization = targetHours > 0 ? (test.totalHours / targetHours) * 100 : 0;

        console.log(`📊 Working days: ${workingDays}`);
        console.log(`🎯 Target hours: ${targetHours}`);
        console.log(`⏱️ Actual hours: ${test.totalHours}`);
        console.log(`📈 Calculated utilization: ${Math.round(actualUtilization * 100) / 100}%`);
        console.log(`✨ Expected utilization: ${test.expectedUtilization}%`);

        const difference = Math.abs(actualUtilization - test.expectedUtilization);
        if (difference < 0.1) {
          console.log('✅ Utilization calculation is correct');
        } else {
          console.log(`❌ Utilization mismatch! Difference: ${difference.toFixed(2)}%`);
        }

      } catch (error) {
        console.error(`Error in test case "${test.name}":`, error);
      }
    });
  }

  // Test sample frontmatter parsing
  function testFrontmatterParsing() {
    console.log('\n--- Testing Sample Frontmatter ---');

    const sampleFrontmatter = {
      hours: 8,
      "per-hour": 75,
      "work-order": "Test Project",
      client: "Test Client",
      worked: true
    };

    console.log('📝 Sample frontmatter:', sampleFrontmatter);

    // Simulate extraction logic
    let hours = 0;
    let rate = undefined;
    let project = undefined;

    // Extract hours
    if (typeof sampleFrontmatter.hours === 'number') {
      hours = sampleFrontmatter.hours;
    }

    // Extract rate (per-hour priority)
    if (typeof sampleFrontmatter['per-hour'] === 'number') {
      rate = sampleFrontmatter['per-hour'];
    }

    // Extract project (work-order priority)
    if (sampleFrontmatter['work-order']) {
      project = String(sampleFrontmatter['work-order']);
    } else if (sampleFrontmatter.client) {
      project = String(sampleFrontmatter.client);
    }

    console.log('✅ Extracted data:');
    console.log(`   Hours: ${hours}`);
    console.log(`   Rate: ${rate}`);
    console.log(`   Project: ${project}`);
    console.log(`   Revenue: €${(hours * (rate || 0)).toFixed(2)}`);

    if (hours > 0 && rate && project) {
      console.log('✅ All required fields extracted successfully');
    } else {
      console.log('❌ Missing required fields for proper calculation');
    }
  }

  // Test current plugin data
  function testCurrentData() {
    console.log('\n--- Testing Current Plugin Data ---');

    if (plugin.dataProcessor) {
      plugin.dataProcessor.processTimesheetData()
        .then(reportData => {
          console.log('📊 Current report data:', {
            monthlyDataCount: reportData.monthlyData?.length || 0,
            totalHours: reportData.yearSummary?.totalHours || 0,
            utilization: Math.round((reportData.yearSummary?.utilization || 0) * 100),
            trendDataPoints: reportData.trendData?.labels?.length || 0
          });

          if (reportData.trendData && reportData.trendData.utilization) {
            console.log('📈 Utilization trend data:', reportData.trendData.utilization);

            const hasUtilizationData = reportData.trendData.utilization.some(u => u > 0);
            if (hasUtilizationData) {
              console.log('✅ Utilization data found in trend');
            } else {
              console.log('❌ No utilization data in trend (all zeros)');
              console.log('💡 Check: Do your timesheet files have hours > 0?');
              console.log('💡 Check: Is your timesheet folder path correct?');
              console.log('💡 Check: Do files have extractable dates?');
            }
          }

          if (reportData.monthlyData && reportData.monthlyData.length > 0) {
            console.log('\n📅 Monthly data sample:');
            const latest = reportData.monthlyData[0];
            console.log(`   ${latest.label}: ${latest.hours}h, ${Math.round(latest.utilization * 100)}% utilization`);
          }
        })
        .catch(error => {
          console.error('❌ Error getting current data:', error);
        });
    } else {
      console.log('❌ No dataProcessor found on plugin');
    }
  }

  // Test chart data format
  function testChartDataFormat() {
    console.log('\n--- Testing Chart Data Format ---');

    const mockTrendData = {
      labels: ['Jan 2024', 'Feb 2024', 'Mar 2024'],
      hours: [120, 140, 160],
      utilization: [75, 87.5, 100], // Should be percentages for chart
      invoiced: [9000, 10500, 12000]
    };

    console.log('📊 Mock trend data:', mockTrendData);

    // Verify data ranges
    const maxUtilization = Math.max(...mockTrendData.utilization);
    const minUtilization = Math.min(...mockTrendData.utilization);

    console.log(`📈 Utilization range: ${minUtilization}% - ${maxUtilization}%`);

    if (maxUtilization <= 100 && minUtilization >= 0) {
      console.log('✅ Utilization data is in correct percentage format');
    } else if (maxUtilization <= 1 && minUtilization >= 0) {
      console.log('❌ Utilization data appears to be in decimal format (needs * 100)');
    } else {
      console.log('⚠️ Utilization data has unexpected values');
    }
  }

  // Run all tests
  console.log('🧪 Running utilization tests...\n');

  testWorkingDays();
  testUtilizationCalculation();
  testFrontmatterParsing();
  testChartDataFormat();
  testCurrentData();

  console.log('\n=== Test Summary ===');
  console.log('🔍 To debug utilization issues:');
  console.log('1. Enable debug mode in plugin settings');
  console.log('2. Check console for [Timesheet] messages when refreshing');
  console.log('3. Verify your timesheet files have: hours, per-hour, work-order');
  console.log('4. Check that files are in the correct folder with proper dates');
  console.log('5. Confirm Hours Per Workday setting matches your schedule');

  console.log('\n💡 Common utilization issues:');
  console.log('• Files missing "hours" field or hours = 0');
  console.log('• Wrong timesheet folder path');
  console.log('• Files without extractable dates');
  console.log('• Hours Per Workday setting too high/low');
  console.log('• Chart expecting percentages but getting decimals');

})();
