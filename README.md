# AURA CAPILAR — Tienda online (Fase 1, local)

Tienda de cuidado capilar (distribuidora autorizada Milagros). El nombre, logo, colores, textos, menú,
banners, productos y redes **vienen de la base de datos** y se editan desde el panel, sin tocar código.

## Arquitectura

```
web/  (Next.js 15 + Tailwind 4)      → Tienda pública + Panel /admin
  │  fetch HTTP (NEXT_PUBLIC_API_URL)
api/  (Fastify 5 + Prisma 6)         → API REST pública (/api/public) y privada JWT (/api/admin)
  │
  ├─ Base de datos  (SQLite local → PostgreSQL en producción)
  └─ Storage        (driver "local" en api/uploads → S3 / Cloudinary / R2 en producción)
```

| Capa | Dónde | Cómo se cambia en producción |
|---|---|---|
| Frontend | `web/` | Deploy en Vercel u otro; `NEXT_PUBLIC_API_URL=https://api.tudominio.com` |
| API | `api/src/` | Deploy en Render/Railway/VPS; variables de `api/.env.example` |
| Base de datos | `api/prisma/schema.prisma` | `provider = "postgresql"` + `DATABASE_URL` |
| Imágenes/videos | `api/src/storage/` | Nuevo driver que implemente `StorageDriver` + `STORAGE_DRIVER` |
| Pagos | `POST /api/public/orders` ya crea pedidos | Fase 2: conectar pasarela y activar `paymentsEnabled` |

Las URLs de archivos se guardan relativas (`/uploads/...`), así que cambiar de dominio no rompe imágenes.

## Ejecutar en local

Requisitos: Node 20+.

```bash
npm run setup
```

```bash
npm run dev
```

- Tienda: http://localhost:3000
- Panel: http://localhost:3000/admin — `admin@auracapilar.local` / `aura2026` (cámbialo en `api/.env` y vuelve a ejecutar `npm run db:reset`)
- API: http://localhost:4000

`npm run db:reset` recarga los datos de demostración (borra productos, pedidos y contenido; no borra archivos subidos).

## Qué administra el panel

- **Home**: producto principal (protagonista tras el Hero), textos de secciones, barra de anuncio.
- **Hero / Banners**: imagen desktop y móvil, video propio o YouTube, título, subtítulo, 2 botones, posición del texto, oscurecido, orden y visibilidad.
- **Productos**: fotos (subir, ordenar), videos, precio y precio anterior, stock, beneficios, modo de uso, ingredientes, favoritos, relacionados, visible/oculto, duplicar, **orden manual por arrastre**.
- **Categorías, Menú y Páginas** (Rutinas, Consejos, Nosotros…): con orden manual.
- **Imágenes y videos**: biblioteca central.
- **Pedidos**: estado y contacto por WhatsApp.
- **Marca y redes**: nombre, logo, favicon, 5 colores, WhatsApp, Instagram, Facebook, TikTok, YouTube, SEO, envío.

> Las ilustraciones de producto y los textos del seed son **de demostración**: reemplázalos con las fotos y fichas oficiales de Milagros.
