#!/bin/bash

# Script to open code coverage and quality reports in Firefox
# Usage: ./scripts/report-coverage.sh

echo "Opening code quality and coverage reports..."

# Check if Firefox is available
if ! command -v firefox &> /dev/null; then
    echo "Error: Firefox is not installed or not in PATH"
    exit 1
fi

# Check if reports exist
if [ ! -f "build/reports/jacoco/test/html/index.html" ]; then
    echo "Error: JaCoCo report not found. Run './gradlew test jacocoTestReport' first."
    exit 1
fi

if [ ! -f "build/reports/checkstyle/main.html" ]; then
    echo "Error: Checkstyle report not found. Run './gradlew checkstyleMain checkstyleTest' first."
    exit 1
fi

# Open reports in Firefox
echo "Opening JaCoCo coverage report..."
firefox build/reports/jacoco/test/html/index.html &

echo "Opening Checkstyle main code report..."
firefox build/reports/checkstyle/main.html &

echo "Opening Checkstyle test code report..."
firefox build/reports/checkstyle/test.html &

echo "Reports opened in Firefox!" 