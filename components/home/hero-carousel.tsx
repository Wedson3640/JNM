"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LectureBanner } from "@/components/banner/LectureBanner";
import type { Lecture } from "@/types/lecture";

export function HeroCarousel({ lectures }: { lectures: Lecture[] }) {
  const capped = lectures.slice(0, 2);
  const [active, setActive] = useState(0);
  const lecture = capped[active];

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
    <div id="inicio" className="relative h-full" aria-label="Palestras em destaque">
      <AnimatePresence mode="wait">
        <motion.div
          key={lecture.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="h-full"
        >
          <LectureBanner lecture={lecture} />
        </motion.div>
      </AnimatePresence>

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

      {capped.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {capped.map((item, index) => (
            <button
              key={item.id}
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
    </div>
  );
}
