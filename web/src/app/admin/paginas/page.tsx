"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function PagesAdminPage() {
  return (
    <CrudPage
      title="Páginas de contenido"
      description="Rutinas, Consejos, Nosotros y cualquier página nueva. Se publican en tu-dominio.com/slug."
      endpoint="/pages"
      itemName="página"
      defaults={{ title: "", slug: "", body: "", active: true }}
      fields={[
        { name: "title", label: "Título", type: "text" },
        { name: "slug", label: "URL (slug)", type: "text", hint: "Ej: rutinas → /rutinas" },
        { name: "subtitle", label: "Subtítulo", type: "text", wide: true },
        { name: "heroImageUrl", label: "Imagen de cabecera (opcional)", type: "image" },
        { name: "body", label: "Contenido", type: "textarea", rows: 12, hint: "Separa párrafos con una línea en blanco. Empieza una línea con “## ” para crear un subtítulo." },
        { name: "active", label: "Publicada", type: "bool" },
      ]}
      renderItem={(p) => (
        <div>
          <p className="font-medium">{p.title}</p>
          <a href={`/${p.slug}`} target="_blank" className="text-xs text-stone-500 hover:underline">/{p.slug}</a>
        </div>
      )}
    />
  );
}
