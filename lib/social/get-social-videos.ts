import { createClient } from "@supabase/supabase-js";
import { getLatestFacebookVideos } from "@/lib/social/facebook";
import { fallbackSocialVideos, fallbackVideosFor } from "@/lib/social/fallback";
import { getLatestInstagramVideos } from "@/lib/social/instagram";
import { getLatestYouTubeVideos } from "@/lib/social/youtube";
import type { SocialPlatform, SocialVideo, SocialVideosResponse } from "@/types/social-video";

const fetchers: Record<SocialPlatform, (limit: number) => Promise<SocialVideo[]>> = {
  youtube: getLatestYouTubeVideos,
  facebook: getLatestFacebookVideos,
  instagram: getLatestInstagramVideos
};

const platformMap: Record<string, SocialPlatform> = {
  YouTube: "youtube",
  Facebook: "facebook",
  Instagram: "instagram",
};

async function getMediaItemsFallback(limit: number): Promise<SocialVideosResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const empty: SocialVideosResponse = { youtube: [], facebook: [], instagram: [] };
  if (!url || !key) return empty;

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase
    .from("media_items")
    .select("id,title,platform,image_url,video_url,duration")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (!data?.length) return empty;

  const grouped: SocialVideosResponse = { youtube: [], facebook: [], instagram: [] };
  for (const row of data) {
    const platform = platformMap[row.platform as string];
    if (!platform) continue;
    if (grouped[platform].length < limit) {
      grouped[platform].push({
        id: row.id as string,
        platform,
        title: row.title as string,
        thumbnail: (row.image_url as string) || "",
        url: (row.video_url as string) || "#videos",
        duration: row.duration as string | undefined,
      });
    }
  }
  return grouped;
}

export async function getSocialVideos(limit = 2): Promise<SocialVideosResponse> {
  const platforms: SocialPlatform[] = ["youtube", "facebook", "instagram"];
  const [settled, dbFallback] = await Promise.all([
    Promise.allSettled(platforms.map((platform) => fetchers[platform](limit))),
    getMediaItemsFallback(limit),
  ]);
  const staticFallback = fallbackSocialVideos(limit);

  return platforms.reduce<SocialVideosResponse>((acc, platform, index) => {
    const result = settled[index];

    if (result.status === "fulfilled" && result.value.length > 0) {
      acc[platform] = result.value.slice(0, limit);
    } else if (dbFallback[platform].length > 0) {
      acc[platform] = dbFallback[platform];
    } else {
      acc[platform] = staticFallback[platform].length ? staticFallback[platform] : fallbackVideosFor(platform, limit);
    }

    return acc;
  }, staticFallback);
}
