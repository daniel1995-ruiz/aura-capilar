"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { discountPercent } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Price } from "./Price";
import { AddToCartButton, FavoriteButton } from "./ProductActions";
import { Rating } from "./Rating";
import { useStore } from "./StoreProvider";

export function FeaturedProduct({ product }: { product: Product }) {
  const { settings } = useStore();
  const [imageIndex, setImageIndex] = useState(0);
  const image = product.images[imageIndex] ?? product.images[0];
  const discount = discountPercent(product.price, product.compareAtPrice);

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="pointer-events-none absolute -left-40 top-24 h-[28rem] w-[28rem] rounded-full bg-sand/70 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20 lg:px-10">
        {/* Imagen protagonista */}
        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="arch relative aspect-[4/5] overflow-hidden bg-sand shadow-[0_40px_80px_-40px_rgba(43,30,36,.45)]">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={image.url} src={mediaUrl(image.url)} alt={image.alt ?? product.name} className="animate-rise h-full w-full object-cover" />
            )}
            {discount > 0 && (
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-cream/90 px-4 py-1.5 text-xs font-medium tracking-[0.18em] text-accent backdrop-blur">
                -{discount}% HOY
              </span>
            )}
          </div>
          <div className="absolute -right-2 top-6 grid h-24 w-24 place-items-center rounded-full bg-primary text-center text-cream shadow-xl sm:-right-6 sm:top-auto sm:bottom-24 sm:h-32 sm:w-32">
            <span className="px-3 font-display text-[0.95rem] italic leading-tight">{settings.featuredEyebrow || "Favorito"}</span>
          </div>

          {product.images.length > 1 && (
            <div className="mt-10 flex justify-center gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  className={`h-20 w-16 overflow-hidden rounded-full border transition ${i === imageIndex ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(img.url)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información */}
        <div className="max-w-xl">
          <p className="eyebrow text-accent">{settings.featuredEyebrow || "Producto destacado"}</p>
          <p className="eyebrow mt-6 text-ink/50">{product.brand}{product.size ? ` · ${product.size}` : ""}</p>
          <h2 className="mt-3 font-display text-5xl leading-[1.02] sm:text-6xl">{product.name}</h2>

          <div className="mt-5">
            <Rating value={product.rating} count={product.reviewCount} />
          </div>

          <div className="mt-6">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
          </div>

          {product.shortDescription && <p className="mt-6 text-lg leading-relaxed text-ink/70">{product.shortDescription}</p>}

          {product.benefits.length > 0 && (
            <ul className="mt-8 grid gap-3 border-y border-ink/10 py-7 sm:grid-cols-2">
              {product.benefits.slice(0, 6).map((b) => (
                <li key={b} className="flex items-start gap-3 text-[0.95rem]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                    <Check strokeWidth={2} className="h-3 w-3" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <AddToCartButton product={product} className="btn btn-primary" />
            <Link href={`/producto/${product.slug}`} className="btn btn-outline">
              Ver producto <ArrowRight strokeWidth={1.4} className="h-4 w-4" />
            </Link>
            <FavoriteButton product={product} withLabel className="ml-1 h-12 rounded-full px-4 hover:bg-ink/5" />
          </div>
        </div>
      </div>
    </section>
  );
}
