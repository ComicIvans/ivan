# Imágenes de la galería

Cada evento tiene una carpeta `public/gallery/<slug>/` con el mismo `slug` que su
archivo de contenido (`content/es/gallery/<slug>.md`). Las imágenes no están en
Git: guarda una copia de seguridad de los originales.

```
gallery-src/<slug>/      # originales (fuera de Git y de la imagen Docker)
  IMG_0001.JPG
  ...
  gallery-add.json       # qué original es cada NN.webp (lo escribe el script)
public/gallery/<slug>/   # lo que se publica
  cover.webp             # portada, 1600×900
  01.webp                # fotos, como mucho 2560 px por el lado largo
  02.webp
```

## Añadir fotos

1. Copia los originales en `gallery-src/<slug>/`. Se numeran por orden de nombre
   de archivo.
2. Crea `content/es/gallery/<slug>.md` (plantilla más abajo) y ejecuta:

   ```sh
   pnpm gallery:add <slug> --write
   ```

   El script gira cada foto según su EXIF, la reduce a 2560 px como máximo, la
   guarda en WebP (calidad 82) sin metadatos (ni cámara ni GPS) y añade o
   actualiza la lista `photos` con el tamaño real de cada archivo. Las fotos
   nuevas aparecen con `alt: ""`: `pnpm verify` falla hasta que las describas.
   Sin `--write` solo imprime la lista para copiarla.

   Opciones:
   - `pnpm gallery:add <slug> <carpeta>`: lee los originales de otra carpeta
     (nunca de `public/`).
   - `--cover <archivo>`: genera también `cover.webp`, un recorte de 1600×900 de
     ese original.
   - `--force`: vuelve a convertir las fotos aunque ya estén al día.

   Puedes repetirlo cuando quieras: las fotos ya convertidas se saltan, cada
   original conserva su número y los textos ya escritos se mantienen. Los
   originales nunca se modifican ni se borran.

3. No sustituyas una foto publicada por otra con el mismo nombre: los
   navegadores guardan la foto y sus versiones redimensionadas en caché y
   pueden seguir mostrando la anterior durante días. Si cambias una foto, dale
   un número nuevo.

## Contenido

```yaml
---
title: Nombre del evento
location: Ciudad, España
date: 2026-03-12 # primer día
endDate: 2026-03-14 # último día; omítelo si el evento dura un día
description: Resumen breve del evento.
icon: i-tabler-users-group
tags:
  - Congreso
cover:
  src: /gallery/mi-evento/cover.webp
  alt: Vista del escenario antes de la sesión inaugural
photos:
  - src: /gallery/mi-evento/01.webp
    alt: Equipo organizador presentándose en el escenario
    description: Texto opcional que se muestra al ampliar la foto
    width: 2560
    height: 1707
draft: false
---
```

- La duración («3 días») y las fechas que se muestran se calculan a partir de
  `date` y `endDate`.
- `width` y `height` deben ser los del archivo; `pnpm gallery:add` los escribe y
  `pnpm verify` los comprueba, igual que el nombre exacto de cada archivo (con
  mayúsculas y minúsculas).
- Si una foto no tiene `alt`, se genera uno genérico («Título del evento - Foto
  3»). Es mejor describir cada foto para quien no puede verla.
- Los eventos van directamente en `content/<idioma>/gallery/`: el nombre del
  archivo es la URL y las subcarpetas no se leen.
- `draft: true` oculta el evento de la web, pero no lo hace privado: el contenido
  sigue en los datos públicos que genera Nuxt Content. Lo que no deba publicarse
  todavía, guárdalo fuera de `content/`.

## Traducciones

`content/en/gallery/<slug>.md` y `content/de/gallery/<slug>.md` solo llevan los
campos que traducen; el resto (fechas, orden de las fotos, tamaños) sale del
archivo en español. Cada foto se identifica por su `src` y solo lleva `alt` y,
si la tiene, `description`:

```yaml
photos:
  - src: /gallery/mi-evento/01.webp
    alt: Organising team introducing themselves on stage
```

Una foto que falte en la traducción usa el texto en español. Una foto nueva en
español aparece en todos los idiomas sin tocar las traducciones.
