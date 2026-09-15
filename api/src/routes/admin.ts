import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { requireAdmin, signToken } from "../auth.js";
import { storage } from "../storage/index.js";
import { ApiError, coerce, slugify, toId, type FieldType } from "../lib/http.js";
import { productInclude, serializeProduct } from "../lib/products.js";

const settingsSpec: Record<string, FieldType> = {
  storeName: "str", tagline: "str", logoUrl: "str?", faviconUrl: "str?", distributorNote: "str?",
  primaryColor: "str", accentColor: "str", backgroundColor: "str", surfaceColor: "str", textColor: "str",
  currency: "str", locale: "str", announcementText: "str?",
  whatsappNumber: "str?", whatsappMessage: "str?", instagramUrl: "str?", facebookUrl: "str?",
  tiktokUrl: "str?", youtubeUrl: "str?", email: "str?", phone: "str?", address: "str?",
  featuredProductId: "int?", featuredEyebrow: "str?", favoritesTitle: "str?", favoritesSubtitle: "str?",
  categoriesTitle: "str?", categoriesSubtitle: "str?",
  shippingFlat: "int", checkoutNote: "str?", paymentsEnabled: "bool",
  metaTitle: "str?", metaDescription: "str?", footerText: "str?",
};

const productSpec: Record<string, FieldType> = {
  name: "str", slug: "str", brand: "str", sku: "str?", size: "str?", shortDescription: "str?",
  description: "str?", howToUse: "str?", ingredients: "str?", price: "int", compareAtPrice: "int?",
  stock: "int", rating: "float?", reviewCount: "int", active: "bool", isFavorite: "bool", categoryId: "int?",
};

const HEX = /^#[0-9a-f]{6}$/i;

/** CRUD genérico con orden manual (position) para modelos simples. */
function crud(
  app: FastifyInstance,
  opts: { path: string; model: string; spec: Record<string, FieldType>; slugFrom?: string; validate?: (d: Record<string, unknown>) => void },
) {
  const delegate = () => (prisma as unknown as Record<string, any>)[opts.model];
  const prepare = (body: unknown) => {
    const data = coerce(body, opts.spec);
    if (opts.slugFrom && "slug" in opts.spec) {
      const source = (data.slug as string) || (data[opts.slugFrom] as string);
      if (source !== undefined) data.slug = slugify(source ?? "");
    }
    opts.validate?.(data);
    return data;
  };

  app.get(`/${opts.path}`, async () => delegate().findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] }));

  app.get(`/${opts.path}/:id`, async (req) => {
    const item = await delegate().findUnique({ where: { id: toId((req.params as any).id) } });
    if (!item) throw new ApiError(404, "No encontrado");
    return item;
  });

  app.post(`/${opts.path}`, async (req, reply) => {
    const data = prepare(req.body);
    data.position = await delegate().count();
    reply.code(201);
    return delegate().create({ data });
  });

  app.put(`/${opts.path}/reorder`, async (req) => {
    const ids = ((req.body as { ids?: unknown[] })?.ids ?? []).map(toId);
    await prisma.$transaction(ids.map((id, position) => delegate().update({ where: { id }, data: { position } })));
    return { ok: true };
  });

  app.put(`/${opts.path}/:id`, async (req) =>
    delegate().update({ where: { id: toId((req.params as any).id) }, data: prepare(req.body) }),
  );

  app.delete(`/${opts.path}/:id`, async (req) => {
    await delegate().delete({ where: { id: toId((req.params as any).id) } });
    return { ok: true };
  });
}

type ProductPayload = {
  benefits?: unknown[];
  tags?: unknown[];
  images?: { url: string; alt?: string }[];
  videos?: { kind: string; url: string; title?: string }[];
  relatedIds?: unknown[];
};

