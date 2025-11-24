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
npm run dev  # Start development with hot reload
```

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
1. Build the plugin: `npm run build`
2. Copy to your Obsidian plugins folder
3. Test all major features work correctly
4. Verify in both light and dark themes

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
