# Car Dealer Website Template

Modern, deployment-ready single-page website template for car dealerships. Currently deployed for CB Handels GmbH, refactored as a reusable template.

**All dealer-specific data is centralized in `config/dealerConfig.js` - see [TEMPLATE-SETUP.md](TEMPLATE-SETUP.md) for configuration instructions.**

## 🚀 Features

- **Modern UI/UX**: Glassmorphism design, CSS animations, 3D tilt effects
- **Responsive**: Mobile-first design that works on all devices with enhanced touch interactions, swipe gestures, touch-friendly image galleries, optimized mobile experience, and tablet portrait mode support with adaptive search bar
- **Performance**: Optimized with lazy loading, skeleton loading, progressive images (blur-up), critical CSS inlining, CSS preloading, DNS prefetch, resource priority hints, LCP image preloading, and strategic prefetch for common navigation paths
- **SEO-Ready**: Structured data (AutoDealer, FAQPage, BreadcrumbList, BlogPosting, Review/Rating), comprehensive Open Graph tags with image dimensions, Twitter cards, local business metadata, meta tags, local keywords, canonical URLs, sitemap.xml, robots.txt
- **Interactive Features**: Magnetic buttons, scroll reveal, testimonial slider with swipe gestures, vehicle comparison, financing calculator, trade-in calculator with hash navigation support, back-to-top button with smooth scroll
- **WhatsApp-Focused Contact**: Direct communication via WhatsApp (primary), phone, and email - no form spam
- **Social Media Integration**: Prominent social media section in contact area with branded buttons (Facebook, Instagram, TikTok, YouTube, X) with platform-specific styling and hover effects
- **Modern Newsletter Subscription**: Enhanced newsletter forms with modern 2025 design, real-time validation, interactive privacy checkbox, dual placement (footer & contact section), loading states, and comprehensive accessibility features
- **Appointment Booking**: Dedicated API endpoint for appointment bookings with date validation and confirmation emails
- **Dark Mode**: Toggle between light and dark themes (loads in light mode by default)
- **Accessibility**: ARIA attributes, semantic HTML, keyboard navigation, skip-to-content link, focus management in modals, ARIA live regions for dynamic content announcements
- **Enhanced Hero**: Animated gradients, trust badges, improved CTAs
- **Vehicle Features**: Quick view modal with enhanced vehicle details API, touch-friendly mobile image gallery with swipe gestures, comparison tool, filtering & sorting, share functionality, vehicle inquiry form, real-time search
- **Trust Indicators**: Enhanced trust badges, real Google reviews, animated statistics
- **Services Section**: Comprehensive service showcase (inspection, warranty, financing, trade-in) with interactive cards and hash-based navigation to calculators
- **Process Section**: 5-step buying process guide with visual indicators and descriptions
- **Team & Facilities**: Team member profiles and dealership facilities showcase
- **FAQ Section**: Frequently asked questions accordion with expand/collapse functionality
- **Dynamic Vehicle Data**: Multi-source vehicle fetching from AutoScout24, Willhaben, and Landwirt.com with combined results, real-time vehicle listings via API with enhanced vehicle details endpoint for quick view. Features robust data extraction with improved year parsing, title extraction, and optimized image pool pre-collection for reliable image matching across all vehicles.
- **Blog Enhancements**: Category navigation, improved card design, concise excerpts (2-line max), quick reading (2 min), clickable cards
- **Visual Polish**: Advanced gradients, glassmorphism effects, smooth animations
- **Vehicle Data Scraping**: Puppeteer integration for dynamic vehicle data extraction from motornetzwerk.at

## 📦 Project Structure

