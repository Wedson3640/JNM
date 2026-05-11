export function ThemeCard({ theme }: { theme: string }) {
  return (
    <div className="relative pl-5">
      {/* Barra lateral gradiente */}
      <div className="absolute left-0 top-0 h-full w-[3px] rounded-full bg-gradient-to-b from-violet-400 via-fuchsia-400 to-orange-400" />

      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.28em] text-violet-600 sm:text-[10px]">
        Tema
      </p>
      <p className="text-sm font-semibold leading-snug text-gray-800 sm:text-[15px] lg:text-base">
        {theme}
      </p>
    </div>
  );
}
