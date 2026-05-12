"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Copy,
  Heart,
  Headphones,
  Lock,
  Minus,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase-browser";

interface Book {
  id: string;
  titulo: string;
  autor: string;
  preco: number;
  descricao: string;
  capa_url: string | null;
  estoque: number;
}

interface CartItem {
  book: Book;
  qty: number;
}

const PIX_KEY = "jnm@joaonunesmaia.org.br";

const fallbackBooks: Book[] = [
  {
    id: "estudo-caridade-amor",
    titulo: "Estudo, Caridade e Amor ao Próximo",
    autor: "João Nunes Maia",
    preco: 39.9,
    descricao: "Reflexões para fortalecer a fé e a prática do bem.",
    capa_url: null,
    estoque: 8,
  },
  {
    id: "viver-melhor-opcao",
    titulo: "Viver é a Melhor Opção",
    autor: "João Nunes Maia",
    preco: 34.9,
    descricao: "Mensagens de esperança e renovação interior.",
    capa_url: null,
    estoque: 3,
  },
  {
    id: "calma-na-alma",
    titulo: "Calma na Alma",
    autor: "João Nunes Maia",
    preco: 29.9,
    descricao: "Inspiração para serenidade no dia a dia.",
    capa_url: null,
    estoque: 0,
  },
  {
    id: "momentos-reflexao",
    titulo: "Momentos de Reflexão",
    autor: "João Nunes Maia",
    preco: 27.9,
    descricao: "Textos breves para estudo e meditação.",
    capa_url: null,
    estoque: 5,
  },
];

const coverThemes = [
  "from-orange-100 via-amber-200 to-orange-600",
  "from-violet-900 via-purple-500 to-orange-300",
  "from-sky-200 via-blue-100 to-yellow-200",
  "from-stone-100 via-amber-100 to-yellow-500",
];

