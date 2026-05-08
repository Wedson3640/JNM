export type SiteSectionKey =
  | "hero_slides"
  | "fraternal_care"
  | "weekly_schedule"
  | "news"
  | "media_items"
  | "events"
  | "study_groups"
  | "partners"
  | "areas";

export type AdminSection = {
  key: SiteSectionKey;
  title: string;
  description: string;
  table: string;
  fields: Array<{
    name: string;
    label: string;
    type: "text" | "textarea" | "url" | "select";
    options?: string[];
    required?: boolean;
  }>;
};
