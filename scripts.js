/**
 * CB Handels GmbH - Main JavaScript
 * Vanilla JavaScript with CSS animations
 */

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element, offset = 0) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <=
      (window.innerHeight || document.documentElement.clientHeight) - offset &&
    rect.bottom >= 0
  );
}

/**
 * Get mouse position relative to element
 */
function getMousePos(e, element) {
  const rect = element.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

// ========================================
// VEHICLE DATA LOADING
// ========================================

/**
 * Load vehicles from API
 */
let allVehiclesData = [];
async function fetchAllVehicles() {
  if (allVehiclesData.length > 0) {
    return allVehiclesData; // Return cached data
  }

  try {
    console.log("Fetching vehicles from /api/vehicles...");
    const response = await fetch("/api/vehicles");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    const data = JSON.parse(responseText);

    if (!data.success || !data.vehicles || !Array.isArray(data.vehicles)) {
      throw new Error("Invalid API response");
    }

    allVehiclesData = data.vehicles;
    console.log(`Fetched ${allVehiclesData.length} vehicles from API`);
    return allVehiclesData;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    // Announce error to screen readers
    announceToScreenReader("vehicles", "Fehler beim Laden der Fahrzeuge. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch.");
    return [];
  }
}

/**
 * Load vehicles for featured section (Highlight-Fahrzeuge) - 3 vehicles
 */
async function loadFeaturedVehicles() {
  const featuredGrid = document.querySelector(
    "#featured-vehicles .featured-grid"
  );
  if (!featuredGrid) return;

  featuredGrid.innerHTML =
    '<div class="loading-vehicles" style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-secondary);">Fahrzeuge werden geladen...</div>';

  const vehicles = await fetchAllVehicles();

  if (vehicles.length === 0) {
    featuredGrid.innerHTML = `
      <div class="loading-vehicles" style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-secondary);">
        <p>Aktuell sind keine Fahrzeuge verfügbar.</p>
      </div>
    `;
    return;
  }

  featuredGrid.innerHTML = "";

  // Sort by price (descending) and take top 3 most expensive
  const sortedVehicles = [...vehicles].sort(
    (a, b) => (b.price || 0) - (a.price || 0)
  );
  sortedVehicles.slice(0, 3).forEach((vehicle) => {
    const card = renderVehicleCard(vehicle);
    featuredGrid.appendChild(card);
  });

  setTimeout(() => {
    initQuickView();
    initComparison();
    initVehicleFilters();
    initShareModal();
    initProgressiveImages();
  }, 100);
}

/**
 * Fallback: Try to extract vehicles from iframe (only works if same-origin)
 */
function tryExtractFromIframe(featuredGrid) {
  const iframe = document.getElementById("iframe-vollstaendig");
  if (!iframe) {
    featuredGrid.innerHTML = `
      <div class="loading-vehicles" style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-secondary);">
        <p>Aktuell sind keine Fahrzeuge über die API verfügbar.</p>
        <p style="font-size: 0.875rem; margin-top: 0.5rem;">Bitte verwenden Sie die vollständige Fahrzeugsuche unten.</p>
        <p style="font-size: 0.75rem; margin-top: 0.5rem; color: var(--text-secondary); opacity: 0.7;">Die vollständige Fahrzeugliste finden Sie in der Suche.</p>
      </div>
    `;
    return;
  }

  // Cross-origin iframe - can't access content
  // Show helpful message directing users to the iframe search
  featuredGrid.innerHTML = `
    <div class="loading-vehicles" style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-secondary);">
      <p>Die Featured-Fahrzeuge werden derzeit über die API geladen.</p>
      <p style="font-size: 0.875rem; margin-top: 0.5rem;">Bitte verwenden Sie die vollständige Fahrzeugsuche unten.</p>
      <p style="font-size: 0.75rem; margin-top: 0.5rem; color: var(--text-secondary); opacity: 0.7;">Hinweis: Bitte prüfen Sie die Vercel Function Logs für Parsing-Details.</p>
    </div>
  `;
}

/**
 * Render a vehicle card HTML element
 */
function renderVehicleCard(vehicle) {
  const article = document.createElement("article");
  article.className = "vehicle-card tilt-card";
  article.dataset.vehicleId = vehicle.id;
  article.dataset.category = determineCategory(vehicle);
  article.dataset.price = vehicle.price || "0";
  article.dataset.year = vehicle.year || "0";
  article.dataset.mileage = vehicle.mileage || "0";

  // Format price
  const formattedPrice = vehicle.price
    ? `€ ${vehicle.price.toLocaleString("de-DE")},-`
    : "Preis auf Anfrage";

  // Format specs
  const specs = [];
  if (vehicle.year) specs.push(`${vehicle.year}`);
  if (vehicle.mileage)
    specs.push(`${vehicle.mileage.toLocaleString("de-DE")} km`);
  if (vehicle.power)
    specs.push(`${vehicle.power.kw} kW (${vehicle.power.ps} PS)`);
  const specsText = specs.join(" • ");

  // Features/badges
  const features = [];
  if (vehicle.transmission) {
    const trans = vehicle.transmission.toLowerCase();
    if (trans.includes("automatik")) features.push("Automatik");
    if (trans.includes("schalt")) features.push("Schaltgetriebe");
  }

  // Determine badge
  let badgeHtml = "";
  if (vehicle.price && vehicle.price < 15000) {
    badgeHtml = '<div class="card-badge badge-top-offer">Top Angebot</div>';
  }

  // Fuel badge
  let fuelBadgeHtml = "";
  if (vehicle.fuelType) {
    const fuel = vehicle.fuelType.toLowerCase();
    if (fuel.includes("diesel")) {
      fuelBadgeHtml = '<div class="fuel-badge">Diesel</div>';
    } else if (fuel.includes("benzin")) {
      fuelBadgeHtml = '<div class="fuel-badge">Benzin</div>';
    } else if (fuel.includes("elektro") || fuel.includes("hybrid")) {
      fuelBadgeHtml = '<div class="fuel-badge">Elektro/Hybrid</div>';
    }
  }

  // Make entire card clickable
  article.style.cursor = "pointer";
  article.setAttribute("role", "link");
  article.setAttribute("tabindex", "0");
  article.setAttribute("aria-label", `Fahrzeugdetails: ${vehicle.title}`);

  // Add click handler to open internal Quick View via deep-link
  article.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    if (vehicle.id) {
      const targetHash = `#fahrzeuge/vehicle/${vehicle.id}`;
      // If clicking the same vehicle that's already in the hash, directly open the modal
      if (window.location.hash === targetHash) {
        if (typeof window.openQuickView === "function") {
          window.openQuickView(vehicle.id);
        }
      } else {
        // Otherwise, set the hash (which will trigger hashchange and open the modal)
        window.location.hash = targetHash;
      }
    }
  });

  // Also handle Enter key for accessibility
  article.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (vehicle.id) {
        const targetHash = `#fahrzeuge/vehicle/${vehicle.id}`;
        // If clicking the same vehicle that's already in the hash, directly open the modal
        if (window.location.hash === targetHash) {
          if (typeof window.openQuickView === "function") {
            window.openQuickView(vehicle.id);
          }
        } else {
          // Otherwise, set the hash (which will trigger hashchange and open the modal)
          window.location.hash = targetHash;
        }
      }
    }
  });

  // ========================================
  // MOBILE TOUCH FEEDBACK FOR CARDS
  // ========================================
  if ("ontouchstart" in window) {
    article.addEventListener(
      "touchstart",
      (e) => {
        article.classList.add("touch-active");
      },
      { passive: true }
    );

    article.addEventListener(
      "touchend",
      () => {
        setTimeout(() => {
          article.classList.remove("touch-active");
        }, 200);
      },
      { passive: true }
    );

    article.addEventListener(
      "touchcancel",
      () => {
        article.classList.remove("touch-active");
      },
      { passive: true }
    );
  }

  article.innerHTML = `
    <div class="card-inner">
      <div class="card-image">
        <img
          src="${vehicle.image || "assets/vehicles/placeholder.jpg"}"
          alt="${vehicle.title}"
          loading="lazy"
          onerror="if(this.src.indexOf('placeholder.jpg')===-1){this.src='assets/vehicles/placeholder.jpg';this.onerror=null;}"
        />
        ${badgeHtml}
        <div class="card-image-overlay">
          <div class="card-actions">
            <button
              class="quick-view-btn"
              aria-label="Schnellansicht"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                ></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button
              class="share-vehicle-btn card-action-btn"
              aria-label="Fahrzeug teilen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
            <button
              class="compare-checkbox-btn"
              aria-label="Zum Vergleich hinzufügen"
            >
              <input
                type="checkbox"
                class="compare-checkbox"
                aria-label="Zum Vergleich"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="3" width="14" height="14" rx="2" ry="2" opacity="0.5"></rect>
                <rect x="7" y="7" width="14" height="14" rx="2" ry="2"></rect>
              </svg>
            </button>
            <button
              class="inquiry-btn card-action-btn"
              aria-label="Anfrage stellen"
              title="Fahrzeug anfragen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div class="card-content glassmorphism">
        <div class="card-header">
          ${fuelBadgeHtml}
        </div>
        <h3 class="card-title">${escapeHtml(vehicle.title)}</h3>
        <p class="card-specs">${specsText || "Details auf Anfrage"}</p>
        <div class="card-features">
          ${features
            .map((f) => `<span class="feature-tag">${escapeHtml(f)}</span>`)
            .join("")}
        </div>
        <div class="card-footer">
          <span class="card-price">${formattedPrice}</span>
          <div class="card-cta-buttons">
            <button class="financing-badge financing-trigger" aria-label="Finanzierung berechnen" title="Finanzierung berechnen">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <span>Finanzierung</span>
            </button>
            <a
              href="#fahrzeuge/vehicle/${vehicle.id}"
              class="btn btn-primary btn-sm"
            >
              Details
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  return article;
}

/**
 * Render vehicle in list view format
 */
function renderVehicleListItem(vehicle) {
  const listItem = document.createElement("article");
  listItem.className = "vehicle-list-item";
  listItem.dataset.vehicleId = vehicle.id;
  listItem.dataset.category = determineCategory(vehicle);
  listItem.dataset.price = vehicle.price || "0";
  listItem.dataset.year = vehicle.year || "0";
  listItem.dataset.mileage = vehicle.mileage || "0";

  const formattedPrice = vehicle.price
    ? `€ ${vehicle.price.toLocaleString("de-DE")},-`
    : "Preis auf Anfrage";

  const specs = [];
  if (vehicle.year) specs.push(`${vehicle.year}`);
  if (vehicle.mileage)
    specs.push(`${vehicle.mileage.toLocaleString("de-DE")} km`);
  if (vehicle.fuelType) specs.push(vehicle.fuelType);
  if (vehicle.power)
    specs.push(`${vehicle.power.kw} kW (${vehicle.power.ps} PS)`);
  if (vehicle.transmission) specs.push(vehicle.transmission);

  listItem.style.cursor = "pointer";
  listItem.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    if (vehicle.id) {
      const targetHash = `#fahrzeuge/vehicle/${vehicle.id}`;
      // If clicking the same vehicle that's already in the hash, directly open the modal
      if (window.location.hash === targetHash) {
        if (typeof window.openQuickView === "function") {
          window.openQuickView(vehicle.id);
        }
      } else {
        // Otherwise, set the hash (which will trigger hashchange and open the modal)
        window.location.hash = targetHash;
      }
    }
  });

  listItem.innerHTML = `
    <div class="list-item-image">
      <img src="${
        vehicle.image || "assets/vehicles/placeholder.jpg"
      }" alt="${escapeHtml(
    vehicle.title
  )}" loading="lazy" onerror="if(this.src.indexOf('placeholder.jpg')===-1){this.src='assets/vehicles/placeholder.jpg';this.onerror=null;}" />
    </div>
    <div class="list-item-content">
      <h3 class="list-item-title">${escapeHtml(vehicle.title)}</h3>
      <p class="list-item-specs">${
        specs.join(" • ") || "Details auf Anfrage"
      }</p>
    </div>
    <div class="list-item-price">
      <span class="price">${formattedPrice}</span>
      <a href="#fahrzeuge/vehicle/${
        vehicle.id
      }" class="btn btn-primary btn-sm">Details</a>
    </div>
  `;

  return listItem;
}

/**
 * Determine vehicle Category for filtering
 * Uses the vehicle's category property (pkw, nutzfahrzeuge, baumaschinen) if available,
 * otherwise falls back to price/year-based categories
 */
function determineCategory(vehicle) {
  // First, check if vehicle has a category property (pkw, nutzfahrzeuge, baumaschinen)
  if (vehicle.category) {
    // Normalize category values
    const category = vehicle.category.toLowerCase();
    if (category === 'pkw' || category === 'nutzfahrzeuge' || category === 'baumaschinen' || category === 'baumaschine') {
      return category === 'baumaschine' ? 'baumaschinen' : category;
    }
  }
  
  // Fallback to price/year-based categories for special offers
  if (vehicle.price && vehicle.price < 15000) return "top-offer";
  if (vehicle.year && vehicle.year >= new Date().getFullYear() - 2)
    return "new";
  return "all";
}

/**
 * Load all vehicles for "Unsere Fahrzeuge" section with pagination
 */
let currentPage = 1;
let vehiclesPerPage = 12; // Default, will be updated on window load

async function loadAllVehicles() {
  // Update vehiclesPerPage based on current window size
  if (typeof window !== "undefined" && window.innerWidth) {
    vehiclesPerPage = window.innerWidth < 768 ? 6 : 12;
  }

  const vehiclesGrid = document.querySelector("#fahrzeuge .vehicles-grid");
  if (!vehiclesGrid) return;

  // Show skeletons while loading
  showVehicleSkeletons(vehiclesGrid, 6);

  const vehicles = await fetchAllVehicles();
  if (vehicles.length === 0) {
    vehiclesGrid.innerHTML =
      '<div class="loading-vehicles" style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-secondary);"><p>Aktuell sind keine Fahrzeuge verfügbar.</p></div>';
    announceToScreenReader("vehicles", "Aktuell sind keine Fahrzeuge verfügbar.");
    return;
  }

  window.allVehiclesList = vehicles;
  announceToScreenReader("vehicles", `${vehicles.length} Fahrzeuge geladen.`);
  initViewToggle();
  initFahrzeugeFilters();
  renderVehiclesPage(vehicles, 1);

  // Check for vehicle parameter in URL after vehicles are loaded
  handleVehicleUrlParameter();
}

/**
 * Handle vehicle parameter in URL hash to open specific vehicle
 * Supports formats: #fahrzeuge/vehicle/ID or #fahrzeuge?vehicle=ID
 */
function handleVehicleUrlParameter() {
  const hash = window.location.hash;
  if (!hash) return;

  let vehicleId = null;

  // Try format: #fahrzeuge/vehicle/ID
  const vehiclePathMatch = hash.match(/fahrzeuge\/vehicle\/([^\/\?]+)/);
  if (vehiclePathMatch) {
    vehicleId = vehiclePathMatch[1];
  } else {
    // Try format: #fahrzeuge?vehicle=ID (legacy support)
    const vehicleParamMatch = hash.match(/[?&]vehicle=([^&]+)/);
    if (vehicleParamMatch) {
      vehicleId = vehicleParamMatch[1];
    }
  }

  if (!vehicleId) return;

  // Navigate to fahrzeuge section
  const fahrzeugeSection = document.getElementById("fahrzeuge");
  const header = document.getElementById("main-header");
  if (fahrzeugeSection && header) {
    // Batch DOM reads to prevent forced reflow
    requestAnimationFrame(() => {
      const headerHeight = header.offsetHeight || 0;
      const targetPosition = fahrzeugeSection.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    });
  }

  // Find vehicle in the loaded list
  const vehicle = window.allVehiclesList?.find((v) => v.id === vehicleId);
  if (!vehicle) {
    console.warn(`Vehicle with ID "${vehicleId}" not found`);
    return;
  }

  // If vehicle is not on current page, navigate to the correct page
  const vehicleIndex = window.allVehiclesList.indexOf(vehicle);
  const targetPage = Math.floor(vehicleIndex / vehiclesPerPage) + 1;

  if (targetPage !== currentPage) {
    renderVehiclesPage(window.allVehiclesList, targetPage);
    // Re-initialize after re-rendering
    setTimeout(() => {
      initQuickView();
      initComparison();
      initShareModal();
    }, 100);
  }

  // Wait a bit for vehicles to render, then find and open the vehicle
  setTimeout(() => {
    const vehicleCard = document.querySelector(
      `[data-vehicle-id="${vehicleId}"]`
    );
    if (vehicleCard && vehicleCard.classList.contains("vehicle-card")) {
      // Find and click the quick view button for this vehicle
      const quickViewBtn = vehicleCard.querySelector(".quick-view-btn");
      if (quickViewBtn) {
        quickViewBtn.click();
      } else {
        // Fallback: open Quick View directly with vehicle ID
        if (window.openQuickView) {
          window.openQuickView(vehicleId);
        }
      }
    } else {
      // Vehicle card not found, try opening Quick View directly with vehicle ID
      // This works if vehicles are loaded but card isn't rendered yet
      if (window.allVehiclesList?.find((v) => v.id === vehicleId)) {
        if (window.openQuickView) {
          window.openQuickView(vehicleId);
        } else {
          // If Quick View not initialized yet, trigger event
          const event = new CustomEvent("openQuickView", {
            detail: { vehicleId },
          });
          window.dispatchEvent(event);
        }
      }
    }
  }, 600);
}

function renderVehiclesPage(vehicles, page) {
  const vehiclesGrid = document.querySelector("#fahrzeuge .vehicles-grid");
  if (!vehiclesGrid) return;

  currentPage = page;
  const startIndex = (page - 1) * vehiclesPerPage;
  const pageVehicles = vehicles.slice(startIndex, startIndex + vehiclesPerPage);
  const isListView = vehiclesGrid.dataset.view === "list";

  // Use DocumentFragment to batch DOM updates and prevent forced reflows
  const fragment = document.createDocumentFragment();
  pageVehicles.forEach((vehicle) => {
    const element = isListView
      ? renderVehicleListItem(vehicle)
      : renderVehicleCard(vehicle);
    fragment.appendChild(element);
  });

  vehiclesGrid.innerHTML = "";
  vehiclesGrid.appendChild(fragment);

  renderPagination(vehicles.length, page);
  const countEl = document.getElementById("vehicle-count-fahrzeuge");
  if (countEl) countEl.textContent = vehicles.length;

  // Use requestAnimationFrame to defer initialization until after render
  requestAnimationFrame(() => {
    setTimeout(() => {
      initQuickView();
      initComparison();
      initShareModal();
      initProgressiveImages();
    }, 100);
  });
}

// ========================================
// SKELETONS & PROGRESSIVE IMAGES
// ========================================

function showVehicleSkeletons(container, count) {
  if (!container) return;
  const skeletons = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const sk = document.createElement("div");
    sk.className = "vehicle-card skeleton-card";
    sk.innerHTML = `
      <div class="card-inner">
        <div class="card-image skeleton-image"></div>
        <div class="card-content">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    `;
    skeletons.appendChild(sk);
  }
  container.innerHTML = "";
  container.appendChild(skeletons);
}

function initProgressiveImages() {
  const images = document.querySelectorAll(
    ".card-image img, .list-item-image img, .blog-image img"
  );
  images.forEach((img) => {
    if (!img.classList.contains("progressive")) {
      img.classList.add("progressive");
    }
    if (img.complete) {
      img.classList.add("is-loaded");
    } else {
      img.addEventListener("load", () => img.classList.add("is-loaded"), {
        once: true,
      });
      img.addEventListener("error", () => img.classList.add("is-loaded"), {
        once: true,
      });
    }
  });
}

function renderPagination(totalItems, currentPageNum) {
  const totalPages = Math.ceil(totalItems / vehiclesPerPage);
  const paginationEl = document.getElementById("pagination-numbers");
  const prevBtn = document.querySelector(".pagination-prev");
  const nextBtn = document.querySelector(".pagination-next");

  if (!paginationEl) return;
  paginationEl.innerHTML = "";

  if (prevBtn) {
    prevBtn.disabled = currentPageNum === 1;
    prevBtn.onclick = () => {
      if (currentPageNum > 1) {
        const filtered = getFilteredAndSortedVehicles();
        renderVehiclesPage(filtered, currentPageNum - 1);
      }
    };
  }

  const maxVisible = 5;
  let startPage = Math.max(1, currentPageNum - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  if (startPage > 1) {
    addPaginationNumber(1, currentPageNum, totalItems);
    if (startPage > 2)
      paginationEl.innerHTML += '<span class="pagination-dots">...</span>';
  }

  for (let i = startPage; i <= endPage; i++) {
    addPaginationNumber(i, currentPageNum, totalItems);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1)
      paginationEl.innerHTML += '<span class="pagination-dots">...</span>';
    addPaginationNumber(totalPages, currentPageNum, totalItems);
  }

  if (nextBtn) {
    nextBtn.disabled = currentPageNum === totalPages;
    nextBtn.onclick = () => {
      if (currentPageNum < totalPages) {
        const filtered = getFilteredAndSortedVehicles();
        renderVehiclesPage(filtered, currentPageNum + 1);
      }
    };
  }
}

function addPaginationNumber(pageNum, current, total) {
  const paginationEl = document.getElementById("pagination-numbers");
  if (!paginationEl) return;
  const button = document.createElement("button");
  button.className = `pagination-number ${pageNum === current ? "active" : ""}`;
  button.textContent = pageNum;
  button.onclick = () => {
    const filtered = getFilteredAndSortedVehicles();
    renderVehiclesPage(filtered, pageNum);
  };
  paginationEl.appendChild(button);
}

function initViewToggle() {
  const viewToggleBtns = document.querySelectorAll(
    "#fahrzeuge .view-toggle-btn"
  );
  const vehiclesGrid = document.querySelector("#fahrzeuge .vehicles-grid");
  if (!viewToggleBtns.length || !vehiclesGrid) return;

  viewToggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      viewToggleBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      vehiclesGrid.dataset.view = btn.dataset.view;
      const filtered = getFilteredAndSortedVehicles();
      renderVehiclesPage(filtered, currentPage);
    });
  });
}

// Global reference to car section search term
let carSectionSearchTerm = "";

function initFahrzeugeFilters() {
  const filterTabs = document.querySelectorAll("#fahrzeuge .filter-tab");
  const sortSelect = document.getElementById("sort-select-fahrzeuge");

  if (filterTabs.length) {
    filterTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        filterTabs.forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        const filtered = getFilteredAndSortedVehicles();
        renderVehiclesPage(filtered, 1);
      });
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      const filtered = getFilteredAndSortedVehicles();
      renderVehiclesPage(filtered, 1);
    });
  }
}

function getFilteredAndSortedVehicles() {
  if (!window.allVehiclesList) return [];
  let vehicles = [...window.allVehiclesList];

  const activeFilter =
    document.querySelector("#fahrzeuge .filter-tab.active")?.dataset.filter ||
    "all";
  if (activeFilter !== "all") {
    // Special handling for category filters (pkw, nutzfahrzeuge, baumaschinen)
    if (activeFilter === "pkw") {
      vehicles = vehicles.filter((v) => v.category === "pkw");
    } else if (activeFilter === "nutzfahrzeuge") {
      vehicles = vehicles.filter((v) => v.category === "nutzfahrzeuge");
    } else if (activeFilter === "baumaschinen") {
      // Handle both "baumaschine" (singular) and "baumaschinen" (plural) category values
      vehicles = vehicles.filter((v) => 
        v.category === "baumaschine" || v.category === "baumaschinen"
      );
    } else {
      // Use existing category determination for other filters (new, price-reduced)
      vehicles = vehicles.filter((v) => determineCategory(v) === activeFilter);
    }
  }

  // Apply car section search if active
  if (carSectionSearchTerm && carSectionSearchTerm.trim().length >= 2) {
    const matchingVehicles = VehicleSearchService.search(carSectionSearchTerm);
    const matchingIds = new Set(matchingVehicles.map(v => String(v.id)));
    vehicles = vehicles.filter(v => matchingIds.has(String(v.id)));
  }

  const sortValue =
    document.getElementById("sort-select-fahrzeuge")?.value || "default";
  vehicles.sort((a, b) => {
    switch (sortValue) {
      case "price-asc":
        return (a.price || 0) - (b.price || 0);
      case "price-desc":
        return (b.price || 0) - (a.price || 0);
      case "year-desc":
        return (b.year || 0) - (a.year || 0);
      case "year-asc":
        return (a.year || 0) - (b.year || 0);
      case "mileage-asc":
        return (a.mileage || 0) - (b.mileage || 0);
      case "mileage-desc":
        return (b.mileage || 0) - (a.mileage || 0);
      default:
        // When showing all vehicles with default sort, prioritize top-offer vehicles first
        if (activeFilter === "all") {
          const aIsTopOffer = determineCategory(a) === "top-offer";
          const bIsTopOffer = determineCategory(b) === "top-offer";
          if (aIsTopOffer && !bIsTopOffer) return -1; // top-offer comes first
          if (!aIsTopOffer && bIsTopOffer) return 1; // top-offer comes first
          return 0; // same priority, keep original order
        }
        return 0;
    }
  });

  return vehicles;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

// ========================================
// BACK TO TOP BUTTON
// ========================================

/**
 * Initialize back to top button functionality
 * Shows/hides button based on scroll position and handles smooth scroll
 */
function initBackToTop() {
  const backToTopButton = document.getElementById("back-to-top");
  if (!backToTopButton) return;

  // Threshold for showing the button (px from top)
  const scrollThreshold = 400;

  /**
   * Toggle button visibility based on scroll position
   * Use requestAnimationFrame to batch scroll reads and prevent forced reflow
   */
  function toggleButtonVisibility() {
    requestAnimationFrame(() => {
      const scrollY =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;

      if (scrollY > scrollThreshold) {
        backToTopButton.classList.add("show");
      } else {
        backToTopButton.classList.remove("show");
      }
    });
  }

  /**
   * Smooth scroll to car section (fahrzeuge)
   */
  function scrollToCarSection() {
    const carSection = document.getElementById("fahrzeuge");
    if (!carSection) {
      // Fallback to top if car section not found
      scrollToTop();
      return;
    }

    // Use smooth scroll behavior if available
    if ("scrollBehavior" in document.documentElement.style) {
      carSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      // Fallback for older browsers - optimized with requestAnimationFrame
      const scrollDuration = 500;
      const startScroll = window.scrollY;
      const targetPosition = carSection.getBoundingClientRect().top + window.scrollY;
      const distance = targetPosition - startScroll;
      const startTime = performance.now();
      
      function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / scrollDuration, 1);
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        window.scrollTo(0, startScroll + distance * easeOutCubic);
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      }
      
      requestAnimationFrame(animateScroll);
    }

    // Remove focus after scroll completes (for accessibility)
    setTimeout(() => {
      backToTopButton.blur();
    }, 1000);
  }

  /**
   * Fallback scroll to top function (if car section not found)
   */
  function scrollToTop() {
    // Use smooth scroll behavior if available
    if ("scrollBehavior" in document.documentElement.style) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      // Fallback for older browsers - optimized with requestAnimationFrame
      const scrollDuration = 500;
      const startScroll = window.scrollY;
      const startTime = performance.now();
      
      function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / scrollDuration, 1);
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        window.scrollTo(0, startScroll * (1 - easeOutCubic));
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      }
      
      requestAnimationFrame(animateScroll);
    }

    // Remove focus after scroll completes (for accessibility)
    setTimeout(() => {
      backToTopButton.blur();
    }, 1000);
  }

  // Initial check on load
  toggleButtonVisibility();

  // Debounced scroll handler for performance
  const handleScroll = debounce(toggleButtonVisibility, 100);

  // Listen for scroll events
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Handle click/tap - scroll to car section
  backToTopButton.addEventListener("click", scrollToCarSection);

  // Handle keyboard navigation (Enter and Space) - scroll to car section
  backToTopButton.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollToCarSection();
    }
  });

  // Handle touch events for better mobile experience
  let touchStartY = 0;
  backToTopButton.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  backToTopButton.addEventListener("touchend", (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    // Only trigger if it's a tap (not a swipe)
    if (Math.abs(touchEndY - touchStartY) < 10) {
      scrollToCarSection();
    }
  });
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  // Use requestAnimationFrame to prevent forced reflow
  requestAnimationFrame(() => {
    // Ensure content is visible

    const main = document.querySelector("main");
    if (main) {
      // Batch DOM updates to prevent reflow
      main.style.cssText =
        "display: block; opacity: 1; visibility: visible; position: relative; z-index: 1;";
    }

    // Respect reduced motion preference globally
    if (isReducedMotion()) {
      document.body.classList.add("reduced-motion");
    }

    // Initialize all modules with staggered timing to prevent performance issues
    initLoadingAnimation();

    // Use setTimeout to stagger initialization and prevent blocking
    setTimeout(() => {
      initHeader();
      initThemeToggle();
      initMobileMenu();
      initScrollReveal();
    }, 0);

    setTimeout(() => {
      initMagneticButtons();
      initTiltCards();
      initIframeControls();
      initParallax();
      // Handle redirect parameter early to ensure smooth navigation
      handleRedirectParameter();
    }, 10);

    // Split heavy initialization across multiple frames to prevent blocking
    setTimeout(() => {
      // Phase 1: Core UI components
      initTestimonialsSlider();
      initVideoTestimonial();
      initCounters();
      initContactForm();
      initShareModal();
      initLightbox();
      initStickyCTA();
      initSmoothScroll();
      initBackToTop();
      initPageTransitions();
    }, 20);

    setTimeout(() => {
      // Phase 2: Vehicle-related features
      initQuickView();
      initComparison();
      // initVehicleFilters(); // Archived: Only used by featured-vehicles section (removed)
      initFinancingCalculator();
      initVehicleInquiry();
      initTradeInCalculator();
    }, 40);

    setTimeout(() => {
      // Phase 3: Forms and content
      initCookieBanner();
      // Initialize footer newsletter form
      initNewsletter();
      // Initialize contact section newsletter form
      initNewsletter("contact");
      initAppointmentBooking();
      initFAQ();
      initTabsA11y();
      initVehicleSearch();
      initBlogFeatures();
      initGlobalKeyboardActivation();
      // Progressive images for existing static images (blog, hero, etc.)
      initProgressiveImages();
    }, 60);

    // Load vehicles asynchronously after initial render
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Load vehicles from API
        // loadFeaturedVehicles(); // Archived: Featured Vehicles section removed - functionality merged into main Fahrzeuge section
        loadAllVehicles();

        // Listen for hash changes to handle vehicle URLs dynamically
        window.addEventListener("hashchange", () => {
          if (window.allVehiclesList && window.allVehiclesList.length > 0) {
            handleVehicleUrlParameter();
          }
        });
      }, 80);
    });
  });
});

