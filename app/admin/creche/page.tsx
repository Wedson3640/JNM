import { SiteConfigPanel } from "@/components/admin/site-config-panel";

export const metadata = { title: "Admin — Creche Miranez" };

const KEYS = ["creche_maternal1", "creche_maternal2", "creche_pre1a", "creche_pre1b", "creche_pre2"];

export default function CrechePage() {
  return <SiteConfigPanel sectionKeys={KEYS} />;
}
