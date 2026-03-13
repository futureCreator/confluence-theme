// popup.js — Theme picker UI logic

const $ = (id) => document.getElementById(id);

// ── DOM refs ─────────────────────────────────────────────
const toggleEl = $("toggleEnabled");
const sitesListEl = $("sitesList");
const btnAddSite = $("btnAddSite");
const btnAddSiteLabel = $("btnAddSiteLabel");
const themesGrid = $("themesGrid");

// ── State ─────────────────────────────────────────────────
let state = {
  enabled: true,
  themeId: "catppuccin-mocha",
  urlPatterns: [],
};

let currentTabUrl = null;

// ── Init ──────────────────────────────────────────────────
async function init() {
  // Load stored settings
  const stored = await chrome.storage.sync.get(["enabled", "themeId", "urlPatterns"]);
  state.enabled = stored.enabled ?? true;
  state.themeId = stored.themeId ?? "catppuccin-mocha";
  state.urlPatterns = stored.urlPatterns ?? [];

  // Get current tab URL
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTabUrl = tab?.url ?? null;
  } catch {
    currentTabUrl = null;
  }

  renderAll();
}

// ── Render ────────────────────────────────────────────────
function renderAll() {
  renderToggle();
  renderSites();
  renderThemes();
  updateBodyClass();
}

function renderToggle() {
  toggleEl.checked = state.enabled;
}

function updateBodyClass() {
  document.body.classList.toggle("disabled", !state.enabled);
}

function renderSites() {
  sitesListEl.innerHTML = "";

  if (state.urlPatterns.length === 0) {
    sitesListEl.innerHTML = '<div class="sites-empty">No sites added yet</div>';
  } else {
    state.urlPatterns.forEach((pattern, i) => {
      const item = document.createElement("div");
      item.className = "site-item";
      item.innerHTML = `
        <div class="site-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <span class="site-pattern" title="${escapeHtml(pattern)}">${escapeHtml(pattern)}</span>
        <button class="site-delete" data-index="${i}" title="Remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      `;
      sitesListEl.appendChild(item);
    });
  }

  // Update add-site button
  updateAddSiteButton();
}

function updateAddSiteButton() {
  if (!currentTabUrl) {
    btnAddSite.disabled = true;
    btnAddSiteLabel.textContent = "No active tab";
    return;
  }

  try {
    const url = new URL(currentTabUrl);
    if (url.protocol === "chrome:" || url.protocol === "chrome-extension:") {
      btnAddSite.disabled = true;
      btnAddSiteLabel.textContent = "Cannot add Chrome page";
      return;
    }

    const hostname = url.hostname;
    const alreadyAdded = state.urlPatterns.some(
      (p) => p === hostname || p === `*.${hostname.split(".").slice(1).join(".")}`
    );

    if (alreadyAdded) {
      btnAddSite.disabled = true;
      btnAddSiteLabel.textContent = `${hostname} already added`;
    } else {
      btnAddSite.disabled = false;
      btnAddSiteLabel.textContent = `Add ${hostname}`;
    }
  } catch {
    btnAddSite.disabled = true;
    btnAddSiteLabel.textContent = "Add current site";
  }
}

function renderThemes() {
  themesGrid.innerHTML = "";

  Object.entries(THEMES).forEach(([id, theme]) => {
    const card = document.createElement("div");
    card.className = "theme-card" + (id === state.themeId ? " selected" : "");
    card.dataset.themeId = id;
    card.setAttribute("title", theme.name);

    // Color swatch strip
    const swatchEl = document.createElement("div");
    swatchEl.className = "theme-swatch";
    theme.preview.forEach((color) => {
      const block = document.createElement("div");
      block.className = "swatch-block";
      block.style.backgroundColor = color;
      swatchEl.appendChild(block);
    });

    // Info
    const infoEl = document.createElement("div");
    infoEl.className = "theme-info";
    infoEl.innerHTML = `
      <div class="theme-name">${escapeHtml(theme.name)}</div>
      <div class="theme-badge ${theme.dark ? "dark" : "light"}">${theme.dark ? "Dark" : "Light"}</div>
    `;

    // Checkmark
    const checkEl = document.createElement("div");
    checkEl.className = "check-icon";
    checkEl.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;

    card.appendChild(swatchEl);
    card.appendChild(infoEl);
    card.appendChild(checkEl);

    card.addEventListener("click", () => {
      if (!state.enabled) return;
      selectTheme(id);
    });

    themesGrid.appendChild(card);
  });
}

// ── Actions ───────────────────────────────────────────────
function selectTheme(themeId) {
  state.themeId = themeId;
  save();

  // Update UI without full re-render (just toggle .selected)
  themesGrid.querySelectorAll(".theme-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.themeId === themeId);
  });
}

function addCurrentSite() {
  if (!currentTabUrl) return;

  try {
    const hostname = new URL(currentTabUrl).hostname;
    if (!state.urlPatterns.includes(hostname)) {
      state.urlPatterns = [...state.urlPatterns, hostname];
      save();
      renderSites();
    }
  } catch {
    // ignore
  }
}

function removeSite(index) {
  state.urlPatterns = state.urlPatterns.filter((_, i) => i !== index);
  save();
  renderSites();
}

function save() {
  chrome.storage.sync.set({
    enabled: state.enabled,
    themeId: state.themeId,
    urlPatterns: state.urlPatterns,
  });
}

// ── Event Listeners ───────────────────────────────────────
toggleEl.addEventListener("change", () => {
  state.enabled = toggleEl.checked;
  updateBodyClass();
  save();
});

btnAddSite.addEventListener("click", addCurrentSite);

sitesListEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".site-delete");
  if (!btn) return;
  const idx = parseInt(btn.dataset.index, 10);
  if (!isNaN(idx)) removeSite(idx);
});

// ── Utils ─────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Boot ──────────────────────────────────────────────────
init();
