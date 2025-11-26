# Manual Testing Guide - DirektOnline Website

**Date:** 2025-11-01  
**Purpose:** Manual visual and functional testing before launch

## 🚀 Starting Local Server

```bash
npm run dev
```

Server will start at: **http://localhost:3000**

## ✅ Checklist for Manual Testing

### 1. Homepage Load & Visual Check

- [ ] **Page loads without errors**
  - Open http://localhost:3000
  - Check browser console (F12) - should be mostly clean
  - Page should load smoothly

- [ ] **Warranty asterisk visible**
  - Scroll to "Garantie & Service" section
  - Verify "12 Monate Garantie*" shows asterisk
  - Click on service card - asterisk should be visible

- [ ] **Footer warranty disclaimer**
  - Scroll to very bottom of page
  - Look for small text with asterisk: "* Garantiehinweis: ..."
  - Verify disclaimer is readable and complete

### 2. Blog Section Tests

- [ ] **Blog post dates correct**
  - Navigate to blog section
  - Verify all blog cards show "1. November 2025"
  - Dates should be consistent

- [ ] **Blog post opens correctly**
  - Click on "Der richtige Zeitpunkt für den Reifenwechsel"
  - Should open in same tab (or new tab based on link)
  - Verify modern design loads:
    - ✅ Clean header with category badge
    - ✅ Large readable title
    - ✅ Professional typography
    - ✅ Styled images
    - ✅ "Zurück zur Übersicht" button at bottom

- [ ] **All blog posts test**
  - Test "Gebrauchtwagen kaufen" blog post
  - Test "E-Mobilität in Kärnten" blog post
  - Each should have same modern design

- [ ] **Blog navigation**
  - Click "Zurück zur Übersicht" button
  - Should return to homepage blog section
  - URL should be correct

### 3. Form Functionality Tests

#### Contact Form
- [ ] **Navigate to contact section**
  - Scroll to contact section or click contact link
  - Find contact form

- [ ] **Submit contact form**
  - Fill in: Name, Email, Message
  - Check privacy checkbox
  - Click submit
  - **Expected:** Mail client opens with pre-filled email
  - **NOT Expected:** Form submission to API

#### Appointment Form
- [ ] **Open appointment modal**
  - Click "Termin vereinbaren" button (or similar)
  - Modal should open

- [ ] **Fill appointment form**
  - Enter name, email, phone
  - Select date (future date)
  - Select time
  - Choose service type
  - Check privacy checkbox
  - Submit

- [ ] **Expected result**
  - Mail client opens with formatted appointment details
  - No API call should occur

#### Newsletter Form
- [ ] **Test newsletter in footer**
  - Scroll to footer
  - Enter email address
  - Check privacy checkbox
  - Submit

- [ ] **Expected result**
  - If configured: API call happens
  - If not configured: Mailto fallback opens
  - Form should work either way

### 4. Responsive Design Tests

- [ ] **Mobile view**
  - Open browser DevTools (F12)
  - Toggle device toolbar (Ctrl+Shift+M)
  - Select iPhone or similar mobile device
  - Verify:
    - Navigation collapses to hamburger menu
    - Blog posts stack vertically
    - Forms are usable on mobile
    - Warranty disclaimer readable on mobile

- [ ] **Tablet view**
  - Test at tablet breakpoint (768px)
  - Verify layout adapts correctly

### 5. Browser Compatibility

Test in multiple browsers:
- [ ] **Chrome/Edge** (Chromium)
- [ ] **Firefox**
- [ ] **Safari** (if available)
- [ ] **Mobile browser** (iOS Safari or Chrome Mobile)

### 6. Accessibility Checks

- [ ] **Keyboard navigation**
  - Use Tab key to navigate
  - All interactive elements should be accessible
  - Focus indicators visible

- [ ] **Screen reader** (optional)
  - If you have screen reader, test basic navigation
  - Warranty disclaimer should be announced

### 7. Performance Check

- [ ] **Page load speed**
  - Open DevTools → Network tab
  - Hard refresh (Ctrl+F5)
  - Check load time
  - Should be fast (under 3 seconds on good connection)

- [ ] **Blog post load speed**
  - Click blog post
  - Should load quickly
  - Images should lazy load

## 🐛 Common Issues to Watch For

### If blog posts don't load:
- Check browser console for errors
- Verify `posts/blog-styles.css` exists
- Check image paths (should be `../assets/...`)

### If forms don't open mailto:
- Check browser allows mailto links
- Some browsers may block or prompt
- Test in different browser

### If warranty asterisk not visible:
- Check if CSS loaded correctly
- Verify HTML contains `Garantie*` (with asterisk)
- Check font rendering

## ✅ Quick Smoke Test (5 minutes)

If short on time, test these critical items:

1. ✅ Homepage loads
2. ✅ Warranty asterisk visible in service section
3. ✅ Footer disclaimer present
4. ✅ One blog post opens with modern design
5. ✅ Contact form opens mailto (or shows expected behavior)
6. ✅ Mobile responsive (quick check)

## 📊 Expected Results

All tests should pass. If any fail:
- Note the issue
- Check browser console for errors
- Verify file paths are correct
- Check that local server is running correctly

---

**After manual testing, if all passes, the site is ready for production!** ✅

