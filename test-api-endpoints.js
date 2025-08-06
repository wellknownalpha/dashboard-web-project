import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function testEndpoints() {
    console.log('🧪 Testing API endpoints...\n');
    
    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ Health check passed:', healthResponse.data);
        console.log('');
        
        // Test users endpoint
        console.log('2. Testing users endpoint...');
        const usersResponse = await axios.get(`${BASE_URL}/api/users`);
        console.log(`✅ Users endpoint working: ${usersResponse.data.length} users found`);
        if (usersResponse.data.length > 0) {
            console.log('   Sample user:', {
                displayName: usersResponse.data[0].displayName,
                mail: usersResponse.data[0].mail,
                department: usersResponse.data[0].department
            });
        }
        console.log('');
        
        // Test devices endpoint
        console.log('3. Testing devices endpoint...');
        const devicesResponse = await axios.get(`${BASE_URL}/api/devices`);
        console.log(`✅ Devices endpoint working: ${devicesResponse.data.length} devices found`);
        if (devicesResponse.data.length > 0) {
            console.log('   Sample device:', {
                deviceName: devicesResponse.data[0].deviceName,
                os: devicesResponse.data[0].os,
                healthStatus: devicesResponse.data[0].healthStatus,
                riskLevel: devicesResponse.data[0].riskLevel
            });
        }
        console.log('');
        
        console.log('🎉 All API endpoints are working correctly!');
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        console.log('\n💡 Make sure your backend server is running with: npm start');
    }
}

testEndpoints();