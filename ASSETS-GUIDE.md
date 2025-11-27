# Assets Guide - Required Images & Files

This guide lists all assets (images, logos, files) needed for the DirektOnline BS GmbH website.

**Updated**: March 2025 - Note: Supercar loading animation and tsParticles were removed in v2.0.0 in favor of native CSS animations.

## 📁 Directory Structure

```
assets/
├── logo.svg              # Main company logo (REPLACE THIS!)
├── favicon.svg           # Browser tab icon
├── og-image.jpg          # Social media sharing image (1200x630px)
├── vehicles/             # Featured vehicle images
│   ├── vw-golf-gti.jpg
│   ├── bmw-320d.jpg
│   ├── audi-a4.jpg
│   ├── mercedes-c-class.jpg
│   ├── skoda-octavia.jpg
│   └── seat-leon.jpg
├── blog/                 # Blog post images
│   ├── winter-reifen.jpg
│   ├── gebrauchtwagen-kauf.jpg
│   └── elektroauto-vorteile.jpg
└── downloads/            # Optional downloadable files
    └── gebrauchtwagen-checkliste.pdf
```

---

## 🎨 Logo Files

### Logo (PRIMARY - CURRENTLY IN USE)

- **Purpose**: Main logo displayed in header
- **Format**: WebP (currently using `Logo New.webp`)
- **Dimensions**: Flexible, optimized for navbar height (70px/65px)
- **Location**: `assets/Logo New.webp`
- **Usage**: Header, footer, loading screen, structured data

**Current Status**:
- ✅ Logo file: `assets/Logo New.webp` - Active and in use
- ✅ Navbar styling: Logo fills navbar height with reduced padding (0.5rem/0.25rem)
- ✅ Logo dimensions: 70px height (not scrolled), 65px (scrolled), max-width 280px

**Instructions for Future Updates**:

1. Export your logo as WebP, SVG, or PNG with transparent background
2. Ensure it's optimized for web use
3. Replace `assets/Logo New.webp` with your file
4. Update `index.html` logo references if filename changes
5. Update structured data logo reference in JSON-LD (line ~720)

### favicon.svg

- **Purpose**: Browser tab icon
- **Format**: SVG or ICO
- **Dimensions**: 32x32px or 64x64px
- **Location**: `assets/favicon.svg`

**Quick Create**:

