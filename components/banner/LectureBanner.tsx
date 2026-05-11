"use client";

import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import type { Lecture } from "@/types/lecture";
import { BackgroundDecor } from "./BackgroundDecor";
import { LeafDecoration }  from "./LeafDecoration";
import { SpeakerPhoto }    from "./SpeakerPhoto";
import { PlatformBadges }  from "./PlatformBadges";
import { ThemeCard }       from "./ThemeCard";
import { FooterWave }      from "./FooterWave";
import { LiveBadge }       from "./LiveBadge";

export function LectureBanner({ lecture }: { lecture: Lecture }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative min-h-[380px] overflow-hidden rounded-2xl shadow-xl ring-1 ring-violet-200/50 sm:h-[480px] xl:h-[520px]"
      aria-label="Palestra em destaque"
    >
      <BackgroundDecor />
      <LeafDecoration />

      <div className="relative z-10 flex h-full items-stretch">
        <SpeakerPhoto lecture={lecture} />

        {/* ── Coluna de informações ── */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 px-5 pb-[134px] pt-5 sm:gap-3 sm:px-6 sm:pb-[152px] sm:pt-6 lg:px-8">

          {/* Mobile: badge ao vivo */}
          <div className="flex items-center gap-2 sm:hidden">
            <LiveBadge date={lecture.date} time={lecture.time} />
          </div>

          {/* Plataformas */}
          <PlatformBadges platforms={lecture.platforms} />

          {/* Divisor PALESTRANTE */}
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-violet-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.36em] text-violet-700 sm:text-xs">
              Palestrante
            </span>
            <div className="h-px flex-1 bg-violet-400/40" />
          </div>

          {/* Nome do palestrante */}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5, ease: "easeOut" }}
            className="text-[1.28rem] font-extrabold leading-[1.05] tracking-tight text-[#2a0d4f] sm:text-2xl lg:text-[1.68rem] xl:text-[1.92rem]"
          >
            {lecture.speakerName}
          </motion.h1>

          {/* Tema */}
          <ThemeCard theme={lecture.theme} />

          {/* Data e hora */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.45 }}
            className="flex flex-wrap gap-2"
          >
            <span className="flex items-center gap-1.5 rounded-full border border-violet-100/80 bg-white/65 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm sm:text-sm">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-violet-500" aria-hidden="true" />
              {lecture.date} · {lecture.weekday}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-violet-100/80 bg-white/65 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm sm:text-sm">
              <Clock className="h-3.5 w-3.5 shrink-0 text-violet-500" aria-hidden="true" />
              {lecture.time}
            </span>
          </motion.div>
        </div>
      </div>

      <FooterWave />
    </motion.section>
  );
}
