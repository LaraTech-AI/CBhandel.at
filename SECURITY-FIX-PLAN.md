# Security Fix Implementation Plan

## 🎯 Objectives
- Fix all identified security vulnerabilities
- Maintain or improve performance
- Avoid introducing new security issues
- Preserve existing functionality

---

## ❓ Questions Before Implementation

### 1. Google Sheets Webhook Integration
**Current State:** Secret token is hardcoded in `scripts.js` (client-side)

**Question:** Do you want to:
- **Option A:** Move the entire Google Sheets webhook call to a serverless function (recommended - most secure)
- **Option B:** Keep client-side call but remove the token requirement (less secure, but simpler)

**Recommendation:** Option A - Create `api/newsletter-sheets.js` serverless function

### 2. CORS Configuration
**Current State:** All APIs allow `*` origin

**Question:** What are your allowed origins?
- Production: `https://direktonline.at` and `https://www.direktonline.at`?
- Development: `http://localhost:3000` or other local URLs?
- Any other domains/subdomains?

### 3. Performance Considerations
**Question:** Are you using a CDN or any caching strategy for static assets?
- This affects how we'll include DOMPurify (CDN vs npm)

### 4. Dependency Updates
**Question:** The `vercel` package has vulnerabilities. Are you ready to:
- Upgrade from `48.6.7` to latest version (may require code changes)?
- Or wait and address separately?

---

## 📋 Implementation Plan

### Phase 1: Critical Fixes (Must Do Before Production)

#### 1.1 Remove Hardcoded Secret Token ⚠️ CRITICAL

**Current Issue:**
- Token `"7866477164"` in `scripts.js:6694`
- Visible to anyone viewing page source

**Solution:**
Create new serverless function: `api/newsletter-sheets.js`

**Steps:**
1. Create `api/newsletter-sheets.js` that:
   - Accepts newsletter subscription data
   - Validates input server-side
   - Calls Google Sheets webhook with secret from env var
   - Returns success/error response

2. Update `scripts.js`:
   - Remove `SECRET_TOKEN` constant
   - Change fetch URL from Google Sheets webhook to `/api/newsletter-sheets`
   - Remove token from form data

3. Add environment variable:
   - `GOOGLE_SHEETS_SECRET` in Vercel dashboard

**Performance Impact:** 
- ✅ Positive: One less external request from client
- ✅ Reduced client-side code size
- ⚠️ Slight latency: Additional serverless function call (minimal, ~50-100ms)

**Risk Assessment:**
- ✅ Low risk: Isolated change, easy to test
- ✅ Rollback: Can revert by restoring old code

**Files to Modify:**
- `api/newsletter-sheets.js` (NEW)
- `scripts.js` (lines 6688-6770)
- `.env` documentation (README.md)

---

#### 1.2 Fix CORS Configuration ⚠️ HIGH

**Current Issue:**
- All APIs use `Access-Control-Allow-Origin: "*"`

**Solution:**
Implement origin whitelist

**Steps:**
1. Create shared CORS utility function
2. Update all API endpoints to use whitelist
3. Support development and production origins

**Implementation:**
```javascript
// Shared utility (can be in each file or separate module)
function setCORSHeaders(req, res) {
  const allowedOrigins = [
    'https://direktonline.at',
    'https://www.direktonline.at',
    // Add localhost for development if needed
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
}
```

**Performance Impact:**
- ✅ No negative impact
- ✅ Slightly faster (no wildcard matching)

**Risk Assessment:**
- ⚠️ Medium risk: Need to ensure all origins are included
- ✅ Test: Verify from production domain

**Files to Modify:**
- `api/contact.js`
- `api/appointment.js`
- `api/newsletter.js`
- `api/newsletter-confirm.js`
- `api/vehicles.js`
- `api/vehicle-details.js`
- `api/newsletter-sheets.js` (new file)

---

#### 1.3 Implement XSS Protection with DOMPurify ⚠️ HIGH

**Current Issue:**
- Multiple `innerHTML` uses with potentially untrusted data
- `escapeHtml()` function exists but not used consistently

**Solution:**
1. Add DOMPurify library
2. Replace unsafe `innerHTML` with sanitized versions
3. Keep `escapeHtml()` for text-only contexts

