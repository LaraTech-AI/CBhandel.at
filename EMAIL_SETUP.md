# Email Configuration Guide

This guide explains how to configure email sending for the inquiry form on CB Handels GmbH website.

## Overview

The inquiry form uses Node.js with Nodemailer to send emails via SMTP. The system sends:

1. **Notification email** to the business (office@cbhandel.at)
2. **Auto-reply email** to the customer who submitted the inquiry

## Required Environment Variables

The following environment variables must be configured:

| Variable           | Description                      | Example                    |
| ------------------ | -------------------------------- | -------------------------- |
| `SMTP_HOST`        | SMTP server hostname             | `smtp.gmail.com`           |
| `SMTP_PORT`        | SMTP server port                 | `587` (TLS) or `465` (SSL) |
| `SMTP_USER`        | Email address for authentication | `your-email@example.com`   |
| `SMTP_PASS`        | Password or app password         | `your-password`            |
| `CONTACT_TO_EMAIL` | Recipient email for inquiries    | `office@cbhandel.at`       |

## Setup Instructions

### Option 1: Gmail Setup (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "CB Handels Website" as the name
   - Copy the generated 16-character password
3. **Configure environment variables**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   CONTACT_TO_EMAIL=office@cbhandel.at
   ```

### Option 2: Office 365 / Outlook Setup

1. **Use your Office 365 email credentials**
2. **Configure environment variables**:
   ```
   SMTP_HOST=smtp.office365.com
   SMTP_PORT=587
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-email-password
   CONTACT_TO_EMAIL=office@cbhandel.at
   ```

### Option 3: CB Handels GmbH SMTP (Production - Recommended)

**Use this configuration for the CB Handels GmbH production website:**

1. **Configure environment variables** with these exact values:

   ```
   SMTP_HOST=mail.cbhandel.at
   SMTP_PORT=465
   SMTP_USER=office@cbhandel.at
   SMTP_PASS=your-email-account-password
   CONTACT_TO_EMAIL=office@cbhandel.at
   ```

2. **Important Notes**:
   - **Port 465** uses SSL encryption (secure connection)
   - **Port 587** uses STARTTLS (alternative if 465 is blocked)
   - Use the **email account's password** for `SMTP_PASS`
   - All authentication is required (IMAP, POP3, and SMTP)
   - This is the **recommended production configuration** for CB Handels GmbH

3. **If you get `ETIMEDOUT` errors on both ports 465 and 587**:
   - ⚠️ **This indicates your SMTP server is blocking connections from Vercel's IP addresses**
   - **Solution 1**: Contact your email hosting provider and ask them to:
     - Whitelist Vercel's IP address ranges
     - Or allow SMTP connections from any IP address
   - **Solution 2**: Use Gmail or Office 365 instead (see Options 1 & 2 above)
   - **Solution 3**: Use a third-party email service like SendGrid, Mailgun, or Resend

### Option 4: Custom SMTP Server

If you have your own SMTP server (e.g., from your hosting provider):

1. **Get SMTP credentials** from your hosting provider
2. **Configure environment variables**:
   ```
   SMTP_HOST=mail.yourdomain.com
   SMTP_PORT=587
   SMTP_USER=your-email@yourdomain.com
   SMTP_PASS=your-smtp-password
   CONTACT_TO_EMAIL=office@cbhandel.at
   ```

## Local Development Setup

1. **Create a `.env.local` file** in the project root:

   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** with your actual credentials

3. **For Vercel CLI development**, the `.env.local` file will be automatically loaded

4. **Test the configuration**:
   ```bash
   npm run dev:vercel
   ```
   Then submit a test inquiry form on http://localhost:3000

## Production Setup (Vercel)

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add each environment variable**:
   - Click "Add New"
   - Enter the variable name (e.g., `SMTP_HOST`)
   - Enter the value
   - Select environment(s): Production, Preview, Development
   - Click "Save"
4. **Repeat for all 5 variables**:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `CONTACT_TO_EMAIL`
5. **Redeploy your application** for changes to take effect

## Testing

After configuration, test the inquiry form:

1. **Navigate to a vehicle page** on your website
2. **Click "Anfrage senden" (Send Inquiry)**
3. **Fill out the form** with test data
4. **Submit the form**
5. **Check both email inboxes**:
   - Business email (CONTACT_TO_EMAIL) should receive the inquiry
   - Customer email (the one you entered) should receive an auto-reply

## Troubleshooting

### Emails not sending

1. **Check environment variables** are set correctly in Vercel
2. **Verify SMTP credentials** are correct
3. **Check Vercel function logs** for error messages:
   - Go to Vercel Dashboard → Your Project → Functions → View Logs
4. **Common issues**:
   - Gmail: Make sure you're using an App Password, not your regular password
   - Port 587 vs 465: Use 587 for TLS, 465 for SSL (CB Handels uses 465 with SSL)
   - **ETIMEDOUT on both ports**: Your SMTP server is blocking Vercel IPs - see solutions below
   - Firewall: Some SMTP servers block connections from certain IPs (Vercel IPs may be blocked)
   - CB Handels SMTP: Ensure you're using the correct email account password (not an app password)

### Connection Timeout (ETIMEDOUT) on Both Ports

**Problem**: Both port 465 and 587 are timing out when connecting to your SMTP server.

**Cause**: Your email server (`mail.cbhandel.at`) is blocking connections from Vercel's IP addresses. This is a firewall/network security policy, not a code issue.

**Solutions** (in order of recommendation):

1. **Contact Your Email Hosting Provider**:
   - Ask them to whitelist Vercel's IP address ranges
   - Or configure the firewall to allow SMTP connections from any IP
   - Provide them with Vercel's IP ranges if needed (they change frequently)

2. **Use Gmail Instead** (Quick Fix):
   - Set up Gmail with App Password (see Option 1 above)
   - Gmail allows connections from any IP address
   - Change environment variables to Gmail settings

3. **Use Office 365** (Alternative):
   - Set up Office 365 SMTP (see Option 2 above)
   - Office 365 also allows connections from any IP

4. **Use a Third-Party Email Service**:
   - Services like SendGrid, Mailgun, or Resend are designed for serverless
   - They have APIs instead of SMTP (would require code changes)

### Rate Limiting

The system includes rate limiting:

- **5 submissions per hour per IP address**
- This prevents spam and abuse
- If you hit the limit, wait 1 hour or test from a different IP

### Security Notes

- **Never commit `.env.local` or `.env` files** to Git
- **Use App Passwords** instead of regular passwords when possible
- **Rotate passwords** periodically
- **Monitor Vercel logs** for suspicious activity

## Email Templates

The inquiry emails use HTML templates with:

- Professional styling matching the website brand
- Vehicle information (if inquiry is about a specific vehicle)
- Contact information and business hours
- Automatic timestamp and IP logging

Templates are defined in `api/inquiry.js` and can be customized if needed.

## Support

For issues or questions:

- Check Vercel function logs
- Review Nodemailer documentation: https://nodemailer.com/
- Contact the development team
