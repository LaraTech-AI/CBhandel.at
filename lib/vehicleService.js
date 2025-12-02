/**
 * Vehicle Service - Abstraction layer for vehicle data fetching
 * Supports multiple data sources (currently motornetzwerk, extensible for others)
 */

// Suppress DEP0169 deprecation warning from dependencies (puppeteer-core/@sparticuz/chromium)
// This warning is from dependencies using deprecated url.parse(), not our code
// Our code uses the WHATWG URL API (new URL())
// Suppress only if not explicitly disabled (allows enabling in dev for debugging)
if (process.env.SUPPRESS_DEPRECATION !== 'false') {
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = function(warning, type, code, ...args) {
    // Suppress only DEP0169 (url.parse deprecation) warnings from dependencies
    if (code === 'DEP0169' || (typeof warning === 'string' && warning.includes('DEP0169')) ||
        (warning && typeof warning === 'object' && warning.code === 'DEP0169')) {
      // Silently ignore - this is from dependencies we can't control
      return;
    }
    // Allow other warnings to be emitted normally
    return originalEmitWarning.apply(process, [warning, type, code, ...args]);
  };
}

const dealerConfig = require('../config/dealerConfig.js');

/**
 * Resolve a URL relative to a base URL using WHATWG URL API (replaces deprecated url.parse)
 * @param {string} url - Relative or absolute URL
 * @param {string} baseUrl - Base URL to resolve against
 * @returns {string} Resolved absolute URL
 */
function resolveUrl(url, baseUrl) {
  if (!url) return null;
  if (!baseUrl) return url;
  
  try {
    // If URL is already absolute, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Use WHATWG URL API to resolve relative URLs
    return new URL(url, baseUrl).href;
  } catch (e) {
    // Fallback to string concatenation if URL parsing fails
    console.warn(`URL resolution failed for ${url} with base ${baseUrl}:`, e.message);
    if (url.startsWith('/')) {
      try {
        const base = new URL(baseUrl);
        return `${base.origin}${url}`;
      } catch (e2) {
        return url;
      }
    }
    return url;
  }
}

/**
 * Parse vehicle data from HTML
 */
function parseVehicles(html, baseUrl) {
  const vehicles = [];

  try {
    console.log("Parsing vehicles from HTML, length:", html.length);

    // Try multiple patterns for articles (different HTML structures)
    let articles = [];

    // Pattern 1: Standard article tags
    const articleRegex = /<article[^>]*>(.*?)<\/article>/gs;
    articles = html.match(articleRegex) || [];

    console.log("Found articles with <article> tag:", articles.length);

    // Pattern 2: Try div with vehicle class/id
    if (articles.length === 0) {
      const divRegex =
        /<div[^>]*(?:class|id)=["'][^"']*vehicle[^"']*["'][^>]*>(.*?)<\/div>/gs;
      const divMatches = html.match(divRegex) || [];
      console.log("Found divs with vehicle class/id:", divMatches.length);

      // Try another pattern for list items
      const liRegex =
        /<li[^>]*(?:class|id)=["'][^"']*(?:vehicle|fahrzeug)[^"']*["'][^>]*>(.*?)<\/li>/gs;
      const liMatches = html.match(liRegex) || [];
      console.log("Found list items with vehicle class:", liMatches.length);

      // Use whichever pattern found results
      if (divMatches.length > 0) {
        articles = divMatches;
      } else if (liMatches.length > 0) {
        articles = liMatches;
      }
    }

    console.log("Using", articles.length, "articles/items for parsing");

    articles.slice(0, 12).forEach((articleHtml, index) => {
      try {
        // Extract vehicle ID from URL
        const vidMatch = articleHtml.match(/vid=(\d+)/);
        const vehicleId = vidMatch ? vidMatch[1] : `vehicle-${index}`;

        // Extract price
        const priceMatch = articleHtml.match(/class="price">€\s*([\d.]+)/);
        const price = priceMatch
          ? parseInt(priceMatch[1].replace(/\./g, ""))
          : null;

        // Extract image
        const imgMatch = articleHtml.match(/<img[^>]+src="([^"]+)"/);
        const imageSrc = imgMatch ? imgMatch[1] : null;

        // Extract title
        const titleMatch = articleHtml.match(/<h3[^>]*>\s*([^<]+)</);
        const altMatch = articleHtml.match(/alt="([^"]+)"/);
        const title = (
          titleMatch ? titleMatch[1].trim() : altMatch ? altMatch[1] : ""
        ).replace(/^\s*|\s*$/g, "");

        // Extract URL
        const urlMatch = articleHtml.match(
          /href="([^"]*fahrzeugdetails[^"]*vid=\d+[^"]*)"/
        );
        const url = urlMatch ? urlMatch[1].replace(/&amp;/g, "&") : null;

        // Extract specifications
        const specMatches = articleHtml.match(/<li>(.*?)<\/li>/g) || [];
        let year = null;
        let mileage = null;
        let fuelType = null;
        let power = null;
        let transmission = null;

        if (specMatches.length > 0) {
          const firstSpec = specMatches[0]
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          // Parse year: "EZ: 2019"
          const yearMatch = firstSpec.match(/EZ:\s*(\d{4})/);
          year = yearMatch ? parseInt(yearMatch[1]) : null;

          // Parse mileage: "130.438 km"
          const kmMatch = firstSpec.match(/(\d{1,3}(?:\.\d{3})*)\s*km/);
          mileage = kmMatch ? parseInt(kmMatch[1].replace(/\./g, "")) : null;

          // Parse fuel type: "// Benzin"
          const parts = firstSpec.split("//");
          if (parts.length >= 3) {
            fuelType = parts[2].trim();
          }

          // Parse power and transmission from second spec
          if (specMatches.length > 1) {
            const secondSpec = specMatches[1]
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim();

            // Parse power: "59 kw / 80 PS"
            const powerMatch = secondSpec.match(/(\d+)\s*kw\s*\/\s*(\d+)\s*PS/);
            if (powerMatch) {
              power = {
                kw: parseInt(powerMatch[1]),
                ps: parseInt(powerMatch[2]),
              };
            }

            // Parse transmission: "// Automatik" or "// Schaltgetriebe"
            const transParts = secondSpec.split("//");
            if (transParts.length >= 2) {
              transmission = transParts[transParts.length - 1].trim();
            }
          }
        }

        // Only add if we have at least title and price
        if (title && price && vehicleId) {
          vehicles.push({
            id: vehicleId,
            title: title,
            price: price,
            year: year,
            mileage: mileage,
            fuelType: fuelType || null,
            power: power,
            transmission: transmission || null,
            image: imageSrc,
            url:
              url ||
              resolveUrl(`/fahrzeugdetails?vid=${vehicleId}`, baseUrl),
          });
          console.log(`Successfully parsed vehicle ${index + 1}:`, title);
        } else {
          console.warn(
            `Skipping vehicle ${
              index + 1
            }: missing title (${!!title}), price (${!!price}), or ID (${!!vehicleId})`
          );
          console.log(
            `Sample HTML (first 500 chars):`,
            articleHtml.substring(0, 500)
          );
        }
      } catch (e) {
        console.error(`Error parsing vehicle ${index}:`, e.message);
        console.log(
          `Sample HTML (first 500 chars):`,
          articleHtml.substring(0, 500)
        );
      }
    });
  } catch (e) {
    console.error("Error parsing vehicles:", e.message);
  }

  return vehicles;
}

/**
 * Fetch vehicles from a specific source URL - Try JSON API endpoints first, then HTML
 * @param {string} apiUrl - JSON API endpoint URL
 * @param {string} sourceUrl - HTML source URL for fallback
 * @param {string} category - Vehicle category ('pkw' or 'nutzfahrzeuge')
 * @param {string} baseUrl - Base URL for constructing vehicle detail URLs
 * @returns {Promise<Array>} Array of vehicle objects
 */
async function fetchVehiclesFromSource(apiUrl, sourceUrl, category = "pkw", baseUrl) {
  // Ensure fetch is available (Node 18+)
  if (typeof fetch === "undefined") {
    throw new Error("fetch is not available. Node.js 18+ required.");
  }

  // Use the actual JSON API endpoint for both PKW and Nutzfahrzeuge
  // (they use different endpoints: php-wrapper.php for PKW, php-wrapper-truck.php for Nutzfahrzeuge)
  try {
    console.log(`Fetching ${category} from JSON API: ${apiUrl}`);
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`API response not ok: ${response.status}`);
    }

    const data = await response.json();
    console.log(`${category} API returned data with keys:`, Object.keys(data));

    if (data && Array.isArray(data.vehicles)) {
      console.log(
        `Found ${data.vehicles.length} ${category} vehicles in API response`
      );

      // Use all vehicles from API (the endpoint already filters correctly)
      let filteredVehicles = data.vehicles;

      // Transform API data to our expected format
      const transformedVehicles = filteredVehicles
        .map((vehicle, index) => {
          // Price comes as string like "36990.0" - use parseFloat directly (dot is decimal separator, not thousand)
          const priceValue =
            typeof vehicle.price === "string"
              ? parseFloat(vehicle.price)
              : vehicle.price || 0;
          const price = Math.round(priceValue);
          const title = vehicle.modelName || vehicle.type || "Fahrzeug";
          const vehicleId = vehicle.id || `${category}-${index}`;

          // Only include vehicles with required fields
          if (!title || !price || price === 0) {
            console.warn(
              `Skipping ${category} vehicle ${index}: missing title (${!!title}) or price (${price})`
            );
            return null;
          }

          return {
            id: vehicleId,
            title: title,
            price: price,
            year: vehicle.registrationYear
              ? parseInt(vehicle.registrationYear)
              : null,
            mileage: vehicle.mileage
              ? parseInt(
                  String(vehicle.mileage).replace(/\./g, "").replace(",", "")
                )
              : null,
            fuelType: vehicle.fuelName || null,
            power:
              vehicle.engineEffectKw && vehicle.engineEffectPs
                ? {
                    kw: parseInt(vehicle.engineEffectKw),
                    ps: parseInt(vehicle.engineEffectPs),
                  }
                : null,
            transmission: vehicle.transmissionName || null,
            image: vehicle.image || vehicle.imageThumb || null,
            allImages:
              vehicle.allImages || (vehicle.image ? [vehicle.image] : []),
            vehicleType: vehicle.vehicleTypeName || null,
            warranty: vehicle.warranty || false,
            defectsLiability: vehicle.defectsLiability || false,
            category: category, // Add category to distinguish vehicle type
            url: resolveUrl(`/fahrzeugdetails?vid=${vehicleId}`, baseUrl),
          };
        })
        .filter((v) => v !== null); // Remove any null entries

      console.log(
        `Transformed ${transformedVehicles.length} ${category} vehicles`
      );
      return transformedVehicles;
    }

    console.log(`${category} API response doesn't have vehicles array`);
  } catch (e) {
    console.error(`${category} JSON API failed:`, e.message);
    // Fall through to Puppeteer/HTML scraping
  }

  // Fallback: Use Puppeteer to render JavaScript and extract vehicles
  try {
    console.log(`Trying Puppeteer to render ${category} JavaScript content...`);

    let puppeteer;
    try {
      puppeteer = require("puppeteer-core");
    } catch (e) {
      console.log("Puppeteer not available, falling back to HTML fetch");
      throw new Error("Puppeteer not installed");
    }

    const chromium = require("@sparticuz/chromium");
    chromium.setGraphicsMode(false);

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      );

      console.log(`Navigating to ${category}:`, sourceUrl);
      await page.goto(sourceUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait for content to render
      await page.waitForTimeout(5000);

      // Try waiting for vehicle elements
      try {
        await page.waitForSelector('article, .vehicle, [class*="vehicle"]', {
          timeout: 5000,
        });
      } catch (e) {
        console.log(
          `${category} vehicle selector not found, continuing anyway`
        );
      }

      const html = await page.content();
      console.log(`${category} rendered HTML length:`, html.length);

      await browser.close();

      const vehicles = parseVehicles(html, baseUrl);
      // Add category to parsed vehicles
      vehicles.forEach((v) => (v.category = category));
      console.log(
        `Parsed ${vehicles.length} ${category} vehicles from Puppeteer`
      );

      if (vehicles.length > 0) {
        return vehicles;
      }
    } catch (error) {
      await browser.close();
      throw error;
    }
  } catch (puppeteerError) {
    console.log(
      `${category} Puppeteer failed, trying HTML fetch:`,
      puppeteerError.message
    );

    // Last resort: Simple HTML fetch
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log(`${category} fetched HTML length:`, html.length);

    const vehicles = parseVehicles(html, baseUrl);
    // Add category to parsed vehicles
    vehicles.forEach((v) => (v.category = category));
    console.log(`Parsed ${vehicles.length} ${category} vehicles count`);

    return vehicles;
  }
}

/**
 * Fetch vehicles from motornetzwerk
 */
