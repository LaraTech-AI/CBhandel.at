# Security Review Report
**Date:** November 2025  
**Project:** DirektOnline BS GmbH Website  
**Reviewer:** CursorAI Security Analysis

---

## Executive Summary

This security review identified **1 CRITICAL**, **3 HIGH**, and **5 MEDIUM** security issues that require immediate attention. The application demonstrates good security practices in several areas (proper environment variable usage, rate limiting, input validation) but has significant vulnerabilities that need remediation.

---

## 🔴 CRITICAL ISSUES

### 1. Hardcoded Secret Token in Client-Side Code
**Location:** `scripts.js:6694`  
**Severity:** CRITICAL  
**Risk:** Unauthorized access to Google Sheets webhook

```javascript
const SECRET_TOKEN = "7866477164";
```

**Issue:** A secret token is hardcoded in client-side JavaScript, making it visible to anyone who views the page source or inspects the network traffic.

**Impact:**
- Anyone can extract the token and make unauthorized requests to your Google Sheets webhook
- Token cannot be rotated without code changes
- Violates security best practices for secret management

**Recommendation:**
- Move the Google Sheets webhook integration to a serverless function (Vercel API route)
- Store the token in environment variables (`GOOGLE_SHEETS_SECRET`)
- Remove the token from client-side code entirely
- Implement proper authentication/authorization in the serverless function

**Priority:** Fix immediately before production deployment

---

## 🟠 HIGH SEVERITY ISSUES

### 2. Overly Permissive CORS Configuration
**Location:** All API endpoints (`api/*.js`)  
**Severity:** HIGH  
**Risk:** Cross-Origin Resource Sharing (CORS) abuse

**Issue:** All API endpoints use `Access-Control-Allow-Origin: "*"`, allowing any website to make requests to your APIs.

**Affected Files:**
- `api/contact.js:61`
- `api/appointment.js:77`
- `api/newsletter.js:58`
- `api/newsletter-confirm.js:53`
- `api/vehicles.js:462`
- `api/vehicle-details.js:142`

**Impact:**
- Any malicious website can call your APIs from a user's browser
- Potential for CSRF attacks
- Data exfiltration risk
- Unauthorized API usage

