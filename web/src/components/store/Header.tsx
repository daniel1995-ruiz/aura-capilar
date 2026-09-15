"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart, useFavorites, useHydrated } from "@/lib/stores";
import { Logo } from "./Logo";
import { SearchOverlay } from "./SearchOverlay";
import { SocialIcons } from "./SocialIcons";
import { useStore } from "./StoreProvider";

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0];
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-medium leading-none text-white">
      {count}
    </span>
  );
}

export function Header() {
  const { settings, menu } = useStore();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = useCart((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const favCount = useFavorites((s) => s.items.length);
  const openCart = useCart((s) => s.open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const iconBtn = "relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-ink/5";

  return (
    <>
      {settings.announcementText && (
        <div className="bg-primary px-4 py-2 text-center text-[0.68rem] uppercase tracking-[0.22em] text-cream">
          {settings.announcementText}
        </div>
      )}

      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled ? "border-b border-ink/10 bg-cream/90 shadow-[0_8px_30px_-20px_rgba(0,0,0,.25)] backdrop-blur-md" : "bg-cream"
        }`}
      >
        <div
          className={`mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 transition-[height] duration-500 sm:px-6 xl:grid-cols-[auto_1fr_auto] lg:px-10 ${
            scrolled ? "h-16" : "h-[4.5rem] xl:h-20"
          }`}
        >
          {/* Izquierda: hamburguesa (móvil/tablet) / logo (desktop) */}
          <div className="flex items-center">
            <button type="button" className={`${iconBtn} -ml-2 xl:hidden`} onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
              <Menu strokeWidth={1.4} className="h-6 w-6" />
            </button>
            <Logo settings={settings} className="hidden xl:inline-flex" />
          </div>

          {/* Centro: logo (móvil/tablet) / navegación (desktop) */}
          <div className="flex justify-center">
            <Logo settings={settings} className="inline-flex xl:hidden" />
            <nav className="hidden xl:block" aria-label="Principal">
              <ul className="flex items-center gap-7 2xl:gap-10">
                {menu.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className="link-underline pb-1 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-ink/80 transition hover:text-ink aria-[current=page]:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Derecha: iconos + comprar */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <button type="button" className={iconBtn} onClick={() => setSearchOpen(true)} aria-label="Buscar">
              <Search strokeWidth={1.4} className="h-5 w-5" />
            </button>
            <Link href="/favoritos" className={`${iconBtn} hidden sm:grid`} aria-label="Favoritos">
              <Heart strokeWidth={1.4} className="h-5 w-5" />
              <Badge count={hydrated ? favCount : 0} />
            </Link>
            <button type="button" className={iconBtn} onClick={openCart} aria-label="Carrito">
              <ShoppingBag strokeWidth={1.4} className="h-5 w-5" />
              <Badge count={hydrated ? cartCount : 0} />
            </button>
            <Link href="/tienda" className="btn btn-primary ml-3 hidden min-h-[2.6rem] px-6 lg:inline-flex">
              Comprar
            </Link>
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      <div
        className={`fixed inset-0 z-50 xl:hidden ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity duration-500 ${menuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMenuOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-cream px-7 pb-8 pt-5 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <Logo settings={settings} />
            <button type="button" className={`${iconBtn} -mr-2`} onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
              <X strokeWidth={1.4} className="h-6 w-6" />
            </button>
          </div>

          <nav className="mt-12 flex-1" aria-label="Menú móvil">
            <ul className="space-y-1">
              {menu.map((item, i) => (
                <li
                  key={item.id}
                  className={`transition-all duration-500 ${menuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                  style={{ transitionDelay: menuOpen ? `${120 + i * 50}ms` : "0ms" }}
                >
                  <Link
                    href={item.href}
                    className={`block py-2 font-display text-[2.1rem] leading-tight ${isActive(pathname, item.href) ? "italic text-accent" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className={`transition-all duration-500 ${menuOpen ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "450ms" }}>
                <Link href="/favoritos" className="mt-4 flex items-center gap-3 py-2 text-sm uppercase tracking-[0.2em] text-ink/70">
                  <Heart strokeWidth={1.4} className="h-4 w-4" /> Mis favoritos {hydrated && favCount > 0 && `(${favCount})`}
                </Link>
              </li>
            </ul>
          </nav>

          <Link href="/tienda" className="btn btn-primary w-full">
            Comprar
          </Link>
          <div className="mt-6 flex flex-col items-center gap-3 text-ink/80">
            {settings.distributorNote && <p className="eyebrow text-ink/50">{settings.distributorNote}</p>}
            <SocialIcons settings={settings} />
          </div>
        </aside>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
