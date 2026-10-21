// Static portal generator: records.json -> site/ (index + search + fichas).
// No framework, no build deps: the output is plain HTML/CSS/JS served from macd-prod-01.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

// Load your own index into data/records.json (see README). A marked synthetic
// sample ships in data/records.sample.json: copy it over to try the build.
const records = JSON.parse(readFileSync("data/records.json", "utf8"));
mkdirSync("site", { recursive: true });
import { readdirSync as rd, copyFileSync as cp } from "node:fs";
// Page images are optional: they belong to the source archive and are not
// redistributed with this repository.
if (existsSync("data/img")) {
  mkdirSync("site/img", { recursive: true });
  for (const f of rd("data/img")) cp("data/img/" + f, "site/img/" + f);
}

const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const index = records.map((r) => ({ i: r.id, n: fold(`${r.nombre} ${r.apellidos}`) }));
writeFileSync("site/index.json", JSON.stringify(index));
writeFileSync("site/records.json", JSON.stringify(records));

const html = readFileSync("src/template.html", "utf8");
writeFileSync("site/index.html", html);
console.log(`site/ built: ${records.length} records, index ${index.length} entries`);
