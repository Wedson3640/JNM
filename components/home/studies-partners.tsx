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
        <SectionHeader title="Grupos de Estudos" />
        <div className="hidden overflow-hidden rounded-xl border border-orange-100 md:block">
          <table className="w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-orange-50 text-xs uppercase text-gray-950">
                <th className="p-3">Grupo</th>
                <th className="p-3">Horário</th>
                <th className="p-3">Local</th>
              </tr>
            </thead>
            <tbody>
              {studyGroups.map(({ title, schedule, room }) => (
                <tr key={title} className="border-b border-orange-100">
                  <td className="p-3 font-semibold text-gray-950">{title}</td>
                  <td className="p-3">{schedule}</td>
                  <td className="p-3">{room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 md:hidden">
          {studyGroups.map(({ title, schedule, room }) => (
            <article key={title} className="rounded-xl border border-orange-100 bg-orange-50/45 p-3">
              <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
              <p className="mt-1 text-xs">{schedule}</p>
              {room ? <p className="mt-1 text-xs">{room}</p> : null}
            </article>
          ))}
        </div>
      </Card>

      <Card id="convenios">
        <SectionHeader title="Convênios com outras Casas Espíritas" />
        <div className="hidden overflow-hidden rounded-xl border border-orange-100 md:block">
          <table className="w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-orange-50 text-xs uppercase text-gray-950">
                <th className="p-3">Estado</th>
                <th className="p-3">Município</th>
                <th className="p-3">Nome da Casa</th>
                <th className="p-3">Telefone</th>
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
        <div className="grid gap-3 md:hidden">
          {partners.map(([state, city, name, phone]) => (
            <article key={`${city}-${name}`} className="rounded-xl border border-orange-100 bg-orange-50/45 p-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-950">{name}</h3>
                <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-primary">
                  {state}
                </span>
              </div>
              <p className="mt-1 text-xs">{city}</p>
              <p className="mt-1 text-xs">{phone}</p>
            </article>
          ))}
        </div>
      </Card>
    </section>
  );
}