**Recommendation:**
```javascript
// Replace wildcard with specific origin
const allowedOrigins = [
  'https://direktonline.at',
  'https://www.direktonline.at'
];

const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

**Priority:** Fix before production

---

### 3. XSS Vulnerabilities via innerHTML
**Location:** `scripts.js` (multiple locations)  
**Severity:** HIGH  
**Risk:** Cross-Site Scripting (XSS) attacks

**Issue:** Multiple uses of `innerHTML` with potentially untrusted data, even though an `escapeHtml()` function exists.

**Affected Locations:**
- Line 94, 100, 108, 134, 146, 281, 464, 519, 645, 673, 685, 717, 739, 748
- Line 2694, 2698, 3043-3047, 3101, 3348, 3429, 3645, 3667, 3687, 3698, 3735
- Line 4053, 4066, 4068, 4244, 4535, 4552, 4609, 5338, 5912, 5915, 5927, 6068, 6078, 6083

**Specific Concern:**
```javascript
// Line 3429 - User-controlled description inserted into HTML
descEl.innerHTML = `<div class="description-content">${formattedDescription}</div>`;
```

**Impact:**
- Malicious scripts can be injected if vehicle data from external API is compromised
- Stored XSS if data is persisted and later displayed
- Session hijacking, cookie theft, credential harvesting

**Recommendation:**
1. Use `textContent` instead of `innerHTML` where possible
2. When HTML is required, use `DOMPurify` library for sanitization:
   ```javascript
   import DOMPurify from 'dompurify';
   descEl.innerHTML = DOMPurify.sanitize(formattedDescription);
   ```
3. Ensure all user inputs and external API data are sanitized before rendering
4. Review the `escapeHtml()` function and ensure it's used consistently

**Priority:** Fix before production

---

### 4. Insufficient Input Sanitization
**Location:** `api/contact.js:47-53`, `api/appointment.js:63-69`, `api/newsletter.js:47-50`  
**Severity:** HIGH  
**Risk:** Injection attacks, data corruption

**Issue:** The `sanitize()` function only removes angle brackets (`<>`) and limits length, which is insufficient.

```javascript
function sanitize(input) {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>]/g, "") // Only removes < >
    .substring(0, 1000);
}
```

**Impact:**
- Email injection attacks (newlines in email headers)
- Command injection if data is used in shell commands
- Template injection if data is used in email templates
- Insufficient protection against various injection vectors

**Recommendation:**
1. Use a proper sanitization library (e.g., `validator.js`, `sanitize-html`)
2. Implement context-specific sanitization:
   - Email addresses: Use `validator.isEmail()` and proper encoding
   - HTML content: Use DOMPurify
   - URLs: Validate and sanitize URL format
3. Add additional validation:
   ```javascript
   function sanitize(input, type = 'text') {
     if (typeof input !== "string") return "";
     let sanitized = input.trim();
     
     switch(type) {
       case 'email':
         return validator.isEmail(sanitized) ? sanitized : '';
       case 'html':
         return DOMPurify.sanitize(sanitized);
       case 'url':
         return validator.isURL(sanitized) ? sanitized : '';
       default:
         // Remove control characters, null bytes, etc.
         return sanitized
           .replace(/[\x00-\x1F\x7F]/g, '')
           .replace(/[<>]/g, '')
           .substring(0, 1000);
     }
   }
   ```

**Priority:** Fix before production

---

## 🟡 MEDIUM SEVERITY ISSUES

### 5. In-Memory Rate Limiting (Resets on Cold Start)
**Location:** All API endpoints with rate limiting  
**Severity:** MEDIUM  
**Risk:** Rate limit bypass, DoS vulnerability

**Issue:** Rate limiting uses in-memory `Map` that resets when serverless functions cold start.

```javascript
const rateLimitStore = new Map();
```

**Impact:**
- Attackers can bypass rate limits by waiting for cold starts
- Distributed attacks from multiple IPs are not effectively limited
- No persistent rate limiting across function invocations

**Recommendation:**
1. Use Vercel's edge rate limiting or external service (Redis, Upstash)
2. Implement distributed rate limiting:
   ```javascript
   // Example with Upstash Redis
   import { Ratelimit } from "@upstash/ratelimit";
   import { Redis } from "@upstash/redis";
   
   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(5, "1 h"),
   });
   ```
3. Consider using Vercel's built-in rate limiting features

**Priority:** Address in next iteration

---

### 6. Error Messages May Leak Information
**Location:** All API endpoints  
**Severity:** MEDIUM  
**Risk:** Information disclosure

**Issue:** Error messages may reveal internal details, though most are user-friendly.

**Examples:**
- `api/contact.js:298` - Logs full error to console (may be visible in logs)
- Error responses are generally user-friendly, but stack traces in logs could leak info

**Impact:**
- Attackers can learn about internal system structure
- Database errors, file paths, or other sensitive info could be exposed

**Recommendation:**
1. Ensure production error responses are generic:
   ```javascript
   return res.status(500).json({
     success: false,
     error: "An error occurred. Please try again later."
   });
   ```
2. Log detailed errors server-side only (not in client responses)
3. Use error tracking service (Sentry, LogRocket) for detailed logging
4. Review all error handling to ensure no sensitive data leaks

**Priority:** Review and fix

---

### 7. Missing CSRF Protection
**Location:** All POST endpoints  
**Severity:** MEDIUM  
**Risk:** Cross-Site Request Forgery (CSRF)

**Issue:** No CSRF token validation for state-changing operations (POST requests).

**Impact:**
- Malicious websites can submit forms on behalf of users
- Unauthorized actions (appointments, contact submissions, newsletter signups)

**Recommendation:**
1. Implement CSRF token validation:
   ```javascript
   // Generate token on page load
   const csrfToken = crypto.randomBytes(32).toString('hex');
   
   // Validate in API
   const token = req.headers['x-csrf-token'];
   if (!token || token !== expectedToken) {
     return res.status(403).json({ error: 'Invalid CSRF token' });
   }
   ```
2. Use SameSite cookie attributes
3. Consider using a CSRF protection library

**Priority:** Implement for production

---

### 8. Missing Input Validation on Query Parameters
**Location:** `api/vehicle-details.js:154`  
**Severity:** MEDIUM  
**Risk:** Parameter injection, DoS

**Issue:** `vid` parameter is used directly without validation.

```javascript
const { vid } = req.query;
// Used directly in API call without validation
const apiUrl = `${MOTORNETZWERK_API}?aid=${DEALER_AID}&vid=${vid}`;
```

**Impact:**
- Potential for parameter injection
- DoS if invalid data causes API errors
- No validation of format (should be numeric)

**Recommendation:**
```javascript
const { vid } = req.query;

