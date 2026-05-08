"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/types/site";

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const slide = slides[active];

  const move = useCallback((direction: number) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      move(1);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [move]);

  return (
    <section
      id="inicio"
      className="relative min-h-[420px] overflow-hidden rounded-2xl border border-orange-200 bg-gray-950 shadow-md ring-1 ring-white/70"
      aria-label="Palestras em destaque"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.title}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="(min-width: 1024px) 760px, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/60 to-gray-950/10" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex min-h-[420px] max-w-xl flex-col justify-center px-7 py-10 text-white sm:px-10">
        <span className="mb-5 w-fit rounded-lg bg-primary px-4 py-2 text-sm font-semibold uppercase">
          {slide.label}
        </span>
        <h1 className="text-[40px] font-bold leading-tight">{slide.title}</h1>
        <p className="mt-5 text-sm font-medium text-orange-50">{slide.meta}</p>
        <a href="#videos" className="button-primary mt-8 w-fit">
          Assistir agora
        </a>
      </div>

      <button
        type="button"
        aria-label="Slide anterior"
        onClick={() => move(-1)}
        className="absolute left-4 top-1/2 z-20 rounded-full border border-orange-100 bg-white/95 p-3 text-primary shadow-md backdrop-blur hover:scale-105 hover:bg-orange-50"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        aria-label="Próximo slide"
        onClick={() => move(1)}
        className="absolute right-4 top-1/2 z-20 rounded-full border border-orange-100 bg-white/95 p-3 text-primary shadow-md backdrop-blur hover:scale-105 hover:bg-orange-50"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((item, index) => (
          <button
            key={item.title}
            type="button"
            aria-label={`Ir para slide ${index + 1}`}
            onClick={() => setActive(index)}
            className={`h-3 rounded-full border border-white/80 ${
              index === active ? "w-8 bg-primary" : "w-3 bg-white/90 hover:bg-orange-100"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
