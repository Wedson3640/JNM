"use client";

import { motion } from "framer-motion";
import type { Lecture } from "@/types/lecture";

export function SpeakerPhoto({ lecture }: { lecture: Lecture }) {
  return (
    // Container: 300→240 / 360→288 / 410→328
    <div className="relative hidden shrink-0 items-center justify-center sm:flex sm:w-[240px] lg:w-[288px] xl:w-[328px]">

      {/* Glow pulsante: 350→280 / 410→328 */}
      <motion.div
        animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.04, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-[280px] w-[280px] rounded-full bg-white/45 shadow-[0_0_48px_rgba(255,255,255,.85)] lg:h-[328px] lg:w-[328px]"
      />

      {/* Anel branco externo: 318→254 / 380→304 */}
      <div className="absolute h-[254px] w-[254px] rounded-full border-[5px] border-white shadow-[0_0_26px_rgba(255,255,255,.9)] lg:h-[304px] lg:w-[304px]" />

      {/* Anel violeta interno: 296→236 / 354→284 */}
      <div className="absolute h-[236px] w-[236px] rounded-full border-[3px] border-violet-400/75 lg:h-[284px] lg:w-[284px]" />

      {/* Foto: 282→226 / 340→272 — border 10→8 */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.34, 1.06, 0.64, 1] }}
        className="relative z-10"
      >
        {lecture.speakerImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={lecture.speakerImage}
            alt={lecture.speakerName}
            className="h-[226px] w-[226px] rounded-full border-[8px] border-white object-cover object-top lg:h-[272px] lg:w-[272px]"
            style={{ boxShadow: "0 32px 70px rgba(88,28,135,.26), 0 0 0 1px rgba(124,58,237,.22)" }}
          />
        ) : (
          <div className="grid h-[226px] w-[226px] place-items-center rounded-full border-[8px] border-white bg-violet-100 text-5xl lg:h-[272px] lg:w-[272px]">
            👤
          </div>
        )}
      </motion.div>

      {/* Sparkles decorativos reposicionados */}
      <span className="absolute bottom-[62px] left-[48px] h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_18px_6px_rgba(255,255,255,.9)]" />
      <span className="absolute left-[56px] top-[74px] h-2 w-2 rounded-full bg-white shadow-[0_0_14px_5px_rgba(255,255,255,.85)]" />
    </div>
  );
}
