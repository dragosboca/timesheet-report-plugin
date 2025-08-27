#!/bin/zsh
# Script to prepare a release of the plugin

# Stop on errors
set -e

# Get the version from manifest.json
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)

# Ensure clean working directory
if [[ -n $(git status --porcelain) ]]; then
  echo "Error: Working directory not clean. Commit or stash changes first."
  exit 1
fi

# Run lint and build
echo "Running lint and build..."
npm run lint
npm run build

# Run version bump script
echo "Updating version files..."
npm run version

# Create a release directory
RELEASE_DIR="releases/v$VERSION"
mkdir -p "$RELEASE_DIR"

# Copy release files
echo "Copying release files..."
cp main.js "$RELEASE_DIR/"
cp manifest.json "$RELEASE_DIR/"
cp styles.css "$RELEASE_DIR/"

# Create zip file
echo "Creating zip file..."
cd "$RELEASE_DIR"
zip "timesheet-report-v$VERSION.zip" main.js manifest.json styles.css
cd -

echo "Release prepared: $RELEASE_DIR/timesheet-report-v$VERSION.zip"
echo ""
echo "Next steps:"
echo "1. Create a git tag: git tag -a v$VERSION -m \"Release v$VERSION\""
echo "2. Push the tag: git push origin v$VERSION"
echo "3. Create a GitHub release and upload the zip file"
