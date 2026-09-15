import { Star } from "lucide-react";

export function Rating({ value, count }: { value: number | null; count?: number }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm" aria-label={`Calificación ${value} de 5`}>
      <div className="flex text-accent">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} strokeWidth={1.2} className={`h-4 w-4 ${i <= Math.round(value) ? "fill-current" : ""}`} />
        ))}
      </div>
      <span className="text-ink/60">
        {value.toFixed(1)}
        {count ? ` · ${count} reseñas` : ""}
      </span>
    </div>
  );
}
