#!/bin/bash
# Local Installation Script for Timesheet Report Plugin
# This script installs the plugin locally for testing purposes

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "manifest.json" ] || [ ! -f "package.json" ]; then
    print_error "This script must be run from the timesheet-report-plugin directory"
    print_error "Current directory: $(pwd)"
    exit 1
fi

# Build the plugin
print_status "Building the plugin..."
if ! npm run build; then
    print_error "Failed to build the plugin"
    exit 1
fi

print_success "Plugin built successfully"

# Check if required files exist
if [ ! -f "main.js" ]; then
    print_error "main.js not found. Build may have failed."
    exit 1
fi

if [ ! -f "styles.css" ]; then
    print_error "styles.css not found."
    exit 1
fi

# Find Obsidian vaults
print_status "Looking for Obsidian vaults..."

# Common Obsidian vault locations
POSSIBLE_LOCATIONS=(
    "$HOME/Documents/Obsidian"
    "$HOME/Obsidian"
    "$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents"
    "$HOME/OneDrive/Obsidian"
    "$HOME/Dropbox/Obsidian"
    "$HOME/Google Drive/Obsidian"
    "$HOME/Desktop/Obsidian"
)

VAULTS_FOUND=()

# Search for vaults
for location in "${POSSIBLE_LOCATIONS[@]}"; do
    if [ -d "$location" ]; then
        # Find directories that contain .obsidian folder
        while IFS= read -r -d '' vault; do
            vault_name=$(basename "$vault")
            if [ "$vault_name" != ".obsidian" ]; then
                VAULTS_FOUND+=("$vault")
            fi
        done < <(find "$location" -name ".obsidian" -type d -print0 2>/dev/null | head -20)
    fi
done

# If no vaults found, ask user for path
if [ ${#VAULTS_FOUND[@]} -eq 0 ]; then
    print_warning "No Obsidian vaults found automatically."
    echo "Please enter the full path to your Obsidian vault:"
    read -r VAULT_PATH

    if [ ! -d "$VAULT_PATH/.obsidian" ]; then
        print_error "Invalid vault path. No .obsidian directory found."
        exit 1
    fi

    SELECTED_VAULT="$VAULT_PATH"
else
    # Show found vaults and let user choose
    echo ""
    print_status "Found ${#VAULTS_FOUND[@]} Obsidian vault(s):"

    for i in "${!VAULTS_FOUND[@]}"; do
        vault="${VAULTS_FOUND[i]}"
        vault_name=$(basename "$vault")
        echo "  $((i + 1)). $vault_name ($vault)"
    done

    echo ""
    echo "Enter the number of the vault you want to install to (or 'q' to quit):"
    read -r choice

    if [ "$choice" = "q" ] || [ "$choice" = "Q" ]; then
        print_status "Installation cancelled."
        exit 0
    fi

    # Validate choice
    if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt ${#VAULTS_FOUND[@]} ]; then
        print_error "Invalid choice. Please run the script again."
        exit 1
    fi

    SELECTED_VAULT="${VAULTS_FOUND[$((choice - 1))]}"
fi

# Create plugin directory
PLUGIN_DIR="$SELECTED_VAULT/.obsidian/plugins/timesheet-report"
print_status "Creating plugin directory: $PLUGIN_DIR"

mkdir -p "$PLUGIN_DIR"

# Copy plugin files
print_status "Copying plugin files..."

cp main.js "$PLUGIN_DIR/" || {
    print_error "Failed to copy main.js"
    exit 1
}

cp manifest.json "$PLUGIN_DIR/" || {
    print_error "Failed to copy manifest.json"
    exit 1
}

cp styles.css "$PLUGIN_DIR/" || {
    print_error "Failed to copy styles.css"
    exit 1
}

print_success "Plugin files copied successfully!"

# Check if plugin is already in community-plugins.json
COMMUNITY_PLUGINS_FILE="$SELECTED_VAULT/.obsidian/community-plugins.json"

if [ -f "$COMMUNITY_PLUGINS_FILE" ]; then
    if grep -q '"timesheet-report"' "$COMMUNITY_PLUGINS_FILE"; then
        print_success "Plugin already enabled in Obsidian"
    else
        print_warning "Plugin installed but not enabled."
        print_status "To enable the plugin:"
        echo "  1. Open Obsidian"
        echo "  2. Go to Settings → Community Plugins"
        echo "  3. Find 'Timesheet Report' and toggle it ON"
    fi
else
    print_warning "Could not find community-plugins.json"
    print_status "To enable the plugin:"
    echo "  1. Open Obsidian"
    echo "  2. Go to Settings → Community Plugins"
    echo "  3. Find 'Timesheet Report' and toggle it ON"
fi

echo ""
print_success "Installation complete!"
print_status "Vault: $(basename "$SELECTED_VAULT")"
print_status "Plugin directory: $PLUGIN_DIR"

echo ""
print_status "Next steps:"
echo "  1. Restart Obsidian (or reload with Ctrl+R / Cmd+R)"
echo "  2. Enable the plugin in Settings → Community Plugins"
echo "  3. Configure your timesheet folder in plugin settings"
echo "  4. Create some timesheet files and test the plugin!"

echo ""
print_status "For hot-reload development, consider using:"
echo "  npm run dev"
echo "  (Then use the Hot Reload plugin in Obsidian)"
