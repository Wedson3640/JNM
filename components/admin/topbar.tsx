"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const pageTitles: Record<string, string> = {
  "/admin":           "Dashboard",
  "/admin/creche":    "Creche Miranez",
  "/admin/palestras": "Configuração de Palestras",
  "/admin/servicos":  "Serviços Sociais",
};

export function Topbar() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const title = pageTitles[pathname] ?? "Admin";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        {email && (
          <span className="hidden text-sm text-gray-500 sm:block">{email}</span>
        )}
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </header>
  );
}
