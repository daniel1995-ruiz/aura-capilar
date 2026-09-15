export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export type FieldType = "str" | "str?" | "int" | "int?" | "float?" | "bool";

/** Toma del body solo los campos permitidos y los convierte al tipo esperado. */
export function coerce(body: unknown, spec: Record<string, FieldType>) {
  const src = (body ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, type] of Object.entries(spec)) {
    if (!(key in src)) continue;
    const value = src[key];
    const optional = type.endsWith("?");
    if (optional && (value === null || value === undefined || value === "")) {
      out[key] = null;
      continue;
    }
    switch (type.replace("?", "")) {
      case "str":
        out[key] = String(value ?? "").trim();
        break;
      case "int":
      case "float": {
        const n = Number(value);
        if (!Number.isFinite(n)) throw new ApiError(400, `Valor numérico inválido en "${key}"`);
        out[key] = type.startsWith("int") ? Math.round(n) : n;
        break;
      }
      case "bool":
        out[key] = value === true || value === "true" || value === 1 || value === "1";
        break;
    }
  }
  return out;
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeText(input: string | null | undefined) {
  return (input ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function parseJsonArray(value: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(value ?? "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function toId(value: unknown) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, "ID inválido");
  return id;
}