async function saveProduct(id: number | null, body: unknown) {
  const data = coerce(body, productSpec);
  const extra = (body ?? {}) as ProductPayload;
  if (id === null && (!data.name || data.price === undefined)) throw new ApiError(400, "Nombre y precio son obligatorios");
  if ("slug" in data || "name" in data) data.slug = slugify((data.slug as string) || (data.name as string) || "");
  if (data.slug === "") throw new ApiError(400, "El producto necesita un nombre");
  if (extra.benefits) data.benefits = JSON.stringify(extra.benefits.map(String).map((s) => s.trim()).filter(Boolean));
  if (extra.tags) data.tags = JSON.stringify(extra.tags.map(String).map((s) => s.trim()).filter(Boolean));

  return prisma.$transaction(async (tx) => {
    const product = id === null
      ? await tx.product.create({ data: { ...(data as any), position: await tx.product.count() } })
      : await tx.product.update({ where: { id }, data: data as any });

    if (extra.images) {
      await tx.productImage.deleteMany({ where: { productId: product.id } });
      await tx.productImage.createMany({
        data: extra.images.filter((i) => i.url).map((i, position) => ({ productId: product.id, url: i.url, alt: i.alt || null, position })),
      });
    }
    if (extra.videos) {
      await tx.productVideo.deleteMany({ where: { productId: product.id } });
      await tx.productVideo.createMany({
        data: extra.videos.filter((v) => v.url).map((v, position) => ({
          productId: product.id, kind: v.kind === "file" ? "file" : "youtube", url: v.url, title: v.title || null, position,
        })),
      });
    }
    if (extra.relatedIds) {
      await tx.productRelation.deleteMany({ where: { productId: product.id } });
      const relatedIds = [...new Set(extra.relatedIds.map(toId))].filter((r) => r !== product.id);
      await tx.productRelation.createMany({
        data: relatedIds.map((relatedId, position) => ({ productId: product.id, relatedId, position })),
      });
    }
    return product;
  });
}

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.post("/login", async (req) => {
    const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
    const user = email ? await prisma.adminUser.findUnique({ where: { email: email.trim().toLowerCase() } }) : null;
    if (!user || !password || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new ApiError(401, "Correo o contraseña incorrectos");
    }
    return { token: signToken(user), user: { id: user.id, email: user.email, name: user.name } };
  });

  await app.register(async (secured) => {
    secured.addHook("preHandler", requireAdmin);

    secured.get("/me", async (req) => {
      const admin = (req as any).admin as { sub: number };
      return prisma.adminUser.findUnique({ where: { id: admin.sub }, select: { id: true, email: true, name: true } });
    });

    secured.get("/dashboard", async () => {
      const [products, activeProducts, favorites, categories, heroSlides, pendingOrders, media] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { active: true } }),
        prisma.product.count({ where: { isFavorite: true } }),
        prisma.category.count(),
        prisma.heroSlide.count({ where: { active: true } }),
        prisma.order.count({ where: { status: "pending" } }),
        prisma.mediaAsset.count(),
      ]);
      return { products, activeProducts, favorites, categories, heroSlides, pendingOrders, media };
    });

    // ---------- Configuración ----------
    secured.get("/settings", async () =>
      prisma.storeSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
    );
    secured.put("/settings", async (req) => {
      const data = coerce(req.body, settingsSpec);
      for (const key of ["primaryColor", "accentColor", "backgroundColor", "surfaceColor", "textColor"]) {
        if (key in data && !HEX.test(String(data[key]))) throw new ApiError(400, `Color inválido en ${key} (usa #RRGGBB)`);
      }
      if (typeof data.whatsappNumber === "string") data.whatsappNumber = data.whatsappNumber.replace(/\D/g, "") || null;
      return prisma.storeSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
    });

    // ---------- Contenido simple con orden manual ----------
    crud(secured, {
      path: "hero", model: "heroSlide",
      spec: {
        eyebrow: "str?", title: "str", subtitle: "str?", mediaType: "str", imageUrl: "str?", mobileImageUrl: "str?",
        videoUrl: "str?", youtubeUrl: "str?", buttonText: "str?", buttonLink: "str?", secondaryButtonText: "str?",
        secondaryButtonLink: "str?", textAlign: "str", overlay: "int", active: "bool",
      },
      validate: (d) => {
        if ("title" in d && !d.title) throw new ApiError(400, "El título es obligatorio");
        if ("mediaType" in d && !["image", "video", "youtube"].includes(String(d.mediaType))) d.mediaType = "image";
        if ("textAlign" in d && !["left", "center", "right"].includes(String(d.textAlign))) d.textAlign = "left";
        if ("overlay" in d) d.overlay = Math.max(0, Math.min(80, Number(d.overlay)));
      },
    });
    crud(secured, {
      path: "categories", model: "category", slugFrom: "name",
      spec: { name: "str", slug: "str", description: "str?", imageUrl: "str?", active: "bool" },
      validate: (d) => { if ("name" in d && !d.name) throw new ApiError(400, "El nombre es obligatorio"); },
    });
    crud(secured, {
      path: "menu", model: "menuItem",
      spec: { label: "str", href: "str", active: "bool" },
      validate: (d) => { if ("label" in d && !d.label) throw new ApiError(400, "El texto es obligatorio"); },
    });
    crud(secured, {
      path: "pages", model: "page", slugFrom: "title",
      spec: { slug: "str", title: "str", subtitle: "str?", heroImageUrl: "str?", body: "str", active: "bool" },
      validate: (d) => { if ("title" in d && !d.title) throw new ApiError(400, "El título es obligatorio"); },
    });
    crud(secured, {
      path: "banners", model: "banner",
      spec: { title: "str", subtitle: "str?", imageUrl: "str?", link: "str?", buttonText: "str?", placement: "str", active: "bool" },
    });

    // ---------- Productos ----------
    secured.get("/products", async () => {
      const products = await prisma.product.findMany({ include: productInclude, orderBy: [{ position: "asc" }, { id: "asc" }] });
      return products.map(serializeProduct);
    });

    secured.get("/products/:id", async (req) => {
      const product = await prisma.product.findUnique({
        where: { id: toId((req.params as any).id) },
        include: { ...productInclude, related: { orderBy: { position: "asc" }, select: { relatedId: true } } },
      });
      if (!product) throw new ApiError(404, "Producto no encontrado");
      const { related, ...rest } = product;
      return { ...serializeProduct(rest), relatedIds: related.map((r) => r.relatedId) };
    });

    secured.post("/products", async (req, reply) => {
      reply.code(201);
      return saveProduct(null, req.body);
    });

    secured.put("/products/reorder", async (req) => {
      const ids = ((req.body as { ids?: unknown[] })?.ids ?? []).map(toId);
      await prisma.$transaction(ids.map((id, position) => prisma.product.update({ where: { id }, data: { position } })));
      return { ok: true };
    });

    secured.put("/products/:id", async (req) => saveProduct(toId((req.params as any).id), req.body));

    secured.patch("/products/:id", async (req) =>
      prisma.product.update({
        where: { id: toId((req.params as any).id) },
        data: coerce(req.body, { active: "bool", isFavorite: "bool", stock: "int", price: "int" }),
      }),
    );

    secured.post("/products/:id/duplicate", async (req, reply) => {
      const source = await prisma.product.findUnique({
        where: { id: toId((req.params as any).id) },
        include: { images: true, videos: true },
      });
      if (!source) throw new ApiError(404, "Producto no encontrado");
      const { id, createdAt, updatedAt, images, videos, ...fields } = source;
      const copy = await prisma.product.create({
        data: {
          ...fields,
          name: `${fields.name} (copia)`,
          slug: `${fields.slug}-copia-${Date.now().toString(36)}`,
          active: false,
          position: await prisma.product.count(),
          images: { create: images.map(({ url, alt, position }) => ({ url, alt, position })) },
          videos: { create: videos.map(({ kind, url, title, position }) => ({ kind, url, title, position })) },
        },
      });
      reply.code(201);
      return copy;
    });

    secured.delete("/products/:id", async (req) => {
      await prisma.product.delete({ where: { id: toId((req.params as any).id) } });
      return { ok: true };
    });

    // ---------- Medios ----------
    secured.get("/media", async (req) => {
      const { kind } = req.query as { kind?: string };
      return prisma.mediaAsset.findMany({ where: kind ? { kind } : {}, orderBy: { createdAt: "desc" } });
    });

    secured.post("/media", async (req, reply) => {
      const file = await req.file();
      if (!file) throw new ApiError(400, "No se recibió ningún archivo");
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "video/mp4", "video/webm", "video/quicktime"];
      if (!allowed.includes(file.mimetype)) throw new ApiError(400, "Formato no permitido. Usa JPG, PNG, WEBP, AVIF, GIF, MP4, WEBM o MOV");
      const buffer = await file.toBuffer();
      if (file.file.truncated) throw new ApiError(413, "El archivo supera el tamaño máximo permitido");
      const saved = await storage.save({ buffer, fileName: file.filename, mimeType: file.mimetype });
      reply.code(201);
      return prisma.mediaAsset.create({
        data: {
          url: saved.url, storageKey: saved.key, fileName: file.filename, mimeType: file.mimetype,
          size: buffer.length, kind: file.mimetype.startsWith("video/") ? "video" : "image",
        },
      });
    });

    secured.delete("/media/:id", async (req) => {
      const asset = await prisma.mediaAsset.delete({ where: { id: toId((req.params as any).id) } });
      await storage.remove(asset.storageKey);
      return { ok: true };
    });

    // ---------- Pedidos ----------
    secured.get("/orders", async () =>
      prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 200 }),
    );
    secured.patch("/orders/:id", async (req) => {
      const { status } = (req.body ?? {}) as { status?: string };
      if (!["pending", "paid", "shipped", "delivered", "cancelled"].includes(status ?? "")) throw new ApiError(400, "Estado inválido");
      return prisma.order.update({ where: { id: toId((req.params as any).id) }, data: { status } });
    });
  });
};