// ========================================
// ACCESSIBILITY HELPERS (MODALS)
// ========================================

/**
 * Announce message to ARIA live region
 */
function announceToScreenReader(region, message) {
  const liveRegion = document.getElementById(`aria-live-${region}`);
  if (liveRegion) {
    // Clear previous message
    liveRegion.textContent = "";
    // Small delay to ensure screen readers pick up the change
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);
  }
}

function setupModalA11y(modalElement, options = {}) {
  if (!modalElement) return { open: () => {}, close: () => {} };

  const {
    titleSelector = "",
    initialFocusSelector = "",
    role = "dialog",
  } = options;

  // Set dialog semantics
  modalElement.setAttribute("role", role);
  modalElement.setAttribute("aria-modal", "true");

  const titleEl = titleSelector
    ? modalElement.querySelector(titleSelector)
    : null;
  if (titleEl) {
    if (!titleEl.id) titleEl.id = `${modalElement.id || "modal"}-title`;
    modalElement.setAttribute("aria-labelledby", titleEl.id);
  }

  let previouslyFocused = null;

  const focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  function trapFocus(e) {
    if (!modalElement.classList.contains("active")) return;
    const focusable = Array.from(
      modalElement.querySelectorAll(focusableSelectors)
    ).filter((el) => el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function open() {
    previouslyFocused = document.activeElement;
    // Focus title or first interactive
    const target = initialFocusSelector
      ? modalElement.querySelector(initialFocusSelector)
      : titleEl || modalElement.querySelector(focusableSelectors);
    target?.focus?.();
    document.addEventListener("keydown", trapFocus);
  }

  function close() {
    document.removeEventListener("keydown", trapFocus);
    previouslyFocused?.focus?.();
  }

  return { open, close };
}

// ========================================
// A11Y: TABS KEYBOARD NAVIGATION
// ========================================

function initTabsA11y() {
  const tablists = document.querySelectorAll('[role="tablist"]');
  if (!tablists.length) return;

  tablists.forEach((tablist) => {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    if (tabs.length === 0) return;

    // Ensure roving tabindex
    tabs.forEach((tab, index) => {
      const selected =
        tab.getAttribute("aria-selected") === "true" ||
        (tab.hasAttribute("aria-selected") === false && index === 0);
      tab.setAttribute("tabindex", selected ? "0" : "-1");
      if (!tab.hasAttribute("aria-selected"))
        tab.setAttribute("aria-selected", selected ? "true" : "false");
    });

    function activateTab(nextIndex) {
      tabs.forEach((tab, i) => {
        const isActive = i === nextIndex;
        tab.setAttribute("tabindex", isActive ? "0" : "-1");
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });
      tabs[nextIndex]?.dispatchEvent(
        new MouseEvent("click", { bubbles: true })
      );
      tabs[nextIndex]?.focus();
    }

    tablist.addEventListener("keydown", (e) => {
      const currentIndex = tabs.findIndex((t) => t === document.activeElement);
      if (currentIndex === -1) return;
      let nextIndex = currentIndex;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          nextIndex = (currentIndex + 1) % tabs.length;
          e.preventDefault();
          activateTab(nextIndex);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          e.preventDefault();
          activateTab(nextIndex);
          break;
        case "Home":
          e.preventDefault();
          activateTab(0);
          break;
        case "End":
          e.preventDefault();
          activateTab(tabs.length - 1);
          break;
        case "Enter":
        case " ": // Space key
          e.preventDefault();
          // Trigger click/activation on current
          tabs[currentIndex]?.dispatchEvent(
            new MouseEvent("click", { bubbles: true })
          );
          break;
        default:
          break;
      }
    });
  });
}

// ========================================
// A11Y: GLOBAL KEYBOARD ACTIVATION + REDUCED MOTION HELPER
// ========================================

function isReducedMotion() {
  try {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch (_) {
    return false;
  }
}

function initGlobalKeyboardActivation() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== " " && e.key !== "Enter") return;
    const active = document.activeElement;
    if (!active) return;
    // Activate non-native controls with role=button or explicit tabindex
    if (
      active.matches(
        '[role="button"], [role="tab"], [data-activates], .clickable, .card[tabindex], .vehicle-card[tabindex]'
      )
    ) {
      e.preventDefault();
      active.click();
    }
  });
}

// ========================================
// LOADING ANIMATION
// ========================================

function initLoadingAnimation() {
  // SIMPLIFIED: Loading animation completely disabled
  console.log("Loading animation disabled - content immediately visible");

  // Ensure main content is visible - batch style updates to prevent reflow
  const mainContent = document.querySelector("main");
  if (mainContent) {
    mainContent.style.cssText = "display: block; opacity: 1; visibility: visible; position: relative; z-index: 1;";
  }

  // Ensure body is scrollable
  document.body.style.overflow = "auto";
}

// ========================================
// HEADER / NAVIGATION
// ========================================

function initHeader() {
  const header = document.getElementById("main-header");
  const navLinks = document.querySelectorAll(".nav-link");

  // Scroll behavior with passive listeners for better performance
  window.addEventListener(
    "scroll",
    debounce(() => {
      if (window.scrollY > 100) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }, 16), // ~60fps
    { passive: true }
  );

  // Active link on scroll with passive listener
  const sections = document.querySelectorAll("section[id]");
  window.addEventListener(
    "scroll",
    debounce(() => {
      let current = "";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
          current = section.getAttribute("id");
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
          link.classList.add("active");
        }
      });
    }, 100),
    { passive: true }
  );
}

// ========================================
// THEME TOGGLE
// ========================================

function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  const htmlElement = document.documentElement;

  if (!themeToggle) return;

  // Check for saved theme preference or default to 'light'
  const currentTheme = localStorage.getItem("theme") || "light";
  htmlElement.setAttribute("data-theme", currentTheme);

  themeToggle.addEventListener("click", () => {
    const theme = htmlElement.getAttribute("data-theme");
    const newTheme = theme === "light" ? "dark" : "light";

    htmlElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    // Animate theme toggle button with CSS
    themeToggle.style.transition = "transform 0.5s ease";
    themeToggle.style.transform = "rotate(360deg)";
    setTimeout(() => {
      themeToggle.style.transform = "rotate(0deg)";
    }, 500);
  });
}

// ========================================
// MOBILE MENU
// ========================================

function initMobileMenu() {
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  if (!mobileMenuToggle || !navMenu) return;

  mobileMenuToggle.addEventListener("click", () => {
    mobileMenuToggle.classList.toggle("active");
    navMenu.classList.toggle("active");

    // Animate menu items with CSS
    if (navMenu.classList.contains("active")) {
      navLinks.forEach((link, index) => {
        link.style.opacity = "0";
        link.style.transform = "translateX(50px)";
        link.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        setTimeout(() => {
          link.style.opacity = "1";
          link.style.transform = "translateX(0)";
        }, index * 100);
      });
    }
  });

  // Close menu when clicking on a link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenuToggle.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });
  
  // Close menu when clicking on social links (but allow external navigation)
  const socialLinks = navMenu.querySelectorAll(".nav-social-link");
  socialLinks.forEach((link) => {
    link.addEventListener("click", () => {
      // Small delay to allow navigation to external sites
      setTimeout(() => {
        mobileMenuToggle.classList.remove("active");
        navMenu.classList.remove("active");
      }, 100);
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !navMenu.contains(e.target) &&
      !mobileMenuToggle.contains(e.target) &&
      navMenu.classList.contains("active")
    ) {
      mobileMenuToggle.classList.remove("active");
      navMenu.classList.remove("active");
    }
  });

  // ========================================
  // MOBILE SWIPE TO CLOSE MENU
  // ========================================
  if ("ontouchstart" in window && navMenu) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    navMenu.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    navMenu.addEventListener(
      "touchmove",
      (e) => {
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
      },
      { passive: true }
    );

    navMenu.addEventListener(
      "touchend",
      () => {
        const swipeDistanceX = touchEndX - touchStartX;
        const swipeDistanceY = Math.abs(touchEndY - touchStartY);

        // Only trigger if horizontal swipe is greater than vertical (horizontal swipe)
        // and swipe is to the right (closing the menu)
        if (
          swipeDistanceX > 100 &&
          swipeDistanceX > swipeDistanceY &&
          navMenu.classList.contains("active")
        ) {
          mobileMenuToggle.classList.remove("active");
          navMenu.classList.remove("active");
        }
      },
      { passive: true }
    );
  }
}

// ========================================
// SCROLL REVEAL ANIMATIONS
// ========================================

function initScrollReveal() {
  try {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Mark body as ready so CSS can animate only after JS prepared the DOM
    document.body.classList.add("is-reveal-ready");

    if (prefersReduced || !("IntersectionObserver" in window)) {
      // Gracefully show everything without animation
      document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
        el.classList.add("is-revealed");
      });
      return;
    }

    // Elements to reveal
    const targets = [
      ".section",
      ".vehicle-card",
      ".service-card",
      ".blog-card",
      ".team-card",
      ".facility-card",
      ".faq-item",
      "[data-scroll-reveal]",
    ]
      .map((sel) => Array.from(document.querySelectorAll(sel)))
      .flat()
      .filter(Boolean);

    if (!targets.length) return;

    // Ensure base class is present
    targets.forEach((el) => el.classList.add("reveal-on-scroll"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.classList.add("is-revealed");
            observer.unobserve(el);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12,
      }
    );

    targets.forEach((el) => observer.observe(el));
  } catch (err) {
    console.warn("initScrollReveal error", err);
  }
}

// ========================================
// PARALLAX (SUBTLE, REDUCED-MOTION AWARE)
// ========================================

function initParallax() {
  try {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const elements = Array.from(
      document.querySelectorAll("[data-parallax], .parallax-element")
    );
    if (!elements.length) return;

    const items = elements.map((el) => ({
      el,
      speed:
        parseFloat(el.getAttribute("data-parallax")) ||
        parseFloat(el.getAttribute("data-speed")) ||
        0.08,
      baseY: 0,
    }));

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          items.forEach(({ el, speed }) => {
            // Subtle effect: translate a fraction of scroll distance
            const translateY = Math.round(scrollY * speed);
            el.style.transform = `translate3d(0, ${translateY}px, 0)`;
          });
          ticking = false;
        });
      }
    }

    // Initial apply and listeners
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  } catch (err) {
    console.warn("initParallax error", err);
  }
}

// ========================================
// MAGNETIC BUTTONS - ENHANCED
// ========================================

function initMagneticButtons() {
  const magneticButtons = document.querySelectorAll(".magnetic-btn");

  if (!magneticButtons.length) return;

  // Skip magnetic effect if user prefers reduced motion
  if (isReducedMotion()) {
    console.log("Reduced motion detected, magnetic buttons disabled.");
    return;
  }

  magneticButtons.forEach((button) => {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let rafId = null;
    let isHovering = false;

    // Smooth interpolation animation
    function animate() {
      // Apply easing function for smoother motion
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;

      // Apply transform only if hovering, otherwise let return animation handle it
      if (isHovering) {
        button.style.transform = `translate(${currentX}px, ${currentY}px) scale(1.02)`;

        // Continue animation if there's significant difference
        if (
          Math.abs(targetX - currentX) > 0.01 ||
          Math.abs(targetY - currentY) > 0.01
        ) {
          rafId = requestAnimationFrame(animate);
        } else {
          rafId = null;
        }
      } else {
        // Smooth return with easing
        currentX += (targetX - currentX) * 0.2;
        currentY += (targetY - currentY) * 0.2;

        const scale =
          1 + Math.abs(currentX * 0.001) + Math.abs(currentY * 0.001);
        button.style.transform = `translate(${currentX}px, ${currentY}px) scale(${Math.min(
          scale,
          1
        )})`;

        if (
          Math.abs(targetX - currentX) > 0.01 ||
          Math.abs(targetY - currentY) > 0.01
        ) {
          rafId = requestAnimationFrame(animate);
        } else {
          button.style.transform = "translate(0px, 0px) scale(1)";
          rafId = null;
        }
      }
    }

    button.addEventListener("mouseenter", () => {
      isHovering = true;

      // Cancel any running return animation
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      // Start fresh animation if button was mid-return
      if (Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01) {
        rafId = requestAnimationFrame(animate);
      }
    });

    button.addEventListener("mousemove", (e) => {
      if (!isHovering) return;

      const pos = getMousePos(e, button);
      const rect = button.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Enhanced calculation with distance-based strength
      const rawX = pos.x - centerX;
      const rawY = pos.y - centerY;
      const distance = Math.sqrt(rawX * rawX + rawY * rawY);
      const maxDistance = Math.max(rect.width, rect.height) / 2;
      const strength = Math.min(distance / maxDistance, 1) * 0.4; // Max 40% movement

      targetX = rawX * strength;
      targetY = rawY * strength;

      // Start animation if not already running
      if (!rafId) {
        rafId = requestAnimationFrame(animate);
      }
    });

    button.addEventListener("mouseleave", () => {
      isHovering = false;
      targetX = 0;
      targetY = 0;

      // Cancel any existing animation frame to prevent conflicts
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      // Start return animation
      rafId = requestAnimationFrame(animate);
    });

    // Add click ripple effect
    button.addEventListener("click", (e) => {
      const ripple = document.createElement("span");
      ripple.className = "btn-ripple";
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
      `;

      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// ========================================
// 3D TILT CARDS
// ========================================

function initTiltCards() {
  const tiltCards = document.querySelectorAll(".tilt-card");

  if (!tiltCards.length) return;

  // Skip faz tilt effect if user prefers reduced motion
  if (isReducedMotion()) {
    console.log("Reduced motion detected, tilt cards disabled.");
    return;
  }

  tiltCards.forEach((card) => {
    const cardInner = card.querySelector(".card-inner");
    if (!cardInner) return;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      cardInner.style.transition = "transform 0.3s ease";
      cardInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      cardInner.style.transition = "transform 0.5s ease";
      cardInner.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    });
  });
}

// ========================================
// iFrame CONTROLS
// ========================================

function initIframeControls() {
  const expandButtons = document.querySelectorAll(".iframe-expand-btn");

  if (!expandButtons.length) return;

  expandButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const iframeId = button.getAttribute("data-iframe");
      const iframeWrapper = document.querySelector(
        `[data-iframe-container="${iframeId}"]`
      );

      if (!iframeWrapper) return;

      button.classList.toggle("expanded");
      iframeWrapper.classList.toggle("expanded");

      // Let CSS handle the height transitions - no inline styles needed
    });
  });
}

// ========================================
// TESTIMONIALS SLIDER
// ========================================

function initTestimonialsSlider() {
  const slides = document.querySelectorAll(".testimonial-slide");
  const prevBtn = document.querySelector(".slider-btn-prev");
  const nextBtn = document.querySelector(".slider-btn-next");
  const dotsContainer = document.querySelector(".testimonials-dots");
  const track = document.querySelector(".testimonials-track");

  if (!slides.length || !prevBtn || !nextBtn) return;

  let currentSlide = 0;

  // Lock track height to tallest slide to prevent layout shift
  function measureAndLockTrackHeight() {
    if (!track) return;
    // Temporarily ensure all slides are measurable
    const previousActives = [];
    slides.forEach((slide) => {
      if (slide.classList.contains("active")) previousActives.push(slide);
      slide.style.display = "block";
      slide.style.visibility = "hidden";
      slide.style.position = "absolute";
      slide.style.left = "-9999px";
      slide.style.top = "-9999px";
    });

    const maxHeight = Array.from(slides).reduce(
      (h, s) => Math.max(h, s.offsetHeight),
      0
    );
    track.style.minHeight = maxHeight + "px";

    // Restore visibility for non-active slides
    slides.forEach((slide) => {
      slide.style.display = slide.classList.contains("active") ? "block" : "";
      slide.style.visibility = "";
      slide.style.position = "";
      slide.style.left = "";
      slide.style.top = "";
    });
  }

  // Create dots
  slides.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.classList.add("testimonial-dot");
    if (index === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".testimonial-dot");

  function goToSlide(index, direction = "next") {
    // Remove active class from all with transition
    slides[currentSlide].classList.remove("active");
    dots[currentSlide].classList.remove("active");

    // Small delay for exit animation
    setTimeout(() => {
      // Add active class to target
      slides[index].classList.add("active");
      dots[index].classList.add("active");
      currentSlide = index;
      // Keep container height stable
      measureAndLockTrackHeight();
    }, 150);
  }

  prevBtn.addEventListener("click", () => {
    const newIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    goToSlide(newIndex, "prev");
  });

  nextBtn.addEventListener("click", () => {
    const newIndex = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    goToSlide(newIndex, "next");
  });

  // Auto-play slider
  let autoPlayInterval = setInterval(() => {
    const newIndex = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    goToSlide(newIndex);
  }, 5000);

  // Pause auto-play on hover
  const sliderContainer = document.querySelector(".testimonials-slider");
  sliderContainer.addEventListener("mouseenter", () => {
    clearInterval(autoPlayInterval);
  });

  sliderContainer.addEventListener("mouseleave", () => {
    autoPlayInterval = setInterval(() => {
      const newIndex =
        currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
      goToSlide(newIndex);
    }, 5000);
  });

  // Initial measurement and on resize
  measureAndLockTrackHeight();
  window.addEventListener(
    "resize",
    debounce(() => measureAndLockTrackHeight(), 100)
  );

  // ========================================
  // MOBILE SWIPE GESTURES FOR TESTIMONIALS
  // ========================================
  if (sliderContainer && "ontouchstart" in window) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isDragging = false;
    let isHorizontalSwipe = false;
    let hasMoved = false;

    function handleTouchStart(e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isDragging = true;
      isHorizontalSwipe = false;
      hasMoved = false;
      // Pause auto-play during swipe
      clearInterval(autoPlayInterval);
    }

    function handleTouchMove(e) {
      if (!isDragging) return;
      
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;

      const deltaX = Math.abs(touchEndX - touchStartX);
      const deltaY = Math.abs(touchEndY - touchStartY);

      // Only mark as moved if there's significant movement
      if (deltaX > 5 || deltaY > 5) {
        hasMoved = true;
      }

      // Only prevent default if the swipe is CLEARLY horizontal
      // Use a stricter ratio: horizontal movement must be at least 2x vertical movement
      // AND must have moved at least 15px horizontally
      // This ensures vertical scrolling works smoothly
      if (deltaX > 15 && deltaX > deltaY * 2) {
        if (!isHorizontalSwipe) {
          isHorizontalSwipe = true;
        }
        e.preventDefault(); // Prevent page scroll only for clear horizontal swipes
      } else {
        // If it's not clearly horizontal, allow normal scrolling
        // Reset horizontal swipe flag if vertical movement dominates
        if (deltaY > deltaX * 1.5) {
          isHorizontalSwipe = false;
        }
      }
    }

    function handleTouchEnd() {
      if (!isDragging) return;
      isDragging = false;

      const swipeDistance = touchStartX - touchEndX;
      const minSwipeDistance = 50; // Minimum distance for swipe recognition

      // Only process swipe if:
      // 1. It was clearly identified as a horizontal swipe
      // 2. The swipe distance is sufficient
      // 3. The user actually moved (not just a tap)
      if (isHorizontalSwipe && hasMoved && Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
          // Swipe left - next slide
          const newIndex =
            currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
          goToSlide(newIndex, "next");
        } else {
          // Swipe right - previous slide
          const newIndex =
            currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
          goToSlide(newIndex, "prev");
        }
      }

      // Reset flags
      isHorizontalSwipe = false;
      hasMoved = false;

      // Resume auto-play after swipe
      autoPlayInterval = setInterval(() => {
        const newIndex =
          currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
        goToSlide(newIndex);
      }, 5000);
    }

    sliderContainer.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    sliderContainer.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    sliderContainer.addEventListener("touchend", handleTouchEnd);
    sliderContainer.addEventListener("touchcancel", handleTouchEnd);
  }
}

// ========================================
// VIDEO TESTIMONIAL MODAL
// ========================================

function initVideoTestimonial() {
  const videoModal = document.getElementById("video-testimonial-modal");
  const videoBtn = document.querySelector(".testimonial-video-btn");
  const videoAvatar = document.querySelector(
    ".testimonial-avatar.video-testimonial"
  );
  const closeBtn = document.querySelector(".video-testimonial-close");
  const backdrop = document.querySelector(".video-testimonial-backdrop");

  if (!videoModal) return;

  // A11y wiring - improve focus management
  const a11y = setupModalA11y(videoModal, {
    titleSelector: ".video-testimonial-title",
    initialFocusSelector: ".video-testimonial-close",
  });

  function openVideoModal() {
    videoModal.classList.add("active");
    document.body.style.overflow = "hidden";
    a11y.open();
  }

  function closeVideoModal() {
    videoModal.classList.remove("active");
    document.body.style.overflow = "";
    a11y.close();
  }

  // Open modal on button or avatar click
  if (videoBtn) {
    videoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openVideoModal();
    });
  }

  if (videoAvatar) {
    videoAvatar.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openVideoModal();
    });
  }

  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener("click", closeVideoModal);
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeVideoModal);
  }

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && videoModal.classList.contains("active")) {
      closeVideoModal();
    }
  });
}

// ========================================
// ANIMATED COUNTERS
// ========================================

function initCounters() {
  const counters = document.querySelectorAll(".stat-number");

  if (!counters.length) return;

  // Enhanced counter animation with easing and decimal support
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          // Skip if already animated
          if (
            counter.classList.contains("counting") ||
            counter.classList.contains("counted")
          ) {
            return;
          }

          const targetValue = parseFloat(counter.getAttribute("data-count"));
          const isDecimal = counter.hasAttribute("data-decimal");
          const suffix = counter.getAttribute("data-suffix") || "";

          // Add animation class to disable pulse animation during counting
          counter.classList.add("counting");

          // Set min-width to prevent layout shifts during animation
          // Estimate width based on target value to prevent reflow
          const estimatedWidth =
            String(targetValue).length + (suffix ? suffix.length : 0);
          counter.style.minWidth = `${estimatedWidth * 0.6}em`;

          animateCounter(counter, targetValue, isDecimal, suffix);
          observer.unobserve(counter);
        }
      });
    },
    { threshold: 0.1 } // Lower threshold to trigger earlier
  );

  // Check if counters are already visible on page load
  counters.forEach((counter) => {
    const rect = counter.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (
      isVisible &&
      !counter.classList.contains("counting") &&
      !counter.classList.contains("counted")
    ) {
      // Trigger animation immediately if already visible
      const targetValue = parseFloat(counter.getAttribute("data-count"));
      const isDecimal = counter.hasAttribute("data-decimal");
      const suffix = counter.getAttribute("data-suffix") || "";

      counter.classList.add("counting");
      const estimatedWidth =
        String(targetValue).length + (suffix ? suffix.length : 0);
      counter.style.minWidth = `${estimatedWidth * 0.6}em`;
      animateCounter(counter, targetValue, isDecimal, suffix);
    } else {
      // Observe for scroll-triggered animation
      observer.observe(counter);
    }
  });

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(element, target, isDecimal, suffix) {
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    const startValue = 0;

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = startValue + (target - startValue) * easedProgress;

      // Use textContent instead of innerText for better performance
      // and use a temporary variable to reduce layout thrashing
      let displayValue;
      if (isDecimal) {
        displayValue = current.toFixed(1) + suffix;
      } else {
        displayValue = Math.floor(current) + suffix;
      }

      // Only update if value changed to reduce unnecessary repaints
      if (element.textContent !== displayValue) {
        element.textContent = displayValue;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // Ensure final value is exact
        if (isDecimal) {
          element.textContent = target.toFixed(1) + suffix;
        } else {
          element.textContent = Math.floor(target) + suffix;
        }
        element.classList.remove("counting");
        element.classList.add("counted");
        // Reset min-width after animation completes
        element.style.minWidth = "";
      }
    }

    requestAnimationFrame(updateCounter);
  }
}

// ========================================
// CONTACT FORM
// ========================================

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const formStatus = document.getElementById("form-status");
  const submitButton = form.querySelector(".btn-submit");
  const messageInput = form.querySelector('textarea[name="nachricht"]');

  // Pre-fill message from URL parameter (e.g., from trade-in calculator)
  const urlParams = new URLSearchParams(window.location.search);
  const messageParam = urlParams.get("message");
  if (messageParam && messageInput) {
    messageInput.value = decodeURIComponent(messageParam);
    // Scroll to contact form
    const contactSection = document.getElementById("kontakt");
    if (contactSection) {
      setTimeout(() => {
        contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
        messageInput.focus();
      }, 100);
    }
  }

  // Real-time validation
  const inputs = form.querySelectorAll("input, textarea");
  inputs.forEach((input) => {
    // For checkboxes, validate on change
    if (input.type === "checkbox") {
      input.addEventListener("change", () => validateField(input));
    } else {
      // For text inputs, validate on blur
      input.addEventListener("blur", () => validateField(input));

      // Validate on input (real-time)
      input.addEventListener("input", () => {
        // Clear previous validation state
        if (input.classList.contains("error")) {
          validateField(input);
        }
      });
    }
  });

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(field) {
    // Handle checkboxes separately
    if (field.type === "checkbox") {
      const isValid = !field.hasAttribute("required") || field.checked;

      // Remove previous error state
      field.classList.remove("error", "valid");
      const existingError =
        field.parentElement.parentElement.querySelector(".field-error");
      if (existingError) {
        existingError.remove();
      }

      // Apply validation state
      if (!isValid) {
        field.classList.add("error");
        showFieldError(field.parentElement, "Dieses Feld ist erforderlich.");
      } else {
        field.classList.add("valid");
      }

      return isValid;
    }

    // Handle text inputs and textareas
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = "";

    // Remove previous error state
    field.classList.remove("error", "valid");
    const existingError = field.parentElement.querySelector(".field-error");
    if (existingError) {
      existingError.remove();
    }

    // Validate based on field type
    if (field.hasAttribute("required") && !value) {
      isValid = false;
      errorMessage = "Dieses Feld ist erforderlich.";
    } else if (field.type === "email" && value && !emailRegex.test(value)) {
      isValid = false;
      errorMessage = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    } else if (field.type === "textarea" && value.length < 10) {
      isValid = false;
      errorMessage = "Bitte geben Sie mindestens 10 Zeichen ein.";
    } else if (
      field.type === "text" &&
      field.name === "name" &&
      value.length < 2
    ) {
      isValid = false;
      errorMessage = "Bitte geben Sie einen gültigen Namen ein.";
    }

    // Apply validation state
    if (!isValid && value) {
      field.classList.add("error");
      showFieldError(field, errorMessage);
    } else if (value) {
      field.classList.add("valid");
    }

    return isValid;
  }

  function showFieldError(field, message) {
    const errorElement = document.createElement("span");
    errorElement.className = "field-error";
    errorElement.textContent = message;
    field.parentElement.appendChild(errorElement);
  }

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate all fields including checkboxes
    let isFormValid = true;
    inputs.forEach((input) => {
      if (!validateField(input)) {
        isFormValid = false;
      }
    });

    // Also check all checkboxes specifically
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      if (!validateField(checkbox)) {
        isFormValid = false;
      }
    });

    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Check required fields
    if (!data.name || !data.email || !data.nachricht || !data.datenschutz) {
      showFormStatus("error", "Bitte füllen Sie alle Pflichtfelder aus.");
      isFormValid = false;
    }

    if (!isFormValid) {
      // Scroll to first error
      const firstError = form.querySelector(".error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        firstError.focus();
      }
      return;
    }

    // Show loading state
    submitButton.classList.add("loading");
    submitButton.disabled = true;

    try {
      // Build email body with form data
      const emailBodyText = `Name: ${data.name || ""}
E-Mail: ${data.email || ""}
Telefon: ${data.telefon || "Nicht angegeben"}

Nachricht:
${data.nachricht || ""}`;

      // Build mailto link
      const subject = encodeURIComponent(
        "Kontaktanfrage von " + (data.name || "Website")
      );
      const emailBody = encodeURIComponent(emailBodyText);
      const email = (window.dealerConfig && window.dealerConfig.email) || 'office@cbhandel.at';
      const mailtoLink = `mailto:${email}?subject=${subject}&body=${emailBody}`;

      // Open email client
      window.location.href = mailtoLink;

      // Show success message and reset form
      showFormStatus(
        "success",
        "Ihr E-Mail-Programm wird geöffnet. Bitte senden Sie die E-Mail ab."
      );
      form.reset();
      // Clear all validation states
      inputs.forEach((input) => {
        input.classList.remove("error", "valid");
        const error = input.parentElement.querySelector(".field-error");
        if (error) error.remove();
      });

      // Clear checkbox validation states
      const checkboxes = form.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        checkbox.classList.remove("error", "valid");
        const error =
          checkbox.parentElement.parentElement.querySelector(".field-error");
        if (error) error.remove();
      });

      // Add success animation
      form.classList.add("form-success");
      setTimeout(() => form.classList.remove("form-success"), 2000);
    } catch (error) {
      console.error("Form submission error:", error);
      showFormStatus(
        "error",
        "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch."
      );
    } finally {
      submitButton.classList.remove("loading");
      submitButton.disabled = false;
    }
  });

  function showFormStatus(type, message) {
    formStatus.className = `form-status ${type}`;
    formStatus.textContent = message;
    formStatus.style.display = "block";

    // Announce to screen readers
    announceToScreenReader("forms", message);

    // Animate status message with CSS
    formStatus.style.opacity = "0";
    formStatus.style.transform = "translateY(-20px)";
    formStatus.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    setTimeout(() => {
      formStatus.style.opacity = "1";
      formStatus.style.transform = "translateY(0)";
    }, 10);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      formStatus.style.opacity = "0";
      setTimeout(() => {
        formStatus.style.display = "none";
      }, 500);
    }, 5000);
  }
}

// ========================================
// TOAST NOTIFICATION
// ========================================

/**
 * Show a toast notification
 */
function showToast(message, type = "success") {
  // Create toast element if it doesn't exist
  let toast = document.getElementById("toast-notification");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #000);
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
      max-width: 300px;
      font-size: 0.9rem;
      border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
    `;
    document.body.appendChild(toast);
  }

  // Set message and type
  toast.textContent = message;
  toast.className = `toast-${type}`;

  // Show toast
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
    toast.style.pointerEvents = "auto";
  });

  // Auto-hide after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    setTimeout(() => {
      toast.style.pointerEvents = "none";
    }, 300);
  }, 3000);
}

