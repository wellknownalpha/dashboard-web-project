# SecureOps Command Center

SecureOps Command Center is a full-stack application that connects a React frontend to Microsoft Graph and Defender APIs using a secure Node.js backend.

---

## 🚀 Quick Setup Guide

### ✅ Prerequisites

- Node.js (v16+)
- Azure Active Directory access
- Microsoft 365 with Defender for Endpoint
- (Optional) AWS EC2 for deployment

---

## 🔐 Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to: **Azure Active Directory > App registrations > + New registration**
3. Set:
   - **Name**: `SecureOps Command Center`
   - **Supported account types**: `Accounts in this organizational directory only`
4. Click **Register**

### 📄 Collect Credentials

- Application (client) ID
- Directory (tenant) ID
- Client Secret:
  - Go to **Certificates & secrets > + New client secret**
  - Copy the secret **value** immediately

### 🔑 Required API Permissions

1. **Microsoft Graph**
   - Type: `Application permissions`
   - Permission: `User.Read.All`

2. **WindowsDefenderATP**
   - Type: `Application permissions`
   - Permission: `Machine.Read.All`

> ✅ Click **"Grant admin consent"** after adding permissions.

---

## 🛠️ Backend Setup

1. Create a `.env` file inside `backend/`:

```

TENANT\_ID=your-tenant-id
CLIENT\_ID=your-client-id
CLIENT\_SECRET=your-client-secret

````

2. Install and run the backend:

```bash
cd backend
npm install
npm start
````

Backend will run at: `http://localhost:3001`

---

## 💻 Frontend Setup

1. Update `services/microsoftApi.ts` to fetch data from the backend (`http://localhost:3001`)
2. Run the frontend:

   ```bash
   npx serve .
   ```

   App will be served at: `http://localhost:3000`

---

## ☁️ Deploying to AWS EC2 (Optional)

1. Launch a Linux EC2 instance and SSH into it

2. Install Node.js, clone the repo, and create your `.env` file on the instance

3. Run backend with PM2:

   ```bash
   npm install -g pm2
   cd backend
   npm install
   pm2 start server.js
   ```

4. Serve frontend using:

   ```bash
   npx serve -s .
   ```

   Or configure Nginx for a production-grade setup

---

## 📁 Project Structure

```
.
├── backend/
│   ├── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── services/
│   │   └── microsoftApi.ts
│   └── index.html
```

---

## 🔒 Security Tips

* Never commit `.env` or credentials
* Use HTTPS in production
* Rotate secrets periodically

---

## 📚 Resources

* [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/)
* [Microsoft Defender API](https://learn.microsoft.com/en-us/microsoft-365/security/defender-endpoint/)
* [Azure App Registrations](https://portal.azure.com)
