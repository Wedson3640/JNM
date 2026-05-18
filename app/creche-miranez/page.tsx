import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Baby,
  BookOpenCheck,
  Camera,
  GraduationCap,
  HeartHandshake,
  Palette,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getCrecheMomentGroups, type CrecheMomentCategoryKey } from "@/lib/creche-moments";

export const metadata: Metadata = {
  title: "Creche Miranez",
  description:
    "Conheça a Creche Miranez, espaço de cuidado, educação e acolhimento para crianças em Teresina.",
};

const heroHighlights = [
  {
    icon: GraduationCap,
    title: "Educação com amor",
    text: "Formação cuidadosa desde os primeiros passos.",
  },
  {
    icon: ShieldCheck,
    title: "Ambiente seguro",
    text: "Cuidado e protecao todos os dias.",
  },
];

const momentIcons: Record<CrecheMomentCategoryKey, typeof GraduationCap> = {
  formaturas: GraduationCap,
  "colacao-grau": Baby,
  "dia-maes": HeartHandshake,
  "dia-pais": UsersRound,
  "dia-criancas": Sparkles,
  outros: Palette,
};

const filters = [
  "Todos",
  "Formaturas",
  "Colação de Grau",
  "Dia das Mães",
  "Dia dos Pais",
  "Dia das Crianças",
  "Outros",
];

const moments = [
  {
    title: "Formaturas",
    text: "Celebrando conquistas e novos começos.",
    count: "24 fotos",
    icon: GraduationCap,
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=420&q=85",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=420&q=85",
    ],
  },
  {
    title: "Colação de Grau",
    text: "Reconhecimento da dedicação e aprendizado.",
    count: "15 fotos",
    icon: Baby,
    images: [
      "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1522661067900-ab829854a57f?auto=format&fit=crop&w=420&q=85",
      "https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=420&q=85",
    ],
  },
  {
    title: "Dia das Mães",
    text: "Homenagens cheias de amor e gratidão.",
    count: "35 fotos",
    icon: HeartHandshake,
    images: [
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&w=420&q=85",
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=420&q=85",
    ],
  },
  {
    title: "Dia dos Pais",
    text: "Momentos especiais ao lado de quem inspira.",
    count: "31 fotos",
    icon: UsersRound,
    images: [
      "https://images.unsplash.com/photo-1504151932400-72d4384f04b3?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=420&q=85",
      "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=420&q=85",
    ],
  },
  {
    title: "Dia das Crianças",
    text: "Alegria, brincadeiras e sorrisos envolvidos.",
    count: "47 fotos",
    icon: Sparkles,
    images: [
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=420&q=85",
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=420&q=85",
    ],
  },
  {
    title: "Outros Momentos",
    text: "Pequenas lembranças que marcam para sempre.",
    count: "39 fotos",
    icon: Palette,
    images: [
      "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=420&q=85",
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=420&q=85",
    ],
  },
];

const pillars = [
  {
    icon: BookOpenCheck,
    title: "Educação espírita",
    text: "Baseada em princípios de amor, respeito e caridade.",
  },
  {
    icon: HeartHandshake,
    title: "Desenvolvimento integral",
    text: "Trabalhamos o emocional, intelectual e espiritual.",
  },
  {
    icon: UsersRound,
    title: "Equipe qualificada",
    text: "Profissionais dedicados ao crescimento das crianças.",
  },
];

export default async function CrecheMiranezPage() {
  const moments = (await getCrecheMomentGroups()).map((moment) => ({
    ...moment,
    icon: momentIcons[moment.key],
  }));

  return (
    <>
      <Header />
      <main className="container-page py-6">
        <section className="relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-white via-orange-50 to-purple-50 px-5 py-7 shadow-soft sm:px-8 lg:px-12">
          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-purple-600">
                Creche Miranez
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight text-gray-950 sm:text-4xl lg:text-5xl">
                Momentos que formam e{" "}
                <span className="text-primary">transformam</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-700 sm:text-base">
                Conheça os momentos especiais vividos pelas nossas crianças,
                famílias e educadores. Cada lembrança é um passo no caminho do
                amor, da aprendizagem e da espiritualidade.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {heroHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 rounded-xl border border-orange-100 bg-white/85 p-3 shadow-sm"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-100 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-extrabold text-gray-950">
                          {item.title}
                        </span>
                        <span className="block text-xs leading-5 text-gray-600">
                          {item.text}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative mx-auto h-52 w-full max-w-md sm:h-72 lg:h-80">
              <div className="absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(240,221,241,0.95)_0%,rgba(240,221,241,0.58)_46%,rgba(240,221,241,0)_72%)]" />
              <Image
                src="/images/arovore%20completa.png"
                alt="Árvore lilás simbolizando crescimento e cuidado"
                fill
                sizes="(max-width: 1024px) 90vw, 420px"
                className="object-contain opacity-[0.45]"
                priority
              />
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">
                Galeria de Momentos
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-gray-950">
                Registros da Creche Miranez
              </h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:max-w-3xl sm:flex-wrap sm:justify-end sm:overflow-visible sm:pb-0">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold shadow-sm ${
                    filter === "Todos"
                      ? "bg-purple-600 text-white"
                      : "border border-orange-100 bg-white text-gray-700 hover:border-primary hover:text-primary"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {moments.map((moment) => {
              const Icon = moment.icon;
              return (
                <article
                  key={moment.title}
                  className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-md"
                >
                  <div className="grid h-72 grid-cols-[1fr_5.25rem] gap-2 p-2">
                    <div className="relative overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={moment.images[0]}
                        alt={moment.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="grid gap-2">
                      {moment.images.slice(1).map((image, index) => (
                        <div key={image} className="relative overflow-hidden rounded-xl">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image}
                            alt={`${moment.title} ${index + 2}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                      <div className="grid place-items-center rounded-xl bg-gray-950/90 px-2 text-center text-xs font-extrabold text-white">
                        <span>
                          +{moment.count.split(" ")[0]}
                          <span className="mt-1 block text-[10px] font-bold">fotos</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3 px-4 pb-4 pt-2">
                    <div className="flex min-w-0 gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-50 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-950">
                          {moment.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-gray-600">
                          {moment.text}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-orange-50 px-2 py-1 text-[10px] font-extrabold text-primary">
                      {moment.count}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-soft lg:grid-cols-[0.95fr_1.55fr]">
          <div className="relative min-h-56 bg-gradient-to-br from-purple-100 via-orange-50 to-white p-6">
            <Image
              src="/images/arovore%20completa.png"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-contain opacity-70"
            />
            <div className="relative z-10 max-w-sm">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-purple-600">
                Visite
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight text-gray-950">
                Venha conhecer a{" "}
                <span className="text-primary">Creche Miranez</span>
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                Uma escola inspirada em valores espirituais e humanos,
                comprometida com o desenvolvimento integral da criança.
              </p>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-3 lg:p-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="rounded-xl bg-orange-50/70 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-purple-600 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 text-sm font-extrabold text-gray-950">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    {pillar.text}
                  </p>
                </div>
              );
            })}
            <Link
              href="/#contato"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white shadow-soft hover:bg-orange-600 sm:col-span-3"
            >
              <Camera className="h-4 w-4" />
              Saiba sobre a Creche Miranez
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
