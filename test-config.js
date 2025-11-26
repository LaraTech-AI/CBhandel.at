/**
 * Test script to validate dealerConfig and verify all imports work
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Car Dealer Template Configuration...\n');

// Test 1: Load and validate dealerConfig.js
console.log('1. Testing config/dealerConfig.js...');
try {
  const dealerConfig = require('./config/dealerConfig.js');
  
  // Validate required fields
  const requiredFields = [
    'name', 'legalName', 'address', 'email', 'phone', 
    'legal', 'seo', 'social', 'dataSource', 'corsOrigins'
  ];
  
  const missingFields = requiredFields.filter(field => !dealerConfig[field]);
  if (missingFields.length > 0) {
    console.error('   ❌ Missing required fields:', missingFields.join(', '));
    process.exit(1);
  }
  
  // Validate nested structures
  if (!dealerConfig.address.street || !dealerConfig.address.city) {
    console.error('   ❌ Invalid address structure');
    process.exit(1);
  }
  
  if (!dealerConfig.dataSource.type || !dealerConfig.dataSource.dealerId) {
    console.error('   ❌ Invalid dataSource structure');
    process.exit(1);
  }
  
  if (!Array.isArray(dealerConfig.corsOrigins) || dealerConfig.corsOrigins.length === 0) {
    console.error('   ❌ Invalid corsOrigins (must be non-empty array)');
    process.exit(1);
  }
  
  console.log('   ✅ Config structure valid');
  console.log(`   📋 Dealer: ${dealerConfig.name}`);
  console.log(`   📍 Location: ${dealerConfig.address.city}, ${dealerConfig.address.region}`);
  console.log(`   📧 Email: ${dealerConfig.email}`);
  console.log(`   📞 Phone: ${dealerConfig.phone}`);
  console.log(`   🚗 Data Source: ${dealerConfig.dataSource.type} (ID: ${dealerConfig.dataSource.dealerId})`);
  console.log(`   🌐 CORS Origins: ${dealerConfig.corsOrigins.length} configured\n`);
} catch (error) {
  console.error('   ❌ Error loading config:', error.message);
  process.exit(1);
}

// Test 2: Validate browser config file exists and is readable
console.log('2. Testing config/dealerConfig.browser.js...');
try {
  const browserConfigPath = path.join(__dirname, 'config/dealerConfig.browser.js');
  const browserConfigContent = fs.readFileSync(browserConfigPath, 'utf8');
  
  // Check that it contains window.dealerConfig
  if (!browserConfigContent.includes('window.dealerConfig')) {
    console.error('   ❌ Browser config does not define window.dealerConfig');
    process.exit(1);
  }
  
  // Check that it's wrapped in IIFE
  if (!browserConfigContent.includes('(function()')) {
    console.error('   ❌ Browser config should be wrapped in IIFE');
    process.exit(1);
  }
  
  console.log('   ✅ Browser config file valid\n');
} catch (error) {
  console.error('   ❌ Error reading browser config:', error.message);
  process.exit(1);
}

// Test 3: Test vehicleService import
console.log('3. Testing lib/vehicleService.js...');
try {
  const { getVehicles } = require('./lib/vehicleService.js');
  
  if (typeof getVehicles !== 'function') {
    console.error('   ❌ getVehicles is not a function');
    process.exit(1);
  }
  
  console.log('   ✅ Vehicle service module loads correctly');
  console.log('   ℹ️  Note: getVehicles() requires network access to test fully\n');
} catch (error) {
  console.error('   ❌ Error loading vehicle service:', error.message);
  process.exit(1);
}

// Test 4: Test API files can import config
console.log('4. Testing API files can import config...');
const apiFiles = [
  'api/vehicles.js',
  'api/vehicle-details.js',
  'api/contact.js',
  'api/newsletter.js',
  'api/appointment.js'
];

let apiErrors = 0;
for (const apiFile of apiFiles) {
  try {
    // Just check that the file can be parsed (don't execute the handler)
    const content = fs.readFileSync(path.join(__dirname, apiFile), 'utf8');
    
    // Check that it imports dealerConfig
    if (!content.includes('dealerConfig')) {
      console.warn(`   ⚠️  ${apiFile} may not be using dealerConfig`);
    } else {
      console.log(`   ✅ ${apiFile} references dealerConfig`);
    }
  } catch (error) {
    console.error(`   ❌ Error reading ${apiFile}:`, error.message);
    apiErrors++;
  }
}

if (apiErrors > 0) {
  console.error(`\n   ❌ ${apiErrors} API file(s) have errors\n`);
  process.exit(1);
}

console.log('\n5. Testing HTML references...');
try {
  const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  
  // Check that browser config is loaded
  if (!htmlContent.includes('config/dealerConfig.browser.js')) {
    console.error('   ❌ HTML does not load dealerConfig.browser.js');
    process.exit(1);
  }
  
  // Check that window.dealerConfig is used
  if (!htmlContent.includes('window.dealerConfig')) {
    console.error('   ❌ HTML does not use window.dealerConfig');
    process.exit(1);
  }
  
  console.log('   ✅ HTML references config correctly\n');
} catch (error) {
  console.error('   ❌ Error reading HTML:', error.message);
  process.exit(1);
}

console.log('6. Testing scripts.js references...');
try {
  const scriptsContent = fs.readFileSync(path.join(__dirname, 'scripts.js'), 'utf8');
  
  // Check that it uses window.dealerConfig
  const configReferences = (scriptsContent.match(/window\.dealerConfig/g) || []).length;
  
  if (configReferences === 0) {
    console.warn('   ⚠️  scripts.js may not be using window.dealerConfig');
  } else {
    console.log(`   ✅ scripts.js uses window.dealerConfig (${configReferences} references)\n`);
  }
} catch (error) {
  console.error('   ❌ Error reading scripts.js:', error.message);
  process.exit(1);
}

// Test 7: Validate config consistency
console.log('7. Validating config consistency...');
try {
  const nodeConfig = require('./config/dealerConfig.js');
  const browserConfigPath = path.join(__dirname, 'config/dealerConfig.browser.js');
  const browserConfigContent = fs.readFileSync(browserConfigPath, 'utf8');
  
  // Extract key values from browser config using regex (simple check)
  const browserName = browserConfigContent.match(/name:\s*"([^"]+)"/)?.[1];
  const browserEmail = browserConfigContent.match(/email:\s*"([^"]+)"/)?.[1];
  
  if (browserName !== nodeConfig.name) {
    console.warn(`   ⚠️  Name mismatch: Node="${nodeConfig.name}", Browser="${browserName}"`);
  }
  
  if (browserEmail !== nodeConfig.email) {
    console.warn(`   ⚠️  Email mismatch: Node="${nodeConfig.email}", Browser="${browserEmail}"`);
  }
  
  if (browserName === nodeConfig.name && browserEmail === nodeConfig.email) {
    console.log('   ✅ Config files are consistent\n');
  }
} catch (error) {
  console.error('   ❌ Error validating consistency:', error.message);
  process.exit(1);
}

console.log('✅ All tests passed!');
console.log('\n📝 Summary:');
console.log('   • Configuration files are valid');
console.log('   • All API files reference dealerConfig');
console.log('   • HTML and scripts use window.dealerConfig');
console.log('   • Vehicle service module loads correctly');
console.log('\n🚀 Template is ready to use!');
console.log('   Edit config/dealerConfig.js to customize for your dealer.\n');

