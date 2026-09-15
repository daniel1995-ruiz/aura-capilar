import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mediaUrl, storeApi } from "@/lib/api";
import { ProductCarousel } from "@/components/store/ProductCarousel";
import { ProductDetailView } from "@/components/store/ProductDetailView";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await storeApi.product((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription ?? undefined,
    openGraph: { images: product.images[0] ? [mediaUrl(product.images[0].url)] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await storeApi.product((await params).slug);
  if (!product) notFound();

  return (
    <>
      <ProductDetailView product={product} />
      {product.relatedProducts.length > 0 && (
        <div className="mt-12">
          <ProductCarousel eyebrow="Completa tu ritual" title="Productos relacionados" products={product.relatedProducts} />
        </div>
      )}
    </>
  );
}
