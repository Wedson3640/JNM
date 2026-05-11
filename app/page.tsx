// Sempre busca dados frescos do Supabase — sem cache estático
export const revalidate = 0;

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { NewsAreasEvents } from "@/components/home/news-areas-events";
import { FraternalCareCard, WeeklyScheduleCard } from "@/components/home/sidebar-card";
import { StudiesPartners } from "@/components/home/studies-partners";
import { VideoSection } from "@/components/home/video-section";
import { getPublishedNews } from "@/lib/public-news";
import { getPublishedVideos } from "@/lib/public-media";
import { getPublicSiteData } from "@/lib/public-site-data";
import { getPublishedLectures } from "@/services/lectures";

export default async function HomePage() {
  const [news, videosByPlatform, siteData, lectures] = await Promise.all([
    getPublishedNews(),
    getPublishedVideos(),
    getPublicSiteData(),
    getPublishedLectures(),
  ]);

  return (
    <>
      <Header />
      <main className="container-page space-y-5 py-6">
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-6 xl:grid-cols-12">
          <div className="md:col-span-3 xl:col-span-3">
            <FraternalCareCard items={siteData.fraternalCare} />
          </div>
          <div className="md:col-span-6 xl:col-span-6">
            <HeroCarousel lectures={lectures} />
          </div>
          <div className="md:col-span-3 xl:col-span-3">
            <WeeklyScheduleCard items={siteData.weeklySchedule} />
          </div>
        </div>
        <VideoSection videosByPlatform={videosByPlatform} />
        <NewsAreasEvents news={news} areas={siteData.houseAreas} events={siteData.events} />
        <StudiesPartners studyGroups={siteData.studyGroups} partners={siteData.partners} />

        {/* Parceiros institucionais */}
        <section className="card p-6">
          <p className="mb-5 text-[10px] font-bold tracking-[0.22em] text-primary">PARCEIROS</p>
          <div className="flex items-center justify-between gap-6">
            {[
              { src: "/images/parceiros/Fco_clara%20(1).png",             alt: "Fundação Francisco e Clara de Assis" },
              { src: "/images/parceiros/Prefeitura%20de%20teresina.png",  alt: "Prefeitura de Teresina" },
              { src: "/images/parceiros/logo-capemisa-social-p.png",      alt: "Capemisa Social" },
              { src: "/images/parceiros/Mesa%20Brasil.png",               alt: "Mesa Brasil" },
            ].map((p) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={p.alt}
                src={p.src}
                alt={p.alt}
                className="h-12 max-w-[22%] object-contain"
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
