/**
 * Vercel Serverless Function - Vehicle Data Fetcher
 * Fetches vehicle listings from configured data source and returns structured data
 * Now includes both regular vehicles (PKW) and commercial vehicles (Nutzfahrzeuge)
 */

const { getVehicles } = require('../lib/vehicleService.js');
const dealerConfig = require('../config/dealerConfig.js');

// Cache duration: 1 hour (3600 seconds)
const CACHE_DURATION = 60 * 60 * 1000;

// Simple in-memory cache (resets on cold start)
let cache = {
  data: null,
  timestamp: null,
};


/**
 * Main handler function
 */
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

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Please use GET.",
    });
  }

  try {
    // Check cache
    const now = Date.now();
    if (
      cache.data &&
      cache.timestamp &&
      now - cache.timestamp < CACHE_DURATION
    ) {
      return res.status(200).json({
        success: true,
        vehicles: cache.data,
        cached: true,
        timestamp: cache.timestamp,
      });
    }

    // Fetch fresh data
    console.log("Starting to fetch vehicles...");
    let vehicles;
    try {
      vehicles = await getVehicles();
      console.log(
        "Fetch completed, vehicles type:",
        typeof vehicles,
        "isArray:",
        Array.isArray(vehicles),
        "length:",
        vehicles?.length
      );
    } catch (fetchError) {
      console.error(
        "Error in fetchVehicles:",
        fetchError.message,
        fetchError.stack
      );
      throw fetchError;
    }

    // Ensure vehicles is always an array
    const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
    console.log("Safe vehicles count:", safeVehicles.length);

    // Update cache only if we have vehicles
    if (safeVehicles.length > 0) {
      cache.data = safeVehicles;
      cache.timestamp = now;
    }

    // Return response - always return success even if empty (better UX)
    return res.status(200).json({
      success: true,
      vehicles: safeVehicles,
      cached: false,
      timestamp: now,
      count: safeVehicles.length,
    });
  } catch (error) {
    console.error("Vehicles API error:", error);

    // Return cached data if available, even if expired
    if (cache.data && Array.isArray(cache.data) && cache.data.length > 0) {
      return res.status(200).json({
        success: true,
        vehicles: cache.data,
        cached: true,
        timestamp: cache.timestamp,
        count: cache.data.length,
        warning: "Using cached data due to fetch error",
      });
    }

    // Return error if no cache available
    return res.status(500).json({
      success: false,
      error: "Failed to fetch vehicle data. Please try again later.",
    });
  }
};
