# Scripts Directory

This directory contains utility scripts for development and building.

## Available Scripts

### `build-parser.js`
Builds the PEG.js parser from the grammar definition.

**Usage:**
```bash
npm run build:parser
```

This is automatically run as part of the main build process.

### `install-plugin.js`
Installs the built plugin to your local Obsidian vault for testing.

**Usage:**
```bash
npm run install:plugin
```

Or build and install in one command:
```bash
npm run dev:install
```

## Setup for Local Development

To use the install script, you need to create a configuration file:

1. Copy the example config:
   ```bash
   cp install-config.json.example install-config.json
   ```

2. Edit `install-config.json` and set your vault path:
   ```json
   {
     "vaultPath": "/path/to/your/obsidian/vault"
   }
   ```

3. Build and install:
   ```bash
   npm run dev:install
   ```

4. Reload Obsidian (Ctrl/Cmd + R) to see your changes

## Configuration

### `install-config.json`
This file is git-ignored and should contain your local vault path.

**Example:**
```json
{
  "vaultPath": "/Users/yourname/Documents/ObsidianVault"
}
```

**Platform-specific paths:**
- **macOS:** `/Users/yourname/Documents/MyVault`
- **Windows:** `C:\\Users\\yourname\\Documents\\MyVault`
- **Linux:** `/home/yourname/Documents/MyVault`

## Development Workflow

1. Make your code changes
2. Run `npm run dev:install` to build and copy to vault
3. Reload Obsidian (Ctrl/Cmd + R)
4. Test your changes
5. Repeat as needed

### Watch Mode

For continuous development, you can use:
```bash
npm run dev
```

This will watch for changes and rebuild automatically. However, you'll still need to:
1. Run `npm run install:plugin` to copy files to your vault
2. Reload Obsidian to see changes

## Troubleshooting

### "Configuration file not found"
Create `install-config.json` in the project root (see Setup above).

### "Vault path does not exist"
Check that the path in `install-config.json` is correct and points to an existing Obsidian vault.

### "Not a valid Obsidian vault"
The specified directory must contain a `.obsidian` folder. Make sure you're pointing to the vault root, not a subdirectory.

### "main.js not found"
Run `npm run build` first to compile the plugin.

### Changes not appearing in Obsidian
1. Make sure the plugin is enabled in Settings → Community plugins
2. Try reloading Obsidian (Ctrl/Cmd + R)
3. Check the Developer Console (Ctrl/Cmd + Shift + I) for errors
