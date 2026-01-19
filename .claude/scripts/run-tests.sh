#!/bin/bash
# run-tests.sh - ONDC UCP Seller Portal
#
# Purpose: Run Vitest tests with coverage
#
# CUSTOMIZED FOR:
# - Vitest + jsdom
# - React Testing Library
# - TypeScript
#
# Usage: ./run-tests.sh [--coverage|--watch]

set -e

COVERAGE=false
WATCH=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --coverage)
      COVERAGE=true
      shift
      ;;
    --watch)
      WATCH=true
      shift
      ;;
    *)
      echo "Usage: $0 [--coverage] [--watch]"
      exit 1
      ;;
  esac
done

echo "=== Running Tests ==="

# Build command
TEST_CMD="vitest run"

if [ "$COVERAGE" = true ]; then
  TEST_CMD="$TEST_CMD --coverage"
  echo "Running tests with coverage..."
elif [ "$WATCH" = true ]; then
  TEST_CMD="vitest"
  echo "Running tests in watch mode..."
else
  echo "Running tests..."
fi

# Run tests
eval "pnpm $TEST_CMD"
TEST_EXIT=$?

# Coverage summary
if [ "$COVERAGE" = true ] && [ $TEST_EXIT -eq 0 ]; then
  echo ""
  echo "Coverage report generated in coverage/ directory"
fi

exit $TEST_EXIT
