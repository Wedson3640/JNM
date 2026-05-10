import type { AdminSection } from "@/types/admin";

export const adminSections: AdminSection[] = [
  {
    key: "hero_slides",
    title: "Palestras em destaque",
    description: "Máximo 2 slides publicados. Campos obrigatórios: palestrante, tema, data, dia, hora e foto.",
    table: "hero_slides",
    fields: [
      { name: "speaker_name", label: "Nome do palestrante", type: "text", required: true },
      { name: "theme", label: "Tema da palestra", type: "text", required: true },
      { name: "event_date", label: "Data (ex: 09/05/2026)", type: "text", required: true },
      { name: "event_weekday", label: "Dia da semana (ex: Sábado)", type: "text", required: true },
      { name: "event_time", label: "Horário (ex: 15h40)", type: "text", required: true },
      { name: "platforms", label: "Plataformas", type: "select", options: ["YouTube", "Facebook", "Ambos"], required: true },
      { name: "image_url", label: "URL da foto do palestrante", type: "url", required: true },
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
  },
  {
    key: "creche_maternal1",
    title: "Maternal 1",
    description: "Registros e atividades da turma Maternal 1.",
    table: "creche_turmas",
    rowFilter: { turma: "Maternal 1" },
    fields: [
      { name: "title", label: "Título / Atividade", type: "text", required: true },
      { name: "description", label: "Descrição / Observação", type: "textarea", required: true },
      { name: "date", label: "Data (ex: 10/05/2026)", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true }
    ]
  },
  {
    key: "creche_maternal2",
    title: "Maternal 2",
    description: "Registros e atividades da turma Maternal 2.",
    table: "creche_turmas",
    rowFilter: { turma: "Maternal 2" },
    fields: [
      { name: "title", label: "Título / Atividade", type: "text", required: true },
      { name: "description", label: "Descrição / Observação", type: "textarea", required: true },
      { name: "date", label: "Data (ex: 10/05/2026)", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true }
    ]
  },
  {
    key: "creche_pre1a",
    title: "Pré Escola 1 A",
    description: "Registros e atividades da turma Pré Escola 1 A.",
    table: "creche_turmas",
    rowFilter: { turma: "Pré Escola 1 A" },
    fields: [
      { name: "title", label: "Título / Atividade", type: "text", required: true },
      { name: "description", label: "Descrição / Observação", type: "textarea", required: true },
      { name: "date", label: "Data (ex: 10/05/2026)", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true }
    ]
  },
  {
    key: "creche_pre1b",
    title: "Pré Escola 1 B",
    description: "Registros e atividades da turma Pré Escola 1 B.",
    table: "creche_turmas",
    rowFilter: { turma: "Pré Escola 1 B" },
    fields: [
      { name: "title", label: "Título / Atividade", type: "text", required: true },
      { name: "description", label: "Descrição / Observação", type: "textarea", required: true },
      { name: "date", label: "Data (ex: 10/05/2026)", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true }
    ]
  },
  {
    key: "creche_pre2",
    title: "Pré Escola 2",
    description: "Registros e atividades da turma Pré Escola 2.",
    table: "creche_turmas",
    rowFilter: { turma: "Pré Escola 2" },
    fields: [
      { name: "title", label: "Título / Atividade", type: "text", required: true },
      { name: "description", label: "Descrição / Observação", type: "textarea", required: true },
      { name: "date", label: "Data (ex: 10/05/2026)", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["published", "draft"], required: true }
    ]
  }
];
