"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { registerUser } from "@/app/cad_users/actions";
import { adminProfileOptions, type AdminProfile } from "@/lib/admin-access";

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  icon: Icon
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  icon: React.ElementType;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4">
      <Icon className="h-5 w-5 shrink-0 text-primary" />
      <input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent py-3 outline-none"
      />
      <button
        type="button"
        aria-label={visible ? "Ocultar" : "Mostrar"}
        onClick={() => setVisible((v) => !v)}
        className="shrink-0 text-gray-400 hover:text-primary"
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

export function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [profile, setProfile] = useState<AdminProfile>("creche");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (password !== confirm) {
      setMessage({ text: "As senhas nao coincidem.", ok: false });
      return;
    }

    if (password.length < 8) {
      setMessage({ text: "A senha deve ter no minimo 8 caracteres.", ok: false });
      return;
    }

    setLoading(true);
    const displayName = firstName.trim();
    const result = await registerUser(email, password, displayName, profile);
    setLoading(false);

    if (result.error) {
      setMessage({ text: result.error, ok: false });
      return;
    }

    setMessage({ text: "Usuario criado com sucesso. Acesse a area interna pelo link de login.", ok: true });
    setFirstName("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setProfile("creche");
  }

  return (
    <form onSubmit={onSubmit} className="card w-full p-6">
      <h1 className="text-2xl font-semibold text-gray-950">Cadastro de acesso</h1>
      <p className="mt-2 text-sm">Crie uma conta para acessar a area interna.</p>

      <div className="mt-6">
        <label className="block text-sm font-semibold text-gray-950" htmlFor="reg-firstname">
          Nome
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4">
          <User className="h-5 w-5 shrink-0 text-primary" />
          <input
            id="reg-firstname"
            type="text"
            autoComplete="name"
            placeholder="nome e sobrenome"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-transparent py-3 outline-none"
          />
        </div>
      </div>

      <label className="mt-4 block text-sm font-semibold text-gray-950" htmlFor="reg-email">
        E-mail
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4">
        <Mail className="h-5 w-5 shrink-0 text-primary" />
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
      <PasswordInput
        id="reg-password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        icon={Lock}
      />

      <label className="mt-4 block text-sm font-semibold text-gray-950" htmlFor="reg-confirm">
        Confirmar senha
      </label>
      <PasswordInput
        id="reg-confirm"
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
        icon={Lock}
      />

      <label className="mt-4 block text-sm font-semibold text-gray-950" htmlFor="reg-profile">
        Perfil de acesso
      </label>
      <div className="mt-2 rounded-2xl border border-orange-100 bg-white px-4">
        <select
          id="reg-profile"
          required
          value={profile}
          onChange={(e) => setProfile(e.target.value as AdminProfile)}
          className="w-full bg-transparent py-3 outline-none"
        >
          {adminProfileOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {message ? (
        <p className={`mt-4 rounded-2xl p-3 text-sm ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-primary"}`}>
          {message.text}
        </p>
      ) : null}

      <button className="button-primary mt-6 flex w-full items-center justify-center gap-2" disabled={loading} type="submit">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Cadastrando...
          </>
        ) : (
          "Cadastrar"
        )}
      </button>
    </form>
  );
}
