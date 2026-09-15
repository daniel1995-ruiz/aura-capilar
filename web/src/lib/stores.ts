"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./types";

export type CartItem = { productId: number; slug: string; name: string; price: number; image: string | null; quantity: number };
export type FavoriteItem = { productId: number; slug: string; name: string; price: number; compareAtPrice: number | null; image: string | null };

export const toCartItem = (p: Product, quantity = 1): CartItem => ({
  productId: p.id, slug: p.slug, name: p.name, price: p.price, image: p.images[0]?.url ?? null, quantity,
});

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (item: CartItem) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          const items = existing
            ? s.items.map((i) => (i.productId === item.productId ? { ...i, ...item, quantity: Math.min(99, i.quantity + item.quantity) } : i))
            : [...s.items, item];
          return { items, isOpen: true };
        }),
      setQuantity: (productId, quantity) =>
        set((s) => ({
          items: quantity <= 0
            ? s.items.filter((i) => i.productId !== productId)
            : s.items.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(99, quantity) } : i)),
        })),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: "aura-cart", partialize: (s) => ({ items: s.items }) },
  ),
);

type FavoritesState = {
  items: FavoriteItem[];
  toggle: (product: Product) => void;
  remove: (productId: number) => void;
};

export const useFavorites = create<FavoritesState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (p) =>
        set((s) =>
          s.items.some((i) => i.productId === p.id)
            ? { items: s.items.filter((i) => i.productId !== p.id) }
            : {
                items: [
                  ...s.items,
                  { productId: p.id, slug: p.slug, name: p.name, price: p.price, compareAtPrice: p.compareAtPrice, image: p.images[0]?.url ?? null },
                ],
              },
        ),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
    }),
    { name: "aura-favorites" },
  ),
);

/** Evita diferencias entre servidor y cliente al leer datos guardados en el navegador. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
