import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { initialNews } from "@/lib/content";
import { getPublishedNews } from "@/lib/public-news";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const news = await getPublishedNews();
  const item = [...news, ...initialNews].find((entry) => entry.id === params.id);

  return {
    title: item?.title ?? "Notícia",
    description: item?.description
  };
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const news = await getPublishedNews();
  const item = [...news, ...initialNews].find((entry) => entry.id === params.id);

  if (!item) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="container-page py-10">
        <article className="card mx-auto max-w-3xl p-6">
          <Link href="/#noticias" className="text-sm font-semibold text-primary hover:text-orange-600">
            Voltar para notícias
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase text-primary">{item.subtitle}</p>
          <h1 className="mt-3 text-3xl font-bold uppercase text-gray-950">{item.title}</h1>
          <p className="mt-5 text-base leading-7">{item.description}</p>
          {item.videoUrl ? (
            <a href={item.videoUrl} className="button-primary mt-6" target="_blank" rel="noreferrer">
              Assistir vídeo
            </a>
          ) : null}
        </article>
      </main>
      <Footer />
    </>
  );
}
