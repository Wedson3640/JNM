import { localPlatformFallback } from "@/lib/social/fallback";
import type { SocialVideo } from "@/types/social-video";

type FacebookVideo = {
  id?: string;
  title?: string;
  description?: string;
  created_time?: string;
  permalink_url?: string;
  length?: number;
  thumbnails?: {
    data?: Array<{
      uri?: string;
      is_preferred?: boolean;
    }>;
  };
};

function formatSeconds(value?: number) {
  if (!value || Number.isNaN(value)) {
    return undefined;
  }

  const totalSeconds = Math.round(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function pickThumbnail(video: FacebookVideo) {
  const thumbnails = video.thumbnails?.data ?? [];
  return thumbnails.find((item) => item.is_preferred)?.uri ?? thumbnails[0]?.uri ?? localPlatformFallback.facebook;
}

export async function getLatestFacebookVideos(limit = 2): Promise<SocialVideo[]> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    return [];
  }

  const url = new URL(`https://graph.facebook.com/v20.0/${pageId}/videos`);
  url.searchParams.set("fields", "id,title,description,created_time,permalink_url,length,thumbnails");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, { next: { revalidate: 1800 } });
  if (!response.ok) {
    throw new Error(`Facebook Graph API failed: ${response.status}`);
  }

  const json = (await response.json()) as { data?: FacebookVideo[] };

  return (json.data ?? []).slice(0, limit).map((video) => ({
    id: video.id ?? crypto.randomUUID(),
    platform: "facebook",
    title: video.title || video.description?.slice(0, 90) || "Vídeo no Facebook",
    thumbnail: pickThumbnail(video),
    url: video.permalink_url || "https://www.facebook.com/watch/",
    publishedAt: video.created_time,
    duration: formatSeconds(video.length)
  }));
}
