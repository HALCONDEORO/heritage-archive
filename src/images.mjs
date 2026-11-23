// Copy an archive's image tree without following or publishing filesystem links.
import { readdirSync, mkdirSync, copyFileSync, lstatSync } from "node:fs";
import { join } from "node:path";

export function copyImageTree(source, destination) {
  if (!lstatSync(source).isDirectory()) throw new Error(`Image source must be a real directory: ${source}`);
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    if (entry.isDirectory()) {
      mkdirSync(to, { recursive: true });
      copyImageTree(from, to);
    } else if (entry.isFile()) {
      mkdirSync(destination, { recursive: true });
      copyFileSync(from, to);
    } else {
      throw new Error(`Image tree contains a link or unsupported file: ${from}`);
    }
  }
}
