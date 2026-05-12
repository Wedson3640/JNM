import { Facebook, Instagram, Play, Youtube } from "lucide-react";
import { Card } from "@/components/ui";
import type { SocialPlatform, SocialVideo, SocialVideosResponse } from "@/types/social-video";

const platformContent: Record<
  SocialPlatform,
  {
    title: string;
    action: string;
    href: string;
    icon: typeof Youtube;
    tone: string;
  }
> = {
  youtube: {
    title: "Vídeos no YouTube",
    action: "Ver canal",
    href: "https://www.youtube.com/@sociedadeespiritajoaonunes1414",
    icon: Youtube,
    tone: "bg-red-600 text-white"
  },
  facebook: {
    title: "Vídeos no Facebook",
    action: "Ver página",
    href: "https://www.facebook.com/p/Sociedade-Esp%C3%ADrita-Jo%C3%A3o-Nunes-Maia-100064637804418",
    icon: Facebook,
    tone: "bg-blue-600 text-white"
  },
  instagram: {
    title: "Vídeos no Instagram",
    action: "Ver perfil",
    href: "https://www.instagram.com/joaonunesmaiateresina/",
    icon: Instagram,
    tone: "bg-gradient-to-br from-fuchsia-600 via-pink-500 to-orange-400 text-white"
  }
};

const platformOrder: SocialPlatform[] = ["youtube", "facebook", "instagram"];

function formatDate(value?: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function VideoItemCard({ video }: { video: SocialVideo }) {
  return (
    <article>
      <a
        href={video.url}
        target="_blank"
        rel="noreferrer"
        className="group block transition duration-300 ease-in-out hover:scale-[1.02]"
        aria-label={`Abrir vídeo: ${video.title}`}
      >
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-900 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/65 via-gray-950/10 to-transparent" />
          <div className="absolute inset-0 grid place-items-center transition duration-300 group-hover:bg-gray-950/10">
            <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-white bg-white/20 text-white shadow-md backdrop-blur transition duration-300 group-hover:scale-110">
              <Play className="h-7 w-7 fill-white" />
            </span>
          </div>
          {video.duration ? (
            <span className="absolute bottom-2 right-2 rounded-lg bg-gray-950 px-2 py-1 text-xs font-semibold text-white">
              {video.duration}
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 text-sm font-semibold leading-snug text-gray-950 group-hover:text-primary">
          {video.title}
        </h3>
        {video.publishedAt ? <p className="mt-1 text-xs font-medium text-gray-500">{formatDate(video.publishedAt)}</p> : null}
      </a>
    </article>
  );
}

export function SocialVideosSection({ videosByPlatform }: { videosByPlatform: SocialVideosResponse }) {
  return (
    <section id="videos" className="grid grid-cols-1 gap-5 md:grid-cols-6 xl:grid-cols-12">
      {platformOrder.map((platform) => {
        const config = platformContent[platform];
        const Icon = config.icon;
        const videos = videosByPlatform[platform] ?? [];

        return (
          <Card key={platform} className="p-5 md:col-span-6 xl:col-span-4">
            <div className="mb-5 flex min-h-10 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${config.tone}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="text-xl font-semibold uppercase leading-tight text-gray-950">{config.title}</h2>
              </div>
              <a
                href={config.href}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-sm font-semibold text-blue-700 transition duration-300 hover:text-primary"
              >
                {config.action}
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {videos.slice(0, 2).map((video) => (
                <VideoItemCard key={video.id} video={video} />
              ))}
            </div>
          </Card>
        );
      })}
    </section>
  );
}
