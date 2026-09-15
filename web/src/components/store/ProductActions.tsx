"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { toCartItem, useCart, useFavorites, useHydrated } from "@/lib/stores";
import type { Product } from "@/lib/types";

export function FavoriteButton({ product, className = "", withLabel = false }: { product: Product; className?: string; withLabel?: boolean }) {
  const hydrated = useHydrated();
  const active = useFavorites((s) => s.items.some((i) => i.productId === product.id)) && hydrated;
  const toggle = useFavorites((s) => s.toggle);
  return (
    <button
      type="button"
      onClick={() => toggle(product)}
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`group/fav inline-flex items-center justify-center gap-2 transition ${className}`}
    >
      <Heart
        strokeWidth={1.5}
        className={`h-5 w-5 transition duration-300 group-active/fav:scale-125 ${active ? "fill-accent text-accent" : ""}`}
      />
      {withLabel && <span className="eyebrow">{active ? "En favoritos" : "Favorito"}</span>}
    </button>
  );
}

export function AddToCartButton({
  product, quantity = 1, className = "btn btn-primary", label = "Agregar al carrito", iconOnly = false,
}: { product: Product; quantity?: number; className?: string; label?: string; iconOnly?: boolean }) {
  const add = useCart((s) => s.add);
  const soldOut = product.stock <= 0;
  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => add(toCartItem(product, quantity))}
      className={className}
      aria-label={iconOnly ? `${label}: ${product.name}` : undefined}
    >
      <ShoppingBag strokeWidth={1.5} className="h-[18px] w-[18px]" />
      {!iconOnly && (soldOut ? "Agotado" : label)}
    </button>
  );
}
