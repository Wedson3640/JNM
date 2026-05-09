export type HeroSlide = {
  speakerName: string;
  theme: string;
  eventDate: string;
  eventWeekday: string;
  eventTime: string;
  platforms: "YouTube" | "Facebook" | "Ambos";
  image: string;
};

export type FraternalService = [string, string, string];

export type WeeklyScheduleItem = [string, string, string];

export type EventItem = {
  title: string;
  dateLabel: string;
  description: string;
  imageUrl?: string | null;
};

export type StudyGroupItem = {
  title: string;
  schedule: string;
  room?: string | null;
  imageUrl?: string | null;
};

export type PartnerItem = [string, string, string, string];

export type HouseAreaItem = {
  title: string;
  description: string;
  icon?: string | null;
};

export type PublicSiteData = {
  heroSlides: HeroSlide[];
  fraternalCare: FraternalService[];
  weeklySchedule: WeeklyScheduleItem[];
  events: EventItem[];
  studyGroups: StudyGroupItem[];
  partners: PartnerItem[];
  houseAreas: HouseAreaItem[];
};
