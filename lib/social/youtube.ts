import type { SocialVideo } from "@/types/social-video";

type YouTubePlaylistItem = {
  snippet?: {
    publishedAt?: string;
    title?: string;
    resourceId?: { videoId?: string };
    thumbnails?: Record<string, { url?: string }>;
  };
};

type YouTubeVideoDetails = {
  id?: string;
  contentDetails?: { duration?: string };
};

function pickThumbnail(thumbnails?: Record<string, { url?: string }>) {
  return thumbnails?.maxres?.url ?? thumbnails?.standard?.url ?? thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? "";
}

function formatYouTubeDuration(value?: string) {
  if (!value) {
    return undefined;
  }

  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    return undefined;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export async function getLatestYouTubeVideos(limit = 2): Promise<SocialVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const playlistId = process.env.YOUTUBE_UPLOADS_PLAYLIST_ID;

  if (!apiKey || !playlistId) {
    return [];
  }

  const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  playlistUrl.searchParams.set("part", "snippet");
  playlistUrl.searchParams.set("playlistId", playlistId);
  playlistUrl.searchParams.set("maxResults", String(limit));
  playlistUrl.searchParams.set("key", apiKey);

  const playlistResponse = await fetch(playlistUrl, { next: { revalidate: 1800 } });
  if (!playlistResponse.ok) {
    throw new Error(`YouTube API failed: ${playlistResponse.status}`);
  }

  const playlistJson = (await playlistResponse.json()) as { items?: YouTubePlaylistItem[] };
  const items = playlistJson.items ?? [];
  const ids = items.map((item) => item.snippet?.resourceId?.videoId).filter(Boolean) as string[];

  const durationById = new Map<string, string | undefined>();
  if (ids.length) {
    const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    detailsUrl.searchParams.set("part", "contentDetails");
    detailsUrl.searchParams.set("id", ids.join(","));
    detailsUrl.searchParams.set("key", apiKey);

    const detailsResponse = await fetch(detailsUrl, { next: { revalidate: 1800 } });
    if (detailsResponse.ok) {
      const detailsJson = (await detailsResponse.json()) as { items?: YouTubeVideoDetails[] };
      for (const detail of detailsJson.items ?? []) {
        if (detail.id) {
          durationById.set(detail.id, formatYouTubeDuration(detail.contentDetails?.duration));
        }
      }
    }
  }

  return items
    .map((item) => {
      const videoId = item.snippet?.resourceId?.videoId;
      if (!videoId) {
        return null;
      }

      return {
        id: videoId,
        platform: "youtube" as const,
        title: item.snippet?.title || "Vídeo no YouTube",
        thumbnail: pickThumbnail(item.snippet?.thumbnails),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        publishedAt: item.snippet?.publishedAt,
        duration: durationById.get(videoId)
      };
    })
    .filter(Boolean) as SocialVideo[];
}
