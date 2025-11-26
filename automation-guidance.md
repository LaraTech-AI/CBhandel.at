# Automation & Channel Sync Guide

Complete guide for synchronizing content between Website ↔ Google Business Profile ↔ Meta (Facebook/Instagram) using n8n or Zapier.

**Updated**: March 2025 - Note: Supercar loading animation and tsParticles were removed in v2.0.0 in favor of native CSS animations. Vehicle data scraping now uses Puppeteer + Chromium.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [API Setup](#api-setup)
4. [n8n Implementation](#n8n-implementation)
5. [Zapier Implementation](#zapier-implementation)
6. [Webhook Payloads](#webhook-payloads)
7. [Content Workflows](#content-workflows)
8. [Automated Ads](#automated-ads)
9. [Monitoring & Logs](#monitoring--logs)
10. [Change Log](#change-log)

---

---

## Overview

This guide explains how to automate content distribution across multiple channels:

```
Website (New Post)
    ↓
n8n/Zapier Workflow
    ↓
├── Google Business Profile (Post)
├── Facebook Page (Post)
├── Instagram (Post)
└── Optional: Paid Ads
```

**Benefits:**

- Post once, publish everywhere
- Consistent branding across platforms
- Time-saving automation
- AI-powered content adaptation
- Automatic ad creation

---

## Prerequisites

###

Required Accounts

- [ ] **n8n** ([n8n.io](https://n8n.io)) or **Zapier** ([zapier.com](https://zapier.com))
- [ ] **Google Business Profile** ([business.google.com](https://business.google.com))
- [ ] **Facebook Page** (for your business)
- [ ] **Instagram Business Account** (linked to Facebook Page)
- [ ] **OpenAI API** (optional, for AI-generated content) - [platform.openai.com](https://platform.openai.com)
- [ ] **Meta Business Manager** (optional, for ads) - [business.facebook.com](https://business.facebook.com)

### Required Access Levels

- **Google**: Business Profile Manager or Owner
- **Facebook**: Page Admin access
- **Instagram**: Business account linked to Facebook Page
- **Meta Ads**: Ad Account Admin (for automated ads)

---

## API Setup

### 1. Google Business Profile API

#### Step 1: Enable API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing: "DirektOnline Automation"
3. Enable "Google My Business API"
4. Enable "Google My Business Account Management API"

#### Step 2: Create Service Account

1. Go to APIs & Services → Credentials
2. Create Credentials → Service Account
3. Name: "n8n-automation"
4. Grant roles: "Service Account User"
5. Create and download JSON key file

#### Step 3: Get Location ID

```bash
# Install gcloud CLI
# Visit: https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# List accounts
curl "https://mybusinessaccountmanagement.googleapis.com/v1/accounts" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)"

# List locations
curl "https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{ACCOUNT_ID}/locations" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)"
```

Save your `location_id` - you'll need it for API calls.

#### API Scopes Required:

- `https://www.googleapis.com/auth/business.manage`

---

### 2. Facebook Graph API

#### Step 1: Create App

1. Go to [Facebook Developers](https://developers.facebook.com)
2. My Apps → Create App
3. Select "Business" type
4. App name: "DirektOnline Sync"

#### Step 2: Add Products

Add these products to your app:

- Facebook Login
- Instagram Basic Display
- Instagram Graph API

#### Step 3: Get Access Tokens

1. Go to Tools → Graph API Explorer
2. Select your app
3. Add permissions:

   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_manage_engagement`
   - `instagram_basic`
   - `instagram_content_publish`
   - `business_management` (for ads)
   - `ads_management` (for ads)

4. Generate Access Token
5. Extend to long-lived token:

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_LIVED_TOKEN}"
```

#### Step 4: Get Page & Instagram IDs

```bash
# Get Page ID
curl -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token={ACCESS_TOKEN}"

# Get Instagram Business Account ID
curl -X GET "https://graph.facebook.com/v18.0/{PAGE_ID}?fields=instagram_business_account&access_token={PAGE_ACCESS_TOKEN}"
```

---

### 3. OpenAI API (Optional)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account or sign in
3. Go to API Keys
4. Create new secret key
5. Save key securely

**Pricing** (as of 2024):

- GPT-4-Turbo: ~$0.01 per post
- GPT-3.5-Turbo: ~$0.002 per post

---

## n8n Implementation

### Installation Options

#### Option A: Self-Hosted (Docker)

```bash
# Using Docker Compose
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

#### Option B: n8n Cloud

Sign up at [n8n.cloud](https://n8n.cloud) - 14-day free trial

---

### Workflow 1: New Blog Post → Multi-Channel

**Trigger**: Webhook (when new blog post published)

#### Nodes:

1. **Webhook** (Trigger)

   - Method: POST
   - Path: `/new-blog-post`

2. **OpenAI** (Optional - Generate Social Copy)
   - Model: gpt-4-turbo-preview
   - Prompt:

```
Convert this blog post into engaging social media content:

Title: {{$json["title"]}}
Excerpt: {{$json["excerpt"]}}

Create 3 versions:
1. Facebook (2-3 sentences, friendly tone, with emoji)
2. Instagram (1-2 sentences, hashtags: #AutoWolfsberg #Kärnten)
3. Google Business (professional, 1-2 sentences)
```

3. **Set Variables**

   - Set: `facebook_text`, `instagram_text`, `google_text`

4. **HTTP Request → Google Business Profile**

   - Method: POST
   - URL: `https://mybusiness.googleapis.com/v4/{LOCATION_ID}/localPosts`
   - Headers:
     ```json
     {
       "Authorization": "Bearer {ACCESS_TOKEN}",
       "Content-Type": "application/json"
     }
     ```
   - Body:
     ```json
     {
       "languageCode": "de",
       "summary": "{{$node["OpenAI"].json["google_text"]}}",
       "callToAction": {
         "actionType": "LEARN_MORE",
         "url": "{{$json["url"]}}"
       },
       "topicType": "STANDARD"
     }
     ```

5. **HTTP Request → Facebook Page**

   - Method: POST
   - URL: `https://graph.facebook.com/v18.0/{PAGE_ID}/feed`
   - Body:
     ```json
     {
       "message": "{{$node["OpenAI"].json["facebook_text"]}}",
       "link": "{{$json["url"]}}",
       "access_token": "{PAGE_ACCESS_TOKEN}"
     }
     ```

6. **HTTP Request → Instagram** (if image provided)

   - Step 1: Upload Image

     - Method: POST
     - URL: `https://graph.facebook.com/v18.0/{IG_USER_ID}/media`
     - Body:
       ```json
       {
         "image_url": "{{$json["image_url"]}}",
         "caption": "{{$node["OpenAI"].json["instagram_text"]}}",
         "access_token": "{PAGE_ACCESS_TOKEN}"
       }
       ```

   - Step 2: Publish Container
     - Method: POST
     - URL: `https://graph.facebook.com/v18.0/{IG_USER_ID}/media_publish`
     - Body:
       ```json
       {
         "creation_id": "{{$node["HTTP Request"].json["id"]}}",
         "access_token": "{PAGE_ACCESS_TOKEN}"
       }
       ```

7. **Slack/Email Notification** (Optional)
   - Send success notification to team

---

### Workflow 2: New Vehicle Added → Social Posts

**Trigger**: Webhook (when new vehicle added to inventory)

#### Example Webhook Payload:

```json
{
  "event": "new_vehicle",
  "vehicle": {
    "id": "123",
    "make": "BMW",
    "model": "320d xDrive Touring",
    "year": 2021,
    "mileage": 38500,
    "power": "140 kW (190 PS)",
    "price": 36500,
    "image_url": "https://direktonline.at/assets/vehicles/bmw-320d.jpg",
    "features": ["Allrad", "Kombi", "HUD"],
    "url": "https://direktonline.at#fahrzeuge"
  }
}
```

#### Nodes:

1. **Webhook** (Trigger)

2. **OpenAI** (Generate Post Text)
   - Prompt:

```
Create engaging social media posts for this vehicle:

Make: {{$json["vehicle"]["make"]}}
Model: {{$json["vehicle"]["model"]}}
Year: {{$json["vehicle"]["year"]}}
Mileage: {{$json["vehicle"]["mileage"]}} km
Power: {{$json["vehicle"]["power"]}}
Price: € {{$json["vehicle"]["price"]}},-
Features: {{$json["vehicle"]["features"].join(", ")}}

Generate:
1. Facebook post (exciting, 2-3 sentences)
2. Instagram caption (short, punchy, with emojis)
3. Google Business post (professional)

Include call-to-action to visit website or call.
```

3. **Parallel Branches** → Post to all platforms simultaneously

---

## Zapier Implementation

### Zap 1: WordPress/CMS → Social Media

**Trigger**: RSS by Zapier or Webhook by Zapier

**Actions**:

1. **OpenAI (ChatGPT)**: Generate social media content

   - Choose "Conversation" action
   - Prompt: (same as n8n example above)

2. **Google My Business**: Create Post

   - Choose "Create Post" action
   - Map fields from OpenAI output

3. **Facebook Pages**: Create Page Post

   - Choose "Create Page Post" action
   - Message: OpenAI output for Facebook

4. **Instagram for Business**: Create Media

   - Choose "Create Media" action (requires image)
   - Caption: OpenAI output for Instagram

5. **Slack**: Send notification (optional)

---

## Webhook Payloads

### Standard Blog Post Webhook

```json
{
  "event": "new_blog_post",
  "post": {
    "id": "post-123",
    "title": "Der richtige Zeitpunkt für den Reifenwechsel",
    "slug": "reifenwechsel",
    "excerpt": "Die O-bis-O-Regel besagt: Von Oktober bis Ostern sollten Winterreifen aufgezogen sein.",
    "content": "Full post content here...",
    "author": "DirektOnline Team",
    "published_date": "2024-10-15T10:00:00Z",
    "url": "https://direktonline.at/posts/reifenwechsel.html",
    "image_url": "https://direktonline.at/assets/blog/winter-reifen.jpg",
    "categories": ["Ratgeber", "Wartung"],
    "tags": ["Winterreifen", "Sicherheit"]
  }
}
```

### New Vehicle Webhook

```json
{
  "event": "new_vehicle",
  "vehicle": {
    "id": "veh-456",
    "vin": "WBA1234567890",
    "make": "Volkswagen",
    "model": "Golf GTI 2.0 TSI",
    "year": 2020,
    "mileage": 45000,
    "power_kw": 180,
    "power_ps": 245,
    "fuel_type": "Benzin",
    "transmission": "Automatik",
    "color": "Schwarz",
    "price": 28900,
    "features": ["Automatik", "Navi", "LED", "Rückfahrkamera"],
    "description": "Gepflegter Golf GTI mit Vollausstattung",
    "image_urls": [
      "https://direktonline.at/assets/vehicles/vw-golf-gti-1.jpg",
      "https://direktonline.at/assets/vehicles/vw-golf-gti-2.jpg"
    ],
    "url": "https://direktonline.motornetzwerk.at/detail/veh-456",
    "website_url": "https://direktonline.at#fahrzeuge"
  }
}
```

### Special Offer/Promotion Webhook

```json
{
  "event": "special_offer",
  "promotion": {
    "id": "promo-789",
    "title": "Winteraktion: 10% Rabatt auf alle Gebrauchtwagen",
    "description": "Nur noch bis Ende November!",
    "discount_percentage": 10,
    "valid_from": "2024-11-01",
    "valid_until": "2024-11-30",
    "terms": "Gilt für alle vorhandenen Fahrzeuge",
    "image_url": "https://direktonline.at/assets/promotions/winter-aktion.jpg",
    "url": "https://direktonline.at#fahrzeuge"
  }
}
```

---

## Content Workflows

### Workflow A: Weekly Inventory Highlight

**Schedule**: Every Monday, 09:00

**Process**:

1. Query database for featured vehicles
2. Select 1-2 vehicles randomly or by criteria
3. Generate social media posts with OpenAI
4. Post to all platforms
5. Log results

### Workflow B: Event/Promotion Posts

**Trigger**: Manual or scheduled

**Example Promotions**:

- Seasonal sales (Winter-/Sommerreifen)
- Holiday specials
- New inventory arrivals
- Customer testimonials

### Workflow C: Educational Content

**Schedule**: Bi-weekly

**Topics**:

- Maintenance tips
- Buying guides
- Industry news
- Local events

---

## Automated Ads

### Meta Ads Creation via API

**Prerequisites**:

- Meta Business Manager account
- Ad Account with payment method
- `ads_management` permission
- Business verification completed

#### Creative Types:

1. **Single Image Ad**
2. **Carousel Ad** (multiple vehicles)
3. **Video Ad**
4. **Collection Ad**

#### Example: Create Single Image Ad

```javascript
// n8n HTTP Request Node
{
  "method": "POST",
  "url": "https://graph.facebook.com/v18.0/act_{AD_ACCOUNT_ID}/adcreatives",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "name": "DirektOnline - BMW 320d Special",
    "object_story_spec": {
      "page_id": "{PAGE_ID}",
      "link_data": {
        "image_hash": "{IMAGE_HASH}",
        "link": "https://direktonline.at#fahrzeuge",
        "message": "🚗 BMW 320d xDrive - Nur € 36.500,-\\n\\n✅ 2021, 38.500 km\\n✅ Allrad, HUD, Kombi\\n✅ Sofort verfügbar!\\n\\n👉 Jetzt anfragen!",
        "name": "BMW 320d xDrive Touring",
        "description": "Ihr zuverlässiger Autohandel in Wolfsberg",
        "call_to_action": {
          "type": "LEARN_MORE"
        }
      }
    },
    "degrees_of_freedom_spec": {
      "creative_features_spec": {
        "standard_enhancements": {
          "enroll_status": "OPT_IN"
        }
      }
    },
    "access_token": "{ACCESS_TOKEN}"
  }
}
```

#### Create Ad Campaign

```javascript
// 1. Create Campaign
{
  "method": "POST",
  "url": "https://graph.facebook.com/v18.0/act_{AD_ACCOUNT_ID}/campaigns",
  "body": {
    "name": "DirektOnline - Fahrzeuge Q4 2024",
    "objective": "OUTCOME_TRAFFIC",
    "status": "PAUSED",
    "special_ad_categories": [],
    "access_token": "{ACCESS_TOKEN}"
  }
}

// 2. Create Ad Set
{
  "method": "POST",
  "url": "https://graph.facebook.com/v18.0/act_{AD_ACCOUNT_ID}/adsets",
  "body": {
    "name": "DirektOnline - Kärnten Targeting",
    "campaign_id": "{CAMPAIGN_ID}",
    "billing_event": "IMPRESSIONS",
    "optimization_goal": "LINK_CLICKS",
    "bid_amount": 50, // 0.50 EUR in cents
    "daily_budget": 2000, // 20 EUR in cents
    "status": "PAUSED",
    "targeting": {
      "geo_locations": {
        "countries": ["AT"],
        "regions": [
          {"key": "3857"} // Kärnten region ID
        ],
        "cities": [
          {"key": "2766803", "radius": 25, "distance_unit": "kilometer"} // Wolfsberg
        ]
      },
      "age_min": 25,
      "age_max": 65,
      "genders": [0], // All genders
      "interests": [
        {"id": "6003139266461", "name": "Cars"},
        {"id": "6003121899252", "name": "Automobiles"}
      ]
    },
    "access_token": "{ACCESS_TOKEN}"
  }
}

// 3. Create Ad
{
  "method": "POST",
  "url": "https://graph.facebook.com/v18.0/act_{AD_ACCOUNT_ID}/ads",
  "body": {
    "name": "BMW 320d Ad",
    "adset_id": "{ADSET_ID}",
    "creative": {"creative_id": "{CREATIVE_ID}"},
    "status": "PAUSED",
    "access_token": "{ACCESS_TOKEN}"
  }
}
```

#### Budget Recommendations:

| Objective       | Daily Budget (EUR) | Duration | Expected Results            |
| --------------- | ------------------ | -------- | --------------------------- |
| Brand Awareness | 10-15              | Ongoing  | 1,000-2,000 impressions/day |
| Traffic         | 15-25              | Campaign | 50-100 clicks/day           |
| Lead Generation | 25-50              | Campaign | 10-20 leads/day             |
| Conversions     | 50-100             | Campaign | 2-5 conversions/day         |

---

## Monitoring & Logs

### n8n Workflow Logging

Add these nodes to track execution:

```javascript
// 1. Error Handling Node
{
  "onError": "continueErrorOutput",
  "actions": [
    {
      "type": "sendEmail",
      "to": "admin@direktonline.at",
      "subject": "Workflow Error: {{$node.name}}",
      "body": "Error: {{$json.error.message}}"
    }
  ]
}

// 2. Success Logging
{
  "type": "database",
  "action": "insert",
  "table": "automation_logs",
  "data": {
    "workflow_id": "{{$workflow.id}}",
    "execution_id": "{{$execution.id}}",
    "status": "success",
    "platforms": ["google", "facebook", "instagram"],
    "timestamp": "{{$now}}",
    "post_id": "{{$json.post_id}}"
  }
}
```

### Zapier History

- View in Zapier Dashboard → History
- Export runs to CSV for analysis
- Set up email alerts for failures

### Performance Metrics to Track

1. **Posting Success Rate**: % of successful multi-platform posts
2. **Engagement Rate**: Likes, comments, shares across platforms
3. **Traffic Generated**: Website visits from social posts
4. **Lead Conversion**: Inquiries generated from automated posts
5. **Ad Performance**: CTR, CPC, conversions from automated ads

### Recommended Tools:

- **Google Analytics**: Track website traffic sources
- **Facebook Business Suite**: Monitor Facebook & Instagram engagement
- **Google Business Profile Insights**: Track Google post performance
- **Metabase/Grafana**: Build custom dashboards for all metrics

---

## Best Practices

### Content Guidelines

1. **Frequency**:

   - Google Business: 2-3x per week
   - Facebook: 4-5x per week
   - Instagram: 5-7x per week

2. **Timing**:

   - Best times: 8-10 AM, 6-8 PM (local time)
   - Avoid weekends for business posts

3. **Content Mix** (80/20 Rule):

   - 80% educational, helpful content
   - 20% promotional, sales content

4. **Image Requirements**:
   - Facebook: 1200x630px
   - Instagram: 1080x1080px (square) or 1080x1350px (portrait)
   - Google Business: 750x750px minimum

### AI Prompt Best Practices

**Good Prompt**:

```
Create a Facebook post for a BMW 320d:
- Professional yet friendly tone
- Highlight: Allrad, low mileage (38,500 km), HUD
- Price: € 36,500
- Include call-to-action
- Add 1-2 relevant emojis
- Max 2-3 sentences
- Target audience: families, professionals 30-50 years
```

**Bad Prompt**:

```
Write something about a BMW car
```

---

## Troubleshooting

### Common Issues

**Issue**: "Invalid Access Token"  
**Solution**: Regenerate long-lived token, check expiration

**Issue**: "Insufficient Permissions"  
**Solution**: Re-authorize app with correct scopes

**Issue**: "Rate Limit Exceeded"  
**Solution**: Implement delays between API calls, reduce frequency

**Issue**: "Image Upload Failed"  
**Solution**: Check image size (<8MB), format (JPG/PNG), dimensions

---

## Support Resources

- **n8n Community**: [community.n8n.io](https://community.n8n.io)
- **Zapier Help**: [help.zapier.com](https://help.zapier.com)
- **Facebook Developers**: [developers.facebook.com/support](https://developers.facebook.com/support)
- **Google Business Profile API**: [developers.google.com/my-business](https://developers.google.com/my-business)

---

**Document Version**: 1.1  
**Last Updated**: October 2024  
**Contact**: direktonline.at@gmail.com

## 📝 Change Log

### Version 1.1 (October 2024)
- **Added**: Supercar loading animation integration (Note: Removed in v2.0.0)
- **Added**: tsParticles background system documentation (Note: Removed in v2.0.0)
- **Added**: Real testimonials integration workflow
- **Updated**: Project structure to reflect new file organization
- **Updated**: Webhook payloads to include new animation and particle features (Note: Animation features removed in v2.0.0)
- **Enhanced**: Content workflows to leverage new visual elements

### Version 1.0 (October 2024)
- **Initial release**: Complete automation guide
- **Features**: n8n/Zapier workflows, API setup, automated ads
- **Content**: Google Business Profile, Facebook/Instagram integration
- **Tools**: OpenAI content generation, webhook examples
