import {
  Baby,
  BookOpen,
  CalendarDays,
  Camera,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Mail,
  MessageCircleHeart,
  Play,
  PlayCircle,
  Users,
} from "lucide-react";
import type { AreaItem, NewsItem, VideoItem } from "@/types/content";

export const navigation = [
  "Início",
  "A Casa",
  "Palestras",
  "Estudos",
  "Eventos",
  "Notícias",
  "Convênios",
  "Contato"
];

export const navLinks = [
  { label: "Início",         href: "#inicio" },
  { label: "Palestras",      href: "#palestras" },
  { label: "Creche Miranez", href: "#creche-miranez" },
  { label: "Programação",    href: "/programacao" },
  { label: "Notícias",       href: "#noticias" },
  { label: "Eventos",        href: "#eventos" },
  { label: "Contato",        href: "#contato" },
];

export const socialLinks = [
  { label: "Facebook",  href: "https://www.facebook.com/p/Sociedade-Esp%C3%ADrita-Jo%C3%A3o-Nunes-Maia-100064637804418", icon: Users },
  { label: "Instagram", href: "https://www.instagram.com/joaonunesmaiateresina/",                                       icon: Camera },
  { label: "YouTube",   href: "https://www.youtube.com/@sociedadeespiritajoaonunes1414",                                icon: Play },
];

export const heroSlides = [
  {
    speakerName: "Vanessa Castelo Branco",
    theme: "Família, amor, sexualidade e espiritualidade",
    eventDate: "09/05/2026",
    eventWeekday: "Sábado",
    eventTime: "15h40",
    platforms: "Ambos" as const,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
  },
  {
    speakerName: "João Nunes Maia",
    theme: "A verdadeira paz começa em nós",
    eventDate: "16/05/2026",
    eventWeekday: "Sábado",
    eventTime: "15h40",
    platforms: "YouTube" as const,
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
  }
];

export const fraternalCare = [
  ["Passe Espírita", "Segunda a Sábado", "14h às 18h"],
  ["Atendimento Fraterno", "Segunda a Sábado", "14h às 18h"],
  ["Orientação Espiritual", "Segunda a Sábado", "14h às 18h"],
  ["Assistência Social", "Segunda a Sexta", "13h às 17h"]
];

export const weeklySchedule = [
  ["Domingo",  "8h30", "Evangelização infantil e grupo de jovens"],
  ["Segunda",  "8h",   "Atendimento fraterno e passe"],
  ["Terça",    "19h",  "Reunião pública doutrinária e passe"],
  ["Quarta",   "14h",  "Atendimento fraterno e vibração"],
  ["Quinta",   "15h30","Estudo da Mediunidade"],
  ["Sexta",    "18h30","Reunião de Desobsessão"],
  ["Sábado",   "14h",  "Atendimento fraterno e espiritual"],
];

export const videos: Record<VideoItem["platform"], VideoItem[]> = {
  YouTube: [
    {
      platform: "YouTube",
      title: "O amor que transforma",
      duration: "1:12:05",
      videoUrl: "https://www.youtube.com/",
      image:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=700&q=80"
    },
    {
      platform: "YouTube",
      title: "Esperança e renovação",
      duration: "58:40",
      videoUrl: "https://www.youtube.com/",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80"
    }
  ],
  Facebook: [
    {
      platform: "Facebook",
      title: "A fé que nos sustenta",
      duration: "1:10:15",
      videoUrl: "https://www.facebook.com/watch/",
      image:
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=700&q=80"
    },
    {
      platform: "Facebook",
      title: "A vida tem propósito",
      duration: "1:02:33",
      videoUrl: "https://www.facebook.com/watch/",
      image:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=700&q=80"
    }
  ],
  Instagram: [
    {
      platform: "Instagram",
      title: "Mensagem de esperança",
      duration: "1:15",
      videoUrl: "https://www.instagram.com/",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80"
    },
    {
      platform: "Instagram",
      title: "Trecho da palestra da semana",
      duration: "0:59",
      videoUrl: "https://www.instagram.com/",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80"
    }
  ]
};

export const initialNews: NewsItem[] = [
  {
    id: "campanha-alimentos",
    title: "Campanha de arrecadação de alimentos",
    subtitle: "Solidariedade em movimento",
    description: "Participe da nossa campanha de arrecadação para famílias assistidas.",
    status: "published",
    createdAt: "2024-05-18",
    imageUrl: null,
    videoUrl: null
  },
  {
    id: "entrega-cestas",
    title: "Entrega de cestas básicas no João Nunes Maia",
    subtitle: "Ação fraterna",
    description: "Ação realizada com muito amor e solidariedade.",
    status: "published",
    createdAt: "2024-05-12",
    imageUrl: null,
    videoUrl: null
  },
  {
    id: "pomada-vovo-pedro",
    title: "Pomada Vovô Pedro - lavagem dos potes",
    subtitle: "Voluntariado",
    description: "Ajude-nos lavando os potes para continuarmos com esse trabalho do bem.",
    status: "draft",
    createdAt: "2024-05-03",
    imageUrl: null,
    videoUrl: null
  }
];

export const areas: AreaItem[] = [
  {
    title: "Creche Miranes",
    description: "Educação com amor para o futuro das nossas crianças.",
    icon: Baby,
    tone: "bg-purple-50 text-purple-700"
  },
  {
    title: "Saúde",
    description: "Acolhimento e cuidado para o corpo e para o espírito.",
    icon: HeartPulse,
    tone: "bg-emerald-50 text-emerald-700"
  },
  {
    title: "Educação",
    description: "Estudos e atividades que transformam vidas.",
    icon: GraduationCap,
    tone: "bg-sky-50 text-sky-700"
  },
  {
    title: "Assistência Social",
    description: "Apoio às famílias em situação de vulnerabilidade.",
    icon: HandHeart,
    tone: "bg-orange-50 text-primary"
  },
  {
    title: "Espiritual",
    description: "Fortalecendo a fé e promovendo a evolução espiritual.",
    icon: MessageCircleHeart,
    tone: "bg-indigo-50 text-indigo-700"
  }
];

export const studyGroups = [
  ["Estudo do Evangelho", "Terças-feiras · 15h", "Sala 2", BookOpen],
  ["Estudo de Allan Kardec", "Quartas-feiras · 19h30", "Sala 3", Users],
  ["Grupo da Caridade", "Quintas-feiras · 20h", "Sala 4", HandHeart],
  ["Mocidade Espírita", "Sábados · 16h", "Sala Jovem", Users],
  ["Evangelização Infantil", "Sábados · 15h", "Sala Infantil", Baby]
];

export const partners = [
  ["PI", "Teresina", "Centro Espírita Luz e Caridade", "(86) 3222-1234"],
  ["PI", "Parnaíba", "Centro Espírita Amor e Fé", "(86) 3321-5678"],
  ["PI", "Picos", "Centro Espírita Caminho da Luz", "(89) 3422-7890"],
  ["MA", "Timon", "Centro Espírita Esperança", "(99) 98888-1111"],
  ["CE", "Fortaleza", "Centro Espírita Allan Kardec", "(85) 98888-2222"]
];

export const contact = [
  { label: "WhatsApp", value: "(86) 9483-1739", icon: MessageCircleHeart, href: "https://wa.me/558694831739" },
  { label: "E-mail",   value: "contato@joaonunesmaia.org.br", icon: Mail },
  { label: "Eventos",  value: "Segunda a sábado: 14h às 20h", icon: CalendarDays },
  { label: "Palestras",value: "Domingo: 08h às 12h", icon: PlayCircle }
];