// ========================================
// SHARE MODAL
// ========================================

function initShareModal() {
  const shareButtons = document.querySelectorAll(".share-btn");
  const shareVehicleButtons = document.querySelectorAll(
    ".share-vehicle-btn, .share-vehicle-btn-modal"
  );
  const shareModal = document.getElementById("share-modal");
  const shareModalClose = document.querySelector(".share-modal-close");
  const shareModalTitle = document.querySelector(".share-modal-title");
  const shareOptions = document.querySelectorAll(".share-option");

  let currentPostSlug = "";
  let currentVehicleId = "";
  let currentShareType = ""; // "post" or "vehicle"

  // A11y wiring
  const a11y = setupModalA11y(shareModal, {
    titleSelector: ".share-modal-title",
  });

  // Handle blog post sharing
  shareButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentPostSlug = button.getAttribute("data-post");
      currentShareType = "post";
      if (shareModalTitle) {
        shareModalTitle.textContent = "Beitrag teilen";
      }
      shareModal.classList.add("active");
      a11y.open();

      // Animate modal with CSS
      const modalContent = document.querySelector(".share-modal-content");
      if (modalContent) {
        modalContent.style.opacity = "0";
        modalContent.style.transform = "scale(0.8)";
        modalContent.style.transition =
          "opacity 0.3s ease, transform 0.3s ease";
        setTimeout(() => {
          modalContent.style.opacity = "1";
          modalContent.style.transform = "scale(1)";
        }, 10);
      }
    });
  });

  // Handle vehicle sharing
  shareVehicleButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      // Get vehicle ID from button or closest vehicle card
      currentVehicleId =
        button.getAttribute("data-vehicle-id") ||
        button.closest(".vehicle-card")?.dataset.vehicleId ||
        document.getElementById("quick-view-modal")?.dataset.currentVehicleId ||
        "";

      if (!currentVehicleId) {
        // Try to get vehicle ID from quick view modal
        const quickViewModal = document.getElementById("quick-view-modal");
        if (quickViewModal?.classList.contains("active")) {
          currentVehicleId = quickViewModal.dataset.currentVehicleId || "";
        }
        // If still no ID, try to get from the title in quick view
        if (!currentVehicleId) {
          const vehicleTitle =
            document.getElementById("quick-view-title")?.textContent || "";
          // Create a slug from the title for the URL
          currentVehicleId = vehicleTitle.toLowerCase().replace(/\s+/g, "-");
        }
      }

      currentShareType = "vehicle";
      if (shareModalTitle) {
        shareModalTitle.textContent = "Fahrzeug teilen";
      }
      shareModal.classList.add("active");
      a11y.open();

      // Animate modal with CSS
      const modalContent = document.querySelector(".share-modal-content");
      if (modalContent) {
        modalContent.style.opacity = "0";
        modalContent.style.transform = "scale(0.8)";
        modalContent.style.transition =
          "opacity 0.3s ease, transform 0.3s ease";
        setTimeout(() => {
          modalContent.style.opacity = "1";
          modalContent.style.transform = "scale(1)";
        }, 10);
      }
    });
  });

  shareModalClose.addEventListener("click", () => {
    shareModal.classList.remove("active");
    a11y.close();
  });

  shareModal.addEventListener("click", (e) => {
    if (e.target === shareModal) {
      shareModal.classList.remove("active");
      a11y.close();
    }
  });

  shareOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const platform = option.getAttribute("data-platform");

      // Build URL based on share type
      let url = "";
      let title = (window.dealerConfig && window.dealerConfig.name) || "CB Handels GmbH";

      if (currentShareType === "vehicle") {
        // For vehicles, create a shareable URL with vehicle ID
        // Use a format that works better: #fahrzeuge/vehicle/ID
        url = `${window.location.origin}#fahrzeuge/vehicle/${currentVehicleId}`;
        // Try to get vehicle title for better sharing
        const vehicleTitle =
          document.getElementById("quick-view-title")?.textContent ||
          document.querySelector(
            `[data-vehicle-id="${currentVehicleId}"] .card-title`
          )?.textContent ||
          "";
        if (vehicleTitle) {
          title = `${vehicleTitle} - ${title}`;
        }
      } else {
        // For blog posts
        url = `${window.location.origin}/posts/${currentPostSlug}.html`;
      }

      let shareUrl = "";

      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`;
          break;
        case "linkedin":
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url
          )}`;
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(title)}`;
          break;
        case "copy":
          // Copy to clipboard
          navigator.clipboard
            .writeText(url)
            .then(() => {
              showToast("Link in die Zwischenablage kopiert!", "success");
              // Close modal after a brief delay to allow toast to appear
              setTimeout(() => {
                shareModal.classList.remove("active");
                a11y.close();
              }, 100);
            })
            .catch((err) => {
              console.error("Failed to copy:", err);
              showToast("Link konnte nicht kopiert werden.", "error");
            });
          return;
      }

      if (shareUrl) {
        window.open(shareUrl, "_blank", "width=600,height=400");
        shareModal.classList.remove("active");
        a11y.close();
      }
    });
  });
}

// ========================================
// LIGHTBOX
// ========================================

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxPrev = document.querySelector(".lightbox-prev");
  const lightboxNext = document.querySelector(".lightbox-next");
  const lightboxZoom = document.querySelector(".lightbox-zoom");
  const lightboxCounter = {
    current: document.getElementById("lightbox-current"),
    total: document.getElementById("lightbox-total"),
  };
  const lightboxGallery = document.getElementById("lightbox-gallery");

  let currentImages = [];
  let currentIndex = 0;
  let isZoomed = false;

  // Collect all images that should have lightbox
  function collectImages() {
    const images = document.querySelectorAll(
      ".vehicle-card img, .blog-image img, .blog-post img, article img"
    );
    currentImages = [];

    images.forEach((img) => {
      // Skip vehicle card images that have quick view
      const hasQuickView = img
        .closest(".vehicle-card")
        ?.querySelector(".quick-view-btn");
      if (hasQuickView) return;

      // Skip if image doesn't have a valid src
      if (!img.src || img.src.startsWith("data:")) return;

      currentImages.push({
        src: img.src,
        alt: img.alt || "",
        element: img,
      });
    });

    return currentImages;
  }

  // Render gallery thumbnails
  function renderGallery() {
    if (!lightboxGallery || currentImages.length <= 1) {
      if (lightboxGallery) lightboxGallery.innerHTML = "";
      return;
    }

    lightboxGallery.innerHTML = "";
    currentImages.forEach((img, index) => {
      const thumb = document.createElement("img");
      thumb.src = img.src;
      thumb.alt = img.alt;
      thumb.className = index === currentIndex ? "active" : "";
      thumb.addEventListener("click", () => {
        currentIndex = index;
        showImage(currentIndex);
      });
      lightboxGallery.appendChild(thumb);
    });
  }

  // Show image at index
  function showImage(index) {
    if (index < 0 || index >= currentImages.length) return;

    currentIndex = index;
    const image = currentImages[currentIndex];

    // Reset zoom
    isZoomed = false;
    lightboxImg.style.transform = "scale(1)";

    // Update image
    lightboxImg.style.opacity = "0";
    setTimeout(() => {
      lightboxImg.src = image.src;
      lightboxImg.alt = image.alt;
      lightboxImg.style.opacity = "1";
    }, 150);

    // Update counter
    if (lightboxCounter.current) {
      lightboxCounter.current.textContent = currentIndex + 1;
    }
    if (lightboxCounter.total) {
      lightboxCounter.total.textContent = currentImages.length;
    }

    // Update gallery
    renderGallery();

    // Update navigation buttons
    if (lightboxPrev) {
      lightboxPrev.style.opacity = currentIndex === 0 ? "0.5" : "1";
      lightboxPrev.style.pointerEvents = currentIndex === 0 ? "none" : "auto";
    }
    if (lightboxNext) {
      lightboxNext.style.opacity =
        currentIndex === currentImages.length - 1 ? "0.5" : "1";
      lightboxNext.style.pointerEvents =
        currentIndex === currentImages.length - 1 ? "none" : "auto";
    }
  }

  // Open lightbox with image
  function openLightbox(imageElement) {
    // If images are already set from external source (e.g., quick view), use them
    if (window.lightboxState && window.lightboxState.currentImages().length > 0) {
      currentImages = window.lightboxState.currentImages();
      currentIndex = window.lightboxState.currentIndex() || 0;
    } else {
      collectImages();

      // Find index of clicked image
      currentIndex = currentImages.findIndex(
        (img) => img.element === imageElement
      );
      if (currentIndex === -1) currentIndex = 0;
    }

    // Update counter total
    if (lightboxCounter.total) {
      lightboxCounter.total.textContent = currentImages.length;
    }

    showImage(currentIndex);
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";

    renderGallery();
  }

  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
    isZoomed = false;
    lightboxImg.style.transform = "scale(1)";
  }

  // Navigate to previous image
  function prevImage() {
    if (currentIndex > 0) {
      showImage(currentIndex - 1);
    }
  }

  // Navigate to next image
  function nextImage() {
    if (currentIndex < currentImages.length - 1) {
      showImage(currentIndex + 1);
    }
  }

  // Toggle zoom
  function toggleZoom() {
    isZoomed = !isZoomed;
    if (isZoomed) {
      lightboxImg.style.transform = "scale(2)";
      lightboxImg.style.cursor = "move";
    } else {
      lightboxImg.style.transform = "scale(1)";
      lightboxImg.style.cursor = "default";
    }
  }

  // Initialize image click handlers
  function initImageHandlers() {
    const images = document.querySelectorAll(
      ".vehicle-card img, .blog-post img, article img"
    );

    images.forEach((img) => {
      const hasQuickView = img
        .closest(".vehicle-card")
        ?.querySelector(".quick-view-btn");
      if (hasQuickView) return;

      // Skip blog card images (they should open the blog post, not lightbox)
      if (
        img.classList.contains("blog-card-image") ||
        img.closest(".blog-card-clickable")
      ) {
        return;
      }

      if (!img.src || img.src.startsWith("data:")) return;

      img.style.cursor = "pointer";
      img.addEventListener("click", (e) => {
        e.preventDefault();
        openLightbox(img);
      });
    });
  }

  // Initialize handlers
  initImageHandlers();

  // Close button
  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  // Navigation buttons
  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      prevImage();
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", (e) => {
      e.stopPropagation();
      nextImage();
    });
  }

  // Zoom button
  if (lightboxZoom) {
    lightboxZoom.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleZoom();
    });
  }

  // Close on backdrop click
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target === lightboxImg) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    switch (e.key) {
      case "Escape":
        closeLightbox();
        break;
      case "ArrowLeft":
        prevImage();
        break;
      case "ArrowRight":
        nextImage();
        break;
      case "z":
      case "Z":
        toggleZoom();
        break;
    }
  });

  // Re-initialize when new images are loaded (for dynamic content)
  const observer = new MutationObserver(() => {
    initImageHandlers();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Expose functions to global scope for use from quick view modal
  if (typeof window !== "undefined") {
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
    window.prevImage = prevImage;
    window.nextImage = nextImage;
    window.showImage = showImage;
    // Store references for external access
    window.lightboxState = {
      currentImages: () => currentImages,
      currentIndex: () => currentIndex,
      setCurrentImages: (images) => { currentImages = images; },
      setCurrentIndex: (index) => { currentIndex = index; }
    };
  }
}

// ========================================
// QUICK VIEW MODAL
// ========================================

// Global state for quick view modal (shared across all init calls)
let quickViewState = {
  isInitialized: false,
  isOpening: false,
  isClosing: false,
  currentImageIndex: 0,
  vehicleImages: [],
  currentVehicleId: null,
  imageFetchTimeout: null,
};

function initQuickView() {
  // Only initialize once - use event delegation which works for dynamically created elements
  if (quickViewState.isInitialized) {
    return;
  }

  const quickViewModal = document.getElementById("quick-view-modal");
  const quickViewContent = document.querySelector(".quick-view-content");
  const quickViewClose = document.querySelector(".quick-view-close");
  const quickViewBackdrop = document.querySelector(".quick-view-backdrop");

  if (!quickViewModal || !quickViewContent) return;

  quickViewState.isInitialized = true;

  // A11y wiring - apply to content div which has role="dialog"
  const a11y = setupModalA11y(quickViewContent, {
    titleSelector: "#quick-view-title",
    initialFocusSelector: ".quick-view-close",
  });

  function openQuickView(vehicleCardOrId, skipActiveCheck = false) {
    // If modal is already open, close it first then open new one
    if (!skipActiveCheck && quickViewModal.classList.contains("active")) {
      // Store the vehicle to open after closing
      closeQuickView();
      // Wait for close animation before opening new one
      setTimeout(() => {
        openQuickView(vehicleCardOrId, true); // Pass skipActiveCheck to avoid recursion loop
      }, 350);
      return;
    }

    // Only prevent opening if modal is actually opening/closing AND modal is currently active
    // If modal is closed, allow opening even if flags are set (they'll be reset)
    if (
      quickViewState.isOpening ||
      (quickViewState.isClosing && quickViewModal.classList.contains("active"))
    ) {
      console.log("Quick View: Already opening or closing, ignoring request");
      return;
    }

    // If closing flag is set but modal is already closed, reset it immediately
    if (
      quickViewState.isClosing &&
      !quickViewModal.classList.contains("active")
    ) {
      quickViewState.isClosing = false;
    }

    quickViewState.isOpening = true;

    // Cancel any pending image fetch from previous modal
    if (quickViewState.imageFetchTimeout) {
      clearTimeout(quickViewState.imageFetchTimeout);
      quickViewState.imageFetchTimeout = null;
    }

    // Support both vehicleCard element or vehicleId string
    let vehicleCard = null;
    let vehicleId = null;
    let vehicleData = null;

    if (typeof vehicleCardOrId === "string") {
      // Called with vehicle ID directly
      vehicleId = vehicleCardOrId;
      vehicleCard = document.querySelector(`[data-vehicle-id="${vehicleId}"]`);
      vehicleData = window.allVehiclesList?.find((v) => v.id === vehicleId);
    } else {
      // Called with vehicle card element
      vehicleCard = vehicleCardOrId;
      vehicleId = vehicleCard?.dataset?.vehicleId || null;
      vehicleData = vehicleId
        ? window.allVehiclesList?.find((v) => v.id === vehicleId)
        : null;
    }

    // Extract vehicle data from card or cached data
    const title =
      vehicleCard?.querySelector(".card-title")?.textContent ||
      vehicleData?.title ||
      "";
    const price =
      vehicleCard?.querySelector(".card-price")?.textContent ||
      (vehicleData?.price
        ? `€ ${vehicleData.price.toLocaleString("de-DE")},-`
        : "");
    const specs = vehicleCard?.querySelector(".card-specs")?.textContent || "";
    const features = vehicleCard
      ? Array.from(vehicleCard.querySelectorAll(".feature-tag")).map(
          (tag) => tag.textContent
        )
      : [];
    const badge = vehicleCard?.querySelector(".card-badge")?.textContent || "";

    // Get main image
    const mainImage = vehicleCard?.querySelector(".card-image img");
    const mainImageSrc = mainImage?.src || vehicleData?.image || "";

    // Get and store vehicle ID for comparison sync (needed before fetching images)
    quickViewState.currentVehicleId = vehicleId;

    // Set initial placeholders
    const titleEl = document.getElementById("quick-view-title");
    const priceEl = document.getElementById("quick-view-price");
    const specsEl = document.getElementById("quick-view-specs");
    const descEl = document.getElementById("quick-view-description");
    const specsDetailEl = document.getElementById("quick-view-specifications");
    const envEl = document.getElementById("quick-view-environment");
    const massEl = document.getElementById("quick-view-masses");
    const equipEl = document.getElementById("quick-view-equipment");
    const dealerEl = document.getElementById("quick-view-dealer");
    if (titleEl) titleEl.textContent = title;
    if (priceEl) priceEl.textContent = price;
    if (specsEl) specsEl.textContent = specs;
    if (descEl) descEl.textContent = "";
    if (specsDetailEl) specsDetailEl.innerHTML = "";
    if (envEl) envEl.innerHTML = "";
    if (massEl) massEl.innerHTML = "";
    if (equipEl) equipEl.innerHTML = "";
    if (dealerEl) dealerEl.innerHTML = "";

    // Get all images from vehicle data (will be enhanced by details API)
    quickViewState.vehicleImages = [];
    if (quickViewState.currentVehicleId) {
      // Try to find vehicle in cached data
      const vehicleDataForImages =
        vehicleData ||
        window.allVehiclesList?.find(
          (v) => v.id === quickViewState.currentVehicleId
        ) ||
        (typeof allVehiclesData !== "undefined" && allVehiclesData.length > 0
          ? allVehiclesData.find(
              (v) => v.id === quickViewState.currentVehicleId
            )
          : null);

      if (
        vehicleDataForImages &&
        vehicleDataForImages.allImages &&
        Array.isArray(vehicleDataForImages.allImages) &&
        vehicleDataForImages.allImages.length > 0
      ) {
        // Use all images from vehicle data as initial set
        // Will be enhanced with more images from details API
        quickViewState.vehicleImages =
          vehicleDataForImages.allImages.filter(Boolean);
        console.log(
          `Quick View: Found ${quickViewState.vehicleImages.length} images for vehicle ${quickViewState.currentVehicleId}`,
          quickViewState.vehicleImages
        );

        // Images will be enhanced by vehicle-details API call below
        console.log(
          `Quick View: Initial ${quickViewState.vehicleImages.length} images. Will be enhanced by details API...`
        );
      } else if (vehicleDataForImages && vehicleDataForImages.image) {
        // Fallback: use single image from vehicle data
        // Will be enhanced by vehicle-details API call below
        quickViewState.vehicleImages = [vehicleDataForImages.image];
        console.log(
          `Quick View: Using single image. Will be enhanced by details API...`
        );
      } else {
        // Final fallback: use main image from card
        quickViewState.vehicleImages = [mainImageSrc].filter(Boolean);
      }
    } else {
      // No vehicle ID, just use main image
      quickViewState.vehicleImages = [mainImageSrc].filter(Boolean);
    }

    // Clear and populate badges with key specs
    const badgesContainer = document.getElementById("quick-view-badges");
    badgesContainer.innerHTML = "";
    
    // Use vehicleData or parse from specs text
    const currentData = vehicleData || (vehicleCard ? {
      year: vehicleCard.dataset.year ? parseInt(vehicleCard.dataset.year) : null,
      mileage: vehicleCard.dataset.mileage ? parseInt(vehicleCard.dataset.mileage) : null,
      fuelType: vehicleCard.dataset.fuelType || null,
      power: vehicleCard.dataset.power ? JSON.parse(vehicleCard.dataset.power) : null,
      transmission: vehicleCard.dataset.transmission || null
    } : null);
    
    // Add key specs as badges - use available data
    const specParts = [];
    if (currentData?.year) {
      specParts.push(String(currentData.year));
    } else if (vehicleData?.year) {
      specParts.push(String(vehicleData.year));
    }
    
    if (currentData?.mileage && currentData.mileage > 1000) {
      specParts.push(`${currentData.mileage.toLocaleString("de-DE")} km`);
    } else if (vehicleData?.mileage && vehicleData.mileage > 1000) {
      specParts.push(`${vehicleData.mileage.toLocaleString("de-DE")} km`);
    }
    
    if (currentData?.fuelType) {
      specParts.push(currentData.fuelType);
    } else if (vehicleData?.fuelType) {
      specParts.push(vehicleData.fuelType);
    }
    
    const powerData = currentData?.power || vehicleData?.power;
    if (powerData) {
      if (typeof powerData === 'object' && powerData.kw && powerData.ps) {
        specParts.push(`${powerData.kw} kW (${powerData.ps} PS)`);
      } else if (typeof powerData === 'object' && powerData.kw) {
        specParts.push(`${powerData.kw} kW`);
      } else if (typeof powerData === 'object' && powerData.ps) {
        specParts.push(`${powerData.ps} PS`);
      }
    }
    
    if (currentData?.transmission) {
      specParts.push(currentData.transmission);
    } else if (vehicleData?.transmission) {
      specParts.push(vehicleData.transmission);
    }
    
    // Create badge elements for each spec
    specParts.forEach((spec) => {
      const badgeEl = document.createElement("span");
      badgeEl.textContent = spec;
      badgesContainer.appendChild(badgeEl);
    });
    
    // Add special badge if available (e.g., "Top Angebot")
    if (badge) {
      const badgeEl = document.createElement("span");
      badgeEl.className = "card-badge badge-top-offer";
      badgeEl.textContent = badge;
      badgesContainer.appendChild(badgeEl);
    }

    // Features are now shown in the full equipment list section, no need for quick-view-features

    // Store vehicle ID in modal for comparison handler access
    if (quickViewModal) {
      quickViewModal.dataset.currentVehicleId =
        quickViewState.currentVehicleId || "";
    }

    // Sync modal checkbox with card checkbox and comparison state
    const cardCheckbox = vehicleCard?.querySelector(".compare-checkbox");
    const modalCheckbox = document.querySelector(".compare-checkbox-modal");
    if (modalCheckbox) {
      // First try to sync with card checkbox
      if (cardCheckbox) {
        modalCheckbox.checked = cardCheckbox.checked;
      } else {
        // If no card checkbox, check comparison state from localStorage
        const comparedVehicles = JSON.parse(
          localStorage.getItem("comparedVehicles") || "[]"
        );
        modalCheckbox.checked = comparedVehicles.includes(
          quickViewState.currentVehicleId
        );
      }
      // Update button class and aria-pressed for visual state and accessibility
      const modalCheckboxBtn = modalCheckbox.closest(
        ".compare-checkbox-btn-modal"
      );
      if (modalCheckboxBtn) {
        if (modalCheckbox.checked) {
          modalCheckboxBtn.classList.add("has-checked");
          modalCheckboxBtn.setAttribute("aria-pressed", "true");
        } else {
          modalCheckboxBtn.classList.remove("has-checked");
          modalCheckboxBtn.setAttribute("aria-pressed", "false");
        }
      }
      // Force visual update by triggering input event (for CSS :checked selectors)
      modalCheckbox.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Set main image
    quickViewState.currentImageIndex = 0;
    updateMainImage();
    updateThumbnails();

    // Show modal
    try {
      // Set aria-hidden to false BEFORE adding active class to prevent accessibility issues
      quickViewModal.setAttribute("aria-hidden", "false");
      quickViewModal.classList.add("active");
      document.body.style.overflow = "hidden";
      a11y.open();

      // Reset opening flag after a short delay to allow modal to fully open
      // Also ensure any buttons inside don't get focus until modal is ready
      setTimeout(() => {
        quickViewState.isOpening = false;
        // Ensure image zoom button is accessible (remove any aria-hidden if present)
        const zoomBtn = document.getElementById("image-zoom-btn");
        if (zoomBtn) {
          zoomBtn.removeAttribute("aria-hidden");
          zoomBtn.setAttribute("aria-label", "Bild im Vollbildmodus anzeigen");
        }
      }, 100);
    } catch (error) {
      // Reset flag if opening fails
      quickViewState.isOpening = false;
      console.error("Error opening quick view modal:", error);
    }

    // Show loading skeleton for content
    const contentSkeleton = document.getElementById("content-loading-skeleton");
    const contentError = document.getElementById("content-error-state");
    const contentSections = document.querySelectorAll("#quick-view-description, #quick-view-specifications, #quick-view-environment, #quick-view-masses, #quick-view-equipment, #quick-view-dealer");
    
    // Hide error, show skeleton, hide sections
    if (contentError) contentError.style.display = "none";
    if (contentSkeleton) contentSkeleton.style.display = "block";
    contentSections.forEach(section => {
      if (section) section.style.display = "none";
    });

    // Fetch full details and populate sections
    if (quickViewState.currentVehicleId) {
      fetch(
        `/api/vehicle-details?vid=${encodeURIComponent(
          quickViewState.currentVehicleId
        )}`
      )
        .then((r) => {
          if (!r.ok) {
            console.warn(`Vehicle details API error: ${r.status}`);
            throw new Error(`API error: ${r.status}`);
          }
          return r.json();
        })
        .then((data) => {
          // Hide loading skeleton, show sections
          if (contentSkeleton) contentSkeleton.style.display = "none";
          contentSections.forEach(section => {
            if (section) section.style.display = "";
          });
          if (!data || data.error) {
            console.warn(
              "Vehicle details not available:",
              data?.error || "Unknown error"
            );
            return;
          }
          console.log("Fetched vehicle details:", data);

          // Title & Price - only update if we have valid data, otherwise keep existing values
          const genericTitles = [
            "Spezifikationen",
            "Fahrzeugdetails",
            "Details",
          ];
          if (data.title && titleEl && !genericTitles.includes(data.title)) {
            titleEl.textContent = data.title;
          }
          if (typeof data.price === "number" && data.price > 0 && priceEl) {
            priceEl.textContent = `€ ${data.price.toLocaleString("de-DE")},-`;
          }

          // Specs rewrite - use vehicle-details data if valid, otherwise keep existing specs
          const specParts = [];

          // Only update if we have valid data (not obviously wrong values)
          if (
            data.registrationYear &&
            data.registrationYear > 1900 &&
            data.registrationYear <= new Date().getFullYear() + 1
          ) {
            specParts.push(`${data.registrationYear}`);
          }

          // Only use mileage if it's reasonable (not just "100" or other small numbers)
          if (typeof data.mileage === "number" && data.mileage > 1000) {
            specParts.push(`${data.mileage.toLocaleString("de-DE")} km`);
          }

          // Only use fuel if it's a valid fuel type (not "art" or other fragments)
          const validFuels = [
            "Diesel",
            "Benzin",
            "Elektro",
            "Hybrid",
            "CNG",
            "LPG",
            "Wasserstoff",
          ];
          if (
            data.engineFuel &&
            validFuels.some((f) => data.engineFuel.includes(f))
          ) {
            specParts.push(data.engineFuel);
          }

          if (
            typeof data.engineEffectKw === "number" &&
            typeof data.engineEffectPs === "number" &&
            data.engineEffectKw > 0 &&
            data.engineEffectPs > 0
          )
            specParts.push(
              `${data.engineEffectKw} kW (${data.engineEffectPs} PS)`
            );

          // Only use transmission if it's a valid value
          const validTransmissions = [
            "Automatik",
            "Schaltgetriebe",
            "Automatikgetriebe",
            "CVT",
            "DSG",
          ];
          if (
            data.transmission &&
            validTransmissions.some((t) => data.transmission.includes(t))
          ) {
            specParts.push(data.transmission);
          }

          // Only update specs if we have valid data, otherwise keep existing specs from card
          if (specsEl && specParts.length > 0) {
            specsEl.textContent = specParts.join(" • ");
          }
          
          // Update badges with fresh API data
          const badgesContainer = document.getElementById("quick-view-badges");
          if (badgesContainer) {
            badgesContainer.innerHTML = "";
            
            // Add key specs as badges from API data
            const badgeSpecs = [];
            if (data.registrationYear && data.registrationYear > 1900 && data.registrationYear <= new Date().getFullYear() + 1) {
              badgeSpecs.push(String(data.registrationYear));
            }
            if (typeof data.mileage === "number" && data.mileage > 1000) {
              badgeSpecs.push(`${data.mileage.toLocaleString("de-DE")} km`);
            }
            if (data.engineFuel) {
              badgeSpecs.push(data.engineFuel);
            }
            if (data.engineEffectKw && data.engineEffectPs) {
              badgeSpecs.push(`${data.engineEffectKw} kW (${data.engineEffectPs} PS)`);
            } else if (data.engineEffectKw) {
              badgeSpecs.push(`${data.engineEffectKw} kW`);
            } else if (data.engineEffectPs) {
              badgeSpecs.push(`${data.engineEffectPs} PS`);
            }
            if (data.transmission) {
              badgeSpecs.push(data.transmission);
            }
            
            // Create badge elements
            badgeSpecs.forEach((spec) => {
              const badgeEl = document.createElement("span");
              badgeEl.textContent = spec;
              badgesContainer.appendChild(badgeEl);
            });
            
            // Add special badge if available
            if (badge) {
              const badgeEl = document.createElement("span");
              badgeEl.className = "card-badge badge-top-offer";
              badgeEl.textContent = badge;
              badgesContainer.appendChild(badgeEl);
            }
          }

          // Description - simplified formatting to prevent layout issues
          if (descEl && data.description) {
            let formattedDescription = data.description.trim();
            
            // Step 1: Normalize whitespace - replace multiple spaces/newlines with single space
            formattedDescription = formattedDescription.replace(/\s+/g, ' ');
            
            // Step 2: Break into paragraphs intelligently (simple approach)
            // Split on double line breaks or periods followed by space and capital letter
            formattedDescription = formattedDescription
              .replace(/\n\n+/g, '</p><p>') // Split on double line breaks
              .replace(/(\.\s+)([A-ZÄÖÜ])/g, '.</p><p>$2'); // Split on period + space + capital letter
            
            // Step 3: Wrap in paragraph tags if not already wrapped
            if (!formattedDescription.startsWith('<p>')) {
              formattedDescription = '<p>' + formattedDescription;
            }
            if (!formattedDescription.endsWith('</p>')) {
              formattedDescription = formattedDescription + '</p>';
            }
            
            // Step 4: Clean up empty paragraphs
            formattedDescription = formattedDescription
              .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
              .replace(/(<p>)\s*(<p>)/g, '$2') // Remove nested paragraphs
              .replace(/(<\/p>)\s*(<\/p>)/g, '$2'); // Remove duplicate closing tags
            
            // Step 5: Highlight price offers (simple - no complex structures)
            formattedDescription = formattedDescription
              .replace(/(\d{1,3}(?:\.\d{3})*\s*€\s*(?:Nachlass|Rabatt|günstiger))/gi, 
                '<strong class="price-offer">$1</strong>')
              .replace(/(Statt\s+\d{1,3}(?:\.\d{3})*\s*€\s+jetzt\s+nur\s+\d{1,3}(?:\.\d{3})*\s*€)/gi,
                '<strong class="price-offer">$1</strong>');
            
            // Step 6: Final cleanup - normalize spaces
            formattedDescription = formattedDescription
              .replace(/\s+/g, ' ') // Normalize spaces
              .trim();
            
            // Step 7: Sanitize HTML to prevent XSS attacks (preserves safe HTML like <p>, <strong>)
            // DOMPurify removes malicious scripts while keeping safe formatting tags
            const sanitizedDescription = typeof DOMPurify !== 'undefined' 
              ? DOMPurify.sanitize(formattedDescription, {
                  ALLOWED_TAGS: ['p', 'strong', 'em', 'br', 'ul', 'ol', 'li'],
                  ALLOWED_ATTR: ['class']
                })
              : escapeHtml(formattedDescription); // Fallback if DOMPurify not loaded
            
            // Wrap in container with class for styling
            descEl.innerHTML = `<div class="description-content">${sanitizedDescription}</div>`;
          }

          // Comprehensive Specifications Section - Show ALL available data from motornetzwerk.at
          const specRows = [];

          // Helper to safely display any value (show all data, even if it looks odd)
          const displayValue = (value) => {
            if (value === null || value === undefined) return null;
            if (typeof value === "string") {
              const cleaned = value.trim();
              // Only filter out completely empty or whitespace-only values
              if (!cleaned || cleaned.length === 0) return null;
              return cleaned;
            }
            return String(value);
          };

          // Vehicle Basic Info - show all available data
          const make = displayValue(data.make);
          if (make) {
            specRows.push(
              `<div class="spec-row"><span>Marke</span><span>${escapeHtml(
                make
              )}</span></div>`
            );
          }
          const model = displayValue(data.model);
          if (model) {
            specRows.push(
              `<div class="spec-row"><span>Modell</span><span>${escapeHtml(
                model
              )}</span></div>`
            );
          }
          const carType = displayValue(data.carType);
          if (carType) {
            specRows.push(
              `<div class="spec-row"><span>Fahrzeugtyp</span><span>${escapeHtml(
                carType
              )}</span></div>`
            );
          }
          const motorCondition = displayValue(data.motorCondition);
          if (motorCondition) {
            specRows.push(
              `<div class="spec-row"><span>Zustand</span><span>${escapeHtml(
                motorCondition
              )}</span></div>`
            );
          }

          // Registration
          if (data.registrationYear) {
            let regText = `${data.registrationYear}`;
            if (data.registrationMonth) {
              regText = `${String(data.registrationMonth).padStart(2, "0")}/${
                data.registrationYear
              }`;
            }
            specRows.push(
              `<div class="spec-row"><span>Erstzulassung</span><span>${regText}</span></div>`
            );
          }

          // Engine Details - show all available data
          const engineFuel = displayValue(data.engineFuel);
          if (engineFuel) {
            specRows.push(
              `<div class="spec-row"><span>Kraftstoffart</span><span>${escapeHtml(
                engineFuel
              )}</span></div>`
            );
          }
          if (typeof data.engineVolume === "number" && data.engineVolume > 0) {
            specRows.push(
              `<div class="spec-row"><span>Hubraum</span><span>${data.engineVolume.toLocaleString(
                "de-DE"
              )} ccm</span></div>`
            );
          }
          if (
            typeof data.engineEffectKw === "number" &&
            data.engineEffectKw > 0
          ) {
            specRows.push(
              `<div class="spec-row"><span>Leistung</span><span>${data.engineEffectKw} kW</span></div>`
            );
          }
          if (
            typeof data.engineEffectPs === "number" &&
            data.engineEffectPs > 0
          ) {
            specRows.push(
              `<div class="spec-row"><span>Leistung (PS)</span><span>${data.engineEffectPs} PS</span></div>`
            );
          }
          if (
            typeof data.engineCylinder === "number" &&
            data.engineCylinder > 0
          ) {
            specRows.push(
              `<div class="spec-row"><span>Zylinder</span><span>${data.engineCylinder}</span></div>`
            );
          }

          // Transmission & Drive - show all available data
          const transmission = displayValue(data.transmission);
          if (transmission) {
            specRows.push(
              `<div class="spec-row"><span>Getriebe</span><span>${escapeHtml(
                transmission
              )}</span></div>`
            );
          }
          const wheelDrive = displayValue(data.wheelDrive);
          if (wheelDrive) {
            specRows.push(
              `<div class="spec-row"><span>Antrieb</span><span>${escapeHtml(
                wheelDrive
              )}</span></div>`
            );
          }

          // Mileage
          if (typeof data.mileage === "number" && data.mileage > 1000) {
            specRows.push(
              `<div class="spec-row"><span>Kilometerstand</span><span>${data.mileage.toLocaleString(
                "de-DE"
              )} km</span></div>`
            );
          }

          // Dimensions & Capacity
          if (
            typeof data.numberOfSeats === "number" &&
            data.numberOfSeats > 0
          ) {
            specRows.push(
              `<div class="spec-row"><span>Sitzplätze</span><span>${data.numberOfSeats}</span></div>`
            );
          }
          if (
            typeof data.numberOfDoors === "number" &&
            data.numberOfDoors > 0
          ) {
            specRows.push(
              `<div class="spec-row"><span>Türen</span><span>${data.numberOfDoors}</span></div>`
            );
          }
          const mainExteriorColour = displayValue(data.mainExteriorColour);
          if (mainExteriorColour) {
            specRows.push(
              `<div class="spec-row"><span>Farbe</span><span>${escapeHtml(
                mainExteriorColour
              )}</span></div>`
            );
          }

          // Model Specification
          const modelSpec = displayValue(data.modelSpecification);
          if (modelSpec) {
            specRows.push(
              `<div class="spec-row"><span>Modellvariante</span><span>${escapeHtml(
                modelSpec
              )}</span></div>`
            );
          }

          // Dimensions - add if available
          if (typeof data.lengthCm === "number" && data.lengthCm > 0) {
            specRows.push(
              `<div class="spec-row"><span>Länge</span><span>${(data.lengthCm / 100).toFixed(2)} m</span></div>`
            );
          }
          if (typeof data.widthCm === "number" && data.widthCm > 0) {
            specRows.push(
              `<div class="spec-row"><span>Breite</span><span>${(data.widthCm / 100).toFixed(2)} m</span></div>`
            );
          }

          // Empty Weight (Leergewicht) - important spec
          if (typeof data.emptyWeight === "number" && data.emptyWeight > 0) {
            specRows.push(
              `<div class="spec-row"><span>Leergewicht</span><span>${data.emptyWeight.toLocaleString(
                "de-DE"
              )} kg</span></div>`
            );
          }

          // Electric Vehicle Specs
          if (typeof data.batteryCapacity === "number" && data.batteryCapacity > 0) {
            specRows.push(
              `<div class="spec-row"><span>Batteriekapazität</span><span>${data.batteryCapacity} kWh</span></div>`
            );
          }
          if (typeof data.wltpRange === "number" && data.wltpRange > 0) {
            specRows.push(
              `<div class="spec-row"><span>WLTP-Reichweite</span><span>${data.wltpRange.toLocaleString(
                "de-DE"
              )} km</span></div>`
            );
          }

          // Warranty - show all available data
          const warrantyDuration = displayValue(data.warrantyDuration);
          if (warrantyDuration) {
            specRows.push(
              `<div class="spec-row"><span>Garantie</span><span>${escapeHtml(
                warrantyDuration
              )}</span></div>`
            );
          }

          // Display specifications if we have any
          if (specsDetailEl && specRows.length > 0) {
            specsDetailEl.innerHTML = `<h3 class="section-title">Technische Daten</h3>${specRows.join(
              ""
            )}`;
          }

          // Environment
          const envRows = [];
          if (typeof data.consumption === "number")
            envRows.push(
              `<div class="spec-row"><span>Verbrauch</span><span>${data.consumption} l/100km</span></div>`
            );
          if (typeof data.co2Footprint === "number")
            envRows.push(
              `<div class="spec-row"><span>CO₂</span><span>${data.co2Footprint} g/km</span></div>`
            );
          if (data.emissionStandard)
            envRows.push(
              `<div class="spec-row"><span>Abgasnorm</span><span>${escapeHtml(
                data.emissionStandard
              )}</span></div>`
            );
          if (envEl && envRows.length) {
            envEl.innerHTML = `<h3 class="section-title">Umwelt</h3>${envRows.join(
              ""
            )}`;
          }

          // Masses
          const massRows = [];
          if (typeof data.totalWeight === "number")
            massRows.push(
              `<div class="spec-row"><span>Gesamtgewicht</span><span>${data.totalWeight.toLocaleString(
                "de-DE"
              )} kg</span></div>`
            );
          if (typeof data.trailerLoad === "number")
            massRows.push(
              `<div class="spec-row"><span>max. Anhängelast</span><span>${data.trailerLoad.toLocaleString(
                "de-DE"
              )} kg</span></div>`
            );
          if (massEl && massRows.length) {
            massEl.innerHTML = `<h3 class="section-title">Masse</h3>${massRows.join(
              ""
            )}`;
          }

          // Equipment
          if (
            equipEl &&
            Array.isArray(data.equipment) &&
            data.equipment.length
          ) {
            equipEl.innerHTML =
              `<h3 class="section-title">Ausstattungen</h3>` +
              `<ul class="equipment-ul">${data.equipment
                .slice(0, 80)
                .map((e) => `<li>${escapeHtml(e)}</li>`)
                .join("")}</ul>`;
          }

          // Dealer
          if (dealerEl && data.dealer) {
            const rows = [];
            if (data.dealer.name)
              rows.push(
                `<div class="dealer-row"><strong>${escapeHtml(
                  data.dealer.name
                )}</strong></div>`
              );
            if (data.dealer.address)
              rows.push(
                `<div class="dealer-row">${escapeHtml(
                  data.dealer.address
                )}</div>`
              );
            if (data.dealer.phone)
              rows.push(
                `<div class="dealer-row"><a href="tel:${data.dealer.phone.replace(
                  /\s+/g,
                  ""
                )}">${escapeHtml(data.dealer.phone)}</a></div>`
              );
            if (data.dealer.email)
              rows.push(
                `<div class="dealer-row"><a href="mailto:${escapeHtml(
                  data.dealer.email
                )}">${escapeHtml(data.dealer.email)}</a></div>`
              );
            if (rows.length)
              dealerEl.innerHTML = `<h3 class="section-title">Anschrift & Kontakt</h3>${rows.join(
                ""
              )}`;
          }

          // Images from details, if available
          // Filter out placeholder/error images and normalize URLs
          if (Array.isArray(data.images) && data.images.length) {
            // Filter out invalid/placeholder images and small icons/logos
            const validImages = data.images
              .filter((imgUrl) => {
                if (!imgUrl || typeof imgUrl !== "string") return false;
                const urlLower = imgUrl.toLowerCase();

                // Filter out obvious placeholder/error images
                if (
                  urlLower.includes("kein") &&
                  urlLower.includes("bild") &&
                  urlLower.includes("vorhanden")
                )
                  return false;
                if (
                  urlLower.includes("placeholder") ||
                  urlLower.includes("no-image") ||
                  urlLower.includes("noimage")
                )
                  return false;

                // Filter out common non-vehicle images (logos, icons, etc.)
                if (
                  urlLower.includes("logo") ||
                  urlLower.includes("icon") ||
                  urlLower.includes("favicon") ||
                  urlLower.includes("social")
                )
                  return false;

                // Must be an image file or look like a vehicle image URL
                const hasImageExtension =
                  urlLower.endsWith(".jpg") ||
                  urlLower.endsWith(".jpeg") ||
                  urlLower.endsWith(".png") ||
                  urlLower.endsWith(".webp") ||
                  urlLower.includes(".jpg") ||
                  urlLower.includes(".jpeg");

                // Or contains image-related paths (like /images/, /photos/, vehicle ID, etc.)
                const hasImagePath =
                  urlLower.includes("/image") ||
                  urlLower.includes("/photo") ||
                  urlLower.includes("cache.willhaben") ||
                  urlLower.includes("motornetzwerk");

                return hasImageExtension || hasImagePath;
              })
              .map((imgUrl) => {
                // Normalize relative URLs to absolute
                if (
                  imgUrl.startsWith("http://") ||
                  imgUrl.startsWith("https://")
                ) {
                  return imgUrl;
                }
                if (imgUrl.startsWith("//")) {
                  return `https:${imgUrl}`;
                }
                if (imgUrl.startsWith("/")) {
                  const baseUrl = (window.dealerConfig && window.dealerConfig.dataSource && window.dealerConfig.dataSource.baseUrl) || '';
                  return `${baseUrl}${imgUrl}`;
                }
                // If relative path, assume it's from the base URL
                const baseUrl = (window.dealerConfig && window.dealerConfig.dataSource && window.dealerConfig.dataSource.baseUrl) || '';
                return `${baseUrl}/${imgUrl}`;
              })
              .filter(Boolean);

            // Merge with existing images, avoiding duplicates
            const merged = [
              ...new Set([
                ...(quickViewState.vehicleImages || []),
                ...validImages,
              ]),
            ];

            if (merged.length > 0) {
              console.log(
                `Quick View: Got ${validImages.length} images from details API, total: ${merged.length} images`
              );
              quickViewState.vehicleImages = merged;
              quickViewState.currentImageIndex = 0;
              updateMainImage();
              updateThumbnails();
            } else {
              console.log(
                "Quick View: No valid images found in details API response"
              );
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching vehicle details:", err);
          // Show error state
          if (contentSkeleton) contentSkeleton.style.display = "none";
          if (contentError) contentError.style.display = "flex";
          contentSections.forEach(section => {
            if (section) section.style.display = "none";
          });
          // Announce error to screen readers
          announceToScreenReader("vehicles", "Fehler beim Laden der Fahrzeugdetails. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch.");
        });
    } else {
      // No vehicle ID, hide skeleton
      if (contentSkeleton) contentSkeleton.style.display = "none";
    }
  }

  // Retry handlers
  document.getElementById("retry-image-btn")?.addEventListener("click", () => {
    updateMainImage();
  });

  document.getElementById("retry-content-btn")?.addEventListener("click", () => {
    if (!quickViewState.currentVehicleId) return;
    
    const contentSkeleton = document.getElementById("content-loading-skeleton");
    const contentError = document.getElementById("content-error-state");
    const contentSections = document.querySelectorAll("#quick-view-description, #quick-view-specifications, #quick-view-environment, #quick-view-masses, #quick-view-equipment, #quick-view-dealer");
    
    // Show loading, hide error
    if (contentError) contentError.style.display = "none";
    if (contentSkeleton) contentSkeleton.style.display = "block";
    contentSections.forEach(section => {
      if (section) section.style.display = "none";
    });

    // Retry fetch
    fetch(
      `/api/vehicle-details?vid=${encodeURIComponent(
        quickViewState.currentVehicleId
      )}`
    )
      .then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!data || data.error) {
          throw new Error(data?.error || "Unknown error");
        }
        // Re-open the modal to re-process data
        // This will trigger a fresh fetch and display
        const vehicleId = quickViewState.currentVehicleId;
        if (vehicleId) {
          closeQuickView();
          setTimeout(() => {
            openQuickView(vehicleId, true);
          }, 300);
        }
      })
      .catch((err) => {
        console.error("Error retrying vehicle details:", err);
        if (contentSkeleton) contentSkeleton.style.display = "none";
        if (contentError) contentError.style.display = "flex";
        const phone = (window.dealerConfig && window.dealerConfig.phone) || '+43 664 3882323';
        announceToScreenReader("vehicles", `Fehler beim erneuten Laden der Fahrzeugdetails. Bitte kontaktieren Sie uns telefonisch unter ${phone}.`);
      });
  });

  /**
   * Fetch additional images from vehicle detail page
   * Tries multiple strategies to get more images
   */
  async function fetchAdditionalImages(vehicleUrl, existingImages = []) {
    try {
      // Early return if we already have enough images (6+)
      if (existingImages.length >= 6) return [];
      
      // Extract vehicle ID from URL if available
      const urlMatch = vehicleUrl.match(/vid=([^&]+)/);
      if (!urlMatch || existingImages.length === 0) return [];

      const vehicleId = urlMatch[1];
      const baseUrl = existingImages[0];
      
      // Skip if baseUrl is placeholder or invalid
      if (!baseUrl || baseUrl.includes('placeholder') || baseUrl.includes('kein-bild')) {
        return [];
      }
      
      const additionalImages = [];

      // Strategy 1: Try common URL patterns based on existing image URL
      // Pattern variations: img_1, img_2, img-1, img-2, or numeric suffixes
      const urlPatterns = [];

      // Extract base path and try different patterns
      const urlObj = new URL(baseUrl);
      const pathParts = urlObj.pathname.split("/");
      const filename = pathParts[pathParts.length - 1];
      const basePath = pathParts.slice(0, -1).join("/");

      // Pattern 1: Replace number in filename (e.g., 123.jpg -> 124.jpg, 125.jpg)
      const numMatch = filename.match(/(\d+)(\.\w+)$/);
      if (numMatch) {
        const baseNum = parseInt(numMatch[1]);
        const ext = numMatch[2];
        for (let i = 1; i <= 6; i++) {
          urlPatterns.push(`${urlObj.origin}${basePath}/${baseNum + i}${ext}`);
        }
      }

      // Pattern 2: Add suffix before extension (e.g., img.jpg -> img_2.jpg, img_3.jpg)
      const nameMatch = filename.match(/^(.+?)(\.\w+)$/);
      if (nameMatch) {
        const baseName = nameMatch[1];
        const ext = nameMatch[2];
        for (let i = 2; i <= 6; i++) {
          urlPatterns.push(
            `${urlObj.origin}${basePath}/${baseName}_${i}${ext}`
          );
          urlPatterns.push(
            `${urlObj.origin}${basePath}/${baseName}-${i}${ext}`
          );
        }
      }

      // Remove duplicates and existing images
      const uniquePatterns = [...new Set(urlPatterns)].filter(
        (url) => !existingImages.includes(url)
      );

      // Test which URLs actually exist (preload and check if they load)
      // Limit to 5 attempts to reduce failed requests
      const imagePromises = uniquePatterns.slice(0, 5).map((url) => {
        return new Promise((resolve) => {
          const img = new Image();
          let resolved = false;
          img.onload = () => {
            if (!resolved) {
              resolved = true;
              resolve(url);
            }
          };
          img.onerror = () => {
            if (!resolved) {
              resolved = true;
              resolve(null);
            }
          };
          img.src = url;
          // Timeout after 1 second (reduced from 1.5s)
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve(null);
            }
          }, 1000);
        });
      });

      const validImages = await Promise.all(imagePromises);
      const foundImages = validImages.filter(
        (url) => url && !existingImages.includes(url)
      );

      // Limit to 6 total images minimum (we already have some, so get enough to reach 6)
      const needed = Math.max(0, 6 - existingImages.length);
      return foundImages.slice(0, needed);
    } catch (error) {
      console.error("Error fetching additional images:", error);
      return [];
    }
  }

  function updateMainImage() {
    if (quickViewState.vehicleImages.length > 0) {
      const mainImg = document.getElementById("quick-view-main-img");
      const loadingSkeleton = document.getElementById("image-loading-skeleton");
      const errorState = document.getElementById("image-error-state");
      const title = document.getElementById("quick-view-title")?.textContent || "Fahrzeug";
      const currentIndex = quickViewState.currentImageIndex + 1;
      const totalImages = quickViewState.vehicleImages.length;
      
      // Hide error state, show loading skeleton
      if (errorState) errorState.style.display = "none";
      if (loadingSkeleton) loadingSkeleton.style.display = "block";
      mainImg.style.display = "none";
      mainImg.classList.add("loading");
      
      // Preload next and previous images
      preloadAdjacentImages();
      
      // Create new image to preload
      const newImg = new Image();
      newImg.onload = () => {
        mainImg.src = quickViewState.vehicleImages[quickViewState.currentImageIndex];
        mainImg.alt = `${title} - Bild ${currentIndex} von ${totalImages}`;
        mainImg.classList.remove("loading");
        if (loadingSkeleton) loadingSkeleton.style.display = "none";
        mainImg.style.display = "block";
      };
      newImg.onerror = () => {
        if (loadingSkeleton) loadingSkeleton.style.display = "none";
        if (errorState) errorState.style.display = "flex";
        mainImg.style.display = "none";
        mainImg.classList.remove("loading");
      };
      newImg.src = quickViewState.vehicleImages[quickViewState.currentImageIndex];
      
      // Update image counter
      const counterText = document.getElementById("image-counter-text");
      const counterVisible = document.getElementById("image-counter-visible");
      if (counterText) {
        counterText.textContent = `Bild ${currentIndex} von ${totalImages}`;
      }
      if (counterVisible) {
        counterVisible.textContent = `${currentIndex} / ${totalImages}`;
      }
    }
  }

  // Preload adjacent images for smoother navigation
  function preloadAdjacentImages() {
    if (quickViewState.vehicleImages.length <= 1) return;
    
    const preloadImages = [];
    const currentIndex = quickViewState.currentImageIndex;
    const totalImages = quickViewState.vehicleImages.length;
    
    // Preload next image
    const nextIndex = (currentIndex + 1) % totalImages;
    preloadImages.push(quickViewState.vehicleImages[nextIndex]);
    
    // Preload previous image
    const prevIndex = (currentIndex - 1 + totalImages) % totalImages;
    preloadImages.push(quickViewState.vehicleImages[prevIndex]);
    
    // Preload images
    preloadImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  function updateThumbnails() {
    const thumbnailsContainer = document.querySelector(
      ".quick-view-thumbnails"
    );
    if (!thumbnailsContainer) return;
    
    thumbnailsContainer.innerHTML = "";

    quickViewState.vehicleImages.forEach((imgSrc, index) => {
      const thumbnail = document.createElement("button");
      thumbnail.className = `quick-view-thumbnail ${
        index === quickViewState.currentImageIndex ? "active" : ""
      }`;
      thumbnail.type = "button";
      thumbnail.setAttribute("aria-label", `Bild ${index + 1} von ${quickViewState.vehicleImages.length} anzeigen`);
      thumbnail.setAttribute("aria-pressed", index === quickViewState.currentImageIndex ? "true" : "false");
      // Use data-src for lazy loading, load first 3 immediately
      const shouldLazyLoad = index > 2;
      if (shouldLazyLoad) {
        thumbnail.innerHTML = `<img data-src="${imgSrc}" alt="Vorschaubild ${index + 1}" loading="lazy" class="thumbnail-lazy" />`;
      } else {
        thumbnail.innerHTML = `<img src="${imgSrc}" alt="Vorschaubild ${index + 1}" loading="eager" />`;
      }
      thumbnail.addEventListener("click", () => {
        quickViewState.currentImageIndex = index;
        updateMainImage();
        updateThumbnails();
      });
      thumbnailsContainer.appendChild(thumbnail);
    });
    
    // Setup lazy loading for thumbnails
    setupThumbnailLazyLoading();
  }

  // Lazy load thumbnails using Intersection Observer
  function setupThumbnailLazyLoading() {
    const thumbnailsContainer = document.querySelector(".quick-view-thumbnails");
    if (!thumbnailsContainer) return;
    
    const lazyImages = thumbnailsContainer.querySelectorAll("img[data-src]");
    if (lazyImages.length === 0) return;
    
    // Use viewport as root since thumbnails container might not be scrollable
    // Check if container is scrollable, if so use it as root
    const isScrollable = thumbnailsContainer.scrollWidth > thumbnailsContainer.clientWidth;
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove("thumbnail-lazy");
            img.removeAttribute("data-src");
            observer.unobserve(img);
          }
        }
      });
    }, {
      root: isScrollable ? thumbnailsContainer : null, // Use container if scrollable, otherwise viewport
      rootMargin: "200px" // Start loading 200px before thumbnail enters viewport
    });
    
    lazyImages.forEach((img) => {
      imageObserver.observe(img);
    });
    
    // Also load images that are already visible (in case observer hasn't fired yet)
    lazyImages.forEach((img) => {
      const rect = img.getBoundingClientRect();
      const containerRect = thumbnailsContainer.getBoundingClientRect();
      const isVisible = isScrollable 
        ? (rect.left >= containerRect.left - 200 && rect.right <= containerRect.right + 200)
        : (rect.top >= 0 && rect.bottom <= window.innerHeight + 200);
      
      if (isVisible && img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.remove("thumbnail-lazy");
        img.removeAttribute("data-src");
        imageObserver.unobserve(img);
      }
    });
  }

  function closeQuickView() {
    if (quickViewState.isClosing && quickViewModal.classList.contains("active"))
      return; // Already closing and modal is still active

    quickViewState.isClosing = true;
    quickViewState.isOpening = false; // Cancel any opening in progress

    // Cancel any pending image fetch if modal is closed early (performance optimization)
    // This prevents unnecessary network requests when users quickly browse through cars
    if (quickViewState.imageFetchTimeout) {
      clearTimeout(quickViewState.imageFetchTimeout);
      quickViewState.imageFetchTimeout = null;
      console.log(
        "Quick View: Cancelled pending image fetch (modal closed early)"
      );
    }

    // Remove focus from any focused elements inside modal before closing
    const activeElement = document.activeElement;
    if (activeElement && quickViewModal.contains(activeElement)) {
      activeElement.blur();
    }
    
    quickViewModal.classList.remove("active");
    // Set aria-hidden after removing focus to prevent accessibility warnings
    setTimeout(() => {
      quickViewModal.setAttribute("aria-hidden", "true");
    }, 100);
    document.body.style.overflow = "";
    quickViewState.currentImageIndex = 0;
    quickViewState.vehicleImages = [];
    quickViewState.currentVehicleId = null;
    a11y.close();

    // Reset closing flag immediately when modal is closed (not after animation)
    // This allows the modal to be reopened immediately after closing
    quickViewState.isClosing = false;
  }

  // Event listeners
  // Expose openQuickView globally for hash-based navigation
  window.openQuickView = openQuickView;

  // Use event delegation for dynamically created buttons
  // This ensures buttons created after initialization still work
  document.addEventListener("click", (e) => {
    const quickViewBtn = e.target.closest(".quick-view-btn");
    if (!quickViewBtn) return;

    e.stopPropagation();
    const vehicleCard = quickViewBtn.closest(".vehicle-card");
    if (vehicleCard) {
      openQuickView(vehicleCard);
    }
  });

  // Listen for custom event to open Quick View from hash navigation
  window.addEventListener("openQuickView", (e) => {
    if (e.detail?.vehicleId) {
      openQuickView(e.detail.vehicleId);
    }
  });

  quickViewClose?.addEventListener("click", closeQuickView);
  quickViewBackdrop?.addEventListener("click", closeQuickView);

  // Image navigation functions
  function showPrevImage() {
    if (quickViewState.vehicleImages.length > 0) {
      quickViewState.currentImageIndex =
        (quickViewState.currentImageIndex -
          1 +
          quickViewState.vehicleImages.length) %
        quickViewState.vehicleImages.length;
      updateMainImage();
      updateThumbnails();
    }
  }

  function showNextImage() {
    if (quickViewState.vehicleImages.length > 0) {
      quickViewState.currentImageIndex =
        (quickViewState.currentImageIndex + 1) %
        quickViewState.vehicleImages.length;
      updateMainImage();
      updateThumbnails();
    }
  }

  // Open image in fullscreen/lightbox
  function openImageFullscreen() {
    if (quickViewState.vehicleImages.length === 0) return;
    
    // Check if lightbox exists and use it
    const lightbox = document.getElementById("lightbox");
    if (lightbox) {
      // Close quick view modal first to avoid z-index conflicts
      const quickViewModal = document.getElementById("quick-view-modal");
      if (quickViewModal?.classList.contains("active")) {
        // Remove focus from any focused elements inside modal before closing
        const activeElement = document.activeElement;
        if (activeElement && quickViewModal.contains(activeElement)) {
          activeElement.blur();
        }
        quickViewModal.classList.remove("active");
        // Set aria-hidden after removing focus to prevent accessibility warnings
        setTimeout(() => {
          quickViewModal.setAttribute("aria-hidden", "true");
        }, 100);
      }
      
      // Create temporary image elements for lightbox to work with
      const tempImages = quickViewState.vehicleImages.map((imgSrc, index) => {
        const tempImg = document.createElement("img");
        tempImg.src = imgSrc;
        tempImg.alt = `Bild ${index + 1}`;
        return {
          src: imgSrc,
          alt: `Bild ${index + 1}`,
          element: tempImg
        };
      });
      
      // Update lightbox state with vehicle images first
      if (window.lightboxState) {
        window.lightboxState.setCurrentImages(tempImages);
        window.lightboxState.setCurrentIndex(quickViewState.currentImageIndex);
      }
      
      // Find the clicked image element to trigger lightbox properly
      const currentImgSrc = quickViewState.vehicleImages[quickViewState.currentImageIndex];
      const lightboxImg = document.getElementById("lightbox-img");
      const mainImageContainer = document.querySelector(".quick-view-main-image img");
      
      // Use the main image element if available, otherwise create a temporary one
      const imageElement = mainImageContainer || tempImages[quickViewState.currentImageIndex].element;
      
      // Trigger lightbox using the existing openLightbox function if available
      if (typeof window.openLightbox === "function") {
        window.openLightbox(imageElement);
      } else {
        // Fallback: manually open lightbox
        if (lightboxImg) {
          lightboxImg.src = currentImgSrc;
          lightboxImg.alt = tempImages[quickViewState.currentImageIndex].alt;
        }
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
        
        // Update counter
        const lightboxCurrent = document.getElementById("lightbox-current");
        const lightboxTotal = document.getElementById("lightbox-total");
        if (lightboxCurrent) {
          lightboxCurrent.textContent = quickViewState.currentImageIndex + 1;
        }
        if (lightboxTotal) {
          lightboxTotal.textContent = quickViewState.vehicleImages.length;
        }
        
        // Update lightbox gallery if it exists
        const lightboxGallery = document.getElementById("lightbox-gallery");
        if (lightboxGallery && quickViewState.vehicleImages.length > 1) {
          lightboxGallery.innerHTML = "";
          quickViewState.vehicleImages.forEach((imgSrc, index) => {
            const img = document.createElement("img");
            img.src = imgSrc;
            img.alt = `Bild ${index + 1}`;
            img.className = index === quickViewState.currentImageIndex ? "active" : "";
            img.addEventListener("click", () => {
              if (lightboxImg) {
                lightboxImg.src = imgSrc;
                quickViewState.currentImageIndex = index;
                if (window.currentIndex !== undefined) {
                  window.currentIndex = index;
                }
              }
              // Update active state
              lightboxGallery.querySelectorAll("img").forEach((g, i) => {
                g.classList.toggle("active", i === index);
              });
              // Update lightbox counter if it exists
              const counter = document.querySelector(".lightbox-counter");
              if (counter) {
                const current = document.getElementById("lightbox-current");
                if (current) current.textContent = index + 1;
              }
            });
            lightboxGallery.appendChild(img);
          });
        }
        
        // Update lightbox counter
        const currentCounter = document.getElementById("lightbox-current");
        const totalCounter = document.getElementById("lightbox-total");
        if (currentCounter) currentCounter.textContent = quickViewState.currentImageIndex + 1;
        if (totalCounter) totalCounter.textContent = quickViewState.vehicleImages.length;
      }
    } else {
      // Fallback: open image in new tab
      window.open(quickViewState.vehicleImages[quickViewState.currentImageIndex], "_blank");
    }
  }

  // Desktop: Button navigation
  document
    .querySelector(".prev-image")
    ?.addEventListener("click", showPrevImage);
  document
    .querySelector(".next-image")
    ?.addEventListener("click", showNextImage);
  
  // Zoom/Fullscreen button
  document
    .getElementById("image-zoom-btn")
    ?.addEventListener("click", openImageFullscreen);

  // Mobile: Touch/Swipe gestures
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50; // Minimum distance for a swipe

  const mainImageContainer = document.querySelector(".quick-view-main-image");
  if (mainImageContainer) {
    mainImageContainer.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    mainImageContainer.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      { passive: true }
    );
  }

  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped right - show previous image
        showPrevImage();
      } else {
        // Swiped left - show next image
        showNextImage();
      }
    }
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!quickViewModal.classList.contains("active")) return;

    if (e.key === "Escape") {
      closeQuickView();
    } else if (
      e.key === "ArrowLeft" &&
      quickViewState.vehicleImages.length > 0
    ) {
      quickViewState.currentImageIndex =
        (quickViewState.currentImageIndex -
          1 +
          quickViewState.vehicleImages.length) %
        quickViewState.vehicleImages.length;
      updateMainImage();
      updateThumbnails();
    } else if (
      e.key === "ArrowRight" &&
      quickViewState.vehicleImages.length > 0
    ) {
      quickViewState.currentImageIndex =
        (quickViewState.currentImageIndex + 1) %
        quickViewState.vehicleImages.length;
      updateMainImage();
      updateThumbnails();
    }
  });
}

