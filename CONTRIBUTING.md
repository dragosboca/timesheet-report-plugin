# Contributing to Timesheet Report Plugin

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Quick Start

1. Fork the repository on GitHub
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

```bash
git clone https://github.com/yourusername/timesheet-report-plugin.git
cd timesheet-report-plugin
npm install
```

### Setting up Local Vault Testing

To automatically install the plugin to your local Obsidian vault:

1. Copy the example config:
   ```bash
   cp install-config.json.example install-config.json
   ```

2. Edit `install-config.json` with your vault path:
   ```json
   {
     "vaultPath": "/path/to/your/obsidian/vault"
   }
   ```

3. Build and install to your vault:
   ```bash
   npm run dev:install
   ```

4. Reload Obsidian (Ctrl/Cmd + R) to see the plugin

### Development Commands

- `npm run dev` - Watch mode with hot reload (still requires manual install)
- `npm run build` - Build the plugin
- `npm run dev:install` - Build and install to your local vault
- `npm run install:plugin` - Install already-built files to vault

## Making Changes

### Code Style
- Follow existing TypeScript conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Run `npm run build` to ensure code compiles

### Commit Messages
Use conventional commit format:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `refactor:` - Code improvements
- `test:` - Adding tests

Example: `feat: add budget tracking for retainer projects`

### Testing Your Changes
1. Build and install: `npm run dev:install`
2. Reload Obsidian (Ctrl/Cmd + R)
3. Test all major features work correctly
4. Verify in both light and dark themes
5. Check Developer Console (Ctrl/Cmd + Shift + I) for errors

## Pull Request Process

1. Create a descriptive title
2. Explain what changes you made and why
3. Include screenshots for UI changes
4. Reference any related issues
5. Ensure all checks pass

## Reporting Issues

When reporting bugs or requesting features:
- Use clear, descriptive titles
- Provide steps to reproduce (for bugs)
- Include your Obsidian version and OS
- Add screenshots if helpful

## Questions?

- Check existing issues and discussions
- Ask in the Obsidian Discord #plugin-dev channel
- Open a GitHub issue for specific problems

We appreciate all contributions, from bug fixes to feature suggestions!
