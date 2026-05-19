import { Baby, CalendarDays, GraduationCap, HandHeart, HeartPulse, MessageCircleHeart } from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";
import { FeaturedEventCard } from "@/components/home/featured-event-card";
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
            const href = title === "Creche Miranez" ? "/creche-miranez" : "#contato";

            return (
              <article key={title} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 rounded-2xl border border-orange-100 p-3">
                <div className={`grid h-16 w-16 place-items-center rounded-xl ${areaTones[index % areaTones.length]}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
                  <p className="text-sm">{description}</p>
                </div>
                <a href={href} className="button-outline hidden px-3 py-2 text-xs sm:inline-flex">
                  Saiba mais
                </a>
              </article>
            );
          })}
        </div>
      </Card>

      <Card id="eventos" className="md:col-span-3 xl:col-span-3">
        <SectionHeader title="Eventos da Casa" />

        <FeaturedEventCard event={featuredEvent} />

        {/* Lista de outros eventos */}
        <div className="space-y-2">
          {eventList.slice(0, 3).map(({ dateLabel, title, description }) => {
            const match = dateLabel.match(/^([^\s/]+)[\s/](.+)$/);
            const day   = match ? match[1] : dateLabel;
            const month = match ? match[2] : "";

            return (
              <article key={title} className="grid grid-cols-[52px_1fr] gap-3 rounded-2xl bg-orange-50 p-3">
                <div className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-white px-1 py-2 shadow-sm">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <p className="w-full text-center text-xs font-extrabold leading-none text-gray-950">
                    {day}
                  </p>
                  <p className="w-full text-center text-xs font-semibold capitalize leading-none text-gray-500">
                    {month || "—"}
                  </p>
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-xs font-bold uppercase text-gray-950">{title}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
