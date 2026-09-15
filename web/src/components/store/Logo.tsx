import Link from "next/link";
import { mediaUrl } from "@/lib/api";
import type { Settings } from "@/lib/types";

export function Logo({ settings, className = "inline-flex" }: { settings: Pick<Settings, "storeName" | "logoUrl">; className?: string }) {
  return (
    <Link href="/" className={`items-center ${className}`} aria-label={`${settings.storeName} — inicio`}>
      {settings.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl(settings.logoUrl)} alt={settings.storeName} className="h-9 w-auto lg:h-11" />
      ) : (
        <span className="font-display text-[1.35rem] font-medium uppercase leading-none tracking-[0.24em] whitespace-nowrap lg:text-[1.6rem]">
          {settings.storeName}
        </span>
      )}
    </Link>
  );
}
