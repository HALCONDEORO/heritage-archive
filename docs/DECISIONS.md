# Integration decisions

Date: 2026-10-21. Licenses were read from each project's GitHub repository page that day. This is an engineering record, not legal advice.

Rule for this repository (AGPL-3.0): code or assets may come from projects licensed MIT, BSD, Apache-2.0 or AGPL-3.0, with the notice kept and the project listed in `CREDITS.md`. No GPL-2.0-only code. GPL-3.0 projects are used only as separate programs or as ideas, never copied.

## Adopted

| Project | License | Use here | Why |
|---|---|---|---|
| [Pagefind](https://github.com/pagefind/pagefind) | MIT | Static search over one page per record (PR "Add Pagefind search...") | No server, scales to many thousands of pages, accent-insensitive, accessible UI. |
| [OpenSeadragon](https://github.com/openseadragon/openseadragon) | BSD-3-Clause | Zoom viewer for the page image on each record page (PR "Add OpenSeadragon zoom viewer...") | Handwritten pages must be zoomable. Small, no server, supports tiled and IIIF images later. |

## Documented, not integrated as code

| Project | License | Decision | Why |
|---|---|---|---|
| [Kraken](https://github.com/mittagessen/kraken) | Apache-2.0 | Stays the planned HTR engine, run outside this repository by the private transcription pipeline. | The pipeline turns scans into `data/records.json`. This repository only consumes the result. Trained models can carry their own license: check each model before use. |
| [Mirador](https://github.com/ProjectMirador/mirador) | Apache-2.0 | Deferred. | Needs IIIF manifests, which the pilot collection does not publish. Revisit when a source archive offers IIIF. |
| [Gramps Web](https://github.com/gramps-project/gramps-web) and [API](https://github.com/gramps-project/gramps-web-api) | AGPL-3.0 | Deferred. | Useful if a client wants family trees. Plan: export reviewed records to a Gramps-readable format as a separate tool, not embed Gramps. |
| [FromThePage](https://github.com/benwbrum/fromthepage) | AGPL-3.0 | Reference only. | Its human review workflow is a model for moving a record from `revisado: false` to reviewed. Running it is a hosting and maintenance commitment. |

## Rejected for now

| Project | License | Why not |
|---|---|---|
| [AtoM](https://github.com/artefactual/atom) | AGPL-3.0 | Full archival description system (PHP, search cluster). Too heavy for a static, low-cost portal. |
| [Omeka S](https://github.com/omeka/omeka-s) | GPL-3.0 | Publishing platform with its own server stack and database. A modified hosted copy also requires publishing its changes. |
| [CollectiveAccess Providence](https://github.com/collectiveaccess/providence) | GPL-3.0 | Cataloguing system aimed at institutions. Same weight problem. |

Not assessed: ArchivesSpace, Blacklight and Tropy. GitHub does not report a clear license for them, so their LICENSE files must be read before any proposal.

## Known gaps

- Pagefind result links are root-relative by default: set `baseUrl` in `data/site.json` when the portal is served from a subfolder.
- The sample portal uses a synthetic page image only. Real scans stay outside the repository.
