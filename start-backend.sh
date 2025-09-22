#!/bin/bash
echo "🚀 Starting Backend Server..."
cd backend
echo "📋 Checking environment variables..."
if [ -f .env ]; then
    echo "✅ .env file found"
    echo "TENANT_ID: $(grep TENANT_ID .env | cut -d'=' -f2 | head -c 10)..."
    echo "CLIENT_ID: $(grep CLIENT_ID .env | cut -d'=' -f2 | head -c 10)..."
    echo "CLIENT_SECRET: $(grep CLIENT_SECRET .env | cut -d'=' -f2 | head -c 10)..."
else
    echo "❌ .env file not found"
    exit 1
fi

echo "🌐 Starting server on port 3001..."
node server-improved.js