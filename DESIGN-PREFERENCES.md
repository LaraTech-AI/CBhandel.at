# Design Preferences & Style Guide

## Overview
This document captures the preferred design style and aesthetic for the DirektOnline website. Use this as a reference when making design improvements or additions.

## Preferred Design Style

### **Card-Based Sections with Modern Glassmorphism**
The owner prefers card-based layouts with modern design elements including:

#### **Key Characteristics:**
- **Card containers** with subtle gradient backgrounds using brand color hints
- **Bordered cards** with brand color accents (rgba of brand-primary)
- **Layered shadows** for depth and visual hierarchy
- **Decorative accent elements** (e.g., top border gradients)
- **Smooth hover effects** with subtle lift animations
- **Icon badges** with gradient backgrounds and gentle pulse animations

#### **Visual Hierarchy:**
1. **Prominent Icon** - Large, styled icon in a gradient badge container
2. **Clear Heading** - Bold, descriptive title
3. **Supporting Text** - Helpful description text
4. **Primary CTA Button** - Prominent, well-styled action button

### **Color & Visual Elements:**
- Subtle gradients: `linear-gradient(135deg, rgba(brand-primary-rgb, 0.06) 0%, rgba(brand-primary-rgb, 0.03) 50%, rgba(brand-primary-rgb, 0.06) 100%)`
- Border colors: `rgba(brand-primary-rgb, 0.15)` to `rgba(brand-primary-rgb, 0.25)` on hover
- Multiple shadow layers for depth
- Inset highlights for glass-like effect
- Decorative gradient top borders (3px height, centered gradient)

### **Animation & Interactions:**
- Gentle pulse animations for icons (3s ease-in-out infinite)
- Smooth hover transitions with `translateY(-2px)` lift effect
- Shadow intensification on hover
- Border color transitions

### **Spacing & Layout:**
- Generous padding: `2.5rem 2rem` (desktop), `2rem 1.5rem` (mobile)
- Proper gaps between elements: `1.5rem`
- Centered content alignment
- Full-width buttons on mobile, min-width on desktop

### **Example Implementation:**
The appointment booking section (appointment-cta) serves as the reference implementation for this preferred style:

```css
/* Card container with gradient background */
.appointment-cta-content {
  background: linear-gradient(135deg, rgba(brand-primary-rgb, 0.06) 0%, ...);
  border: 2px solid rgba(brand-primary-rgb, 0.15);
  border-radius: 16px;
  box-shadow: [multiple layers];
  /* Decorative top border */
  /* Hover effects with transform */
}

/* Icon badge */
.appointment-cta-icon {
  background: linear-gradient(135deg, brand-primary, brand-primary-light);
  border-radius: 16px;
  animation: pulse-gentle 3s ease-in-out infinite;
}

/* Primary button */
.appointment-btn {
  box-shadow: [brand-colored shadows];
  /* Hover lift effect */
}
```

## Design Principles

1. **Visual Separation** - Important sections should be clearly separated from surrounding content
2. **Centered & Balanced** - Content should be properly centered and visually balanced
3. **Modern & Polished** - Use contemporary design patterns with attention to detail
4. **Brand Consistency** - Incorporate brand colors subtly throughout
5. **Intuitive UX** - Make actions clear and easy to understand
6. **Responsive First** - Ensure mobile experience is excellent

## When to Apply This Style

Apply this card-based, gradient-enhanced style to:
- Important call-to-action sections
- Feature highlights
- Service offerings
- Any section that needs visual prominence
- Conversion-focused areas

## Notes

- Date of preference establishment: October 2025
- Reference implementation: Contact section appointment booking CTA
- Style aligns with modern web design trends while maintaining brand identity

