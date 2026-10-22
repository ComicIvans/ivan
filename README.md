# Iván

Portfolio personal de Iván Salido Cobo construido con Nuxt 4, Nuxt UI y Nuxt Content. Incluye una web pública multidioma, una galería editorial gestionada desde Markdown y un formulario de contacto con envío por SMTP.

URL de producción: [isalidocobo.page](https://isalidocobo.page). El dominio
secundario [ivan.wupp.dev](https://ivan.wupp.dev) debe redirigir a ella con
un 301 (ver [docs/nginx.md](docs/nginx.md)).

## Qué incluye

- Web pública SSR con SEO, accesibilidad e i18n en español (idioma base), inglés
  y alemán.
- Una página de inicio con secciones (`#inicio`, `#experiencia`,
  `#representacion`, `#proyectos`, `#formacion`, `#galeria` y `#contacto`),
  más la galería (`/galeria`, `/en/gallery`, `/de/galerie`) y el aviso legal
  (`/legal`, `/en/legal`, `/de/impressum`). Las antiguas páginas sueltas
  (`/experiencia`, `/en/projects`…) redirigen con un 301 a su sección.
- Trayectoria en archivos YAML (`content/profile/`), con los tres idiomas
  juntos en cada campo; contadores, cargo actual y datos estructurados se
  calculan a partir de ellos.
- Galería de eventos con contenido en Markdown, fallback al contenido base en español y optimización de imágenes.
- Formulario de contacto protegido con honeypot, rate limiting básico y validación del servidor.
- Despliegue con Docker y script de publicación en VPS.

Para editar textos, añadir elementos o publicar fotos, consulta la
[guía de contenido](CONTENIDO.md).

## Stack

- Nuxt 4 + Nitro
- Nuxt UI + Tailwind CSS
- `@nuxtjs/i18n`
- `@nuxt/content`
- `@nuxtjs/seo`
- `@nuxt/image`
- Nodemailer

## Requisitos

- Node.js 24 (`engines`: >= 24.15.0), la misma versión mayor que usa la imagen de Docker
- pnpm 12 (la versión exacta está en `packageManager` de `package.json`; se
  instala, por ejemplo, con `npm install --global pnpm@12`)
- Docker y Docker Compose para el despliegue local o en VPS
- Linux o WSL para usar los scripts de despliegue

## Desarrollo local

1. Instala dependencias:

```sh
pnpm install
```

2. Crea tu `.env` a partir de `.env.example`. Para desplegar hace falta
   además `.env.deploy` (ver «Variables de entorno»).

3. Ejecuta la aplicación:

```sh
pnpm dev
```

4. Comprueba el contenido y, cuando cambies lógica o estructura, el código:

```sh
pnpm verify
pnpm lint
pnpm typecheck
```

## Variables de entorno

Se reparten en dos archivos, ambos fuera de Git:

- `.env` (a partir de `.env.example`): lo que lee la aplicación. En local lo
  cargan `pnpm dev` y `pnpm build`; en el servidor, `docker-compose.yml` lo
  pasa al contenedor (`env_file`), así que allí solo necesita las variables
  de tiempo de ejecución: SMTP, `NUXT_APP_SECRET` y, si hace falta,
  `NUXT_SITE_INDEXABLE`.
- `.env.deploy` (a partir de `.env.deploy.example`): lo que usan
  `pnpm deploy:local` y `pnpm deploy:vps`, es decir, los `build-arg` de la
  imagen, el acceso al VPS y las credenciales de GHCR. Nunca llega al
  contenedor.

### Aplicación

- `SITE_URL`: URL canónica del sitio. Se lee al compilar: va en `.env` para
  `pnpm dev` y `pnpm build`, y en `.env.deploy` para la imagen de Docker.
- `NUXT_APP_SECRET`: secreto raíz con el que se firman las URL `/_og/*` de las
  imágenes para redes sociales. Es obligatorio en producción: sin él, todas esas
  imágenes responden 500. Debe tener al menos 32 caracteres (por ejemplo,
  `openssl rand -base64 32`) y mantenerse igual entre despliegues para que las
  URL ya compartidas sigan siendo válidas. Solo se usa en tiempo de ejecución:
  llega al contenedor por el `env_file` de `docker-compose.yml` y nunca se
  incluye en la imagen.
- `NUXT_SITE_INDEXABLE` (opcional): `docker-compose.yml` lo deja en `true`
  salvo que `.env` indique `false`, para despliegues de prueba que no deben
  aparecer en buscadores.

### SMTP

- `NUXT_SMTP_HOST`
- `NUXT_SMTP_PORT`
- `NUXT_SMTP_SECURE`
- `NUXT_SMTP_USER`
- `NUXT_SMTP_PASS`
- `NUXT_SMTP_FROM_EMAIL`
- `NUXT_SMTP_TO_EMAIL`

La aplicación espera un único proxy inverso (nginx) delante que añada la IP del
cliente al final de `X-Forwarded-For` (`$proxy_add_x_forwarded_for` o
`$remote_addr`). Para los controles de abuso solo cuenta la última entrada de
esa cabecera, la que añade el proxy; sin la cabecera se usa la dirección de la
conexión. El limitador de peticiones guarda en el directorio de datos
(`/data/ratelimit` en Docker) un contador por cliente bajo un HMAC de su IP
derivado de `NUXT_APP_SECRET`, nunca la IP, y borra cada registro como mucho
diez minutos después de que termine su ventana. La configuración
recomendada de nginx está en [docs/nginx.md](docs/nginx.md).

`DATA_DIR` (solo en tiempo de compilación) fija dónde escribe el servidor la base
de datos de Nuxt Content y el limitador: la imagen de Docker usa `/data` y
cualquier otra compilación, `.data/production` dentro del proyecto.

Los binarios de la galería se mantienen fuera de Git. Antes de construir o
desplegar hay que restaurar `public/gallery/` desde la copia privada; los
originales de las fotos van en `gallery-src/`, que tampoco entra en Git ni en
la imagen Docker. `pnpm gallery:add <slug>` convierte esos originales en las
fotos que se publican (ver [CONTENIDO.md](CONTENIDO.md)). `pnpm build` ejecuta
antes `pnpm verify`, que falla si el contenido referencia una imagen ausente
(o con otras mayúsculas) o declara un tamaño que no es el del archivo, si el
contenido no cumple su esquema o si los archivos de traducción no están
alineados.

### Analítica

- `NUXT_UMAMI_HOST`
- `NUXT_UMAMI_ID`

Las variables de Umami son opcionales. Si faltan, la analítica queda desactivada.
Se leen al compilar, así que para la imagen de Docker van en `.env.deploy`.

### Despliegue

Van en `.env.deploy`:

- `SITE_URL`, `NUXT_UMAMI_HOST` y `NUXT_UMAMI_ID`: `build-arg` de la imagen.
- `VPS_HOST`: destino SSH (`usuario@host`).
- `REMOTE_DIR`: directorio absoluto del VPS que contiene el `.env` de
  ejecución; `pnpm deploy:vps` copia ahí `docker-compose.yml` en cada
  despliegue.
- `GHCR_USERNAME` y `GHCR_TOKEN`: token de GitHub con `write:packages` para
  publicar la imagen privada y `read:packages` para descargarla en el VPS.
  Sin ellos, cada máquina necesita un `docker login ghcr.io` previo.
- `IMAGE` (opcional, por defecto `ghcr.io/comicivans/ivan:latest`): los
  scripts también se lo pasan a `docker compose`.
- `DOCKER_PLATFORM` (opcional, por defecto `linux/amd64`)

Si no existe `.env.deploy`, los scripts leen estas variables de `.env` (el
formato antiguo, con todo en un archivo) y lo avisan.

## Scripts útiles

- `pnpm dev`: servidor de desarrollo en <http://localhost:3000>.
- `pnpm build`: `pnpm verify` y compilación de producción en `.output/`.
- `pnpm preview`: sirve la compilación de producción.
- `pnpm lint` y `pnpm lint:fix`: ESLint con Prettier.
- `pnpm typecheck`: comprobación de tipos con `vue-tsc`.
- `pnpm verify`: ejecuta las tres comprobaciones de contenido:
  - `verify:content`: valida `content/profile/*.yml` y los datos de cada
    evento con los esquemas de `shared/content/schemas.ts`, los iconos y las
    capturas de proyectos.
  - `verify:i18n`: los tres archivos de `i18n/locales/` tienen las mismas
    claves y ningún `|`, `@`, `{` o `}` suelto.
  - `verify:gallery`: cada imagen de la galería existe con ese nombre exacto y
    su `width`/`height` coincide con el archivo.
- `pnpm gallery:add <slug> [carpeta] [--cover <archivo>] [--write] [--force]`:
  convierte los originales de `gallery-src/<slug>/` en las fotos WebP de
  `public/gallery/<slug>/` y actualiza su lista en el contenido.
- `pnpm deploy:local` y `pnpm deploy:vps`: ver «Despliegue».

## Integración continua

`.github/workflows/quality.yml` se ejecuta en cada pull request y en cada
push a `main`: instala las dependencias con la versión de pnpm de
`packageManager` y ejecuta `verify:content`, `verify:i18n`, `lint`,
`typecheck` y `nuxt build`. `verify:gallery` solo se ejecuta en local (con
`pnpm build` o `pnpm verify`), porque las fotos de la galería no están en el
repositorio.

## Despliegue

### Local

Construye la imagen local con los `build-arg` de `.env.deploy` (`SITE_URL` y,
opcionalmente, Umami) y levanta el contenedor con `docker compose`, que lee
`.env`:

```sh
pnpm deploy:local
```

`deploy-local.sh` requiere `.env` y que `SITE_URL` esté definido en
`.env.deploy`.

### Producción

Ejecuta `deploy.sh`, que carga `.env.deploy`, construye y publica la imagen
(con `docker buildx` cuando está disponible), copia `docker-compose.yml` a
`REMOTE_DIR` y, en el VPS, descarga la imagen y recrea el contenedor:

```sh
pnpm deploy:vps
```

`pnpm deploy` no sirve: es un comando propio de pnpm (despliegue de
paquetes de un workspace) y no ejecuta este script.

Preparación del VPS (una sola vez):

1. Instala Docker con el plugin Compose y crea `REMOTE_DIR`.
2. Crea en `REMOTE_DIR` un `.env` solo con las variables de ejecución de
   `.env.example` (SMTP, `NUXT_APP_SECRET` y, si hace falta,
   `NUXT_SITE_INDEXABLE`).
3. Configura nginx delante de la aplicación según
   [docs/nginx.md](docs/nginx.md).

Cada despliegue sobrescribe el `docker-compose.yml` del VPS con el del
repositorio: los cambios hechos a mano allí se pierden.

Si vienes del formato antiguo, con un único `.env`:

1. Crea `.env.deploy` a partir de `.env.deploy.example`. Mueve a él
   `VPS_HOST`, `REMOTE_DIR`, `GHCR_USERNAME`, `GHCR_TOKEN` y, si los usas,
   `IMAGE` y `DOCKER_PLATFORM`; copia `SITE_URL` y las variables de Umami,
   que `pnpm dev` sigue leyendo de `.env`.
2. Quita esas variables de despliegue del `.env` local y del `.env` del VPS
   para que no lleguen al contenedor.

## Estructura principal

- `app/` — páginas (`index.vue`, `galeria/`, `legal.vue`), secciones del
  inicio (`components/sections/`), credencial animada
  (`components/credential/`), composables y estilos globales.
- `content/` — trayectoria (`content/profile/*.yml`) y galería por idioma
  (`content/<idioma>/gallery/`).
- `i18n/locales/` — textos de interfaz en español, inglés y alemán.
- `server/api/` — endpoints del servidor: perfil, galería, formulario de
  contacto, informes CSP y estado.
- `server/utils/` — utilidades de configuración y soporte del servidor.
- `shared/` — código común a la aplicación, el servidor y los scripts,
  incluidos los esquemas del contenido (`shared/content/schemas.ts`).
- `scripts/` — `pnpm verify` y `pnpm gallery:add`.
- `public/` — imágenes y assets estáticos.
- `modules/` — ajustes locales de módulos de Nuxt.
- `docs/` — notas de operación (nginx).
- `CONTENIDO.md` — guía para editar el contenido.

## Contenido y localización

- El español es el idioma base y el de reserva: cualquier texto sin
  traducción se muestra en español.
- La trayectoria vive en `content/profile/<sección>.yml`, con los tres idiomas
  juntos en cada campo (`es` obligatorio, `en` y `de` opcionales). Los eventos
  de la galería son archivos Markdown por idioma; las traducciones solo llevan
  lo que traducen.
- Los títulos de sección y los textos de interfaz están en `i18n/locales/`.
- El texto visible al usuario debe salir de `i18n` o del contenido localizado,
  no de cadenas sueltas en componentes.

Cómo editar y añadir cada tipo de contenido, la galería paso a paso y los
errores habituales de `pnpm verify` están en [CONTENIDO.md](CONTENIDO.md).

## Licencia

El código se publica con licencia MIT. Las fotografías (retratos y galería) y
los textos del sitio (`content/`, `i18n/locales/` y los chistes de
`app/assets/`) quedan fuera: pertenecen a Iván Salido Cobo o a sus autores,
con todos los derechos reservados. `app/components/bits/Aurora.vue` procede
de Vue Bits y conserva su propia licencia (MIT + Commons Clause). Los
detalles están en [LICENSE](LICENSE).