```
dealership/
├── index.html                 # Main HTML file (uses dealerConfig)
├── styles.css                 # All CSS styles
├── scripts.js                 # JavaScript with CSS animations (uses dealerConfig)
├── config/
│   ├── dealerConfig.js       # Dealer configuration (Node.js/Serverless)
│   └── dealerConfig.browser.js # Dealer configuration (Browser)
├── lib/
│   └── vehicleService.js     # Vehicle data fetching abstraction layer
├── api/
│   ├── contact.js            # Vercel serverless function for contact form (uses dealerConfig)
│   ├── vehicles.js           # Vercel serverless function for vehicle data (uses dealerConfig)
│   ├── vehicle-details.js    # Vercel serverless function for detailed vehicle information by vid (uses dealerConfig)
│   ├── newsletter.js         # Vercel serverless function for newsletter subscriptions (uses dealerConfig)
│   ├── newsletter-confirm.js # Vercel serverless function for newsletter double opt-in confirmation
│   └── appointment.js        # Vercel serverless function for appointment bookings (uses dealerConfig)
├── assets/
│   ├── logo.svg              # Company logo
│   ├── favicon.svg           # Favicon
│   ├── og-image.jpg          # Open Graph image for social sharing
│   ├── vehicles/             # Featured vehicle images
│   │   ├── vw-golf-gti.jpg
│   │   ├── bmw-320d.jpg
│   │   ├── audi-a4.jpg
│   │   ├── mercedes-c-class.jpg
│   │   ├── skoda-octavia.jpg
│   │   └── seat-leon.jpg
│   └── blog/                 # Blog post images
│       ├── winter-reifen.jpg
│       ├── gebrauchtwagen-kauf.jpg
│       └── elektroauto-vorteile.jpg
├── posts/                    # Blog post markdown files
│   ├── reifenwechsel.md
│   ├── gebrauchtwagen-kaufen.md
│   └── elektromobilitaet.md
├── README.md                 # This file
├── automation-guidance.md    # Automation setup guide
├── ASSETS-GUIDE.md           # Complete assets guide
├── PROJECT-SUMMARY.md        # Project overview and features
├── DESIGN-PREFERENCES.md     # Design style preferences and guidelines
├── package.json              # Node.js dependencies
├── vercel.json               # Vercel configuration
└── .gitignore                # Git ignore rules

```

## 🎨 Customization Guide

### ⚙️ Quick Start: Configure for Your Dealer

**All dealer-specific data is now in configuration files!**

1. **Edit Configuration**: Update `config/dealerConfig.js` with your dealer information
2. **Sync Browser Config**: Update `config/dealerConfig.browser.js` to match (must be identical)
3. **Deploy**: Everything else is automatic!

See [TEMPLATE-SETUP.md](TEMPLATE-SETUP.md) for detailed configuration instructions.

### 1. Replace Logo

1. Place your logo file in `/assets/logo.svg` (SVG format recommended)
2. For other formats (PNG, JPG), update the image source in `index.html`:
   ```html
   <img
     src="assets/logo.png"
     alt="Your Company Logo"
     class="logo"
     id="site-logo"
     width="250"
     height="60"
     fetchpriority="high"
     decoding="async"
   />
   ```
   **Note**: Include `width` and `height` attributes to prevent Cumulative Layout Shift (CLS).

### 2. Change Brand Color

Edit the `colors` section in `config/dealerConfig.js`:

```javascript
colors: {
  primary: "#004b8d", // Change this hex color (currently set to CB Handels blue)
  primaryRgb: "0, 75, 141", // Update RGB values to match
  primaryLight: "#2469a6",
  primaryDark: "#003564"
}
```

Also update CSS custom properties in `styles.css`:

```css
:root {
  --brand-primary: #004b8d; /* Match config value (currently CB Handels blue) */
  --brand-primary-rgb: 0, 75, 141; /* Match config value */
}
```

### 3. Update Vehicle Images

1. Add your vehicle photos to `/assets/vehicles/`
2. Optimize images (recommended: 800x600px, WebP or JPG, <200KB)
3. Vehicle images are loaded dynamically from the API - no manual image path updates needed

### 4. Modify Content

**All dealer-specific content is now in `config/dealerConfig.js`:**

- **Company Name**: `config.dealerConfig.name`
- **Address**: `config.dealerConfig.address`
- **Contact Info**: `config.dealerConfig.email`, `config.dealerConfig.phone`
- **SEO**: `config.dealerConfig.seo`
- **Legal Info**: `config.dealerConfig.legal`
- **Social Media**: `config.dealerConfig.social`

Content in `index.html` is automatically populated from config - no manual editing needed!

### 5. Adjust iframe Heights

