"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import { formatPrice, whatsappLink } from "@/lib/format";
import type { Order } from "@/lib/types";
import { Card, Empty, inputClass, PageHeader, Spinner, toast } from "@/components/admin/ui";

const statuses = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    adminFetch<Order[]>("/orders").then(setOrders).catch((e) => toast.error(e.message));
  }, []);

  const updateStatus = async (order: Order, status: string) => {
    setOrders((list) => list?.map((o) => (o.id === order.id ? { ...o, status } : o)) ?? null);
    try {
      await adminFetch(`/orders/${order.id}`, { method: "PATCH", json: { status } });
      toast.ok("Estado actualizado");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <PageHeader title="Pedidos" description="Pedidos creados desde el checkout. El cobro en línea se conectará en la siguiente fase." />
      {!orders ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <Card><Empty>Todavía no hay pedidos.</Empty></Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const wa = whatsappLink(o.phone, `Hola ${o.customerName}, te escribimos por tu pedido ${o.code}.`);
            return (
              <Card key={o.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{o.code} · {o.customerName}</p>
                    <p className="text-sm text-stone-500">
                      {new Date(o.createdAt).toLocaleString("es-CO")} · {o.phone}{o.email ? ` · ${o.email}` : ""}
                    </p>
                    {(o.address || o.city) && <p className="text-sm text-stone-500">{[o.address, o.city].filter(Boolean).join(", ")}</p>}
                    {o.notes && <p className="mt-1 text-sm italic text-stone-500">“{o.notes}”</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-stone-300 px-3 py-2 text-sm hover:bg-stone-50">WhatsApp</a>}
                    <select className={`${inputClass} w-36`} value={o.status} onChange={(e) => updateStatus(o, e.target.value)}>
                      {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <ul className="mt-4 divide-y divide-stone-100 border-t border-stone-100 text-sm">
                  {o.items.map((i) => (
                    <li key={i.id} className="flex justify-between py-2">
                      <span>{i.quantity} × {i.name}</span>
                      <span>{formatPrice(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-right font-medium">Total {formatPrice(o.total)}</p>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
