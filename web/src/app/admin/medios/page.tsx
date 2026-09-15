"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Trash2, Upload } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { adminFetch, uploadMedia } from "@/lib/adminApi";
import type { MediaAsset } from "@/lib/types";
import { Button, Card, Empty, PageHeader, Spinner, toast } from "@/components/admin/ui";

export default function MediaAdminPage() {
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [filter, setFilter] = useState<"" | "image" | "video">("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => adminFetch<MediaAsset[]>(`/media${filter ? `?kind=${filter}` : ""}`).then(setAssets).catch((e) => toast.error(e.message)), [filter]);
  useEffect(() => {
    load();
  }, [load]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        await uploadMedia(file);
      } catch (e) {
        toast.error(`${file.name}: ${(e as Error).message}`);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    toast.ok("Carga terminada");
    load();
  };

  const remove = async (a: MediaAsset) => {
    if (!confirm("¿Eliminar este archivo? Si está en uso en un producto o banner, dejará de verse.")) return;
    try {
      await adminFetch(`/media/${a.id}`, { method: "DELETE" });
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title="Imágenes y videos"
        description="Biblioteca central de archivos. Todo lo que subas queda disponible para productos, hero, categorías y páginas."
        actions={<Button onClick={() => fileRef.current?.click()} loading={uploading}><Upload className="h-4 w-4" /> Subir archivos</Button>}
      />
      <input ref={fileRef} type="file" multiple hidden accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/quicktime" onChange={(e) => upload(e.target.files)} />

      <div className="mb-4 flex gap-2">
        {([["", "Todos"], ["image", "Imágenes"], ["video", "Videos"]] as const).map(([value, label]) => (
          <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-3 py-1 text-sm ${filter === value ? "bg-stone-900 text-white" : "bg-white text-stone-600 hover:bg-stone-200"}`}>
            {label}
          </button>
        ))}
      </div>

      <Card>
        {!assets ? (
          <Spinner />
        ) : assets.length === 0 ? (
          <Empty>Aún no hay archivos subidos.</Empty>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {assets.map((a) => (
              <figure key={a.id} className="overflow-hidden rounded-lg border border-stone-200">
                <div className="aspect-square bg-stone-100">
                  {a.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(a.url)} alt={a.fileName} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <video src={mediaUrl(a.url)} className="h-full w-full object-cover" muted controls preload="metadata" />
                  )}
                </div>
                <figcaption className="p-2">
                  <p className="truncate text-xs text-stone-700" title={a.fileName}>{a.fileName}</p>
                  <p className="text-[11px] text-stone-400">{(a.size / 1024 / 1024).toFixed(2)} MB</p>
                  <div className="mt-1 flex justify-between">
                    <button
                      className="rounded p-1 text-stone-500 hover:bg-stone-100"
                      onClick={() => navigator.clipboard.writeText(a.url).then(() => toast.ok("Ruta copiada"))}
                      aria-label="Copiar ruta"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded p-1 text-red-600 hover:bg-red-50" onClick={() => remove(a)} aria-label="Eliminar">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
