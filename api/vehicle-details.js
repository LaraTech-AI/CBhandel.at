/**
 * Vercel Serverless Function - Vehicle Details Fetcher
 * Fetches comprehensive vehicle data from configured data source's JSON API
 * Supports multiple sources: motornetzwerk, autoscout24, willhaben, landwirt
 */

const dealerConfig = require('../config/dealerConfig.js');
const { getVehicles } = require('../lib/vehicleService.js');

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MOTORNETZWERK_API =
  "https://direktonline.motornetzwerk.at/app/php-wrappers/php-wrapper.php";
const DEALER_AID = dealerConfig.dataSource.dealerId;

const detailsCache = new Map();
const vehiclesListCache = {
  data: null,
  timestamp: null,
  TTL: 30 * 60 * 1000, // 30 minutes
};

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
 * Transform vehicle data from vehicles list to our format
 */
function transformVehicleFromList(vehicle) {
  const images = vehicle.allImages || (vehicle.image ? [vehicle.image] : []);
  
  return {
    vid: String(vehicle.id || ""),
    title: vehicle.title || null,
    price: vehicle.price ? parseInt(vehicle.price) : null,

    // Basic info
    make: null, // Not available from list
    model: null, // Not available from list
    modelSpecification: null,
    year: vehicle.year || null,
    registrationMonth: null,
    registrationYear: vehicle.year || null,

    // Condition
    motorCondition: null,
    carType: vehicle.vehicleType || null,

    // Engine specs
    mileage: vehicle.mileage || null,
    engineFuel: vehicle.fuelType || null,
    engineVolume: null,
    engineEffectKw: vehicle.power?.kw || null,
    engineEffectPs: vehicle.power?.ps || null,
    engineCylinder: null,

    // Transmission & drive
    transmission: vehicle.transmission || null,
    wheelDrive: null,

    // Exterior
    mainExteriorColour: null,
    exteriorColour: null,

    // Dimensions
    numberOfSeats: null,
    numberOfDoors: null,
    emptyWeight: null,
    totalWeight: null,
    trailerLoad: null,
    lengthCm: null,
    widthCm: null,

    // Environment
    co2Footprint: null,
    emissionStandard: null,
    consumption: null,

    // Warranty
    warranty: vehicle.warranty || false,
    warrantyDuration: null,
    defectsLiability: vehicle.defectsLiability || false,
    conditionReport: false,
    conditionReportValidUntil: null,

    // Electric vehicle data
    batteryCapacity: null,
    wltpRange: null,

    // Leasing info
    leasingDurationMonths: null,
    leasingAdvancePayment: null,
    leasingMileagePerYear: null,
    leasingMonthlyRate: null,
    leasingResidualValue: null,
    leasingDetails: null,

    // Content
    description: vehicle.description || "",
    descriptionHtml: vehicle.description || null,

    // Equipment - empty for now (could be enhanced later)
    equipment: [],

    // Images - all of them
    images: images,
    image: images.length > 0 ? images[0] : null,

    // Links
    externalUrl: vehicle.url || `${dealerConfig.dataSource.baseUrl}/fahrzeugdetails?vid=${vehicle.id || ""}`,

    // Dealer info
    dealer: {
      name: dealerConfig.name,
      address: dealerConfig.address.full,
      phone: dealerConfig.phone,
      email: dealerConfig.email,
    },
  };
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

  if (!vid || typeof vid !== 'string' || vid.trim().length === 0) {
    return res.status(400).json({ error: "Missing or invalid vid parameter" });
  }

  // Detect source from vehicle ID format
  const isAutoscout = vid.startsWith('autoscout-');
  const isLandwirt = vid.startsWith('landwirt-');
  const isNumeric = /^\d+$/.test(vid);

  try {
    // Check cache first
    const cached = getCached(vid);
    if (cached) {
      console.log(`Returning cached vehicle details for vid ${vid}`);
      return res.status(200).json(cached);
    }

    // Strategy: First try vehicles list (for autoscout, willhaben, landwirt)
    // Then fallback to motornetzwerk API for numeric IDs if not found
    let vehicle = null;
    let vehicles = null;

    // Get vehicles list (with caching) - always fetch for non-motornetzwerk or as fallback
    const now = Date.now();
    if (!vehiclesListCache.data || !vehiclesListCache.timestamp || (now - vehiclesListCache.timestamp > vehiclesListCache.TTL)) {
      console.log('Fetching fresh vehicles list...');
      vehicles = await getVehicles();
      vehiclesListCache.data = vehicles;
      vehiclesListCache.timestamp = now;
    } else {
      console.log('Using cached vehicles list');
      vehicles = vehiclesListCache.data;
    }

    // Try to find vehicle in list first
    vehicle = vehicles.find(v => v.id === vid);

    if (vehicle) {
      // Found in vehicles list - transform and return
      console.log(
        `Found vehicle ${vid} in vehicles list (source: ${isAutoscout ? 'autoscout' : isLandwirt ? 'landwirt' : 'willhaben/other'})`
      );

      const vehicleData = transformVehicleFromList(vehicle);

      console.log(`Successfully fetched vehicle ${vid}: ${vehicleData.title}`);
      console.log(`- Images: ${vehicleData.images.length}`);
      console.log(`- Price: €${vehicleData.price}`);

      // Cache the result
      setCached(vid, vehicleData);

      return res.status(200).json(vehicleData);
    }

    // Not found in list - if numeric ID, try motornetzwerk API as fallback
    if (isNumeric) {
      console.log(
        `Vehicle ${vid} not found in vehicles list, trying motornetzwerk.at API as fallback`
      );

      // Fetch from motornetzwerk.at JSON API
      const apiUrl = `${MOTORNETZWERK_API}?aid=${DEALER_AID}&vid=${vid}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Vehicle not found in vehicles list and motornetzwerk API returned ${response.status}`);
      }

      const apiData = await response.json();

      if (!apiData || !apiData.adId) {
        throw new Error("Vehicle not found in vehicles list and invalid motornetzwerk API response");
      }

      // Transform to our format
      const vehicleData = transformVehicleData(apiData);

      console.log(`Successfully fetched vehicle ${vid} from motornetzwerk: ${vehicleData.title}`);
      console.log(`- Images: ${vehicleData.images.length}`);
      console.log(`- Equipment items: ${vehicleData.equipment.length}`);
      console.log(
        `- Description length: ${vehicleData.description.length} chars`
      );

      // Cache the result
      setCached(vid, vehicleData);

      return res.status(200).json(vehicleData);
    }

    // Not found anywhere
    throw new Error(`Vehicle not found with ID: ${vid}`);
  } catch (error) {
    console.error(`Error fetching vehicle details for vid ${vid}:`, error);
    return res.status(500).json({
      error: "Failed to fetch vehicle details",
      message: error.message,
      vid: vid,
    });
  }
};
