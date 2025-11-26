/**
 * Vercel Serverless Function - Vehicle Details Fetcher
 * Fetches comprehensive vehicle data from configured data source's JSON API
 */

const dealerConfig = require('../config/dealerConfig.js');

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MOTORNETZWERK_API =
  "https://direktonline.motornetzwerk.at/app/php-wrappers/php-wrapper.php";
const DEALER_AID = dealerConfig.dataSource.dealerId;

const detailsCache = new Map();

function getCached(vid) {
  const entry = detailsCache.get(vid);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    detailsCache.delete(vid);
    return null;
  }
  return entry.data;
}

function setCached(vid, data) {
  detailsCache.set(vid, { data, timestamp: Date.now() });
}

/**
 * Strip HTML tags from string
 */
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse and transform motornetzwerk.at API response to our format
 */
function transformVehicleData(apiData) {
  // Extract all image URLs from advertImages array
  const images = (apiData.advertImages || [])
    .map((img) => img.referenceImageUrl)
    .filter(Boolean);

  return {
    vid: String(apiData.adId || ""),
    title: apiData.title || null,
    price: apiData.price ? parseInt(apiData.price) : null,

    // Basic info
    make: apiData.make || null,
    model: apiData.model || null,
    modelSpecification: apiData.modelSpecification || null,
    year: apiData.registrationYear || null,
    registrationMonth: apiData.registrationMonth || null,
    registrationYear: apiData.registrationYear || null,

    // Condition
    motorCondition: apiData.motorCondition || null,
    carType: apiData.carType || null,

    // Engine specs
    mileage: apiData.mileage || null,
    engineFuel: apiData.engineFuel || null,
    engineVolume: apiData.engineVolume || null,
    engineEffectKw: apiData.engineEffectKw || null,
    engineEffectPs: apiData.engineEffectPs || null,
    engineCylinder: apiData.engineCylinder || null,

    // Transmission & drive
    transmission: apiData.transmission || null,
    wheelDrive: apiData.wheelDrive || null,

    // Exterior
    mainExteriorColour: apiData.mainExteriorColour || null,
    exteriorColour: apiData.exteriorColour || null,

    // Dimensions
    numberOfSeats: apiData.numberOfSeats || null,
    numberOfDoors: apiData.numberOfDoors || null,
    emptyWeight: apiData.emptyWeight || null,
    totalWeight: apiData.totalWeight || null,
    trailerLoad: apiData.trailerLoad || null,
    lengthCm: apiData.lengthCm || null,
    widthCm: apiData.widthCm || null,

    // Environment
    co2Footprint: apiData.co2Footprint || null,
    emissionStandard: apiData.emissionStandard || null,
    consumption: apiData.consumption || null,

    // Warranty
    warranty: apiData.warranty || false,
    warrantyDuration: apiData.warrantyDuration || null,
    defectsLiability: apiData.defectsLiability || false,
    conditionReport: apiData.conditionReport || false,
    conditionReportValidUntil: apiData.conditionReportValidUntil || null,

    // Electric vehicle data
    batteryCapacity: apiData.batteryCapacity || null,
    wltpRange: apiData.wltpRange || null,

    // Leasing info
    leasingDurationMonths: apiData.leasingDurationMonths || null,
    leasingAdvancePayment: apiData.leasingAdvancePayment || null,
    leasingMileagePerYear: apiData.leasingMileagePerYear || null,
    leasingMonthlyRate: apiData.leasingMonthlyRate || null,
    leasingResidualValue: apiData.leasingResidualValue || null,
    leasingDetails: apiData.leasingDetails || null,

    // Content
    description: stripHtml(apiData.description || ""),
    descriptionHtml: apiData.description || null,

    // Equipment - full list
    equipment: apiData.equipmentList || [],

    // Images - all of them
    images: images,
    image: images.length > 0 ? images[0] : null,

    // Links
    externalUrl: `${dealerConfig.dataSource.baseUrl}/fahrzeugdetails?vid=${
      apiData.adId || ""
    }`,

    // Dealer info (if available)
    dealer: {
      name: dealerConfig.name,
      address: dealerConfig.address.full,
      phone: dealerConfig.phone,
      email: dealerConfig.email,
    },
  };
}

module.exports = async (req, res) => {
  // Set CORS headers with origin whitelist
  const allowedOrigins = dealerConfig.corsOrigins;

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { vid } = req.query;

  if (!vid) {
    return res.status(400).json({ error: "Missing vid parameter" });
  }

  // Validate vid is numeric and within expected range
  if (!/^\d+$/.test(vid) || vid.length > 10) {
    return res.status(400).json({ error: "Invalid vehicle ID format" });
  }

  try {
    // Check cache first
    const cached = getCached(vid);
    if (cached) {
      console.log(`Returning cached vehicle details for vid ${vid}`);
      return res.status(200).json(cached);
    }

    console.log(
      `Fetching vehicle details from motornetzwerk.at API for vid ${vid}`
    );

    // Fetch from motornetzwerk.at JSON API
    const apiUrl = `${MOTORNETZWERK_API}?aid=${DEALER_AID}&vid=${vid}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const apiData = await response.json();

    if (!apiData || !apiData.adId) {
      throw new Error("Invalid API response - missing vehicle data");
    }

    // Transform to our format
    const vehicleData = transformVehicleData(apiData);

    console.log(`Successfully fetched vehicle ${vid}: ${vehicleData.title}`);
    console.log(`- Images: ${vehicleData.images.length}`);
    console.log(`- Equipment items: ${vehicleData.equipment.length}`);
    console.log(
      `- Description length: ${vehicleData.description.length} chars`
    );

    // Cache the result
    setCached(vid, vehicleData);

    return res.status(200).json(vehicleData);
  } catch (error) {
    console.error(`Error fetching vehicle details for vid ${vid}:`, error);
    return res.status(500).json({
      error: "Failed to fetch vehicle details",
      message: error.message,
      vid: vid,
    });
  }
};
