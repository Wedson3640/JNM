export function ThemeCard({ theme }: { theme: string }) {
  return (
    <div className="relative max-w-[19rem] pl-5 sm:max-w-[21rem] lg:max-w-[23rem]">
      {/* Barra lateral gradiente */}
      <div className="absolute left-0 top-0 h-full w-[3px] rounded-full bg-gradient-to-b from-violet-400 via-fuchsia-400 to-orange-400" />

      <p className="mb-1 text-base font-bold uppercase tracking-[0.28em] text-violet-600">
        Tema
      </p>
      <p className="break-words text-[20px] font-semibold leading-tight text-gray-800">
        {theme}
      </p>
    </div>
  );
}
