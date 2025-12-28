# 👨‍💻 Portfolio de Iván Salido Cobo

Portfolio personal desarrollado con **Nuxt 4**, **TailwindCSS** y **DaisyUI 5**.

🌐 **URL de producción:** [ivan.wupp.dev](https://ivan.wupp.dev)

## ✨ Características

- **🎨 Diseño moderno** con DaisyUI 5 y componentes semánticos
- **🌙 Modo oscuro/claro** con persistencia de preferencias
- **🌍 Internacionalización** (Español, Inglés y Alemán) con selector de banderas y chistes localizados
- **♿ Accesibilidad** - WCAG 2.1, navegación por teclado, ARIA labels, skip links, roles semánticos
- **🔍 SEO optimizado** - Schema.org, meta tags, Open Graph por página
- **📱 Responsive** - diseño adaptativo con menú drawer en móvil
- **⚡ Rendimiento** - SSR, lazy loading de imágenes y recursos, iconos optimizados
- **📄 Multi-página** - rutas separadas para Sobre mí, Habilidades y Representación

## 🛠️ Stack Tecnológico

| Tecnología                                          | Uso                             |
| --------------------------------------------------- | ------------------------------- |
| [Nuxt 4](https://nuxt.com)                          | Framework de Vue.js con SSR     |
| [TailwindCSS](https://tailwindcss.com)              | Utility-first CSS               |
| [DaisyUI 5](https://daisyui.com)                    | Componentes UI                  |
| [Nuxt Icon](https://nuxt.com/modules/icon)          | Iconos con @iconify-json/tabler |
| [@nuxtjs/seo](https://nuxtseo.com)                  | SEO y Schema.org                |
| [@nuxtjs/i18n](https://i18n.nuxtjs.org)             | Internacionalización            |
| [@nuxtjs/color-mode](https://color-mode.nuxtjs.org) | Modo oscuro/claro               |
| [@vueuse/nuxt](https://vueuse.org)                  | Composables de utilidad         |

## 📁 Estructura del Proyecto

```
app/
├── assets/
│   ├── css/main.css       # Estilos globales y animaciones
│   ├── jokes-es.json      # Chistes en español (easter egg, lazy loaded)
│   ├── jokes-en.json      # Chistes en inglés (easter egg, lazy loaded)
│   └── jokes-de.json      # Chistes en alemán (easter egg, lazy loaded)
├── components/
│   ├── LayoutHeader.vue   # Cabecera con navegación y controles
│   └── LayoutFooter.vue   # Pie de página con enlaces sociales
├── layouts/
│   └── default.vue        # Layout principal con header, nav y footer
├── pages/
│   ├── index.vue          # Página de inicio
│   ├── experiencia.vue    # Página de experiencia
│   ├── representacion.vue # Página de representación
│   ├── proyectos.vue      # Página de proyectos
│   ├── formacion.vue      # Página de formación
│   ├── galeria.vue        # Página de galería
│   ├── contacto.vue       # Página de contacto
│   └── legal.vue          # Página de aviso legal
├── utils/
│   ├── i18nAst.ts         # Utilidades para i18n AST
│   └── locales.ts         # Configuración centralizada de idiomas
i18n/
└── locales/
    ├── es.json            # Traducciones español
    ├── en.json            # Traducciones inglés
    └── de.json            # Traducciones alemán
public/
├── profile-pic.jpg        # Foto de perfil
├── full-pic.jpg           # Foto completa
└── favicon.svg            # Favicon
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

- **Skip link** para saltar al contenido principal
- **ARIA labels** en todos los elementos interactivos
- **Roles semánticos** (listbox, option, navigation, etc.)
- **Navegación por teclado** completa
- **Contraste de colores** siguiendo WCAG 2.1
- **Focus visible** en todos los elementos interactivos
- **Textos alternativos** en imágenes

## 📄 Licencia

MIT - Consulta el código en [GitHub](https://github.com/ComicIvans/cv)
