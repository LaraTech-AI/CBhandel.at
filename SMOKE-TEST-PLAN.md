# 🔥 Smoke Test Plan - DirektOnline BS GmbH Website

**Purpose**: Verify core functionality and critical user flows work correctly across the entire website.

**Test Environment**: Production URL (or staging if available)  
**Estimated Duration**: 15-20 minutes  
**Test Frequency**: After major deployments, before releases, weekly checks

---

## 📋 Pre-Test Checklist

- [ ] Clear browser cache and cookies
- [ ] Test in latest Chrome/Firefox/Safari
- [ ] Test on mobile device (iOS/Android) or browser DevTools mobile emulation
- [ ] Ensure all environment variables are configured (email, API keys)
- [ ] Check Vercel deployment logs for any errors
- [ ] Verify API endpoints are accessible

---

## 🌐 1. Page Load & Basic Structure

### 1.1 Initial Page Load
- [ ] **Page loads without errors** - Check browser console for JavaScript errors
- [ ] **Favicon displays** - Verify `/assets/favicon.svg` appears in browser tab
- [ ] **Logo displays** - Verify `/assets/logo.png` loads in header
- [ ] **Page title is correct** - "DirektOnline BS GmbH – Ihr Autohandel in Wolfsberg, Lavanttal, Kärnten"
- [ ] **Meta description is present** - Check via view-source or DevTools
- [ ] **All CSS loads** - No broken styles, page renders correctly
- [ ] **All JavaScript loads** - No 404 errors for `scripts.js`
- [ ] **Page scrolls smoothly** - No layout shifts or jumps

### 1.2 Initial State
- [ ] **Page loads in light mode by default**
- [ ] **Hero section is visible** - First viewport shows hero content
- [ ] **Navigation menu is visible** - All menu items render
- [ ] **No console errors** - Browser console is clean (except expected filtered errors)

---

## 🧭 2. Navigation & Menu

