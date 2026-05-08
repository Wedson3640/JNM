import { createClient } from "@supabase/supabase-js";
import { initialNews } from "@/lib/content";
import type { NewsItem } from "@/types/content";

export async function getPublishedNews(): Promise<NewsItem[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return initialNews.filter((item) => item.status === "published");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });

  const { data, error } = await supabase
    .from("news")
    .select("id,title,subtitle,description,status,created_at,image_url,video_url")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data?.length) {
    return initialNews.filter((item) => item.status === "published");
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    imageUrl: row.image_url,
    videoUrl: row.video_url
  }));
}
