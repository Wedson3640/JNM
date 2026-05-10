import { SiteConfigPanel } from "@/components/admin/site-config-panel";

export const metadata = { title: "Admin — Creche Miranez" };

const KEYS = ["areas"];

export default function CrechePage() {
  return <SiteConfigPanel sectionKeys={KEYS} />;
}
