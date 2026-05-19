"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Pencil, Plus, Save, Trash2, Video, X } from "lucide-react";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase-browser";

function IconYouTube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.8 15.5V8.5l6.2 3.5-6.2 3.5z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12c0-3.2.01-3.58.07-4.85C2.38 3.86 3.9 2.31 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12c0 3.26.01 3.67.07 4.95.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24c3.26 0 3.67-.01 4.95-.07 4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95 0-3.26-.01-3.67-.07-4.95-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32A6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
    </svg>
  );
}

type Platform = "YouTube" | "Facebook" | "Instagram";

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /embed\/([A-Za-z0-9_-]{11})/,
    /shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function youTubeThumbUrl(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

type MediaItem = {
  id: string;
  title: string;
  platform: Platform;
  image_url: string;
  video_url: string;
  duration: string;
  status: "published" | "draft";
};

const EMPTY: Omit<MediaItem, "id"> = {
  title: "",
  platform: "Facebook",
  image_url: "",
  video_url: "",
  duration: "",
  status: "published",
};

const PLATFORM_ICON = { YouTube: IconYouTube, Facebook: IconFacebook, Instagram: IconInstagram };
const PLATFORM_COLOR = {
  YouTube:   "bg-red-100 text-red-600",
  Facebook:  "bg-blue-100 text-blue-600",
  Instagram: "bg-fuchsia-100 text-fuchsia-600",
};

export default function VideosAdminPage() {
  const supabase = createSupabaseBrowserClient();

  const [items, setItems]         = useState<MediaItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState<Omit<MediaItem, "id">>(EMPTY);
  const [imgFile, setImgFile]     = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [autoThumb, setAutoThumb] = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchItems() {
    setLoading(true);
    if (!hasSupabaseBrowserConfig()) {
      setError("Supabase não configurado.");
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("media_items")
      .select("id,title,platform,image_url,video_url,duration,status")
      .order("created_at", { ascending: false });
    setItems((data as MediaItem[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgFile(file);
    setAutoThumb(null);
    setImgPreview(URL.createObjectURL(file));
  }

  function onVideoUrlChange(url: string) {
    setForm((f) => ({ ...f, video_url: url }));
    if (form.platform === "YouTube" && !imgFile) {
      const id = extractYouTubeId(url);
      if (id) {
        const thumb = youTubeThumbUrl(id);
        setAutoThumb(thumb);
        setImgPreview(thumb);
      } else {
        setAutoThumb(null);
        if (!form.image_url) setImgPreview(null);
      }
    }
  }

  async function uploadCapa(itemId: string): Promise<string | null> {
    if (autoThumb && !imgFile) return autoThumb;
    if (!imgFile) return form.image_url || null;
    const ext  = imgFile.name.split(".").pop() ?? "jpg";
    const path = `${itemId}.${ext}`;
    const { error } = await supabase.storage
      .from("media-thumbs")
      .upload(path, imgFile, { upsert: true, contentType: imgFile.type });
    if (error) { console.error(error); return null; }
    const { data } = supabase.storage.from("media-thumbs").getPublicUrl(path);
    return data.publicUrl;
  }

  async function save() {
    if (!form.title.trim())    { setError("Título obrigatório."); return; }
    if (!form.video_url.trim()) { setError("Link do vídeo obrigatório."); return; }
    setError(null);
    setSaving(true);
    try {
      if (editId) {
        const image_url = await uploadCapa(editId) ?? form.image_url;
        await supabase.from("media_items").update({ ...form, image_url }).eq("id", editId);
      } else {
        const { data: ins, error: insErr } = await supabase
          .from("media_items")
          .insert({ ...form, image_url: "" })
          .select("id").single();
        if (insErr || !ins) throw insErr;
        const image_url = await uploadCapa(ins.id) ?? "";
        await supabase.from("media_items").update({ image_url }).eq("id", ins.id);
      }
      closeForm();
      await fetchItems();
    } catch (e) {
      console.error(e);
      setError("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Remover este vídeo?")) return;
    await supabase.from("media_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function openEdit(item: MediaItem) {
    setEditId(item.id);
    setForm({ title: item.title, platform: item.platform, image_url: item.image_url, video_url: item.video_url, duration: item.duration, status: item.status });
    setImgFile(null);
    setAutoThumb(null);
    setImgPreview(item.image_url || null);
    setShowForm(true);
    setError(null);
  }

  function openNew() {
    setEditId(null);
    setForm(EMPTY);
    setImgFile(null);
    setAutoThumb(null);
    setImgPreview(null);
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setImgFile(null);
    setAutoThumb(null);
    setImgPreview(null);
  }

  const byPlatform = (p: Platform) => items.filter((i) => i.platform === p);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-violet-900">
              <Video className="h-6 w-6 text-orange-500" />
              Vídeos — Gerenciar miniaturas
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Cadastre a capa e o link dos 2 últimos vídeos de cada plataforma.
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-orange-600 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Novo vídeo
          </button>
        </div>

        {error && !showForm && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          </div>
        ) : (
          <div className="space-y-8">
            {(["Facebook", "YouTube", "Instagram"] as Platform[]).map((plat) => {
              const Icon = PLATFORM_ICON[plat];
              const platItems = byPlatform(plat);
              return (
                <section key={plat}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${PLATFORM_COLOR[plat]}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <h2 className="font-bold text-slate-700">{plat}</h2>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-500">
                      {platItems.length}/2
                    </span>
                    {platItems.length >= 2 && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-600">completo</span>
                    )}
                  </div>

                  {platItems.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-8 text-slate-400">
                      <Video className="h-8 w-8 opacity-40" />
                      <p className="text-sm">Nenhum vídeo de {plat} cadastrado.</p>
                      <button onClick={openNew} className="text-sm font-semibold text-orange-500 hover:underline">Adicionar</button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {platItems.map((item) => (
                        <div key={item.id} className="flex gap-3 overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                          {/* Miniatura */}
                          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            {item.image_url ? (
                              <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="128px" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Video className="h-6 w-6 text-slate-300" />
                              </div>
                            )}
                            <span className={`absolute left-1 top-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${item.status === "published" ? "bg-green-500 text-white" : "bg-slate-400 text-white"}`}>
                              {item.status === "published" ? "✓" : "rascunho"}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-800">{item.title}</p>
                            <p className="mt-0.5 truncate text-xs text-slate-400">{item.video_url}</p>
                            {item.duration && (
                              <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{item.duration}</span>
                            )}
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => openEdit(item)}
                                className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                              >
                                <Pencil className="h-3 w-3" /> Editar
                              </button>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal formulário ──────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-violet-900">{editId ? "Editar vídeo" : "Novo vídeo"}</h2>
              <button onClick={closeForm} className="rounded-full p-1.5 hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

              {/* Upload miniatura */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                  Capa / Miniatura do vídeo
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-violet-400 hover:bg-violet-50"
                >
                  {imgPreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgPreview} alt="preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700">Trocar imagem</span>
                      </div>
                      {autoThumb && !imgFile && (
                        <span className="absolute bottom-2 left-2 rounded-full bg-green-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
                          ✓ auto YouTube
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <ImagePlus className="h-10 w-10" />
                      <p className="text-sm font-medium">
                        {form.platform === "YouTube" ? "Cole o link do YouTube para capa automática" : "Clique para fazer upload"}
                      </p>
                      <p className="text-xs">JPG ou PNG — proporção 16:9 (ex: 1280×720)</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImgChange} />
              </div>

              {/* Plataforma */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">Plataforma</label>
                <div className="flex gap-3">
                  {(["Facebook", "YouTube", "Instagram"] as Platform[]).map((p) => {
                    const Icon = PLATFORM_ICON[p];
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, platform: p }))}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold transition-all ${
                          form.platform === p
                            ? "border-violet-500 bg-violet-50 text-violet-700"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                  Título <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: A fé que nos sustenta"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Link do vídeo */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                  Link do vídeo <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://www.facebook.com/watch/?v=..."
                  value={form.video_url}
                  onChange={(e) => onVideoUrlChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
                <p className="mt-1 text-xs text-slate-400">
                  {form.platform === "YouTube"
                    ? "Cole o link do YouTube — a miniatura será preenchida automaticamente"
                    : "Cole o link completo do vídeo na página do Facebook/Instagram"}
                </p>
              </div>

              {/* Duração + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">Duração</label>
                  <input
                    type="text"
                    placeholder="Ex: 1:10:15"
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">Status</label>
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
            </div>

            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={closeForm} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-60"
              >
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="h-4 w-4" /> Salvar vídeo</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
