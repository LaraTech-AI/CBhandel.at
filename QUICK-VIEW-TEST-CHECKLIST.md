# Quick View Modal Test Checklist

## Test URL

https://direktonline-z91ka12pw-laratechs-projects.vercel.app/

## Desktop Viewport Test (1920x1080 or similar)

### Test 1: Basic Modal Functionality

- [ ] Navigate to the vehicles section
- [ ] Click the quick view button (eye icon) on any vehicle card
- [ ] Verify modal opens immediately (no delay)
- [ ] Verify modal shows initial images from API (usually 3 images)
- [ ] Verify vehicle title, price, and specs are displayed correctly

### Test 2: Image Display

- [ ] Check that all initial images are displayed as thumbnails
- [ ] Verify main image displays correctly
- [ ] Click on different thumbnails - verify main image updates
- [ ] Use arrow buttons to navigate images
- [ ] Check console logs for: "Initial X images. Will be enhanced by details API..."
- [ ] Wait for vehicle-details API to load (check network tab)
- [ ] Verify additional images appear in thumbnails (should see more than 3)
- [ ] Verify no "Kein Bild Vorhanden" placeholder images appear
- [ ] Verify all images load correctly (no broken image icons)
- [ ] Check console logs for: "Got X images from details API, total: Y images"

### Test 3: Image Navigation

- [ ] Use previous/next arrow buttons on main image
- [ ] Use keyboard arrow keys (← →) to navigate
- [ ] Click thumbnails to jump to specific images
- [ ] Verify active thumbnail is highlighted
- [ ] Test navigation when many images are present (10+ images)

### Test 4: Modal Closing

- [ ] Click X button to close modal
- [ ] Click outside modal (backdrop) to close
- [ ] Press ESC key to close
- [ ] Open modal, close within 1 second - verify console shows "Cancelled pending image fetch"
- [ ] Open another vehicle immediately - verify previous fetch was cancelled

### Test 5: Deep Link Navigation

- [ ] Navigate to: `#fahrzeuge/vehicle/1585107738` (or any valid vehicle ID)
- [ ] Verify modal opens automatically with correct vehicle
- [ ] Verify images load correctly via deep link

## Mobile Viewport Test (375x667 - iPhone SE or similar)

### Test 6: Mobile Layout

- [ ] Resize browser to mobile viewport (375x667)
- [ ] Navigate to vehicles section
- [ ] Open quick view modal
- [ ] Verify modal layout adapts to mobile (stacked layout)
- [ ] Verify images are still visible and navigable
- [ ] Verify thumbnails scroll horizontally if needed

### Test 7: Mobile Touch Interactions

- [ ] Swipe on main image (if swipe gesture implemented)
- [ ] Tap thumbnails to change main image
- [ ] Verify touch targets are large enough (minimum 44x44px)
- [ ] Test closing modal with X button (easy to tap)
- [ ] Test backdrop tap to close

### Test 8: Mobile Performance

- [ ] Open modal quickly and close immediately (< 1 second)
- [ ] Verify fetch is cancelled (check console)
- [ ] Open multiple vehicles in quick succession
- [ ] Verify no memory leaks or performance issues

## Cross-Browser Tests

### Test 9: Browser Compatibility

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Console Checks

Open browser DevTools Console and verify:

### Expected Console Messages (Success Case):

```
Quick View: Found 3 images for vehicle [ID]
Quick View: Initial 3 images. Will be enhanced by details API...
Fetched vehicle details: [object]
Quick View: Got X images from details API, total: Y images
```

### Expected Console Messages (Modal Closed Early):

```
Quick View: Showing X images immediately. Will fetch more after 4 seconds...
Quick View: Cancelled pending image fetch (modal closed early)
```

### Error Cases to Check:

- [ ] If vehicle-details API fails, verify graceful fallback
- [ ] If images fail to load, verify placeholder/error handling
- [ ] Verify no JavaScript errors in console

## Network Tab Verification

- [ ] Initial page load: `/api/vehicles` called
- [ ] Quick view opened: `/api/vehicle-details?vid=[ID]` called
- [ ] Verify images are loaded from correct domains:
  - `cache.willhaben.at`
  - `direktonline.motornetzwerk.at`
- [ ] Check for any failed image requests (404, 403, etc.)
- [ ] Verify CORS headers are correct for image requests

## Edge Cases

### Test 10: Special Scenarios

- [ ] Vehicle with only 1 image - verify it displays correctly
- [ ] Vehicle with 20+ images - verify all are accessible
- [ ] Vehicle with broken image URLs - verify graceful handling
- [ ] Very slow network - verify images load progressively
- [ ] Network failure during image fetch - verify no errors break the modal

## Performance Checks

- [ ] Modal opens in < 100ms
- [ ] Initial images display immediately
- [ ] Vehicle-details API response time is reasonable (< 2 seconds)
- [ ] No unnecessary re-renders
- [ ] Smooth image transitions when navigating

## Accessibility (A11y)

- [ ] Modal is keyboard navigable
- [ ] Focus trap works (can't tab outside modal)
- [ ] Screen reader announces modal title
- [ ] Images have proper alt text
- [ ] ARIA labels are correct on all buttons