async function fetchFromMotornetzwerk(dealerId, apiEndpoints, sourceUrls, baseUrl) {
  try {
    // Fetch both vehicle types in parallel
    console.log("Starting to fetch both regular vehicles and nutzfahrzeuge...");

    const [regularVehicles, nutzfahrzeuge] = await Promise.allSettled([
      fetchVehiclesFromSource(apiEndpoints.pkw, sourceUrls.pkw, "pkw", baseUrl),
      fetchVehiclesFromSource(
        apiEndpoints.nutzfahrzeuge,
        sourceUrls.nutzfahrzeuge,
        "nutzfahrzeuge",
        baseUrl
      ),
    ]);

    let allVehicles = [];

    // Add regular vehicles
    if (
      regularVehicles.status === "fulfilled" &&
      Array.isArray(regularVehicles.value)
    ) {
      allVehicles = allVehicles.concat(regularVehicles.value);
      console.log(`Added ${regularVehicles.value.length} regular vehicles`);
    } else {
      console.warn(
        "Failed to fetch regular vehicles:",
        regularVehicles.reason?.message
      );
    }

    // Add nutzfahrzeuge
    if (
      nutzfahrzeuge.status === "fulfilled" &&
      Array.isArray(nutzfahrzeuge.value)
    ) {
      allVehicles = allVehicles.concat(nutzfahrzeuge.value);
      console.log(`Added ${nutzfahrzeuge.value.length} nutzfahrzeuge`);
    } else {
      console.warn(
        "Failed to fetch nutzfahrzeuge:",
        nutzfahrzeuge.reason?.message
      );
    }

    console.log(
      `Total vehicles fetched: ${allVehicles.length} (${
        allVehicles.filter((v) => v.category === "pkw").length
      } PKW + ${
        allVehicles.filter((v) => v.category === "nutzfahrzeuge").length
      } Nutzfahrzeuge)`
    );

    return allVehicles;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
}

/**
 * Parse vehicles from willhaben dealer page HTML
 */
function parseWillhabenVehicles(html, baseUrl) {
  const vehicles = [];
  
  try {
    console.log("Parsing vehicles from willhaben HTML, length:", html.length);
    
    // Method 1: Extract from structured data (JSON-LD) - most reliable
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gs;
    const jsonLdMatches = html.match(jsonLdRegex) || [];
    
    let structuredData = null;
    for (const match of jsonLdMatches) {
      try {
        const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
        const parsed = JSON.parse(jsonContent);
        if (parsed['@type'] === 'ItemList' && Array.isArray(parsed.itemListElement)) {
          structuredData = parsed;
          console.log(`Found ItemList with ${parsed.itemListElement.length} items`);
          break;
        }
      } catch (e) {
        // Not valid JSON or not ItemList, continue
      }
    }
    
    // Method 2: Extract vehicle IDs from links in HTML
    const vehicleLinkRegex = /href="\/iad\/gebrauchtwagen\/d\/auto\/[^"]*\/(\d+)\/"/g;
    const linkMatches = [...html.matchAll(vehicleLinkRegex)];
    const vehicleIdsFromLinks = [...new Set(linkMatches.map(m => m[1]))];
    
    console.log(`Found ${vehicleIdsFromLinks.length} unique vehicle IDs from links`);
    
    // Use structured data if available, otherwise use links
    let vehicleIds = [];
    if (structuredData && structuredData.itemListElement) {
      // Extract IDs from structured data URLs
      structuredData.itemListElement.forEach((item) => {
        if (item.url) {
          // Try multiple patterns to extract ID
          const idMatch = item.url.match(/\/(\d+)\//) || 
                         item.url.match(/-(\d+)\//) ||
                         item.url.match(/(\d+)$/);
          if (idMatch) {
            vehicleIds.push(idMatch[1]);
          }
        }
      });
      console.log(`Extracted ${vehicleIds.length} vehicle IDs from structured data`);
    }
    
    // Fallback to links if structured data didn't provide IDs
    if (vehicleIds.length === 0 && vehicleIdsFromLinks.length > 0) {
      vehicleIds = vehicleIdsFromLinks;
      console.log(`Using vehicle IDs from links: ${vehicleIds.length}`);
    }
    
    // Process each vehicle
    vehicleIds.forEach((vehicleId, index) => {
      try {
        // Get structured data item if available
        const structuredItem = structuredData && structuredData.itemListElement && structuredData.itemListElement[index] 
          ? structuredData.itemListElement[index] 
          : null;
        
        // Find the vehicle card section in HTML
        const vehicleIdPattern = new RegExp(`id="${vehicleId}"[^>]*>([\\s\\S]*?)(?=<div[^>]*id="\\d+"|$)`, 'i');
        const vehicleMatch = html.match(vehicleIdPattern);
        
        if (!vehicleMatch) {
          console.warn(`Could not find HTML section for vehicle ${vehicleId}`);
          return;
        }
        
        const vehicleHtml = vehicleMatch[1];
        
        // Extract title from h3 tag or structured data
        let title = 'Fahrzeug';
        if (structuredItem && structuredItem.item && structuredItem.item.name) {
          title = structuredItem.item.name.replace(/<[^>]+>/g, '').trim();
        } else {
          const titleMatch = vehicleHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
          if (titleMatch) {
            title = titleMatch[1]
              .replace(/<[^>]+>/g, '')
              .replace(/\s+/g, ' ')
              .trim();
          }
        }
        
        // Extract price - look for data-testid with price or structured data
        let price = null;
        if (structuredItem && structuredItem.item && structuredItem.item.offers) {
          const offerPrice = structuredItem.item.offers.price || structuredItem.item.offers.priceCurrency;
          if (offerPrice && typeof offerPrice === 'string') {
            price = parseInt(offerPrice.replace(/[^\d]/g, ''));
          } else if (typeof offerPrice === 'number') {
            price = offerPrice;
          }
        }
        if (!price) {
          const priceMatch = vehicleHtml.match(/data-testid="[^"]*price[^"]*"[^>]*>€\s*([\d.]+)/) ||
                            vehicleHtml.match(/€\s*([\d.]+)/);
          if (priceMatch) {
            price = parseInt(priceMatch[1].replace(/\./g, ''));
          }
        }
        
        // Extract image
        const imgMatch = vehicleHtml.match(/src="(https:\/\/cache\.willhaben\.at[^"]*_hoved\.jpg[^"]*)"/) ||
                        vehicleHtml.match(/src="([^"]*cache\.willhaben\.at[^"]*_hoved[^"]*)"/);
        const image = imgMatch ? imgMatch[1] : null;
        
        // Extract year (EZ)
        const yearMatch = vehicleHtml.match(/data-testid="[^"]*attributes[^"]*-0"[^>]*>[\s\S]*?<span[^>]*>(\d{4})<\/span>/) ||
                         vehicleHtml.match(/(\d{4})\s*EZ/);
        const year = yearMatch ? parseInt(yearMatch[1]) : null;
        
        // Extract mileage (km)
        const kmMatch = vehicleHtml.match(/data-testid="[^"]*attributes[^"]*-1"[^>]*>[\s\S]*?<span[^>]*>([\d.]+)<\/span>/) ||
                       vehicleHtml.match(/([\d.]+)\s*km/);
        const mileage = kmMatch ? parseInt(kmMatch[1].replace(/\./g, '')) : null;
        
        // Extract power (PS and kW) from attribute-2
        // Structure: <span>150</span><span>PS (110 kW)</span>
        const powerAttrMatch = vehicleHtml.match(/data-testid="[^"]*attributes[^"]*-2"[^>]*>[\s\S]*?<span[^>]*>(\d{1,4})<\/span>[\s\S]*?<span[^>]*>[\s\S]*?PS\s*\((\d+)\s*kW\)/);
        const power = powerAttrMatch ? {
          ps: parseInt(powerAttrMatch[1]),
          kw: parseInt(powerAttrMatch[2])
        } : null;
        
        // Extract fuel type and transmission from subheader
        const subheaderMatch = vehicleHtml.match(/data-testid="[^"]*subheader[^"]*"[^>]*>([^<]+)</);
        const subheader = subheaderMatch ? subheaderMatch[1] : '';
        let fuelType = null;
        let transmission = null;
        
        if (subheader.includes('Diesel')) fuelType = 'Diesel';
        else if (subheader.includes('Benzin')) fuelType = 'Benzin';
        else if (subheader.includes('Elektro')) fuelType = 'Elektro';
        else if (subheader.includes('Hybrid')) fuelType = 'Hybrid';
        
        if (subheader.includes('Automatik')) transmission = 'Automatik';
        else if (subheader.includes('Schaltgetriebe')) transmission = 'Schaltgetriebe';
        else if (subheader.includes('Schaltung')) transmission = 'Schaltgetriebe';
        
        // Get URL from structured data or construct it
        const willhabenBase = 'https://www.willhaben.at';
        let vehicleUrl = `${willhabenBase}/iad/gebrauchtwagen/d/auto/vw-multivan-trendline-2-0-tdi-4motion-bmt-dsg-mod-${vehicleId}/`;
        if (structuredItem && structuredItem.url) {
          vehicleUrl = resolveUrl(structuredItem.url, willhabenBase);
        } else if (structuredItem && structuredItem.item && structuredItem.item.url) {
          vehicleUrl = resolveUrl(structuredItem.item.url, willhabenBase);
        }
        
        // DETECT CATEGORY - Multiple methods for better accuracy
        let category = 'pkw'; // Default
        
        // Method 1: Check URL pattern - Willhaben uses different URL patterns for categories
        const urlLower = vehicleUrl.toLowerCase();
        if (urlLower.includes('/nutzfahrzeuge/') || 
            urlLower.includes('/transporter/') || 
            urlLower.includes('/lkw/') ||
            urlLower.includes('/bus/') ||
            urlLower.includes('/van/')) {
          category = 'nutzfahrzeuge';
        }
        
        // Method 2: Check structured data for category/vehicleType
        if (structuredItem && structuredItem.item) {
          const item = structuredItem.item;
          // Check for category in structured data
          if (item.category) {
            const catLower = String(item.category).toLowerCase();
            if (catLower.includes('nutzfahrzeug') || catLower.includes('transporter') || 
                catLower.includes('lkw') || catLower.includes('bus') || catLower.includes('van')) {
              category = 'nutzfahrzeuge';
            }
          }
          // Check for vehicleType
          if (item.vehicleType) {
            const vtLower = String(item.vehicleType).toLowerCase();
            if (vtLower.includes('nutzfahrzeug') || vtLower.includes('transporter') || 
                vtLower.includes('lkw') || vtLower.includes('bus') || vtLower.includes('van')) {
              category = 'nutzfahrzeuge';
            }
          }
          // Check for additionalProperty or other metadata
          if (item.additionalProperty && Array.isArray(item.additionalProperty)) {
            const hasNutzfahrzeug = item.additionalProperty.some(prop => {
              const propValue = String(prop.value || prop.name || '').toLowerCase();
              return propValue.includes('nutzfahrzeug') || propValue.includes('transporter') || 
                     propValue.includes('lkw') || propValue.includes('bus') || propValue.includes('van');
            });
            if (hasNutzfahrzeug) {
              category = 'nutzfahrzeuge';
            }
          }
        }
        
        // Method 3: Check HTML attributes/classes for category indicators
        const htmlCategoryMatch = vehicleHtml.match(/class="[^"]*(?:nutzfahrzeug|transporter|lkw|bus|van)[^"]*"/i) ||
                                 vehicleHtml.match(/data-category="[^"]*(?:nutzfahrzeug|transporter|lkw|bus|van)[^"]*"/i) ||
                                 vehicleHtml.match(/data-vehicle-type="[^"]*(?:nutzfahrzeug|transporter|lkw|bus|van)[^"]*"/i);
        if (htmlCategoryMatch) {
          category = 'nutzfahrzeuge';
        }
        
        // Method 4: Fallback to title keywords (only if no other method found category)
        if (category === 'pkw') {
          const titleLower = title.toLowerCase();
          const isNutzfahrzeug = 
            titleLower.includes('transporter') ||
            titleLower.includes('kastenwagen') ||
            titleLower.includes('nutzfahrzeug') ||
            titleLower.includes('lkw') ||
            titleLower.includes('van') ||
            titleLower.includes('bus') ||
            titleLower.includes('multivan') ||
            titleLower.includes('sprinter') ||
            titleLower.includes('crafter') ||
            titleLower.includes('master') ||
            titleLower.includes('ducato') ||
            titleLower.includes('boxer') ||
            titleLower.includes('jumper') ||
            titleLower.includes('daily') ||
            titleLower.includes('iveco') ||
            titleLower.includes('man') ||
            titleLower.includes('mercedes-benz sprinter') ||
            titleLower.includes('vw transporter') ||
            titleLower.includes('ford transit');
          
          if (isNutzfahrzeug) {
            category = 'nutzfahrzeuge';
          }
        }
        
        if (title && price) {
          vehicles.push({
            id: vehicleId,
            title: title,
            price: price,
            year: year,
            mileage: mileage,
            fuelType: fuelType,
            power: power,
            transmission: transmission,
            image: image,
            url: vehicleUrl,
            category: category
          });
          console.log(`Successfully parsed willhaben vehicle ${index + 1}: ${title} - €${price} (${category})`);
        } else {
          console.warn(`Skipping vehicle ${vehicleId}: missing title (${!!title}) or price (${price})`);
        }
      } catch (e) {
        console.error(`Error parsing vehicle ${vehicleId}:`, e.message);
      }
    });
    
  } catch (e) {
    console.error("Error parsing willhaben vehicles:", e.message);
  }
  
  return vehicles;
}

/**
 * Fetch vehicles from willhaben dealer page
 */
async function fetchFromWillhaben(dealerSlug, baseUrl) {
  try {
    console.log(`Fetching vehicles from willhaben for dealer: ${dealerSlug}`);
    
    const dealerUrl = `https://www.willhaben.at/iad/haendler/${dealerSlug}/auto`;
    
    // Fetch the page
    const response = await fetch(dealerUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`Fetched willhaben page, HTML length: ${html.length}`);
    
    const vehicles = parseWillhabenVehicles(html, baseUrl);
    console.log(`Parsed ${vehicles.length} vehicles from willhaben`);
    
    return vehicles;
  } catch (error) {
    console.error("Error fetching vehicles from willhaben:", error);
    throw error;
  }
}

/**
 * Parse vehicles from AutoScout24 dealer page HTML
 */
function parseAutoscoutVehicles(html, category = 'pkw') {
  const vehicles = [];
  
  try {
    console.log(`Parsing AutoScout24 vehicles (${category}), HTML length: ${html.length}`);
    
    // AutoScout24 uses article elements for vehicle listings
    // Pattern: Find all vehicle listing sections
    const listingRegex = /<article[^>]*>[\s\S]*?<\/article>/gi;
    const listings = html.match(listingRegex) || [];
    
    console.log(`Found ${listings.length} article elements`);
    
    // Also try to find vehicle cards by looking for price patterns
    if (listings.length === 0) {
      // Try alternative pattern - look for vehicle data in the page
      const cardRegex = /class="[^"]*ListItem[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
      const cards = html.match(cardRegex) || [];
      console.log(`Found ${cards.length} ListItem elements`);
    }
    
    // Extract vehicle data from each listing
    listings.forEach((listingHtml, index) => {
      try {
        // Extract title
        const titleMatch = listingHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) ||
                          listingHtml.match(/title="([^"]+)"/) ||
                          listingHtml.match(/<a[^>]*>[\s\S]*?([A-Z][a-zA-Z]+\s+[^\<]+)</);
        let title = 'Fahrzeug';
        if (titleMatch) {
          title = titleMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        }
        
        // Extract price - look for € symbol followed by numbers
        const priceMatch = listingHtml.match(/€\s*([\d\s.]+)/) ||
                          listingHtml.match(/(\d{1,3}(?:\.\d{3})*)\s*€/);
        let price = null;
        if (priceMatch) {
          price = parseInt(priceMatch[1].replace(/\s/g, '').replace(/\./g, ''));
        }
        
        // Extract image - try multiple patterns
        let image = null;
        const imgPatterns = [
          /src="(https:\/\/[^"]*autoscout24[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i,
          /data-src="(https:\/\/[^"]*autoscout24[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i,
          /srcset="([^"]*autoscout24[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i,
          /src="(https:\/\/[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i
        ];
        
        for (const pattern of imgPatterns) {
          const imgMatch = listingHtml.match(pattern);
          if (imgMatch && imgMatch[1]) {
            image = imgMatch[1].split(',')[0].trim();
            // Decode HTML entities
            image = image.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
            // Clean up malformed URLs
            if (image.includes('&gt;') || image.includes('&lt;')) {
              image = image.replace(/&[a-z]+;/gi, '');
            }
            break;
          }
        }
        
        // Extract URL
        const urlMatch = listingHtml.match(/href="(\/angebote\/[^"]+)"/) ||
                        listingHtml.match(/href="([^"]*autoscout24[^"]*\/angebote\/[^"]+)"/);
        let url = null;
        if (urlMatch) {
          url = resolveUrl(urlMatch[1], 'https://www.autoscout24.at');
        }
        
        // Extract vehicle ID from URL or generate one
        let vehicleId = `autoscout-${index}`;
        if (url) {
          const idMatch = url.match(/\/(\d+)(?:\?|$|\/)/);
          if (idMatch) vehicleId = idMatch[1];
        }
        
        // Extract year
        const yearMatch = listingHtml.match(/(\d{2})\/(\d{4})/) ||
                         listingHtml.match(/Erstzulassung[^>]*>[\s\S]*?(\d{4})/);
        let year = null;
        if (yearMatch) {
          year = parseInt(yearMatch[2] || yearMatch[1]);
          if (year < 100) year += 2000; // Convert 2-digit year
        }
        
        // Extract mileage
        const kmMatch = listingHtml.match(/([\d\s.]+)\s*km/i);
        let mileage = null;
        if (kmMatch) {
          mileage = parseInt(kmMatch[1].replace(/\s/g, '').replace(/\./g, ''));
        }
        
        // Extract power
        const powerMatch = listingHtml.match(/(\d+)\s*kW\s*\((\d+)\s*PS\)/) ||
                          listingHtml.match(/(\d+)\s*PS/);
        let power = null;
        if (powerMatch) {
          if (powerMatch[2]) {
            power = { kw: parseInt(powerMatch[1]), ps: parseInt(powerMatch[2]) };
          } else {
            const ps = parseInt(powerMatch[1]);
            power = { ps: ps, kw: Math.round(ps * 0.7355) };
          }
        }
        
        // Extract fuel type
        let fuelType = null;
        if (listingHtml.includes('Diesel')) fuelType = 'Diesel';
        else if (listingHtml.includes('Benzin')) fuelType = 'Benzin';
        else if (listingHtml.includes('Elektro')) fuelType = 'Elektro';
        else if (listingHtml.includes('Hybrid')) fuelType = 'Hybrid';
        
        // Extract transmission
        let transmission = null;
        if (listingHtml.includes('Automatik')) transmission = 'Automatik';
        else if (listingHtml.includes('Schaltgetriebe')) transmission = 'Schaltgetriebe';
        
        if (title && title !== 'Fahrzeug' && price && price > 0) {
          vehicles.push({
            id: vehicleId,
            title: title,
            price: price,
            year: year,
            mileage: mileage,
            fuelType: fuelType,
            power: power,
            transmission: transmission,
            image: image,
            url: url,
            category: category
          });
          console.log(`Parsed AutoScout24 vehicle: ${title} - €${price}`);
        }
      } catch (e) {
        console.error(`Error parsing AutoScout24 listing ${index}:`, e.message);
      }
    });
    
    // If no vehicles found with article pattern, try JSON-LD
    if (vehicles.length === 0) {
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
      if (jsonLdMatch) {
        jsonLdMatch.forEach(match => {
          try {
            const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
            const data = JSON.parse(jsonContent);
            if (data['@type'] === 'ItemList' && data.itemListElement) {
              console.log(`Found ItemList with ${data.itemListElement.length} items in JSON-LD`);
            }
          } catch (e) {
            // Not valid JSON
          }
        });
      }
    }
    
  } catch (e) {
    console.error("Error parsing AutoScout24 vehicles:", e.message);
  }
  
  return vehicles;
}

