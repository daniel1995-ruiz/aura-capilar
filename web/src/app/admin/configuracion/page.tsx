"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import type { Settings } from "@/lib/types";
import { FormFields, type FieldDef } from "@/components/admin/FormFields";
import { Button, Card, PageHeader, Spinner, toast } from "@/components/admin/ui";

const sections: { title: string; description?: string; fields: FieldDef[] }[] = [
  {
    title: "Identidad de la marca",
    description: "Cambia el nombre, logo y textos sin reconstruir la tienda.",
    fields: [
      { name: "storeName", label: "Nombre de la tienda" },
      { name: "tagline", label: "Frase de marca" },
      { name: "distributorNote", label: "Sello de distribuidora", placeholder: "Distribuidora autorizada Milagros", wide: true },
      { name: "logoUrl", label: "Logo", type: "image", hint: "PNG o WEBP con fondo transparente. Si no hay logo, se muestra el nombre." },
      { name: "faviconUrl", label: "Ícono del navegador (favicon)", type: "image" },
      { name: "footerText", label: "Texto del footer", type: "textarea", rows: 2 },
    ],
  },
  {
    title: "Colores",
    description: "Se aplican a toda la tienda al guardar.",
    fields: [
      { name: "primaryColor", label: "Principal (botones, footer)", type: "color" },
      { name: "accentColor", label: "Acento (detalles, etiquetas)", type: "color" },
      { name: "backgroundColor", label: "Fondo", type: "color" },
      { name: "surfaceColor", label: "Superficies (tarjetas, fondos suaves)", type: "color" },
      { name: "textColor", label: "Texto", type: "color" },
    ],
  },
  {
    title: "WhatsApp y contacto",
    fields: [
      { name: "whatsappNumber", label: "Número de WhatsApp", hint: "Con código de país, sin espacios. Ej: 573001234567" },
      { name: "whatsappMessage", label: "Mensaje inicial de WhatsApp" },
      { name: "phone", label: "Teléfono visible" },
      { name: "email", label: "Correo" },
      { name: "address", label: "Dirección / ciudad", wide: true },
    ],
  },
  {
    title: "Redes sociales",
    description: "Déjalas vacías para ocultarlas.",
    fields: [
      { name: "instagramUrl", label: "Instagram", type: "url", placeholder: "https://instagram.com/tu-cuenta" },
      { name: "facebookUrl", label: "Facebook", type: "url" },
      { name: "tiktokUrl", label: "TikTok", type: "url" },
      { name: "youtubeUrl", label: "YouTube", type: "url" },
    ],
  },
  {
    title: "Tienda y checkout",
    fields: [
      { name: "currency", label: "Moneda (ISO)", placeholder: "COP" },
      { name: "locale", label: "Formato regional", placeholder: "es-CO" },
      { name: "shippingFlat", label: "Costo de envío fijo", type: "number", hint: "0 = por confirmar." },
      { name: "checkoutNote", label: "Nota del checkout", type: "textarea", rows: 2 },
      { name: "paymentsEnabled", label: "Pagos en línea activos", type: "bool", hint: "Se habilitará al conectar la pasarela de pagos (fase 2)." },
    ],
  },
  {
    title: "SEO",
    fields: [
      { name: "metaTitle", label: "Título para Google", wide: true },
      { name: "metaDescription", label: "Descripción para Google", type: "textarea", rows: 2 },
    ],
  },
];

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch<Settings>("/settings").then(setSettings).catch((e) => toast.error(e.message));
  }, []);

  if (!settings) return <Spinner />;

  const save = async () => {
    setSaving(true);
    try {
      setSettings(await adminFetch<Settings>("/settings", { method: "PUT", json: settings }));
      toast.ok("Configuración guardada");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Marca y redes" description="Nombre, logo, colores, contacto y redes sociales." actions={<Button onClick={save} loading={saving}>Guardar cambios</Button>} />
      <div className="space-y-6">
        {sections.map((s) => (
          <Card key={s.title} title={s.title} description={s.description}>
            <FormFields fields={s.fields} values={settings} onChange={(v) => setSettings(v as Settings)} />
          </Card>
        ))}
        <div className="flex justify-end">
          <Button onClick={save} loading={saving}>Guardar cambios</Button>
        </div>
      </div>
    </>
  );
}
