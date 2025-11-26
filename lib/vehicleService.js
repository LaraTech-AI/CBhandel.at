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
 * Main function to get vehicles from configured data source
 * @returns {Promise<Array>} Array of vehicle objects
 */
async function getVehicles() {
  const { type, dealerId, baseUrl, apiEndpoints, sourceUrls } = dealerConfig.dataSource;
  
  if (type === 'motornetzwerk') {
    return await fetchFromMotornetzwerk(dealerId, apiEndpoints, sourceUrls, baseUrl);
  }
  
  // Future: Add support for willhaben, gebrauchtwagen, combined
  throw new Error(`Unsupported data source type: ${type}`);
}

module.exports = { getVehicles };

