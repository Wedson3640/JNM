import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, Search } from "lucide-react";
import { navigation, socialLinks } from "@/lib/content";

const logoJnm = "/images/logo%20JNM%20(1).png";

function sectionHref(item: string) {
  return `#${item
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll(" ", "-")}`;
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-primary px-1 pt-2">
      <div className="mx-auto max-w-screen-2xl rounded-t-[4rem] bg-orange-50 shadow-sm backdrop-blur">
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

          <nav
            className="hidden flex-1 items-center justify-center gap-5 text-sm font-semibold text-gray-950 xl:flex 2xl:gap-6"
            aria-label="Principal"
          >
            {navigation.map((item, index) => (
              <a
                key={item}
                href={sectionHref(item)}
                className={`border-b-2 border-transparent py-2 tracking-wide hover:scale-[1.02] hover:border-primary hover:text-primary ${
                  index === 0 ? "border-primary font-semibold text-primary" : ""
                }`}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-8 w-8 place-items-center rounded-full text-primary hover:scale-110 hover:bg-orange-100"
                >
                  <Icon className="h-4 w-4" />
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

        <nav
          className="container-page flex gap-2 overflow-x-auto pb-4 text-sm font-semibold text-gray-900 xl:hidden"
          aria-label="Principal mobile"
        >
          {navigation.map((item, index) => (
            <a
              key={item}
              href={sectionHref(item)}
              className={`shrink-0 rounded-full border border-orange-100 px-4 py-2 hover:bg-orange-100 hover:text-primary ${
                index === 0 ? "bg-primary text-white hover:bg-orange-600 hover:text-white" : "bg-white"
              }`}
            >
              {item}
            </a>
          ))}
          <Link
            href="/login"
            className="shrink-0 rounded-full bg-primary px-4 py-2 text-white hover:bg-orange-600"
          >
            Área interna
          </Link>
        </nav>
      </div>
    </header>
  );
}
