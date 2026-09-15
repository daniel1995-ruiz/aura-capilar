"use client";

import { mediaUrl } from "@/lib/api";
import { CrudPage } from "@/components/admin/CrudPage";
import type { FieldDef } from "@/components/admin/FormFields";

const fields: FieldDef[] = [
  { name: "eyebrow", label: "Texto pequeño superior", placeholder: "Distribuidora autorizada Milagros", wide: true },
  { name: "title", label: "Título", type: "textarea", rows: 2, placeholder: "Tu cabello también merece un ritual." },
  { name: "subtitle", label: "Subtítulo", type: "textarea", rows: 2 },
  {
    name: "mediaType", label: "Tipo de fondo", type: "select",
    options: [{ value: "image", label: "Imagen" }, { value: "video", label: "Video propio" }, { value: "youtube", label: "Video de YouTube" }],
  },
  {
    name: "textAlign", label: "Posición del texto", type: "select",
    options: [{ value: "left", label: "Izquierda" }, { value: "center", label: "Centro" }, { value: "right", label: "Derecha" }],
  },
  { name: "imageUrl", label: "Imagen (desktop)", type: "image", hint: "Recomendado 1920×1080 px. Si usas video, se muestra mientras carga." },
  { name: "mobileImageUrl", label: "Imagen para celular (opcional)", type: "image", hint: "Recomendado 1080×1350 px.", showIf: (v) => v.mediaType === "image" },
  { name: "videoUrl", label: "Video", type: "video", hint: "MP4 o WEBM, idealmente menos de 15 MB y sin audio.", showIf: (v) => v.mediaType === "video" },
  { name: "youtubeUrl", label: "Enlace de YouTube", type: "url", placeholder: "https://www.youtube.com/watch?v=…", wide: true, showIf: (v) => v.mediaType === "youtube" },
  { name: "buttonText", label: "Texto del botón", placeholder: "Descubrir productos" },
  { name: "buttonLink", label: "Enlace del botón", placeholder: "/tienda" },
  { name: "secondaryButtonText", label: "Botón secundario (opcional)" },
  { name: "secondaryButtonLink", label: "Enlace botón secundario" },
  { name: "overlay", label: "Oscurecer fondo (%)", type: "number", hint: "0 = texto oscuro sobre fondo claro. 20–50 = texto blanco sobre fotos oscuras." },
  { name: "active", label: "Visible en la tienda", type: "bool" },
];

export default function HeroAdminPage() {
  return (
    <CrudPage
      title="Hero / Banners principales"
      description="Si hay más de un slide activo, se muestran como carrusel automático en el orden de esta lista."
      endpoint="/hero"
      itemName="slide"
      fields={fields}
      defaults={{ title: "", mediaType: "image", textAlign: "left", overlay: 0, active: true, buttonText: "Descubrir productos", buttonLink: "/tienda" }}
      renderItem={(slide) => (
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaUrl(slide.imageUrl)} alt="" className="h-16 w-28 shrink-0 rounded-md bg-stone-100 object-cover" />
          <div className="min-w-0">
            <p className="truncate font-medium">{slide.title}</p>
            <p className="truncate text-xs text-stone-500">
              {{ image: "Imagen", video: "Video", youtube: "YouTube" }[slide.mediaType as string]} · {slide.buttonText || "sin botón"}
            </p>
          </div>
        </div>
      )}
    />
  );
}
