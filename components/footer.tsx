import Image from "next/image";
import { MapPin } from "lucide-react";
import { contact, socialLinks } from "@/lib/content";

const logoJnm = "/images/logo%20JNM%20(1).png";
const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Rua%20In%C3%A1cio%20da%20Costa%20Filho%204059%20Santo%20Ant%C3%B4nio%20Teresina%20Piau%C3%AD%20Brazil";

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
            <p className="mt-2 text-sm">Rua Inácio da Costa Filho, Nº 4059</p>
            <p className="text-sm">Bairro Santo Antônio · Teresina - Piauí - Brazil</p>
            <p className="text-sm">CEP: 64032-190</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-orange-600"
            >
              <MapPin className="h-4 w-4" />
              Ver no Google Maps
            </a>
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
        © 2026 Associação Espírita João Nunes Maia. Todos os direitos reservados.
      </div>
    </footer>
  );
}
