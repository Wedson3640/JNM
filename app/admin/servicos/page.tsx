import { SiteConfigPanel } from "@/components/admin/site-config-panel";

export const metadata = { title: "Admin — Serv. Sociais" };

const KEYS = ["news", "media_items", "events", "study_groups", "partners"];

export default function ServicosPage() {
  return <SiteConfigPanel sectionKeys={KEYS} />;
}
