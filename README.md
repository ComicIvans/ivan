# Iván

Portfolio personal de Iván Salido Cobo construido con Nuxt 4, Nuxt UI y Nuxt Content. Incluye una web pública multidioma, una galería editorial gestionada desde Markdown y un formulario de contacto con envío por SMTP.

URLs de producción:

- [ivan.wupp.dev](https://ivan.wupp.dev)
- [isalidocobo.page](https://isalidocobo.page)

## Qué incluye

- Web pública SSR con SEO, accesibilidad e i18n.
- Páginas de presentación, experiencia, proyectos, formación, representación, contacto y legal.
- Galería de eventos con contenido en Markdown, fallback al contenido base en español y optimización de imágenes.
- Formulario de contacto protegido con honeypot, rate limiting básico y validación del servidor.
- Despliegue con Docker y script de publicación en VPS.

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
- `pnpm`
- Docker y Docker Compose para el despliegue local o en VPS
- Linux o WSL para usar los scripts de despliegue

## Desarrollo local

1. Instala dependencias:

```sh
pnpm install
```

2. Crea tu `.env` a partir de `.env.example`.

3. Ejecuta la aplicación:

```sh
pnpm dev
```

4. Comprueba calidad cuando cambies lógica o estructura:

```sh
pnpm lint
pnpm typecheck
```

## Variables de entorno

### Aplicación

- `SITE_URL`
- `NUXT_APP_SECRET`: secreto raíz con el que se firman las URL `/_og/*` de las
  imágenes para redes sociales. Es obligatorio en producción: sin él, todas esas
  imágenes responden 500. Debe tener al menos 32 caracteres (por ejemplo,
  `openssl rand -base64 32`) y mantenerse igual entre despliegues para que las
  URL ya compartidas sigan siendo válidas. Solo se usa en tiempo de ejecución:
  llega al contenedor por el `env_file` de `docker-compose.yml` y nunca se
  incluye en la imagen.

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
diez minutos después de que termine su ventana.

`DATA_DIR` (solo en tiempo de compilación) fija dónde escribe el servidor la base
de datos de Nuxt Content y el limitador: la imagen de Docker usa `/data` y
cualquier otra compilación, `.data/production` dentro del proyecto.

Los binarios de la galería se mantienen fuera de Git. Antes de construir o
desplegar hay que restaurar `public/gallery/` desde la copia privada; los
originales de las fotos van en `gallery-src/`, que tampoco entra en Git ni en
la imagen Docker. `pnpm gallery:add <slug>` convierte esos originales en las
fotos que se publican (ver `public/gallery/README.md`). `pnpm build` ejecuta
antes `pnpm verify`, que falla si el contenido referencia una imagen ausente
(o con otras mayúsculas) o declara un tamaño que no es el del archivo, si el
contenido no cumple su esquema o si los archivos de traducción no están
alineados.

### Analítica

- `NUXT_UMAMI_HOST`
- `NUXT_UMAMI_ID`

Las variables de Umami son opcionales. Si faltan, la analítica queda desactivada.

### Despliegue

- `VPS_HOST`
- `REMOTE_DIR`
- `IMAGE` (opcional, por defecto `ghcr.io/comicivans/ivan:latest`)
- `DOCKER_PLATFORM` (opcional, por defecto `linux/amd64`)

## Scripts útiles

- `pnpm dev`
- `pnpm build`
- `pnpm preview`
- `pnpm lint`
- `pnpm lint:fix`
- `pnpm typecheck`
- `pnpm verify` (`verify:gallery`, `verify:content` y `verify:i18n`)
- `pnpm gallery:add <slug> [carpeta] [--cover <archivo>] [--write]`
- `pnpm deploy:local`
- `pnpm deploy`

## Despliegue

### Local

Construye la imagen local con los `build-arg` disponibles (`SITE_URL` y, opcionalmente, Umami) y levanta el contenedor con `docker compose`:

```sh
pnpm deploy:local
```

`deploy-local.sh` requiere que exista `.env` y que `SITE_URL` esté definido.

### Producción

Ejecuta `deploy.sh`, que carga variables desde `.env` (si existe), construye y publica la imagen (con `docker buildx` cuando está disponible) y actualiza el despliegue remoto:

```sh
pnpm deploy
```

## Estructura principal

- `app/` — componentes, layouts, páginas, composables y estilos globales.
- `content/` — perfil (`content/profile/*.yml`) y galería por idioma.
- `i18n/locales/` — mensajes de traducción.
- `server/api/` — endpoints del servidor, incluido el formulario de contacto.
- `server/utils/` — utilidades de configuración y soporte del servidor.
- `public/` — imágenes y assets estáticos.
- `modules/` — ajustes locales de módulos de Nuxt.

## Contenido y localización

- El español es el idioma base del sitio.
- Las traducciones de galería pueden sobrescribir parcialmente el contenido base; si falta algo, se conserva la versión en español. Las fotos se traducen por `src`: cada traducción lista solo `src` y `alt` (y `description`), y el orden y los tamaños salen del archivo en español.
- El texto visible al usuario debe salir de `i18n` o del contenido localizado, no de cadenas sueltas en componentes.
- La trayectoria (áreas destacadas, experiencia, representación, proyectos y formación) vive en `content/profile/<sección>.yml`, con los tres idiomas juntos en cada campo (`es` obligatorio, `en` y `de` opcionales). Fechas como `YYYY` o `YYYY-MM`; un elemento sin `end` se considera actual. Contadores, cargo actual y datos estructurados se calculan a partir de esos archivos. Con `showLink: true`, la web (`organizationUrl`) de un puesto se muestra como enlace; `repository` añade a un proyecto el enlace a GitHub, y `current: true` marca un hito de representación como vigente («Mayo de 2026 – Actualidad»). La lista `topics` de `highlights.yml` añade a los datos estructurados (`knowsAbout`) los temas que solo aparecen en el texto, como la carrera o la representación estudiantil.
- Los títulos de sección y textos de interfaz siguen en `i18n/locales/`. En esos mensajes, `|`, `@`, `{` y `}` son sintaxis de vue-i18n: escríbelos como `{'|'}`, `{'@'}`, `{'{'}` y `{'}'}`.

## Licencia

MIT
