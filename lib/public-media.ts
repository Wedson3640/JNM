import { createClient } from "@supabase/supabase-js";
import { videos } from "@/lib/content";
import type { VideoItem } from "@/types/content";

export async function getPublishedVideos(): Promise<Record<VideoItem["platform"], VideoItem[]>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return videos;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });

  const { data, error } = await supabase
    .from("media_items")
    .select("id,title,platform,image_url,duration,video_url,status")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return videos;
  }

  const grouped: Record<VideoItem["platform"], VideoItem[]> = {
    YouTube: [],
    Facebook: [],
    Instagram: []
  };

  for (const row of data) {
    if (row.platform === "YouTube" || row.platform === "Facebook" || row.platform === "Instagram") {
      const platform = row.platform as VideoItem["platform"];
      grouped[platform].push({
        id: row.id,
        title: row.title,
        platform,
        image: row.image_url,
        duration: row.duration,
        videoUrl: row.video_url,
        status: row.status
      });
    }
  }

  return {
    YouTube: grouped.YouTube.length ? grouped.YouTube.slice(0, 2) : videos.YouTube,
    Facebook: grouped.Facebook.length ? grouped.Facebook.slice(0, 2) : videos.Facebook,
    Instagram: grouped.Instagram.length ? grouped.Instagram.slice(0, 2) : videos.Instagram
  };
}
