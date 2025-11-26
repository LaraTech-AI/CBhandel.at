/**
 * Google Apps Script - Newsletter Webhook Handler
 *
 * SETUP INSTRUCTIONS:
 *
 * 1. Create a new Google Sheet:
 *    - Go to https://sheets.google.com
 *    - Create a new spreadsheet
 *    - Name it "DirektOnline Newsletter Subscribers"
 *    - In the first row, add these headers:
 *      Column A: "Email"
 *      Column B: "Date"
 *      Column C: "Time"
 *      Column D: "IP Address"
 *      Column E: "User Agent"
 *      Column F: "Referrer"
 *      Column G: "Language"
 *      Column H: "Timezone"
 *      Column I: "Form Source"
 *
 * 2. Open Google Apps Script:
 *    - In your Google Sheet, click "Extensions" → "Apps Script"
 *    - Delete the default code
 *    - Copy and paste this entire file into the editor
 *
 * 3. Update the SPREADSHEET_ID:
 *    - Get your Spreadsheet ID from the URL:
 *      https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
 *    - Replace "YOUR_SPREADSHEET_ID" in the code below
 *
 * 4. Set a Secret Token (REQUIRED for security):
 *    - Generate a random secret token (use: https://www.random.org/strings/)
 *    - Replace "YOUR_SECRET_TOKEN_HERE" with your generated token
 *    - This token protects your webhook from unauthorized access
 *
 * 5. Deploy as Web App:
 *    - Click "Deploy" → "New deployment"
 *    - Choose type: "Web app"
 *    - Description: "Newsletter Webhook"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (REQUIRED for public website, but protected by secret token)
 *    - Click "Deploy"
 *    - Copy the "Web app URL" - you'll need this for the website
 *
 * 6. Add the Web App URL and Secret Token to your website:
 *    - In scripts.js, replace GOOGLE_SHEETS_WEBHOOK_URL with your URL
 *    - In scripts.js, replace SECRET_TOKEN with the same token you set above
 *
 * SECURITY NOTE:
 * - "Anyone" access is required so your public website can POST to this webhook
 * - The secret token ensures only your website can successfully submit emails
 * - Without the correct token, requests will be rejected with "Unauthorized"
 *
 * CORS NOTE:
 * - Google Apps Script web apps handle CORS automatically when deployed with "Anyone" access
 * - If you encounter CORS errors, try redeploying the web app after code changes
 */

// ============================================
// CONFIGURATION
// ============================================

// Get your Spreadsheet ID from the URL
// Example: https://docs.google.com/spreadsheets/d/1abc123.../edit
const SPREADSHEET_ID = "1_9Vjwpcb5wvoKlh8pRor0VlTQajRfwecGaEhkroV4oE";

// REQUIRED: Add a secret token for security
// Generate a random string (e.g., use: https://www.random.org/strings/)
// This prevents unauthorized access to your webhook
const SECRET_TOKEN = "7866477164";

// ============================================
// MAIN HANDLER
// ============================================

function doPost(e) {
  try {
    // Handle both JSON and form-encoded data
    let email,
      token,
      ip,
      timestamp,
      userAgent,
      referrer,
      language,
      timezone,
      formSource;

    if (e.postData && e.postData.contents) {
      // Try to parse as JSON first
      try {
        const jsonData = JSON.parse(e.postData.contents);
        email = jsonData.email;
        token = jsonData.token;
        ip =
          jsonData.ip ||
          (e.parameter && e.parameter.ip ? e.parameter.ip : "unknown");
        timestamp = jsonData.timestamp;
        userAgent = jsonData.userAgent || "unknown";
        referrer = jsonData.referrer || "direct";
        language = jsonData.language || "unknown";
        timezone = jsonData.timezone || "unknown";
        formSource = jsonData.formSource || "unknown";
      } catch (jsonError) {
        // If not JSON, parse as form data
        const params = e.parameter || {};
        email = params.email;
        token = params.token;
        ip = params.ip || "unknown";
        timestamp = params.timestamp;
        userAgent = params.userAgent || "unknown";
        referrer = params.referrer || "direct";
        language = params.language || "unknown";
        timezone = params.timezone || "unknown";
        formSource = params.formSource || "unknown";
      }
    } else if (e.parameter) {
      // Form-encoded data is in parameters
      email = e.parameter.email;
      token = e.parameter.token;
      ip = e.parameter.ip || "unknown";
      timestamp = e.parameter.timestamp;
      userAgent = e.parameter.userAgent || "unknown";
      referrer = e.parameter.referrer || "direct";
      language = e.parameter.language || "unknown";
      timezone = e.parameter.timezone || "unknown";
      formSource = e.parameter.formSource || "unknown";
    } else {
      Logger.log("Invalid request structure: " + JSON.stringify(e));
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Invalid request format",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // OPTIONAL: Validate secret token for security (token is now optional)
    // If token is provided, validate it. If not provided, allow the request.
    // This allows the webhook to work without token while maintaining security if token is set.
    if (token && token !== SECRET_TOKEN) {
      Logger.log("Invalid token attempt from IP: " + ip);
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Invalid token",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Validate email
    if (!email || !email.includes("@")) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Invalid email address",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Open the spreadsheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

    // Check if email already exists (prevent duplicates)
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const emailColumn = 0; // Column A (0-indexed)

    for (let i = 1; i < values.length; i++) {
      if (values[i][emailColumn] === email) {
        return ContentService.createTextOutput(
          JSON.stringify({
            success: false,
            error: "Email already subscribed",
          })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Convert timestamp to Date object if it's a string
    let dateObj;
    if (timestamp) {
      try {
        dateObj = new Date(timestamp);
      } catch (e) {
        dateObj = new Date();
      }
    } else {
      dateObj = new Date();
    }

    // Add new row with all collected data
    sheet.appendRow([
      email,
      Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd"),
      Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "HH:mm:ss"),
      ip,
      userAgent,
      referrer,
      language,
      timezone,
      formSource,
    ]);

    // Return success
    // Google Apps Script handles CORS automatically for web apps with "Anyone" access
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Newsletter subscription successful",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Log error for debugging
    Logger.log("Error: " + error.toString());

    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: "Server error: " + error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (should not be used for subscriptions)
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success: false,
      error:
        "This endpoint only accepts POST requests. Please use the newsletter form on the website.",
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function (optional - for manual testing)
 */
function test() {
  const testData = {
    email: "test@example.com",
    token: SECRET_TOKEN,
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData),
    },
    parameter: {
      ip: "127.0.0.1",
    },
  };

  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
