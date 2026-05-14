"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ImageDown, Pencil, Trash2, Upload, X } from "lucide-react";
import { LectureBanner } from "@/components/banner/LectureBanner";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { SiteConfigPanel } from "@/components/admin/site-config-panel";
import type { Lecture } from "@/types/lecture";

// ─── Types ────────────────────────────────────────────────────────────────────
type HeroSlide = {
  id: string;
  speaker_name: string;
  theme: string;
  event_date: string;
  event_weekday: string;
  event_time: string;
  platforms: string;
  image_url: string | null;
  status: string;
  label?:          string;
  title?:          string;
  meta?:           string;
  banner_url?:     string | null;
  banner_web_url?: string | null;
};

const EMPTY: Omit<HeroSlide, "id"> = {
  speaker_name: "",
  theme: "",
  event_date: "",
  event_weekday: "",
  event_time: "",
  platforms: "YouTube",
  image_url: null,
  status: "draft",
};

const STATUS_STYLE: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft:     "bg-gray-100 text-gray-500",
};

function bannerParams(s: Omit<HeroSlide, "id">) {
  return new URLSearchParams({
    speaker:   s.speaker_name,
    theme:     s.theme,
    date:      s.event_date,
    weekday:   s.event_weekday,
    time:      s.event_time,
    platforms: s.platforms,
    photo:     s.image_url ?? "",
  }).toString();
}

function bannerWebUrl(s: Omit<HeroSlide, "id">) {
  return `/api/banner-web?${bannerParams(s)}`;
}

function toLecture(slide: Omit<HeroSlide, "id"> & { id?: string }): Lecture {
  const platform = ["YouTube", "Facebook", "Ambos"].includes(slide.platforms)
    ? slide.platforms
    : "YouTube";

  return {
    id: slide.id ?? "preview",
    speakerName: slide.speaker_name,
    speakerImage: slide.image_url ?? "",
    theme: slide.theme,
    date: slide.event_date,
    weekday: slide.event_weekday,
    time: slide.event_time,
    platforms: platform as Lecture["platforms"],
  };
}

function hasLecturePreview(slide: Omit<HeroSlide, "id">) {
  return Boolean(
    slide.speaker_name.trim() ||
      slide.theme.trim() ||
      slide.event_date.trim() ||
      slide.event_weekday.trim() ||
      slide.event_time.trim()
  );
}

