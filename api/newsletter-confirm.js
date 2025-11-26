/**
 * Vercel Serverless Function - Newsletter Double Opt-in Confirmation
 * Verifies a signed token and confirms a newsletter subscription.
 */

const crypto = require("crypto");

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input) {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = 4 - (input.length % 4 || 4);
  return Buffer.from(input + "=".repeat(pad), "base64").toString("utf8");
}

function verifyToken(token, secret) {
  if (!token || !secret) return { ok: false, error: "Missing token or secret" };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, error: "Malformed token" };
  const [payloadB64, signature] = parts;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return { ok: false, error: "Invalid signature" };
  }
  try {
    const json = JSON.parse(base64UrlDecode(payloadB64));
    // Expire after 24h
    if (!json.t || Date.now() - json.t > 24 * 60 * 60 * 1000) {
      return { ok: false, error: "Token expired" };
    }
    if (!json.e) return { ok: false, error: "Invalid payload" };
    return { ok: true, email: json.e };
  } catch (e) {
    return { ok: false, error: "Invalid payload" };
  }
}

module.exports = async (req, res) => {
  // Set CORS headers with origin whitelist
  const allowedOrigins = [
    "https://direktonline.at",
    "https://www.direktonline.at",
    "https://onlinedirekt.at",
    "https://www.onlinedirekt.at",
    "https://direktonline.vercel.app",
    "http://localhost:3000",
  ];

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

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  if (!process.env.NEWSLETTER_SECRET) {
    return res
      .status(500)
      .json({ success: false, error: "Server misconfigured" });
  }

  const token = req.query.token || req.query.t;
  const result = verifyToken(token, process.env.NEWSLETTER_SECRET);
  if (!result.ok) {
    return res
      .status(400)
      .send(
        `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Bestätigung fehlgeschlagen</title><style>body{font-family:Arial,sans-serif;background:#0b0f0c;color:#e6f5ea;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.card{max-width:560px;width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(230,245,234,0.22);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.06);padding:28px}h1{margin:0 0 10px;font-size:22px}p{margin:8px 0 0;color:#b2d3bf}</style></head><body><div class="card"><h1>Bestätigung fehlgeschlagen</h1><p>${result.error}</p></div></body></html>`
      );
  }

  return res
    .status(200)
    .send(
      `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Newsletter bestätigt</title><style>body{font-family:Arial,sans-serif;background:#0b0f0c;color:#e6f5ea;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.card{max-width:560px;width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(230,245,234,0.22);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.06);padding:28px}h1{margin:0 0 10px;font-size:22px}p{margin:8px 0 0;color:#b2d3bf}.btn{display:inline-block;margin-top:16px;padding:10px 18px;background:#1b8e2d;color:#fff;border-radius:8px;text-decoration:none}</style></head><body><div class="card"><h1>Vielen Dank!</h1><p>Ihre Newsletter-Anmeldung (${result.email}) wurde bestätigt.</p><a class="btn" href="/">Zurück zur Website</a></div></body></html>`
    );
};
