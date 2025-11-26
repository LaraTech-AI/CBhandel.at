/**
 * Vercel Serverless Function - Contact Form Handler
 * Handles form submissions and sends emails via nodemailer
 */

const nodemailer = require("nodemailer");
const dealerConfig = require('../config/dealerConfig.js');

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 5; // Maximum 5 submissions per hour per IP

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
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .substring(0, 1000); // Limit length
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
    const { name, email, telefon, nachricht, datenschutz } = req.body;

    // Validate required fields
    if (!name || !email || !nachricht) {
      return res.status(400).json({
        success: false,
        error: "Bitte füllen Sie alle Pflichtfelder aus.",
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      });
    }

    // Validate privacy policy acceptance
    if (!datenschutz) {
      return res.status(400).json({
        success: false,
        error: "Bitte akzeptieren Sie die Datenschutzerklärung.",
      });
    }

    // Sanitize inputs
    const sanitizedName = sanitize(name);
    const sanitizedEmail = sanitize(email);
    const sanitizedTelefon = sanitize(telefon || "Nicht angegeben");
    const sanitizedNachricht = sanitize(nachricht);

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

    // Email content
    const mailOptions = {
      from: `"${dealerConfig.name} Website" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: sanitizedEmail,
      subject: `Neue Kontaktanfrage von ${sanitizedName}`,
      text: `
Neue Kontaktanfrage über die Website

Name: ${sanitizedName}
E-Mail: ${sanitizedEmail}
Telefon: ${sanitizedTelefon}

Nachricht:
${sanitizedNachricht}

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
    .message-box { background: white; padding: 15px; border-left: 4px solid #1b8e2d; margin-top: 10px; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Neue Kontaktanfrage</h2>
      <p>${dealerConfig.name} Website</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Name:</div>
        <div class="value">${sanitizedName}</div>
      </div>
      <div class="field">
        <div class="label">E-Mail:</div>
        <div class="value"><a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></div>
      </div>
      <div class="field">
        <div class="label">Telefon:</div>
        <div class="value">${sanitizedTelefon}</div>
      </div>
      <div class="field">
        <div class="label">Nachricht:</div>
        <div class="message-box">${sanitizedNachricht.replace(
          /\n/g,
          "<br>"
        )}</div>
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

    // Send email
    await transporter.sendMail(mailOptions);

    // Send auto-reply to customer
    const autoReplyOptions = {
      from: `"${dealerConfig.name}" <${process.env.SMTP_USER}>`,
      to: sanitizedEmail,
      subject: `Danke für Ihre Anfrage - ${dealerConfig.name}`,
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
    .contact-info { margin-top: 20px; padding: 15px; background: white; border-left: 4px solid #1b8e2d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vielen Dank für Ihre Anfrage!</h1>
    </div>
    <div class="content">
      <p>Liebe/r ${sanitizedName},</p>
      <p>vielen Dank für Ihr Interesse an ${dealerConfig.name}.</p>
      <p>Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden – in der Regel innerhalb von 24 Stunden.</p>
      <div class="contact-info">
        <strong>Für dringende Anfragen erreichen Sie uns unter:</strong><br>
        Telefon: <a href="tel:${dealerConfig.phone.replace(/\s/g, '')}">${dealerConfig.phone}</a><br>
        E-Mail: <a href="mailto:${dealerConfig.email}">${dealerConfig.email}</a><br><br>
        <strong>Öffnungszeiten:</strong><br>
        ${dealerConfig.openingHours.weekdays}
      </div>
      <p>Mit freundlichen Grüßen,<br>Ihr Team von ${dealerConfig.name}</p>
    </div>
    <div class="footer">
      <p>${dealerConfig.name} | ${dealerConfig.address.full}</p>
      <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese Nachricht.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };

    await transporter.sendMail(autoReplyOptions);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Nachricht erfolgreich gesendet.",
    });
  } catch (error) {
    console.error("Contact form error:", error);

    // Return user-friendly error message
    return res.status(500).json({
      success: false,
      error:
        `Es ist ein Fehler beim Senden der Nachricht aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch unter ${dealerConfig.phone}.`,
    });
  }
};
