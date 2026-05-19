import type { VideoItem } from "@/types/content";

const FB_API = "https://graph.facebook.com/v19.0";

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function fetchFacebookVideos(): Promise<VideoItem[]> {
  const pageId    = process.env.FACEBOOK_PAGE_ID;
  const token     = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !token) return [];

  const fields = "id,title,description,picture,permalink_url,created_time,length";
  const url = `${FB_API}/${pageId}/videos?fields=${fields}&limit=2&access_token=${token}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      console.error("[Facebook Videos] HTTP", res.status, await res.text());
      return [];
    }

    const json = await res.json();

    if (json.error) {
      console.error("[Facebook Videos] API error:", json.error.message);
      return [];
    }

    const items: VideoItem[] = (json.data ?? []).map((v: {
      id: string;
      title?: string;
      description?: string;
      picture?: string;
      permalink_url?: string;
      length?: number;
    }) => ({
      id:       v.id,
      title:    v.title || v.description?.slice(0, 80) || "Vídeo",
      platform: "Facebook" as const,
      image:    v.picture ?? "",
      duration: formatDuration(v.length ?? 0),
      videoUrl: v.permalink_url ?? `https://www.facebook.com/watch/?v=${v.id}`,
      status:   "published" as const,
    }));

    return items;
  } catch (err) {
    console.error("[Facebook Videos] fetch error:", err);
    return [];
  }
}
