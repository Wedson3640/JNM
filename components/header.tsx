import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, Search } from "lucide-react";
import { navLinks, socialLinks } from "@/lib/content";
import { NavDesktop, NavMobile } from "@/components/nav-bar";

const logoJnm = "/images/logo%20JNM%20(1).png";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-primary px-1 pt-2">
      <div className="mx-auto max-w-screen-2xl rounded-t-[4rem] bg-orange-50 shadow-sm backdrop-blur">

        {/* Linha principal: logo + nav desktop + botões */}
        <div className="container-page flex min-h-28 items-center gap-5 py-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 rounded-full px-2 py-1 hover:bg-orange-100/60"
            aria-label="Página inicial"
          >
            <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
              <Image
                src={logoJnm}
                alt="Associação Espírita João Nunes Maia"
                fill
                sizes="96px"
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="text-base font-semibold leading-tight text-gray-950">Associação Espírita</p>
              <p className="text-2xl font-bold leading-tight text-gray-950 lg:text-3xl">João Nunes Maia</p>
              <p className="mt-1 text-xs font-medium text-gray-600">Estudo, Caridade e Amor ao Próximo</p>
            </div>
          </Link>

          <NavDesktop items={navLinks} />

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              {socialLinks.map(({ label, href, image }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-8 w-8 place-items-center rounded-full hover:scale-110 hover:bg-orange-100"
                >
                  <Image src={image} alt={label} width={20} height={20} className="object-contain" />
                </a>
              ))}
            </div>
            <Link
              href="/login"
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:scale-[1.02] hover:bg-orange-600 lg:inline-flex"
            >
              <LockKeyhole className="h-4 w-4" />
              Área interna
            </Link>
            <button
              type="button"
              aria-label="Buscar"
              className="grid h-8 w-8 place-items-center rounded-full text-primary hover:scale-110 hover:bg-orange-100"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Nav mobile */}
        <NavMobile items={navLinks} />
      </div>
    </header>
  );
}
