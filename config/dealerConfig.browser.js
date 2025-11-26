/**
 * Dealer Configuration - Browser Version
 * CB Handels GmbH
 * Exposes config via window.dealerConfig
 */

(function() {
  'use strict';
  
  window.dealerConfig = {
    // Basic Info
    name: "CB Handels GmbH",
    legalName: "CB Handels GmbH",
    
    // Address
    address: {
      street: "Industriestraße 5",
      city: "Reichenfels",
      postalCode: "9463",
      country: "Österreich",
      region: "Kärnten",
      full: "Industriestraße 5, 9463 Reichenfels, Österreich"
    },
    
    // Secondary location (none known)
    secondaryLocation: null,
    
    // Contact
    email: "office@cbhandel.at",
    phone: "+43 664 3882323",
    
    // Legal/Company Info
    legal: {
      companyRegister: "FN 565866g",
      court: "Landesgericht Klagenfurt",
      gln: "",
      gisa: "",
      taxNumber: "",
      vatId: "ATU77390636",
      managingDirector: "Ing. Christian Baumgartner",
      bank: {
        iban: "",
        bic: ""
      }
    },
    
    // Business Hours
    openingHours: {
      weekdays: "Montag bis Freitag: nach telefonischer Vereinbarung"
    },
    
    // SEO
    seo: {
      siteTitle: "CB Handels GmbH | Kraftfahrzeuge und Maschinen in Reichenfels, Kärnten",
      metaDescription: "CB Handels GmbH in Reichenfels, Kärnten. Handel mit Kraftfahrzeugen, Nutzfahrzeugen und Maschinen. Faire Preise, ehrliche Beratung und breite Auswahl.",
      keywords: "CB Handels, Reichenfels, Kärnten, Gebrauchtwagen, Nutzfahrzeuge, Maschinenhandel, Traktoren, Landmaschinen, Autoankauf",
      canonicalUrl: "https://cbhandel.at",
      ogImage: "https://cbhandel.at/assets/og-image.jpg"
    },
    
    // Branding (placeholder)
    colors: {
      primary: "#004b8d",
      primaryRgb: "0, 75, 141",
      primaryLight: "#2469a6",
      primaryDark: "#003564"
    },
    
    // Social Media
    social: {
      facebook: "https://www.facebook.com/cbhandel",
      instagram: "https://www.instagram.com/cbhandel",
      tiktok: "https://www.tiktok.com/@cbhandel",
      youtube: "https://www.youtube.com/@cbhandel",
      twitter: "https://x.com/cbhandel",
      twitterHandle: "@cbhandel"
    },
    
    // Vehicle Data Source
    dataSource: {
      type: "unknown",
      dealerId: "",
      baseUrl: "",
      apiEndpoints: {
        pkw: "",
        nutzfahrzeuge: ""
      },
      sourceUrls: {
        pkw: "",
        nutzfahrzeuge: ""
      },
      referenceLinks: {
        autoscout24: "https://www.autoscout24.at/haendler/cb-handels-gmbh",
        gebrauchtwagenAt: "https://www.gebrauchtwagen.at/handlerwagen/?cid=14166681",
        landwirt: "https://www.landwirt.com/dealer/info/cb-handels-gmbh-10561",
        mascus: "https://www.mascus.at/cb-handels-gmbh/8bf11bd0,1,relevance,searchdealer.html"
      }
    },
    
    // CORS Allowed Origins
    corsOrigins: [
      "https://cbhandel.at",
      "https://www.cbhandel.at",
      "https://cbhandel.vercel.app",
      "http://localhost:3000"
    ],
    
    // Description for about sections
    description:
      "CB Handels GmbH in Reichenfels, Kärnten. Handel mit Kraftfahrzeugen, Nutzfahrzeugen und Maschinen. Persönliche Beratung und faire Konditionen."
  };
})();
