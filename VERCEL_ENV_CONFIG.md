# Vercel Environment Variables Configuration

## Quick Setup for CB Handels GmbH

Copy and paste these exact values into your Vercel project's Environment Variables:

### Production Configuration

**Option 1: Port 465 (SSL) - If firewall allows**
```
SMTP_HOST=mail.cbhandel.at
SMTP_PORT=465
SMTP_USER=office@cbhandel.at
SMTP_PASS=[Your email account password]
CONTACT_TO_EMAIL=office@cbhandel.at
```

**Option 2: Port 587 (STARTTLS) - Recommended if 465 is blocked**
```
SMTP_HOST=mail.cbhandel.at
SMTP_PORT=587
SMTP_USER=office@cbhandel.at
SMTP_PASS=[Your email account password]
CONTACT_TO_EMAIL=office@cbhandel.at
```

**⚠️ IMPORTANT**: If you're getting `ETIMEDOUT` errors on port 465, try port 587 instead. The code automatically handles both ports correctly.

### Step-by-Step Instructions

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **CB Handels** project
3. Go to **Settings** → **Environment Variables**
4. Add each variable one by one:

   **Variable 1:**
   - Name: `SMTP_HOST`
   - Value: `mail.cbhandel.at`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

   **Variable 2:**
   - Name: `SMTP_PORT`
   - Value: `465`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

   **Variable 3:**
   - Name: `SMTP_USER`
   - Value: `office@cbhandel.at`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

   **Variable 4:**
   - Name: `SMTP_PASS`
   - Value: `[Enter your email account password here]`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

   **Variable 5:**
   - Name: `CONTACT_TO_EMAIL`
   - Value: `office@cbhandel.at`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

5. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Select **Redeploy**

### Important Notes

- ✅ Port **465** uses **SSL encryption** (direct SSL connection)
- ✅ Port **587** uses **STARTTLS** (upgrades to TLS after connection)
- ✅ The code automatically detects the port and uses the correct encryption method
- ✅ If port 465 times out (`ETIMEDOUT`), try port 587 instead
- ✅ Use your **email account password** (not an app password)
- ✅ All 5 variables are required for the inquiry form to work
- ✅ After adding variables, you must **redeploy** for changes to take effect

### Troubleshooting Connection Timeouts

If you see `ETIMEDOUT` errors:
1. **Try port 587**: Change `SMTP_PORT` from `465` to `587` in Vercel
2. **Check firewall**: Your email server might be blocking Vercel's IP addresses
3. **Contact hosting provider**: Ask them to whitelist Vercel IP ranges or allow connections from any IP

### Testing

After redeployment, test the inquiry form:

1. Visit your website
2. Navigate to any vehicle
3. Click "Anfrage senden" (Send Inquiry)
4. Fill out and submit the form
5. Check `office@cbhandel.at` inbox for the inquiry
6. Check the customer's email for the auto-reply

### Troubleshooting

If emails don't send:

1. **Check Vercel Logs**:
   - Go to **Deployments** → Click on latest deployment
   - Click **Functions** tab
   - Check logs for `/api/inquiry` function
   - Look for SMTP connection errors

2. **Verify Password**:
   - Make sure `SMTP_PASS` is the correct email account password
   - Check for typos or extra spaces

3. **Check Port**:
   - Ensure `SMTP_PORT` is exactly `465` (not 587)

4. **Test Connection**:
   - The SMTP server requires authentication
   - Verify credentials are correct with your email provider

