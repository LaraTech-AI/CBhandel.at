# CB Handels GmbH - Website Customization Plan

## Overview
This document outlines the complete plan to rebrand the website from the template's original client (DirektOnline BS GmbH) to CB Handels GmbH.

## Current Status
- ✅ **Configuration files updated**: `dealerConfig.js` and `dealerConfig.browser.js` contain CB Handels GmbH information
- ✅ **Brand colors configured**: Blue theme (#004b8d) set in config files
- ✅ **CSS colors updated**: All CSS updated to blue theme (#004b8d)
- ✅ **Logo files**: Updated to use logo.jpg for CB Handels GmbH
- ✅ **Text references**: All "DirektOnline BS GmbH" references updated to "CB Handels GmbH"
- ✅ **Meta tags**: All HTML meta tags updated for CB Handels GmbH
- ✅ **Blog posts**: All blog posts updated with CB Handels GmbH information
- ✅ **Domain references**: All URLs updated from direktonline.at to cbhandel.at
- ✅ **Trust badges**: Made more transparent (25% opacity for light mode, 30% for dark mode)
- ✅ **Header**: Updated to display "CB Handels GmbH" instead of "CB Handels"

---

## Phase 1: Brand Colors & Theme

### 1.1 Update CSS Brand Colors
**Files to update:**
- `styles.css` (lines 2-5, 12-15)
- `index.html` (inline critical CSS, lines 189-190)

**Changes needed:**
- Replace green color (#1b8e2d) with blue (#004b8d)
- Update RGB values: `27, 142, 45` → `0, 75, 141`
- Update light variant: `#22a636` → `#2469a6`
- Update dark variant: `#156b22` → `#003564`
- Update CSS comment header

**Priority:** HIGH - Visual branding consistency

---

## Phase 2: Logo & Visual Assets

### 2.1 Replace Logo Files
**Files to replace:**
- `assets/logo.png` - Main logo (PNG format)
- `assets/logo.svg` - Main logo (SVG format, preferred)

**Requirements:**
- Logo should represent CB Handels GmbH
- Recommended dimensions: 200-250px width, 60px height (or similar aspect ratio)
- Transparent background
- SVG format preferred for scalability
- High resolution for PNG (at least 400px wide)

**Action:** User needs to provide new logo files

### 2.2 Update Logo References
**Files to update:**
- `index.html` (line 670-671) - Update alt text from "DirektOnline BS GmbH Logo" to "CB Handels GmbH Logo"

### 2.3 Update Favicon
**Files to check/update:**
- `assets/favicon.svg` - Should match CB Handels branding

**Action:** User needs to provide new favicon if current one has DirektOnline branding

### 2.4 Update OG Image
**Files to check/update:**
- `assets/og-image.jpg` - Social media sharing image (1200x630px)

**Action:** User needs to provide new OG image with CB Handels branding

---

## Phase 3: Text Content & References

### 3.1 Update HTML Meta Tags
**File:** `index.html`

**Sections to update:**
- Lines 8-19: Title, description, keywords (currently hardcoded DirektOnline)
- Lines 22-44: Open Graph tags
- Lines 48-63: Business contact data (address, phone, email)
- Lines 65-84: Twitter Card tags
- Line 671: Logo alt text

**Note:** Some meta tags are already being populated from `dealerConfig.browser.js` via JavaScript (lines 88-100+), but hardcoded fallbacks should be updated.

### 3.2 Update CSS Comments
**File:** `styles.css`
- Line 2: Update header comment from "DirektOnline BS GmbH" to "CB Handels GmbH"
- Line 4: Update brand color comment

### 3.3 Update JavaScript Comments
**File:** `scripts.js`
- Line 2: Update header comment
- Check for any hardcoded "DirektOnline" fallback strings

### 3.4 Update Footer Content
**File:** `index.html`
- Search for copyright text and company name references
- Update any hardcoded company information

---

## Phase 4: Blog Posts

### 4.1 Update Blog Post Content
**Files to update:**
- `posts/elektromobilitaet.html` and `.md`
- `posts/gebrauchtwagen-kaufen.html` and `.md`
- `posts/reifenwechsel.html` and `.md`

**Changes needed:**
- Replace "DirektOnline BS GmbH" with "CB Handels GmbH"
- Replace "DirektOnline Team" with "CB Handels Team" or appropriate author
- Update contact email references
- Update location references (Wolfsberg → Reichenfels)
- Update any company-specific information

---

## Phase 5: Documentation & Config Files

### 5.1 Update Documentation Files
**Files to review/update:**
- `README.md` - Update references to DirektOnline
- `ASSETS-GUIDE.md` - Update company references
- `TEMPLATE-SETUP.md` - Update examples
- `CHANGELOG.md` - Already has some updates, may need review
- `robots.txt` - Update sitemap URL if needed
- `sitemap.xml` - Update URLs from direktonline.at to cbhandel.at
- `sitemap.html` - Update title and references
- `vercel.json` - Check for DirektOnline references

### 5.2 Update Test Files
**Files to review:**
- `test-regression.js` - Update test expectations
- `test-security-fixes.js` - Update URL references
- Any other test files with hardcoded references

---

## Phase 6: URL & Domain Updates

### 6.1 Update Domain References
**Files to check:**
- `sitemap.xml` - Update from direktonline.at to cbhandel.at
- `sitemap.html` - Update canonical URLs
- `robots.txt` - Update sitemap URL
- `vercel.json` - Check CSP headers for domain references
- Blog post HTML files - Update canonical URLs
- Any hardcoded URL references in scripts

---

## Phase 7: Verification & Testing

### 7.1 Visual Verification
- [ ] Logo displays correctly in header
- [ ] Logo displays correctly in footer
- [ ] Brand colors applied throughout site
- [ ] Favicon displays correctly
- [ ] OG image is correct for social sharing

### 7.2 Content Verification
- [ ] No "DirektOnline" references in visible content
- [ ] Company name "CB Handels GmbH" appears correctly
- [ ] Address and contact info correct (Reichenfels, not Wolfsberg)
- [ ] Phone and email correct
- [ ] Social media links correct

### 7.3 Technical Verification
- [ ] Meta tags populated correctly
- [ ] Structured data (JSON-LD) updated
- [ ] All URLs point to cbhandel.at
- [ ] Sitemap updated
- [ ] Robots.txt updated
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Cross-browser testing

---

## Implementation Priority

### High Priority (Must Do)
1. ✅ Update CSS brand colors (Phase 1)
2. ✅ Replace logo files (Phase 2.1)
3. ✅ Update logo alt text (Phase 2.2)
4. ✅ Update HTML meta tags (Phase 3.1)
5. ✅ Update CSS comments (Phase 3.2)

### Medium Priority (Should Do)
6. Update blog posts (Phase 4)
7. Update domain references (Phase 6)
8. Update favicon and OG image (Phase 2.3-2.4)

### Low Priority (Nice to Have)
9. Update documentation files (Phase 5)
10. Update test files (Phase 5.2)

---

## Files Summary

### Files Requiring User Assets
- `assets/logo.png` - **User must provide**
- `assets/logo.svg` - **User must provide**
- `assets/favicon.svg` - **User must provide (if needed)**
- `assets/og-image.jpg` - **User must provide**

### Files Requiring Code Updates
- `styles.css` - Brand colors
- `index.html` - Meta tags, logo alt text
- `scripts.js` - Comments, fallback strings
- `posts/*.html` - Blog content
- `posts/*.md` - Blog content
- `sitemap.xml` - URLs
- `sitemap.html` - Content
- `robots.txt` - URLs
- Various documentation files

---

## Next Steps

1. **Get assets from user:**
   - CB Handels GmbH logo (PNG and SVG)
   - Favicon (if needed)
   - OG image for social sharing

2. **Execute code updates:**
   - Start with high-priority items
   - Test after each phase
   - Verify on local server before deployment

3. **Final review:**
   - Complete visual inspection
   - Content audit
   - Technical verification
   - Cross-browser testing

---

## Notes

- The configuration system (`dealerConfig.js`) is already set up correctly for CB Handels GmbH
- Most dynamic content is already pulling from config files
- Focus on hardcoded references and visual assets
- Some files (like CHANGELOG.md) may intentionally keep historical references - review case by case

