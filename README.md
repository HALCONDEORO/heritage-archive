# Heritage Archive

Static portals for historical records archives.

Person-level index of historical municipal record collections (census rolls, minute books) with an online search portal and the document image beside each entry.

This repository contains the **static portal generator**: it turns a JSON index of records into a plain HTML/CSS/JS portal with one page per record and in-browser, accent-insensitive name search powered by [Pagefind](https://pagefind.app) (MIT). No framework and no server: the output is static files.

The transcription pipeline that produces the index from page scans is private and not part of this repository.

## Quick start

```sh
npm ci
cp data/records.sample.json data/records.json   # marked synthetic sample data
npm run validate                                 # checks data/records.json against docs/MODELO.md
npm run build                                    # writes the portal to site/ and indexes it (validates first)
npm test
```

`data/records.json` and `data/img/` are git-ignored on purpose: real data and scans stay out of this repository. Optional `data/site.json` overrides `lang`, `title`, `subtitle` and `placeholder`.

Serve `site/` with any static file server.

## Loading your own data

Write your index as `data/records.json`: an array of person records following the data model in `docs/MODELO.md` (`id`, `nombre`, `apellidos`, `relacion`, `edad`, `estado`, `profesion`, `residencia`, `parroquia`, `municipio`, `anio`, `pagina`, `hogar`, `imagen`, `fuente`, `confianza`, `revisado`). Then run `npm run build`.

## Page images

Record pages show the page image in an [OpenSeadragon](https://openseadragon.github.io) zoom viewer (BSD-3-Clause, copied into `site/vendor/` at build time).

Each record can point to the image of its source page (`imagen` field, files under `data/img/`). Images are **not redistributed with this repository**: they belong to the source archive (for the pilot, the Archivo Municipal de Colunga, which publishes the scans on colunga.es). Place your own images in `data/img/` before building; the portal works without them.

## Privacy

Only record collections where every person is long deceased are indexed.

## Credits and license

Third-party components and their licenses are listed in `CREDITS.md`. This project is released under the GNU Affero General Public License v3.0 (see `LICENSE`).
