# Index data model (one census entry per person)

Each census row becomes one person record:

```json
{
  "id": "colunga-1869-sales-p003-h01",
  "nombre": "José",
  "apellidos": "Piero Sola",
  "relacion": "cabecero",
  "edad": 33,
  "estado": "casado",
  "profesion": "labrador",
  "residencia": "Sales",
  "parroquia": "Sales",
  "municipio": "Colunga",
  "anio": 1869,
  "pagina": 3,
  "hogar": 1,
  "imagen": "img/colunga-1869-p003.jpg",
  "fuente": "Padrón de habitantes 1869-1870, sign. C 180/3, Archivo Municipal de Colunga",
  "confianza": "alta|media|baja",
  "revisado": false
}
```

Field names stay in Spanish on purpose: they mirror the source documents.

Rules:
- `hogar` groups the people of the same household (the census is organized by household).
- `confianza` comes from the transcription process; every record starts with `revisado: false` until human review.
- Optional `linea`: `{ "x", "y", "w", "h", "aspect" }`, the detected line of this person on the page, as fractions of the page (0-1; `aspect` = page width / height). The record page then shows a crop of the line with the name highlighted and opens the viewer zoomed on it. The box includes the order number and the "D." mark, so the highlight skips the first 14% of the line width. Boxes are machine-detected (for example with Kraken, Apache-2.0) and stay pending human review.
- Each record's image is the FULL page (the archive keeps the original document; the record links page + position).

---

# Modelo de datos del índice (por asiento de padrón) — original en español

Cada fila del padrón = un asiento de persona (ver el ejemplo JSON de arriba).

Reglas:
- `hogar` agrupa a las personas de la misma casa (el padrón es por hogares).
- `confianza` viene del HTR; todo asiento entra con `revisado: false` hasta revisión humana.
- La imagen de cada asiento es la PÁGINA completa (el ayuntamiento conserva el documento; nosotros enlazamos página + posición).
