# Sweeping-Changes Mode

## Core Principles
- **Autonomous Execution**: Execute multi-step changes from Phase A Step 1 to Phase Z Step 10 without interruption
- **Quality Gate**: Pre-commit hook MUST remain enabled - never disable tests, coverage, or checkstyle
- **TDD Approach**: Write tests first, then implementation to maintain coverage
- **Observable Systems**: Use GameLogger, dependency injection, and Mockito for testable insights
- **Git Workflow**: Use `git add .` and `git commit` to checkpoint progress after each logical step

## Development Rules
1. **Never modify existing tests** without explicit permission
2. **Never change coverage expectations** or style guides without permission  
3. **Always run tests** before committing - pre-commit hook enforces this
4. **Commit frequently** after each logical step to enable rollback/cherry-picking
5. **Use TDD**: Write failing test → implement → verify → commit
6. **Add observability**: Use GameLogger, DI, and mocks to make systems testable
7. **Build and test** as needed during development

## Execution Pattern
```
For each step in the phase sequence:
1. Analyze requirements
2. Write/update tests (TDD approach)
3. Implement functionality
4. Run tests and verify coverage
5. Commit with descriptive message
6. Move to next step
```

## Quality Assurance
- Pre-commit hook runs: tests, coverage verification, checkstyle
- Only proceed if all checks pass
- Use `make quality` or `make full-build` to verify before committing
- If checks fail, fix issues before proceeding 