import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import type { Category } from "@/lib/types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
      {categories.map((c) => (
        <Link key={c.id} href={`/tienda?categoria=${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-md bg-sand sm:aspect-[5/4]">
          {c.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(c.imageUrl)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-cream sm:p-6">
            <div>
              <h3 className="font-display text-2xl leading-tight sm:text-3xl">{c.name}</h3>
              {c.description && <p className="mt-1 hidden text-sm text-cream/75 sm:block">{c.description}</p>}
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cream/40 transition group-hover:bg-cream group-hover:text-ink">
              <ArrowUpRight strokeWidth={1.4} className="h-4 w-4" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
