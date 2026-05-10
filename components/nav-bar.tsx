"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { label: string; href: string };

function isActive(pathname: string, href: string) {
  if (href.startsWith("/") && href !== "/") return pathname === href;
  return href === "#inicio" && pathname === "/";
}

export function NavDesktop({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="hidden flex-1 items-center justify-center gap-5 text-sm font-semibold text-gray-950 xl:flex 2xl:gap-6"
      aria-label="Principal"
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`border-b-2 py-2 tracking-wide transition hover:scale-[1.02] hover:border-primary hover:text-primary ${
            isActive(pathname, item.href)
              ? "border-primary text-primary"
              : "border-transparent"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function NavMobile({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="container-page flex gap-2 overflow-x-auto pb-4 text-sm font-semibold text-gray-900 xl:hidden"
      aria-label="Principal mobile"
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`shrink-0 rounded-full border border-orange-100 px-4 py-2 hover:text-primary ${
            isActive(pathname, item.href)
              ? "bg-primary text-white hover:bg-orange-600 hover:text-white"
              : "bg-white hover:bg-orange-100"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
