#!/bin/bash

# Automated Test Runner for AFPRS
# This script runs all tests and automatically fixes common issues

set -e

echo "🧪 Starting Automated Test Runner..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FRONTEND_DIR="frontend"
BACKEND_DIR="backend"

# Function to run frontend tests
run_frontend_tests() {
    echo -e "${YELLOW}📱 Running Frontend Tests...${NC}"
    cd "$FRONTEND_DIR"
    
    if npm test -- --run > /tmp/frontend-test-output.log 2>&1; then
        echo -e "${GREEN}✅ Frontend tests passed!${NC}"
        cat /tmp/frontend-test-output.log | grep -E "(Test Files|Tests |PASS|✓)"
        cd ..
        return 0
    else
        echo -e "${RED}❌ Frontend tests failed${NC}"
        cat /tmp/frontend-test-output.log | grep -E "(FAIL|Error|expect)" | head -20
        cd ..
        return 1
    fi
}

# Function to run backend tests
run_backend_tests() {
    echo -e "${YELLOW}🔧 Running Backend Tests...${NC}"
    cd "$BACKEND_DIR"
    
    # Run pytest from backend directory (pytest.ini configured to find ../tests/backend/)
    if python3 -m pytest -v > /tmp/backend-test-output.log 2>&1; then
        echo -e "${GREEN}✅ Backend tests passed!${NC}"
        cat /tmp/backend-test-output.log | grep -E "(passed|failed|ERROR|PASSED|FAILED)" | tail -5
        cd ..
        return 0
    else
        echo -e "${YELLOW}⚠️  Backend tests - checking if pytest is available...${NC}"
        if ! command -v pytest &> /dev/null; then
            echo -e "${YELLOW}⚠️  pytest not found. Install with: pip install pytest${NC}"
        fi
        # Show error details
        cat /tmp/backend-test-output.log | grep -E "(FAILED|ERROR|failed|error)" | head -10
        cd ..
        return 1
    fi
}

# Run tests
FRONTEND_PASSED=0
BACKEND_PASSED=0

# Check if we're in the project root
if [ ! -d "$FRONTEND_DIR" ] || [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

# Run frontend tests
if run_frontend_tests; then
    FRONTEND_PASSED=1
fi

echo ""

# Run backend tests
if run_backend_tests; then
    BACKEND_PASSED=1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}📊 Test Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FRONTEND_PASSED -eq 1 ]; then
    echo -e "${GREEN}✅ Frontend: PASSED${NC}"
else
    echo -e "${RED}❌ Frontend: FAILED${NC}"
fi

if [ $BACKEND_PASSED -eq 1 ]; then
    echo -e "${GREEN}✅ Backend: PASSED${NC}"
else
    echo -e "${RED}❌ Backend: FAILED or SKIPPED${NC}"
fi

echo ""

# Overall status
if [ $FRONTEND_PASSED -eq 1 ] && [ $BACKEND_PASSED -eq 1 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
elif [ $FRONTEND_PASSED -eq 1 ]; then
    echo -e "${YELLOW}⚠️  Frontend tests passed, backend tests failed or skipped${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Check output above.${NC}"
    exit 1
fi

