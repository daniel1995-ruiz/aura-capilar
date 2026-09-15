"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";
import { useStore } from "./StoreProvider";

export function Footer() {
  const { settings, menu } = useStore();
  return (
    <footer className="mt-24 bg-primary text-cream">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div className="max-w-sm space-y-5">
          <Logo settings={settings} className="inline-flex" />
          {settings.tagline && <p className="font-display text-2xl italic text-cream/85">{settings.tagline}</p>}
          {settings.footerText && <p className="text-sm leading-relaxed text-cream/60">{settings.footerText}</p>}
          <SocialIcons settings={settings} className="text-cream" />
        </div>

        <div>
          <p className="eyebrow mb-5 text-cream/50">Explora</p>
          <ul className="space-y-3">
            {menu.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="link-underline text-sm text-cream/80 hover:text-cream">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/favoritos" className="link-underline text-sm text-cream/80 hover:text-cream">
                Favoritos
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-5 text-cream/50">Contacto</p>
          <ul className="space-y-3 text-sm text-cream/80">
            {settings.phone && <li>{settings.phone}</li>}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="link-underline">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address && <li>{settings.address}</li>}
          </ul>
          {settings.distributorNote && (
            <p className="mt-8 inline-block rounded-full border border-cream/25 px-4 py-2 text-[0.68rem] uppercase tracking-[0.2em] text-cream/75">
              {settings.distributorNote}
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-[1400px] px-6 py-5 text-xs text-cream/45 lg:px-10">
          © {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
