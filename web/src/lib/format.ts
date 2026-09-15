export function formatPrice(amount: number, currency = "COP", locale = "es-CO") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `$${amount.toLocaleString("es-CO")}`;
  }
}

export function discountPercent(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round((1 - price / compareAt) * 100);
}

export function youtubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return match?.[1] ?? (/^[\w-]{11}$/.test(url) ? url : null);
}

export function whatsappLink(number?: string | null, message?: string | null) {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

const HEX = /^#[0-9a-f]{6}$/i;
export const safeColor = (value: string | undefined, fallback: string) => (value && HEX.test(value) ? value : fallback);
