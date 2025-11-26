# Newsletter Google Sheets Integration - Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "DirektOnline Newsletter Subscribers"
4. Add headers in the first row:
   - Column A: `Email`
   - Column B: `Date`
   - Column C: `Time`
   - Column D: `IP Address`
   - Column E: `User Agent`
   - Column F: `Referrer`
   - Column G: `Language`
   - Column H: `Timezone`
   - Column I: `Form Source`

### Step 2: Set Up Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete the default code
3. Copy the entire contents of `google-apps-script-newsletter.js`
4. Paste it into the Apps Script editor
5. **Replace `YOUR_SPREADSHEET_ID`** with your actual Spreadsheet ID:
   - Find it in your Google Sheet URL: `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`
   - Copy the ID and replace it in the script

### Step 3: Set Up Security (IMPORTANT!)

1. Generate a secret token:
   - Go to https://www.random.org/strings/
   - Generate: 1 string, 32 characters, alphanumeric
   - Copy the generated token (e.g., `aB3xK9mN2pQ7rT4wY8zU1vC5`)
2. In the Google Apps Script editor:
   - Find the line: `const SECRET_TOKEN = "YOUR_SECRET_TOKEN_HERE";`
   - Replace `YOUR_SECRET_TOKEN_HERE` with your generated token (keep the quotes)
   - Example: `const SECRET_TOKEN = "aB3xK9mN2pQ7rT4wY8zU1vC5";`

### Step 4: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description**: Newsletter Webhook
   - **Execute as**: Me
   - **Who has access**: Anyone (REQUIRED for public website, but protected by secret token)
5. Click **Deploy**
6. Authorize the script when prompted:
   - Click "Review Permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to [Project Name] (unsafe)"
   - Click "Allow"
7. **Copy the Web app URL** - it looks like: `https://script.google.com/macros/s/AKfycby.../exec`

### Step 5: Add Webhook URL and Token to Website

1. Open `scripts.js`
2. Find and update these two lines:
   ```javascript
   const GOOGLE_SHEETS_WEBHOOK_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEBHOOK_URL_HERE";
   const SECRET_TOKEN = "YOUR_SECRET_TOKEN_HERE";
   ```
3. Replace with your values:
   ```javascript
   const GOOGLE_SHEETS_WEBHOOK_URL =
     "https://script.google.com/macros/s/AKfycby.../exec";
   const SECRET_TOKEN = "aB3xK9mN2pQ7rT4wY8zU1vC5"; // Same token from Step 3
   ```
4. Save and deploy your changes

## How It Works

- When a user subscribes, their email is automatically saved to your Google Sheet
- The sheet tracks: Email, Date, Time, and IP Address
- Duplicate emails are prevented (will show "already subscribed" message)
- No database setup required - everything is in Google Sheets!

## Testing

1. Go to your website's newsletter form
2. Enter a test email and check the privacy checkbox
3. Submit the form
4. Check your Google Sheet - the email should appear instantly!

## Security

**Important**: The secret token is now REQUIRED, not optional. This protects your webhook from:

- Unauthorized spam submissions
- Malicious requests
- Abuse of your Google Sheet

**How it works:**

- Only requests with the correct token will be accepted
- All other requests are rejected with "Unauthorized"
- The token is stored in both your website code and Google Apps Script
- Keep your token secret - don't share it publicly

## Troubleshooting

- **"Webhook URL not configured"**: Make sure you replaced the placeholder URL in scripts.js
- **Emails not appearing**: Check the Google Apps Script execution logs (View → Logs)
- **Permission errors**: Make sure you set "Who has access" to "Anyone" when deploying
- **Duplicate entries**: The script automatically prevents duplicates

## Support

If you encounter issues, check:

1. Google Apps Script execution logs (View → Logs in Apps Script editor)
2. Browser console for JavaScript errors
3. Network tab to see if the POST request is being sent
