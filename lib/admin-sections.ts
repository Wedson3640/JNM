import type { AdminSection } from "@/types/admin";

export const adminSections: AdminSection[] = [
  {
    key: "hero_slides",
    title: "Palestras em destaque",
    description: "Atualiza os slides do carrossel principal.",
    table: "hero_slides",
    fields: [
      { name: "label", label: "Etiqueta", type: "text", required: true },
      { name: "title", label: "Título", type: "text", required: true },
      { name: "meta", label: "Data, horário e local", type: "text", required: true },
      { name: "image_url", label: "URL da imagem", type: "url", required: true },
      { name: "cta_url", label: "Link do botão", type: "url" },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true }
    ]
  },
  {
    key: "fraternal_care",
    title: "Atendimento Fraterno",
    description: "Serviços, dias e horários do card lateral.",
    table: "fraternal_services",
    fields: [
      { name: "title", label: "Serviço", type: "text", required: true },
      { name: "days", label: "Dias", type: "text", required: true },
      { name: "time", label: "Horário", type: "text", required: true },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true }
    ]
  },
  {
    key: "weekly_schedule",
    title: "Programação da Semana",
    description: "Agenda semanal exibida no card direito.",
    table: "weekly_schedule",
    fields: [
      { name: "weekday", label: "Dia", type: "text", required: true },
      { name: "time", label: "Horário", type: "text", required: true },
      { name: "title", label: "Atividade", type: "text", required: true },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true }
    ]
  },
  {
    key: "news",
    title: "Notícias",
    description: "Publicações textuais do site.",
    table: "news",
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      { name: "subtitle", label: "Subtítulo", type: "text", required: true },
      { name: "description", label: "Descrição", type: "textarea", required: true },
      { name: "image_url", label: "URL da imagem", type: "url" },
      { name: "video_url", label: "URL do vídeo", type: "url" },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true }
    ]
  },
  {
    key: "media_items",
    title: "Vídeos das redes sociais",
    description: "YouTube, Facebook e Instagram.",
    table: "media_items",
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      { name: "platform", label: "Plataforma", type: "select", options: ["YouTube", "Facebook", "Instagram"], required: true },
      { name: "image_url", label: "URL da thumbnail", type: "url", required: true },
      { name: "video_url", label: "URL do vídeo", type: "url", required: true },
      { name: "duration", label: "Duração", type: "text", required: true },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true }
    ]
  },
  {
    key: "events",
    title: "Eventos",
    description: "Feira do Livro e lista de eventos.",
    table: "events",
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      { name: "date_label", label: "Data", type: "text", required: true },
      { name: "description", label: "Descrição", type: "textarea", required: true },
      { name: "image_url", label: "URL da imagem", type: "url" },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true }
    ]
  },
  {
    key: "study_groups",
    title: "Grupos de estudos",
    description: "Cards dos grupos de estudo.",
    table: "study_groups",
    fields: [
      { name: "title", label: "Nome", type: "text", required: true },
      { name: "schedule", label: "Horário", type: "text", required: true },
      { name: "room", label: "Sala", type: "text" },
      { name: "image_url", label: "URL da imagem", type: "url" },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true }
    ]
  },
  {
    key: "partners",
    title: "Convênios",
    description: "Casas espíritas conveniadas.",
    table: "partners",
    fields: [
      { name: "state", label: "Estado", type: "text", required: true },
      { name: "city", label: "Município", type: "text", required: true },
      { name: "name", label: "Nome da casa", type: "text", required: true },
      { name: "phone", label: "Telefone", type: "text", required: true },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true }
    ]
  },
  {
    key: "areas",
    title: "Áreas da Casa",
    description: "Creche, saúde, educação, assistência e espiritual.",
    table: "house_areas",
    fields: [
      { name: "title", label: "Área", type: "text", required: true },
      { name: "description", label: "Descrição", type: "textarea", required: true },
      { name: "icon", label: "Ícone", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true }
    ]
  }
];
