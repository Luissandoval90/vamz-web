function resolveApiBase() {
  const { protocol, hostname, port } = window.location;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";

  if (protocol === "file:") {
    return "http://localhost:5000";
  }

  if (isLocalHost && port && port !== "5000") {
    return "http://localhost:5000";
  }

  return "";
}

const API_BASE = resolveApiBase();
const ADMIN_PANEL_PASSWORD = "vamz-902050";
const ADMIN_ACCESS_KEY = "admin_access_granted";
let resourcesState = {
  addons: [],
  textures: [],
  searchTerm: ""
};

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

function assetUrl(path) {
  if (!path) {
    return "#";
  }

  if (path.startsWith("/")) {
    return `${API_BASE}${path}`;
  }

  return path;
}

function isImageFile(path) {
  if (!path) {
    return false;
  }

  return /\.(png|jpe?g|webp|gif|avif|bmp|svg)$/i.test(path);
}

const DEMO_ADDONS = [
  {
    title: "Addon UI Enhancer",
    description: "Mejora visual de interfaz con widgets ligeros.",
    externalUrl: "#",
    preview: true
  },
  {
    title: "Addon Combat FX",
    description: "Efectos de combate con animaciones mas cinematograficas.",
    externalUrl: "#",
    preview: true
  },
  {
    title: "Addon Survival Plus",
    description: "Ajustes de supervivencia y loot balanceado.",
    externalUrl: "#",
    preview: true
  },
  {
    title: "Addon Builder Toolkit",
    description: "Herramientas extra para construccion rapida.",
    externalUrl: "#",
    preview: true
  },
  {
    title: "Addon RPG Skills",
    description: "Sistema de habilidades con progresion por niveles.",
    externalUrl: "#",
    preview: true
  },
  {
    title: "Addon Biome Expansion",
    description: "Nuevos biomas, mobs y eventos de exploracion.",
    externalUrl: "#",
    preview: true
  }
];

const DEMO_TEXTURES = [
  {
    title: "Texture Pack Aurora",
    description: "Texturas limpias con tonos frios y detalle medio.",
    externalUrl: "#",
    preview: true
  },
  {
    title: "Texture Pack Ember",
    description: "Estilo calido con contraste alto para entornos oscuros.",
    externalUrl: "#",
    preview: true
  },
  {
    title: "Texture Pack Minimal Pro",
    description: "Version minimalista para mejor rendimiento.",
    externalUrl: "#",
    preview: true
  },
  {
    title: "Texture Pack Medieval HD",
    description: "Estilo medieval con piedras y madera detalladas.",
    externalUrl: "#",
    preview: true
  },
  {
    title: "Texture Pack Neon Night",
    description: "Paleta vibrante para mapas urbanos y futuristas.",
    externalUrl: "#",
    preview: true
  },
  {
    title: "Texture Pack RealCraft Lite",
    description: "Texturas realistas optimizadas para FPS estable.",
    externalUrl: "#",
    preview: true
  }
];

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Error de red");
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

function setView(view) {
  const isResources = view === "recursos";
  const principal = document.getElementById("view-principal");
  const resources = document.getElementById("view-recursos");
  const menuButtons = document.querySelectorAll(".menu-btn");

  if (!principal || !resources) {
    return;
  }

  principal.classList.toggle("active-view", !isResources);
  resources.classList.toggle("active-view", isResources);

  menuButtons.forEach((btn) => {
    const isActive = btn.getAttribute("data-view") === view;
    btn.classList.toggle("active", isActive);
  });

  try {
    history.replaceState(null, "", isResources ? "#recursos" : "#principal");
  } catch (error) {
    // Ignorar en navegadores/entornos que bloquean replaceState.
  }
}

