"use client";

import { createContext, useContext } from "react";
import { formatPrice } from "@/lib/format";
import type { MenuItem, Settings } from "@/lib/types";

type StoreContextValue = { settings: Settings; menu: MenuItem[]; price: (amount: number) => string };

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ settings, menu, children }: { settings: Settings; menu: MenuItem[]; children: React.ReactNode }) {
  const price = (amount: number) => formatPrice(amount, settings.currency, settings.locale);
  return <StoreContext.Provider value={{ settings, menu, price }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de StoreProvider");
  return ctx;
}
