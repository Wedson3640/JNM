import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";

type Activity = {
  title: string;
  note?: string;
  time: string | string[];
};

type DaySection = {
  day: string;
  activities: Activity[];
};

type InfoSection = {
  title: string;
  lines: string[];
};

const schedule: DaySection[] = [
  {
    day: "DOMINGO",
    activities: [
      { title: "Evangelização infantil, grupo de jovens (integração e lanche) ao público", time: "8h30 às 10h" },
      { title: "Estudo da Doutrina Espírita — ESDE e Principiante ao público", time: "9h às 10h" },
      { title: "Campanha do Cesto — 3º domingo", note: "Dirigentes: Neto Aquino, Jeferson, Jorranes e outros", time: "7h às 10h" },
      { title: "Reunião pública doutrinária e passe", note: "Grupo de vibração ao público", time: "16h às 17h" },
      { title: "Reunião da Diretoria Administrativa com os departamentos", note: "Vibração da Pomada Vovô Pedro", time: "14h30 às 15h30" },
      { title: "Caravana do Evangelho na Capital e harmonização de trabalhadores", note: "Último domingo do mês", time: "14h às 19h30" },
    ],
  },
  {
    day: "SEGUNDA-FEIRA",
    activities: [
      { title: "Atendimento fraterno e passe", time: ["8h às 11h", "13h às 18h"] },
      { title: "Estudos das obras básicas e livros diversos autores", time: ["9h às 10h", "13h30 às 14h30"] },
      { title: "Funcionamento da Creche Fernando", note: "Coordenação: Girlene Gomes de Oliveira", time: "7h às 17h" },
      { title: "Projeto Serviço de Convivência — Público Alvo", note: "Crianças de 06 a 12 anos, jovens de 13 a 17 anos e idosos · Atividades: balé, judô, música, futebol, futsal, voleibol e outras", time: ["8h às 12h", "14h às 17h"] },
      { title: "Estudo da Doutrina Espírita — ESDE", time: "16h às 17h" },
      { title: "Aula de Zumba", note: "Projeto Acolher para Proteger a Pessoa Idosa", time: "16h às 17h" },
      { title: "Desenvolvimento mediúnico", note: "Dirigentes: Neto Aquino e Clodoveu Ribeiro", time: "17h às 18h" },
      { title: "Desenvolvimento da mediunidade", note: "Dirigentes: Clodoveu e Neto Aquino", time: "19h às 20h" },
    ],
  },
  {
    day: "TERÇA-FEIRA",
    activities: [
      { title: "Reunião mediúnica", note: "Dirigentes: Rogério Paz e Gorethe Galvão", time: "18h às 19h" },
      { title: "Estudo das Obras Básicas", note: "Dirigentes: Elzani Gomes, Francisca Sena e Shirle Nobre", time: "17h às 18h" },
      { title: "Reunião pública doutrinária, passe e evangelização para as crianças", time: "19h às 20h" },
    ],
  },
  {
    day: "QUARTA-FEIRA",
    activities: [
      { title: "Atendimento fraterno, reunião de prece e vibração — Grupo Francisco de Assis", note: "Dirigentes: Benilton e Evany", time: "14h às 17h" },
      { title: "Estudo das Obras de Divaldo Franco e Manoel Philomeno de Miranda", note: "Dirigentes: Benilton Bezerra e Evany Gomes", time: "17h30 às 18h20" },
      { title: "Reunião de desobsessão — Grupo Eurípedes Barsanulfo", note: "Dirigentes: Benilton Bezerra e Evany Gomes", time: "18h30 às 19h30" },
    ],
  },
  {
    day: "QUINTA-FEIRA",
    activities: [
      { title: "Evangelização para crianças e jovens dos projetos", note: "Coordenação e evangelizadores — equipe do estudo da mediunidade de quinta-feira", time: "14h40 às 15h30" },
      { title: "Estudo da Mediunidade", note: "Dirigentes: Evany Gomes, Benilton Bezerra Ponte", time: "15h30 às 17h" },
      { title: "Estudo das Obras Básicas", note: "Dirigentes: Socorrinha e Devany", time: "17h às 18h" },
      { title: "Estudo das Obras Básicas — grupo de sustentação e auxílio para trabalhadores da casa", note: "Dirigentes: Benilton e Evany", time: "18h às 19h" },
    ],
  },
  {
    day: "SEXTA-FEIRA",
    activities: [
      { title: "Estudo das Obras de André Luiz", note: "Dirigentes: Augusto Perelo Neto, Maria José e Kátia Brito", time: "16h30 às 18h" },
      { title: "Reunião de Desobsessão — Grupo Fabiano de Cristo", note: "Dirigentes: Margarida Rodrigues, Benilton Bezerra e Evany Gomes", time: "18h30 às 19h30" },
    ],
  },
  {
    day: "SÁBADO",
    activities: [
      { title: "Campanha do Quilo · Distribuição da Cestinha Tio Nunes", time: "7h às 10h30" },
      { title: "Atendimento fraterno e espiritual, palestras e desobsessão — Grupo Maria de Nazaré", time: "14h às 17h30" },
    ],
  },
];

