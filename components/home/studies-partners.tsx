import { BookOpen } from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";
import type { PartnerItem, StudyGroupItem } from "@/types/site";

export function StudiesPartners({
  studyGroups,
  partners
}: {
  studyGroups: StudyGroupItem[];
  partners: PartnerItem[];
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
      <Card id="estudos">
        <SectionHeader
          title="Grupos de Estudos"
          action={<a href="#estudos" className="text-sm font-semibold text-primary">Ver todos</a>}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {studyGroups.map(({ title, schedule, room }) => (
            <article key={title} className="group">
              <div className="grid aspect-[1.2] place-items-center rounded-xl bg-gradient-to-br from-orange-100 via-white to-orange-200 shadow-md transition duration-300 group-hover:scale-[1.02]">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-950">{title}</h3>
              <p className="text-xs">{schedule}</p>
              <p className="text-xs">{room}</p>
            </article>
          ))}
        </div>
      </Card>

      <Card id="convenios">
        <SectionHeader
          title="Convênios com outras Casas Espíritas"
          action={<a href="#convenios" className="text-sm font-semibold text-primary">Ver todos</a>}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-orange-50 text-xs uppercase text-gray-950">
                <th className="rounded-l-xl p-3">Estado</th>
                <th className="p-3">Município</th>
                <th className="p-3">Nome da Casa</th>
                <th className="rounded-r-xl p-3">Telefone</th>
              </tr>
            </thead>
            <tbody>
              {partners.map(([state, city, name, phone]) => (
                <tr key={`${city}-${name}`} className="border-b border-orange-100">
                  <td className="p-3">{state}</td>
                  <td className="p-3">{city}</td>
                  <td className="p-3">{name}</td>
                  <td className="p-3">{phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
