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

async function fetchJSON(url, options = {}) {
  const hasBody = options.body && !(options.body instanceof FormData);
  const headers = new Headers(options.headers || {});

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  options.headers = headers;

  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.message || "Error de red");
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

async function ensureAdminAccess() {
  const alreadyGranted = sessionStorage.getItem(ADMIN_ACCESS_KEY) === "1";
  if (alreadyGranted) {
    return true;
  }

  const value = window.prompt("Ingresa la contrasena del panel admin:");
  if (value === null) {
    window.location.href = "./index.html";
    return false;
  }

  if (value.trim() !== ADMIN_PANEL_PASSWORD) {
    alert("Contrasena incorrecta.");
    window.location.href = "./index.html";
    return false;
  }

  sessionStorage.setItem(ADMIN_ACCESS_KEY, "1");
  return true;
}

async function loadSocialLinks() {
  const links = await fetchJSON(apiUrl("/api/social-links"));
  const container = document.getElementById("admin-social-list");

  if (!links.length) {
    container.innerHTML = '<div class="empty">No hay redes cargadas.</div>';
    return;
  }

  container.innerHTML = links
    .map(
      (link, index) => `
      <article class="item" style="--d:${index * 0.05}s">
        <p><strong>${link.platform}</strong></p>
        <p><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.url}</a></p>
        <div class="actions">
          <button class="secondary" data-delete-social="${link._id}">Eliminar</button>
        </div>
      </article>
    `
    )
    .join("");
}

async function loadAssets() {
  const assets = await fetchJSON(apiUrl("/api/assets"));
  const container = document.getElementById("admin-assets-list");

  if (!assets.length) {
    container.innerHTML = '<div class="empty">No hay recursos cargados.</div>';
    return;
  }

  container.innerHTML = assets
    .map((asset, index) => {
      const href = assetUrl(asset.filePath || asset.externalUrl);
      return `
      <article class="item" style="--d:${index * 0.05}s">
        <p><strong>${asset.title}</strong> (${asset.type})</p>
        <p>${asset.description || "Sin descripcion"}</p>
        <p><a href="${href}" target="_blank" rel="noopener noreferrer">Abrir</a></p>
        <div class="actions">
          <button class="secondary" data-delete-asset="${asset._id}">Eliminar</button>
        </div>
      </article>
    `;
    })
    .join("");
}

document.getElementById("social-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.currentTarget;
  const payload = {
    platform: form.platform.value.trim(),
    url: form.url.value.trim(),
    icon: form.icon.value.trim()
  };

  await fetchJSON(apiUrl("/api/social-links"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  form.reset();
  await loadSocialLinks();
});

document.getElementById("asset-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.currentTarget;
  const data = new FormData(form);

  await fetchJSON(apiUrl("/api/assets"), {
    method: "POST",
    body: data
  });

  form.reset();
  await loadAssets();
});

document.addEventListener("click", async (e) => {
  const socialId = e.target.getAttribute("data-delete-social");
  const assetId = e.target.getAttribute("data-delete-asset");

  if (socialId) {
    await fetchJSON(apiUrl(`/api/social-links/${socialId}`), { method: "DELETE" });
    await loadSocialLinks();
  }

  if (assetId) {
    await fetchJSON(apiUrl(`/api/assets/${assetId}`), { method: "DELETE" });
    await loadAssets();
  }
});

(async function init() {
  try {
    const ok = await ensureAdminAccess();
    if (!ok) {
      return;
    }

    await Promise.all([loadSocialLinks(), loadAssets()]);
  } catch (err) {
    console.error(err);
    alert(`${err.message}. Verifica que el backend este corriendo en http://localhost:5000`);
  }
})();
