"use client";

import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "./SocialIcons";
import { useStore } from "./StoreProvider";

export function WhatsAppFloat() {
  const { settings } = useStore();
  const href = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,.6)] transition hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
