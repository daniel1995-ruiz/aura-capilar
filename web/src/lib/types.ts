export type Settings = {
  storeName: string;
  tagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  distributorNote: string | null;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  currency: string;
  locale: string;
  announcementText: string | null;
  whatsappNumber: string | null;
  whatsappMessage: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  featuredProductId: number | null;
  featuredEyebrow: string | null;
  favoritesTitle: string | null;
  favoritesSubtitle: string | null;
  categoriesTitle: string | null;
  categoriesSubtitle: string | null;
  shippingFlat: number;
  checkoutNote: string | null;
  paymentsEnabled: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  footerText: string | null;
};

export type MenuItem = { id: number; label: string; href: string; position: number; active: boolean };

export type HeroSlide = {
  id: number;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  mediaType: "image" | "video" | "youtube";
  imageUrl: string | null;
  mobileImageUrl: string | null;
  videoUrl: string | null;
  youtubeUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  secondaryButtonText: string | null;
  secondaryButtonLink: string | null;
  textAlign: "left" | "center" | "right";
  overlay: number;
  position: number;
  active: boolean;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  position: number;
  active: boolean;
  productCount?: number;
};

export type ProductImage = { id?: number; url: string; alt: string | null };
export type ProductVideo = { id?: number; kind: "youtube" | "file"; url: string; title: string | null };

export type Product = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  sku: string | null;
  size: string | null;
  shortDescription: string | null;
  description: string | null;
  benefits: string[];
  howToUse: string | null;
  ingredients: string | null;
  tags: string[];
  price: number;
  compareAtPrice: number | null;
  stock: number;
  rating: number | null;
  reviewCount: number;
  active: boolean;
  isFavorite: boolean;
  position: number;
  categoryId: number | null;
  category: Pick<Category, "id" | "name" | "slug"> | null;
  images: ProductImage[];
  videos: ProductVideo[];
};

export type ProductDetail = Product & { relatedProducts: Product[] };

export type ContentPage = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  heroImageUrl: string | null;
  body: string;
  position: number;
  active: boolean;
};

export type HomeData = {
  settings: Settings;
  menu: MenuItem[];
  heroSlides: HeroSlide[];
  featuredProduct: Product | null;
  favorites: Product[];
  categories: Category[];
};

export type MediaAsset = {
  id: number;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  kind: "image" | "video";
  createdAt: string;
};

export type OrderItem = { id: number; productId: number | null; name: string; price: number; quantity: number; imageUrl: string | null };

export type Order = {
  id: number;
  code: string;
  status: string;
  channel: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
};
