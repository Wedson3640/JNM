"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { adminSections } from "@/lib/admin-sections";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { AdminSection } from "@/types/admin";

type RowData = Record<string, string | null> & {
  id?: string;
  status?: string;
};

function emptyData(section: AdminSection): RowData {
  return section.fields.reduce<RowData>((acc, field) => {
    acc[field.name] = field.name === "status" ? "draft" : "";
    return acc;
  }, {});
}

export function SiteConfigPanel() {
  const [activeKey, setActiveKey] = useState(adminSections[0].key);
  const activeSection = useMemo(
    () => adminSections.find((section) => section.key === activeKey) ?? adminSections[0],
    [activeKey]
  );
  const [rows, setRows] = useState<RowData[]>([]);
  const [form, setForm] = useState<RowData>(() => emptyData(activeSection));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(emptyData(activeSection));
    setEditingId(null);
    setMessage(null);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setRows([]);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    supabase
      .from(activeSection.table)
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setMessage(`Não foi possível carregar ${activeSection.title}. Verifique se a tabela existe no Supabase.`);
          setRows([]);
          return;
        }

        setRows((data ?? []) as RowData[]);
      });
  }, [activeSection]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const missing = activeSection.fields.find((field) => field.required && !String(form[field.name] ?? "").trim());
    if (missing) {
      setMessage(`Preencha o campo: ${missing.label}.`);
      return;
    }

    setLoading(true);
    const payload = {
      ...form,
      id: editingId ?? crypto.randomUUID()
    };

    setRows((current) => [payload, ...current.filter((row) => row.id !== payload.id)]);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from(activeSection.table).upsert(payload);

      if (error) {
        setMessage(`Erro ao salvar: ${error.message}`);
      }
    }

    setForm(emptyData(activeSection));
    setEditingId(null);
    setLoading(false);
  }

  async function remove(row: RowData) {
    if (!row.id) return;

    setRows((current) => current.filter((item) => item.id !== row.id));

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createSupabaseBrowserClient();
      await supabase.from(activeSection.table).delete().eq("id", row.id);
    }
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <aside className="card h-fit p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-primary">
            <Database className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Área interna</p>
            <h1 className="text-2xl font-semibold text-gray-950">Configuração do site</h1>
          </div>
        </div>

        <nav className="mt-6 space-y-2" aria-label="Áreas do painel">
          {adminSections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveKey(section.key)}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                section.key === activeKey ? "bg-primary text-white shadow-md" : "bg-orange-50 text-gray-800 hover:bg-orange-100"
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>

        <button type="button" onClick={signOut} className="button-outline mt-6 w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </button>
      </aside>

      <section className="space-y-6">
        <form onSubmit={save} className="card p-5">
          <div className="mb-5 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-950">
                {editingId ? `Editar ${activeSection.title}` : `Novo item: ${activeSection.title}`}
              </h2>
              <p className="mt-1 text-sm text-gray-600">{activeSection.description}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {activeSection.fields.map((field) => (
              <label key={field.name} className={`text-sm font-semibold ${field.type === "textarea" ? "md:col-span-2" : ""}`}>
                {field.label}
                {field.type === "textarea" ? (
                  <textarea
                    value={String(form[field.name] ?? "")}
                    onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none"
                  />
                ) : field.type === "select" ? (
                  <select
                    value={String(form[field.name] ?? field.options?.[0] ?? "")}
                    onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none"
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option === "published" ? "Publicado" : option === "draft" ? "Rascunho" : option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === "url" ? "url" : "text"}
                    value={String(form[field.name] ?? "")}
                    onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none"
                  />
                )}
              </label>
            ))}
          </div>

          {message ? <p className="mt-4 rounded-2xl bg-orange-50 p-3 text-sm text-primary">{message}</p> : null}

          <button type="submit" className="button-primary mt-5" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>

        <div className="card overflow-hidden">
          <div className="border-b border-orange-100 p-5">
            <h2 className="text-2xl font-semibold text-gray-950">{activeSection.title} cadastrados</h2>
          </div>

          <div className="divide-y divide-orange-100">
            {rows.length ? (
              rows.map((row) => (
                <article key={row.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
                  <div>
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-primary">
                      {row.status === "published" ? "Publicado" : "Rascunho"}
                    </span>
                    <h3 className="mt-3 text-base font-semibold text-gray-950">
                      {String(row.title ?? row.name ?? row.weekday ?? row.label ?? "Item")}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {String(row.description ?? row.subtitle ?? row.meta ?? row.time ?? row.city ?? "")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <button
                      type="button"
                      aria-label="Editar item"
                      className="rounded-2xl border border-orange-100 p-3 text-primary hover:bg-orange-50"
                      onClick={() => {
                        setEditingId(row.id ?? null);
                        setForm(row);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Excluir item"
                      className="rounded-2xl border border-orange-100 p-3 text-primary hover:bg-orange-50"
                      onClick={() => remove(row)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="p-5 text-sm text-gray-600">Nenhum item cadastrado nesta área ainda.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
