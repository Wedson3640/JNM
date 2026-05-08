import { CalendarDays, HeartHandshake } from "lucide-react";
import { Card } from "@/components/ui";
import type { FraternalService, WeeklyScheduleItem } from "@/types/site";

export function FraternalCareCard({ items }: { items: FraternalService[] }) {
  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center gap-3 border-b border-orange-100 pb-4">
        <HeartHandshake className="h-7 w-7 text-primary" />
        <h2 className="text-base font-semibold uppercase text-primary">Atendimento Fraterno</h2>
      </div>
      <div className="space-y-4">
        {items.map(([title, days, time]) => (
          <div key={title} className="flex gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-primary">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
              <p className="text-sm">{days}</p>
              <p className="text-sm">{time}</p>
            </div>
          </div>
        ))}
      </div>
      <a href="#contato" className="button-outline mt-5 w-full">
        Saiba mais
      </a>
    </Card>
  );
}

export function WeeklyScheduleCard({ items }: { items: WeeklyScheduleItem[] }) {
  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center gap-3 border-b border-orange-100 pb-4">
        <CalendarDays className="h-7 w-7 text-primary" />
        <h2 className="text-base font-semibold uppercase text-primary">Programação da Semana</h2>
      </div>
      <div className="divide-y divide-orange-100">
        {items.map(([day, hour, title]) => (
          <div key={day} className="grid grid-cols-[70px_48px_1fr] gap-2 py-3 text-sm">
            <span>{day}</span>
            <span className="font-medium text-gray-950">{hour}</span>
            <span>{title}</span>
          </div>
        ))}
      </div>
      <a href="#eventos" className="button-outline mt-5 w-full">
        Ver programação completa
      </a>
    </Card>
  );
}
