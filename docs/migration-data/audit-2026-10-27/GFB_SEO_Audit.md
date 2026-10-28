# GFB Solutions — inventario SEO y contrato de migración

Fecha de captura: 27 de octubre de 2026 (UTC). Sitio oficial: https://www.gfb-solutions.com/ . Desarrollo: https://gfb-solutions.vercel.app/ .

## Decisión recomendada

Conservar las URL canónicas públicas del sitio oficial y servir en ellas el diseño nuevo. Separar identidad de página, idioma, componente y dirección pública. Los componentes pueden mantener su organización interna sin imponer `/en/...` o `/es/...` como nuevas URL canónicas.

Cuando exista una razón real para cambiar una URL, usar una redirección permanente directa a una página equivalente, conservando idioma, intención y contenido técnico. No consolidar fichas individuales en categorías por comodidad de implementación. Los cambios de URL con redirecciones correctas son viables; mantener las direcciones existentes reduce cambios simultáneos evitables. Ningún procedimiento garantiza posiciones idénticas.

## Alcance y método

Se descargaron los dos índices declarados por robots (`/sitemap.xml` y `/es_es-sitemap.xml`) y sus 32 sitemaps hijos; se solicitaron todas sus páginas y se extrajeron metadatos, encabezados, enlaces, imágenes, hreflang y JSON-LD del HTML recibido. Se siguieron enlaces internos adicionales, obteniendo tres URL históricas fuera del sitemap. En el desarrollo se revisaron sus 42 URL de sitemap y cuatro páginas legales enlazadas. Además se solicitaron las 286 URL antiguas sobre el host del desarrollo y se registró cada cadena HTTP y destino.

El análisis describe respuestas públicas del momento de captura. No incluye Search Console, Analytics, backlinks privados, logs, datos históricos de posiciones ni resultados de campo de Core Web Vitals. Una URL en sitemap o un HTTP 200 no prueban indexación, tráfico o equivalencia. El conteo de palabras del CSV incluye navegación y pie; no mide por sí solo calidad del contenido. Los campos alt vacíos pueden corresponder correctamente a imágenes decorativas. Los títulos iguales entre idiomas pueden ser nombres/códigos de producto; requieren revisión contextual.

El rastreo se basó en HTML y enlaces públicos, sin enviar formularios, modificar producción o ejecutar un backend. No representa una auditoría visual nueva ni una medición de todas las interacciones JavaScript. Las URL que solo aparezcan en fuentes privadas deben agregarse antes del lanzamiento.

## Cobertura comprobada

| Grupo | URL por idioma | URL EN + ES |
|---|---:|---:|
| Páginas estáticas/categorías/fichas planas | 53 | 106 |
| Concentrados cítricos, mediterráneos, tropicales, frutos rojos y vegetales | 43 | 86 |
| Fichas IQF de naranja, lima, limón y pomelo | 29 | 58 |
| Variantes de uva roja | 7 | 14 |
| Concentrados de avena y almendra | 2 | 4 |
| Fichas de latas, tapas de lata y RipCap | 9 | 18 |
| **Total de sitemap** | **143** | **286** |

Las 286 URL oficiales del sitemap devolvieron HTTP 200. No significa que sean 286 temas distintos: hay versiones idiomáticas y páginas con contenido solapado. El archivo de inventario enumera cada URL y la fuente de descubrimiento.

## Hallazgos y prioridad

### P0 — cobertura de fichas y destino de rutas

La prueba exhaustiva de las URL antiguas contra el desarrollo obtuvo: **48 destinos finales 200, 238 destinos finales 404**. Otros estados: ninguno. En 286 casos hubo al menos una redirección. Los destinos 200 se distribuyen entre 32 URL finales distintas; esto es una señal para revisar consolidaciones, no una prueba automática de pérdida de SEO.

Ejemplos verificados:

