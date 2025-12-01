# 📝 Change Log - Car Dealer Website Template

## Email Configuration Documentation (January 2025)

### 📚 Documentation Updates

#### Overview

Added comprehensive email configuration documentation for the inquiry form SMTP setup, including production-ready configuration for CB Handels GmbH.

#### New Features

- ✅ **EMAIL_SETUP.md**: Complete email configuration guide with setup instructions for Gmail, Office 365, and custom SMTP servers
- ✅ **VERCEL_ENV_CONFIG.md**: Quick reference guide for setting up environment variables in Vercel with step-by-step instructions
- ✅ **Production Configuration**: Added specific CB Handels GmbH SMTP settings (mail.cbhandel.at, port 465, SSL)

#### Documentation Details

**EMAIL_SETUP.md** includes:
- Overview of inquiry form email system (notification + auto-reply)
- Required environment variables table
- Setup instructions for Gmail, Office 365, and custom SMTP
- CB Handels GmbH production configuration (Option 3 - Recommended)
- Local development setup guide
- Production setup instructions for Vercel
- Testing procedures
- Troubleshooting guide
- Security best practices

**VERCEL_ENV_CONFIG.md** includes:
- Quick copy-paste configuration values
- Step-by-step Vercel dashboard instructions
- Environment variable setup checklist
- Testing and troubleshooting tips

#### Files Added

- `EMAIL_SETUP.md` - Comprehensive email configuration guide (184 lines)
- `VERCEL_ENV_CONFIG.md` - Quick reference for Vercel environment setup

#### Files Modified

- `README.md` - Updated Step 3 to clarify that inquiry form requires SMTP configuration (not optional), while contact/appointment forms use mailto links

#### Impact

- ✅ **Developer Experience**: Clear, comprehensive documentation for email setup
- ✅ **Production Ready**: Specific configuration for CB Handels GmbH production environment
- ✅ **Multiple Options**: Support for Gmail, Office 365, and custom SMTP servers
- ✅ **Quick Reference**: Easy-to-follow Vercel setup guide

#### 🗑️ Content Removed/Altered

- **Updated**: README.md Step 3 section to clarify inquiry form requires SMTP (not optional), while other forms use mailto
- **Clarified**: Distinction between required SMTP for inquiry form vs optional mailto for contact/appointment forms

---

## Mobile Quick-View and Tablet Button Sizing Fixes (January 2025)

### 🐛 Bug Fixes

#### Overview

Fixed mobile quick-view image scrolling issue where images were scrollable instead of fitting in the viewport, and adjusted tablet image zoom button sizing to prevent oversized icons.

#### Fixes

- ✅ **Mobile Quick-View Image Scrolling**: Fixed critical issue where quick-view main image container was scrollable on mobile instead of fitting within viewport. Changed from fixed heights to viewport-based sizing (50vh) and removed overflow scrolling
- ✅ **Tablet Button Sizing**: Fixed oversized image zoom button icons on tablets by splitting media queries into tablet-specific (769px-968px) and mobile-specific (below 768px) breakpoints
- ✅ **Mobile Image Zoom Button**: Increased mobile image zoom button size from 56px to 72px and icon from 32px to 44px for better touch targets

#### Technical Details

- **Mobile Image Container**: Changed `max-height` from `60vh` with `min-height: 350px` to `50vh` with `min-height: 0` to prevent viewport overflow
- **Overflow Control**: Changed `overflow-y: auto` to `overflow: visible` on image section to prevent unwanted scrolling
- **Image Sizing**: Changed image from fixed `height: 280px` to `height: 100%` to properly fill responsive container
- **Touch Action**: Changed `touch-action` from `pan-y pinch-zoom` to `pan-x pinch-zoom` to prevent vertical scrolling while allowing horizontal swipe gestures
- **Media Query Split**: Separated tablet (769px-968px) and mobile (below 768px) breakpoints:
  - Tablets: 56px button, 32px icon, 3px stroke
  - Mobile: 72px button, 44px icon, 3.5px stroke

#### Files Modified

- `styles.css` - Fixed mobile quick-view image container sizing, split tablet/mobile media queries for image zoom button

#### Impact

- ✅ **Mobile UX**: Images now fit properly in viewport without causing unwanted scrolling
- ✅ **Tablet UX**: Button icons are appropriately sized for tablet screens
- ✅ **Touch Targets**: Mobile buttons maintain large touch targets for better usability
- ✅ **Responsive Design**: Proper sizing across all device breakpoints

#### Test Results

- ✅ **Mobile Viewport**: Images fit within viewport without scrolling
- ✅ **Tablet Sizing**: Button icons display at appropriate size (32px) on tablets
- ✅ **Mobile Sizing**: Button icons display at large size (44px) on mobile phones
- ✅ **Touch Gestures**: Horizontal swipe gestures work correctly, vertical scrolling prevented

#### 🗑️ Content Removed/Altered

- **Updated**: Mobile image section from `max-height: 60vh` with `min-height: 350px` to `max-height: 50vh` with `min-height: 0`
- **Changed**: Image element from fixed `height: 280px` to responsive `height: 100%`
- **Split**: Single `@media (max-width: 968px)` into separate tablet and mobile breakpoints
- **Adjusted**: Tablet button size from 72px to 56px, icon from 44px to 32px

---

## Image Gallery Display Fix (January 2025)

### 🐛 Bug Fix

#### Overview

Fixed critical issue where quick-view modal displayed only one image instead of all available images (14-41 per vehicle/machine) from detail pages. The frontend code was checking for `allImages` property (used by motornetzwerk) but Zweispurig and Landwirt vehicles use `images` property.

#### Fix

- ✅ **Image Property Compatibility**: Updated frontend to check for both `images` (Zweispurig/Landwirt) and `allImages` (motornetzwerk) properties
- ✅ **API Compatibility**: Updated vehicle-details API to support both image property names
- ✅ **Equipment/Properties Support**: Added equipment and properties data from Zweispurig/Landwirt vehicles in vehicle-details API response

#### Technical Details

- **Frontend**: Modified `scripts.js` to check `vehicle.images || vehicle.allImages` instead of only `vehicle.allImages`
- **API**: Updated `api/vehicle-details.js` to transform both `images` and `allImages` properties
- **Data Flow**: Ensures all images from detail page fetching (14-36 for Zweispurig, 14-41 for Landwirt) are properly displayed in quick-view modal

#### Files Modified

- `scripts.js` - Updated image detection logic to support both property names
- `api/vehicle-details.js` - Added support for `images` property and equipment/properties data

#### Impact

- ✅ **User Experience**: All imported images (14-41 per vehicle) now display in quick-view modal
- ✅ **Compatibility**: Works with all data sources (Zweispurig, Landwirt, motornetzwerk)
- ✅ **Navigation**: Users can now navigate through all available images using arrows or thumbnails

#### Test Results

- ✅ **Zweispurig vehicles**: 14-36 images per vehicle now display correctly
- ✅ **Landwirt machines**: 14-41 images per machine now display correctly
- ✅ **Image navigation**: All images accessible via navigation arrows and thumbnails

#### 🗑️ Content Removed/Altered

- **Updated**: Image detection logic from single property check (`allImages`) to dual property check (`images || allImages`)
- **Enhanced**: Vehicle-details API to include equipment/properties from Zweispurig/Landwirt vehicles

---

## Critical Fixes: Inquiry Form, Checkbox Interaction, and Mobile UI (January 2025)

### 🐛 Critical Bug Fixes

#### Overview

Fixed critical issues affecting form submission, user interaction, and mobile usability. The inquiry form was showing success animations but not actually sending emails, checkboxes became unclickable after hovering over buttons, and mobile icons were invisible.

#### Critical Fixes

- ✅ **Inquiry Form Email Sending**: Fixed critical production issue where inquiry form displayed success animation but emails were never sent. Replaced unreliable mailto link implementation with proper API endpoint (`/api/inquiry.js`) that sends emails via nodemailer
- ✅ **Checkbox Click Issue**: Fixed critical usability bug where privacy checkbox in inquiry form couldn't be clicked after hovering over submit button. Added proper z-index layering and pointer-events to ensure checkbox remains interactive
- ✅ **Mobile Icon Visibility**: Fixed invisible icons on mobile devices for image zoom button and all lightbox buttons (close, zoom, navigation). Significantly increased button and icon sizes for mobile viewport

#### New Features

- ✅ **Inquiry API Endpoint**: Created `/api/inquiry.js` serverless function for reliable email delivery:
  - Sends inquiry emails with vehicle details (title, price) to business
  - Sends auto-reply confirmation emails to customers
  - Includes rate limiting (5 requests per hour per IP)
  - Input sanitization and validation
  - CORS whitelist protection
  - Comprehensive error handling

#### UI/UX Improvements

- ✅ **Checkbox Styling**: Enhanced checkbox visibility with proper background colors for light/dark themes, improved border contrast
- ✅ **Compare Button Styling**: Improved opacity and contrast for "Zum Vergleich hinzufügen" button, better visibility in both themes
- ✅ **Mobile Button Sizes**: Increased all mobile button sizes:
  - Image zoom button: 48px → 56px (icon: 24px → 32px)
  - Lightbox buttons (close, zoom, nav): 40px → 56px (icon: 22px → 32px)
  - Stroke width increased to 3px for better visibility
- ✅ **Button Backgrounds**: Improved background opacity and border visibility on mobile for all interactive buttons

#### Technical Details

- **Form Submission**: Changed from `mailto:` link to `fetch()` API call with JSON payload
- **Z-Index Layering**: Checkbox and label now have `z-index: 10`, submit button has `z-index: 1`
- **Pointer Events**: Explicit `pointer-events: auto` on checkbox and label to ensure clickability
- **Mobile Media Queries**: Enhanced `@media (max-width: 768px)` and `@media (max-width: 968px)` rules with larger button/icon sizes
- **API Endpoint**: Follows same pattern as existing `/api/contact.js` and `/api/appointment.js` endpoints

#### Files Modified

- `api/inquiry.js` - **NEW FILE**: Created inquiry form API endpoint with email sending
- `scripts.js` - Updated `initVehicleInquiry()` function to use API endpoint instead of mailto
- `styles.css` - Fixed checkbox z-index/pointer-events, enhanced mobile button sizes, improved styling for checkbox and compare button

#### Impact

- ✅ **Production Critical**: Inquiry form now actually sends emails (was showing fake success)
- ✅ **User Experience**: Checkbox is now always clickable regardless of button hover state
- ✅ **Mobile Usability**: All buttons now have clearly visible icons on mobile devices
- ✅ **Reliability**: API-based email sending is more reliable than mailto links
- ✅ **Professional**: Auto-reply emails provide better customer experience

#### Test Results

- ✅ **Inquiry Form**: Successfully sends emails with vehicle details and receives auto-reply
- ✅ **Checkbox Interaction**: Clickable even after hovering over submit button
- ✅ **Mobile Icons**: All buttons clearly visible with proper icon sizes on mobile viewport
- ✅ **Styling**: Checkbox and compare button have proper contrast in both light and dark themes

#### 🗑️ Content Removed/Altered

- **Replaced**: Mailto link implementation in inquiry form with API endpoint
- **Updated**: Checkbox CSS positioning from `position: static` to `position: relative` with z-index
- **Enhanced**: Mobile button sizes and icon visibility (increased from 22-24px to 32px)
- **Improved**: Compare button opacity from transparent to fully visible
- **Fixed**: Checkbox background colors for proper visibility in both themes

---

## Enhanced Vehicle Data Fetching with Detail Pages (January 2025)

### 🚗 Comprehensive Data Enrichment

#### Overview

Enhanced vehicle and machine data fetching to automatically retrieve full detail pages from source websites, providing comprehensive information including all images, equipment lists, properties, descriptions, and technical specifications. Improved image display and UI styling for better user experience.

#### New Features

- ✅ **Detail Page Fetching**: Automatic fetching of individual vehicle/machine detail pages for complete data enrichment
- ✅ **Zweispurig Detail Pages**: Fetches full vehicle details including:
  - All images (14-36 per vehicle, full-size instead of thumbnails)
  - Equipment lists (16-42 items: Innen & Komfort, Außen, Sicherheit, Beleuchtung, Parksystem, Multimedia)
  - Vehicle descriptions (Fahrzeugbeschreibung)
  - Additional technical data (body type, drivetrain, doors, seats, displacement, interior, CO2, emission class, consumption, previous owners, warranty, service book)
- ✅ **Landwirt Detail Pages**: Fetches full machine details including:
  - All images (14-41 per machine from static.landwirt.com)
  - Properties list (39-68 items: specifications, features, characteristics)
  - Machine descriptions (Beschreibung)
  - Technical data from detail tables (power, condition, tire depth, total weight, mileage, hours)
- ✅ **Image Display Enhancement**: Changed main quick-view images from `object-fit: contain` to `object-fit: cover` for better visual fill
- ✅ **Compare Button Styling**: Improved visibility and contrast for compare checkbox button in quick-view modal with theme-specific styles

#### Changes

- **Image Extraction**: Fixed Landwirt image domain from `images.landwirt.com` to `static.landwirt.com` for correct image retrieval
- **Image Display**: Main vehicle images now fill container completely (slight cropping acceptable) instead of showing with letterboxing
- **Compare Button**: Enhanced styling with better background opacity, improved checkbox visibility, and explicit light/dark theme support

#### Technical Details

- **Detail Page Functions**: Added `fetchZweispurigDetailPage()` and `fetchLandwirtDetailPage()` functions
- **Rate Limiting**: Implemented 200ms delay between detail page requests to avoid rate limiting
- **Error Handling**: Graceful fallback if detail page fetch fails - returns basic data from listing page
- **Image Processing**: Converts thumbnail URLs to full-size images for Zweispurig (removes `/sm/` and `/xs/` paths)
- **Logo Filtering**: Filters out dealer logos from Landwirt image extraction

#### Files Modified

- `lib/vehicleService.js` - Added detail page fetching functions, enhanced `fetchFromZweispurig()` and `fetchFromLandwirt()` to enrich data with detail pages, fixed image domain for Landwirt
- `styles.css` - Changed `.quick-view-main-image img` from `object-fit: contain` to `object-fit: cover`, enhanced `.compare-checkbox-btn-modal` styling with better contrast and theme-specific styles

#### Impact

- ✅ **Richer Data**: Vehicles now include complete equipment lists and descriptions
- ✅ **More Images**: All available images are fetched (not just thumbnails)
- ✅ **Better UX**: Images fill the viewport better, compare button is clearly visible
- ✅ **Complete Information**: Technical specifications and properties are fully populated

#### Test Results

- ✅ **Zweispurig**: 6 vehicles with 14-36 images each, 16-42 equipment items, full descriptions
- ✅ **Landwirt**: 6 machines with 14-41 images each, 39-68 properties, full descriptions
- ✅ **Image Display**: Main images now fill container properly
- ✅ **Compare Button**: Clearly visible in both light and dark themes

#### 🗑️ Content Removed/Altered

- **Updated**: Image display CSS from `object-fit: contain` to `object-fit: cover` (removed letterboxing)
- **Fixed**: Landwirt image extraction domain from `images.landwirt.com` to `static.landwirt.com`
- **Enhanced**: Compare button styling with improved contrast and theme-specific visibility

---

## Vehicle Data Source Migration (January 2025)

### 🚗 Vehicle Fetching Improvements

#### Overview

Migrated primary vehicle data source from AutoScout24 to Zweispurig.at for more reliable and easier-to-parse vehicle listings. Improved Landwirt.com machine parsing with enhanced article-based extraction.

#### New Features

- ✅ **Zweispurig.at Integration**: Added `fetchFromZweispurig()` function as primary vehicle source
- ✅ **Improved Parsing**: Section-based HTML parsing for accurate vehicle data extraction
- ✅ **Enhanced Landwirt Parsing**: Rewrote `parseLandwirtMachines()` with article-based extraction for better machine data accuracy
- ✅ **Better Year Extraction**: Fixed year parsing to correctly extract registration dates from Zweispurig format (MM/YYYY)

#### Changes

- **Primary Source**: Zweispurig.at (`https://www.zweispurig.at/cb-handels-gmbh-reichenfels/autohaendler-fahrzeuge/103417/`) now primary vehicle source
- **AutoScout24**: Disabled in combined mode (code preserved for potential future use)
- **Willhaben**: Disabled in combined mode (using Zweispurig as primary instead)
- **Landwirt.com**: Enhanced parsing with improved article element extraction, better price detection, and category classification

#### Technical Details

- **Zweispurig Parser**: Extracts vehicles by splitting HTML sections using `<hr>` separators for accurate per-vehicle data isolation
- **Landwirt Parser**: Uses `<article>` elements and detail links (`/detail/{slug}-{id}`) for reliable machine identification
- **Data Extraction**: Correctly extracts title, price, year, mileage, fuel type, power, transmission, images, and category
- **Category Detection**: Multi-method category detection (PKW vs Nutzfahrzeuge) based on title keywords, URL patterns, and vehicle type indicators

#### Files Modified

- `lib/vehicleService.js` - Added `fetchFromZweispurig()` and `parseZweispurigVehicles()` functions, rewrote `parseLandwirtMachines()`, disabled AutoScout24/Willhaben in combined mode
- `config/dealerConfig.js` - Updated `sourceUrls` to include Zweispurig as primary, reorganized with comments for active vs disabled sources

#### Impact

- ✅ **More Reliable**: Zweispurig.at provides cleaner HTML structure for easier parsing
- ✅ **Better Accuracy**: Section-based parsing prevents data bleeding between vehicles
- ✅ **Improved Machines**: Enhanced Landwirt parsing correctly extracts all machine details
- ✅ **Maintained Compatibility**: All existing vehicle API endpoints continue to work

#### Test Results

- ✅ **6 vehicles** successfully fetched from Zweispurig.at with correct prices and years
- ✅ **6 machines** successfully fetched from Landwirt.com with accurate details
- ✅ **Total: 12 items** combined from both sources

#### 🗑️ Content Removed/Altered

- **Disabled**: AutoScout24 vehicle fetching in combined mode (code preserved, not deleted)
- **Disabled**: Willhaben vehicle fetching in combined mode (code preserved, not deleted)
- **Updated**: `config/dealerConfig.js` `sourceUrls` section - Zweispurig added as primary, AutoScout24/Willhaben moved to comments
- **Enhanced**: Landwirt.com machine parsing with completely rewritten extraction logic

---

## Google Consent Mode v2 Implementation (January 2025)

### 🔒 Privacy & Compliance

#### Overview

Implemented Google Consent Mode v2 to ensure GDPR compliance and proper consent management for Google Analytics tracking. The implementation follows Google's official Consent Mode v2 guidelines and integrates seamlessly with the existing cookie consent banner.

#### Consent Mode v2 Features

- ✅ **Consent Mode v2 Parameters**: Implemented all required v2 parameters:
  - `ad_user_data`: Controls sending user data for advertising
  - `ad_personalization`: Controls personalized advertising
  - `ad_storage`: Controls advertising cookies
  - `analytics_storage`: Controls analytics cookies
- ✅ **Default Denied State**: All consent parameters default to `'denied'` before user interaction
- ✅ **Dynamic Script Loading**: Google tag script only loads after user grants analytics consent
- ✅ **Cookie Banner Integration**: Seamlessly integrated with existing cookie consent banner
- ✅ **Persistent Consent**: Consent preferences stored in localStorage for returning users
- ✅ **Automatic Loading**: For returning users with existing consent, Google tag loads immediately

#### Implementation Details

- **Basic Consent Mode**: Uses basic consent mode approach - blocks Google tag from loading until consent is granted
- **Consent Defaults**: Set in `<head>` before any Google tag scripts
- **Dynamic Loading**: `loadGoogleTag()` function dynamically injects Google tag script when consent is granted
- **Consent Updates**: `updateConsentMode()` function updates consent state based on user choices
- **Cross-Page Support**: Implemented on all pages (main page and all blog posts)

#### Files Modified

- `index.html` - Updated Google Analytics implementation with Consent Mode v2
- `posts/elektromobilitaet.html` - Updated with Consent Mode v2
- `posts/reifenwechsel.html` - Updated with Consent Mode v2
- `posts/gebrauchtwagen-kaufen.html` - Updated with Consent Mode v2
- `scripts.js` - Updated cookie consent handler to integrate with Consent Mode v2

#### Google Analytics Tracking ID Update

- **Updated**: Tracking ID from `G-PWL0D86EB3` to `G-Z3R9T8BD6M`
- **Applied**: New tracking ID on all pages (main page and blog posts)

#### Technical Implementation

```javascript
// Consent Mode defaults set before Google tag loads
gtag("consent", "default", {
  ad_user_data: "denied",
  ad_personalization: "denied",
  ad_storage: "denied",
  analytics_storage: "denied",
  wait_for_update: 500,
});

// Dynamic loading when consent granted
function loadGoogleTag() {
  // Dynamically injects Google tag script
  // Only called when user grants analytics consent
}
```

#### Impact

- ✅ **GDPR Compliance**: Fully compliant with GDPR requirements for consent management
- ✅ **Privacy-First**: No tracking occurs until explicit user consent
- ✅ **Google Compliance**: Meets Google's EU user consent policy requirements
- ✅ **Better User Trust**: Transparent consent management builds user trust
- ✅ **Future-Proof**: Uses latest Consent Mode v2 standard

#### Testing

- ✅ **Local Testing**: Verified consent mode defaults are set correctly
- ✅ **Dynamic Loading**: Confirmed Google tag only loads after consent
- ✅ **Cookie Banner**: Verified integration with existing cookie consent system
- ✅ **Returning Users**: Tested that returning users with consent get immediate tag loading

### 🗑️ Content Removed/Altered

- **Updated**: Google Analytics tracking ID from `G-PWL0D86EB3` to `G-Z3R9T8BD6M` on all pages
- **Replaced**: Static Google tag script loading with dynamic consent-based loading
- **Enhanced**: Cookie consent handler to integrate with Google Consent Mode v2
- **Added**: Consent Mode v2 parameters (`ad_user_data`, `ad_personalization`) - previously missing
- **Preserved**: All existing cookie consent banner functionality and UI

---

## Favicon & Sitemap Optimization (November 2025)

### 🎨 Favicon Implementation

#### Overview

Replaced template favicon with custom CB initials favicon and implemented comprehensive favicon setup for Google Search compatibility.

#### Favicon Updates

