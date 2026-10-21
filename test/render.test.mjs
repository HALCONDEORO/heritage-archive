import { test } from "node:test";
import assert from "node:assert/strict";
import { fold, esc, safeId, safeImage, recordPage, indexPage } from "../src/render.mjs";

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