// ─── Hero Slides Manager ──────────────────────────────────────────────────────
function HeroSlidesManager() {
  const [slides,     setSlides]     = useState<HeroSlide[]>([]);
  const [form,       setForm]       = useState({ ...EMPTY });
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [uploading,        setUploading]        = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [generatingBanner, setGeneratingBanner] = useState(false);
  const [message,          setMessage]          = useState<{ text: string; ok: boolean } | null>(null);
  const [previewWeb,       setPreviewWeb]       = useState<string | null>(null);
  const [previewLecture,   setPreviewLecture]   = useState<Lecture | null>(null);
  const [downloading,      setDownloading]      = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("hero_slides")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setSlides(data as HeroSlide[]); });
  }, []);

  async function uploadPhoto(file: File): Promise<string | null> {
    setUploading(true);
    const supabase = createSupabaseBrowserClient();
    const ext  = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("speaker-photos")
      .upload(path, file, { upsert: true });

    setUploading(false);

    if (error) {
      setMessage({ text: `Erro ao enviar foto: ${error.message}`, ok: false });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("speaker-photos")
      .getPublicUrl(path);

    return publicUrl;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const required: (keyof typeof form)[] = ["speaker_name", "theme", "event_date", "event_weekday", "event_time"];
    const missing = required.find((k) => !String(form[k] ?? "").trim());
    if (missing) {
      setMessage({ text: "Preencha todos os campos obrigatórios.", ok: false });
      return;
    }

    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const payload: HeroSlide = {
      ...form,
      label: form.speaker_name,
      title: form.speaker_name,
      meta:  form.theme,
      id: editingId ?? crypto.randomUUID(),
    };

    const { error } = await supabase.from("hero_slides").upsert(payload);
    setSaving(false);

    if (error) {
      setMessage({ text: `Erro ao salvar: ${error.message}`, ok: false });
      return;
    }

    // Gera e sobe o banner compartilhavel.
    setGeneratingBanner(true);
    setPreviewWeb(null);
    const generatedBannerUrl = await uploadBannerToStorage(payload.id, bannerWebUrl(form));
    setGeneratingBanner(false);

    const webPreviewUrl = generatedBannerUrl ?? bannerWebUrl(form);
    const bannerUpdates: Partial<HeroSlide> = {
      banner_web_url: webPreviewUrl,
      banner_url: webPreviewUrl,
    };
    payload.banner_web_url = webPreviewUrl;
    payload.banner_url = webPreviewUrl;
    const { error: bannerUpdateError } = await supabase.from("hero_slides").update(bannerUpdates).eq("id", payload.id);

    setPreviewWeb(webPreviewUrl);
    setPreviewLecture(toLecture(payload));

    setSlides((prev) => [payload, ...prev.filter((s) => s.id !== payload.id)]);
    setMessage(
      bannerUpdateError
        ? { text: `Palestra salva, mas a URL do banner não foi gravada: ${bannerUpdateError.message}`, ok: false }
        : { text: "Salvo com sucesso! Banner gerado →", ok: true }
    );
    setEditingId(null);
    setForm({ ...EMPTY });
  }

  async function uploadBannerToStorage(slideId: string, apiUrl: string, suffix = ""): Promise<string | null> {
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) return null;
      const blob      = await res.blob();
      const path      = `${slideId}${suffix}.png`;
      const supabase  = createSupabaseBrowserClient();
      const { error } = await supabase.storage
        .from("banners")
        .upload(path, blob, { contentType: "image/png", upsert: true });
      if (error) return null;
      const { data: { publicUrl } } = supabase.storage.from("banners").getPublicUrl(path);
      return publicUrl;
    } catch {
      return null;
    }
  }

  async function remove(slide: HeroSlide) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("hero_slides").delete().eq("id", slide.id);
    setSlides((prev) => prev.filter((s) => s.id !== slide.id));
  }

  function edit(slide: HeroSlide) {
    setEditingId(slide.id);
    setForm({
      speaker_name:  slide.speaker_name,
      theme:         slide.theme,
      event_date:    slide.event_date,
      event_weekday: slide.event_weekday,
      event_time:    slide.event_time,
      platforms:     slide.platforms,
      image_url:     slide.image_url,
      status:        slide.status,
    });
    setPreviewWeb(slide.banner_web_url ?? bannerWebUrl(slide));
    setPreviewLecture(toLecture(slide));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function downloadBanner() {
    const src      = previewWeb;
    const filename = "banner-palestra-1536x1024.png";
    if (!src) return;
    setDownloading(true);
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error("Falha ao carregar imagem");
      const blob      = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a         = document.createElement("a");
      a.href          = objectUrl;
      a.download      = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 200);
    } catch {
      setMessage({ text: "Erro ao baixar o banner. Tente novamente.", ok: false });
    } finally {
      setDownloading(false);
    }
  }

  const livePreviewLecture = hasLecturePreview(form)
    ? toLecture({ ...form, id: editingId ?? "preview" })
    : previewLecture;

  return (
    <>
    {/* ── Overlay de geração de banner ── */}
    {generatingBanner && (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-black/40 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-5 rounded-2xl bg-white px-10 py-8 shadow-2xl">
          {/* Spinner triplo */}
          <div className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inline-block h-20 w-20 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            <span className="absolute inline-block h-14 w-14 animate-spin rounded-full border-4 border-orange-100 border-t-orange-400" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
            <span className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-orange-400" />
          </div>

          {/* Textos */}
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">Gerando banner…</p>
            <p className="mt-1 text-sm text-gray-500">
              Aguarde enquanto o banner 1536×1024 é criado
            </p>
          </div>

          {/* Barra de progresso indeterminada */}
          <div className="h-1.5 w-64 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-orange-400"
              style={{ animation: "bannerProgress 1.4s ease-in-out infinite" }}
            />
          </div>
        </div>

        <style>{`
          @keyframes bannerProgress {
            0%   { transform: translateX(-100%) scaleX(1); }
            50%  { transform: translateX(150%) scaleX(1.4); }
            100% { transform: translateX(300%) scaleX(1); }
          }
        `}</style>
      </div>
    )}

    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(520px,0.9fr)]">

      {/* ── Coluna esquerda: formulário + lista ── */}
      <div className="space-y-6">

        {/* Formulário */}
        <form onSubmit={save} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-bold text-gray-900">
            {editingId ? "Editar Palestra" : "Nova Palestra em Destaque"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Nome do palestrante *
              <input
                type="text"
                value={form.speaker_name}
                onChange={(e) => setForm({ ...form, speaker_name: e.target.value })}
                className="rounded-xl border border-gray-200 px-4 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Tema da palestra *
              <input
                type="text"
                value={form.theme}
                onChange={(e) => setForm({ ...form, theme: e.target.value })}
                className="rounded-xl border border-gray-200 px-4 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Data (ex: 09/05/2026) *
              <input
                type="text"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="rounded-xl border border-gray-200 px-4 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Dia da semana (ex: Sábado) *
              <input
                type="text"
                value={form.event_weekday}
                onChange={(e) => setForm({ ...form, event_weekday: e.target.value })}
                className="rounded-xl border border-gray-200 px-4 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Horário (ex: 15h40) *
              <input
                type="text"
                value={form.event_time}
                onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                className="rounded-xl border border-gray-200 px-4 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Plataformas
              <select
                value={form.platforms}
                onChange={(e) => setForm({ ...form, platforms: e.target.value })}
                className="rounded-xl border border-gray-200 px-4 py-2.5 font-normal outline-none focus:border-primary"
              >
                <option value="YouTube">YouTube</option>
                <option value="Facebook">Facebook</option>
                <option value="Ambos">Ambos</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
              Status
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="rounded-xl border border-gray-200 px-4 py-2.5 font-normal outline-none focus:border-primary"
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </select>
            </label>

            {/* Upload de foto */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <p className="text-sm font-semibold text-gray-700">Foto do palestrante</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadPhoto(file);
                  if (url) setForm((f) => ({ ...f, image_url: url }));
                  e.target.value = "";
                }}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
                className="flex cursor-pointer items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 transition hover:border-primary hover:bg-orange-50"
              >
                {form.image_url ? (
                  <>
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-md"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700">Foto carregada</p>
                      <p className="text-xs text-gray-400">Clique para trocar</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setForm((f) => ({ ...f, image_url: null })); }}
                      className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-300" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-600">
                        {uploading ? "Enviando…" : "Clique para selecionar a foto"}
                      </p>
                      <p className="text-xs text-gray-400">JPG, PNG ou WEBP · 400×400px recomendado</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {message && (
            <p className={`mt-4 rounded-xl p-3 text-sm ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
              {message.text}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || uploading || generatingBanner}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {saving ? "Salvando…" : generatingBanner ? "Gerando banner…" : "Salvar e gerar banner"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setForm({ ...EMPTY }); setMessage(null); }}
                className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Preview mobile: antes da lista de palestras */}
        <div className="xl:hidden">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-bold text-gray-900">Preview do Banner</h3>
            <p className="mb-4 text-xs font-semibold text-gray-500">Banner gerado: 1536Ã—1024</p>

            {generatingBanner ? (
              <div className="animate-pulse space-y-3">
                <div className="flex items-center justify-center gap-2 rounded-xl bg-violet-50 py-3 text-sm font-semibold text-violet-500">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                  Gerando bannerâ€¦
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
                  <div className="aspect-[4/5] w-full rounded-xl bg-gradient-to-br from-violet-100 via-gray-100 to-orange-50" />
                </div>
                <div className="space-y-2 px-1">
                  <div className="h-3 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ) : livePreviewLecture ? (
              <>
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 [&>section]:min-h-[360px] [&>section]:shadow-none [&>section]:ring-0 sm:[&>section]:h-[420px]">
                  <LectureBanner lecture={livePreviewLecture} />
                </div>
                {previewWeb ? (
                  <button
                    type="button"
                    onClick={downloadBanner}
                    disabled={downloading}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    {downloading ? "Baixando..." : "Baixar Banner Site"}
                  </button>
                ) : null}
              </>
            ) : (
              <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-100 bg-gray-50">
                <ImageDown className="h-10 w-10 text-gray-200" />
                <p className="max-w-[180px] text-center text-sm text-gray-400">
                  Preencha o formulÃ¡rio e clique em <strong>Salvar</strong> para gerar o banner
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Lista de palestras cadastradas */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="font-bold text-gray-900">Palestras cadastradas</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {slides.length === 0 ? (
              <p className="p-6 text-sm text-gray-400">Nenhuma palestra cadastrada ainda.</p>
            ) : (
              slides.map((slide) => (
                <div key={slide.id} className="flex items-center gap-4 px-6 py-4">
                  {slide.image_url ? (
                    <img src={slide.image_url} className="h-12 w-12 shrink-0 rounded-full border-2 border-white object-cover shadow" alt="" />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xl">👤</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{slide.speaker_name}</p>
                    <p className="truncate text-xs text-gray-500">{slide.theme}</p>
                    <p className="text-xs text-gray-400">{slide.event_date} · {slide.event_time}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[slide.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {slide.status === "published" ? "Publicado" : "Rascunho"}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      title="Editar"
                      onClick={() => edit(slide)}
                      className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:bg-orange-50 hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Excluir"
                      onClick={() => remove(slide)}
                      className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Coluna direita: banner preview ── */}
      <div className="hidden h-fit xl:sticky xl:top-6 xl:block">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-bold text-gray-900">Preview do Banner</h3>
          <p className="mb-4 text-xs font-semibold text-gray-500">Banner gerado: 1536×1024</p>

          {generatingBanner ? (
            /* ── Skeleton de loading ── */
            <div className="animate-pulse space-y-3">
              <div className="flex items-center justify-center gap-2 rounded-xl bg-violet-50 py-3 text-sm font-semibold text-violet-500">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
                Gerando banner…
              </div>
              {/* Skeleton do banner */}
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
                <div className="aspect-[4/5] w-full rounded-xl bg-gradient-to-br from-violet-100 via-gray-100 to-orange-50" />
              </div>
              {/* Skeleton das mensagens */}
              <div className="space-y-2 px-1">
                <div className="h-3 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
          ) : livePreviewLecture ? (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 [&>section]:min-h-[360px] [&>section]:shadow-none [&>section]:ring-0 sm:[&>section]:h-[420px] xl:[&>section]:h-[460px]">
                <LectureBanner lecture={livePreviewLecture} />
              </div>
              {previewWeb ? (
                <button
                  type="button"
                  onClick={downloadBanner}
                  disabled={downloading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  {downloading ? "Baixando..." : "Baixar Banner Site"}
                </button>
              ) : null}
            </>
          ) : (
            <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-100 bg-gray-50">
              <ImageDown className="h-10 w-10 text-gray-200" />
              <p className="max-w-[180px] text-center text-sm text-gray-400">
                Preencha o formulário e clique em <strong>Salvar</strong> para gerar o banner
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

// ─── Tab controller ───────────────────────────────────────────────────────────
const TABS = [
  { key: "palestras",    label: "Palestras em destaque" },
  { key: "atendimento",  label: "Atendimento Fraterno" },
  { key: "programacao",  label: "Programação da Semana" },
];

export function PalestrasManager() {
  const [activeTab, setActiveTab] = useState("palestras");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              key === activeTab
                ? "bg-primary text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-orange-50 hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "palestras"   && <HeroSlidesManager />}
      {activeTab === "atendimento" && <SiteConfigPanel sectionKeys={["fraternal_care"]} />}
      {activeTab === "programacao" && <SiteConfigPanel sectionKeys={["weekly_schedule"]} />}
    </div>
  );
}
