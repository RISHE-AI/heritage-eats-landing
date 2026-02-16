const axios = require('axios');

const API_URL = 'http://localhost:5000/api/admin';
const ADMIN_PASSWORD = 'admin@123'; // Default, or try specific if known

async function testAdminFlow() {
    try {
        console.log('1. Attempting Admin Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            password: ADMIN_PASSWORD
        });

        if (loginRes.data.success) {
            console.log('✅ Login Successful');
            const token = loginRes.data.token;
            console.log('Token received:', token.substring(0, 20) + '...');

            console.log('\n2. Attempting to fetch Stats...');
            const statsRes = await axios.get(`${API_URL}/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (statsRes.data.success) {
                console.log('✅ Stats Fetch Successful');
                console.log('Stats Data Keys:', Object.keys(statsRes.data.data));
            } else {
                console.log('❌ Stats Fetch Failed (Logic Error):', statsRes.data);
            }

        } else {
            console.log('❌ Login Failed:', loginRes.data);
        }

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    }
}

testAdminFlow();
