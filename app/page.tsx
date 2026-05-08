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

export default async function HomePage() {
  const [news, videosByPlatform, siteData] = await Promise.all([
    getPublishedNews(),
    getPublishedVideos(),
    getPublicSiteData()
  ]);

  return (
    <>
      <Header />
      <main className="container-page space-y-5 py-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-6 xl:grid-cols-12">
          <div className="md:col-span-3 xl:col-span-3">
            <FraternalCareCard items={siteData.fraternalCare} />
          </div>
          <div className="md:col-span-6 xl:col-span-6">
            <HeroCarousel slides={siteData.heroSlides} />
          </div>
          <div className="md:col-span-3 xl:col-span-3">
            <WeeklyScheduleCard items={siteData.weeklySchedule} />
          </div>
        </div>
        <VideoSection videosByPlatform={videosByPlatform} />
        <NewsAreasEvents news={news} areas={siteData.houseAreas} events={siteData.events} />
        <StudiesPartners studyGroups={siteData.studyGroups} partners={siteData.partners} />
      </main>
      <Footer />
    </>
  );
}