function initMenu() {
  const menuButtons = document.querySelectorAll(".menu-btn");
  const resourcesTrigger = document.querySelector("[data-go-resources]");
  const defaultView = window.location.hash === "#recursos" ? "recursos" : "principal";

  setView(defaultView);

  menuButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setView(btn.getAttribute("data-view"));
    });
  });

  if (resourcesTrigger) {
    resourcesTrigger.addEventListener("click", () => {
      setView("recursos");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

function initAdminAccess() {
  const adminLink = document.querySelector(".menu-admin");
  if (!adminLink) {
    return;
  }

  adminLink.addEventListener("click", (event) => {
    event.preventDefault();

    const password = window.prompt("Ingresa la contrasena del panel admin:");
    if (password === null) {
      return;
    }

    if (password.trim() !== ADMIN_PANEL_PASSWORD) {
      alert("Contrasena incorrecta");
      return;
    }

    sessionStorage.setItem(ADMIN_ACCESS_KEY, "1");
    window.location.href = adminLink.getAttribute("href") || "./admin.html";
  });
}

function renderSocial(links) {
  const container = document.getElementById("social-list");
  if (!container) {
    return;
  }

  const iconSvg = {
    twitch: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 3 2 7v14h5v3l3-3h4l8-8V3H4zm16 9-4 4h-4l-3 3v-3H5V5h15v7zm-9-5h2v6h-2V7zm5 0h2v6h-2V7z"/></svg>`,
    discord: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.3 4.37A19.8 19.8 0 0 0 15.4 3c-.21.38-.46.9-.63 1.31a18.4 18.4 0 0 0-5.54 0A13 13 0 0 0 8.6 3a19.73 19.73 0 0 0-4.9 1.37C.58 8.97-.27 13.45.16 17.86A19.93 19.93 0 0 0 6.13 21c.48-.65.9-1.34 1.27-2.06-.7-.26-1.37-.58-2-.95.17-.12.34-.25.5-.38 3.86 1.81 8.05 1.81 11.86 0 .17.14.34.27.5.38-.63.37-1.3.69-2 .95.37.72.8 1.41 1.28 2.06a19.87 19.87 0 0 0 5.96-3.14c.5-5.1-.85-9.54-3.2-13.49zM8.75 15.16c-1.16 0-2.1-1.06-2.1-2.36s.93-2.36 2.1-2.36 2.12 1.06 2.1 2.36c0 1.3-.93 2.36-2.1 2.36zm6.5 0c-1.16 0-2.1-1.06-2.1-2.36s.93-2.36 2.1-2.36 2.12 1.06 2.1 2.36c0 1.3-.93 2.36-2.1 2.36z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm0 1.9A3.9 3.9 0 0 0 3.9 7.8v8.4a3.9 3.9 0 0 0 3.9 3.9h8.4a3.9 3.9 0 0 0 3.9-3.9V7.8a3.9 3.9 0 0 0-3.9-3.9H7.8zm8.9 1.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.9a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2z"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.6 8.2a6.5 6.5 0 0 1-3.8-1.2v5.5a5.8 5.8 0 1 1-5.8-5.8c.3 0 .7 0 1 .1v2.9a3 3 0 1 0 2 2.8V2h2.8c.2 1.7 1.5 3.1 3.2 3.4v2.8z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23 12s0-3.2-.4-4.8a2.9 2.9 0 0 0-2-2C19 4.7 12 4.7 12 4.7s-7 0-8.6.5a2.9 2.9 0 0 0-2 2C1 8.8 1 12 1 12s0 3.2.4 4.8a2.9 2.9 0 0 0 2 2c1.6.5 8.6.5 8.6.5s7 0 8.6-.5a2.9 2.9 0 0 0 2-2C23 15.2 23 12 23 12zm-13.8 3.9V8.1l6.3 3.9-6.3 3.9z"/></svg>`,
    x: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.24 2H21l-6.55 7.49L22 22h-5.93l-4.65-6.09L6.1 22H3.34l7-8-7.2-12h6.08l4.2 5.55L18.24 2zm-2.08 18h1.64L8.3 3.9H6.56L16.16 20z"/></svg>`,
    paypal: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.6 3h7.04c3.34 0 5.3 1.86 4.8 4.93-.54 3.31-2.96 5.02-6.4 5.02H10.4l-.78 4.9H5.7L7.6 3zm2.2 2.2-.7 5.45h2.3c2.18 0 3.45-.88 3.78-2.88.28-1.75-.72-2.57-2.66-2.57H9.8z"/><path fill="currentColor" d="M9.62 17.85h3.57c3.18 0 5.2-1.3 5.74-4.4.06-.33.1-.67.12-1.03-.92.6-2.1.9-3.52.9H11.1l-1.48 8.68h3.05l.95-4.15z" opacity=".8"/></svg>`,
    kick: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 3h6v5h2V3h3v5h2V3h5v6h-2v2h2v3h-2v2h2v5h-5v-5h-2v5h-3v-5H9v5H3V3zm6 8H7v2h2v-2zm8 0h-2v2h2v-2z"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H8v3h2.4v8h3.1z"/></svg>`,
    telegram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m21.4 4.6-3 14.3c-.22 1.01-.81 1.26-1.64.78l-4.54-3.35-2.2 2.12c-.24.24-.45.45-.9.45l.33-4.7 8.55-7.73c.37-.33-.08-.52-.58-.18L6.86 12.8 2.32 11.4c-.99-.31-1-1-.2-1.3L20 3.2c.83-.31 1.55.2 1.28 1.4z"/></svg>`,
    github: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.3 9.41 7.88 10.94.58.11.79-.25.79-.56v-2.2c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.71.08-.71 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.75.4-1.25.72-1.54-2.56-.29-5.26-1.28-5.26-5.72 0-1.27.45-2.31 1.18-3.13-.12-.29-.51-1.47.11-3.07 0 0 .96-.31 3.15 1.2a10.9 10.9 0 0 1 5.74 0c2.19-1.51 3.15-1.2 3.15-1.2.62 1.6.23 2.78.11 3.07.73.82 1.18 1.86 1.18 3.13 0 4.45-2.7 5.42-5.27 5.71.41.35.77 1.05.77 2.12v3.15c0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12C23.5 5.66 18.35.5 12 .5z"/></svg>`
  };

  const platforms = [
    {
      key: "twitch",
      label: "Twitch",
      color: "#9146ff",
      defaultUrl: "https://www.twitch.tv/vamztwitch"
    },
    {
      key: "discord",
      label: "Discord",
      color: "#5865f2",
      defaultUrl: "https://discord.gg/6Vk9jUPy"
    },
    {
      key: "instagram",
      label: "Instagram",
      color: "#e1306c",
      defaultUrl: "https://www.instagram.com/vaaaamz/"
    },
    {
      key: "tiktok",
      label: "TikTok",
      color: "#25f4ee",
      defaultUrl: "https://www.tiktok.com/@vaaaamz"
    },
    {
      key: "youtube",
      label: "YouTube",
      color: "#ff0000",
      defaultUrl: "https://www.youtube.com/@vamz2660"
    },
    {
      key: "x",
      label: "X",
      color: "#111111",
      defaultUrl: "#"
    },
    {
      key: "paypal",
      label: "PayPal",
      color: "#0070ba",
      defaultUrl: "#"
    },
    {
      key: "kick",
      label: "Kick",
      color: "#53fc18",
      defaultUrl: "#"
    },
    {
      key: "facebook",
      label: "Facebook",
      color: "#1877f2",
      defaultUrl: "#"
    },
    {
      key: "telegram",
      label: "Telegram",
      color: "#2aabee",
      defaultUrl: "#"
    },
    {
      key: "github",
      label: "GitHub",
      color: "#333333",
      defaultUrl: "#"
    }
  ];

  const platformAliases = new Map([
    ["twitch", "twitch"],
    ["tw", "twitch"],
    ["discord", "discord"],
    ["dc", "discord"],
    ["instagram", "instagram"],
    ["insta", "instagram"],
    ["ig", "instagram"],
    ["tiktok", "tiktok"],
    ["tik tok", "tiktok"],
    ["tt", "tiktok"],
    ["youtube", "youtube"],
    ["yt", "youtube"],
    ["x", "x"],
    ["twitter", "x"],
    ["x.com", "x"],
    ["paypal", "paypal"],
    ["pay pal", "paypal"],
    ["kick", "kick"],
    ["kick.com", "kick"],
    ["facebook", "facebook"],
    ["fb", "facebook"],
    ["telegram", "telegram"],
    ["tg", "telegram"],
    ["github", "github"],
    ["gh", "github"]
  ]);

  const normalizePlatform = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) {
      return "";
    }
    return platformAliases.get(raw) || raw.replace(/\s+/g, "");
  };

  const normalizedMap = new Map();
  links.forEach((link) => {
    const key = normalizePlatform(link.platform);
    if (key && link?.url) {
      normalizedMap.set(key, link);
    }
  });

  const getHandle = (url, fallback) => {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname.replace(/^\/+/, "");
      if (!path) {
        return `@${fallback.toLowerCase()}`;
      }
      return `@${path.split("/")[0]}`;
    } catch {
      return `@${fallback.toLowerCase()}`;
    }
  };

  const knownPlatformKeys = new Set(platforms.map((platform) => platform.key));
  const knownConfigured = platforms
    .filter((platform) => normalizedMap.has(platform.key))
    .map((platform) => ({
      key: platform.key,
      label: platform.label,
      color: platform.color,
      href: normalizedMap.get(platform.key).url
    }));

  const customConfigured = links
    .map((link) => {
      const key = normalizePlatform(link.platform);
      return {
        key,
        label: link.platform || "Plataforma",
        color: "#8b8f99",
        href: link.url
      };
    })
    .filter((platform) => platform.key && platform.href && !knownPlatformKeys.has(platform.key));

  const visiblePlatforms = [...knownConfigured, ...customConfigured];

  if (!visiblePlatforms.length) {
    container.innerHTML = '<div class="empty">No hay redes configuradas todavia.</div>';
    return;
  }

  container.innerHTML = visiblePlatforms
    .map((platform, index) => {
      const handle = getHandle(platform.href, platform.label);

      return `
        <article class="social-tooltip-container" style="--d:${index * 0.06}s; --social-color:${platform.color}">
          <div class="social-tooltip">
            <div class="social-profile">
              <div class="social-user">
                <div class="social-img">${iconSvg[platform.key] || platform.label[0]}</div>
                <div class="social-details">
                  <div class="social-name">${platform.label}</div>
                  <div class="social-username">${handle}</div>
                </div>
              </div>
              <div class="social-about">Conectado</div>
            </div>
          </div>
          <div class="social-text">
            <a class="social-icon" href="${platform.href}" target="_blank" rel="noopener noreferrer">
              <div class="social-layer">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span class="social-layer-main">${iconSvg[platform.key] || platform.label[0]}</span>
              </div>
              <div class="social-label">${platform.label}</div>
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAssetsCarousel(containerId, assets, reverse = false) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  if (!assets.length) {
    container.innerHTML = '<div class="empty">No hay elementos disponibles.</div>';
    return;
  }

  const loopItems = [...assets, ...assets];
  const cards = loopItems
    .map((asset) => {
      const href = assetUrl(asset.filePath || asset.externalUrl);
      const cover = assetUrl(asset.imagePath || asset.filePath || asset.externalUrl);
      const showCover = isImageFile(cover);
      const isPreview = Boolean(asset.preview);
      const tooltip = isPreview ? "Vista previa" : "Descargar";
      return `
        <article class="carousel-item">
          ${
            showCover
              ? `<img class="carousel-cover" src="${cover}" alt="${asset.title || "Recurso"}" loading="lazy" />`
              : ""
          }
          ${asset.preview ? '<span class="demo-chip">Demo</span>' : ""}
          <p><strong>${asset.title}</strong></p>
          <p>${asset.description || "Sin descripcion"}</p>
          <p>
            <a class="download-btn uiverse-download" href="${href}" target="_blank" rel="noopener noreferrer" data-tooltip="${tooltip}">
              <span class="uiverse-download-wrapper">
                <span class="uiverse-download-text">Descargar</span>
                <span class="uiverse-download-icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path>
                  </svg>
                </span>
              </span>
            </a>
          </p>
        </article>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="carousel-track ${reverse ? "reverse" : ""}">
      ${cards}
    </div>
  `;
}

function renderAssetsList(containerId, assets) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  if (!assets.length) {
    container.innerHTML = '<div class="empty">No hay elementos disponibles.</div>';
    return;
  }

  container.innerHTML = assets
    .map((asset, index) => {
      const href = assetUrl(asset.filePath || asset.externalUrl);
      const cover = assetUrl(asset.imagePath || asset.filePath || asset.externalUrl);
      const fallbackKind = containerId.includes("texture") ? "Textura" : "Addon";
      const kind = asset.type === "texture" ? "Textura" : asset.type === "addon" ? "Addon" : fallbackKind;
      const title = asset.title || "Recurso";
      const description = asset.description || "Sin descripcion";
      const meta = asset.preview ? "Vista previa" : "Publicado";
      const tooltip = asset.preview ? "Vista previa" : "Descargar";
      const showImage = isImageFile(cover);
      return `
        <article class="resource-flip-card" style="--d:${index * 0.05}s">
          <div class="resource-flip-content">
            <div class="resource-flip-back">
              <div class="resource-flip-back-content">
                <svg viewBox="0 0 24 24" fill="none" width="44" height="44" aria-hidden="true">
                  <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M8.5 11.5l2 2 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <strong class="resource-back-title">${title}</strong>
                <small class="resource-back-kind">${kind}</small>
              </div>
            </div>
            <div class="resource-flip-front">
              ${
                showImage
                  ? `<img class="resource-cover" src="${cover}" alt="${title}" loading="lazy" />`
                  : `<div class="resource-flip-glow">
                      <div class="resource-circle"></div>
                      <div class="resource-circle resource-circle-right"></div>
                      <div class="resource-circle resource-circle-bottom"></div>
                    </div>`
              }
              <div class="resource-flip-front-content">
                <small class="resource-badge">${asset.preview ? "Demo" : kind}</small>
                <div class="resource-description">
                  <div class="resource-title-row">
                    <p class="resource-title"><strong>${title}</strong></p>
                  </div>
                  <p class="resource-copy">${description}</p>
                  <p class="resource-meta">${meta}</p>
                  <a class="download-btn uiverse-download" href="${href}" target="_blank" rel="noopener noreferrer" data-tooltip="${tooltip}">
                    <span class="uiverse-download-wrapper">
                      <span class="uiverse-download-text">Descargar</span>
                      <span class="uiverse-download-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 24 24">
                          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path>
                        </svg>
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function normalizeForSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function filterAssetsByTerm(assets, term) {
  if (!term) {
    return assets;
  }

  return assets.filter((asset) => {
    const haystack = normalizeForSearch(
      `${asset.title || ""} ${asset.description || ""} ${asset.type || ""}`
    );
    return haystack.includes(term);
  });
}

function renderFilteredResources() {
  const term = normalizeForSearch(resourcesState.searchTerm);
  const addons = filterAssetsByTerm(resourcesState.addons, term);
  const textures = filterAssetsByTerm(resourcesState.textures, term);
  renderAssetsList("addons-list", addons);
  renderAssetsList("textures-list", textures);
}

function initResourceSearch() {
  const input = document.getElementById("resource-search");
  if (!input) {
    return;
  }

  input.addEventListener("input", (event) => {
    resourcesState.searchTerm = event.target.value || "";
    renderFilteredResources();
  });
}

async function init() {
  try {
    initMenu();
    initAdminAccess();
    initResourceSearch();

    const [socialRes, addonsRes, texturesRes] = await Promise.allSettled([
      fetchJSON(apiUrl("/api/social-links")),
      fetchJSON(apiUrl("/api/assets?type=addon")),
      fetchJSON(apiUrl("/api/assets?type=texture"))
    ]);

    const socialLinks = socialRes.status === "fulfilled" ? socialRes.value : [];
    const addons = addonsRes.status === "fulfilled" ? addonsRes.value : [];
    const textures = texturesRes.status === "fulfilled" ? texturesRes.value : [];

    const addonsToShow = addons.length ? addons : DEMO_ADDONS;
    const texturesToShow = textures.length ? textures : DEMO_TEXTURES;

    renderSocial(socialLinks);
    renderAssetsCarousel("addons-carousel", addonsToShow, false);
    renderAssetsCarousel("textures-carousel", texturesToShow, true);
    resourcesState.addons = addonsToShow;
    resourcesState.textures = texturesToShow;
    renderFilteredResources();

    if (
      socialRes.status === "rejected" ||
      addonsRes.status === "rejected" ||
      texturesRes.status === "rejected"
    ) {
      console.warn("API no disponible. Mostrando datos de vista previa en recursos.");
    }
  } catch (error) {
    console.error("Error en init:", error);
    renderSocial([]);
    renderAssetsCarousel("addons-carousel", DEMO_ADDONS, false);
    renderAssetsCarousel("textures-carousel", DEMO_TEXTURES, true);
    resourcesState.addons = DEMO_ADDONS;
    resourcesState.textures = DEMO_TEXTURES;
    renderFilteredResources();
  }
}

init();