// Validate vid is numeric and within expected range
if (!vid || !/^\d+$/.test(vid) || vid.length > 10) {
  return res.status(400).json({ error: "Invalid vehicle ID" });
}
```

**Priority:** Add validation

---

### 9. Missing Security Headers
**Location:** `vercel.json`  
**Severity:** MEDIUM  
**Risk:** Various client-side attacks

**Issue:** Some important security headers are missing.

**Current Headers:**
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: SAMEORIGIN`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`

**Missing Headers:**
- ❌ `Content-Security-Policy` (CSP)
- ❌ `Strict-Transport-Security` (HSTS)
- ❌ `Permissions-Policy`

**Recommendation:**
Add to `vercel.json`:
```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://direktonline.motornetzwerk.at https://script.google.com;"
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

**Priority:** Add before production

---

## ✅ POSITIVE SECURITY FINDINGS

### Good Practices Identified:

1. **Environment Variables:** ✅
   - Secrets properly stored in environment variables
   - `.env` files are in `.gitignore`
   - No hardcoded credentials (except the one critical issue)

2. **Input Validation:** ✅
   - Email validation present
   - Required field validation
   - Date validation for appointments

3. **Rate Limiting:** ✅
   - Implemented in all form submission endpoints
   - Prevents basic abuse

4. **HTTPS/TLS:** ✅
   - Vercel automatically provides HTTPS
   - Secure SMTP connections configured

5. **Cryptographic Functions:** ✅
   - Uses SHA-256 HMAC for token signing (not weak algorithms)
   - `crypto.timingSafeEqual()` used for signature comparison (prevents timing attacks)

6. **Error Handling:** ✅
   - Try-catch blocks present
   - User-friendly error messages

7. **No SQL Injection Risk:** ✅
   - No database queries found (uses external APIs and email)

8. **Token Expiration:** ✅
   - Newsletter confirmation tokens expire after 24 hours

---

## 📋 CHECKLIST COMPLETION STATUS

### Configuration Security
- ✅ **Detect secrets in code:** FOUND - Hardcoded token in `scripts.js`
- ✅ **Identify secrets committed to version control:** FOUND - Token in scripts.js
- ✅ **Flag hardcoded credentials:** FOUND - SECRET_TOKEN
- ✅ **Detect use of `.env` files or config files committed to repo:** ✅ `.env` is in `.gitignore`

### Authentication & Authorization
- ⚠️ **Identify missing authentication checks:** No authentication needed (public forms)
- ⚠️ **Detect improper authorization patterns:** N/A for public endpoints
- ⚠️ **Flag violations of principle of least privilege:** N/A
- ✅ **Identify insecure JWT handling:** No JWT usage found

