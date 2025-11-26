# 🔥 Smoke Test Quick Checklist - DirektOnline BS GmbH

**Quick Reference** - Check off as you test

## Core Functionality (Must Pass)

### Page Load
- [ ] Page loads, no console errors
- [ ] Logo and favicon display
- [ ] All sections visible

### Navigation
- [ ] All nav links work (#hero, #fahrzeuge, #ueber, #services, #blog, #kontakt, #faq, #impressum)
- [ ] Mobile menu opens/closes
- [ ] Smooth scroll works

### Theme
- [ ] Dark/light mode toggle works
- [ ] Theme persists on refresh

### Vehicles
- [ ] Vehicles load from API
- [ ] Quick view modal works
- [ ] Vehicle inquiry form submits
- [ ] Vehicle search works

### Forms
- [ ] Contact form submits → Success message + Email received
- [ ] Newsletter form submits → Success message + Email received
- [ ] Appointment booking submits → Success message + Email received

### Interactive Features
- [ ] FAQ accordion expands/collapses
- [ ] Testimonials slider works
- [ ] Blog posts display and link work
- [ ] Share modal works
- [ ] Calculators (financing, trade-in) work

### Responsive
- [ ] Mobile layout works (< 768px)
- [ ] Tablet layout works (768-1024px)
- [ ] Desktop layout works (> 1024px)

### API Endpoints
- [ ] `/api/vehicles` - Returns 200
- [ ] `/api/contact` - Accepts POST
- [ ] `/api/newsletter` - Accepts POST
- [ ] `/api/appointment` - Accepts POST

---

## Quick Test (5 min)
1. Page loads ✓
2. Click all nav links ✓
3. Test mobile menu ✓
4. Vehicles load ✓
5. Submit contact form ✓
6. Dark mode toggle ✓
7. No console errors ✓

---

**Test Date**: _______ | **Browser**: _______ | **Result**: Pass / Fail

