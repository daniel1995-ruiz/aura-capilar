import type { Metadata } from "next";
import { Suspense } from "react";
import { storeApi } from "@/lib/api";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopFilters } from "@/components/store/ShopFilters";

export const metadata: Metadata = { title: "Tienda" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [{ items, total }, categories] = await Promise.all([
    storeApi.products({ q: params.q, categoria: params.categoria, orden: params.orden, promo: params.promo }),
    storeApi.categories(),
  ]);
  const current = categories.find((c) => c.slug === params.categoria);

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-10 pt-12 lg:px-10 lg:pt-16">
      <header className="max-w-2xl">
        <p className="eyebrow text-accent">Tienda</p>
        <h1 className="mt-3 font-display text-5xl leading-tight sm:text-6xl">{current?.name ?? "Todos los productos"}</h1>
        {current?.description && <p className="mt-3 text-ink/65">{current.description}</p>}
      </header>

      <div className="mt-10">
        <Suspense>
          <ShopFilters categories={categories} total={total} />
        </Suspense>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-3xl">No encontramos productos</p>
          <p className="mt-2 text-ink/60">Prueba con otra búsqueda o categoría.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
