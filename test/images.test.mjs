import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, symlinkSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { copyImageTree } from "../src/images.mjs";

test("the builder resolves nested record images without changing the source tree", (t) => {
  const { root } = fixture(t);
  mkdirSync(join(root, "data", "img", "collection", "1900"), { recursive: true });
  const image = '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><text x="2" y="20">Synthetic</text></svg>';
  writeFileSync(join(root, "data", "img", "collection", "1900", "page.svg"), image);
  const records = [{ id: "nested", nombre: "Synthetic", apellidos: "Example", anio: 1900, pagina: 1, hogar: 1, fuente: "SYNTHETIC TEST", confianza: "alta", revisado: false, imagen: "img/collection/1900/page.svg" }];
  writeFileSync(join(root, "data", "records.json"), JSON.stringify(records));
  symlinkSync(fileURLToPath(new URL("../node_modules", import.meta.url)), join(root, "node_modules"));
  execFileSync(process.execPath, [fileURLToPath(new URL("../src/build.mjs", import.meta.url))], { cwd: root, stdio: "pipe" });
  assert.equal(readFileSync(join(root, "site", "img", "collection", "1900", "page.svg"), "utf8"), image);
  assert.match(readFileSync(join(root, "site", "r", "nested.html"), "utf8"), /href="\.\.\/img\/collection\/1900\/page.svg"/);
  assert.equal(readFileSync(join(root, "data", "img", "collection", "1900", "page.svg"), "utf8"), image);
});

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "heritage-images-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = join(root, "source");
  const dest = join(root, "dest");
  mkdirSync(source);
  return { root, source, dest };
}

test("nested image folders retain paths and exact bytes", (t) => {
  const { source, dest } = fixture(t);
  mkdirSync(join(source, "collection", "1900"), { recursive: true });
  const bytes = Buffer.from([0, 1, 255, 42]);
  writeFileSync(join(source, "collection", "1900", "page-1.png"), bytes);
  writeFileSync(join(source, "cover.svg"), "synthetic cover");
  copyImageTree(source, dest);
  assert.deepEqual(readFileSync(join(dest, "collection", "1900", "page-1.png")), bytes);
  assert.equal(readFileSync(join(dest, "cover.svg"), "utf8"), "synthetic cover");
});

test("successive sample and archive trees merge, archive file wins", (t) => {
  const { root, source, dest } = fixture(t);
  const archive = join(root, "archive");
  mkdirSync(archive);
  writeFileSync(join(source, "sample.svg"), "sample");
  writeFileSync(join(source, "shared.png"), "sample version");
  writeFileSync(join(archive, "shared.png"), "archive version");
  copyImageTree(source, dest);
  copyImageTree(archive, dest);
  assert.equal(readFileSync(join(dest, "shared.png"), "utf8"), "archive version");
  assert.equal(readFileSync(join(dest, "sample.svg"), "utf8"), "sample");
});

for (const directory of [false, true]) {
  test(`rejects ${directory ? "directory" : "file"} symlinks instead of publishing their target`, (t) => {
    const { root, source, dest } = fixture(t);
    const external = join(root, "external");
    if (directory) {
      mkdirSync(external);
      writeFileSync(join(external, "secret.png"), "not an archive image");
    } else writeFileSync(external, "not an archive image");
    symlinkSync(external, join(source, "linked"));
    assert.throws(() => copyImageTree(source, dest), /link or unsupported/);
    assert.equal(existsSync(join(dest, "linked")), false);
  });
}

test("rejects a symlink as the source root", (t) => {
  const { root, source, dest } = fixture(t);
  const link = join(root, "source-link");
  symlinkSync(source, link);
  assert.throws(() => copyImageTree(link, dest), /real directory/);
});
