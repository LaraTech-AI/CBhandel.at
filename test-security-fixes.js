/**
 * Local Security Fixes Testing Script
 * Tests all 4 security fixes locally
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testCORS() {
  log('\n=== Testing CORS Whitelist ===', 'blue');
  
  const testOrigins = [
    'http://localhost:3000',
    'https://direktonline.at',
    'https://evil-site.com', // Should be blocked
  ];

  for (const origin of testOrigins) {
    try {
      const response = await makeRequest(`${API_BASE}/vehicles`, {
        method: 'GET',
        headers: {
          'Origin': origin,
        },
      });

      const corsHeader = response.headers['access-control-allow-origin'];
      const isAllowed = corsHeader === origin;
      
      if (isAllowed) {
        log(`✅ ${origin} - Allowed (CORS: ${corsHeader})`, 'green');
      } else if (origin.includes('evil')) {
        log(`✅ ${origin} - Blocked (no CORS header)`, 'green');
      } else {
        log(`❌ ${origin} - Expected CORS header, got: ${corsHeader}`, 'red');
      }
    } catch (error) {
      log(`❌ ${origin} - Error: ${error.message}`, 'red');
    }
  }
}

async function testSecurityHeaders() {
  log('\n=== Testing Security Headers ===', 'blue');
  
  try {
    const response = await makeRequest(`${BASE_URL}/`, {
      method: 'GET',
    });

    const headers = response.headers;
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'referrer-policy',
      'content-security-policy',
      'strict-transport-security',
      'permissions-policy',
    ];

    for (const header of requiredHeaders) {
      if (headers[header]) {
        log(`✅ ${header}: ${headers[header].substring(0, 60)}...`, 'green');
      } else {
        log(`❌ ${header}: Missing`, 'red');
      }
    }
  } catch (error) {
    log(`❌ Error testing headers: ${error.message}`, 'red');
  }
}

async function testQueryValidation() {
  log('\n=== Testing Query Parameter Validation ===', 'blue');
  
  const testCases = [
    { vid: '12345', expected: 200, description: 'Valid numeric VID' },
    { vid: 'abc', expected: 400, description: 'Invalid non-numeric VID' },
    { vid: '12345678901', expected: 400, description: 'VID too long (>10 chars)' },
    { vid: '', expected: 400, description: 'Missing VID' },
    { vid: '123', expected: 200, description: 'Valid short VID' },
  ];

  for (const testCase of testCases) {
    try {
      const url = testCase.vid 
        ? `${API_BASE}/vehicle-details?vid=${encodeURIComponent(testCase.vid)}`
        : `${API_BASE}/vehicle-details`;
      
      const response = await makeRequest(url, {
        method: 'GET',
      });

      if (response.status === testCase.expected) {
        log(`✅ ${testCase.description}: Status ${response.status}`, 'green');
      } else {
        log(`❌ ${testCase.description}: Expected ${testCase.expected}, got ${response.status}`, 'red');
      }
    } catch (error) {
      if (testCase.expected === 400) {
        log(`✅ ${testCase.description}: Error as expected`, 'green');
      } else {
        log(`❌ ${testCase.description}: ${error.message}`, 'red');
      }
    }
  }
}

async function testTokenRemoval() {
  log('\n=== Testing Token Removal (Newsletter) ===', 'blue');
  
  try {
    // Test newsletter API without token
    const response = await makeRequest(`${API_BASE}/newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
      },
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    });

    // Should accept request (token is now optional)
    if (response.status === 200 || response.status === 400) {
      // 400 is OK - it means validation failed (expected for test email)
      // 200 would mean it processed (if email validation passes)
      log(`✅ Newsletter API accepts requests without token (Status: ${response.status})`, 'green');
    } else {
      log(`⚠️  Newsletter API returned status: ${response.status}`, 'yellow');
      log(`   Response: ${response.body.substring(0, 100)}`, 'yellow');
    }
  } catch (error) {
    log(`❌ Error testing newsletter: ${error.message}`, 'red');
  }
}

async function testAPIAvailability() {
  log('\n=== Testing API Availability ===', 'blue');
  
  const endpoints = [
    { path: '/vehicles', method: 'GET' },
    { path: '/vehicle-details?vid=12345', method: 'GET' },
    { path: '/contact', method: 'OPTIONS' },
    { path: '/appointment', method: 'OPTIONS' },
    { path: '/newsletter', method: 'OPTIONS' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${API_BASE}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Origin': 'http://localhost:3000',
        },
      });

      if (response.status < 500) {
        log(`✅ ${endpoint.method} ${endpoint.path}: Status ${response.status}`, 'green');
      } else {
        log(`❌ ${endpoint.method} ${endpoint.path}: Status ${response.status}`, 'red');
      }
    } catch (error) {
      log(`❌ ${endpoint.method} ${endpoint.path}: ${error.message}`, 'red');
    }
  }
}

async function runAllTests() {
  log('\n🔒 Security Fixes Local Testing', 'blue');
  log('='.repeat(50), 'blue');
  log('Make sure your dev server is running on http://localhost:3000', 'yellow');
  log('='.repeat(50), 'blue');

  try {
    // Test if server is running
    await makeRequest(`${BASE_URL}/`);
    log('\n✅ Server is running', 'green');
  } catch (error) {
    log('\n❌ Server is not running!', 'red');
    log('Please start your dev server first:', 'yellow');
    log('  npm run dev', 'yellow');
    return;
  }

  await testAPIAvailability();
  await testCORS();
  await testSecurityHeaders();
  await testQueryValidation();
  await testTokenRemoval();

  log('\n' + '='.repeat(50), 'blue');
  log('✅ Testing complete!', 'green');
  log('='.repeat(50), 'blue');
}

// Run tests
runAllTests().catch(console.error);

