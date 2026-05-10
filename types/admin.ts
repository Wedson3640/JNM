export type SiteSectionKey =
  | "hero_slides"
  | "fraternal_care"
  | "weekly_schedule"
  | "news"
  | "media_items"
  | "events"
  | "study_groups"
  | "partners"
  | "areas"
  | "creche_maternal1"
  | "creche_maternal2"
  | "creche_pre1a"
  | "creche_pre1b"
  | "creche_pre2";

export type AdminSection = {
  key: SiteSectionKey;
  title: string;
  description: string;
  table: string;
  rowFilter?: Record<string, string>;
  fields: Array<{
    name: string;
    label: string;
    type: "text" | "textarea" | "url" | "select";
    options?: string[];
    required?: boolean;
  }>;
};
