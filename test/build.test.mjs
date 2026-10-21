import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, copyFileSync } from "node:fs";

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