const infoSections: InfoSection[] = [
  { title: "LOJINHA TIO NUNES", lines: ["Funcionamento de segunda a sábado", "Horário comercial"] },
  { title: "LANCHONETE", lines: ["Responsáveis: Maria José, Kátia", "Equipe: Ivonildo, Zenalde, Conceição, Domingos, Mazé"] },
  { title: "BIBLIOTECA E CURSOS", lines: ["Responsáveis: Paula Francinete e Leda"] },
  { title: "CENTRO DE PRODUÇÃO DE CURSOS DIVERSOS E COSTURA", lines: ["Cel. Jaime Rolembergue de Lima", "Responsáveis: Benilton Bezerra Ponte"] },
  { title: "ESTUDO DA DOUTRINA ESPÍRITA — ESDE", lines: ["18h às 19h15min"] },
  { title: "PORÇÃO E ANGOLAR", lines: ["2º e 3º domingo — Caravana do Evangelho", "Manhã: 9h às 10h · Tarde: 14h"] },
  { title: "DOMINGO — EVANGELIZAÇÃO E PALESTRAS AO PÚBLICO", lines: ["Manhã: 9h às 10h"] },
  { title: "CENTRO DE REABILITAÇÃO EURÍPEDES BARSANULFO", lines: ["Funcionamento de segunda a sábado", "Horário comercial"] },
];

function TimeChip({ time }: { time: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-orange-200 bg-orange-50 px-2.5 py-1 text-sm font-medium text-primary">
      <Clock className="h-3.5 w-3.5" />
      {time}
    </span>
  );
}

export default function ProgramacaoPage() {
  return (
    <>
      <Header />
      <main className="container-page py-8">

        {/* Botão voltar + título */}
        <div className="mb-6 flex items-start gap-4">
          <Link
            href="/"
            className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-orange-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div className="flex items-center gap-3">
            <CalendarDays className="h-8 w-8 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Associação Espírita João Nunes Maia</p>
              <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">Programação Completa</h1>
            </div>
          </div>
        </div>

        {/* Atividades gerais */}
        <div className="mb-6 rounded-md border border-orange-100 bg-orange-50 p-4 text-base text-gray-700">
          <span className="font-semibold text-gray-950">Atividades: </span>
          Espirituais, doutrinárias, estudos, evangelização, saúde, educacional e de assistência social ao público.
        </div>

        {/* Grade por dia */}
        <div className="space-y-4">
          {schedule.map((section) => (
            <div key={section.day} className="overflow-hidden rounded-md border border-orange-200">

              {/* Cabeçalho do dia */}
              <div className="flex items-center gap-2 border-b border-orange-200 bg-orange-50 px-4 py-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold uppercase tracking-wide text-primary">{section.day}</h2>
              </div>

              {/* Atividades */}
              <div className="divide-y divide-orange-100">
                {section.activities.map((activity, index) => (
                  <div key={index} className="px-4 py-4">
                    <p className="text-base font-semibold text-gray-900">{activity.title}</p>
                    {activity.note && (
                      <p className="mt-1 text-sm text-gray-500">{activity.note}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Array.isArray(activity.time)
                        ? activity.time.map((t) => <TimeChip key={t} time={t} />)
                        : <TimeChip time={activity.time} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Seções informativas */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {infoSections.map((section) => (
            <div key={section.title} className="rounded-md border border-orange-200 px-4 py-4">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">{section.title}</h3>
              {section.lines.map((line) => (
                <p key={line} className="text-base text-gray-700">{line}</p>
              ))}
            </div>
          ))}
        </div>

      </main>
      <Footer />
    </>
  );
}
