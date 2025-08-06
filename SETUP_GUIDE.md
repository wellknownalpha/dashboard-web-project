# Microsoft Graph API & Defender Integration Setup Guide

## Current Status
✅ Backend server configured and working
✅ Successfully fetching 395 users from Microsoft Graph API
✅ Successfully fetching 220 devices from Microsoft Defender API
✅ Frontend dashboard ready to display data

## Quick Start

### 1. Start the Backend Server
```bash
# Option 1: Use the improved backend (recommended)
./start-improved-backend.sh

# Option 2: Manual start
cd backend
npm start
```

### 2. Test API Endpoints
```bash
# Test if APIs are working
node test-api-endpoints.js
```

### 3. Start the Frontend
```bash
# Install dependencies (if not done)
npm install

# Start the development server
npm run dev
```

## Troubleshooting

### If you see "Unable to get user details" or "Unable to get device details":

1. **Check Backend Server Status**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Verify API Endpoints**
   ```bash
   node test-api-endpoints.js
   ```

3. **Check Backend Logs**
   - Look at the console output from your backend server
   - Check `backend/server.log` for detailed logs

### Common Issues:

1. **Backend not running**: Make sure `npm start` is running in the backend directory
2. **Port conflicts**: Ensure port 3001 is available
3. **CORS issues**: The backend includes CORS headers, but check browser console
4. **API permissions**: Your Azure app registration needs:
   - Microsoft Graph API: `User.Read.All`
   - Microsoft Defender API: `Machine.Read.All`

## API Endpoints

- **Health Check**: `GET http://localhost:3001/api/health`
- **Users**: `GET http://localhost:3001/api/users`
- **Devices**: `GET http://localhost:3001/api/devices`

## Data Flow

1. Frontend calls `getUsers()` and `getAllDevices()` from `services/microsoftApi.ts`
2. These functions make HTTP requests to your backend server
3. Backend server authenticates with Microsoft APIs using client credentials
4. Backend fetches data from Microsoft Graph API and Defender API
5. Backend returns processed data to frontend
6. Frontend displays data in the dashboard

## Next Steps

Your integration is working! The dashboard should now display:
- Real user data from Microsoft Graph API
- Real device data from Microsoft Defender API
- Risk analysis and charts
- Export functionality (for admins)

If you're still seeing issues, run the test script and check the backend logs for specific error messages.