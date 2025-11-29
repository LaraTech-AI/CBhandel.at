/**
 * Vehicle Service - Abstraction layer for vehicle data fetching
 * Supports multiple data sources (currently motornetzwerk, extensible for others)
 */

const dealerConfig = require('../config/dealerConfig.js');

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
              `${baseUrl}/fahrzeugdetails?vid=${vehicleId}`,
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
            url: `${baseUrl}/fahrzeugdetails?vid=${vehicleId}`,
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
        let vehicleUrl = `https://www.willhaben.at/iad/gebrauchtwagen/d/auto/vw-multivan-trendline-2-0-tdi-4motion-bmt-dsg-mod-${vehicleId}/`;
        if (structuredItem && structuredItem.url) {
          vehicleUrl = structuredItem.url.startsWith('http') ? structuredItem.url : `https://www.willhaben.at${structuredItem.url}`;
        } else if (structuredItem && structuredItem.item && structuredItem.item.url) {
          vehicleUrl = structuredItem.item.url.startsWith('http') ? structuredItem.item.url : `https://www.willhaben.at${structuredItem.item.url}`;
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
          url = urlMatch[1].startsWith('http') ? urlMatch[1] : `https://www.autoscout24.at${urlMatch[1]}`;
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
              url: vehicleInfo.url || vehicle.url || `https://www.autoscout24.at/haendler/${dealerSlug}`,
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
        const angeboteMatch = vehicleHtml.match(/href=["'](\/angebote\/[^"']*-[a-f0-9-]{36})["']/i);
        const oldUrlMatch = vehicleHtml.match(/href=["']([^"']*fahrzeugdetails[^"']*)["']/i);
        const vehicleUrl = vehicleInfo.url || 
                          (angeboteMatch ? `https://www.autoscout24.at${angeboteMatch[1]}` : null) ||
                          (oldUrlMatch ? (oldUrlMatch[1].startsWith('http') ? oldUrlMatch[1] : `https://www.autoscout24.at${oldUrlMatch[1]}`) : null) ||
                          `https://www.autoscout24.at/haendler/${dealerSlug}`;
        
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
          url: vehicleUrl.startsWith('http') ? vehicleUrl : `https://www.autoscout24.at${vehicleUrl}`,
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
      
      const vehicles = parseLandwirtMachines(html);
      
      // If we found vehicles, return them
      if (vehicles.length > 0) {
        console.log(`Found ${vehicles.length} machines from Landwirt.com HTML`);
        return vehicles;
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
          
          const vehicles = parseLandwirtMachines(html);
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
 * Parse machines from Landwirt.com HTML
 */
function parseLandwirtMachines(html) {
  const machines = [];
  
  try {
    // FIRST: Extract ALL image URLs from the HTML
    // Landwirt.com uses images.landwirt.com for product images
    const allImagesRegex = /https:\/\/images\.landwirt\.com\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/gi;
    const imageMatches = html.match(allImagesRegex) || [];
    
    // Filter out small thumbnails and duplicates, keep only medium/large images
    const uniqueImages = [...new Set(imageMatches)]
      .filter(url => !url.includes('_50x') && !url.includes('_100x') && !url.includes('/logo'))
      .slice(0, 20); // Limit to first 20 unique images
    
    console.log(`Found ${uniqueImages.length} unique machine images from Landwirt.com`);
    
    // Landwirt uses JSON data embedded in the page (Nuxt/Vue)
    // Try to extract from __NUXT_DATA__ or similar
    const nuxtDataMatch = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    
    // SECOND: Try to extract from JSON-LD or Nuxt data (like Willhaben pattern)
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gs;
    const jsonLdMatches = [...html.matchAll(jsonLdRegex)];
    
    let structuredData = null;
    let machineIdentifiers = [];
    
    // Try JSON-LD first
    for (const match of jsonLdMatches) {
      try {
        const jsonContent = match[1].trim();
        const data = JSON.parse(jsonContent);
        if (data['@type'] === 'ItemList' && Array.isArray(data.itemListElement)) {
          structuredData = data;
          data.itemListElement.forEach((item) => {
            if (item.item) {
              const identifier = item.item.identifier || item.item.sku || item.item['@id'] || null;
              if (identifier) {
                machineIdentifiers.push({
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
        // Not valid JSON, continue
      }
    }
    
    // Try Nuxt data (window.__NUXT__ format) - skip for now, too complex to parse safely
    // Will rely on HTML extraction and fallback methods instead
    
    // Try Nuxt data (script tag format)
    if (machineIdentifiers.length === 0 && nuxtDataMatch) {
      try {
        const jsonData = JSON.parse(nuxtDataMatch[1]);
        
        if (Array.isArray(jsonData)) {
          jsonData.forEach((item, idx) => {
            if (item && typeof item === 'object' && (item.title || item.name)) {
              machineIdentifiers.push({
                id: item.id || item.sku || `nuxt-${idx}`,
                url: item.url || null,
                structuredData: item
              });
            }
          });
        } else if (jsonData.data && Array.isArray(jsonData.data)) {
          jsonData.data.forEach((item, idx) => {
            if (item && typeof item === 'object' && (item.title || item.name)) {
              machineIdentifiers.push({
                id: item.id || item.sku || `nuxt-${idx}`,
                url: item.url || null,
                structuredData: item
              });
            }
          });
        }
        
        console.log(`Found ${machineIdentifiers.length} machine identifiers from Nuxt data`);
      } catch (e) {
        console.error("Error parsing Landwirt Nuxt data:", e.message);
      }
    }
    
    // THIRD: Extract from HTML links, titles, or use image URLs as fallback
    if (machineIdentifiers.length === 0) {
      // Try multiple link patterns
      const machineLinkRegex1 = /href=["'][^"']*\/machine[^"']*\/([^"'\s\/]+)/gi;
      const machineLinkRegex2 = /href=["'][^"']*\/maschinenmarkt[^"']*\/([^"'\s\/]+)/gi;
      const machineLinkRegex3 = /href=["'][^"']*\/machines[^"']*\/([^"'\s\/]+)/gi;
      
      const linkMatches1 = [...html.matchAll(machineLinkRegex1)];
      const linkMatches2 = [...html.matchAll(machineLinkRegex2)];
      const linkMatches3 = [...html.matchAll(machineLinkRegex3)];
      
      const idsFromLinks = [...new Set([
        ...linkMatches1.map(m => m[1]),
        ...linkMatches2.map(m => m[1]),
        ...linkMatches3.map(m => m[1])
      ])];
      
      if (idsFromLinks.length > 0) {
        machineIdentifiers = idsFromLinks.map(id => ({ id, url: null, structuredData: null }));
        console.log(`Found ${machineIdentifiers.length} machine identifiers from links`);
      } else {
        // Try to extract from titles/headings near images
        const titlePattern = /<h[23][^>]*>([^<]{10,80})<\/h[23]>/gi;
        const titleMatches = [...html.matchAll(titlePattern)];
        const titles = [...new Set(titleMatches.map(m => m[1].trim()))]
          .filter(t => t.length > 10 && t.length < 100)
          .slice(0, 20);
        
        if (titles.length > 0) {
          machineIdentifiers = titles.map((title, idx) => ({
            id: `title-${idx}`,
            url: null,
            structuredData: null,
            title: title
          }));
          console.log(`Found ${machineIdentifiers.length} machine identifiers from titles`);
        } else {
          // Use image URLs as identifiers
          machineIdentifiers = uniqueImages.map((url, idx) => ({ 
            id: `image-${idx}`, 
            url: null, 
            structuredData: null,
            imageUrl: url
          }));
          console.log(`Found ${machineIdentifiers.length} machine identifiers from images`);
        }
      }
    }
    
    // FALLBACK: If no identifiers found, try to extract from HTML patterns
    if (machineIdentifiers.length === 0) {
      console.log("No identifiers found, trying pattern-based extraction as fallback...");
      
      // Extract all images
      const imageUrlRegex = /https:\/\/images\.landwirt\.com\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/gi;
      const imageMatches = [...html.matchAll(imageUrlRegex)];
      const uniqueImageUrls = [...new Set(imageMatches.map(m => m[0]))]
        .filter(url => !url.includes('_50x') && !url.includes('_100x') && !url.includes('/logo'))
        .slice(0, 20);
      
      // Try to find machine titles and prices in HTML
      // Look for common patterns: title + price combinations
      const pricePattern = /€\s*([\d\s.]+)|([\d\s.]+)\s*€/g;
      const priceMatches = [...html.matchAll(pricePattern)];
      
      priceMatches.forEach((priceMatch, idx) => {
        const price = parseInt((priceMatch[1] || priceMatch[2]).replace(/\s/g, '').replace(/\./g, ''));
        if (!price || price < 100) return; // Machines can be cheaper than cars
        
        // Get context around price
        const startPos = Math.max(0, priceMatch.index - 2000);
        const endPos = Math.min(html.length, priceMatch.index + 1500);
        const context = html.substring(startPos, endPos);
        
        // Try to find title in context
        const titleMatch = context.match(/<h[23][^>]*>([^<]{5,80})<\/h[23]>/i) ||
                          context.match(/class="[^"]*title[^"]*"[^>]*>([^<]{5,80})</i) ||
                          context.match(/>([A-Z][^<>]{10,60})</);
        
        if (titleMatch) {
          const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
          if (title.length > 5 && title.length < 100) {
            // Find image in context
            const imageInContext = context.match(/https:\/\/images\.landwirt\.com\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/i);
            
            machineIdentifiers.push({
              id: `fallback-${idx}`,
              url: null,
              structuredData: null,
              imageUrl: imageInContext ? imageInContext[0] : (uniqueImageUrls[idx] || null),
              title: title,
              price: price,
              context: context
            });
          }
        }
      });
      
      console.log(`Found ${machineIdentifiers.length} machines using pattern-based fallback`);
    }
    
    if (machineIdentifiers.length === 0) {
      console.warn("No machine identifiers found in Landwirt.com HTML after all fallbacks");
      return [];
    }
    
    console.log(`Processing ${machineIdentifiers.length} machines from Landwirt.com`);
    
    // FOURTH: Process each machine individually (like Willhaben does)
    machineIdentifiers.forEach((machineInfo, index) => {
      try {
        const machineId = machineInfo.id;
        let machineHtml = null;
        
        // Escape machineId for regex if needed
        const escapedMachineId = machineId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Find HTML section - multiple methods
        // Method 1: Look for article containing the ID
        const articlePattern = new RegExp(`<article[^>]*[^>]*>([\\s\\S]*?${escapedMachineId}[\\s\\S]*?)<\\/article>`, 'i');
        const articleMatch = html.match(articlePattern);
        if (articleMatch) machineHtml = articleMatch[1];
        
        // Method 2: Look for div with data-id or similar
        if (!machineHtml) {
          const dataPattern = new RegExp(`<div[^>]*data-id=["']${escapedMachineId}["'][^>]*>([\\s\\S]*?)(?=<div[^>]*data-id|$)`, 'i');
          const dataMatch = html.match(dataPattern);
          if (dataMatch) machineHtml = dataMatch[1];
        }
        
        // Method 3: Look for context around image
        if (!machineHtml && machineInfo.imageUrl) {
          const imageEscaped = machineInfo.imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const imagePattern = new RegExp(`([\\s\\S]{0,3000}?${imageEscaped}[\\s\\S]{0,3000}?)`, 'i');
          const imageMatch = html.match(imagePattern);
          if (imageMatch) machineHtml = imageMatch[1];
        }
        
        // Method 4: Look for context around title if available
        if (!machineHtml && machineInfo.title) {
          const titleEscaped = machineInfo.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const titlePattern = new RegExp(`([\\s\\S]{0,3000}?${titleEscaped}[\\s\\S]{0,3000}?)`, 'i');
          const titleMatch = html.match(titlePattern);
          if (titleMatch) machineHtml = titleMatch[1];
        }
        
        // Method 5: Use context from fallback extraction if available
        if (!machineHtml && machineInfo.context) {
          machineHtml = machineInfo.context;
        }
        
        // Method 5: If we have title and price from fallback, use them directly
        if (!machineHtml && machineInfo.title && machineInfo.price) {
          machines.push({
            id: `landwirt-${machineId}`,
            title: machineInfo.title,
            price: machineInfo.price,
            year: null,
            mileage: null,
            fuelType: null,
            power: null,
            transmission: null,
            image: machineInfo.imageUrl || null,
            url: machineInfo.url || 'https://www.landwirt.com/dealer/info/cb-handels-gmbh-10561/machines',
            category: 'baumaschine'
          });
          console.log(`Successfully parsed Landwirt machine from fallback: ${machineInfo.title} - €${machineInfo.price}`);
          return; // Skip HTML parsing
        }
        
        // Use structured data if available
        if (!machineHtml && machineInfo.structuredData) {
          const machine = machineInfo.structuredData;
          const title = machine.name || machine.title || machine.headline || null;
          const price = machine.offers?.price || machine.price || null;
          
          if (title) {
            machines.push({
              id: `landwirt-${machineId}`,
              title: title.replace(/<[^>]+>/g, '').trim(),
              price: price ? (typeof price === 'string' ? parseInt(price.replace(/[^\d]/g, '')) : price) : null,
              year: machine.productionDate ? parseInt(machine.productionDate) : (machine.year ? parseInt(machine.year) : null),
              mileage: null,
              fuelType: null,
              power: machine.engine?.power ? { kw: machine.engine.power, ps: Math.round(machine.engine.power * 1.36) } : null,
              transmission: null,
              image: machine.image || machine.thumbnailUrl || machineInfo.imageUrl || null,
              url: machineInfo.url || machine.url || 'https://www.landwirt.com/dealer/info/cb-handels-gmbh-10561/machines',
              category: 'baumaschine'
            });
            return;
          }
        }
        
        if (!machineHtml) {
          console.warn(`Could not find HTML section for Landwirt machine ${machineId}`);
          return;
        }
        
        // Extract from HTML
        let title = null;
        
        // If title was already extracted from identifier, use it
        if (machineInfo.title) {
          title = machineInfo.title.replace(/<[^>]+>/g, '').trim();
        } else if (machineHtml) {
          // Try to extract from HTML section
          const titleMatch = machineHtml.match(/<h[23][^>]*>([^<]{5,100})<\/h[23]>/i) ||
                            machineHtml.match(/data-title=["']([^"']{5,100})["']/i) ||
                            machineHtml.match(/aria-label=["']([^"']{5,100})["']/i) ||
                            machineHtml.match(/title=["']([^"']{5,100})["']/i) ||
                            machineHtml.match(/class=["'][^"']*title[^"']*["'][^>]*>([^<]{5,100})</i);
          if (titleMatch) {
            title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
          }
        }
        
        // If still no title, try to extract from context around image
        if (!title && machineInfo.imageUrl) {
          const imageEscaped = machineInfo.imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const contextMatch = html.match(new RegExp(`([\\s\\S]{0,1000}?${imageEscaped}[\\s\\S]{0,1000}?)`, 'i'));
          if (contextMatch) {
            const context = contextMatch[1];
            const contextTitleMatch = context.match(/<h[23][^>]*>([^<]{5,100})<\/h[23]>/i) ||
                                     context.match(/class=["'][^"']*title[^"']*["'][^>]*>([^<]{5,100})</i) ||
                                     context.match(/title=["']([^"']{5,100})["']/i);
            if (contextTitleMatch) {
              title = contextTitleMatch[1].replace(/<[^>]+>/g, '').trim();
            }
          }
        }
        
        // Last resort: try to extract from machineId if it's a readable slug
        if (!title && machineId && machineId.length > 10 && !machineId.startsWith('image-') && !machineId.startsWith('title-')) {
          title = machineId
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
          if (title.length < 5) title = null;
        }
        
        if (!title || title.length < 3) {
          console.warn(`No valid title found for machine ${machineId}`);
          return;
        }
        
        const priceMatch = machineHtml.match(/€\s*([\d\s.]+)/) ||
                          machineHtml.match(/([\d\s.]+)\s*€/);
        const price = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, '').replace(/\./g, '')) : null;
        
        const yearMatch = machineHtml.match(/(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1]) : null;
        
        const powerMatch = machineHtml.match(/(\d+)\s*kW/i) || machineHtml.match(/(\d+)\s*PS/i);
        const power = powerMatch ? { 
          kw: parseInt(powerMatch[1]), 
          ps: Math.round(parseInt(powerMatch[1]) * 1.36) 
        } : null;
        
        let image = machineInfo.imageUrl || null;
        if (!image) {
          const imgMatch = machineHtml.match(/https:\/\/images\.landwirt\.com\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)/i);
          if (imgMatch) image = imgMatch[0];
        }
        
        // Only add if we have at least a title
        if (title && title.length >= 3) {
          machines.push({
            id: `landwirt-${machineId}`,
            title: title,
            price: price,
            year: year,
            mileage: null,
            fuelType: null,
            power: power,
            transmission: null,
            image: image,
            url: machineInfo.url || 'https://www.landwirt.com/dealer/info/cb-handels-gmbh-10561/machines',
            category: 'baumaschine'
          });
          
          console.log(`Successfully parsed Landwirt machine ${index + 1}: ${title} - €${price || 'Preis auf Anfrage'} ${image ? '(with image)' : '(no image)'}`);
        } else {
          console.warn(`Skipping Landwirt machine ${machineId}: no valid title (${title ? title.length : 0} chars)`);
        }
      } catch (e) {
        console.error(`Error parsing Landwirt machine ${machineInfo.id}:`, e.message);
      }
    });
    
    // Filter out invalid entries
    const validMachines = machines.filter(m => {
      if (!m.title || m.title.length < 3) return false;
      if (m.title.includes('function') || m.title.includes('{') || m.title.includes('}')) return false;
      if (m.title.includes('<') || m.title.includes('>')) return false;
      return true;
    });
    
    console.log(`Parsed ${validMachines.length} valid machines from Landwirt.com (filtered from ${machines.length} total)`);
    return validMachines;
    
  } catch (e) {
    console.error("Error parsing Landwirt machines:", e.message);
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
    
    try {
      // Try AutoScout24 first (has most vehicles)
      const autoscoutVehicles = await fetchFromAutoscout(dealerSlug || dealerId, baseUrl);
      allVehicles.push(...autoscoutVehicles);
    } catch (e) {
      console.warn("AutoScout24 fetch failed:", e.message);
    }
    
    try {
      // Also try willhaben
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
    
    try {
      // Also try Landwirt for machines
      const landwirtUrl = sourceUrls?.landwirt || '';
      const landwirtMatch = landwirtUrl.match(/\/([^\/]+)\/machines/);
      const landwirtSlug = landwirtMatch ? landwirtMatch[1] : 'cb-handels-gmbh-10561';
      const machines = await fetchFromLandwirt(landwirtSlug, baseUrl);
      allVehicles.push(...machines);
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

