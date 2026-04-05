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

- Node.js compatible con Nuxt 4
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

### SMTP

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `SMTP_TO_EMAIL`

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
- `content/` — contenido editorial de la galería por idioma.
- `i18n/locales/` — mensajes de traducción.
- `server/api/` — endpoints del servidor, incluido el formulario de contacto.
- `server/utils/` — utilidades de configuración y soporte del servidor.
- `public/` — imágenes y assets estáticos.
- `modules/` — ajustes locales de módulos de Nuxt.

## Contenido y localización

- El español es el idioma base del sitio.
- Las traducciones de galería pueden sobrescribir parcialmente el contenido base; si falta algo, se conserva la versión en español.
- El texto visible al usuario debe salir de `i18n` o del contenido localizado, no de cadenas sueltas en componentes.

## Licencia

MIT
