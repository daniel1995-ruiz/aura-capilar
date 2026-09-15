"use client";

import { MediaInput } from "./MediaInput";
import { Field, inputClass, Toggle } from "./ui";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "bool" | "select" | "image" | "video" | "color" | "url";
  hint?: string;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  wide?: boolean;
  rows?: number;
  showIf?: (values: Record<string, any>) => boolean;
};

export function FormFields({ fields, values, onChange }: { fields: FieldDef[]; values: Record<string, any>; onChange: (values: Record<string, any>) => void }) {
  const set = (name: string, value: unknown) => onChange({ ...values, [name]: value });

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields
        .filter((f) => !f.showIf || f.showIf(values))
        .map((f) => {
          const value = values[f.name];
          const wide = f.wide || ["textarea", "image", "video", "bool"].includes(f.type ?? "text");
          const className = wide ? "sm:col-span-2" : "";

          if (f.type === "bool") {
            return (
              <div key={f.name} className={className}>
                <Toggle checked={!!value} onChange={(v) => set(f.name, v)} label={f.label} hint={f.hint} />
              </div>
            );
          }

          if (f.type === "image" || f.type === "video") {
            return (
              <div key={f.name} className={className}>
                <p className="mb-1.5 text-sm font-medium text-stone-700">{f.label}</p>
                <MediaInput kind={f.type} value={value} onChange={(v) => set(f.name, v)} />
                {f.hint && <p className="mt-1 text-xs text-stone-500">{f.hint}</p>}
              </div>
            );
          }

          return (
            <Field key={f.name} label={f.label} hint={f.hint} className={className}>
              {f.type === "textarea" ? (
                <textarea className={inputClass} rows={f.rows ?? 4} value={value ?? ""} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
              ) : f.type === "select" ? (
                <select className={inputClass} value={value ?? ""} onChange={(e) => set(f.name, e.target.value)}>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : f.type === "color" ? (
                <div className="flex gap-2">
                  <input type="color" className="h-10 w-12 cursor-pointer rounded-lg border border-stone-300 bg-white p-1" value={value || "#000000"} onChange={(e) => set(f.name, e.target.value)} />
                  <input className={inputClass} value={value ?? ""} onChange={(e) => set(f.name, e.target.value)} placeholder="#RRGGBB" />
                </div>
              ) : (
                <input
                  className={inputClass}
                  type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                  value={value ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
            </Field>
          );
        })}
    </div>
  );
}
