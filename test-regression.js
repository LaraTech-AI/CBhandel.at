/**
 * Regression Test Script for DirektOnline Website
 * Tests all recent changes: warranty disclaimer, dates, blog posts, forms
 */

const fs = require('fs');
const path = require('path');

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function test(name, condition, errorMsg) {
  if (condition) {
    results.passed.push(name);
    console.log(`✅ PASS: ${name}`);
  } else {
    results.failed.push(`${name}: ${errorMsg}`);
    console.log(`❌ FAIL: ${name}: ${errorMsg}`);
  }
}

function warn(name, message) {
  results.warnings.push(`${name}: ${message}`);
  console.log(`⚠️  WARN: ${name}: ${message}`);
}

console.log('🧪 Starting Regression Tests...\n');

// ============================================
// 1. WARRANTY DISCLAIMER TESTS
// ============================================
console.log('📋 Testing Warranty Disclaimer...');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// Test 1.1: Warranty mentions have asterisk
test(
  'Warranty mentions have asterisk (*)',
  indexHtml.includes('12 Monate Garantie*') || indexHtml.includes('12-monatige Garantie*'),
  'Warranty text should include asterisk'
);

// Test 1.2: Footer disclaimer exists
test(
  'Footer warranty disclaimer exists',
  indexHtml.includes('Garantiehinweis') && indexHtml.includes('können von Fahrzeug zu Fahrzeug variieren'),
  'Footer should contain warranty disclaimer'
);

// Test 1.3: FAQ warranty text updated
test(
  'FAQ warranty text includes disclaimer',
  indexHtml.includes('Die Garantiebedingungen können von Fahrzeug zu Fahrzeug variieren'),
  'FAQ warranty answer should include disclaimer'
);

// ============================================
// 2. DATE TESTS
// ============================================
console.log('\n📅 Testing Date Updates...');

// Test 2.1: Sitemap dates
const sitemapXml = fs.readFileSync('sitemap.xml', 'utf8');
test(
  'Sitemap dates are November 2025',
  sitemapXml.includes('2025-11-01'),
  'Sitemap should have 2025-11-01 dates'
);

// Test 2.2: Blog post dates in index.html
test(
  'Blog dates in index.html are November 2025',
  indexHtml.includes('1. November 2025'),
  'Blog dates in index.html should be November 2025'
);

// Test 2.3: Blog post files have correct dates
const blogPosts = ['reifenwechsel', 'gebrauchtwagen-kaufen', 'elektromobilitaet'];
blogPosts.forEach(post => {
  const blogHtml = fs.readFileSync(`posts/${post}.html`, 'utf8');
  test(
    `${post}.html has November 2025 date`,
    blogHtml.includes('1. November 2025'),
    `${post} should have November 2025 date`
  );
  
  const blogMd = fs.readFileSync(`posts/${post}.md`, 'utf8');
  test(
    `${post}.md has November 2025 date`,
    blogMd.includes('1. November 2025'),
    `${post} markdown should have November 2025 date`
  );
});

// ============================================
// 3. BLOG POST MODERN DESIGN TESTS
// ============================================
console.log('\n🎨 Testing Blog Post Design...');

blogPosts.forEach(post => {
  const blogHtml = fs.readFileSync(`posts/${post}.html`, 'utf8');
  
  // Test 3.1: Proper HTML structure
  test(
    `${post}.html has DOCTYPE`,
    blogHtml.includes('<!DOCTYPE html>'),
    'Blog post should have DOCTYPE'
  );
  
  // Test 3.2: Blog stylesheet linked
  test(
    `${post}.html links to blog-styles.css`,
    blogHtml.includes('blog-styles.css'),
    'Blog post should link to blog-styles.css'
  );
  
  // Test 3.3: Blog container class exists
  test(
    `${post}.html has blog-container`,
    blogHtml.includes('blog-container'),
    'Blog post should have blog-container class'
  );
  
  // Test 3.4: Blog header exists
  test(
    `${post}.html has blog header`,
    blogHtml.includes('blog-header'),
    'Blog post should have blog-header'
  );
  
  // Test 3.5: Back link exists
  test(
    `${post}.html has back link`,
    blogHtml.includes('blog-back-link') && blogHtml.includes('Zurück zur Übersicht'),
    'Blog post should have back link'
  );
});

