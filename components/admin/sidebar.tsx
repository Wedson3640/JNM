"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Baby, HandHeart, LayoutDashboard, Mic2 } from "lucide-react";

const logoJnm = "/images/logo%20JNM%20(1).png";

const navItems = [
  { label: "Dashboard",       href: "/admin",          icon: LayoutDashboard },
  { label: "Creche Miranez",  href: "/admin/creche",   icon: Baby },
  { label: "Config. Palestra",href: "/admin/palestras", icon: Mic2 },
  { label: "Serv. Sociais",   href: "/admin/servicos",  icon: HandHeart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-700 px-5 py-5">
        <div className="relative h-12 w-12 shrink-0">
          <Image src={logoJnm} alt="JNM" fill sizes="48px" className="object-contain" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Área Interna</p>
          <p className="text-sm font-bold leading-tight text-white">João Nunes Maia</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
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

      {/* Footer */}
      <div className="border-t border-slate-700 px-5 py-4">
        <p className="text-xs text-slate-500">© 2026 AEJNM</p>
      </div>
    </aside>
  );
}
