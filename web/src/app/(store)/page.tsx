import { storeApi } from "@/lib/api";
import { CategoryGrid } from "@/components/store/CategoryGrid";
import { FeaturedProduct } from "@/components/store/FeaturedProduct";
import { Hero } from "@/components/store/Hero";
import { ProductCarousel, SectionHeading } from "@/components/store/ProductCarousel";

export default async function HomePage() {
  const { settings, heroSlides, featuredProduct, favorites, categories } = await storeApi.home();
  const carouselProducts = favorites.filter((p) => p.id !== featuredProduct?.id);

  return (
    <>
      {heroSlides.length > 0 && <Hero slides={heroSlides} />}

      {featuredProduct && <FeaturedProduct product={featuredProduct} />}

      {carouselProducts.length > 0 && (
        <div className="bg-sand/45">
          <ProductCarousel
            eyebrow="Favoritos"
            title={settings.favoritesTitle}
            subtitle={settings.favoritesSubtitle}
            products={carouselProducts}
            viewAllHref="/tienda"
          />
        </div>
      )}

      {categories.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
          <SectionHeading eyebrow="Categorías" title={settings.categoriesTitle} subtitle={settings.categoriesSubtitle} />
          <div className="mt-10">
            <CategoryGrid categories={categories} />
          </div>
        </section>
      )}
    </>
  );
}
