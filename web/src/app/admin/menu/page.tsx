"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function MenuAdminPage() {
  return (
    <CrudPage
      title="Menú de navegación"
      description="Enlaces del header y del footer."
      endpoint="/menu"
      itemName="enlace"
      defaults={{ label: "", href: "/", active: true }}
      fields={[
        { name: "label", label: "Texto", type: "text" },
        { name: "href", label: "Enlace", type: "text", hint: "Ej: /tienda, /rutinas, /tienda?categoria=kits o una URL externa." },
        { name: "active", label: "Visible", type: "bool" },
      ]}
      renderItem={(m) => (
        <div>
          <p className="font-medium">{m.label}</p>
          <p className="text-xs text-stone-500">{m.href}</p>
        </div>
      )}
    />
  );
}
