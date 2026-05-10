import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Baby, HandHeart, LayoutDashboard, Mic2 } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Admin — Dashboard" };

const cards = [
  {
    label: "Creche Miranez",
    description: "Áreas e atividades da creche",
    href: "/admin/creche",
    icon: Baby,
    color: "bg-purple-50 text-purple-700",
  },
  {
    label: "Config. Palestra",
    description: "Slides do hero, programação e atendimento",
    href: "/admin/palestras",
    icon: Mic2,
    color: "bg-orange-50 text-primary",
  },
  {
    label: "Serv. Sociais",
    description: "Notícias, eventos, convênios e mídias",
    href: "/admin/servicos",
    icon: HandHeart,
    color: "bg-emerald-50 text-emerald-700",
  },
];

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("user_access_logs").insert({
      user_id: user.id,
      email: user.email,
      action: "admin_access",
      path: "/admin",
    });
  }

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-orange-50">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </span>
          <div>
            <p className="text-sm text-gray-500">Bem-vindo,</p>
            <p className="text-xl font-bold text-gray-900">{user?.email ?? "Administrador"}</p>
          </div>
        </div>
      </div>

      {/* Cards de acesso rápido */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Acesso rápido</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map(({ label, description, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-orange-200"
            >
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${color}`}>
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-bold text-gray-900">{label}</p>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Link para o site */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-700">
          Ver site público:{" "}
          <Link href="/" className="text-primary hover:underline" target="_blank">
            joaonunesmaia.org.br
          </Link>
        </p>
      </div>
    </div>
  );
}
