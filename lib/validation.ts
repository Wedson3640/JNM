import { z } from "zod";

export const newsSchema = z.object({
  title: z.string().trim().min(4, "Informe um título com pelo menos 4 caracteres.").max(120),
  subtitle: z.string().trim().min(4, "Informe um subtítulo.").max(120),
  description: z.string().trim().min(10, "Informe uma descrição mais completa.").max(600),
  imageUrl: z.string().trim().url("Informe uma URL de imagem válida.").optional().or(z.literal("")),
  videoUrl: z.string().trim().url("Informe uma URL de vídeo válida.").optional().or(z.literal("")),
  status: z.enum(["published", "draft"])
});

export type NewsInput = z.infer<typeof newsSchema>;

export const mediaSchema = z.object({
  title: z.string().trim().min(4, "Informe um título para a mídia.").max(120),
  platform: z.enum(["YouTube", "Facebook", "Instagram"]),
  image: z.string().trim().url("Informe uma URL de imagem válida."),
  duration: z.string().trim().min(3, "Informe a duração.").max(12),
  videoUrl: z.string().trim().url("Informe uma URL de vídeo válida.").optional().or(z.literal("")),
  status: z.enum(["published", "draft"])
});

export type MediaInput = z.infer<typeof mediaSchema>;
