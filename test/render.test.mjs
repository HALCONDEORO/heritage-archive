import { test } from "node:test";
import assert from "node:assert/strict";
import { fold, esc, safeId, safeImage, recordPage, indexPage, safeBox, nameBox, lineCropHtml, NAME_MARGIN, VIEWER_JS, STYLE } from "../src/render.mjs";

const site = { lang: "en", title: "Test Archive", subtitle: "s", placeholder: "Search" };
const rec = { id: "x/1", nombre: "Sampló", apellidos: "Pérez <b>", relacion: "hijo", edad: 9, estado: "soltero", profesion: "", residencia: "A", parroquia: "B", municipio: "C", anio: 1900, pagina: 1, hogar: 1, imagen: "img/p.svg", fuente: "SAMPLE DATA", confianza: "alta", revisado: false };

test("fold removes accents and case", () => {
  assert.equal(fold("Sampló Pérez Ñandú"), "samplo perez nandu");
});

test("esc escapes HTML", () => {
  assert.equal(esc(`<a href="x">&'`), "&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
});

test("safeId keeps ids usable as file names", () => {
  assert.equal(safeId("x/1 y"), "x_1_y");
  assert.ok(!safeId("a/b").includes("/"));
});

test("record page is indexable and escapes record text", () => {
  const html = recordPage(rec, site);
  assert.match(html, /data-pagefind-body/);
  assert.match(html, /id="viewer"/);
  assert.match(html, /Pérez &lt;b&gt;/);
  assert.doesNotMatch(html, /<b>/);
});

test("index page loads the Pagefind component UI", () => {
  const html = indexPage(site, 3);
  assert.match(html, /pagefind-component-ui\.js/);
  assert.match(html, /<pagefind-input/);
  assert.match(html, /3 entries indexed/);
});

test("image paths are restricted to plain relative paths", () => {
  assert.equal(safeImage("img/p.svg"), "img/p.svg");
  for (const bad of ["javascript:alert(1)", "data:text/html,x", "https://x.test/a.png", "/etc/passwd", "../a.png", "img/../../a.png", "a b.png", ""]) {
    assert.equal(safeImage(bad), "", bad);
  }
  const html = recordPage({ ...rec, imagen: "javascript:alert(1)" }, site);
  assert.doesNotMatch(html, /javascript:/);
});

test("safeBox accepts valid page fractions and rejects bad data", () => {
  assert.deepEqual(safeBox({ x: 0.1, y: 0.2, w: 0.3, h: 0.02, aspect: 0.76 }), { x: 0.1, y: 0.2, w: 0.3, h: 0.02, aspect: 0.76 });
  for (const bad of [null, "x", {}, { x: -0.1, y: 0, w: 0.2, h: 0.1 }, { x: 0.9, y: 0, w: 0.2, h: 0.1 }, { x: 0, y: 0, w: 0, h: 0.1 }, { x: "a", y: 0, w: 0.2, h: 0.1 }]) {
    assert.equal(safeBox(bad), null);
  }
});

test("nameBox skips the order number and mark at the start of the line", () => {
  const n = nameBox({ x: 0.1, y: 0.2, w: 0.5, h: 0.02 });
  assert.ok(Math.abs(n.x - (0.1 + 0.5 * NAME_MARGIN)) < 1e-9);
  assert.ok(Math.abs(n.x + n.w - 0.6) < 1e-9);
  assert.equal(nameBox(null), null);
});

test("line crop renders only with a valid box, image and aspect", () => {
  const withBox = { ...rec, imagen: "img/p.jpg", linea: { x: 0.1, y: 0.2, w: 0.4, h: 0.02, aspect: 0.76 } };
  const html = lineCropHtml(withBox);
  assert.match(html, /linecrop-hl/);
  assert.match(html, /background-size:250% auto/);
  assert.equal(lineCropHtml(rec), "");
  assert.equal(lineCropHtml({ ...withBox, linea: { ...withBox.linea, aspect: undefined } }), "");
  assert.equal(lineCropHtml({ ...withBox, imagen: "../x.jpg" }), "");
});

test("record page carries the line data for the viewer and stays safe", () => {
  const html = recordPage({ ...rec, imagen: "img/p.jpg", linea: { x: 0.1, y: 0.2, w: 0.4, h: 0.02, aspect: 0.76 } }, site);
  assert.match(html, /data-line="0\.1,0\.2,0\.4,0\.02"/);
  assert.match(html, /data-name="/);
  const bad = recordPage({ ...rec, linea: { x: 5, y: 0, w: 1, h: 1 } }, site);
  assert.doesNotMatch(bad, /data-line|linecrop-hl/);
});

test("viewer script fits the line and adds a highlight overlay", () => {
  assert.match(VIEWER_JS, /fitBounds/);
  assert.match(VIEWER_JS, /addOverlay/);
});

test("pages have a skip link to an existing main landmark, and the viewer is keyboard reachable", () => {
  for (const html of [recordPage(rec, site), indexPage(site, 1)]) {
    assert.match(html, /<a class="skip" href="#main">/);
    assert.equal((html.match(/<main\b/g) || []).length, 1);
    assert.match(html, /<main id="main"/);
  }
  assert.match(recordPage(rec, site), /id="viewer" role="region" tabindex="0"/);
});

test("static a11y checks on generated markup: images have alt, links have text, no empty headings, no positive tabindex", () => {
  for (const html of [recordPage({ ...rec, imagen: "img/x.svg", linea: { x: 0.1, y: 0.1, w: 0.5, h: 0.05, aspect: 0.75 } }, site), indexPage(site, 1)]) {
    for (const m of html.matchAll(/<img\b[^>]*>/g)) assert.match(m[0], /\balt="/, m[0]);
    for (const m of html.matchAll(/<a\b[^>]*>(.*?)<\/a>/gs)) assert.ok(m[1].replace(/<[^>]*>/g, "").trim().length > 0, m[0]);
    for (const m of html.matchAll(/<h([1-6])\b[^>]*>(.*?)<\/h\1>/gs)) assert.ok(m[2].trim().length > 0);
    assert.doesNotMatch(html, /tabindex="[1-9]/);
  }
});

test("a record with a hostile name, no image and an out-of-range box still renders safely", () => {
  const html = recordPage({ ...rec, nombre: '<script>alert(1)</script>"', imagen: "../etc/passwd", linea: { x: 2, y: 0, w: 1, h: 1 } }, site);
  assert.doesNotMatch(html, /<script>alert/);
  assert.doesNotMatch(html, /etc\/passwd/);
  assert.doesNotMatch(html, /linecrop-box/);
});

import { robotsMeta, robotsTxt, sitemapXml, basePath } from "../src/render.mjs";

test("pages are noindex by default and indexable only when site.indexable is true", () => {
  assert.match(recordPage(rec, site), /<meta name="robots" content="noindex, nofollow">/);
  assert.match(indexPage(site, 1), /<meta name="robots" content="noindex, nofollow">/);
  assert.doesNotMatch(recordPage(rec, { ...site, indexable: true }), /name="robots"/);
  assert.doesNotMatch(indexPage(site, 1), /pagefind-config/);
  assert.equal(robotsMeta({ indexable: "true" }) !== "", true, "only the boolean true opens indexing");
});

test("robots.txt blocks everything unless indexable; sitemap only with indexable and baseUrl", () => {
  assert.equal(robotsTxt(site), "User-agent: *\nDisallow: /\n");
  assert.match(robotsTxt({ ...site, indexable: true, baseUrl: "https://example.org/a" }), /Sitemap: https:\/\/example\.org\/a\/sitemap\.xml/);
  assert.equal(sitemapXml(site, [rec]), "");
  assert.equal(sitemapXml({ ...site, indexable: true }, [rec]), "");
  const xml = sitemapXml({ ...site, indexable: true, baseUrl: "https://example.org/a/" }, [rec]);
  assert.match(xml, /<loc>https:\/\/example\.org\/a\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/example\.org\/a\/r\/x_1\.html<\/loc>/);
});

test("baseUrl path prefixes Pagefind result links", () => {
  assert.equal(basePath(site), "");
  assert.equal(basePath({ baseUrl: "https://example.org/archive" }), "/archive/");
  assert.equal(basePath({ baseUrl: "not a url" }), "");
  assert.match(indexPage({ ...site, baseUrl: "https://example.org/archive/" }, 1), /<pagefind-config base-url="\/archive\/"><\/pagefind-config>/);
});

test("dark-mode Pagefind variables come after the light ones, so the dark values win the cascade", () => {
  const light = STYLE.indexOf(":root { --pagefind-ui-scale");
  const dark = STYLE.indexOf("@media (prefers-color-scheme: dark)");
  const darkVars = STYLE.indexOf("--pagefind-ui-background", dark);
  assert.ok(light >= 0 && dark > light && darkVars > dark, "light :root must precede the dark media block");
});

test("OpenSeadragon is loaded lazily by viewer.js, not by a script tag on the page", () => {
  const html = recordPage(rec, site);
  assert.doesNotMatch(html, /openseadragon\.min\.js/);
  assert.match(html, /<script src="\.\.\/viewer\.js"><\/script>/);
  assert.match(VIEWER_JS, /IntersectionObserver/);
  assert.match(VIEWER_JS, /openseadragon\.min\.js/);
  assert.match(VIEWER_JS, /function startViewer\(\)/);
});

test("record page has a copy-citation button with the escaped citation text", () => {
  const html = recordPage({ ...rec, nombre: 'A"B', fuente: "Src <x>" }, site);
  assert.match(html, /<button type="button" id="cite" data-cite="[^"]*page 1\. Source: Src &lt;x&gt;\.">Copy citation<\/button>/);
  assert.match(html, /id="cite-status" role="status"/);
  assert.doesNotMatch(html, /data-cite="[^"]*A"B/);
});

test("stylesheet has a mobile rule for the viewer and a print rule hiding the viewer and controls", () => {
  assert.match(STYLE, /@media \(max-width: 40rem\)[\s\S]*#viewer \{ height: 70vh/);
  assert.match(STYLE, /@media print[\s\S]*#viewer/);
});
