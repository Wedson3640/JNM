"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  TrendingUp, TrendingDown, Wallet, Plus, Pencil, Trash2,
  Search, X, Loader2, Save, ChevronDown, FileDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Receita = {
  id: string;
  data: string;
  origem: string;
  obs: string | null;
  valor: number;
  conta: string | null;
  created_at: string;
};

type Pagamento = {
  id: string;
  data: string;
  beneficiario: string;
  obs: string | null;
  valor: number;
  conta: string | null;
  created_at: string;
};

type Aba = "dashboard" | "receitas" | "pagamentos";

const VAZIO_RECEITA  = { data: "", origem: "", obs: "", valor: "", conta: "" };
const VAZIO_PAGAMENTO = { data: "", beneficiario: "", obs: "", valor: "", conta: "" };

// ─── Formatadores ─────────────────────────────────────────────────────────────
function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtData(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ─── Exportar CSV ─────────────────────────────────────────────────────────────
function exportarCSV(dados: Record<string, unknown>[], nome: string) {
  if (!dados.length) return;
  const cols = Object.keys(dados[0]);
  const linhas = [
    cols.join(";"),
    ...dados.map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(";")),
  ];
  const blob = new Blob(["﻿" + linhas.join("\n")], { type: "text/csv;charset=utf-8" });
  const a    = document.createElement("a");
  a.href     = URL.createObjectURL(blob);
  a.download = `${nome}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function FinanceiroManager() {
  const [aba,        setAba]        = useState<Aba>("dashboard");
  const [receitas,   setReceitas]   = useState<Receita[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading,    setLoading]    = useState(true);

  // Filtros
  const [busca,       setBusca]       = useState("");
  const [mesAno,      setMesAno]      = useState("");   // "2026-01"
  const [conta,       setConta]       = useState("");

  // Modal
  type ModalTipo = "receita" | "pagamento" | null;
  const [modalTipo,    setModalTipo]    = useState<ModalTipo>(null);
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [formR,        setFormR]        = useState({ ...VAZIO_RECEITA });
  const [formP,        setFormP]        = useState({ ...VAZIO_PAGAMENTO });
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState<string | null>(null);

  // ── Carregar dados ─────────────────────────────────────────────────────────
  const carregar = useCallback(async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from("financeiro_receitas").select("*").order("data", { ascending: false }),
      supabase.from("financeiro_pagamentos").select("*").order("data", { ascending: false }),
    ]);
    setReceitas((r ?? []) as Receita[]);
    setPagamentos((p ?? []) as Pagamento[]);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // ── Filtros client-side ────────────────────────────────────────────────────
  function filtrarReceitas(list: Receita[]) {
    return list.filter((r) => {
      const matchBusca = busca
        ? r.origem.toLowerCase().includes(busca.toLowerCase()) ||
          (r.obs ?? "").toLowerCase().includes(busca.toLowerCase())
        : true;
      const matchMes   = mesAno ? r.data.startsWith(mesAno) : true;
      const matchConta = conta  ? r.conta === conta : true;
      return matchBusca && matchMes && matchConta;
    });
  }

  function filtrarPagamentos(list: Pagamento[]) {
    return list.filter((p) => {
      const matchBusca = busca
        ? p.beneficiario.toLowerCase().includes(busca.toLowerCase()) ||
          (p.obs ?? "").toLowerCase().includes(busca.toLowerCase())
        : true;
      const matchMes   = mesAno ? p.data.startsWith(mesAno) : true;
      const matchConta = conta  ? p.conta === conta : true;
      return matchBusca && matchMes && matchConta;
    });
  }

  const recFiltradas = filtrarReceitas(receitas);
  const pagFiltrados = filtrarPagamentos(pagamentos);

  // Totais
  const totalReceitas   = recFiltradas.reduce((s, r) => s + Number(r.valor), 0);
  const totalPagamentos = pagFiltrados.reduce((s, p) => s + Number(p.valor), 0);
  const saldo           = totalReceitas - totalPagamentos;

  // Contas distintas
  const contas = Array.from(new Set([
    ...receitas.map((r) => r.conta),
    ...pagamentos.map((p) => p.conta),
  ].filter(Boolean) as string[])).sort();

  // Meses distintos
  const meses = Array.from(new Set([
    ...receitas.map((r) => r.data.slice(0, 7)),
    ...pagamentos.map((p) => p.data.slice(0, 7)),
  ].filter(Boolean))).sort().reverse();

  // ── Modal handlers ─────────────────────────────────────────────────────────
  function abrirNovaReceita() {
    setEditingId(null);
    setFormR({ ...VAZIO_RECEITA });
    setSaveError(null);
    setModalTipo("receita");
  }

  function abrirEditarReceita(r: Receita) {
    setEditingId(r.id);
    setFormR({ data: r.data, origem: r.origem, obs: r.obs ?? "", valor: String(r.valor), conta: r.conta ?? "" });
    setSaveError(null);
    setModalTipo("receita");
  }

  function abrirNovoPagamento() {
    setEditingId(null);
    setFormP({ ...VAZIO_PAGAMENTO });
    setSaveError(null);
    setModalTipo("pagamento");
  }

  function abrirEditarPagamento(p: Pagamento) {
    setEditingId(p.id);
    setFormP({ data: p.data, beneficiario: p.beneficiario, obs: p.obs ?? "", valor: String(p.valor), conta: p.conta ?? "" });
    setSaveError(null);
    setModalTipo("pagamento");
  }

  function fecharModal() {
    if (saving) return;
    setModalTipo(null);
    setEditingId(null);
  }

  // ── Salvar Receita ─────────────────────────────────────────────────────────
  async function salvarReceita() {
    if (!formR.data || !formR.origem || !formR.valor) {
      setSaveError("Preencha Data, Origem e Valor.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    const supabase = createSupabaseBrowserClient();
    const payload  = {
      data:   formR.data,
      origem: formR.origem.toUpperCase(),
      obs:    formR.obs.toUpperCase() || null,
      valor:  parseFloat(formR.valor.replace(",", ".")),
      conta:  formR.conta.toUpperCase() || null,
    };
    const { error } = editingId
      ? await supabase.from("financeiro_receitas").update(payload).eq("id", editingId)
      : await supabase.from("financeiro_receitas").insert(payload);
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    fecharModal();
    carregar();
  }

  // ── Salvar Pagamento ───────────────────────────────────────────────────────
  async function salvarPagamento() {
    if (!formP.data || !formP.beneficiario || !formP.valor) {
      setSaveError("Preencha Data, Beneficiário e Valor.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    const supabase = createSupabaseBrowserClient();
    const payload  = {
      data:         formP.data,
      beneficiario: formP.beneficiario.toUpperCase(),
      obs:          formP.obs.toUpperCase() || null,
      valor:        parseFloat(formP.valor.replace(",", ".")),
      conta:        formP.conta.toUpperCase() || null,
    };
    const { error } = editingId
      ? await supabase.from("financeiro_pagamentos").update(payload).eq("id", editingId)
      : await supabase.from("financeiro_pagamentos").insert(payload);
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    fecharModal();
    carregar();
  }

  // ── Excluir ────────────────────────────────────────────────────────────────
  async function excluirReceita(id: string) {
    if (!confirm("Excluir esta receita?")) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from("financeiro_receitas").delete().eq("id", id);
    carregar();
  }

  async function excluirPagamento(id: string) {
    if (!confirm("Excluir este pagamento?")) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from("financeiro_pagamentos").delete().eq("id", id);
    carregar();
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Abas ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        {(["dashboard", "receitas", "pagamentos"] as Aba[]).map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors ${
              aba === a
                ? "bg-primary text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-orange-50 hover:text-primary"
            }`}
          >
            {a === "dashboard" ? "📊 Dashboard" : a === "receitas" ? "📥 Receitas" : "📤 Pagamentos"}
          </button>
        ))}
      </div>

      {/* ── Filtros globais ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {/* Mês/Ano */}
        <div className="relative">
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={mesAno}
            onChange={(e) => setMesAno(e.target.value)}
            className="appearance-none rounded-lg border border-gray-200 px-3 py-2 pr-8 text-sm outline-none focus:border-primary"
          >
            <option value="">Todos os meses</option>
            {meses.map((m) => {
              const [y, mo] = m.split("-");
              const nome = new Date(+y, +mo - 1).toLocaleString("pt-BR", { month: "long", year: "numeric" });
              return <option key={m} value={m}>{nome}</option>;
            })}
          </select>
        </div>

        {/* Conta */}
        {contas.length > 0 && (
          <div className="relative">
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={conta}
              onChange={(e) => setConta(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 px-3 py-2 pr-8 text-sm outline-none focus:border-primary"
            >
              <option value="">Todas as contas</option>
              {contas.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {/* Busca */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, observação..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
          {busca && (
            <button onClick={() => setBusca("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Dashboard ── */}
          {aba === "dashboard" && (
            <div className="space-y-5">
              {/* Cards de resumo */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <CardResumo
                  titulo="Total Receitas"
                  valor={totalReceitas}
                  icon={<TrendingUp className="h-6 w-6" />}
                  cor="emerald"
                />
                <CardResumo
                  titulo="Total Pagamentos"
                  valor={totalPagamentos}
                  icon={<TrendingDown className="h-6 w-6" />}
                  cor="red"
                />
                <CardResumo
                  titulo="Saldo"
                  valor={saldo}
                  icon={<Wallet className="h-6 w-6" />}
                  cor={saldo >= 0 ? "violet" : "orange"}
                />
              </div>

              {/* Últimas movimentações */}
              <div className="grid gap-4 lg:grid-cols-2">
                <TabelaResumida
                  titulo="Últimas Receitas"
                  cor="emerald"
                  linhas={recFiltradas.slice(0, 8).map((r) => ({
                    data:   fmtData(r.data),
                    desc:   r.origem,
                    obs:    r.obs,
                    valor:  r.valor,
                  }))}
                />
                <TabelaResumida
                  titulo="Últimos Pagamentos"
                  cor="red"
                  linhas={pagFiltrados.slice(0, 8).map((p) => ({
                    data:   fmtData(p.data),
                    desc:   p.beneficiario,
                    obs:    p.obs,
                    valor:  p.valor,
                  }))}
                />
              </div>
            </div>
          )}

          {/* ── Receitas ── */}
          {aba === "receitas" && (
            <TabelaCompleta
              titulo="Receitas"
              cor="emerald"
              total={totalReceitas}
              linhas={recFiltradas}
              colunas={["Data", "Origem", "Observação", "Conta", "Valor"]}
              renderLinha={(r: Receita) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{fmtData(r.data)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{r.origem}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.obs ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.conta ?? "—"}</td>
                  <td className="px-4 py-3 text-sm font-bold text-emerald-600 text-right">{moeda(r.valor)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => abrirEditarReceita(r)} className="rounded-lg p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => excluirReceita(r.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              onNovo={abrirNovaReceita}
              onExportar={() => exportarCSV(
                recFiltradas.map((r) => ({ Data: fmtData(r.data), Origem: r.origem, Obs: r.obs, Conta: r.conta, Valor: r.valor })),
                "receitas"
              )}
            />
          )}

          {/* ── Pagamentos ── */}
          {aba === "pagamentos" && (
            <TabelaCompleta
              titulo="Pagamentos"
              cor="red"
              total={totalPagamentos}
              linhas={pagFiltrados}
              colunas={["Data", "Beneficiário", "Observação", "Conta", "Valor"]}
              renderLinha={(p: Pagamento) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{fmtData(p.data)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{p.beneficiario}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.obs ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.conta ?? "—"}</td>
                  <td className="px-4 py-3 text-sm font-bold text-red-500 text-right">{moeda(p.valor)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => abrirEditarPagamento(p)} className="rounded-lg p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => excluirPagamento(p.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              onNovo={abrirNovoPagamento}
              onExportar={() => exportarCSV(
                pagFiltrados.map((p) => ({ Data: fmtData(p.data), Beneficiario: p.beneficiario, Obs: p.obs, Conta: p.conta, Valor: p.valor })),
                "pagamentos"
              )}
            />
          )}
        </>
      )}

      {/* ── Modal Receita ── */}
      {modalTipo === "receita" && (
        <Modal titulo={editingId ? "Editar Receita" : "Nova Receita"} onFechar={fecharModal}>
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoModal label="Data *">
              <input type="date" value={formR.data} onChange={(e) => setFormR({ ...formR, data: e.target.value })} className={inputCls} />
            </CampoModal>
            <CampoModal label="Valor (R$) *">
              <input type="text" placeholder="0,00" value={formR.valor} onChange={(e) => setFormR({ ...formR, valor: e.target.value })} className={inputCls} />
            </CampoModal>
            <CampoModal label="Origem *" className="sm:col-span-2">
              <input type="text" value={formR.origem} onChange={(e) => setFormR({ ...formR, origem: e.target.value })} onBlur={(e) => setFormR({ ...formR, origem: e.target.value.toUpperCase() })} className={inputCls + " uppercase"} />
            </CampoModal>
            <CampoModal label="Observação" className="sm:col-span-2">
              <input type="text" value={formR.obs} onChange={(e) => setFormR({ ...formR, obs: e.target.value })} onBlur={(e) => setFormR({ ...formR, obs: e.target.value.toUpperCase() })} className={inputCls + " uppercase"} />
            </CampoModal>
            <CampoModal label="Conta">
              <input type="text" value={formR.conta} onChange={(e) => setFormR({ ...formR, conta: e.target.value })} onBlur={(e) => setFormR({ ...formR, conta: e.target.value.toUpperCase() })} className={inputCls + " uppercase"} />
            </CampoModal>
          </div>
          {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={fecharModal} disabled={saving} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancelar</button>
            <button onClick={salvarReceita} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal Pagamento ── */}
      {modalTipo === "pagamento" && (
        <Modal titulo={editingId ? "Editar Pagamento" : "Novo Pagamento"} onFechar={fecharModal}>
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoModal label="Data *">
              <input type="date" value={formP.data} onChange={(e) => setFormP({ ...formP, data: e.target.value })} className={inputCls} />
            </CampoModal>
            <CampoModal label="Valor (R$) *">
              <input type="text" placeholder="0,00" value={formP.valor} onChange={(e) => setFormP({ ...formP, valor: e.target.value })} className={inputCls} />
            </CampoModal>
            <CampoModal label="Beneficiário *" className="sm:col-span-2">
              <input type="text" value={formP.beneficiario} onChange={(e) => setFormP({ ...formP, beneficiario: e.target.value })} onBlur={(e) => setFormP({ ...formP, beneficiario: e.target.value.toUpperCase() })} className={inputCls + " uppercase"} />
            </CampoModal>
            <CampoModal label="Observação" className="sm:col-span-2">
              <input type="text" value={formP.obs} onChange={(e) => setFormP({ ...formP, obs: e.target.value })} onBlur={(e) => setFormP({ ...formP, obs: e.target.value.toUpperCase() })} className={inputCls + " uppercase"} />
            </CampoModal>
            <CampoModal label="Conta">
              <input type="text" value={formP.conta} onChange={(e) => setFormP({ ...formP, conta: e.target.value })} onBlur={(e) => setFormP({ ...formP, conta: e.target.value.toUpperCase() })} className={inputCls + " uppercase"} />
            </CampoModal>
          </div>
          {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={fecharModal} disabled={saving} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancelar</button>
            <button onClick={salvarPagamento} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100";

function CardResumo({ titulo, valor, icon, cor }: {
  titulo: string; valor: number; icon: React.ReactNode;
  cor: "emerald" | "red" | "violet" | "orange";
}) {
  const cores = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red:     "bg-red-50 text-red-500 border-red-100",
    violet:  "bg-violet-50 text-violet-600 border-violet-100",
    orange:  "bg-orange-50 text-orange-600 border-orange-100",
  };
  const textoCor = {
    emerald: "text-emerald-700",
    red:     "text-red-600",
    violet:  "text-violet-700",
    orange:  "text-orange-600",
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500">{titulo}</p>
        <span className={`rounded-xl border p-2 ${cores[cor]}`}>{icon}</span>
      </div>
      <p className={`mt-3 text-2xl font-extrabold ${textoCor[cor]}`}>
        {valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>
    </div>
  );
}

function TabelaResumida({ titulo, cor, linhas }: {
  titulo: string; cor: "emerald" | "red";
  linhas: { data: string; desc: string; obs: string | null; valor: number }[];
}) {
  const corValor = cor === "emerald" ? "text-emerald-600" : "text-red-500";
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-3">
        <p className="font-bold text-gray-900 text-sm">{titulo}</p>
      </div>
      {linhas.length === 0 ? (
        <p className="p-5 text-sm text-gray-400">Nenhum registro.</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {linhas.map((l, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <span className="shrink-0 text-xs text-gray-400 font-mono w-16">{l.data}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">{l.desc}</p>
                {l.obs && <p className="truncate text-xs text-gray-400">{l.obs}</p>}
              </div>
              <span className={`shrink-0 text-sm font-bold ${corValor}`}>
                {moeda(l.valor)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabelaCompleta<T>({ titulo, cor, total, linhas, colunas, renderLinha, onNovo, onExportar }: {
  titulo: string; cor: "emerald" | "red"; total: number;
  linhas: T[]; colunas: string[];
  renderLinha: (item: T) => React.ReactNode;
  onNovo: () => void; onExportar: () => void;
}) {
  const corBotao = cor === "emerald"
    ? "bg-emerald-600 hover:bg-emerald-700"
    : "bg-red-500 hover:bg-red-600";
  const corTotal = cor === "emerald" ? "text-emerald-700" : "text-red-600";

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-4">
        <h3 className="font-bold text-gray-900">{titulo}</h3>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
          {linhas.length} registro{linhas.length !== 1 ? "s" : ""}
        </span>
        <span className={`ml-auto text-sm font-extrabold ${corTotal}`}>
          Total: {moeda(total)}
        </span>
        <button
          onClick={onExportar}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          <FileDown className="h-4 w-4" /> CSV
        </button>
        <button
          onClick={onNovo}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white ${corBotao}`}
        >
          <Plus className="h-4 w-4" /> Novo
        </button>
      </div>
      <div className="overflow-x-auto">
        {linhas.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">Nenhum registro encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                {colunas.map((c) => (
                  <th key={c} className={`px-4 py-3 ${c === "Valor" ? "text-right" : ""}`}>{c}</th>
                ))}
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {linhas.map((item) => renderLinha(item))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Modal({ titulo, onFechar, children }: { titulo: string; onFechar: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="font-bold text-gray-900">{titulo}</h3>
          <button onClick={onFechar} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function CampoModal({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</label>
      {children}
    </div>
  );
}
