import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { heroMobileSvg, heroSvg, productSvg, type Palette, type Shape } from "./art.js";

const prisma = new PrismaClient();
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? "uploads");
const seedDir = path.join(uploadDir, "seed");

async function saveSvg(name: string, svg: string) {
  await writeFile(path.join(seedDir, `${name}.svg`), svg, "utf8");
  return `/uploads/seed/${name}.svg`;
}

const palettes: Record<string, Palette> = {
  plum: { body: "#5B3148", bodyLight: "#8A5873", cap: "#2E1A26", label: "#F6EDE6", ink: "#3A2230" },
  rose: { body: "#D9A79A", bodyLight: "#F0CFC5", cap: "#B37A68", label: "#FFF8F3", ink: "#6B3F35" },
  gold: { body: "#C08A4E", bodyLight: "#E6BE86", cap: "#3B2A22", label: "#FBF4EA", ink: "#4A3322" },
  sage: { body: "#8E9C86", bodyLight: "#B9C4B1", cap: "#4B5646", label: "#F7F5EE", ink: "#3F4A3B" },
  ivory: { body: "#E9DDD0", bodyLight: "#FBF6F0", cap: "#B7795E", label: "#FFFFFF", ink: "#5A3B2E" },
  berry: { body: "#8C3B55", bodyLight: "#B8667F", cap: "#D8B08C", label: "#FAF0EC", ink: "#5B2438" },
};

type SeedProduct = {
  name: string; slug: string; category: string; shape: Shape; palette: keyof typeof palettes; lines: string[];
  bg: [string, string]; bg2: [string, string]; price: number; compareAtPrice?: number; size: string; stock: number;
  isFavorite?: boolean; rating?: number; reviewCount?: number; shortDescription: string; description: string;
  benefits: string[]; howToUse: string; ingredients: string; tags: string[];
};

