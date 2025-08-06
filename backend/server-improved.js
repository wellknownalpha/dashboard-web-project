require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

const { TENANT_ID, CLIENT_ID, CLIENT_SECRET } = process.env;

console.log('🚀 Starting SecureOps Backend Server...');
console.log('📋 Configuration Check:');
console.log(`   Tenant ID: ${TENANT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`   Client ID: ${CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`   Client Secret: ${CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`);

const acquireAccessToken = async (scope) => {
    const tokenEndpoint = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('scope', scope);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'client_credentials');

    try {
        const response = await axios.post(tokenEndpoint, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data.access_token;
    } catch (error) {
        console.error(`❌ Token acquisition failed for ${scope}:`, error.response?.data || error.message);
        throw error;
    }
};

app.get('/api/users', async (req, res) => {
    console.log('📊 Fetching ALL users with licenses from Microsoft Graph...');
    try {
        const token = await acquireAccessToken('https://graph.microsoft.com/.default');
        console.log('✅ Graph API token acquired successfully');
        
        let allUsers = [];
        let nextLink = 'https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,jobTitle,department,assignedLicenses&$top=999';
        
        // Fetch all users with pagination
        while (nextLink) {
            const response = await axios.get(nextLink, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            allUsers = allUsers.concat(response.data.value);
            nextLink = response.data['@odata.nextLink'];
            console.log(`📄 Fetched ${response.data.value.length} users (Total: ${allUsers.length})`);
        }
        
        // Filter users with Defender P2 or M365 Business Standard licenses
        const targetSkuIds = [
            'c7df2760-2c81-4ef7-b578-5b5392b571df', // Microsoft Defender for Endpoint P2
            'f245ecc8-75af-4f8e-b61f-27d8114de5f3', // Microsoft 365 Business Standard
            'cbdc14ab-d96c-4c30-b9f4-6ada7cdc1d46', // Microsoft 365 Business Premium
            '05e9a617-0261-4cee-bb44-138d3ef5d965'  // Microsoft 365 E3
        ];
        
        const filteredUsers = allUsers.filter(user => {
            if (!user.assignedLicenses || user.assignedLicenses.length === 0) return false;
            return user.assignedLicenses.some(license => targetSkuIds.includes(license.skuId));
        });
        
        // Fetch profile photos for filtered users
        const users = await Promise.all(filteredUsers.map(async (u) => {
            let photoUrl = `https://i.pravatar.cc/150?u=${u.mail}`; // fallback
            try {
                const photoResponse = await axios.get(`https://graph.microsoft.com/v1.0/users/${u.id}/photo/$value`, {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'arraybuffer'
                });
                const photoBase64 = Buffer.from(photoResponse.data).toString('base64');
                photoUrl = `data:image/jpeg;base64,${photoBase64}`;
            } catch (photoError) {
                // Keep fallback photo if real photo not available
            }
            
            return {
                ...u,
                role: 'Viewer',
                photoUrl
            };
        }));
        
        console.log(`✅ Successfully fetched ${allUsers.length} total users, ${users.length} with target licenses`);
        res.json(users);
    } catch (error) {
        console.error('❌ Failed to fetch users:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to fetch users from Microsoft Graph',
            details: error.response?.data || error.message,
            suggestion: 'Check your Azure app registration credentials and permissions'
        });
    }
});

app.get('/api/devices', async (req, res) => {
    console.log('🛡️ Fetching ALL devices from Microsoft Defender...');
    try {
        const token = await acquireAccessToken('https://api.securitycenter.microsoft.com/.default');
        console.log('✅ Defender API token acquired successfully');
        
        let allDevices = [];
        let skip = 0;
        const top = 1000;
        
        // Fetch all devices with pagination
        while (true) {
            const response = await axios.get(`https://api.securitycenter.microsoft.com/api/machines?$top=${top}&$skip=${skip}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.value.length === 0) break;
            
            allDevices = allDevices.concat(response.data.value);
            skip += top;
            console.log(`📄 Fetched ${response.data.value.length} devices (Total: ${allDevices.length})`);
            
            if (response.data.value.length < top) break;
        }

        const devices = allDevices.map(d => ({
            id: d.id,
            userId: d.lastLoggedOnUser?.aadUserId || d.lastLoggedOnUser?.userPrincipalName || 'unknown',
            deviceName: d.computerDnsName || d.deviceName,
            os: d.osPlatform,
            healthStatus: d.healthStatus,
            riskLevel: d.riskScore === 'High' ? 'High' : d.riskScore === 'Medium' ? 'Medium' : 'Low',
            lastSeen: d.lastSeen
        }));

        console.log(`✅ Successfully fetched ${devices.length} total devices`);
        res.json(devices);
    } catch (error) {
        console.error('❌ Failed to fetch devices:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to fetch devices from Microsoft Defender',
            details: error.response?.data || error.message,
            suggestion: 'Check your Azure app registration credentials and Defender API permissions'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'running',
        timestamp: new Date().toISOString(),
        config: {
            tenantId: TENANT_ID ? 'configured' : 'missing',
            clientId: CLIENT_ID ? 'configured' : 'missing',
            clientSecret: CLIENT_SECRET ? 'configured' : 'missing'
        }
    });
});

app.listen(port, () => {
    console.log(`🌐 Backend server running at http://localhost:${port}`);
    console.log(`📋 Health check: http://localhost:${port}/api/health`);
    console.log('');
    console.log('⚠️  If you see authentication errors:');
    console.log('   1. Check your Azure app registration client secret');
    console.log('   2. Ensure API permissions are granted');
    console.log('   3. Run: node test-api.js to verify credentials');
});