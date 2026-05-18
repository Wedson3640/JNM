"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Baby, BookOpen, HandHeart, LayoutDashboard, Mic2, Settings, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getAdminProfile, getAllowedAdminNavItems, normalizeAdminProfile, type AdminProfile } from "@/lib/admin-access";

const logoJnm = "/images/logo%20JNM%20(1).png";

const iconsByHref = {
  "/admin": LayoutDashboard,
  "/admin/creche": Baby,
  "/admin/creche/config": Settings,
  "/admin/palestras": Mic2,
  "/admin/servicos": HandHeart,
  "/admin/livraria": BookOpen,
};

function SidebarContent({
  onNavigate,
  showClose = false
}: {
  onNavigate?: () => void;
  showClose?: boolean;
}) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<AdminProfile>("admin");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) return;

      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("profile")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(userProfile?.profile ? normalizeAdminProfile(userProfile.profile) : getAdminProfile(user.user_metadata));
    });
  }, []);

  const navItems = getAllowedAdminNavItems(profile);

  return (
    <>
      <div className="flex items-center gap-3 border-b border-slate-700 px-5 py-5">
        <div className="relative h-12 w-12 shrink-0">
          <Image src={logoJnm} alt="JNM" fill sizes="48px" className="object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Área Interna</p>
          <p className="text-sm font-bold leading-tight text-white">João Nunes Maia</p>
        </div>
        {showClose ? (
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={onNavigate}
            className="grid h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ label, href }) => {
          const Icon = iconsByHref[href as keyof typeof iconsByHref];
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 px-5 py-4">
        <p className="text-xs text-slate-500">© 2026 AEJNM</p>
      </div>
    </>
  );
}

export function Sidebar({
  open = false,
  onClose
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 flex-col bg-slate-900 md:flex">
        <SidebarContent />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-[9999] md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 h-full w-full bg-black/45 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="absolute left-0 top-0 z-[10000] flex h-full w-72 max-w-[86vw] flex-col bg-slate-900 shadow-2xl">
            <SidebarContent onNavigate={onClose} showClose />
          </aside>
        </div>
      ) : null}
    </>
  );
}
