"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Save, Settings, Trash2 } from "lucide-react";
import { crecheMomentCategories, type CrecheMomentCategoryKey } from "@/lib/creche-moments";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase-browser";

type CrecheMomentPhoto = {
  id: string;
  category_key: CrecheMomentCategoryKey;
  title: string;
  image_url: string;
  alt_text: string | null;
  order_index: number | null;
  status: "published" | "draft";
};

type FormState = {
  category_key: CrecheMomentCategoryKey;
  alt_text: string;
  order_index: number;
  status: "published" | "draft";
};

const EMPTY_FORM: FormState = {
  category_key: "formaturas",
  alt_text: "",
  order_index: 0,
  status: "published",
};

function titleForCategory(key: CrecheMomentCategoryKey) {
  return crecheMomentCategories.find((category) => category.key === key)?.title ?? key;
}

export function CrecheConfigManager() {
  const [items, setItems] = useState<CrecheMomentPhoto[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchItems() {
    setLoading(true);

    if (!hasSupabaseBrowserConfig()) {
      setMessage("Supabase nao configurado. Configure as variaveis para salvar fotos.");
      setItems([]);
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("creche_moments")
      .select("id,category_key,title,image_url,alt_text,order_index,status")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Nao foi possivel carregar as fotos. Verifique se a tabela creche_moments existe no Supabase.");
      setItems([]);
    } else {
      setItems((data as CrecheMomentPhoto[]) ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function uploadPhoto(id: string) {
    if (!file || !hasSupabaseBrowserConfig()) return null;

    const supabase = createSupabaseBrowserClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${form.category_key}/${id}.${ext}`;
    const { error } = await supabase.storage
      .from("creche-miranez")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) throw error;

    const { data } = supabase.storage.from("creche-miranez").getPublicUrl(path);
    return data.publicUrl;
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!file) {
      setMessage("Selecione uma foto para inserir.");
      return;
    }

    if (!hasSupabaseBrowserConfig()) {
      setMessage("Supabase nao configurado. Nao foi possivel salvar.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const id = crypto.randomUUID();
      const imageUrl = await uploadPhoto(id);
      if (!imageUrl) throw new Error("Upload sem URL publica.");

      const payload = {
        id,
        category_key: form.category_key,
        title: titleForCategory(form.category_key),
        image_url: imageUrl,
        alt_text: form.alt_text.trim() || null,
        order_index: Number.isFinite(form.order_index) ? form.order_index : 0,
        status: form.status,
      };

      const { error } = await supabase.from("creche_moments").insert(payload);
      if (error) throw error;

      setItems((current) => [payload, ...current]);
      setForm(EMPTY_FORM);
      setFile(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setMessage("Foto inserida com sucesso.");
    } catch (error) {
      console.error(error);
      setMessage("Erro ao salvar a foto. Confira a tabela e o bucket no Supabase.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: CrecheMomentPhoto) {
    if (!confirm("Remover esta foto da galeria?")) return;

    setItems((current) => current.filter((entry) => entry.id !== item.id));

    if (hasSupabaseBrowserConfig()) {
      const supabase = createSupabaseBrowserClient();
      await supabase.from("creche_moments").delete().eq("id", item.id);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[380px_1fr]">
        <form onSubmit={save} className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-primary">
              <Settings className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-slate-950">Config. Creche Miranez</h1>
              <p className="text-sm text-slate-500">Insira fotos nos titulos da pagina publica.</p>
            </div>
          </div>

          <label className="block text-sm font-bold text-slate-700">
            Titulo da pagina
            <select
              value={form.category_key}
              onChange={(event) => setForm({ ...form, category_key: event.target.value as CrecheMomentCategoryKey })}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-primary"
            >
              {crecheMomentCategories.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block text-sm font-bold text-slate-700">
            Descricao da foto
            <input
              value={form.alt_text}
              onChange={(event) => setForm({ ...form, alt_text: event.target.value })}
              placeholder="Ex.: Criancas em atividade"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium outline-none focus:border-primary"
            />
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700">
              Ordem
              <input
                type="number"
                value={form.order_index}
                onChange={(event) => setForm({ ...form, order_index: Number(event.target.value) })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium outline-none focus:border-primary"
              />
            </label>

            <label className="block text-sm font-bold text-slate-700">
              Status
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as FormState["status"] })}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-primary"
              >
                <option value="published">Publicado</option>
                <option value="draft">Rascunho</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-5 flex h-48 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 text-center text-sm font-bold text-primary hover:bg-orange-100"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Previa da foto" className="h-full w-full object-cover" />
            ) : (
              <>
                <ImagePlus className="mb-2 h-9 w-9" />
                Selecionar foto
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />

          {message ? (
            <p className="mt-4 rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-primary">{message}</p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Salvando..." : "Inserir foto"}
          </button>
        </form>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">Fotos cadastradas</h2>
              <p className="text-sm text-slate-500">Apenas fotos publicadas aparecem na pagina Creche Miranez.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {items.length} fotos
            </span>
          </div>

          {loading ? (
            <div className="grid min-h-60 place-items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="grid min-h-60 place-items-center rounded-2xl border-2 border-dashed border-slate-200 text-center text-sm font-semibold text-slate-400">
              Nenhuma foto cadastrada ainda.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="h-40 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url} alt={item.alt_text ?? item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-950">{item.title}</h3>
                        <p className="mt-1 text-xs text-slate-500">{item.alt_text || "Sem descricao"}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                        item.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                      }`}>
                        {item.status === "published" ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
