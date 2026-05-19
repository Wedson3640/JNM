"use client";

import { useState } from "react";
import {
  BookOpen, Check, Copy, FileCheck, Heart, Headphones,
  Lock, MapPin, Minus, Package, Phone, Plus,
  ShieldCheck, ShoppingCart, Trash2, Users, X,
} from "lucide-react";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase-browser";
import { buildPixPayload, pixQrImage, PIX_RECEIVER } from "@/lib/pix";

const WHATSAPP_NUMBER = "558694831739";
const PIX_QR_IMAGE    = "/images/pix-qrcode.svg";

export interface Book {
  id: string;
  titulo: string;
  autor: string;
  preco: number;
  descricao: string;
  capa_url: string | null;
  estoque: number;
}

interface CartItem    { book: Book; qty: number; }
interface CustomerData { nome: string; whatsapp: string; endereco: string; observacao: string; }

const coverThemes = [
  "from-orange-100 via-amber-200 to-orange-600",
  "from-violet-900 via-purple-500 to-orange-300",
  "from-sky-200 via-blue-100 to-yellow-200",
  "from-stone-100 via-amber-100 to-yellow-500",
];

function fmt(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function BookCover({ book, index, large = false, mini = false }: { book: Book; index: number; large?: boolean; mini?: boolean }) {
  const theme     = coverThemes[index % coverThemes.length];
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

function PixPanel({ copied, onCopy, onFinish, pixPayload, qrImage, subtotal, compact = false }: {
  copied: boolean; onCopy: () => void; onFinish: () => void;
  pixPayload: string; qrImage: string; subtotal: number; compact?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-orange-100 bg-white/75 shadow-sm ${compact ? "p-4" : "p-5 sm:p-6"}`}>
      {!compact && (
        <h2 className="flex items-center gap-3 text-lg font-bold sm:text-xl">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500 text-sm text-white sm:h-8 sm:w-8">◆</span>
          Pagamento via PIX
        </h2>
      )}
      <div className={`${compact ? "" : "mt-4"} grid gap-4 sm:grid-cols-[100px_1fr]`}>
        <div className="grid h-28 w-28 place-items-center rounded-xl border border-orange-100 bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrImage} alt={`QR Code Pix no valor de ${fmt(subtotal)}`} className="h-24 w-24 object-contain"
            onError={(e) => { e.currentTarget.src = PIX_QR_IMAGE; }} />
        </div>
        <div>
          <p className="text-xs text-gray-500 sm:text-sm">Chave PIX (Copia e Cola)</p>
          <p className="mt-1 text-sm font-semibold text-gray-800">{PIX_RECEIVER}</p>
          <p className="mt-1 text-xs font-bold text-primary">Valor: {fmt(subtotal)}</p>
          <button onClick={onCopy}
            className="mt-2 flex w-full items-start justify-between gap-2 rounded-xl border border-orange-100 bg-white px-3 py-2.5 text-left text-xs font-semibold sm:mt-3 sm:px-4">
            <span className="max-h-16 min-w-0 flex-1 overflow-y-auto break-all leading-relaxed">{pixPayload}</span>
            {copied ? <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" /> : <Copy className="mt-1 h-4 w-4 shrink-0 text-gray-400" />}
          </button>
        </div>
      </div>
      {!compact && (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-orange-50 p-3 text-xs text-gray-600 sm:p-4 sm:text-sm">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
          Ao realizar o pagamento, você receberá a confirmação por e-mail.
        </div>
      )}
      <button onClick={onFinish}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-orange-600 sm:py-4 sm:text-base">
        <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
        Finalizar compra
      </button>
    </section>
  );
}

function CheckoutModal({ cart, subtotal, customer, copied, message, onCopy, onClose, onCustomerChange, onFinish, pixPayload, qrImage }: {
  cart: CartItem[]; subtotal: number; customer: CustomerData; copied: boolean;
  message: { text: string; ok: boolean } | null;
  onCopy: () => void; onClose: () => void;
  onCustomerChange: (d: CustomerData) => void; onFinish: () => void;
  pixPayload: string; qrImage: string;
}) {
  function update(field: keyof CustomerData, value: string) {
    onCustomerChange({ ...customer, [field]: value });
  }
  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-black/55 p-0 sm:items-center sm:justify-center sm:p-6">
      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-[#fffaf5] shadow-2xl sm:max-w-3xl sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-orange-100 bg-[#fffaf5]/95 px-5 py-4 backdrop-blur sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Pagamento via Pix</p>
            <h2 className="text-lg font-extrabold text-gray-950 sm:text-2xl">Finalize seu pedido</h2>
          </div>
          <button type="button" aria-label="Fechar" onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-orange-100 bg-white text-gray-500 hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[280px_1fr] sm:p-6">
          <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="mx-auto grid h-56 w-56 place-items-center rounded-2xl border border-orange-100 bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImage} alt={`QR Code Pix no valor de ${fmt(subtotal)}`} className="h-full w-full object-contain"
                onError={(e) => { e.currentTarget.src = PIX_QR_IMAGE; }} />
            </div>
            <p className="mt-4 text-xs text-gray-500">Chave Pix Copia e Cola</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">{PIX_RECEIVER}</p>
            <p className="mt-1 text-sm font-bold text-primary">Valor: {fmt(subtotal)}</p>
            <button type="button" onClick={onCopy}
              className="mt-3 flex w-full items-start justify-between gap-2 rounded-xl border border-orange-100 bg-[#fffaf5] px-4 py-3 text-left text-xs font-bold sm:text-sm">
              <span className="max-h-20 min-w-0 flex-1 overflow-y-auto break-all leading-relaxed">{pixPayload}</span>
              {copied ? <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" /> : <Copy className="mt-1 h-4 w-4 shrink-0 text-gray-400" />}
            </button>
            <div className="mt-4 rounded-xl bg-orange-50 p-3 text-xs text-gray-600">
              Depois do pagamento, toque no botao do WhatsApp e anexe o comprovante na conversa.
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-extrabold text-gray-900">Dados do cliente</h3>
              <div className="mt-4 grid gap-3">
                {[
                  { id: "checkout-nome",      field: "nome" as const,      label: "Nome",      icon: Users,   placeholder: "" },
                  { id: "checkout-whatsapp",  field: "whatsapp" as const,  label: "WhatsApp",  icon: Phone,   placeholder: "(86) 99999-9999" },
                  { id: "checkout-endereco",  field: "endereco" as const,  label: "Endereço",  icon: MapPin,  placeholder: "" },
                ].map(({ id, field, label, icon: Icon, placeholder }) => (
                  <label key={field} className="block text-xs font-bold text-gray-600" htmlFor={id}>
                    {label}
                    <span className="mt-1 flex items-center gap-2 rounded-xl border border-orange-100 bg-[#fffaf5] px-3">
                      <Icon className="h-4 w-4 text-primary" />
                      <input id={id} value={customer[field]} onChange={(e) => update(field, e.target.value)} placeholder={placeholder}
                        className="w-full bg-transparent py-3 text-sm text-gray-950 outline-none" />
                    </span>
                  </label>
                ))}
                <label className="block text-xs font-bold text-gray-600" htmlFor="checkout-observacao">
                  Observação
                  <textarea id="checkout-observacao" value={customer.observacao} onChange={(e) => update("observacao", e.target.value)}
                    className="mt-1 min-h-20 w-full rounded-xl border border-orange-100 bg-[#fffaf5] px-3 py-3 text-sm text-gray-950 outline-none" />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-extrabold text-gray-900">Resumo</h3>
              <div className="mt-3 space-y-2 text-sm">
                {cart.map((item) => (
                  <div key={item.book.id} className="flex justify-between gap-3">
                    <span className="text-gray-600">{item.qty}x {item.book.titulo}</span>
                    <strong>{fmt(item.book.preco * item.qty)}</strong>
                  </div>
                ))}
                <div className="flex justify-between border-t border-orange-100 pt-3 text-base font-extrabold">
                  <span>Total</span><span className="text-primary">{fmt(subtotal)}</span>
                </div>
              </div>
            </div>

            {message && (
              <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-primary"}`}>
                {message.text}
              </p>
            )}

            <button type="button" onClick={onFinish}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-sm font-extrabold text-white shadow-md hover:bg-orange-600">
              <FileCheck className="h-5 w-5" />
              Enviar comprovante pelo WhatsApp
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function BenefitStrip() {
  const items: [typeof Package, string, string][] = [
    [Package,     "Entrega para todo o Brasil", "Envio rápido e seguro"],
    [ShieldCheck, "Pagamento seguro",           "Ambiente 100% protegido"],
    [Headphones,  "Dúvidas?",                   "Fale conosco pelo WhatsApp"],
    [Heart,       "Compre com propósito",       "Sua compra faz a diferença"],
  ];
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-orange-100 bg-white p-4 sm:mt-6 sm:grid-cols-4 sm:p-5">
      {items.map(([Icon, title, subtitle]) => (
        <div key={title} className="flex items-start gap-2 sm:items-center sm:gap-3">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary sm:mt-0 sm:h-7 sm:w-7" />
          <p className="text-xs font-bold leading-snug">
            {title}
            <span className="block font-normal text-gray-500">{subtitle}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export function LivrariaClient({ initialBooks }: { initialBooks: Book[] }) {
  const [cart, setCart]                 = useState<CartItem[]>([]);
  const [pixCopied, setPixCopied]       = useState(false);
  const [interestMsg, setInterestMsg]   = useState<string | null>(null);
  const [cartOpen, setCartOpen]         = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderMsg, setOrderMsg]         = useState<{ text: string; ok: boolean } | null>(null);
  const [customer, setCustomer]         = useState<CustomerData>({ nome: "", whatsapp: "", endereco: "", observacao: "" });

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal   = cart.reduce((s, i) => s + i.book.preco * i.qty, 0);
  const pixPayload = buildPixPayload(subtotal);
  const pixQrUrl   = pixQrImage(pixPayload);

  function addToCart(book: Book) {
    if (book.estoque <= 0) { registerInterest(book); return; }
    setCart((cur) => {
      const ex = cur.find((i) => i.book.id === book.id);
      if (ex) {
        if (ex.qty >= book.estoque) return cur;
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
    if (!hasSupabaseBrowserConfig()) { setInterestMsg("Indisponível no momento."); return; }
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("livro_interesses").insert({
      livro_id: book.id, livro_titulo: book.titulo,
      nome: nome.trim(), whatsapp: whatsapp?.trim() || null,
      observacao: "Interesse registrado pelo site quando o estoque estava zerado.",
    });
    setInterestMsg(error
      ? "Não foi possível registrar o interesse agora."
      : `Interesse registrado em "${book.titulo}". Avisaremos quando houver estoque.`);
  }

  function copyPix() {
    navigator.clipboard.writeText(pixPayload);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  }

  function openCheckout() {
    if (cart.length === 0) return;
    setOrderMsg(null);
    setCheckoutOpen(true);
  }

  async function finishOrder() {
    if (!customer.nome.trim() || !customer.whatsapp.trim()) {
      setOrderMsg({ text: "Informe nome e WhatsApp para finalizar.", ok: false });
      return;
    }

    const lines = [
      "*Pedido - Livraria JNM*", "",
      `Cliente: ${customer.nome.trim()}`,
      `WhatsApp: ${customer.whatsapp.trim()}`,
      customer.endereco.trim()   ? `Endereco: ${customer.endereco.trim()}`   : null,
      customer.observacao.trim() ? `Observacao: ${customer.observacao.trim()}` : null,
      "", ...cart.map((i) => `${i.qty}x ${i.book.titulo} - ${fmt(i.book.preco * i.qty)}`),
      "", `Total: ${fmt(subtotal)}`, `PIX copia e cola: ${pixPayload}`, `Favorecido: ${PIX_RECEIVER}`,
      "", "Comprovante: anexar nesta conversa para conferencia.",
    ].filter(Boolean) as string[];

    if (hasSupabaseBrowserConfig()) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("livro_pedidos").insert({
        nome_cliente: customer.nome.trim(), whatsapp: customer.whatsapp.trim(),
        endereco: customer.endereco.trim() || null, observacao: customer.observacao.trim() || null,
        itens: cart.map((item) => ({
          livro_id: item.book.id, titulo: item.book.titulo,
          quantidade: item.qty, preco_unitario: item.book.preco, total: item.book.preco * item.qty,
        })),
        subtotal, total: subtotal, pix_key: pixPayload, pix_receiver: PIX_RECEIVER,
        status: "em_conferencia", comprovante_status: "aguardando_conferencia",
      });
      setOrderMsg(error
        ? { text: "Nao foi possivel gravar o pedido, mas o WhatsApp sera aberto.", ok: false }
        : { text: "Pedido gravado para conferencia do comprovante.", ok: true });
    }
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  }

  const featuredBook = initialBooks[0];

  return (
    <main className="min-h-screen bg-[#fffaf5] text-gray-950">

      {/* Floating cart button — hidden on xl where sidebar is always visible */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-orange-600 xl:hidden"
      >
        <ShoppingCart className="h-5 w-5" />
        <span>Carrinho</span>
        {totalItems > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-violet-600 text-[10px] font-bold text-white ring-2 ring-white">
            {totalItems}
          </span>
        )}
      </button>

      {/* Conteúdo */}
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
              <div className="mt-4 flex flex-col gap-2 sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-3">
                {([[BookOpen, "Conteúdo espírita"], [Heart, "Mensagens de amor"], [Users, "Crescimento interior"]] as [typeof BookOpen, string][]).map(([Icon, title]) => (
                  <div key={title} className="flex items-center gap-2 rounded-full border border-orange-100 bg-white/80 px-3 py-2 text-xs font-semibold shadow-sm sm:px-4 sm:py-3 sm:text-sm">
                    <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                    {title}
                  </div>
                ))}
              </div>
            </div>

            {featuredBook && (
              <div className="relative hidden items-end justify-center lg:flex">
                <div className="relative z-10 -mr-4 mb-8 rotate-2">
                  <BookCover book={featuredBook} index={0} large />
                </div>
                <div className="absolute bottom-12 right-4 h-48 w-48 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 shadow-xl rotate-6" />
                <div className="absolute bottom-28 right-0 h-48 w-52 rounded-xl bg-gradient-to-br from-white to-orange-50 shadow-xl rotate-6" />
              </div>
            )}
          </div>
        </section>

        {/* Catálogo */}
        <section id="livros" className="rounded-2xl border border-orange-100 bg-white/70 p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <h2 className="text-lg font-bold sm:text-2xl">Nossos Livros</h2>
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
            {initialBooks.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} onAdd={addToCart} />
            ))}
          </div>

          {interestMsg && (
            <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-semibold text-primary">
              {interestMsg}
            </div>
          )}
          <BenefitStrip />
        </section>
      </div>

      {/* Carrinho mobile */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex xl:hidden">
          <div className="flex-1 bg-black/50" onClick={() => setCartOpen(false)} />
          <aside className="flex h-full w-full max-w-sm flex-col bg-[#fffaf5] shadow-2xl">
            <div className="flex items-center justify-between border-b border-orange-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Carrinho
                {totalItems > 0 && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-primary">{totalItems}</span>}
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
                <PixPanel compact copied={pixCopied} onCopy={copyPix} onFinish={openCheckout} pixPayload={pixPayload} qrImage={pixQrUrl} subtotal={subtotal} />
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Desktop: painel lateral */}
      <div className="hidden xl:block">
        <div className="mx-auto max-w-screen-2xl px-6 pb-10">
          <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
            <div />
            <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
              <CartPanel cart={cart} subtotal={subtotal} onQty={changeQty} />
              <PixPanel copied={pixCopied} onCopy={copyPix} onFinish={openCheckout} pixPayload={pixPayload} qrImage={pixQrUrl} subtotal={subtotal} />
            </aside>
          </div>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutModal
          cart={cart} subtotal={subtotal} customer={customer} copied={pixCopied} message={orderMsg}
          onCopy={copyPix} onClose={() => setCheckoutOpen(false)} onCustomerChange={setCustomer}
          onFinish={finishOrder} pixPayload={pixPayload} qrImage={pixQrUrl}
        />
      )}
    </main>
  );
}
