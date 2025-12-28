# 👨‍💻 Portfolio de Iván Salido Cobo

Portfolio personal desarrollado con **Nuxt 4**, **Nuxt UI** y **TailwindCSS**.

🌐 **URL de producción:** [ivan.wupp.dev](https://ivan.wupp.dev)

## ✨ Características

- **🎨 Diseño moderno** con Nuxt UI y tema personalizado rojo/coral
- **🌙 Modo oscuro/claro** con transiciones suaves y persistencia de preferencias
- **🌍 Internacionalización** (Español, Inglés y Alemán) con selector de idiomas y chistes localizados
- **♿ Accesibilidad mejorada** - WCAG 2.1 AA, navegación por teclado, ARIA labels, skip links, roles semánticos, aria-hidden en iconos decorativos
- **🔍 SEO optimizado** - Meta tags dinámicos, Open Graph por página
- **📱 Responsive perfecto** - diseño adaptativo con slideover en móvil y foto de perfil centrada
- **⚡ Rendimiento optimizado** - SSR, lazy loading de imágenes con NuxtImg, iconos optimizados
- **📄 Multi-página** - 8 páginas: Inicio, Experiencia, Proyectos, Galería, Formación, Representación, Contacto y Legal
- **✉️ Formulario de contacto** con validación y API endpoint
- **🎭 Easter egg** - Modal de chistes aleatorios al hacer clic en la foto de perfil

## 🛠️ Stack Tecnológico

| Tecnología                                                | Uso                                |
| --------------------------------------------------------- | ---------------------------------- |
| [Nuxt 4](https://nuxt.com)                                | Framework de Vue.js con SSR        |
| [Nuxt UI v3](https://ui.nuxt.com)                         | Sistema de componentes (Radix Vue) |
| [TailwindCSS](https://tailwindcss.com)                    | Utility-first CSS (v4.1)           |
| [@nuxt/image](https://image.nuxt.com)                     | Optimización de imágenes           |
| [@nuxtjs/seo](https://nuxtseo.com)                        | SEO y meta tags                    |
| [@nuxtjs/i18n](https://i18n.nuxtjs.org)                   | Internacionalización (i18n v10)    |
| [@formkit/auto-animate](https://auto-animate.formkit.com) | Animaciones automáticas            |
| [Iconify](https://iconify.design)                         | Iconos (Tabler Icons)              |
| [Nodemailer](https://nodemailer.com)                      | Envío de emails desde API          |

## 📁 Estructura del Proyecto

```
app/
├── assets/
│   ├── css/main.css       # Estilos globales, animaciones y tema personalizado
│   ├── jokes-es.json      # Chistes en español (easter egg, lazy loaded)
│   ├── jokes-en.json      # Chistes en inglés (easter egg, lazy loaded)
│   └── jokes-de.json      # Chistes en alemán (easter egg, lazy loaded)
├── components/
│   ├── LayoutHeader.vue   # Header con navegación, tema, idioma y foto de perfil
│   └── LayoutFooter.vue   # Footer con copyright, legal y redes sociales
├── layouts/
│   └── default.vue        # Layout principal con skip link y estructura semántica
├── pages/
│   ├── index.vue          # Página de inicio con hero y highlights
│   ├── experiencia.vue    # Timeline de experiencia profesional
│   ├── proyectos.vue      # Stack tecnológico y proyectos destacados
│   ├── galeria.vue        # Galería de eventos (con placeholders)
│   ├── formacion.vue      # Formación académica, idiomas y competencias
│   ├── representacion.vue # Timeline completo de cargos de representación
│   ├── contacto.vue       # Formulario de contacto con validación
│   └── legal.vue          # Aviso legal, cookies, privacidad y RGPD
├── utils/
│   ├── i18nAst.ts         # Utilidades para i18n AST (getI18nStaticValue)
│   └── locales.ts         # Configuración de idiomas y carga de chistes
├── server/
│   └── api/
│       └── contact.post.ts # API endpoint para formulario de contacto
i18n/
└── locales/
    ├── es.json            # Traducciones español (completas)
    ├── en.json            # Traducciones inglés (completas)
    └── de.json            # Traducciones alemán (completas)
public/
├── profile-pic.jpg        # Foto de perfil circular (128x128)
├── full-pic.jpg           # Foto completa para hero (560x746)
└── favicon.svg            # Favicon SVG
```

## 🚀 Desarrollo

### Requisitos previos

- Node.js >= 18
- pnpm (recomendado)

### Instalación

```bash
pnpm install
```

### Servidor de desarrollo

```bash
pnpm dev
```

La página estará disponible en `http://localhost:3000`

### Producción

```bash
# Construir para producción
pnpm build

# Previsualizar build
pnpm preview
```

## ♿ Accesibilidad

El sitio cumple con **WCAG 2.1 nivel AA**:

- **Skip link** visible al enfocar para saltar al contenido principal
- **ARIA labels** en todos los elementos interactivos (botones, enlaces, formularios)
- **ARIA attributes** completos:
  - `aria-hidden="true"` en iconos decorativos
  - `aria-expanded` en menú hamburguesa
  - `aria-controls` vinculando controles con sus targets
  - `aria-current="page"` en enlaces activos
  - `aria-describedby` en formularios
- **Roles semánticos** correctos (navigation, region, contentinfo, main)
- **Navegación por teclado** completa con indicadores de focus visibles
- **Contraste de colores** optimizado en modo claro y oscuro
- **Focus indicators** personalizados con `focus-visible:ring-2`
- **Textos alternativos** descriptivos en todas las imágenes
- **Estructura semántica** con headings jerárquicos (h1, h2, h3)
- **Formularios accesibles** con labels, validación y mensajes de error
- **Componentes accesibles** nativos de Nuxt UI v3 (basados en Radix Vue)

## 🎨 Diseño y UX

- **Tema personalizado** con paleta rojo/coral como color primario
- **Transiciones suaves** entre modo oscuro y claro con auto-animate
- **Animaciones sutiles** en entrada de secciones y hover de elementos
- **Tipografía optimizada** con fuentes del sistema
- **Espaciado consistente** usando sistema de diseño de Tailwind
- **Componentes reutilizables** con Nuxt UI v3
- **Layout responsive** con breakpoints mobile-first
- **Foto de perfil centrada** perfectamente en móvil con contenedores de ancho fijo
- **Iconos consistentes** de Tabler Icons vía Iconify

## 📧 Formulario de Contacto

El formulario incluye:

- **Validación en cliente** (nombre, email, asunto, mensaje)
- **Honeypot field** para protección anti-spam
- **API endpoint** en `/api/contact` (POST) con Nodemailer
- **Toast notifications** para feedback al usuario
- **Estados de carga** durante el envío
- **Cumplimiento RGPD** con nota de privacidad

## 📄 Licencia

MIT - Consulta el código en [GitHub](https://github.com/ComicIvans/ivan)
