#!/bin/bash

echo "🧪 Testing API endpoints..."
echo ""

BASE_URL="http://localhost:3001"

# Test health endpoint
echo "1. Testing health endpoint..."
if curl -s "$BASE_URL/api/health" > /dev/null; then
    echo "✅ Health endpoint is responding"
    curl -s "$BASE_URL/api/health" | head -c 200
    echo ""
else
    echo "❌ Health endpoint failed"
fi
echo ""

# Test users endpoint
echo "2. Testing users endpoint..."
if curl -s "$BASE_URL/api/users" > /dev/null; then
    USER_COUNT=$(curl -s "$BASE_URL/api/users" | grep -o '"id"' | wc -l)
    echo "✅ Users endpoint working: $USER_COUNT users found"
else
    echo "❌ Users endpoint failed"
fi
echo ""

# Test devices endpoint
echo "3. Testing devices endpoint..."
if curl -s "$BASE_URL/api/devices" > /dev/null; then
    DEVICE_COUNT=$(curl -s "$BASE_URL/api/devices" | grep -o '"id"' | wc -l)
    echo "✅ Devices endpoint working: $DEVICE_COUNT devices found"
else
    echo "❌ Devices endpoint failed"
fi
echo ""

echo "🎉 API test completed!"
echo ""
echo "💡 If any endpoints failed, make sure your backend server is running:"
echo "   cd backend && npm start"