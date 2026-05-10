export type Lecture = {
  id: string;
  speakerName: string;
  speakerImage: string;
  theme: string;
  date: string;
  weekday: string;
  time: string;
  platforms: "YouTube" | "Facebook" | "Ambos";
};
