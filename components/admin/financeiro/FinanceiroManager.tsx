"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  TrendingUp, TrendingDown, Wallet, Plus, Pencil, Trash2,
  Search, X, Loader2, Save, FileDown, AlertTriangle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Setores / Contas ─────────────────────────────────────────────────────────
const SETORES = [
  "01-Creche",
  "02-Construção",
  "03-Livraria",
  "04-Pomada Vovô Pedro",
  "05-SEJNM",
  "06-JN Confecção",
  "07-Benvinda",
  "08-Padaria",
] as const;

function nomeSetor(s: string) { return s.split("-").slice(1).join("-").trim(); }

// ─── Types ────────────────────────────────────────────────────────────────────
type Receita = {
  id: string; data: string; origem: string; obs: string | null;
  valor: number; conta: string | null; cpf_cnpj: string | null; created_at: string;
};
type Pagamento = {
  id: string; data: string; beneficiario: string; obs: string | null;
  valor: number; conta: string | null; cpf_cnpj: string | null; created_at: string;
};
type Aba = "dashboard" | "receitas" | "pagamentos";

const VAZIO_R = { data: "", origem: "", obs: "", valor: "", conta: "", cpf_cnpj: "" };
const VAZIO_P = { data: "", beneficiario: "", obs: "", valor: "", conta: "", cpf_cnpj: "" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function moeda(v: number | string | null | undefined) {
  return Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${nome}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ─── Exportar XLSX ────────────────────────────────────────────────────────────
function exportarXLSX(dados: Record<string, unknown>[], nome: string) {
  if (!dados.length) return;
  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nome.slice(0, 31));
  XLSX.writeFile(wb, `${nome}.xlsx`);
}

// ─── Exportar PDF ─────────────────────────────────────────────────────────────
function exportarPDF(dados: Record<string, unknown>[], nome: string, total: number) {
  if (!dados.length) return;
  const doc  = new jsPDF({ orientation: "landscape" });
  const cols = Object.keys(dados[0]);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(nome.toUpperCase(), 14, 14);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Total: R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}  |  ${dados.length} registro(s)  |  ${new Date().toLocaleDateString("pt-BR")}`,
    14, 21
  );
  autoTable(doc, {
    head: [cols],
    body: dados.map((r) => cols.map((c) => String(r[c] ?? ""))),
    startY: 27,
    styles:     { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 248, 255] },
  });
  doc.save(`${nome}.pdf`);
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function FinanceiroManager() {
  const [aba,        setAba]        = useState<Aba>("dashboard");
  const [receitas,   setReceitas]   = useState<Receita[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading,    setLoading]    = useState(true);

  // Filtros
  const [busca,       setBusca]       = useState("");
  const [dataInicio,  setDataInicio]  = useState("");
  const [dataFim,     setDataFim]     = useState("");
  const [setorFiltro, setSetorFiltro] = useState("");

  // Modal
  type ModalTipo = "receita" | "pagamento" | null;
  const [modalTipo, setModalTipo] = useState<ModalTipo>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formR,     setFormR]     = useState({ ...VAZIO_R });
  const [formP,     setFormP]     = useState({ ...VAZIO_P });
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Confirmação de exclusão
  const [confirmDelete, setConfirmDelete] = useState<{ tipo: "receita" | "pagamento"; id: string } | null>(null);

  // ── Carregar ───────────────────────────────────────────────────────────────
  const carregar = useCallback(async () => {
    setLoading(true);
    const sb = createSupabaseBrowserClient();
    const [{ data: r }, { data: p }] = await Promise.all([
      sb.from("financeiro_receitas").select("*").order("data", { ascending: false }),
      sb.from("financeiro_pagamentos").select("*").order("data", { ascending: false }),
    ]);
    setReceitas((r ?? []) as Receita[]);
    setPagamentos((p ?? []) as Pagamento[]);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // ── Filtros ────────────────────────────────────────────────────────────────
  // Base: data + busca (sem filtro de setor — usado nos cards)
  const recBase = receitas.filter((r) => {
    const mb = busca ? r.origem.toLowerCase().includes(busca.toLowerCase()) || (r.obs ?? "").toLowerCase().includes(busca.toLowerCase()) : true;
    const mi = dataInicio ? r.data >= dataInicio : true;
    const mf = dataFim    ? r.data <= dataFim    : true;
    return mb && mi && mf;
  });
  const pagBase = pagamentos.filter((p) => {
    const mb = busca ? p.beneficiario.toLowerCase().includes(busca.toLowerCase()) || (p.obs ?? "").toLowerCase().includes(busca.toLowerCase()) : true;
    const mi = dataInicio ? p.data >= dataInicio : true;
    const mf = dataFim    ? p.data <= dataFim    : true;
    return mb && mi && mf;
  });

  // Comparação de setor: exata (novos registros) OU pelo nome sem número (dados migrados)
  function matchSetor(conta: string | null, filtro: string): boolean {
    if (!conta || !filtro) return false;
    if (conta === filtro) return true;                              // "07-Benvinda" === "07-Benvinda"
    const nome = filtro.split("-").slice(1).join("-").trim();      // "07-Benvinda" → "Benvinda"
    return conta.trim().toLowerCase() === nome.toLowerCase();      // "BENVINDA" === "benvinda"
  }

  // Final: com filtro de setor
  const recFiltradas = setorFiltro ? recBase.filter((r) => matchSetor(r.conta, setorFiltro)) : recBase;
  const pagFiltrados = setorFiltro ? pagBase.filter((p) => matchSetor(p.conta, setorFiltro)) : pagBase;

  const totalReceitas   = recFiltradas.reduce((s, r) => s + Number(r.valor), 0);
  const totalPagamentos = pagFiltrados.reduce((s, p) => s + Number(p.valor), 0);
  const saldo           = totalReceitas - totalPagamentos;

  // Totais por setor (a partir do base sem setor)
  const trSetor = (s: string) => recBase.filter((r) => r.conta === s).reduce((acc, r) => acc + Number(r.valor), 0);
  const tpSetor = (s: string) => pagBase.filter((p) => p.conta === s).reduce((acc, p) => acc + Number(p.valor), 0);

  // ── Cards de setor ─────────────────────────────────────────────────────────
  function renderSetorCards(tipo: "receita" | "pagamento" | "dashboard") {
    // Receitas e Pagamentos: botões simples sem valores
    if (tipo !== "dashboard") {
      return (
        <div className="flex flex-wrap gap-2">
          {SETORES.map((s) => {
            const ativo = setorFiltro === s;
            return (
              <button
                key={s}
                onClick={() => setSetorFiltro(ativo ? "" : s)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${
                  ativo
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {nomeSetor(s)}
              </button>
            );
          })}
        </div>
      );
    }

    // Dashboard: cards com valores (sem labels, sem número)
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {SETORES.map((s) => {
          const rec   = trSetor(s);
          const pag   = tpSetor(s);
          const sal   = rec - pag;
          const ativo = setorFiltro === s;
          return (
            <button
              key={s}
              onClick={() => setSetorFiltro(ativo ? "" : s)}
              className={`rounded-xl border p-3 text-left transition-all ${
                ativo
                  ? "border-primary bg-primary text-white shadow-md"
                  : "border-gray-200 bg-white hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <p className={`truncate text-xs font-bold leading-tight ${ativo ? "text-white" : "text-gray-800"}`}>
                {nomeSetor(s)}
              </p>
              <div className="mt-2 space-y-0.5">
                <p className={`text-[11px] font-semibold ${ativo ? "text-emerald-200" : "text-emerald-600"}`}>{moeda(rec)}</p>
                <p className={`text-[11px] font-semibold ${ativo ? "text-red-200" : "text-red-500"}`}>{moeda(pag)}</p>
                <p className={`text-xs font-extrabold ${sal >= 0 ? (ativo ? "text-white" : "text-violet-600") : (ativo ? "text-orange-200" : "text-orange-600")}`}>
                  {moeda(sal)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Modal handlers ─────────────────────────────────────────────────────────
  function abrirNovaReceita()         { setEditingId(null); setFormR({ ...VAZIO_R }); setSaveError(null); setModalTipo("receita"); }
  function abrirNovoPagamento()       { setEditingId(null); setFormP({ ...VAZIO_P }); setSaveError(null); setModalTipo("pagamento"); }
  function abrirEditarReceita(r: Receita) {
    setEditingId(r.id);
    setFormR({ data: r.data, origem: r.origem, obs: r.obs ?? "", valor: String(r.valor), conta: r.conta ?? "", cpf_cnpj: r.cpf_cnpj ?? "" });
    setSaveError(null); setModalTipo("receita");
  }
  function abrirEditarPagamento(p: Pagamento) {
    setEditingId(p.id);
    setFormP({ data: p.data, beneficiario: p.beneficiario, obs: p.obs ?? "", valor: String(p.valor), conta: p.conta ?? "", cpf_cnpj: p.cpf_cnpj ?? "" });
    setSaveError(null); setModalTipo("pagamento");
  }
  function fecharModal() { if (saving) return; setModalTipo(null); setEditingId(null); }

  // ── Salvar Receita ─────────────────────────────────────────────────────────
  async function salvarReceita() {
    if (!formR.data || !formR.origem || !formR.valor) { setSaveError("Preencha Data, Origem e Valor."); return; }
    setSaving(true); setSaveError(null);
    const sb = createSupabaseBrowserClient();
    const payload = {
      data:     formR.data,
      origem:   formR.origem.toUpperCase(),
      obs:      formR.obs.toUpperCase() || null,
      valor:    parseFloat(formR.valor.replace(",", ".")),
      conta:    formR.conta || null,
      cpf_cnpj: formR.cpf_cnpj.toUpperCase() || null,
    };
    const { error } = editingId
      ? await sb.from("financeiro_receitas").update(payload).eq("id", editingId)
      : await sb.from("financeiro_receitas").insert(payload);
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    fecharModal(); carregar();
  }

  // ── Salvar Pagamento ───────────────────────────────────────────────────────
  async function salvarPagamento() {
    if (!formP.data || !formP.beneficiario || !formP.valor) { setSaveError("Preencha Data, Beneficiário e Valor."); return; }
    setSaving(true); setSaveError(null);
    const sb = createSupabaseBrowserClient();
    const payload = {
      data:         formP.data,
      beneficiario: formP.beneficiario.toUpperCase(),
      obs:          formP.obs.toUpperCase() || null,
      valor:        parseFloat(formP.valor.replace(",", ".")),
      conta:        formP.conta || null,
      cpf_cnpj:     formP.cpf_cnpj.toUpperCase() || null,
    };
    const { error } = editingId
      ? await sb.from("financeiro_pagamentos").update(payload).eq("id", editingId)
      : await sb.from("financeiro_pagamentos").insert(payload);
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    fecharModal(); carregar();
  }

  // ── Excluir ────────────────────────────────────────────────────────────────
  function excluirReceita(id: string)   { setConfirmDelete({ tipo: "receita",   id }); }
  function excluirPagamento(id: string) { setConfirmDelete({ tipo: "pagamento", id }); }

  async function confirmarExclusao() {
    if (!confirmDelete) return;
    const sb = createSupabaseBrowserClient();
    if (confirmDelete.tipo === "receita") {
      await sb.from("financeiro_receitas").delete().eq("id", confirmDelete.id);
    } else {
      await sb.from("financeiro_pagamentos").delete().eq("id", confirmDelete.id);
    }
    setConfirmDelete(null);
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
            onClick={() => { setAba(a); setSetorFiltro(""); setDataInicio(""); setDataFim(""); }}
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

      {/* ── Setores (Receitas / Pagamentos) ── */}
      {aba !== "dashboard" && renderSetorCards(aba === "receitas" ? "receita" : "pagamento")}

      {/* ── Filtros globais ── */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {/* Data início */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">De</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        {/* Data fim */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Até</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        {/* Limpar datas */}
        {(dataInicio || dataFim) && (
          <button
            onClick={() => { setDataInicio(""); setDataFim(""); }}
            className="self-end rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Limpar período"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Busca */}
        <div className="relative flex-1 self-end min-w-[200px]">
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
              {/* Cards resumo */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <CardResumo titulo="Total Receitas"   valor={totalReceitas}   icon={<TrendingUp className="h-6 w-6" />}  cor="emerald" />
                <CardResumo titulo="Total Pagamentos" valor={totalPagamentos} icon={<TrendingDown className="h-6 w-6" />} cor="red" />
                <CardResumo titulo="Saldo"            valor={saldo}           icon={<Wallet className="h-6 w-6" />}       cor={saldo >= 0 ? "violet" : "orange"} />
              </div>

              {/* Cards por setor */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Por Setor</p>
                {renderSetorCards("dashboard")}
              </div>

              {/* Últimas movimentações */}
              <div className="grid gap-4 lg:grid-cols-2">
                <TabelaResumida
                  titulo="Últimas Receitas"
                  cor="emerald"
                  linhas={recFiltradas.slice(0, 8).map((r) => ({ data: fmtData(r.data), desc: r.origem, obs: r.obs, valor: r.valor }))}
                />
                <TabelaResumida
                  titulo="Últimos Pagamentos"
                  cor="red"
                  linhas={pagFiltrados.slice(0, 8).map((p) => ({ data: fmtData(p.data), desc: p.beneficiario, obs: p.obs, valor: p.valor }))}
                />
              </div>
            </div>
          )}

          {/* ── Receitas ── */}
          {aba === "receitas" && (
            <div className="space-y-4">
              <TabelaCompleta
                titulo="Receitas" subtitulo={setorFiltro ? nomeSetor(setorFiltro) : undefined} cor="emerald" total={totalReceitas} linhas={recFiltradas}
                colunas={["Data", "Origem", "CPF/CNPJ", "Observação", "Setor", "Valor"]}
                renderLinha={(r: Receita) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{fmtData(r.data)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{r.origem}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 font-mono">{r.cpf_cnpj ?? <span className="text-gray-300 text-xs">Sem CPF</span>}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{r.obs ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{r.conta ?? "—"}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600 text-right">{moeda(r.valor)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button onClick={() => abrirEditarReceita(r)} className="rounded-lg p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-600"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => excluirReceita(r.id)}  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                )}
                onNovo={abrirNovaReceita}
                dadosExport={recFiltradas.map((r) => ({
                  "Data":      fmtData(r.data),
                  "Origem":    r.origem,
                  "CPF/CNPJ":  r.cpf_cnpj ?? "—",
                  "Observação": r.obs ?? "—",
                  "Setor":     r.conta ?? "—",
                  "Valor":     moeda(r.valor),
                }))}
              />
            </div>
          )}

          {/* ── Pagamentos ── */}
          {aba === "pagamentos" && (
            <div className="space-y-4">
              <TabelaCompleta
                titulo="Pagamentos" subtitulo={setorFiltro ? nomeSetor(setorFiltro) : undefined} cor="red" total={totalPagamentos} linhas={pagFiltrados}
                colunas={["Data", "Beneficiário", "CPF/CNPJ", "Observação", "Setor", "Valor"]}
                renderLinha={(p: Pagamento) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{fmtData(p.data)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{p.beneficiario}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 font-mono">{p.cpf_cnpj ?? <span className="text-gray-300 text-xs">Sem CPF</span>}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.obs ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.conta ?? "—"}</td>
                    <td className="px-4 py-3 text-sm font-bold text-red-500 text-right">{moeda(p.valor)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button onClick={() => abrirEditarPagamento(p)} className="rounded-lg p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-600"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => excluirPagamento(p.id)}  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                )}
                onNovo={abrirNovoPagamento}
                dadosExport={pagFiltrados.map((p) => ({
                  "Data":        fmtData(p.data),
                  "Beneficiário": p.beneficiario,
                  "CPF/CNPJ":    p.cpf_cnpj ?? "—",
                  "Observação":  p.obs ?? "—",
                  "Setor":       p.conta ?? "—",
                  "Valor":       moeda(p.valor),
                }))}
              />
            </div>
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
              <input type="text" value={formR.origem}
                onChange={(e) => setFormR({ ...formR, origem: e.target.value })}
                onBlur={(e) => setFormR({ ...formR, origem: e.target.value.toUpperCase() })}
                className={inputCls + " uppercase"} />
            </CampoModal>
            <CampoModal label="CPF / CNPJ">
              <input type="text" placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={formR.cpf_cnpj}
                onChange={(e) => setFormR({ ...formR, cpf_cnpj: e.target.value })}
                onBlur={(e) => setFormR({ ...formR, cpf_cnpj: e.target.value.toUpperCase() })}
                className={inputCls} />
            </CampoModal>
            <CampoModal label="Observação" className="sm:col-span-2">
              <input type="text" value={formR.obs}
                onChange={(e) => setFormR({ ...formR, obs: e.target.value })}
                onBlur={(e) => setFormR({ ...formR, obs: e.target.value.toUpperCase() })}
                className={inputCls + " uppercase"} />
            </CampoModal>
            <CampoModal label="Setor" className="sm:col-span-2">
              <select value={formR.conta} onChange={(e) => setFormR({ ...formR, conta: e.target.value })} className={inputCls}>
                <option value="">Selecione o setor</option>
                {SETORES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
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
              <input type="text" value={formP.beneficiario}
                onChange={(e) => setFormP({ ...formP, beneficiario: e.target.value })}
                onBlur={(e) => setFormP({ ...formP, beneficiario: e.target.value.toUpperCase() })}
                className={inputCls + " uppercase"} />
            </CampoModal>
            <CampoModal label="CPF / CNPJ">
              <input type="text" placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={formP.cpf_cnpj}
                onChange={(e) => setFormP({ ...formP, cpf_cnpj: e.target.value })}
                onBlur={(e) => setFormP({ ...formP, cpf_cnpj: e.target.value.toUpperCase() })}
                className={inputCls} />
            </CampoModal>
            <CampoModal label="Observação" className="sm:col-span-2">
              <input type="text" value={formP.obs}
                onChange={(e) => setFormP({ ...formP, obs: e.target.value })}
                onBlur={(e) => setFormP({ ...formP, obs: e.target.value.toUpperCase() })}
                className={inputCls + " uppercase"} />
            </CampoModal>
            <CampoModal label="Setor" className="sm:col-span-2">
              <select value={formP.conta} onChange={(e) => setFormP({ ...formP, conta: e.target.value })} className={inputCls}>
                <option value="">Selecione o setor</option>
                {SETORES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
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

      {/* ── Modal Confirmação Exclusão ── */}
      {confirmDelete && (
        <ConfirmacaoExclusao
          tipo={confirmDelete.tipo}
          onCancelar={() => setConfirmDelete(null)}
          onConfirmar={confirmarExclusao}
        />
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
  const cores    = { emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", red: "bg-red-50 text-red-500 border-red-100", violet: "bg-violet-50 text-violet-600 border-violet-100", orange: "bg-orange-50 text-orange-600 border-orange-100" };
  const textoCor = { emerald: "text-emerald-700", red: "text-red-600", violet: "text-violet-700", orange: "text-orange-600" };
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
              <span className="shrink-0 text-[13px] text-gray-600 font-mono w-16">{l.data}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">{l.desc}</p>
                {l.obs && <p className="truncate text-xs text-gray-400">{l.obs}</p>}
              </div>
              <span className={`shrink-0 text-sm font-bold ${corValor}`}>{moeda(l.valor)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabelaCompleta<T>({ titulo, subtitulo, cor, total, linhas, colunas, renderLinha, onNovo, dadosExport }: {
  titulo: string; subtitulo?: string; cor: "emerald" | "red"; total: number;
  linhas: T[]; colunas: string[];
  renderLinha: (item: T) => React.ReactNode;
  onNovo: () => void;
  dadosExport: Record<string, unknown>[];
}) {
  const [showRelatorio, setShowRelatorio] = useState(false);
  const corBotao = cor === "emerald" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600";
  const corTotal = cor === "emerald" ? "text-emerald-700" : "text-red-600";
  return (
    <>
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-4">
        <h3 className="font-bold text-gray-900">{titulo}</h3>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
          {linhas.length} registro{linhas.length !== 1 ? "s" : ""}
        </span>
        <span className={`ml-auto text-sm font-extrabold ${corTotal}`}>Total: {moeda(total)}</span>
        <button
          onClick={() => setShowRelatorio(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          <FileDown className="h-4 w-4" /> Relatório
        </button>
        <button onClick={onNovo} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white ${corBotao}`}>
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
                {colunas.map((c) => <th key={c} className={`px-4 py-3 ${c === "Valor" ? "text-right" : ""}`}>{c}</th>)}
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

    {showRelatorio && (
      <RelatorioModal
        titulo={subtitulo ? `${titulo} - ${subtitulo}` : titulo}
        dados={dadosExport}
        total={total}
        cor={cor}
        onFechar={() => setShowRelatorio(false)}
      />
    )}
    </>
  );
}

// ─── Tela de Relatório ────────────────────────────────────────────────────────
function RelatorioModal({ titulo, dados, total, cor, onFechar }: {
  titulo: string;
  dados: Record<string, unknown>[];
  total: number;
  cor: "emerald" | "red";
  onFechar: () => void;
}) {
  const cols    = dados.length > 0 ? Object.keys(dados[0]) : [];
  const nome    = titulo.toLowerCase();
  const corFaixaHeader = cor === "emerald" ? "bg-emerald-600" : "bg-red-500";
  const corValor       = cor === "emerald" ? "text-emerald-700" : "text-red-600";
  const corBotaoPDF    = cor === "emerald" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-gray-100">
      {/* ── Cabeçalho ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">{titulo}</h2>
          <p className="text-sm text-gray-500">
            {dados.length} registro{dados.length !== 1 ? "s" : ""} · Total: {moeda(total)} · {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportarCSV(dados, nome)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <FileDown className="h-4 w-4 text-gray-400" /> CSV
          </button>
          <button
            onClick={() => exportarXLSX(dados, nome)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <FileDown className="h-4 w-4" /> Excel
          </button>
          <button
            onClick={() => exportarPDF(dados, titulo, total)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-white ${corBotaoPDF}`}
          >
            <FileDown className="h-4 w-4" /> PDF
          </button>
          <button onClick={onFechar} className="ml-1 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="flex-1 overflow-auto p-6">
        {dados.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            <p className="text-sm">Nenhum registro para exibir.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Faixa de título */}
            <div className={`${corFaixaHeader} px-6 py-4 text-white`}>
              <h3 className="text-base font-extrabold tracking-wide">{titulo.toUpperCase()}</h3>
              <p className="text-sm opacity-80">Total: {moeda(total)} · {dados.length} registro{dados.length !== 1 ? "s" : ""}</p>
            </div>

            {/* Tabela */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
                  {cols.map((c) => (
                    <th key={c} className={`px-5 py-3 text-left ${c === "Valor" ? "text-right" : ""}`}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dados.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                    {cols.map((c) => (
                      <td
                        key={c}
                        className={`px-5 py-3 ${
                          c === "Valor"
                            ? `text-right font-bold ${corValor}`
                            : "text-gray-700"
                        }`}
                      >
                        {String(row[c] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  {cols.map((c, i) => (
                    <td
                      key={c}
                      className={`px-5 py-3 text-sm font-extrabold ${
                        c === "Valor" ? `text-right ${corValor}` : i === 0 ? "text-gray-600" : ""
                      }`}
                    >
                      {c === "Valor" ? moeda(total) : i === 0 ? "TOTAL" : ""}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Confirmação de Exclusão ──────────────────────────────────────────────────
function ConfirmacaoExclusao({ tipo, onCancelar, onConfirmar }: {
  tipo: "receita" | "pagamento";
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Ícone */}
        <div className="flex flex-col items-center px-6 pt-8 pb-5">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <h3 className="text-center text-lg font-bold text-gray-900">
            Excluir {tipo === "receita" ? "receita" : "pagamento"}?
          </h3>
          <p className="mt-2 text-center text-sm text-gray-500 leading-relaxed">
            Deseja realmente excluir este registro?<br />
            <span className="font-semibold text-red-500">Esta ação não pode ser desfeita.</span>
          </p>
        </div>
        {/* Botões */}
        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onCancelar}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition-colors"
          >
            Sim, excluir
          </button>
        </div>
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
          <button onClick={onFechar} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
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