// ========================================
// VEHICLE COMPARISON
// ========================================

// Global state for comparison (shared across all init calls)
let comparisonState = {
  isInitialized: false,
  comparedVehicles: JSON.parse(
    localStorage.getItem("comparedVehicles") || "[]"
  ),
};

function initComparison() {
  // Only initialize once - use event delegation which works for dynamically created elements
  if (comparisonState.isInitialized) {
    return;
  }

  const comparisonModal = document.getElementById("comparison-modal");
  if (!comparisonModal) return;

  comparisonState.isInitialized = true;

  const comparisonBackdrop = document.querySelector(".comparison-backdrop");
  const comparisonClose = document.querySelector(".comparison-close");
  const compareFloatingBtn = document.getElementById("compare-floating-btn");
  const compareCount = document.getElementById("compare-count");
  const comparisonClearBtn = document.getElementById("comparison-clear-btn");
  const comparisonContactBtn = document.getElementById(
    "comparison-contact-btn"
  );
  const comparisonEmpty = document.getElementById("comparison-empty");
  const comparisonTableWrapper = document.getElementById(
    "comparison-table-wrapper"
  );
  const comparisonTable = document.getElementById("comparison-table");
  const comparisonTableBody = document.getElementById("comparison-table-body");

  const MAX_COMPARE = 3;

  // Get all checkboxes dynamically
  function getAllCheckboxes() {
    return document.querySelectorAll(
      ".compare-checkbox, .compare-checkbox-modal"
    );
  }

  // Restore comparison state
  function restoreComparisonState() {
    getAllCheckboxes().forEach((checkbox) => {
      const vehicleCard = checkbox.closest(".vehicle-card");
      let vehicleId = vehicleCard?.dataset.vehicleId;

      // If modal checkbox, get vehicle ID from quick view modal
      if (!vehicleId && checkbox.classList.contains("compare-checkbox-modal")) {
        const quickViewModal = document.getElementById("quick-view-modal");
        vehicleId = quickViewModal?.dataset.currentVehicleId;
      }

      if (vehicleId) {
        checkbox.checked = comparisonState.comparedVehicles.includes(vehicleId);
        // Update button class and aria-pressed for visual state and accessibility
        const modalCheckboxBtn = checkbox.closest(
          ".compare-checkbox-btn-modal"
        );
        if (modalCheckboxBtn) {
          if (checkbox.checked) {
            modalCheckboxBtn.classList.add("has-checked");
            modalCheckboxBtn.setAttribute("aria-pressed", "true");
          } else {
            modalCheckboxBtn.classList.remove("has-checked");
            modalCheckboxBtn.setAttribute("aria-pressed", "false");
          }
        }
        // Force visual update
        void checkbox.offsetHeight;
        checkbox.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    updateCompareButton();
  }

  function saveComparisonState() {
    const checked = Array.from(getAllCheckboxes())
      .filter((cb) => cb.checked)
      .map((cb) => {
        const vehicleCard = cb.closest(".vehicle-card");
        let vehicleId = vehicleCard?.dataset.vehicleId;

        // If modal checkbox, get vehicle ID from quick view modal
        if (!vehicleId && cb.classList.contains("compare-checkbox-modal")) {
          const quickViewModal = document.getElementById("quick-view-modal");
          vehicleId = quickViewModal?.dataset.currentVehicleId;
        }

        return vehicleId;
      })
      .filter(Boolean);
    comparisonState.comparedVehicles = checked;
    localStorage.setItem(
      "comparedVehicles",
      JSON.stringify(comparisonState.comparedVehicles)
    );
    updateCompareButton();
  }

  function updateCompareButton() {
    const count = comparisonState.comparedVehicles.length;
    if (compareCount) {
      compareCount.textContent = count;
      compareFloatingBtn?.classList.toggle("active", count > 0);
    }
  }

  function getVehicleData(vehicleId) {
    const vehicleCard = document.querySelector(
      `[data-vehicle-id="${vehicleId}"]`
    );
    if (!vehicleCard) return null;

    const title = vehicleCard.querySelector(".card-title")?.textContent || "";
    const price = vehicleCard.querySelector(".card-price")?.textContent || "";
    const specs = vehicleCard.querySelector(".card-specs")?.textContent || "";
    const image = vehicleCard.querySelector(".card-image img")?.src || "";
    const year = vehicleCard.dataset.year || "";
    const mileage = vehicleCard.dataset.mileage || "";
    const fuel = vehicleCard.querySelector(".fuel-badge")?.textContent || "";
    const features = Array.from(
      vehicleCard.querySelectorAll(".feature-tag")
    ).map((tag) => tag.textContent);

    // Parse specs text for year, mileage, power
    const specsMatch = specs.match(/(\d{4}).*?(\d+(?:\.\d+)?)\s*(?:km|PS)/);
    const yearFromSpecs = specsMatch ? specsMatch[1] : year;
    const powerFromSpecs = specs.match(/(\d+)\s*kW\s*\((\d+)\s*PS\)/);
    const power = powerFromSpecs
      ? `${powerFromSpecs[1]} kW (${powerFromSpecs[2]} PS)`
      : "";
    const mileageFromSpecs = specs.match(/(\d+(?:\.\d+)?)\s*km/);
    const mileageValue = mileageFromSpecs ? mileageFromSpecs[1] : mileage;

    return {
      id: vehicleId,
      title,
      price,
      year: yearFromSpecs,
      mileage: mileageValue,
      power,
      fuel,
      features,
      image,
    };
  }

  function renderComparisonTable() {
    if (comparisonState.comparedVehicles.length === 0) {
      comparisonEmpty?.style.setProperty("display", "block");
      comparisonTableWrapper?.style.setProperty("display", "none");
      return;
    }

    comparisonEmpty?.style.setProperty("display", "none");
    comparisonTableWrapper?.style.setProperty("display", "block");

    // Clear existing table
    const theadRow = comparisonTable?.querySelector("thead tr");
    const tbody = comparisonTableBody;
    if (!theadRow || !tbody) return;

    // Clear existing columns (keep first spec label column)
    while (theadRow.children.length > 1) {
      theadRow.removeChild(theadRow.lastChild);
    }
    tbody.innerHTML = "";

    // Get vehicle data
    const vehiclesData = comparisonState.comparedVehicles
      .map((id) => getVehicleData(id))
      .filter(Boolean);

    if (vehiclesData.length === 0) {
      comparisonEmpty?.style.setProperty("display", "block");
      comparisonTableWrapper?.style.setProperty("display", "none");
      return;
    }

    // Build header with vehicle info
    vehiclesData.forEach((vehicle) => {
      const th = document.createElement("th");
      th.className = "comparison-vehicle-header";
      th.innerHTML = `
        <div class="comparison-vehicle-image">
          <img src="${vehicle.image}" alt="${vehicle.title}" />
          <button class="comparison-remove-btn" data-vehicle-id="${vehicle.id}" aria-label="Entfernen">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="comparison-vehicle-title">${vehicle.title}</div>
        <div class="comparison-vehicle-price">${vehicle.price}</div>
      `;
      theadRow.appendChild(th);
    });

    // Build comparison rows
    const specs = [
      { label: "Erstzulassung", value: (v) => v.year },
      {
        label: "Kilometerstand",
        value: (v) => (v.mileage ? `${v.mileage} km` : "-"),
      },
      { label: "Leistung", value: (v) => v.power || "-" },
      { label: "Kraftstoff", value: (v) => v.fuel || "-" },
      { label: "Ausstattung", value: (v) => v.features.join(", ") || "-" },
      { label: "Preis", value: (v) => v.price },
    ];

    specs.forEach((spec) => {
      const row = document.createElement("tr");
      const labelCell = document.createElement("td");
      labelCell.className = "comparison-spec-label";
      labelCell.textContent = spec.label;
      row.appendChild(labelCell);

      vehiclesData.forEach((vehicle) => {
        const valueCell = document.createElement("td");
        valueCell.className = "comparison-spec-value";
        valueCell.textContent = spec.value(vehicle);
        row.appendChild(valueCell);
      });

      tbody.appendChild(row);
    });

    // Add action row
    const actionRow = document.createElement("tr");
    actionRow.className = "comparison-actions-row";
    const actionLabelCell = document.createElement("td");
    actionLabelCell.className = "comparison-spec-label";
    actionLabelCell.textContent = "Aktionen";
    actionRow.appendChild(actionLabelCell);

    vehiclesData.forEach((vehicle) => {
      const actionCell = document.createElement("td");
      actionCell.className = "comparison-spec-value comparison-actions";
      actionCell.innerHTML = `
        <div class="comparison-actions-wrapper">
          <a href="#kontakt" class="btn btn-primary btn-sm">Anfragen</a>
          <button class="btn btn-secondary btn-sm quick-view-from-compare" data-vehicle-id="${vehicle.id}">Details</button>
        </div>
      `;
      actionRow.appendChild(actionCell);
    });

    tbody.appendChild(actionRow);
  }

  // A11y wiring
  const a11y = setupModalA11y(comparisonModal, {
    titleSelector: ".comparison-title, #comparison-title",
  });

  function openComparisonModal() {
    if (comparisonState.comparedVehicles.length === 0) return;

    // Close quick view modal if it's open, then open comparison modal
    const quickViewModal = document.getElementById("quick-view-modal");
    if (quickViewModal?.classList.contains("active")) {
      // Close quick view modal
      quickViewModal.classList.remove("active");
      // Wait a bit for the close animation before opening comparison modal
      setTimeout(() => {
        renderComparisonTable();
        comparisonModal?.classList.add("active");
        document.body.style.overflow = "hidden";
        a11y.open();
      }, 200);
    } else {
      // Quick view not open, proceed normally
      renderComparisonTable();
      comparisonModal?.classList.add("active");
      document.body.style.overflow = "hidden";
      a11y.open();
    }
  }

  function closeComparisonModal() {
    comparisonModal?.classList.remove("active");
    document.body.style.overflow = "";
    a11y.close();
  }

  function clearComparison() {
    comparisonState.comparedVehicles = [];
    localStorage.setItem("comparedVehicles", JSON.stringify([]));

    // Uncheck all checkboxes dynamically
    getAllCheckboxes().forEach((cb) => {
      cb.checked = false;

      // Update button class for visual state
      const btn = cb.closest(".compare-checkbox-btn-modal");
      if (btn) {
        btn.classList.remove("has-checked");
        void btn.offsetHeight;
      }

      // Force visual update
      void cb.offsetHeight;
      cb.dispatchEvent(new Event("input", { bubbles: true }));
    });

    updateCompareButton();
    closeComparisonModal();
  }

  // Use event delegation for all checkboxes (works for dynamically created elements)
  document.addEventListener("change", (e) => {
    const checkbox = e.target;
    if (!checkbox.matches(".compare-checkbox, .compare-checkbox-modal")) return;

    const vehicleCard = checkbox.closest(".vehicle-card");
    let vehicleId = vehicleCard?.dataset.vehicleId;

    // If no vehicle card found, try to get vehicle ID from quick view modal
    if (!vehicleId && checkbox.classList.contains("compare-checkbox-modal")) {
      const quickViewModal = document.getElementById("quick-view-modal");
      vehicleId = quickViewModal?.dataset.currentVehicleId;
    }

    if (!vehicleId) return;

    if (checkbox.checked) {
      if (comparisonState.comparedVehicles.length >= MAX_COMPARE) {
        checkbox.checked = false;
        alert(`Sie können maximal ${MAX_COMPARE} Fahrzeuge vergleichen.`);
        // Force visual update
        void checkbox.offsetHeight;
        checkbox.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }
      comparisonState.comparedVehicles.push(vehicleId);
    } else {
      comparisonState.comparedVehicles =
        comparisonState.comparedVehicles.filter((id) => id !== vehicleId);
    }
    saveComparisonState();
    updateCompareButton();

    // Sync modal checkbox with card checkbox and vice versa
    if (checkbox.classList.contains("compare-checkbox-modal")) {
      // Modal checkbox changed - sync to card checkbox
      const cardCheckbox = document.querySelector(
        `[data-vehicle-id="${vehicleId}"] .compare-checkbox`
      );
      if (cardCheckbox) {
        cardCheckbox.checked = checkbox.checked;
        // Force visual update
        void cardCheckbox.offsetHeight;
        cardCheckbox.dispatchEvent(new Event("input", { bubbles: true }));
      }
      // Update button class and aria-pressed for visual state and accessibility
      const modalCheckboxBtn = checkbox.closest(".compare-checkbox-btn-modal");
      if (modalCheckboxBtn) {
        if (checkbox.checked) {
          modalCheckboxBtn.classList.add("has-checked");
          modalCheckboxBtn.setAttribute("aria-pressed", "true");
        } else {
          modalCheckboxBtn.classList.remove("has-checked");
          modalCheckboxBtn.setAttribute("aria-pressed", "false");
        }
        void modalCheckboxBtn.offsetHeight;
      }
      // Force visual update on modal checkbox
      void checkbox.offsetHeight;
      checkbox.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      // Card checkbox changed - sync to modal checkbox
      const quickViewModal = document.getElementById("quick-view-modal");
      if (quickViewModal?.dataset.currentVehicleId === vehicleId) {
        const modalCheckbox = document.querySelector(".compare-checkbox-modal");
        if (modalCheckbox) {
          modalCheckbox.checked = checkbox.checked;
          // Update button class and aria-pressed for visual state and accessibility
          const modalCheckboxBtn = modalCheckbox.closest(
            ".compare-checkbox-btn-modal"
          );
          if (modalCheckboxBtn) {
            if (modalCheckbox.checked) {
              modalCheckboxBtn.classList.add("has-checked");
              modalCheckboxBtn.setAttribute("aria-pressed", "true");
            } else {
              modalCheckboxBtn.classList.remove("has-checked");
              modalCheckboxBtn.setAttribute("aria-pressed", "false");
            }
            void modalCheckboxBtn.offsetHeight;
          }
          // Force visual update
          void modalCheckbox.offsetHeight;
          modalCheckbox.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    }
  });

  // Handle modal checkbox button click (checkbox is inside button)
  // Use event delegation since this element exists in the modal
  document.addEventListener("click", (e) => {
    const modalCheckboxBtn = e.target.closest(".compare-checkbox-btn-modal");
    if (!modalCheckboxBtn) return;

    const checkbox = modalCheckboxBtn.querySelector(".compare-checkbox-modal");
    if (!checkbox) return;

    // If clicking directly on checkbox, let native handler work first
    const isDirectCheckboxClick =
      e.target === checkbox || e.target.type === "checkbox";

    if (!isDirectCheckboxClick) {
      // Clicking on button or span - prevent default and toggle
      e.preventDefault();
      e.stopPropagation();
      checkbox.checked = !checkbox.checked;
    }

    // Always ensure visual update after state change
    // Update class on button for reliable CSS state
    if (checkbox.checked) {
      modalCheckboxBtn.classList.add("has-checked");
    } else {
      modalCheckboxBtn.classList.remove("has-checked");
    }

    // Force CSS reflow to ensure :has() selector updates
    void modalCheckboxBtn.offsetHeight;
    void checkbox.offsetHeight;

    // Dispatch events for state sync
    checkbox.dispatchEvent(
      new Event("change", { bubbles: true, cancelable: true })
    );
    checkbox.dispatchEvent(
      new Event("input", { bubbles: true, cancelable: true })
    );
  });

  // Floating compare button
  const floatingBtn = document.getElementById("compare-floating-btn");
  floatingBtn?.addEventListener("click", openComparisonModal);

  // Clear comparison button
  const clearBtn = document.getElementById("comparison-clear-btn");
  clearBtn?.addEventListener("click", clearComparison);

  // Contact button
  const contactBtn = document.getElementById("comparison-contact-btn");
  contactBtn?.addEventListener("click", () => {
    closeComparisonModal();
    window.location.href = "#kontakt";
  });

  // Close modal buttons
  const closeBtn = comparisonModal?.querySelector(".comparison-close");
  closeBtn?.addEventListener("click", closeComparisonModal);

  // Close modal on backdrop click
  const backdrop = comparisonModal?.querySelector(".comparison-backdrop");
  backdrop?.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      closeComparisonModal();
    }
  });

  // Handle remove button from comparison table (using event delegation)
  document.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".comparison-remove-btn");
    if (!removeBtn) return;

    const vehicleId = removeBtn.dataset.vehicleId;
    if (!vehicleId) return;

    // Update global state
    comparisonState.comparedVehicles = comparisonState.comparedVehicles.filter(
      (id) => id !== vehicleId
    );
    localStorage.setItem(
      "comparedVehicles",
      JSON.stringify(comparisonState.comparedVehicles)
    );

    // Uncheck all checkboxes for this vehicle (card and modal)
    const cardCheckbox = document.querySelector(
      `[data-vehicle-id="${vehicleId}"] .compare-checkbox`
    );
    if (cardCheckbox) {
      cardCheckbox.checked = false;
      void cardCheckbox.offsetHeight;
      cardCheckbox.dispatchEvent(new Event("input", { bubbles: true }));
    }

    const modalCheckbox = document.querySelector(".compare-checkbox-modal");
    if (modalCheckbox) {
      const quickViewModal = document.getElementById("quick-view-modal");
      if (quickViewModal?.dataset.currentVehicleId === vehicleId) {
        modalCheckbox.checked = false;
        void modalCheckbox.offsetHeight;
        modalCheckbox.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    // Update compare button
    updateCompareButton();

    // Re-render comparison table if modal is open
    if (comparisonModal?.classList.contains("active")) {
      renderComparisonTable();
    }
  });

  // Expose renderComparisonTable globally for use by remove button handler
  window.renderComparisonTable = renderComparisonTable;

  // Initial update
  restoreComparisonState();
  updateCompareButton();
}

// ========================================
// FINANCING CALCULATOR
// ========================================

function initFinancingCalculator() {
  const financingModal = document.getElementById("financing-modal");
  const financingClose = document.querySelector(".financing-close");
  const financingBackdrop = document.querySelector(".financing-backdrop");
  const priceInput = document.getElementById("financing-price");
  const downpaymentSlider = document.getElementById("financing-downpayment");
  const downpaymentAmount = document.getElementById(
    "financing-downpayment-amount"
  );
  const downpaymentPercent = document.getElementById(
    "financing-downpayment-percent"
  );
  const termSlider = document.getElementById("financing-term");
  const termDisplay = document.getElementById("financing-term-display");
  const rateInput = document.getElementById("financing-rate");
  const loanAmountDisplay = document.getElementById("financing-loan-amount");
  const monthlyPaymentDisplay = document.getElementById(
    "financing-monthly-payment"
  );
  const totalDisplay = document.getElementById("financing-total");
  const resetBtn = document.getElementById("financing-reset-btn");
  const contactBtn = document.getElementById("financing-contact-btn");

  if (!financingModal) return;

  const a11y = setupModalA11y(financingModal, {
    titleSelector: ".financing-title, #financing-title",
  });

  // Open modal
  function openFinancingModal(vehiclePrice = null, vehicleId = null) {
    financingModal.classList.add("active");
    document.body.style.overflow = "hidden";
    a11y.open();

    // Store vehicle ID for later use by contact button
    if (vehicleId) {
      financingModal.dataset.currentVehicleId = vehicleId;
    }

    if (vehiclePrice) {
      priceInput.value = vehiclePrice;
      calculateFinancing();
    }
  }

  // Close modal
  function closeFinancingModal() {
    financingModal.classList.remove("active");
    document.body.style.overflow = "";
    a11y.close();
  }

  // Calculate financing
  function calculateFinancing() {
    const price = parseFloat(priceInput.value) || 0;
    const downpaymentPercentValue = parseFloat(downpaymentSlider.value) || 0;
    const downpaymentAmountValue =
      parseFloat(downpaymentAmount.value) ||
      price * (downpaymentPercentValue / 100);
    const term = parseFloat(termSlider.value) || 60;
    const rate = parseFloat(rateInput.value) || 4.5;

    // Update downpayment amount if slider changed
    const calculatedDownpayment = price * (downpaymentPercentValue / 100);
    if (Math.abs(downpaymentAmountValue - calculatedDownpayment) < 1) {
      downpaymentAmount.value = Math.round(calculatedDownpayment);
    }

    // Calculate loan amount
    const loanAmount = price - downpaymentAmountValue;

    if (loanAmount <= 0 || term <= 0 || rate < 0) {
      loanAmountDisplay.textContent = "€ 0";
      monthlyPaymentDisplay.textContent = "€ 0";
      totalDisplay.textContent = "€ 0";
      return;
    }

    // Calculate monthly payment using standard loan formula
    const monthlyRate = rate / 100 / 12;
    const numPayments = term;

    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      const factor = Math.pow(1 + monthlyRate, numPayments);
      monthlyPayment = loanAmount * ((monthlyRate * factor) / (factor - 1));
    } else {
      monthlyPayment = loanAmount / numPayments;
    }

    const total = downpaymentAmountValue + monthlyPayment * term;

    // Update displays
    loanAmountDisplay.textContent = formatCurrency(loanAmount);
    monthlyPaymentDisplay.textContent = formatCurrency(monthlyPayment);
    totalDisplay.textContent = formatCurrency(total);
  }

  function formatCurrency(amount) {
    return `€ ${Math.round(amount).toLocaleString("de-DE")}`;
  }

  // Update downpayment percentage from slider
  downpaymentSlider?.addEventListener("input", (e) => {
    const percent = parseFloat(e.target.value);
    const price = parseFloat(priceInput.value) || 0;
    downpaymentPercent.textContent = `${percent}%`;
    downpaymentAmount.value = Math.round(price * (percent / 100));
    calculateFinancing();
  });

  // Update downpayment from amount input
  downpaymentAmount?.addEventListener("input", (e) => {
    const amount = parseFloat(e.target.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    if (price > 0) {
      const percent = Math.min(
        50,
        Math.max(0, Math.round((amount / price) * 100))
      );
      downpaymentSlider.value = percent;
      downpaymentPercent.textContent = `${percent}%`;
    }
    calculateFinancing();
  });

  // Update term display
  termSlider?.addEventListener("input", (e) => {
    const term = parseFloat(e.target.value);
    termDisplay.textContent = `${term} Monate`;
    calculateFinancing();
  });

  // Calculate on price or rate change
  priceInput?.addEventListener("input", () => {
    const price = parseFloat(priceInput.value) || 0;
    const percent = parseFloat(downpaymentSlider.value) || 0;
    downpaymentAmount.value = Math.round(price * (percent / 100));
    calculateFinancing();
  });

  rateInput?.addEventListener("input", calculateFinancing);

  // Open modal triggers - Use event delegation for dynamically created buttons
  document.addEventListener("click", (e) => {
    // Check if clicked element or its parent is a financing trigger button
    const trigger = e.target.closest(
      ".financing-calc-trigger, .financing-badge, .financing-trigger"
    );
    if (!trigger) return;

    e.preventDefault();
    e.stopPropagation();

    const vehicleCard = trigger.closest(".vehicle-card");
    let vehiclePrice = null;

    if (vehicleCard) {
      const priceData = vehicleCard.dataset.price;
      if (priceData) {
        vehiclePrice = parseFloat(priceData.replace(/[^\d]/g, ""));
      } else {
        const priceText = vehicleCard
          .querySelector(".card-price")
          ?.textContent?.replace(/[^\d]/g, "");
        if (priceText) {
          vehiclePrice = parseFloat(priceText);
        }
      }
    }

    // Try to get price from quick view modal
    let vehicleId = null;
    if (!vehiclePrice) {
      const quickViewModal = document.getElementById("quick-view-modal");
      if (quickViewModal?.classList.contains("active")) {
        vehicleId = quickViewModal.dataset.currentVehicleId;
        const quickViewPrice = document
          .getElementById("quick-view-price")
          ?.textContent?.replace(/[^\d]/g, "");
        if (quickViewPrice) {
          vehiclePrice = parseFloat(quickViewPrice);
        }
      }
    } else if (vehicleCard) {
      vehicleId = vehicleCard.dataset.vehicleId;
    }

    openFinancingModal(vehiclePrice, vehicleId);
  });

  // Close modal
  financingClose?.addEventListener("click", closeFinancingModal);
  financingBackdrop?.addEventListener("click", (e) => {
    if (e.target === financingBackdrop) {
      closeFinancingModal();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && financingModal.classList.contains("active")) {
      closeFinancingModal();
    }
  });

  // Reset button
  resetBtn?.addEventListener("click", () => {
    priceInput.value = "";
    downpaymentSlider.value = 10;
    downpaymentAmount.value = "";
    downpaymentPercent.textContent = "10%";
    termSlider.value = 60;
    termDisplay.textContent = "60 Monate";
    rateInput.value = 7;
    calculateFinancing();
  });

  // Contact button - opens inquiry modal like inquiry-btn-modal
  contactBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeFinancingModal();
    
    // Get vehicle ID from financing modal or quick-view modal
    let vehicleId = financingModal.dataset.currentVehicleId;
    if (!vehicleId) {
      const quickViewModal = document.getElementById("quick-view-modal");
      if (quickViewModal?.classList.contains("active")) {
        vehicleId = quickViewModal.dataset.currentVehicleId;
      }
    }
    
    if (vehicleId) {
      const vehicleCard = document.querySelector(
        `[data-vehicle-id="${vehicleId}"]`
      );
      if (vehicleCard) {
        // Close quick view first if still open
        const quickViewModal = document.getElementById("quick-view-modal");
        if (quickViewModal?.classList.contains("active")) {
          document.querySelector(".quick-view-close")?.click();
          setTimeout(() => {
            // Trigger inquiry modal
            const inquiryEvent = new CustomEvent('triggerInquiry', {
              detail: { vehicleCard }
            });
            window.dispatchEvent(inquiryEvent);
          }, 300);
        } else {
          // Quick view not open, trigger inquiry directly
          const inquiryEvent = new CustomEvent('triggerInquiry', {
            detail: { vehicleCard }
          });
          window.dispatchEvent(inquiryEvent);
        }
        return;
      }
    }
    
    // Fallback: scroll to contact section
    window.location.href = "#kontakt";
  });

  // Initial calculation
  calculateFinancing();
}

