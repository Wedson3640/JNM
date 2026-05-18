"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase-browser";

// ── Types ─────────────────────────────────────────────────────────────────────
type Livro = {
  id: string;
  titulo: string;
  autor: string;
  preco: number;
  descricao: string;
  capa_url: string | null;
  estoque: number;
  status: "published" | "draft";
};

const EMPTY: Omit<Livro, "id"> = {
  titulo: "",
  autor: "João Nunes Maia",
  preco: 0,
  descricao: "",
  capa_url: null,
  estoque: 0,
  status: "published",
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function LivrariaAdminPage() {
  const [livros, setLivros]       = useState<Livro[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState<Omit<Livro, "id">>(EMPTY);
  const [capaFile, setCapaFile]   = useState<File | null>(null);
  const [capaPreview, setCapaPreview] = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  async function fetchLivros() {
    setLoading(true);
    if (!hasSupabaseBrowserConfig()) {
      setError("Supabase não configurado. Preencha as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      setLivros([]);
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("livros")
      .select("*")
      .order("created_at", { ascending: false });
    setLivros((data as Livro[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchLivros(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Capa upload ──────────────────────────────────────────────────────────
  function onCapaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapaFile(file);
    setCapaPreview(URL.createObjectURL(file));
  }

  async function uploadCapa(livroId: string): Promise<string | null> {
    if (!capaFile) return form.capa_url;
    if (!hasSupabaseBrowserConfig()) return null;

    const supabase = createSupabaseBrowserClient();
    const ext  = capaFile.name.split(".").pop() ?? "jpg";
    const path = `${livroId}.${ext}`;
    const { error } = await supabase.storage
      .from("livros-capas")
      .upload(path, capaFile, { upsert: true, contentType: capaFile.type });
    if (error) { console.error(error); return null; }
    const { data } = supabase.storage.from("livros-capas").getPublicUrl(path);
    return data.publicUrl;
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  async function save() {
    if (!form.titulo.trim()) { setError("O título é obrigatório."); return; }
    if (form.preco <= 0)     { setError("Informe um preço válido."); return; }
    setError(null);
    setSaving(true);

    try {
      if (!hasSupabaseBrowserConfig()) {
        setError("Supabase não configurado. Não foi possível salvar.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      if (editId) {
        // Update
        const capa_url = await uploadCapa(editId);
        await supabase.from("livros").update({ ...form, capa_url, updated_at: new Date().toISOString() }).eq("id", editId);
      } else {
        // Insert (generate id first so we can use it for the upload path)
        const { data: inserted, error: insErr } = await supabase
          .from("livros")
          .insert({ ...form, capa_url: null })
          .select("id")
          .single();
        if (insErr || !inserted) throw insErr;
        const capa_url = await uploadCapa(inserted.id);
        if (capa_url) {
          await supabase.from("livros").update({ capa_url }).eq("id", inserted.id);
        }
      }
      closeForm();
      await fetchLivros();
    } catch (e) {
      console.error(e);
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function deleteLivro(id: string) {
    if (!confirm("Remover este livro?")) return;
    if (!hasSupabaseBrowserConfig()) {
      setError("Supabase não configurado. Não foi possível remover.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    await supabase.from("livros").delete().eq("id", id);
    setLivros((prev) => prev.filter((l) => l.id !== id));
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  function openEdit(livro: Livro) {
    setEditId(livro.id);
    setForm({ titulo: livro.titulo, autor: livro.autor, preco: livro.preco, descricao: livro.descricao, capa_url: livro.capa_url, estoque: livro.estoque ?? 0, status: livro.status });
    setCapaFile(null);
    setCapaPreview(livro.capa_url);
    setShowForm(true);
    setError(null);
  }

  function openNew() {
    setEditId(null);
    setForm(EMPTY);
    setCapaFile(null);
    setCapaPreview(null);
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setCapaFile(null);
    setCapaPreview(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-violet-900">
              <BookOpen className="h-6 w-6 text-orange-500" />
              Livraria — Gerenciar livros
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Adicione, edite ou remova livros do catálogo público.
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-orange-600 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Novo livro
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          </div>
        ) : livros.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 py-20 text-slate-400">
            <BookOpen className="h-12 w-12 opacity-40" />
            <p className="text-sm">Nenhum livro cadastrado ainda.</p>
            <button onClick={openNew} className="text-sm font-semibold text-orange-500 hover:underline">
              Cadastrar primeiro livro
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {livros.map((livro) => (
              <div key={livro.id} className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                {/* Capa */}
                <div className="relative h-44 w-full bg-gradient-to-br from-violet-100 to-purple-50">
                  {livro.capa_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={livro.capa_url} alt={livro.titulo} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-12 w-12 text-violet-200" />
                    </div>
                  )}
                  {/* Status badge */}
                  <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${livro.status === "published" ? "bg-green-500 text-white" : "bg-slate-400 text-white"}`}>
                    {livro.status === "published" ? "Publicado" : "Rascunho"}
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-bold leading-snug text-violet-900">{livro.titulo}</h3>
                  <p className="text-xs text-slate-400">{livro.autor}</p>
                  <p className="mt-1 line-clamp-2 flex-1 text-xs text-slate-500">{livro.descricao}</p>
                  <p className="mt-3 text-lg font-extrabold text-violet-900">{fmt(livro.preco)}</p>
                  <p className={`mt-1 text-xs font-bold ${livro.estoque > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    Estoque: {livro.estoque}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-slate-100 px-4 py-3">
                  <button
                    onClick={() => openEdit(livro)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => deleteLivro(livro.id)}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Formulário (modal) ─────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* Header modal */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-violet-900">
                {editId ? "Editar livro" : "Novo livro"}
              </h2>
              <button onClick={closeForm} className="rounded-full p-1.5 hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
              )}

              {/* Upload capa */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                  Capa do livro
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative flex h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-violet-400 hover:bg-violet-50"
                >
                  {capaPreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={capaPreview} alt="Prévia da capa" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700">
                          Trocar imagem
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <ImagePlus className="h-10 w-10" />
                      <p className="text-sm font-medium">Clique para fazer upload</p>
                      <p className="text-xs">JPG, PNG ou WEBP — recomendado 400×560 px</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onCapaChange}
                />
              </div>

              {/* Título */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                  Título <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Estudo, Caridade e Amor"
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Autor */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                  Autor
                </label>
                <input
                  type="text"
                  placeholder="Nome do autor"
                  value={form.autor}
                  onChange={(e) => setForm((f) => ({ ...f, autor: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Preço + Estoque + Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Preço (R$) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={form.preco || ""}
                    onChange={(e) => setForm((f) => ({ ...f, preco: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Estoque
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={form.estoque}
                    onChange={(e) => setForm((f) => ({ ...f, estoque: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "published" | "draft" }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  >
                    <option value="published">Publicado</option>
                    <option value="draft">Rascunho</option>
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  placeholder="Breve descrição do livro para o catálogo..."
                  value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>

            {/* Footer modal */}
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={closeForm}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white shadow-md hover:bg-orange-600 active:scale-95 disabled:opacity-60 transition-all"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                ) : (
                  <><Save className="h-4 w-4" /> Salvar livro</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
