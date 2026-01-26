// Test API endpoints
const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err.message, err.code);
      reject(err);
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing API endpoints...\n');

  // 1. Health check
  console.log('1. GET /api/admin/health');
  const health = await makeRequest('/api/admin/health');
  console.log('   Status:', health.status);
  console.log('   Response:', JSON.stringify(health.data, null, 2));
  console.log();

  // 2. Database info
  console.log('2. GET /api/admin/database-info');
  const dbInfo = await makeRequest('/api/admin/database-info');
  console.log('   Status:', dbInfo.status);
  console.log('   Response:', JSON.stringify(dbInfo.data, null, 2));
  console.log();

  // 3. List sequences
  console.log('3. GET /api/sequences?limit=5');
  const seqList = await makeRequest('/api/sequences?limit=5');
  console.log('   Status:', seqList.status);
  console.log('   Response:', JSON.stringify(seqList.data, null, 2));
  console.log();

  // 4. Create new sequence
  console.log('4. POST /api/sequences (create test sequence)');
  const newSeq = await makeRequest('/api/sequences', 'POST', {
    fasta: '>TestSeq\nATGCATGCATGC',
    name: 'API Test Sequence',
    description: 'Created via test script'
  });
  console.log('   Status:', newSeq.status);
  console.log('   Response:', JSON.stringify(newSeq.data, null, 2));
  console.log();

  // 5. Verify sequences after creation
  console.log('5. GET /api/sequences?limit=10 (verify creation)');
  const verify = await makeRequest('/api/sequences?limit=10');
  console.log('   Status:', verify.status);
  console.log('   Total sequences:', verify.data?.meta?.total || 'N/A');
  console.log('   Sequences:', verify.data?.data?.map(s => ({ id: s.id, name: s.name, storageType: s.storageType })));
  console.log();

  console.log('✅ All tests completed!');
}

runTests().catch(err => {
  console.error('❌ Test error:', err.message);
  process.exit(1);
});
