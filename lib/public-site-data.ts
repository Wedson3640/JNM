import { createClient } from "@supabase/supabase-js";
import {
  areas,
  fraternalCare,
  heroSlides,
  partners,
  studyGroups,
  weeklySchedule
} from "@/lib/content";
import type { PublicSiteData } from "@/types/site";

const fallbackEvents = [
  {
    title: "Feira do Livro",
    dateLabel: "De 24 a 26 de Maio",
    description: "Venha conhecer, aprender e se inspirar."
  },
  {
    title: "Lavagem dos potes",
    dateLabel: "02 JUN",
    description: "Venha participar desta corrente do bem!"
  },
  {
    title: "Fabricação da pomada Vovô Pedro",
    dateLabel: "03 SET",
    description: "Tradição, cuidado e amor ao próximo."
  }
];

export async function getPublicSiteData(): Promise<PublicSiteData> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const fallback: PublicSiteData = {
    heroSlides,
    fraternalCare: fraternalCare as PublicSiteData["fraternalCare"],
    weeklySchedule: weeklySchedule as PublicSiteData["weeklySchedule"],
    events: fallbackEvents,
    studyGroups: studyGroups.map(([title, schedule, room]) => ({ title: String(title), schedule: String(schedule), room: String(room) })),
    partners: partners as PublicSiteData["partners"],
    houseAreas: areas.map((area) => ({ title: area.title, description: area.description }))
  };

  if (!supabaseUrl || !supabaseAnonKey) {
    return fallback;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });

  const [
    heroResult,
    fraternalResult,
    scheduleResult,
    eventResult,
    studyResult,
    partnerResult,
    areaResult
  ] = await Promise.all([
    supabase.from("hero_slides").select("*").eq("status", "published").order("created_at", { ascending: false }),
    supabase.from("fraternal_services").select("*").eq("status", "published").order("created_at", { ascending: true }),
    supabase.from("weekly_schedule").select("*").eq("status", "published").order("created_at", { ascending: true }),
    supabase.from("events").select("*").eq("status", "published").order("created_at", { ascending: false }),
    supabase.from("study_groups").select("*").eq("status", "published").order("created_at", { ascending: true }),
    supabase.from("partners").select("*").eq("status", "published").order("created_at", { ascending: true }),
    supabase.from("house_areas").select("*").eq("status", "published").order("created_at", { ascending: true })
  ]);

  return {
    heroSlides: heroResult.data?.length
      ? heroResult.data.slice(0, 2).map((row) => ({
          speakerName: row.speaker_name,
          theme: row.theme,
          eventDate: row.event_date,
          eventWeekday: row.event_weekday,
          eventTime: row.event_time,
          platforms: row.platforms as "YouTube" | "Facebook" | "Ambos",
          image: row.image_url
        }))
      : fallback.heroSlides,
    fraternalCare: fraternalResult.data?.length
      ? fraternalResult.data.map((row) => [row.title, row.days, row.time] as [string, string, string])
      : fallback.fraternalCare,
    weeklySchedule: scheduleResult.data?.length
      ? scheduleResult.data.map((row) => [row.weekday, row.time, row.title] as [string, string, string])
      : fallback.weeklySchedule,
    events: eventResult.data?.length
      ? eventResult.data.map((row) => ({
          title: row.title,
          dateLabel: row.date_label,
          description: row.description,
          imageUrl: row.image_url
        }))
      : fallback.events,
    studyGroups: studyResult.data?.length
      ? studyResult.data.map((row) => ({
          title: row.title,
          schedule: row.schedule,
          room: row.room,
          imageUrl: row.image_url
        }))
      : fallback.studyGroups,
    partners: partnerResult.data?.length
      ? partnerResult.data.map((row) => [row.state, row.city, row.name, row.phone] as [string, string, string, string])
      : fallback.partners,
    houseAreas: areaResult.data?.length
      ? areaResult.data.map((row) => ({
          title: row.title,
          description: row.description,
          icon: row.icon
        }))
      : fallback.houseAreas
  };
}
