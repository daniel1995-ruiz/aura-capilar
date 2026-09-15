import type { Metadata } from "next";
import { storeApi } from "@/lib/api";
import { CategoryGrid } from "@/components/store/CategoryGrid";

export const metadata: Metadata = { title: "Categorías" };

export default async function CategoriesPage() {
  const [{ settings }, categories] = await Promise.all([storeApi.settings(), storeApi.categories()]);
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10 lg:py-16">
      <p className="eyebrow text-accent">Categorías</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl">{settings.categoriesTitle || "Categorías"}</h1>
      {settings.categoriesSubtitle && <p className="mt-3 max-w-xl text-ink/65">{settings.categoriesSubtitle}</p>}
      <div className="mt-10">
        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
}
