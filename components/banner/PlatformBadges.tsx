import type { Lecture } from "@/types/lecture";

const FB_ICON  = "/images/redes%20sociais%5D/facebook.webp";
const YT_ICON  = "/images/redes%20sociais%5D/youtube.webp";

export function PlatformBadges({ platforms }: { platforms: Lecture["platforms"] }) {
  const showFb = platforms === "Facebook" || platforms === "Ambos";
  const showYt = platforms === "YouTube"  || platforms === "Ambos";

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {showFb && (
        <span className="flex items-center gap-1.5 rounded-full bg-[#1877F2]/10 px-2.5 py-1 text-[11px] font-bold text-[#1877F2] ring-1 ring-[#1877F2]/25 sm:text-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FB_ICON} alt="" width={18} height={18} className="rounded-full object-contain" aria-hidden="true" />
          Facebook Live
        </span>
      )}

      {showFb && showYt && <span className="text-violet-300/70">·</span>}

      {showYt && (
        <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 ring-1 ring-red-200/60 sm:text-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={YT_ICON} alt="" width={20} height={14} className="object-contain" aria-hidden="true" />
          YouTube
        </span>
      )}
    </div>
  );
}
