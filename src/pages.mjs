// Ingesta: extrae las páginas de un PDF de padrón como imágenes PNG para el pipeline HTR.
// Uso: node src/pages.mjs <pdf> <salida-dir> [resolucion=200]
// Requiere poppler (pdftoppm). Las imágenes NO se suben al repo (fuentes/ está en .gitignore).
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";

const [pdf, out, dpi = "200"] = process.argv.slice(2);
if (!pdf || !out) { console.error("uso: node src/pages.mjs <pdf> <salida-dir> [dpi]"); process.exit(2); }
mkdirSync(out, { recursive: true });
execFileSync("pdftoppm", ["-r", dpi, "-png", pdf, `${out}/pagina`], { stdio: "inherit" });
const pages = readdirSync(out).filter((f) => f.endsWith(".png")).sort();
console.log(`${pages.length} páginas extraídas a ${out}/`);
