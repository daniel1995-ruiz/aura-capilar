import type { Metadata } from "next";
import { storeApi, mediaUrl } from "@/lib/api";
import { safeColor } from "@/lib/format";
import { CartDrawer } from "@/components/store/CartDrawer";
import { Footer } from "@/components/store/Footer";
import { Header } from "@/components/store/Header";
import { StoreProvider } from "@/components/store/StoreProvider";
import { WhatsAppFloat } from "@/components/store/WhatsAppFloat";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await storeApi.settings();
  return {
    title: { default: settings.metaTitle || settings.storeName, template: `%s · ${settings.storeName}` },
    description: settings.metaDescription ?? undefined,
    icons: settings.faviconUrl ? [{ url: mediaUrl(settings.faviconUrl) }] : undefined,
  };
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const { settings, menu } = await storeApi.settings();

  // Los colores de marca vienen de la configuración: cambiar la identidad no requiere tocar código.
  const themeCss = `:root{--brand-primary:${safeColor(settings.primaryColor, "#2b1e24")};--brand-accent:${safeColor(settings.accentColor, "#b7795e")};--brand-bg:${safeColor(settings.backgroundColor, "#faf6f1")};--brand-surface:${safeColor(settings.surfaceColor, "#f1e6dc")};--brand-text:${safeColor(settings.textColor, "#2b1e24")};}`;

  return (
    <StoreProvider settings={settings} menu={menu}>
      <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </StoreProvider>
  );
}
