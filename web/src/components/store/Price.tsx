"use client";

import { discountPercent } from "@/lib/format";
import { useStore } from "./StoreProvider";

export function Price({ price, compareAtPrice, size = "md" }: { price: number; compareAtPrice?: number | null; size?: "md" | "lg" }) {
  const { price: fmt } = useStore();
  const discount = discountPercent(price, compareAtPrice);
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={size === "lg" ? "text-2xl font-medium tracking-wide" : "text-[0.95rem] font-medium"}>{fmt(price)}</span>
      {discount > 0 && (
        <>
          <span className={`text-ink/45 line-through ${size === "lg" ? "text-base" : "text-sm"}`}>{fmt(compareAtPrice!)}</span>
          {size === "lg" && (
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium tracking-wider text-accent">-{discount}%</span>
          )}
        </>
      )}
    </div>
  );
}
