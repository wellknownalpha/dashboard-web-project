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
