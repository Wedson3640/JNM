"use client";

import { useState } from "react";
import { BookOpen, CalendarDays, X } from "lucide-react";
import type { EventItem } from "@/types/site";

export function FeaturedEventCard({ event }: { event: EventItem | undefined }) {
  const [open, setOpen] = useState(false);

  const title       = event?.title       ?? "Feira do Livro";
  const dateLabel   = event?.dateLabel   ?? "De 24 a 26 de Maio";
  const description = event?.description ?? "Venha conhecer, aprender e se inspirar.";
  const imageUrl    = event?.imageUrl;

  return (
    <>
      {/* Card */}
      <article className="mb-4 overflow-hidden rounded-2xl shadow-md">
        {/* Imagem clicável */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative block h-44 w-full overflow-hidden focus:outline-none"
          aria-label={`Ver detalhes: ${title}`}
        >
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-orange-400 via-amber-300 to-violet-500">
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-14 w-14 text-white/80" />
              </div>
            </div>
          )}
          {/* Overlay de "ver mais" ao hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
            <span className="scale-90 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-gray-800 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
              Ver detalhes
            </span>
          </div>
        </button>

        {/* Texto abaixo da imagem */}
        <div className="bg-secondary/40 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{dateLabel}</p>
          <h3 className="mt-0.5 text-sm font-extrabold uppercase leading-snug text-gray-900">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-gray-600">{description}</p>
        </div>
      </article>

      {/* Modal / PopUp */}
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagem do modal */}
            <div className="relative h-56 w-full overflow-hidden">
              {imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={imageUrl}
                  alt={title}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-orange-400 via-amber-300 to-violet-500 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-white/80" />
                </div>
              )}
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-6">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{dateLabel}</p>
              </div>
              <h2 className="mt-2 text-xl font-extrabold uppercase leading-tight text-gray-900">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{description}</p>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-5 w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