### 2.1 Desktop Navigation
- [ ] **All navigation links work**
  - [ ] Home (#hero)
  - [ ] Fahrzeuge (#fahrzeuge)
  - [ ] Über uns (#ueber)
  - [ ] Leistungen (#services)
  - [ ] Blog (#blog)
  - [ ] Kontakt (#kontakt)
  - [ ] FAQ (#faq)
  - [ ] Impressum (#impressum)
- [ ] **Smooth scroll works** - Clicking nav links smoothly scrolls to sections
- [ ] **Active section highlights** - Navigation link reflects current section (if implemented)
- [ ] **Sticky header behavior** - Header remains visible on scroll, shrinks if implemented
- [ ] **Logo link works** - Clicking logo scrolls to top (#hero)

### 2.2 Mobile Navigation
- [ ] **Mobile menu toggle button appears** - Hamburger icon visible on mobile (<768px)
- [ ] **Menu opens on click** - Toggle button expands/collapses mobile menu
- [ ] **Menu closes on link click** - Clicking nav link closes mobile menu
- [ ] **Menu closes on backdrop click** - Clicking outside closes menu
- [ ] **All navigation links work on mobile** - Each link navigates correctly

### 2.3 Search Functionality
- [ ] **Header search appears** - Search icon/input visible in header
- [ ] **Search opens modal** - Clicking search triggers search interface
- [ ] **Vehicle search works** - Typing in search shows vehicle results dropdown

---

## 🎨 3. Theme & Visual Features

### 3.1 Dark/Light Mode Toggle
- [ ] **Dark mode toggle button is visible** - Toggle button in header
- [ ] **Toggle switches themes** - Clicking changes between light/dark
- [ ] **Theme persists** - Refresh page, theme preference is remembered (localStorage)
- [ ] **All sections render correctly in dark mode** - No broken styles
- [ ] **All sections render correctly in light mode** - No broken styles
- [ ] **Toggle works on mobile** - Theme toggle functions on mobile devices

---

## 🚗 4. Vehicles Section (#fahrzeuge)

### 4.1 Vehicle Display
- [ ] **Vehicles section loads** - Section is visible when scrolling or navigating
- [ ] **Vehicles load from API** - `/api/vehicles` endpoint returns data
- [ ] **Vehicle cards display** - At least one vehicle card is visible
- [ ] **Vehicle images load** - Images display or skeleton loading shows
- [ ] **Vehicle details show** - Price, title, specifications visible
- [ ] **No broken images** - All vehicle images have fallback or error handling

### 4.2 Vehicle Interactions
- [ ] **Vehicle quick view works** - Clicking "Quick View" opens modal
- [ ] **Quick view modal displays vehicle details** - All info shows correctly
- [ ] **Quick view modal closes** - X button or backdrop click closes modal
- [ ] **Vehicle inquiry form opens** - "Inquiry" button opens inquiry modal
- [ ] **Vehicle inquiry form submits** - Form validation and submission work
- [ ] **Compare feature works** - "Compare" button adds vehicle to comparison (if implemented)
- [ ] **Share button works** - "Share" button opens share modal with social options

### 4.3 Vehicle Search & Filtering
- [ ] **Vehicle search input works** - Typing filters vehicles in real-time
- [ ] **Search results display** - Matching vehicles show in dropdown/results
- [ ] **Search clears** - Clear button or ESC key resets search
- [ ] **Sorting works** - Sort dropdown filters vehicles by price, name, etc.

### 4.4 Vehicle iframe (Willhaben)
- [ ] **Iframe loads** - Willhaben search iframe is visible
- [ ] **Iframe tabs work** - Switching between tabs changes iframe content
- [ ] **Iframe expand/collapse works** - Height control functions correctly

---

## 📝 5. Blog Section (#blog)

### 5.1 Blog Display
- [ ] **Blog section loads** - Section visible when navigating to #blog
- [ ] **Blog posts display** - At least 3 blog posts visible (from `/posts/` directory)
- [ ] **Blog post images load** - Featured images display correctly
- [ ] **Blog post previews show** - Title, excerpt, read-time visible
- [ ] **Category navigation works** - Filtering by category shows relevant posts

### 5.2 Blog Interactions
- [ ] **Blog post links work** - Clicking post opens full article
- [ ] **Blog post content displays** - Full article renders with formatting
- [ ] **Back to blog link works** - Return navigation functions
- [ ] **Share functionality works** - Social share buttons function

---

## 👥 6. Über Uns / Services / Process Sections

### 6.1 About Section (#ueber)
- [ ] **Section loads** - Content is visible
- [ ] **Team members display** - Profiles show with images and bios
- [ ] **Facilities section shows** - Image cards display correctly
- [ ] **Statistics animate** - Counters count up on scroll (if implemented)

### 6.2 Services Section (#services)
- [ ] **Services display** - All service cards visible
- [ ] **Service cards are interactive** - Hover effects work (if implemented)
- [ ] **Service links work** - CTA buttons navigate or trigger actions

### 6.3 Process Section
- [ ] **5-step process displays** - All steps visible with indicators
- [ ] **Step descriptions readable** - Text is clear and formatted

### 6.4 Testimonials
- [ ] **Testimonials slider loads** - Reviews display in slider
- [ ] **Slider auto-plays** - Auto-rotation works (if enabled)
- [ ] **Previous/Next buttons work** - Manual navigation functions
- [ ] **Testimonials are readable** - Text and author info visible

---

## ❓ 7. FAQ Section (#faq)

### 7.1 FAQ Display
- [ ] **FAQ section loads** - Section visible when navigating to #faq
- [ ] **All FAQ items visible** - At least 8 questions display
- [ ] **Accordion works** - Clicking question expands/collapses answer
- [ ] **Only one FAQ open at a time** - Accordion behavior is correct
- [ ] **Smooth animations** - Expand/collapse animations are smooth
- [ ] **Keyboard navigation works** - Tab and Enter key operate accordion

---

## 📧 8. Contact & Forms

### 8.1 Contact Section (#kontakt)
- [ ] **Contact section loads** - Section visible
- [ ] **Contact information displays** - Phone, email, address visible
- [ ] **Google Maps displays** - Map iframe or embed loads (if implemented)
- [ ] **Contact form is visible** - Form fields render correctly

### 8.2 Contact Form Submission
- [ ] **Form validation works**
  - [ ] Required fields show error if empty
  - [ ] Email format validation works
  - [ ] Phone format validation works (if implemented)
- [ ] **Form submits successfully** - Valid data sends to `/api/contact`
- [ ] **Success message displays** - Confirmation message shows after submission
- [ ] **Error handling works** - Invalid submission shows error message
- [ ] **Rate limiting works** - Multiple rapid submissions are limited (5/hour)
- [ ] **Email received** - Check inbox for customer inquiry email
- [ ] **Auto-reply sent** - Customer receives confirmation email

### 8.3 Newsletter Subscription
- [ ] **Newsletter form visible** - Footer or dedicated section shows form
- [ ] **Email input works** - Can type email address
- [ ] **Newsletter submits** - Form sends to `/api/newsletter`
- [ ] **Confirmation message shows** - Success/error message displays
- [ ] **Email received** - Confirmation email sent to subscriber
- [ ] **Duplicate prevention** - Same email not subscribed twice (if implemented)

### 8.4 Appointment Booking
- [ ] **Appointment booking button visible** - CTA button or link available
- [ ] **Booking modal opens** - Clicking opens appointment form
- [ ] **Date picker works** - Can select date for appointment
- [ ] **Time selection works** - Can select time slot
- [ ] **Form fields work** - Name, email, phone, message inputs function
- [ ] **Form submits** - Valid data sends to `/api/appointment`
- [ ] **Confirmation shows** - Success message displays
- [ ] **Email received** - Appointment confirmation email sent
- [ ] **Date validation works** - Past dates and invalid dates are rejected

---

## 💰 9. Interactive Calculators

### 9.1 Financing Calculator
- [ ] **Calculator opens** - Button/link triggers calculator modal
- [ ] **Input fields work** - Vehicle price, down payment, term, interest rate
- [ ] **Calculation works** - Monthly payment calculates correctly
- [ ] **Results display** - Payment breakdown shows
- [ ] **Calculator resets** - Clear button or form reset works

### 9.2 Trade-in Calculator
- [ ] **Trade-in calculator opens** - Button/link triggers calculator
- [ ] **Input fields work** - Vehicle details, condition, mileage
- [ ] **Estimate calculates** - Trade-in value shows
- [ ] **Results display** - Value breakdown visible

---

## 🔗 10. Footer & Legal

### 10.1 Footer Display
- [ ] **Footer loads** - Footer section visible at bottom of page
- [ ] **Footer links work** - All footer navigation links function
- [ ] **Social media links work** - Links to social profiles open correctly (if implemented)
- [ ] **Copyright info displays** - Current year and company name visible

### 10.2 Impressum Section (#impressum)
- [ ] **Impressum section loads** - Legal section accessible
- [ ] **Company information displays** - Address, registration, contact info visible
- [ ] **All required legal info present** - GDPR compliance, privacy info (if applicable)

---

## 📱 11. Responsive Design

### 11.1 Mobile (< 768px)
- [ ] **Layout adapts** - Content stacks vertically
- [ ] **Mobile menu works** - Navigation accessible via hamburger
- [ ] **Touch interactions work** - Buttons/links respond to touch
- [ ] **Images scale correctly** - No horizontal scrolling
- [ ] **Forms work** - All form inputs usable on mobile
- [ ] **Modals display correctly** - Full-screen or properly sized
- [ ] **Text is readable** - Font sizes are appropriate

### 11.2 Tablet (768px - 1024px)
- [ ] **Layout adapts** - Content arranged for tablet
- [ ] **Navigation works** - Menu functions correctly
- [ ] **Interactive elements work** - Cards, buttons, forms function

### 11.3 Desktop (> 1024px)
- [ ] **Full layout displays** - Multi-column layouts work
- [ ] **Hover effects work** - Hover states function on interactive elements
- [ ] **All features accessible** - No mobile-only features missing

---

## ⚡ 12. Performance & API

### 12.1 API Endpoints
- [ ] **Vehicles API** - `/api/vehicles` returns 200 status
- [ ] **Contact API** - `/api/contact` accepts POST requests
- [ ] **Newsletter API** - `/api/newsletter` accepts POST requests
- [ ] **Appointment API** - `/api/appointment` accepts POST requests
- [ ] **API error handling** - Failed API calls show user-friendly errors

### 12.2 Loading Performance
- [ ] **Page loads in < 3 seconds** - Initial page load time acceptable
- [ ] **Images lazy load** - Images load as you scroll (if implemented)
- [ ] **No layout shifts** - Content doesn't jump around during load
- [ ] **Skeleton loaders work** - Loading states display for async content

### 12.3 Caching
- [ ] **Static assets cached** - CSS, JS, images cached by browser
- [ ] **API responses cached** - Vehicle data cached appropriately (1 hour)

---

## ♿ 13. Accessibility

### 13.1 Keyboard Navigation
- [ ] **Tab navigation works** - Can tab through all interactive elements
- [ ] **Focus indicators visible** - Focus states clearly shown
- [ ] **Enter/Space activate** - Buttons and links activate with keyboard
- [ ] **ESC closes modals** - Modal dialogs close with Escape key
- [ ] **Skip links work** - Skip to main content works (if implemented)

### 13.2 ARIA & Semantics
- [ ] **ARIA labels present** - Screen reader labels on interactive elements
- [ ] **Semantic HTML** - Proper use of header, nav, main, section, footer
- [ ] **Alt text on images** - All images have descriptive alt attributes
- [ ] **Form labels associated** - All form inputs have associated labels

---

## 🎯 14. Critical User Flows (End-to-End)

### 14.1 Vehicle Inquiry Flow
1. [ ] Navigate to #fahrzeuge section
2. [ ] Find a vehicle card
3. [ ] Click "Quick View" or "Inquiry"
4. [ ] Fill out inquiry form with valid data
5. [ ] Submit form
6. [ ] Verify success message
7. [ ] Check email for confirmation

### 14.2 Contact Form Flow
1. [ ] Navigate to #kontakt section
2. [ ] Fill out contact form (name, email, message)
3. [ ] Submit form
4. [ ] Verify success message
5. [ ] Check email inbox for inquiry
6. [ ] Verify auto-reply sent to customer

### 14.3 Newsletter Subscription Flow
1. [ ] Scroll to footer or newsletter section
2. [ ] Enter valid email address
3. [ ] Submit newsletter form
4. [ ] Verify success message
5. [ ] Check email for confirmation

### 14.4 Appointment Booking Flow
1. [ ] Click appointment booking button/CTA
2. [ ] Select date (future date)
3. [ ] Select time slot
4. [ ] Fill out form (name, email, phone, message)
5. [ ] Submit appointment request
6. [ ] Verify confirmation message
7. [ ] Check email for appointment confirmation

### 14.5 Blog Reading Flow
1. [ ] Navigate to #blog section
2. [ ] Click on a blog post
3. [ ] Verify full article displays
4. [ ] Navigate back to blog list
5. [ ] Filter by category
6. [ ] Verify filtered results display

---

## 🐛 15. Error Handling

### 15.1 API Failures
- [ ] **Vehicles API failure** - Shows error message or fallback content
- [ ] **Contact form API failure** - Shows user-friendly error message
- [ ] **Newsletter API failure** - Shows appropriate error message
- [ ] **Appointment API failure** - Shows error with retry option

### 15.2 Network Issues
- [ ] **Offline handling** - Website degrades gracefully (if implemented)
- [ ] **Slow connection** - Loading states show during slow loads
- [ ] **Timeout handling** - Long-running requests timeout appropriately

### 15.3 Invalid Input
- [ ] **Form validation** - All forms validate input before submission
- [ ] **Error messages** - Clear, helpful error messages display
- [ ] **XSS prevention** - Special characters handled correctly

---

## 📊 16. Browser Console Check

### 16.1 Console Errors
- [ ] **No JavaScript errors** - Console is clean (except expected filtered errors)
- [ ] **No 404 errors** - All resources load correctly
- [ ] **No CORS errors** - API calls don't show CORS issues
- [ ] **No network failures** - All API requests succeed

### 16.2 Console Warnings
- [ ] **Minimal warnings** - No critical warnings that affect functionality
- [ ] **Deprecation warnings** - Note any deprecation warnings for future updates

---

## ✅ Post-Test Checklist

- [ ] Document any failures found
- [ ] Take screenshots of errors (if any)
- [ ] Note browser/device used for testing
- [ ] Record test execution time
- [ ] Update test results in tracking system (if applicable)
- [ ] Report critical issues immediately

---

## 📝 Test Results Template

**Test Date**: _______________  
**Tested By**: _______________  
**Browser**: Chrome/Firefox/Safari v_______  
**Device**: Desktop/Mobile/Tablet - Model _______  
**Environment**: Production/Staging  
**URL**: _______________  

### Summary
- **Total Tests**: ___
- **Passed**: ___
- **Failed**: ___
- **Blocked**: ___

### Critical Issues Found
1. [Issue description]
2. [Issue description]

### Minor Issues Found
1. [Issue description]
2. [Issue description]

### Notes
[Any additional observations or comments]

---

## 🔄 Smoke Test Execution Frequency

- **After every deployment** - Critical smoke test (15-20 tests)
- **Before releases** - Full smoke test (all tests)
- **Weekly** - Quick sanity check (priority sections only)
- **After major feature updates** - Full smoke test + new feature tests

---

## 🎯 Quick Smoke Test (5 minutes)

For rapid checks, focus on these critical tests:

1. ✅ Page loads without errors
2. ✅ Navigation works (all links)
3. ✅ Mobile menu works
4. ✅ Vehicles section loads vehicles from API
5. ✅ Contact form submits successfully
6. ✅ Newsletter form works
7. ✅ Dark/light mode toggle works
8. ✅ No console errors
9. ✅ Responsive on mobile
10. ✅ All sections accessible

---

**Last Updated**: [Current Date]  
**Version**: 1.0

