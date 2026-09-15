import type { Prisma } from "@prisma/client";
import { parseJsonArray } from "./http.js";

export const productInclude = {
  images: { orderBy: { position: "asc" } },
  videos: { orderBy: { position: "asc" } },
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export function serializeProduct(product: ProductWithRelations) {
  return {
    ...product,
    benefits: parseJsonArray(product.benefits),
    tags: parseJsonArray(product.tags),
  };
}