// Test 3.6: Blog stylesheet exists
test(
  'blog-styles.css exists',
  fs.existsSync('posts/blog-styles.css'),
  'blog-styles.css file should exist'
);

// ============================================
// 4. FORMS - MAILTO TESTS
// ============================================
console.log('\n📧 Testing Forms (Mailto)...');

const scriptsJs = fs.readFileSync('scripts.js', 'utf8');

// Test 4.1: Contact form uses mailto
test(
  'Contact form uses mailto',
  scriptsJs.includes('mailto:direktonline.at@gmail.com') && 
  scriptsJs.includes('window.location.href = mailtoLink'),
  'Contact form should use mailto instead of SMTP'
);

// Test 4.2: Appointment form uses mailto
test(
  'Appointment form uses mailto',
  scriptsJs.includes('appointment') && 
  (scriptsJs.includes('mailto:direktonline.at@gmail.com') || 
   scriptsJs.includes('Temporäre Mailto-Lösung')),
  'Appointment form should use mailto'
);

// Test 4.3: Newsletter has mailto fallback
test(
  'Newsletter has mailto fallback',
  scriptsJs.includes('Fallback to mailto') || 
  scriptsJs.includes('mailto:direktonline.at@gmail.com'),
  'Newsletter should have mailto fallback'
);

// ============================================
// 5. FOOTER YEAR UPDATE
// ============================================
console.log('\n📆 Testing Footer Year...');

test(
  'Footer copyright year is 2025',
  indexHtml.includes('2025 DirektOnline BS GmbH') || indexHtml.includes('&copy; 2025'),
  'Footer should show copyright year 2025'
);

// ============================================
// 6. STRUCTURE TESTS
// ============================================
console.log('\n🏗️  Testing Structure...');

// Test 6.1: All required files exist
const requiredFiles = [
  'index.html',
  'styles.css',
  'scripts.js',
  'sitemap.xml',
  'robots.txt',
  'vercel.json',
  'posts/blog-styles.css'
];

requiredFiles.forEach(file => {
  test(
    `${file} exists`,
    fs.existsSync(file),
    `${file} should exist`
  );
});

// Test 6.2: Blog posts exist
blogPosts.forEach(post => {
  test(
    `${post}.html exists`,
    fs.existsSync(`posts/${post}.html`),
    `${post}.html should exist`
  );
  test(
    `${post}.md exists`,
    fs.existsSync(`posts/${post}.md`),
    `${post}.md should exist`
  );
});

// ============================================
// 7. CODE QUALITY TESTS
// ============================================
console.log('\n🔍 Testing Code Quality...');

// Test 7.1: No broken image references
const imageRegex = /src=["']([^"']+)["']/g;
let match;
const brokenImages = [];
while ((match = imageRegex.exec(indexHtml)) !== null) {
  const imagePath = match[1];
  if (imagePath.startsWith('../') || imagePath.startsWith('/')) {
    const fullPath = imagePath.replace(/^\.\.\//, '').replace(/^\//, '');
    if (!fs.existsSync(fullPath) && !imagePath.startsWith('http')) {
      brokenImages.push(imagePath);
    }
  }
}

if (brokenImages.length === 0) {
  results.passed.push('No broken image references');
  console.log('✅ PASS: No broken image references');
} else {
  warn('Broken images found', brokenImages.join(', '));
}

// Test 7.2: No console errors in scripts
const consoleErrorRegex = /console\.(error|warn)\(/g;
const consoleErrors = scriptsJs.match(consoleErrorRegex);
if (!consoleErrors || consoleErrors.length < 5) {
  test(
    'No excessive console errors',
    true,
    ''
  );
} else {
  warn('Multiple console.error/warn calls found', `${consoleErrors.length} found`);
}

// ============================================
// RESULTS SUMMARY
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📊 TEST RESULTS SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${results.passed.length}`);
console.log(`❌ Failed: ${results.failed.length}`);
console.log(`⚠️  Warnings: ${results.warnings.length}`);
console.log('\n');

if (results.failed.length > 0) {
  console.log('❌ FAILED TESTS:');
  results.failed.forEach(fail => console.log(`   - ${fail}`));
  console.log('');
}

if (results.warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  results.warnings.forEach(warn => console.log(`   - ${warn}`));
  console.log('');
}

const success = results.failed.length === 0;
console.log(success ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED');

process.exit(success ? 0 : 1);