### Data Protection
- ⚠️ **Identify unencrypted sensitive data:** Email content may contain sensitive data (acceptable for contact forms)
- ⚠️ **Detect missing input validation:** Found - Insufficient sanitization
- ⚠️ **Find XSS vulnerabilities through missing output encoding:** FOUND - Multiple innerHTML uses
- ✅ **Identify SQL injection vulnerabilities:** No SQL queries found
- ✅ **Detect use of outdated or weak crypto algorithms:** Uses SHA-256 (good)

### API Security
- ⚠️ **Detect missing rate limiting:** Rate limiting present but in-memory
- ⚠️ **Identify improper error handling that leaks information:** Some error logging may leak info
- ⚠️ **Find missing input validation in API endpoints:** Found - Query parameter validation missing
- ⚠️ **Detect missing CORS restrictions or overly permissive origins:** FOUND - Wildcard CORS

### Logging & Monitoring
- ⚠️ **Identify sensitive information in logs:** Console.error may log sensitive data
- ✅ **Detect missing error logging:** Error logging present
- ⚠️ **Check for missing audit logging of critical actions:** No audit logging for form submissions

### Dependency Management
- ⚠️ **Flag outdated dependencies with known vulnerabilities:** **FOUND** - 14 vulnerabilities (4 HIGH, 10 MODERATE)
- ⚠️ **Identify excessive dependencies that increase attack surface:** 410 total dependencies (81 prod, 323 dev)
- ⚠️ **Identify transitive dependencies with known CVEs:** **FOUND** - Multiple CVEs in transitive deps

**Dependency Vulnerabilities Found:**
- **HIGH:** `vercel@48.6.7` has 4 high severity vulnerabilities
  - `path-to-regexp` (CVE-2024-XXXX): ReDoS vulnerability
  - `@vercel/node`: Multiple vulnerabilities via transitive deps
- **MODERATE:** 10 moderate severity issues
  - `esbuild`: Development server request vulnerability
  - `undici`: Insufficient randomness and DoS vulnerabilities
- **Fix Available:** Upgrade `vercel` to `25.2.0` (major version update required)

**Recommendation:**
```bash
npm update vercel@latest
npm audit fix
```
Note: Upgrading Vercel CLI may require code changes. Review Vercel changelog before upgrading.

### Resilience & Availability
- ✅ **Detect missing error handling:** Error handling present
- ⚠️ **Identify potential DoS vulnerabilities:** In-memory rate limiting vulnerable to cold start bypass
- ⚠️ **Find missing timeout configurations:** Some fetch requests may need timeouts
- ✅ **Detect unbounded loops or recursive calls without limit:** No issues found

### SDLC Security
- ✅ **Identify common security issues through static analysis:** This review
- ✅ **Suggest security improvements in code reviews:** This document
- ⚠️ **Encourage secure coding guidelines in PR templates / commit messages:** Not found

---

## 🎯 RECOMMENDED ACTION PLAN

### Immediate (Before Production):
1. **CRITICAL:** Remove hardcoded secret token from `scripts.js`
2. **HIGH:** Restrict CORS to specific origins
3. **HIGH:** Implement proper XSS protection (DOMPurify)
4. **HIGH:** Enhance input sanitization

### Short-term (Within 1-2 weeks):
5. **MEDIUM:** Implement distributed rate limiting
6. **MEDIUM:** Add CSRF protection
7. **MEDIUM:** Add missing security headers
8. **MEDIUM:** Validate all query parameters

### Ongoing:
9. ✅ **Run `npm audit` regularly:** Found 14 vulnerabilities - upgrade `vercel` package
10. Implement dependency scanning in CI/CD
11. Add security headers monitoring
12. Regular security reviews

### Dependency Updates Required:
13. **HIGH PRIORITY:** Upgrade `vercel` from `48.6.7` to `25.2.0` (note: this is a major version change - review breaking changes)
14. Run `npm audit fix` after upgrade to resolve transitive dependencies

---

## 📚 REFERENCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CORS Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

**Report Generated:** November 2026  
**Next Review Recommended:** After implementing critical fixes

