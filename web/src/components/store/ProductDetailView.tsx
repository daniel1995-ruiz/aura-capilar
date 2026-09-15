"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown, Truck } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { whatsappLink, youtubeId } from "@/lib/format";
import type { ProductDetail } from "@/lib/types";
import { QuantityControl } from "./CartDrawer";
import { Price } from "./Price";
import { AddToCartButton, FavoriteButton } from "./ProductActions";
import { Rating } from "./Rating";
import { WhatsAppIcon } from "./SocialIcons";
import { useStore } from "./StoreProvider";

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink/10">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-5 text-left" aria-expanded={open}>
        <span className="eyebrow">{title}</span>
        <ChevronDown strokeWidth={1.3} className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-500 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="whitespace-pre-line pb-6 leading-relaxed text-ink/70">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailView({ product }: { product: ProductDetail }) {
  const { settings } = useStore();
  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const image = product.images[active] ?? product.images[0];
  const wa = whatsappLink(settings.whatsappNumber, `Hola, quiero información sobre ${product.name}.`);

  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-8 lg:px-10 lg:pt-12">
      <nav className="mb-8 text-xs uppercase tracking-[0.16em] text-ink/50" aria-label="Migas de pan">
        <Link href="/" className="hover:text-ink">Inicio</Link> <span className="mx-2">/</span>
        <Link href="/tienda" className="hover:text-ink">Tienda</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/tienda?categoria=${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* Galería */}
        <div className="flex flex-col-reverse gap-4 md:flex-row lg:sticky lg:top-24 lg:self-start">
          {product.images.length > 1 && (
            <div className="no-scrollbar flex gap-3 overflow-x-auto md:flex-col">
              {product.images.map((img, i) => (
                <button
                  key={img.url + i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-24 w-20 shrink-0 overflow-hidden rounded-sm border transition ${i === active ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"}`}
                  aria-label={`Ver imagen ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(img.url)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-md bg-sand">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={image.url} src={mediaUrl(image.url)} alt={image.alt ?? product.name} className="animate-rise h-full w-full object-cover" />
            )}
          </div>
        </div>

        {/* Información */}
        <div>
          <p className="eyebrow text-accent">{product.brand}{product.size ? ` · ${product.size}` : ""}</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] sm:text-6xl">{product.name}</h1>
          <div className="mt-4"><Rating value={product.rating} count={product.reviewCount} /></div>
          <div className="mt-6"><Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" /></div>
          {product.shortDescription && <p className="mt-6 text-lg leading-relaxed text-ink/70">{product.shortDescription}</p>}

          {product.benefits.length > 0 && (
            <ul className="mt-8 space-y-3">
              {product.benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                    <Check strokeWidth={2} className="h-3 w-3" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <QuantityControl value={quantity} onChange={(v) => setQuantity(Math.max(1, Math.min(99, v)))} />
            <AddToCartButton product={product} quantity={quantity} className="btn btn-primary flex-1" />
            <FavoriteButton product={product} className="h-[3.1rem] w-[3.1rem] rounded-full border border-ink/20 hover:bg-ink/5" />
          </div>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-3 w-full">
              <WhatsAppIcon className="h-4 w-4" /> Pregúntanos por WhatsApp
            </a>
          )}
          <p className="mt-5 flex items-center gap-2 text-sm text-ink/60">
            <Truck strokeWidth={1.3} className="h-4 w-4" />
            {product.stock > 0 ? (product.stock <= 5 ? `¡Últimas ${product.stock} unidades!` : "Disponible para envío") : "Agotado temporalmente"}
          </p>

          <div className="mt-10 border-t border-ink/10">
            {product.description && <Accordion title="Descripción" defaultOpen>{product.description}</Accordion>}
            {product.howToUse && <Accordion title="Modo de uso">{product.howToUse}</Accordion>}
            {product.ingredients && <Accordion title="Ingredientes">{product.ingredients}</Accordion>}
          </div>
        </div>
      </div>

      {product.videos.length > 0 && (
        <section className="mt-24">
          <p className="eyebrow text-accent">Videos</p>
          <h2 className="mt-3 font-display text-4xl">Míralo en acción</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {product.videos.map((v, i) => {
              const id = v.kind === "youtube" ? youtubeId(v.url) : null;
              return (
                <figure key={v.url + i}>
                  <div className="aspect-video overflow-hidden rounded-md bg-primary">
                    {id ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
                        title={v.title ?? product.name}
                        loading="lazy"
                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    ) : (
                      <video src={mediaUrl(v.url)} controls playsInline preload="metadata" className="h-full w-full object-cover" />
                    )}
                  </div>
                  {v.title && <figcaption className="mt-3 font-display text-xl">{v.title}</figcaption>}
                </figure>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
