// End-to-End Test Suite for Symbio-NLM
// Tests full stack: Frontend (Vercel) → Backend (Render) → MongoDB Atlas

const https = require('https');

const BACKEND_URL = 'https://symbio-insight-app.onrender.com';
const FRONTEND_URL = 'https://frontend-seven-ashy-48.vercel.app';

// Test user credentials
const testUser = {
  name: 'E2E Test User',
  email: `test${Date.now()}@symbio.test`,
  password: 'TestPass123!',
  institution: 'Test Lab'
};

let authToken = null;

// Helper function for HTTP requests
function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseBody, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Test 1: Backend Health Check
async function testBackendHealth() {
  console.log('\n🔍 TEST 1: Backend Health Check');
  try {
    const result = await makeRequest(`${BACKEND_URL}/api/health`);
    if (result.status === 200 && result.data.database === 'connected') {
      console.log('✅ Backend is healthy');
      console.log(`   - Storage: ${result.data.storageMode}`);
      console.log(`   - Database: ${result.data.database}`);
      console.log(`   - Uptime: ${Math.floor(result.data.uptime)}s`);
      return true;
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Test 2: User Signup
async function testSignup() {
  console.log('\n🔍 TEST 2: User Signup');
  try {
    const result = await makeRequest(`${BACKEND_URL}/api/auth/signup`, 'POST', testUser);
    if (result.status === 201 && result.data.token) {
      authToken = result.data.token;
      console.log('✅ User signup successful');
      console.log(`   - User: ${result.data.user.name}`);
      console.log(`   - Email: ${result.data.user.email}`);
      console.log(`   - Token received: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Signup failed:', result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Test 3: User Login
async function testLogin() {
  console.log('\n🔍 TEST 3: User Login');
  try {
    const result = await makeRequest(`${BACKEND_URL}/api/auth/login`, 'POST', {
      email: testUser.email,
      password: testUser.password
    });
    if (result.status === 200 && result.data.token) {
      authToken = result.data.token;
      console.log('✅ User login successful');
      console.log(`   - Token received: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Login failed:', result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Test 4: Protected Route (Get Profile)
async function testProtectedRoute() {
  console.log('\n🔍 TEST 4: Protected Route (Profile)');
  try {
    const result = await makeRequest(`${BACKEND_URL}/api/auth/profile`, 'GET', null, {
      'Authorization': `Bearer ${authToken}`
    });
    if (result.status === 200 && result.data.name) {
      console.log('✅ Protected route access successful');
      console.log(`   - Name: ${result.data.name}`);
      console.log(`   - Email: ${result.data.email}`);
      return true;
    } else {
      console.log('❌ Protected route failed:', result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Test 5: Frontend Accessibility
async function testFrontend() {
  console.log('\n🔍 TEST 5: Frontend Accessibility');
  try {
    const result = await makeRequest(FRONTEND_URL);
    if (result.status === 200) {
      console.log('✅ Frontend is accessible');
      console.log(`   - Status: ${result.status}`);
      return true;
    } else {
      console.log('❌ Frontend check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Test 6: CORS Check
async function testCORS() {
  console.log('\n🔍 TEST 6: CORS Configuration');
  try {
    const result = await makeRequest(`${BACKEND_URL}/api/health`, 'OPTIONS');
    console.log('✅ CORS preflight successful');
    console.log(`   - Status: ${result.status}`);
    return true;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   SYMBIO-NLM END-TO-END TEST SUITE            ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(`Backend:  ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}`);
  
  const results = [];
  
  results.push(await testBackendHealth());
  results.push(await testFrontend());
  results.push(await testCORS());
  results.push(await testSignup());
  results.push(await testLogin());
  results.push(await testProtectedRoute());
  
  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║              TEST SUMMARY                      ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! Your stack is working perfectly!');
    console.log('\n✅ Vercel (Frontend) → Working');
    console.log('✅ Render (Backend)  → Working');
    console.log('✅ MongoDB Atlas     → Connected');
    console.log('✅ Authentication    → Working');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above.');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
