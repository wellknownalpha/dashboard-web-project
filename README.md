# SecureOps Command Center

A full-stack application that connects a React frontend to Microsoft Graph and Defender APIs via a secure Node.js backend. This guide walks through how to move from a mock-data prototype to a fully functional, secure real-world application.

---

## ⚙️ Overview

This project replaces mock data with real user and device data from Microsoft Graph and Microsoft Defender ATP APIs using Azure AD authentication and a secure backend proxy.

---

## 📌 Step-by-Step Guide

### 1. Azure AD App Registration

> Set up your app in Azure to obtain secure access credentials.

- Go to [Azure Portal](https://portal.azure.com)
- Navigate to **Azure Active Directory** > **App registrations** > **+ New registration**
- **Name**: `SecureOps Command Center`
- **Supported account types**: `Accounts in this organizational directory only`
- Leave Redirect URI blank for now
- Click **Register**

#### 🔑 Get Credentials

- Copy and save the following:
  - Application (client) ID
  - Directory (tenant) ID

#### 🔐 Create a Client Secret

- Go to **Certificates & secrets** > **+ New client secret**
- Save the secret **value** immediately — it will be hidden after you leave the page.

#### 🔓 Grant API Permissions

1. **Microsoft Graph**
   - Permissions type: `Application permissions`
   - Add: `User.Read.All`

2. **Microsoft Defender ATP**
   - Go to **APIs my organization uses**
   - Search for `WindowsDefenderATP`
   - Permissions type: `Application permissions`
   - Add: `Machine.Read.All`

> ✅ Admin must **Grant Admin Consent** for permissions to take effect.

---

### 2. Backend Setup (Node.js + Express)

Create the backend directory and add the following files:

#### 📦 `backend/package.json`

```json
{
  "name": "secureops-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "axios": "^1.6.8",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  }
}
````

#### 🔐 `backend/.env`

```
TENANT_ID=your-tenant-id-goes-here
CLIENT_ID=your-client-id-goes-here
CLIENT_SECRET=your-client-secret-goes-here
```

> **Never commit your `.env` file.**

#### 🚀 `backend/server.js`

```js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

const { TENANT_ID, CLIENT_ID, CLIENT_SECRET } = process.env;

const acquireAccessToken = async (scope) => {
    const tokenEndpoint = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('scope', scope);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'client_credentials');

    const response = await axios.post(tokenEndpoint, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return response.data.access_token;
};

app.get('/api/users', async (req, res) => {
    try {
        const token = await acquireAccessToken('https://graph.microsoft.com/.default');
        const response = await axios.get('https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,jobTitle,department', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const users = response.data.value.map(u => ({ ...u, role: 'Viewer' }));
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', details: error.message });
    }
});

app.get('/api/devices', async (req, res) => {
    try {
        const token = await acquireAccessToken('https://api.securitycenter.microsoft.com/.default');
        const response = await axios.get('https://api.securitycenter.microsoft.com/api/machines', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const devices = response.data.value.map(d => ({
            id: d.id,
            userId: d.lastLoggedOnUser?.aadUserId,
            deviceName: d.computerDnsName,
            os: d.osPlatform,
            healthStatus: d.healthStatus,
            riskLevel: d.riskScore,
            lastSeen: d.lastSeen
        }));

        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching devices', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
```

---

### 3. Frontend Integration

Update your React service file to use the backend API:

#### 🧠 `services/microsoftApi.ts`

```ts
import { User, Device, UserRole } from '../types';

export const login = async (role: UserRole): Promise<User | undefined> => {
    return Promise.resolve({
        id: 'realuser',
        displayName: 'Authenticated User',
        mail: 'user@contoso.com',
        jobTitle: 'Engineer',
        department: 'IT',
        role: role,
    });
};

export const getUsers = async (): Promise<User[]> => {
    const response = await fetch('http://localhost:3001/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();

    return data.map((user: User) => ({
        ...user,
        photoUrl: `https://i.pravatar.cc/150?u=${user.mail}`
    }));
};

export const getAllDevices = async (): Promise<Device[]> => {
    const response = await fetch('http://localhost:3001/api/devices');
    if (!response.ok) throw new Error('Failed to fetch devices');
    return await response.json();
};
```

---

### 4. Running Locally

#### 🔁 Backend

```bash
cd backend
npm install
npm start
```

#### 💻 Frontend

Use a static server to serve your React app:

```bash
npx serve .
```

> Frontend will be available at `http://localhost:3000`

---

### 5. Deployment to AWS EC2

#### 📦 EC2 Setup

* Launch a Linux EC2 instance
* SSH into the instance
* Install Node.js and npm

#### 🔐 Security Groups

Allow incoming traffic for:

* `Port 80` (HTTP)
* `Port 443` (HTTPS - optional)
* `Port 3001` (for backend or use Nginx as a reverse proxy)

#### 🚀 Deploy Code

```bash
git clone <your-repo-url>
cd backend
npm install
```

> Create the `.env` file and add your Azure credentials securely.

#### 💡 Use PM2 for Uptime

```bash
npm install -g pm2
pm2 start server.js
```

#### 🌐 Frontend

You can serve it using:

```bash
npx serve -s .
```

Or use **Nginx** to serve static files and reverse proxy to the backend.

---

## ✅ Conclusion

You now have a fully integrated system that securely fetches real data from Microsoft services, powered by a robust backend and clean frontend interface.

---

## 📁 Project Structure (Simplified)

```
.
├── backend
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend
    ├── services
    │   └── microsoftApi.ts
    └── index.html
```

---

## 🛡️ Security Notes

* Never commit `.env` or secret values to version control
* Consider using HTTPS in production
* Regularly rotate client secrets in Azure
* npx serve . command to start backend server and npm run dev for frontend server

---

## 📚 Resources

* [Microsoft Graph Docs](https://learn.microsoft.com/en-us/graph/)
* [Microsoft Defender for Endpoint API](https://learn.microsoft.com/en-us/microsoft-365/security/defender-endpoint/)
* [Azure App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps)

---

## 👥 Contributors

Maintained by the SecOps Engineering Team.
