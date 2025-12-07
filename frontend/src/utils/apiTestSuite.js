/**
 * API Integration Test Suite
 * Tests all endpoints to ensure they're working correctly
 * 
 * Usage: 
 * 1. Ensure backend is running on port 3002
 * 2. Ensure frontend is running on port 3000
 * 3. Run tests from browser console or test runner
 */

import {
  signup,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  createSequence,
  uploadSequenceFile,
  getSequences,
  getSequenceById,
  getSequenceMetadata,
  updateSequence,
  deleteSequence,
  bulkDeleteSequences,
  generateReport,
  getSequenceReport,
  getAggregateStats,
  searchSequences,
  generatePDFReport,
  checkHealth,
  parseError
} from '@/utils/sequenceApi.js';

// Test Configuration
const TEST_CONFIG = {
  testEmail: `test-${Date.now()}@example.com`,
  testPassword: 'TestPass123!',
  testName: 'Test User',
  testFasta: '>Test Sequence\nATGCATGCATGCATGC',
  testSequenceName: 'Test Sequence'
};

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Test Helper
function testResult(name, passed, error = null) {
  testResults.tests.push({
    name,
    passed,
    error: error?.message || error
  });

  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.error(`❌ ${name}`, error);
  }
}

// Test Suite
export async function runAllTests() {
  console.log('🧪 Starting API Integration Tests...\n');
  
  try {
    // 1. Health Check
    await testHealthCheck();
    
    // 2. Authentication Tests
    await testAuthentication();
    
    // 3. Sequence CRUD Tests
    await testSequenceCRUD();
    
    // 4. Search and Statistics Tests
    await testSearchAndStats();
    
    // 5. Report Generation Tests
    await testReportGeneration();
    
    // 6. Cleanup
    await testCleanup();
    
  } catch (error) {
    console.error('Test suite error:', error);
  }
  
  // Print Summary
  printTestSummary();
}

async function testHealthCheck() {
  console.log('📋 Health Check Tests\n');
  
  try {
    const health = await checkHealth();
    testResult('API Health Check', health?.status === 'ok');
  } catch (error) {
    testResult('API Health Check', false, error);
  }
}

async function testAuthentication() {
  console.log('\n🔐 Authentication Tests\n');
  
  let userId = null;
  
  try {
    // Test Signup
    const signupResult = await signup({
      name: TEST_CONFIG.testName,
      email: TEST_CONFIG.testEmail,
      password: TEST_CONFIG.testPassword
    });
    
    testResult(
      'Signup',
      signupResult?.id && signupResult?.token,
      !signupResult?.token ? new Error('No token returned') : null
    );
    
    userId = signupResult?.id;
    
    // Test Authentication Check
    testResult(
      'Is Authenticated (after signup)',
      isAuthenticated(),
      !isAuthenticated() ? new Error('Not authenticated') : null
    );
    
    // Test Get Current User
    const user = await getCurrentUser();
    testResult(
      'Get Current User',
      user?.email === TEST_CONFIG.testEmail,
      user?.email !== TEST_CONFIG.testEmail ? new Error('Email mismatch') : null
    );
    
    // Test Logout
    logout();
    testResult(
      'Logout',
      !isAuthenticated(),
      isAuthenticated() ? new Error('Still authenticated') : null
    );
    
    // Test Login
    const loginResult = await login({
      email: TEST_CONFIG.testEmail,
      password: TEST_CONFIG.testPassword
    });
    
    testResult(
      'Login',
      loginResult?.token && isAuthenticated(),
      !loginResult?.token ? new Error('No token') : null
    );
    
  } catch (error) {
    testResult('Authentication Flow', false, error);
  }
}

