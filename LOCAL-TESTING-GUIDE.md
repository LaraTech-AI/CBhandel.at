# Local Testing Guide for Security Fixes

## 🚀 Quick Start

### Option 1: Test with Local API Server + Static Server (Recommended for Local Development)

```bash
# Terminal 1: Start local API server (port 3001)
node test-api-local.js

# Terminal 2: Start static file server (port 3000)
npm run dev
```

This setup provides:
- Static files served on `http://localhost:3000` (HTML, CSS, JS, assets)
- API endpoints on `http://localhost:3001/api/vehicles` (vehicle data)

**Note:** The frontend automatically detects localhost and uses the local API server. In production, it uses the relative `/api/vehicles` endpoint.

### Option 2: Test with Vercel Dev (Full Production Simulation)

```bash
# Start Vercel dev server (tests API endpoints)
npm run dev:vercel
```

This will start the server on `http://localhost:3000` with full API support (Vercel serverless functions).

### Option 3: Test with Simple Serve (HTML/CSS/JS only)

```bash
# Start simple server (no API endpoints)
npm run dev
```

**Note:** API endpoints won't work with `npx serve` alone. Use Option 1 or Option 2 for full testing.

---

## 🧪 Manual Testing Steps

### 1. Test CORS Whitelist

#### Test from Browser Console:

1. Open your site: `http://localhost:3000`
2. Open Browser DevTools (F12) → Console
3. Run these tests:

```javascript
// Test 1: Request from localhost (should work)
fetch("http://localhost:3000/api/vehicles", {
  headers: { Origin: "http://localhost:3000" },
}).then((r) => {
  console.log("CORS Header:", r.headers.get("access-control-allow-origin"));
  console.log("✅ Should show: http://localhost:3000");
});

// Test 2: Check if blocked origins are rejected
// (This is harder to test from same origin, but you can check Network tab)
```

#### Check Network Tab:

1. Open DevTools → Network tab
2. Make a request to `/api/vehicles`
3. Check Response Headers:
   - ✅ Should see: `access-control-allow-origin: http://localhost:3000`
   - ❌ Should NOT see: `access-control-allow-origin: *`

---

### 2. Test Security Headers

1. Open your site: `http://localhost:3000`
2. Open DevTools → Network tab
3. Reload the page
4. Click on the main document request (usually `localhost:3000`)
5. Check Response Headers for:

```
✅ X-Content-Type-Options: nosniff
✅ X-Frame-Options: SAMEORIGIN
✅ X-XSS-Protection: 1; mode=block
✅ Referrer-Policy: strict-origin-when-cross-origin
✅ Content-Security-Policy: default-src 'self'...
✅ Strict-Transport-Security: max-age=31536000; includeSubDomains
✅ Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Note:** Some headers may only appear in production (Vercel). Test on deployed version for full verification.

---

### 3. Test Query Parameter Validation

#### Test Valid Vehicle ID:

```bash
curl http://localhost:3000/api/vehicle-details?vid=12345
```

**Expected:** Status 200 or 500 (500 is OK if vehicle doesn't exist, but validation passed)

#### Test Invalid Vehicle ID:

```bash
# Non-numeric
curl http://localhost:3000/api/vehicle-details?vid=abc

# Too long
curl http://localhost:3000/api/vehicle-details?vid=12345678901

# Missing
curl http://localhost:3000/api/vehicle-details
```

**Expected:** All should return Status 400 with error message

#### Or use Browser:

1. Open: `http://localhost:3000/api/vehicle-details?vid=abc`
2. Should see: `{"error":"Invalid vehicle ID format"}`

---

### 4. Test Token Removal (Newsletter)

#### Test Newsletter Form:

1. Open your site: `http://localhost:3000`
2. Scroll to newsletter section
3. Enter a test email
4. Submit the form
5. Check Browser Console for errors
6. Check Network tab → Request to Google Sheets webhook
7. Verify:
   - ✅ No token in request payload
   - ✅ Request succeeds (or fails gracefully)

#### Check Network Request:

1. Open DevTools → Network tab
2. Submit newsletter form
3. Find request to `script.google.com`
4. Click on it → Payload tab
5. Verify: **No `token` field in form data**

---

## 🤖 Automated Testing Script

I've created a test script for you:

```bash
# Make sure server is running first
npm run dev:vercel

# In another terminal, run:
node test-security-fixes.js
```

This will automatically test:

- ✅ CORS whitelist
- ✅ Security headers
- ✅ Query parameter validation
- ✅ Token removal

---

## 📋 Testing Checklist

### Before Testing:

- [ ] Start dev server: `npm run dev:vercel`
- [ ] Server running on `http://localhost:3000`
- [ ] Browser DevTools open

### CORS Testing:

- [ ] API calls work from `localhost:3000`
- [ ] CORS header shows specific origin (not `*`)
- [ ] Check Network tab for CORS headers

### Security Headers:

- [ ] Check Response Headers in Network tab
- [ ] Verify CSP header exists
- [ ] Verify HSTS header exists
- [ ] Verify Permissions-Policy exists

### Query Validation:

- [ ] Valid VID (`?vid=12345`) works
- [ ] Invalid VID (`?vid=abc`) returns 400
- [ ] Missing VID returns 400
- [ ] Long VID (`?vid=12345678901`) returns 400

### Token Removal:

- [ ] Newsletter form submits without token
- [ ] No token in Network request payload
- [ ] Form works correctly

---

## 🐛 Troubleshooting

### API Endpoints Not Working

**Problem:** `404` or `Cannot GET /api/...`

**Solution:**

- Use `npm run dev:vercel` instead of `npm run dev`
- `npx serve` doesn't support Vercel serverless functions

### CORS Headers Not Showing

**Problem:** No `access-control-allow-origin` header

**Solution:**

- Make sure you're testing from an allowed origin
- Check that request includes `Origin` header
- Verify API endpoint code was updated

### Security Headers Not Visible

**Problem:** Headers don't appear in DevTools

**Solution:**

- Some headers (like HSTS) only work over HTTPS
- Test on deployed version for full verification
- Check `vercel.json` was saved correctly

---

## ✅ Expected Results

After all tests pass:

1. **CORS:** Only whitelisted origins can access APIs
2. **Headers:** All security headers present
3. **Validation:** Invalid inputs are rejected
4. **Token:** No token in client-side code or requests

---

## 🚀 Next: Production Testing

After local testing passes, test on production:

1. Deploy to Vercel
2. Test from production domains
3. Verify headers with: https://securityheaders.com
4. Test CORS from production origins

---

**Ready to test?** Start with: `npm run dev:vercel`