**Library Choice:**
- **DOMPurify** (recommended)
  - ✅ Industry standard, actively maintained
  - ✅ Fast (~1ms for typical content)
  - ✅ Small bundle size (~45KB minified, ~15KB gzipped)
  - ✅ Works in browser (no Node.js needed for client-side)

**Implementation Options:**

**Option A: CDN (Recommended for Performance)**
```html
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.8/dist/purify.min.js"></script>
```
- ✅ No build step needed
- ✅ Can be cached by CDN
- ✅ Faster initial load

**Option B: npm package**
```bash
npm install dompurify
```
- ⚠️ Requires build step
- ⚠️ Larger bundle size

**Recommendation:** Option A (CDN) for better performance

**Code Changes:**

1. Add DOMPurify to `index.html`:
```html
<!-- Add before closing </head> or before scripts.js -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.8/dist/purify.min.js" integrity="sha384-..." crossorigin="anonymous"></script>
```

2. Update `scripts.js` - Replace unsafe innerHTML:

**Before:**
```javascript
descEl.innerHTML = `<div class="description-content">${formattedDescription}</div>`;
```

**After:**
```javascript
const sanitizedDescription = DOMPurify.sanitize(formattedDescription, {
  ALLOWED_TAGS: ['strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  ALLOWED_ATTR: ['class']
});
descEl.innerHTML = `<div class="description-content">${sanitizedDescription}</div>`;
```

**Locations to Update:**
- Line 3429: Vehicle description
- Line 3645, 3667, 3687: Specification sections
- Line 3735: Dealer information
- Other innerHTML uses with user/external data

**Performance Impact:**
- ⚠️ Small overhead: ~1-2ms per sanitization
- ✅ Mitigation: Only sanitize when needed (not for static HTML)
- ✅ CDN caching reduces load time

**Risk Assessment:**
- ✅ Low risk: DOMPurify is battle-tested
- ⚠️ Testing needed: Verify HTML rendering still works correctly

**Files to Modify:**
- `index.html` (add DOMPurify script)
- `scripts.js` (multiple locations)

---

#### 1.4 Enhance Input Sanitization ⚠️ HIGH

**Current Issue:**
- `sanitize()` function only removes `< >` characters
- Insufficient for email injection, command injection, etc.

**Solution:**
Use proper validation library for server-side

**Library Choice:**
- **validator.js** (Node.js) - For server-side validation
- Keep simple sanitization for client-side display

**Implementation:**

1. Install validator.js:
```bash
npm install validator
```

2. Update API sanitization functions:

**Before:**
```javascript
function sanitize(input) {
  if (typeof input !== "string") return "";
  return input.trim().replace(/[<>]/g, "").substring(0, 1000);
}
```

**After:**
```javascript
const validator = require('validator');

function sanitize(input, type = 'text') {
  if (typeof input !== "string") return "";
  
  let sanitized = input.trim();
  
  // Remove control characters, null bytes
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  switch(type) {
    case 'email':
      // Validate and normalize email
      if (!validator.isEmail(sanitized)) return '';
      return validator.normalizeEmail(sanitized) || sanitized;
    
    case 'html':
      // For HTML content, remove dangerous tags
      sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
      sanitized = sanitized.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
      sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
      return sanitized.substring(0, 10000);
    
    case 'url':
      if (!validator.isURL(sanitized, { require_protocol: false })) return '';
      return sanitized;
    
    default:
      // Text: remove HTML tags and limit length
      sanitized = sanitized.replace(/[<>]/g, '');
      return sanitized.substring(0, 1000);
  }
}
```

3. Update API endpoints to use typed sanitization:
```javascript
const sanitizedEmail = sanitize(email, 'email');
const sanitizedMessage = sanitize(nachricht, 'html');
```

**Performance Impact:**
- ✅ Minimal: validator.js is fast (~0.1ms per validation)
- ✅ Better security with minimal overhead

**Risk Assessment:**
- ✅ Low risk: validator.js is well-tested
- ⚠️ Testing: Verify email normalization doesn't break valid emails

**Files to Modify:**
- `api/contact.js`
- `api/appointment.js`
- `api/newsletter.js`
- `package.json` (add validator dependency)

---

### Phase 2: Medium Priority Fixes

#### 2.1 Add Security Headers

**Solution:** Update `vercel.json`

