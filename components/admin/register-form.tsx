"use client";

import { useState } from "react";
import { KeyRound, Lock, Mail } from "lucide-react";
import { registerUser } from "@/app/cad_users/actions";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (password !== confirm) {
      setMessage({ text: "As senhas não coincidem.", ok: false });
      return;
    }

    if (password.length < 8) {
      setMessage({ text: "A senha deve ter no mínimo 8 caracteres.", ok: false });
      return;
    }

    setLoading(true);
    const result = await registerUser(email, password, code);
    setLoading(false);

    if (result.error) {
      setMessage({ text: result.error, ok: false });
      return;
    }

    setMessage({ text: "Usuário criado com sucesso. Acesse a área interna pelo link de login.", ok: true });
    setEmail("");
    setPassword("");
    setConfirm("");
    setCode("");
  }

  return (
    <form onSubmit={onSubmit} className="card w-full max-w-md p-6">
      <h1 className="text-2xl font-semibold text-gray-950">Cadastro de acesso</h1>
      <p className="mt-2 text-sm">Crie uma conta para acessar a área interna.</p>

      <label className="mt-6 block text-sm font-semibold text-gray-950" htmlFor="reg-email">
        E-mail
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4">
        <Mail className="h-5 w-5 text-primary" />
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent py-3 outline-none"
        />
      </div>

      <label className="mt-4 block text-sm font-semibold text-gray-950" htmlFor="reg-password">
        Senha
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4">
        <Lock className="h-5 w-5 text-primary" />
        <input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent py-3 outline-none"
        />
      </div>

      <label className="mt-4 block text-sm font-semibold text-gray-950" htmlFor="reg-confirm">
        Confirmar senha
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4">
        <Lock className="h-5 w-5 text-primary" />
        <input
          id="reg-confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full bg-transparent py-3 outline-none"
        />
      </div>

      <label className="mt-4 block text-sm font-semibold text-gray-950" htmlFor="reg-code">
        Código de acesso
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4">
        <KeyRound className="h-5 w-5 text-primary" />
        <input
          id="reg-code"
          type="password"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full bg-transparent py-3 outline-none"
        />
      </div>

      {message ? (
        <p className={`mt-4 rounded-2xl p-3 text-sm ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-primary"}`}>
          {message.text}
        </p>
      ) : null}

      <button className="button-primary mt-6 w-full" disabled={loading} type="submit">
        {loading ? "Cadastrando..." : "Cadastrar"}
      </button>
    </form>
  );
}
