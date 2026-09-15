import { cache } from "react";
import type { Category, ContentPage, HomeData, MenuItem, Order, Product, ProductDetail, Settings } from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

/** Convierte rutas relativas del storage (/uploads/...) en URLs absolutas. Las URLs externas (CDN) se respetan. */
export function mediaUrl(url?: string | null) {
  if (!url) return "";
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

async function get<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}/api/public${path}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} en ${path}`);
  return res.json() as Promise<T>;
}

export const storeApi = {
  home: cache(async () => (await get<HomeData>("/home"))!),
  settings: cache(async () => (await get<{ settings: Settings; menu: MenuItem[] }>("/settings"))!),
  categories: () => get<Category[]>("/categories").then((c) => c ?? []),
  products: (params: Record<string, string | undefined> = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => !!e[1]));
    return get<{ total: number; items: Product[] }>(`/products?${qs}`).then((r) => r ?? { total: 0, items: [] });
  },
  product: cache((slug: string) => get<ProductDetail>(`/products/${encodeURIComponent(slug)}`)),
  page: cache((slug: string) => get<ContentPage>(`/pages/${encodeURIComponent(slug)}`)),
};

export async function createOrder(payload: {
  customer: Record<string, string>;
  items: { productId: number; quantity: number }[];
  channel: "web" | "whatsapp";
}): Promise<Order> {
  const res = await fetch(`${API_URL}/api/public/orders`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "No se pudo crear el pedido");
  return data;
}
