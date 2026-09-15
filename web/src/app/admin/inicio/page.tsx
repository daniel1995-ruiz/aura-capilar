"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { adminFetch } from "@/lib/adminApi";
import { formatPrice } from "@/lib/format";
import type { Product, Settings } from "@/lib/types";
import { FormFields, type FieldDef } from "@/components/admin/FormFields";
import { Button, Card, PageHeader, Spinner, toast } from "@/components/admin/ui";

const sectionFields: FieldDef[] = [
  { name: "featuredEyebrow", label: "Etiqueta del producto principal", placeholder: "Producto estrella" },
  { name: "favoritesTitle", label: "Título de Favoritos", placeholder: "Favoritos de la casa" },
  { name: "favoritesSubtitle", label: "Subtítulo de Favoritos", wide: true },
  { name: "categoriesTitle", label: "Título de Categorías" },
  { name: "categoriesSubtitle", label: "Subtítulo de Categorías", wide: true },
  { name: "announcementText", label: "Barra de anuncio superior", hint: "Déjalo vacío para ocultarla.", wide: true },
];

export default function HomeAdminPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([adminFetch<Settings>("/settings"), adminFetch<Product[]>("/products")])
      .then(([s, p]) => {
        setSettings(s);
        setProducts(p);
      })
      .catch((e) => toast.error(e.message));
  }, []);

  if (!settings) return <Spinner />;

  const save = async () => {
    setSaving(true);
    try {
      const { featuredProductId, featuredEyebrow, favoritesTitle, favoritesSubtitle, categoriesTitle, categoriesSubtitle, announcementText } = settings;
      setSettings(
        await adminFetch<Settings>("/settings", {
          method: "PUT",
          json: { featuredProductId, featuredEyebrow, favoritesTitle, favoritesSubtitle, categoriesTitle, categoriesSubtitle, announcementText },
        }),
      );
      toast.ok("Home actualizado");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const favorites = products.filter((p) => p.isFavorite && p.active);

  return (
    <>
      <PageHeader
        title="Home"
        description="Controla qué ve primero tu clienta: el producto protagonista, los favoritos y los textos de cada sección."
        actions={<Button onClick={save} loading={saving}>Guardar cambios</Button>}
      />

      <div className="space-y-6">
        <Card title="1. Hero principal" description="El bloque visual que abre la página.">
          <Link href="/admin/hero" className="text-sm font-medium underline">Administrar imágenes, videos y textos del Hero →</Link>
        </Card>

        <Card title="2. Producto destacado principal" description="Aparece justo después del Hero como protagonista.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => {
              const selected = settings.featuredProductId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, featuredProductId: selected ? null : p.id })}
                  className={`overflow-hidden rounded-lg border-2 text-left transition ${selected ? "border-stone-900 ring-2 ring-stone-900/10" : "border-stone-200 hover:border-stone-400"} ${!p.active ? "opacity-50" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(p.images[0]?.url)} alt="" className="aspect-[4/5] w-full bg-stone-100 object-cover" />
                  <div className="p-2.5">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">{p.name}</p>
                    <p className="text-xs text-stone-500">{formatPrice(p.price, settings.currency, settings.locale)}</p>
                    {selected && <p className="mt-1 text-xs font-medium text-emerald-700">✓ Seleccionado</p>}
                    {!p.active && <p className="mt-1 text-xs text-stone-500">Oculto en la tienda</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="3. Carrusel de favoritos" description="Muestra los productos marcados con estrella, en el orden definido en Productos.">
          <div className="flex flex-wrap gap-2">
            {favorites.length === 0 && <p className="text-sm text-stone-500">No hay productos favoritos activos.</p>}
            {favorites.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-900">
                <Star className="h-3.5 w-3.5 fill-current" /> {p.name}
              </span>
            ))}
          </div>
          <Link href="/admin/productos" className="mt-4 inline-block text-sm font-medium underline">Marcar favoritos y ordenar →</Link>
        </Card>

        <Card title="Textos de las secciones">
          <FormFields fields={sectionFields} values={settings} onChange={(v) => setSettings(v as Settings)} />
        </Card>
      </div>
    </>
  );
}
