# Azure App Registration Setup Guide

## Current Issue
Your client secret is invalid: `AADSTS7000215: Invalid client secret provided`

## Steps to Fix:

### 1. Go to Azure Portal
- Navigate to https://portal.azure.com
- Sign in with your Azure account

### 2. Find Your App Registration
- Go to **Azure Active Directory** > **App registrations**
- Search for your app with Client ID: `4ce58f9c-0db6-40ec-b4f0-e52300865218`

### 3. Generate New Client Secret
- Click on your app registration
- Go to **Certificates & secrets** in the left menu
- Under **Client secrets**, click **+ New client secret**
- Add description: "SecureOps Dashboard Secret"
- Set expiration (recommend 24 months)
- Click **Add**
- **IMPORTANT**: Copy the **Value** immediately (not the Secret ID)

### 4. Update Your .env File
Replace the CLIENT_SECRET in `/home/user/Dashboard/backend/.env` with the new value

### 5. Verify API Permissions
Your app needs these permissions:

#### Microsoft Graph API:
- `User.Read.All` (Application permission)
- `Directory.Read.All` (Application permission)

#### Microsoft Defender for Endpoint:
- `Machine.Read.All` (Application permission)

### 6. Grant Admin Consent
- In your app registration, go to **API permissions**
- Click **Grant admin consent for [Your Organization]**
- Confirm the consent

## Test Your Setup
After updating the client secret, run:
```bash
cd /home/user/Dashboard/backend
node test-api.js
```

This will verify if your credentials work with both Graph API and Defender API.