In `styles.css`, modify:

```css
.iframe-wrapper {
  min-height: 600px; /* Default height */
}

.iframe-wrapper.expanded {
  min-height: 900px; /* Expanded height */
}
```

## 🌐 Deployment on Vercel

### Prerequisites

- [Vercel Account](https://vercel.com/signup) (free)
- [Git](https://git-scm.com/downloads) installed
- [Node.js](https://nodejs.org/) 16+ installed (for local testing)

### Step 1: Prepare Repository

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Car dealership website"

# Push to GitHub (create repo first on github.com)
git remote add origin https://github.com/YOUR_USERNAME/your-repo-name.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? your-project-name
# - Directory? ./
# - Override settings? No
```

#### Option B: Via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: (leave empty)
4. Click "Deploy"

### Step 3: Configure Environment Variables (Optional)

**Note**: The website now uses mailto links for all forms (contact, appointment, newsletter). SMTP configuration is **optional** and only needed if you want to use API-based email sending.

#### Option 1: Mailto Links (Default - No Configuration Needed)

All forms (contact, appointment booking, newsletter) use mailto links by default. No environment variables needed. Forms will open the user's email client with pre-filled content.

#### Option 2: SMTP Configuration (Optional)

If you want to use API-based email sending instead of mailto, add these environment variables in Vercel Dashboard (Settings → Environment Variables):

```env
# SMTP Configuration (optional, for API-based email sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
CONTACT_TO_EMAIL=your-email@example.com

# Newsletter Google Sheets Integration (optional)
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEWSLETTER_SECRET=your-secret-key-here
```

#### Gmail SMTP Setup (Optional):

1. Enable 2-factor authentication on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the app password as `SMTP_PASS`

### Step 4: Add Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain: `your-domain.com`
3. Configure DNS records as instructed by Vercel
4. Wait for DNS propagation (usually 24-48 hours)

## 🧪 Local Development

```bash
# Install dependencies (only for serverless function)
npm install nodemailer

# Install Vercel CLI
npm install -g vercel

# Run local development server
vercel dev

# Open browser
# Visit: http://localhost:3000
```

### Testing Forms Locally

**Forms work out of the box** with mailto links. No configuration needed for basic functionality.

If you want to test API-based email sending (optional), create `.env` file in project root:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_TO_EMAIL=your-email@example.com
```

Then run `vercel dev` to test API-based newsletter and appointment booking functionality.

## 📝 Contact Methods

The website uses WhatsApp as the primary contact method (v2.15.0+):

- **WhatsApp**: Direct chat with pre-filled message
- **Phone**: Click-to-call functionality
- **Email**: Mailto link for formal inquiries

**Note**: The contact form was removed in v2.15.0 to eliminate spam. The contact API endpoint (`api/contact.js`) still exists but is no longer used by the frontend.

## 📝 Alternative Contact Solutions (Historical - Deprecated)

<details>
<summary>Click to view deprecated contact form alternatives (v2.15.0 - Removed)</summary>

_Note: These solutions were for the contact form which was removed in v2.15.0. Kept for reference only. The website now uses WhatsApp, phone, and email for direct communication._

If you wanted to use the serverless function, you could use these services:

### Option 1: Formspree

1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form
3. Replace form action in `scripts.js` (if form existed):

```javascript
// In initContactForm() function, replace fetch URL:
const response = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});
```

### Option 2: Formspark

1. Sign up at [formspark.io](https://formspark.io)
2. Create a form
3. Update the fetch URL similarly to Formspree

### Option 3: Web3Forms

1. Get an access key from [web3forms.com](https://web3forms.com)
2. Add hidden input to form in `index.html`:

```html
<input type="hidden" name="access_key" value="YOUR_ACCESS_KEY" />
```

3. Update form action to `https://api.web3forms.com/submit`

## 🎭 Blog Posts

Blog posts are now rendered with a modern, professional design. Each blog post includes:

- Full HTML5 document structure
- Modern styling via `blog-styles.css`
- Responsive layout with proper typography
- Navigation back to homepage
- Category badges and read-time indicators

### Creating New Blog Posts

1. Create new markdown file in `/posts/` directory (e.g., `my-post.md`)
2. Add metadata at the top:
   ```markdown
   ---
   title: "Your Post Title"
   date: "1. November 2025"
   category: "Ratgeber"
   readTime: "5 Minuten"
   ---
   ```
3. Convert markdown to HTML using the conversion script or manually create HTML file
4. Use this template structure for HTML files:

```html
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Post Title - Your Company Name</title>
    <meta name="description" content="Post description" />

    <!-- Open Graph tags for social sharing -->
    <meta property="og:title" content="Post Title" />
    <meta property="og:description" content="Post description" />
    <meta property="og:image" content="/assets/blog/post-image.jpg" />
    <meta
      property="og:url"
      content="https://your-domain.com/posts/post-slug.html"
    />

    <!-- SEO Meta Tags -->
    <meta name="description" content="Post description" />
    <meta name="keywords" content="relevant keywords" />
    <link rel="canonical" href="https://direktonline.at/posts/post-slug.html" />

    <!-- Open Graph tags for social sharing -->
    <meta property="og:title" content="Post Title" />
    <meta property="og:description" content="Post description" />
    <meta property="og:type" content="article" />
    <meta
      property="og:url"
      content="https://your-domain.com/posts/post-slug.html"
    />
    <meta property="og:image" content="/assets/blog/post-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="de_AT" />
    <meta
      property="article:published_time"
      content="2024-10-15T00:00:00+01:00"
    />
    <meta property="article:author" content="Your Company Name" />
    <meta property="article:section" content="Category" />

    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Post Title" />
    <meta name="twitter:description" content="Post description" />
    <meta name="twitter:image" content="/assets/blog/post-image.jpg" />

    <!-- JSON-LD for BlogPosting -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Post Title",
        "image": "/assets/blog/post-image.jpg",
        "datePublished": "2024-10-15",
        "author": {
          "@type": "Organization",
          "name": "Your Company Name"
        }
      }
    </script>

    <link rel="stylesheet" href="../styles.css" />
    <link rel="stylesheet" href="blog-styles.css" />
  </head>
  <body>
    <div class="blog-container">
      <header class="blog-header">
        <div class="blog-meta">
          <span class="blog-category-badge">Category</span>
          <span>1. November 2025</span>
          <span>5 Minuten</span>
        </div>
        <h1 class="blog-title">Your Post Title</h1>
      </header>
      <article class="blog-content">
        <!-- Your blog post content -->
      </article>
      <footer class="blog-footer">
        <a href="../index.html#blog" class="blog-back-link"
          >Zurück zur Übersicht</a
        >
      </footer>
    </div>
  </body>
</html>
```

3. Add post to main page blog grid in `index.html` with correct date format

## ⚡ Performance Optimization Checklist

### Image Optimization

```bash
# Install ImageMagick (for batch optimization)
# macOS:
brew install imagemagick

# Ubuntu/Debian:
sudo apt-get install imagemagick

# Optimize images
mogrify -strip -quality 85 -resize 800x600\> assets/vehicles/*.jpg
mogrify -strip -quality 85 -resize 800x600\> assets/blog/*.jpg
```

Or use online tools:

- [TinyPNG](https://tinypng.com/)
- [Squoosh](https://squoosh.app/)
- [ImageOptim](https://imageoptim.com/) (macOS)

### Performance Tips

1. **Enable Compression**: Vercel enables gzip/brotli by default
2. **Use WebP Format**: Convert images to WebP for better compression
3. **Lazy Loading**: Already implemented for images and iframes
4. **Cache Headers**: Vercel handles this automatically
5. **CDN**: Vercel provides global CDN by default
6. **Resource Hints**: CSS preloading, DNS prefetch, and strategic prefetch for common navigation paths are configured for optimal loading
7. **Priority Hints**: Critical resources (logo, CSS, LCP candidate images) use fetchpriority for faster initial render
8. **Critical CSS**: Above-the-fold styles are inlined to eliminate render-blocking CSS
9. **Image Dimensions**: Logo and key images include width/height attributes to prevent Cumulative Layout Shift (CLS)
10. **Preconnect**: Google Analytics domains use preconnect for faster connection establishment

### Lighthouse Audit

1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Run audit for Performance, Accessibility, SEO
4. Target scores: 90+ in all categories

## 🔧 Troubleshooting

### Contact Forms Not Working

**Problem**: Mailto link doesn't open  
**Solution**:

1. Check if default email client is configured on the device
2. Test in different browser
3. Verify mailto links are not blocked by browser settings
4. Check browser console for errors

**Note**: Forms use mailto links by default. If you want API-based email sending, configure SMTP environment variables (see Step 3 in Deployment section).

### Animations Not Working

**Problem**: CSS animations not playing  
**Solution**:

1. Check browser console for errors
2. Verify CSS is loading properly
3. Test in different browser
4. Clear browser cache

### Mobile Menu Issues

**Problem**: Menu doesn't open on mobile  
**Solution**:

1. Check if JavaScript is enabled
2. Test in different mobile browser
3. Verify `scripts.js` is loading
4. Check for console errors

### iframe Not Loading

**Problem**: Vehicle search iframe doesn't load  
**Solution**:

1. Verify iframe URL is correct
2. Check if site allows embedding (X-Frame-Options)
3. Test iframe URL directly in browser
4. Contact motornetzwerk.at support if needed

## 📱 Browser Support

| Browser        | Version         |
| -------------- | --------------- |
| Chrome         | Last 2 versions |
| Firefox        | Last 2 versions |
| Safari         | Last 2 versions |
| Edge           | Last 2 versions |
| iOS Safari     | 12+             |
| Chrome Android | Last 2 versions |

## 📋 Content Management

### Updating Prices

Vehicle prices are loaded dynamically from the API - no manual price updates needed in HTML.

### Changing Testimonials

Edit testimonial text in `index.html` lines 780-850:

```html
<p class="testimonial-text">"Your testimonial text here..."</p>
<div class="testimonial-author">
  <strong>Customer Name</strong>
  <span>Location</span>
</div>
```

### Updating Statistics

Edit counter values in `index.html` lines 750-770:

```html
<div class="stat-number" data-count="150">0</div>
```

Change the `data-count` attribute to your desired number.

## 🔐 Security Best Practices

1. **Never commit `.env` file** to git
2. **Use environment variables** for sensitive data
3. **Enable rate limiting** (already implemented in contact form)
4. **Keep dependencies updated**: `npm update`
5. **Use HTTPS only** (Vercel provides SSL certificates automatically)
6. **Sanitize form inputs** (already implemented)
7. **CORS Whitelist**: API endpoints restrict access to whitelisted origins only
8. **Security Headers**: Content-Security-Policy, HSTS, and Permissions-Policy headers configured
9. **Input Validation**: Query parameters validated to prevent injection attacks
10. **No Hardcoded Secrets**: All secrets removed from client-side code

## 📊 Analytics Setup

### Google Analytics 4

✅ **Implemented** - Google Analytics 4 tracking is active on all pages with measurement ID `G-PWL0D86EB3`.

The tracking code is included in:

- `index.html` (main page)
- `posts/elektromobilitaet.html`
- `posts/reifenwechsel.html`
- `posts/gebrauchtwagen-kaufen.html`

All pages track page views automatically. Additional event tracking can be added to `scripts.js` for custom interactions.

### Vercel Analytics

Already compatible. Enable in Vercel Dashboard:

- Go to Project Settings → Analytics
- Enable Vercel Analytics

## 🤝 Support & Contact

**CB Handels GmbH**  
Industriestraße 5  
9463 Reichenfels, Österreich

📞 Telefon: [+43 664 3882323](tel:+436643882323)  
✉️ E-Mail: [office@cbhandel.at](mailto:office@cbhandel.at)  
🕐 Öffnungszeiten: Montag bis Freitag: nach telefonischer Vereinbarung

---

## 📝 Changelog

### Version 2.23.0 - November 2025

#### ✨ New Features

- **Fuel Type Display**: Added fuel type (Diesel, Benzin, Elektro, Hybrid) display in vehicle card features section alongside transmission type for better vehicle information visibility
- **Category Filter Buttons**: Added dedicated filter buttons for vehicle categories (PKW, Nutzfahrzeuge, Baumaschinen) in the Fahrzeuge section for improved navigation

#### 🔧 Improvements

- **Filter Buttons Optimization**: Optimized filter buttons to stay in one row with reduced size to prevent wrapping and improve mobile responsiveness
- **Vehicle Information Enhancement**: Fuel type now displayed in both card features and vehicle details for comprehensive vehicle information

### Version 2.22.0 - January 2025

#### ✨ New Features

- **Visual Enhancements**: Custom global scrollbar with brand colors, enhanced card hover effects with improved lift and shadows, refined sticky header with better visual separation, and consistent icon stroke width across all icons

#### 🔧 Improvements

- **Visual Polish**: Improved depth perception with multi-layer shadows, better border color transitions, enhanced dark mode support for all visual elements

### Version 2.21.0 - November 2025

#### ✨ New Features

- **Social Media Integration**: Prominent social media section in contact area with branded buttons (Facebook, Instagram, TikTok, YouTube, X) with platform-specific styling and hover effects
- **Social Media Links Update**: Standardized all social media handles to consistent naming

#### 🔧 Improvements

- **Contact Section Layout Optimization**: Equal width columns for better visual balance, map repositioned to full width below contact columns, more compact appointment section with reduced spacing

### Version 2.20.0 - November 2025

#### 🔍 SEO Enhancements

- **Blog Post SEO**: Added complete SEO meta tags to all blog posts (meta descriptions, keywords, canonical URLs)
- **Open Graph Tags**: Comprehensive OG tags with image dimensions for all blog posts
- **Twitter Cards**: Complete Twitter Card implementation for social media sharing
- **BlogPosting Schema**: Added JSON-LD structured data to all blog posts for rich snippets
- **Sitemap Updates**: Fixed blog post URLs (added .html extension), updated lastmod dates

### Version 2.19.0 - November 2025 (Previous)

#### 🔧 Blog Section Improvements

- **Enhanced Readability**: Significantly shortened blog excerpts to one-line summaries for quick scanning
- **Reduced Reading Times**: All blogs now show "2 Min. Lesezeit" (down from 3-4 minutes)
- **Compact Display**: Blog excerpts limited to 2 lines maximum for faster reading
- **Improved Typography**: Better font sizes, weights, spacing, and visual hierarchy
- **Fixed Click Behavior**: Entire blog card opens blog post (not image lightbox)
- **Accessibility**: Added keyboard navigation and proper ARIA labels for blog cards

### Version 2.19.0 - November 2025

#### ✅ Pre-Launch Legal & Technical Updates

- **Warranty Disclaimer**: Added asterisk (\*) to all warranty mentions with legal disclaimer in footer
- **Date Updates**: Updated all blog post dates and sitemap to November 2025
- **Blog Post Modern Design**: Converted all blog posts to modern HTML with professional styling and responsive layout
- **Forms - No SMTP Dependency**: All forms (contact, appointment, newsletter) now use mailto links by default with optional SMTP fallback
- **Legal Compliance**: Warranty disclaimer clarifies that terms vary by vehicle and are at seller's discretion

### Version 2.18.0 - November 2025

#### 🔧 SEO & Social Media Improvements

- **Open Graph Enhancement**: Added image dimensions (1200x630), image type, enhanced descriptions, locale alternates, local business metadata, and Twitter creator tag for optimal social media sharing

### Version 2.17.0 - November 2025

#### 🔧 Content Updates

- **Hero Trust Badges**: Removed "Servicebetrieb vor Ort" and added "Professionelle Fahrzeug Aufbereitung" (Professional Vehicle Detailing) to better highlight professional vehicle preparation services
- **Facilities Section**: Replaced "Servicebetrieb vor Ort" facility card with "Professionelle Fahrzeug Aufbereitung" facility card, emphasizing professional vehicle detailing services

### Version 2.16.0 - October 2025

#### ✨ New Features

- **Modern Newsletter Design**: Complete newsletter redesign with glassmorphism effects, real-time validation, interactive privacy checkbox, loading states, and enhanced accessibility
- **Dual Newsletter Placement**: Newsletter form available in both footer and contact section (below appointment booking)

### Version 2.15.0 - October 2025

#### ✨ New Features

- **WhatsApp-Focused Contact Options**: Replaced contact form with modern contact options card to eliminate spam - WhatsApp (primary), phone, and email options
- **Mobile Responsiveness Improvements**: Enhanced trade-in modal and sticky CTA button with better mobile optimization

#### 🔧 Improvements

- **Contact Section Layout**: Reduced spacing throughout for more compact design
- **Magnetic Button Reliability**: Enhanced animation system with better state management

### Version 2.14.0 - October 2025

#### 🔧 Navigation & UI Improvements

- **Navigation Menu Simplification**: Removed FAQ and Impressum from main navigation for cleaner interface
- **Trust Badges Updates**: Replaced generic badges with service-focused ones (Geprüfte Fahrzeuge, 12 Monate Garantie, Finanzierung möglich, Inzahlungnahme)
- **Hero Background Enhancements**: Reduced static blur for clearer image visibility

#### 📊 Content Updates

- **Statistics Section**: Changed "300 Verkaufte Fahrzeuge" to "900+ Zufriedene Kunden"
- **Text Content Improvements**: Updated hero subheadline and footer text

### Version 2.13.0 - October 2025

#### ✨ New Features

- **Testimonials Section - Modern Redesign**: Enhanced container design, modern Google Reviews badge with shimmer animation, beautiful testimonial cards with decorative elements, enhanced typography with gradient text, modern avatar design, gradient star ratings, and improved slider controls

### Version 2.12.0 - October 2025

#### ✨ New Features

- **Testimonials Section Enhancements**: Compact container design, full-width testimonial cards with fixed height (320px) for visual consistency

#### 🔧 Improvements

- **Statistics Updates**: Updated from "10+ Jahre Erfahrung" to "15+ Jahre Erfahrung" (later updated to "18+ Jahre Erfahrung" in January 2025), and from "500+ Verkaufte Fahrzeuge" to "300+ Verkaufte Fahrzeuge"
- **About Section Features**: Added "Professionelle Fahrzeug Aufbereitung" to features list

### Version 2.11.0 - October 2025

#### ✨ New Features

- **Phase 6.4: Mobile Experience Enhancements**: Swipe gestures for testimonials, touch feedback for cards, swipe-to-close mobile menu, enhanced mobile touch interactions, optimized mobile image loading, and improved mobile card interactions

### Version 2.10.0 - October 2025

#### ✨ New Features

- **SEO Enhancements**: Added sitemap.xml, robots.txt, FAQPage structured data (8 questions), BreadcrumbList schema, and BlogPosting structured data with complete meta tags for all blog posts

#### 🔧 Performance Improvements

- **Resource Loading Optimizations**: Added CSS preloading, DNS prefetch for Google Maps, logo image priority hints, and client hints header
- **Code Cleanup**: Removed redundant JavaScript-based preloading (moved to HTML head for better performance)

#### 📊 Testing

- **Testing Validation Report**: Added comprehensive testing validation document with automated test results and manual testing checklists

### Version 2.9.0 - January 2025

#### 🔧 Improvements

- **Fahrzeuge Section Enhancement**: Priority sorting - vehicles with "Top Angebot" tag (price < €15,000) appear first automatically when viewing "Alle" with default sorting

#### 🗑️ Removed

- **Featured Vehicles Section**: Removed redundant Featured Vehicles section from main page (functionality merged into main Fahrzeuge section via priority sorting)

### Version 2.8.0 - March 2025

#### ✨ New Features

- **Progressive Images (Blur‑up)**: Added progressive image loading for vehicle and blog images
- **Skeleton Loading**: Added skeleton placeholders for vehicle cards while data loads

#### 🔧 Improvements

- Initialized progressive images on initial load and after dynamic renders
- Graceful empty state when vehicle API is unavailable under static server

### Version 2.7.0 - March 2025

#### ✨ New Features

- **FAQ Section**: Added FAQ accordion section with 8 frequently asked questions, expand/collapse functionality, and smooth animations

### Version 2.6.0 - March 2025

#### ✨ New Features

- **Dedicated API Endpoints**: Created `/api/newsletter` and `/api/appointment` endpoints for better separation of concerns
- **Newsletter API**: Handles newsletter subscriptions with confirmation emails and rate limiting
- **Appointment API**: Handles appointment bookings with date validation, confirmation emails, and comprehensive error handling

### Version 2.5.0 - March 2025

#### ✨ New Features

- **Newsletter Subscription**: Newsletter form in footer with email validation and subscription handling
- **Appointment Booking System**: Appointment booking modal with date/time selection, form validation, and booking confirmation

### Version 2.4.0 - February 2025

#### ✨ New Features

- **Trade-in Calculator**: Interactive trade-in value calculator modal with vehicle details input

### Version 2.3.0 - January 2025

#### ✨ New Features

- **GDPR Compliance**: Cookie consent banner with granular cookie settings and enhanced privacy policy section

### Version 2.2.0 - January 2025

#### ✨ New Features

- **Services Section**: New dedicated section showcasing inspection, warranty, financing, and trade-in services with interactive cards
- **Vehicle Inquiry Form**: Quick inquiry button on vehicle cards with modal form
- **Vehicle Search**: Real-time search bar in header with dropdown results
- **Blog Enhancements**: Category navigation with filtering, improved blog card design, read-time badges, concise excerpts (2.20.0)

#### 🔧 Improvements

- Enhanced service presentation with icon animations and hover effects
- Improved mobile responsiveness for services section
- Better UX for vehicle inquiries and searches

### Version 2.1.0 - January 2025

#### ✨ New Features

- **Enhanced Hero Section**: Animated gradient backgrounds, trust badges, improved CTAs
- **Visual Design Polish**: Sophisticated gradients, enhanced shadows, refined typography
- **Button Interactions**: Enhanced magnetic effects, loading states, micro-interactions
- **Quick View Modal**: Fast preview of vehicle details
- **Vehicle Comparison Tool**: Compare up to 3 vehicles side-by-side
- **Financing Calculator**: Interactive loan calculator with sliders
- **Vehicle Filtering & Sorting**: Filter by category and sort by various criteria
- **Share Functionality**: Share individual vehicles via social media
- **Enhanced Trust Badges**: SSL, security certifications, warranty badges
- **Enhanced Testimonials**: Customer avatars, dates, video support, real Google Reviews
- **Enhanced Statistics**: Animated counters with updated values
- **Dynamic Vehicle Data**: Real-time listings from motornetzwerk.at via API

### Version 2.0.0 - October 2024

#### ✨ New Features

- **Vehicles API Endpoint**: Added `/api/vehicles` to dynamically fetch vehicle listings from motornetzwerk.at
- **Dynamic Vehicle Loading**: Fahrzeuge section loads vehicle data from API with automatic priority sorting for top offers
- **Simplified Search Interface**: Removed tab navigation, shows "Vollständige Suche" iframe directly
- **Native CSS Animations**: Replaced GSAP with pure CSS transitions and animations
- **Console Error Filtering**: Added filtering to suppress external iframe errors

#### 🔧 Improvements

- **Faster Loading**: Removed ~150KB of external dependencies (GSAP, tsParticles)
- **Better Performance**: Hardware-accelerated CSS animations
- **Vehicle Data Caching**: 1-hour cache on vehicles API to reduce external requests
- **Cleaner Codebase**: Removed unused code and dependencies

#### 🗑️ Removed

- **GSAP Library**: Replaced with native CSS animations
- **tsParticles**: Removed particle background system
- **Tab Navigation**: Simplified search to single iframe

#### 🐛 Fixed

- **Console Errors**: Suppressed external iframe errors from motornetzwerk.at
- **Navigation Links**: Fixed smooth scroll functionality

## 📄 License

© 2025 CB Handels GmbH. All rights reserved.

---

**Built with ❤️ using:**

- HTML5, CSS3, Vanilla JavaScript
- Native CSS animations and transitions
- [Vercel](https://vercel.com/) for hosting
- [Nodemailer](https://nodemailer.com/) for email delivery
- [Puppeteer Core](https://pptr.dev/) + [Chromium](https://github.com/sparticuz/chromium) for vehicle data scraping
- Vehicles API for dynamic content loading
