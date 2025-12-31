# 📷 Estructura de imágenes de la Galería

Cada evento debe tener su propia carpeta con el mismo `slug` usado en los archivos de contenido.

## Estructura de carpetas

```
gallery/
  {slug-del-evento}/
    cover.webp     # Imagen de portada (obligatoria)
    01.webp        # Fotos de la galería
    02.webp
    03.webp
    ...
```

## Especificaciones técnicas

### Imagen de portada (cover)
- **Dimensiones recomendadas**: 1200×630px (ratio 1.91:1)
- **Formato**: WebP preferido, JPG como alternativa
- **Uso**: Se muestra en las tarjetas de eventos y como Open Graph

### Fotos de la galería
- **Ancho máximo**: 1920px
- **Calidad**: 80-85% (WebP)
- **Formato**: WebP preferido para mejor compresión
- **Nombres**: Usar números secuenciales (01, 02, 03...)

## Referencia en archivos de contenido

En los archivos `.md` de cada evento (en `content/{locale}/gallery/`):

```yaml
cover:
  src: /gallery/enem-2025/cover.webp
  # alt es opcional - se genera automáticamente usando el título del evento
photos:
  - src: /gallery/enem-2025/01.webp
    # alt es opcional - se genera automáticamente (ej: "Título evento - Foto 1")
    description: Descripción opcional de la foto
  - src: /gallery/enem-2025/02.webp
  - src: /gallery/enem-2025/03.webp
```

### Notas importantes

- **Extensión obligatoria**: La extensión del archivo (`.webp`, `.jpg`, `.JPG`, etc.) debe incluirse en el `src`
- **Alt automático**: Si no se especifica `alt`, se genera automáticamente:
  - Para portada: usa el título del evento
  - Para fotos: usa "{título} - Foto {número}"
- **Descripción opcional**: Aparece en el modal al ampliar la imagen

## Consejos

1. **Compresión**: Usa herramientas como [Squoosh](https://squoosh.app) para optimizar antes de subir
2. **Nombres**: Evita espacios y caracteres especiales en los nombres de archivo
3. **Backup**: Las imágenes no están en git, asegúrate de tener backup
4. **Lazy loading**: Las imágenes se cargan bajo demanda automáticamente