- Use your logo simplified (monochrome version)
- Online tool: [Favicon.io](https://favicon.io/) or [RealFaviconGenerator](https://realfavicongenerator.net/)

---

## 📸 Social Media / SEO Images

### og-image.jpg

- **Purpose**: Shown when website is shared on Facebook, LinkedIn, Twitter
- **Format**: JPG
- **Dimensions**: 1200x630px (Facebook recommended)
- **Size**: < 1MB
- **Location**: `assets/og-image.jpg`

**Content Suggestions**:

- Logo + tagline: "Ihr Autohandel in Wolfsberg"
- Image of showroom or featured vehicle
- Brand color (#1b8e2d) prominently

**Quick Create**:

- Use Canva template: "Facebook Post" (1200x630px)
- Or Photoshop/GIMP

---

## 🚗 Vehicle Images

### Requirements for ALL vehicle images:

| Property       | Specification          |
| -------------- | ---------------------- |
| **Format**     | JPG or WebP            |
| **Dimensions** | 800x600px (4:3 aspect) |
| **File Size**  | < 200 KB each          |
| **Quality**    | 85% compression        |
| **Location**   | `assets/vehicles/`     |

### Individual Files:

#### vw-golf-gti.jpg

- VW Golf GTI or similar sporty hatchback
- Angle: 3/4 front view
- Background: Clean, simple

#### bmw-320d.jpg

- BMW 3 Series Touring/Estate or similar
- Angle: Side profile or 3/4 front
- Highlight: Elegance, luxury

#### audi-a4.jpg

- Audi A4 Avant or similar station wagon
- Angle: Any professional angle
- Show: Clean, business-like

#### mercedes-c-class.jpg

- Mercedes C-Class or similar premium sedan
- Angle: 3/4 front showing AMG styling
- Emphasize: Premium quality

#### skoda-octavia.jpg

- Škoda Octavia Combi or similar practical wagon
- Angle: 3/4 view showing size
- Highlight: Space, practicality

#### seat-leon.jpg

- Seat Leon or similar compact
- Angle: Dynamic angle
- Show: Sporty, youthful

### Where to Get Vehicle Images?

**Option 1**: Your Own Inventory

- Take professional photos of your actual vehicles
- Use good lighting (natural daylight best)
- Clean background
- Clean vehicle

**Option 2**: Stock Photos (Temporary)

- [Unsplash](https://unsplash.com/s/photos/cars) - Free, high-quality
- [Pexels](https://www.pexels.com/search/car/) - Free
- Search: "BMW 320d" "VW Golf GTI" etc.

**Option 3**: Manufacturer Press Images

- Check manufacturer websites for press/media sections
- Usually free for commercial use by dealers

### Image Optimization

Before uploading, optimize images:

**Online Tools**:

- [TinyPNG](https://tinypng.com/) - Compress JPG/PNG
- [Squoosh](https://squoosh.app/) - Advanced compression

**Command Line** (if you have ImageMagick):

```bash
# Resize and optimize all vehicle images
mogrify -strip -quality 85 -resize 800x600\> assets/vehicles/*.jpg
```

---

## 📝 Blog Post Images

### winter-reifen.jpg

- **Subject**: Winterreifen, Schnee, oder Reifenwechsel
- **Dimensions**: 800x600px
- **Mood**: Professional, informative
- **Suggestions**:
  - Close-up of winter tire tread
  - Car with winter tires in snow
  - Mechanic changing tires

### gebrauchtwagen-kauf.jpg

- **Subject**: Autokauf, Inspektion, oder Händler mit Kunde
- **Dimensions**: 800x600px
- **Mood**: Trustworthy, advisory
- **Suggestions**:
  - Person inspecting used car
  - Handshake deal
  - Car lot with multiple vehicles

### elektroauto-vorteile.jpg

- **Subject**: Elektroauto, Ladestation, oder grüne Technologie
- **Dimensions**: 800x600px
- **Mood**: Modern, eco-friendly, futuristic
- **Suggestions**:
  - Electric car charging
  - Close-up of charging port
  - Modern EV (Tesla, VW ID.3, etc.)

### Where to Get Blog Images?

**Free Stock Photos**:

- [Unsplash](https://unsplash.com/)
- [Pexels](https://www.pexels.com/)
- [Pixabay](https://pixabay.com/)

Search terms:

- "winter tires"
- "car inspection"
- "electric car charging"
- "car dealership"

---

## 📄 Optional Downloads

### gebrauchtwagen-checkliste.pdf

- **Purpose**: Downloadable checklist for customers
- **Location**: `assets/downloads/gebrauchtwagen-checkliste.pdf`
- **Content**: Based on blog post "Gebrauchtwagen kaufen"

**Create from**:

- Export blog post content to PDF
- Format as printable checklist
- Add your logo and contact info

---

## 🎯 Quick Start Checklist

Minimum required to launch:

- [ ] **logo.svg** - Your company logo (MOST IMPORTANT!)
- [ ] **favicon.svg** - Browser icon
- [ ] **og-image.jpg** - Social media image
- [ ] **6x vehicle images** - Featured cars (can use stock photos initially)
- [ ] **3x blog images** - Support blog posts

Optional (can add later):

- [ ] Downloads folder and PDF files
- [ ] Additional blog post images
- [ ] Video content

---

## 🛠️ Folder Setup Commands

Create all necessary folders:

```bash
# Create asset directories
mkdir -p assets/vehicles
mkdir -p assets/blog
mkdir -p assets/downloads
mkdir -p posts

# On Windows (Command Prompt):
mkdir assets\vehicles
mkdir assets\blog
mkdir assets\downloads
mkdir posts
```

---

## 🎨 Brand Guidelines

Keep these consistent across all images:

### Colors

- **Primary**: #1b8e2d (Green)
- **Secondary**: White, light grays
- **Accent**: Black for text

### Style

- **Photography**: Clean, professional, bright
- **Mood**: Trustworthy, modern, welcoming
- **Avoid**: Cluttered backgrounds, overly edited, stock-photo-feeling

### Logo Usage

- Always on white or very light background
- Minimum clear space around logo: equal to logo height
- Never stretch or distort
- Use high-resolution files

---

## 📊 Image Size Recommendations

| Type           | Dimension  | Max File Size |
| -------------- | ---------- | ------------- |
| Logo (SVG)     | Flexible   | < 50 KB       |
| Logo (PNG)     | 400x120px  | < 100 KB      |
| Favicon        | 64x64px    | < 10 KB       |
| OG Image       | 1200x630px | < 1 MB        |
| Vehicle Photos | 800x600px  | < 200 KB      |
| Blog Images    | 800x600px  | < 200 KB      |

---

## 🔄 Updating Images

### To update logo:

1. Replace file at `assets/logo.svg`
2. Clear browser cache (Ctrl+Shift+R)
3. Redeploy if on Vercel

### To update vehicle:

1. Replace file at `assets/vehicles/[vehicle-name].jpg`
2. Keep filename the same, or update `index.html`
3. Optimize image first (< 200 KB)

### To add new vehicles:

1. Add image to `assets/vehicles/`
2. Update `index.html` around line 460-650 (featured vehicles section)
3. Follow existing card structure

---

## 🎁 Helpful Resources

### Free Stock Photos

- [Unsplash](https://unsplash.com/) - High quality, free
- [Pexels](https://www.pexels.com/) - Videos + photos
- [Pixabay](https://pixabay.com/) - Large selection

### Image Editing

- [Canva](https://www.canva.com/) - Easy online editor
- [Photopea](https://www.photopea.com/) - Free Photoshop alternative
- [GIMP](https://www.gimp.org/) - Free desktop editor

### Image Optimization

- [TinyPNG](https://tinypng.com/) - Compress images
- [Squoosh](https://squoosh.app/) - Advanced optimization
- [ImageOptim](https://imageoptim.com/) - Mac app

### Logo Creation

- [Canva](https://www.canva.com/create/logos/) - Logo maker
- [Looka](https://looka.com/) - AI logo generator
- [Hatchful](https://www.shopify.com/tools/logo-maker) - Free by Shopify

---

## ❓ FAQ

**Q: What if I don't have vehicle photos yet?**  
A: Use stock photos from Unsplash temporarily. Replace with real inventory photos later.

**Q: Can I use PNG instead of SVG for logo?**  
A: Yes, but SVG is better (scalable, smaller file size). If using PNG, ensure it's high-resolution (at least 400px wide) and transparent background.

**Q: Do I need to optimize images myself?**  
A: Recommended! Smaller images = faster website. Use TinyPNG or similar tool.

**Q: What about videos?**  
A: Not required initially. Can add later for enhanced experience.

**Q: Can I change image dimensions?**  
A: Yes, but maintain aspect ratios. Update CSS if needed. Recommended to stick with listed dimensions for consistency.

---

**Need Help?**  
Contact: direktonline.at@gmail.com

---

**Last Updated**: October 2024  
**Version**: 1.1

## 📝 Change Log

### Version 1.1 (October 2024)
- **Added**: Supercar loading animation asset requirements (Note: Removed in v2.0.0)
- **Added**: tsParticles integration specifications (Note: Removed in v2.0.0)
- **Updated**: Project structure to reflect new file organization
- **Enhanced**: Asset optimization guidelines for new features
- **Added**: Real testimonials integration requirements

### Version 1.0 (October 2024)
- **Initial release**: Complete assets guide
- **Features**: Logo, vehicle images, blog images, social media assets
- **Tools**: Optimization tips, brand guidelines, folder setup
