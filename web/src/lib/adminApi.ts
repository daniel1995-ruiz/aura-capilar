"use client";

import { API_URL } from "./api";
import type { MediaAsset } from "./types";

const TOKEN_KEY = "aura_admin_token";

export const session = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export async function adminFetch<T = unknown>(path: string, options: { method?: string; json?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = session.get();
  if (token) headers.authorization = `Bearer ${token}`;
  if (options.json !== undefined) headers["content-type"] = "application/json";

  const res = await fetch(`${API_URL}/api/admin${path}`, {
    method: options.method ?? (options.json !== undefined ? "POST" : "GET"),
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : undefined,
  });

  if (res.status === 401 && path !== "/login") {
    session.clear();
    window.location.href = "/admin/login";
    throw new Error("Tu sesión expiró");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? `Error ${res.status}`);
  return data as T;
}

export async function uploadMedia(file: File): Promise<MediaAsset> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${API_URL}/api/admin/media`, {
    method: "POST",
    headers: { authorization: `Bearer ${session.get() ?? ""}` },
    body,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "No se pudo subir el archivo");
  return data;
}
