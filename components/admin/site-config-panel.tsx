"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageDown, Pencil, Plus, Trash2 } from "lucide-react";
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

export function SiteConfigPanel({ sectionKeys }: { sectionKeys?: string[] }) {
  const sections = useMemo(
    () => (sectionKeys ? adminSections.filter((s) => sectionKeys.includes(s.key)) : adminSections),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sectionKeys?.join(",")]
  );
  const [activeKey, setActiveKey] = useState(sections[0]?.key ?? adminSections[0].key);
  const activeSection = useMemo(
    () => sections.find((section) => section.key === activeKey) ?? sections[0],
    [activeKey, sections]
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
    let query = supabase.from(activeSection.table).select("*").order("created_at", { ascending: false });
    if (activeSection.rowFilter) {
      for (const [col, val] of Object.entries(activeSection.rowFilter)) {
        query = query.eq(col, val);
      }
    }
    query.then(({ data, error }) => {
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
      ...(activeSection.rowFilter ?? {}),
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

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <aside className="card h-fit p-4">
        <nav className="space-y-1" aria-label="Seções">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveKey(section.key)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                section.key === activeKey ? "bg-primary text-white shadow-md" : "text-gray-700 hover:bg-orange-50 hover:text-primary"
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>
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

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className="button-primary" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </button>

            {activeSection.key === "hero_slides" && (
              <a
                href={`/api/banner?${new URLSearchParams({
                  speaker: String(form.speaker_name ?? ""),
                  theme: String(form.theme ?? ""),
                  date: String(form.event_date ?? ""),
                  weekday: String(form.event_weekday ?? ""),
                  time: String(form.event_time ?? ""),
                  platforms: String(form.platforms ?? "YouTube"),
                  photo: String(form.image_url ?? ""),
                }).toString()}`}
                target="_blank"
                rel="noreferrer"
                className="button-outline inline-flex items-center gap-2"
              >
                <ImageDown className="h-4 w-4" />
                Gerar Banner Instagram
              </a>
            )}
          </div>
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
                      {String(row.speaker_name ?? row.title ?? row.name ?? row.weekday ?? row.label ?? "Item")}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {String(row.theme ?? row.description ?? row.subtitle ?? row.meta ?? row.time ?? row.city ?? "")}
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
