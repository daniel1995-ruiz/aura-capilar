"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { Category } from "@/lib/types";

const sortOptions = [
  { value: "", label: "Recomendados" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nuevos", label: "Más nuevos" },
  { value: "nombre", label: "Nombre (A-Z)" },
];

export function ShopFilters({ categories, total }: { categories: Category[]; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => setQ(params.get("q") ?? ""), [params]);

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const activeCategory = params.get("categoria");
  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-2 text-[0.72rem] uppercase tracking-[0.16em] transition ${
      active ? "border-primary bg-primary text-cream" : "border-ink/15 hover:border-ink/50"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update("q", q.trim() || null);
          }}
          className="flex w-full items-center gap-3 border-b border-ink/20 pb-2 md:max-w-sm"
        >
          <Search strokeWidth={1.3} className="h-5 w-5 text-ink/50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar productos" className="w-full bg-transparent outline-none placeholder:text-ink/40" type="search" />
        </form>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={params.get("promo") === "1"} onChange={(e) => update("promo", e.target.checked ? "1" : null)} className="h-4 w-4 accent-[var(--brand-accent)]" />
            En promoción
          </label>
          <select
            value={params.get("orden") ?? ""}
            onChange={(e) => update("orden", e.target.value || null)}
            className="rounded-full border border-ink/15 bg-transparent px-4 py-2 text-sm outline-none"
            aria-label="Ordenar"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6">
        <button className={chip(!activeCategory)} onClick={() => update("categoria", null)}>
          Todos
        </button>
        {categories.map((c) => (
          <button key={c.id} className={chip(activeCategory === c.slug)} onClick={() => update("categoria", c.slug)}>
            {c.name}
          </button>
        ))}
      </div>

      <p className="text-sm text-ink/55">
        {total} {total === 1 ? "producto" : "productos"}
        {params.get("q") ? ` para “${params.get("q")}”` : ""}
      </p>
    </div>
  );
}
