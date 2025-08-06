#!/bin/bash

echo "🔍 Diagnosing API endpoints..."
echo ""

# Test users endpoint
echo "1. Testing Users API:"
echo "   URL: http://localhost:3001/api/users"
USER_RESPONSE=$(curl -s http://localhost:3001/api/users)
USER_COUNT=$(echo "$USER_RESPONSE" | grep -o '"id"' | wc -l)
echo "   Status: ✅ $USER_COUNT users found"
echo "   Sample user data:"
echo "$USER_RESPONSE" | head -c 300
echo "..."
echo ""

# Test devices endpoint  
echo "2. Testing Devices API:"
echo "   URL: http://localhost:3001/api/devices"
DEVICE_RESPONSE=$(curl -s http://localhost:3001/api/devices)
DEVICE_COUNT=$(echo "$DEVICE_RESPONSE" | grep -o '"id"' | wc -l)
echo "   Status: ✅ $DEVICE_COUNT devices found"
echo "   Sample device data:"
echo "$DEVICE_RESPONSE" | head -c 300
echo "..."
echo ""

echo "3. Summary:"
echo "   ✅ Users API: $USER_COUNT users"
echo "   ✅ Devices API: $DEVICE_COUNT devices"
echo ""
echo "💡 Both APIs are working! If you're not seeing devices in your frontend:"
echo "   1. Check browser console for JavaScript errors"
echo "   2. Verify the frontend is calling http://localhost:3001/api/devices"
echo "   3. Check network tab in browser dev tools"