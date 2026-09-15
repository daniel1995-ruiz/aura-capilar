"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { ArrowDown, ArrowUp, GripVertical, Loader2, X } from "lucide-react";
import { useState } from "react";

// ---------- Toasts ----------
type Toast = { id: number; message: string; tone: "ok" | "error" };
export const useToasts = create<{ toasts: Toast[]; push: (message: string, tone?: Toast["tone"]) => void }>((set) => ({
  toasts: [],
  push: (message, tone = "ok") => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
}));
export const toast = {
  ok: (m: string) => useToasts.getState().push(m, "ok"),
  error: (m: string) => useToasts.getState().push(m, "error"),
};

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`animate-rise rounded-lg px-4 py-3 text-sm shadow-lg ${t.tone === "ok" ? "bg-stone-900 text-white" : "bg-red-600 text-white"}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ---------- Layout ----------
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl leading-tight text-stone-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-stone-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, children, className = "" }: { title?: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      {title && <h2 className="text-base font-medium text-stone-900">{title}</h2>}
      {description && <p className="mt-0.5 text-sm text-stone-500">{description}</p>}
      <div className={title || description ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

export function Button({
  variant = "primary", loading, children, className = "", ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost"; loading?: boolean }) {
  const styles = {
    primary: "bg-stone-900 text-white hover:bg-stone-700",
    secondary: "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50",
    danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
    ghost: "text-stone-600 hover:bg-stone-100",
  };
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

// ---------- Formulario ----------
export const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-2 focus:ring-stone-200";

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-stone-700">{label}</p>
        {hint && <p className="text-xs text-stone-500">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-emerald-600" : "bg-stone-300"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="absolute inset-0" onClick={onClose} />
      <div role="dialog" aria-label={title} className={`relative my-8 w-full rounded-xl bg-white shadow-2xl ${wide ? "max-w-3xl" : "max-w-xl"}`}>
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="text-lg font-medium">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-stone-200 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

// ---------- Lista ordenable (arrastrar y soltar + flechas) ----------
export function SortableList<T extends { id: number }>({
  items, onReorder, renderItem, disabled,
}: { items: T[]; onReorder: (items: T[]) => void; renderItem: (item: T, index: number) => React.ReactNode; disabled?: boolean }) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [preview, setPreview] = useState<T[] | null>(null);
  const list = preview ?? items;

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  };

  return (
    <ul className="divide-y divide-stone-100">
      {list.map((item, index) => (
        <li
          key={item.id}
          draggable={!disabled}
          onDragStart={(e) => {
            setDragIndex(index);
            setPreview(items);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (dragIndex === null || dragIndex === index || !preview) return;
            const next = [...preview];
            const [moved] = next.splice(dragIndex, 1);
            next.splice(index, 0, moved);
            setPreview(next);
            setDragIndex(index);
          }}
          onDragEnd={() => {
            if (preview) onReorder(preview);
            setPreview(null);
            setDragIndex(null);
          }}
          className={`flex items-center gap-2 bg-white py-3 transition ${dragIndex === index ? "opacity-50" : ""}`}
        >
          {!disabled && (
            <div className="flex shrink-0 items-center text-stone-400">
              <GripVertical className="h-5 w-5 cursor-grab active:cursor-grabbing" aria-hidden />
              <div className="flex flex-col">
                <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} className="rounded p-0.5 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30" aria-label="Subir">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => move(index, index + 1)} disabled={index === items.length - 1} className="rounded p-0.5 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30" aria-label="Bajar">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
          <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
        </li>
      ))}
    </ul>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed border-stone-300 py-12 text-center text-sm text-stone-500">{children}</div>;
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16 text-stone-400">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}
