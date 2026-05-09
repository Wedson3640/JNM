"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import type { HeroSlide } from "@/types/site";

function PlatformBadges({ platforms }: { platforms: HeroSlide["platforms"] }) {
  const showFb = platforms === "Facebook" || platforms === "Ambos";
  const showYt = platforms === "YouTube" || platforms === "Ambos";

  return (
    <div className="flex items-center gap-2">
      {showFb && (
        <span className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow">
          <svg viewBox="0 0 24 24" className="h-3 w-3 fill-white" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Live
        </span>
      )}
      {showFb && showYt && <span className="font-light text-violet-400">|</span>}
      {showYt && (
        <span className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow">
          <svg viewBox="0 0 24 24" className="h-3 w-3 fill-white" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          YouTube
        </span>
      )}
    </div>
  );
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const capped = slides.slice(0, 2);
  const [active, setActive] = useState(0);
  const slide = capped[active];

  const move = useCallback(
    (direction: number) => {
      setActive((current) => (current + direction + capped.length) % capped.length);
    },
    [capped.length]
  );

  useEffect(() => {
    const interval = window.setInterval(() => move(1), 7000);
    return () => window.clearInterval(interval);
  }, [move]);

  return (
    <section
      id="inicio"
      className="relative overflow-hidden rounded-2xl shadow-md ring-1 ring-violet-200"
      aria-label="Palestras em destaque"
    >
      {/* Layout fixo — apenas os dados mudam a cada slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.speakerName}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="bg-gradient-to-br from-violet-200 via-violet-50 to-orange-50"
        >
          {/* Dots decorativos (fixos no template) */}
          <div className="absolute left-4 top-4 grid grid-cols-4 gap-[7px] opacity-20" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-2 w-2 rounded-full bg-violet-700" />
            ))}
          </div>

          {/* Conteúdo principal */}
          <div className="flex items-center gap-6 px-8 py-8 sm:px-12 sm:py-10">

            {/* Foto circular do palestrante */}
            <div className="relative hidden shrink-0 items-center justify-center sm:flex">
              <div className="absolute h-56 w-56 rounded-full bg-violet-400/40 blur-3xl" />
              {slide.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={slide.image}
                  alt={slide.speakerName}
                  className="relative h-52 w-52 rounded-full border-[6px] border-white object-cover object-top shadow-2xl"
                />
              ) : (
                <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-[6px] border-white bg-violet-100 text-6xl shadow-2xl">
                  👤
                </div>
              )}
            </div>

            {/* Informações sobrepostas */}
            <div className="flex min-w-0 flex-1 flex-col gap-3">

              <PlatformBadges platforms={slide.platforms} />

              {/* Separador PALESTRANTE */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-violet-300" />
                <span className="text-[10px] font-bold tracking-[0.28em] text-violet-700">PALESTRANTE</span>
                <div className="h-px flex-1 bg-violet-300" />
              </div>

              <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-[2rem]">
                {slide.speakerName}
              </h1>

              <div className="border-l-4 border-violet-400 pl-3">
                <p className="text-[10px] font-bold tracking-[0.22em] text-violet-700">TEMA</p>
                <p className="mt-0.5 text-sm font-semibold leading-snug text-gray-800">{slide.theme}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-xl border border-violet-100 bg-white/75 px-3 py-1.5 text-xs font-semibold text-gray-700 backdrop-blur-sm">
                  <Calendar className="h-3.5 w-3.5 text-violet-500" />
                  {slide.eventDate} · {slide.eventWeekday}
                </span>
                <span className="flex items-center gap-1.5 rounded-xl border border-violet-100 bg-white/75 px-3 py-1.5 text-xs font-semibold text-gray-700 backdrop-blur-sm">
                  <Clock className="h-3.5 w-3.5 text-violet-500" />
                  {slide.eventTime}
                </span>
              </div>
            </div>
          </div>

          {/* Rodapé com grande arco decorativo */}
          <div className="relative overflow-hidden border-t border-violet-100 px-8 py-4 sm:px-12">
            {/* Grande círculo de fundo que sobe para o banner */}
            <div
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-white/80"
              style={{ width: "900px", height: "900px", bottom: "-830px" }}
              aria-hidden="true"
            />
            {/* Logos soltas sobre o círculo — JNM à esquerda, UEPI à direita */}
            <div className="relative z-10 flex w-full items-center justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo%20JNM%20horizontal.png"
                alt="Sociedade Espírita João Nunes Maia"
                style={{ height: "52px" }}
                className="object-contain"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/UEPI.png"
                alt="UEPI - União Espírita Paraibana"
                style={{ height: "52px" }}
                className="object-contain"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Setas de navegação */}
      {capped.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Slide anterior"
            onClick={() => move(-1)}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-violet-200 bg-white/80 p-2.5 text-violet-700 shadow backdrop-blur hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Próximo slide"
            onClick={() => move(1)}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-violet-200 bg-white/80 p-2.5 text-violet-700 shadow backdrop-blur hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Indicadores de posição */}
      {capped.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {capped.map((item, index) => (
            <button
              key={item.speakerName}
              type="button"
              aria-label={`Slide ${index + 1}`}
              onClick={() => setActive(index)}
              className={`h-2 rounded-full border border-violet-300 transition-all ${
                index === active ? "w-6 bg-violet-500" : "w-2 bg-violet-200 hover:bg-violet-300"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