/**
 * Fetch vehicles from AutoScout24 dealer page
 */
async function fetchFromAutoscout(dealerSlug, baseUrl) {
  try {
    console.log(`Fetching vehicles from AutoScout24 for dealer: ${dealerSlug}`);
    
    const allVehicles = [];
    
    // Helper function to fetch with Puppeteer fallback
    async function fetchWithPuppeteer(url, category) {
      // First try simple HTML fetch
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const html = await response.text();
        console.log(`Fetched ${category} page, HTML length: ${html.length}`);
        
        const vehicles = parseAutoscoutFromHtml(html, category, dealerSlug);
        
        // If we found vehicles, return them
        if (vehicles.length > 0) {
          console.log(`Found ${vehicles.length} ${category} from HTML`);
          return vehicles;
        }
        
        // If no vehicles found, try Puppeteer
        console.log(`No vehicles found in HTML, trying Puppeteer for ${category}...`);
        throw new Error('No vehicles in HTML, need Puppeteer');
      } catch (htmlError) {
        // Try Puppeteer as fallback
        try {
          let puppeteer;
          try {
            puppeteer = require("puppeteer-core");
          } catch (e) {
            console.log("Puppeteer not available for AutoScout24");
            return [];
          }
          
          const chromium = require("@sparticuz/chromium");
          chromium.setGraphicsMode(false);
          
          const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
          });
          
          try {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            
            console.log(`Navigating to ${category}: ${url}`);
            await page.goto(url, {
              waitUntil: 'networkidle2',
              timeout: 30000,
            });
            
            // Wait for vehicle listings to load
            await page.waitForTimeout(5000);
            
            try {
              await page.waitForSelector('article, [class*="vehicle"], [class*="listing"]', {
                timeout: 5000,
              });
            } catch (e) {
              console.log(`${category} vehicle selector not found, continuing anyway`);
            }
            
            const html = await page.content();
            console.log(`${category} Puppeteer rendered HTML length: ${html.length}`);
            
            await browser.close();
            
            const vehicles = parseAutoscoutFromHtml(html, category, dealerSlug);
            console.log(`Found ${vehicles.length} ${category} from Puppeteer`);
            return vehicles;
          } catch (error) {
            await browser.close();
            throw error;
          }
        } catch (puppeteerError) {
          console.error(`Puppeteer failed for ${category}:`, puppeteerError.message);
          return [];
        }
      }
    }
    
    // Fetch cars (PKW)
    const carsUrl = `https://www.autoscout24.at/haendler/${dealerSlug}`;
    const cars = await fetchWithPuppeteer(carsUrl, 'pkw');
    allVehicles.push(...cars);
    
    // Fetch transporters (Nutzfahrzeuge)
    const transporterUrl = `https://www.autoscout24.at/haendler/${dealerSlug}?atype=X`;
    const transporters = await fetchWithPuppeteer(transporterUrl, 'nutzfahrzeuge');
    
    // Filter out duplicates
    const existingIds = new Set(allVehicles.map(v => v.id));
    const newTransporters = transporters.filter(t => !existingIds.has(t.id));
    allVehicles.push(...newTransporters);
    
    console.log(`Total vehicles from AutoScout24: ${allVehicles.length}`);
    return allVehicles;
  } catch (error) {
    console.error("Error fetching vehicles from AutoScout24:", error);
    // Don't throw - return empty array so other sources can still work
    return [];
  }
}

/**
 * Parse AutoScout24 HTML using Willhaben pattern: Extract IDs first, then process individually
 */
