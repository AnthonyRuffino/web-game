# Default Development Mode

## Context
This is a JavaFX game development project with comprehensive testing, coverage, and quality checks.

## Quality Standards
- **Pre-commit hook enabled** - runs tests, coverage verification, and checkstyle
- **Coverage requirements**: Line 20%, Branch 10%, Method 30%
- **Checkstyle**: Zero warnings allowed
- **Tests**: All must pass before any commit

## Development Guidelines
- **TDD approach** preferred - write tests first
- **Observable systems** - use GameLogger, DI, and mocks for testability
- **Frequent commits** - checkpoint progress after logical steps
- **Never modify existing tests** without permission
- **Never change coverage expectations** without permission

## Available Commands
- `make quality` - Run all quality checks
- `make full-build` - Complete build with all checks
- `make pre-commit` - Run pre-commit checks manually
- `make setup-pre-commit` - Enable pre-commit hook

## Sweeping-Changes Mode
For multi-step autonomous development, refer to `.cursor/rules/sweeping-changes.md` 