const products: SeedProduct[] = [
  {
    name: "Tratamiento Milagroso Reparador", slug: "tratamiento-milagroso-reparador", category: "tratamientos",
    shape: "jar", palette: "plum", lines: ["Tratamiento", "Reparador"], bg: ["#F3E3D8", "#E7CFC0"], bg2: ["#E9D4CB", "#D9B8A8"],
    price: 58900, compareAtPrice: 64900, size: "500 g", stock: 40, isFavorite: true, rating: 4.9, reviewCount: 128,
    shortDescription: "Mascarilla intensiva que repara la fibra capilar desde la primera aplicación y devuelve suavidad, brillo y movimiento.",
    description: "Una fórmula concentrada pensada para cabellos maltratados por químicos, calor o exposición al sol. Su textura cremosa envuelve cada hebra, sella la cutícula y aporta nutrición profunda sin apelmazar.\n\nIdeal como ritual semanal para recuperar la vitalidad del cabello.",
    benefits: ["Repara puntas abiertas y quiebre", "Brillo y suavidad desde la primera aplicación", "Nutrición profunda sin apelmazar", "Apto para cabello teñido"],
    howToUse: "Después del shampoo, retira el exceso de agua. Aplica de medios a puntas, masajea y deja actuar de 10 a 15 minutos. Enjuaga con abundante agua. Usar 1 a 2 veces por semana.",
    ingredients: "Aceite de argán, keratina vegetal, pantenol, manteca de karité. (Texto de demostración: reemplazar por la ficha oficial.)",
    tags: ["mascarilla", "reparación", "brillo"],
  },
  {
    name: "Shampoo Crecimiento Acelerado", slug: "shampoo-crecimiento-acelerado", category: "shampoos",
    shape: "bottle", palette: "berry", lines: ["Shampoo", "Crecimiento"], bg: ["#F4E6DE", "#EAD3C7"], bg2: ["#EFDCD6", "#DDBDB2"],
    price: 45900, compareAtPrice: 52900, size: "350 ml", stock: 60, isFavorite: true, rating: 4.8, reviewCount: 214,
    shortDescription: "Limpieza suave que estimula el cuero cabelludo y acompaña el crecimiento de un cabello más fuerte.",
    description: "Shampoo de uso diario con activos botánicos que limpian sin resecar y preparan el cuero cabelludo para recibir tratamiento.",
    benefits: ["Estimula el cuero cabelludo", "Fortalece desde la raíz", "Limpieza suave sin resecar", "Aroma fresco y duradero"],
    howToUse: "Aplica sobre el cabello húmedo, masajea el cuero cabelludo con las yemas de los dedos durante 2 minutos y enjuaga. Repite si es necesario.",
    ingredients: "Romero, biotina, cafeína, extracto de cebolla. (Texto de demostración.)",
    tags: ["shampoo", "crecimiento", "anticaída"],
  },
  {
    name: "Acondicionador Nutrición Profunda", slug: "acondicionador-nutricion-profunda", category: "acondicionadores",
    shape: "bottle", palette: "rose", lines: ["Acondicionador", "Nutrición"], bg: ["#F7EBE4", "#EBD6CB"], bg2: ["#F3E2D9", "#E2C3B5"],
    price: 42900, size: "350 ml", stock: 55, isFavorite: true, rating: 4.7, reviewCount: 96,
    shortDescription: "Desenreda al instante y deja el cabello suave, liviano y lleno de movimiento.",
    description: "Complemento ideal del shampoo. Cierra la cutícula, controla el frizz y facilita el peinado.",
    benefits: ["Desenreda al instante", "Controla el frizz", "Suavidad y movimiento", "Sin sensación grasosa"],
    howToUse: "Después del shampoo, aplica de medios a puntas. Deja actuar 3 minutos y enjuaga.",
    ingredients: "Aceite de coco, proteínas de seda, pantenol. (Texto de demostración.)",
    tags: ["acondicionador", "frizz", "suavidad"],
  },
  {
    name: "Tónico Capilar Anticaída", slug: "tonico-capilar-anticaida", category: "tratamientos",
    shape: "dropper", palette: "sage", lines: ["Tónico", "Capilar"], bg: ["#EEEDE4", "#DCDDCF"], bg2: ["#E6E7DB", "#CACDBB"],
    price: 39900, size: "60 ml", stock: 35, isFavorite: true, rating: 4.8, reviewCount: 157,
    shortDescription: "Tónico ligero de aplicación directa en el cuero cabelludo para fortalecer y reducir la caída.",
    description: "Fórmula de rápida absorción que no deja residuos ni engrasa. Perfecto para incorporar en tu rutina diaria.",
    benefits: ["Reduce la caída por quiebre", "Rápida absorción", "No engrasa", "Uso diario"],
    howToUse: "Con el cabello limpio y seco o húmedo, aplica gotas directamente en el cuero cabelludo por secciones. Masajea y no enjuagues.",
    ingredients: "Romero, ortiga, niacinamida. (Texto de demostración.)",
    tags: ["tónico", "anticaída", "cuero cabelludo"],
  },
  {
    name: "Aceite Reparador de Puntas", slug: "aceite-reparador-de-puntas", category: "aceites-y-serums",
    shape: "dropper", palette: "gold", lines: ["Aceite", "Reparador"], bg: ["#F6EBDD", "#EAD6BD"], bg2: ["#F0E0CC", "#DDC2A0"],
    price: 36900, compareAtPrice: 41900, size: "30 ml", stock: 48, isFavorite: true, rating: 4.9, reviewCount: 89,
    shortDescription: "Unas gotas para sellar las puntas, aportar brillo espejo y proteger del ambiente.",
    description: "Aceite seco multifuncional. Úsalo antes de secar o como toque final para un acabado pulido.",
    benefits: ["Sella puntas abiertas", "Brillo espejo", "Textura seca no grasosa", "Protege del ambiente"],
    howToUse: "Frota 2 o 3 gotas entre las palmas y aplica de medios a puntas en cabello húmedo o seco.",
    ingredients: "Argán, jojoba, vitamina E. (Texto de demostración.)",
    tags: ["aceite", "puntas", "brillo"],
  },
  {
    name: "Termoprotector Brillo Seda", slug: "termoprotector-brillo-seda", category: "proteccion-y-peinado",
    shape: "spray", palette: "ivory", lines: ["Termo", "protector"], bg: ["#F2E8E0", "#E4D3C6"], bg2: ["#ECDFD4", "#D8C2B2"],
    price: 34900, size: "250 ml", stock: 30, rating: 4.6, reviewCount: 61,
    shortDescription: "Protege del calor de secador y plancha mientras aporta brillo sedoso.",
    description: "Spray ligero que crea una capa protectora sobre el cabello antes de usar herramientas de calor.",
    benefits: ["Protección térmica hasta 230°C", "Brillo sedoso", "Reduce el frizz", "No deja residuos"],
    howToUse: "Aplica sobre el cabello húmedo o seco a 20 cm de distancia antes de usar secador o plancha.",
    ingredients: "Siliconas ligeras, proteína de trigo. (Texto de demostración.)",
    tags: ["termoprotector", "calor", "plancha"],
  },
  {
    name: "Mascarilla Hidratación Intensa", slug: "mascarilla-hidratacion-intensa", category: "tratamientos",
    shape: "jar", palette: "rose", lines: ["Mascarilla", "Hidratación"], bg: ["#F5E9E3", "#E8D2C8"], bg2: ["#F0DED6", "#DDBFB2"],
    price: 49900, size: "300 g", stock: 25, rating: 4.7, reviewCount: 73,
    shortDescription: "Hidratación profunda para cabellos secos, rizados u opacos.",
    description: "Una mascarilla rica que devuelve la humedad perdida y define los rizos con suavidad.",
    benefits: ["Hidratación profunda", "Define rizos", "Suaviza cabellos secos", "Aroma delicado"],
    howToUse: "Aplica sobre el cabello limpio y húmedo, deja actuar 10 minutos y enjuaga.",
    ingredients: "Aloe vera, ácido hialurónico, manteca de cacao. (Texto de demostración.)",
    tags: ["mascarilla", "hidratación", "rizos"],
  },
  {
    name: "Kit Ritual Completo", slug: "kit-ritual-completo", category: "kits",
    shape: "kit", palette: "plum", lines: ["Kit Ritual", "Completo"], bg: ["#EFDFD5", "#DFC3B3"], bg2: ["#E8D2C6", "#D2AE9B"],
    price: 159900, compareAtPrice: 189900, size: "4 productos", stock: 15, isFavorite: true, rating: 5, reviewCount: 42,
    shortDescription: "Shampoo, acondicionador, tratamiento y tónico: tu rutina completa en un solo kit.",
    description: "El ritual completo para transformar tu cabello, con un precio especial frente a comprar cada producto por separado.",
    benefits: ["Rutina completa de cuidado", "Ahorro frente a compra individual", "Ideal para regalar", "Resultados visibles"],
    howToUse: "1. Shampoo. 2. Tratamiento o acondicionador. 3. Tónico en el cuero cabelludo. Repite según la rutina recomendada.",
    ingredients: "Ver la ficha de cada producto. (Texto de demostración.)",
    tags: ["kit", "regalo", "rutina"],
  },
];

