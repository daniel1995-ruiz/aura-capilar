"use client";

export default function StoreError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-display text-4xl">Algo no salió bien</p>
      <p className="text-ink/60">No pudimos cargar la información de la tienda. Verifica que la API esté en ejecución e inténtalo de nuevo.</p>
      <button onClick={reset} className="btn btn-primary">
        Reintentar
      </button>
    </div>
  );
}
