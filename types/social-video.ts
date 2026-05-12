export type SocialPlatform = "youtube" | "facebook" | "instagram";

export interface SocialVideo {
  id: string;
  platform: SocialPlatform;
  title: string;
  thumbnail: string;
  url: string;
  publishedAt?: string;
  duration?: string;
}

export type SocialVideosResponse = Record<SocialPlatform, SocialVideo[]>;