const categories = [
  { name: "Shampoos", slug: "shampoos", description: "Limpieza que cuida desde la raíz." },
  { name: "Acondicionadores", slug: "acondicionadores", description: "Suavidad, control y movimiento." },
  { name: "Tratamientos", slug: "tratamientos", description: "Rituales intensivos de reparación." },
  { name: "Aceites y sérums", slug: "aceites-y-serums", description: "Brillo y sellado de puntas." },
  { name: "Protección y peinado", slug: "proteccion-y-peinado", description: "Protege tu cabello del calor." },
  { name: "Kits", slug: "kits", description: "Rutinas completas y regalos." },
];

async function main() {
  // En producción el servidor gratuito se reinicia solo (inactividad). SEED_ONLY_IF_EMPTY=true
  // evita reescribir la demo y perder lo que la administradora ya haya editado en el panel.
  if (process.env.SEED_ONLY_IF_EMPTY === "true" && (await prisma.adminUser.count()) > 0) {
    console.log("Ya hay datos: se omite la siembra (SEED_ONLY_IF_EMPTY=true).");
    return;
  }

  await mkdir(seedDir, { recursive: true });

  // Limpiar datos de contenido (no borra archivos subidos por la administradora).
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.storeSettings.deleteMany();
  await prisma.productRelation.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVideo.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.heroSlide.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.page.deleteMany();

  const email = (process.env.ADMIN_EMAIL ?? "admin@auracapilar.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "aura2026";
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash: await bcrypt.hash(password, 10) },
    create: { email, name: "Administradora", passwordHash: await bcrypt.hash(password, 10) },
  });

  const categoryIds: Record<string, number> = {};
  const productImages: Record<string, string> = {};
  for (const [position, c] of categories.entries()) {
    categoryIds[c.slug] = (await prisma.category.create({ data: { ...c, position } })).id;
  }

  const productIds: Record<string, number> = {};
  for (const [position, p] of products.entries()) {
    const main = await saveSvg(`${p.slug}-1`, productSvg({ shape: p.shape, palette: palettes[p.palette], lines: p.lines, bg: p.bg }));
    const alt = await saveSvg(`${p.slug}-2`, productSvg({ shape: p.shape, palette: palettes[p.palette], lines: p.lines, bg: p.bg2, variant: 1 }));
    productImages[p.slug] = main;
    const created = await prisma.product.create({
      data: {
        name: p.name, slug: p.slug, brand: "Milagros", size: p.size, sku: `MIL-${String(position + 1).padStart(3, "0")}`,
        shortDescription: p.shortDescription, description: p.description, benefits: JSON.stringify(p.benefits),
        howToUse: p.howToUse, ingredients: p.ingredients, tags: JSON.stringify(p.tags),
        price: p.price, compareAtPrice: p.compareAtPrice ?? null, stock: p.stock,
        rating: p.rating ?? null, reviewCount: p.reviewCount ?? 0, isFavorite: p.isFavorite ?? false, position,
        categoryId: categoryIds[p.category],
        images: { create: [{ url: main, alt: p.name, position: 0 }, { url: alt, alt: `${p.name} detalle`, position: 1 }] },
      },
    });
    productIds[p.slug] = created.id;
  }

  // Imagen de cada categoría = primer producto de la categoría.
  for (const c of categories) {
    const first = products.find((p) => p.category === c.slug);
    if (first) await prisma.category.update({ where: { slug: c.slug }, data: { imageUrl: productImages[first.slug] } });
  }

  // Relacionados manuales para el producto principal.
  await prisma.productRelation.createMany({
    data: ["mascarilla-hidratacion-intensa", "aceite-reparador-de-puntas", "shampoo-crecimiento-acelerado", "kit-ritual-completo"].map(
      (slug, position) => ({ productId: productIds["tratamiento-milagroso-reparador"], relatedId: productIds[slug], position }),
    ),
  });

  const heroItemsA = {
    bg: ["#EBD8CB", "#F8EFE9"] as [string, string],
    items: [
      { shape: "bottle" as Shape, palette: palettes.berry, lines: ["Shampoo", "Crecimiento"] },
      { shape: "jar" as Shape, palette: palettes.plum, lines: ["Tratamiento", "Reparador"] },
      { shape: "dropper" as Shape, palette: palettes.gold, lines: ["Aceite", "Reparador"] },
    ],
  };
  const heroItemsB = {
    bg: ["#E4E3D8", "#F5F1EA"] as [string, string],
    items: [
      { shape: "dropper" as Shape, palette: palettes.sage, lines: ["Tónico", "Capilar"] },
      { shape: "bottle" as Shape, palette: palettes.rose, lines: ["Acondicionador", "Nutrición"] },
      { shape: "spray" as Shape, palette: palettes.ivory, lines: ["Termo", "protector"] },
    ],
  };
  const heroA = await saveSvg("hero-ritual", heroSvg(heroItemsA));
  const heroAMobile = await saveSvg("hero-ritual-movil", heroMobileSvg(heroItemsA));
  const heroB = await saveSvg("hero-raiz", heroSvg(heroItemsB));
  const heroBMobile = await saveSvg("hero-raiz-movil", heroMobileSvg(heroItemsB));

  await prisma.heroSlide.createMany({
    data: [
      {
        eyebrow: "Distribuidora autorizada Milagros", title: "Tu cabello también merece un ritual.",
        subtitle: "Descubre productos pensados para cuidar, transformar y devolverle vida a tu cabello.",
        mediaType: "image", imageUrl: heroA, mobileImageUrl: heroAMobile, buttonText: "Descubrir productos", buttonLink: "/tienda",
        secondaryButtonText: "Ver rutinas", secondaryButtonLink: "/rutinas", textAlign: "left", overlay: 0, position: 0,
      },
      {
        eyebrow: "Nuevo ritual", title: "Fuerza y vida desde la raíz.",
        subtitle: "Tónicos y tratamientos que acompañan el crecimiento de un cabello más fuerte.",
        mediaType: "image", imageUrl: heroB, mobileImageUrl: heroBMobile, buttonText: "Ver tratamientos", buttonLink: "/tienda?categoria=tratamientos",
        textAlign: "left", overlay: 0, position: 1,
      },
    ],
  });

  const menu = [["Inicio", "/"], ["Tienda", "/tienda"], ["Categorías", "/categorias"], ["Rutinas", "/rutinas"], ["Consejos", "/consejos"], ["Nosotros", "/nosotros"]];
  await prisma.menuItem.createMany({ data: menu.map(([label, href], position) => ({ label, href, position })) });

  await prisma.page.createMany({
    data: [
      {
        slug: "rutinas", title: "Rutinas", subtitle: "Pasos simples para resultados visibles.", position: 0,
        body: "## Rutina de reparación\nShampoo Crecimiento Acelerado → Tratamiento Milagroso Reparador (15 min) → Aceite Reparador de Puntas.\n\n## Rutina de crecimiento\nShampoo Crecimiento Acelerado → Acondicionador Nutrición Profunda → Tónico Capilar Anticaída todos los días.\n\n## Rutina antes del calor\nAcondicionador → Termoprotector Brillo Seda → secado o plancha → 2 gotas de aceite en puntas.",
      },
      {
        slug: "consejos", title: "Consejos", subtitle: "Pequeños hábitos que transforman tu cabello.", position: 1,
        body: "## Lava con agua tibia\nEl agua muy caliente reseca el cuero cabelludo y abre la cutícula.\n\n## Seca con suavidad\nUsa una toalla de microfibra o una camiseta de algodón y evita frotar.\n\n## Protege siempre del calor\nAplica termoprotector antes de secador, plancha o rizador.\n\n## Constancia\nLos tratamientos funcionan mejor cuando se usan de forma regular durante varias semanas.",
      },
      {
        slug: "nosotros", title: "Nosotros", subtitle: "Una tienda creada para cuidar tu cabello.", position: 2,
        body: "Somos distribuidora autorizada de productos Milagros. Creemos que cuidar el cabello es un ritual de amor propio, y queremos acompañarte a encontrar los productos ideales para ti.\n\nTodos nuestros productos son originales y te asesoramos por WhatsApp antes y después de tu compra.",
      },
    ],
  });

  await prisma.storeSettings.create({
    data: {
      id: 1, storeName: "AURA CAPILAR", tagline: "Rituales para un cabello con vida",
      distributorNote: "Distribuidora autorizada Milagros",
      announcementText: "Envíos a todo el país · Asesoría personalizada por WhatsApp",
      whatsappNumber: "573000000000", whatsappMessage: "Hola, quiero información sobre los productos Milagros.",
      instagramUrl: "https://instagram.com/", facebookUrl: "https://facebook.com/", tiktokUrl: "https://tiktok.com/", youtubeUrl: "https://youtube.com/",
      email: "hola@auracapilar.com", phone: "+57 300 000 0000", address: "Colombia",
      featuredProductId: productIds["tratamiento-milagroso-reparador"], featuredEyebrow: "Producto estrella",
      favoritesTitle: "Favoritos de la casa", favoritesSubtitle: "Los productos que nuestras clientas vuelven a comprar.",
      categoriesTitle: "Encuentra tu ritual", categoriesSubtitle: "Explora por necesidad y arma tu rutina ideal.",
      checkoutNote: "Pronto podrás pagar en línea. Por ahora confirmamos tu pedido y el pago por WhatsApp.",
      metaTitle: "AURA CAPILAR — Cuidado capilar Milagros", metaDescription: "Tienda online de productos para el cuidado del cabello. Distribuidora autorizada Milagros.",
      footerText: "Cuidado capilar con amor. Productos originales Milagros.",
    },
  });

  console.log(`Seed completo. Admin: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
