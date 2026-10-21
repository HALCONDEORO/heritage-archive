// Pure rendering helpers (no file I/O) so they can be unit tested.
export const fold = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// Image paths must be plain relative paths inside the site (no scheme, no "..", no leading slash).
export const safeImage = (p) => (/^[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/.test(String(p ?? "")) && !String(p).split("/").includes("..") ? String(p) : "");
export const safeId = (id) => String(id).replace(/[^A-Za-z0-9._-]/g, "_");

const CONF = { alta: "reliable reading", media: "check reading", baja: "doubtful reading" };

export function recordPage(r, site) {
  const img = safeImage(r.imagen);
  const full = `${r.nombre} ${r.apellidos}`.trim();
  const meta = [r.relacion, r.edad != null ? `${r.edad} years` : "", r.estado, r.profesion].filter(Boolean).map(esc).join(" · ");
  return `<!doctype html>
<html lang="${esc(site.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)} - ${esc(site.title)}</title>
<link rel="stylesheet" href="../style.css">
</head>
<body>
<main data-pagefind-body>
  <p data-pagefind-ignore><a href="../index.html">&larr; ${esc(site.title)}</a></p>
  <h1 data-pagefind-meta="title">${esc(full)}</h1>
  <p class="meta">${meta}</p>
  <p class="meta">${esc(r.residencia ?? "")}${r.parroquia ? ", " + esc(r.parroquia) : ""}${r.municipio ? ", " + esc(r.municipio) : ""} · ${esc(r.anio)} · household ${esc(r.hogar)} · page ${esc(r.pagina)}</p>
  <p><span class="tag ${esc(r.confianza)}" data-pagefind-filter="reading">${esc(CONF[r.confianza] ?? r.confianza)}</span>${r.revisado ? ' <span class="tag alta">reviewed</span>' : ' <span class="tag media">not reviewed</span>'}</p>
  <p class="fuente">Source: ${esc(r.fuente)}</p>
  <div data-pagefind-ignore>
    <p><a class="doc" href="../${esc(img)}" target="_blank" rel="noopener">Open the original page (${esc(r.pagina)}) in a new tab</a></p>
    <div id="viewer" role="img" aria-label="Zoomable scan of the original page ${esc(r.pagina)}" data-src="../${esc(img)}"></div>
    <p class="meta">Scroll or use the buttons to zoom, drag to move.</p>
  </div>
  <span hidden data-pagefind-filter="municipio">${esc(r.municipio)}</span>
  <span hidden data-pagefind-filter="year">${esc(r.anio)}</span>
</main>
<script src="../vendor/openseadragon/openseadragon.min.js"></script>
<script src="../viewer.js"></script>
</body>
</html>
`;
}

export function indexPage(site, count) {
  return `<!doctype html>
<html lang="${esc(site.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.title)}</title>
<link rel="stylesheet" href="style.css">
<link href="pagefind/pagefind-component-ui.css" rel="stylesheet">
<script src="pagefind/pagefind-component-ui.js" type="module"></script>
</head>
<body>
<header>
  <h1>${esc(site.title)}</h1>
  <p>${esc(site.subtitle)}</p>
  <p class="notice"><strong>Index under review:</strong> machine-produced draft. Each entry shows how reliable the reading is and stays pending human review.</p>
</header>
<pagefind-input placeholder="${esc(site.placeholder)}"></pagefind-input>
<pagefind-summary></pagefind-summary>
<pagefind-results></pagefind-results>
<p class="meta">${count} entries indexed.</p>
</body>
</html>
`;
}

export const VIEWER_JS = `const el = document.getElementById("viewer");
if (el && window.OpenSeadragon) {
  OpenSeadragon({
    element: el,
    prefixUrl: "../vendor/openseadragon/images/",
    tileSources: { type: "image", url: el.dataset.src },
    showNavigator: true,
    gestureSettingsMouse: { scrollToZoom: true },
  });
}
`;

export const STYLE = `#viewer { width: 100%; height: 32rem; background: #1f1a14; border: 1px solid #b7a582; border-radius: 6px; }
:root { color-scheme: light; }
body { font-family: Georgia, 'Times New Roman', serif; max-width: 62rem; margin: 0 auto; padding: 1.5rem 1rem; color: #2b2118; background: #f7f2e9; }
h1 { font-size: 1.6rem; margin: 0 0 .2rem; }
.meta, header p { color: #6d5c44; font-size: .95rem; }
.notice { background: #fdf0d0; border: 1px solid #d8c9a8; border-radius: 6px; padding: .5rem .7rem; font-size: .85rem; }
.tag { display: inline-block; font-size: .72rem; padding: .1rem .45rem; border-radius: 999px; }
.alta { background: #dcefd9; color: #2c5d2c; } .media { background: #fdf0d0; color: #8a6d1f; } .baja { background: #f8ddda; color: #96372e; }
.fuente { font-size: .8rem; color: #6d5c44; }
a { color: #1d4f7a; }
:root { --pagefind-ui-scale: 1; --pagefind-ui-primary: #5E8298; --pagefind-ui-background: #fffdf7; --pagefind-ui-border: #b7a582; --pagefind-ui-text: #2b2118; --pagefind-ui-font: Georgia, serif; }
`;
