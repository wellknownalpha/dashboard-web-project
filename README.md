# Microsoft 365 & Defender Dashboard

A unified dashboard for Microsoft 365 users and Microsoft Defender devices with real-time data from Microsoft Graph API and Defender API.

## Features

- **User Management**: View users from Microsoft Graph API
- **Device Security**: Monitor devices from Microsoft Defender
- **Risk Analysis**: Visual charts and risk assessment
- **Real-time Data**: Live data from Microsoft APIs
- **Export Functionality**: CSV export for admins
- **Dark/Light Theme**: Toggle between themes

## Architecture

```
Frontend (React/Vite) ←→ Backend (Node.js/Express) ←→ Microsoft APIs
```

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- Azure App Registration with API permissions

### 2. Installation
```bash
# Install all dependencies (frontend + backend)
npm run install:all
```

### 3. Configuration
Create `backend/.env` with your Azure credentials:
```env
TENANT_ID=your-tenant-id
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
```

### 4. Required Azure API Permissions
- **Microsoft Graph API**: `User.Read.All`
- **Microsoft Defender API**: `Machine.Read.All`

### 5. Run the Application
```bash
# Start both frontend and backend
npm run start:full

# Or start individually:
npm run start:backend  # Backend only (port 3001)
npm run dev           # Frontend only (port 5173)
```

## API Endpoints

- **Frontend**: http://localhost:5173
- **Backend Health**: http://localhost:3001/api/health
- **Users API**: http://localhost:3001/api/users
- **Devices API**: http://localhost:3001/api/devices

## Data Sources

### Microsoft Graph API
- User profiles, emails, job titles
- Department information
- License assignments

### Microsoft Defender API
- Device inventory
- Security health status
- Risk levels and last seen data

## Deployment

The application can be deployed to:
- **Frontend**: Vercel, Netlify, Azure Static Web Apps
- **Backend**: Azure App Service, AWS Lambda, Heroku

## Troubleshooting

1. **No data showing**: Check backend logs and API permissions
2. **CORS errors**: Ensure backend is running on port 3001
3. **Authentication errors**: Verify Azure app registration credentials

## Development

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run start:full

# Build for production
npm run build
```