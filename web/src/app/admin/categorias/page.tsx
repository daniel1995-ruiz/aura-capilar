"use client";

import { mediaUrl } from "@/lib/api";
import { CrudPage } from "@/components/admin/CrudPage";

export default function CategoriesAdminPage() {
  return (
    <CrudPage
      title="Categorías"
      description="Organiza los productos. El orden aquí define cómo aparecen en el Home y en la tienda."
      endpoint="/categories"
      itemName="categoría"
      defaults={{ name: "", slug: "", active: true }}
      fields={[
        { name: "name", label: "Nombre", type: "text" },
        { name: "slug", label: "URL (slug)", type: "text", hint: "Se genera automáticamente si lo dejas vacío." },
        { name: "description", label: "Descripción corta", type: "textarea", rows: 2 },
        { name: "imageUrl", label: "Imagen", type: "image" },
        { name: "active", label: "Visible", type: "bool" },
      ]}
      renderItem={(c) => (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaUrl(c.imageUrl)} alt="" className="h-12 w-12 rounded-md bg-stone-100 object-cover" />
          <div>
            <p className="font-medium">{c.name}</p>
            <p className="text-xs text-stone-500">/{c.slug}</p>
          </div>
        </div>
      )}
    />
  );
}