| URL antigua probada en Vercel | Resultado observado | Acción |
|---|---|---|
| `/cans` | 308 hacia `/en/packaging-solutions/cans`, final 200 | Preferir servir el diseño en `/cans`; si se cambia, documentar equivalencia y canonical |
| `/cans?lang=es` | 308 hacia la ruta española nueva, conservando también `lang=es` | Resolver una identidad canónica española coherente |
| `/citrics/orange-concentrate` | 307 hacia `/en/citrics/orange-concentrate`, final 404 | Recuperar ficha individual y sus variantes |
| `/aluminum-cans/std-can-d66mm` | 308 hacia la categoría general de latas, final 200 | Preservar especificación individual; 200 no demuestra cobertura |
| `/?lang=es` | 308 hacia `/es?lang=es`, final 200 | Conservar la dirección española histórica preferentemente |

El CSV de pruebas contiene todos los resultados. El mapa de migración es una propuesta de conservación; **no es un archivo de redirecciones listo para desplegar**. Los campos de ID de implementación se completan desde el repositorio. No se afirma equivalencia semántica a partir de HTTP.

### P0 — idioma y canonical

El oficial publica inglés en la ruta limpia y español con `?lang=es`. Tiene canonical propio para la versión española y alternates `en-US`, `es-ES`, `x-default` (inglés). El desarrollo publica rutas `/en/...` y `/es/...`, y su sitemap/canonicals anuncian esas rutas bajo el dominio oficial. Debe elegirse y aplicar una política única en resolución de rutas, enlaces, metadata, hreflang, caché y sitemap.

Recomendación: mantener el patrón público existente. No eliminar `lang=es` como parámetro de tracking ni canonicalizar español a inglés. Evitar que una caché o redirección automática de idioma devuelva contenido incorrecto. La traducción de producto requiere revisión: parte del contenido observado conserva nombres o párrafos en inglés; el atributo HTML lang no acredita traducción completa.

### P0 — separar indexación de preview y producción

Las 42 páginas comerciales del sitemap del desarrollo permiten rastreo y no declararon noindex en HTML ni X-Robots-Tag durante esta captura. Las cuatro páginas legales enlazadas sí declaran `noindex, follow`. No se comprobó que Vercel esté indexado en Google. Aplicar noindex por host/entorno a todo el preview, manteniendo producción indexable. Canonical no sustituye noindex; robots disallow puede impedir que Google lea noindex.

### P1 — conservar contenido útil y reparar metadata

Entre las **286 páginas válidas oficiales**, 91 no tienen meta descripción y 90 contienen un UUID como descripción. 121 presentan varios H1 en el HTML. Son oportunidades de corrección; no deben reproducirse como requisitos históricos. En Home la descripción escribe `GBF` en lugar de `GFB`.

El desarrollo mejora esas áreas en las páginas comerciales revisadas: todas tienen descripción, canonical y un H1; incluye Organization y BreadcrumbList. Conservar esos avances, adaptando las URL y cobertura. El JSON-LD oficial observado se concentra en WebSite e ImageObject, no en un catálogo completo de Product.

Conservar entidades, intención de cada landing y especificaciones verificadas. No reemplazar datos de productos por texto comercial genérico. No conservar afirmaciones de salud dudosas, servicios antiguos contradictorios o errores solo por estar publicados. `/additives` e `/ingredients-and-materials` necesitan validar la oferta real y el contenido antes de decidir su tratamiento; no inventar sustitutos ni borrar sin evaluar señales privadas.

### P1 — rutas similares no equivalen automáticamente

`/fruits-concentrates` es el catálogo general de concentrados. `/fruit-concentrates` muestra una página sobre concentrados de uva roja; `/red-grape-concentrate` desarrolla variedades y especificaciones. También coexisten fichas técnicas planas y rutas dinámicas anidadas. Antes de consolidar, comparar contenido, enlaces y datos de búsqueda. El valor relativo de cada URL no puede inferirse de su nombre.

### P1 — enlaces históricos rotos

El Home oficial, en ambos idiomas, enlaza tres direcciones que normalizan la barra final con 301 y terminan en 404:

- `/engineering-and-machinery/`
- `/food-tech-solutions/`
- `/ingredients-and-chemicals/`

Corregir los enlaces con evidencia de su destino/intención. No presentar esas tres URL como páginas vivas cuyo contenido se haya recuperado.

### P1 — descubrimiento, archivos y rendimiento