function parseAutoscoutFromHtml(html, category, dealerSlug) {
  const vehicles = [];
  
  try {
    console.log("Parsing vehicles from AutoScout24 HTML, length:", html.length);
    
    // FIRST: Try to extract from structured data (JSON-LD) - most reliable
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gs;
    const jsonLdMatches = [...html.matchAll(jsonLdRegex)];
    
    let structuredData = null;
    let vehicleIdentifiers = [];
    
    for (const match of jsonLdMatches) {
      try {
        const jsonContent = match[1].trim();
        const data = JSON.parse(jsonContent);
        if (data['@type'] === 'ItemList' && Array.isArray(data.itemListElement)) {
          structuredData = data;
          console.log(`Found ItemList with ${data.itemListElement.length} items in JSON-LD`);
          
          // Extract vehicle identifiers from structured data
          data.itemListElement.forEach((item) => {
            if (item.item) {
              const identifier = item.item.identifier || item.item.sku || item.item['@id'] || null;
              if (identifier) {
                vehicleIdentifiers.push({
                  id: identifier,
                  url: item.item.url || item.url || null,
                  structuredData: item.item
                });
              }
            }
          });
          break;
        }
      } catch (e) {
        // Not valid JSON or not ItemList, continue
      }
    }
    
    // SECOND: Extract vehicle identifiers from article tags (AutoScout24 uses <article id="uuid">)
    if (vehicleIdentifiers.length === 0) {
      // AutoScout24 uses <article id="uuid"> pattern
      const articleIdRegex = /<article[^>]*id=["']([a-f0-9-]{36})["'][^>]*>/gi;
      const articleMatches = [...html.matchAll(articleIdRegex)];
      const idsFromArticles = [...new Set(articleMatches.map(m => m[1]))];
      
      // Also try to find vehicle IDs in /angebote/ links (new AutoScout24 URL format)
      const angeboteLinkRegex = /href=["']\/angebote\/[^"']*-([a-f0-9-]{36})["']/gi;
      const angeboteMatches = [...html.matchAll(angeboteLinkRegex)];
      const idsFromAngebote = [...new Set(angeboteMatches.map(m => m[1]))];
      
      // Also try old format: /fahrzeugdetails?vid=
      const vehicleLinkRegex = /href=["'][^"']*fahrzeugdetails[^"']*vid=([^"'\s&]+)/gi;
      const linkMatches = [...html.matchAll(vehicleLinkRegex)];
      const idsFromLinks = [...new Set(linkMatches.map(m => m[1]))];
      
      // Also try data attributes
      const dataIdRegex = /data-vehicle-id=["']([^"']+)["']/gi;
      const dataMatches = [...html.matchAll(dataIdRegex)];
      const idsFromData = [...new Set(dataMatches.map(m => m[1]))];
      
      // Combine and deduplicate
      const allIds = [...new Set([...idsFromArticles, ...idsFromAngebote, ...idsFromLinks, ...idsFromData])];
      
      vehicleIdentifiers = allIds.map(id => ({ id, url: null, structuredData: null }));
      console.log(`Found ${vehicleIdentifiers.length} vehicle identifiers from articles/links/data attributes`);
    }
    
    // THIRD: If still no identifiers, extract from image UUIDs (each unique image = one vehicle)
    if (vehicleIdentifiers.length === 0) {
      const imageUuidRegex = /https:\/\/prod\.pictures\.autoscout24\.net\/listing-images\/([a-f0-9-]+)_/gi;
      const imageMatches = [...html.matchAll(imageUuidRegex)];
      const uniqueUuids = [...new Set(imageMatches.map(m => m[1]))];
      
      vehicleIdentifiers = uniqueUuids.map(uuid => ({ id: uuid, url: null, structuredData: null }));
      console.log(`Found ${vehicleIdentifiers.length} vehicle identifiers from image UUIDs`);
    }
    
    // FALLBACK: If no identifiers found, try price-based extraction (like old method)
    if (vehicleIdentifiers.length === 0) {
      console.log("No identifiers found, trying price-based extraction as fallback...");
      
      // Extract all images first
      const imageUuidRegex = /https:\/\/prod\.pictures\.autoscout24\.net\/listing-images\/([a-f0-9-]+)_([a-f0-9-]+)\.(?:jpg|jpeg|webp)([^"'\s]*)/gi;
      const imageMatches = [];
      let match;
      while ((match = imageUuidRegex.exec(html)) !== null) {
        imageMatches.push({
          fullUrl: match[0],
          vehicleUuid: match[1],
          imageUuid: match[2],
          suffix: match[3],
          position: match.index
        });
      }
      
      // Group images by vehicle UUID
      const imagesByVehicleUuid = new Map();
      imageMatches.forEach(img => {
        if (!imagesByVehicleUuid.has(img.vehicleUuid)) {
          imagesByVehicleUuid.set(img.vehicleUuid, img);
        } else {
          const existing = imagesByVehicleUuid.get(img.vehicleUuid);
          if (img.suffix.includes('480x360') && !existing.suffix.includes('480x360')) {
            imagesByVehicleUuid.set(img.vehicleUuid, img);
          }
        }
      });
      
      // Find prices and extract vehicles around them
      const pricePattern = /€\s*([\d\s.]+)/g;
      const priceMatches = [...html.matchAll(pricePattern)];
      
      priceMatches.forEach((priceMatch, idx) => {
        const price = parseInt(priceMatch[1].replace(/\s/g, '').replace(/\./g, ''));
        if (!price || price < 1000 || price > 500000) return;
        
        // Get context around price
        const startPos = Math.max(0, priceMatch.index - 3000);
        const endPos = Math.min(html.length, priceMatch.index + 2000);
        const context = html.substring(startPos, endPos);
        
        // Find image in context
        const imageInContext = context.match(/https:\/\/prod\.pictures\.autoscout24\.net\/listing-images\/([a-f0-9-]+)_[a-f0-9-]+\.(?:jpg|jpeg|webp)[^"'\s]*/i);
        if (imageInContext) {
          const vehicleUuid = imageInContext[0].match(/\/([a-f0-9-]+)_/)[1];
          
          // Check if we already have this UUID
          if (!vehicleIdentifiers.find(v => v.id === vehicleUuid)) {
            vehicleIdentifiers.push({
              id: vehicleUuid,
              url: null,
              structuredData: null,
              price: price,
              context: context
            });
          }
        }
      });
      
      console.log(`Found ${vehicleIdentifiers.length} vehicles using price-based fallback`);
    }
    
    // FINAL FALLBACK: If still nothing, try extracting from any price + image combinations
    if (vehicleIdentifiers.length === 0) {
      console.log("Trying final fallback: extracting from price + image combinations...");
      
      // Find all prices
      const allPrices = [...html.matchAll(/€\s*([\d\s.]+)/g)];
      // Find all images
      const allImages = [...html.matchAll(/https:\/\/prod\.pictures\.autoscout24\.net\/listing-images\/([a-f0-9-]+)_[a-f0-9-]+\.(?:jpg|jpeg|webp)[^"'\s]*/gi)];
      
      // Try to match prices with nearby images
      allPrices.forEach((priceMatch, pIdx) => {
        const price = parseInt(priceMatch[1].replace(/\s/g, '').replace(/\./g, ''));
        if (!price || price < 1000 || price > 500000) return;
        
        // Find nearest image
        const pricePos = priceMatch.index;
        let nearestImage = null;
        let minDistance = Infinity;
        
        allImages.forEach(imgMatch => {
          const distance = Math.abs(imgMatch.index - pricePos);
          if (distance < minDistance && distance < 5000) {
            minDistance = distance;
            nearestImage = imgMatch;
          }
        });
        
        if (nearestImage) {
          const vehicleUuid = nearestImage[0].match(/\/([a-f0-9-]+)_/)[1];
          if (!vehicleIdentifiers.find(v => v.id === vehicleUuid)) {
            vehicleIdentifiers.push({
              id: vehicleUuid,
              url: null,
              structuredData: null,
              price: price,
              imageUrl: nearestImage[0]
            });
          }
        }
      });
      
      console.log(`Found ${vehicleIdentifiers.length} vehicles using final fallback`);
    }
    
    if (vehicleIdentifiers.length === 0) {
      console.warn("No vehicle identifiers found in AutoScout24 HTML after all fallbacks");
      return [];
    }
    
    // Pre-collect all images for efficient matching (simplified and optimized)
    const imagePool = new Map(); // Map vehicle UUID to best image URL
    const imageRegex = /https:\/\/prod\.pictures\.autoscout24\.net\/listing-images\/([a-f0-9-]+)_[a-f0-9-]+\.(?:jpg|jpeg|webp)([^"'\s]*)/gi;
    let imgMatch;
    while ((imgMatch = imageRegex.exec(html)) !== null) {
      const vehicleUuid = imgMatch[1];
      const suffix = imgMatch[2] || '';
      const fullUrl = imgMatch[0];
      
      // Prefer 480x360 over 250x188, store best quality per vehicle
      if (!imagePool.has(vehicleUuid)) {
        imagePool.set(vehicleUuid, fullUrl);
      } else {
        const existing = imagePool.get(vehicleUuid);
        if (suffix.includes('480x360') && !existing.includes('480x360')) {
          imagePool.set(vehicleUuid, fullUrl);
        }
      }
    }
    console.log(`Collected ${imagePool.size} unique vehicle images.`);
    
    console.log(`Processing ${vehicleIdentifiers.length} vehicles from AutoScout24`);
    
    // FOURTH: Process each vehicle individually (like Willhaben does)
    vehicleIdentifiers.forEach((vehicleInfo, index) => {
      try {
        if (!vehicleInfo || !vehicleInfo.id) {
          console.warn(`Skipping invalid vehicle info at index ${index}`);
          return;
        }
        const vehicleId = vehicleInfo.id;
        // Escape special regex characters in vehicleId
        const escapedVehicleId = vehicleId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Find the vehicle's HTML section - look for the identifier in various ways
        let vehicleHtml = null;
        
        // Method 1: Look for article with exact ID match (AutoScout24 pattern)
        const articleIdPattern = new RegExp(`<article[^>]*id=["']${escapedVehicleId}["'][^>]*>([\\s\\S]*?)<\\/article>`, 'i');
        const articleIdMatch = html.match(articleIdPattern);
        if (articleIdMatch) {
          vehicleHtml = articleIdMatch[1];
        }
        
        // Method 1b: Look for article containing the ID anywhere
        if (!vehicleHtml) {
          const articlePattern = new RegExp(`<article[^>]*[^>]*>([\\s\\S]*?${escapedVehicleId}[\\s\\S]*?)<\\/article>`, 'i');
          const articleMatch = html.match(articlePattern);
          if (articleMatch) {
            vehicleHtml = articleMatch[1];
          }
        }
        
        // Method 2: Look for div with data-vehicle-id or similar
        if (!vehicleHtml) {
          const dataPattern = new RegExp(`<div[^>]*data-vehicle-id=["']${escapedVehicleId}["'][^>]*>([\\s\\S]*?)(?=<div[^>]*data-vehicle-id|$)`, 'i');
          const dataMatch = html.match(dataPattern);
          if (dataMatch) {
            vehicleHtml = dataMatch[1];
          }
        }
        
        // Method 3: Look for context around image UUID
        if (!vehicleHtml && vehicleId.match(/^[a-f0-9-]+$/)) {
          const uuidPattern = new RegExp(`([\\s\\S]{0,3000}?listing-images\\/${escapedVehicleId}_[\\s\\S]{0,3000}?)`, 'i');
          const uuidMatch = html.match(uuidPattern);
          if (uuidMatch) {
            vehicleHtml = uuidMatch[1];
          }
        }
        
        // Method 4: Use context from fallback extraction if available
        if (!vehicleHtml && vehicleInfo.context) {
          vehicleHtml = vehicleInfo.context;
        }
        
        // Method 4: If structured data available, use it
        if (!vehicleHtml && vehicleInfo.structuredData) {
          const vehicle = vehicleInfo.structuredData;
          
          // Extract from structured data
          const title = vehicle.name || vehicle.headline || vehicle.brand + ' ' + vehicle.model || null;
          const price = vehicle.offers?.price || vehicle.price || null;
          
          if (title && price) {
            vehicles.push({
              id: `autoscout-${vehicleId}`,
              title: title.replace(/<[^>]+>/g, '').trim(),
              price: typeof price === 'string' ? parseInt(price.replace(/[^\d]/g, '')) : price,
              year: vehicle.productionDate ? parseInt(vehicle.productionDate) : null,
              mileage: vehicle.mileageFromOdometer?.value ? parseInt(vehicle.mileageFromOdometer.value) : null,
              fuelType: vehicle.fuelType || null,
              power: vehicle.engine?.power ? { kw: vehicle.engine.power, ps: Math.round(vehicle.engine.power * 1.36) } : null,
              transmission: vehicle.transmission || null,
              image: vehicle.image || vehicle.thumbnailUrl || null,
              url: vehicleInfo.url || vehicle.url || resolveUrl(`/haendler/${dealerSlug}`, 'https://www.autoscout24.at'),
              category: category
            });
            return; // Skip HTML parsing for this vehicle
          }
        }
        
        if (!vehicleHtml) {
          console.warn(`Could not find HTML section for AutoScout24 vehicle ${vehicleId}`);
          return;
        }
        
        // Extract vehicle data from HTML section (like Willhaben does)
        // Extract title - AutoScout24 uses <h2>Brand Model</h2><span class="version">details</span>
        let title = null;
        // Handle HTML comments in h2 and version spans
        const h2Match = vehicleHtml.match(/<h2[^>]*>([^<]*(?:<!--[^>]*-->[^<]*)*)<\/h2>/i);
        const versionMatch = vehicleHtml.match(/<span[^>]*class=["'][^"']*version["'][^>]*>([^<]*(?:<!--[^>]*-->[^<]*)*)<\/span>/i);
        if (h2Match && versionMatch) {
          const brandModel = h2Match[1].replace(/<!--[^>]*-->/g, '').replace(/<[^>]+>/g, '').trim();
          const version = versionMatch[1].replace(/<!--[^>]*-->/g, '').replace(/<[^>]+>/g, '').trim();
          // Clean up version (remove **TOP**, extra spaces, etc.)
          const cleanVersion = version.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
          title = `${brandModel} ${cleanVersion}`.replace(/\s+/g, ' ').trim();
        } else if (h2Match) {
          title = h2Match[1].replace(/<!--[^>]*-->/g, '').replace(/<[^>]+>/g, '').trim();
        } else {
          // Fallback patterns
          const titleMatch = vehicleHtml.match(/<h[23][^>]*>([^<]{10,100})<\/h[23]>/i) ||
                            vehicleHtml.match(/data-title=["']([^"']{10,100})["']/i) ||
                            vehicleHtml.match(/aria-label=["']([^"']{10,100})["']/i) ||
                            vehicleHtml.match(/title=["']([^"']{10,100})["']/i);
          if (titleMatch) {
            title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
          }
        }
        
        // Try brand + model pattern if no title found
        if (!title) {
          const vehicleBrands = ['Volkswagen', 'VW', 'Porsche', 'Fiat', 'Volvo', 'BMW', 'Mercedes', 'Audi', 'Opel', 'Ford', 'Renault', 'Peugeot', 'Citroën', 'Skoda', 'Seat', 'Toyota', 'Honda', 'Nissan', 'Mazda', 'Hyundai', 'Kia'];
          for (const brand of vehicleBrands) {
            const titleRegex = new RegExp(`(${brand}[^<>\\n]{5,80}?)(?:\\s*€|\\s*\\d{4}|\\s*km|$)`, 'i');
            const titleMatch = vehicleHtml.match(titleRegex);
            if (titleMatch && titleMatch[1].length > 10 && titleMatch[1].length < 100) {
              title = titleMatch[1].replace(/\s+/g, ' ').trim();
              title = title.replace(/\s*(?:Zurück|Weiter|\/|Sortieren|€|km).*$/i, '').trim();
              if (title.length >= 10) break;
            }
          }
        }
        
        if (!title || title.length < 5) {
          console.warn(`No valid title found for vehicle ${vehicleId}`);
          return;
        }
        
        // Extract price - AutoScout24 uses data-testid="regular-price"
        const priceMatch = vehicleHtml.match(/data-testid=["']regular-price["'][^>]*>€\s*([\d\s.]+)/) ||
                          vehicleHtml.match(/<span[^>]*class=["'][^"']*price["'][^>]*data-testid=["']regular-price["'][^>]*>€\s*([\d\s.]+)/) ||
                          vehicleHtml.match(/data-testid="[^"]*price[^"]*"[^>]*>€\s*([\d.]+)/) ||
                          vehicleHtml.match(/€\s*([\d\s.]+)/);
        const price = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, '').replace(/\./g, '')) : null;
        if (!price || price < 1000 || price > 500000) {
          console.warn(`Invalid price for vehicle ${vehicleId}: ${price}`);
          return;
        }
        
        // Extract image - use pre-collected image pool (simplified and faster)
        let image = imagePool.get(vehicleId) || null;
        
        // If not in pool, try to find in vehicle HTML section (fallback)
        if (!image && vehicleHtml) {
          const imgMatch = vehicleHtml.match(/https:\/\/prod\.pictures\.autoscout24\.net\/listing-images\/([a-f0-9-]+)_[a-f0-9-]+\.(?:jpg|jpeg|webp)([^"'\s]*)/i);
          if (imgMatch) {
            const foundUuid = imgMatch[1];
            image = imagePool.get(foundUuid) || imgMatch[0];
          }
        }
        
        // Upgrade to higher quality if available
        if (image && image.includes('/250x188')) {
          const betterUrl = image.replace('/250x188', '/480x360');
          if (imagePool.has(vehicleId)) {
            // Check if better quality exists in pool
            const poolUrl = imagePool.get(vehicleId);
            if (poolUrl.includes('480x360')) image = poolUrl;
            else image = betterUrl;
          } else {
            image = betterUrl;
          }
        }
        
        // Extract year - AutoScout24 format: "12/2016" in detail-item
        let year = null;
        // Try detail-item format first: "12/2016" (month/year)
        const yearDetailMatch = vehicleHtml.match(/<span[^>]*class=["'][^"']*detail-item["'][^>]*>(\d{1,2})\/(\d{4})/i);
        if (yearDetailMatch && yearDetailMatch[2]) {
          year = parseInt(yearDetailMatch[2]);
        } else {
          // Try other patterns - look for 4-digit years (19xx or 20xx)
          const yearMatch4 = vehicleHtml.match(/\b(19\d{2}|20\d{2})\b/);
          if (yearMatch4) {
            year = parseInt(yearMatch4[1] || yearMatch4[0]);
          } else {
            // Fallback to data-testid or other patterns
            const yearMatch = vehicleHtml.match(/data-testid="[^"]*year[^"]*"[^>]*>[\s\S]*?(\d{4})/i) ||
                             vehicleHtml.match(/(\d{4})\s*(?:EZ|Baujahr|Jahr)/i);
            if (yearMatch) {
              year = parseInt(yearMatch[1]);
            }
          }
        }
        // Validate year is reasonable (between 1970 and current year + 1)
        if (year && (year < 1970 || year > new Date().getFullYear() + 1)) {
          year = null; // Invalid year, set to null
        }
        
        // Extract mileage - AutoScout24 format: "358 000 km" in detail-item
        const kmMatch = vehicleHtml.match(/<span[^>]*class=["'][^"']*detail-item["'][^>]*>([\d\s.]+)\s*km/i) ||
                       vehicleHtml.match(/([\d\s.]+)\s*km/i);
        const mileage = kmMatch ? parseInt(kmMatch[1].replace(/\s/g, '').replace(/\./g, '')) : null;
        
        // Extract power
        const powerMatch = vehicleHtml.match(/(\d+)\s*kW\s*\((\d+)\s*PS\)/i) ||
                          vehicleHtml.match(/(\d+)\s*PS\s*\((\d+)\s*kW\)/i);
        const power = powerMatch ? { 
          kw: parseInt(powerMatch[1]), 
          ps: parseInt(powerMatch[2]) 
        } : null;
        
        // Extract fuel type
        let fuelType = null;
        if (vehicleHtml.includes('Diesel')) fuelType = 'Diesel';
        else if (vehicleHtml.includes('Benzin')) fuelType = 'Benzin';
        else if (vehicleHtml.includes('Elektro')) fuelType = 'Elektro';
        else if (vehicleHtml.includes('Hybrid')) fuelType = 'Hybrid';
        
        // Extract transmission
        let transmission = null;
        if (vehicleHtml.includes('Automatik')) transmission = 'Automatik';
        else if (vehicleHtml.includes('Schaltgetriebe')) transmission = 'Schaltgetriebe';
        else if (vehicleHtml.includes('Schaltung')) transmission = 'Schaltgetriebe';
        
        // Get URL - AutoScout24 uses /angebote/ URLs
        const autoscoutBase = 'https://www.autoscout24.at';
        const angeboteMatch = vehicleHtml.match(/href=["'](\/angebote\/[^"']*-[a-f0-9-]{36})["']/i);
        const oldUrlMatch = vehicleHtml.match(/href=["']([^"']*fahrzeugdetails[^"']*)["']/i);
        const vehicleUrl = vehicleInfo.url || 
                          (angeboteMatch ? resolveUrl(angeboteMatch[1], autoscoutBase) : null) ||
                          (oldUrlMatch ? resolveUrl(oldUrlMatch[1], autoscoutBase) : null) ||
                          `${autoscoutBase}/haendler/${dealerSlug}`;
        
        // Generate stable ID using vehicle UUID if available, otherwise use title+price
        let finalVehicleId;
        if (vehicleId && vehicleId.match(/^[a-f0-9-]{36}$/)) {
          // Use UUID if it's a valid UUID format
          finalVehicleId = `autoscout-${vehicleId}`;
        } else {
          // Fallback to slugified title + price
          const slugifiedTitle = title.toLowerCase()
            .replace(/[äöüß]/g, m => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }[m] || m))
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50); // Limit length
          finalVehicleId = `autoscout-${slugifiedTitle}-${price}`;
        }
        
        vehicles.push({
          id: finalVehicleId,
          title: title,
          price: price,
          year: year,
          mileage: mileage,
          fuelType: fuelType,
          power: power,
          transmission: transmission,
          image: image,
          url: resolveUrl(vehicleUrl, 'https://www.autoscout24.at'),
          category: category
        });
        
        console.log(`Successfully parsed AutoScout24 vehicle ${index + 1}: ${title} - €${price} ${image ? '(with image)' : '(no image)'}`);
      } catch (e) {
        console.error(`Error parsing AutoScout24 vehicle ${vehicleInfo.id}:`, e.message);
      }
    });
    
  } catch (e) {
    console.error("Error in parseAutoscoutFromHtml:", e.message);
  }
  
  // Filter out invalid entries
  return vehicles.filter(v => {
    if (!v.title || v.title.length < 5) return false;
    if (v.title.includes('function') || v.title.includes('{') || v.title.includes('}')) return false;
    if (v.title.includes('<') || v.title.includes('>')) return false;
    if (v.title.includes('":"') || v.title.includes('\\')) return false;
    return true;
  });
}

/**
 * Fetch vehicles from Landwirt.com dealer page (for machines/baumaschinen)
 */
async function fetchFromLandwirt(dealerSlug, baseUrl) {
  try {
    console.log(`Fetching machines from Landwirt.com for dealer: ${dealerSlug}`);
    
    const url = `https://www.landwirt.com/dealer/info/${dealerSlug}/machines`;
    
    // First try simple HTML fetch
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      console.log(`Fetched Landwirt.com page, HTML length: ${html.length}`);
      
      let vehicles = parseLandwirtMachines(html);
      
      // If we found vehicles, enrich them with detail pages
      if (vehicles.length > 0) {
        console.log(`Found ${vehicles.length} machines from Landwirt.com HTML, fetching detail pages...`);
        
        // Fetch detail pages for full data (images, properties, description)
        const enrichedVehicles = await Promise.all(
          vehicles.map(async (machine, idx) => {
            try {
              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, idx * 200));
              
              const detailData = await fetchLandwirtDetailPage(machine.url, machine.id);
              
              if (detailData) {
                return {
                  ...machine,
                  images: detailData.images.length > 0 ? detailData.images : (machine.image ? [machine.image] : []),
                  image: detailData.images[0] || machine.image,
                  properties: detailData.properties,
                  description: detailData.description,
                  technicalData: {
                    ...machine.technicalData,
                    ...detailData.technicalData,
                  },
                };
              }
              return {
                ...machine,
                images: machine.image ? [machine.image] : [],
                properties: [],
                description: '',
              };
            } catch (e) {
              console.warn(`Failed to enrich machine ${machine.id}:`, e.message);
              return {
                ...machine,
                images: machine.image ? [machine.image] : [],
                properties: [],
                description: '',
              };
            }
          })
        );
        
        console.log(`Enriched ${enrichedVehicles.length} machines with detail page data`);
        return enrichedVehicles;
      }
      
      // If no vehicles found, try Puppeteer
      console.log(`No machines found in HTML, trying Puppeteer for Landwirt.com...`);
      throw new Error('No machines in HTML, need Puppeteer');
    } catch (htmlError) {
      // Try Puppeteer as fallback for JavaScript-rendered content
      try {
        let puppeteer;
        try {
          puppeteer = require("puppeteer-core");
        } catch (e) {
          console.log("Puppeteer not available for Landwirt.com");
          return [];
        }
        
        const chromium = require("@sparticuz/chromium");
        chromium.setGraphicsMode(false);
        
        const browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        });
        
        try {
          const page = await browser.newPage();
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
          
          console.log(`Navigating to Landwirt.com: ${url}`);
          await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
          });
          
          // Wait for machine listings to load
          await page.waitForTimeout(5000);
          
          try {
            await page.waitForSelector('article, [class*="machine"], [class*="listing"], h2, h3', {
              timeout: 5000,
            });
          } catch (e) {
            console.log(`Landwirt.com machine selector not found, continuing anyway`);
          }
          
          const html = await page.content();
          console.log(`Landwirt.com Puppeteer rendered HTML length: ${html.length}`);
          
          await browser.close();
          
          let vehicles = parseLandwirtMachines(html);
          
          // Enrich with detail pages
          if (vehicles.length > 0) {
            console.log(`Enriching ${vehicles.length} Puppeteer machines with detail pages...`);
            vehicles = await Promise.all(
              vehicles.map(async (machine, idx) => {
                try {
                  await new Promise(resolve => setTimeout(resolve, idx * 200));
                  const detailData = await fetchLandwirtDetailPage(machine.url, machine.id);
                  if (detailData) {
                    return {
                      ...machine,
                      images: detailData.images.length > 0 ? detailData.images : (machine.image ? [machine.image] : []),
                      image: detailData.images[0] || machine.image,
                      properties: detailData.properties,
                      description: detailData.description,
                      technicalData: { ...machine.technicalData, ...detailData.technicalData },
                    };
                  }
                  return { ...machine, images: machine.image ? [machine.image] : [], properties: [], description: '' };
                } catch (e) {
                  return { ...machine, images: machine.image ? [machine.image] : [], properties: [], description: '' };
                }
              })
            );
          }
          
          console.log(`Found ${vehicles.length} machines from Landwirt.com Puppeteer`);
          return vehicles;
        } catch (error) {
          await browser.close();
          throw error;
        }
      } catch (puppeteerError) {
        console.error(`Puppeteer failed for Landwirt.com:`, puppeteerError.message);
        return [];
      }
    }
  } catch (error) {
    console.error("Error fetching from Landwirt.com:", error.message || error);
    return [];
  }
}

/**
 * Parse machines from Landwirt.com HTML - Improved version
 * Based on the actual page structure with article elements
 */
function parseLandwirtMachines(html) {
  const machines = [];
  
  try {
    console.log(`Parsing Landwirt.com machines, HTML length: ${html.length}`);
    
    // Extract detail links directly - Landwirt uses /detail/{slug}-{id} format
    const detailLinkRegex = /href=["'](\/detail\/([^"']+)-(\d+))["']/gi;
    const detailMatches = [...html.matchAll(detailLinkRegex)];
    
    // Deduplicate by ID
    const seenIds = new Set();
    const uniqueDetails = detailMatches.filter(m => {
      const id = m[3];
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });
    
    console.log(`Found ${uniqueDetails.length} unique machine detail links`);
    
    // Extract articles - Landwirt uses <article> elements
    const articleRegex = /<article[^>]*>[\s\S]*?<\/article>/gi;
    const articles = html.match(articleRegex) || [];
    console.log(`Found ${articles.length} article elements`);
    
    // Process each article
    articles.forEach((articleHtml, index) => {
      try {
        // Extract detail link and ID
        const linkMatch = articleHtml.match(/href=["'](\/detail\/[^"']+)["']/i);
        const url = linkMatch ? `https://www.landwirt.com${linkMatch[1]}` : null;
        
        // Extract ID from URL
        const idMatch = url ? url.match(/-(\d+)$/) : null;
        const machineId = idMatch ? idMatch[1] : `landwirt-${index}`;
        
        // Extract title - multiple patterns
        // Pattern 1: aria-label on article
        let title = null;
        const ariaMatch = articleHtml.match(/aria-label=["']([^"']+)["']/i);
        if (ariaMatch) {
          title = ariaMatch[1].trim();
        }
        
        // Pattern 2: Look for title text in generic/div elements
        if (!title) {
          // Landwirt structure: <generic>Title Text</generic>
          const titleMatch = articleHtml.match(/<a[^>]*>[\s\S]*?<generic[^>]*>[\s\S]*?<generic[^>]*>([^<]{5,100})<\/generic>/i) ||
                            articleHtml.match(/<div[^>]*class="[^"]*title[^"]*"[^>]*>([^<]{5,100})</i) ||
                            articleHtml.match(/>([A-Z][a-zA-Z0-9\s\-\.]{10,80})</);
          if (titleMatch) {
            title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
          }
        }
        
        // Pattern 3: Extract from the first significant text block in the article
        if (!title) {
          // Remove HTML tags and get text content
          const textContent = articleHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          // Find first capitalized text that looks like a product name
          const productMatch = textContent.match(/([A-Z][a-zA-Z0-9\s\-\.]{8,60}?)(?:\s*(?:€|\d{4,}|\bBj\.|PS|kW|MwSt))/);
          if (productMatch) {
            title = productMatch[1].trim();
          }
        }
        
        // Extract price
        let price = null;
        const priceMatch = articleHtml.match(/<strong[^>]*>([\d\s.]+)\s*€<\/strong>/i) ||
                          articleHtml.match(/<strong[^>]*>€\s*([\d\s.]+)<\/strong>/i) ||
                          articleHtml.match(/([\d\s.]+)\s*€/i) ||
                          articleHtml.match(/€\s*([\d\s.]+)/i);
        if (priceMatch) {
          price = parseInt(priceMatch[1].replace(/\s/g, '').replace(/\./g, ''));
        }
        
        // Check for "Preis auf Anfrage"
        const priceOnRequest = articleHtml.includes('Preis auf Anfrage');
        
        // Extract year (Bj. or Baujahr pattern)
        let year = null;
        const yearMatch = articleHtml.match(/Bj\.\s*(\d{4})/i) ||
                         articleHtml.match(/Baujahr[:\s]*(\d{4})/i) ||
                         articleHtml.match(/(\d{4})\s*(?:h|Stunden|Betriebsstunden)/i);
        if (yearMatch) {
          year = parseInt(yearMatch[1]);
          // Validate year
          if (year < 1970 || year > new Date().getFullYear() + 1) year = null;
        }
        
        // Extract power
        let power = null;
        const powerMatch = articleHtml.match(/(\d+)\s*PS\s*\/?\s*(\d+)\s*kW/i) ||
                          articleHtml.match(/(\d+)\s*kW\s*\/?\s*(\d+)\s*PS/i) ||
                          articleHtml.match(/(\d+)\s*PS/i) ||
                          articleHtml.match(/(\d+)\s*kW/i);
        if (powerMatch) {
          if (powerMatch[2]) {
            // Both PS and kW found
            if (powerMatch[0].toLowerCase().indexOf('ps') < powerMatch[0].toLowerCase().indexOf('kw')) {
              power = { ps: parseInt(powerMatch[1]), kw: parseInt(powerMatch[2]) };
      } else {
              power = { kw: parseInt(powerMatch[1]), ps: parseInt(powerMatch[2]) };
            }
        } else {
            const val = parseInt(powerMatch[1]);
            if (powerMatch[0].toLowerCase().includes('ps')) {
              power = { ps: val, kw: Math.round(val * 0.7355) };
            } else {
              power = { kw: val, ps: Math.round(val * 1.36) };
            }
          }
        }
        
        // Extract hours (for machines)
        let hours = null;
        const hoursMatch = articleHtml.match(/([\d.]+)\s*(?:h|Stunden|Betriebsstunden)/i);
        if (hoursMatch) {
          hours = parseInt(hoursMatch[1].replace(/\./g, ''));
        }
        
        // Extract category from article text
        let category = 'baumaschine';
        const categoryText = articleHtml.toLowerCase();
        if (categoryText.includes('nutzfahrzeuge') || categoryText.includes('lkw') || categoryText.includes('lastwagen')) {
          category = 'nutzfahrzeuge';
        } else if (categoryText.includes('traktor') || categoryText.includes('landmaschine')) {
          category = 'landmaschine';
        } else if (categoryText.includes('forst')) {
          category = 'forsttechnik';
        }
        
        // Extract image - Landwirt uses static.landwirt.com for images
        let image = null;
        const imgMatch = articleHtml.match(/https:\/\/static\.landwirt\.com\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/i);
        if (imgMatch) {
          image = imgMatch[0];
        }
        
        // Extract working width (for agricultural equipment)
        let workingWidth = null;
        const widthMatch = articleHtml.match(/(\d+)\s*cm/i);
        if (widthMatch) {
          workingWidth = `${widthMatch[1]} cm`;
        }
        
        // Only add if we have at least a title
        if (title && title.length >= 5) {
          machines.push({
            id: `landwirt-${machineId}`,
              title: title,
              price: price,
            priceOnRequest: priceOnRequest && !price,
            year: year,
            hours: hours,
            mileage: null,
            fuelType: null,
            power: power,
            transmission: null,
            workingWidth: workingWidth,
            image: image,
            url: url || 'https://www.landwirt.com/dealer/info/cb-handels-gmbh-10561/machines',
            category: category
          });
          
          console.log(`Parsed Landwirt machine ${index + 1}: ${title} - €${price || 'Preis auf Anfrage'} ${image ? '(with image)' : '(no image)'}`);
        }
      } catch (e) {
        console.error(`Error parsing Landwirt article ${index}:`, e.message);
      }
    });
    
    // If no articles found, try fallback extraction from detail links
    if (machines.length === 0 && uniqueDetails.length > 0) {
      console.log("No articles found, trying detail link extraction...");
      
      uniqueDetails.forEach((match, index) => {
        const url = `https://www.landwirt.com${match[1]}`;
        const slug = match[2];
        const id = match[3];
        
        // Convert slug to title (replace hyphens with spaces, capitalize)
        const title = slug
          .replace(/-+/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
        
        if (title && title.length >= 5) {
          machines.push({
            id: `landwirt-${id}`,
              title: title,
            price: null,
            priceOnRequest: true,
            year: null,
            hours: null,
            mileage: null,
            fuelType: null,
            power: null,
            transmission: null,
            image: null,
            url: url,
            category: 'baumaschine'
          });
        }
      });
      
      console.log(`Extracted ${machines.length} machines from detail links (fallback)`);
    }
    
    // Filter out invalid entries
    const validMachines = machines.filter(m => {
      if (!m.title || m.title.length < 5) return false;
      if (m.title.includes('function') || m.title.includes('{') || m.title.includes('}')) return false;
      if (m.title.includes('<') || m.title.includes('>')) return false;
      // Filter out navigation/UI elements
      if (m.title.toLowerCase().includes('sortierung') || m.title.toLowerCase().includes('anzeige')) return false;
      return true;
    });
    
    console.log(`Parsed ${validMachines.length} valid machines from Landwirt.com`);
    return validMachines;
    
  } catch (e) {
    console.error("Error parsing Landwirt machines:", e.message);
      return [];
  }
}

/**
 * Fetch and parse a single Zweispurig.at vehicle detail page for full data
 */
async function fetchZweispurigDetailPage(vehicleUrl, vehicleId) {
  try {
    const response = await fetch(vehicleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch Zweispurig detail page ${vehicleId}: HTTP ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    // Parse detail page
    const result = {
      images: [],
      equipment: [],
      description: '',
      technicalData: {},
    };
    
    // Extract all images - format: https://files.zweispurig.at/fahrzeugbilder/.../1786501_xxxxx.jpg
    // Get full-size images (not sm/ thumbnails)
    const imgRegex = /https:\/\/files\.zweispurig\.at\/fahrzeugbilder\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/gi;
    const imgMatches = html.match(imgRegex) || [];
    const uniqueImages = [...new Set(imgMatches
      .map(img => {
        // Normalize image URLs: remove thumbnail directories (/sm/, /xs/) and /lg/ directory
        // Both /lg/ and non-/lg/ versions point to the same image, so normalize to base path
        return img.replace(/\/(?:sm|xs|lg)\//, '/');
      })
      .filter(img => {
        // Filter out empty or invalid URLs
        if (!img || img.trim().length === 0) return false;
        // Ensure it's a valid URL
        if (!img.startsWith('http')) return false;
        // Filter out placeholder/error images
        const imgLower = img.toLowerCase();
        if (imgLower.includes('placeholder') || imgLower.includes('no-image') || imgLower.includes('error')) return false;
        // Filter out images that don't have a valid vehicle ID pattern (should contain numbers)
        // Zweispurig images typically have format: .../vehicleId_xxxxx.jpg or .../lg/vehicleId_xxxxx.jpg
        // Must have pattern: digits_digits.jpg (e.g., 1937776_11763454711.jpg)
        if (!img.match(/\d+_\d+\.(jpg|jpeg|png|webp)$/i)) {
          console.warn(`Zweispurig: Excluding image with invalid pattern: ${img}`);
          return false;
        }
        return true;
      })
    )];
    
    result.images = uniqueImages;
    
    // Extract Ausstattungen (Equipment)
    // They appear as h5 elements after "Ausstattungen" heading
    const equipmentSection = html.match(/Ausstattungen[\s\S]*?(?=<h3[^>]*>Fahrzeugbeschreibung|<h3[^>]*>Kontakt|$)/i);
    if (equipmentSection) {
      const equipmentMatches = equipmentSection[0].match(/<h5[^>]*>([^<]+)<\/h5>/gi) || [];
      result.equipment = equipmentMatches
        .map(m => m.replace(/<\/?h5[^>]*>/gi, '').trim())
        .filter(e => e.length > 2);
    }
    
    // Extract Fahrzeugbeschreibung (Description)
    const descSection = html.match(/Fahrzeugbeschreibung[\s\S]*?(?=<[^>]*class="[^"]*col[^"]*"|<div[^>]*class="[^"]*dealer|<h[23][^>]*>Kontakt|$)/i);
    if (descSection) {
      // Get text content, clean HTML tags
      let descText = descSection[0]
        .replace(/<h3[^>]*>Fahrzeugbeschreibung<\/h3>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      // Limit length
      if (descText.length > 1000) {
        descText = descText.substring(0, 997) + '...';
      }
      result.description = descText;
    }
    
    // Extract additional technical data
    // Kategorie, Aufbau, Antrieb, Getriebe, Türen, Sitze, Hubraum, Polster, Polsterfarbe, CO2, Abgasnorm, Verbrauch, Vorbesitzer
    const techPatterns = [
      { key: 'bodyType', regex: /Aufbau:[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/i },
      { key: 'drivetrain', regex: /Antrieb:[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/i },
      { key: 'gearbox', regex: /Getriebe:[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/i },
      { key: 'doors', regex: /Türen:[\s\S]*?["'>](\d+)["'<]/i },
      { key: 'seats', regex: /Sitze:[\s\S]*?["'>](\d+)["'<]/i },
      { key: 'displacement', regex: /Hubraum:[\s\S]*?["'>]([\d.,]+\s*ccm)["'<]/i },
      { key: 'interior', regex: /Polster:[\s\S]*?["'>]([^<"']+)["'<]/i },
      { key: 'interiorColor', regex: /Polsterfarbe:[\s\S]*?["'>]([^<"']+)["'<]/i },
      { key: 'co2', regex: /CO2:[\s\S]*?["'>]([\d]+\s*g\/km)["'<]/i },
      { key: 'emissionClass', regex: /Abgasnorm:[\s\S]*?["'>]([^<"']+)["'<]/i },
      { key: 'consumption', regex: /Verbrauch:[\s\S]*?["'>]([^<"']+l\/100km[^<"']*)["'<]/i },
      { key: 'previousOwners', regex: /Vorbesitzer:[\s\S]*?["'>](\d+)["'<]/i },
      { key: 'color', regex:/<h2[^>]*>(\w+)<\/h2>[\s\S]*?separator/i },
    ];
    
    for (const pattern of techPatterns) {
      const match = html.match(pattern.regex);
      if (match) {
        result.technicalData[pattern.key] = match[1].trim();
      }
    }
    
    // Check for Garantie and Serviceheft
    result.technicalData.warranty = html.includes('>Garantie<') || html.includes('>Garantie</');
    result.technicalData.serviceBook = html.includes('>Serviceheft<') || html.includes('>Serviceheft</');
    
    console.log(`Zweispurig detail ${vehicleId}: ${result.images.length} images, ${result.equipment.length} equipment items`);
    return result;
    
  } catch (e) {
    console.error(`Error fetching Zweispurig detail page ${vehicleId}:`, e.message);
    return null;
  }
}

/**
 * Fetch and parse a single Landwirt.com machine detail page for full data
 */
async function fetchLandwirtDetailPage(machineUrl, machineId) {
  try {
    const response = await fetch(machineUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch Landwirt detail page ${machineId}: HTTP ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    // Parse detail page
    const result = {
      images: [],
      properties: [],
      description: '',
      technicalData: {},
    };
    
    // Extract all images - Landwirt uses static.landwirt.com for images
    // Only match actual image files, exclude directories that contain logos/icons
    const imgRegex = /https:\/\/static\.landwirt\.com\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/gi;
    const imgMatches = html.match(imgRegex) || [];
    // Deduplicate and filter out logos, thumbnails, and low-res images
    const uniqueImages = [...new Set(imgMatches)].filter(img => {
      if (!img || typeof img !== 'string') return false;
      const imgLower = img.toLowerCase();
      
      // Filter out logos and icons - check for these patterns first
      if (imgLower.includes('mobileicons')) {
        console.log(`Landwirt: Excluding mobileicons image: ${img}`);
        return false;
      }
      if (imgLower.includes('apple-touch-icon')) {
        console.log(`Landwirt: Excluding apple-touch-icon: ${img}`);
        return false;
      }
      if (imgLower.includes('platzhalter')) {
        console.log(`Landwirt: Excluding platzhalter: ${img}`);
        return false;
      }
      if (imgLower.includes('/logo') || imgLower.includes('logo')) {
        console.log(`Landwirt: Excluding logo: ${img}`);
        return false;
      }
      if (imgLower.includes('favicon')) {
        console.log(`Landwirt: Excluding favicon: ${img}`);
        return false;
      }
      if (imgLower.includes('icon') && !imgLower.match(/\d+-\d+\.(jpg|jpeg|png|webp)$/i)) {
        // Allow icons that are part of vehicle image filenames (e.g., vehicleId-number.jpg)
        // but exclude standalone icon files
        console.log(`Landwirt: Excluding icon file: ${img}`);
        return false;
      }
      
      // Filter out low-resolution thumbnails (patterns like -0kl.jpg, -kl.jpg, -0vb.jpg, -vb.jpg, etc.)
      if (imgLower.match(/-\d*kl\.(jpg|jpeg|png|webp)$/i)) {
        console.log(`Landwirt: Excluding low-res thumbnail (kl): ${img}`);
        return false;
      }
      if (imgLower.match(/-\d*vb\.(jpg|jpeg|png|webp)$/i)) {
        console.log(`Landwirt: Excluding low-res thumbnail (vb): ${img}`);
        return false;
      }
      
      // Filter out very small images (typically thumbnails have specific patterns)
      if (imgLower.includes('thumb') || imgLower.includes('small') || imgLower.includes('mini')) {
        console.log(`Landwirt: Excluding thumbnail/small image: ${img}`);
        return false;
      }
      
      // Must be a valid vehicle image URL (should contain dealer ID and vehicle ID pattern)
      // Landwirt images typically have format: .../dealerId-hash-vehicleId-number.jpg
      // Valid pattern: /10561-xxxxx-6359628-0.jpg (dealerId-hash-vehicleId-number)
      // Exclude if it doesn't look like a vehicle image (no dealer ID pattern)
      if (!imgLower.match(/\/\d+-\w+-\d+/) && !imgLower.match(/\/\d+-\d+\.(jpg|jpeg|png|webp)$/i)) {
        // If it doesn't match vehicle image pattern, it might be a logo/icon
        console.log(`Landwirt: Excluding non-vehicle image pattern: ${img}`);
        return false;
      }
      
      return true;
    });
    
    console.log(`Landwirt detail ${machineId}: Found ${imgMatches.length} image matches, filtered to ${uniqueImages.length} valid images`);
    result.images = uniqueImages;
    
    // Extract Eigenschaften (Properties) from list items
    const propSection = html.match(/Eigenschaften[\s\S]*?(?=<[^>]*Beschreibung|<table|$)/i);
    if (propSection) {
      const propMatches = propSection[0].match(/<strong[^>]*>([^<:]+):?<\/strong>\s*([^<]*)/gi) || [];
      propMatches.forEach(m => {
        const cleaned = m.replace(/<\/?strong[^>]*>/gi, '').trim();
        if (cleaned.length > 2) {
          result.properties.push(cleaned);
        }
      });
      // Also extract linked properties
      const linkedProps = propSection[0].match(/<a[^>]*>[\s\S]*?([^<]+)<\/a>/gi) || [];
      linkedProps.forEach(m => {
        const text = m.replace(/<[^>]+>/g, '').trim();
        if (text.length > 2 && !result.properties.includes(text)) {
          result.properties.push(text);
        }
      });
    }
    
    // Extract Beschreibung (Description)
    const descSection = html.match(/Beschreibung[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
    if (descSection) {
      let descText = descSection[1]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (descText.length > 1000) {
        descText = descText.substring(0, 997) + '...';
      }
      result.description = descText;
    }
    
    // Extract technical data from table
    const techPatterns = [
      { key: 'power', regex: /PS\s*\/?\s*kW[\s\S]*?<td[^>]*>[\s\S]*?(\d+)\s*\/?\s*(\d+)/i },
      { key: 'year', regex: /Baujahr[\s\S]*?<td[^>]*>[\s\S]*?(\d{4})/i },
      { key: 'condition', regex: /Zustand[\s\S]*?<td[^>]*>[\s\S]*?([^<]+)/i },
      { key: 'tireFront', regex: /Reifenprofiltiefe\s*vorne[\s\S]*?<td[^>]*>[\s\S]*?(\d+)/i },
      { key: 'tireRear', regex: /Reifenprofiltiefe\s*hinten[\s\S]*?<td[^>]*>[\s\S]*?(\d+)/i },
      { key: 'totalWeight', regex: /Gesamtgewicht[\s\S]*?<td[^>]*>[\s\S]*?(\d+)/i },
      { key: 'mileage', regex: /Laufleistung[\s\S]*?<td[^>]*>[\s\S]*?(\d+)/i },
      { key: 'hours', regex: /Betriebsstunden[\s\S]*?<td[^>]*>[\s\S]*?(\d+)/i },
    ];
    
    for (const pattern of techPatterns) {
      const match = html.match(pattern.regex);
      if (match) {
        if (pattern.key === 'power' && match[2]) {
          result.technicalData.powerPS = parseInt(match[1]);
          result.technicalData.powerKW = parseInt(match[2]);
        } else {
          result.technicalData[pattern.key] = match[1].trim();
        }
      }
    }
    
    console.log(`Landwirt detail ${machineId}: ${result.images.length} images, ${result.properties.length} properties`);
    return result;
    
  } catch (e) {
    console.error(`Error fetching Landwirt detail page ${machineId}:`, e.message);
    return null;
  }
}

/**
 * Parse vehicles from Zweispurig.at dealer page HTML
 */
function parseZweispurigVehicles(html) {
  const vehicles = [];
  
  try {
    console.log(`Parsing Zweispurig.at vehicles, HTML length: ${html.length}`);
    
    // Extract vehicle detail links - format: /brand-model-type-fuel-color-region/details-{id}
    const detailLinkRegex = /href=["'](https:\/\/www\.zweispurig\.at\/[^"']*\/details-(\d+))["']/gi;
    const detailMatches = [...html.matchAll(detailLinkRegex)];
    
    // Deduplicate by ID
    const seenIds = new Set();
    const uniqueDetails = [];
    detailMatches.forEach(m => {
      const id = m[2];
      if (!seenIds.has(id)) {
        seenIds.add(id);
        uniqueDetails.push({ url: m[1], id: id });
      }
    });
    
    console.log(`Found ${uniqueDetails.length} unique vehicle detail links`);
    
    // Process each vehicle by finding its context in HTML
    // First, find all vehicle sections - they're separated by <hr> or separators
    const vehicleSections = [];
    
    // Split HTML by separators to get individual vehicle sections
    // Zweispurig uses <hr> separators between vehicle listings
    const sectionParts = html.split(/<hr[^>]*>|<separator[^>]*>|class="[^"]*separator[^"]*"/i);
    
    sectionParts.forEach((section, idx) => {
      // Check if this section contains a vehicle detail link
      const linkMatch = section.match(/href=["'](https:\/\/www\.zweispurig\.at\/[^"']*\/details-(\d+))["']/i);
      if (linkMatch) {
        vehicleSections.push({
          id: linkMatch[2],
          url: linkMatch[1],
          html: section
        });
      }
    });
    
    console.log(`Found ${vehicleSections.length} vehicle sections`);
    
    // If section splitting didn't work, fall back to context matching
    const processVehicles = vehicleSections.length > 0 ? vehicleSections : uniqueDetails;
    
    processVehicles.forEach((detail, index) => {
      try {
        const vehicleId = detail.id;
        const vehicleUrl = detail.url;
        
        let vehicleHtml;
        if (detail.html) {
          // Use the pre-split section
          vehicleHtml = detail.html;
        } else {
          // Fallback: Find the section containing this vehicle's link
          const urlEscaped = vehicleUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const contextMatch = html.match(new RegExp(`([\\s\\S]{0,2500}?${urlEscaped}[\\s\\S]{0,1500}?)`, 'i'));
          
          if (!contextMatch) {
            console.warn(`Could not find context for vehicle ${vehicleId}`);
            return;
          }
          vehicleHtml = contextMatch[1];
        }
        
        // Extract brand (h3) and model (h4) - Zweispurig structure
        let brand = null;
        let model = null;
        
        // Pattern: <h3>Brand</h3>...<h4>Model</h4>
        // Look for h3 and h4 that are links to this vehicle's detail page
        const vehicleIdEscaped = vehicleId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Try to find brand and model from headings linked to this vehicle
        const brandLinkMatch = vehicleHtml.match(new RegExp(`href="[^"]*details-${vehicleIdEscaped}"[^>]*>\\s*<h3[^>]*>([^<]+)<\\/h3>`, 'i')) ||
                              vehicleHtml.match(/<a[^>]*href="[^"]*"[^>]*>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/i) ||
                              vehicleHtml.match(/<h3[^>]*>([^<]+)<\/h3>/i);
        
        const modelLinkMatch = vehicleHtml.match(new RegExp(`href="[^"]*details-${vehicleIdEscaped}"[^>]*>\\s*<h4[^>]*>([^<]+)<\\/h4>`, 'i')) ||
                              vehicleHtml.match(/<a[^>]*href="[^"]*"[^>]*>[\s\S]*?<h4[^>]*>([^<]+)<\/h4>/i) ||
                              vehicleHtml.match(/<h4[^>]*>([^<]+)<\/h4>/i);
        
        if (brandLinkMatch) brand = brandLinkMatch[1].trim();
        if (modelLinkMatch) model = modelLinkMatch[1].trim();
        
        // Combine brand and model for title
        let title = null;
        if (brand && model) {
          title = `${brand} ${model}`;
        } else if (model) {
          title = model;
        } else if (brand) {
          title = brand;
        }
        
        // If still no title, try to extract from URL slug
        if (!title || title.length < 3) {
          // URL format: /brand-model-type-fuel-color-region/details-id
          const urlSlugMatch = vehicleUrl.match(/zweispurig\.at\/([^\/]+)\/details-/i);
          if (urlSlugMatch) {
            const slug = urlSlugMatch[1];
            // Convert slug to title (split by hyphen, capitalize words)
            const parts = slug.split('-');
            // Take first few parts as brand/model (skip type, fuel, color, region)
            if (parts.length >= 2) {
              title = parts.slice(0, Math.min(3, parts.length - 3))
                .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                .join(' ');
            }
          }
        }
        
        // Clean up title (remove **TOP**, excessive spaces)
          if (title) {
          title = title.replace(/\*+TOP\*+/gi, '').replace(/\*+/g, '').replace(/\s+/g, ' ').trim();
        }
        
        if (!title || title.length < 3) {
          console.warn(`No valid title found for vehicle ${vehicleId}`);
          return;
        }
        
        // Extract price - format: € 21.990,- or € 21.990
        let price = null;
        const priceMatch = vehicleHtml.match(/€\s*([\d.]+)(?:,-)?/i);
        if (priceMatch) {
          price = parseInt(priceMatch[1].replace(/\./g, ''));
        }
        
        // Extract year - format: 12/2016 (month/year) in h5 elements
        let year = null;
        // Look specifically for year in h5 tags with format MM/YYYY
        const yearPatterns = [
          vehicleHtml.match(/<h5[^>]*>(\d{1,2})\/(\d{4})<\/h5>/i),
          vehicleHtml.match(/>(\d{1,2})\/(\d{4})</),
        ];
        for (const yearMatch of yearPatterns) {
          if (yearMatch) {
            const possibleYear = parseInt(yearMatch[2]);
            // Validate it's a reasonable year (1970-current+1)
            if (possibleYear >= 1970 && possibleYear <= new Date().getFullYear() + 1) {
              year = possibleYear;
              break;
            }
          }
        }
        
        // Extract mileage - format: 358.000 km
        let mileage = null;
        const kmMatch = vehicleHtml.match(/([\d.]+)\s*km/i);
        if (kmMatch) {
          mileage = parseInt(kmMatch[1].replace(/\./g, ''));
        }
        
        // Extract fuel type from h5
        let fuelType = null;
        if (vehicleHtml.includes('>Diesel<') || vehicleHtml.includes('>Diesel</')) {
          fuelType = 'Diesel';
        } else if (vehicleHtml.includes('>Benzin<') || vehicleHtml.includes('>Benzin</')) {
          fuelType = 'Benzin';
        } else if (vehicleHtml.includes('>Elektro<') || vehicleHtml.includes('>Elektro</')) {
          fuelType = 'Elektro';
        } else if (vehicleHtml.includes('>Hybrid<') || vehicleHtml.includes('>Hybrid</')) {
          fuelType = 'Hybrid';
        }
        
        // Extract power - format: 150 PS (110 KW) or 150 PS (110 kW)
        let power = null;
        const powerMatch = vehicleHtml.match(/(\d+)\s*PS\s*\((\d+)\s*K?W\)/i);
        if (powerMatch) {
          power = {
            ps: parseInt(powerMatch[1]),
            kw: parseInt(powerMatch[2])
          };
        }
        
        // Extract transmission
        let transmission = null;
        if (vehicleHtml.includes('>Automatik<') || vehicleHtml.includes('>Automatik</')) {
          transmission = 'Automatik';
        } else if (vehicleHtml.includes('>Handschaltung<') || vehicleHtml.includes('>Schaltgetriebe<') ||
                   vehicleHtml.includes('>Handschaltung</') || vehicleHtml.includes('>Schaltgetriebe</')) {
          transmission = 'Schaltgetriebe';
        }
        
        // Extract vehicle type (Gebrauchtwagen, Tageszulassung, Neuwagen)
        let vehicleType = 'Gebrauchtwagen';
        if (vehicleHtml.includes('>Tageszulassung<') || vehicleHtml.includes('>Tageszulassung</')) {
          vehicleType = 'Tageszulassung';
        } else if (vehicleHtml.includes('>Neuwagen<') || vehicleHtml.includes('>Neuwagen</')) {
          vehicleType = 'Neuwagen';
        } else if (vehicleHtml.includes('>Vorführwagen<') || vehicleHtml.includes('>Vorführwagen</')) {
          vehicleType = 'Vorführwagen';
        }
        
        // Determine category based on title and URL
        let category = 'pkw';
        const titleLower = title.toLowerCase();
        const urlLower = vehicleUrl.toLowerCase();
        
        if (titleLower.includes('transporter') || titleLower.includes('kastenwagen') ||
            titleLower.includes('nutzfahrzeug') || titleLower.includes('lkw') ||
            titleLower.includes('multivan') || titleLower.includes('van') ||
            titleLower.includes('bus') || titleLower.includes('sprinter') ||
            titleLower.includes('crafter') || titleLower.includes('ducato') ||
            titleLower.includes('boxer') || titleLower.includes('jumper') ||
            titleLower.includes('t6') || titleLower.includes('t7') ||
            titleLower.includes('doblo') || titleLower.includes('transit') ||
            urlLower.includes('transporter') || urlLower.includes('kastenwagen')) {
          category = 'nutzfahrzeuge';
        }
        
        // Extract image - look for img tag with zweispurig URL
        let image = null;
        const imgMatch = vehicleHtml.match(/src=["'](https:\/\/[^"']*zweispurig[^"']*\.(?:jpg|jpeg|png|webp)[^"']*)["']/i) ||
                        vehicleHtml.match(/src=["']([^"']+\.(?:jpg|jpeg|png|webp))["']/i);
        if (imgMatch) {
          image = imgMatch[1];
          // Make relative URLs absolute
          if (!image.startsWith('http')) {
            image = `https://www.zweispurig.at${image.startsWith('/') ? '' : '/'}${image}`;
          }
        }
        
        vehicles.push({
          id: `zweispurig-${vehicleId}`,
            title: title,
            price: price,
            year: year,
          mileage: mileage,
          fuelType: fuelType,
            power: power,
          transmission: transmission,
          vehicleType: vehicleType,
            image: image,
          url: vehicleUrl,
          category: category
        });
        
        console.log(`Parsed Zweispurig vehicle ${index + 1}: ${title} - €${price || 'N/A'} (${category})`);
        
      } catch (e) {
        console.error(`Error parsing Zweispurig vehicle ${detail.id}:`, e.message);
      }
    });
    
    // Filter out invalid entries
    const validVehicles = vehicles.filter(v => {
      if (!v.title || v.title.length < 3) return false;
      if (v.title.includes('function') || v.title.includes('{') || v.title.includes('}')) return false;
      if (v.title.includes('<') || v.title.includes('>')) return false;
      return true;
    });
    
    console.log(`Parsed ${validVehicles.length} valid vehicles from Zweispurig.at`);
    return validVehicles;
    
  } catch (e) {
    console.error("Error parsing Zweispurig vehicles:", e.message);
    return [];
  }
}

/**
 * Fetch vehicles from Zweispurig.at dealer page
 */
async function fetchFromZweispurig(dealerSlug, dealerId, baseUrl) {
  try {
    console.log(`Fetching vehicles from Zweispurig.at for dealer: ${dealerSlug} (ID: ${dealerId})`);
    
    const url = `https://www.zweispurig.at/${dealerSlug}/autohaendler-fahrzeuge/${dealerId}/`;
    
    // First try simple HTML fetch
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      console.log(`Fetched Zweispurig.at page, HTML length: ${html.length}`);
      
      let vehicles = parseZweispurigVehicles(html);
      
      if (vehicles.length > 0) {
        console.log(`Found ${vehicles.length} vehicles from Zweispurig.at HTML, fetching detail pages...`);
        
        // Fetch detail pages for full data (equipment, description, all images)
        const enrichedVehicles = await Promise.all(
          vehicles.map(async (vehicle, idx) => {
            try {
              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, idx * 200));
              
              const detailData = await fetchZweispurigDetailPage(vehicle.url, vehicle.id);
              
              if (detailData) {
                // Merge detail data into vehicle
                return {
                  ...vehicle,
                  images: detailData.images.length > 0 ? detailData.images : (vehicle.image ? [vehicle.image] : []),
                  image: detailData.images[0] || vehicle.image,
                  equipment: detailData.equipment,
                  description: detailData.description,
                  technicalData: detailData.technicalData,
                };
              }
              return {
                ...vehicle,
                images: vehicle.image ? [vehicle.image] : [],
                equipment: [],
                description: '',
                technicalData: {},
              };
            } catch (e) {
              console.warn(`Failed to enrich vehicle ${vehicle.id}:`, e.message);
              return {
                ...vehicle,
                images: vehicle.image ? [vehicle.image] : [],
                equipment: [],
                description: '',
                technicalData: {},
              };
            }
          })
        );
        
        console.log(`Enriched ${enrichedVehicles.length} vehicles with detail page data`);
        return enrichedVehicles;
      }
      
      // If no vehicles found, try Puppeteer
      console.log(`No vehicles found in HTML, trying Puppeteer for Zweispurig.at...`);
      throw new Error('No vehicles in HTML, need Puppeteer');
    } catch (htmlError) {
      // Try Puppeteer as fallback for JavaScript-rendered content
      try {
        let puppeteer;
        try {
          puppeteer = require("puppeteer-core");
        } catch (e) {
          console.log("Puppeteer not available for Zweispurig.at");
          return [];
        }
        
        const chromium = require("@sparticuz/chromium");
        chromium.setGraphicsMode(false);
        
        const browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        });
        
        try {
          const page = await browser.newPage();
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
          
          console.log(`Navigating to Zweispurig.at: ${url}`);
          await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
          });
          
          // Wait for vehicle listings to load
          await page.waitForTimeout(5000);
          
          // Try to accept cookies if dialog appears
          try {
            await page.click('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll');
            await page.waitForTimeout(1000);
          } catch (e) {
            // Cookie dialog might not be present
          }
          
          const html = await page.content();
          console.log(`Zweispurig.at Puppeteer rendered HTML length: ${html.length}`);
          
          await browser.close();
          
          let vehicles = parseZweispurigVehicles(html);
          
          // Enrich with detail pages
          if (vehicles.length > 0) {
            console.log(`Enriching ${vehicles.length} Puppeteer vehicles with detail pages...`);
            vehicles = await Promise.all(
              vehicles.map(async (vehicle, idx) => {
                try {
                  await new Promise(resolve => setTimeout(resolve, idx * 200));
                  const detailData = await fetchZweispurigDetailPage(vehicle.url, vehicle.id);
                  if (detailData) {
                    return {
                      ...vehicle,
                      images: detailData.images.length > 0 ? detailData.images : (vehicle.image ? [vehicle.image] : []),
                      image: detailData.images[0] || vehicle.image,
                      equipment: detailData.equipment,
                      description: detailData.description,
                      technicalData: detailData.technicalData,
                    };
                  }
                  return { ...vehicle, images: vehicle.image ? [vehicle.image] : [], equipment: [], description: '', technicalData: {} };
                } catch (e) {
                  return { ...vehicle, images: vehicle.image ? [vehicle.image] : [], equipment: [], description: '', technicalData: {} };
                }
              })
            );
          }
          
          console.log(`Found ${vehicles.length} vehicles from Zweispurig.at Puppeteer`);
          return vehicles;
        } catch (error) {
          await browser.close();
          throw error;
        }
      } catch (puppeteerError) {
        console.error(`Puppeteer failed for Zweispurig.at:`, puppeteerError.message);
        return [];
      }
    }
  } catch (error) {
    console.error("Error fetching from Zweispurig.at:", error.message || error);
    return [];
  }
}

/**
 * Main function to get vehicles from configured data source
 * @returns {Promise<Array>} Array of vehicle objects
 */
async function getVehicles() {
  const { type, dealerId, baseUrl, apiEndpoints, sourceUrls, dealerSlug } = dealerConfig.dataSource;
  
  if (type === 'motornetzwerk') {
    return await fetchFromMotornetzwerk(dealerId, apiEndpoints, sourceUrls, baseUrl);
  }
  
  if (type === 'willhaben') {
    return await fetchFromWillhaben(dealerSlug || dealerId, baseUrl);
  }
  
  if (type === 'autoscout24') {
    return await fetchFromAutoscout(dealerSlug || dealerId, baseUrl);
  }
  
  if (type === 'combined') {
    // Fetch from multiple sources and combine results
    const allVehicles = [];
    
    // PRIMARY SOURCE: Zweispurig.at (clean HTML, easy to parse)
    try {
      const zweispurigUrl = sourceUrls?.zweispurig || '';
      // Extract dealer slug and ID from URL
      // Format: https://www.zweispurig.at/{slug}/autohaendler-fahrzeuge/{id}/
      const zweispurigMatch = zweispurigUrl.match(/zweispurig\.at\/([^\/]+)\/autohaendler-fahrzeuge\/(\d+)/);
      if (zweispurigMatch) {
        const zweispurigSlug = zweispurigMatch[1];
        const zweispurigId = zweispurigMatch[2];
        const zweispurigVehicles = await fetchFromZweispurig(zweispurigSlug, zweispurigId, baseUrl);
        allVehicles.push(...zweispurigVehicles);
        console.log(`Added ${zweispurigVehicles.length} vehicles from Zweispurig.at`);
      } else {
        console.warn("Zweispurig URL not configured or invalid format");
      }
    } catch (e) {
      console.warn("Zweispurig.at fetch failed:", e.message);
    }
    
    // DISABLED: AutoScout24 - was unreliable and complex to scrape
    // Keeping the code for potential future use but not calling it
    /*
    try {
      const autoscoutVehicles = await fetchFromAutoscout(dealerSlug || dealerId, baseUrl);
      // Filter out duplicates
      const existingTitles = new Set(allVehicles.map(v => v.title.toLowerCase().substring(0, 30)));
      const newVehicles = autoscoutVehicles.filter(v => 
        !existingTitles.has(v.title.toLowerCase().substring(0, 30))
      );
      allVehicles.push(...newVehicles);
    } catch (e) {
      console.warn("AutoScout24 fetch failed:", e.message);
    }
    */
    
    // DISABLED: Willhaben - using zweispurig.at as primary source instead
    /*
    try {
      const willhabenVehicles = await fetchFromWillhaben(dealerSlug || dealerId, baseUrl);
      // Filter out duplicates (by title similarity)
      const existingTitles = new Set(allVehicles.map(v => v.title.toLowerCase().substring(0, 30)));
      const newVehicles = willhabenVehicles.filter(v => 
        !existingTitles.has(v.title.toLowerCase().substring(0, 30))
      );
      allVehicles.push(...newVehicles);
    } catch (e) {
      console.warn("Willhaben fetch failed:", e.message);
    }
    */
    
    // MACHINES: Landwirt.com for agricultural and construction machines
    try {
      const landwirtUrl = sourceUrls?.landwirt || '';
      const landwirtMatch = landwirtUrl.match(/\/([^\/]+)\/machines/) || 
                           landwirtUrl.match(/\/dealer\/info\/([^\/]+)/);
      const landwirtSlug = landwirtMatch ? landwirtMatch[1] : 'cb-handels-gmbh-10561';
      const machines = await fetchFromLandwirt(landwirtSlug, baseUrl);
      allVehicles.push(...machines);
      console.log(`Added ${machines.length} machines from Landwirt.com`);
    } catch (e) {
      console.warn("Landwirt fetch failed:", e.message);
    }
    
    console.log(`Combined total: ${allVehicles.length} vehicles/machines`);
    return allVehicles;
  }
  
  // Default: Try AutoScout24
  console.warn(`Unknown data source type: ${type}, defaulting to AutoScout24`);
  return await fetchFromAutoscout(dealerSlug || 'cb-handels-gmbh', baseUrl);
}

module.exports = { getVehicles };

