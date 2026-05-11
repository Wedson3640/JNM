export function FooterWave() {
  return (
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-[130px] sm:h-[148px]">
      <svg
        viewBox="0 0 1280 150"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bannerFooterFill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#fff7ed" stopOpacity="0.96" />
            <stop offset="48%"  stopColor="#fffaf5" stopOpacity="0.93" />
            <stop offset="100%" stopColor="#f5edff" stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id="bannerFooterStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#f97316" />
            <stop offset="48%"  stopColor="#d946ef" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <path
          d="M0 150 C116 34 230 14 392 32 L1110 32 C1185 32 1238 60 1280 112 L1280 150 Z"
          fill="url(#bannerFooterFill)"
        />
        <path
          d="M0 150 C116 34 230 14 392 32 L1110 32 C1185 32 1238 60 1280 112"
          fill="none"
          stroke="url(#bannerFooterStroke)"
          strokeWidth="4"
        />
      </svg>

      {/* Logos — JNM +40%: h-11→h-[62px] sm:h-14→sm:h-[78px] | UEPI +40%: h-12→h-[67px] */}
      <div className="relative z-10 flex h-full items-end justify-center gap-5 px-8 pb-4 sm:gap-8 sm:pb-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo%20JNM%20horizontal.png"
          alt="Sociedade Espírita João Nunes Maia"
          className="h-[62px] max-w-[230px] object-contain sm:h-[78px] sm:max-w-[330px]"
        />
        <div className="mb-2 hidden h-14 w-px bg-violet-300/80 sm:block" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/UEPI.png"
          alt="UEPI"
          className="hidden h-[67px] max-w-[160px] object-contain sm:block"
        />
      </div>
    </div>
  );
}
