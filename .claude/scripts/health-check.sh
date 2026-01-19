#!/bin/bash
# health-check.sh - ONDC UCP Seller Portal
#
# Purpose: Fast health diagnosis for React + Vite development
#
# CUSTOMIZED FOR:
# - Vite dev server on port 3002
# - Vitest for testing
# - No backend (API calls proxied to external service)
#
# Exit codes:
#   0 = healthy
#   1 = broken (shows error immediately)
#   2 = timeout

set -e

FRONTEND_PORT=3002
ISSUES_FOUND=0

echo "=== Health Check ==="

# ============================================================================
# Check infrastructure FIRST
# ============================================================================

echo ""
echo "Checking infrastructure..."

# Disk space check
disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$disk_usage" -gt 90 ]; then
  echo "✗ Disk space critically low: ${disk_usage}% used" >&2
  echo "Fix: Run 'pnpm clean' or clean up node_modules" >&2
  ISSUES_FOUND=1
elif [ "$disk_usage" -gt 80 ]; then
  echo "⚠ Disk space warning: ${disk_usage}% used" >&2
else
  echo "✓ Disk space OK (${disk_usage}% used)"
fi

# Node modules check
if [ ! -d "node_modules" ]; then
  echo "✗ node_modules not found" >&2
  echo "Fix: pnpm install" >&2
  ISSUES_FOUND=1
else
  echo "✓ node_modules exists"
fi

if [ $ISSUES_FOUND -eq 1 ]; then
  echo "" >&2
  echo "❌ Infrastructure check FAILED" >&2
  exit 1
fi

# ============================================================================
# Check Vite dev server
# ============================================================================

echo ""
echo "Checking services..."

check_service() {
  local url=$1
  local name=$2
  local process_name=$3

  if curl -sf --max-time 2 "$url" > /dev/null 2>&1; then
    echo "✓ $name (port $FRONTEND_PORT)"
    return 0
  fi

  echo "✗ $name is NOT responding on port $FRONTEND_PORT" >&2

  if pgrep -f "$process_name" >/dev/null 2>&1; then
    echo "  Process '$process_name' is running but not responding" >&2
  else
    echo "  Process '$process_name' is NOT running" >&2
  fi

  echo "" >&2
  echo "Fix: npm run dev" >&2
  echo "Or:   ./.claude/scripts/restart-servers.sh" >&2

  return 1
}

if ! check_service "http://localhost:$FRONTEND_PORT" "Vite Dev Server" "vite"; then
  echo "" >&2
  echo "❌ Health check FAILED" >&2
  exit 1
fi

# ============================================================================
# Final result
# ============================================================================

echo ""
echo "✅ All systems healthy"
exit 0
