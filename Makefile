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