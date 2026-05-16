"use client";

import { motion } from "framer-motion";

export function BackgroundDecor() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 22% 44%, rgba(196, 181, 253, 0.18) 0 18%, rgba(221, 214, 254, 0.12) 31%, transparent 48%), linear-gradient(112deg, #f8f3ff 0%, #fffdf9 43%, #fff8f1 100%)"
        }}
      />

      <div
        className="absolute left-5 top-5 grid grid-cols-6 gap-3 opacity-45"
        aria-hidden="true"
      >
        {Array.from({ length: 36 }).map((_, index) => (
          <span key={index} className="h-1.5 w-1.5 rounded-full bg-violet-500/50" />
        ))}
      </div>

      <motion.div
        animate={{ opacity: [0.42, 0.66, 0.42], scale: [1, 1.012, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-[112px] top-[70px] h-[360px] w-[360px] rounded-full border-[7px] border-white/80 shadow-[0_0_34px_rgba(255,255,255,0.75)] sm:h-[470px] sm:w-[470px] xl:-left-[74px] xl:top-[76px] xl:h-[500px] xl:w-[500px]"
        aria-hidden="true"
      />

      <div
        className="absolute -left-[92px] top-[88px] h-[330px] w-[330px] rounded-full border-[3px] border-violet-400/45 sm:h-[438px] sm:w-[438px] xl:-left-[52px] xl:top-[96px] xl:h-[462px] xl:w-[462px]"
        aria-hidden="true"
      />
    </>
  );
}
