import { Baby, BookOpen, CalendarDays, GraduationCap, HandHeart, HeartPulse, MessageCircleHeart } from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";
import type { NewsItem } from "@/types/content";
import type { EventItem, HouseAreaItem } from "@/types/site";

const areaIcons = [Baby, HeartPulse, GraduationCap, HandHeart, MessageCircleHeart];
const areaTones = [
  "bg-purple-50 text-purple-700",
  "bg-emerald-50 text-emerald-700",
  "bg-sky-50 text-sky-700",
  "bg-orange-50 text-primary",
  "bg-indigo-50 text-indigo-700"
];

export function NewsAreasEvents({
  news,
  areas,
  events
}: {
  news: NewsItem[];
  areas: HouseAreaItem[];
  events: EventItem[];
}) {
  const [featuredEvent, ...eventList] = events;

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-6 xl:grid-cols-12">
      <Card id="noticias" className="md:col-span-6 xl:col-span-5">
        <SectionHeader
          title="Notícias"
          action={<a href="#noticias" className="text-sm font-semibold text-primary">Ver todas</a>}
        />
        <div className="divide-y divide-orange-100">
          {news.map((item) => (
            <article key={item.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto]">
              <div>
                <h3 className="text-sm font-semibold uppercase text-primary">{item.title}</h3>
                <p className="mt-2 text-sm font-semibold text-gray-950">{item.subtitle}</p>
                <p className="mt-1 text-sm">{item.description}</p>
              </div>
              <a className="button-outline self-center px-3 py-2 text-xs" href={`/noticias/${item.id}`}>
                Saiba mais
              </a>
            </article>
          ))}
        </div>
      </Card>

      <Card id="a-casa" className="md:col-span-3 xl:col-span-4">
        <SectionHeader title="Áreas da Casa" />
        <div className="space-y-3">
          {areas.map(({ title, description }, index) => {
            const Icon = areaIcons[index % areaIcons.length];

            return (
              <article key={title} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 rounded-2xl border border-orange-100 p-3">
                <div className={`grid h-16 w-16 place-items-center rounded-xl ${areaTones[index % areaTones.length]}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
                  <p className="text-sm">{description}</p>
                </div>
                <a href="#contato" className="button-outline hidden px-3 py-2 text-xs sm:inline-flex">
                  Saiba mais
                </a>
              </article>
            );
          })}
        </div>
      </Card>

      <Card id="eventos" className="md:col-span-3 xl:col-span-3">
        <SectionHeader title="Eventos da Casa" />
        <article className="mb-4 rounded-2xl bg-secondary/50 p-8 text-center shadow-md">
          <h3 className="text-4xl font-bold uppercase tracking-wide text-gray-900">
            {featuredEvent?.title ?? "Feira do Livro"}
          </h3>
          <BookOpen className="mx-auto my-3 h-12 w-12 text-gray-900" />
          <p className="text-xl font-bold uppercase text-primary">
            {featuredEvent?.dateLabel ?? "De 24 a 26 de Maio"}
          </p>
          <p className="mt-2 font-semibold text-gray-950">Teresina Shopping</p>
          <p className="mt-3 text-sm">
            {featuredEvent?.description ?? "Venha conhecer, aprender e se inspirar."}
          </p>
        </article>

        <div className="space-y-3">
          {eventList.slice(0, 2).map(({ dateLabel, title, description }) => {
            const [day = "", month = ""] = dateLabel.split(" ");

            return (
              <article key={title} className="grid grid-cols-[64px_1fr] gap-4 rounded-2xl bg-orange-50 p-4">
                <div className="text-center">
                  <CalendarDays className="mx-auto h-6 w-6 text-primary" />
                  <p className="text-3xl font-bold text-gray-950">{day}</p>
                  <p className="font-semibold uppercase text-gray-950">{month}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase text-gray-950">{title}</h3>
                  <p className="text-sm">{description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
