# Guía de contenido

Dónde está cada texto y cada foto de la web, cómo cambiarlos y cómo añadir
elementos nuevos. Nada de lo que se describe aquí requiere tocar código.

## Flujo de trabajo

1. **Edita** los archivos que se indican abajo.
2. **Previsualiza** con `pnpm dev` y abre <http://localhost:3000>. Los cambios
   en `content/` e `i18n/` se aplican al guardar; si no ves alguno, recarga la
   página. Revisa también `/en` y `/de`.
3. **Comprueba** con `pnpm verify`. Si falla, el mensaje dice el archivo, el
   campo y el problema (ver [Errores frecuentes](#errores-frecuentes)).
4. **Guarda** los cambios en Git (las fotos de la galería no van a Git: ver
   [Copias de seguridad](#copias-de-seguridad)).
5. **Publica** con `pnpm deploy:vps`. La web no cambia hasta que despliegas:
   el script construye la imagen con lo que hay en tu disco, incluidas las
   fotos de `public/gallery/`, y la sube al servidor.

## Dónde está cada cosa

| Qué                                                        | Dónde                                                                  |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| Áreas de experiencia (tarjetas del inicio)                 | `content/profile/highlights.yml`                                       |
| Experiencia                                                | `content/profile/experience.yml`                                       |
| Representación estudiantil                                 | `content/profile/representation.yml`                                   |
| Proyectos y tecnologías                                    | `content/profile/projects.yml`                                         |
| Formación, idiomas, certificaciones y competencias         | `content/profile/training.yml`                                         |
| Eventos de la galería                                      | `content/<idioma>/gallery/<evento>.md`                                 |
| Fotos de la galería                                        | `public/gallery/<evento>/` (fuera de Git)                              |
| Originales de esas fotos                                   | `gallery-src/<evento>/` (fuera de Git)                                 |
| Presentación del inicio, títulos de sección y textos fijos | `i18n/locales/es.json`, `en.json`, `de.json`                           |
| Título y descripción para buscadores y redes               | `seo.*` en `i18n/locales/*.json`                                       |
| Aviso legal, privacidad y su fecha de actualización        | `legal.*` en `i18n/locales/*.json`                                     |
| Redes sociales (enlaces y dónde se muestran)               | `shared/constants/profile.ts`                                          |
| Chistes del botón de la barra de navegación                | `app/assets/jokes-es.json`, `-en`, `-de`                               |
| Retrato de la cabecera y de la credencial                  | `public/profile-pic.webp`                                              |
| Foto del inicio                                            | `public/full-pic.webp`                                                 |
| Capturas de proyectos                                      | `public/projects/` (o cualquier carpeta de `public/` salvo `gallery/`) |

Los contadores del inicio (proyectos, cargos y eventos), la tarjeta «Ahora»,
los años en representación, las barras de nivel de idiomas y los datos
estructurados para buscadores se calculan a partir de estos archivos: no hay
que actualizarlos a mano.

## Trayectoria: `content/profile/*.yml`

Cada archivo es una lista de elementos. **El orden del archivo es el orden en
la web**: experiencia de más reciente a más antigua, representación de más
antigua a más reciente, y el resto como quieras que aparezca.

### Textos en tres idiomas

Un campo de texto admite dos formas:

```yaml
organization: Universitat Politècnica de València # igual en todos los idiomas

title: # un texto por idioma
  es: Grado en Matemáticas
  en: Bachelor’s Degree in Mathematics
  de: Bachelorabschluss in Mathematik
```

- `es` es obligatorio; `en` y `de` son opcionales. Si falta uno, la web muestra
  el texto en español y `pnpm verify` lo avisa con un `warning` (no falla).
- Nunca dejes un idioma vacío (`en: ""`): es un error. Si aún no tienes la
  traducción, quita la línea.
- Las listas también se traducen elemento a elemento: en las etiquetas de un
  proyecto, `- Nuxt` vale para todos los idiomas y un elemento con `es`, `en`
  y `de` se traduce (ver la [plantilla de proyecto](#añadir-un-proyecto-projectsyml)).

### Reglas de YAML que conviene recordar

- Sangría con **dos espacios**, nunca con tabuladores, y todos los campos de un
  mismo elemento alineados.
- Cada elemento de una lista empieza con `- `.
- Si un texto contiene `: ` (dos puntos y espacio) o empieza por `"`, `'`,
  `[`, `{`, `#`, `&`, `*`, `!`, `|`, `>`, `%` o `@`, ponlo entre comillas
  dobles: `es: "Tesorero: DGE"`. Dentro de esas comillas, una comilla doble se
  escribe `\"`; usa mejor las tipográficas («», “”, ’).
- `#` después de un espacio inicia un comentario: lo que sigue no se publica.

### Identificadores, fechas e iconos

- `id`: minúsculas, cifras y guiones (`creup-digitalization`), único dentro
  de su lista. No se muestra; solo identifica el elemento.
- Fechas: `YYYY-MM` (`2024-06`) o solo el año (`2019`). La web las escribe en
  cada idioma («Jun 2024»; en representación, «Diciembre de 2020»).
  - Sin `end`, el elemento es actual: el periodo termina en «Actualidad» (o
    «En curso» en formación).
  - Para algo terminado del que solo conoces el inicio, añade
    `current: false`.
  - `periodLabel` sustituye las fechas por un texto propio, para periodos
    irregulares (`es: Desde 2019 (anual)`).
- Iconos: nombres de [Iconify](https://icones.js.org) de las colecciones
  instaladas: Tabler (`i-tabler-server-2`), Simple Icons, para marcas
  (`i-simple-icons-docker`), y Circle Flags, para banderas
  (`circle-flags:gb`). `pnpm verify` comprueba que el icono existe.
- URL: siempre completas y con `https://`.

### Añadir un puesto (`experience.yml`)

Ponlo en la posición que le toque (de más reciente a más antiguo):

```yaml
items:
  - id: ejemplo-analista
    icon: i-tabler-briefcase
    start: 2026-11
    # end: 2027-06            # sin end es el puesto actual
    organizationUrl: https://www.ejemplo.es/ # opcional
    showLink: true # opcional: muestra la web bajo el puesto
    title:
      es: Nombre del puesto
      en: Role title
      de: Bezeichnung der Stelle
    badgeRole: # opcional: línea corta para la credencial (máx. 28 caracteres)
      es: Analista · Ejemplo
      en: Analyst · Ejemplo
      de: Analyst · Ejemplo
    organization: Ejemplo S.L.
    description:
      es: Qué haces y qué has conseguido, en una o dos frases.
      en: What you do and what you have achieved, in one or two sentences.
      de: Was du tust und was du erreicht hast, in ein oder zwei Sätzen.
```

- El primer puesto actual de la lista aparece en la tarjeta «Ahora» del
  inicio. Los puestos actuales con `organizationUrl` figuran además en los
  datos estructurados como organizaciones para las que trabajas.
- `showLink: true` necesita `organizationUrl`.
- La credencial que acompaña a la línea de tiempo muestra `badgeRole` (o el
  título si no lo hay). Escríbelo cuando el título sea largo.
- Cuando un puesto termine, añade su `end`.

### Añadir un hito de representación (`representation.yml`)

Al final de la lista (de más antiguo a más reciente):

```yaml
items:
  # … hitos anteriores …
  - id: ejemplo-coordinacion
    icon: i-tabler-users
    date: 2026-11
    current: true # opcional: la fecha se lee «Noviembre de 2026 – Actualidad»
    pin: UPV # opcional: siglas (1-4 mayúsculas o cifras) para la credencial
    title:
      es: Título del hito
      en: Milestone title
      de: Titel des Meilensteins
    description:
      es: Qué supuso este paso.
      en: What this step meant.
      de: Was dieser Schritt bedeutete.
    roles: # cargos que empiezan en este hito
      - es: Cargo
        en: Position
        de: Funktion
```

- `roles` alimenta los contadores de cargos (inicio y sección); los años de
  representación se cuentan desde el primer hito.
- `pin` estampa las siglas en la credencial de «DELEGADO» al pasar por el hito.
- Cuando un hito deje de estar vigente, quita `current: true`.

### Añadir un proyecto (`projects.yml`)

```yaml
items:
  - id: ejemplo-proyecto
    icon: i-tabler-code
    url: https://proyecto.ejemplo.es
    repository: https://github.com/ComicIvans/proyecto # opcional: enlace «GitHub»
    year: 2026 # opcional
    title:
      es: Nombre del proyecto
      en: Project name
      de: Projektname
    description:
      es: Qué es, para quién y qué aporta.
      en: What it is, who it is for and what it offers.
      de: Was es ist, für wen und was es bietet.
    tags:
      - Nuxt
      - es: Código abierto
        en: Open source
        de: Open Source
    accent: # opcional: degradado de la portada
      from: ember-500
      to: amber-300
    metrics: # opcional: cifras destacadas
      - value: 1200
        label:
          es: usuarios
          en: users
          de: Nutzer
    screenshot: # opcional: captura en lugar de la portada decorativa
      src: /projects/ejemplo-proyecto.webp
      alt:
        es: Página de inicio del proyecto con su buscador
        en: Project home page with its search box
        de: Startseite des Projekts mit Suchfeld
```

- `accent` admite los tonos `ember`, `amber` y `blue` del 50 al 950
  (`blue-400`).
- La captura se guarda dentro de `public/` (por ejemplo
  `public/projects/ejemplo-proyecto.webp`) y se escribe sin `public`. Usa
  WebP, proporción 2:1 y al menos 1216 × 608 px. El nombre debe coincidir
  exactamente, mayúsculas incluidas: el servidor distingue `Foto.webp` de
  `foto.webp`. Al contrario que la galería, estas imágenes sí van a Git.
- En pantallas de escritorio, los proyectos pasan en horizontal dentro de una
  ventana fija. Si alargas mucho una descripción o añades muchas etiquetas o
  métricas, abre la web en una ventana de 1280 × 600 y recorre los enlaces de
  las tarjetas con el tabulador: si alguno queda por debajo del borde, avisa
  para ajustar la altura de la escena.

Tecnologías (`stack`, en el mismo archivo):

```yaml
stack:
  primary: # tarjetas grandes, con descripción
    - id: nuxt
      name: Nuxt
      icon: i-simple-icons-nuxt
      tint: ember # ember o blue
      description:
        es: ...
  secondary: # fila de iconos, solo nombre
    - id: python
      name: Python
      icon: i-simple-icons-python
```

### Añadir estudios o un curso (`training.yml`, lista `academic`)

```yaml
academic:
  - id: ejemplo-curso
    icon: i-tabler-certificate
    start: 2026-01
    end: 2026-03
    organizationUrl: https://www.ejemplo.es/ # opcional
    title:
      es: Nombre del curso
      en: Course name
      de: Kursname
    badgeRole: Curso · Ejemplo # opcional (máx. 28 caracteres)
    organization: Ejemplo Academy
    description:
      es: Contenidos principales.
      en: Main topics.
      de: Wichtigste Inhalte.
```

- Unos estudios sin `end` están «En curso»; el primero en curso de la lista da
  la línea de la credencial «DIPLOMA».
- Con `organizationUrl`, el centro aparece en los datos estructurados como
  lugar de estudios.

### Añadir un idioma (`training.yml`, lista `languages`)

```yaml
languages:
  - id: french
    code: fr # código del idioma
    flag: circle-flags:fr
    cefr: B1 # A1, A2, B1, B2, C1, C2 o native
    certificate: DELF # opcional
    name:
      es: Francés
      en: French
      de: Französisch
    level: # opcional: si falta se genera («Nivel B1 DELF»)
      es: Nivel B1 (DELF)
    description:
      es: Dónde y cómo lo has aprendido.
      en: Where and how you learnt it.
      de: Wo und wie du es gelernt hast.
```

`cefr` mueve la barra de nivel.

### Certificaciones, competencias y áreas de experiencia

```yaml
# training.yml
certifications:
  - id: ejemplo-certificado
    icon: i-tabler-award
    title:
      es: Nombre de la certificación
    description:
      es: Qué acredita.

competencies:
  - id: ejemplo-competencia
    icon: i-tabler-bulb
    name:
      es: Nombre de la competencia
      en: Competency name
      de: Name der Kompetenz

# highlights.yml (tarjetas del inicio)
items:
  - id: ejemplo-area
    icon: i-tabler-shield-lock
    title:
      es: Título del área
    description:
      es: Una o dos frases con un ejemplo concreto.
```

Las competencias, las tecnologías principales y la lista `topics` de
`highlights.yml` forman los temas que los buscadores asocian a tu perfil.
`topics` sirve para los que solo aparecen en textos libres, como la carrera o
la representación estudiantil.

## Textos de la interfaz: `i18n/locales/*.json`

Aquí están los títulos e introducciones de las secciones, los botones, los
mensajes del formulario y los textos legales. Los tres archivos deben tener
exactamente las mismas claves: si añades una en `es.json`, añádela también en
`en.json` y `de.json` (`pnpm verify` lo comprueba).

Claves que quizá quieras revisar de vez en cuando:

- `home.hero.pitch`: la presentación del inicio.
- `seo.homeTitle` y `seo.description`: el título y la descripción que ven
  buscadores y redes sociales.
- `schema.jobTitle`: el cargo que leen los buscadores.
- `credential.role.hero`: la línea de la credencial del inicio.
- `legal.updateDate`: la fecha de la última actualización del aviso legal.

En estos mensajes, `|`, `@`, `{` y `}` tienen un significado especial. Para
escribirlos tal cual, usa `{'|'}`, `{'@'}`, `{'{'}` y `{'}'}`; para separar
partes de un texto, mejor `·`.

## Galería

Cada evento tiene:

```text
content/es/gallery/<evento>.md    # texto en español (obligatorio)
content/en/gallery/<evento>.md    # traducción al inglés (opcional)
content/de/gallery/<evento>.md    # traducción al alemán (opcional)
gallery-src/<evento>/             # originales (fuera de Git y de la imagen Docker)
  IMG_0001.JPG
  ...
  gallery-add.json                # qué original es cada NN.webp (lo escribe el script)
public/gallery/<evento>/          # lo que se publica (fuera de Git)
  cover.webp                      # portada, 1600 × 900
  01.webp                         # fotos, como mucho 2560 px por el lado largo
  02.webp
```

`<evento>` es el identificador del evento en minúsculas con guiones
(`enem-2025`) y forma su dirección: `/galeria/enem-2025`,
`/en/gallery/enem-2025` y `/de/galerie/enem-2025`. Los archivos van
directamente en `content/<idioma>/gallery/`: las subcarpetas no se leen.

### Añadir un evento

1. Copia los originales en `gallery-src/<evento>/`. Se numeran por orden de
   nombre de archivo.
2. Crea `content/es/gallery/<evento>.md` con la [plantilla](#plantilla), sin
   la lista `photos`.
3. Convierte las fotos y genera la portada:

   ```sh
   pnpm gallery:add <evento> --cover IMG_0001.JPG --write
   ```

   El script gira cada foto según su EXIF, la reduce a 2560 px como máximo, la
   guarda en WebP (calidad 82) sin metadatos (ni cámara ni GPS) y añade o
   actualiza la lista `photos` con el tamaño real de cada archivo. Sin
   `--write` solo imprime la lista para copiarla.

4. Escribe el `alt` de cada foto nueva: aparecen con `alt: ""` y
   `pnpm verify` falla hasta que las describas (ver
   [Textos alternativos](#textos-alternativos)).
5. Si quieres, crea las traducciones (ver [Traducciones](#traducciones)).
6. Revisa el evento con `pnpm dev`, ejecuta `pnpm verify` y despliega.

Opciones de `pnpm gallery:add <evento> [carpeta] [--cover <archivo>] [--write] [--force]`:

- `[carpeta]`: lee los originales de otra carpeta (nunca de `public/`).
- `--cover <archivo>`: genera también `cover.webp`, un recorte de 1600 × 900
  de ese original.
- `--write`: escribe la lista `photos` en el archivo en español y corrige las
  rutas en las traducciones.
- `--force`: vuelve a convertir las fotos aunque ya estén al día.

Puedes repetirlo cuando quieras: las fotos ya convertidas se saltan, cada
original conserva su número y los textos ya escritos se mantienen. Los
originales nunca se modifican ni se borran.

### Plantilla

```markdown
---
title: Nombre del evento
location: Ciudad, España
organizer:
  name: Entidad que organiza el evento
  url: https://www.entidad.es/
date: 2026-03-12 # primer día
endDate: 2026-03-14 # último día; omítelo si el evento dura un día
description: Resumen breve del evento.
icon: i-tabler-users-group # opcional
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
seo: # opcional; sin él se usan title y description
  title: Mi evento 2026 - Ciudad
  description: Galería de fotos de Mi evento, celebrado en Ciudad.
links: # opcional
  - label: Web oficial del evento
    url: https://www.evento.es/
draft: false # true lo oculta de la web
---

::event-about
Qué es el evento: contexto, quién lo organiza, qué actividades tuvo.
::

::event-participation
Qué hiciste tú: tu papel, tus responsabilidades y el resultado.
::
```

- `organizer` (`name` y `url`) es obligatorio: los buscadores lo leen como
  organizador del evento, y sin él lo atribuirían al propietario de la web.
- La duración («3 días») y las fechas que se muestran se calculan a partir de
  `date` y `endDate`, ambos en formato `YYYY-MM-DD`.
- `width` y `height` deben ser los del archivo; `pnpm gallery:add` los escribe
  y `pnpm verify` los comprueba, igual que el nombre exacto de cada archivo
  (mayúsculas incluidas).
- Los bloques `::event-about` y `::event-participation` son las dos tarjetas
  de texto de la página del evento («Sobre el evento» y «Mi participación»).
  Dentro se escribe Markdown normal: párrafos, **negrita** y listas.
- `draft: true` oculta el evento de la web, pero no lo hace privado: el
  contenido sigue en los datos públicos que genera la web. Lo que no deba
  publicarse todavía, guárdalo fuera de `content/`.

### Traducciones

`content/en/gallery/<evento>.md` y `content/de/gallery/<evento>.md` solo llevan
lo que traducen. Pueden incluir `title`, `location`, `organizer.name`,
`description`, `tags`, `cover` (mismo `src`, otro `alt`), `seo`, `links`, las
fotos y el texto del evento. Las fechas, el icono, el orden y el tamaño de las
fotos y la web del organizador salen siempre del archivo en español; si una
traducción los incluye, `pnpm verify` falla.

Cada foto se identifica por su `src` y solo lleva `alt` y, si la tiene,
`description`:

```yaml
photos:
  - src: /gallery/mi-evento/01.webp
    alt: Organising team introducing themselves on stage
```

- Lo que falte en la traducción (un campo, una foto o el texto del evento) se
  muestra en español. Una foto nueva en español aparece en todos los idiomas
  sin tocar las traducciones.
- `tags` y `links` sustituyen la lista completa: tradúcelas enteras.
- `draft: true` en una traducción la desactiva: ese idioma muestra el evento en
  español.

### Textos alternativos

El `alt` es lo que oye quien usa un lector de pantalla y lo que se ve si la
imagen no carga. Una buena descripción:

- Dice lo que se ve y por qué importa, en una frase corta (unas 5-15 palabras):
  «Mesa de ponentes durante una sesión plenaria».
- No empieza por «Foto de» o «Imagen de» ni repite el título del evento.
- No nombra a personas que no sean públicas; describe su papel («equipo
  organizador», «participantes»).
- No contiene notas internas, nombres de archivo ni textos como «TODO».
- Se traduce con el mismo sentido en cada idioma (inglés británico en `en`).

Si una foto no tiene la línea `alt`, la web genera un texto genérico
(«Título del evento - Foto 3») que no describe nada: es mejor escribirlo. Un
`alt: ""` vacío es un error de `pnpm verify`.

### Retocar o sustituir fotos

- Si retocas un original (un recorte, otro revelado), vuelve a ejecutar
  `pnpm gallery:add <evento> --write`: la foto se convierte otra vez con el
  mismo número y conserva sus textos. Los navegadores guardan las fotos en
  caché, así que quien ya la haya visto puede seguir viendo la anterior unos
  días.
- Para cambiar una foto por otra distinta, no guardes el original nuevo con el
  nombre del antiguo (heredaría su número y su `alt`): añádelo con otro nombre
  para que reciba un número nuevo. Después saca el original antiguo de
  `gallery-src/<evento>/` y borra su entrada de `photos` (también en las
  traducciones) y su `NN.webp`.

### Copias de seguridad

`public/gallery/` y `gallery-src/` no están en Git: guarda una copia de ambas
carpetas fuera del ordenador. Las fotos llegan a la web solo a través de la
imagen que construye `pnpm deploy:vps` en tu equipo, así que en un clon nuevo
del repositorio hay que restaurar `public/gallery/` antes de desplegar;
mientras falte, `pnpm verify` (y por tanto `pnpm build`) falla con «not found».

## Comprobar antes de publicar

`pnpm verify` ejecuta tres comprobaciones (también puedes lanzarlas por
separado):

- `pnpm verify:content`: los archivos de `content/profile/` y los datos de
  cada evento (campos, fechas, identificadores, iconos, capturas de proyectos,
  traducciones que solo se refieren a fotos del evento en español).
- `pnpm verify:i18n`: que los tres archivos de `i18n/locales/` tienen las
  mismas claves y ningún carácter especial suelto.
- `pnpm verify:gallery`: que cada imagen de la galería existe con ese nombre
  exacto y que `width` y `height` coinciden con el archivo.

Si todo está bien, termina con:

```text
Gallery assets verified (… references).
Content verified: 5 profile files, 4 gallery events.
i18n verified: 3 locales in parity.
```

Las líneas `warning:` no impiden publicar: indican textos que se mostrarán en
español porque falta su traducción.

`pnpm build` y `pnpm deploy:vps` ejecutan `pnpm verify` antes de construir. En
GitHub, cada cambio pasa `verify:content` y `verify:i18n` (no
`verify:gallery`, porque las fotos no están en el repositorio).

## Errores frecuentes

Los mensajes empiezan por el archivo y la ruta del campo: `items[2].end` es el
campo `end` del tercer elemento (se cuenta desde 0).

| Mensaje                                                                                        | Qué pasa y cómo arreglarlo                                                                                  |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `items[0].title.es: Invalid input: expected string, received undefined`                        | Falta el texto en español de ese campo.                                                                     |
| `items[0].title.en: must not be empty`                                                         | Un idioma está vacío (`en: ""`). Escribe la traducción o borra la línea.                                    |
| `items[0].start: use YYYY or YYYY-MM`                                                          | Fecha mal escrita (`06/2024`, `2024-6`). Usa `2024-06`.                                                     |
| `items[2].end: end must not be before start`                                                   | La fecha de fin es anterior a la de inicio.                                                                 |
| `items[1].id: duplicate id "…"`                                                                | Dos elementos de la lista tienen el mismo `id`.                                                             |
| `items[0]: Unrecognized key: "organisationUrl"`                                                | Campo con un nombre que no existe (una errata). Compáralo con las plantillas de esta guía.                  |
| `items[0].icon: icon "…" does not exist in @iconify-json/tabler`                               | El icono no existe. Búscalo en <https://icones.js.org> en la colección Tabler, Simple Icons o Circle Flags. |
| `items[1].showLink: showLink needs an organizationUrl to show`                                 | `showLink: true` sin `organizationUrl`.                                                                     |
| `items[0].organizationUrl: use an absolute https:// URL`                                       | La URL no empieza por `https://`.                                                                           |
| `items[1].badgeRole: must be at most 28 characters in every language`                          | La línea de la credencial es demasiado larga en algún idioma.                                               |
| `items[0].accent.from: use a theme colour token such as ember-500`                             | Color no válido: usa `ember`, `amber` o `blue` con un tono del 50 al 950.                                   |
| `languages[0].cefr: Invalid option: expected one of …`                                         | Nivel no válido: `A1`, `A2`, `B1`, `B2`, `C1`, `C2` o `native`.                                             |
| `items[0].screenshot.src: public/projects/….webp not found (check the exact file name)`        | La captura no está en `public/` o su nombre difiere (mayúsculas incluidas).                                 |
| `YAML Nested mappings are not allowed in compact mappings at line 87, column 11`               | Un texto contiene `: `. Ponlo entre comillas dobles.                                                        |
| `YAML Tabs are not allowed as indentation …`                                                   | Hay un tabulador en la sangría. Usa espacios.                                                               |
| `YAML All mapping items must start at the same column …` o `Sequence item without - indicator` | Sangría descuadrada cerca de esa línea. Alinea los campos del elemento con dos espacios.                    |
| `no collection reads this file (see content.config.ts)`                                        | Hay un archivo de más en `content/profile/`. Solo se leen los cinco de esta guía.                           |
| `photos[0].alt: must not be empty`                                                             | Una foto sigue con `alt: ""` tras `pnpm gallery:add`. Descríbela.                                           |
| `date: use a real calendar date as YYYY-MM-DD`                                                 | Fecha de evento mal escrita o inexistente (`2025-02-30`).                                                   |
| `endDate: endDate must not be before date`                                                     | El último día es anterior al primero.                                                                       |
| `organizer: Invalid input: expected object, received undefined`                                | Falta `organizer` (con `name` y `url`) en el evento en español.                                             |
| `photos[0].width: Invalid input: expected number, received undefined`                          | Foto sin tamaño. Ejecuta `pnpm gallery:add <evento> --write`.                                               |
| `photos[0] declares 2560x1707, the file is 2560x1706`                                          | El tamaño escrito no es el del archivo. Ejecuta `pnpm gallery:add <evento> --write`.                        |
| `cover.src /gallery/…/cover.webp not found (check the exact file name)`                        | Falta la imagen en `public/gallery/` o su nombre difiere. En un clon nuevo, restaura la copia de seguridad. |
| `photos[0].src: "…" is not a photo of the Spanish entry`                                       | Una traducción menciona una foto que no está en el archivo en español.                                      |
| `(root): Unrecognized key: "date"`                                                             | Una traducción incluye un campo que solo va en español (fechas, icono, tamaños).                            |
| `es: "credential.role.hero": "\|" splits the message into plural forms …`                      | Un mensaje de `i18n/locales/` contiene `\|`. Escribe `{'\|'}` o usa `·`.                                    |
| `en: "footer.contactLabel": "@" starts a linked message (write {'@'})`                         | Un mensaje contiene `@`. Escribe `{'@'}`.                                                                   |
| `de: missing "footer.contactLabel"`                                                            | Falta esa clave en el archivo de ese idioma.                                                                |
| `gallery:add: no folder gallery-src/<evento> with the original photos`                         | No existe la carpeta de originales (o el nombre del evento no coincide).                                    |
| `gallery:add: content/es/gallery/<evento>.md does not exist yet; …`                            | Crea primero el archivo del evento en español.                                                              |

## Textos que caducan

Estos textos hablan del presente y conviene revisarlos cuando cambie la
situación:

- `home.hero.pitch` (`i18n/locales/*.json`): el máster en curso y la estancia
  Erasmus+ en Ansbach.
- `training.yml`, estudios `mugeps`: «Actualmente realizo una estancia
  Erasmus+…», y el idioma `german`: el nivel y la estancia.
- `representation.yml`, hito `upv-digital-infrastructure`: «Actualmente
  desarrollo una plataforma…» y `current: true`.
- `experience.yml`: los puestos sin `end` (siguen como actuales) y su
  `organizationUrl`.
- `legal.updateDate`: actualízalo cada vez que cambie el aviso legal.
