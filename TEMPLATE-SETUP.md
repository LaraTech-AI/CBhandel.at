# Car Dealer Template - Setup Guide

This template has been refactored to be reusable for any car dealership. All dealer-specific data is centralized in the configuration file.

## Quick Start

1. **Edit the configuration file**: `config/dealerConfig.js`
   - Update all dealer-specific information (name, address, contact, etc.)
   - Update vehicle data source settings if needed
   - Update CORS origins for your domain(s)

2. **Edit the browser config**: `config/dealerConfig.browser.js`
   - This file should match `config/dealerConfig.js` exactly
   - It makes the config available in the browser via `window.dealerConfig`

3. **Deploy**: The template is ready to deploy to Vercel or any Node.js hosting platform

## Configuration Structure

### Basic Information
- `name`: Public brand name (e.g., "YourDealer GmbH")
- `legalName`: Legal company name for legal documents
- `description`: Short description for SEO and about sections

### Address
```javascript
address: {
  street: "Your Street 123",
  city: "Your City",
  postalCode: "12345",
  country: "Country",
  region: "Region/State",
  full: "Complete address string"
}
```

### Contact Information
- `email`: Contact email address
- `phone`: Phone number in international format

### Legal/Company Information
```javascript
legal: {
  companyRegister: "FN 123456x",
  court: "Court Name",
  gln: "GLN Number",
  gisa: "GISA Number",
  taxNumber: "Tax Number",
  vatId: "VAT ID",
  bank: {
    iban: "IBAN",
    bic: "BIC"
  }
}
```

### SEO Settings
```javascript
seo: {
  siteTitle: "Your Site Title",
  metaDescription: "Your meta description",
  keywords: "keyword1, keyword2, keyword3",
  canonicalUrl: "https://yourdomain.com",
  ogImage: "https://yourdomain.com/assets/og-image.jpg"
}
```

### Social Media
```javascript
social: {
  facebook: "https://www.facebook.com/yourpage/",
  instagram: "https://www.instagram.com/yourpage/",
  tiktok: "https://www.tiktok.com/@yourpage",
  youtube: "https://www.youtube.com/@yourpage",
  twitter: "https://x.com/YourHandle",
  twitterHandle: "@yourhandle",
  googleReview: "https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/review" // Optional: Google Reviews link
}
```

### Vehicle Data Source
Supports multiple data source types: `motornetzwerk`, `zweispurig`, `willhaben`, `autoscout24`, and `combined` (recommended for maximum vehicle coverage).

**Note**: As of January 2025, `combined` mode uses Zweispurig.at as the primary vehicle source. AutoScout24 and Willhaben are disabled but code preserved for potential future use.

#### Combined Mode (Recommended)
Fetches vehicles from multiple sources and combines results:

```javascript
dataSource: {
  type: "combined",
  dealerId: "YOUR_DEALER_ID",
  dealerSlug: "your-dealer-slug", // Used for URL construction
  baseUrl: "https://yourdomain.com",
  apiEndpoints: {
    pkw: "",
    nutzfahrzeuge: ""
  },
  sourceUrls: {
    // PRIMARY: Zweispurig.at - clean HTML structure, easy to parse
    zweispurig: "https://www.zweispurig.at/your-dealer-slug/autohaendler-fahrzeuge/YOUR_DEALER_ID/",
    // MACHINES: Landwirt.com for agricultural and construction equipment
    landwirt: "https://www.landwirt.com/dealer/info/your-dealer-slug/machines",
    // DISABLED: These sources are kept for reference but not actively used
    // pkw: "https://www.autoscout24.at/haendler/your-dealer-slug",
    // nutzfahrzeuge: "https://www.autoscout24.at/haendler/your-dealer-slug?atype=X",
    // willhaben: "https://www.willhaben.at/iad/haendler/your-dealer-slug/auto"
  }
}
```

#### Zweispurig Mode (Primary Source)
Fetches vehicles from Zweispurig.at (Austrian vehicle marketplace):

```javascript
dataSource: {
  type: "zweispurig",
  dealerSlug: "your-dealer-slug-reichenfels", // e.g., "cb-handels-gmbh-reichenfels"
  dealerId: "YOUR_DEALER_ID", // Numeric ID from Zweispurig URL
  baseUrl: "https://yourdomain.com",
  sourceUrls: {
    zweispurig: "https://www.zweispurig.at/your-dealer-slug/autohaendler-fahrzeuge/YOUR_DEALER_ID/"
  }
}
```

#### AutoScout24 Mode (Disabled in Combined Mode)
Fetches vehicles from AutoScout24 (cars and transporters). **Note**: Currently disabled in combined mode but code preserved:

