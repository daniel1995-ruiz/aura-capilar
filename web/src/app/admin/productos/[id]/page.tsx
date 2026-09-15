"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, ImagePlus, Library, Plus, Trash2, Upload } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { adminFetch, uploadMedia } from "@/lib/adminApi";
import { youtubeId } from "@/lib/format";
import type { Category, Product, ProductImage, ProductVideo, Settings } from "@/lib/types";
import { FormFields, type FieldDef } from "@/components/admin/FormFields";
import { MediaInput, MediaPicker } from "@/components/admin/MediaInput";
import { Button, Card, Field, inputClass, PageHeader, Spinner, toast, Toggle } from "@/components/admin/ui";

type Draft = Partial<Product> & { relatedIds: number[]; images: ProductImage[]; videos: ProductVideo[]; benefits: string[]; tags: string[] };

const empty: Draft = {
  name: "", slug: "", brand: "Milagros", price: 0, stock: 0, reviewCount: 0, active: true, isFavorite: false,
  benefits: [], tags: [], images: [], videos: [], relatedIds: [],
};

function moveItem<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [m] = next.splice(from, 1);
  next.splice(to, 0, m);
  return next;
}

export default function ProductEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "nuevo";
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft | null>(isNew ? empty : null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newVideo, setNewVideo] = useState("");

  useEffect(() => {
    adminFetch<Category[]>("/categories").then(setCategories).catch(() => undefined);
    adminFetch<Product[]>("/products").then(setAllProducts).catch(() => undefined);
    adminFetch<Settings>("/settings").then(setSettings).catch(() => undefined);
    if (!isNew) adminFetch<Draft>(`/products/${id}`).then(setDraft).catch((e) => toast.error(e.message));
  }, [id, isNew]);

  if (!draft) return <Spinner />;

  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });
  const isHomeFeatured = !isNew && settings?.featuredProductId === Number(id);

  const save = async () => {
    setSaving(true);
    try {
      const saved = isNew
        ? await adminFetch<Product>("/products", { json: draft })
        : await adminFetch<Product>(`/products/${id}`, { method: "PUT", json: draft });
      toast.ok("Producto guardado");
      if (isNew) router.replace(`/admin/productos/${saved.id}`);
      else set({ slug: saved.slug });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const setHomeFeatured = async (on: boolean) => {
    try {
      setSettings(await adminFetch<Settings>("/settings", { method: "PUT", json: { featuredProductId: on ? Number(id) : null } }));
      toast.ok(on ? "Ahora es el producto principal del Home" : "Ya no es el producto principal");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const added: ProductImage[] = [];
    for (const file of Array.from(files)) {
      try {
        const asset = await uploadMedia(file);
        added.push({ url: asset.url, alt: draft.name ?? null });
      } catch (e) {
        toast.error(`${file.name}: ${(e as Error).message}`);
      }
    }
    setDraft((d) => (d ? { ...d, images: [...d.images, ...added] } : d));
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const basicFields: FieldDef[] = [
    { name: "name", label: "Nombre del producto", wide: true },
    { name: "slug", label: "URL (slug)", hint: "Se genera del nombre si lo dejas vacío." },
    { name: "brand", label: "Marca" },
    { name: "categoryId", label: "Categoría", type: "select", options: [{ value: "", label: "Sin categoría" }, ...categories.map((c) => ({ value: c.id, label: c.name }))] },
    { name: "size", label: "Presentación", placeholder: "350 ml" },
    { name: "sku", label: "SKU / Referencia" },
  ];
  const priceFields: FieldDef[] = [
    { name: "price", label: "Precio", type: "number" },
    { name: "compareAtPrice", label: "Precio anterior (tachado)", type: "number", hint: "Opcional. Si es mayor al precio, se muestra el descuento." },
    { name: "stock", label: "Unidades disponibles", type: "number" },
  ];
  const textFields: FieldDef[] = [
    { name: "shortDescription", label: "Descripción corta", type: "textarea", rows: 2, hint: "Se muestra en el Home y junto al precio." },
    { name: "description", label: "Descripción completa", type: "textarea", rows: 5 },
    { name: "howToUse", label: "Modo de uso", type: "textarea", rows: 4 },
    { name: "ingredients", label: "Ingredientes", type: "textarea", rows: 3 },
  ];
  const ratingFields: FieldDef[] = [
    { name: "rating", label: "Calificación (0 a 5)", type: "number", hint: "Opcional. Déjalo vacío para ocultar." },
    { name: "reviewCount", label: "Número de reseñas", type: "number" },
  ];

  return (
    <>
      <Link href="/admin/productos" className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900">
        <ArrowLeft className="h-4 w-4" /> Productos
      </Link>
      <PageHeader
        title={isNew ? "Nuevo producto" : draft.name || "Producto"}
        actions={
          <>
            {!isNew && draft.slug && (
              <a href={`/producto/${draft.slug}`} target="_blank">
                <Button variant="secondary"><ExternalLink className="h-4 w-4" /> Ver en tienda</Button>
              </a>
            )}
            <Button onClick={save} loading={saving}>Guardar</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Información básica">
            <FormFields fields={basicFields} values={draft} onChange={(v) => setDraft(v as Draft)} />
          </Card>

          <Card title="Imágenes" description="La primera imagen es la principal. La segunda aparece al pasar el mouse. Recomendado: 1200×1500 px (4:5).">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {draft.images.map((img, i) => (
                <div key={img.url + i} className="group relative overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(img.url)} alt="" className="aspect-[4/5] w-full object-cover" />
                  {i === 0 && <span className="absolute left-2 top-2 rounded bg-stone-900 px-1.5 py-0.5 text-[10px] text-white">Principal</span>}
                  <div className="flex items-center justify-between gap-1 p-1.5">
                    <div className="flex">
                      <button type="button" className="rounded p-1 hover:bg-stone-200 disabled:opacity-30" disabled={i === 0} onClick={() => set({ images: moveItem(draft.images, i, i - 1) })} aria-label="Mover antes">
                        <ArrowUp className="h-3.5 w-3.5 -rotate-90" />
                      </button>
                      <button type="button" className="rounded p-1 hover:bg-stone-200 disabled:opacity-30" disabled={i === draft.images.length - 1} onClick={() => set({ images: moveItem(draft.images, i, i + 1) })} aria-label="Mover después">
                        <ArrowDown className="h-3.5 w-3.5 -rotate-90" />
                      </button>
                    </div>
                    <button type="button" className="rounded p-1 text-red-600 hover:bg-red-50" onClick={() => set({ images: draft.images.filter((_, j) => j !== i) })} aria-label="Quitar imagen">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="grid aspect-[4/5] place-items-center rounded-lg border-2 border-dashed border-stone-300 text-stone-500 transition hover:border-stone-500 hover:text-stone-800"
              >
                <span className="flex flex-col items-center gap-1 text-sm">
                  {uploading ? "Subiendo…" : <><ImagePlus className="h-6 w-6" /> Subir fotos</>}
                </span>
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" onClick={() => setPickerOpen(true)}><Library className="h-4 w-4" /> Elegir de la biblioteca</Button>
            </div>
            <input ref={fileRef} type="file" multiple hidden accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => uploadImages(e.target.files)} />
            <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} kind="image" onSelect={(a) => set({ images: [...draft.images, { url: a.url, alt: draft.name ?? null }] })} />
          </Card>

          <Card title="Precio e inventario">
            <FormFields fields={priceFields} values={draft} onChange={(v) => setDraft(v as Draft)} />
          </Card>

          <Card title="Descripción y uso">
            <FormFields fields={textFields} values={draft} onChange={(v) => setDraft(v as Draft)} />
          </Card>

          <Card title="Beneficios" description="Frases cortas. Se muestran con un check en el Home y en la ficha.">
            <div className="space-y-2">
              {draft.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input className={inputClass} value={b} onChange={(e) => set({ benefits: draft.benefits.map((x, j) => (j === i ? e.target.value : x)) })} />
                  <Button variant="ghost" className="px-2" onClick={() => set({ benefits: moveItem(draft.benefits, i, i - 1) })} aria-label="Subir"><ArrowUp className="h-4 w-4" /></Button>
                  <Button variant="ghost" className="px-2 text-red-600" onClick={() => set({ benefits: draft.benefits.filter((_, j) => j !== i) })} aria-label="Quitar"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="secondary" onClick={() => set({ benefits: [...draft.benefits, ""] })}><Plus className="h-4 w-4" /> Agregar beneficio</Button>
            </div>
          </Card>

          <Card title="Videos" description="Enlaces de YouTube o videos propios subidos a la biblioteca.">
            <div className="space-y-3">
              {draft.videos.map((v, i) => (
                <div key={v.url + i} className="flex items-center gap-3 rounded-lg border border-stone-200 p-2">
                  {v.kind === "youtube" && youtubeId(v.url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`https://i.ytimg.com/vi/${youtubeId(v.url)}/mqdefault.jpg`} alt="" className="h-14 w-24 rounded object-cover" />
                  ) : (
                    <video src={mediaUrl(v.url)} className="h-14 w-24 rounded bg-stone-100 object-cover" muted />
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <input className={inputClass} placeholder="Título (opcional)" value={v.title ?? ""} onChange={(e) => set({ videos: draft.videos.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
                    <p className="truncate text-xs text-stone-500">{v.kind === "youtube" ? "YouTube" : "Video propio"} · {v.url}</p>
                  </div>
                  <Button variant="ghost" className="px-2 text-red-600" onClick={() => set({ videos: draft.videos.filter((_, j) => j !== i) })} aria-label="Quitar video"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <div className="flex flex-col gap-2 sm:flex-row">
                <input className={inputClass} placeholder="Pega un enlace de YouTube" value={newVideo} onChange={(e) => setNewVideo(e.target.value)} />
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!youtubeId(newVideo)) return toast.error("Enlace de YouTube no válido");
                    set({ videos: [...draft.videos, { kind: "youtube", url: newVideo.trim(), title: null }] });
                    setNewVideo("");
                  }}
                >
                  <Plus className="h-4 w-4" /> Agregar
                </Button>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium text-stone-700">o sube un video propio</p>
                <MediaInput kind="video" compact value={null} onChange={(url) => url && set({ videos: [...draft.videos, { kind: "file", url, title: null }] })} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Visibilidad">
            <div className="space-y-5">
              <Toggle checked={!!draft.active} onChange={(v) => set({ active: v })} label="Visible en la tienda" />
              <Toggle checked={!!draft.isFavorite} onChange={(v) => set({ isFavorite: v })} label="Favorito" hint="Aparece en el carrusel del Home." />
              {!isNew && (
                <Toggle checked={isHomeFeatured} onChange={setHomeFeatured} label="Producto principal del Home" hint="Se aplica al instante." />
              )}
            </div>
          </Card>

          <Card title="Calificación">
            <FormFields fields={ratingFields} values={draft} onChange={(v) => setDraft(v as Draft)} />
          </Card>

          <Card title="Etiquetas de búsqueda" description="Separadas por coma. Ayudan al buscador.">
            <Field label="Etiquetas">
              <input className={inputClass} defaultValue={draft.tags.join(", ")} onBlur={(e) => set({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
            </Field>
          </Card>

          <Card title="Productos relacionados" description="Si no eliges ninguno, se sugieren de la misma categoría.">
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {allProducts.filter((p) => String(p.id) !== id).map((p) => (
                <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-stone-50">
                  <input
                    type="checkbox"
                    checked={draft.relatedIds.includes(p.id)}
                    onChange={(e) => set({ relatedIds: e.target.checked ? [...draft.relatedIds, p.id] : draft.relatedIds.filter((r) => r !== p.id) })}
                  />
                  <span className="truncate">{p.name}</span>
                </label>
              ))}
            </div>
          </Card>

          <Button onClick={save} loading={saving} className="w-full py-2.5">
            <Upload className="h-4 w-4" /> Guardar producto
          </Button>
        </div>
      </div>
    </>
  );
}
