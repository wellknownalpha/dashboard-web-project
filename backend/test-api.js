require('dotenv').config();
const axios = require('axios');

const { TENANT_ID, CLIENT_ID, CLIENT_SECRET } = process.env;

console.log('Testing Microsoft API connectivity...');
console.log('Tenant ID:', TENANT_ID ? 'Set' : 'Missing');
console.log('Client ID:', CLIENT_ID ? 'Set' : 'Missing');
console.log('Client Secret:', CLIENT_SECRET ? 'Set' : 'Missing');

const testToken = async () => {
    try {
        const tokenEndpoint = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
        const params = new URLSearchParams();
        params.append('client_id', CLIENT_ID);
        params.append('scope', 'https://graph.microsoft.com/.default');
        params.append('client_secret', CLIENT_SECRET);
        params.append('grant_type', 'client_credentials');

        console.log('\nTesting Graph API token...');
        const response = await axios.post(tokenEndpoint, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        console.log('✅ Graph API token acquired successfully');
        
        // Test Graph API call
        const graphResponse = await axios.get('https://graph.microsoft.com/v1.0/users?$top=1', {
            headers: { Authorization: `Bearer ${response.data.access_token}` }
        });
        
        console.log('✅ Graph API call successful');
        console.log('Users found:', graphResponse.data.value.length);
        
    } catch (error) {
        console.log('❌ Graph API Error:', error.response?.data || error.message);
    }

    try {
        const tokenEndpoint = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
        const params = new URLSearchParams();
        params.append('client_id', CLIENT_ID);
        params.append('scope', 'https://api.securitycenter.microsoft.com/.default');
        params.append('client_secret', CLIENT_SECRET);
        params.append('grant_type', 'client_credentials');

        console.log('\nTesting Defender API token...');
        const response = await axios.post(tokenEndpoint, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        console.log('✅ Defender API token acquired successfully');
        
        // Test Defender API call
        const defenderResponse = await axios.get('https://api.securitycenter.microsoft.com/api/machines?$top=1', {
            headers: { Authorization: `Bearer ${response.data.access_token}` }
        });
        
        console.log('✅ Defender API call successful');
        console.log('Devices found:', defenderResponse.data.value.length);
        
    } catch (error) {
        console.log('❌ Defender API Error:', error.response?.data || error.message);
    }
};

testToken();