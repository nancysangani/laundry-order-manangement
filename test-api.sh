#!/bin/bash

# Quick test script for Laundry Order Management System API
# Usage: bash test-api.sh

API_URL="http://localhost:3000/api"

echo "🧼 Quick Dry Cleaning - API Test Suite"
echo "======================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${BLUE}1. Health Check${NC}"
curl -s $API_URL/health | jq .
echo ""

# 2. Get Garments
echo -e "${BLUE}2. Get Available Garments${NC}"
curl -s $API_URL/garments | jq .
echo ""

# 3. Create First Order
echo -e "${BLUE}3. Create First Order${NC}"
ORDER1=$(curl -s -X POST $API_URL/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Raj Kumar",
    "phoneNumber": "+91-9876543210",
    "garments": [
      {"name": "Shirt", "quantity": 2},
      {"name": "Pants", "quantity": 1}
    ]
  }')
echo $ORDER1 | jq .
ORDER1_ID=$(echo $ORDER1 | jq -r '.order.id')
echo "Order ID: $ORDER1_ID"
echo ""

# 4. Create Second Order
echo -e "${BLUE}4. Create Second Order${NC}"
ORDER2=$(curl -s -X POST $API_URL/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Priya Singh",
    "phoneNumber": "+91-8765432109",
    "garments": [
      {"name": "Saree", "quantity": 1},
      {"name": "Jacket", "quantity": 1}
    ]
  }')
echo $ORDER2 | jq .
ORDER2_ID=$(echo $ORDER2 | jq -r '.order.id')
echo "Order ID: $ORDER2_ID"
echo ""

# 5. Get All Orders
echo -e "${BLUE}5. Get All Orders${NC}"
curl -s $API_URL/orders | jq .
echo ""

# 6. Get Dashboard Stats
echo -e "${BLUE}6. Dashboard Statistics${NC}"
curl -s $API_URL/dashboard | jq .
echo ""

# 7. Update Order Status
echo -e "${BLUE}7. Update Order Status (PROCESSING)${NC}"
curl -s -X PATCH $API_URL/orders/$ORDER1_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "PROCESSING"}' | jq .
echo ""

# 8. Filter by Status
echo -e "${BLUE}8. Filter Orders by Status (PROCESSING)${NC}"
curl -s "$API_URL/orders?status=PROCESSING" | jq .
echo ""

# 9. Filter by Customer Name
echo -e "${BLUE}9. Filter Orders by Customer Name (Raj)${NC}"
curl -s "$API_URL/orders?customerName=Raj" | jq .
echo ""

# 10. Get Single Order
echo -e "${BLUE}10. Get Single Order Details${NC}"
curl -s "$API_URL/orders/$ORDER1_ID" | jq .
echo ""

# 11. Update Another Order
echo -e "${BLUE}11. Update Another Order (READY)${NC}"
curl -s -X PATCH $API_URL/orders/$ORDER2_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "READY"}' | jq .
echo ""

# 12. Final Dashboard
echo -e "${BLUE}12. Final Dashboard Statistics${NC}"
curl -s $API_URL/dashboard | jq .
echo ""

echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "Summary:"
echo "- Created 2 orders"
echo "- Updated status for both orders"
echo "- Tested filtering and dashboard"
echo ""
echo "UI Dashboard: http://localhost:3000"