**Add to headers:**
```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://direktonline.motornetzwerk.at https://script.google.com https://api.ipify.org;"
},
{
  "key": "Strict-Transport-Security",
  "value": "max-age=31536000; includeSubDomains"
},
{
  "key": "Permissions-Policy",
  "value": "geolocation=(), microphone=(), camera=()"
}
```

**Performance Impact:** None (headers only)

**Files to Modify:**
- `vercel.json`

---

#### 2.2 Add Query Parameter Validation

**Solution:** Validate `vid` parameter in `api/vehicle-details.js`

```javascript
const { vid } = req.query;

// Validate vid is numeric and within expected range
if (!vid || !/^\d+$/.test(vid) || vid.length > 10) {
  return res.status(400).json({ error: "Invalid vehicle ID" });
}
```

**Performance Impact:** Minimal (regex check)

**Files to Modify:**
- `api/vehicle-details.js`

---

#### 2.3 Implement CSRF Protection

**Solution:** Add CSRF token generation and validation

**Implementation:**
1. Generate token on page load (client-side)
2. Include in all POST requests
3. Validate in API endpoints

**Note:** This is more complex and may require session management. Consider if needed based on threat model.

**Performance Impact:** Minimal

**Files to Modify:**
- `index.html` (token generation)
- `scripts.js` (include token in requests)
- All POST API endpoints

---

### Phase 3: Optional Improvements

#### 3.1 Distributed Rate Limiting

**Current:** In-memory (resets on cold start)

**Solution:** Use Vercel Edge Config or external service (Upstash Redis)

**Performance Impact:**
- ⚠️ Additional external call (~10-20ms)
- ✅ Better security

**Recommendation:** Can be deferred if current rate limiting is acceptable

---

## 📊 Performance Impact Summary

| Fix | Performance Impact | Mitigation |
|-----|-------------------|------------|
| Move secret to serverless | +50-100ms latency | ✅ Reduced client bundle size |
| CORS whitelist | ✅ No impact | - |
| DOMPurify (CDN) | +1-2ms per sanitization | ✅ CDN caching, only when needed |
| Enhanced sanitization | +0.1ms per validation | ✅ Minimal overhead |
| Security headers | ✅ No impact | - |
| Query validation | +0.01ms | ✅ Negligible |

**Overall Impact:** Minimal performance impact, with some improvements (smaller client bundle)

---

## 🧪 Testing Plan

### Before Implementation:
1. ✅ Document current behavior
2. ✅ Test all forms (contact, appointment, newsletter)
3. ✅ Test vehicle display
4. ✅ Test from production domain

### After Each Phase:
1. ✅ Test form submissions
2. ✅ Test vehicle rendering
3. ✅ Test CORS from allowed origins
4. ✅ Verify no console errors
5. ✅ Performance check (Lighthouse)

### Rollback Plan:
- Each change is isolated
- Can revert individual files
- Git commits for each phase

---

## 📝 Implementation Order

### Recommended Sequence:

1. **Phase 1.1** - Move secret token (CRITICAL)
2. **Phase 1.2** - Fix CORS (HIGH)
3. **Phase 1.3** - Add DOMPurify (HIGH)
4. **Phase 1.4** - Enhance sanitization (HIGH)
5. **Phase 2.1** - Security headers (MEDIUM)
6. **Phase 2.2** - Query validation (MEDIUM)
7. **Phase 2.3** - CSRF (MEDIUM, optional)

---

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Test each change individually |
| Performance degradation | Use CDN for DOMPurify, benchmark |
| CORS blocking legitimate requests | Test from all origins |
| Email validation too strict | Test with various email formats |
| DOMPurify breaking HTML rendering | Test vehicle descriptions thoroughly |

---

## ✅ Pre-Implementation Checklist

- [ ] Answer questions about Google Sheets integration
- [ ] Confirm allowed CORS origins
- [ ] Confirm CDN vs npm for DOMPurify
- [ ] Backup current code (git commit)
- [ ] Test current functionality
- [ ] Set up test environment

---

## 🚀 Ready to Proceed?

Once you answer the questions and approve this plan, I'll implement the fixes phase by phase, testing after each change.

**Estimated Time:**
- Phase 1: 2-3 hours
- Phase 2: 1-2 hours
- Total: 3-5 hours

**Would you like me to proceed with Phase 1.1 (Move Secret Token) first?**

