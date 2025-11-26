const fs = require('fs');
const path = require('path');

/**
 * Install Plugin to Local Vault
 *
 * This script copies the built plugin files to your local Obsidian vault.
 * Configuration is stored in install-config.json
 */

const CONFIG_FILE = path.join(__dirname, '..', 'install-config.json');
const PLUGIN_NAME = 'timesheet-report';

// Files to copy
const FILES_TO_COPY = ['main.js', 'manifest.json', 'styles.css'];

/**
 * Load configuration
 */
function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error('❌ Configuration file not found!');
    console.log('\nCreate install-config.json in the project root with:');
    console.log(JSON.stringify({
      vaultPath: '/path/to/your/obsidian/vault'
    }, null, 2));
    console.log('\nExample:');
    console.log(JSON.stringify({
      vaultPath: `${process.env.HOME}/Documents/ObsidianVault`
    }, null, 2));
    process.exit(1);
  }

  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));

    if (!config.vaultPath) {
      console.error('❌ vaultPath not specified in install-config.json');
      process.exit(1);
    }

    return config;
  } catch (error) {
    console.error('❌ Error reading config file:', error.message);
    process.exit(1);
  }
}

/**
 * Validate vault path
 */
function validateVaultPath(vaultPath) {
  if (!fs.existsSync(vaultPath)) {
    console.error(`❌ Vault path does not exist: ${vaultPath}`);
    process.exit(1);
  }

  const obsidianDir = path.join(vaultPath, '.obsidian');
  if (!fs.existsSync(obsidianDir)) {
    console.error(`❌ Not a valid Obsidian vault (no .obsidian folder): ${vaultPath}`);
    process.exit(1);
  }

  return obsidianDir;
}

/**
 * Create plugin directory if needed
 */
function ensurePluginDirectory(obsidianDir) {
  const pluginsDir = path.join(obsidianDir, 'plugins');
  const pluginDir = path.join(pluginsDir, PLUGIN_NAME);

  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir);
  }

  if (!fs.existsSync(pluginDir)) {
    fs.mkdirSync(pluginDir);
  }

  return pluginDir;
}

/**
 * Copy plugin files
 */
function copyPluginFiles(pluginDir) {
  const projectRoot = path.join(__dirname, '..');
  let copiedCount = 0;

  for (const file of FILES_TO_COPY) {
    const sourcePath = path.join(projectRoot, file);
    const destPath = path.join(pluginDir, file);

    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️  Warning: ${file} not found (run npm run build first)`);
      continue;
    }

    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${file}`);
      copiedCount++;
    } catch (error) {
      console.error(`❌ Error copying ${file}:`, error.message);
    }
  }

  return copiedCount;
}

/**
 * Main installation process
 */
function main() {
  console.log('🔧 Installing Timesheet Report Plugin to local vault...\n');

  // Load and validate configuration
  const config = loadConfig();
  console.log(`📁 Vault path: ${config.vaultPath}`);

  // Validate vault
  const obsidianDir = validateVaultPath(config.vaultPath);

  // Ensure plugin directory exists
  const pluginDir = ensurePluginDirectory(obsidianDir);
  console.log(`📦 Plugin directory: ${pluginDir}\n`);

  // Copy files
  const copiedCount = copyPluginFiles(pluginDir);

  // Summary
  console.log(`\n✨ Installation complete! Copied ${copiedCount}/${FILES_TO_COPY.length} files.`);
  console.log('\n💡 Next steps:');
  console.log('   1. Reload Obsidian (Ctrl/Cmd + R)');
  console.log('   2. Go to Settings → Community plugins');
  console.log('   3. Enable "Timesheet Report Plugin"');
}

// Run the script
main();
