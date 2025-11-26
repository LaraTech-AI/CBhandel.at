/**
 * Dealer Configuration
 * Central configuration file for all dealer-specific data
 * This file is used by Node.js serverless functions
 */

module.exports = {
  // Basic Info
  name: "DirektOnline BS GmbH",
  legalName: "DirektOnline BS GmbH",
  
  // Address
  address: {
    street: "Auenfischerstraße 53a",
    city: "Wolfsberg",
    postalCode: "9400",
    country: "Österreich",
    region: "Kärnten",
    full: "Auenfischerstraße 53a, 9400 Wolfsberg, Österreich"
  },
  
  // Secondary location (service)
  secondaryLocation: {
    street: "Rabenweg 11",
    city: "Wolfsberg",
    postalCode: "9400",
    description: "Servicebetrieb"
  },
  
  // Contact
  email: "direktonline.at@gmail.com",
  phone: "+43 664 260 81 85",
  
  // Legal/Company Info
  legal: {
    companyRegister: "FN 637100m",
    court: "Landesgericht Klagenfurt",
    gln: "9110036668028",
    gisa: "11571155",
    taxNumber: "57 295/8551",
    vatId: "ATU81166319",
    bank: {
      iban: "AT24 3948 1000 0434 2572",
      bic: "RZKTAT2K481"
    }
  },
  
  // Business Hours
  openingHours: {
    weekdays: "Montag – Freitag: 08:00 – 19:30 Uhr"
  },
  
  // SEO
  seo: {
    siteTitle: "DirektOnline BS GmbH – Ihr Autohandel in Wolfsberg, Lavanttal, Kärnten",
    metaDescription: "DirektOnline BS GmbH – Geprüfte Gebrauchtwagen in Wolfsberg, Kärnten. Ihr zuverlässiger Autohandel im Lavanttal. Große Auswahl, faire Preise, kompetente Beratung.",
    keywords: "DirektOnline Wolfsberg, DirektOnline Lavanttal, DirektOnline Kärnten, Autohandel Wolfsberg, Gebrauchtwagen Wolfsberg, Auto kaufen Kärnten",
    canonicalUrl: "https://direktonline.at",
    ogImage: "https://direktonline.at/assets/og-image.jpg"
  },
  
  // Branding
  colors: {
    primary: "#1b8e2d",
    primaryRgb: "27, 142, 45",
    primaryLight: "#22a636",
    primaryDark: "#156b22"
  },
  
  // Social Media
  social: {
    facebook: "https://www.facebook.com/direktonline.at/",
    instagram: "https://www.instagram.com/direktonline.at/",
    tiktok: "https://www.tiktok.com/@direktonline.at",
    youtube: "https://www.youtube.com/@direktonline-at",
    twitter: "https://x.com/DirektOnlineAT",
    twitterHandle: "@direktonline"
  },
  
  // Vehicle Data Source
  dataSource: {
    type: "motornetzwerk",
    dealerId: "1003459",
    baseUrl: "https://direktonline.motornetzwerk.at",
    apiEndpoints: {
      pkw: "https://direktonline.motornetzwerk.at/app/php-wrappers/php-wrapper.php?aid=1003459",
      nutzfahrzeuge: "https://direktonline.motornetzwerk.at/app/php-wrappers/php-wrapper-truck.php?aid=1003459"
    },
    sourceUrls: {
      pkw: "https://direktonline.motornetzwerk.at?display=iframe2",
      nutzfahrzeuge: "https://direktonline.motornetzwerk.at/nutzfahrzeuge?display=iframe1"
    }
  },
  
  // CORS Allowed Origins
  corsOrigins: [
    "https://direktonline.at",
    "https://www.direktonline.at",
    "https://onlinedirekt.at",
    "https://www.onlinedirekt.at",
    "https://direktonline.vercel.app",
    "http://localhost:3000"
  ],
  
  // Description for about sections
  description: "Ihr zuverlässiger Autohandel in Wolfsberg, Kärnten. Spezialisiert auf geprüfte Gebrauchtwagen mit fairen Preisen und kompetenter Beratung."
};

