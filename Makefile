# Makefile for JavaFX Game Development
# Usage: make <target>

.PHONY: help clean build test run verify coverage reports verifyAndRun dev-setup

# Default target
help:
	@echo "Available targets:"
	@echo "  help          - Show this help message"
	@echo "  clean         - Clean build artifacts"
	@echo "  build         - Build the project"
	@echo "  test          - Run tests"
	@echo "  run           - Run the application"
	@echo "  verify        - Run tests with coverage verification"
	@echo "  coverage      - Generate coverage reports"
	@echo "  reports       - Open coverage and quality reports in browser"
	@echo "  verifyAndRun  - Clean, test, verify coverage, and run app"
	@echo "  dev-setup     - Setup development environment"
	@echo "  quality       - Run all quality checks (tests, coverage, checkstyle)"
	@echo "  full-build    - Complete build with all checks"
	@echo "  coverage-only - Run only coverage checks"
	@echo "  style-only    - Run only style checks"
	@echo ""
	@echo "Pre-commit Hook:"
	@echo "  setup-pre-commit    - Install and enable pre-commit hook"
	@echo "  disable-pre-commit  - Disable pre-commit hook"
	@echo "  pre-commit          - Run pre-commit checks manually"
	@echo "  pre-commit-status   - Show pre-commit hook status"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	./gradlew clean

# Build the project
build:
	@echo "Building project..."
	./gradlew build

# Run tests
test:
	@echo "Running tests..."
	./gradlew test

# Run the application
run:
	@echo "Running application..."
	./gradlew run

# Run tests with coverage verification
verify:
	@echo "Running tests with coverage verification..."
	rm -rf ~/.web-game/assets/
	./gradlew clean test jacocoTestCoverageVerification --no-build-cache

# Generate coverage reports
coverage:
	@echo "Generating coverage reports..."
	./gradlew test jacocoTestReport checkstyleMain checkstyleTest

# Open coverage and quality reports in browser
reports:
	@echo "Opening reports in browser..."
	./scripts/report-coverage.sh

# Clean, test, verify coverage, and run app
verifyAndRun:
	@echo "Running full verification and application..."
	rm -rf ~/.web-game/assets/
	./gradlew clean test jacocoTestCoverageVerification run --no-build-cache

# Setup development environment
dev-setup:
	@echo "Setting up development environment..."
	./gradlew wrapper
	./gradlew build
	@echo "Development environment setup complete!"

# Run all quality checks
quality:
	@echo "Running all quality checks..."
	rm -rf ~/.web-game/assets/
	./gradlew clean test jacocoTestReport jacocoTestCoverageVerification checkstyleMain checkstyleTest --no-build-cache

# Complete build with all checks
full-build:
	@echo "Running complete build with all checks..."
	rm -rf ~/.web-game/assets/
	./gradlew clean build test jacocoTestReport jacocoTestCoverageVerification checkstyleMain checkstyleTest --no-build-cache

# Quick development cycle (build, test, run)
dev:
	@echo "Running development cycle..."
	./gradlew build test run

# Check for code style issues only
style:
	@echo "Checking code style..."
	./gradlew checkstyleMain checkstyleTest

# Generate only test reports
test-reports:
	@echo "Generating test reports..."
	./gradlew test jacocoTestReport

# Clean assets and run tests
clean-test:
	@echo "Cleaning assets and running tests..."
	rm -rf ~/.web-game/assets/
	./gradlew clean test --no-build-cache

# Run only coverage checks
coverage-only:
	@echo "Running coverage checks only..."
	rm -rf ~/.web-game/assets/
	./gradlew clean test jacocoTestReport jacocoTestCoverageVerification --no-build-cache

# Run only style checks
style-only:
	@echo "Running style checks only..."
	./gradlew checkstyleMain checkstyleTest

# Setup pre-commit hook
setup-pre-commit:
	@echo "Setting up pre-commit hook..."
	@if [ ! -f ".git/hooks/pre-commit" ]; then \
		echo "Error: Pre-commit hook not found. Please ensure .git/hooks/pre-commit exists."; \
		exit 1; \
	fi
	chmod +x .git/hooks/pre-commit
	@echo "Pre-commit hook installed and enabled!"

# Disable pre-commit hook
disable-pre-commit:
	@echo "Disabling pre-commit hook..."
	chmod -x .git/hooks/pre-commit
	@echo "Pre-commit hook disabled"

# Run pre-commit checks manually
pre-commit:
	@echo "Running pre-commit checks manually..."
	@if [ -x ".git/hooks/pre-commit" ]; then \
		.git/hooks/pre-commit; \
	else \
		echo "Error: Pre-commit hook not found or not executable"; \
		echo "Run 'make setup-pre-commit' to install it"; \
		exit 1; \
	fi

# Show pre-commit status
pre-commit-status:
	@echo "Pre-commit Hook Status:"
	@echo "======================"
	@if [ -x ".git/hooks/pre-commit" ]; then \
		echo "✅ Hook: ENABLED"; \
	else \
		echo "❌ Hook: DISABLED"; \
	fi
	@echo ""
	@echo "Skip Settings:"
	@echo "=============="
	@if [ "$(SKIP_TESTS)" = "true" ]; then \
		echo "⏭️  Tests: SKIPPED"; \
	else \
		echo "✅ Tests: ENABLED"; \
	fi
	@if [ "$(SKIP_COVERAGE)" = "true" ]; then \
		echo "⏭️  Coverage: SKIPPED"; \
	else \
		echo "✅ Coverage: ENABLED"; \
	fi
	@if [ "$(SKIP_STYLE)" = "true" ]; then \
		echo "⏭️  Checkstyle: SKIPPED"; \
	else \
		echo "✅ Checkstyle: ENABLED"; \
	fi 