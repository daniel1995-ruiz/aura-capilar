"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { whatsappLink } from "@/lib/format";
import { useCart, useHydrated } from "@/lib/stores";
import { WhatsAppIcon } from "./SocialIcons";
import { useStore } from "./StoreProvider";

export function QuantityControl({ value, onChange, small = false }: { value: number; onChange: (v: number) => void; small?: boolean }) {
  const size = small ? "h-8 w-8" : "h-11 w-11";
  return (
    <div className="inline-flex items-center rounded-full border border-ink/20">
      <button type="button" className={`${size} grid place-items-center rounded-full hover:bg-ink/5`} onClick={() => onChange(value - 1)} aria-label="Disminuir cantidad">
        <Minus strokeWidth={1.4} className="h-3.5 w-3.5" />
      </button>
      <span className={`${small ? "w-6 text-sm" : "w-8"} text-center tabular-nums`}>{value}</span>
      <button type="button" className={`${size} grid place-items-center rounded-full hover:bg-ink/5`} onClick={() => onChange(value + 1)} aria-label="Aumentar cantidad">
        <Plus strokeWidth={1.4} className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function buildWhatsappOrder(items: { name: string; quantity: number; price: number }[], fmt: (n: number) => string, extra = "") {
  const lines = items.map((i) => `• ${i.quantity} x ${i.name} — ${fmt(i.price * i.quantity)}`);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return `Hola, quiero hacer este pedido:\n\n${lines.join("\n")}\n\nTotal: ${fmt(total)}${extra ? `\n\n${extra}` : ""}`;
}

export function CartDrawer() {
  const { settings, price } = useStore();
  const hydrated = useHydrated();
  const { items, isOpen, close, setQuantity, remove } = useCart();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const wa = whatsappLink(settings.whatsappNumber, buildWhatsappOrder(items, price));

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  const open = hydrated && isOpen;

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} onClick={close} />
      <aside
        role="dialog"
        aria-label="Carrito de compras"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h2 className="font-display text-2xl">Tu carrito</h2>
          <button type="button" onClick={close} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5" aria-label="Cerrar carrito">
            <X strokeWidth={1.4} className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-sand">
              <ShoppingBag strokeWidth={1.2} className="h-8 w-8 text-accent" />
            </div>
            <p className="font-display text-2xl">Tu carrito está vacío</p>
            <p className="text-sm text-ink/60">Descubre los productos que tu cabello está esperando.</p>
            <Link href="/tienda" onClick={close} className="btn btn-primary">
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-5">
                  <Link href={`/producto/${item.slug}`} onClick={close} className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(item.image)} alt={item.name} className="h-28 w-22 rounded-sm bg-sand object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/producto/${item.slug}`} onClick={close} className="font-display text-lg leading-snug">
                        {item.name}
                      </Link>
                      <button type="button" onClick={() => remove(item.productId)} className="text-ink/40 hover:text-ink" aria-label={`Quitar ${item.name}`}>
                        <X strokeWidth={1.4} className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-ink/60">{price(item.price)}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QuantityControl small value={item.quantity} onChange={(v) => setQuantity(item.productId, v)} />
                      <span className="font-medium">{price(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-ink/10 bg-sand/50 px-6 py-6">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow text-ink/60">Subtotal</span>
                <span className="text-xl font-medium">{price(subtotal)}</span>
              </div>
              <p className="text-xs text-ink/50">Envío calculado al finalizar la compra.</p>
              <Link href="/carrito" onClick={close} className="btn btn-primary w-full">
                Finalizar compra
              </Link>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">
                  <WhatsAppIcon className="h-4 w-4" /> Pedir por WhatsApp
                </a>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
