/**
 * Vercel Serverless Function - Vehicle Inquiry Form Handler
 * Handles vehicle inquiry form submissions and sends emails via nodemailer
 */

const nodemailer = require("nodemailer");
const dealerConfig = require("../config/dealerConfig.js");

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
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/[\r\n]/g, " ") // Replace newlines with spaces (prevent email injection)
    .substring(0, 2000); // Limit length (longer for messages)
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
    const { name, email, phone, message, privacy, vehicleTitle, vehiclePrice } = req.body;

    // Validate required fields
    if (!name || !email || !message || !privacy) {
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

    // Sanitize inputs
    const sanitizedName = sanitize(name);
    const sanitizedEmail = sanitize(email);
    const sanitizedPhone = sanitize(phone || "Nicht angegeben");
    const sanitizedMessage = sanitize(message);
    const sanitizedVehicleTitle = vehicleTitle ? sanitize(vehicleTitle) : null;
    const sanitizedVehiclePrice = vehiclePrice ? sanitize(vehiclePrice) : null;

    // Validate environment variables
    const missingVars = [];
    if (!process.env.SMTP_HOST) missingVars.push("SMTP_HOST");
    if (!process.env.SMTP_PORT) missingVars.push("SMTP_PORT");
    if (!process.env.SMTP_USER) missingVars.push("SMTP_USER");
    if (!process.env.SMTP_PASS) missingVars.push("SMTP_PASS");
    if (!process.env.CONTACT_TO_EMAIL) missingVars.push("CONTACT_TO_EMAIL");

    if (missingVars.length > 0) {
      console.error("Missing required environment variables:", missingVars.join(", "));
      console.error("Available env vars:", Object.keys(process.env).filter(k => k.startsWith("SMTP") || k === "CONTACT_TO_EMAIL"));
      return res.status(500).json({
        success: false,
        error:
          "Server-Konfigurationsfehler. Bitte kontaktieren Sie uns telefonisch.",
      });
    }

    // Parse SMTP port
    const smtpPort = parseInt(process.env.SMTP_PORT, 10);
    const isSecurePort = smtpPort === 465;

    // Create nodemailer transporter with enhanced configuration
    const transporterConfig = {
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: isSecurePort, // true for 465 (SSL), false for other ports (TLS)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Increased timeouts for slower connections
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,
      socketTimeout: 30000,
      // For ports other than 465, require TLS
      requireTLS: !isSecurePort,
      // TLS/SSL configuration
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates if needed
        minVersion: 'TLSv1.2', // Minimum TLS version
      },
      // Debug mode for better error messages
      debug: true,
      logger: true,
    };

    console.log("Creating SMTP transporter with config:", {
      ...transporterConfig,
      auth: { ...transporterConfig.auth, pass: '[REDACTED]' },
    });

    const transporter = nodemailer.createTransport(transporterConfig);

    // Log SMTP configuration (without sensitive data)
    console.log("SMTP Configuration:", {
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: isSecurePort,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASS,
      contactEmail: process.env.CONTACT_TO_EMAIL,
    });

    // Note: We skip verify() as some SMTP servers don't support it
    // but still allow sending emails. We'll catch errors during sendMail() instead.

    // Build email subject
    const emailSubject = sanitizedVehicleTitle
      ? `Fahrzeug-Anfrage: ${sanitizedVehicleTitle}`
      : "Fahrzeug-Anfrage";

    // Build email content
    let emailContent = `
Name: ${sanitizedName}
E-Mail: ${sanitizedEmail}
Telefon: ${sanitizedPhone}
`;

    if (sanitizedVehicleTitle) {
      emailContent += `
Fahrzeug: ${sanitizedVehicleTitle}
`;
    }

    if (sanitizedVehiclePrice) {
      emailContent += `
Preis: ${sanitizedVehiclePrice}
`;
    }

    emailContent += `
Nachricht:
${sanitizedMessage}
`;

    // Email content for business notification
    const mailOptions = {
      from: `"${dealerConfig.name} Website" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: sanitizedEmail,
      subject: emailSubject,
      text: `
Fahrzeug-Anfrage über die Website

${emailContent}

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
    .vehicle-info { background: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Fahrzeug-Anfrage</h2>
      <p>${dealerConfig.name} Website</p>
    </div>
    <div class="content">
      ${sanitizedVehicleTitle ? `
      <div class="vehicle-info">
        <div class="label">Fahrzeug:</div>
        <div class="value"><strong>${sanitizedVehicleTitle}</strong></div>
        ${sanitizedVehiclePrice ? `<div class="value">Preis: <strong>${sanitizedVehiclePrice}</strong></div>` : ''}
      </div>
      ` : ''}
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
        <div class="value">${sanitizedPhone}</div>
      </div>
      <div class="field">
        <div class="label">Nachricht:</div>
        <div class="message-box">${sanitizedMessage.replace(/\n/g, "<br>")}</div>
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

    // Send email to business
    console.log("Attempting to send inquiry email to:", process.env.CONTACT_TO_EMAIL);
    try {
      const businessEmailResult = await transporter.sendMail(mailOptions);
      console.log("Business email sent successfully:", businessEmailResult.messageId);
    } catch (businessEmailError) {
      console.error("Failed to send business email:", businessEmailError.message);
      console.error("Business email error code:", businessEmailError.code);
      console.error("Business email error response:", businessEmailError.response);
      throw businessEmailError; // Re-throw to be caught by outer catch
    }

    // Send auto-reply to customer
    const autoReplyOptions = {
      from: `"${dealerConfig.name}" <${process.env.SMTP_USER}>`,
      to: sanitizedEmail,
      subject: `Danke für Ihre Fahrzeug-Anfrage - ${dealerConfig.name}`,
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
    ${sanitizedVehicleTitle ? `.vehicle-info { background: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 15px; }` : ''}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vielen Dank für Ihre Fahrzeug-Anfrage!</h1>
    </div>
    <div class="content">
      <p>Liebe/r ${sanitizedName},</p>
      <p>vielen Dank für Ihr Interesse an ${sanitizedVehicleTitle ? `dem Fahrzeug "${sanitizedVehicleTitle}"` : 'unseren Fahrzeugen'} bei ${dealerConfig.name}.</p>
      <p>Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden – in der Regel innerhalb von 24 Stunden.</p>
      ${sanitizedVehicleTitle ? `
      <div class="vehicle-info">
        <strong>Ihre Anfrage betrifft:</strong><br>
        ${sanitizedVehicleTitle}${sanitizedVehiclePrice ? ` - ${sanitizedVehiclePrice}` : ''}
      </div>
      ` : ''}
      <div class="contact-info">
        <strong>Für dringende Anfragen erreichen Sie uns unter:</strong><br>
        Telefon: <a href="tel:${dealerConfig.phone.replace(/\s/g, "")}">${
        dealerConfig.phone
      }</a><br>
        E-Mail: <a href="mailto:${dealerConfig.email}">${
        dealerConfig.email
      }</a><br><br>
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

    // Send auto-reply email to customer
    console.log("Attempting to send auto-reply email to:", sanitizedEmail);
    try {
      const autoReplyResult = await transporter.sendMail(autoReplyOptions);
      console.log("Auto-reply email sent successfully:", autoReplyResult.messageId);
    } catch (autoReplyError) {
      // Log error but don't fail the entire request if auto-reply fails
      console.error("Failed to send auto-reply email:", autoReplyError.message);
      console.error("Auto-reply error code:", autoReplyError.code);
      console.error("Auto-reply error response:", autoReplyError.response);
      // Continue - the main inquiry was sent successfully
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Anfrage erfolgreich gesendet.",
    });
  } catch (error) {
    // Comprehensive error logging
    console.error("=== INQUIRY FORM ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error syscall:", error.syscall);
    console.error("Error address:", error.address);
    console.error("Error port:", error.port);
    console.error("Error response:", error.response);
    console.error("Error responseCode:", error.responseCode);
    console.error("Error command:", error.command);
    console.error("Error stack:", error.stack);
    console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));

    // Provide more specific error messages based on error type
    let errorMessage = `Es ist ein Fehler beim Senden der Anfrage aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch unter ${dealerConfig.phone}.`;

    if (error.code === "ECONNREFUSED") {
      errorMessage = "SMTP-Server-Verbindungsfehler: Server lehnt Verbindung ab. Bitte überprüfen Sie Host, Port und Firewall-Einstellungen.";
    } else if (error.code === "ETIMEDOUT" || error.code === "ESOCKETTIMEDOUT") {
      errorMessage = "SMTP-Server-Verbindungsfehler: Zeitüberschreitung beim Verbinden. Bitte überprüfen Sie die Server-Konfiguration.";
    } else if (error.code === "ENOTFOUND" || error.code === "EAI_AGAIN") {
      errorMessage = "SMTP-Server-Verbindungsfehler: Hostname nicht gefunden. Bitte überprüfen Sie SMTP_HOST.";
    } else if (error.code === "EAUTH" || error.responseCode === 535) {
      errorMessage = "SMTP-Authentifizierungsfehler. Bitte überprüfen Sie Benutzername und Passwort.";
    } else if (error.responseCode === 550) {
      errorMessage = "E-Mail-Adresse nicht gefunden oder ungültig.";
    } else if (error.code === "ECONNRESET") {
      errorMessage = "SMTP-Server-Verbindungsfehler: Verbindung wurde zurückgesetzt. Möglicherweise blockiert die Firewall die Verbindung.";
    }

    // Return user-friendly error message
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