// ========================================
// VEHICLE INQUIRY FORM
// ========================================

function initVehicleInquiry() {
  const inquiryModal = document.getElementById("inquiry-modal");
  const inquiryBackdrop = document.querySelector(".inquiry-backdrop");
  const inquiryClose = document.querySelector(".inquiry-close");
  const inquiryForm = document.getElementById("inquiry-form");
  const inquirySuccess = document.getElementById("inquiry-success");
  const inquiryVehicleInfo = document.getElementById("inquiry-vehicle-info");
  const inquiryVehicleImg = document.getElementById("inquiry-vehicle-img");
  const inquiryVehicleTitle = document.getElementById("inquiry-vehicle-title");
  const inquiryVehiclePrice = document.getElementById("inquiry-vehicle-price");

  let currentVehicle = null;

  const a11y = setupModalA11y(inquiryModal, {
    titleSelector: "#inquiry-title, .inquiry-title",
  });

  // Open inquiry modal from vehicle card
  document.addEventListener("click", (e) => {
    const inquiryBtn = e.target.closest(".inquiry-btn:not(.inquiry-btn-modal)");
    if (inquiryBtn) {
      e.preventDefault();
      const vehicleCard = inquiryBtn.closest(".vehicle-card");
      if (vehicleCard) {
        openInquiryModal(vehicleCard);
      }
    }

    // Open from quick view modal
    const inquiryBtnModal = e.target.closest(".inquiry-btn-modal");
    if (inquiryBtnModal) {
      e.preventDefault();
      const quickViewModal = document.getElementById("quick-view-modal");
      if (quickViewModal?.classList.contains("active")) {
        const vehicleId = quickViewModal.dataset.currentVehicleId;
        const vehicleCard = document.querySelector(
          `[data-vehicle-id="${vehicleId}"]`
        );
        if (vehicleCard) {
          // Close quick view first
          document.querySelector(".quick-view-close")?.click();
          setTimeout(() => {
            openInquiryModal(vehicleCard);
          }, 300);
        }
      }
    }
  });

  // Listen for custom event from financing-contact-btn
  window.addEventListener('triggerInquiry', (e) => {
    const vehicleCard = e.detail?.vehicleCard;
    if (vehicleCard) {
      openInquiryModal(vehicleCard);
    }
  });

  function openInquiryModal(vehicleCard) {
    if (!vehicleCard || !inquiryModal) return;

    // Extract vehicle info
    const vehicleId = vehicleCard.dataset.vehicleId || "";
    const vehicleTitle =
      vehicleCard.querySelector(".card-header h3")?.textContent.trim() ||
      vehicleCard.querySelector(".card-title")?.textContent.trim() ||
      "Fahrzeug";
    const vehiclePrice =
      vehicleCard.querySelector(".card-price")?.textContent.trim() ||
      vehicleCard.querySelector(".price")?.textContent.trim() ||
      "";
    const vehicleImage =
      vehicleCard.querySelector(".card-image img")?.src ||
      vehicleCard.querySelector("img")?.src ||
      "";

    // Store current vehicle
    currentVehicle = {
      id: vehicleId,
      title: vehicleTitle,
      price: vehiclePrice,
      image: vehicleImage,
    };

    // Populate modal
    inquiryVehicleTitle.textContent = vehicleTitle;
    inquiryVehiclePrice.textContent = vehiclePrice;
    inquiryVehicleImg.src = vehicleImage;
    inquiryVehicleImg.alt = vehicleTitle;

    // Show vehicle info section
    inquiryVehicleInfo.style.display = "flex";

    // Reset form
    inquiryForm.reset();
    inquiryForm.style.display = "block";
    inquirySuccess.style.display = "none";

    // Show modal
    inquiryModal.classList.add("active");
    document.body.style.overflow = "hidden";
    a11y.open();
  }

  function closeInquiryModal() {
    if (!inquiryModal) return;
    inquiryModal.classList.remove("active");
    document.body.style.overflow = "";
    currentVehicle = null;
    a11y.close();
  }

  // Close handlers
  if (inquiryClose) {
    inquiryClose.addEventListener("click", closeInquiryModal);
  }
  if (inquiryBackdrop) {
    inquiryBackdrop.addEventListener("click", closeInquiryModal);
  }

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && inquiryModal?.classList.contains("active")) {
      closeInquiryModal();
    }
  });

  // Form submission
  if (inquiryForm) {
    inquiryForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitButton = inquiryForm.querySelector("button[type='submit']");
      const btnText = submitButton.querySelector(".btn-text");
      const btnLoading = submitButton.querySelector(".btn-loading");

      // Get form data
      const formData = new FormData(inquiryForm);
      const name = formData.get("name")?.trim() || "";
      const email = formData.get("email")?.trim() || "";
      const phone = formData.get("phone")?.trim() || "";
      const message = formData.get("message")?.trim() || "";
      const privacy = formData.get("privacy");

      // Validation
      if (!name || !email || !message || !privacy) {
        alert("Bitte füllen Sie alle Pflichtfelder aus.");
        return;
      }

      // Show loading state
      submitButton.disabled = true;
      btnText.style.display = "none";
      btnLoading.style.display = "block";

      try {
        // Build message with vehicle info
        let fullMessage = message;
        let emailSubject = "Fahrzeug-Anfrage";
        if (currentVehicle) {
          emailSubject = `Fahrzeug-Anfrage: ${currentVehicle.title}`;
          fullMessage = `Fahrzeug-Anfrage: ${currentVehicle.title}
Preis: ${currentVehicle.price}

Nachricht:
${message}`;
        }

        // Build email body
        const emailBodyText = `Name: ${name}
E-Mail: ${email}
Telefon: ${phone || "Nicht angegeben"}

${fullMessage}`;

        // Build mailto link
        const emailBody = encodeURIComponent(emailBodyText);
        const email = (window.dealerConfig && window.dealerConfig.email) || 'office@cbhandel.at';
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
          emailSubject
        )}&body=${emailBody}`;

        // Open email client using a temporary anchor element (more reliable than window.location)
        const mailtoAnchor = document.createElement("a");
        mailtoAnchor.href = mailtoLink;
        mailtoAnchor.style.display = "none";
        document.body.appendChild(mailtoAnchor);
        mailtoAnchor.click();

        // Clean up after a short delay
        setTimeout(() => {
          document.body.removeChild(mailtoAnchor);
        }, 100);

        // Show success message
        inquiryForm.style.display = "none";
        inquirySuccess.style.display = "block";

        // Auto-close after 3 seconds
        setTimeout(() => {
          closeInquiryModal();
        }, 3000);
      } catch (error) {
        console.error("Inquiry form error:", error);
        const phone = (window.dealerConfig && window.dealerConfig.phone) || '+43 664 3882323';
        const errorMsg = `Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch unter ${phone}.`;
        alert(errorMsg);
        announceToScreenReader("forms", errorMsg);
      } finally {
        submitButton.disabled = false;
        btnText.style.display = "block";
        btnLoading.style.display = "none";
      }
    });
  }

  // Update renderVehicleCard to include inquiry button
  const originalRenderVehicleCard = window.renderVehicleCard;
  if (originalRenderVehicleCard) {
    window.renderVehicleCard = function (vehicle) {
      const cardElement = originalRenderVehicleCard(vehicle);
      // The inquiry button should already be in the static HTML template
      // but we need to ensure it's in dynamically rendered cards
      if (cardElement && typeof cardElement.querySelector === "function") {
        // Check if inquiry button already exists
        if (!cardElement.querySelector(".inquiry-btn")) {
          // Find the card-actions div and add inquiry button
          const cardActions = cardElement.querySelector(".card-actions");
          if (cardActions) {
            const inquiryBtn = document.createElement("button");
            inquiryBtn.className = "inquiry-btn card-action-btn";
            inquiryBtn.setAttribute("aria-label", "Anfrage stellen");
            inquiryBtn.setAttribute("title", "Fahrzeug anfragen");
            inquiryBtn.innerHTML = `<svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>`;
            cardActions.appendChild(inquiryBtn);
          }
        }
      }
      return cardElement;
    };
  }
}

// ========================================
// TRADE-IN CALCULATOR
// ========================================

function initTradeInCalculator() {
  const tradeinModal = document.getElementById("tradein-modal");
  const tradeinTriggers = document.querySelectorAll(".tradein-trigger");
  const tradeinClose = document.querySelector(".tradein-close");
  const tradeinBackdrop = document.querySelector(".tradein-backdrop");
  const brandSelect = document.getElementById("tradein-brand");
  const modelInput = document.getElementById("tradein-model");
  const yearInput = document.getElementById("tradein-year");
  const mileageInput = document.getElementById("tradein-mileage");
  const conditionSlider = document.getElementById("tradein-condition");
  const conditionDisplay = document.getElementById("tradein-condition-display");
  const conditionBtns = document.querySelectorAll(".condition-btn");
  const featuresTextarea = document.getElementById("tradein-features");
  const estimateDisplay = document.getElementById("tradein-estimate");
  const rangeDisplay = document.getElementById("tradein-range");
  const resetBtn = document.getElementById("tradein-reset-btn");
  const submitBtn = document.getElementById("tradein-submit-btn");

  if (!tradeinModal) return;

  // Setup accessibility
  const a11y = setupModalA11y(tradeinModal, {
    titleSelector: ".tradein-header h2",
  });

  const conditionLabels = [
    "Sehr schlecht",
    "Schlecht",
    "Gut",
    "Sehr gut",
    "Ausgezeichnet",
  ];

  // Open modal
  function openTradeInModal() {
    tradeinModal.classList.add("active");
    document.body.style.overflow = "hidden";
    a11y.open();
    calculateTradeIn();
  }

  // Close modal
  function closeTradeInModal() {
    tradeinModal.classList.remove("active");
    document.body.style.overflow = "";
    a11y.close();
  }

  // Calculate trade-in estimate
  function calculateTradeIn() {
    const brand = brandSelect.value;
    const model = modelInput.value.trim();
    const year = parseInt(yearInput.value) || 0;
    const mileage = parseInt(mileageInput.value) || 0;
    const condition = parseInt(conditionSlider.value) || 2;

    if (!brand || !model || !year || !mileage) {
      estimateDisplay.textContent = "€ -";
      rangeDisplay.textContent = "€ -";
      return;
    }

    // Base price estimation (simplified calculation)
    // This is a placeholder - in a real scenario, this would use a vehicle valuation API
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - year);
    const avgMileagePerYear = mileage / Math.max(1, age);

    // Base value factors
    let baseValue = 15000; // Default base value in euros

    // Adjust for brand (simplified)
    const brandFactors = {
      Porsche: 1.5,
      Audi: 1.3,
      BMW: 1.3,
      "Mercedes-Benz": 1.3,
      Volvo: 1.1,
      VW: 1.0,
      Ford: 0.95,
      Opel: 0.9,
      Skoda: 0.9,
      sonstige: 0.85,
    };
    baseValue *= brandFactors[brand] || 1.0;

    // Adjust for age (depreciation)
    const depreciation = Math.min(0.7, age * 0.08); // Max 70% depreciation
    baseValue *= 1 - depreciation;

    // Adjust for mileage (0-150k km optimal, beyond that reduces value)
    const mileageFactor = Math.max(
      0.6,
      1 - Math.max(0, (mileage - 100000) / 200000) * 0.4
    );
    baseValue *= mileageFactor;

    // Condition multiplier
    const conditionMultipliers = [0.5, 0.7, 0.85, 1.0, 1.15];
    baseValue *= conditionMultipliers[condition] || 0.85;

    // Round to nearest 100
    const estimate = Math.round(baseValue / 100) * 100;

    // Calculate range (±15%)
    const lower = Math.round((estimate * 0.85) / 100) * 100;
    const upper = Math.round((estimate * 1.15) / 100) * 100;

    // Display results
    estimateDisplay.textContent = `€ ${estimate.toLocaleString("de-DE")}`;
    rangeDisplay.textContent = `€ ${lower.toLocaleString(
      "de-DE"
    )} - € ${upper.toLocaleString("de-DE")}`;
  }

  // Update condition display
  function updateConditionDisplay() {
    const value = parseInt(conditionSlider.value) || 2;
    conditionDisplay.textContent = conditionLabels[value];
  }

  // Event listeners
  brandSelect?.addEventListener("change", calculateTradeIn);
  modelInput?.addEventListener("input", calculateTradeIn);
  yearInput?.addEventListener("input", calculateTradeIn);
  mileageInput?.addEventListener("input", calculateTradeIn);
  conditionSlider?.addEventListener("input", () => {
    updateConditionDisplay();
    calculateTradeIn();
  });

  // Condition buttons mutually exclusive selection
  conditionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = parseInt(btn.dataset.value);
      conditionSlider.value = value;
      conditionBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateConditionDisplay();
      calculateTradeIn();
    });
  });

  // Initialize active button
  if (conditionBtns.length > 0) {
    const initialValue = parseInt(conditionSlider.value) || 2;
    conditionBtns[initialValue]?.classList.add("active");
  }

  // Open modal triggers
  tradeinTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openTradeInModal();
    });
  });

  // Close modal
  tradeinClose?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeTradeInModal();
  });
  tradeinBackdrop?.addEventListener("click", (e) => {
    if (e.target === tradeinBackdrop) {
      closeTradeInModal();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && tradeinModal.classList.contains("active")) {
      closeTradeInModal();
    }
  });

  // Reset button
  resetBtn?.addEventListener("click", () => {
    brandSelect.value = "";
    modelInput.value = "";
    yearInput.value = "";
    mileageInput.value = "";
    conditionSlider.value = 2;
    conditionBtns.forEach((b) => b.classList.remove("active"));
    conditionBtns[2]?.classList.add("active");
    featuresTextarea.value = "";
    updateConditionDisplay();
    calculateTradeIn();
  });

  // Submit button
  submitBtn?.addEventListener("click", () => {
    const brand = brandSelect.value;
    const model = modelInput.value.trim();
    const year = yearInput.value;
    const mileage = mileageInput.value;
    const condition = conditionLabels[parseInt(conditionSlider.value) || 2];
    const features = featuresTextarea.value.trim();

    if (!brand || !model || !year || !mileage) {
      alert("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }

    // Build message
    const estimate = estimateDisplay.textContent;
    const range = rangeDisplay.textContent;
    let message = `Fahrzeugbewertung anfragen:\n\n`;
    message += `Marke: ${brand}\n`;
    message += `Modell: ${model}\n`;
    message += `Erstzulassung: ${year}\n`;
    message += `Kilometerstand: ${mileage} km\n`;
    message += `Zustand: ${condition}\n`;
    if (features) {
      message += `Besondere Ausstattung: ${features}\n`;
    }
    message += `\nGeschätzter Wert: ${estimate}\n`;
    message += `Bewertungsbereich: ${range}\n`;
    message += `\nIch bitte um eine genaue Bewertung meines Fahrzeugs.`;

    // Close modal and navigate to contact form
    closeTradeInModal();
    setTimeout(() => {
      window.location.href = `#kontakt?message=${encodeURIComponent(message)}`;
    }, 300);
  });

  // Initial calculation
  updateConditionDisplay();
}

