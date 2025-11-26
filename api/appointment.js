/**
 * Vercel Serverless Function - Appointment Booking Handler
 * Handles appointment bookings and sends confirmation emails
 */

const nodemailer = require("nodemailer");
const dealerConfig = require('../config/dealerConfig.js');

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 5; // Maximum 5 appointments per hour per IP

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
 * Validate date (must be in the future)
 */
function isValidDate(dateString) {
  const appointmentDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(appointmentDate.getTime())) {
    return false;
  }
  
  appointmentDate.setHours(0, 0, 0, 0);
  return appointmentDate >= today;
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
    const {
      name,
      email,
      phone,
      date,
      time,
      service,
      vehicle,
      message,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !date || !time || !service) {
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

    // Validate date
    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        error: "Bitte wählen Sie ein gültiges Datum in der Zukunft.",
      });
    }

    // Sanitize inputs
    const sanitizedName = sanitize(name);
    const sanitizedEmail = sanitize(email);
    const sanitizedPhone = sanitize(phone || "Nicht angegeben");
    const sanitizedService = sanitize(service);
    const sanitizedVehicle = sanitize(vehicle || "Nicht angegeben");
    const sanitizedMessage = sanitize(message || "Keine zusätzliche Nachricht");

    // Format date for display
    const formattedDate = new Date(date).toLocaleDateString("de-AT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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
      subject: `Neue Terminanfrage: ${sanitizedName} - ${formattedDate} um ${time} Uhr`,
      text: `
Neue Terminanfrage über die Website

Kontaktdaten:
Name: ${sanitizedName}
E-Mail: ${sanitizedEmail}
Telefon: ${sanitizedPhone}

Termindetails:
Datum: ${formattedDate}
Uhrzeit: ${time} Uhr
Service/Anliegen: ${sanitizedService}
Fahrzeug: ${sanitizedVehicle}

Nachricht:
${sanitizedMessage}

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
    .appointment-box { background: white; padding: 20px; border-left: 4px solid #1b8e2d; margin: 20px 0; }
    .message-box { background: white; padding: 15px; border-left: 4px solid #1b8e2d; margin-top: 10px; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>📅 Neue Terminanfrage</h2>
      <p>${dealerConfig.name} Website</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Kontaktdaten:</div>
        <div class="value">
          <strong>Name:</strong> ${sanitizedName}<br>
          <strong>E-Mail:</strong> <a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a><br>
          <strong>Telefon:</strong> ${sanitizedPhone}
        </div>
      </div>
      <div class="appointment-box">
        <div class="label">Termindetails:</div>
        <div class="value">
          <strong>Datum:</strong> ${formattedDate}<br>
          <strong>Uhrzeit:</strong> ${time} Uhr<br>
          <strong>Service/Anliegen:</strong> ${sanitizedService}<br>
          <strong>Fahrzeug:</strong> ${sanitizedVehicle}
        </div>
      </div>
      ${sanitizedMessage !== "Keine zusätzliche Nachricht" ? `
      <div class="field">
        <div class="label">Nachricht:</div>
        <div class="message-box">${sanitizedMessage.replace(/\n/g, "<br>")}</div>
      </div>
      ` : ""}
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

    // Send confirmation email to customer
    const confirmationOptions = {
      from: `"${dealerConfig.name}" <${process.env.SMTP_USER}>`,
      to: sanitizedEmail,
      subject: `Terminanfrage erhalten - ${formattedDate} um ${time} Uhr`,
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
    .appointment-summary { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #1b8e2d; }
    .contact-info { margin-top: 20px; padding: 15px; background: white; border-left: 4px solid #1b8e2d; }
    .cta { margin: 30px 0; text-align: center; }
    .btn { display: inline-block; padding: 12px 30px; background: #1b8e2d; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Terminanfrage erhalten!</h1>
    </div>
    <div class="content">
      <p>Liebe/r ${sanitizedName},</p>
      <p>vielen Dank für Ihre Terminanfrage bei ${dealerConfig.name}!</p>
      <div class="appointment-summary">
        <h3>Ihre Terminanfrage im Überblick:</h3>
        <p><strong>Datum:</strong> ${formattedDate}</p>
        <p><strong>Uhrzeit:</strong> ${time} Uhr</p>
        <p><strong>Service/Anliegen:</strong> ${sanitizedService}</p>
        ${sanitizedVehicle !== "Nicht angegeben" ? `<p><strong>Fahrzeug:</strong> ${sanitizedVehicle}</p>` : ""}
      </div>
      <p>Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden, um den Termin zu bestätigen – in der Regel innerhalb von 24 Stunden.</p>
      <div class="contact-info">
        <strong>Für dringende Anfragen erreichen Sie uns unter:</strong><br>
        Telefon: <a href="tel:${dealerConfig.phone.replace(/\s/g, '')}">${dealerConfig.phone}</a><br>
        E-Mail: <a href="mailto:${dealerConfig.email}">${dealerConfig.email}</a><br><br>
        <strong>Adresse:</strong><br>
        ${dealerConfig.address.full}<br><br>
        <strong>Öffnungszeiten:</strong><br>
        ${dealerConfig.openingHours.weekdays}
      </div>
      <div class="cta">
        <a href="${dealerConfig.seo.canonicalUrl}" class="btn">Zur Website</a>
      </div>
      <p>Mit freundlichen Grüßen,<br>Ihr Team von ${dealerConfig.name}</p>
    </div>
    <div class="footer">
      <p>${dealerConfig.name} | ${dealerConfig.address.full}</p>
      <p>Telefon: ${dealerConfig.phone} | E-Mail: ${dealerConfig.email}</p>
      <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese Nachricht.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };

    await transporter.sendMail(confirmationOptions);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Ihr Termin wurde erfolgreich gebucht!",
    });
  } catch (error) {
    console.error("Appointment booking error:", error);

    // Return user-friendly error message
    return res.status(500).json({
      success: false,
      error:
        `Es ist ein Fehler beim Buchen des Termins aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch unter ${dealerConfig.phone}.`,
    });
  }
};

