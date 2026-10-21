// Static portal generator: data/records.json -> site/ (index page + one page per record),
// then Pagefind (MIT) indexes the pages for in-browser, accent-insensitive search.
// Run with `npm run build`. Output is plain HTML/CSS/JS.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync, rmSync } from "node:fs";
import { recordPage, indexPage, safeId, STYLE } from "./render.mjs";

const DEFAULT_SITE = {
  lang: "en",
  title: "Heritage Archive",
  subtitle: "Person-level index of a historical records collection.",
  placeholder: "Search by name or surname",
};

const records = JSON.parse(readFileSync("data/records.json", "utf8"));
const site = { ...DEFAULT_SITE, ...(existsSync("data/site.json") ? JSON.parse(readFileSync("data/site.json", "utf8")) : {}) };

rmSync("site", { recursive: true, force: true });
mkdirSync("site/r", { recursive: true });

// Page images are optional: they belong to the source archive and are not
// redistributed with this repository.
if (existsSync("data/img")) {
  mkdirSync("site/img", { recursive: true });
  for (const f of readdirSync("data/img")) copyFileSync("data/img/" + f, "site/img/" + f);
}

writeFileSync("site/style.css", STYLE);
for (const r of records) writeFileSync(`site/r/${safeId(r.id)}.html`, recordPage(r, site));
writeFileSync("site/index.html", indexPage(site, records.length));
console.log(`site/ built: ${records.length} record pages`);
