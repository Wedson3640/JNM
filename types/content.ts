import type { LucideIcon } from "lucide-react";

export type NewsStatus = "published" | "draft";

export type NewsItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: NewsStatus;
  createdAt: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
};

export type VideoItem = {
  id?: string;
  title: string;
  platform: "YouTube" | "Facebook" | "Instagram";
  image: string;
  duration: string;
  videoUrl?: string | null;
  status?: NewsStatus;
};

export type AreaItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
};
