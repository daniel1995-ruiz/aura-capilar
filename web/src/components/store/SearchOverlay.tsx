"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { API_URL, mediaUrl } from "@/lib/api";
import type { Product } from "@/lib/types";
import { useStore } from "./StoreProvider";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { price } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`${API_URL}/api/public/products?q=${encodeURIComponent(q)}&limit=5`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => setResults(data.items ?? []))
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }, 220);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/tienda?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div
        role="dialog"
        aria-label="Buscar productos"
        className={`absolute inset-x-0 top-0 bg-cream shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="mx-auto max-w-3xl px-5 pb-8 pt-6 sm:pt-10">
          <form onSubmit={submit} className="flex items-center gap-3 border-b border-ink/25 pb-3">
            <Search strokeWidth={1.3} className="h-6 w-6 shrink-0 text-ink/60" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="¿Qué necesita tu cabello hoy?"
              className="w-full bg-transparent font-display text-2xl outline-none placeholder:text-ink/35 sm:text-3xl"
              type="search"
            />
            <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-ink/5" aria-label="Cerrar búsqueda">
              <X strokeWidth={1.4} className="h-6 w-6" />
            </button>
          </form>

          <div className="mt-5 min-h-10">
            {query.trim().length >= 2 && !loading && results.length === 0 && (
              <p className="text-sm text-ink/60">No encontramos productos para “{query}”.</p>
            )}
            <ul className="divide-y divide-ink/10">
              {results.map((p) => (
                <li key={p.id}>
                  <Link href={`/producto/${p.slug}`} onClick={onClose} className="flex items-center gap-4 py-3 transition hover:opacity-70">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(p.images[0]?.url)} alt="" className="h-16 w-14 rounded-sm bg-sand object-cover" />
                    <div className="flex-1">
                      <p className="font-display text-lg leading-tight">{p.name}</p>
                      <p className="text-sm text-ink/60">{price(p.price)}</p>
                    </div>
                    <ArrowRight strokeWidth={1.3} className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
            {results.length > 0 && (
              <button onClick={submit} className="eyebrow mt-4 inline-flex items-center gap-2 text-accent">
                Ver todos los resultados <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
