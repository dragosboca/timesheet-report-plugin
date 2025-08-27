# Contributing to Timesheet Report

Thank you for considering contributing to the Timesheet Report plugin! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork to your local machine
3. Install dependencies with `npm install`
4. Run `npm run dev` to start the development server with hot reloading

## Development Environment

- VSCode is recommended for development
- Install the Obsidian Hot Reload plugin in your test vault for easy testing

## Project Standards

### Code Style

- Follow TypeScript best practices
- Use consistent indentation (spaces, not tabs)
- Add JSDoc comments for public methods and interfaces
- Follow the existing code style for consistency

### Git Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Ensure your code passes linting and builds successfully
4. Submit a pull request with a clear description of your changes

### Commit Messages

Follow the conventional commits specification:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

## Testing

- Add unit tests for new functionality
- Test your changes in Obsidian before submitting a PR
- Ensure the plugin works in both light and dark themes

## Documentation

- Update the README.md to document new features
- Keep the DEVELOPER.md file up to date with technical changes
- Document user-facing changes in the plugin's documentation

## Release Process

1. Update the version number in `manifest.json` and `package.json`
2. Run `npm run version` to update the versions.json file
3. Build the plugin with `npm run build`
4. Create a GitHub release with release notes

## Getting Help

If you need help or have questions:
- Check the existing documentation
- Open an issue on GitHub
- Reach out to the maintainers

Thank you for contributing!
