#!/bin/bash

echo "🚀 Starting persistent backend server..."

# Kill any existing backend processes
pkill -f "node.*server"

# Navigate to backend directory
cd backend

# Start the server in background with nohup to keep it running
nohup npm start > ../backend.log 2>&1 &

# Get the process ID
BACKEND_PID=$!

echo "✅ Backend server started with PID: $BACKEND_PID"
echo "📋 Backend running at: http://localhost:3001"
echo "📄 Logs available at: backend.log"
echo ""
echo "🔍 Testing endpoints..."
sleep 3

# Test the endpoints
curl -s http://localhost:3001/api/health > /dev/null && echo "✅ Health endpoint working" || echo "❌ Health endpoint failed"
curl -s http://localhost:3001/api/users > /dev/null && echo "✅ Users endpoint working" || echo "❌ Users endpoint failed"  
curl -s http://localhost:3001/api/devices > /dev/null && echo "✅ Devices endpoint working" || echo "❌ Devices endpoint failed"

echo ""
echo "🎉 Backend is running persistently!"
echo "💡 To stop: pkill -f 'node.*server'"