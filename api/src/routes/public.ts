import type { FastifyPluginAsync } from "fastify";
import { randomBytes } from "node:crypto";
import { prisma } from "../db.js";
import { ApiError, normalizeText, toId } from "../lib/http.js";
import { productInclude, serializeProduct } from "../lib/products.js";

async function getSettings() {
  return prisma.storeSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
}

async function getMenu() {
  return prisma.menuItem.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { id: "asc" }] });
}

export const publicRoutes: FastifyPluginAsync = async (app) => {
  app.get("/settings", async () => {
    const [settings, menu] = await Promise.all([getSettings(), getMenu()]);
    return { settings, menu };
  });

  /** Todo lo que necesita el Home en una sola llamada. */
  app.get("/home", async () => {
    const settings = await getSettings();
    const [menu, heroSlides, favorites, categories, featured] = await Promise.all([
      getMenu(),
      prisma.heroSlide.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { id: "asc" }] }),
      prisma.product.findMany({
        where: { active: true, isFavorite: true },
        include: productInclude,
        orderBy: [{ position: "asc" }, { id: "asc" }],
      }),
      prisma.category.findMany({
        where: { active: true },
        orderBy: [{ position: "asc" }, { id: "asc" }],
        include: { _count: { select: { products: { where: { active: true } } } } },
      }),
      settings.featuredProductId
        ? prisma.product.findFirst({ where: { id: settings.featuredProductId, active: true }, include: productInclude })
        : null,
    ]);
    return {
      settings,
      menu,
      heroSlides,
      featuredProduct: featured ? serializeProduct(featured) : null,
      favorites: favorites.map(serializeProduct),
      categories: categories.map(({ _count, ...c }) => ({ ...c, productCount: _count.products })),
    };
  });

  app.get("/categories", async () => {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: [{ position: "asc" }, { id: "asc" }],
      include: { _count: { select: { products: { where: { active: true } } } } },
    });
    return categories.map(({ _count, ...c }) => ({ ...c, productCount: _count.products }));
  });

  app.get("/products", async (req) => {
    const q = req.query as Record<string, string | undefined>;
    const where: Record<string, unknown> = { active: true };
    if (q.categoria) where.category = { slug: q.categoria };
    if (q.favoritos === "1") where.isFavorite = true;

    let products = (
      await prisma.product.findMany({ where, include: productInclude, orderBy: [{ position: "asc" }, { id: "asc" }] })
    ).map(serializeProduct);

    // Búsqueda sin importar tildes ni mayúsculas ("tonico" encuentra "Tónico").
    if (q.q?.trim()) {
      const terms = normalizeText(q.q).split(/\s+/).filter(Boolean);
      products = products.filter((p) => {
        const haystack = normalizeText(
          [p.name, p.shortDescription, p.brand, p.category?.name, ...p.tags, ...p.benefits].join(" "),
        );
        return terms.every((t) => haystack.includes(t));
      });
    }
    if (q.promo === "1") products = products.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
    if (q.min) products = products.filter((p) => p.price >= Number(q.min));
    if (q.max) products = products.filter((p) => p.price <= Number(q.max));

    switch (q.orden) {
      case "precio-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "precio-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "nuevos":
        products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "nombre":
        products.sort((a, b) => a.name.localeCompare(b.name, "es"));
        break;
    }

    const limit = q.limit ? Math.max(1, Math.min(100, Number(q.limit))) : undefined;
    return { total: products.length, items: limit ? products.slice(0, limit) : products };
  });

  app.get("/products/:slug", async (req) => {
    const { slug } = req.params as { slug: string };
    const product = await prisma.product.findFirst({
      where: { slug, active: true },
      include: {
        ...productInclude,
        related: { orderBy: { position: "asc" }, include: { related: { include: productInclude } } },
      },
    });
    if (!product) throw new ApiError(404, "Producto no encontrado");

    const { related, ...rest } = product;
    let relatedProducts = related.map((r) => r.related).filter((p) => p.active);
    // Si no hay relacionados manuales, sugerir de la misma categoría.
    if (relatedProducts.length === 0 && product.categoryId) {
      relatedProducts = await prisma.product.findMany({
        where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
        include: productInclude,
        orderBy: { position: "asc" },
        take: 8,
      });
    }
    if (relatedProducts.length < 4) {
      const extra = await prisma.product.findMany({
        where: { active: true, id: { notIn: [product.id, ...relatedProducts.map((p) => p.id)] } },
        include: productInclude,
        orderBy: [{ isFavorite: "desc" }, { position: "asc" }],
        take: 4 - relatedProducts.length,
      });
      relatedProducts = [...relatedProducts, ...extra];
    }
    return { ...serializeProduct(rest), relatedProducts: relatedProducts.map(serializeProduct) };
  });

  app.get("/pages/:slug", async (req) => {
    const { slug } = req.params as { slug: string };
    const page = await prisma.page.findFirst({ where: { slug, active: true } });
    if (!page) throw new ApiError(404, "Página no encontrada");
    return page;
  });

  /** Checkout preparado: crea la orden con precios validados en servidor. Pago real: fase 2. */
  app.post("/orders", async (req, reply) => {
    const body = (req.body ?? {}) as {
      customer?: Record<string, string>;
      items?: { productId: number; quantity: number }[];
      channel?: string;
    };
    const customer = body.customer ?? {};
    if (!customer.name?.trim() || !customer.phone?.trim()) {
      throw new ApiError(400, "Nombre y teléfono son obligatorios");
    }
    const requested = (body.items ?? []).filter((i) => Number(i.quantity) > 0);
    if (requested.length === 0) throw new ApiError(400, "El carrito está vacío");

    const products = await prisma.product.findMany({
      where: { id: { in: requested.map((i) => toId(i.productId)) }, active: true },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    });
    const items = requested.flatMap((i) => {
      const p = products.find((x) => x.id === Number(i.productId));
      if (!p) return [];
      return [{
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: Math.min(99, Math.round(Number(i.quantity))),
        imageUrl: p.images[0]?.url ?? null,
      }];
    });
    if (items.length === 0) throw new ApiError(400, "Los productos ya no están disponibles");

    const settings = await getSettings();
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = settings.shippingFlat;
    const code = `AC-${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString("hex").toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        code,
        channel: body.channel === "whatsapp" ? "whatsapp" : "web",
        customerName: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || null,
        address: customer.address?.trim() || null,
        city: customer.city?.trim() || null,
        notes: customer.notes?.trim() || null,
        subtotal,
        shipping,
        total: subtotal + shipping,
        items: { create: items },
      },
      include: { items: true },
    });
    reply.code(201);
    return order;
  });
};
