import { SiteConfigPanel } from "@/components/admin/site-config-panel";

export const metadata = { title: "Admin — Config. Palestra" };

const KEYS = ["hero_slides", "weekly_schedule", "fraternal_care"];

export default function PalestrasPage() {
  return <SiteConfigPanel sectionKeys={KEYS} />;
}
