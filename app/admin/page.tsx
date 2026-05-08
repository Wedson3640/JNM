import Link from "next/link";
import { SiteConfigPanel } from "@/components/admin/site-config-panel";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata = {
  title: "Admin"
};

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("user_access_logs").insert({
      user_id: user.id,
      email: user.email,
      action: "admin_access",
      path: "/admin"
    });
  }

  return (
    <main className="container-page min-h-screen py-8">
      <Link href="/" className="mb-6 inline-flex text-sm font-semibold text-primary hover:text-orange-600">
        Voltar ao site
      </Link>
      <SiteConfigPanel />
    </main>
  );
}
