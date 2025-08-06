#!/bin/bash

echo "🚀 Starting improved SecureOps Backend..."

# Kill any existing backend process
pkill -f "node.*server"

# Navigate to backend directory
cd backend

# Start the improved server
npm start

echo "✅ Backend started successfully!"