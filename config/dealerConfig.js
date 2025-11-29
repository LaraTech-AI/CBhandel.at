/**
 * Dealer Configuration
 * CB Handels GmbH
 */

module.exports = {
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
    bank: {
      iban: "",
      bic: ""
    },
    managingDirector: "Ing. Christian Baumgartner"
  },
  
  // Business Hours
  openingHours: {
    weekdays: "Montag bis Freitag: nach telefonischer Vereinbarung"
  },
  
  // SEO
  seo: {
    siteTitle: "CB Handels GmbH | Kraftfahrzeuge & Maschinen in Reichenfels, Kärnten",
    metaDescription:
      "CB Handels GmbH in Reichenfels, Kärnten – Ihr Partner für den Handel mit Kraftfahrzeugen und Maschinen. Fahrzeuge, Nutzfahrzeuge und Maschinen mit fairen Preisen und persönlicher Beratung.",
    keywords:
      "CB Handels, Reichenfels, Kärnten, Gebrauchtwagen Reichenfels, Nutzfahrzeuge Reichenfels, Maschinenhandel, Traktoren, Landmaschinen, Autoankauf, Fahrzeughandel",
    canonicalUrl: "https://cbhandel.at",
    ogImage: "https://cbhandel.at/assets/og-image.jpg"
  },
  
  // Branding (placeholder, anpassbar nach CI)
  colors: {
    primary: "#004b8d",
    primaryRgb: "0, 75, 141",
    primaryLight: "#2469a6",
    primaryDark: "#003564"
  },
  
  // Social Media (Handle: /cbhandel)
  social: {
    facebook: "https://www.facebook.com/cbhandel",
    instagram: "https://www.instagram.com/cbhandelsgmbh/",
    tiktok: "https://www.tiktok.com/@cbhandel",
    youtube: "https://www.youtube.com/@cbhandel",
    twitter: "https://x.com/cbhandel",
    twitterHandle: "@cbhandel",
    googleReview: "https://g.page/r/CVRmGd5zMxr1EBM/review"
  },
  
  // Vehicle / Machine Data Source
  // Supports: 'motornetzwerk', 'willhaben', 'autoscout24', 'combined'
  dataSource: {
    type: "combined", // Use combined to fetch from multiple sources
    dealerId: "1006018", // Organization ID from willhaben
    dealerSlug: "cb-handels-gmbh", // Dealer slug for URL construction
    baseUrl: "https://cbhandel.at",
    apiEndpoints: {
      pkw: "",
      nutzfahrzeuge: ""
    },
    sourceUrls: {
      pkw: "https://www.autoscout24.at/haendler/cb-handels-gmbh",
      nutzfahrzeuge: "https://www.autoscout24.at/haendler/cb-handels-gmbh?atype=X",
      willhaben: "https://www.willhaben.at/iad/haendler/cb-handels-gmbh/auto",
      landwirt: "https://www.landwirt.com/dealer/info/cb-handels-gmbh-10561/machines"
    },
    // Reference links for manual import / scraping / sync
    referenceLinks: {
      willhaben: "https://www.willhaben.at/iad/haendler/cb-handels-gmbh/auto",
      autoscout24: "https://www.autoscout24.at/haendler/cb-handels-gmbh",
      autoscout24Transporter: "https://www.autoscout24.at/haendler/cb-handels-gmbh?atype=X",
      landwirt: "https://www.landwirt.com/dealer/info/cb-handels-gmbh-10561/machines",
      gebrauchtwagenAt: "https://www.gebrauchtwagen.at/handlerwagen/?cid=14166681",
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
    "CB Handels GmbH in Reichenfels, Kärnten – Spezialist für den Handel mit Kraftfahrzeugen, Nutzfahrzeugen und Maschinen. Persönliche Beratung, faire Konditionen und eine vielfältige Auswahl."
};
