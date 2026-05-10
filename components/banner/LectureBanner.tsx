import { Calendar, Clock } from "lucide-react";
import type { Lecture } from "@/types/lecture";
import { LiveBadge } from "./LiveBadge";

interface Props {
  lecture: Lecture;
}

function PlatformBadges({ platforms }: { platforms: Lecture["platforms"] }) {
  const showFb = platforms === "Facebook" || platforms === "Ambos";
  const showYt = platforms === "YouTube" || platforms === "Ambos";

  return (
    <div className="flex items-center gap-3">
      {showFb && (
        <span className="flex items-center gap-2">
          {/* Facebook logo */}
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1877F2]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </span>
          <span className="text-sm font-extrabold text-[#1877F2]">LIVE</span>
        </span>
      )}
      {showFb && showYt && (
        <span className="text-lg font-light text-gray-300">|</span>
      )}
      {showYt && (
        <span className="flex items-center gap-2">
          {/* YouTube logo */}
          <span className="flex h-8 w-10 items-center justify-center rounded-md bg-[#FF0000]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </span>
          <span className="text-sm font-extrabold text-gray-800">YouTube</span>
        </span>
      )}
    </div>
  );
}

export function LectureBanner({ lecture }: Props) {
  return (
    <section className="relative h-[480px] overflow-hidden rounded-2xl shadow-md ring-1 ring-violet-200">

      {/* 1. BG gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-white to-orange-50" />

      {/* 2. Glow esquerdo */}
      <div className="absolute left-[-120px] top-[-120px] h-[500px] w-[500px] rounded-full bg-purple-300/30 blur-3xl" />

      {/* 3. Dots decorativos */}
      <div className="absolute left-5 top-5 grid grid-cols-4 gap-2 opacity-20" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="h-2.5 w-2.5 rounded-full bg-violet-700" />
        ))}
      </div>

      {/* 4. Arco inferior */}
      <div
        className="absolute bottom-[-220px] left-1/2 h-[500px] w-[140%] -translate-x-1/2 rounded-[100%] border-t-[6px] border-purple-300 bg-gradient-to-r from-orange-100 via-white to-purple-100 shadow-[0_-20px_60px_rgba(168,85,247,0.15)]"
        aria-hidden="true"
      />

      {/* 5. Conteúdo principal */}
      <div className="relative z-10 flex items-start gap-8 px-10 pb-24 pt-8 sm:px-14 sm:pt-10">

        {/* Coluna esquerda: badge ao vivo + foto */}
        <div className="hidden shrink-0 flex-col items-center gap-3 sm:flex">
          <LiveBadge date={lecture.date} time={lecture.time} />

          {/* Foto com dois arcos */}
          <div className="relative flex items-center justify-center">
            {/* Arco 1 — glow externo */}
            <div className="absolute h-[340px] w-[340px] rounded-full bg-violet-300/25 blur-3xl" />
            {/* Arco 2 — anel definido */}
            <div className="absolute h-[310px] w-[310px] rounded-full border-[3px] border-violet-300/70 bg-violet-100/20" />

            {lecture.speakerImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={lecture.speakerImage}
                alt={lecture.speakerName}
                className="relative h-[280px] w-[280px] rounded-full border-[8px] border-white object-cover object-top shadow-2xl"
              />
            ) : (
              <div className="relative flex h-[280px] w-[280px] items-center justify-center rounded-full border-[8px] border-white bg-violet-100 text-7xl shadow-2xl">
                👤
              </div>
            )}
          </div>
        </div>

        {/* Coluna direita: informações */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">

          <PlatformBadges platforms={lecture.platforms} />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-violet-300" />
            <span className="text-xs font-bold tracking-[0.28em] text-violet-700">PALESTRANTE</span>
            <div className="h-px flex-1 bg-violet-300" />
          </div>

          <h1 className="text-[1.9rem] font-extrabold leading-tight text-gray-900 sm:text-[2.7rem]">
            {lecture.speakerName}
          </h1>

          <div className="border-l-4 border-violet-400 pl-4">
            <p className="text-xs font-bold tracking-[0.22em] text-violet-700">TEMA</p>
            <p className="mt-1 text-base font-semibold leading-snug text-gray-800">{lecture.theme}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white/75 px-4 py-2 text-sm font-semibold text-gray-700 backdrop-blur-sm">
              <Calendar className="h-4 w-4 text-violet-500" />
              {lecture.date} · {lecture.weekday}
            </span>
            <span className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white/75 px-4 py-2 text-sm font-semibold text-gray-700 backdrop-blur-sm">
              <Clock className="h-4 w-4 text-violet-500" />
              {lecture.time}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Logos institucionais no rodapé */}
      <div className="absolute bottom-4 left-0 right-0 z-10 flex items-center justify-between px-10 sm:px-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo%20JNM%20horizontal.png"
          alt="Sociedade Espírita João Nunes Maia"
          style={{ height: "70px" }}
          className="object-contain"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/UEPI.png"
          alt="UEPI - União Espírita Paraibana"
          style={{ height: "70px" }}
          className="object-contain"
        />
      </div>

    </section>
  );
}
