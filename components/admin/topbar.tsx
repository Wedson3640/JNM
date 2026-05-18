"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const pageTitles: Record<string, string> = {
  "/admin":           "Dashboard",
  "/admin/creche":    "Creche Miranez",
  "/admin/creche/config": "Config. Creche Miranez",
  "/admin/palestras": "Configuração de Palestras",
  "/admin/servicos":  "Serviços Sociais",
  "/admin/livraria":  "Livraria",
};

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
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
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Abrir menu"
          onClick={onMenuClick}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-base font-bold text-gray-900 sm:text-lg">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {email && (
          <span className="hidden text-sm text-gray-500 sm:block">{email}</span>
        )}
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