- ✅ **Custom CB Favicon**: Created favicon with "CB" initials on brand blue (#004b8d) background
- ✅ **Multiple Formats**: Generated SVG (48x48), PNG (16x16, 32x32, 48x48, 180x180), and ICO formats
- ✅ **Root-Level favicon.ico**: Created and placed in root directory for Google Search (Google checks `/favicon.ico` first)
- ✅ **HTML References**: Updated all HTML pages with comprehensive favicon link tags
- ✅ **Web Manifest**: Updated `site.webmanifest` with all icon sizes for PWA support
- ✅ **Cross-Platform Support**: Includes Apple touch icon for iOS devices

#### Files Created/Modified

- `assets/favicon.svg` - Updated with CB initials (48x48)
- `favicon.ico` - Created in root directory
- `assets/favicon.png` - 48x48 PNG version
- `assets/favicon-16x16.png` - 16x16 PNG version
- `assets/favicon-32x32.png` - 32x32 PNG version
- `assets/apple-touch-icon.png` - 180x180 for iOS
- `index.html` - Updated favicon references
- `sitemap.html` - Updated favicon references
- `site.webmanifest` - Added all icon sizes

### 🗺️ Sitemap Optimization

#### Overview

Completely overhauled XML and HTML sitemaps following Google SEO best practices and Context7 recommendations for optimal search engine indexing.

#### XML Sitemap Enhancements

- ✅ **XML Namespaces**: Added proper namespaces (image, xhtml) for extended functionality
- ✅ **Image Sitemap**: Added image metadata (title, caption, location) for all pages
- ✅ **Multilingual Support**: Added hreflang tags (de-AT, de, x-default) to all entries
- ✅ **Accurate Metadata**: Updated lastmod dates (2025-11-29), priorities, and changefreq values
- ✅ **Proper Priorities**: Homepage (1.0), Blog posts (0.8), Sitemap (0.5)
- ✅ **Change Frequencies**: Weekly (homepage), Monthly (blog posts, sitemap)
- ✅ **Schema Validation**: Proper XML schema references for validation

#### HTML Sitemap Improvements

- ✅ **Structured Data**: Added JSON-LD ItemList schema for better SEO
- ✅ **Page Descriptions**: Added descriptive text for each page and blog post
- ✅ **Hreflang Tags**: Added multilingual alternate links
- ✅ **Better Organization**: Enhanced section descriptions and context
- ✅ **Favicon References**: Updated to use all favicon formats

#### SEO Best Practices Implemented

- ✅ **Google SEO Guidelines**: Follows official Google SEO Starter Guide recommendations
- ✅ **Context7 Recommendations**: Implements best practices from Context7 documentation
- ✅ **Image Indexing**: Images now properly indexed with metadata
- ✅ **Multilingual SEO**: Proper hreflang implementation for regional targeting
- ✅ **Structured Data**: Enhanced schema markup for rich snippets

#### Files Modified

- `sitemap.xml` - Complete rewrite with best practices
- `sitemap.html` - Enhanced with structured data and descriptions
- `FAVICON-SETUP.md` - Updated to reflect completion status
- `SEO-IMPROVEMENTS-SUMMARY.md` - Added sitemap optimization section

#### Impact

- ✅ **Google Search Favicon**: Favicon will appear in Google Search results once indexed
- ✅ **Better Image Indexing**: Images properly indexed with metadata
- ✅ **Improved Crawling**: Enhanced sitemap structure improves search engine crawling
- ✅ **Multilingual SEO**: Better regional targeting with hreflang tags
- ✅ **Rich Snippets**: Structured data enables rich snippet eligibility
- ✅ **Better Discovery**: Improved content discovery and indexing

### 🗑️ Content Removed/Altered

- **Removed**: Template favicon (green background with "D" letter)
- **Replaced**: All favicon files with CB initials version
- **Updated**: Sitemap dates from placeholder to accurate current dates
- **Enhanced**: Sitemap structure from basic to comprehensive with namespaces and metadata
- **Added**: Image sitemap support (previously missing)
- **Added**: Multilingual hreflang tags (previously missing)
- **Preserved**: All existing sitemap URLs and structure

---

## Mobile Navigation & Touch Improvements (January 2025)

### 🔧 Mobile UX Enhancements

#### Overview

Enhanced mobile navigation menu with improved visibility, expanded menu items, and social media integration. Fixed touch scrolling issues on testimonials section for better mobile user experience.

#### Mobile Navigation Improvements

**1. Burger Menu Visibility & Styling**

- ✅ **Reduced Transparency**: Changed mobile menu background from 75% to 90% opacity in light mode for better readability
- ✅ **Text Color Fix**: Fixed white text color issue - menu links now display in dark text (`var(--text-primary)`) with proper contrast
- ✅ **Dark Mode Support**: Maintained 98% opacity for dark mode with proper background colors
- ✅ **Enhanced Backdrop**: Added backdrop filter with saturation for improved visual effect

**2. Expanded Menu Items**

- ✅ **FAQ Link**: Added FAQ section link to mobile menu navigation
- ✅ **Impressum Link**: Added Impressum (legal notice) link to mobile menu
- ✅ **Unser Autohaus**: Added link to facilities/dealership section (`#autohaus`)
- ✅ **Unsere Leistungen**: Added link to services section (`#services`)
- ✅ **Complete Navigation**: Menu now includes all major sections: Home, Fahrzeuge, Über uns, Unser Autohaus, Unsere Leistungen, Blog, Kontakt, FAQ, Impressum

**3. Social Media Integration**

- ✅ **Social Section**: Added "Folgen Sie uns" (Follow Us) section to mobile menu
- ✅ **Social Icons**: Integrated 5 social media platforms with circular icon buttons:
  - Facebook (https://www.facebook.com/cbhandel)
  - Instagram (https://www.instagram.com/cbhandelsgmbh/)
  - TikTok (https://www.tiktok.com/@cbhandel)
  - YouTube (https://www.youtube.com/@cbhandel)
  - X/Twitter (https://x.com/cbhandel)
- ✅ **Hover Effects**: Social icons feature brand color hover effects with smooth transitions
- ✅ **Visual Divider**: Added divider between navigation links and social section

**4. Touch Scrolling Fix**

- ✅ **Testimonials Scrolling**: Fixed touch scrolling issue where vertical page scrolling was blocked on testimonials section
- ✅ **Improved Detection**: Enhanced swipe detection logic - requires horizontal movement to be at least 2x vertical movement before preventing scroll
- ✅ **Better Thresholds**: Increased minimum horizontal movement threshold to 15px for more accurate swipe detection
- ✅ **CSS Enhancement**: Added `touch-action: pan-y` to testimonials slider to explicitly allow vertical scrolling

**5. Mobile Menu Spacing Optimization**

- ✅ **Reduced Menu Gap**: Decreased gap between menu items from `1.5rem` to `0.5rem` for tighter, more compact layout
- ✅ **Optimized Link Spacing**: Reduced link padding from `0.75rem` to `0.5rem` and font size from `1.125rem` to `1rem`
- ✅ **Compact Container**: Reduced menu padding from `6rem 2rem 2rem` to `5rem 1.5rem 1.5rem` for better screen utilization
- ✅ **Tighter Divider**: Reduced divider margins from `1.5rem` to `1rem 0 0.75rem 0` for better visual separation without excessive space
- ✅ **Optimized Social Section**: Reduced social section spacing (margin-top: `1rem` → `0.5rem`, padding-top: `1.5rem` → `0.75rem`)
- ✅ **Smaller Social Icons**: Reduced social icon size from `44px` to `40px` and SVG from `20px` to `18px` for better fit
- ✅ **Compact Social Title**: Reduced social title font size from `0.875rem` to `0.75rem` and margin from `1rem` to `0.75rem`
- ✅ **Tighter Social Gap**: Reduced gap between social icons from `0.75rem` to `0.5rem`

#### Files Modified

- `index.html` - Added FAQ, Impressum, Unser Autohaus, Unsere Leistungen links; added social media section with icons; added `id="autohaus"` to facilities section
- `styles.css` - Updated mobile menu background opacity (90% light mode, 98% dark mode); fixed nav-link text color; added social media styling; added testimonials slider touch-action; optimized spacing for better mobile fit
- `scripts.js` - Improved touch swipe detection for testimonials; added social link menu closing behavior

#### Mobile UX Impact

- ✅ **Better Readability**: Less transparent menu with proper text contrast improves menu visibility
- ✅ **Complete Navigation**: All major sections now accessible from mobile menu
- ✅ **Social Integration**: Quick access to social media profiles directly from menu
- ✅ **Smooth Scrolling**: Fixed touch scrolling allows natural vertical page scrolling on mobile devices
- ✅ **Improved Touch**: Better swipe detection prevents accidental scroll blocking
- ✅ **Better Mobile Fit**: Optimized spacing ensures all menu items and social links fit comfortably on mobile screens without excessive scrolling
- ✅ **Improved Density**: More compact layout allows users to see more content at once while maintaining readability

### 🗑️ Content Removed/Altered

- **Updated**: Mobile menu background opacity from 75% to 90% (light mode) for better visibility
- **Fixed**: Mobile menu text color from white to dark text for proper contrast
- **Enhanced**: Mobile menu now includes 9 navigation items (previously 5) plus social media section
- **Improved**: Touch scrolling detection logic for testimonials section
- **Optimized**: Reduced all spacing values (gaps, padding, margins) throughout mobile menu for better mobile screen fit
- **Reduced**: Menu item gap from 1.5rem to 0.5rem, link padding from 0.75rem to 0.5rem, font size from 1.125rem to 1rem
- **Reduced**: Social icon size from 44px to 40px, social section spacing reduced by ~50%
- **Preserved**: All existing mobile menu functionality, animations, and responsive behavior

---

## Mobile Logo Responsive Fix (January 2025)

### 🔧 Mobile UI Improvements

#### Overview

Fixed mobile logo sizing issue where the logo was covering the burger menu button on mobile devices. Implemented responsive constraints to ensure proper spacing while maintaining logo visibility.

#### Mobile Logo Fixes Implemented

**1. Logo Container Constraints**

- ✅ **Max-Width Constraints**: Added `max-width: calc(100% - 150px)` for tablets/mobile (768px breakpoint) to reserve space for burger menu, search icon, and theme toggle
- ✅ **Small Phone Optimization**: Added `max-width: calc(100% - 130px)` for small phones (480px breakpoint)
- ✅ **Flex Shrink Protection**: Ensured logo container can shrink but burger menu remains protected with `flex-shrink: 0`

**2. Logo Size Optimization**

- ✅ **Tablet/Mobile Size**: Increased logo `max-width` to `220px` (from 140px) for better visibility on tablets and mobile devices
- ✅ **Small Phone Size**: Increased logo `max-width` to `180px` (from 110px) for small phone screens
- ✅ **Height Preservation**: Maintained logo heights at `45px` (tablet/mobile) and `38px` (small phones)

**3. Layout Improvements**

- ✅ **Spacing Enhancement**: Increased gap from `0.5rem` to `0.75rem` in mobile navigation container for better element separation
- ✅ **Link Constraints**: Added `max-width: 100%` to logo-link to ensure it respects container bounds
- ✅ **Burger Menu Protection**: Added `min-width: 44px` to mobile menu toggle to prevent it from being squeezed

#### Files Modified

- `styles.css` - Updated mobile logo styles (lines 11517-11566, 11942-11949)

#### Mobile UI Impact

- ✅ **No Overlap**: Logo no longer covers burger menu button on any mobile device size
- ✅ **Better Visibility**: Larger logo size (220px/180px) maintains brand presence while respecting layout constraints
- ✅ **Improved UX**: Better spacing and touch targets for mobile navigation
- ✅ **Responsive Design**: Proper constraints ensure layout works across all mobile screen sizes

### 🗑️ Content Removed/Altered

- **Updated**: Mobile logo max-width constraints to prevent burger menu overlap
- **Increased**: Logo sizes for better visibility (220px tablet/mobile, 180px small phones)
- **Enhanced**: Mobile navigation spacing and layout constraints
- **Preserved**: All existing responsive design features and desktop logo sizing

---

## SEO Audit & Critical Fixes (November 29, 2025)

### 🔍 Comprehensive SEO Analysis & Improvements

#### Overview

Conducted comprehensive SEO audit and implemented critical fixes to improve search engine visibility, regional targeting, and overall SEO performance.

#### SEO Fixes Implemented

**1. Sitemap Date Corrections**

- ✅ **Fixed Future Dates**: Updated all sitemap `lastmod` dates from `2025-11-03` (future) to `2025-11-29` (current)
- ✅ **Accurate Last Modified**: All URLs now have correct last modification dates
- ✅ **Search Engine Trust**: Accurate dates improve search engine crawling priority and trust

**2. Dynamic Image Alt Text Enhancement**

- ✅ **Default Alt Text Added**: Added descriptive default alt text to dynamic images:
  - Lightbox image: `alt="Fahrzeugbild"` (was empty)
  - Quick view image: `alt="Fahrzeugansicht"` (was empty)
  - Inquiry vehicle image: `alt="Fahrzeugbild"` (was empty)
- ✅ **JavaScript Enhancement**: JavaScript already updates these with specific vehicle information when images load
- ✅ **Accessibility Fallback**: Default values provide accessibility even before JavaScript loads

**3. Redirect Page SEO Enhancement**

- ✅ **Meta Tags Added**: Added proper meta description to redirect page
- ✅ **Canonical URL**: Added canonical tag pointing to main page section
- ✅ **Open Graph Tags**: Added complete Open Graph tags for social sharing
- ✅ **Improved Title**: Updated title from generic "Weiterleitung zu Fahrzeuge" to "Fahrzeuge - CB Handels GmbH | Reichenfels, Kärnten"

**4. Hreflang Tags for Regional Targeting**

- ✅ **Homepage**: Added hreflang tags (de-AT, de, x-default) to homepage
- ✅ **Blog Posts**: Added hreflang tags to all blog posts for regional targeting
- ✅ **Austrian SEO**: Better targeting for Austrian and German search results

**5. Blog Post Date Corrections**

- ✅ **Publication Dates**: Kept original publication dates (2025-11-01) as correct
- ✅ **Modification Dates**: Updated `dateModified` to current date (2025-11-29) in JSON-LD structured data
- ✅ **Content Freshness**: Accurate modification dates signal content freshness to search engines

#### Files Modified

- `sitemap.xml` - Updated all lastmod dates to 2025-11-29
- `index.html` - Added hreflang tags, improved dynamic image alt text
- `fahrzeuge/index.html` - Enhanced with meta description, canonical URL, Open Graph tags
- `posts/reifenwechsel.html` - Added hreflang tags, updated modification date
- `posts/gebrauchtwagen-kaufen.html` - Added hreflang tags, updated modification date
- `posts/elektromobilitaet.html` - Added hreflang tags, updated modification date

#### SEO Impact

- ✅ **Search Engine Trust**: Accurate sitemap dates improve crawling priority
- ✅ **Accessibility**: Better alt text improves accessibility and image SEO
- ✅ **Regional Targeting**: Hreflang tags improve rankings in Austrian/German searches
- ✅ **Content Signals**: Accurate dates provide proper content freshness signals
- ✅ **Redirect SEO**: Redirect pages now have proper SEO signals

#### Documentation Created

- `SEO-ANALYSIS-REPORT.md` - Comprehensive SEO audit report with detailed findings
- `SEO-FIXES-APPLIED.md` - Summary of all fixes applied with impact analysis

### 🗑️ Content Removed/Altered

- **Updated**: Sitemap dates from future dates to current date
- **Added**: Default alt text to dynamic images for accessibility
- **Enhanced**: Redirect page with proper SEO meta tags
- **Added**: Hreflang tags for regional targeting
- **Updated**: Blog post modification dates to reflect current updates
- **Preserved**: All existing SEO features and structured data

---

## Security Enhancements (December 2025)

### 🔒 Security Fixes & Improvements

#### Overview

Implemented comprehensive security improvements to address XSS vulnerabilities, enhance input sanitization, and ensure consistent CORS configuration across all API endpoints.

#### Security Fixes Implemented

**1. XSS Protection with DOMPurify**

- ✅ **Added DOMPurify Library**: Integrated DOMPurify via CDN for HTML sanitization
- ✅ **Vehicle Description Sanitization**: All vehicle descriptions are now sanitized before rendering to prevent XSS attacks
- ✅ **Safe HTML Preservation**: Preserves safe HTML tags (`<p>`, `<strong>`, `<em>`, `<br>`, `<ul>`, `<ol>`, `<li>`) while removing dangerous scripts
- ✅ **Fallback Protection**: Includes fallback to `escapeHtml()` if DOMPurify fails to load

**2. CORS Configuration Consistency**

- ✅ **Unified CORS Configuration**: Updated `api/newsletter-confirm.js` to use `dealerConfig.corsOrigins` instead of hardcoded origins
- ✅ **Single Source of Truth**: All API endpoints now use the same CORS configuration from dealerConfig
- ✅ **Easier Maintenance**: CORS origins can now be updated in one place

**3. Enhanced Input Sanitization**

- ✅ **Control Character Removal**: Enhanced `sanitize()` function to remove control characters (`\x00-\x1F\x7F`)
- ✅ **Email Injection Prevention**: Newlines are converted to spaces to prevent email header injection
- ✅ **Better Protection**: Improved defense against various injection attack vectors

#### Files Modified

- `index.html` - Added DOMPurify CDN script with integrity hash
- `scripts.js` - Added HTML sanitization for vehicle descriptions (lines 3565-3572)
- `api/newsletter-confirm.js` - Updated to use `dealerConfig.corsOrigins`
- `api/contact.js` - Enhanced `sanitize()` function with control character removal and newline handling
- `api/appointment.js` - Enhanced `sanitize()` function with control character removal and newline handling

#### Security Impact

- ✅ **XSS Protection**: Vehicle descriptions from external APIs are now sanitized before rendering
- ✅ **Consistent Security**: All API endpoints use unified CORS configuration
- ✅ **Better Input Validation**: Enhanced sanitization prevents various injection attacks
- ✅ **Defense in Depth**: Multiple layers of security protection

#### Testing Recommendations

- Test vehicle descriptions with malicious scripts (should be removed)
- Verify safe HTML formatting is preserved
- Test CORS from all whitelisted domains
- Test form submissions with control characters and newlines

### 🗑️ Content Removed/Altered

- **Added**: DOMPurify library for XSS protection
- **Enhanced**: Input sanitization functions in API endpoints
- **Updated**: CORS configuration to use dealerConfig consistently
- **Preserved**: All existing functionality and formatting

---

## Blog Articles Theme Adaptation & Brand Color Update (January 2025)

### ✨ Content Updates

#### Blog Articles Theme Alignment

- ✅ **E-Mobilität Article**: Updated to emphasize CB Handels' core values (Quality, Transparency, Service) and include references to commercial vehicles and machinery
- ✅ **Gebrauchtwagen kaufen Article**: Enhanced to reflect partnership approach, quality standards, and transparency values. Added references to Nutzfahrzeuge and Maschinen
- ✅ **Reifenwechsel Article**: Updated to include commercial vehicles/machinery context and emphasize service quality and long-term partnership

#### Key Content Changes

- ✅ **Company Values Integration**: All articles now emphasize "Qualität, Transparenz und erstklassigen Service"
- ✅ **Partnership Messaging**: Added messaging about being a "langfristiger Partner" (long-term partner) throughout articles
- ✅ **Scope Expansion**: Articles now reference Pkw, Nutzfahrzeuge, and Maschinen (not just cars)
- ✅ **Professional Tone**: Enhanced to match CB Handels' professional, trustworthy, and partner-focused approach

### 🎨 Visual Updates

#### Brand Color Consistency

- ✅ **Blog Styles Update**: Changed blog article primary color from green (#1b8e2d) to CB Handels blue (#004b8d)
- ✅ **Color Variables**: Added brand color variants (--blog-primary-light, --blog-primary-dark) for consistency
- ✅ **Hover Effects**: Updated all hover states and shadows to use blue brand color
- ✅ **Visual Consistency**: Blog articles now match main website's color scheme

### 📁 Files Modified

- `posts/elektromobilitaet.md` - Content updates emphasizing values and commercial vehicles/machinery
- `posts/elektromobilitaet.html` - HTML version updated to match markdown changes
- `posts/gebrauchtwagen-kaufen.md` - Enhanced with partnership messaging and expanded scope
- `posts/gebrauchtwagen-kaufen.html` - HTML version updated to match markdown changes
- `posts/reifenwechsel.md` - Updated to include commercial vehicles/machinery and service quality
- `posts/reifenwechsel.html` - HTML version updated to match markdown changes
- `posts/blog-styles.css` - Brand color updated from green to blue (#004b8d)

### 🗑️ Content Removed/Altered

- **Updated**: Blog article content to align with CB Handels brand values and messaging
- **Updated**: Blog article color scheme from green to blue to match main website
- **Preserved**: All existing blog article structure, formatting, and functionality

---

## Social Media & Google Reviews Integration (January 2025)

### ✨ New Features

#### Instagram Handle Update

- ✅ **Updated Instagram Handle**: Changed from `cbhandel` to `cbhandelsgmbh` to match official Instagram profile
- ✅ **Configuration Updated**: Updated Instagram links in both `dealerConfig.js` and `dealerConfig.browser.js`
- ✅ **Dynamic Link Updates**: All Instagram links throughout the website now use the new handle

#### Google Reviews Integration

- ✅ **Clickable Google Reviews Badge**: Google Reviews badge in testimonials section is now clickable and opens the review form
- ✅ **Dedicated Review Section**: Google Reviews section positioned directly under testimonials section (moved from contact area) with:
  - Review link button with Google branding
  - Clickable QR code (wrapped in anchor tag) that opens Google Review link in new tab
  - Descriptive text explaining the importance of reviews
  - Updated hint text: "QR-Code scannen oder klicken, um direkt eine Bewertung zu hinterlassen"
- ✅ **QR Code Clickability**: QR code is now fully clickable with hover effects (lift animation, shadow, border) to indicate interactivity
- ✅ **QR Code Support**: QR code image support (`assets/qrcode.png`) for sharing review link with customers
- ✅ **Configuration Integration**: Google review link added to social media configuration (`config.social.googleReview`)

### 🔧 Improvements

- ✅ **Dynamic Link Management**: Enhanced script to automatically update Google review links from configuration
- ✅ **Responsive Design**: Google Reviews section fully responsive with mobile-optimized layout
- ✅ **Accessibility**: Proper ARIA labels and keyboard navigation for all review links

### 📁 Files Modified

- `config/dealerConfig.js` - Added `googleReview` to social media config, updated Instagram handle
- `config/dealerConfig.browser.js` - Added `googleReview` to social media config, updated Instagram handle
- `index.html` - Moved Google Reviews section from contact area to under testimonials, made QR code clickable (wrapped in anchor), updated hint text
- `styles.css` - Added hover effects for clickable QR code wrapper, updated styles for Google Reviews section

### 🗑️ Content Removed/Altered

- **Updated**: Instagram handle from `cbhandel` to `cbhandelsgmbh` across all instances
- **Added**: Google Reviews integration with clickable link and clickable QR code support
- **Moved**: Google Reviews section from contact area to directly under testimonials section for better thematic placement
- **Enhanced**: QR code is now clickable with hover effects for better UX
- **Preserved**: All existing social media functionality and styling

---

## Bug Fix: Willhaben Parser Validation (January 2025)

### 🐛 Critical Bug Fix: Missing Title/Price Validation

#### Overview

Fixed a critical bug in the Willhaben vehicle parser that caused a 500 error in the `/api/vehicles` endpoint. The parser was attempting to add vehicles to the array without validating that both title and price were present.

#### Problem Fixed

- ✅ **500 Server Error**: `/api/vehicles` endpoint returned 500 error, preventing all vehicles from loading
- ✅ **Missing Validation**: Willhaben parser was missing the `if (title && price)` check before adding vehicles to the array
- ✅ **Broken Vehicle Loading**: Website showed "Aktuell sind keine Fahrzeuge verfügbar" (no vehicles available)

#### Solution Implemented

- ✅ **Restored Validation Check**: Added missing `if (title && price)` validation before `vehicles.push()` in `parseWillhabenVehicles()` function
- ✅ **Proper Error Handling**: Vehicles without title or price are now skipped with a warning log instead of causing a server error
- ✅ **Maintained Functionality**: All existing parsing logic and category detection remain intact

#### Benefits

**User Experience:**

- ✅ **Vehicles Load Correctly**: All vehicles now load and display properly on the website
- ✅ **No More Errors**: Eliminated 500 error that prevented vehicle listings from appearing
- ✅ **Stable Service**: API endpoint now handles edge cases gracefully

**Technical:**

- ✅ **Better Error Handling**: Invalid vehicle data is skipped rather than crashing the parser
- ✅ **Maintainable**: Clear validation ensures only complete vehicle data is added
- ✅ **Robust**: Parser now handles missing data gracefully

#### Files Modified

- `lib/vehicleService.js` - Added missing `if (title && price)` validation check before `vehicles.push()` (line 679)

#### Test Results

- ✅ `/api/vehicles` endpoint now returns 200 status with vehicle data
- ✅ All 8 vehicles load and display correctly on the website
- ✅ Vehicles with missing title or price are skipped without errors
- ✅ Category filtering continues to work correctly

### 🗑️ Content Removed/Altered

- **Fixed**: Missing validation check that caused 500 error
- **Preserved**: All existing parsing logic, category detection, and data extraction functionality

---

## Vehicle Categorization & UI Improvements (January 2025)

### 🎨 Fuel Badge Color Update

#### Overview

Updated fuel type badge color from green to a neutral blue-gray gradient to better match the overall design aesthetic and brand colors.

#### Changes

- ✅ **Color Update**: Changed fuel badge background from green gradient (`#4caf50` to `#45a049`) to blue-gray gradient (`#5a6c7d` to `#4a5a6a`)
- ✅ **Shadow Update**: Updated box-shadow color to match new badge color
- ✅ **Design Consistency**: Badge now aligns better with the overall color scheme

#### Files Modified

- `styles.css` - Updated `.fuel-badge` styling (lines 3290-3299)

### 🚗 Enhanced Vehicle Categorization

#### Overview

Improved vehicle categorization system to properly separate PKW (passenger cars), Nutzfahrzeuge (commercial vehicles), and Baumaschinen (construction machines) across all data sources.

#### Problem Fixed

- ✅ **Incorrect Categorization**: All vehicles were being categorized as PKW regardless of actual type
- ✅ **Missing Category Detection**: `determineCategory()` function ignored vehicle's category property
- ✅ **Limited Willhaben Detection**: Willhaben vehicles only used title keywords for category detection

#### Solution Implemented

**Category Detection Improvements:**

- ✅ **Enhanced `determineCategory()` Function**: Now uses vehicle's `category` property (pkw, nutzfahrzeuge, baumaschinen) as primary source
- ✅ **Multi-Method Willhaben Detection**: Implemented 4-tier detection system for Willhaben vehicles:
  1. **URL Pattern Analysis**: Checks URL for category indicators (`/nutzfahrzeuge/`, `/transporter/`, etc.)
  2. **Structured Data (JSON-LD)**: Extracts category from `item.category`, `item.vehicleType`, or `item.additionalProperty`
  3. **HTML Attributes**: Checks HTML class names and data attributes for category indicators
  4. **Title Keywords**: Fallback method using keyword matching (only if other methods fail)
- ✅ **Improved Structured Data Extraction**: Enhanced Willhaben parser to extract more data from JSON-LD (title, price, URL, category)

**Technical Implementation:**

- ✅ Updated `determineCategory()` to prioritize vehicle's category property
- ✅ Added category normalization (baumaschine → baumaschinen)
- ✅ Enhanced Willhaben parser with comprehensive category detection
- ✅ Maintained backward compatibility with price/year-based special categories

#### Benefits

**User Experience:**

- ✅ **Accurate Filtering**: Filter tabs (PKW, Nutzfahrzeuge, Baumaschinen) now correctly separate vehicles
- ✅ **Better Organization**: Vehicles are properly categorized regardless of data source
- ✅ **Consistent Behavior**: All data sources (AutoScout24, Willhaben, Landwirt, Motornetzwerk) use consistent categorization

**Technical:**

- ✅ **More Reliable**: Multiple detection methods increase accuracy
- ✅ **Better Data Extraction**: Enhanced use of structured data from Willhaben
- ✅ **Maintainable**: Clear priority order for category detection methods

#### Files Modified

- `scripts.js` - Enhanced `determineCategory()` function to use vehicle category property
- `lib/vehicleService.js` - Enhanced Willhaben category detection with multi-method approach

### 🗑️ Content Removed/Altered

- **Altered**: Fuel badge color changed from green to blue-gray gradient
- **Altered**: `determineCategory()` function now prioritizes vehicle's category property over price/year
- **Added**: Multi-method category detection for Willhaben vehicles (URL, structured data, HTML attributes, title keywords)
- **Enhanced**: Willhaben parser now extracts more data from structured data (JSON-LD)
- **Preserved**: All existing filtering functionality and special category detection (top-offer, new)

---

## Multi-Source Vehicle Details API Support (January 2025)

### 🔧 Vehicle Details API Enhancement

#### Overview

Enhanced the `/api/vehicle-details` endpoint to support vehicles from all data sources (AutoScout24, Willhaben, Landwirt) in addition to motornetzwerk. Previously, the API only worked with motornetzwerk vehicles (numeric IDs), causing 400 errors for vehicles from other sources.

#### Problem Fixed

- ✅ **400 Error for Non-Motornetzwerk Vehicles**: AutoScout24 vehicles (IDs like `autoscout-9277a327-...`), Willhaben vehicles, and Landwirt machines were rejected with 400 errors
- ✅ **Limited Source Support**: API only accepted numeric vehicle IDs (motornetzwerk format)
- ✅ **Missing Vehicle Details**: Quick view modal showed error state for vehicles from AutoScout24, Willhaben, and Landwirt

#### Solution Implemented

**Multi-Source Support:**

- ✅ **Flexible ID Validation**: Removed strict numeric-only validation, now accepts all ID formats
- ✅ **Vehicles List Integration**: API first checks the vehicles list (includes all sources) before falling back to motornetzwerk API
- ✅ **Smart Fallback Logic**: For numeric IDs not found in vehicles list, falls back to motornetzwerk API
- ✅ **Data Transformation**: Added `transformVehicleFromList()` function to convert vehicle data from list format to API response format

**Technical Implementation:**

- ✅ Added vehicles list caching (30-minute TTL) to reduce API calls
- ✅ Implemented source detection based on vehicle ID format (autoscout-, landwirt-, numeric)
- ✅ Enhanced error handling with clear error messages
- ✅ Maintained backward compatibility with motornetzwerk vehicles

#### Benefits

**User Experience:**

- ✅ **All Vehicles Work**: Quick view modal now loads details for vehicles from all sources
- ✅ **No More Errors**: Eliminated "Daten konnten nicht geladen werden" error for AutoScout24/Willhaben/Landwirt vehicles
- ✅ **Consistent Experience**: All vehicles show detailed information in quick view modal

**Technical:**

- ✅ **Better Performance**: Vehicles list caching reduces redundant API calls
- ✅ **Maintainable**: Clear separation between source detection and data fetching
- ✅ **Extensible**: Easy to add support for additional data sources in the future

#### Files Modified

- `api/vehicle-details.js` - Enhanced to support multi-source vehicles with vehicles list integration and fallback logic

#### Test Results

- ✅ AutoScout24 vehicles (Porsche, etc.) now load details correctly
- ✅ Willhaben vehicles load details correctly
- ✅ Landwirt machines load details correctly
- ✅ Motornetzwerk vehicles continue to work (backward compatible)
- ✅ Error handling works correctly for missing vehicles

### 🗑️ Content Removed/Altered

- **Removed**: Strict numeric-only vehicle ID validation that rejected non-motornetzwerk vehicles
- **Altered**: API now checks vehicles list first before motornetzwerk API (changed lookup order)
- **Added**: New `transformVehicleFromList()` function for converting list data to API format
- **Added**: Vehicles list caching mechanism (30-minute TTL)
- **Preserved**: All existing motornetzwerk API functionality and response format
- **Preserved**: All existing error handling and caching mechanisms

---

## Content Updates for Multi-Product Offering - CB Handels GmbH (January 2025)

### 📝 CTA Button & Trust Badge Updates

#### Overview

Updated hero section CTA button and trust badges to reflect the business's expanded product offering beyond just vehicles (Autos) to include machines (Maschinen), making the messaging more inclusive and accurate.

#### Content Changes

**CTA Button Update:**

- ✅ **Text Change**: Updated hero CTA button from "Finde dein passendes Auto" to "Finde dein passendes Fahrzeug"
- ✅ **Broader Scope**: "Fahrzeug" (vehicle) is more generic and encompasses all types of vehicles and machines
- ✅ **Better Alignment**: Matches the business offering of "Kraftfahrzeuge & Maschinen" (Motor vehicles & Machines)

**Trust Badge Update:**

- ✅ **Text Enhancement**: Updated trust badge from "Geprüfte Fahrzeuge" to "Geprüfte Fahrzeuge & Maschinen"
- ✅ **Complete Coverage**: Now explicitly mentions both vehicles and machines in the trust badge
- ✅ **Consistent Messaging**: Aligns with hero location text "Kraftfahrzeuge & Maschinen in Reichenfels, Kärnten"

#### Technical Implementation

**Code Changes:**

- ✅ Updated CTA button text in `index.html` hero section (line 1079)
- ✅ Updated trust badge text in `index.html` trust badges section (line 1090)

#### Files Modified

- `index.html` - Updated CTA button text and trust badge text in hero section

#### Test Results

- ✅ CTA button displays "Finde dein passendes Fahrzeug" correctly
- ✅ Trust badge displays "Geprüfte Fahrzeuge & Maschinen" correctly
- ✅ All styling and functionality preserved
- ✅ No visual or functional regressions

### 🗑️ Content Removed/Altered

- **Altered**: Hero CTA button text changed from "Finde dein passendes Auto" to "Finde dein passendes Fahrzeug"
- **Altered**: Trust badge text changed from "Geprüfte Fahrzeuge" to "Geprüfte Fahrzeuge & Maschinen"
- **Preserved**: All existing hero section styling, animations, and functionality
- **Preserved**: All other trust badges and hero content remain unchanged

---

## FOUC Fix & CSS Loading Optimization - CB Handels GmbH (December 2025)

### 🎨 Flash of Unstyled Content (FOUC) Fix

#### Overview

Fixed Flash of Unstyled Content (FOUC) issue where skip link, logo, and navigation were briefly visible in unstyled state on page load. Implemented best-practice solution using critical CSS and synchronous loading.

#### Problem Fixed

- ✅ **FOUC Issue**: Skip link, logo, and navigation elements were visible unstyled for a fraction of a second
- ✅ **Async CSS Hack**: Removed unreliable `media="print"` async loading trick
- ✅ **Body Hiding**: Removed JavaScript-based body hiding mechanism that could impact accessibility and SEO

#### Solution Implemented

**Critical CSS Enhancement:**

- ✅ **Skip Link Styles**: Added skip-to-content link styles to critical inline CSS
- ✅ **Immediate Styling**: Skip link properly hidden from start (top: -100px) in critical CSS
- ✅ **Focus State**: Proper focus styles included in critical CSS for accessibility

**CSS Loading Optimization:**

- ✅ **Synchronous Loading**: Changed to standard synchronous CSS loading (best practice)
- ✅ **No FOUC**: Critical CSS prevents flash since above-the-fold content is styled immediately
- ✅ **Preload Hint**: Maintained `<link rel="preload">` for early CSS fetch
- ✅ **Simplified Code**: Removed complex async loading hack and body hiding JavaScript

#### Technical Implementation

**Code Changes:**

- ✅ Added skip link styles to critical inline CSS in `index.html` (lines 300-321)
- ✅ Removed `media="print"` async loading hack from stylesheet link
- ✅ Removed body visibility JavaScript toggle (css-loading/css-loaded classes)
- ✅ Simplified to standard `<link rel="stylesheet">` synchronous loading
- ✅ Removed unnecessary body initialization script

#### Benefits

**Performance & UX:**

- ✅ **No FOUC**: Page renders correctly from first paint
- ✅ **Faster Perceived Load**: Critical styles applied immediately
- ✅ **Better Accessibility**: Content visible to screen readers immediately
- ✅ **SEO Friendly**: Content visible to crawlers without JavaScript dependency

**Code Quality:**

- ✅ **Simpler**: Removed ~15 lines of hacky code
- ✅ **Standard Approach**: Follows web standards and best practices
- ✅ **More Reliable**: No dependency on JavaScript execution timing
- ✅ **Maintainable**: Easier to understand and maintain

#### Files Modified

- `index.html` - Added skip link styles to critical CSS, simplified CSS loading, removed body hiding script

#### Test Results

- ✅ No FOUC on page load
- ✅ Skip link properly hidden until focused
- ✅ Logo and navigation styled from first paint
- ✅ All styles load correctly
- ✅ No accessibility issues

### 🗑️ Content Removed/Altered

- **Removed**: Async CSS loading hack (`media="print"` with `onload` handler)
- **Removed**: Body visibility JavaScript toggle (`css-loading`/`css-loaded` classes)
- **Removed**: Body initialization script that added loading classes
- **Altered**: CSS loading changed from async hack to standard synchronous loading
- **Added**: Skip link styles in critical CSS for immediate styling
- **Preserved**: All existing critical CSS, preload hints, and styling functionality

---

## Vehicle Features & Filter Enhancements - CB Handels GmbH (November 2025)

### 🚗 Fuel Type Display & Category Filters

#### Overview

Enhanced vehicle information display by adding fuel type to vehicle cards and implementing dedicated category filter buttons for improved navigation and vehicle discovery.

#### New Features

**Fuel Type Display:**

- ✅ **Card Features Enhancement**: Added fuel type (Diesel, Benzin, Elektro, Hybrid) display in vehicle card features section
- ✅ **Dual Display**: Fuel type shown alongside transmission type for comprehensive vehicle information
- ✅ **Fallback Support**: Handles unknown fuel types gracefully with fallback display
- ✅ **Consistent Display**: Fuel type appears in both card features and vehicle details modal

**Category Filter Buttons:**

- ✅ **PKW Filter**: Dedicated filter button for passenger cars (PKW)
- ✅ **Nutzfahrzeuge Filter**: Filter button for commercial vehicles (Nutzfahrzeuge)
- ✅ **Baumaschinen Filter**: Filter button for construction machinery (Baumaschinen)
- ✅ **Improved Navigation**: Quick access to specific vehicle categories without scrolling

#### UI Improvements

**Filter Buttons Optimization:**

- ✅ **Single Row Layout**: Filter buttons optimized to stay in one row
- ✅ **Reduced Size**: Smaller button sizes to prevent wrapping on mobile devices
- ✅ **Better Responsiveness**: Improved mobile experience with compact filter layout
- ✅ **Visual Consistency**: Maintained design consistency with existing filter system

#### Technical Implementation

**Code Changes:**

- ✅ Enhanced `scripts.js` with fuel type display logic in vehicle card rendering
- ✅ Added fuel type extraction and display in `card-features` section
- ✅ Implemented category filter buttons in `index.html` Fahrzeuge section
- ✅ Updated filter logic to handle category-based filtering (PKW, Nutzfahrzeuge, Baumaschinen)
- ✅ Optimized filter button CSS in `styles.css` for single-row layout

#### Files Modified

- `scripts.js` - Added fuel type display in vehicle card features (15 lines added)
- `index.html` - Added category filter buttons (PKW, Nutzfahrzeuge, Baumaschinen)
- `styles.css` - Optimized filter buttons for single-row layout

#### Test Results

- ✅ Fuel type displays correctly for all vehicle types (Diesel, Benzin, Elektro, Hybrid)
- ✅ Category filters work correctly for PKW, Nutzfahrzeuge, and Baumaschinen
- ✅ Filter buttons stay in one row on all screen sizes
- ✅ Mobile responsiveness maintained with optimized button sizes

### 🗑️ Content Removed/Altered

- **Altered**: Vehicle card features now include fuel type alongside transmission type
- **Altered**: Filter buttons optimized for single-row layout with reduced sizes
- **Preserved**: All existing vehicle filtering, sorting, and display functionality

---

## Image Extraction & Performance Optimization - CB Handels GmbH (November 2025)

### 🖼️ Image Pool Pre-Collection & Porsche Fix

#### Overview

Fixed missing Porsche vehicle thumbnails and optimized image extraction by implementing a pre-collection image pool system. This ensures all vehicles receive images reliably, regardless of HTML structure variations.

#### Image Pool Implementation

- ✅ **Pre-Collection System**: All images are now collected in an `imagePool` Map before processing vehicles
- ✅ **Single Regex Pass**: Optimized image collection to use a single regex pass instead of multiple searches
- ✅ **Quality Preference**: Automatically prefers 480x360 images over 250x188 for better quality
- ✅ **UUID-Based Matching**: Images are matched to vehicles using vehicle UUIDs for accurate pairing
- ✅ **Fallback Support**: Falls back to HTML section search if image not found in pool

#### Code Simplification

- ✅ **Removed Redundant Fallbacks**: Eliminated complex price-based extraction fallback (100+ lines removed)
- ✅ **Streamlined Logic**: Simplified fallback chain from 4 levels to 3 levels
- ✅ **Performance Improvement**: Reduced regex operations and HTML parsing overhead
- ✅ **Maintainability**: Cleaner, more readable code structure

#### Bug Fixes

- ✅ **Porsche Thumbnail Issue**: Fixed missing images for Porsche Macan vehicles
- ✅ **All Vehicles**: Ensured all vehicles now receive images from the pre-collected pool
- ✅ **Image Quality**: Improved image quality by preferring higher resolution versions

#### Test Results

- ✅ All 8 vehicles now display thumbnails correctly
- ✅ Porsche vehicles (2) now show images properly
- ✅ Image loading performance improved
- ✅ Code complexity reduced (~100 lines removed)

#### Files Modified

- `lib/vehicleService.js` - Added image pool pre-collection, simplified fallback logic, optimized image matching

### 🗑️ Content Removed/Altered

- **Removed**: Complex price-based extraction fallback (redundant with image UUID extraction)
- **Removed**: Final fallback price+image combination matching (simplified to image UUID extraction)
- **Altered**: Image extraction now uses pre-collected pool instead of per-vehicle HTML search
- **Preserved**: All existing vehicle data extraction functionality and accuracy

---

## Multi-Source Vehicle Fetching Improvements - CB Handels GmbH (November 2025)

### 🔧 Data Extraction Enhancements

#### Year Extraction Fixes

- ✅ **Fixed Year Parsing**: Improved regex patterns to correctly capture full 4-digit years (19xx or 20xx) instead of partial matches
- ✅ **Better Year Validation**: Enhanced year validation to ensure reasonable values (1970 to current year + 1)
- ✅ **Multiple Format Support**: Handles various year formats including "MM/YYYY" (e.g., "12/2016") from AutoScout24 detail-item spans
- ✅ **Fallback Patterns**: Added multiple fallback patterns for year extraction when primary patterns fail

#### Title Extraction Improvements

- ✅ **AutoScout24 Title Parsing**: Enhanced title extraction to correctly combine `h2` and `span.version` content
- ✅ **HTML Comment Handling**: Removed HTML comments (`<!-- -->`) and extra text like `**TOP**` from titles
- ✅ **Landwirt Title Extraction**: Added multiple fallback patterns for title extraction (h2/h3, data-title, aria-label, context-based)
- ✅ **Slug-to-Title Conversion**: Added fallback to convert readable slugs to titles when HTML extraction fails
- ✅ **Context-Based Extraction**: Extract titles from context around images when direct extraction fails

#### Image Matching Enhancements

- ✅ **UUID-Based Matching**: Improved image matching for AutoScout24 using vehicle UUIDs for accurate pairing
- ✅ **Quality Preference**: Prefer higher quality images (480x360 over 250x188) when available
- ✅ **Image Pool Management**: Better image pool collection and matching logic for multiple sources

#### Landwirt.com Infrastructure

- ✅ **Puppeteer Fallback**: Added Puppeteer support for JavaScript-rendered Landwirt.com content
- ✅ **Multiple Extraction Patterns**: Implemented multiple link patterns, title extraction, and context-based matching
- ✅ **Validation & Filtering**: Added comprehensive validation to filter out invalid machine entries
- ✅ **Better Error Handling**: Improved error handling and logging for debugging

### 🚗 Multi-Source Vehicle Integration

#### Overview

Implemented comprehensive multi-source vehicle fetching system that aggregates vehicles from AutoScout24, Willhaben, and Landwirt.com, providing maximum vehicle coverage and eliminating dependency on single-source iframes.

#### New Features

**Multi-Source Vehicle Fetcher:**

- ✅ **AutoScout24 Integration**: Fetches cars and transporters from AutoScout24 dealer pages
- ✅ **Willhaben Integration**: Fetches vehicles from Willhaben.at dealer profiles
- ✅ **Landwirt.com Integration**: Fetches machines/baumaschinen from Landwirt.com dealer pages
- ✅ **Combined Mode**: Automatically fetches from all sources and combines results with deduplication
- ✅ **Smart Filtering**: Filters out invalid entries (garbage data, JS code, HTML fragments)
- ✅ **Category Support**: Properly categorizes vehicles as PKW, Nutzfahrzeuge, or Baumaschinen

**Data Source Types:**

- ✅ `combined` - Fetches from all available sources (recommended)
- ✅ `autoscout24` - AutoScout24 only
- ✅ `willhaben` - Willhaben.at only
- ✅ `motornetzwerk` - Legacy motornetzwerk.at support (maintained for backward compatibility)

#### Technical Implementation

**Vehicle Service Layer:**

- ✅ Enhanced `lib/vehicleService.js` with multi-source fetchers
- ✅ `fetchFromAutoscout()` - Parses AutoScout24 HTML for vehicle data
- ✅ `fetchFromWillhaben()` - Extracts vehicles from Willhaben structured data and HTML
- ✅ `fetchFromLandwirt()` - Extracts machines from Landwirt.com pages
- ✅ `parseAutoscoutFromHtml()` - Robust HTML parsing with pattern matching
- ✅ `parseWillhabenVehicles()` - Structured data and HTML extraction
- ✅ `parseLandwirtMachines()` - Machine data extraction with known patterns

**Configuration Updates:**

- ✅ Updated `config/dealerConfig.js` to use `type: "combined"`
- ✅ Added all source URLs (AutoScout24, Willhaben, Landwirt)
- ✅ Updated `config/dealerConfig.browser.js` to match server config
- ✅ Added reference links for all data sources

**Data Quality:**

- ✅ Title validation (filters JS code, HTML fragments, invalid strings)
- ✅ Price validation (realistic price ranges)
- ✅ Duplicate detection (by title similarity)
- ✅ Vehicle ID generation from URLs or structured data

#### Files Modified

- `lib/vehicleService.js` - Added multi-source fetchers (AutoScout24, Willhaben, Landwirt)
- `config/dealerConfig.js` - Changed to `type: "combined"` with all source URLs
- `config/dealerConfig.browser.js` - Updated to match server configuration
- `README.md` - Updated to mention multi-source vehicle fetching
- `TEMPLATE-SETUP.md` - Added documentation for all data source types

#### Files Created

- None (enhanced existing files)

#### Test Results

- ✅ Successfully fetches 7 vehicles from AutoScout24
- ✅ Successfully fetches 1 vehicle from Willhaben
- ✅ Combined total: 8 vehicles
- ✅ All vehicles have proper titles, prices, years, and metadata
- ✅ Proper categorization (PKW, Nutzfahrzeuge, Baumaschinen)
- ✅ Years display correctly (2017, 2020, 2018, 2016, 2025)
- ✅ All vehicles have images correctly matched using image pool system
- ✅ Porsche vehicles and all other vehicles display thumbnails reliably

### 🗑️ Content Removed/Altered

- **Altered**: `dataSource.type` changed from `"willhaben"` to `"combined"` in dealerConfig
- **Altered**: Vehicle fetching now uses multiple sources instead of single iframe
- **Preserved**: All existing vehicle display functionality, API endpoints, and UI components
- **Preserved**: Backward compatibility with motornetzwerk data source type

---

## UI Improvements & Logo Update - CB Handels GmbH (November 2025)

### 🎨 Navbar & Logo Enhancements

#### Overview

Improved navbar design by reducing padding and adjusting logo size to fill the navbar height. Updated logo to use new WebP format file.

#### Navbar Improvements

- ✅ Reduced header padding from `1.5rem 0` to `0.5rem 0` (not scrolled)
- ✅ Reduced scrolled header padding from `1rem 0` to `0.25rem 0`
- ✅ Logo now fills navbar height without increasing navbar size
- ✅ Logo height: 70px (not scrolled), 65px (scrolled)
- ✅ Logo max-width: 280px

#### Logo Update

- ✅ Updated logo from `assets/logo.jpg` to `assets/Logo New.webp`
- ✅ Updated logo reference in HTML image tag
- ✅ Updated logo reference in JSON-LD structured data
- ✅ Maintained responsive behavior and transitions

#### Files Modified

- `styles.css` - Reduced header padding, adjusted logo dimensions
- `index.html` - Updated logo file reference and structured data

#### Documentation Updates

- ✅ Updated `PERSONALISIERUNGS-PUNKTE.md` - Marked logo as completed
- ✅ Updated `ASSETS-GUIDE.md` - Documented current logo file and navbar styling

### 🗑️ Content Removed/Altered

- **Altered**: Header padding reduced to make navbar more compact
- **Altered**: Logo file changed from `logo.jpg` to `Logo New.webp`
- **Altered**: Logo dimensions adjusted to fill navbar height
- **Preserved**: All existing functionality, responsive behavior, and transitions

---

## Visual Enhancements - CB Handels GmbH (January 2025)

### 🎨 Visual Polish & Refinements

#### Overview

Added comprehensive visual enhancements to improve user experience and design consistency across the website, including custom scrollbar styling, enhanced card interactions, refined header states, and consistent icon styling.

#### Visual Improvements

**Custom Global Scrollbar:**

- ✅ Brand-colored scrollbar for Firefox and WebKit browsers
- ✅ Smooth hover effects with brand color transitions
- ✅ Consistent with site design and brand identity
- ✅ Location: `styles.css` (lines ~12508-12535)

**Enhanced Card Hover Effects:**

- ✅ Improved lift effect (translateY(-5px)) for better depth perception
- ✅ Enhanced shadow depth with multi-layer shadows
- ✅ Better border color transitions on hover
- ✅ Dark mode support with adjusted shadow values
- ✅ Location: `styles.css` (lines ~12541-12557)

**Refined Sticky Header:**

- ✅ Improved visual separation with enhanced shadow
- ✅ Subtle brand-colored border when scrolled
- ✅ Better contrast and visibility when header is in scrolled state
- ✅ Dark mode support with adjusted border colors
- ✅ Location: `styles.css` (lines ~12559-12567)

**Consistent Icon Styling:**

- ✅ Standardized stroke width (1.5px) across all icons
- ✅ Applies to service, facility, and feature icons
- ✅ Improved visual consistency throughout the site
- ✅ Location: `styles.css` (lines ~12569-12574)

#### Files Modified

- `styles.css` - Added visual enhancements section (lines ~12508-12575)

#### Documentation Created

- ✅ **Created**: `VISUAL-IMPROVEMENTS-GUIDE.md` - Complete guide for applying visual improvements to template repository, including code examples and application methods

### 🗑️ Content Removed/Altered

- **Added**: Custom scrollbar styling (no existing scrollbar styles were removed)
- **Enhanced**: Card hover effects (improved existing transitions)
- **Enhanced**: Header scrolled state (improved existing styling)
- **Standardized**: Icon stroke width (unified existing icon styles)
- **Preserved**: All existing functionality and responsive behavior

---

## Personalization Updates - CB Handels GmbH (January 2025)

### 🎯 Company-Specific Personalization

#### Overview

Updated website content to reflect accurate company information for CB Handels GmbH, including years of experience calculation and remaining address references.

#### Content Updates

**Years of Experience:**

- ✅ Updated statistics from "15+ Jahre Erfahrung" to "18+ Jahre Erfahrung"
- ✅ Calculated based on company founding date: 02.02.2007
- ✅ Updated in `index.html` statistics section (line 1381)

**Address References:**

- ✅ Fixed remaining "Wolfsberg" references to "Reichenfels"
- ✅ Updated facility location card: "Gut erreichbar in Wolfsberg" → "Gut erreichbar in Reichenfels"
- ✅ Updated contact section address display
- ✅ Updated Google Maps direction links
- ✅ Enhanced JavaScript address replacement logic to catch all instances

**Location Descriptions:**

- ✅ Updated facility card description from "Auenfischerstraße 53a" to "Industriestraße 5"
- ✅ Updated all address text references throughout the page

#### Files Modified

- `index.html` - Updated years of experience statistic, address references, location descriptions, and JavaScript replacement logic

#### Documentation Created

- ✅ **Created**: `FRAGEBOGEN-PERSONALISIERUNG.md` - Comprehensive German questionnaire for business owner covering 14 sections (company history, statistics, services, target audience, values, opening hours, location, reviews, visual content, social media, contact, offers, legal info, additional wishes)
- ✅ **Created**: `PERSONALISIERUNGS-PUNKTE.md` - Summary document listing completed personalization points and items requiring customer input

#### Items Identified for Future Updates (Requires Customer Input)

- Statistics verification (customer count, ratings)
- Google Maps coordinates update (currently using Wolfsberg coordinates)
- Real customer testimonials/reviews
- Company-specific description
- Opening hours verification
- Social media links verification
- Visual content updates (logo, OG image, facility images)
- Blog content personalization

### 📁 Files Modified

- `index.html` - Statistics, address references, location descriptions

### 📁 Files Created

- `FRAGEBOGEN-PERSONALISIERUNG.md` - German questionnaire for business owner
- `PERSONALISIERUNGS-PUNKTE.md` - Personalization points summary

### 🗑️ Content Removed/Altered

- **Altered**: Years of experience statistic from 15+ to 18+ years
- **Altered**: All remaining Wolfsberg address references to Reichenfels
- **Altered**: Facility location descriptions to reflect correct location
- **Preserved**: All existing functionality and structure

---

## Complete Rebranding - CB Handels GmbH (January 2025)

### 🎨 Full Website Rebranding Completed

#### Overview

Complete rebranding of the website from DirektOnline BS GmbH template to CB Handels GmbH. All visual elements, content, and references have been updated.

#### Visual & Branding Changes

**Brand Colors:**

- ✅ Updated CSS brand colors from green (#1b8e2d) to blue (#004b8d)
- ✅ Updated RGB values: `27, 142, 45` → `0, 75, 141`
- ✅ Updated light variant: `#22a636` → `#2469a6`
- ✅ Updated dark variant: `#156b22` → `#003564`
- ✅ Updated gradient colors throughout styles.css
- ✅ Updated inline critical CSS in index.html

**Logo:**

- ✅ Updated logo reference from logo.png to logo.jpg
- ✅ Updated logo alt text to "CB Handels GmbH Logo"
- ✅ Updated structured data logo references

**UI Enhancements:**

- ✅ Made trust badges more transparent (25% opacity light mode, 30% dark mode)
- ✅ Updated hero header to display "CB Handels GmbH" instead of "CB Handels"

#### Content Updates

**All Text References:**

- ✅ Removed all "DirektOnline" references from codebase
- ✅ Updated all company name references to "CB Handels GmbH"
- ✅ Updated hero headline to full company name
- ✅ Updated about section title and content
- ✅ Updated footer company name
- ✅ Updated FAQ section references
- ✅ Updated impressum and privacy policy sections

**Blog Posts:**

- ✅ Updated all 3 markdown files (.md) with CB Handels information
- ✅ Updated all 3 HTML files (.html) with CB Handels information
- ✅ Updated author from "DirektOnline Team" to "CB Handels Team"
- ✅ Updated all location references from Wolfsberg to Reichenfels
- ✅ Updated all contact information in blog posts

**Meta Tags & SEO:**

- ✅ Updated HTML title and meta description
- ✅ Updated Open Graph tags
- ✅ Updated Twitter Card tags
- ✅ Updated business contact data meta tags
- ✅ Updated structured data (JSON-LD) for Organization, LocalBusiness, etc.

**Domain & URLs:**

- ✅ Updated sitemap.xml from direktonline.at to cbhandel.at
- ✅ Updated sitemap.html title and canonical URL
- ✅ Updated robots.txt domain references
- ✅ Updated vercel.json project name from "direktonline" to "cbhandel"
- ✅ Removed DirektOnline API endpoints from CSP headers

**JavaScript:**

- ✅ Updated file header comment
- ✅ Updated fallback strings for company name, email, and URLs
- ✅ Updated console log message with new brand color
- ✅ Updated dynamic content replacement logic

**CSS:**

- ✅ Updated file header comment to "CB Handels GmbH Website Styles"
- ✅ Updated brand color comment

#### Files Modified

- `index.html` - Complete content and meta tag updates
- `styles.css` - Brand colors and comments
- `scripts.js` - Fallback strings and comments
- `posts/*.md` - All blog post markdown files
- `posts/*.html` - All blog post HTML files
- `sitemap.xml` - Domain URLs
- `sitemap.html` - Title and references
- `robots.txt` - Domain references
- `vercel.json` - Project name and CSP headers

---

## Configuration Update - CB Handels GmbH (January 2025)

### 🔄 Dealer Configuration Update

#### Overview

The dealer configuration has been updated from DirektOnline BS GmbH to CB Handels GmbH, reflecting the current deployment of the template.

#### Configuration Changes

**Company Information:**

- **Name**: Updated from "DirektOnline BS GmbH" to "CB Handels GmbH"
- **Legal Name**: Updated to "CB Handels GmbH"
- **Managing Director**: Added "Ing. Christian Baumgartner"

**Address:**

- **Street**: Updated from "Auenfischerstraße 53a" to "Industriestraße 5"
- **City**: Updated from "Wolfsberg" to "Reichenfels"
- **Postal Code**: Updated from "9400" to "9463"
- **Secondary Location**: Removed (set to `null` - no secondary location known)

**Contact Information:**

- **Email**: Updated from "direktonline.at@gmail.com" to "office@cbhandel.at"
- **Phone**: Updated from "+43 664 260 81 85" to "+43 664 3882323"
- **Opening Hours**: Updated from "Montag – Freitag: 08:00 – 19:30 Uhr" to "Montag bis Freitag: nach telefonischer Vereinbarung"

**Legal/Company Info:**

- **Company Register**: Updated from "FN 637100m" to "FN 565866g"
- **VAT ID**: Updated from "ATU81166319" to "ATU77390636"
- **GLN, GISA, Tax Number**: Cleared (empty strings)
- **Bank Details**: Cleared (empty IBAN and BIC)

**SEO Settings:**

- **Site Title**: Updated to "CB Handels GmbH | Kraftfahrzeuge und Maschinen in Reichenfels, Kärnten"
- **Meta Description**: Updated to reflect CB Handels GmbH focus on vehicles and machinery
- **Keywords**: Updated to include "CB Handels, Reichenfels, Kärnten, Gebrauchtwagen, Nutzfahrzeuge, Maschinenhandel, Traktoren, Landmaschinen, Autoankauf"
- **Canonical URL**: Updated from "https://direktonline.at" to "https://cbhandel.at"
- **OG Image URL**: Updated to "https://cbhandel.at/assets/og-image.jpg"

**Branding:**

- **Primary Color**: Updated from green (#1b8e2d) to blue (#004b8d)
- **Primary RGB**: Updated to "0, 75, 141"
- **Primary Light**: Updated to "#2469a6"
- **Primary Dark**: Updated to "#003564"

**Social Media:**

- **All Platforms**: Updated handles from "direktonline.at" / "@direktonline-at" / "DirektOnlineAT" to "cbhandel" / "@cbhandel"
- **Twitter Handle**: Updated to "@cbhandel"

**Vehicle Data Source:**

- **Type**: Changed from "motornetzwerk" to "unknown" (to be configured later)
- **Dealer ID**: Cleared (empty string)
- **Base URL**: Cleared (empty string)
- **API Endpoints**: Cleared (empty strings for pkw and nutzfahrzeuge)
- **Source URLs**: Cleared (empty strings)
- **Reference Links**: Added new reference links for:
  - AutoScout24: https://www.autoscout24.at/haendler/cb-handels-gmbh
  - Gebrauchtwagen.at: https://www.gebrauchtwagen.at/handlerwagen/?cid=14166681
  - Landwirt.com: https://www.landwirt.com/dealer/info/cb-handels-gmbh-10561
  - Mascus: https://www.mascus.at/cb-handels-gmbh/8bf11bd0,1,relevance,searchdealer.html

**CORS Origins:**

- Updated from direktonline.at domains to cbhandel.at domains
- Removed "onlinedirekt.at" domains
- Updated Vercel preview URL to "https://cbhandel.vercel.app"

**Description:**

- Updated company description to reflect CB Handels GmbH focus on vehicles, commercial vehicles, and machinery

### 📁 Files Modified

- **config/dealerConfig.js**: Updated all dealer-specific configuration values
- **config/dealerConfig.browser.js**: Updated all dealer-specific configuration values to match Node.js version

### 🗑️ Content Removed/Altered

- **Removed**: DirektOnline BS GmbH company information
- **Removed**: Wolfsberg address and secondary location
- **Removed**: DirektOnline contact information and social media handles
- **Removed**: Motornetzwerk vehicle data source configuration (set to unknown for future configuration)
- **Altered**: Brand colors from green to blue theme
- **Altered**: SEO settings to reflect CB Handels GmbH business focus
- **Preserved**: All configuration structure and functionality - template architecture unchanged

### 📚 Documentation Updates

- **Updated**: `README.md` - Updated Support & Contact section and copyright to reflect CB Handels GmbH
- **Updated**: `CHANGELOG.md` - Added this configuration update entry

### ✅ Verification

- **Configuration Files**: Both `dealerConfig.js` and `dealerConfig.browser.js` are synchronized
- **Template Structure**: All configuration fields properly updated
- **Documentation**: README updated with current dealer information

---

## Template Refactoring - Configuration-Driven Architecture (January 2025)

### 🔄 Major Refactoring: Converted to Reusable Template

#### Overview

The DirektOnline website has been refactored into a reusable car dealership template. All dealer-specific data has been extracted into centralized configuration files, making it easy to customize for any dealer.

#### Configuration System

- **Created**: `config/dealerConfig.js` - Node.js/serverless configuration file containing all dealer-specific data
- **Created**: `config/dealerConfig.browser.js` - Browser-compatible configuration (exposes `window.dealerConfig`)
- **Centralized Data**: Company info, address, contact, legal details, SEO settings, social media, vehicle data source, CORS origins

#### Vehicle Service Abstraction

- **Created**: `lib/vehicleService.js` - Abstraction layer for vehicle data fetching
- **Extensible**: Currently supports `motornetzwerk`, designed for future support of `willhaben`, `gebrauchtwagen`, and `combined` sources
- **Moved Logic**: Vehicle fetching logic extracted from `api/vehicles.js` to service layer

#### API Refactoring

All API files now use `dealerConfig` instead of hardcoded values:

- **api/vehicles.js**: Uses config for URLs, CORS origins, calls `vehicleService.getVehicles()`
- **api/vehicle-details.js**: Uses config for dealer ID and dealer info
- **api/contact.js**: Uses config for email content, company name, CORS
- **api/newsletter.js**: Uses config for email content, confirmation URLs, CORS
- **api/appointment.js**: Uses config for email content, opening hours, website URLs, CORS

#### Frontend Refactoring

- **index.html**:
  - Loads `config/dealerConfig.browser.js` script
  - Populates meta tags dynamically from config
  - Generates JSON-LD structured data from config
  - Populates visible content (company name, address, contact info, social links) from config
- **scripts.js**:
  - Uses `window.dealerConfig` for email links (22 references)
  - Uses config for error messages with phone numbers
  - Uses config for image URL construction
  - Fallback values provided for safety

#### Documentation

- **Created**: `TEMPLATE-SETUP.md` - Comprehensive setup guide for new dealers
- **Created**: `TEST-RESULTS.md` - Automated test results
- **Created**: `LIVE-TEST-RESULTS.md` - Live server test results
- **Created**: `test-config.js` - Automated configuration validation script
- **Updated**: `README.md` - Added template configuration section, updated project structure

### 📁 Files Created

- `config/dealerConfig.js` - Node.js configuration
- `config/dealerConfig.browser.js` - Browser configuration
- `lib/vehicleService.js` - Vehicle service abstraction
- `TEMPLATE-SETUP.md` - Template setup guide
- `TEST-RESULTS.md` - Test results documentation
- `LIVE-TEST-RESULTS.md` - Live server test results
- `test-config.js` - Configuration validation script

### 📁 Files Modified

- **api/vehicles.js**: Refactored to use `vehicleService.getVehicles()` and `dealerConfig`
- **api/vehicle-details.js**: Uses `dealerConfig` for dealer ID and info
- **api/contact.js**: Uses `dealerConfig` for all email content and CORS
- **api/newsletter.js**: Uses `dealerConfig` for all email content and CORS
- **api/appointment.js**: Uses `dealerConfig` for all email content and CORS
- **index.html**: Loads browser config, populates content from config
- **scripts.js**: Uses `window.dealerConfig` throughout (22 references)
- **README.md**: Updated to reflect template nature, added configuration section

### 🗑️ Content Removed/Altered

- **Removed**: All hardcoded dealer-specific strings from API files
- **Removed**: Hardcoded URLs, dealer IDs, company names, addresses, contact info from all files
- **Altered**: Vehicle fetching logic moved from `api/vehicles.js` to `lib/vehicleService.js`
- **Preserved**: All existing functionality maintained - 100% backward compatible

### 📚 Documentation Updates

- **Updated**: `README.md` - Added template configuration section, updated project structure
- **Updated**: `CHANGELOG.md` - Added this template refactoring entry

### ✅ Verification

- **Automated Tests**: All configuration validation tests pass (`node test-config.js`)
- **Live Server**: Page loads correctly, config is used throughout
- **Backward Compatibility**: All existing functionality preserved
- **Code Quality**: No linting errors, all imports valid

---

## Performance, Accessibility & SEO Improvements (January 2025)

### 🚀 Performance Optimizations

#### Phase 1: Core Performance Improvements

- **Logo Image Dimensions**: Added width/height attributes (250x60) to logo image to prevent Cumulative Layout Shift (CLS)
- **Google Analytics Preconnect**: Added preconnect links for `googletagmanager.com` and `google-analytics.com` domains to reduce connection time
- **Font Display**: Verified `font-display=swap` is present in Google Fonts URL for faster text rendering

#### Phase 2: Critical CSS Inlining

- **Critical CSS Extraction**: Extracted and inlined critical CSS for above-the-fold content (header, hero section, base styles)
- **Async CSS Loading**: Main stylesheet loads asynchronously using media="print" technique with noscript fallback
- **Faster First Contentful Paint**: Eliminated render-blocking CSS for improved FCP scores

#### Phase 4: Image & Resource Optimization

- **LCP Image Preload**: Added preload with `fetchpriority="high"` for hero background image (LCP candidate)
- **Strategic Prefetch**: Added prefetch hints for common blog post navigation paths (`/posts/reifenwechsel.html`, `/posts/gebrauchtwagen-kaufen.html`, `/posts/elektromobilitaet.html`)

### ♿ Accessibility Enhancements

#### Phase 3: Comprehensive Accessibility Improvements

- **Skip-to-Content Link**: Added keyboard-accessible skip link that appears on focus, allowing users to jump directly to main content
- **Focus Management**: Improved focus trapping and restoration in all modals (search, appointment booking, video testimonial) using `setupModalA11y` helper
- **ARIA Live Regions**: Added three ARIA live regions for dynamic content announcements:
  - Vehicle loading status and errors
  - Form submission status and errors
  - Search results and status
- **Screen Reader Support**: All dynamic content updates now announce to screen readers via `announceToScreenReader()` helper function

### 🔍 SEO Enhancements

#### Phase 4: Structured Data & Error Handling

- **Review/Rating Schema**: Added comprehensive Review/Rating structured data (Schema.org) for testimonials:
  - AggregateRating with 4.9 rating and 4 reviews
  - Individual Review objects for each testimonial with author, date, rating, and review body
  - Enables rich snippets in search results
- **Error Handling Improvements**: Enhanced error messages with:
  - User-friendly German error messages
  - Screen reader announcements for all errors
  - Contact information included in error messages for recovery
  - Better error feedback in vehicle loading, form submissions, and API failures

### 📁 Files Modified

- **index.html**:
  - Added logo width/height attributes
  - Added Google Analytics preconnect links
  - Added critical CSS inline styles
  - Added async CSS loading with noscript fallback
  - Added skip-to-content link
  - Added ARIA live regions
  - Added hero image preload with fetchpriority
  - Added blog post prefetch hints
  - Added Review/Rating structured data
- **styles.css**:
  - Added skip-to-content link styles
- **scripts.js**:
  - Added `announceToScreenReader()` helper function
  - Updated vehicle loading to announce status
  - Updated form submissions to announce status
  - Updated search results to announce status
  - Improved error handling with screen reader announcements
  - Enhanced modal focus management (search, appointment, video)

### 🗑️ Content Removed/Altered

- **None**: All existing functionality preserved, only enhancements added

### 📚 Documentation Updates

- **Updated**: `README.md` - Added new performance, accessibility, and SEO features to feature list and performance optimization section
- **Updated**: `CHANGELOG.md` - Added comprehensive entry for all improvements

### ✅ Verification

- **Performance**: All improvements tested locally on fresh server instances
- **Accessibility**: Skip link, focus management, and ARIA live regions verified via browser automation
- **SEO**: Review structured data validated in HTML
- **Visual Testing**: Screenshots captured for each phase to verify visual correctness

---

## GitHub Username & Repository Configuration Update (January 2025)

### 🔧 Repository Configuration Updates

#### GitHub Username Migration

- **Username Change**: Updated all references from `Laratech_at`/`Laratech-at` to `LaraTech-AI` throughout the project
- **Git Remote URL**: Updated remote origin URL from `https://github.com/Laratech-at/direktonline.git` to `https://github.com/LaraTech-AI/direktonline.git`
- **Git Email Configuration**: Updated git user email to `git@laratech.ai` for consistent commit attribution
- **Brand Consistency**: Standardized all brand references to `LaraTech-AI` format (replacing `LaraTech.AI` dot notation)

### 📁 Files Changed

- **Modified**: `.git/config` - Updated remote origin URL to new GitHub username
- **Modified**: `scripts.js` - Updated footer credit from `LaraTech.AI` to `LaraTech-AI` (line 7638)
- **Modified**: `index.html` - Updated footer credit from `LaraTech.AI` to `LaraTech-AI` (line 3213)
- **Modified**: `PROJECT-OVERVIEW-FOR-SOCIAL-MEDIA.md` - Updated all references from `Laratech` to `LaraTech-AI` (title and footer)

### 🗑️ Content Removed/Altered

- **Altered**: Git remote URL changed to reflect new GitHub organization username
- **Altered**: Git user email updated to new domain email address
- **Altered**: Brand name references standardized to `LaraTech-AI` format (consistent capitalization and hyphenation)
- **Preserved**: All existing functionality and content maintained, only repository configuration and brand references updated

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added this GitHub username migration entry

### ✅ Verification

- **Git Remote**: Verified remote URL updated to `https://github.com/LaraTech-AI/direktonline.git`
- **Git Email**: Verified user email configured as `git@laratech.ai`
- **Brand References**: All brand mentions now consistently use `LaraTech-AI` format

---

## Documentation Update & Date Corrections (November 2025)

### 📚 Documentation Review & Synchronization

#### Comprehensive Documentation Audit

- **Documentation Review**: Conducted comprehensive review of all documentation files
- **Content Verification**: Verified all documentation accurately reflects current implementation
- **Consistency Check**: Ensured consistency across all documentation files
- **Completeness Verification**: Confirmed all features and modifications are documented
- **Formatting Preservation**: Maintained all existing formatting and structure
- **Date Corrections**: Fixed date typos - changed "November 2026" to "November 2025" in all documentation files

#### Documentation Status

- **CHANGELOG.md**: Complete and up-to-date with all version history
- **README.md**: Current with latest features and deployment instructions
- **LOCAL-TESTING-GUIDE.md**: Accurate testing procedures for security fixes
- **SECURITY-FIXES-IMPLEMENTED.md**: Complete documentation of security enhancements
- **SECURITY-RISK-ANALYSIS.md**: Comprehensive risk assessment documentation
- **PROJECT-SUMMARY.md**: Updated with latest project state

#### Content Preserved

- ✅ All existing documentation content preserved
- ✅ No obsolete content identified or removed
- ✅ All formatting and structure maintained
- ✅ Version history complete and accurate

### 📁 Files Modified

- **Modified**: `CHANGELOG.md` - Fixed 7 date references, added documentation update entry
- **Modified**: `PROJECT-SUMMARY.md` - Fixed date reference
- **Modified**: `SECURITY-REVIEW-REPORT.md` - Fixed 2 date references
- **Modified**: `SECURITY-FIXES-IMPLEMENTED.md` - Fixed date reference
- **Modified**: `DOCUMENTATION-UPDATE-SUMMARY.md` - Fixed 3 date references

### 📁 Files Reviewed (Verified Current)

- **Verified**: `README.md` - Current features and deployment guide accurate
- **Verified**: `LOCAL-TESTING-GUIDE.md` - Testing procedures current
- **Verified**: `SECURITY-RISK-ANALYSIS.md` - Risk assessment documentation current

### 🗑️ Content Removed/Altered

- **Altered**: Fixed date typos in multiple documentation files (changed "November 2026" to "November 2025")
  - `CHANGELOG.md`: Updated 7 date references
  - `PROJECT-SUMMARY.md`: Updated date reference
  - `SECURITY-REVIEW-REPORT.md`: Updated 2 date references
  - `SECURITY-FIXES-IMPLEMENTED.md`: Updated date reference
  - `DOCUMENTATION-UPDATE-SUMMARY.md`: Updated 3 date references
- **Preserved**: All existing documentation content maintained, only date corrections applied

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added this documentation update entry

---

## Bug Fixes & Improvements (November 2025)

### 🐛 Bug Fixes

#### Infinite Loop Fix in Car Section Search

- **Fixed Browser Freeze**: Resolved infinite loop in car section search that caused browser freeze
  - Added `isApplyingFilter` guard to prevent re-entry into `applyCarSectionFilter`
  - Added `window.isApplyingCarSectionFilter` flag for MutationObserver to check
  - MutationObserver now skips updates when filter is being applied
  - Prevents infinite loop cycle: `applyCarSectionFilter` → `renderVehiclesPage` → `MutationObserver` → `updateVehiclesList` → `notifyObservers` → `applyCarSectionFilter`
  - Both flags reset after 100ms timeout to ensure proper cleanup
  - Improves stability and prevents browser crashes during vehicle search

#### Content Security Policy (CSP) Fix

- **CSP Domain Allowlist Updates**: Fixed CSP violations blocking Google Analytics and Vercel Live
  - Added `region1.google-analytics.com` and `region2.google-analytics.com` to `connect-src`
  - Added `vercel.live` to `script-src` and `connect-src`
  - Fixes CSP violations blocking Google Analytics tracking
  - Fixes CSP violation blocking Vercel Live feedback script
  - Ensures all analytics and monitoring tools function correctly

### 🔧 Improvements

#### Vehicle Description Content Formatting Enhancement

- **Intelligent Description Formatting**: Enhanced vehicle description formatting with structured HTML
  - Added intelligent paragraph breaking and section detection
  - Format feature lists as structured HTML lists with checkmarks
  - Add section headers for 'Ausstattung & Highlights' and service information
  - Improved visual hierarchy with styled section titles
  - Enhanced feature highlighting with better HTML tag handling
  - Added CSS styles for section titles, feature categories, and lists
  - Support dark theme for all new description elements
  - Improved readability with better spacing and organization
  - Better presentation of vehicle specifications and features

### 📁 Files Changed

- **Modified**: `scripts.js`
  - Added infinite loop prevention guards in car section search (lines ~6167-6227)
  - Enhanced vehicle description formatting function with intelligent structure detection (lines ~3388-3529)
- **Modified**: `styles.css`
  - Added CSS styles for formatted description sections, feature lists, and section titles (83 lines added)
- **Modified**: `vercel.json`
  - Updated Content-Security-Policy header to include Google Analytics regions and Vercel Live domains

### 🗑️ Content Removed/Altered

- **Altered**: Vehicle description rendering now uses structured HTML with sections and lists instead of plain text
- **Preserved**: All existing vehicle data and functionality maintained, only presentation improved

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added this bug fixes and improvements entry

### 🧪 Testing

- **Search Functionality**: Verified car section search no longer causes browser freeze or infinite loops
- **CSP Compliance**: Verified Google Analytics and Vercel Live scripts load without CSP violations
- **Description Formatting**: Verified vehicle descriptions display with improved structure and readability

---

## Security Fixes Implementation (November 2025)

### 🔒 Security Enhancements

#### CORS Whitelist Implementation

- **CORS Origin Restriction**: Replaced wildcard CORS (`*`) with origin whitelist across all API endpoints
  - Added 6 allowed origins: `https://direktonline.at`, `https://www.direktonline.at`, `https://onlinedirekt.at`, `https://www.onlinedirekt.at`, `https://direktonline.vercel.app`, `http://localhost:3000`
  - Prevents unauthorized websites from calling APIs
  - Reduces CSRF attack surface
  - Applied to all API endpoints: `contact.js`, `appointment.js`, `newsletter.js`, `newsletter-confirm.js`, `vehicles.js`, `vehicle-details.js`

#### Security Headers Addition

- **Content-Security-Policy (CSP)**: Added comprehensive CSP header to restrict resource loading to trusted sources
  - Allows Google Analytics, Google Fonts, CDN resources
  - Prevents XSS attacks
- **Strict-Transport-Security (HSTS)**: Forces HTTPS connections with 1-year duration and subdomain inclusion
- **Permissions-Policy**: Disables geolocation, microphone, and camera to prevent unauthorized device access
  - All headers configured in `vercel.json`

#### Query Parameter Validation

- **Vehicle ID Validation**: Added validation for `vid` parameter in `api/vehicle-details.js`
  - Validates that `vid` is numeric only
  - Limits length to 10 characters maximum
  - Returns 400 error for invalid format
  - Prevents parameter injection attacks and reduces DoS risk

#### Hardcoded Token Removal

- **Token Removal from Client-Side Code**: Removed hardcoded secret token from `scripts.js`
  - Token no longer exposed in client-side source code
  - Google Apps Script updated to make token validation optional
  - Token is now checked only if provided, allowing requests without token
  - Acceptable security trade-off for newsletter signups

### 📁 Files Changed

- **Modified**: `api/contact.js` - Added CORS whitelist
- **Modified**: `api/appointment.js` - Added CORS whitelist
- **Modified**: `api/newsletter.js` - Added CORS whitelist
- **Modified**: `api/newsletter-confirm.js` - Added CORS whitelist
- **Modified**: `api/vehicles.js` - Added CORS whitelist
- **Modified**: `api/vehicle-details.js` - Added CORS whitelist and query parameter validation
- **Modified**: `vercel.json` - Added security headers (CSP, HSTS, Permissions-Policy)
- **Modified**: `scripts.js` - Removed hardcoded token constant and token from form data
- **Modified**: `google-apps-script-newsletter.js` - Made token validation optional

### 🗑️ Content Removed/Altered

- **Removed**: Hardcoded `SECRET_TOKEN` constant from `scripts.js`
- **Removed**: Token from newsletter form data submission
- **Altered**: CORS policy changed from wildcard (`*`) to origin whitelist
- **Altered**: Google Apps Script token validation now optional (token checked only if provided)
- **Preserved**: All existing API functionality maintained, only security posture improved

### 📚 Documentation Updates

- **Created**: `SECURITY-FIXES-IMPLEMENTED.md` - Comprehensive documentation of all security fixes
- **Created**: `LOCAL-TESTING-GUIDE.md` - Guide for testing security fixes locally
- **Updated**: `CHANGELOG.md` - Added this security fixes entry

### 🧪 Testing

- **CORS Testing**: Verified API calls work from all 6 allowed domains
- **Security Headers**: Verified headers appear in browser DevTools → Network → Response Headers
- **Query Validation**: Tested vehicle-details API with valid and invalid `vid` parameters
- **Newsletter**: Tested newsletter signup without token

---

## CSS Code Formatting Improvements (November 2025)

### 🔧 Code Quality Improvements

#### CSS Formatting Cleanup

- **Whitespace Normalization**: Cleaned up inconsistent whitespace and line breaks in `styles.css`
  - Removed trailing whitespace
  - Normalized line breaks for better readability
  - Improved code formatting consistency
  - No visual or functional changes, purely code quality improvement

### 📁 Files Changed

- **Modified**: `styles.css`
  - Normalized whitespace and line breaks throughout
  - Improved code formatting consistency
  - No functional changes

### 🗑️ Content Removed/Altered

- **Altered**: CSS formatting improved for better code maintainability
- **Preserved**: All existing styles and functionality maintained exactly

---

## Hero Headline Formatting Fix (November 2025)

### 🔧 Minor Improvements

#### Formatting Cleanup

- **Hero Headline Line Break Removal**: Removed unnecessary line break in hero headline text for cleaner HTML formatting
  - Changed from multi-line span to single-line span
  - No visual impact, purely code formatting improvement
  - Maintains exact same display text: "DirektOnline – Ihr Autohändler in Wolfsberg, Kärnten"

### 📁 Files Changed

- **Modified**: `index.html`
  - Removed line break in hero headline span element (line ~516)

### 🗑️ Content Removed/Altered

- **Altered**: Hero headline HTML formatting changed from multi-line to single-line (no visual change)

---

## Tablet Portrait Search Bar Positioning Refinement (November 2025)

### 🔧 Improvements

#### Tablet Portrait Search Bar Final Positioning

- **Fixed Width Implementation**: Changed search input width from viewport-relative (`calc(100vw - 120px)`) to fixed **280px** for consistency with desktop and mobile sizes
- **Button-Aligned Positioning**: Search input now starts from the search button position and extends left, using `right: calc(42px + 1rem + 1.25rem)` for precise alignment
- **Optimized Positioning**: Fine-tuned positioning to ensure search bar starts exactly from button position and expands 280px to the left
- **Consistent Width Across Devices**: Search input maintains 280px width on tablet (matching desktop default), expands to 320px on focus
- **Search Results Alignment**: Search results dropdown properly aligned with search input position (280px width, matching input)
- **Visual Consistency**: Search bar now provides consistent experience across all device sizes with appropriate width and positioning

---

## Back-to-Top Button & Tablet Portrait Search Bar Fix (November 2025)

### ✨ New Features

#### Back-to-Top Button

- **Smooth Scroll Navigation**: Added back-to-top button positioned on bottom-left to avoid overlap with floating CTA
- **Responsive Sizing**: Implemented responsive sizing - 56px (desktop), 52px (tablet), 48px (mobile)
- **Smart Visibility**: Button appears after scrolling 400px with smooth fade-in animation
- **Smooth Scroll Functionality**: Smooth scroll to top with fallback for older browsers
- **Touch Optimization**: Touch-optimized for mobile devices with proper tap detection
- **Accessibility Features**: ARIA labels, keyboard navigation (Enter/Space keys), focus states
- **Design Integration**: Matches site's glassmorphism design style with brand colors
- **Dark Mode Support**: Full dark mode support included
- **Cross-Device Testing**: Tested and verified on all screen sizes

### 🔧 Improvements

#### Tablet Portrait Search Bar Fix

- **Search Bar Transformation**: Transform search bar to button-only view on tablet portrait (768px-1024px)
- **Expandable Search Input**: Search input is hidden by default and expands on click
- **JavaScript Updates**: Updated JavaScript to handle tablet portrait mode (up to 1024px width)
- **Cross-Device Compatibility**: Search bar now works correctly on mobile, tablet, and desktop sizes
- **Fixed Positioning**: Search input and results use fixed positioning when expanded on tablet portrait
- **CSS Specificity**: Added `!important` flags to ensure tablet-specific styles override desktop defaults
- **Z-Index Management**: Proper z-index layering to ensure search appears above other content

### 📁 Files Changed

#### Tablet Portrait Search Bar Refinement

- **Modified**: `styles.css`
  - Updated tablet portrait search input width from `calc(100vw - 120px)` to fixed `280px !important` (line ~9538-9555)
  - Changed positioning from `left: 1rem` to `right: calc(42px + 1rem + 1.25rem)` for button-aligned expansion (line ~9552)
  - Updated search results dropdown positioning to match search input alignment (line ~9606)
  - Added `!important` flags to all active state properties for proper CSS specificity

#### Back-to-Top Button & Initial Tablet Portrait Fix

- **Modified**: `index.html`
  - Added back-to-top button HTML structure with SVG icon (lines 4354-4375)
  - Added ARIA label and title attributes for accessibility
- **Modified**: `styles.css`
  - Added back-to-top button styles with responsive sizing and animations (lines 10715-10832)
  - Added tablet portrait search bar styles (lines 9465-9687)
  - Enhanced search input positioning and z-index management
- **Modified**: `scripts.js`
  - Added `initBackToTop()` function with scroll detection and smooth scroll (lines 882-970)
  - Updated `initVehicleSearch()` to handle tablet portrait mode (up to 1024px width) (lines 5236-5290)
  - Enhanced search container toggle functionality for tablet portrait

### 🗑️ Content Removed/Altered

#### Tablet Portrait Search Bar Refinement

- **Altered**: Search input width changed from viewport-relative (`calc(100vw - 120px)`) to fixed `280px` for consistency
- **Altered**: Search input positioning changed from `left: 1rem` to `right: calc(42px + 1rem + 1.25rem)` to start from button position
- **Altered**: Search results dropdown width changed from `calc(100vw - 2rem)` to fixed `280px` to match input width
- **Preserved**: All existing search functionality maintained, only positioning and width optimized

#### Back-to-Top Button & Initial Tablet Portrait Fix

- **Altered**: Search bar behavior changed on tablet portrait - now button-only by default, expands on click
- **Altered**: Search input positioning changed to fixed position when expanded on tablet portrait
- **Preserved**: All existing search functionality maintained, only tablet portrait mode optimized
- **Added**: Back-to-top button as new navigation element

### 📚 Documentation Updates

#### Tablet Portrait Search Bar Refinement

- **Updated**: `CHANGELOG.md` - Added tablet portrait search bar positioning refinement entry documenting final width and positioning improvements

#### Back-to-Top Button & Initial Tablet Portrait Fix

- **Updated**: `README.md` - Added back-to-top button and tablet portrait search bar support to features list
- **Updated**: `CHANGELOG.md` - Added this back-to-top button and tablet portrait search bar fix entry

### 🧪 Testing

#### Tablet Portrait Search Bar Refinement

- **Position Testing**: Verified search bar starts from button position and extends 280px to the left on tablet portrait (900px viewport)
- **Width Testing**: Confirmed search input maintains 280px width (consistent with desktop) and expands to 320px on focus
- **Alignment Testing**: Verified search results dropdown properly aligns with search input position
- **Visual Testing**: Confirmed search bar is fully visible within viewport and properly positioned relative to button

#### Back-to-Top Button & Initial Tablet Portrait Fix

- **Cross-Device Testing**: Verified back-to-top button works on all screen sizes (mobile, tablet, desktop)
- **Scroll Testing**: Confirmed button appears after 400px scroll and smoothly scrolls to top
- **Tablet Portrait Testing**: Verified search bar correctly transforms to button-only view on tablet portrait (768px-1024px)
- **Accessibility Testing**: Verified keyboard navigation and ARIA labels work correctly

---

## Social Media Integration & Contact Section Optimization (November 2025)

### ✨ New Features

#### Social Media Integration

- **Prominent Social Media Section**: Added dedicated social media section in contact area with branded buttons
  - Facebook, Instagram, TikTok buttons with official brand colors and gradients
  - YouTube and X (Twitter) buttons with platform-specific styling
  - Responsive grid layout (2 columns on mobile, 5 columns on desktop)
  - Hover effects with platform-specific color transitions
  - Icon-based design with clear platform identification

#### Social Media Links Update

- **Updated Social Media Handles**: Standardized all social media profiles to consistent naming
  - Facebook: `direktonline.at`
  - Instagram: `direktonline.at`
  - TikTok: `@direktonline.at`
  - YouTube: `@direktonline-at`
  - X (Twitter): `DirektOnlineAT`
- **Structured Data Update**: Updated JSON-LD AutoDealer schema with all social media links in `sameAs` property

### 🔧 Improvements

#### Contact Section Layout Optimization

- **Equal Width Columns**: Changed contact grid from asymmetric to equal width columns (`1fr 1fr`)
  - Better visual balance between contact options and appointment booking
  - Improved responsive behavior on all screen sizes
- **Map Repositioning**: Moved Google Maps iframe to full width below both contact columns
  - Better use of available space
  - Map now spans entire container width for better visibility
  - Improved layout flow and visual hierarchy
- **Compact Appointment Section**: Made "Direkter Termin" section more space-efficient
  - Reduced padding and spacing throughout
  - Reduced font sizes for more compact presentation
  - Appointment description text now stays on one line (single-line display)
  - Better density of information without sacrificing readability

### 📁 Files Changed

- **Modified**: `index.html`
  - Added social media section HTML with branded buttons (lines 2252-2320)
  - Updated all social media links and handles throughout document
  - Updated JSON-LD structured data with social media links (lines 166-172)
  - Optimized contact section grid layout and map positioning
  - Made appointment section more compact with reduced spacing
- **Modified**: `styles.css`
  - Added social media button styles with platform-specific colors (lines 5280-5364)
  - Updated contact grid to equal width columns (line 4852)
  - Added map container full-width styling (lines 5384-5394)
  - Optimized appointment section spacing and typography
  - Added responsive breakpoints for social media grid

### 🗑️ Content Removed/Altered

- **Altered**: Contact section grid changed from asymmetric to equal width columns
- **Altered**: Map moved from inline position to full width below contact columns
- **Altered**: Appointment section spacing reduced for more compact layout
- **Altered**: Appointment description changed to single-line display
- **Altered**: All social media handles updated to new standardized format
- **Preserved**: All existing contact functionality maintained, only layout optimized

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added this social media integration and contact section optimization entry

---

## Smooth Scroll Navigation Fix (November 2025)

### 🔧 Navigation & User Experience Improvements

#### Smooth Scroll Event Delegation

- **Event Delegation Implementation**: Converted smooth scroll from per-link event listeners to document-level event delegation
  - Changed from `querySelectorAll('a[href^="#"]').forEach()` to `document.addEventListener("click")` with `e.target.closest()`
  - Handles all anchor links including dynamically added ones (sticky CTA, etc.)
  - Added idempotency check to prevent duplicate listeners if function called multiple times
  - Added `e.stopPropagation()` to prevent handler interference

#### Contact Section Scroll Position Fix

- **Accurate Position Calculation**: Fixed contact form container position calculation for desktop scrolling
  - Changed selector from `.contact-form-container` to `#kontakt .contact-form-container` for specificity
  - Replaced `offsetTop` (relative to positioned parent) with `getBoundingClientRect().top + window.scrollY` for accurate document-relative position
  - Fixes issue where scrolling to `#kontakt` would scroll to wrong position (~183px instead of ~7500px)
  - Special handling for desktop (≥768px) to scroll to contact form container with 20px offset
  - Mobile falls back to section-level scrolling

### 📁 Files Changed

- **Modified**: `scripts.js`
  - Refactored `initSmoothScroll()` to use event delegation (lines 6210-6285)
  - Fixed contact form container position calculation using `getBoundingClientRect()` (lines 6272-6287)
  - Added idempotency check with `smoothScrollInitialized` flag (lines 6210-6216)

### 🗑️ Content Removed/Altered

- **Altered**: Smooth scroll handler changed from per-link listeners to event delegation pattern
- **Altered**: Contact section scroll calculation method changed from `offsetTop` to `getBoundingClientRect().top + window.scrollY`
- **Preserved**: All existing smooth scroll functionality maintained, only implementation improved

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added this smooth scroll navigation fix entry

### 🧪 Testing

- **Local Testing**: Tested on http://localhost:3000/ - verified scrolling works for both hero "Kontakt aufnehmen" button and sticky CTA button
- **Position Verification**: Confirmed scroll position calculation correct (scrollY: 7556px, contact section visible)
- **Event Delegation**: Verified dynamically added links (sticky CTA) now work correctly

---

## Quick View Modal & Comparison Modal UI Improvements (November 2025)

### 🎨 Visual Spacing Improvements

#### Divider Spacing Optimization

- **Reduced Divider Spacing**: Reduced spacing around divider in quick-view-body from `1rem` to `0.25rem` (4px) for more compact layout
  - Default divider margin reduced from `1rem 0` to `0.75rem 0`
  - Quick-view-body specific divider margin set to `0.25rem 0` (75% reduction)
  - Applied to both mobile and desktop for consistent experience
- **Section Spacing After Divider**: Reduced margin-top for sections following divider from `1.25rem` to `0.5rem` (60% reduction)
  - Added adjacent sibling selector `.quick-view-body .divider + .quick-view-section { margin-top: 0.5rem; }`
  - Creates more compact visual flow between divider and description section
  - Total spacing between content and divider reduced from ~28px to ~12px

#### Comparison Modal Z-Index Fix

- **Comparison Modal Above Quick View**: Increased comparison modal z-index to `calc(var(--z-modal, 9999) + 15)` to ensure it appears above quick-view modal (z-index +10)
- **Automatic Quick View Closure**: Updated `openComparisonModal()` function to close quick-view modal if open before opening comparison modal
  - Adds 200ms delay to allow quick-view close animation to complete smoothly
  - Ensures comparison modal always opens in front of other modals
  - Better user experience when clicking comparison floating button while quick-view is open

#### Comparison Button Font Consistency

- **Font Matching**: Made "Zum Vergleich hinzufügen" button font match other action buttons
  - Added `font-family: var(--font-display)`, `font-size: 1rem`, `font-weight: 600` to `.compare-checkbox-btn-modal`
  - Applied same font styles to button span element for consistency
  - Ensures visual consistency with "Fahrzeug teilen" and other buttons in quick view modal

#### Comparison Table Action Buttons Alignment

- **Fixed Button Alignment**: Improved alignment of action buttons ("Anfragen", "Details") in comparison table
  - Wrapped action buttons in `comparison-actions-wrapper` div with flexbox column layout
  - Removed conflicting `display: flex` from `.comparison-actions` class
  - Added `vertical-align: middle` and `min-height: 60px` to action cells
  - Added `min-height: 100%` to wrapper for consistent cell heights
  - Ensures buttons stack vertically and align properly across all vehicle columns

### 📁 Files Changed

- **Modified**: `styles.css`
  - Reduced divider spacing in quick-view-body (line 324-326)
  - Added section spacing rule after divider (line 328-331)
  - Increased comparison modal z-index (line 8353)
  - Matched comparison button font styles (line ~8912-8925)
  - Fixed comparison table action buttons alignment (line ~7130-7145)
- **Modified**: `scripts.js`
  - Updated `openComparisonModal()` to close quick-view modal before opening comparison (line ~4013-4029)

### 🗑️ Content Removed/Altered

- **Altered**: Divider spacing significantly reduced for more compact layout
- **Altered**: Section spacing after divider reduced for better visual flow
- **Altered**: Comparison modal now properly appears above quick-view modal
- **Altered**: Comparison button font now matches other action buttons
- **Altered**: Comparison table action buttons now properly aligned in columns

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added this quick view and comparison modal improvements entry

### 🧪 Testing

- **Live Site Testing**: All fixes verified on live site (https://www.direktonline.at/)
- **Visual Testing**: Divider spacing verified with computed styles (4px confirmed)
- **Modal Testing**: Comparison modal z-index and quick-view closure tested and confirmed working
- **Button Alignment**: Comparison table action buttons alignment verified with 2+ vehicles

---

## Mobile UI Fixes & Dark Mode Contrast Improvements (November 2025)

### 🔧 Mobile View Toggle Fixes

#### SVG Icon Visibility

- **Fixed View Toggle SVG Icons**: Resolved issue where SVG icons in view toggle buttons were collapsing to 0px width on mobile
  - Added explicit `min-width: 44px` and `min-height: 44px` to `.view-toggle-btn` for proper touch targets
  - Enforced SVG dimensions with `!important` flags: `width: 22px`, `height: 22px`, `min-width/max-width: 22px`, `min-height/max-height: 22px`
  - Added `flex-shrink: 0`, `flex-grow: 0`, `box-sizing: border-box`, and `overflow: visible` to prevent SVG collapse
  - Enhanced mobile view toggle layout with `display: flex !important`, `width: 100%`, `justify-content: center`, `padding: 0.5rem`, and `gap: 0.75rem`
  - Increased SVG icon size to `22px` on mobile (from `20px`) for better visibility

#### Touch Interaction Improvements

- **Enhanced Touch Targets**: View toggle buttons now meet 44px minimum touch target guidelines (iOS/Android recommended)
- **Touch Feedback**: Added `:active` states with scale transforms (`transform: scale(0.95)`) and background color changes for visual feedback
- **Touch Optimization**: Added `touch-action: manipulation`, `user-select: none`, and `-webkit-tap-highlight-color` for improved mobile interaction

### 🔧 Comparison Modal Button Fixes

#### SVG Icon Visibility

- **Fixed Comparison Close Button SVG**: Comparison modal close button SVG icons were invisible due to collapse

  - Added explicit dimensions: `width: 24px`, `height: 24px` with `!important` flags
  - Added `min-width/max-width: 24px`, `min-height/max-height: 24px` to prevent collapse
  - Added `flex-shrink: 0 !important`, `flex-grow: 0 !important`, `display: block !important`
  - Added `opacity: 1 !important`, `visibility: visible !important` for guaranteed visibility
  - Applied `box-sizing: border-box !important` and `overflow: visible !important`

- **Fixed Comparison Remove Button SVG**: Remove buttons in comparison modal had invisible SVG icons
  - Applied same SVG dimension enforcement (16px × 16px) with all preventing properties
  - Both base styles and mobile media query (`@media (max-width: 768px)`) updated

### 🎨 Dark Mode Contrast Improvements

#### Enhanced Button Visibility in Dark Mode

- **Comparison Modal Close Button**:

  - Dark mode background: `rgba(255, 255, 255, 0.15)` with white border (`rgba(255, 255, 255, 0.2)`)
  - Hover state: `rgba(255, 255, 255, 0.25)` background with enhanced border
  - SVG icons: White color (`#ffffff`) with `!important` flags for guaranteed visibility

- **Quick View Close Button**:

  - Dark mode styles matching comparison close button for consistency
  - White background, borders, and SVG icons for optimal contrast

- **Vehicle Card Action Buttons** (Quick View, Compare, Share, Inquiry):

  - Dark mode background: `rgba(255, 255, 255, 0.2)` with white border (`rgba(255, 255, 255, 0.3)`)
  - Enhanced box shadow: `0 4px 12px rgba(0, 0, 0, 0.3)` for better definition
  - Hover state: `rgba(255, 255, 255, 0.3)` background with stronger shadow (`0 6px 16px rgba(0, 0, 0, 0.4)`)
  - SVG icons: White color (`#ffffff`) with `stroke: #ffffff !important` for visibility

- **Share Modal Close Button**:

  - Consistent dark mode styling with other modal close buttons
  - White backgrounds, borders, and icons for sufficient contrast

- **Comparison Remove Button**:
  - Dark mode background: `rgba(255, 255, 255, 0.2)` with white border
  - Hover state: Red tint (`rgba(220, 38, 38, 0.8)`) with red border for clear action indication
  - SVG icons: White color for visibility

#### CSS Implementation

- All dark mode styles use `[data-theme="dark"]` selector for proper theme targeting
- SVG icons use `color: #ffffff !important` and `stroke: #ffffff !important` to override any inherited colors
- Enhanced borders and shadows provide better visual definition in dark mode
- All interactive elements now have sufficient contrast ratios for accessibility compliance

### 📁 Files Changed

- **Modified**: `styles.css`
  - Added mobile view toggle SVG dimension enforcement and touch optimization (lines in mobile media query)
  - Added comparison modal SVG fixes for `.comparison-close svg` and `.comparison-remove-btn svg`
  - Added comprehensive dark mode contrast rules for all modal and vehicle card buttons
  - Enhanced touch targets and feedback for mobile view toggle buttons

### 🗑️ Content Removed/Altered

- **Altered**: Mobile view toggle SVG icons now have enforced dimensions preventing collapse
- **Altered**: Comparison modal buttons now display SVG icons correctly on all devices
- **Altered**: All modal and vehicle card buttons now have improved contrast in dark mode
- **Preserved**: All existing functionality maintained, only visual/styling improvements

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added this mobile UI fixes and dark mode improvements entry

### 🧪 Testing

- **Live Site Testing**: All fixes verified on live site (https://www.direktonline.at/)
- **Mobile Testing**: View toggle and buttons tested on mobile viewport with proper touch interactions
- **Dark Mode Testing**: All button contrasts verified and improved in dark mode
- **Cross-Device Testing**: SVG icons now visible and functional across all devices

---

## SEO Enhancements - Blog Posts & Sitemap Updates (November 2025)

### 🔍 Blog Post SEO Improvements

#### Complete SEO Meta Tags Added to All Blog Posts

- **Meta Descriptions**: Added unique, keyword-rich meta descriptions for all 3 blog posts
  - `elektromobilitaet.html`: E-Mobilität content with local Kärnten focus
  - `gebrauchtwagen-kaufen.html`: Gebrauchtwagen purchase guide with local keywords
  - `reifenwechsel.html`: Reifenwechsel guide with service-oriented keywords
- **Meta Keywords**: Added relevant keyword tags for each blog post
- **Canonical URLs**: Added canonical link tags to prevent duplicate content issues
- **Open Graph Tags**: Comprehensive OG tags for social media sharing:
  - Title, description, type (article), URL
  - Image with dimensions (1200x630px) and alt text
  - Locale (de_AT), publish date, author, section
- **Twitter Card Tags**: Complete Twitter Card implementation:
  - summary_large_image card type
  - Title, description, image with alt text
- **Favicon Links**: Added favicon link tags to all blog posts

#### Structured Data Enhancement

- **BlogPosting Schema**: Added JSON-LD structured data to all blog posts
  - Complete BlogPosting schema with headline, description, image
  - Date published/modified timestamps
  - Author and publisher information with logo
  - Main entity of page with proper URLs
  - Article section categorization (Trends, Kaufberatung, Ratgeber)

### 🗺️ Sitemap Improvements

#### URL Corrections

- **Blog Post URLs**: Fixed sitemap URLs to include `.html` extension
  - `/posts/reifenwechsel` → `/posts/reifenwechsel.html`
  - `/posts/gebrauchtwagen-kaufen` → `/posts/gebrauchtwagen-kaufen.html`
  - `/posts/elektromobilitaet` → `/posts/elektromobilitaet.html`

#### Last Modified Dates

- **Updated Dates**: Updated `lastmod` dates to reflect current content changes
  - Homepage: Updated to 2025-11-03 (SEO improvements)
  - #fahrzeuge section: Updated to 2025-11-03 (dynamic content)
  - #blog section: Updated to 2025-11-03 (SEO improvements)
  - All blog posts: Updated to 2025-11-03 (SEO meta tags added)
  - Other sections remain at 2025-11-01 (no changes)

### 📁 Files Changed

- **Modified**: `posts/elektromobilitaet.html` - Added complete SEO meta tags, Open Graph tags, Twitter Cards, canonical URL, favicon, and BlogPosting structured data
- **Modified**: `posts/gebrauchtwagen-kaufen.html` - Added complete SEO meta tags, Open Graph tags, Twitter Cards, canonical URL, favicon, and BlogPosting structured data
- **Modified**: `posts/reifenwechsel.html` - Added complete SEO meta tags, Open Graph tags, Twitter Cards, canonical URL, favicon, and BlogPosting structured data
- **Modified**: `sitemap.xml` - Fixed blog post URLs (added .html extension), updated lastmod dates for homepage, #fahrzeuge, #blog, and all blog posts to 2025-11-03

### 🗑️ Content Removed/Altered

- **None**: All changes are additive SEO enhancements; no content was removed

### 📚 Documentation Updates

- **Updated**: `README.md` - Added BlogPosting to structured data list, added canonical URLs to SEO features, enhanced blog post template with complete SEO meta tags
- **Updated**: `CHANGELOG.md` - Added this SEO enhancements entry

---

## Navigation & Calculator Hash Navigation Fix (January 2025)

### 🔧 Navigation Anchor Fixes

#### Missing Anchor Targets Resolved

- **Fixed Broken Navigation Links**: Added missing anchor elements for calculator modals
  - Added `<div id="financing-calculator">` hidden anchor element for financing calculator navigation
  - Added `<div id="tradein-calculator">` hidden anchor element for trade-in calculator navigation
  - Both anchors are positioned absolutely and hidden to support hash-based navigation without visual impact

#### Enhanced Smooth Scroll Functionality

- **Hash-Based Modal Triggering**: Enhanced `initSmoothScroll()` function to handle calculator modal navigation
  - Clicking links with `href="#financing-calculator"` now properly opens the financing calculator modal
  - Clicking links with `href="#tradein-calculator"` now properly opens the trade-in calculator modal
  - Supports direct hash navigation (e.g., `#financing-calculator` in URL opens modal on page load)
  - Handles hash change events to open modals when URL hash is updated programmatically
  - Intelligent trigger detection: if clicked link is already a trigger, lets existing handler process it

#### Code Improvements

- **Added Missing Trigger Class**: Added `financing-trigger` class to financing calculator service link to ensure proper modal triggering
- **Backward Compatibility**: All existing modal triggers continue to work via click events; hash navigation is an additional enhancement

### 📁 Files Changed

- **Modified**: `index.html`
  - Added hidden anchor elements `<div id="financing-calculator">` and `<div id="tradein-calculator">`
  - Added `financing-trigger` class to financing calculator service link
- **Modified**: `scripts.js`
  - Enhanced `initSmoothScroll()` function with calculator hash navigation handling
  - Added hash change event listener for calculator modals
  - Added initial page load hash detection for calculator modals

### 🗑️ Content Removed/Altered

- **None**: All changes are additive enhancements; no content was removed

### 📚 Documentation Updates

- **Created**: `SMOKE-TEST-RESULTS.md` - Comprehensive smoke test results documenting all test findings
- **Updated**: `CHANGELOG.md` - Added this navigation fix entry

### 🧪 Testing

- **Smoke Test Completed**: All navigation links tested and verified
  - Navigation to `#financing-calculator` now works correctly
  - Navigation to `#tradein-calculator` now works correctly
  - All other navigation links remain functional

---

## Quick View Modal Mobile-First Improvements (November 2025)

### 📱 Mobile Experience Enhancements

#### Touch-Friendly Image Gallery

- **Swipe Gestures**: Implemented horizontal swipe gestures for image navigation on mobile devices
  - Touch start/end event listeners on image container
  - 50px minimum swipe distance for gesture recognition
  - Swipe left to next image, swipe right to previous image
- **Navigation Arrows Hidden on Mobile**: Desktop navigation arrows are hidden on mobile (`display: none !important`) to avoid overlap with images
- **Touch-Optimized Image Display**:
  - Added `min-height: 250px` to ensure images are always visible on mobile
  - Added `min-height: 350px` to image section container
  - Optimized `aspect-ratio: 4/3` for better mobile viewing
  - Enabled `touch-action: pan-y pinch-zoom` for proper touch handling
- **Thumbnail Scrolling**: Enhanced thumbnail scrolling with `scroll-snap-type: x mandatory` for smooth horizontal scrolling

#### Button Icon Visibility Fixes

- **SVG Collapse Prevention**: Fixed SVG icons collapsing to 0px width on mobile by adding:
  - `min-width: 18px !important` and `max-width: 18px !important`
  - `min-height: 18px !important` and `max-height: 18px !important`
  - `flex-shrink: 0 !important` and `flex-grow: 0 !important`
  - `overflow: visible !important` to prevent clipping
  - Explicit styling for SVG paths, lines, circles, and polylines
- **Button Container Sizing**: Added `min-width: 44px` and `min-height: 44px` to all action buttons for better touch targets
- **Icon Visibility**: Ensured all button icons (inquiry, financing, share) are properly displayed on mobile

#### Image Sizing Improvements

- **Desktop Optimization**:
  - Changed `grid-template-columns` from `1.2fr 1fr` to `1fr 1fr` for balanced layout
  - Added `max-height: 500px` to main image container
  - Changed `object-fit` from `cover` to `contain` to prevent image cropping
- **Mobile Optimization**:
  - Set `max-height: 300px` for main image on mobile
  - Ensured proper flex layout with `display: flex !important` and `flex-direction: column !important`

### 📁 Files Changed

- **Modified**: `scripts.js` - Added touch/swipe gesture handlers for image navigation, refactored image navigation into reusable functions (`showPrevImage()`, `showNextImage()`)
- **Modified**: `styles.css` - Added mobile-first CSS rules for touch gestures, hidden navigation arrows on mobile, fixed SVG icon sizing, enhanced button container sizing, improved image sizing constraints
- **Modified**: `index.html` - Added inline SVG icons to action buttons for better icon visibility

### 🗑️ Content Removed/Altered

- **Altered**: Desktop navigation arrows now hidden on mobile (still functional on desktop)
- **Altered**: Image sizing constraints tightened for better containment on both desktop and mobile
- **Altered**: Button icons now use inline SVG with explicit sizing constraints instead of relying solely on CSS

### 📚 Documentation Updates

- **Updated**: `README.md` - Added "touch-friendly image galleries" to responsive features, updated vehicle features to mention swipe gestures
- **Updated**: `CHANGELOG.md` - Added this mobile-first improvements entry

---

## Documentation Update (November 2025) - API Endpoint Documentation

### 📚 Missing API Endpoint Documentation

#### Vehicle Details API Endpoint

- **Added Documentation**: Documented previously missing `/api/vehicle-details` endpoint in README.md
- **API Functionality**: Fetches comprehensive vehicle details from motornetzwerk.at by vehicle ID (vid) using Puppeteer for JavaScript-rendered content
- **Integration**: Used by Quick View modal to display enhanced vehicle information including full specifications, description, equipment list, multiple images, and dealer information
- **Caching**: Implements 1-hour in-memory cache for improved performance
- **Project Structure**: Added `vehicle-details.js` to API endpoints list in README.md project structure section
- **Features Section**: Updated vehicle features description to mention enhanced vehicle details API integration

### 📁 Files Changed

- **Modified**: `README.md` - Added vehicle-details.js to API endpoints list in project structure, updated vehicle features description to mention enhanced vehicle details API
- **Modified**: `PROJECT-SUMMARY.md` - Added vehicle-details.js API endpoint documentation to Backend & API section with complete functionality description

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added this documentation update entry for vehicle-details API endpoint

---

## Documentation Update (November 2025)

### 📚 Documentation Review & Synchronization

#### Dependency Version Updates

- **PROJECT-SUMMARY.md**: Updated backend dependency versions to match current package.json:
  - nodemailer: ^6.9.7 → ^7.0.10
  - puppeteer-core: ^21.6.1 → ^24.27.0
  - @sparticuz/chromium: ^119.0.2 → ^141.0.0
- **Documentation Accuracy**: Ensured all documented dependency versions match actual package.json specifications

#### Documentation Completeness

- **Verified**: All features documented in README.md match current implementation
- **Verified**: All changelog entries are complete and accurate
- **Verified**: All API endpoints documented correctly
- **Synchronized**: PROJECT-SUMMARY.md dependency versions now match package.json

### 📁 Files Changed

- **Modified**: `PROJECT-SUMMARY.md` - Updated dependency versions to match current package.json

### 🗑️ Content Removed/Altered

- **Altered**: Dependency version numbers in PROJECT-SUMMARY.md updated to reflect current versions (nodemailer, puppeteer-core, @sparticuz/chromium)

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added documentation update entry for November 2025 dependency synchronization

---

## Version 2.20.0 (November 1, 2025)

### 🔧 Blog Section Improvements

#### Enhanced Readability & Quick Reading

- **Shortened Blog Excerpts**: Significantly condensed all 3 blog post excerpts to one-line summaries for faster scanning
  - Blog 1 (Reifenwechsel): "O-bis-O-Regel für Winterreifen: Wann und warum wechseln?"
  - Blog 2 (Gebrauchtwagen): "Praktische Checkliste für den sicheren Gebrauchtwagenkauf."
  - Blog 3 (E-Mobilität): "E-Autos in Kärnten: Vor- und Nachteile sowie Ladeinfrastruktur."
- **Reduced Reading Times**: Updated all blog posts to show "2 Min. Lesezeit" (down from 3-4 minutes)
- **Compact Display**: Changed CSS to display only 2 lines maximum for blog excerpts (down from 3 lines) using `line-clamp: 2`

#### Design & User Experience Enhancements

- **Improved Typography**: Enhanced font sizes, weights, line heights, and letter spacing for better readability
- **Better Visual Hierarchy**: Improved spacing with gap-based layout, clearer date formatting, and more prominent titles
- **Fixed Click Behavior**: Entire blog card now opens blog post (not image lightbox) when clicked
- **Accessibility**: Added keyboard navigation support (Enter/Space keys) and proper ARIA labels for blog cards
- **Enhanced Card Design**: Improved card layout with better padding, image height optimization (200px), and smoother hover effects

### 📁 Files Changed

- **Modified**: `index.html` - Shortened blog excerpts, updated reading times, added clickable card attributes
- **Modified**: `scripts.js` - Added `initBlogCardClicks()` function to handle card navigation, excluded blog images from lightbox
- **Modified**: `styles.css` - Enhanced blog card typography, spacing, reduced excerpt line-clamp, improved card interactions

### 🗑️ Content Removed/Altered

- **Altered**: Blog excerpts significantly shortened for quicker reading
- **Altered**: Reading times reduced from 3-4 minutes to 2 minutes for all blogs
- **Altered**: Blog images excluded from lightbox functionality (cards now navigate to posts)
- **Altered**: Excerpt display limited to 2 lines instead of 3 lines

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added version 2.20.0 entry

---

## Documentation Update (November 2025)

### 📚 Documentation Updates

#### README.md Updates

- **Added Missing Changelog Entries**: Added versions 2.15.0, 2.14.0, 2.13.0, 2.12.0, and 2.9.0 to README.md changelog section for complete version history
- **Copyright Year Update**: Updated copyright year from 2024 to 2025
- **Changelog Completeness**: README.md changelog now matches CHANGELOG.md with all documented versions

#### CHANGELOG.md Updates

- **Documentation Update Entry**: Added this entry to track documentation synchronization effort

### 📁 Files Changed

- **Modified**: `README.md` - Added missing changelog versions (2.15.0, 2.14.0, 2.13.0, 2.12.0, 2.9.0), updated copyright year to 2025
- **Modified**: `CHANGELOG.md` - Added documentation update entry

### 🗑️ Content Removed/Altered

- **Altered**: Copyright year changed from 2024 to 2025 in README.md
- **Added**: Complete version history now available in README.md changelog section

---

## Version 2.19.0 (November 1, 2025)

### ✅ Pre-Launch Legal & Technical Updates

#### Legal Compliance - Warranty Disclaimer

- **Warranty Asterisk Added**: All "12 Monate Garantie" mentions now include asterisk (\*) to reference legal disclaimer
- **Footer Legal Disclaimer**: Added comprehensive warranty disclaimer in footer clarifying that warranty terms (duration, scope, cost coverage) can vary by vehicle and are regulated in individual purchase contracts
- **FAQ Update**: Updated FAQ warranty answer to include disclaimer language
- **JSON-LD Update**: Updated structured data to reflect warranty disclaimer

#### Date Updates

- **Blog Post Dates**: Updated all blog post dates (HTML and Markdown files) to "1. November 2025"
- **Sitemap Dates**: Updated all sitemap `<lastmod>` entries to `2025-11-01`
- **Display Dates**: Updated all blog post display dates in index.html to November 2025
- **Footer Copyright**: Confirmed copyright year is 2025

#### Blog Post Modern Design

- **Full HTML Structure**: Converted all blog posts from simple markdown fragments to complete HTML5 documents
- **Modern Styling**: Created `blog-styles.css` with professional, modern styling
- **Blog Template**: Each blog post now includes:
  - Full HTML document structure with proper DOCTYPE
  - Linked stylesheets (`styles.css` and `blog-styles.css`)
  - Modern blog container with header, content, and footer
  - Category badges, date display, and read-time indicators
  - Professional typography and spacing
  - Responsive layout optimized for all devices
  - Navigation back to homepage ("Zurück zur Übersicht" link)

#### Forms - No SMTP Dependency

- **Contact Form**: Now uses mailto link instead of API submission (no SMTP required)
- **Appointment Form**: Uses mailto link for booking submission (no SMTP required)
- **Newsletter Form**: Has mailto fallback if Google Sheets webhook is not configured (no SMTP required)
- **Zero Configuration**: All forms work out of the box without any environment variables
- **Optional SMTP**: SMTP configuration is now optional and only needed for API-based email sending

### 📁 Files Changed

- **Modified**: `index.html` - Added warranty asterisks, footer disclaimer, updated blog dates
- **Modified**: `sitemap.xml` - Updated all dates to November 2025
- **Modified**: `posts/reifenwechsel.html` - Converted to modern HTML design
- **Modified**: `posts/reifenwechsel.md` - Updated date to November 2025
- **Modified**: `posts/gebrauchtwagen-kaufen.html` - Converted to modern HTML design
- **Modified**: `posts/gebrauchtwagen-kaufen.md` - Updated date to November 2025
- **Modified**: `posts/elektromobilitaet.html` - Converted to modern HTML design
- **Modified**: `posts/elektromobilitaet.md` - Updated date to November 2025
- **Added**: `posts/blog-styles.css` - New modern styling for blog posts
- **Modified**: `scripts.js` - Newsletter form has mailto fallback, contact and appointment forms use mailto

### 🗑️ Content Removed/Altered

- **Altered**: All warranty mentions now include asterisk (\*)
- **Altered**: FAQ warranty answer updated with disclaimer language
- **Altered**: Blog post dates changed from various dates to November 2025
- **Altered**: Blog posts converted from simple markdown fragments to modern HTML documents
- **Altered**: Forms changed from API-based to mailto-based (SMTP no longer required)

### 📚 Documentation Updates

- **Updated**: `README.md` - SMTP configuration now optional, updated blog post creation guide, updated troubleshooting
- **Updated**: `DEPLOYMENT-READINESS.md` - SMTP optional, forms use mailto by default, updated dates
- **Updated**: `PRE-LAUNCH-REVIEW.md` - Updated review date, removed SMTP requirement, added warranty disclaimer verification
- **Updated**: `CHANGELOG.md` - Added version 2.19.0 entry
- **Deleted**: `REGRESSION-TEST-REPORT.md` - Removed obsolete test report file
- **Deleted**: `TEST-RESULTS-SUMMARY.md` - Removed obsolete test summary file

---

## Version 2.18.0 (November 2025)

### 🔧 SEO & Social Media Improvements

#### Open Graph Tags Enhancement

- **Added Image Dimensions**: Specified `og:image:width` (1200px) and `og:image:height` (630px) for optimal social media preview rendering
- **Added Image Type**: Specified `og:image:type` as `image/jpeg` for better platform compatibility
- **Enhanced Descriptions**: Expanded Open Graph and Twitter descriptions with more compelling, keyword-rich content highlighting key selling points
- **Added Locale Alternate**: Added `og:locale:alternate` for `de_DE` to cover broader German-speaking audience
- **Local Business Metadata**: Added Facebook business contact data tags for better local business integration:
  - Street address, locality, region, postal code, country
  - Phone number and email
- **Twitter Card Enhancement**: Added `twitter:creator` tag for better attribution
- **Improved Titles**: Enhanced OG title to include "Lavanttal" for better local SEO

### 📁 Files Changed

- **Modified**: `index.html` - Enhanced Open Graph tags with image dimensions, enhanced descriptions, local business metadata, and Twitter card improvements

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added version 2.18.0 entry documenting Open Graph improvements
- **Updated**: `README.md` - Enhanced SEO section to mention comprehensive Open Graph implementation

---

## Version 2.17.0 (November 2025)

### 🔧 Content Updates

#### Hero Trust Badges

- **Removed**: "Servicebetrieb vor Ort" badge from hero section trust badges
- **Added**: "Professionelle Fahrzeug Aufbereitung" (Professional Vehicle Detailing) badge to hero section trust badges
- **Reason**: Better highlights the professional vehicle preparation service offered by the dealership

#### Facilities Section Updates

- **Removed**: "Servicebetrieb vor Ort" facility card from facilities showcase section
- **Replaced With**: "Professionelle Fahrzeug Aufbereitung" facility card with new description
  - New description emphasizes professional vehicle detailing services
  - Highlights interior cleaning, exterior polishing, and comprehensive vehicle preparation
  - Better aligns with customer-facing services showcased on the website

### 📁 Files Changed

- **Modified**: `index.html` - Updated hero trust badges, replaced facility card in facilities section

### 🗑️ Content Removed/Altered

- **Removed**: "Servicebetrieb vor Ort" from hero trust badges section
- **Removed**: "Servicebetrieb vor Ort" facility card (title, description, and image alt text)
- **Added**: "Professionelle Fahrzeug Aufbereitung" to hero trust badges section
- **Added**: "Professionelle Fahrzeug Aufbereitung" facility card with new description about professional vehicle detailing services
- **Note**: "Servicebetrieb vor Ort" still mentioned in "Über uns" section feature list and text content (lines 732-735, 1160, 1165, 2774)

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added version 2.17.0 entry documenting hero badges and facilities section updates

---

## Version 2.16.0 (October 2025)

### ✨ New Features

#### Modern Newsletter Design Enhancement

- **Enhanced Newsletter Form**: Complete redesign following October 2025 best practices
  - Modern glassmorphism input fields with backdrop blur effects
  - Real-time email validation with visual feedback
  - Interactive privacy checkbox with custom design and animations
  - Loading states with animated spinner during submission
  - Enhanced error and success messages with icons
  - Improved accessibility with comprehensive ARIA labels and screen reader support
  - Smooth transitions and micro-interactions throughout
- **Dual Newsletter Placement**: Newsletter form now available in two locations:
  - Footer newsletter (existing, enhanced with new design)
  - Contact section newsletter (new) - positioned below "Direkter Termin" appointment booking section
- **Contact Section Integration**: Newsletter subscription seamlessly integrated into contact form container
  - Compact form variant optimized for contact section
  - Newsletter icon with gradient background
  - Header with title and description
  - Visual separator border above newsletter section
  - Responsive design for mobile devices

### 🔧 Improvements

#### Newsletter Functionality

- **Reusable Form Handler**: JavaScript refactored to support multiple newsletter forms with unique IDs
- **Independent Form Operation**: Footer and contact section forms work independently without conflicts
- **Enhanced Validation**: Real-time validation for both email format and privacy checkbox acceptance
- **Better User Experience**: Clear visual feedback, smooth animations, and improved error handling
- **Accessibility Enhancements**:
  - Proper form labels and ARIA attributes
  - Screen reader support with `.sr-only` classes
  - Keyboard navigation support
  - Focus management and announcements

#### Visual Design Improvements

- **Modern Input Design**: 2px borders, backdrop blur, improved hover and focus states
- **Custom Checkbox**: Animated checkbox with checkmark animation
- **Button Enhancements**: Loading spinner, improved hover effects, better visual feedback
- **Status Messages**: Icon-based success/error messages with smooth slide-down animations
- **Mobile Optimization**: Better spacing, font sizes, and layout on mobile devices

### 📁 Files Changed

- **Modified**: `index.html` - Enhanced footer newsletter form with modern design, added newsletter section to contact form container
- **Modified**: `styles.css` - Complete newsletter styling overhaul with modern 2025 design patterns, added contact newsletter section styles
- **Modified**: `scripts.js` - Refactored `initNewsletter()` to support multiple forms with parameter-based ID generation, added dual initialization

### 🗑️ Content Removed/Altered

- **Altered**: Newsletter disclaimer changed from text-only to interactive checkbox with required indicator
- **Altered**: Newsletter form description enhanced with more compelling copy
- **Altered**: Newsletter input placeholder changed from "Ihre E-Mail-Adresse" to "ihre.email@beispiel.de"
- **Preserved**: All existing newsletter functionality maintained, enhanced with new features

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added version 2.16.0 entry with newsletter enhancements
- **Updated**: `README.md` - Added modern newsletter design features to feature list
- **Removed**: Obsolete test result markdown files (NEWSLETTER-QA-TEST-RESULTS.md, SMOKE-TEST-RESULTS.md, etc.)

---

## Version 2.15.0 (October 2025)

### ✨ New Features

#### WhatsApp-Focused Contact Options

- **Removed Contact Form**: Replaced "Anfrage senden" contact form with modern contact options card to eliminate spam
- **WhatsApp Primary Action**: Large, prominent WhatsApp button with official green gradient (#25D366 to #128C7E)
- **Pre-filled WhatsApp Message**: WhatsApp link includes pre-filled message for quick communication
- **Contact Options Grid**: Three contact methods displayed as interactive cards:
  - WhatsApp Chat (primary) - Green gradient button with icon and description
  - Phone Call - Direct click-to-call functionality
  - Email - Mailto link for formal inquiries
- **Modern Card Design**: Each contact option features icon, title, description, and hover arrow animation
- **Magnetic Button Effects**: All contact options include magnetic hover effects for better interactivity

#### Mobile Responsiveness Improvements

- **Trade-in Modal Mobile Optimization**:
  - Full-screen modal on mobile (100vh) with no padding
  - Reduced spacing throughout (header, body, form fields)
  - Single-column layout for form fields
  - iOS zoom prevention (16px font-size)
  - Overflow control to prevent horizontal scrolling
  - Touch-optimized scrolling with momentum
- **Sticky CTA Button Mobile Enhancement**:
  - Increased button size: 64px × 64px (was 56px) on mobile
  - Larger icon: 28px × 28px (was 20px) - 40% larger for better visibility
  - Modern design with radial gradient overlay and multi-layer shadows
  - Subtle pulse animation (3s loop) for better visibility
  - Enhanced touch targets meeting WCAG guidelines
  - Smooth micro-interactions with icon rotation on hover

### 🔧 Improvements

#### Contact Section Layout

- **Compact Spacing**: Reduced vertical spacing throughout contact section:
  - Container padding: 2rem → 1.5rem (-25%)
  - Form title margin: 2rem → 1.25rem (-37.5%)
  - Form gaps: 1.5rem → 1rem (-33%)
  - Input padding optimized for better density
  - Textarea min-height set to 100px (reduced from rows="5")
- **Appointment CTA Spacing**: Reduced margins and padding for better flow:
  - Top margin: 2.5rem → 1.5rem (-40%)
  - Content padding: 2.5rem 2rem → 1.75rem 1.5rem (-30%)
  - Gap between elements: 1.5rem → 1rem (-33%)
- **Contact Actions**: Reduced spacing between buttons for more compact layout

#### Magnetic Button Reliability

- **Enhanced Animation System**:
  - Added `isHovering` flag for better state management
  - Unified animation logic with proper frame cancellation
  - Improved `mouseenter`/`mouseleave` handlers to prevent race conditions
  - Smooth return animations when mouse leaves button area

### 📁 Files Changed

- **Modified**: `index.html` - Replaced contact form with WhatsApp-focused contact options, preserved appointment booking section
- **Modified**: `styles.css` - Added contact options styles, mobile responsiveness improvements for trade-in modal and sticky CTA, compact spacing adjustments
- **Modified**: `scripts.js` - Enhanced magnetic button animation system with better state management

### 🗑️ Content Removed/Altered

- **Removed**: "Anfrage senden" contact form (name, email, phone, message fields, privacy checkbox, submit button)
- **Removed**: Contact form JavaScript validation and submission logic (preserved in codebase but form no longer exists)
- **Altered**: Contact section title changed from "Anfrage senden" to "Kontakt aufnehmen"
- **Altered**: Contact method changed from form submission to direct communication channels (WhatsApp, Phone, Email)
- **Preserved**: "Direkter Termin" appointment booking section remains fully intact and functional

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added version 2.15.0 entry with all changes
- **Updated**: `README.md` - Changed contact form feature to WhatsApp-focused contact options
- **Note**: Contact API endpoint (`api/contact.js`) still exists but is no longer used by the frontend

---

## Version 2.14.0 (October 2025)

### 🔧 Navigation & UI Improvements

#### Navigation Menu Simplification

- **Removed Menu Items**: Removed "FAQ" and "Impressum" from main navigation menu for cleaner, more focused navigation
- **Footer Navigation**: Removed "FAQ" from footer navigation links
- **Fixed Text Wrapping**: Added `white-space: nowrap` to navigation links to prevent "Über uns" from breaking across lines

#### Trust Badges Updates

- **Removed Extended Section**: Removed entire `trust-badges-extended` section (Zertifizierungen & Garantie, Finanzierungspartner) from hero area
- **Updated Hero Trust Badges**: Replaced generic badges with more relevant, service-focused badges:
  - ✅ "Geprüfte Fahrzeuge" (kept)
  - ✅ "12 Monate Garantie" (replaced "Sicher & Zuverlässig")
  - ✅ "Finanzierung möglich" (replaced "Sichere Zahlung")
  - ✅ "Inzahlungnahme" (replaced "Kompetente Beratung")

#### Hero Background Enhancements

- **Reduced Static Blur**: Removed base blur from hero background overlay for clearer image visibility
- **Animation-Only Blur**: Changed to animation-only blur effect that pulses from 0px to 5px for subtle dynamic effect
- **Improved Image Visibility**: Background image now clearer with minimal blur for better visual impact

### 📊 Content Updates

#### Statistics Section

- **Updated Stat**: Changed "300 Verkaufte Fahrzeuge" to "900+ Zufriedene Kunden" (Satisfied Customers) with updated icon
- **More Relevant Metric**: Customer satisfaction stat provides better social proof than sales numbers

#### Text Content Improvements

- **Hero Subheadline**: Updated from "Ihr vertrauensvoller Autohandel in Wolfsberg, Kärnten" to "Ihr vertrauensvoller Partner für geprüfte Gebrauchtwagen"
- **Footer Text**: Updated to "Ihr vertrauensvoller Partner für geprüfte Gebrauchtwagen. Faire Preise, kompetente Beratung."

### 🛠️ Development Improvements

#### Local Development Server

- **Fixed Dev Script**: Changed `npm run dev` from `vercel dev` to `npx serve . -l 3000` to avoid recursive invocation issue
- **Added Vercel Dev Alternative**: Added `dev:vercel` script for running Vercel development server when needed

### 📁 Files Changed

- **Modified**: `index.html` - Navigation menu simplification, trust badges updates, statistics update, content text updates
- **Modified**: `styles.css` - Navigation link styling (white-space), hero background blur adjustments, removed trust-badges-extended styles
- **Modified**: `package.json` - Updated dev script configuration

### 🗑️ Content Removed/Altered

- **Removed**: FAQ and Impressum links from main navigation menu
- **Removed**: FAQ link from footer navigation
- **Removed**: Entire `trust-badges-extended` section with certifications and financing partners
- **Altered**: Trust badges in hero section - replaced 3 generic badges with service-specific ones
- **Altered**: Statistics - changed from "Verkaufte Fahrzeuge" to "Zufriedene Kunden"

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added version 2.14.0 entry with all improvements and changes

---

## Version 2.13.0 (October 2025)

### ✨ New Features

#### Testimonials Section - Modern Redesign

- **Enhanced Container Design**: Gradient background with subtle brand color accents, decorative top border, and improved hover effects
- **Modern Google Reviews Badge**: Enhanced glassmorphism with shimmer animation, gradient text, larger sizing, and animated Google icon
- **Beautiful Testimonial Cards**: Decorative watermark quote mark, improved glassmorphism, enhanced shadows, and smooth hover animations
- **Enhanced Typography**: Gradient text for title, drop cap styling for testimonial text, improved text hierarchy and spacing
- **Modern Avatar Design**: Larger avatars (72px) with enhanced shadows, brand color glow effects, and white border
- **Gradient Star Ratings**: Beautiful gold gradient effect on star ratings with drop shadows
- **Improved Slider Controls**: Larger, more prominent navigation buttons with glassmorphism and smooth hover animations
- **Enhanced Navigation Dots**: Pill-shaped active state, brand-colored glow effects, and smooth transitions

### 🎨 Design Improvements

#### Visual Enhancements

- **Better Visual Hierarchy**: Improved spacing, typography scales, and layout structure
- **Modern Color Accents**: Enhanced use of brand colors throughout testimonials section
- **Smooth Animations**: Improved transitions and hover effects throughout
- **Better Spacing**: Enhanced padding, margins, and content organization
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop with adaptive sizing

#### User Experience

- **Enhanced Readability**: Better text alignment (left-aligned for better reading flow), improved line heights
- **Better Card Layout**: Author section with divider, improved testimonial text presentation
- **Modern Interactions**: Smooth hover effects, scale animations, and visual feedback

### 📁 Files Changed

- **Modified**: `styles.css` - Complete testimonials section redesign (lines 3492-4208) with modern styling, animations, and responsive breakpoints

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` - Added version 2.13.0 entry with testimonials redesign details

---

## Version 2.12.0 (October 2025)

### ✨ New Features

#### Testimonials Section Enhancements

- **Compact Container Design**: Reduced padding and margins for a more streamlined testimonials container layout
- **Full-Width Testimonial Cards**: Cards now span full container width instead of being limited to 800px max-width
- **Fixed Height Cards**: All testimonial cards now have a fixed height of 320px to prevent size changes with varying text length
- **Improved Visual Consistency**: Enhanced spacing and typography for better visual harmony

### 🔧 Improvements

#### Statistics Updates

- **Years of Experience**: Updated from "10+ Jahre Erfahrung" to "15+ Jahre Erfahrung"
- **Vehicles Sold**: Updated from "500+ Verkaufte Fahrzeuge" to "300+ Verkaufte Fahrzeuge"

#### About Section Features

- **New Feature Added**: Added "Professionelle Fahrzeug Aufbereitung" (Professional Vehicle Detailing) to the features list with checkmark

### 📁 Files Changed

- **Modified**: `styles.css` - Updated testimonials container spacing, made cards full-width with fixed height (lines 3482-3590, 3686-3695)
- **Modified**: `index.html` - Updated statistics values, added new feature item to features list

### 📚 Documentation Updates

- **Updated**: `SMOKE-TEST-RESULTS.md` - Updated statistics values in test results to match current implementation

---

## Version 2.11.0 (October 2025)

### ✨ New Features

#### Phase 6.4: Mobile Experience Enhancements

- **Swipe Gestures for Testimonials**: Added touch swipe support (left/right) to navigate testimonials slider with 50px minimum swipe distance recognition
- **Touch Feedback for Cards**: Enhanced vehicle card interactions with visual touch feedback using `touch-active` class
- **Swipe-to-Close Mobile Menu**: Implemented swipe right gesture (100px threshold) to close mobile navigation menu
- **Enhanced Mobile Touch Interactions**: Removed tap highlight colors, added `touch-action: manipulation` to prevent accidental zoom
- **Optimized Mobile Navigation**: Larger touch targets (minimum 44px) for all interactive elements (iOS recommended size)
- **Mobile Image Loading Optimization**: Enhanced image rendering properties and progressive loading for smoother mobile experience
- **Mobile Card Interactions**: Improved touch feedback with active states, scale transforms, and better button sizes (44px minimum)

### 🔧 Performance Improvements

#### Mobile Optimizations

- **Touch Target Sizes**: All buttons, links, and interactive elements now meet 44px minimum touch target size for better accessibility
- **Form Input Optimization**: Set font-size to 16px on mobile to prevent iOS zoom on input focus
- **Image Rendering**: Optimized `image-rendering` properties for better mobile display
- **Touch Event Optimization**: Added passive event listeners where appropriate for better scroll performance

### 📁 Files Changed

- **Modified**: `scripts.js` - Added swipe gestures for testimonials slider, touch feedback for vehicle cards, swipe-to-close for mobile menu
- **Modified**: `styles.css` - Added mobile experience enhancements (lines 7776-7939): touch interactions, larger targets, image optimization, form inputs, modal enhancements

### 📚 Documentation Updates

- **Added**: `IMPLEMENTATION-STATUS.md` - Implementation status tracking document
- **Added**: `ENHANCEMENT-PLAN-STATUS.md` - Comprehensive comparison against enhancement plan
- **Added**: `DEPLOYMENT-READINESS.md` - Production deployment checklist and security audit
- **Updated**: `README.md` - Added mobile experience enhancements to feature list
- **Updated**: `CHANGELOG.md` - Added version 2.11.0 entry with Phase 6.4 enhancements

---

## Version 2.10.0 (October 2025)

### ✨ New Features

#### SEO Enhancements

- **Sitemap.xml**: Created XML sitemap with all main sections and blog posts for search engine indexing
- **Robots.txt**: Added robots.txt file to guide search engine crawling (blocks API endpoints, references sitemap)
- **FAQPage Schema**: Added FAQPage structured data with all 8 FAQ questions and answers for rich snippets
- **BreadcrumbList Schema**: Added BreadcrumbList structured data for better navigation understanding

### 🔧 Performance Improvements

#### Resource Loading Optimizations

- **CSS Preloading**: Added `<link rel="preload">` for critical CSS to start downloading earlier
- **DNS Prefetch**: Added DNS prefetch hints for Google Maps domains to speed up iframe loading
- **Logo Image Priority**: Added `fetchpriority="high"` and `decoding="async"` to logo image for faster initial render
- **Client Hints**: Added `Accept-CH` header for optimized resource selection based on device capabilities
- **Code Cleanup**: Removed redundant JavaScript-based preloading code (moved to HTML head for better timing)

### 📁 Files Changed

- **Added**: `sitemap.xml` - XML sitemap for search engines
- **Added**: `robots.txt` - Search engine crawling directives
- **Added**: `TESTING-VALIDATION.md` - Comprehensive testing validation report
- **Modified**: `index.html` - Added CSS preload, DNS prefetch hints, logo image optimization, FAQPage and BreadcrumbList structured data
- **Modified**: `scripts.js` - Removed redundant font preloading code (now handled in HTML head)
- **Modified**: `vercel.json` - Added `Accept-CH` header for client hints

### 📚 Documentation Updates

- **Updated**: `README.md` - Added new performance optimizations and SEO enhancements to feature list
- **Updated**: `CHANGELOG.md` - Added version 2.10.0 entry with all enhancements

---

## Version 2.9.0 (January 2025)

### 🔧 Improvements

#### Fahrzeuge Section Enhancement

- **Priority Sorting**: When viewing "Alle" Fahrzeuge with default sorting, vehicles with "Top Angebot" tag (price < €15,000) now appear first automatically
- **Better User Experience**: Users see best deals at the top while still viewing all vehicles
- **Smart Default**: No manual filter selection needed - best offers are prioritized by default

### 🗑️ Removed

#### Featured Vehicles Section

- **Removed Redundant Section**: Featured Vehicles / Highlight-Fahrzeuge section has been removed from the main page
- **Functionality Merged**: Top offers now automatically appear first in main Fahrzeuge section via priority sorting
- **Archived for Future**: Section code preserved in `sections/archive/featured-vehicles-section.html` for potential future use

### 📁 Files Changed

- **Modified**: `index.html` – Removed Featured Vehicles section HTML
- **Modified**: `scripts.js` – Added priority sorting logic in `getFilteredAndSortedVehicles()` function; commented out `loadFeaturedVehicles()` and `initVehicleFilters()` calls (functions preserved for potential restoration)
- **Added**: `sections/archive/featured-vehicles-section.html` – Archived section HTML with documentation for future reference

### 📚 Documentation Updates

- **Updated**: `CHANGELOG.md` – Added version 2.9.0 entry
- **Updated**: `README.md` – Removed references to featured vehicles section in customization instructions
- **Updated**: `PROJECT-SUMMARY.md` – Removed references to Featured Vehicles section

---

## Version 2.8.0 (March 2025)

### ✨ New Features

- **Progressive Images (Blur‑up)**: Progressive loading for vehicle and blog images for faster perceived performance
- **Skeleton Loading**: Vehicle card skeletons displayed while data is loading

### 🔧 Improvements

- Progressive images now initialize on initial page load and after dynamic renders (featured + paginated vehicles)
- Graceful empty state shown if vehicle API is unavailable when using a static server locally

### 📁 Files Changed

- **Modified**: `scripts.js` – Added `initProgressiveImages()`, skeleton helpers, integrated into load flows
- **Modified**: `styles.css` – Added skeleton styles and progressive image blur-up transitions

---

## Documentation Update (March 2025)

### 📚 Documentation Updates

- **Updated all documentation files** to reflect current state (v2.7.0)
- **Removed obsolete references** to GSAP and tsParticles from current features (removed in v2.0.0)
- **Added Puppeteer documentation**: Documented puppeteer-core and @sparticuz/chromium dependencies used for vehicle data scraping
- **Fixed date inconsistencies**: Corrected "October 2025" to "October 2024" in version history
- **Updated tech stack documentation**: Clarified that animations use native CSS (no external libraries)
- **Enhanced dependency information**: Added backend dependencies section with Puppeteer details

### 📁 Files Changed

- **Modified**: `README.md` - Added Puppeteer dependency info, corrected dates, updated feature list
- **Modified**: `PROJECT-SUMMARY.md` - Removed GSAP references, added Puppeteer to tech stack, updated animation customization section
- **Modified**: `ASSETS-GUIDE.md` - Noted removal of animation assets in v2.0.0
- **Modified**: `automation-guidance.md` - Updated header, noted removal of animation features
- **Modified**: `CHANGELOG.md` - Fixed dates, added this documentation update entry

### 🗑️ Content Removed/Altered

- **Removed**: References to GSAP library in current feature descriptions (kept historical context)
- **Removed**: References to tsParticles in current tech stack (kept historical context)
- **Removed**: Instructions for modifying GSAP animation durations (replaced with CSS animation instructions)
- **Altered**: "Built with" sections now list native CSS animations instead of GSAP
- **Altered**: Animation customization guide now references CSS instead of JavaScript/GSAP

---

## Version 2.7.0 (March 2025)

### ✨ New Features

#### FAQ Section

- **FAQ Accordion**: New dedicated FAQ section with 8 frequently asked questions
- **Accordion Functionality**: Expand/collapse questions with smooth animations
- **8 FAQ Items Covering**:
  - Payment options and financing
  - Warranty information
  - Trade-in process
  - Probefahrt (test drive) duration
  - Vehicle inspections
  - Vehicle list updates
  - Required documents for purchase
  - Vehicle delivery options
- **Interactive Design**: Click-to-expand questions with icon rotation animation
- **Responsive Layout**: Fully responsive accordion design matching site's glassmorphism aesthetic
- **Accessibility**: ARIA attributes and keyboard navigation support

### 🔧 Improvements

- **CSS Fixes**: Fixed pointer-events CSS to ensure FAQ questions are clickable
- **Animation Smoothness**: Enhanced accordion expand/collapse transitions
- **User Experience**: Only one FAQ item open at a time for better focus

### 📁 Files Changed

- **Modified**: `index.html` - Added FAQ section HTML structure with 8 accordion items after Process section
- **Modified**: `styles.css` - Added comprehensive FAQ accordion styles with animations and pointer-events fixes
- **Modified**: `scripts.js` - Added `initFAQ()` function for accordion functionality and integrated into main initialization

---

## Version 2.6.0 (March 2025)

### ✨ New Features

#### Dedicated API Endpoints

- **Newsletter API Endpoint**: Created `/api/newsletter` serverless function for newsletter subscription handling
  - Email validation and sanitization
  - Rate limiting (3 subscriptions per hour per IP)
  - Sends notification email to business
  - Sends confirmation email to subscriber with welcome message
  - Professional HTML email templates with brand colors
  - Double opt-in support with signed confirmation tokens
- **Newsletter Confirmation Endpoint**: Created `/api/newsletter-confirm` serverless function for double opt-in confirmation
  - HMAC-SHA256 token verification for security
  - 24-hour token expiration
  - User-friendly confirmation page with styled HTML response
  - Security protection against unauthorized confirmations
- **Appointment API Endpoint**: Created `/api/appointment` serverless function for appointment booking handling
  - Comprehensive form validation (name, email, phone, date, time, service)
  - Date validation (must be in the future)
  - Rate limiting (5 appointments per hour per IP)
  - Sends notification email to business with appointment details
  - Sends confirmation email to customer with appointment summary
  - Professional HTML email templates with appointment details

### 🔧 Improvements

- **JavaScript Updates**: Updated newsletter and appointment booking JavaScript to use dedicated API endpoints instead of generic contact endpoint
- **Better Error Handling**: Improved error messages and validation for both endpoints
- **Email Templates**: Enhanced email templates with better formatting and brand consistency
- **Code Organization**: Better separation of concerns with dedicated endpoints

### 📁 Files Changed

- **Added**: `api/newsletter.js` - Newsletter subscription API endpoint
- **Added**: `api/newsletter-confirm.js` - Newsletter double opt-in confirmation API endpoint
- **Added**: `api/appointment.js` - Appointment booking API endpoint
- **Modified**: `scripts.js` - Updated to use `/api/newsletter` and `/api/appointment` endpoints
- **Modified**: `README.md` - Updated changelog with new API endpoints
- **Modified**: `CHANGELOG.md` - Added version 2.6.0 entry

---

## Version 2.5.0 (March 2025)

### ✨ New Features

#### Newsletter Subscription

- **Footer Newsletter Form**: Newsletter subscription form integrated into footer section
- **Email Validation**: Client-side and server-side email validation
- **Success/Error Messages**: User-friendly status messages for form submission
- **Privacy Compliance**: Link to privacy policy and GDPR compliance

#### Appointment Booking System

- **Appointment Modal**: Full-featured appointment booking modal accessible from contact section
- **Date/Time Selection**: Date picker with minimum date validation and time dropdown with 30-minute intervals
- **Service Selection**: Dropdown for appointment type (Beratung, Probefahrt, Finanzierungsberatung, etc.)
- **Form Validation**: Comprehensive validation for all required fields
- **Optional Fields**: Vehicle and message fields for additional context
- **Reset Functionality**: Form reset button to clear all fields

### 🔧 Improvements

- **Modal UX**: Smooth modal open/close animations with backdrop click and ESC key support
- **Responsive Design**: Appointment booking modal fully responsive for mobile devices
- **Form UX**: Loading states, disabled buttons during submission, success/error feedback

### 📁 Files Changed

- **Modified**: `index.html` - Added newsletter form to footer and appointment booking modal
- **Modified**: `styles.css` - Added styles for newsletter form and appointment booking modal
- **Modified**: `scripts.js` - Added `initNewsletter()` and `initAppointmentBooking()` functions

---

## Version 2.4.0 (February 2025)

### ✨ New Features

#### Trade-in Calculator

- **Trade-in Modal**: Interactive modal for calculating trade-in vehicle value
- **Vehicle Details Input**: Year, make, model, mileage, condition selection
- **Value Estimation**: Dummy calculation logic providing estimated trade-in value range
- **Form Integration**: Option to send trade-in details via contact form

---

## Version 2.3.0 (January 2025)

### ✨ New Features

#### Process Section

- **Buying Process Guide**: New dedicated section between Services and "Über uns" sections
- **5-Step Process Flow**:
  1. Fahrzeug finden (Find Vehicle)
  2. Kostenlose Beratung (Free Consultation)
  3. Finanzierung klären (Arrange Financing)
  4. Fahrzeug prüfen (Inspect Vehicle)
  5. Fahrzeugübergabe (Vehicle Handover)
- **Visual Step Indicators**: Numbered badges above each step card
- **Interactive Design**: Hover effects with card lift, icon animations
- **CTA Integration**: "Jetzt Termin vereinbaren" button linking to contact section
- **Responsive Layout**: Single-column on mobile, multi-column grid on desktop

#### Team Section (Enhanced Über uns)

- **Team Member Cards**: Profile cards for team members
- **Featured Team Member**: Sami Shabani (Geschäftsführer) with bio and contact email
- **Expert Team Card**: Placeholder card for additional team members
- **Circular Profile Photos**: Placeholder avatars with brand-colored borders
- **Responsive Grid Layout**: Flexible team member display

#### Facilities Section (Enhanced Über uns)

- **Facility Showcase Cards**: Three facility highlights:
  - Große Ausstellungsfläche (500m² exhibition space)
  - Professionelle Fahrzeug Aufbereitung (Professional Vehicle Detailing - replaces "Servicebetrieb vor Ort")
  - Gut erreichbar in Wolfsberg (Central location with directions link)
- **Image Placeholders**: Ready for real facility photos
- **Interactive Cards**: Hover effects with image zoom on facility cards
- **Facility Labels**: Overlay labels on facility images

### 🔧 Improvements

- **Enhanced "Über uns" Section**: Added team and facilities subsections
- **Visual Consistency**: All new sections follow glassmorphism design system
- **Mobile Responsiveness**: All sections fully responsive with single-column layouts on mobile
- **CSS Optimization**: Added process, team, and facilities section styles with hover effects

### 📁 Files Changed

- **Modified**: `index.html` - Added process section, team section, and facilities section HTML structure
- **Modified**: `styles.css` - Added CSS for process section (steps, connectors, icons), team section (member cards, photos), facilities section (image cards, overlays), and responsive breakpoints
- **Modified**: `styles.css` - Centered iframe controls (user modification)

---

## Version 2.2.0 (January 2025)

### ✨ New Features

#### Services Section

- **Services Showcase**: New dedicated section between Blog and "Über uns" sections
- **Four Service Cards**:
  - Fahrzeuginspektion (Vehicle Inspection) - Technical inspection, accident-free check, condition assessment
  - Garantie & Service (Warranty & Service) - 12 months warranty, on-site service, parts & maintenance
  - Finanzierung (Financing) - Flexible financing options, favorable interest rates, quick approval
  - Inzahlungnahme (Trade-in) - Fair evaluation, quick processing, direct credit
- **Interactive Design**: Hover effects with card lift, icon animations, gradient top border on hover
- **Responsive Layout**: Single-column on mobile, multi-column grid on desktop
- **Service Links**: CTAs linking to contact form and financing calculator

#### Enhanced Blog

- **Category Navigation**: Filter blog posts by category (All, Ratgeber, Kaufberatung, Trends, Wartung)
- **Improved Blog Cards**: Enhanced design with read-time badges (e.g., "5 Min. Lesezeit")
- **Category Filtering**: Smooth transitions when filtering blog posts

#### Additional Enhancements

- **Fixed Checkmark Display**: Removed duplicate checkmarks in service features (CSS provides single checkmark via ::before)
- **Enhanced Modal Interactions**: Improved vehicle inquiry and financing calculator integration

### 🔧 Improvements

- **Mobile Responsiveness**: Services section fully responsive with single-column layout on mobile devices
- **Visual Polish**: Icon animations, gradient borders, and smooth hover transitions
- **Accessibility**: Proper semantic HTML structure and ARIA labels for service cards

### 📁 Files Changed

- **Modified**: `index.html` - Added services section HTML structure with 4 service cards
- **Modified**: `styles.css` - Added comprehensive CSS for services section (grid layout, card styles, hover effects, responsive breakpoints)
- **No changes**: `scripts.js` - Services section works with existing interactions (magnetic buttons, smooth scroll)

---

## Version 2.1.0 (January 2025)

### ✨ New Features

#### Hero & Visual Design

- **Enhanced Hero Section**: Animated gradient backgrounds, trust badges, improved CTAs
- **Visual Design Polish**: Sophisticated multi-color gradients, enhanced shadows, refined typography
- **Button Interactions**: Enhanced magnetic effects, loading states, micro-interactions

#### Vehicle Features

- **Quick View Modal**: Fast preview of vehicle details without leaving the page
- **Vehicle Comparison Tool**: Compare up to 3 vehicles side-by-side in a modal table
- **Financing Calculator**: Interactive loan calculator with sliders for downpayment and term
- **Vehicle Filtering & Sorting**: Filter by category (All, Top Offers, New, Price Reduced) and sort by price, year, mileage
- **Share Functionality**: Share individual vehicles via social media or direct link
- **Enhanced Vehicle Cards**: Image gallery indicators, fuel badges, comparison checkboxes

#### Trust & Credibility

- **Trust Badges Section**: SSL, security certifications, warranty badges, financing partner logos
- **Enhanced Testimonials**: Customer avatars, dates, video support, real Google Reviews integration
- **Enhanced Statistics**: Animated counters, gradient text, SVG icons (500+ vehicles, 10+ years, 450+ customers, 4.9 rating)

#### Vehicle Data Integration

- **Dynamic Vehicle Data**: Real-time vehicle listings from motornetzwerk.at iframe source
- **API Endpoint**: `/api/vehicles` serverless function extracts and serves vehicle data
- **Automatic Sync**: Vehicle data refreshes daily with 1-hour caching

### 🔧 Improvements

- **Real Vehicle Listings**: Displays actual cars from dealership inventory automatically
- **Data Extraction**: Parses vehicle details (price, year, mileage, fuel type, power, transmission, images)
- **Error Handling**: Graceful fallback if API fails
- **Glassmorphism Effects**: Enhanced blur and border effects throughout the site
- **Form Validation**: Real-time feedback and improved error displays
- **Local Storage**: Filter and comparison preferences persist across sessions

### 📁 Files Changed

- **Added**: `api/vehicles.js` - Vehicle data fetching API endpoint
- **Modified**: `scripts.js` - Vehicle loading, comparison, financing calculator, filtering, quick view, share modal
- **Modified**: `index.html` - Enhanced hero, trust badges, testimonials, statistics, vehicle cards, modals
- **Modified**: `styles.css` - Visual polish, gradients, animations, modal styles, enhanced components

---

## Version 2.0.0 (October 2024)

### ✨ New Features

- **Vehicles API Endpoint**: Added `/api/vehicles` serverless function to dynamically fetch and display vehicle listings from motornetzwerk.at
- **Dynamic Vehicle Loading**: Featured vehicles section now loads data from API instead of static HTML
- **Simplified Search Interface**: Removed tab navigation, now shows "Vollständige Suche" iframe directly
- **Console Error Filtering**: Aggressive filtering to suppress external iframe errors from motornetzwerk.at

### 🔧 Improvements

- **Native CSS Animations**: Replaced GSAP with pure CSS transitions and animations
- **Performance Optimizations**: Removed ~150KB of external dependencies (GSAP, tsParticles)
- **Faster Loading**: Hardware-accelerated CSS animations replace library dependencies
- **Better Code Maintainability**: Removed unused code and simplified architecture
- **Vehicle Data Caching**: 1-hour cache on vehicles API to reduce external requests

### 🗑️ Removed

- **GSAP Library**: Replaced with native CSS animations
- **tsParticles**: Removed particle background system
- **Tab Navigation**: Simplified search to single iframe
- **Loading Screen**: Removed complex loading animations
- **Unused Dependencies**: Cleaned up dead code and comments

### 🐛 Fixed

- **Console Errors**: Suppressed external iframe errors
- **Navigation Links**: Fixed smooth scroll functionality
- **Performance**: Improved initial page load time

### 📁 Files Changed

- **Added**: `api/vehicles.js` - Vehicle data fetching API endpoint
- **Modified**: `scripts.js` - Removed GSAP, added vehicle loading from API, CSS animations
- **Modified**: `index.html` - Removed GSAP/tsParticles scripts, simplified iframe structure
- **Modified**: `styles.css` - Enhanced CSS animations to replace GSAP functionality

---

## Version 1.1 (October 2024)

### 🎨 New Features Added

#### Supercar Loading Animation

- **Added**: Electric arc SVG animation that draws a supercar on page load
- **Replaces**: Previous electric arc logotype animation
- **Location**: `index.html` loading screen section
- **Implementation**: GSAP timeline with stroke-dasharray animation
- **Files Modified**: `index.html`, `scripts.js`

#### tsParticles Integration

- **Added**: Interactive particle background system
- **Library**: tsParticles 2.12.0 via CDN
- **Features**: Mouse interaction, responsive particles, brand color integration
- **Performance**: Lightweight, optimized for mobile devices
- **Files Modified**: `index.html`, `scripts.js`

#### Real Testimonials Integration

- **Added**: Authentic Google reviews from customers
- **Source**: Real testimonials from Google Business Profile
- **Implementation**: Testimonials slider with GSAP animations
- **Content**: German language, local Kärnten customers
- **Files Modified**: `index.html`

### 🔧 Modifications Made

#### Dark Mode Behavior

- **Updated**: Site now loads in light mode by default
- **Previous**: Loaded in dark mode
- **Implementation**: CSS and JavaScript updated to default to light theme
- **Files Modified**: `styles.css`, `scripts.js`

#### Custom Cursor Removal

- **Removed**: Custom cursor functionality
- **Reason**: User explicitly requested no custom cursor
- **Impact**: Improved accessibility and performance
- **Files Modified**: `scripts.js`

#### Project Structure Updates

- **Updated**: File organization to reflect new structure
- **Added**: New configuration files (`package.json`, `vercel.json`, `.gitignore`)
- **Added**: New documentation files (`ASSETS-GUIDE.md`, `PROJECT-SUMMARY.md`)
- **Updated**: Blog posts now in markdown format (`.md` instead of `.html`)

### 📚 Documentation Updates

#### README.md

- **Added**: New features to feature list
- **Updated**: Project structure to reflect new files
- **Enhanced**: Customization guide with new features
- **Added**: Supercar animation and tsParticles documentation

#### automation-guidance.md

- **Added**: Version 1.1 update notice
- **Added**: Change log section
- **Updated**: Project structure references
- **Enhanced**: Webhook payloads for new features

#### ASSETS-GUIDE.md

- **Added**: Supercar animation asset requirements
- **Added**: tsParticles integration specifications
- **Updated**: Project structure documentation
- **Added**: Change log section

#### PROJECT-SUMMARY.md

- **Added**: Version 1.1 update notice
- **Updated**: Feature descriptions to reflect new capabilities
- **Added**: Change log section
- **Enhanced**: Technical specifications

### 🗂️ New Files Created

#### Configuration Files

- **package.json**: Node.js dependencies and scripts
- **vercel.json**: Vercel deployment configuration
- **.gitignore**: Git ignore rules for Node.js/Vercel projects

#### Documentation Files

- **ASSETS-GUIDE.md**: Complete guide for required images and assets
- **PROJECT-SUMMARY.md**: Comprehensive project overview
- **CHANGELOG.md**: This change log file

#### Blog Content

- **posts/reifenwechsel.md**: Winter tire change guide (markdown)
- **posts/gebrauchtwagen-kaufen.md**: Used car buying guide (markdown)
- **posts/elektromobilitaet.md**: E-mobility guide (markdown)

### 🔄 Files Modified

#### Core Website Files

- **index.html**: Added supercar animation, tsParticles, real testimonials
- **styles.css**: Updated dark mode defaults, enhanced animations
- **scripts.js**: Added supercar animation, tsParticles, removed custom cursor

#### Documentation Files

- **README.md**: Updated features and project structure
- **automation-guidance.md**: Added change log and version updates
- **ASSETS-GUIDE.md**: Added new asset requirements and change log
- **PROJECT-SUMMARY.md**: Updated feature descriptions and added change log

### 🚀 Performance Improvements

#### Animation Optimization

- **Enhanced**: GSAP animations for better performance
- **Added**: Lazy loading for particle system
- **Optimized**: Supercar SVG animation for faster load times

#### Code Quality

- **Improved**: JavaScript organization and comments
- **Enhanced**: CSS structure and maintainability
- **Added**: Better error handling and fallbacks

### 🎯 User Experience Enhancements

#### Visual Improvements

- **Added**: More engaging loading experience with supercar animation
- **Enhanced**: Interactive particle background for visual appeal
- **Improved**: Real testimonials for better credibility

#### Accessibility

- **Removed**: Custom cursor for better accessibility
- **Maintained**: All existing accessibility features
- **Enhanced**: Keyboard navigation and screen reader support

### 📱 Mobile Experience

#### Responsive Design

- **Enhanced**: Mobile-first approach maintained
- **Optimized**: Particle system for mobile performance
- **Improved**: Touch interactions and gestures

#### Performance

- **Optimized**: Loading times on mobile devices
- **Reduced**: JavaScript bundle size
- **Enhanced**: Battery life considerations

---

## Version 1.0 (October 2024)

### 🎉 Initial Release

#### Core Features

- **Modern glassmorphism design** with brand color (#1b8e2d)
- **Responsive mobile-first** layout
- **GSAP animations** throughout the site
- **Dark/light mode toggle** with localStorage persistence
- **Contact form** with Vercel serverless backend
- **SEO optimization** with structured data and meta tags
- **Local Kärnten focus** with German language content

#### Technical Implementation

- **HTML5, CSS3, Vanilla JavaScript** (no frameworks)
- **GSAP 3.12.5** for animations
- **Vercel serverless functions** for backend
- **Nodemailer** for email delivery
- **Mobile-first responsive design**

#### Content

- **Real company data** (DirektOnline BS GmbH)
- **Authentic contact information** and addresses
- **German language** throughout
- **Local SEO keywords** (Wolfsberg, Lavanttal, Kärnten)
- **Sample blog posts** in German

#### Documentation

- **Comprehensive README.md** with deployment guide
- **Automation guidance** for n8n/Zapier integration
- **Complete project documentation**

---

## 📊 Summary of Changes

### Additions

- ✅ Supercar loading animation
- ✅ tsParticles integration
- ✅ Real testimonials integration
- ✅ New documentation files
- ✅ Configuration files
- ✅ Change log tracking

### Modifications

- ✅ Dark mode default behavior
- ✅ Project structure updates
- ✅ Documentation enhancements
- ✅ Performance optimizations

### Removals

- ✅ Custom cursor functionality
- ✅ Electric arc logotype animation

### Files Created

- ✅ 7 new files (configuration, documentation, blog posts)
- ✅ 1 new change log file

### Files Modified

- ✅ 4 core website files updated
- ✅ 4 documentation files enhanced

---

**Total Changes**: 12 files modified/created  
**New Features**: 3 major additions  
**Documentation**: Comprehensive updates across all guides  
**Performance**: Enhanced loading and animation performance

---

**Next Steps**: All changes are ready for deployment. Follow README.md for deployment instructions.

---

**Contact**: direktonline.at@gmail.com  
**Last Updated**: January 2025  
**Current Version**: 2.22.0
