require('dotenv').config();
const axios = require('axios');

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

async function testDefenderAPI() {
    try {
        console.log('🔍 Testing raw Defender API response...');
        const token = await acquireAccessToken('https://api.securitycenter.microsoft.com/.default');
        
        const response = await axios.get('https://api.securitycenter.microsoft.com/api/machines?$top=10', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`📊 Checking ${response.data.value.length} devices for tags...`);
        
        let devicesWithTags = 0;
        response.data.value.forEach((device, index) => {
            if (device.machineTags && device.machineTags.length > 0) {
                devicesWithTags++;
                console.log(`🏷️ Device ${index + 1} (${device.computerDnsName}) has tags:`, device.machineTags);
            }
        });
        
        console.log(`📈 Summary: ${devicesWithTags} out of ${response.data.value.length} devices have tags`);
        
        if (devicesWithTags === 0) {
            console.log('💡 No devices have tags. Make sure you have added tags in Microsoft Defender portal.');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testDefenderAPI();