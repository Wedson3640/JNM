import type { SocialVideo } from "@/types/social-video";

type InstagramMedia = {
  id?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  caption?: string;
  timestamp?: string;
};

function titleFromCaption(caption?: string) {
  if (!caption) {
    return "Vídeo no Instagram";
  }

  return caption.replace(/\s+/g, " ").trim().slice(0, 90);
}

export async function getLatestInstagramVideos(limit = 2): Promise<SocialVideo[]> {
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accountId || !accessToken) {
    return [];
  }

  const url = new URL(`https://graph.facebook.com/v20.0/${accountId}/media`);
  url.searchParams.set("fields", "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp");
  url.searchParams.set("limit", String(Math.max(limit * 3, limit)));
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, { next: { revalidate: 1800 } });
  if (!response.ok) {
    throw new Error(`Instagram Graph API failed: ${response.status}`);
  }

  const json = (await response.json()) as { data?: InstagramMedia[] };

  return (json.data ?? [])
    .filter((media) => media.media_type === "VIDEO" || media.media_type === "REELS")
    .slice(0, limit)
    .map((media) => ({
      id: media.id ?? crypto.randomUUID(),
      platform: "instagram",
      title: titleFromCaption(media.caption),
      thumbnail: media.thumbnail_url || media.media_url || "/images/redes%20sociais%5D/icone_instagram.png",
      url: media.permalink || "https://www.instagram.com/",
      publishedAt: media.timestamp
    }));
}