async function testSequenceCRUD() {
  console.log('\n📊 Sequence CRUD Tests\n');
  
  let sequenceId = null;
  
  try {
    // Test Create Sequence
    const createResult = await createSequence({
      fasta: TEST_CONFIG.testFasta,
      name: TEST_CONFIG.testSequenceName
    });
    
    sequenceId = createResult?.[0]?.id;
    testResult(
      'Create Sequence',
      sequenceId && createResult?.[0]?.length > 0,
      !sequenceId ? new Error('No ID returned') : null
    );
    
    // Test Get Sequence
    const getResult = await getSequenceById(sequenceId);
    testResult(
      'Get Sequence by ID',
      getResult?.id === sequenceId && getResult?.sequence === TEST_CONFIG.testFasta.split('\n')[1],
      getResult?.id !== sequenceId ? new Error('ID mismatch') : null
    );
    
    // Test Get Metadata (lightweight)
    const metaResult = await getSequenceMetadata(sequenceId);
    testResult(
      'Get Sequence Metadata',
      metaResult?.id === sequenceId && metaResult?.status === 'ok',
      metaResult?.id !== sequenceId ? new Error('ID mismatch') : null
    );
    
    // Test Update Sequence
    const updateResult = await updateSequence(sequenceId, {
      name: 'Updated Test Sequence'
    });
    
    testResult(
      'Update Sequence',
      updateResult?.name === 'Updated Test Sequence',
      updateResult?.name !== 'Updated Test Sequence' ? new Error('Update failed') : null
    );
    
    // Test Get All Sequences
    const listResult = await getSequences({ page: 1, limit: 10 });
    testResult(
      'Get Sequences List',
      Array.isArray(listResult?.data) && listResult?.meta?.page === 1,
      !Array.isArray(listResult?.data) ? new Error('Invalid response') : null
    );
    
    // Store ID for later tests
    window.testSequenceId = sequenceId;
    
  } catch (error) {
    testResult('Sequence CRUD', false, error);
  }
}

async function testSearchAndStats() {
  console.log('\n🔍 Search and Statistics Tests\n');
  
  try {
    // Test Search
    const searchResult = await searchSequences('Test', 10);
    testResult(
      'Search Sequences',
      searchResult?.query && Array.isArray(searchResult?.results),
      !searchResult?.query ? new Error('No query') : null
    );
    
    // Test Aggregate Statistics
    const statsResult = await getAggregateStats();
    testResult(
      'Get Aggregate Statistics',
      statsResult?.total >= 0 && statsResult?.avgLength >= 0,
      statsResult?.total === undefined ? new Error('No total') : null
    );
    
  } catch (error) {
    testResult('Search and Statistics', false, error);
  }
}

async function testReportGeneration() {
  console.log('\n📄 Report Generation Tests\n');
  
  try {
    const seqId = window.testSequenceId;
    
    if (!seqId) {
      console.warn('⚠️ Skipping report tests - no sequence ID available');
      return;
    }
    
    // Test Generate Report
    const reportResult = await generateReport(seqId);
    testResult(
      'Generate AI Report',
      reportResult?.aiSummary || reportResult?.message,
      !reportResult?.aiSummary && !reportResult?.message ? new Error('No report') : null
    );
    
    // Test Get Report
    const getReportResult = await getSequenceReport(seqId);
    testResult(
      'Get Sequence Report',
      getReportResult?.aiSummary || getReportResult?.id,
      getReportResult?.id !== seqId ? new Error('ID mismatch') : null
    );
    
    // Test PDF Generation
    try {
      // Note: This actually downloads a file, so we just test that it doesn't error
      await generatePDFReport([seqId], 'Test Report');
      testResult('Generate PDF Report', true);
    } catch (pdfError) {
      // PDF generation might fail in test environment without proper setup
      testResult('Generate PDF Report', false, pdfError);
    }
    
  } catch (error) {
    testResult('Report Generation', false, error);
  }
}

async function testCleanup() {
  console.log('\n🧹 Cleanup Tests\n');
  
  try {
    const seqId = window.testSequenceId;
    
    if (seqId) {
      // Test Delete Sequence
      await deleteSequence(seqId);
      testResult('Delete Sequence', true);
      
      // Test Verify Deletion (should error)
      try {
        await getSequenceById(seqId);
        testResult('Verify Deletion', false, new Error('Sequence still exists'));
      } catch {
        testResult('Verify Deletion', true);
      }
    }
    
    // Cleanup: Logout
    logout();
    testResult('Final Logout', !isAuthenticated());
    
  } catch (error) {
    testResult('Cleanup', false, error);
  }
}

function printTestSummary() {
  console.log('\n');
  console.log('═══════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.passed + testResults.failed}`);
  console.log(`📊 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
  console.log('═══════════════════════════════════════════\n');
  
  if (testResults.failed > 0) {
    console.log('Failed Tests:');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => {
        console.log(`  ❌ ${t.name}`);
        if (t.error) console.log(`     ${t.error}`);
      });
  }
}

// Run tests from browser console
if (typeof window !== 'undefined') {
  window.runTests = runAllTests;
  console.log('💡 Tip: Run tests with: runTests()');
}

export default { runAllTests };
