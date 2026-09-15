"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function SectionHeading({ eyebrow, title, subtitle, action }: { eyebrow?: string | null; title?: string | null; subtitle?: string | null; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow text-accent">{eyebrow}</p>}
        {title && <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{title}</h2>}
        {subtitle && <p className="mt-3 text-ink/65">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProductCarousel({ title, subtitle, eyebrow, products, viewAllHref }: {
  title?: string | null; subtitle?: string | null; eyebrow?: string | null; products: Product[]; viewAllHref?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          action={
            <div className="flex items-center gap-2">
              {viewAllHref && (
                <Link href={viewAllHref} className="eyebrow mr-3 inline-flex items-center gap-2 link-underline">
                  Ver todo <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
              <button type="button" onClick={() => scroll(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-ink/20 transition hover:bg-primary hover:text-cream" aria-label="Anterior">
                <ChevronLeft strokeWidth={1.3} className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => scroll(1)} className="grid h-11 w-11 place-items-center rounded-full border border-ink/20 transition hover:bg-primary hover:text-cream" aria-label="Siguiente">
                <ChevronRight strokeWidth={1.3} className="h-5 w-5" />
              </button>
            </div>
          }
        />
      </div>
      <div
        ref={track}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-6 px-6 pb-4 lg:gap-8 lg:scroll-px-10 lg:px-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))]"
      >
        {products.map((p) => (
          <div key={p.id} className="w-[72%] shrink-0 snap-start sm:w-[42%] md:w-[31%] lg:w-[calc((min(100vw,1400px)-5rem-6rem)/4)]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
