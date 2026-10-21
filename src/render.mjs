// Pure rendering helpers (no file I/O) so they can be unit tested.
export const fold = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const safeId = (id) => String(id).replace(/[^A-Za-z0-9._-]/g, "_");

const CONF = { alta: "reliable reading", media: "check reading", baja: "doubtful reading" };

export function recordPage(r, site) {
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
  <p data-pagefind-ignore><a class="doc" href="../${esc(r.imagen)}" target="_blank" rel="noopener">View the original page (${esc(r.pagina)})</a></p>
  <span hidden data-pagefind-filter="municipio">${esc(r.municipio)}</span>
  <span hidden data-pagefind-filter="year">${esc(r.anio)}</span>
</main>
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

export const STYLE = `:root { color-scheme: light; }
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
