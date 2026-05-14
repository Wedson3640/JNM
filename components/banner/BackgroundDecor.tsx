"use client";

import { motion } from "framer-motion";

export function BackgroundDecor() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 22% 44%, rgba(196, 181, 253, 0.44) 0 18%, rgba(221, 214, 254, 0.24) 31%, transparent 48%), linear-gradient(112deg, #ead9ff 0%, #fffaf4 43%, #fff3e8 100%)"
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

      <svg
        viewBox="0 0 900 560"
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M382 -110 C315 30 292 145 310 265 C329 391 415 482 545 594"
          fill="none"
          stroke="rgba(255,255,255,.92)"
          strokeWidth="5"
        />
        <path
          d="M820 -60 C760 30 738 118 758 214 C778 308 842 392 946 466"
          fill="none"
          stroke="rgba(255,255,255,.42)"
          strokeWidth="5"
        />
        <path
          d="M774 92 C838 178 872 292 878 440"
          fill="none"
          stroke="rgba(168,85,247,.075)"
          strokeWidth="46"
          strokeLinecap="round"
        />
        <path
          d="M802 222 C858 286 890 360 904 450"
          fill="none"
          stroke="rgba(249,115,22,.08)"
          strokeWidth="24"
          strokeLinecap="round"
        />
      </svg>

      <div
        className="absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-violet-600/35 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-orange-200/45 blur-3xl"
        aria-hidden="true"
      />
    </>
  );
}
