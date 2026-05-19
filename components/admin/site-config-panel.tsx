"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageDown, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
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

export function SiteConfigPanel({ sectionKeys, layout = "sidebar" }: { sectionKeys?: string[]; layout?: "sidebar" | "tabs" }) {
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
  const [rows, setRows]         = useState<RowData[]>([]);
  const [form, setForm]         = useState<RowData>(() => emptyData(activeSection));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [imgFile, setImgFile]       = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  const imgField = useMemo(
    () => activeSection.fields.find((f) => f.type === "image-upload"),
    [activeSection]
  );

  useEffect(() => {
    setForm(emptyData(activeSection));
    setEditingId(null);
    setMessage(null);
    setImgFile(null);
    setImgPreview(null);

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
    const id = editingId ?? crypto.randomUUID();
    const payload: RowData = {
      ...form,
      ...(activeSection.rowFilter ?? {}),
      id,
    };

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createSupabaseBrowserClient();

      if (imgFile && imgField?.bucket) {
        const ext  = imgFile.name.split(".").pop() ?? "jpg";
        const path = `${id}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(imgField.bucket)
          .upload(path, imgFile, { upsert: true, contentType: imgFile.type });
        if (upErr) {
          setMessage(`Erro no upload da imagem: ${upErr.message}`);
          setLoading(false);
          return;
        }
        const { data: urlData } = supabase.storage.from(imgField.bucket).getPublicUrl(path);
        payload[imgField.name] = urlData.publicUrl;
      }

      setRows((current) => [payload, ...current.filter((row) => row.id !== payload.id)]);

      const { error } = await supabase.from(activeSection.table).upsert(payload);
      if (error) {
        setMessage(`Erro ao salvar: ${error.message}`);
      }
    } else {
      setRows((current) => [payload, ...current.filter((row) => row.id !== payload.id)]);
    }

    setForm(emptyData(activeSection));
    setEditingId(null);
    setImgFile(null);
    setImgPreview(null);
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
    <div className="space-y-4">
      {/* ── Tabs horizontais ── */}
      {layout === "tabs" && (
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveKey(section.key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                section.key === activeKey
                  ? "bg-primary text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-orange-50 hover:text-primary"
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      )}

      <div className={layout === "sidebar" ? "grid gap-6 xl:grid-cols-[280px_1fr]" : ""}>
        {/* ── Sidebar vertical (layout padrão) ── */}
        {layout === "sidebar" && (
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
        )}

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
            {activeSection.fields.map((field) => {
              // Visibilidade condicional
              if (field.visibleWhen && form[field.visibleWhen.field] !== field.visibleWhen.value) {
                return null;
              }

              if (field.type === "image-upload") {
                const inputId = `img-upload-${field.name}`;
                return (
                  <div key={field.name} className="md:col-span-2 text-sm font-semibold">
                    {field.label}
                    <label
                      htmlFor={inputId}
                      className="mt-2 relative flex h-52 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-orange-100 bg-orange-50/40 transition-colors hover:border-primary hover:bg-orange-50"
                    >
                      {imgPreview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imgPreview} alt="preview" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700">Trocar imagem</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <ImagePlus className="h-10 w-10" />
                          <p className="text-sm font-medium">Clique para fazer upload</p>
                          <p className="text-xs font-normal">JPG ou PNG — proporção 16:9 recomendada</p>
                        </div>
                      )}
                    </label>
                    <input
                      id={inputId}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImgFile(file);
                        setImgPreview(URL.createObjectURL(file));
                      }}
                    />
                  </div>
                );
              }

              return (
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
                      onChange={(event) => {
                        const newValue = event.target.value;
                        // Limpa campos dependentes que ficam ocultos
                        const newForm = { ...form, [field.name]: newValue };
                        activeSection.fields.forEach((f) => {
                          if (f.visibleWhen?.field === field.name && f.visibleWhen.value !== newValue) {
                            newForm[f.name] = "";
                            if (f.type === "image-upload") { setImgFile(null); setImgPreview(null); }
                          }
                        });
                        setForm(newForm);
                      }}
                      className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none"
                    >
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>
                          {field.optionLabels?.[option]
                            ?? (option === "published" ? "Publicado" : option === "draft" ? "Rascunho" : option)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "url" ? "url" : "text"}
                      value={String(form[field.name] ?? "")}
                      placeholder={field.placeholder}
                      onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none placeholder:text-gray-300"
                    />
                  )}
                </label>
              );
            })}
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
                        setImgFile(null);
                        setImgPreview(imgField ? String(row[imgField.name] ?? "") || null : null);
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
    </div>
  );
}
