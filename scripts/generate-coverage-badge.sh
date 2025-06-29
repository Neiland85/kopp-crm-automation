#!/bin/bash

# =============================================================================
# Coverage Badge Generator Script
# =============================================================================
# Este script genera un badge de cobertura basado en los resultados de Jest
# y lo actualiza en el README.md
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_NAME="Kopp CRM Automation"
COVERAGE_FILE="coverage/coverage-summary.json"
README_FILE="README.md"

echo -e "${BLUE}🏆 Generating Coverage Badge for ${PROJECT_NAME}${NC}"
echo "=================================================="

# Check if coverage file exists
if [ ! -f "$COVERAGE_FILE" ]; then
    echo -e "${YELLOW}⚠️  Coverage file not found. Running tests with coverage...${NC}"
    npm run test:coverage
    
    if [ ! -f "$COVERAGE_FILE" ]; then
        echo -e "${RED}❌ Failed to generate coverage file${NC}"
        exit 1
    fi
fi

# Extract coverage percentage
if command -v jq &> /dev/null; then
    COVERAGE_PERCENT=$(jq -r '.total.lines.pct' "$COVERAGE_FILE")
else
    # Fallback without jq
    COVERAGE_PERCENT=$(grep -o '"lines":{"total":[0-9]*,"covered":[0-9]*,"skipped":[0-9]*,"pct":[0-9.]*' "$COVERAGE_FILE" | grep -o 'pct":[0-9.]*' | cut -d':' -f2)
fi

if [ -z "$COVERAGE_PERCENT" ] || [ "$COVERAGE_PERCENT" = "null" ]; then
    echo -e "${RED}❌ Could not extract coverage percentage${NC}"
    exit 1
fi

echo -e "${BLUE}📊 Current coverage: ${COVERAGE_PERCENT}%${NC}"

# Determine badge color based on coverage
if (( $(echo "$COVERAGE_PERCENT >= 90" | bc -l) )); then
    BADGE_COLOR="brightgreen"
elif (( $(echo "$COVERAGE_PERCENT >= 80" | bc -l) )); then
    BADGE_COLOR="green"
elif (( $(echo "$COVERAGE_PERCENT >= 70" | bc -l) )); then
    BADGE_COLOR="yellow"
elif (( $(echo "$COVERAGE_PERCENT >= 60" | bc -l) )); then
    BADGE_COLOR="orange"
else
    BADGE_COLOR="red"
fi

# Generate badge URL
BADGE_URL="https://img.shields.io/badge/Coverage-${COVERAGE_PERCENT}%25-${BADGE_COLOR}?style=flat-square&logo=jest"

echo -e "${BLUE}🎨 Badge color: ${BADGE_COLOR}${NC}"
echo -e "${BLUE}🔗 Badge URL: ${BADGE_URL}${NC}"

# Update README.md if it exists
if [ -f "$README_FILE" ]; then
    echo -e "${BLUE}📝 Updating README.md...${NC}"
    
    # Create badge markdown
    BADGE_MARKDOWN="![Coverage](${BADGE_URL})"
    
    # Check if coverage badge already exists
    if grep -q "!\[Coverage\]" "$README_FILE"; then
        # Replace existing badge
        sed -i.bak "s|!\[Coverage\](.*)|${BADGE_MARKDOWN}|g" "$README_FILE"
        echo -e "${GREEN}✅ Coverage badge updated in README.md${NC}"
    else
        # Add badge after title (assuming # Title format)
        if grep -q "^# " "$README_FILE"; then
            sed -i.bak "/^# /a\\
\\
${BADGE_MARKDOWN}\\
" "$README_FILE"
            echo -e "${GREEN}✅ Coverage badge added to README.md${NC}"
        else
            echo -e "${YELLOW}⚠️  Could not find title in README.md, badge not added${NC}"
        fi
    fi
    
    # Remove backup file
    rm -f "${README_FILE}.bak"
else
    echo -e "${YELLOW}⚠️  README.md not found, badge not updated${NC}"
fi

# Generate coverage report summary
echo ""
echo -e "${BLUE}📊 Coverage Summary:${NC}"
echo "===================="

if command -v jq &> /dev/null && [ -f "$COVERAGE_FILE" ]; then
    echo -e "${BLUE}Lines:${NC}      $(jq -r '.total.lines.pct' "$COVERAGE_FILE")% ($(jq -r '.total.lines.covered' "$COVERAGE_FILE")/$(jq -r '.total.lines.total' "$COVERAGE_FILE"))"
    echo -e "${BLUE}Functions:${NC}  $(jq -r '.total.functions.pct' "$COVERAGE_FILE")% ($(jq -r '.total.functions.covered' "$COVERAGE_FILE")/$(jq -r '.total.functions.total' "$COVERAGE_FILE"))"
    echo -e "${BLUE}Branches:${NC}   $(jq -r '.total.branches.pct' "$COVERAGE_FILE")% ($(jq -r '.total.branches.covered' "$COVERAGE_FILE")/$(jq -r '.total.branches.total' "$COVERAGE_FILE"))"
    echo -e "${BLUE}Statements:${NC} $(jq -r '.total.statements.pct' "$COVERAGE_FILE")% ($(jq -r '.total.statements.covered' "$COVERAGE_FILE")/$(jq -r '.total.statements.total' "$COVERAGE_FILE"))"
else
    echo "Coverage: ${COVERAGE_PERCENT}%"
fi

echo ""
echo -e "${GREEN}🎉 Coverage badge generation completed!${NC}"

# Output badge markdown for easy copying
echo ""
echo -e "${BLUE}📋 Badge Markdown (copy to use elsewhere):${NC}"
echo "${BADGE_MARKDOWN}"

# Output HTML version
echo ""
echo -e "${BLUE}📋 Badge HTML (for HTML documents):${NC}"
echo "<img src=\"${BADGE_URL}\" alt=\"Coverage\" />"