```javascript
dataSource: {
  type: "autoscout24",
  dealerSlug: "your-dealer-slug",
  baseUrl: "https://yourdomain.com",
  sourceUrls: {
    pkw: "https://www.autoscout24.at/haendler/your-dealer-slug",
    nutzfahrzeuge: "https://www.autoscout24.at/haendler/your-dealer-slug?atype=X"
  }
}
```

#### Willhaben Mode (Disabled in Combined Mode)
Fetches vehicles from Willhaben.at. **Note**: Currently disabled in combined mode but code preserved:

```javascript
dataSource: {
  type: "willhaben",
  dealerId: "YOUR_ORG_ID",
  dealerSlug: "your-dealer-slug",
  baseUrl: "https://yourdomain.com",
  sourceUrls: {
    pkw: "https://www.willhaben.at/iad/haendler/your-dealer-slug/auto"
  }
}
```

#### Motornetzwerk Mode (Legacy)
Fetches vehicles from motornetzwerk.at:

```javascript
dataSource: {
  type: "motornetzwerk",
  dealerId: "YOUR_DEALER_ID",
  baseUrl: "https://yourdealer.motornetzwerk.at",
  apiEndpoints: {
    pkw: "https://yourdealer.motornetzwerk.at/app/php-wrappers/php-wrapper.php?aid=YOUR_DEALER_ID",
    nutzfahrzeuge: "https://yourdealer.motornetzwerk.at/app/php-wrappers/php-wrapper-truck.php?aid=YOUR_DEALER_ID"
  },
  sourceUrls: {
    pkw: "https://yourdealer.motornetzwerk.at?display=iframe2",
    nutzfahrzeuge: "https://yourdealer.motornetzwerk.at/nutzfahrzeuge?display=iframe1"
  }
}
```

### CORS Origins
List of allowed origins for API requests:
```javascript
corsOrigins: [
  "https://yourdomain.com",
  "https://www.yourdomain.com",
  "http://localhost:3000"
]
```

## Files Modified

The following files have been refactored to use the configuration:

### Configuration Files
- `config/dealerConfig.js` - Node.js/Serverless function config
- `config/dealerConfig.browser.js` - Browser-compatible config

### API Files (All use `dealerConfig`)
- `api/vehicles.js` - Uses config for URLs and CORS
- `api/vehicle-details.js` - Fetches detailed vehicle information by vid. Supports all data sources (Zweispurig, AutoScout24, Willhaben, Landwirt, motornetzwerk) with intelligent fallback logic. Uses config for dealer ID and info.
- `api/contact.js` - Uses config for email content and CORS
- `api/newsletter.js` - Uses config for email content and CORS
- `api/appointment.js` - Uses config for email content and CORS

### Service Layer
- `lib/vehicleService.js` - Abstraction layer for vehicle data fetching

### Frontend Files
- `index.html` - Uses `window.dealerConfig` for all visible content and meta tags
- `scripts.js` - Uses `window.dealerConfig` for email links and error messages

## How It Works

1. **Server-side (Node.js)**: API functions import `config/dealerConfig.js` using CommonJS `require()`
2. **Client-side (Browser)**: The HTML loads `config/dealerConfig.browser.js` which exposes `window.dealerConfig`
3. **Dynamic Content**: JavaScript in `index.html` populates meta tags and visible content from the config after page load

## Customization

### Adding a New Data Source

To add support for a new vehicle data source (e.g., willhaben):

1. Edit `lib/vehicleService.js`
2. Add a new function `fetchFromWillhaben()`
3. Update `getVehicles()` to handle the new type:
```javascript
if (type === 'willhaben') {
  return await fetchFromWillhaben(/* params */);
}
```

### Changing Colors/Branding

Colors are defined in `config/dealerConfig.js`:
```javascript
colors: {
  primary: "#1b8e2d",
  primaryRgb: "27, 142, 45",
  primaryLight: "#22a636",
  primaryDark: "#156b22"
}
```

Update these values and also update CSS variables in `styles.css` if needed.

## Environment Variables

The following environment variables are still required (not in config as they're deployment-specific):

- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `CONTACT_TO_EMAIL` - Email address to receive form submissions
- `PUBLIC_BASE_URL` - Base URL for newsletter confirmation links (optional, falls back to `dealerConfig.seo.canonicalUrl`)

## Testing

After updating the configuration:

1. Test all API endpoints
2. Verify email sending works
3. Check that all visible content displays correctly
4. Verify meta tags are populated correctly (view page source)
5. Test vehicle fetching from your data source

## Notes

- The template maintains 100% backward compatibility with the original DirektOnline implementation
- All hardcoded dealer data has been extracted to the config
- The vehicle service abstraction allows easy addition of new data sources
- Both config files must be kept in sync when making changes

