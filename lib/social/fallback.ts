import { videos } from "@/lib/content";
import type { VideoItem } from "@/types/content";
import type { SocialPlatform, SocialVideo, SocialVideosResponse } from "@/types/social-video";

const platformMap: Record<VideoItem["platform"], SocialPlatform> = {
  YouTube: "youtube",
  Facebook: "facebook",
  Instagram: "instagram"
};

export const localPlatformFallback: Record<SocialPlatform, string> = {
  youtube: "/images/redes%20sociais%5D/youtube.webp",
  facebook: "/images/redes%20sociais%5D/facebook.webp",
  instagram: "/images/redes%20sociais%5D/icone_instagram.png"
};

export function fallbackVideosFor(platform: SocialPlatform, limit = 2): SocialVideo[] {
  const sourcePlatform = Object.entries(platformMap).find(([, value]) => value === platform)?.[0] as
    | VideoItem["platform"]
    | undefined;

  if (!sourcePlatform) {
    return [];
  }

  return videos[sourcePlatform].slice(0, limit).map((video, index) => ({
    id: `${platform}-fallback-${index}`,
    platform,
    title: video.title,
    thumbnail: video.image || localPlatformFallback[platform],
    url: video.videoUrl || "#videos",
    duration: video.duration || undefined
  }));
}

export function fallbackSocialVideos(limit = 2): SocialVideosResponse {
  return {
    youtube: fallbackVideosFor("youtube", limit),
    facebook: fallbackVideosFor("facebook", limit),
    instagram: fallbackVideosFor("instagram", limit)
  };
}
