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

## 🛠️ Development Guide

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd Dashboard

# Install all dependencies (frontend + backend)
npm run install:all

# Start development environment
npm run start:full
```

### Development Scripts

```bash
# Frontend only (port 5173)
npm run dev

# Backend only (port 3001)
npm run start:backend

# Both frontend and backend
npm run start:full

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Structure

```
Dashboard/
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard with KPIs
│   ├── UserManagement.tsx # User administration
│   ├── CompliancePage.tsx # Compliance monitoring
│   └── DeviceActivityCard.tsx # Activity tracking
├── services/            # Business logic services
│   ├── authService.ts   # Authentication & user management
│   ├── microsoftApi.ts  # API integration
│   ├── deviceUserMapping.ts # Device-user association
│   └── notificationService.ts # Email notifications
├── utils/               # Utility functions
│   ├── export.ts        # CSV export functionality
│   ├── complianceExport.ts # Compliance reporting
│   └── pdfExport.ts     # PDF generation
├── types.ts             # TypeScript interfaces
└── backend/             # Express.js backend
    ├── server-improved.js # Main server file
    └── .env             # Environment configuration
```

## 📋 Feature Roadmap

### Planned Features
- [ ] **Real Email Integration**: Replace console logging with actual email service
- [ ] **Advanced Analytics**: Trend analysis and predictive insights
- [ ] **Custom Dashboards**: User-configurable dashboard layouts
- [ ] **API Rate Limiting**: Implement proper rate limiting and caching
- [ ] **Audit Logging**: Comprehensive audit trail for all actions

### Recent Updates
- ✅ **Device Activity Compliance**: 14-day activity monitoring
- ✅ **PDF Export**: Comprehensive dashboard reports
- ✅ **Email Notifications**: Automated alerts for inactive devices
- ✅ **MFA Integration**: Google Authenticator compatibility
- ✅ **Role-Based Access**: GlobalAdmin, Admin, Viewer roles

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This codebase includes comprehensive comments throughout all components, services, and utilities for better understanding and knowledge sharing. Each file contains detailed explanations of business logic, data flow, and implementation decisions.