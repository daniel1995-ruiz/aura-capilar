"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch, session } from "@/lib/adminApi";
import { Button, Field, inputClass } from "@/components/admin/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await adminFetch<{ token: string }>("/login", { json: { email, password } });
      session.set(token);
      router.replace("/admin");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <p className="font-display text-3xl tracking-[0.15em]">PANEL</p>
          <p className="mt-1 text-sm text-stone-500">Ingresa para administrar tu tienda</p>
        </div>
        <Field label="Correo">
          <input className={inputClass} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Contraseña">
          <input className={inputClass} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" loading={loading} className="w-full py-2.5">
          Ingresar
        </Button>
      </form>
    </div>
  );
}
