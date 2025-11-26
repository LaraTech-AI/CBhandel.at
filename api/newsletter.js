/**
 * Vercel Serverless Function - Newsletter Subscription Handler
 * Handles newsletter subscriptions and sends confirmation emails
 */

const nodemailer = require("nodemailer");
const dealerConfig = require('../config/dealerConfig.js');

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 3; // Maximum 3 subscriptions per hour per IP

/**
 * Check if IP has exceeded rate limit
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitStore.get(ip) || [];

  // Remove old requests outside the window
  const recentRequests = userRequests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  return true;
}

/**
 * Validate email address
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize input to prevent injection
 */
function sanitize(input) {
  if (typeof input !== "string") return "";
  return input.trim().substring(0, 254); // Max email length
}

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
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Please use POST.",
    });
  }

  try {
    // Get client IP for rate limiting
    const clientIP =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.connection.remoteAddress ||
      "unknown";

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({
        success: false,
        error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
      });
    }

    // Parse and validate request body
    const { email, type, message } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Bitte geben Sie eine E-Mail-Adresse ein.",
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      });
    }

    // Sanitize email
    const sanitizedEmail = sanitize(email);

    // Validate environment variables
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.CONTACT_TO_EMAIL
    ) {
      console.error("Missing required environment variables");
      return res.status(500).json({
        success: false,
        error:
          "Server-Konfigurationsfehler. Bitte kontaktieren Sie uns telefonisch.",
      });
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content for business notification
    const mailOptions = {
      from: `"${dealerConfig.name} Website" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: sanitizedEmail,
      subject: `Neue Newsletter-Anmeldung: ${sanitizedEmail}`,
      text: `
Neue Newsletter-Anmeldung über die Website

E-Mail: ${sanitizedEmail}

---
Gesendet am: ${new Date().toLocaleString("de-AT", {
        timeZone: "Europe/Vienna",
      })}
IP-Adresse: ${clientIP}
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1b8e2d; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #1b8e2d; }
    .value { margin-top: 5px; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>📧 Neue Newsletter-Anmeldung</h2>
      <p>${dealerConfig.name} Website</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">E-Mail-Adresse:</div>
        <div class="value"><a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></div>
      </div>
      <div class="footer">
        <p>Gesendet am: ${new Date().toLocaleString("de-AT", {
          timeZone: "Europe/Vienna",
        })}</p>
        <p>IP-Adresse: ${clientIP}</p>
      </div>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };

    // Send notification email
    await transporter.sendMail(mailOptions);

    // Build double opt-in confirmation link (signed, 24h validity)
    const secret = process.env.NEWSLETTER_SECRET || process.env.SMTP_PASS;
    const payload = { e: sanitizedEmail, t: Date.now() };
    const payloadB64 = Buffer.from(JSON.stringify(payload))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    const signature = require("crypto")
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    const confirmURLBase = process.env.PUBLIC_BASE_URL || dealerConfig.seo.canonicalUrl;
    const confirmURL = `${confirmURLBase}/api/newsletter-confirm?token=${payloadB64}.${signature}`;

    // Send confirmation email to subscriber (double opt-in)
    const confirmationOptions = {
      from: `"${dealerConfig.name}" <${process.env.SMTP_USER}>`,
      to: sanitizedEmail,
      subject: "Bitte bestätigen Sie Ihre Newsletter-Anmeldung",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1b8e2d; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
    .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 5px 5px; font-size: 12px; }
    h1 { margin: 0; font-size: 24px; }
    .cta { margin: 30px 0; text-align: center; }
    .btn { display: inline-block; padding: 12px 30px; background: #1b8e2d; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bitte bestätigen Sie Ihre Anmeldung</h1>
    </div>
    <div class="content">
      <p>Hallo,</p>
      <p>um Ihre Newsletter-Anmeldung für <strong>${sanitizedEmail}</strong> abzuschließen, klicken Sie bitte auf den folgenden Button:</p>
      <div class="cta">
        <a href="${confirmURL}" class="btn">Anmeldung bestätigen</a>
      </div>
      <p>Der Bestätigungslink ist 24 Stunden gültig. Wenn Sie diese Anmeldung nicht selbst vorgenommen haben, ignorieren Sie diese E-Mail bitte.</p>
    </div>
    <div class="footer">
      <p>${dealerConfig.name} | ${dealerConfig.address.full}</p>
      <p>Telefon: ${dealerConfig.phone} | E-Mail: ${dealerConfig.email}</p>
      <p>Diese E-Mail wurde automatisch generiert. Bitte nicht direkt antworten.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };

    await transporter.sendMail(confirmationOptions);

    // Return success response
    return res.status(200).json({ success: true, message: "Bitte bestätigen Sie Ihre Anmeldung. Wir haben Ihnen eine E-Mail gesendet." });
  } catch (error) {
    console.error("Newsletter subscription error:", error);

    // Return user-friendly error message
    return res.status(500).json({
      success: false,
      error:
        `Es ist ein Fehler beim Anmelden aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch unter ${dealerConfig.phone}.`,
    });
  }
};