Conservar enlaces HTML útiles a fichas, migas de pan y relaciones entre categorías/productos. Un explorador visual o un sitemap no sustituyen las landings individuales. No se encontraron descargas con extensión PDF/DOC/XLS/CSV/ZIP en los href del HTML rastreado; esto no excluye ficheros servidos por JavaScript o enlaces sin extensión. Verificar las fuentes privadas/repositorio antes de cerrar el inventario de archivos.

Revisar imágenes autorizadas, dependencias de CDN de Wix, recursos críticos, renderizado e interacciones sin deteriorar los diseños aprobados. No se midieron ni se asignan puntuaciones Lighthouse/Core Web Vitals. El portfolio de concentrados en edición simultánea queda fuera de cambios visuales; la conservación de las URL de sus productos se resuelve como integración SEO.

## Ejemplo de asociación de diseño con URL pública

| Implementación actual | Dirección pública recomendada |
|---|---|
| `/en` | `/` |
| `/en/about` | `/about-us` |
| `/en/packaging-solutions/cans` | `/cans` |
| `/en/raw-materials/fruit-concentrates` | `/fruits-concentrates` |
| `/en/flavours-aromas` | `/flavours-and-aromas` |
| `/en/flavours-aromas/sweet-applications` | `/sweets` |
| `/en/industrial-consulting` | `/consulting-solutions` |

Las versiones españolas correspondientes conservan `?lang=es`. Las nuevas páginas sin equivalente antiguo pueden conservar direcciones nuevas. Las asociaciones son candidatas para reutilizar componentes; no autorizan consolidar otras páginas relacionadas.

## Secuencia de ejecución

1. Conservar snapshot y datos de medición disponibles; integrar todas las fuentes de URL en un manifiesto.
2. Resolver identidad/idioma/URL pública y corregir rutas/fichas faltantes sin rehacer diseño.
3. Unificar metadata, contenido esencial, enlaces, hreflang, robots y sitemap desde ese manifiesto.
4. Verificar todas las URL en build de producción y host de pruebas: estado, cadena, contenido, idioma, canonical, enlaces y archivos.
5. Preparar lanzamiento y rollback. No cambiar DNS ni retirar Wix durante la implementación local.
6. Tras lanzamiento autorizado, volver a rastrear todo y monitorizar Search Console, errores y tráfico por landing/consulta.

Datos adicionales necesarios para priorizar con evidencia: exportaciones Search Console de rendimiento y páginas, URLs seleccionadas por Google como canonical, enlaces externos, analítica de tráfico orgánico/conversiones y logs si existen. Usar 28/90 días y contexto estacional cuando esté disponible. Su ausencia no impide implementar el contrato técnico, pero impide garantizar o cuantificar el posicionamiento actual.

## Archivos adjuntos

- `GFB_Official_SEO_Inventory.csv`: 289 URL observadas (286 válidas + 3 enlaces históricos rotos), metadata y señales públicas.
- `GFB_Preview_SEO_Inventory.csv`: 46 páginas observadas del desarrollo (42 de sitemap + 4 legales).
- `GFB_Legacy_Preview_HTTP_Tests.csv`: 286 pruebas de URL antiguas contra el desarrollo.
- `GFB_Legacy_Migration_Map.csv`: propuesta por cada URL antigua; completar IDs internos y decisiones documentadas.
- `GFB_Primary_Page_Associations.csv`: asociaciones candidatas para reutilizar vistas existentes.
- `GFB_Codex_SEO_Migration_Prompt.md`: instrucciones completas para implementar y verificar.

## Referencias primarias

- Sitio oficial y su catálogo: https://www.gfb-solutions.com/ ; https://www.gfb-solutions.com/fruits-concentrates ; https://www.gfb-solutions.com/citrics/orange-concentrate ; https://www.gfb-solutions.com/fruit-concentrates ; https://www.gfb-solutions.com/red-grape-concentrate
- Migraciones Google: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Idiomas: https://developers.google.com/search/docs/specialty/international/localized-versions
- Canonical: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Noindex: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- Metadata Next.js: https://nextjs.org/docs/app/api-reference/functions/generate-metadata

Las recomendaciones reducen riesgos de migración; Google puede volver a rastrear, elegir canonicals y ajustar posiciones. Mantener el dominio no basta si desaparecen contenidos o cambian sus destinos.
