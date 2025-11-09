#!/bin/zsh
# Script to build and install the plugin in Obsidian

# Stop on errors
set -e

# Get the absolute path to the plugin directory
PLUGIN_DIR=$(pwd)

# Build the plugin
echo "Building plugin..."
npm run build

# Determine the Obsidian plugins directory (relative to plugin directory)
OBSIDIAN_VAULT_DIR="/Users/dragos/Library/Mobile\ Documents/iCloud\~md\~obsidian/Documents/Siemens"
OBSIDIAN_PLUGINS_DIR="$OBSIDIAN_VAULT_DIR/.obsidian/plugins/timesheet-report"

# Create the plugins directory if it doesn't exist
mkdir -p "$OBSIDIAN_PLUGINS_DIR"

# Copy the files to the plugins directory
echo "Installing plugin to $OBSIDIAN_PLUGINS_DIR..."
cp "$PLUGIN_DIR/main.js" "$OBSIDIAN_PLUGINS_DIR/"
cp "$PLUGIN_DIR/manifest.json" "$OBSIDIAN_PLUGINS_DIR/"
cp "$PLUGIN_DIR/styles.css" "$OBSIDIAN_PLUGINS_DIR/"

echo "Plugin installed successfully!"
echo "Please restart Obsidian or reload the plugin to apply changes."
