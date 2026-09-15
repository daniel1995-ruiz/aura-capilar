"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Eye, EyeOff, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { adminFetch } from "@/lib/adminApi";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Button, Card, Empty, inputClass, PageHeader, SortableList, Spinner, toast } from "@/components/admin/ui";

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(() => adminFetch<Product[]>("/products").then(setProducts).catch((e) => toast.error(e.message)), []);
  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? products?.filter((p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)) ?? null : products;
  }, [products, query]);

  const patch = async (p: Product, data: Partial<Product>) => {
    setProducts((list) => list?.map((x) => (x.id === p.id ? { ...x, ...data } : x)) ?? null);
    try {
      await adminFetch(`/products/${p.id}`, { method: "PATCH", json: data });
    } catch (e) {
      toast.error((e as Error).message);
      load();
    }
  };

  const reorder = async (next: Product[]) => {
    setProducts(next);
    try {
      await adminFetch("/products/reorder", { method: "PUT", json: { ids: next.map((p) => p.id) } });
      toast.ok("Orden actualizado");
    } catch (e) {
      toast.error((e as Error).message);
      load();
    }
  };

  const duplicate = async (p: Product) => {
    try {
      await adminFetch(`/products/${p.id}/duplicate`, { method: "POST" });
      toast.ok("Producto duplicado (quedó oculto)");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`¿Eliminar “${p.name}”? Esta acción no se puede deshacer.`)) return;
    try {
      await adminFetch(`/products/${p.id}`, { method: "DELETE" });
      toast.ok("Producto eliminado");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title="Productos"
        description="El orden de esta lista es el orden en que aparecen en la tienda y en el carrusel de favoritos."
        actions={
          <Link href="/admin/productos/nuevo">
            <Button><Plus className="h-4 w-4" /> Nuevo producto</Button>
          </Link>
        }
      />
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-stone-400" />
          <input className={`${inputClass} max-w-xs`} placeholder="Buscar por nombre o SKU" value={query} onChange={(e) => setQuery(e.target.value)} />
          {query && <p className="text-xs text-stone-500">El orden manual se desactiva mientras buscas.</p>}
        </div>
        {!filtered ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <Empty>No hay productos.</Empty>
        ) : (
          <SortableList
            items={filtered}
            disabled={!!query}
            onReorder={reorder}
            renderItem={(p) => (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(p.images[0]?.url)} alt="" className={`h-14 w-12 shrink-0 rounded-md bg-stone-100 object-cover ${!p.active ? "opacity-40" : ""}`} />
                <div className={`min-w-0 flex-1 ${!p.active ? "opacity-50" : ""}`}>
                  <Link href={`/admin/productos/${p.id}`} className="block truncate font-medium hover:underline">{p.name}</Link>
                  <p className="truncate text-xs text-stone-500">
                    {p.category?.name ?? "Sin categoría"} · {formatPrice(p.price)} · Stock {p.stock}
                  </p>
                </div>
                <Button variant="ghost" className="px-2" onClick={() => patch(p, { isFavorite: !p.isFavorite })} title={p.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}>
                  <Star className={`h-4 w-4 ${p.isFavorite ? "fill-amber-400 text-amber-500" : "text-stone-400"}`} />
                </Button>
                <Button variant="ghost" className="px-2" onClick={() => patch(p, { active: !p.active })} title={p.active ? "Visible — clic para ocultar" : "Oculto — clic para mostrar"}>
                  {p.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-stone-400" />}
                </Button>
                <div className="hidden sm:flex">
                  <Button variant="ghost" className="px-2" onClick={() => duplicate(p)} title="Duplicar">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Link href={`/admin/productos/${p.id}`}>
                  <Button variant="ghost" className="px-2" aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
                </Link>
                <Button variant="ghost" className="px-2 text-red-600" onClick={() => remove(p)} aria-label="Eliminar">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        )}
      </Card>
    </>
  );
}
