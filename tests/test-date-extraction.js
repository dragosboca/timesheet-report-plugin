// Simple test script for date extraction
// This is a non-Obsidian test, just to verify our regular expressions

// Test filename extraction
function testFilenameExtraction() {
    console.log('Testing filename date extraction:');

    const testCases = [
        '2024-04-24',
        '2023-01-01',
        'client-2024-05-15',
        'not-a-date'
    ];

    for (const filename of testCases) {
        const match = filename.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const date = new Date(`${match[1]}-${match[2]}-${match[3]}`);
            console.log(`✅ "${filename}" => ${date.toISOString().split('T')[0]}`);
        } else {
            console.log(`❌ "${filename}" => No date found`);
        }
    }
}

// Test YAML frontmatter date extraction
function testYamlExtraction() {
    console.log('\nTesting YAML frontmatter date extraction:');

    const testCases = [
        'date: 2024-04-24',
        'date: 04/24/2024',
        'date:2024-04-24',
        'date: not-a-date'
    ];

    for (const yamlLine of testCases) {
        const match = yamlLine.match(/date:\s*([\d-/]+)/);
        if (match && match[1]) {
            const dateStr = match[1].trim();
            let date;

            try {
                // Try standard ISO format YYYY-MM-DD
                date = new Date(dateStr);

                // Check if the date is valid
                if (isNaN(date.getTime())) {
                    // Try MM/DD/YYYY format if ISO format failed
                    if (dateStr.includes('/')) {
                        const [month, day, year] = dateStr.split('/').map(Number);
                        date = new Date(year, month - 1, day);
                    }
                }

                if (!isNaN(date.getTime())) {
                    console.log(`✅ "${yamlLine}" => ${date.toISOString().split('T')[0]}`);
                } else {
                    console.log(`❌ "${yamlLine}" => Invalid date: ${dateStr}`);
                }
            } catch (error) {
                console.log(`❌ "${yamlLine}" => Error: ${error.message}`);
            }
        } else {
            console.log(`❌ "${yamlLine}" => No date found`);
        }
    }
}

// Test path extraction
function testPathExtraction() {
    console.log('\nTesting path date extraction:');

    const testCases = [
        '/Users/dragos/Documents/Timesheets/2024-04-24.md',
        '/Timesheets/2023/2023-01-01.md',
        '/2024-04-24/notes.md',
        '/not-a-date/file.md'
    ];

    for (const path of testCases) {
        const match = path.match(/\/(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const date = new Date(`${match[1]}-${match[2]}-${match[3]}`);
            console.log(`✅ "${path}" => ${date.toISOString().split('T')[0]}`);
        } else {
            console.log(`❌ "${path}" => No date found`);
        }
    }
}

// Run all tests
testFilenameExtraction();
testYamlExtraction();
testPathExtraction();