// ========================================
// VEHICLE SEARCH
// ========================================

// ========================================
// SHARED VEHICLE SEARCH SERVICE
// ========================================

// Shared vehicle search data and functions
const VehicleSearchService = {
  allVehicles: [],
  searchCache: new Map(),
  observers: [],
  
  // Initialize shared vehicle list
  init() {
    this.updateVehiclesList();
    this.setupVehicleObserver();
    
    // Retry after vehicles should be loaded (they load asynchronously)
    setTimeout(() => {
      this.updateVehiclesList();
    }, 500);

    // Additional retry after more time to ensure vehicles are loaded
    setTimeout(() => {
      this.updateVehiclesList();
    }, 2000);
  },
  
  // Update vehicles list from cached data or DOM
  updateVehiclesList() {
    // First, try to use the cached vehicle data if available
    if (allVehiclesData && allVehiclesData.length > 0) {
      this.allVehicles = allVehiclesData.map((vehicle) => ({
        id: vehicle.id,
        title: vehicle.title || "",
        price: vehicle.price || 0,
        year: vehicle.year || null,
        mileage: vehicle.mileage || null,
        image: vehicle.image || "",
        fuelType: vehicle.fuelType || "",
        transmission: vehicle.transmission || "",
        brand: (vehicle.title || "").split(" ")[0] || "",
        model: (vehicle.title || "").split(" ").slice(1).join(" ") || "",
      }));
      this.notifyObservers();
      return;
    }

    // Fallback: parse from DOM if data not available
    const vehicleCards = document.querySelectorAll(".vehicle-card");
    this.allVehicles = Array.from(vehicleCards).map((card) => {
      const id = card.getAttribute("data-vehicle-id");
      const prettitle =
        card.querySelector(".card-title")?.textContent.trim() ||
        card.querySelector("h3")?.textContent.trim() ||
        "";
      const priceText = card.querySelector(".card-price")?.textContent || "";
      const price = parseInt(priceText.replace(/[^0-9]/g, "") || "0", 10);
      const yearText = card.querySelector(".card-specs")?.textContent || "";
      const yearMatch = yearText.match(/(\d{4})/);
      const year = yearMatch ? parseInt(yearMatch[1]) : null;
      const mileageMatch = yearText.match(/(\d{1,3}(?:\.\d{3})*)\s*km/i);
      const mileage = mileageMatch
        ? parseInt(mileageMatch[1].replace(/\./g, ""), 10)
        : null;
      const image = card.querySelector("img")?.src || "";
      const fuelType =
        card.querySelector(".fuel-badge")?.textContent.trim() || "";
      const specs = Array.from(card.querySelectorAll(".badge")).map((badge) =>
        badge.textContent.trim()
      );
      const transmission =
        specs.find((s) =>
          /automatik|automatisch|schaltgetriebe|manual/i.test(s)
        ) || "";

      return {
        id,
        title: prettitle,
        price,
        year,
        mileage,
        image,
        fuelType,
        transmission,
        brand: prettitle.split(" ")[0] || "",
        model: prettitle.split(" ").slice(1).join(" ") || "",
      };
    });
    this.notifyObservers();
  },
  
  // Setup observer for vehicle list changes
  setupVehicleObserver() {
    const observer = new MutationObserver((mutations) => {
      // Skip if we're currently applying a filter (prevent infinite loops)
      if (window.isApplyingCarSectionFilter) return;
      
      this.updateVehiclesList();
    });

    // Watch vehicles page grid
    const vehiclesGrid = document.querySelector("#fahrzeuge .vehicles-grid");
    if (vehiclesGrid) {
      observer.observe(vehiclesGrid, {
        childList: true,
        subtree: true,
      });
    }
  },
  
  // Register observer callback
  onUpdate(callback) {
    this.observers.push(callback);
    if (this.allVehicles.length > 0) {
      callback(this.allVehicles);
    }
  },
  
  // Notify all observers
  notifyObservers() {
    this.observers.forEach(callback => callback(this.allVehicles));
    // Clear cache when vehicles update
    this.searchCache.clear();
  },
  
  // Perform search with caching
  search(query, limit = null) {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const cacheKey = limit ? `${searchTerm}:${limit}` : searchTerm;
    
    // Check cache
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey);
    }

    // Perform search
    const filtered = this.allVehicles.filter((vehicle) => {
      const title = (vehicle.title || "").toLowerCase();
      const brand = (vehicle.brand || "").toLowerCase();
      const model = (vehicle.model || "").toLowerCase();
      const fuelType = (vehicle.fuelType || "").toLowerCase();
      const transmission = (vehicle.transmission || "").toLowerCase();

      return (
        title.includes(searchTerm) ||
        brand.includes(searchTerm) ||
        model.includes(searchTerm) ||
        fuelType.includes(searchTerm) ||
        transmission.includes(searchTerm)
      );
    });

    // Apply limit if specified
    const result = limit ? filtered.slice(0, limit) : filtered;

    // Cache result (limit cache size)
    if (this.searchCache.size > 50) {
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }
    this.searchCache.set(cacheKey, result);

    return result;
  }
};

