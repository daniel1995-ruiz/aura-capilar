"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { Card, PageHeader, Spinner, toast } from "@/components/admin/ui";

type Stats = { products: number; activeProducts: number; favorites: number; categories: number; heroSlides: number; pendingOrders: number; media: number };

const shortcuts = [
  { href: "/admin/inicio", title: "Elegir producto principal del Home", text: "Selecciona el producto protagonista y los textos de las secciones." },
  { href: "/admin/hero", title: "Cambiar el Hero", text: "Imagen, video, título, subtítulo, botón y posición." },
  { href: "/admin/productos", title: "Ordenar productos", text: "Arrastra para decidir qué aparece primero y marca favoritos." },
  { href: "/admin/configuracion", title: "Marca, colores y redes", text: "Nombre, logo, colores, WhatsApp, Instagram, TikTok…" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    adminFetch<Stats>("/dashboard").then(setStats).catch((e) => toast.error(e.message));
  }, []);

  const tiles = stats && [
    { label: "Productos activos", value: `${stats.activeProducts} / ${stats.products}` },
    { label: "Favoritos", value: stats.favorites },
    { label: "Categorías", value: stats.categories },
    { label: "Slides del Hero", value: stats.heroSlides },
    { label: "Pedidos pendientes", value: stats.pendingOrders },
    { label: "Archivos en biblioteca", value: stats.media },
  ];

  return (
    <>
      <PageHeader title="Resumen" description="Todo el contenido de la tienda se administra desde aquí, sin tocar código." />
      {!tiles ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {tiles.map((t) => (
            <Card key={t.label}>
              <p className="text-sm text-stone-500">{t.label}</p>
              <p className="mt-1 text-3xl font-medium tabular-nums">{t.value}</p>
            </Card>
          ))}
        </div>
      )}
      <h2 className="mb-4 mt-10 text-lg font-medium">Accesos rápidos</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {shortcuts.map((s) => (
          <Link key={s.href} href={s.href} className="group rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-400">
            <p className="flex items-center justify-between font-medium">
              {s.title} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </p>
            <p className="mt-1 text-sm text-stone-500">{s.text}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
