/**
 * Test script to fetch and inspect HTML from AutoScout24 and Landwirt
 */

async function testAutoScout24() {
  try {
    console.log('Testing AutoScout24 fetch...');
    const url = 'https://www.autoscout24.at/haendler/cb-handels-gmbh';
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
    });
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return;
    }
    
    const html = await response.text();
    console.log(`AutoScout24 HTML length: ${html.length}`);
    
    // Check for JSON-LD
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gs);
    console.log(`JSON-LD scripts found: ${jsonLdMatches ? jsonLdMatches.length : 0}`);
    
    // Check for vehicle links
    const vehicleLinks = html.match(/href=["'][^"']*fahrzeugdetails[^"']*vid=([^"'\s&]+)/gi);
    console.log(`Vehicle detail links found: ${vehicleLinks ? vehicleLinks.length : 0}`);
    if (vehicleLinks && vehicleLinks.length > 0) {
      console.log('Sample links:', vehicleLinks.slice(0, 3));
    }
    
    // Check for images
    const images = html.match(/https:\/\/prod\.pictures\.autoscout24\.net\/listing-images\/[^"'\s]+/gi);
    console.log(`AutoScout24 images found: ${images ? images.length : 0}`);
    if (images && images.length > 0) {
      console.log('Sample images:', images.slice(0, 3));
    }
    
    // Check for prices
    const prices = html.match(/€\s*([\d\s.]+)/g);
    console.log(`Prices found: ${prices ? prices.length : 0}`);
    if (prices && prices.length > 0) {
      console.log('Sample prices:', prices.slice(0, 5));
    }
    
    // Check for article/listings
    const articles = html.match(/<article[^>]*>/gi);
    console.log(`Article tags found: ${articles ? articles.length : 0}`);
    
    // Check for common vehicle listing patterns
    const listingPatterns = [
      /class=["'][^"']*vehicle[^"']*["']/gi,
      /class=["'][^"']*listing[^"']*["']/gi,
      /class=["'][^"']*card[^"']*["']/gi,
      /data-vehicle-id/gi,
      /data-id/gi
    ];
    
    listingPatterns.forEach((pattern, idx) => {
      const matches = html.match(pattern);
      console.log(`Pattern ${idx + 1} matches: ${matches ? matches.length : 0}`);
    });
    
    // Save a sample of HTML for inspection
    const sampleStart = html.indexOf('<body');
    const sampleEnd = Math.min(sampleStart + 50000, html.length);
    console.log('\n--- HTML Sample (first 50KB after body) ---');
    console.log(html.substring(sampleStart, sampleEnd));
    
  } catch (error) {
    console.error('Error testing AutoScout24:', error);
  }
}

async function testLandwirt() {
  try {
    console.log('\n\nTesting Landwirt.com fetch...');
    const url = 'https://www.landwirt.com/dealer/info/cb-handels-gmbh-10561/machines';
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return;
    }
    
    const html = await response.text();
    console.log(`Landwirt HTML length: ${html.length}`);
    
    // Check for JSON-LD
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gs);
    console.log(`JSON-LD scripts found: ${jsonLdMatches ? jsonLdMatches.length : 0}`);
    
    // Check for machine links
    const machineLinks = html.match(/href=["'][^"']*machines\/([^"'\s&]+)/gi);
    console.log(`Machine links found: ${machineLinks ? machineLinks.length : 0}`);
    if (machineLinks && machineLinks.length > 0) {
      console.log('Sample links:', machineLinks.slice(0, 3));
    }
    
    // Check for images
    const images = html.match(/https:\/\/images\.landwirt\.com\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/gi);
    console.log(`Landwirt images found: ${images ? images.length : 0}`);
    if (images && images.length > 0) {
      console.log('Sample images:', images.slice(0, 3));
    }
    
    // Check for prices
    const prices = html.match(/€\s*([\d\s.]+)/g);
    console.log(`Prices found: ${prices ? prices.length : 0}`);
    if (prices && prices.length > 0) {
      console.log('Sample prices:', prices.slice(0, 5));
    }
    
    // Check for Nuxt data
    const nuxtData = html.match(/window\.__NUXT__\s*=\s*({.*?});/s);
    console.log(`Nuxt data found: ${nuxtData ? 'Yes' : 'No'}`);
    
    // Save a sample of HTML for inspection
    const sampleStart = html.indexOf('<body');
    const sampleEnd = Math.min(sampleStart + 50000, html.length);
    console.log('\n--- HTML Sample (first 50KB after body) ---');
    console.log(html.substring(sampleStart, sampleEnd));
    
  } catch (error) {
    console.error('Error testing Landwirt:', error);
  }
}

// Run tests
testAutoScout24().then(() => testLandwirt());

