# 👨‍💻 Portfolio de Iván Salido Cobo

Portfolio personal desarrollado con **Nuxt 4**, **Nuxt UI** y **TailwindCSS**.

🌐 **URLS de producción:** [ivan.wupp.dev](https://ivan.wupp.dev) e [isalidocobo.page](https://isalidocobo.page)

## ✨ Características

- **🎨 Diseño moderno** con Nuxt UI y tema personalizado rojo/coral
- **🌙 Modo oscuro/claro** con transiciones suaves y persistencia de preferencias
- **🌍 Internacionalización** (Español, Inglés y Alemán)
- **♿ Accesibilidad mejorada** (WCAG 2.1 AA)
- **🔍 SEO optimizado** con meta tags dinámicos y Open Graph
- **📱 Responsive completo** (mobile-first)
- **⚡ Rendimiento optimizado** (SSR, lazy loading, Nuxt Image)
- **📄 Multi-página** (Inicio, Experiencia, Proyectos, Galería, Formación, Representación, Contacto y Legal)
- **📸 Galería de eventos** con Nuxt Content (filtros, búsqueda y paginación)
- **✉️ Formulario de contacto** con API endpoint
- **🎭 Easter egg** con modal de chistes aleatorios

## 🛠️ Stack Tecnológico

| Tecnología    | Uso                      |
| ------------- | ------------------------ |
| Nuxt 4        | Framework Vue con SSR    |
| Nuxt UI       | Sistema de componentes   |
| TailwindCSS   | Estilos utility-first    |
| @nuxt/image   | Optimización de imágenes |
| @nuxt/content | Sistema de contenidos    |
| @nuxtjs/i18n  | Internacionalización     |
| @nuxtjs/seo   | SEO                      |
| Nodemailer    | Envío de emails          |
| Docker        | Build y despliegue       |
| Nginx         | Reverse proxy            |

## 📁 Estructura del Proyecto

```
ivan/
├── app/                               # Aplicación Nuxt (frontend)
│   ├── assets/                        # Assets procesados por Vite
│   │   ├── css/
│   │   │   └── main.css               # Estilos globales, tema y animaciones
│   │   ├── jokes-es.json              # Chistes en español
│   │   ├── jokes-en.json              # Chistes en inglés
│   │   └── jokes-de.json              # Chistes en alemán
│   ├── components/                    # Componentes reutilizables
│   │   ├── LayoutFooter.vue           # Footer con enlaces legales y redes
│   │   ├── LayoutHeader.vue           # Header con navegación principal
│   │   └── content/                   # Componentes MDC para Nuxt Content
│   │       ├── EventAbout.vue         # Sección "Sobre el evento"
│   │       └── EventParticipation.vue # Sección "Mi participación"
│   ├── composables/                   # Lógica reutilizable
│   │   ├── useGalleryCollection.ts    # Gestión de colecciones por idioma
│   │   ├── useGalleryEvents.ts        # Filtros, búsqueda y paginación
│   │   └── useGalleryImages.ts        # Utilidades para imágenes (src, alt)
│   ├── layouts/                       # Layouts globales
│   │   └── default.vue                # Layout principal con estructura semántica
│   ├── pages/                         # Rutas automáticas de Nuxt
│   │   ├── index.vue                  # Página de inicio
│   │   ├── experiencia.vue            # Experiencia profesional
│   │   ├── proyectos.vue              # Proyectos y stack
│   │   ├── galeria.vue                # Galería de eventos
│   │   ├── formacion.vue              # Formación académica
│   │   ├── representacion.vue         # Cargos de representación
│   │   ├── contacto.vue               # Formulario de contacto
│   │   └── legal.vue                  # Aviso legal y privacidad
│   └── utils/                         # Utilidades auxiliares
│       ├── i18nAst.ts                 # Utilidades para i18n
│       ├── locales.ts                 # Configuración de idiomas y chistes
│       └── nuxtUiLocale.ts            # Configuración de idioma para Nuxt UI
│
├── content/                           # Contenido gestionado por Nuxt Content
│   ├── es/
│   │   └── gallery/                   # Eventos base en español
│   │       ├── ceeina-2025.md
│   │       ├── creup-ago-78.md
│   │       ├── creup-riano.md
│   │       └── enem-2025.md
│   ├── en/
│   │   └── gallery/                   # Traducciones de eventos (inglés)
│   │       └── ...
│   └── ...
│
├── content.config.ts                  # Configuración de colecciones Nuxt Content
│
├── server/                            # Código ejecutado solo en servidor
│   └── api/
│       └── contact.post.ts            # Endpoint API del formulario de contacto
│
├── i18n/                              # Configuración de internacionalización
│   └── locales/
│       ├── es.json                    # Traducciones español
│       ├── en.json                    # Traducciones inglés
│       └── de.json                    # Traducciones alemán
│
├── public/                            # Assets estáticos servidos tal cual
│   ├── profile-pic.jpg                # Foto de perfil
│   ├── full-pic.jpg                   # Imagen hero
│   └── favicon.svg                    # Favicon público (formato .svg)
│   └── favicon.ico                    # Favicon público (formato .ico)
│
├── Dockerfile                         # Imagen Docker de producción (multi-stage)
├── docker-compose.yml                 # Orquestación local y VPS
├── .dockerignore                      # Exclusiones para build Docker
├── deploy.sh                          # Script de build + push + deploy remoto
├── .env.example                       # Template de variables de entorno
├── package.json                       # Scripts, dependencias y deploy
└── pnpm-lock.yaml                     # Lockfile de dependencias
```

## 🛠️ Desarrollo

### Requisitos

- Node.js ≥ 18
- pnpm
- Docker
- **Linux o WSL (obligatorio para scripts de deploy)**

### Instalación

```bash
pnpm install
```

### Desarrollo

```bash
pnpm dev
```

Disponible en `http://localhost:3000`.

---

## 🐳 Docker y Despliegue

El proyecto está preparado para **desplegarse con Docker** usando una imagen optimizada y `docker compose`.

### Archivos de despliegue

- **Dockerfile** → build multi-stage (Node 24 + pnpm)
- **.dockerignore** → exclusiones para el build
- **docker-compose.yml** → ejecución local y en VPS
- **deploy.sh** → build, push a GHCR y despliegue remoto

---

## 🔐 Variables de entorno (`.env`)

Las siguientes variables se cargan desde un archivo `.env` (no versionado).

### `.env.example`

```env
VPS_HOST=
REMOTE_DIR=
```

### Variables usadas

- **VPS_HOST** → usuario y host del VPS
- **REMOTE_DIR** → directorio donde vive `docker-compose.yml` en el VPS

Copia el archivo y rellénalo:

```bash
cp .env.example .env
```

---

## 🚀 Scripts de Deploy

En el `package.json` existen **dos scripts de despliegue**.

> ⚠️ **La imagen de docker está fija a este repositorio**.

### Deploy local (sin push)

Construye la imagen Docker localmente y levanta el contenedor con Docker Compose.

```bash
pnpm run deploy:local
```

### Deploy a producción

Ejecuta `deploy.sh`, que:
1. Construye la imagen Docker
2. La sube a GitHub Container Registry
3. Se conecta al VPS
4. Hace `docker compose pull` y `up -d`

```bash
pnpm run deploy
```

---

## ♿ Accesibilidad

Cumple **WCAG 2.1 AA**:

- Skip link
- ARIA labels y roles semánticos
- Navegación por teclado
- Contraste optimizado
- Textos alternativos en imágenes

---

## 📸 Galería de Eventos

Implementada con **Nuxt Content**:

- Colecciones multiidioma
- Componentes MDC personalizados
- Filtros y búsqueda
- Paginación
- Modal accesible
- SEO por evento
- Optimización de imágenes con IPX

---

## 🎨 Diseño y UX

- Paleta rojo/coral personalizada
- Animaciones suaves
- Layout mobile-first
- Iconos Tabler vía Iconify
- Componentes reutilizables con Nuxt UI

---

## 📧 Formulario de Contacto

- Validación en cliente
- Honeypot anti-spam
- API `/api/contact`
- Envío de emails con Nodemailer
- Feedback visual
- Cumplimiento RGPD

---

## 📄 Licencia

MIT  
Código disponible en GitHub: https://github.com/ComicIvans/ivan