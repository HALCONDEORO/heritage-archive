import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, copyFileSync, readFileSync } from "node:fs";

test("sample data builds into an indexed site", () => {
  const had = existsSync("data/records.json");
  if (!had) copyFileSync("data/records.sample.json", "data/records.json");
  execFileSync("node", ["src/build.mjs"], { stdio: "pipe" });
  execFileSync("npx", ["pagefind", "--site", "site"], { stdio: "pipe" });
  assert.ok(existsSync("site/index.html"));
  assert.ok(existsSync("site/pagefind/pagefind.js"));
  assert.equal(readdirSync("site/r").length, 4);
  assert.ok(existsSync("site/vendor/openseadragon/openseadragon.min.js"));
  assert.ok(existsSync("site/vendor/openseadragon/LICENSE.txt"));
  assert.ok(existsSync("site/img/sample-page.svg"));
});

test("Irish demo dataset: fictional, unique ids, line boxes inside the page, image exists", () => {
  const recs = JSON.parse(readFileSync("data/records.ie.sample.json", "utf8"));
  assert.equal(new Set(recs.map((r) => r.id)).size, recs.length);
  for (const r of recs) {
    assert.match(r.fuente, /^DEMO DATA - fictional/);
    assert.ok(existsSync(`data/sample-img/${r.imagen.replace(/^img\//, "")}`), r.imagen);
    const l = r.linea;
    assert.ok(l.x >= 0 && l.y >= 0 && l.x + l.w <= 1 && l.y + l.h <= 1, r.id);
  }
});
