"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

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

export function NavMobileMenu({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botão hamburguer — visível apenas abaixo de xl */}
      <button
        type="button"
        aria-label="Abrir menu"
        onClick={() => setOpen(true)}
        className="grid h-9 w-9 place-items-center rounded-full text-primary hover:bg-orange-100 xl:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Painel lateral direito */}
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-white shadow-2xl">
            {/* Cabeçalho do drawer */}
            <div className="flex items-center justify-between border-b border-orange-100 px-5 py-4">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Menu</p>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-orange-100"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 overflow-y-auto p-3">
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`mb-1 block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-primary text-white"
                        : "text-gray-800 hover:bg-orange-50 hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
