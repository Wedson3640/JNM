import { createClient } from "@supabase/supabase-js";
import type { Lecture } from "@/types/lecture";
import { heroSlides } from "@/lib/content";

const fallbackLectures: Lecture[] = heroSlides.map((slide, index) => ({
  id: `fallback-${index}`,
  speakerName: slide.speakerName,
  speakerImage: slide.image,
  theme: slide.theme,
  date: slide.eventDate,
  weekday: slide.eventWeekday,
  time: slide.eventTime,
  platforms: slide.platforms,
}));

export async function getPublishedLectures(): Promise<Lecture[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return fallbackLectures;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data } = await supabase
    .from("hero_slides")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(2);

  if (!data?.length) return fallbackLectures;

  return data.map((row) => ({
    id: row.id,
    speakerName: row.speaker_name,
    speakerImage: row.image_url,
    theme: row.theme,
    date: row.event_date,
    weekday: row.event_weekday,
    time: row.event_time,
    platforms: row.platforms as "YouTube" | "Facebook" | "Ambos",
  }));
}