function fmt(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function LivrariaPage() {
  const [books, setBooks] = useState<Book[]>(fallbackBooks);
  const [cart, setCart] = useState<CartItem[]>([
    { book: fallbackBooks[0], qty: 1 },
    { book: fallbackBooks[1], qty: 1 },
  ]);
  const [pixCopied, setPixCopied] = useState(false);
  const [interestMessage, setInterestMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBooks() {
      if (!hasSupabaseBrowserConfig()) {
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("livros")
        .select("id, titulo, autor, preco, descricao, capa_url, estoque")
        .eq("status", "published")
        .order("created_at", { ascending: true });

      if (data?.length) {
        const loadedBooks = data as Book[];
        setBooks(loadedBooks);
        setCart(loadedBooks.slice(0, 2).map((book) => ({ book, qty: 1 })));
      }
    }

    loadBooks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.book.preco * item.qty, 0);

  const featuredBook = books[0] ?? fallbackBooks[0];
  const stackedBook = books[1] ?? fallbackBooks[1];

  function addToCart(book: Book) {
    if (book.estoque <= 0) {
      registerInterest(book);
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.book.id === book.id);
      if (existing) {
        if (existing.qty >= book.estoque) return current;
        return current.map((item) => item.book.id === book.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...current, { book, qty: 1 }];
    });
  }

  function changeQty(id: string, delta: number) {
    setCart((current) =>
      current
        .map((item) => item.book.id === id ? { ...item, qty: Math.min(item.book.estoque, item.qty + delta) } : item)
        .filter((item) => item.qty > 0)
    );
  }

  async function registerInterest(book: Book) {
    const nome = window.prompt("Informe seu nome para registrarmos seu interesse neste livro:");
    if (!nome?.trim()) return;

    const whatsapp = window.prompt("Informe seu WhatsApp para avisarmos quando houver estoque:");

    if (!hasSupabaseBrowserConfig()) {
      setInterestMessage("Cadastro de interesse indisponível no momento. Tente novamente mais tarde.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("livro_interesses").insert({
      livro_id: book.id,
      livro_titulo: book.titulo,
      nome: nome.trim(),
      whatsapp: whatsapp?.trim() || null,
      observacao: "Interesse registrado pelo site quando o estoque estava zerado."
    });

    setInterestMessage(
      error
        ? "Não foi possível registrar o interesse agora. Tente novamente."
        : `Interesse registrado em "${book.titulo}". Avisaremos quando houver estoque.`
    );
  }

  function copyPix() {
    navigator.clipboard.writeText(PIX_KEY);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  }

  function finishOrder() {
    const lines = [
      "*Pedido - Livraria JNM*",
      "",
      ...cart.map((item) => `${item.qty}x ${item.book.titulo} - ${fmt(item.book.preco * item.qty)}`),
      "",
      `Total: ${fmt(subtotal)}`,
      `PIX: ${PIX_KEY}`,
    ];
    window.open(`https://wa.me/558699999999?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  }

  return (
    <main className="min-h-screen bg-[#fffaf5] text-gray-950">
      <header className="sticky top-0 z-40 border-b border-orange-100 bg-[#fffaf5]/90 backdrop-blur">
        <div className="mx-auto flex max-w-screen-2xl items-center gap-8 px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo%20JNM%20(1).png" alt="João Nunes Maia" className="h-16 w-auto object-contain" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold">Sociedade Espírita</p>
              <p className="text-3xl font-bold leading-none">João Nunes Maia</p>
              <p className="mt-1 text-xs text-gray-600">Estudo, Caridade e Amor ao Próximo</p>
            </div>
          </Link>

          <nav className="ml-auto hidden items-center gap-9 text-base font-semibold xl:flex">
            {[
              ["Início", "/"],
              ["Palestras", "/#palestras"],
              ["Livros", "/livraria"],
              ["Creche Miranez", "/#creche-miranez"],
              ["Notícias", "/#noticias"],
              ["Eventos", "/#eventos"],
              ["Sobre", "/#a-casa"],
              ["Contato", "/#contato"],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={`border-b-2 py-2 ${label === "Livros" ? "border-primary text-primary" : "border-transparent hover:border-primary hover:text-primary"}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-5 xl:ml-0">
            <button aria-label="Buscar" className="rounded-full p-2 hover:bg-orange-50">
              <Search className="h-8 w-8" />
            </button>
            <button aria-label="Conta" className="rounded-full p-2 hover:bg-orange-50">
              <User className="h-8 w-8" />
            </button>
            <a href="#carrinho" className="relative flex items-center gap-3 rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-white shadow-md hover:bg-orange-600">
              <ShoppingCart className="h-6 w-6" />
              Carrinho
              {totalItems ? (
                <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-orange-600 text-sm text-white ring-2 ring-white">
                  {totalItems}
                </span>
              ) : null}
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-screen-2xl gap-8 px-6 py-8 xl:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <HeroStore featuredBook={featuredBook} stackedBook={stackedBook} />

          <section id="livros" className="rounded-3xl border border-orange-100 bg-white/70 p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold">Nossos Livros</h2>
              <div className="flex gap-3">
                <button className="min-w-48 rounded-xl border border-orange-100 bg-white px-4 py-3 text-left text-sm">
                  Todas as categorias <span className="float-right text-primary">⌄</span>
                </button>
                <button className="min-w-44 rounded-xl border border-orange-100 bg-white px-4 py-3 text-left text-sm">
                  Mais vendidos <span className="float-right text-primary">⌄</span>
                </button>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
              {books.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} onAdd={addToCart} />
              ))}
            </div>

            {interestMessage ? (
              <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-semibold text-primary">
                {interestMessage}
              </div>
            ) : null}

            <BenefitStrip />
          </section>
        </section>

        <aside id="carrinho" className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <CartPanel cart={cart} subtotal={subtotal} onQty={changeQty} />
          <PixPanel copied={pixCopied} onCopy={copyPix} onFinish={finishOrder} />
        </aside>
      </div>
    </main>
  );
}

