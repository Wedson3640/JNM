"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(
    params.get("config") === "missing" ? "Configure as variáveis do Supabase para acessar a área interna." : null
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage("E-mail ou senha inválidos.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setMessage("Não foi possível conectar ao Supabase. Verifique a configuração.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card w-full max-w-md p-6" aria-label="Entrar na área interna">
      <h1 className="text-2xl font-semibold text-gray-950">Área interna</h1>
      <p className="mt-2 text-sm">Acesse o painel para publicar notícias, trocar imagens e gerenciar conteúdos.</p>

      <label className="mt-6 block text-sm font-semibold text-gray-950" htmlFor="email">
        E-mail
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4">
        <Mail className="h-5 w-5 text-primary" />
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full bg-transparent py-3 outline-none"
        />
      </div>

      <label className="mt-4 block text-sm font-semibold text-gray-950" htmlFor="password">
        Senha
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4">
        <Lock className="h-5 w-5 text-primary" />
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full bg-transparent py-3 outline-none"
        />
      </div>

      {message ? <p className="mt-4 rounded-2xl bg-orange-50 p-3 text-sm text-primary">{message}</p> : null}

      <button className="button-primary mt-6 w-full" disabled={loading} type="submit">
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
