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
    youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23 12s0-3.2-.4-4.8a2.9 2.9 0 0 0-2-2C19 4.7 12 4.7 12 4.7s-7 0-8.6.5a2.9 2.9 0 0 0-2 2C1 8.8 1 12 1 12s0 3.2.4 4.8a2.9 2.9 0 0 0 2 2c1.6.5 8.6.5 8.6.5s7 0 8.6-.5a2.9 2.9 0 0 0 2-2C23 15.2 23 12 23 12zm-13.8 3.9V8.1l6.3 3.9-6.3 3.9z"/></svg>`
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
    ["yt", "youtube"]
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
    if (key) {
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

  container.innerHTML = platforms
    .map((platform, index) => {
      const saved = normalizedMap.get(platform.key);
      const href = saved?.url || platform.defaultUrl || "#";
      const isEnabled = Boolean(href && href !== "#");
      const handle = isEnabled ? getHandle(href, platform.label) : "@configurar";

      return `
        <article class="social-tooltip-container ${isEnabled ? "" : "is-disabled"}" style="--d:${index * 0.06}s; --social-color:${platform.color}">
          <div class="social-tooltip">
            <div class="social-profile">
              <div class="social-user">
                <div class="social-img">${iconSvg[platform.key] || platform.label[0]}</div>
                <div class="social-details">
                  <div class="social-name">${platform.label}</div>
                  <div class="social-username">${handle}</div>
                </div>
              </div>
              <div class="social-about">${isEnabled ? "Conectado" : "No configurado"}</div>
            </div>
          </div>
          <div class="social-text">
            <a class="social-icon" ${isEnabled ? `href="${href}" target="_blank" rel="noopener noreferrer"` : ""}>
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
          <p><a class="download-btn" href="${href}" target="_blank" rel="noopener noreferrer">Descargar / Ver</a></p>
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
      const kind = asset.type === "texture" ? "Textura" : "Addon";
      const title = asset.title || "Recurso";
      const description = asset.description || "Sin descripcion";
      const meta = asset.preview ? "Vista previa" : "Publicado";
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
                <strong>${kind}</strong>
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
                  <a class="download-btn" href="${href}" target="_blank" rel="noopener noreferrer">Descargar / Ver</a>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function init() {
  try {
    initMenu();
    initAdminAccess();

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
    renderAssetsList("addons-list", addonsToShow);
    renderAssetsList("textures-list", texturesToShow);

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
    renderAssetsList("addons-list", DEMO_ADDONS);
    renderAssetsList("textures-list", DEMO_TEXTURES);
  }
}

init();
