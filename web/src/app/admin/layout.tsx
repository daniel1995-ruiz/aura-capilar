"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ExternalLink, FileText, Film, Home, LayoutDashboard, LogOut, Menu as MenuIcon, Package, Settings, ShoppingCart, Sparkles, Tags, X, ListOrdered,
} from "lucide-react";
import { session } from "@/lib/adminApi";
import { Toaster } from "@/components/admin/ui";

const nav = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/inicio", label: "Home", icon: Home },
  { href: "/admin/hero", label: "Hero / Banners", icon: Sparkles },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/medios", label: "Imágenes y videos", icon: Film },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/menu", label: "Menú", icon: ListOrdered },
  { href: "/admin/paginas", label: "Páginas", icon: FileText },
  { href: "/admin/configuracion", label: "Marca y redes", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!isLogin && !session.get()) router.replace("/admin/login");
    else setReady(true);
  }, [isLogin, router]);

  useEffect(() => setOpen(false), [pathname]);

  if (isLogin) {
    return (
      <div className="min-h-screen bg-stone-100 font-sans text-stone-900">
        {children}
        <Toaster />
      </div>
    );
  }
  if (!ready) return <div className="min-h-screen bg-stone-100" />;

  const sidebar = (
    <nav className="flex h-full flex-col">
      <div className="px-5 py-6">
        <p className="font-display text-2xl tracking-[0.15em]">PANEL</p>
        <p className="text-xs text-stone-400">Administración de la tienda</p>
      </div>
      <ul className="flex-1 space-y-0.5 px-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-white/10 text-white" : "text-stone-300 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-1 border-t border-white/10 p-3">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-stone-300 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-4 w-4" /> Ver tienda
        </a>
        <button
          onClick={() => {
            session.clear();
            router.replace("/admin/login");
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-stone-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 bg-stone-900 text-white lg:block">{sidebar}</aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(true)} className="rounded-md p-1.5 hover:bg-stone-100" aria-label="Abrir menú">
          <MenuIcon className="h-5 w-5" />
        </button>
        <p className="font-display text-xl tracking-[0.15em]">PANEL</p>
        <span className="w-8" />
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-stone-900 text-white">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-5 rounded-md p-1 text-stone-300" aria-label="Cerrar menú">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="px-4 py-8 sm:px-8 lg:ml-60 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}