function initVehicleSearch() {
  // Initialize shared search service
  VehicleSearchService.init();
  
  // Initialize header search (quick search with dropdown)
  initHeaderSearch();
  
  // Initialize car section search (filter-integrated search)
  initFahrzeugeSearch();
}

function initHeaderSearch() {
  const headerSearchIcon = document.getElementById("header-search-icon");
  
  if (!headerSearchIcon) return;

  // Scroll to vehicle-filters section when icon is clicked
  headerSearchIcon.addEventListener("click", (e) => {
    e.preventDefault();
    const vehicleFilters = document.querySelector(".vehicle-filters");
    const header = document.querySelector(".header");
    
    if (vehicleFilters) {
      // Get header height to account for fixed navbar
      const headerHeight = header ? header.offsetHeight : 80;
      const vehicleFiltersRect = vehicleFilters.getBoundingClientRect();
      const scrollPosition = window.scrollY + vehicleFiltersRect.top - headerHeight - 20; // 20px extra padding
      
      // Scroll with offset to account for fixed header
      window.scrollTo({
        top: scrollPosition,
        behavior: "smooth"
      });
      
      // Focus the search input after scrolling
      const carSectionSearch = document.getElementById("vehicle-search-fahrzeuge");
      if (carSectionSearch) {
        setTimeout(() => {
          carSectionSearch.focus();
        }, 500);
      }
    }
  });
}

function initSearchModal() {
  const searchModal = document.getElementById("search-modal");
  const headerSearchToggle = document.getElementById("header-search-toggle");
  const searchModalClose = document.getElementById("search-modal-close");
  const searchModalOverlay = searchModal?.querySelector(".search-modal-overlay");
  const searchInputModal = document.getElementById("vehicle-search-modal");
  const searchResultsModal = document.getElementById("search-results-modal");
  const searchIconModal = document.getElementById("search-icon-modal");

  if (!searchModal || !headerSearchToggle) return;

  // A11y wiring - improve focus management
  const a11y = setupModalA11y(searchModal, {
    titleSelector: "#search-modal-title",
    initialFocusSelector: "#vehicle-search-modal",
  });

  // Open modal
  headerSearchToggle.addEventListener("click", () => {
    openSearchModal();
    headerSearchToggle.setAttribute("aria-expanded", "true");
  });

  // Close modal
  const closeModal = () => {
    searchModal.setAttribute("aria-hidden", "true");
    searchModal.classList.remove("active");
    headerSearchToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (searchInputModal) {
      searchInputModal.value = "";
    }
    if (searchResultsModal) {
      searchResultsModal.classList.remove("active");
    }
    a11y.close();
  };

  if (searchModalClose) {
    searchModalClose.addEventListener("click", closeModal);
  }

  if (searchModalOverlay) {
    searchModalOverlay.addEventListener("click", closeModal);
  }

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchModal.classList.contains("active")) {
      closeModal();
    }
  });

  // Initialize search functionality in modal
  if (searchInputModal && searchResultsModal) {
    setupSearchFunctionality(searchInputModal, searchResultsModal, searchIconModal, closeModal);
  }
}

function openSearchModal() {
  const searchModal = document.getElementById("search-modal");
  const searchInputModal = document.getElementById("vehicle-search-modal");
  
  if (!searchModal) return;
  
  searchModal.setAttribute("aria-hidden", "false");
  searchModal.classList.add("active");
  document.body.style.overflow = "hidden";
  
  // Use a11y.open() which handles focus management properly
  const a11y = setupModalA11y(searchModal, {
    titleSelector: "#search-modal-title",
    initialFocusSelector: "#vehicle-search-modal",
  });
  a11y.open();
}

function initFahrzeugeSearch() {
  const searchInput = document.getElementById("vehicle-search-fahrzeuge");
  const searchResults = document.getElementById("search-results-fahrzeuge");
  const searchIcon = document.getElementById("search-icon-fahrzeuge");

  if (!searchInput || !searchResults) return;

  // Car section search: Filter displayed vehicles in the grid
  setupCarSectionSearch(searchInput, searchResults, searchIcon);
}

// Shared function to close all search dropdowns
function closeAllSearchDropdowns(excludeInputId = null) {
  const headerSearchResults = document.getElementById("search-results");
  const carSectionSearchResults = document.getElementById("search-results-fahrzeuge");
  
  if (excludeInputId !== "vehicle-search" && headerSearchResults) {
    headerSearchResults.classList.remove("active");
  }
  
  if (excludeInputId !== "vehicle-search-fahrzeuge" && carSectionSearchResults) {
    carSectionSearchResults.classList.remove("active");
  }
}

// Header search: Quick search with dropdown results
function setupHeaderSearch(searchInput, searchResults, searchIcon) {
  if (!searchInput || !searchResults) return;

  let searchTimeout = null;

  // Use shared search service
  VehicleSearchService.onUpdate(() => {
    // Vehicles updated, search will use new data automatically
  });
  
  // Close other search when this one is focused
  searchInput.addEventListener("focus", () => {
    closeAllSearchDropdowns("vehicle-search");
  });

  function performSearch(query) {
    const results = VehicleSearchService.search(query, 5);
    displaySearchResults(results, true); // true = header search (dropdown)
  }

  function displaySearchResults(vehicles, isHeaderSearch = false) {
    searchResults.innerHTML = "";

    if (vehicles.length === 0) {
      searchResults.innerHTML = `
        <div class="search-no-results">
          Keine Fahrzeuge gefunden. Bitte versuchen Sie es mit anderen Suchbegriffen.
        </div>
      `;
      searchResults.classList.add("active");
      announceToScreenReader("search", "Keine Fahrzeuge gefunden. Bitte versuchen Sie es mit anderen Suchbegriffen.");
      return;
    }

    vehicles.forEach((vehicle) => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      item.innerHTML = `
        <img src="${escapeHtml(vehicle.image || "")}" alt="${escapeHtml(
        vehicle.title || ""
      )}" />
        <div class="search-result-info">
          <div class="search-result-title">${escapeHtml(
            vehicle.title || ""
          )}</div>
          <div class="search-result-details">
            ${vehicle.year || ""} • ${
        vehicle.mileage ? vehicle.mileage.toLocaleString("de-DE") : ""
      } km • ${vehicle.fuelType || ""}
          </div>
        </div>
        <div class="search-result-price">${
          vehicle.price ? "€ " + vehicle.price.toLocaleString("de-DE") : ""
        }</div>
      `;

      item.addEventListener("click", () => {
        // Scroll to vehicle section
        const vehicleSection = document.getElementById("fahrzeuge");
        if (vehicleSection) {
          vehicleSection.scrollIntoView({ behavior: "smooth" });
        }

        // Find and highlight the vehicle card
        const vehicleCard = document.querySelector(
          `[data-vehicle-id="${vehicle.id}"]`
        );
        if (vehicleCard) {
          vehicleCard.scrollIntoView({ behavior: "smooth", block: "center" });
          vehicleCard.style.animation = "none";
          setTimeout(() => {
            vehicleCard.style.animation = "pulse 0.5s ease-in-out 2";
          }, 100);
        }

        // Close search results
        searchResults.classList.remove("active");
        searchInput.value = "";
      });

      searchResults.appendChild(item);
    });

    searchResults.classList.add("active");
    announceToScreenReader("search", `${vehicles.length} Fahrzeug${vehicles.length !== 1 ? 'e' : ''} gefunden.`);
  }

  // Search input handler
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  });

  // Click search icon (only if not already handled by initHeaderSearch)
  if (searchIcon && searchInput.id !== "vehicle-search") {
    searchIcon.addEventListener("click", (e) => {
      e.preventDefault();
      performSearch(searchInput.value);
    });
  }

  // Close search results when clicking outside or on other search
  document.addEventListener("click", (e) => {
    const searchContainer = searchInput.closest(".search-container");
    const otherSearchInput = document.getElementById("vehicle-search-fahrzeuge");
    const otherSearchContainer = otherSearchInput?.closest(".search-container");
    
    // Check if clicking on the other search
    const isClickingOtherSearch = otherSearchContainer && otherSearchContainer.contains(e.target);
    
    if (
      !searchInput.contains(e.target) &&
      !searchResults.contains(e.target) &&
      (!searchIcon || !searchIcon.contains(e.target)) &&
      (!searchContainer || !searchContainer.contains(e.target))
    ) {
      searchResults.classList.remove("active");
      // On mobile and tablet portrait, also close the search input
      if (window.innerWidth <= 1024 && searchContainer && searchInput.id === "vehicle-search") {
        searchContainer.classList.remove("active");
      }
      
      // If clicking on the other search, close this one explicitly
      if (isClickingOtherSearch) {
        searchResults.classList.remove("active");
      }
    }
  });

  // Keyboard navigation
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch(searchInput.value);
    } else if (e.key === "Escape") {
      searchResults.classList.remove("active");
      searchInput.blur();
      // On mobile and tablet portrait, also close the search input
      if (window.innerWidth <= 1024) {
        const searchContainer = searchInput.closest(".search-container");
        if (searchContainer && searchInput.id === "vehicle-search") {
          searchContainer.classList.remove("active");
        }
      }
    }
  });
}

// Car section search: Filter vehicles in the grid (integrated with pagination)
function setupCarSectionSearch(searchInput, searchResults, searchIcon) {
  if (!searchInput || !searchResults) return;

  let searchTimeout = null;
  let isApplyingFilter = false; // Guard to prevent infinite loops

  // Use shared search service
  VehicleSearchService.onUpdate(() => {
    // Re-apply search if there's an active search term
    // But only if we're not already applying a filter (prevent infinite loop)
    if (carSectionSearchTerm && !isApplyingFilter) {
      applyCarSectionFilter(carSectionSearchTerm);
    }
  });
  
  // Close other search when this one is focused
  searchInput.addEventListener("focus", () => {
    closeAllSearchDropdowns("vehicle-search-fahrzeuge");
  });

  function applyCarSectionFilter(query) {
    // Prevent infinite loops
    if (isApplyingFilter) return;
    
    isApplyingFilter = true;
    window.isApplyingCarSectionFilter = true; // Global flag for MutationObserver
    carSectionSearchTerm = query;
    
    try {
      if (!query.trim() || query.length < 2) {
        // Clear search filter
        carSectionSearchTerm = "";
        searchResults.classList.remove("active");
        
        // Re-render with current filters (no search)
        const filtered = getFilteredAndSortedVehicles();
        renderVehiclesPage(filtered, 1);
        return;
      }

      // Get matching vehicles from shared service (all matches, no limit)
      const matchingVehicles = VehicleSearchService.search(query);
      
      // Re-render with search integrated into filtering pipeline
      const filtered = getFilteredAndSortedVehicles();
      renderVehiclesPage(filtered, 1);

      // Show search results dropdown with quick preview
      if (filtered.length > 0) {
        displayQuickResults(filtered.slice(0, 3)); // Show top 3 in dropdown
      } else {
        searchResults.innerHTML = `
          <div class="search-no-results">
            Keine Fahrzeuge gefunden. Bitte versuchen Sie es mit anderen Suchbegriffen.
          </div>
        `;
        searchResults.classList.add("active");
      }
    } finally {
      // Always reset the guard, even if there's an error
      setTimeout(() => {
        isApplyingFilter = false;
        window.isApplyingCarSectionFilter = false;
      }, 100);
    }
  }

  function displayQuickResults(vehicles) {
    searchResults.innerHTML = "";
    
    vehicles.forEach((vehicle) => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      item.innerHTML = `
        <img src="${escapeHtml(vehicle.image || "")}" alt="${escapeHtml(
        vehicle.title || ""
      )}" />
        <div class="search-result-info">
          <div class="search-result-title">${escapeHtml(
            vehicle.title || ""
          )}</div>
          <div class="search-result-details">
            ${vehicle.year || ""} • ${
        vehicle.mileage ? vehicle.mileage.toLocaleString("de-DE") : ""
      } km
          </div>
        </div>
        <div class="search-result-price">${
          vehicle.price ? "€ " + vehicle.price.toLocaleString("de-DE") : ""
        }</div>
      `;

      item.addEventListener("click", () => {
        const vehicleCard = document.querySelector(
          `[data-vehicle-id="${vehicle.id}"]`
        );
        if (vehicleCard) {
          vehicleCard.scrollIntoView({ behavior: "smooth", block: "center" });
          vehicleCard.style.animation = "none";
          setTimeout(() => {
            vehicleCard.style.animation = "pulse 0.5s ease-in-out 2";
          }, 100);
        }
        searchResults.classList.remove("active");
      });

      searchResults.appendChild(item);
    });

    if (vehicles.length > 0) {
      // Position the dropdown relative to the search input (for fixed positioning)
      const searchInputRect = searchInput.getBoundingClientRect();
      searchResults.style.top = `${searchInputRect.bottom + window.scrollY + 8}px`;
      searchResults.style.left = `${searchInputRect.left + window.scrollX}px`;
      searchResults.style.width = `${Math.min(searchInputRect.width, 500)}px`;
      searchResults.classList.add("active");
    }
  }

  // Function to update dropdown position (for fixed positioning)
  function updateDropdownPosition() {
    if (searchResults.classList.contains("active")) {
      const searchInputRect = searchInput.getBoundingClientRect();
      searchResults.style.top = `${searchInputRect.bottom + window.scrollY + 8}px`;
      searchResults.style.left = `${searchInputRect.left + window.scrollX}px`;
      searchResults.style.width = `${Math.min(searchInputRect.width, 500)}px`;
    }
  }

  // Search input handler
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      applyCarSectionFilter(query);
      // Update position after showing results
      setTimeout(updateDropdownPosition, 50);
    }, 300);
  });

  // Update dropdown position on scroll and resize
  window.addEventListener("scroll", updateDropdownPosition, { passive: true });
  window.addEventListener("resize", updateDropdownPosition);

  // Click search icon
  if (searchIcon) {
    searchIcon.addEventListener("click", (e) => {
      e.preventDefault();
      applyCarSectionFilter(searchInput.value);
    });
  }

  // Clear search on Escape
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      applyCarSectionFilter("");
      searchResults.classList.remove("active");
      searchInput.blur();
    }
  });

  // Close search results when clicking outside or on other search
  document.addEventListener("click", (e) => {
    const searchContainer = searchInput.closest(".search-container");
    const otherSearchInput = document.getElementById("vehicle-search");
    const otherSearchContainer = otherSearchInput?.closest(".search-container");
    
    // Check if clicking on the other search
    const isClickingOtherSearch = otherSearchContainer && otherSearchContainer.contains(e.target);
    
    if (
      !searchInput.contains(e.target) &&
      !searchResults.contains(e.target) &&
      (!searchIcon || !searchIcon.contains(e.target)) &&
      (!searchContainer || !searchContainer.contains(e.target))
    ) {
      searchResults.classList.remove("active");
      
      // If clicking on the other search, close this one explicitly
      if (isClickingOtherSearch) {
        searchResults.classList.remove("active");
      }
    }
  });
}

// Legacy function for backward compatibility (now uses shared service)
function setupSearchFunctionality(searchInput, searchResults, searchIcon, onResultClick) {
  // Route to appropriate search based on input ID
  if (searchInput.id === "vehicle-search") {
    setupHeaderSearch(searchInput, searchResults, searchIcon);
  } else if (searchInput.id === "vehicle-search-fahrzeuge") {
    setupCarSectionSearch(searchInput, searchResults, searchIcon);
  } else {
    // Modal or other search - use header search pattern
    setupHeaderSearch(searchInput, searchResults, searchIcon);
  }
}

// ========================================
// BLOG ENHANCEMENTS
// ========================================

function initBlogFeatures() {
  initBlogCategories();
  initBlogCardClicks();
}

function initBlogCategories() {
  const categoryBtns = document.querySelectorAll(".category-btn");
  const blogCards = document.querySelectorAll(".blog-card");

  if (!categoryBtns.length || !blogCards.length) return;

  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Update active state
      categoryBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const selectedCategory = btn.dataset.category;

      // Filter blog cards
      blogCards.forEach((card) => {
        const cardCategory = card.dataset.category || "";
        if (selectedCategory === "all" || cardCategory === selectedCategory) {
          card.classList.remove("filtered-out");
          card.classList.add("filtered-in");
        } else {
          card.classList.add("filtered-out");
          card.classList.remove("filtered-in");
        }
      });
    });
  });
}

function initBlogCardClicks() {
  const blogCards = document.querySelectorAll(".blog-card-clickable");

  blogCards.forEach((card) => {
    const blogUrl = card.dataset.blogUrl;
    if (!blogUrl) return;

    // Make card clickable
    card.style.cursor = "pointer";
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.setAttribute(
      "aria-label",
      `Blog-Artikel öffnen: ${
        card.querySelector(".blog-title")?.textContent || ""
      }`
    );

    // Click handler - navigate to blog post
    card.addEventListener("click", (e) => {
      // Don't navigate if clicking on buttons or links
      if (e.target.closest("button") || e.target.closest("a")) {
        return;
      }
      window.location.href = blogUrl;
    });

    // Keyboard accessibility
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.location.href = blogUrl;
      }
    });
  });
}

// ========================================
// VEHICLE FILTERING & SORTING
// ========================================

function initVehicleFilters() {
  const filterTabs = document.querySelectorAll(".filter-tab");

  // Note: Comparison functionality is now handled entirely by initComparison()
  // This function only handles vehicle filtering/sorting (if needed)

  // Remove vehicle from comparison - handled by event delegation in initComparison()
  // This handler is kept for backward compatibility but delegates to global state
  document.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".comparison-remove-btn");
    if (removeBtn) {
      const vehicleId = removeBtn.dataset.vehicleId;
      if (!vehicleId) return;

      // Update global state
      comparisonState.comparedVehicles =
        comparisonState.comparedVehicles.filter((id) => id !== vehicleId);
      localStorage.setItem(
        "comparedVehicles",
        JSON.stringify(comparisonState.comparedVehicles)
      );

      // Uncheck all checkboxes for this vehicle (card and modal)
      const cardCheckbox = document.querySelector(
        `[data-vehicle-id="${vehicleId}"] .compare-checkbox`
      );
      if (cardCheckbox) {
        cardCheckbox.checked = false;
        void cardCheckbox.offsetHeight;
        cardCheckbox.dispatchEvent(new Event("input", { bubbles: true }));
      }

      const modalCheckbox = document.querySelector(".compare-checkbox-modal");
      if (modalCheckbox) {
        const quickViewModal = document.getElementById("quick-view-modal");
        if (quickViewModal?.dataset.currentVehicleId === vehicleId) {
          modalCheckbox.checked = false;
          void modalCheckbox.offsetHeight;
          modalCheckbox.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }

      // Update compare button
      const compareCount = document.getElementById("compare-count");
      const compareFloatingBtn = document.getElementById(
        "compare-floating-btn"
      );
      if (compareCount) {
        compareCount.textContent = comparisonState.comparedVehicles.length;
        compareFloatingBtn?.classList.toggle(
          "active",
          comparisonState.comparedVehicles.length > 0
        );
      }

      // Re-render comparison table if modal is open
      const comparisonModal = document.getElementById("comparison-modal");
      if (
        comparisonModal?.classList.contains("active") &&
        window.renderComparisonTable
      ) {
        window.renderComparisonTable();
      }
    }

    // Quick view from comparison
    const quickViewBtn = e.target.closest(".quick-view-from-compare");
    if (quickViewBtn) {
      const vehicleId = quickViewBtn.dataset.vehicleId;
      const vehicleCard = document.querySelector(
        `[data-vehicle-id="${vehicleId}"]`
      );
      if (vehicleCard && window.openQuickView) {
        const comparisonModal = document.getElementById("comparison-modal");
        if (comparisonModal?.classList.contains("active")) {
          comparisonModal.classList.remove("active");
          document.body.style.overflow = "";
        }
        // Trigger quick view
        window.openQuickView(vehicleCard);
      }
    }
  });
}

// ========================================
// COOKIE CONSENT BANNER
// ========================================

