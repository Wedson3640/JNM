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

export async function getSocialVideos(limit = 2): Promise<SocialVideosResponse> {
  const platforms: SocialPlatform[] = ["youtube", "facebook", "instagram"];
  const settled = await Promise.allSettled(platforms.map((platform) => fetchers[platform](limit)));
  const fallback = fallbackSocialVideos(limit);

  return platforms.reduce<SocialVideosResponse>((acc, platform, index) => {
    const result = settled[index];

    if (result.status === "fulfilled" && result.value.length > 0) {
      acc[platform] = result.value.slice(0, limit);
    } else {
      acc[platform] = fallback[platform].length ? fallback[platform] : fallbackVideosFor(platform, limit);
    }

    return acc;
  }, fallback);
}
