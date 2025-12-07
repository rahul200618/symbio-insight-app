#!/usr/bin/env node

/**
 * API Testing Guide - Symbio-NLM PDF Generation
 * Run these commands to test the PDF generation endpoints
 */

// ============================================
// 1. TEST BACKEND PDF GENERATION ENDPOINT
// ============================================

// Using curl (Generate PDF from all sequences):
// curl -X POST http://localhost:3002/api/sequences/generate-pdf \
//   -H "Content-Type: application/json" \
//   -d '{"title": "Test Report"}' \
//   -o test-report.pdf

// Using fetch in browser console:
const testBackendPDF = async () => {
  const response = await fetch('http://localhost:3002/api/sequences/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sequenceIds: [], // Empty = all sequences
      title: 'Symbio-NLM Test Report'
    })
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-report.pdf';
    a.click();
    URL.revokeObjectURL(url);
    console.log('✓ Backend PDF downloaded successfully');
  } else {
    console.error('✗ Backend PDF generation failed:', response.status);
  }
};

// ============================================
// 2. TEST HEALTH ENDPOINT
// ============================================

const testHealth = async () => {
  const response = await fetch('http://localhost:3002/api/health');
  const data = await response.json();
  console.log('Health Status:', data);
  return data.database === 'connected';
};

// ============================================
// 3. TEST SEQUENCE LIST (to verify data exists)
// ============================================

const testSequenceList = async () => {
  const response = await fetch('http://localhost:3002/api/sequences?page=1&limit=10');
  const data = await response.json();
  console.log(`Found ${data.meta.total} sequences`);
  return data.data;
};

// ============================================
// 4. COMPLETE TEST WORKFLOW
// ============================================

const runAllTests = async () => {
  console.log('🧪 Starting Symbio-NLM API Tests...\n');

  // Test 1: Health Check
  console.log('1️⃣  Testing Health Endpoint...');
  try {
    const isHealthy = await testHealth();
    console.log(isHealthy ? '✓ Backend is healthy\n' : '✗ Backend database is disconnected\n');
  } catch (error) {
    console.error('✗ Health check failed:', error.message, '\n');
    return;
  }

  // Test 2: List Sequences
  console.log('2️⃣  Testing Sequence List...');
  try {
    const sequences = await testSequenceList();
    console.log(`✓ Found ${sequences.length} sequences\n`);
  } catch (error) {
    console.error('✗ Sequence list failed:', error.message, '\n');
  }

  // Test 3: PDF Generation
  console.log('3️⃣  Testing PDF Generation...');
  try {
    await testBackendPDF();
  } catch (error) {
    console.error('✗ PDF generation failed:', error.message, '\n');
  }

  console.log('✅ All tests completed!');
};

// ============================================
// EXPORT FOR USE IN BROWSER CONSOLE
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testBackendPDF,
    testHealth,
    testSequenceList,
    runAllTests
  };
}

// Run tests if called directly
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}

/**
 * HOW TO USE:
 * 
 * 1. In Browser Console:
 *    - Copy and paste runAllTests() and press Enter
 *    - Or test individually: testBackendPDF(), testHealth(), etc.
 * 
 * 2. From Terminal (requires Node.js):
 *    - node api-test.js
 * 
 * 3. With cURL:
 *    curl -X POST http://localhost:3002/api/sequences/generate-pdf \
 *      -H "Content-Type: application/json" \
 *      -d '{"title":"My Report"}' \
 *      -o report.pdf
 * 
 * EXPECTED RESULTS:
 * 
 * ✓ Health Endpoint Returns:
 *   {
 *     "status": "ok",
 *     "database": "connected",
 *     "databaseType": "SQLite",
 *     "version": "1.0.0"
 *   }
 * 
 * ✓ Sequence List Returns:
 *   {
 *     "data": [...],
 *     "meta": {
 *       "page": 1,
 *       "limit": 10,
 *       "total": 123,
 *       "totalPages": 13
 *     }
 *   }
 * 
 * ✓ PDF Generation Returns:
 *   (Binary PDF file as download)
 *   Content-Type: application/pdf
 * 
 * TROUBLESHOOTING:
 * 
 * If "Cannot connect to server":
 *   - Check if backend is running: npm run dev
 *   - Verify port 3002 is accessible
 *   - Check CORS configuration
 * 
 * If "No sequences found":
 *   - Upload a FASTA file first
 *   - Check database connection
 *   - Verify SQLite file exists
 * 
 * If "PDF generation failed":
 *   - Ensure pdfkit is installed: npm list pdfkit
 *   - Check backend logs for errors
 *   - Verify sequences have valid data
 */
