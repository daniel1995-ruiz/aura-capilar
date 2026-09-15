"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Library, Trash2, Upload, Video } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { adminFetch, uploadMedia } from "@/lib/adminApi";
import type { MediaAsset } from "@/lib/types";
import { Button, inputClass, Modal, Spinner, toast } from "./ui";

export function MediaPicker({ open, onClose, kind, onSelect }: { open: boolean; onClose: () => void; kind: "image" | "video"; onSelect: (asset: MediaAsset) => void }) {
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  useEffect(() => {
    if (!open) return;
    setAssets(null);
    adminFetch<MediaAsset[]>(`/media?kind=${kind}`).then(setAssets).catch((e) => toast.error(e.message));
  }, [open, kind]);

  return (
    <Modal open={open} onClose={onClose} title={kind === "image" ? "Biblioteca de imágenes" : "Biblioteca de videos"} wide>
      {!assets ? (
        <Spinner />
      ) : assets.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-500">Aún no hay archivos. Súbelos desde “Subir” o en la sección Medios.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {assets.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                onSelect(a);
                onClose();
              }}
              className="group aspect-square overflow-hidden rounded-lg border border-stone-200 bg-stone-100 hover:ring-2 hover:ring-stone-900"
              title={a.fileName}
            >
              {a.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(a.url)} alt={a.fileName} className="h-full w-full object-cover" />
              ) : (
                <video src={mediaUrl(a.url)} className="h-full w-full object-cover" muted />
              )}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

/** Campo para elegir una imagen o video: subir archivo, elegir de la biblioteca o pegar una URL. */
export function MediaInput({ value, onChange, kind = "image", compact }: { value: string | null | undefined; onChange: (url: string | null) => void; kind?: "image" | "video"; compact?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadMedia(file);
      onChange(asset.url);
      toast.ok("Archivo subido");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const Icon = kind === "image" ? ImageIcon : Video;

  return (
    <div className="flex gap-3">
      <div className={`${compact ? "h-20 w-20" : "h-28 w-28"} grid shrink-0 place-items-center overflow-hidden rounded-lg border border-stone-200 bg-stone-100`}>
        {value ? (
          kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(value)} alt="" className="h-full w-full object-cover" />
          ) : (
            <video src={mediaUrl(value)} className="h-full w-full object-cover" muted />
          )
        ) : (
          <Icon className="h-6 w-6 text-stone-400" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => fileRef.current?.click()} loading={uploading} className="px-3 py-1.5">
            <Upload className="h-4 w-4" /> Subir
          </Button>
          <Button variant="secondary" onClick={() => setPickerOpen(true)} className="px-3 py-1.5">
            <Library className="h-4 w-4" /> Biblioteca
          </Button>
          {value && (
            <Button variant="ghost" onClick={() => onChange(null)} className="px-2 py-1.5" aria-label="Quitar">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <input className={inputClass} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} placeholder="o pega una URL" />
        <input
          ref={fileRef}
          type="file"
          hidden
          accept={kind === "image" ? "image/jpeg,image/png,image/webp,image/avif,image/gif" : "video/mp4,video/webm,video/quicktime"}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} kind={kind} onSelect={(a) => onChange(a.url)} />
    </div>
  );
}
