"use client";

import { useEffect, useState } from "react";
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
  ShieldCheck,
  ShoppingCart,
  Trash2,
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
  { id: "estudo-caridade-amor",  titulo: "Estudo, Caridade e Amor ao Próximo", autor: "João Nunes Maia", preco: 39.9, descricao: "Reflexões para fortalecer a fé e a prática do bem.",       capa_url: null, estoque: 8 },
  { id: "viver-melhor-opcao",    titulo: "Viver é a Melhor Opção",             autor: "João Nunes Maia", preco: 34.9, descricao: "Mensagens de esperança e renovação interior.",             capa_url: null, estoque: 3 },
  { id: "calma-na-alma",         titulo: "Calma na Alma",                       autor: "João Nunes Maia", preco: 29.9, descricao: "Inspiração para serenidade no dia a dia.",                capa_url: null, estoque: 0 },
  { id: "momentos-reflexao",     titulo: "Momentos de Reflexão",                autor: "João Nunes Maia", preco: 27.9, descricao: "Textos breves para estudo e meditação.",                  capa_url: null, estoque: 5 },
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
  const [books, setBooks]                     = useState<Book[]>(fallbackBooks);
  const [cart, setCart]                       = useState<CartItem[]>([]);
  const [pixCopied, setPixCopied]             = useState(false);
  const [interestMessage, setInterestMessage] = useState<string | null>(null);
  const [cartOpen, setCartOpen]               = useState(false);

  useEffect(() => {
    async function loadBooks() {
      if (!hasSupabaseBrowserConfig()) return;
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("livros")
        .select("id, titulo, autor, preco, descricao, capa_url, estoque")
        .eq("status", "published")
        .order("created_at", { ascending: true });
      if (data?.length) setBooks(data as Book[]);
    }
    loadBooks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal   = cart.reduce((sum, item) => sum + item.book.preco * item.qty, 0);

  function addToCart(book: Book) {
    if (book.estoque <= 0) { registerInterest(book); return; }
    setCart((cur) => {
      const existing = cur.find((i) => i.book.id === book.id);
      if (existing) {
        if (existing.qty >= book.estoque) return cur;
        return cur.map((i) => i.book.id === book.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...cur, { book, qty: 1 }];
    });
    setCartOpen(true);
  }

  function changeQty(id: string, delta: number) {
    setCart((cur) =>
      cur
        .map((i) => i.book.id === id ? { ...i, qty: Math.min(i.book.estoque, i.qty + delta) } : i)
        .filter((i) => i.qty > 0)
    );
  }

  async function registerInterest(book: Book) {
    const nome = window.prompt("Informe seu nome para registrarmos seu interesse:");
    if (!nome?.trim()) return;
    const whatsapp = window.prompt("Informe seu WhatsApp para avisarmos quando houver estoque:");
    if (!hasSupabaseBrowserConfig()) { setInterestMessage("Indisponível no momento."); return; }
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("livro_interesses").insert({
      livro_id: book.id, livro_titulo: book.titulo,
      nome: nome.trim(), whatsapp: whatsapp?.trim() || null,
      observacao: "Interesse registrado pelo site quando o estoque estava zerado.",
    });
    setInterestMessage(error
      ? "Não foi possível registrar o interesse agora."
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
      "*Pedido - Livraria JNM*", "",
      ...cart.map((i) => `${i.qty}x ${i.book.titulo} - ${fmt(i.book.preco * i.qty)}`),
      "", `Total: ${fmt(subtotal)}`, `PIX: ${PIX_KEY}`,
    ];
    window.open(`https://wa.me/558699999999?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  }

  const featuredBook = books[0] ?? fallbackBooks[0];

  return (
    <main className="min-h-screen bg-[#fffaf5] text-gray-950">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-orange-100 bg-[#fffaf5]/90 backdrop-blur">
        <div className="mx-auto flex max-w-screen-2xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4">

          {/* Logo — h-14 w-14 mobile, igual ao header principal */}
          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo%20JNM%20(1).png"
              alt="João Nunes Maia"
              className="h-14 w-14 object-contain"
            />
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-gray-600 sm:text-sm">Sociedade Espírita</p>
              <p className="text-lg font-bold leading-none sm:text-2xl">João Nunes Maia</p>
              <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">Estudo, Caridade e Amor ao Próximo</p>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="ml-auto hidden items-center gap-6 text-sm font-semibold xl:flex">
            {[
              ["Início", "/"],
              ["Palestras", "/#palestras"],
              ["Livros", "/livraria"],
              ["Creche Miranez", "/#creche-miranez"],
              ["Notícias", "/#noticias"],
              ["Contato", "/#contato"],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={`border-b-2 py-1 transition-colors ${label === "Livros" ? "border-primary text-primary" : "border-transparent hover:border-primary hover:text-primary"}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Botão carrinho */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative ml-auto flex items-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-orange-600 sm:ml-0 sm:px-5 sm:py-3 sm:text-base xl:ml-0"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Carrinho</span>
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-violet-600 text-[10px] font-bold text-white ring-2 ring-white sm:h-6 sm:w-6 sm:text-xs">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Conteúdo ────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:px-6 sm:py-8">

        {/* Hero */}
        <section className="relative mb-5 min-h-[260px] overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-white via-[#fff7ed] to-violet-100 p-4 shadow-sm sm:min-h-[380px] sm:rounded-3xl sm:p-8">
          <div className="absolute left-4 top-4 grid grid-cols-4 gap-2 opacity-30 sm:left-5 sm:top-5 sm:gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-violet-300 sm:h-2 sm:w-2" />
            ))}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-[55%] bg-[radial-gradient(circle_at_55%_42%,rgba(168,85,247,.18),transparent_45%)]" />

          <div className="relative z-10 grid h-full gap-6 lg:grid-cols-[1fr_380px]">
            <div className="flex flex-col justify-center">
              <h1 className="max-w-xl text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
                Livros que iluminam e <span className="text-primary">transformam</span>
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-snug text-gray-600 sm:mt-5 sm:text-lg">
                Conhecimento, inspiração e renovação espiritual para o seu dia a dia.
              </p>

              {/* Pills de benefício */}
              <div className="mt-4 flex flex-col gap-2 sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-3">
                {[
                  [BookOpen, "Conteúdo espírita"],
                  [Heart,    "Mensagens de amor"],
                  [Users,    "Crescimento interior"],
                ].map(([Icon, title]) => {
                  const I = Icon as typeof BookOpen;
                  return (
                    <div key={String(title)} className="flex items-center gap-2 rounded-full border border-orange-100 bg-white/80 px-3 py-2 text-xs font-semibold shadow-sm sm:px-4 sm:py-3 sm:text-sm">
                      <I className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                      {String(title)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Livro destaque — apenas desktop */}
            <div className="relative hidden items-end justify-center lg:flex">
              <div className="relative z-10 -mr-4 mb-8 rotate-2">
                <BookCover book={featuredBook} index={0} large />
              </div>
              <div className="absolute bottom-12 right-4 h-48 w-48 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 shadow-xl rotate-6" />
              <div className="absolute bottom-28 right-0 h-48 w-52 rounded-xl bg-gradient-to-br from-white to-orange-50 shadow-xl rotate-6" />
            </div>
          </div>
        </section>

        {/* Catálogo */}
        <section id="livros" className="rounded-2xl border border-orange-100 bg-white/70 p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <h2 className="text-lg font-bold sm:text-2xl">Nossos Livros</h2>
            {/* Filtros apenas sm+ */}
            <div className="hidden gap-2 sm:flex">
              <button className="rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-left text-sm">
                Todas as categorias <span className="ml-1 text-primary">⌄</span>
              </button>
              <button className="rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-left text-sm">
                Mais vendidos <span className="ml-1 text-primary">⌄</span>
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 2xl:grid-cols-4">
            {books.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} onAdd={addToCart} />
            ))}
          </div>

          {interestMessage && (
            <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-semibold text-primary">
              {interestMessage}
            </div>
          )}

          <BenefitStrip />
        </section>
      </div>

      {/* ── Carrinho mobile drawer / desktop panel ─────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex xl:hidden">
          <div className="flex-1 bg-black/50" onClick={() => setCartOpen(false)} />
          <aside className="flex h-full w-full max-w-sm flex-col bg-[#fffaf5] shadow-2xl">
            <div className="flex items-center justify-between border-b border-orange-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Carrinho
                {totalItems > 0 && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-primary">{totalItems}</span>
                )}
              </h2>
              <button onClick={() => setCartOpen(false)} className="rounded-full p-1.5 hover:bg-orange-50 text-gray-500 text-xl leading-none">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-400">
                  <BookOpen className="h-10 w-10 opacity-40" />
                  <p className="text-sm">Nenhum livro no carrinho.</p>
                  <button onClick={() => setCartOpen(false)} className="text-sm font-semibold text-primary hover:underline">Ver catálogo</button>
                </div>
              ) : (
                <>
                  <CartItems cart={cart} onQty={changeQty} />
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal</span><strong>{fmt(subtotal)}</strong></div>
                    <div className="flex justify-between"><span>Frete</span><strong className="text-emerald-600">Grátis</strong></div>
                    <div className="flex justify-between pt-3 text-base font-bold">
                      <span>Total</span><span className="text-primary">{fmt(subtotal)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-orange-100 px-4 py-4 space-y-3">
                <PixPanel compact copied={pixCopied} onCopy={copyPix} onFinish={finishOrder} />
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Desktop: layout lateral */}
      <div className="hidden xl:block">
        <div className="mx-auto max-w-screen-2xl px-6 pb-10">
          <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
            <div>{/* conteúdo já renderizado acima */}</div>
            <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
              <CartPanel cart={cart} subtotal={subtotal} onQty={changeQty} />
              <PixPanel copied={pixCopied} onCopy={copyPix} onFinish={finishOrder} />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function BookCard({ book, index, onAdd }: { book: Book; index: number; onAdd: (b: Book) => void }) {
  return (
    <article className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="mx-auto w-32 sm:w-44">
        <BookCover book={book} index={index} />
      </div>
      <h3 className="mt-4 text-base font-bold leading-snug sm:mt-5 sm:text-lg">{book.titulo}</h3>
      <p className="mt-1 text-xs text-gray-500 sm:text-sm">{book.autor}</p>
      <p className={`mt-2 text-xs font-bold sm:mt-3 sm:text-sm ${book.estoque > 0 ? "text-emerald-600" : "text-red-500"}`}>
        {book.estoque > 0 ? `${book.estoque} em estoque` : "Estoque zero"}
      </p>
      <p className="mt-3 text-xl font-bold text-primary sm:mt-4 sm:text-2xl">{fmt(book.preco)}</p>
      <button
        onClick={() => onAdd(book)}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm sm:mt-4 sm:py-3 ${
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
  const theme    = coverThemes[index % coverThemes.length];
  const sizeClass = mini ? "h-24 w-16 sm:h-28 sm:w-20" : large ? "h-64 w-44 sm:h-80 sm:w-56" : "h-48 w-32 sm:h-64 sm:w-44";

  if (book.capa_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={book.capa_url} alt={book.titulo} className={`${sizeClass} rounded-md object-cover shadow-xl`} />;
  }

  return (
    <div className={`${sizeClass} relative overflow-hidden rounded-md bg-gradient-to-br ${theme} ${mini ? "p-2" : "p-4"} text-white shadow-xl`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/15" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <h4 className={`${mini ? "text-[10px]" : large ? "text-2xl sm:text-3xl" : "text-lg sm:text-2xl"} font-serif leading-tight text-white drop-shadow`}>
          {book.titulo}
        </h4>
        {!mini && <p className="text-center text-[10px] font-medium text-white sm:text-xs">{book.autor}</p>}
      </div>
    </div>
  );
}

function CartItems({ cart, onQty }: { cart: CartItem[]; onQty: (id: string, delta: number) => void }) {
  return (
    <ul className="divide-y divide-orange-100">
      {cart.map(({ book, qty }, index) => (
        <li key={book.id} className="grid grid-cols-[56px_1fr_auto] gap-3 py-4 sm:grid-cols-[72px_1fr_auto] sm:gap-4">
          <BookCover book={book} index={index} mini />
          <div>
            <p className="text-sm font-bold leading-snug">{book.titulo}</p>
            <p className="mt-0.5 text-xs text-gray-500">{book.autor}</p>
            <div className="mt-3 inline-flex items-center rounded-lg border border-orange-100">
              <button onClick={() => onQty(book.id, -1)} className="px-2.5 py-1.5 sm:px-3 sm:py-2"><Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></button>
              <span className="px-2 text-sm font-semibold sm:px-3">{qty}</span>
              <button disabled={qty >= book.estoque} onClick={() => onQty(book.id, 1)} className="px-2.5 py-1.5 disabled:opacity-40 sm:px-3 sm:py-2"><Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between">
            <button onClick={() => onQty(book.id, -qty)} aria-label="Remover">
              <Trash2 className="h-4 w-4 text-gray-400 hover:text-primary sm:h-5 sm:w-5" />
            </button>
            <p className="text-sm font-bold sm:text-base">{fmt(book.preco * qty)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CartPanel({ cart, subtotal, onQty }: { cart: CartItem[]; subtotal: number; onQty: (id: string, delta: number) => void }) {
  return (
    <section className="rounded-2xl border border-orange-100 bg-white/75 p-5 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-3 text-xl font-bold sm:text-2xl">
        <ShoppingCart className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
        Seu carrinho
      </h2>
      {cart.length === 0 ? (
        <p className="mt-6 text-sm text-gray-400">Nenhum livro adicionado ainda.</p>
      ) : (
        <>
          <CartItems cart={cart} onQty={onQty} />
          <div className="mt-4 space-y-2 text-sm sm:text-base">
            <div className="flex justify-between"><span>Subtotal</span><strong>{fmt(subtotal)}</strong></div>
            <div className="flex justify-between"><span>Frete</span><strong className="text-emerald-600">Grátis</strong></div>
            <div className="flex justify-between pt-4 text-lg font-bold sm:text-xl">
              <span>Total</span><span className="text-primary">{fmt(subtotal)}</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function PixPanel({ copied, onCopy, onFinish, compact = false }: { copied: boolean; onCopy: () => void; onFinish: () => void; compact?: boolean }) {
  return (
    <section className={`rounded-2xl border border-orange-100 bg-white/75 shadow-sm ${compact ? "p-4" : "p-5 sm:p-6"}`}>
      {!compact && (
        <h2 className="flex items-center gap-3 text-lg font-bold sm:text-xl">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500 text-sm text-white sm:h-8 sm:w-8">◆</span>
          Pagamento via PIX
        </h2>
      )}

      <div className={`${compact ? "" : "mt-4"} grid gap-4 sm:grid-cols-[100px_1fr]`}>
        <div className="hidden h-28 w-28 place-items-center rounded-xl border border-orange-100 bg-white p-2 sm:grid">
          <div className="h-24 w-24 bg-[repeating-linear-gradient(45deg,#111_0_3px,#fff_3px_6px)] opacity-70" />
        </div>
        <div>
          <p className="text-xs text-gray-500 sm:text-sm">Chave PIX (Copia e Cola)</p>
          <button
            onClick={onCopy}
            className="mt-2 flex w-full items-center justify-between rounded-xl border border-orange-100 bg-white px-3 py-2.5 text-xs font-semibold sm:mt-3 sm:px-4 sm:text-sm"
          >
            <span className="truncate">{PIX_KEY}</span>
            {copied ? <Check className="ml-2 h-4 w-4 shrink-0 text-emerald-600" /> : <Copy className="ml-2 h-4 w-4 shrink-0 text-gray-400" />}
          </button>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-orange-50 p-3 text-xs text-gray-600 sm:p-4 sm:text-sm">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
          Ao realizar o pagamento, você receberá a confirmação por e-mail.
        </div>
      )}

      <button
        onClick={onFinish}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-orange-600 sm:py-4 sm:text-base"
      >
        <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
        Finalizar compra via WhatsApp
      </button>
    </section>
  );
}

function BenefitStrip() {
  const items = [
    [Package,    "Entrega para todo o Brasil", "Envio rápido e seguro"],
    [ShieldCheck,"Pagamento seguro",            "Ambiente 100% protegido"],
    [Headphones, "Dúvidas?",                    "Fale conosco pelo WhatsApp"],
    [Heart,      "Compre com propósito",        "Sua compra faz a diferença"],
  ];

  return (
    <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-orange-100 bg-white p-4 sm:mt-6 sm:grid-cols-4 sm:p-5">
      {items.map(([Icon, title, subtitle]) => {
        const I = Icon as typeof Package;
        return (
          <div key={String(title)} className="flex items-start gap-2 sm:items-center sm:gap-3">
            <I className="mt-0.5 h-5 w-5 shrink-0 text-primary sm:mt-0 sm:h-7 sm:w-7" />
            <p className="text-xs font-bold leading-snug">
              {String(title)}
              <span className="block font-normal text-gray-500">{String(subtitle)}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
