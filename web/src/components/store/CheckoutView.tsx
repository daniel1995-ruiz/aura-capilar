"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Lock, X } from "lucide-react";
import { createOrder, mediaUrl } from "@/lib/api";
import { whatsappLink } from "@/lib/format";
import { useCart, useHydrated } from "@/lib/stores";
import type { Order } from "@/lib/types";
import { buildWhatsappOrder, QuantityControl } from "./CartDrawer";
import { WhatsAppIcon } from "./SocialIcons";
import { useStore } from "./StoreProvider";

const fields = [
  { name: "name", label: "Nombre completo", required: true, autoComplete: "name" },
  { name: "phone", label: "Celular / WhatsApp", required: true, autoComplete: "tel", type: "tel" },
  { name: "email", label: "Correo electrónico", autoComplete: "email", type: "email" },
  { name: "city", label: "Ciudad", autoComplete: "address-level2" },
  { name: "address", label: "Dirección de entrega", autoComplete: "street-address", wide: true },
  { name: "notes", label: "Notas del pedido (opcional)", wide: true },
] as const;

export function CheckoutView() {
  const { settings, price } = useStore();
  const hydrated = useHydrated();
  const { items, setQuantity, remove, clear } = useCart();
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = settings.shippingFlat;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createOrder({
        customer: form,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        channel: "web",
      });
      setOrder(created);
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) return <div className="min-h-[60vh]" />;

  if (order) {
    const message = buildWhatsappOrder(order.items, price, `Pedido ${order.code}\nNombre: ${order.customerName}${order.city ? `\nCiudad: ${order.city}` : ""}`);
    const wa = whatsappLink(settings.whatsappNumber, message);
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
        <CheckCircle2 strokeWidth={1} className="h-16 w-16 text-accent" />
        <p className="eyebrow mt-6 text-accent">Pedido {order.code}</p>
        <h1 className="mt-3 font-display text-5xl">¡Gracias, {order.customerName.split(" ")[0]}!</h1>
        <p className="mt-4 text-ink/65">Recibimos tu pedido por {price(order.total)}. {settings.checkoutNote}</p>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-8">
            <WhatsAppIcon className="h-4 w-4" /> Confirmar por WhatsApp
          </a>
        )}
        <Link href="/tienda" className="btn btn-outline mt-3">Seguir comprando</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
        <h1 className="font-display text-5xl">Tu carrito está vacío</h1>
        <p className="mt-3 text-ink/60">Agrega productos para continuar con tu compra.</p>
        <Link href="/tienda" className="btn btn-primary mt-8">Ir a la tienda</Link>
      </div>
    );
  }

  const input = "w-full rounded-md border border-ink/15 bg-white/60 px-4 py-3 outline-none transition focus:border-accent focus:bg-white";

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10 lg:py-16">
      <p className="eyebrow text-accent">Checkout</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl">Finalizar compra</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <form onSubmit={submit} className="space-y-8">
          <div>
            <h2 className="font-display text-2xl">Datos de entrega</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <label key={f.name} className={`block ${"wide" in f && f.wide ? "sm:col-span-2" : ""}`}>
                  <span className="mb-1.5 block text-sm text-ink/70">
                    {f.label} {"required" in f && f.required && <span className="text-accent">*</span>}
                  </span>
                  {f.name === "notes" ? (
                    <textarea rows={3} className={input} value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                  ) : (
                    <input
                      className={input}
                      type={"type" in f ? f.type : "text"}
                      required={"required" in f && f.required}
                      autoComplete={f.autoComplete}
                      value={form[f.name] ?? ""}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-dashed border-ink/20 bg-sand/40 p-5">
            <p className="flex items-center gap-2 font-medium"><Lock strokeWidth={1.4} className="h-4 w-4" /> Método de pago</p>
            <p className="mt-2 text-sm text-ink/65">
              {settings.paymentsEnabled
                ? "Serás redirigida a la pasarela de pago segura."
                : settings.checkoutNote || "La pasarela de pago en línea se activará próximamente. Confirmaremos tu pedido y el pago por WhatsApp."}
            </p>
          </div>

          {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={submitting} className="btn btn-primary w-full sm:w-auto">
            {submitting ? "Enviando pedido…" : `Confirmar pedido · ${price(subtotal + shipping)}`}
          </button>
        </form>

        <aside className="h-fit rounded-md bg-sand/50 p-6 lg:sticky lg:top-24 lg:p-8">
          <h2 className="font-display text-2xl">Resumen</h2>
          <ul className="mt-6 divide-y divide-ink/10">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 py-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(item.image)} alt="" className="h-20 w-16 rounded-sm bg-sand object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <Link href={`/producto/${item.slug}`} className="font-display text-lg leading-snug">{item.name}</Link>
                    <button type="button" onClick={() => remove(item.productId)} className="text-ink/40 hover:text-ink" aria-label={`Quitar ${item.name}`}>
                      <X strokeWidth={1.4} className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <QuantityControl small value={item.quantity} onChange={(v) => setQuantity(item.productId, v)} />
                    <span className="text-sm font-medium">{price(item.price * item.quantity)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd>{price(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/60">Envío</dt><dd>{shipping > 0 ? price(shipping) : "Por confirmar"}</dd></div>
            <div className="flex justify-between border-t border-ink/10 pt-3 text-lg"><dt>Total</dt><dd className="font-medium">{price(subtotal + shipping)}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
