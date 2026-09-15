"use client";

import Link from "next/link";
import { mediaUrl } from "@/lib/api";
import { discountPercent } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Price } from "./Price";
import { AddToCartButton, FavoriteButton } from "./ProductActions";

export function ProductCard({ product }: { product: Product }) {
  const [main, hover] = product.images;
  const discount = discountPercent(product.price, product.compareAtPrice);
  return (
    <article className="group relative">
      <Link href={`/producto/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-md bg-sand">
        {main && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl(main.url)}
            alt={main.alt ?? product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        )}
        {hover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl(hover.url)}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 group-hover:opacity-100"
          />
        )}
        {discount > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-cream px-2.5 py-1 text-[0.68rem] font-medium tracking-wider text-accent">
            -{discount}%
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[0.68rem] tracking-wider text-cream">Agotado</span>
        )}
      </Link>
      <FavoriteButton product={product} className="absolute right-3 top-[18%] h-10 w-10 rounded-full bg-cream/85 backdrop-blur hover:bg-cream" />

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {product.category && <p className="eyebrow text-[0.62rem] text-ink/45">{product.category.name}</p>}
          <h3 className="mt-1 font-display text-[1.35rem] leading-tight">
            <Link href={`/producto/${product.slug}`} className="hover:text-accent">
              {product.name}
            </Link>
          </h3>
          <div className="mt-1.5">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} />
          </div>
        </div>
        <AddToCartButton
          product={product}
          iconOnly
          className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink/20 transition hover:border-primary hover:bg-primary hover:text-cream disabled:opacity-40"
        />
      </div>
    </article>
  );
}
