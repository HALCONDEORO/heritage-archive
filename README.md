# archivo-piloto

Person-level index of historical municipal record collections (census rolls, minute books) with an online search portal and the document image beside each entry.

This repository contains the **static portal generator**: it turns a JSON index of records into a plain HTML/CSS/JS portal with in-browser, accent-insensitive name search and one page per record. No framework, no build dependencies.

The transcription pipeline that produces the index from page scans is private and not part of this repository.

## Quick start

```sh
cp data/records.sample.json data/records.json   # marked synthetic sample data
npm run build                                    # writes the portal to site/
```

Serve `site/` with any static file server.

## Loading your own data

Write your index as `data/records.json`: an array of person records following the data model in `docs/MODELO.md` (`id`, `nombre`, `apellidos`, `relacion`, `edad`, `estado`, `profesion`, `residencia`, `parroquia`, `municipio`, `anio`, `pagina`, `hogar`, `imagen`, `fuente`, `confianza`, `revisado`). Then run `npm run build`.

## Page images

Each record can point to the image of its source page (`imagen` field, files under `data/img/`). Images are **not redistributed with this repository**: they belong to the source archive (for the pilot, the Archivo Municipal de Colunga, which publishes the scans on colunga.es). Place your own images in `data/img/` before building; the portal works without them.

## Privacy

Only record collections where every person is long deceased are indexed.

## Credits and license

Third-party components and their licenses are listed in `CREDITS.md`. This project is released under the GNU Affero General Public License v3.0 (see `LICENSE`).
