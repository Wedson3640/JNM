import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://joaonunesmaia.org.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Associação Espírita João Nunes Maia",
    template: "%s | João Nunes Maia"
  },
  description:
    "Portal institucional da Associação Espírita João Nunes Maia em Teresina/PI, com palestras, estudos, eventos, notícias e assistência social.",
  icons: {
    icon: [
      {
        url: "/images/favicoJNM%2064x64.png",
        sizes: "64x64",
        type: "image/png"
      }
    ],
    shortcut: "/images/favicoJNM%2064x64.png",
    apple: "/images/favicoJNM%2064x64.png"
  },
  openGraph: {
    title: "Associação Espírita João Nunes Maia",
    description: "Palestras, estudos, eventos e ações fraternas em Teresina/PI.",
    url: siteUrl,
    siteName: "Associação Espírita João Nunes Maia",
    images: [{ url: "/images/pagina-final.png", width: 1200, height: 900 }],
    locale: "pt_BR",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F97316"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans text-text antialiased">{children}</body>
    </html>
  );
}
