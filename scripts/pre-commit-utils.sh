#!/bin/bash

# Pre-commit utility functions for JavaFX Game Development
# Usage: source scripts/pre-commit-utils.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
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

# Function to enable pre-commit hook
enable_pre_commit() {
    if [ -f ".git/hooks/pre-commit" ]; then
        chmod +x .git/hooks/pre-commit
        print_success "Pre-commit hook enabled"
    else
        print_error "Pre-commit hook not found. Run 'make setup-pre-commit' first."
        return 1
    fi
}

# Function to disable pre-commit hook
disable_pre_commit() {
    if [ -f ".git/hooks/pre-commit" ]; then
        chmod -x .git/hooks/pre-commit
        print_success "Pre-commit hook disabled"
    else
        print_error "Pre-commit hook not found"
        return 1
    fi
}

# Function to skip tests for next commit
skip_tests() {
    export SKIP_TESTS=true
    print_warning "Tests will be skipped for the next commit"
    print_info "Run 'unset SKIP_TESTS' to re-enable tests"
}

# Function to skip coverage for next commit
skip_coverage() {
    export SKIP_COVERAGE=true
    print_warning "Coverage checks will be skipped for the next commit"
    print_info "Run 'unset SKIP_COVERAGE' to re-enable coverage checks"
}

# Function to skip checkstyle for next commit
skip_style() {
    export SKIP_STYLE=true
    print_warning "Style checks will be skipped for the next commit"
    print_info "Run 'unset SKIP_STYLE' to re-enable style checks"
}

# Function to skip all checks for next commit
skip_all() {
    export SKIP_TESTS=true
    export SKIP_COVERAGE=true
    export SKIP_STYLE=true
    print_warning "All quality checks will be skipped for the next commit"
    print_info "Run 'unset SKIP_TESTS SKIP_COVERAGE SKIP_STYLE' to re-enable all checks"
}

# Function to re-enable all checks
enable_all() {
    unset SKIP_TESTS
    unset SKIP_COVERAGE
    unset SKIP_STYLE
    print_success "All quality checks re-enabled"
}

# Function to show current pre-commit status
show_status() {
    echo "Pre-commit Hook Status:"
    echo "======================"
    
    if [ -x ".git/hooks/pre-commit" ]; then
        echo "✅ Hook: ENABLED"
    else
        echo "❌ Hook: DISABLED"
    fi
    
    echo ""
    echo "Skip Settings:"
    echo "=============="
    
    if [ "$SKIP_TESTS" = "true" ]; then
        echo "⏭️  Tests: SKIPPED"
    else
        echo "✅ Tests: ENABLED"
    fi
    
    if [ "$SKIP_COVERAGE" = "true" ]; then
        echo "⏭️  Coverage: SKIPPED"
    else
        echo "✅ Coverage: ENABLED"
    fi
    
    if [ "$SKIP_STYLE" = "true" ]; then
        echo "⏭️  Checkstyle: SKIPPED"
    else
        echo "✅ Checkstyle: ENABLED"
    fi
}

# Function to run pre-commit checks manually
run_pre_commit() {
    print_info "Running pre-commit checks manually..."
    .git/hooks/pre-commit
}

# Function to install pre-commit hook
install_pre_commit() {
    if [ ! -f ".git/hooks/pre-commit" ]; then
        print_error "Pre-commit hook not found. Please run 'make setup-pre-commit' first."
        return 1
    fi
    
    chmod +x .git/hooks/pre-commit
    print_success "Pre-commit hook installed and enabled"
    print_info "The hook will now run automatically on every commit"
}

# Function to uninstall pre-commit hook
uninstall_pre_commit() {
    if [ -f ".git/hooks/pre-commit" ]; then
        rm .git/hooks/pre-commit
        print_success "Pre-commit hook uninstalled"
    else
        print_warning "Pre-commit hook not found"
    fi
}

# Show help
show_help() {
    echo "Pre-commit Hook Utilities"
    echo "========================"
    echo ""
    echo "Available functions:"
    echo "  enable_pre_commit    - Enable the pre-commit hook"
    echo "  disable_pre_commit   - Disable the pre-commit hook"
    echo "  install_pre_commit   - Install and enable the hook"
    echo "  uninstall_pre_commit - Remove the hook completely"
    echo "  show_status          - Show current hook and skip settings"
    echo "  run_pre_commit       - Run pre-commit checks manually"
    echo ""
    echo "Skip functions (for next commit only):"
    echo "  skip_tests           - Skip tests for next commit"
    echo "  skip_coverage        - Skip coverage for next commit"
    echo "  skip_style           - Skip checkstyle for next commit"
    echo "  skip_all             - Skip all checks for next commit"
    echo "  enable_all           - Re-enable all checks"
    echo ""
    echo "Examples:"
    echo "  skip_tests && git commit -m 'WIP: skip tests'"
    echo "  skip_all && git commit -m 'Emergency fix'"
    echo "  run_pre_commit  # Test the hook manually"
}

# If script is run directly, show help
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    show_help
fi 