export type AdminProfile = "admin" | "creche" | "palestras" | "livraria" | "servicos";

export type AdminNavItem = {
  label: string;
  href: string;
  profile: AdminProfile;
};

export const adminProfileOptions: { value: AdminProfile; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "creche", label: "Creche Miranez" },
  { value: "palestras", label: "Config. Palestra" },
  { value: "livraria", label: "Livraria" },
  { value: "servicos", label: "Serv. Social" },
];

export const adminNavAccess: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", profile: "admin" },
  { label: "Creche Miranez", href: "/admin/creche", profile: "creche" },
  { label: "Config. Palestra", href: "/admin/palestras", profile: "palestras" },
  { label: "Serv. Sociais", href: "/admin/servicos", profile: "servicos" },
  { label: "Livraria", href: "/admin/livraria", profile: "livraria" },
];

const profileAliases: Record<string, AdminProfile> = {
  admin: "admin",
  administrador: "admin",
  creche: "creche",
  "creche miranez": "creche",
  palestra: "palestras",
  palestras: "palestras",
  "config palestra": "palestras",
  "config. palestra": "palestras",
  livraria: "livraria",
  servico: "servicos",
  servicos: "servicos",
  "serv social": "servicos",
  "serv. social": "servicos",
  "servicos sociais": "servicos",
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function normalizeAdminProfile(value: unknown): AdminProfile {
  if (typeof value !== "string") return "admin";
  return profileAliases[normalizeText(value)] ?? "admin";
}

export function getAdminProfile(metadata?: Record<string, unknown> | null): AdminProfile {
  return normalizeAdminProfile(
    metadata?.admin_profile ?? metadata?.perfil ?? metadata?.profile ?? metadata?.role
  );
}

export function getAllowedAdminNavItems(profile: AdminProfile) {
  if (profile === "admin") return adminNavAccess;
  return adminNavAccess.filter((item) => item.profile === profile);
}

export function canAccessAdminPath(profile: AdminProfile, pathname: string) {
  if (profile === "admin") return true;
  return adminNavAccess.some((item) => item.profile === profile && item.href === pathname);
}

export function getDefaultAdminPath(profile: AdminProfile) {
  return getAllowedAdminNavItems(profile)[0]?.href ?? "/admin";
}
