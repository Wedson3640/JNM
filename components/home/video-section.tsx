import Image from "next/image";
import { Facebook, Instagram, Play, Youtube } from "lucide-react";
import { Card } from "@/components/ui";
import type { VideoItem } from "@/types/content";

const platformIcon = {
  YouTube: Youtube,
  Facebook: Facebook,
  Instagram: Instagram
};

const platformTone = {
  YouTube: "bg-red-600 text-white",
  Facebook: "bg-blue-600 text-white",
  Instagram: "bg-gradient-to-br from-fuchsia-600 via-pink-500 to-orange-400 text-white"
};

export function VideoSection({ videosByPlatform }: { videosByPlatform: Record<VideoItem["platform"], VideoItem[]> }) {
  return (
    <section id="videos" className="grid grid-cols-1 gap-5 md:grid-cols-6 xl:grid-cols-12">
      {Object.entries(videosByPlatform).map(([platform, items]) => {
        const Icon = platformIcon[platform as keyof typeof platformIcon];

        return (
          <Card key={platform} className="md:col-span-6 p-5 xl:col-span-4">
            <div className="mb-5 flex min-h-10 items-center gap-3">
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                  platformTone[platform as keyof typeof platformTone]
                }`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="text-xl font-semibold uppercase leading-tight text-gray-950">
                Vídeos no {platform}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((video) => (
                <article key={video.id ?? video.title}>
                  <a
                    href={video.videoUrl ?? "#videos"}
                    target={video.videoUrl ? "_blank" : undefined}
                    rel={video.videoUrl ? "noreferrer" : undefined}
                    className="group block"
                    aria-label={`Abrir vídeo: ${video.title}`}
                  >
                    <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-900 shadow-md">
                      <Image
                        src={video.image}
                        alt={video.title}
                        fill
                        sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/65 via-gray-950/10 to-transparent" />
                      <div className="absolute inset-0 grid place-items-center transition duration-300 group-hover:bg-gray-950/10">
                        <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-white bg-white/20 text-white shadow-md backdrop-blur transition duration-300 group-hover:scale-110">
                          <Play className="h-7 w-7 fill-white" />
                        </span>
                      </div>
                      <span className="absolute bottom-2 right-2 rounded-lg bg-gray-950 px-2 py-1 text-xs font-semibold text-white">
                        {video.duration}
                      </span>
                    </div>
                    <h3 className="mt-3 text-sm font-semibold leading-snug text-gray-950 group-hover:text-primary">
                      {video.title}
                    </h3>
                  </a>
                </article>
              ))}
            </div>
          </Card>
        );
      })}
    </section>
  );
}
