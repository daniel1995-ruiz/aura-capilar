"use client";

import Link from "next/link";
import { Heart, X } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { useCart, useFavorites, useHydrated } from "@/lib/stores";
import { Price } from "@/components/store/Price";

export default function FavoritesPage() {
  const hydrated = useHydrated();
  const { items, remove } = useFavorites();
  const add = useCart((s) => s.add);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10 lg:py-16">
      <p className="eyebrow text-accent">Tu selección</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl">Favoritos</h1>

      {hydrated && items.length === 0 && (
        <div className="flex flex-col items-center py-24 text-center">
          <Heart strokeWidth={1} className="h-14 w-14 text-accent" />
          <p className="mt-5 font-display text-3xl">Aún no tienes favoritos</p>
          <p className="mt-2 text-ink/60">Toca el corazón en cualquier producto para guardarlo aquí.</p>
          <Link href="/tienda" className="btn btn-primary mt-8">Explorar la tienda</Link>
        </div>
      )}

      {hydrated && items.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          {items.map((item) => (
            <article key={item.productId} className="relative">
              <Link href={`/producto/${item.slug}`} className="block aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-md bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />
              </Link>
              <button onClick={() => remove(item.productId)} className="absolute right-3 top-[18%] grid h-10 w-10 place-items-center rounded-full bg-cream/85" aria-label={`Quitar ${item.name} de favoritos`}>
                <X strokeWidth={1.4} className="h-4 w-4" />
              </button>
              <h3 className="mt-4 font-display text-xl leading-tight">
                <Link href={`/producto/${item.slug}`}>{item.name}</Link>
              </h3>
              <div className="mt-1"><Price price={item.price} compareAtPrice={item.compareAtPrice} /></div>
              <button
                onClick={() => add({ productId: item.productId, slug: item.slug, name: item.name, price: item.price, image: item.image, quantity: 1 })}
                className="btn btn-outline mt-4 min-h-10 w-full px-3"
              >
                Agregar al carrito
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
