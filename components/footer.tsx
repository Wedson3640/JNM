import Image from "next/image";
import { contact, socialLinks } from "@/lib/content";

const logoJnm = "/images/logo%20JNM%20(1).png";

export function Footer() {
  return (
    <footer id="contato" className="mt-10 bg-orange-50">
      <div className="container-page grid gap-8 py-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex gap-4">
          <div className="relative h-20 w-28 shrink-0">
            <Image src={logoJnm} alt="" fill sizes="112px" className="object-contain" />
          </div>
          <div>
            <p className="font-semibold text-gray-950">Associação Espírita</p>
            <p className="text-xl font-bold text-gray-950">João Nunes Maia</p>
            <p className="mt-2 text-sm">Rua da Fraternidade, 123</p>
            <p className="text-sm">Bairro Primavera · Teresina/PI</p>
            <p className="text-sm">CEP: 64000-000</p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase text-primary">Contato</h3>
          {contact.slice(0, 3).map(({ label, value, icon: Icon }) => (
            <p key={label} className="mb-2 flex items-center gap-2 text-sm">
              <Icon className="h-4 w-4 text-primary" />
              {value}
            </p>
          ))}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase text-primary">Redes sociais</h3>
          <div className="mb-3 flex gap-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} aria-label={label} className="text-primary hover:scale-110">
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          <p className="text-sm">@joaonunesmaia</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase text-primary">Horário de funcionamento</h3>
          <p className="text-sm">Segunda a Sábado: 14h às 20h</p>
          <p className="text-sm">Domingo: 08h às 12h</p>
        </div>
      </div>
      <div className="bg-primary py-3 text-center text-xs font-medium text-white">
        © 2024 Associação Espírita João Nunes Maia. Todos os direitos reservados.
      </div>
    </footer>
  );
}
