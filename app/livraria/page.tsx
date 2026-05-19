import { createClient } from "@supabase/supabase-js";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LivrariaClient, type Book } from "@/components/livraria/livraria-client";

const fallbackBooks: Book[] = [
  { id: "estudo-caridade-amor", titulo: "Estudo, Caridade e Amor ao Próximo", autor: "João Nunes Maia", preco: 39.9, descricao: "Reflexões para fortalecer a fé e a prática do bem.",  capa_url: null, estoque: 8 },
  { id: "viver-melhor-opcao",   titulo: "Viver é a Melhor Opção",             autor: "João Nunes Maia", preco: 34.9, descricao: "Mensagens de esperança e renovação interior.",        capa_url: null, estoque: 3 },
  { id: "calma-na-alma",        titulo: "Calma na Alma",                       autor: "João Nunes Maia", preco: 29.9, descricao: "Inspiração para serenidade no dia a dia.",           capa_url: null, estoque: 0 },
  { id: "momentos-reflexao",    titulo: "Momentos de Reflexão",                autor: "João Nunes Maia", preco: 27.9, descricao: "Textos breves para estudo e meditação.",             capa_url: null, estoque: 5 },
];

export default async function LivrariaPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let books: Book[] = fallbackBooks;

  if (url && key) {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data } = await supabase
      .from("livros")
      .select("id, titulo, autor, preco, descricao, capa_url, estoque")
      .eq("status", "published")
      .order("created_at", { ascending: true });
    if (data?.length) books = data as Book[];
  }

  return (
    <>
      <Header />
      <LivrariaClient initialBooks={books} />
      <Footer />
    </>
  );
}
