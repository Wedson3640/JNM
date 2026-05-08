"use client";

import { useEffect, useMemo, useState } from "react";
import { LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { initialNews, videos } from "@/lib/content";
import { mediaSchema, newsSchema, type MediaInput, type NewsInput } from "@/lib/validation";
import type { NewsItem, VideoItem } from "@/types/content";

const emptyForm: NewsInput = {
  title: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  videoUrl: "",
  status: "draft"
};

const emptyMediaForm: MediaInput = {
  title: "",
  platform: "YouTube",
  image: "",
  duration: "",
  videoUrl: "",
  status: "draft"
};

export function NewsManager() {
  const [items, setItems] = useState<NewsItem[]>(initialNews);
  const [form, setForm] = useState<NewsInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<VideoItem[]>(Object.values(videos).flat());
  const [mediaForm, setMediaForm] = useState<MediaInput>(emptyMediaForm);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [mediaMessage, setMediaMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const publishedCount = useMemo(() => items.filter((item) => item.status === "published").length, [items]);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    supabase
      .from("news")
      .select("id,title,subtitle,description,status,created_at,image_url,video_url")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data?.length) {
          setItems(
            data.map((row) => ({
              id: row.id,
              title: row.title,
              subtitle: row.subtitle,
              description: row.description,
              status: row.status,
              createdAt: row.created_at,
              imageUrl: row.image_url,
              videoUrl: row.video_url
            }))
          );
        }
      });

    supabase
      .from("media_items")
      .select("id,title,platform,image_url,duration,video_url,status")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data?.length) {
          setMediaItems(
            data.map((row) => ({
              id: row.id,
              title: row.title,
              platform: row.platform,
              image: row.image_url,
              duration: row.duration,
              videoUrl: row.video_url,
              status: row.status
            }))
          );
        }
      });
  }, []);

  async function persist(next: NewsItem) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    await supabase.from("news").upsert({
      id: next.id,
      title: next.title,
      subtitle: next.subtitle,
      description: next.description,
      status: next.status,
      image_url: next.imageUrl || null,
      video_url: next.videoUrl || null,
      created_at: next.createdAt
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const parsed = newsSchema.safeParse(form);
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Revise os dados informados.");
      return;
    }

    setLoading(true);
    const next: NewsItem = {
      id: editingId ?? crypto.randomUUID(),
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
      videoUrl: parsed.data.videoUrl || null,
      createdAt: editingId ? items.find((item) => item.id === editingId)?.createdAt ?? new Date().toISOString() : new Date().toISOString()
    };

    setItems((current) => [next, ...current.filter((item) => item.id !== next.id)]);
    await persist(next);
    setForm(emptyForm);
    setEditingId(null);
    setLoading(false);
  }

  async function remove(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createSupabaseBrowserClient();
      await supabase.from("news").delete().eq("id", id);
    }
  }

  async function toggle(item: NewsItem) {
    const next = { ...item, status: item.status === "published" ? "draft" : "published" } as NewsItem;
    setItems((current) => current.map((entry) => (entry.id === item.id ? next : entry)));
    await persist(next);
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function saveMedia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMediaMessage(null);

    const parsed = mediaSchema.safeParse(mediaForm);
    if (!parsed.success) {
      setMediaMessage(parsed.error.issues[0]?.message ?? "Revise os dados da mídia.");
      return;
    }

    const next: VideoItem = {
      id: editingMediaId ?? crypto.randomUUID(),
      ...parsed.data,
      videoUrl: parsed.data.videoUrl || null
    };

    setMediaItems((current) => [next, ...current.filter((item) => item.id !== next.id)]);
    setMediaForm(emptyMediaForm);
    setEditingMediaId(null);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createSupabaseBrowserClient();
      await supabase.from("media_items").upsert({
        id: next.id,
        title: next.title,
        platform: next.platform,
        image_url: next.image,
        duration: next.duration,
        video_url: next.videoUrl || null,
        status: next.status ?? "draft"
      });
    }
  }

  async function removeMedia(id?: string) {
    if (!id) return;
    setMediaItems((current) => current.filter((item) => item.id !== id));

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createSupabaseBrowserClient();
      await supabase.from("media_items").delete().eq("id", id);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="card h-fit p-5">
        <p className="text-sm font-semibold uppercase text-primary">Dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-950">Publicações</h1>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-orange-50 p-4">
            <p className="text-3xl font-bold text-gray-950">{items.length}</p>
            <p className="text-sm">notícias</p>
          </div>
          <div className="rounded-2xl bg-orange-50 p-4">
            <p className="text-3xl font-bold text-gray-950">{publishedCount}</p>
            <p className="text-sm">publicadas</p>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-orange-100 p-4">
          <p className="text-sm font-semibold text-gray-950">Aplicações integradas</p>
          <p className="mt-1 text-sm">Notícias, mídia, eventos e convênios ficam concentrados nesta área interna.</p>
        </div>
        <button type="button" onClick={signOut} className="button-outline mt-5 w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </button>
      </aside>

      <section className="space-y-6">
        <form onSubmit={onSubmit} className="card p-5">
          <div className="mb-5 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold text-gray-950">{editingId ? "Editar notícia" : "Nova notícia"}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Título
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none" />
            </label>
            <label className="text-sm font-semibold">
              Subtítulo
              <input value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none" />
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              Descrição
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none" />
            </label>
            <label className="text-sm font-semibold">
              URL da imagem
              <input value={form.imageUrl ?? ""} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://..." className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none" />
            </label>
            <label className="text-sm font-semibold">
              URL do vídeo
              <input value={form.videoUrl ?? ""} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} placeholder="https://..." className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none" />
            </label>
            <label className="text-sm font-semibold">
              Status
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as NewsInput["status"] })} className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none">
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </select>
            </label>
          </div>
          {message ? <p className="mt-4 rounded-2xl bg-orange-50 p-3 text-sm text-primary">{message}</p> : null}
          <button type="submit" className="button-primary mt-5" disabled={loading}>
            {loading ? "Salvando..." : "Salvar notícia"}
          </button>
        </form>

        <div className="card overflow-hidden">
          <div className="border-b border-orange-100 p-5">
            <h2 className="text-2xl font-semibold text-gray-950">Notícias cadastradas</h2>
          </div>
          <div className="divide-y divide-orange-100">
            {items.map((item) => (
              <article key={item.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                    {item.status === "published" ? "Publicado" : "Rascunho"}
                  </span>
                  <h3 className="mt-3 text-base font-semibold uppercase text-primary">{item.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-gray-950">{item.subtitle}</p>
                  <p className="mt-1 text-sm">{item.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <button type="button" className="button-outline" onClick={() => toggle(item)}>
                    {item.status === "published" ? "Despublicar" : "Publicar"}
                  </button>
                  <button type="button" aria-label="Editar notícia" className="rounded-2xl border border-orange-100 p-3 text-primary hover:bg-orange-50" onClick={() => {
                    setEditingId(item.id);
                    setForm({
                      title: item.title,
                      subtitle: item.subtitle,
                      description: item.description,
                      imageUrl: item.imageUrl ?? "",
                      videoUrl: item.videoUrl ?? "",
                      status: item.status
                    });
                  }}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Excluir notícia" className="rounded-2xl border border-orange-100 p-3 text-primary hover:bg-orange-50" onClick={() => remove(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <form onSubmit={saveMedia} className="card p-5">
          <div className="mb-5 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold text-gray-950">{editingMediaId ? "Editar mídia" : "Nova mídia"}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Título
              <input value={mediaForm.title} onChange={(event) => setMediaForm({ ...mediaForm, title: event.target.value })} className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none" />
            </label>
            <label className="text-sm font-semibold">
              Plataforma
              <select value={mediaForm.platform} onChange={(event) => setMediaForm({ ...mediaForm, platform: event.target.value as MediaInput["platform"] })} className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none">
                <option value="YouTube">YouTube</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              URL da imagem
              <input value={mediaForm.image} onChange={(event) => setMediaForm({ ...mediaForm, image: event.target.value })} placeholder="https://..." className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none" />
            </label>
            <label className="text-sm font-semibold">
              URL do vídeo
              <input value={mediaForm.videoUrl ?? ""} onChange={(event) => setMediaForm({ ...mediaForm, videoUrl: event.target.value })} placeholder="https://..." className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none" />
            </label>
            <label className="text-sm font-semibold">
              Duração
              <input value={mediaForm.duration} onChange={(event) => setMediaForm({ ...mediaForm, duration: event.target.value })} placeholder="1:12:05" className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none" />
            </label>
            <label className="text-sm font-semibold">
              Status
              <select value={mediaForm.status} onChange={(event) => setMediaForm({ ...mediaForm, status: event.target.value as MediaInput["status"] })} className="mt-2 w-full rounded-2xl border border-orange-100 px-4 py-3 font-normal outline-none">
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </select>
            </label>
          </div>
          {mediaMessage ? <p className="mt-4 rounded-2xl bg-orange-50 p-3 text-sm text-primary">{mediaMessage}</p> : null}
          <button type="submit" className="button-primary mt-5">
            Salvar mídia
          </button>
        </form>

        <div className="card overflow-hidden">
          <div className="border-b border-orange-100 p-5">
            <h2 className="text-2xl font-semibold text-gray-950">Mídias cadastradas</h2>
          </div>
          <div className="divide-y divide-orange-100">
            {mediaItems.map((item) => (
              <article key={item.id ?? `${item.platform}-${item.title}`} className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-primary">{item.platform}</span>
                  <h3 className="mt-3 text-base font-semibold text-gray-950">{item.title}</h3>
                  <p className="mt-1 text-sm">{item.duration} · {item.status === "published" ? "Publicado" : "Rascunho"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <button type="button" aria-label="Editar mídia" className="rounded-2xl border border-orange-100 p-3 text-primary hover:bg-orange-50" onClick={() => {
                    setEditingMediaId(item.id ?? null);
                    setMediaForm({
                      title: item.title,
                      platform: item.platform,
                      image: item.image,
                      duration: item.duration,
                      videoUrl: item.videoUrl ?? "",
                      status: item.status ?? "draft"
                    });
                  }}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Excluir mídia" className="rounded-2xl border border-orange-100 p-3 text-primary hover:bg-orange-50" onClick={() => removeMedia(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