function initCookieBanner() {
  const cookieBanner = document.getElementById("cookie-banner");
  const cookieAccept = document.getElementById("cookie-accept");
  const cookieReject = document.getElementById("cookie-reject");
  const cookieSettings = document.getElementById("cookie-settings");
  const cookieSettingsModal = document.getElementById("cookie-settings-modal");
  const cookieSettingsClose = document.querySelector(".cookie-settings-close");
  const cookieSettingsBackdrop = document.querySelector(
    ".cookie-settings-backdrop"
  );
  const cookieSaveSettings = document.getElementById("cookie-save-settings");
  const cookieAcceptAllSettings = document.getElementById(
    "cookie-accept-all-settings"
  );
  const cookieNecessary = document.getElementById("cookie-necessary");
  const cookieFunctional = document.getElementById("cookie-functional");
  const cookieAnalytics = document.getElementById("cookie-analytics");

  if (!cookieBanner) return;

  // Check if user has already made a choice
  const cookieConsent = localStorage.getItem("cookieConsent");

  // Hide banner initially if consent already given
  if (cookieConsent) {
    cookieBanner.style.display = "none";
    return;
  }

  // Show banner if consent not given
  cookieBanner.style.display = "block";
  setTimeout(() => {
    cookieBanner.classList.add("show");
  }, 1000);

  // Cookie consent storage
  function saveCookieConsent(necessary, functional, analytics) {
    const consent = {
      necessary: true, // Always true
      functional: functional || false,
      analytics: analytics || false,
      timestamp: Date.now(),
    };
    localStorage.setItem("cookieConsent", JSON.stringify(consent));
    
    // Integrate with Google Consent Mode v2
    if (typeof window.updateConsentMode === 'function') {
      window.updateConsentMode(necessary, functional, analytics);
    }
    
    // Load Google tag if analytics consent is granted
    if (analytics && typeof window.loadGoogleTag === 'function') {
      window.loadGoogleTag();
    }
    
    hideCookieBanner();
  }

  function hideCookieBanner() {
    cookieBanner.classList.remove("show");
    setTimeout(() => {
      cookieBanner.style.display = "none";
      cookieBanner.style.visibility = "hidden";
    }, 300);
  }

  function closeCookieSettingsModal() {
    cookieSettingsModal.classList.remove("show");
  }

  // Accept all cookies
  cookieAccept?.addEventListener("click", () => {
    saveCookieConsent(true, true, true);
  });

  // Reject all non-necessary cookies
  cookieReject?.addEventListener("click", () => {
    saveCookieConsent(true, false, false);
  });

  // Open cookie settings modal
  cookieSettings?.addEventListener("click", () => {
    cookieSettingsModal.classList.add("show");

    // Restore saved preferences
    if (cookieConsent) {
      const consent = JSON.parse(cookieConsent);
      if (cookieFunctional)
        cookieFunctional.checked = consent.functional || false;
      if (cookieAnalytics) cookieAnalytics.checked = consent.analytics || false;
    }
  });

  // Close settings modal
  cookieSettingsClose?.addEventListener("click", closeCookieSettingsModal);
  cookieSettingsBackdrop?.addEventListener("click", closeCookieSettingsModal);

  // Save settings
  cookieSaveSettings?.addEventListener("click", () => {
    const functional = cookieFunctional?.checked || false;
    const analytics = cookieAnalytics?.checked || false;
    saveCookieConsent(true, functional, analytics);
    closeCookieSettingsModal();
  });

  // Accept all from settings
  cookieAcceptAllSettings?.addEventListener("click", () => {
    if (cookieFunctional) cookieFunctional.checked = true;
    if (cookieAnalytics) cookieAnalytics.checked = true;
    saveCookieConsent(true, true, true);
    closeCookieSettingsModal();
  });

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cookieSettingsModal.classList.contains("show")) {
      closeCookieSettingsModal();
    }
  });
}

// ========================================
// VEHICLE FILTERING & SORTING
// ========================================

function initVehicleFilters() {
  const filterTabs = document.querySelectorAll(".filter-tab");
  const sortSelect = document.getElementById("sort-select");
  const vehicleCards = document.querySelectorAll(
    "#featured-vehicles .vehicle-card"
  );
  const vehicleCountEl = document.getElementById("vehicle-count");
  const featuredGrid = document.querySelector(".featured-grid");

  let currentFilter = localStorage.getItem("vehicleFilter") || "all";
  let currentSort = localStorage.getItem("vehicleSort") || "default";

  // Restore saved state
  if (currentFilter !== "all") {
    filterTabs.forEach((tab) => {
      if (tab.dataset.filter === currentFilter) {
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
      } else {
        tab.classList.remove("active");
        tab.setAttribute("aria-selected", "false");
      }
    });
  }

  if (currentSort !== "default" && sortSelect) {
    sortSelect.value = currentSort;
  }

  // Filter vehicles
  function filterVehicles(filterValue) {
    let visibleCount = 0;

    vehicleCards.forEach((card) => {
      const category = card.dataset.category || "featured";

      if (filterValue === "all" || category === filterValue) {
        card.classList.remove("filtered-out");
        visibleCount++;
      } else {
        card.classList.add("filtered-out");
      }
    });

    updateVehicleCount(visibleCount);
    currentFilter = filterValue;
    localStorage.setItem("vehicleFilter", filterValue);
  }

  // Sort vehicles
  function sortVehicles(sortValue) {
    const cardsArray = Array.from(vehicleCards);
    const visibleCards = cardsArray.filter(
      (card) => !card.classList.contains("filtered-out")
    );
    const hiddenCards = cardsArray.filter((card) =>
      card.classList.contains("filtered-out")
    );

    visibleCards.sort((a, b) => {
      switch (sortValue) {
        case "price-asc":
          return (
            parseInt(a.dataset.price || 0) - parseInt(b.dataset.price || 0)
          );
        case "price-desc":
          return (
            parseInt(b.dataset.price || 0) - parseInt(a.dataset.price || 0)
          );
        case "year-desc":
          return parseInt(b.dataset.year || 0) - parseInt(a.dataset.year || 0);
        case "year-asc":
          return parseInt(a.dataset.year || 0) - parseInt(b.dataset.year || 0);
        case "mileage-asc":
          return (
            parseInt(a.dataset.mileage || 0) - parseInt(b.dataset.mileage || 0)
          );
        case "mileage-desc":
          return (
            parseInt(b.dataset.mileage || 0) - parseInt(a.dataset.mileage || 0)
          );
        default:
          return 0;
      }
    });

    // Reorder in DOM
    const allCards = [...visibleCards, ...hiddenCards];
    allCards.forEach((card) => featuredGrid.appendChild(card));

    currentSort = sortValue;
    localStorage.setItem("vehicleSort", sortValue);
  }

  // Update vehicle count display
  function updateVehicleCount(count) {
    if (vehicleCountEl) {
      vehicleCountEl.textContent = count;
    }
  }

  // Apply filter and sort on load
  filterVehicles(currentFilter);
  if (currentSort !== "default") {
    sortVehicles(currentSort);
  }

  // Filter tab event listeners
  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Update active state
      filterTabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      // Apply filter
      const filterValue = tab.dataset.filter;
      filterVehicles(filterValue);

      // Re-sort after filtering
      if (currentSort !== "default") {
        sortVehicles(currentSort);
      }
    });
  });

  // Sort select event listener
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      const sortValue = e.target.value;
      sortVehicles(sortValue);
    });
  }
}

// ========================================
// NEWSLETTER SUBSCRIPTION
// ========================================

function initNewsletter(formIdPrefix = "") {
  const formId = formIdPrefix
    ? `${formIdPrefix}-newsletter-form`
    : "newsletter-form";
  const emailId = formIdPrefix
    ? `${formIdPrefix}-newsletter-email`
    : "newsletter-email";
  const privacyId = formIdPrefix
    ? `${formIdPrefix}-newsletter-privacy`
    : "newsletter-privacy";
  const statusId = formIdPrefix
    ? `${formIdPrefix}-newsletter-status`
    : "newsletter-status";
  const errorId = formIdPrefix
    ? `${formIdPrefix}-newsletter-error`
    : "newsletter-error";

  const newsletterForm = document.getElementById(formId);
  const newsletterEmail = document.getElementById(emailId);
  const newsletterPrivacy = document.getElementById(privacyId);
  const newsletterStatus = document.getElementById(statusId);
  const newsletterError = document.getElementById(errorId);
  const submitBtn = newsletterForm?.querySelector('button[type="submit"]');

  if (!newsletterForm || !newsletterEmail) return;

  // Real-time email validation
  newsletterEmail.addEventListener("input", () => {
    const email = newsletterEmail.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newsletterEmail.setAttribute("aria-invalid", "true");
      showFieldError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
    } else {
      newsletterEmail.setAttribute("aria-invalid", "false");
      clearFieldError();
    }
  });

  // Real-time checkbox validation
  if (newsletterPrivacy) {
    newsletterPrivacy.addEventListener("change", () => {
      if (newsletterPrivacy.checked) {
        newsletterPrivacy.removeAttribute("aria-invalid");
      }
    });
  }

  newsletterForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearFieldError();
    clearStatus();

    const email = newsletterEmail.value.trim();
    const privacyAccepted = newsletterPrivacy?.checked;

    // Validate email
    if (!email) {
      newsletterEmail.setAttribute("aria-invalid", "true");
      newsletterEmail.focus();
      showFieldError("Bitte geben Sie eine E-Mail-Adresse ein.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newsletterEmail.setAttribute("aria-invalid", "true");
      newsletterEmail.focus();
      showFieldError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return;
    }

    // Validate privacy checkbox
    if (!privacyAccepted) {
      if (newsletterPrivacy) {
        newsletterPrivacy.setAttribute("aria-invalid", "true");
        newsletterPrivacy.focus();
      }
      showFieldError("Bitte akzeptieren Sie die Datenschutzerklärung.");
      return;
    }

    // Set loading state
    setLoadingState(true);

    try {
      // Google Sheets Webhook URL - Replace with your deployed Apps Script web app URL
      const GOOGLE_SHEETS_WEBHOOK_URL =
        "https://script.google.com/macros/s/AKfycbxzPjd5RLRqZBKKTy5c940wC24_4H4ktAkK_BibsSx7rDmxYQ7bGLcUDdgd-vzF-4eQ/exec";

      // Check if webhook URL is configured
      if (
        !GOOGLE_SHEETS_WEBHOOK_URL ||
        GOOGLE_SHEETS_WEBHOOK_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")
      ) {
        console.warn(
          "Google Sheets webhook URL not configured. Please set it in scripts.js"
        );

        // Fallback to mailto if webhook not configured
        const subject = encodeURIComponent("Newsletter-Anmeldung");
        const body = encodeURIComponent(
          `Bitte tragen Sie diese E-Mail in den Newsletter ein:\n\nE-Mail: ${email}`
        );
        const email = (window.dealerConfig && window.dealerConfig.email) || 'office@cbhandel.at';
        const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;

        showStatus(
          "success",
          "Vielen Dank für Ihre Anmeldung! Ihr E-Mail-Programm wird geöffnet. Bitte senden Sie die E-Mail ab."
        );

        // Reset form
        newsletterForm.reset();
        newsletterEmail.setAttribute("aria-invalid", "false");
        if (newsletterPrivacy) {
          newsletterPrivacy.removeAttribute("aria-invalid");
        }

        // Auto-hide success message after 8 seconds
        setTimeout(() => {
          clearStatus();
        }, 8000);

        return;
      }

      // Get client IP if available
      const ip = await fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => "unknown");

      // Collect additional analytics data
      const userAgent = navigator.userAgent || "unknown";
      const referrer = document.referrer || "direct";
      const language =
        navigator.language || navigator.userLanguage || "unknown";
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
      const formSource =
        newsletterForm.id || newsletterForm.closest("section")?.id || "unknown";

      // Send to Google Sheets via webhook
      // Use URL-encoded form data to avoid CORS preflight issues
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("ip", ip);
      formData.append("timestamp", new Date().toISOString());
      formData.append("userAgent", userAgent);
      formData.append("referrer", referrer);
      formData.append("language", language);
      formData.append("timezone", timezone);
      formData.append("formSource", formSource);

      const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      // Google Apps Script returns HTML by default, we need to parse it as text first
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        // If response is not JSON, try to extract from HTML
        const jsonMatch = responseText.match(/\{.*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Invalid response format");
        }
      }

      if (result.success) {
        showStatus(
          "success",
          "Vielen Dank für Ihre Newsletter-Anmeldung! Sie erhalten in Kürze eine Bestätigungs-E-Mail."
        );

        // Reset form
        newsletterForm.reset();
        newsletterEmail.setAttribute("aria-invalid", "false");
        if (newsletterPrivacy) {
          newsletterPrivacy.removeAttribute("aria-invalid");
        }

        // Store submission
        localStorage.setItem(`newsletter_${email}`, Date.now().toString());

        // Auto-hide success message after 8 seconds
        setTimeout(() => {
          clearStatus();
        }, 8000);
      } else {
        // Check if email already exists
        if (result.error && result.error.includes("already subscribed")) {
          showStatus(
            "success",
            "Diese E-Mail-Adresse ist bereits für unseren Newsletter angemeldet."
          );
          newsletterForm.reset();
          setTimeout(() => {
            clearStatus();
          }, 5000);
        } else {
          throw new Error(result.error || "Subscription failed");
        }
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      showStatus(
        "error",
        "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch."
      );
    } finally {
      setLoadingState(false);
    }
  });

  function setLoadingState(isLoading) {
    if (!submitBtn) return;

    submitBtn.disabled = isLoading;
    submitBtn.setAttribute("aria-busy", isLoading.toString());

    if (isLoading) {
      submitBtn.classList.add("loading");
    } else {
      submitBtn.classList.remove("loading");
    }
  }

  function showFieldError(message) {
    if (newsletterError) {
      newsletterError.textContent = message;
      newsletterError.setAttribute("role", "alert");
    }
  }

  function clearFieldError() {
    if (newsletterError) {
      newsletterError.textContent = "";
      newsletterError.removeAttribute("role");
    }
  }

  function showStatus(type, message) {
    if (newsletterStatus) {
      newsletterStatus.textContent = message;
      newsletterStatus.className = `newsletter-status ${type}`;
      newsletterStatus.setAttribute(
        "role",
        type === "error" ? "alert" : "status"
      );
    }
    // Announce to screen readers
    announceToScreenReader("forms", message);
  }

  function clearStatus() {
    if (newsletterStatus) {
      newsletterStatus.textContent = "";
      newsletterStatus.className = "newsletter-status";
      newsletterStatus.removeAttribute("role");
    }
  }
}

// ========================================
// APPOINTMENT BOOKING
// ========================================

function initAppointmentBooking() {
  const appointmentModal = document.getElementById("appointment-modal");
  const appointmentTrigger = document.getElementById("appointment-trigger");
  const appointmentClose = document.querySelector(".appointment-close");
  const appointmentBackdrop = document.querySelector(".appointment-backdrop");
  const appointmentForm = document.getElementById("appointment-form");
  const appointmentStatus = document.getElementById("appointment-status");
  const appointmentCancel = document.querySelector(".appointment-cancel");
  const appointmentDate = document.getElementById("appointment-date");

  if (!appointmentModal) return;

  // A11y wiring - improve focus management
  const a11y = setupModalA11y(appointmentModal, {
    titleSelector: ".appointment-title, #appointment-title",
    initialFocusSelector: "#appointment-name, .appointment-close",
  });

  // Set minimum date to today
  if (appointmentDate) {
    const today = new Date().toISOString().split("T")[0];
    appointmentDate.min = today;
    appointmentDate.value = today;
  }

  const openModal = () => {
    appointmentModal.classList.add("active");
    document.body.style.overflow = "hidden";
    a11y.open();
  };

  const closeModal = () => {
    appointmentModal.classList.remove("active");
    document.body.style.overflow = "";
    appointmentForm.reset();
    appointmentStatus.style.display = "none";
    if (appointmentDate) {
      appointmentDate.value = new Date().toISOString().split("T")[0];
    }
    a11y.close();
  };

  // Open modal
  if (appointmentTrigger) {
    appointmentTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  }

  // Close modal
  if (appointmentClose) {
    appointmentClose.addEventListener("click", closeModal);
  }

  if (appointmentBackdrop) {
    appointmentBackdrop.addEventListener("click", (e) => {
      if (e.target === appointmentBackdrop) {
        closeModal();
      }
    });
  }

  if (appointmentCancel) {
    appointmentCancel.addEventListener("click", closeModal);
  }

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && appointmentModal.classList.contains("active")) {
      closeModal();
    }
  });

  // Form submission
  if (appointmentForm) {
    appointmentForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(appointmentForm);
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        date: formData.get("date"),
        time: formData.get("time"),
        service: formData.get("service"),
        vehicle: formData.get("vehicle") || "",
        message: formData.get("message") || "",
        type: "appointment",
      };

      // Validate required fields
      if (
        !data.name ||
        !data.email ||
        !data.phone ||
        !data.date ||
        !data.time ||
        !data.service
      ) {
        showAppointmentStatus(
          "error",
          "Bitte füllen Sie alle Pflichtfelder aus."
        );
        return;
      }

      // Show loading state
      const submitBtn = appointmentForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Wird gesendet...";

      try {
        // Temporäre Mailto-Lösung statt API-Aufruf
        const subject = encodeURIComponent(
          `Terminanfrage: ${data.name} - ${data.date} ${data.time}`
        );
        const body = encodeURIComponent(
          `Neue Terminanfrage über die Website\n\nName: ${data.name}\nE-Mail: ${
            data.email
          }\nTelefon: ${data.phone}\nDatum: ${data.date}\nUhrzeit: ${
            data.time
          }\nService/Anliegen: ${data.service}\nFahrzeug: ${
            data.vehicle || "Nicht angegeben"
          }\n\nNachricht:\n${data.message || "Keine zusätzliche Nachricht"}`
        );
        const email = (window.dealerConfig && window.dealerConfig.email) || 'office@cbhandel.at';
        const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;

        showAppointmentStatus(
          "success",
          "Ihr E-Mail-Programm wird geöffnet. Bitte senden Sie die E-Mail ab."
        );
        setTimeout(() => {
          closeModal();
        }, 2500);
      } catch (error) {
        console.error("Appointment mailto error:", error);
        showAppointmentStatus(
          "error",
          "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut."
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  function showAppointmentStatus(type, message) {
    appointmentStatus.textContent = message;
    appointmentStatus.className = `appointment-status ${type}`;
    appointmentStatus.style.display = "block";
    // Announce to screen readers
    announceToScreenReader("forms", message);
  }
}

// ========================================
// FAQ ACCORDION
// ========================================

function initFAQ() {
  const faqItems = document.querySelectorAll(".faq-item");

  if (!faqItems.length) return;

  faqItems.forEach((item, index) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (!question || !answer) return;

    // --- ARIA wiring ---
    // Ensure stable IDs
    if (!question.id) {
      question.id = `faq-question-${index + 1}`;
    }
    if (!answer.id) {
      answer.id = `faq-answer-${index + 1}`;
    }

    // Roles and relationships
    question.setAttribute("aria-controls", answer.id);
    question.setAttribute("aria-expanded", "false");
    answer.setAttribute("role", "region");
    answer.setAttribute("aria-labelledby", question.id);
    answer.setAttribute("aria-hidden", "true");

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
          const otherQuestion = otherItem.querySelector(".faq-question");
          const otherAnswer = otherItem.querySelector(".faq-answer");
          if (otherQuestion) {
            otherQuestion.setAttribute("aria-expanded", "false");
          }
          // Set max-height to 0 to close
          if (otherAnswer) {
            otherAnswer.style.maxHeight = null;
            otherAnswer.setAttribute("aria-hidden", "true");
          }
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove("active");
        question.setAttribute("aria-expanded", "false");
        answer.style.maxHeight = null;
        answer.setAttribute("aria-hidden", "true");
      } else {
        item.classList.add("active");
        question.setAttribute("aria-expanded", "true");
        // Set max-height to scrollHeight for smooth animation
        answer.style.maxHeight = answer.scrollHeight + "px";
        answer.setAttribute("aria-hidden", "false");
      }
    });

    // Update max-height on window resize
    window.addEventListener("resize", () => {
      if (item.classList.contains("active")) {
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}

// ========================================
// STICKY CTA
// ========================================

function initStickyCTA() {
  const stickyCTA = document.getElementById("sticky-cta");

  window.addEventListener(
    "scroll",
    debounce(() => {
      if (window.scrollY > 800) {
        stickyCTA.classList.add("visible");
      } else {
        stickyCTA.classList.remove("visible");
      }
    }, 100),
    { passive: true }
  );
}

// ========================================
// REDIRECT HANDLING
// ========================================

/**
 * Handle redirect parameter from old URLs (e.g., /fahrzeuge -> /?redirect=fahrzeuge)
 * Scrolls to the appropriate section based on the redirect parameter
 */
function handleRedirectParameter() {
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get("redirect");
  
  if (!redirect) return;
  
  // Map redirect values to section IDs
  const redirectMap = {
    fahrzeuge: "#fahrzeuge"
  };
  
  const targetHash = redirectMap[redirect];
  if (!targetHash) return;
  
  // Remove the redirect parameter from URL to clean it up
  urlParams.delete("redirect");
  const newUrl = window.location.pathname + (urlParams.toString() ? "?" + urlParams.toString() : "") + targetHash;
  window.history.replaceState({}, "", newUrl);
  
  // Wait for the page to be fully loaded, then scroll to the section
  setTimeout(() => {
    const targetSection = document.querySelector(targetHash);
    if (targetSection) {
      const header = document.getElementById("main-header");
      const headerHeight = header?.offsetHeight || 0;
      const targetPosition = targetSection.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: isReducedMotion() ? "auto" : "smooth",
      });
    }
  }, 100);
}

// ========================================
// SMOOTH SCROLL
// ========================================

// Track if smooth scroll has been initialized to prevent duplicate listeners
let smoothScrollInitialized = false;

function initSmoothScroll() {
  // Only initialize once to prevent duplicate event listeners
  if (smoothScrollInitialized) return;
  smoothScrollInitialized = true;

  // Use event delegation to handle all anchor links, including dynamically added ones
  document.addEventListener("click", (e) => {
    // Find the closest anchor element with href starting with #
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute("href");
    if (targetId === "#") return;

    // Handle calculator modals via hash
    if (targetId === "#financing-calculator") {
      e.preventDefault();
      // Check if the clicked link itself is a financing trigger
      if (link.classList.contains("financing-trigger")) {
        // Let the existing financing trigger handler handle it
        return;
      }
      // Otherwise, trigger financing modal via first trigger element
      const financingTrigger = document.querySelector(".financing-trigger");
      if (financingTrigger) {
        financingTrigger.click();
      }
      return;
    }

    if (targetId === "#tradein-calculator") {
      e.preventDefault();
      // Check if the clicked link itself is a trade-in trigger
      if (link.classList.contains("tradein-trigger")) {
        // Let the existing trade-in trigger handler handle it
        return;
      }
      // Otherwise, trigger trade-in modal via first trigger element
      const tradeinTrigger = document.querySelector(".tradein-trigger");
      if (tradeinTrigger) {
        tradeinTrigger.click();
      }
      return;
    }

    const targetSection = document.querySelector(targetId);
    if (!targetSection) {
      // If target section doesn't exist, don't prevent default to allow normal anchor behavior
      return;
    }

    e.preventDefault();
    e.stopPropagation(); // Prevent other handlers from interfering

    const headerHeight =
      document.getElementById("main-header")?.offsetHeight || 0;

    // Special handling for kontakt section on desktop
    let targetPosition;
    if (targetId === "#kontakt" && window.innerWidth >= 768) {
      // On desktop, scroll to show the contact form container
      const contactFormContainer = document.querySelector(
        "#kontakt .contact-form-container"
      );
      if (contactFormContainer) {
        // Use getBoundingClientRect for accurate position relative to viewport
        const containerRect = contactFormContainer.getBoundingClientRect();
        targetPosition = containerRect.top + window.scrollY - headerHeight - 20; // 20px extra offset for better visibility
      } else {
        // Fallback to section if container not found
        targetPosition = targetSection.offsetTop - headerHeight;
      }
    } else {
      targetPosition = targetSection.offsetTop - headerHeight;
    }

    // Use native smooth scroll, but respect reduced motion preference
    window.scrollTo({
      top: targetPosition,
      behavior: isReducedMotion() ? "auto" : "smooth",
    });
  });

  // Handle hash on page load
  if (window.location.hash === "#financing-calculator") {
    setTimeout(() => {
      const financingTrigger = document.querySelector(".financing-trigger");
      if (financingTrigger) {
        financingTrigger.click();
      }
    }, 100);
  }

  if (window.location.hash === "#tradein-calculator") {
    setTimeout(() => {
      const tradeinTrigger = document.querySelector(".tradein-trigger");
      if (tradeinTrigger) {
        tradeinTrigger.click();
      }
    }, 100);
  }

  // Handle hash changes
  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#financing-calculator") {
      const financingTrigger = document.querySelector(".financing-trigger");
      if (financingTrigger) {
        financingTrigger.click();
      }
    } else if (window.location.hash === "#tradein-calculator") {
      const tradeinTrigger = document.querySelector(".tradein-trigger");
      if (tradeinTrigger) {
        tradeinTrigger.click();
      }
    }
  });
}

// ========================================
// PAGE TRANSITIONS
// ========================================

function initPageTransitions() {
  // DISABLED: Content is immediately visible for better UX
  // Simple fade-in animation for sections using Intersection Observer
  const sections = document.querySelectorAll(".section");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1 }
  );

  sections.forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(50px)";
    section.style.transition = "opacity 0.8s ease, transform 0.8s ease";
    observer.observe(section);
  });
}

// ========================================
// PERFORMANCE OPTIMIZATIONS
// ========================================

// Lazy load images
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}

// Resource hints and preloads are handled in HTML <head> for better performance
// (Preloading in JS happens after DOM is ready, which is too late for critical resources)

// ========================================
// ERROR HANDLING
// ========================================

window.addEventListener("error", (e) => {
  // Only log errors from our domain, ignore iframe/external errors
  if (e.filename && e.filename.includes(window.location.hostname)) {
    console.error("Global error:", e.error);
  }
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason);
});

// Handle iframe errors gracefully
document.addEventListener("DOMContentLoaded", () => {
  const iframes = document.querySelectorAll("iframe");
  iframes.forEach((iframe) => {
    iframe.addEventListener("error", (e) => {
      console.warn("Iframe load error (non-critical):", e);
    });
  });
});

// Comprehensive console filtering for external scripts
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

// Override console methods to filter external script noise
console.error = function (...args) {
  const message = args.join(" ");
  // Suppress all external script errors
  if (
    message.includes("wp3-wcag.js") ||
    message.includes("swiper") ||
    message.includes("Cannot read properties of null") ||
    message.includes("fahrzeuge/?display=iframe") ||
    message.includes("jquery.min.js") ||
    message.includes("?display=iframe") ||
    message.includes("Uncaught TypeError")
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.log = function (...args) {
  const message = args.join(" ");
  // Suppress external script messages
  if (
    message.includes("Viewport meta tag gefixt") ||
    message.includes("Accessibility Fix") ||
    message.includes("ALT hinzugefügt") ||
    message.includes("Kein <h1> in .container.car_details") ||
    message.includes("trucks:") ||
    message.includes("cars:") ||
    message.includes("bikes:") ||
    message.includes("Search endpoint requested")
  ) {
    return;
  }
  originalConsoleLog.apply(console, args);
};

console.warn = function (...args) {
  const message = args.join(" ");
  // Suppress external script warnings
  if (
    message.includes("wp3-wcag.js") ||
    message.includes("swiper") ||
    message.includes("fahrzeuge") ||
    message.includes("iframe")
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Override global error handler to catch iframe errors
window.addEventListener("error", function (e) {
  // Suppress errors from external domains and iframes
  if (
    e.filename &&
    (e.filename.includes("wp3-wcag.js") ||
      e.filename.includes("jquery.min.js") ||
      e.filename.includes("fahrzeuge") ||
      e.filename.includes("iframe"))
  ) {
    e.preventDefault();
    return false;
  }
});

// Override unhandled promise rejections
window.addEventListener("unhandledrejection", function (e) {
  const message = e.reason?.toString() || "";
  if (
    message.includes("wp3-wcag.js") ||
    message.includes("swiper") ||
    message.includes("fahrzeuge") ||
    message.includes("iframe")
  ) {
    e.preventDefault();
    return false;
  }
});

// ========================================
// CONSOLE MESSAGE
// ========================================

console.log(
  `%c🚗 ${(window.dealerConfig && window.dealerConfig.name) || 'CB Handels GmbH'}`,
  "font-size: 20px; font-weight: bold; color: #004b8d;"
);
console.log(
  "%cWebsite built with ❤️ by LaraTech.AI",
  "font-size: 12px; color: #666;"
);