function HeroStore({ featuredBook, stackedBook }: { featuredBook: Book; stackedBook: Book }) {
  return (
    <section className="relative min-h-[430px] overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-white via-[#fff7ed] to-violet-100 p-8 shadow-sm">
      <div className="absolute left-5 top-5 grid grid-cols-4 gap-3 opacity-40">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index} className="h-2 w-2 rounded-full bg-violet-300" />
        ))}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 h-full w-[55%] bg-[radial-gradient(circle_at_55%_42%,rgba(168,85,247,.24),transparent_45%)]" />
      <svg className="pointer-events-none absolute right-0 top-0 h-full w-3/5 opacity-50" viewBox="0 0 560 430" fill="none">
        <path d="M240 -40 C160 85 142 232 250 430" stroke="white" strokeWidth="4" />
        <path d="M420 80 C380 170 385 268 462 340" stroke="#c084fc" strokeOpacity=".22" strokeWidth="64" strokeLinecap="round" />
        <path d="M386 130 C330 170 292 218 270 286" stroke="#a855f7" strokeOpacity=".15" strokeWidth="2" />
        <ellipse cx="330" cy="180" rx="18" ry="70" fill="#a855f7" opacity=".12" transform="rotate(28 330 180)" />
        <ellipse cx="405" cy="210" rx="20" ry="74" fill="#a855f7" opacity=".11" transform="rotate(-30 405 210)" />
        <ellipse cx="335" cy="295" rx="18" ry="68" fill="#a855f7" opacity=".1" transform="rotate(48 335 295)" />
      </svg>

      <div className="relative z-10 grid h-full gap-8 lg:grid-cols-[1fr_430px]">
        <div className="flex flex-col justify-center pt-14 lg:pt-0">
          <h1 className="max-w-xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Livros que iluminam e <span className="text-primary">transformam</span>
          </h1>
          <p className="mt-6 max-w-lg text-2xl leading-snug text-gray-700">
            Conhecimento, inspiração e renovação espiritual para o seu dia a dia.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            {[
              [BookOpen, "Conteúdo espírita", "com profundidade"],
              [Heart, "Mensagens de amor", "e esperança"],
              [Users, "Recursos para o", "seu crescimento"],
            ].map(([Icon, title, subtitle]) => {
              const BenefitIcon = Icon as typeof BookOpen;
              return (
                <div key={String(title)} className="flex min-w-[210px] items-center gap-3 rounded-full border border-orange-100 bg-white/72 px-5 py-4 shadow-sm">
                  <BenefitIcon className="h-8 w-8 text-primary" />
                  <p className="text-sm font-semibold">
                    {String(title)}
                    <span className="block font-normal">{String(subtitle)}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative hidden items-end justify-center lg:flex">
          <div className="absolute bottom-2 right-0 h-24 w-72 rounded-[100%] bg-orange-200/40 blur-xl" />
          <div className="relative z-10 -mr-4 mb-8 rotate-2">
            <BookCover book={featuredBook} index={0} large />
          </div>
          <div className="absolute bottom-12 right-4 h-48 w-48 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 shadow-xl rotate-6" />
          <div className="absolute bottom-28 right-0 h-48 w-52 rounded-xl bg-gradient-to-br from-white to-orange-50 shadow-xl rotate-6" />
          <div className="absolute bottom-44 right-10 h-44 w-48 rounded-xl bg-gradient-to-br from-stone-100 to-orange-50 shadow-xl rotate-6 opacity-95" />
        </div>
      </div>
    </section>
  );
}

function BookCard({ book, index, onAdd }: { book: Book; index: number; onAdd: (book: Book) => void }) {
  return (
    <article className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="mx-auto w-44">
        <BookCover book={book} index={index} />
      </div>
      <h3 className="mt-5 text-lg font-bold leading-snug">{book.titulo}</h3>
      <p className="mt-2 text-sm text-gray-600">{book.autor}</p>
      <p className={`mt-3 text-sm font-bold ${book.estoque > 0 ? "text-emerald-600" : "text-red-500"}`}>
        {book.estoque > 0 ? `${book.estoque} em estoque` : "Estoque zero"}
      </p>
      <p className="mt-4 text-2xl font-bold text-primary">{fmt(book.preco)}</p>
      <button
        onClick={() => onAdd(book)}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm ${
          book.estoque > 0 ? "bg-primary hover:bg-orange-600" : "bg-violet-600 hover:bg-violet-700"
        }`}
      >
        <ShoppingCart className="h-4 w-4" />
        {book.estoque > 0 ? "Adicionar ao carrinho" : "Tenho interesse"}
      </button>
    </article>
  );
}

function BookCover({ book, index, large = false, mini = false }: { book: Book; index: number; large?: boolean; mini?: boolean }) {
  const theme = coverThemes[index % coverThemes.length];
  const sizeClass = mini ? "h-28 w-20" : large ? "h-80 w-56" : "h-64 w-44";

  if (book.capa_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={book.capa_url}
        alt={book.titulo}
        className={`${sizeClass} rounded-md object-cover shadow-xl`}
      />
    );
  }

  return (
    <div className={`${sizeClass} relative overflow-hidden rounded-md bg-gradient-to-br ${theme} ${mini ? "p-2" : "p-5"} text-white shadow-xl`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/15" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,.45),transparent_35%)]" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <h4 className={`${mini ? "text-xs" : large ? "text-3xl" : "text-2xl"} font-serif leading-tight text-white drop-shadow`}>
          {book.titulo}
        </h4>
        {!mini ? <p className="text-center text-xs font-medium text-white">{book.autor}</p> : null}
      </div>
    </div>
  );
}

function CartPanel({
  cart,
  subtotal,
  onQty,
}: {
  cart: CartItem[];
  subtotal: number;
  onQty: (id: string, delta: number) => void;
}) {
  return (
    <section className="rounded-2xl border border-orange-100 bg-white/75 p-6 shadow-sm">
      <h2 className="flex items-center gap-3 text-2xl font-bold">
        <ShoppingCart className="h-7 w-7 text-primary" />
        Seu carrinho
      </h2>
      <div className="mt-6 divide-y divide-orange-100">
        {cart.map(({ book, qty }, index) => (
          <article key={book.id} className="grid grid-cols-[72px_1fr_auto] gap-4 py-5">
            <BookCover book={book} index={index} mini />
            <div>
              <h3 className="font-bold leading-snug">{book.titulo}</h3>
              <p className="mt-1 text-sm text-gray-600">{book.autor}</p>
              <div className="mt-4 inline-flex items-center rounded-lg border border-orange-100">
                <button onClick={() => onQty(book.id, -1)} className="px-3 py-2"><Minus className="h-4 w-4" /></button>
                <span className="px-3 font-semibold">{qty}</span>
                <button disabled={qty >= book.estoque} onClick={() => onQty(book.id, 1)} className="px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button onClick={() => onQty(book.id, -qty)} aria-label="Remover item">
                <Trash2 className="h-5 w-5 text-gray-500 hover:text-primary" />
              </button>
              <p className="font-bold">{fmt(book.preco * qty)}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 space-y-3 text-base">
        <div className="flex justify-between"><span>Subtotal</span><strong>{fmt(subtotal)}</strong></div>
        <div className="flex justify-between"><span>Frete</span><strong className="text-emerald-600">Grátis</strong></div>
        <div className="flex justify-between pt-4 text-xl font-bold">
          <span>Total</span>
          <span className="text-2xl text-primary">{fmt(subtotal)}</span>
        </div>
      </div>
    </section>
  );
}

function PixPanel({ copied, onCopy, onFinish }: { copied: boolean; onCopy: () => void; onFinish: () => void }) {
  return (
    <section className="rounded-2xl border border-orange-100 bg-white/75 p-6 shadow-sm">
      <h2 className="flex items-center gap-3 text-xl font-bold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-white">◆</span>
        Pagamento via PIX
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-gray-600">
        Escaneie o QR Code ou copie o código PIX para concluir o pagamento.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-[120px_1fr]">
        <div className="grid h-32 w-32 place-items-center rounded-xl border border-orange-100 bg-white p-2">
          <div className="h-28 w-28 bg-[repeating-linear-gradient(45deg,#111_0_4px,#fff_4px_8px)] opacity-80" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Chave PIX (Copia e Cola)</p>
          <button
            onClick={onCopy}
            className="mt-3 flex w-full items-center justify-between rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold"
          >
            {PIX_KEY}
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl bg-orange-50 p-4 text-sm text-gray-600">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        Ao realizar o pagamento, você receberá a confirmação por e-mail.
      </div>

      <button
        onClick={onFinish}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-lg font-bold text-white shadow-md hover:bg-orange-600"
      >
        <Lock className="h-5 w-5" />
        Finalizar compra
      </button>
    </section>
  );
}

function BenefitStrip() {
  const items = [
    [Package, "Entrega para todo o Brasil", "Envio rápido e seguro"],
    [ShieldCheck, "Pagamento seguro", "Ambiente 100% protegido"],
    [Headphones, "Dúvidas?", "Fale conosco pelo WhatsApp"],
    [Heart, "Compre com propósito", "Sua compra faz a diferença"],
  ];

  return (
    <div className="mt-6 grid gap-4 rounded-2xl border border-orange-100 bg-white p-5 md:grid-cols-4">
      {items.map(([Icon, title, subtitle]) => {
        const BenefitIcon = Icon as typeof Package;
        return (
          <div key={String(title)} className="flex items-center gap-3 border-orange-100 md:border-r md:last:border-r-0">
            <BenefitIcon className="h-8 w-8 shrink-0 text-primary" />
            <p className="text-sm font-bold">
              {String(title)}
              <span className="block font-normal text-gray-600">{String(subtitle)}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
