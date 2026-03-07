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
let socialLinksCache = [];

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

function setUploadStatus(progress, message, tone = "") {
  const progressBar = document.getElementById("upload-progress-bar");
  const progressValue = document.getElementById("upload-progress-value");
  const statusText = document.getElementById("upload-status-text");

  if (progressBar) {
    progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
  }
  if (progressValue) {
    progressValue.textContent = `${Math.round(Math.max(0, Math.min(100, progress)))}%`;
  }
  if (statusText) {
    statusText.textContent = message;
    statusText.classList.remove("is-ok", "is-error");
    if (tone === "ok") {
      statusText.classList.add("is-ok");
    }
    if (tone === "error") {
      statusText.classList.add("is-error");
    }
  }
}

function setUploadProgressVisible(visible) {
  const panel = document.querySelector(".upload-progress-panel");
  if (!panel) {
    return;
  }
  panel.classList.toggle("is-visible", Boolean(visible));
}

function uploadAssetWithProgress(formData) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl("/api/assets"), true);
    let fallbackProgress = 0;
    let fallbackTimer = null;

    const stopFallback = () => {
      if (fallbackTimer) {
        window.clearInterval(fallbackTimer);
        fallbackTimer = null;
      }
    };

    xhr.upload.onloadstart = () => {
      setUploadProgressVisible(true);
      setUploadStatus(3, "Preparando subida...");
      fallbackTimer = window.setInterval(() => {
        fallbackProgress = Math.min(88, fallbackProgress + 3);
        setUploadStatus(fallbackProgress, `Subiendo... ${Math.round(fallbackProgress)}%`);
      }, 180);
    };

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }
      stopFallback();
      const percent = (event.loaded / event.total) * 100;
      setUploadStatus(percent, `Subiendo... ${Math.round(percent)}%`);
    };

    xhr.onload = () => {
      stopFallback();
      const raw = xhr.responseText || "{}";
      const body = (() => {
        try {
          return JSON.parse(raw);
        } catch {
          return {};
        }
      })();

      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadStatus(100, "Subida completada correctamente.", "ok");
        resolve(body);
        return;
      }

      const message = body.message || "No se pudo subir el recurso";
      setUploadStatus(0, message, "error");
      reject(new Error(message));
    };

    xhr.onerror = () => {
      stopFallback();
      const message = `Error de red al subir el recurso (API: ${apiUrl("/api/assets")})`;
      setUploadStatus(0, message, "error");
      reject(new Error(message));
    };

    xhr.onabort = () => {
      stopFallback();
      const message = "Subida cancelada";
      setUploadStatus(0, message, "error");
      reject(new Error(message));
    };

    xhr.send(formData);
  });
}

async function checkBackendOnline() {
  try {
    const res = await fetch(apiUrl("/health"), { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
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
  socialLinksCache = links;
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
          <button data-edit-social="${link._id}">Editar</button>
          <button class="secondary" data-delete-social="${link._id}">Eliminar</button>
        </div>
      </article>
    `
    )
    .join("");
}

function resetSocialForm() {
  const form = document.getElementById("social-form");
  const submitBtn = document.getElementById("social-submit-btn");
  const cancelBtn = document.getElementById("social-cancel-btn");
  if (!form) {
    return;
  }

  form.reset();
  if (form.socialId) {
    form.socialId.value = "";
  }
  if (submitBtn) {
    submitBtn.textContent = "Guardar red social";
  }
  if (cancelBtn) {
    cancelBtn.hidden = true;
  }
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
  const socialId = form.socialId?.value?.trim();

  if (socialId) {
    await fetchJSON(apiUrl(`/api/social-links/${socialId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } else {
    await fetchJSON(apiUrl("/api/social-links"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  resetSocialForm();
  await loadSocialLinks();
});

document.getElementById("social-cancel-btn").addEventListener("click", () => {
  resetSocialForm();
});

function bindUploadPreview(inputId, labelId, emptyText) {
  const input = document.getElementById(inputId);
  const label = document.getElementById(labelId);
  if (!input || !label) {
    return;
  }

  input.addEventListener("change", () => {
    const fileName = input.files && input.files[0] ? input.files[0].name : emptyText;
    label.textContent = fileName;
    if (inputId === "file") {
      setUploadProgressVisible(Boolean(input.files && input.files.length));
      if (input.files && input.files.length) {
        setUploadStatus(0, "Archivo seleccionado. Listo para subir.");
      } else {
        setUploadStatus(0, "Esperando archivo para subir.");
      }
    }
  });
}

document.getElementById("asset-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.currentTarget;
  const data = new FormData(form);
  const backendOnline = await checkBackendOnline();
  if (!backendOnline) {
    setUploadProgressVisible(true);
    const fallbackUrl = apiUrl("/") || "http://localhost:5000/";
    setUploadStatus(
      0,
      `Backend no disponible. Inicia el servidor en ${fallbackUrl.replace(/\/$/, "")}`,
      "error"
    );
    return;
  }

  setUploadStatus(0, "Iniciando subida...");
  try {
    await uploadAssetWithProgress(data);
    form.reset();
    const fileName = document.getElementById("file-name");
    const imageName = document.getElementById("image-name");
    if (fileName) {
      fileName.textContent = "Ningun archivo seleccionado";
    }
    if (imageName) {
      imageName.textContent = "Sin imagen seleccionada";
    }
    setUploadProgressVisible(false);
    setUploadStatus(0, "Esperando archivo para subir.");
    await loadAssets();
  } catch (error) {
    console.error(error);
  }
});

document.addEventListener("click", async (e) => {
  const editSocialId = e.target.getAttribute("data-edit-social");
  const socialId = e.target.getAttribute("data-delete-social");
  const assetId = e.target.getAttribute("data-delete-asset");

  if (editSocialId) {
    const form = document.getElementById("social-form");
    const submitBtn = document.getElementById("social-submit-btn");
    const cancelBtn = document.getElementById("social-cancel-btn");
    const link = socialLinksCache.find((item) => String(item._id) === String(editSocialId));
    if (form && link) {
      form.socialId.value = link._id;
      form.platform.value = link.platform || "";
      form.url.value = link.url || "";
      form.icon.value = link.icon || "";
      if (submitBtn) {
        submitBtn.textContent = "Actualizar red social";
      }
      if (cancelBtn) {
        cancelBtn.hidden = false;
      }
      form.platform.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }

  if (socialId) {
    await fetchJSON(apiUrl(`/api/social-links/${socialId}`), { method: "DELETE" });
    resetSocialForm();
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
    bindUploadPreview("file", "file-name", "Ningun archivo seleccionado");
    bindUploadPreview("image", "image-name", "Sin imagen seleccionada");
    setUploadProgressVisible(false);
    setUploadStatus(0, "Esperando archivo para subir.");
  } catch (err) {
    console.error(err);
    alert(`${err.message}. Verifica que el backend este corriendo en http://localhost:5000`);
  }
<<<<<<< HEAD
})();
=======
})();
>>>>>>> ba407b455010e21d62781ca2e701cf7ad61a8cf1
