#!/usr/bin/env bash
set -uo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

EXAMPLES=(
  "01-basic-poll-once.ts"
  "02-continuous-subscriber.ts"
  "03-payment-filters.ts"
  "04-asset-transfer.ts"
  "05-app-call.ts"
  "06-multiple-filters.ts"
  "07-balance-changes.ts"
  "08-arc28-events.ts"
  "09-inner-transactions.ts"
  "10-batch-and-mappers.ts"
  "11-watermark-persistence.ts"
  "12-sync-behaviours.ts"
  "13-custom-filters.ts"
  "14-stateless-subscriptions.ts"
  "15-lifecycle-hooks.ts"
)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

passed=0
failed=0
failures=()

echo -e "${BOLD}Running all ${#EXAMPLES[@]} examples...${NC}"
echo ""

for example in "${EXAMPLES[@]}"; do
  printf "  %-40s " "$example"
  if npm run example "$example" > /dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    ((passed++))
  else
    echo -e "${RED}FAIL${NC}"
    ((failed++))
    failures+=("$example")
  fi
done

echo ""
echo -e "${BOLD}Summary: ${GREEN}${passed} passed${NC}, ${RED}${failed} failed${NC} out of ${#EXAMPLES[@]}"

if [ ${#failures[@]} -gt 0 ]; then
  echo ""
  echo -e "${RED}Failed examples:${NC}"
  for f in "${failures[@]}"; do
    echo "  - $f"
  done
  echo ""
  echo "Tip: Reset LocalNet with 'algokit localnet reset' and retry."
fi

exit "$failed"
