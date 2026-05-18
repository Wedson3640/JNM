import { SiteConfigPanel } from "@/components/admin/site-config-panel";

export const metadata = { title: "Admin — Serv. Sociais" };

const KEYS = [
  "fraternal_care",
  "weekly_schedule",
  "news",
  "media_items",
  "events",
  "study_groups",
  "partners",
];

export default function ServicosPage() {
  return <SiteConfigPanel sectionKeys={KEYS} layout="tabs" />;
}
