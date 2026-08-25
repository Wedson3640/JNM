"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Loader2, Pencil, Plus, Printer, Save, Search, Trash2, UserPlus, Users, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Familiar = {
  id?: string;
  nome: string;
  data_nascimento: string;
  vinculo_sociofamiliar: string;
  responsavel_legal: boolean;
  cpf: string;
};

export type Inscricao = {
  id: string;
  cras_referencia: string | null;
  local_funcionamento: string | null;
  endereco_funcionamento: string | null;
  nome: string;
  sexo_genero: string | null;
  nis: string | null;
  data_nascimento: string | null;
  cpf: string | null;
  nome_social: string | null;
  nome_mae: string | null;
  nis_mae: string | null;
  data_nascimento_mae: string | null;
  cpf_mae: string | null;
  nome_responsavel: string | null;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  ponto_referencia: string | null;
  ddd_telefone: string | null;
  celular: string | null;
  estuda: boolean | null;
  nome_escola: string | null;
  ano_serie: string | null;
  turno: string | null;
  ultima_serie_cursada: string | null;
  motivo_procura: string | null;
  como_soube: string | null;
  renda_familiar: string | null;
  procedimentos_encaminhamentos: string | null;
  disponibilidade_horarios: string | null;
  situacao_usuario: number[];
  hipertenso: boolean | null;
  diabetes: boolean | null;
  outros_problemas_saude: string | null;
  possui_deficiencia: boolean | null;
  qual_deficiencia: string | null;
  observacoes: string | null;
  data_inscricao: string | null;
  status: string;
  created_at: string;
};

const EMPTY_FORM: Partial<Inscricao> = { status: "ativo", situacao_usuario: [] };

const SITUACOES: { code: number; label: string }[] = [
  { code: 1, label: "Não está em situação prioritária" },
  { code: 2, label: "Em situação de isolamento" },
  { code: 3, label: "Trabalho Infantil" },
  { code: 4, label: "Vivência de violência e/ou negligência" },
  { code: 5, label: "Fora da escola ou em defasagem escolar superior a 2 anos" },
  { code: 6, label: "Em situação de acolhimento" },
  { code: 7, label: "Em cumprimento de medida socioeducativa em meio aberto" },
  { code: 8, label: "Egresso de medida socioeducativa" },
  { code: 9, label: "Situação de abuso e/ou exploração sexual" },
  { code: 10, label: "Com medidas de proteção do ECA" },
  { code: 11, label: "Criança/adolescente em situação de rua" },
  { code: 12, label: "Vulnerabilidade referente a pessoas com deficiência" },
];

const STATUS_STYLE: Record<string, string> = {
  ativo: "bg-emerald-100 text-emerald-700",
  inativo: "bg-yellow-100 text-yellow-700",
  desligado: "bg-red-100 text-red-700",
};

function val(v: string | null | undefined) {
  return v && v.trim() ? v : "—";
}

function escapeAttr(v: string) {
  return v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeHtml(v: string) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── Impressão da ficha ─────────────────────────────────────────────────────
function openPrint(i: Inscricao, familiares: Familiar[]) {
  const win = window.open("", "_blank", "width=860,height=1000");
  if (!win) return;

  const familiaresRows = familiares.length
    ? familiares
        .map(
          (f) => `<tr>
            <td>${escapeHtml(f.nome || "—")}</td>
            <td>${escapeHtml(f.data_nascimento || "—")}</td>
            <td>${escapeHtml(f.vinculo_sociofamiliar || "—")}</td>
            <td style="text-align:center">${f.responsavel_legal ? "X" : ""}</td>
            <td>${escapeHtml(f.cpf || "—")}</td>
          </tr>`
        )
        .join("")
    : `<tr><td colspan="5" style="text-align:center;color:#999">Nenhum familiar informado</td></tr>`;

  const situacoesMarcadas = SITUACOES.filter((s) => i.situacao_usuario?.includes(s.code))
    .map((s) => `${s.code}. ${s.label}`)
    .join("<br>") || "—";

  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Ficha SCFV — ${escapeAttr(i.nome)}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 24px; }
  h1 { font-size: 18px; font-weight: bold; text-align: center; }
  .sub { font-size: 11px; color: #555; text-align: center; margin-top: 4px; margin-bottom: 18px; }
  .section { margin-top: 14px; border-top: 1px solid #ddd; padding-top: 10px; }
  .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: .08em; color: #ea580c; margin-bottom: 8px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px 20px; }
  .field label { font-size: 10px; color: #666; display: block; margin-bottom: 1px; }
  .field span { font-weight: 600; font-size: 12px; }
  table.familia { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 11px; }
  table.familia th, table.familia td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; }
  table.familia th { background: #f8f8f8; font-size: 10px; text-transform: uppercase; }
  .signature-row { display: flex; gap: 40px; align-items: flex-end; margin-top: 40px; }
  .signature-block { flex: 1; }
  .signature-line { border-bottom: 1px solid #111; height: 32px; margin-bottom: 4px; }
  .signature-label { font-size: 10px; color: #555; text-align: center; }
  .actions { margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px; text-align: right; }
  .btn-print { padding: 8px 24px; background: #ea580c; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: bold; cursor: pointer; }
  @media print { .actions { display: none; } body { padding: 12px; } .section { page-break-inside: avoid; } }
</style>
</head>
<body>
  <h1>Ficha de Inscrição — Serviço de Convivência e Fortalecimento de Vínculos (SCFV)</h1>
  <p class="sub">CRAS: <strong>${val(i.cras_referencia)}</strong> · Local: <strong>${val(i.local_funcionamento)}</strong></p>

  <div class="section">
    <div class="section-title">1. Dados sociofamiliares</div>
    <div class="grid3">
      <div class="field"><label>Nome</label><span>${val(i.nome)}</span></div>
      <div class="field"><label>Sexo/Gênero</label><span>${val(i.sexo_genero)}</span></div>
      <div class="field"><label>NIS</label><span>${val(i.nis)}</span></div>
      <div class="field"><label>Data Nasc.</label><span>${val(i.data_nascimento)}</span></div>
      <div class="field"><label>CPF</label><span>${val(i.cpf)}</span></div>
      <div class="field"><label>Nome social</label><span>${val(i.nome_social)}</span></div>
    </div>
    <div class="grid3" style="margin-top:8px">
      <div class="field"><label>Nome da mãe</label><span>${val(i.nome_mae)}</span></div>
      <div class="field"><label>NIS da mãe</label><span>${val(i.nis_mae)}</span></div>
      <div class="field"><label>CPF da mãe</label><span>${val(i.cpf_mae)}</span></div>
      <div class="field"><label>Nome do responsável</label><span>${val(i.nome_responsavel)}</span></div>
      <div class="field"><label>Celular</label><span>${val(i.celular)}</span></div>
      <div class="field"><label>DDD/Telefone</label><span>${val(i.ddd_telefone)}</span></div>
    </div>
    <div class="grid2" style="margin-top:8px">
      <div class="field"><label>Endereço</label><span>${val(i.endereco)}</span></div>
      <div class="field"><label>Cidade/UF/CEP</label><span>${val(i.cidade)} / ${val(i.uf)} / ${val(i.cep)}</span></div>
    </div>
    <div class="grid3" style="margin-top:8px">
      <div class="field"><label>Estuda</label><span>${i.estuda === true ? "Sim" : i.estuda === false ? "Não" : "—"}</span></div>
      <div class="field"><label>Escola / Ano-Série / Turno</label><span>${val(i.nome_escola)} · ${val(i.ano_serie)} · ${val(i.turno)}</span></div>
      <div class="field"><label>Última série cursada (se não estuda)</label><span>${val(i.ultima_serie_cursada)}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Motivo da procura / Como soube</div>
    <div class="grid2">
      <div class="field"><label>Motivo</label><span>${val(i.motivo_procura)}</span></div>
      <div class="field"><label>Como soube</label><span>${val(i.como_soube)}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">2. Pessoas que compõem o núcleo familiar</div>
    <table class="familia">
      <thead><tr><th>Nome</th><th>Data Nasc.</th><th>Vínculo</th><th>Resp. Legal</th><th>CPF</th></tr></thead>
      <tbody>${familiaresRows}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">3. Diagnóstico sociofamiliar</div>
    <div class="grid2">
      <div class="field"><label>Renda familiar</label><span>${val(i.renda_familiar)}</span></div>
      <div class="field"><label>Disponibilidade de horários</label><span>${val(i.disponibilidade_horarios)}</span></div>
    </div>
    <div class="field" style="margin-top:8px"><label>Procedimentos e/ou encaminhamentos a realizar</label><span>${val(i.procedimentos_encaminhamentos)}</span></div>
    <div class="field" style="margin-top:8px"><label>Situação do usuário</label><span>${situacoesMarcadas}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Informações sobre saúde</div>
    <div class="grid3">
      <div class="field"><label>Hipertenso</label><span>${i.hipertenso === true ? "Sim" : i.hipertenso === false ? "Não" : "—"}</span></div>
      <div class="field"><label>Diabetes</label><span>${i.diabetes === true ? "Sim" : i.diabetes === false ? "Não" : "—"}</span></div>
      <div class="field"><label>Possui deficiência</label><span>${i.possui_deficiencia === true ? "Sim" : i.possui_deficiencia === false ? "Não" : "—"}</span></div>
    </div>
    <div class="field" style="margin-top:8px"><label>Outros problemas de saúde</label><span>${val(i.outros_problemas_saude)}</span></div>
    <div class="field" style="margin-top:8px"><label>Qual deficiência</label><span>${val(i.qual_deficiencia)}</span></div>
  </div>

  ${i.observacoes ? `<div class="section"><div class="section-title">Observações</div><div class="field"><span>${escapeHtml(i.observacoes)}</span></div></div>` : ""}

  <div class="signature-row">
    <div class="signature-block">
      <div class="signature-line"></div>
      <p class="signature-label">Assinatura do(a) usuário / responsável</p>
    </div>
    <div class="signature-block">
      <div class="signature-line"></div>
      <p class="signature-label">Assinatura do(a) Técnico de Referência</p>
    </div>
  </div>

  <div class="actions">
    <button class="btn-print" onclick="window.print()">Imprimir</button>
  </div>
</body>
</html>`);
  win.document.close();
}

// ─── Componente principal ───────────────────────────────────────────────────
export function ConvivenciaManager() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Inscricao | null>(null);
  const [form, setForm] = useState<Partial<Inscricao>>(EMPTY_FORM);
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { data, error: err } = await supabase
      .from("convivencia_inscricoes")
      .select("*")
      .order("nome", { ascending: true });

    if (err) {
      setError("Erro ao carregar inscrições: " + err.message);
    } else {
      setInscricoes((data ?? []) as Inscricao[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = inscricoes.filter((i) => {
    if (statusFiltro && i.status !== statusFiltro) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      i.nome?.toLowerCase().includes(q) ||
      i.cpf?.toLowerCase().includes(q) ||
      i.nis?.toLowerCase().includes(q)
    );
  });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFamiliares([]);
    setSaveError(null);
    setModalOpen(true);
  }

  async function openEdit(inscricao: Inscricao) {
    setEditing(inscricao);
    setForm(inscricao);
    setSaveError(null);
    setModalOpen(true);

    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("convivencia_familiares")
      .select("*")
      .eq("inscricao_id", inscricao.id)
      .order("ordem", { ascending: true });
    setFamiliares((data ?? []) as Familiar[]);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFamiliares([]);
  }

  function setField<K extends keyof Inscricao>(key: K, value: Inscricao[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleSituacao(code: number) {
    setForm((f) => {
      const atual = f.situacao_usuario ?? [];
      const novo = atual.includes(code) ? atual.filter((c) => c !== code) : [...atual, code];
      return { ...f, situacao_usuario: novo };
    });
  }

  function addFamiliar() {
    setFamiliares((prev) => [...prev, { nome: "", data_nascimento: "", vinculo_sociofamiliar: "", responsavel_legal: false, cpf: "" }]);
  }

  function updateFamiliar(index: number, patch: Partial<Familiar>) {
    setFamiliares((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeFamiliar(index: number) {
    setFamiliares((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!form.nome?.trim()) {
      setSaveError("O nome é obrigatório.");
      return;
    }
    setSaving(true);
    setSaveError(null);

    const supabase = createSupabaseBrowserClient();
    const { id: _id, created_at: _createdAt, ...payload } = form as Inscricao;

    let inscricaoId = editing?.id ?? null;
    let savedRecord: Inscricao | null = null;

    if (editing) {
      const { data, error: err } = await supabase
        .from("convivencia_inscricoes")
        .update(payload)
        .eq("id", editing.id)
        .select()
        .single();
      if (err) {
        setSaving(false);
        setSaveError("Erro ao salvar: " + err.message);
        return;
      }
      savedRecord = data as Inscricao;
    } else {
      const { data, error: err } = await supabase
        .from("convivencia_inscricoes")
        .insert(payload)
        .select()
        .single();
      if (err) {
        setSaving(false);
        setSaveError("Erro ao cadastrar: " + err.message);
        return;
      }
      savedRecord = data as Inscricao;
      inscricaoId = savedRecord.id;
    }

    // Substitui o núcleo familiar (apaga e reinsere)
    if (inscricaoId) {
      await supabase.from("convivencia_familiares").delete().eq("inscricao_id", inscricaoId);
      const familiaresValidos = familiares.filter((f) => f.nome.trim());
      if (familiaresValidos.length) {
        await supabase.from("convivencia_familiares").insert(
          familiaresValidos.map((f, idx) => ({
            inscricao_id: inscricaoId,
            ordem: idx,
            nome: f.nome,
            data_nascimento: f.data_nascimento || null,
            vinculo_sociofamiliar: f.vinculo_sociofamiliar || null,
            responsavel_legal: f.responsavel_legal,
            cpf: f.cpf || null,
          }))
        );
      }
    }

    setSaving(false);
    await load();
    closeModal();
    if (savedRecord) openPrint(savedRecord, familiares.filter((f) => f.nome.trim()));
  }

  async function printInscricao(inscricao: Inscricao) {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("convivencia_familiares")
      .select("*")
      .eq("inscricao_id", inscricao.id)
      .order("ordem", { ascending: true });
    openPrint(inscricao, (data ?? []) as Familiar[]);
  }

  async function handleDelete(inscricao: Inscricao) {
    if (!window.confirm(`Excluir a inscrição de "${inscricao.nome}"? Esta ação não pode ser desfeita.`)) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from("convivencia_inscricoes").delete().eq("id", inscricao.id);
    setInscricoes((prev) => prev.filter((i) => i.id !== inscricao.id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Inscrições — Serviço de Convivência (SCFV)</h1>
          <p className="text-sm text-gray-500">Fichas de inscrição do Serviço de Convivência e Fortalecimento de Vínculos.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700"
        >
          <UserPlus className="h-4 w-4" />
          Nova inscrição
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="desligado">Desligado</option>
          </select>

          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, CPF ou NIS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <span className="ml-auto shrink-0 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
            {loading ? "..." : `${filtered.length} inscrição${filtered.length !== 1 ? "ões" : ""}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          {error ? (
            <div className="p-6 text-center text-sm text-amber-700 bg-amber-50">{error}</div>
          ) : loading ? (
            <div className="p-10 text-center text-sm text-gray-400">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <Users className="h-10 w-10 text-gray-200" />
              <p className="text-sm text-gray-400">Nenhuma inscrição encontrada.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">CPF</th>
                  <th className="px-4 py-3">CRAS</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{i.nome}</td>
                    <td className="px-4 py-3 text-gray-500">{val(i.cpf)}</td>
                    <td className="px-4 py-3 text-gray-500">{val(i.cras_referencia)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[i.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => printInscricao(i)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="Imprimir">
                          <Printer className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => openEdit(i)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-violet-600" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(i)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600" title="Excluir">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm">
          <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
              {editing ? <Pencil className="h-5 w-5 text-violet-500" /> : <UserPlus className="h-5 w-5 text-emerald-500" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{editing ? "Editando" : "Nova Inscrição"}</p>
                <p className="text-sm font-bold text-gray-900 truncate">{editing ? editing.nome : "Ficha SCFV"}</p>
              </div>
              <button type="button" onClick={closeModal} disabled={saving} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <Section title="Dados do serviço">
                <Row3>
                  <Field label="CRAS de referência">
                    <TInput value={form.cras_referencia ?? ""} onChange={(v) => setField("cras_referencia", v)} />
                  </Field>
                  <Field label="Local de funcionamento">
                    <TInput value={form.local_funcionamento ?? ""} onChange={(v) => setField("local_funcionamento", v)} />
                  </Field>
                  <Field label="Endereço de funcionamento">
                    <TInput value={form.endereco_funcionamento ?? ""} onChange={(v) => setField("endereco_funcionamento", v)} />
                  </Field>
                </Row3>
              </Section>

              <Section title="1. Dados sociofamiliares">
                <Row3>
                  <Field label="Nome *">
                    <TInput value={form.nome ?? ""} onChange={(v) => setField("nome", v)} />
                  </Field>
                  <Field label="Sexo/Gênero">
                    <TInput value={form.sexo_genero ?? ""} onChange={(v) => setField("sexo_genero", v)} />
                  </Field>
                  <Field label="NIS">
                    <TInput value={form.nis ?? ""} onChange={(v) => setField("nis", v)} />
                  </Field>
                </Row3>
                <Row3>
                  <Field label="Data de Nascimento">
                    <DateInput value={form.data_nascimento ?? ""} onChange={(v) => setField("data_nascimento", v)} />
                  </Field>
                  <Field label="CPF">
                    <TInput value={form.cpf ?? ""} onChange={(v) => setField("cpf", v)} />
                  </Field>
                  <Field label="Nome social">
                    <TInput value={form.nome_social ?? ""} onChange={(v) => setField("nome_social", v)} />
                  </Field>
                </Row3>
                <Row3>
                  <Field label="Nome da mãe">
                    <TInput value={form.nome_mae ?? ""} onChange={(v) => setField("nome_mae", v)} />
                  </Field>
                  <Field label="NIS da mãe">
                    <TInput value={form.nis_mae ?? ""} onChange={(v) => setField("nis_mae", v)} />
                  </Field>
                  <Field label="Data Nasc. da mãe">
                    <DateInput value={form.data_nascimento_mae ?? ""} onChange={(v) => setField("data_nascimento_mae", v)} />
                  </Field>
                </Row3>
                <Row2>
                  <Field label="CPF da mãe">
                    <TInput value={form.cpf_mae ?? ""} onChange={(v) => setField("cpf_mae", v)} />
                  </Field>
                  <Field label="Nome do responsável">
                    <TInput value={form.nome_responsavel ?? ""} onChange={(v) => setField("nome_responsavel", v)} />
                  </Field>
                </Row2>
              </Section>

              <Section title="Endereço e contato">
                <Row2>
                  <Field label="Endereço (Rua, Av., Bairro)">
                    <TInput value={form.endereco ?? ""} onChange={(v) => setField("endereco", v)} />
                  </Field>
                  <Field label="Ponto de referência">
                    <TInput value={form.ponto_referencia ?? ""} onChange={(v) => setField("ponto_referencia", v)} />
                  </Field>
                </Row2>
                <Row3>
                  <Field label="Cidade">
                    <TInput value={form.cidade ?? ""} onChange={(v) => setField("cidade", v)} />
                  </Field>
                  <Field label="UF">
                    <TInput value={form.uf ?? ""} onChange={(v) => setField("uf", v)} />
                  </Field>
                  <Field label="CEP">
                    <TInput value={form.cep ?? ""} onChange={(v) => setField("cep", v)} />
                  </Field>
                </Row3>
                <Row2>
                  <Field label="DDD/Telefone">
                    <TInput value={form.ddd_telefone ?? ""} onChange={(v) => setField("ddd_telefone", v)} />
                  </Field>
                  <Field label="Celular">
                    <TInput value={form.celular ?? ""} onChange={(v) => setField("celular", v)} />
                  </Field>
                </Row2>
              </Section>

              <Section title="Escolaridade">
                <Row3>
                  <Field label="Estuda">
                    <select
                      value={form.estuda === true ? "sim" : form.estuda === false ? "nao" : ""}
                      onChange={(e) => setField("estuda", e.target.value === "" ? null : e.target.value === "sim")}
                      className={selectCls}
                    >
                      <option value="">—</option>
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </select>
                  </Field>
                  <Field label="Nome da escola">
                    <TInput value={form.nome_escola ?? ""} onChange={(v) => setField("nome_escola", v)} />
                  </Field>
                  <Field label="Ano/Série">
                    <TInput value={form.ano_serie ?? ""} onChange={(v) => setField("ano_serie", v)} />
                  </Field>
                </Row3>
                <Row2>
                  <Field label="Turno">
                    <TInput value={form.turno ?? ""} onChange={(v) => setField("turno", v)} />
                  </Field>
                  <Field label="Caso não estude, último ano/série cursada">
                    <TInput value={form.ultima_serie_cursada ?? ""} onChange={(v) => setField("ultima_serie_cursada", v)} />
                  </Field>
                </Row2>
              </Section>

              <Section title="Contexto da procura">
                <Row2>
                  <Field label="Qual o motivo pelo qual procurou o serviço?">
                    <TArea value={form.motivo_procura ?? ""} onChange={(v) => setField("motivo_procura", v)} />
                  </Field>
                  <Field label="Como soube da existência do serviço?">
                    <TArea value={form.como_soube ?? ""} onChange={(v) => setField("como_soube", v)} />
                  </Field>
                </Row2>
              </Section>

              <Section title="2. Pessoas que compõem o núcleo familiar">
                <div className="space-y-2">
                  {familiares.map((f, idx) => (
                    <div key={idx} className="grid grid-cols-[2fr_1fr_1.4fr_auto_1.2fr_auto] items-center gap-2 rounded-lg border border-gray-100 p-2">
                      <input
                        type="text"
                        value={f.nome}
                        placeholder="Nome"
                        onChange={(e) => updateFamiliar(idx, { nome: e.target.value })}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-violet-400"
                      />
                      <input
                        type="text"
                        value={f.data_nascimento}
                        placeholder="dd/mm/aaaa"
                        onChange={(e) => updateFamiliar(idx, { data_nascimento: e.target.value })}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-violet-400"
                      />
                      <input
                        type="text"
                        value={f.vinculo_sociofamiliar}
                        placeholder="Vínculo sociofamiliar"
                        onChange={(e) => updateFamiliar(idx, { vinculo_sociofamiliar: e.target.value })}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-violet-400"
                      />
                      <label className="flex items-center gap-1 text-[11px] text-gray-500 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={f.responsavel_legal}
                          onChange={(e) => updateFamiliar(idx, { responsavel_legal: e.target.checked })}
                        />
                        Resp. Legal
                      </label>
                      <input
                        type="text"
                        value={f.cpf}
                        placeholder="CPF"
                        onChange={(e) => updateFamiliar(idx, { cpf: e.target.value })}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-violet-400"
                      />
                      <button type="button" onClick={() => removeFamiliar(idx)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFamiliar}
                    className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-semibold text-gray-500 hover:border-primary hover:text-primary"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar familiar
                  </button>
                </div>
              </Section>

              <Section title="3. Diagnóstico sociofamiliar">
                <Row2>
                  <Field label="Renda familiar">
                    <TInput value={form.renda_familiar ?? ""} onChange={(v) => setField("renda_familiar", v)} />
                  </Field>
                  <Field label="Disponibilidade de horários do usuário">
                    <TInput value={form.disponibilidade_horarios ?? ""} onChange={(v) => setField("disponibilidade_horarios", v)} />
                  </Field>
                </Row2>
                <Field label="Procedimentos e/ou encaminhamentos a realizar">
                  <TArea value={form.procedimentos_encaminhamentos ?? ""} onChange={(v) => setField("procedimentos_encaminhamentos", v)} />
                </Field>
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Situação do usuário</p>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {SITUACOES.map((s) => (
                      <label key={s.code} className="flex items-start gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={form.situacao_usuario?.includes(s.code) ?? false}
                          onChange={() => toggleSituacao(s.code)}
                        />
                        <span>{s.code}. {s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </Section>

              <Section title="Informações sobre saúde">
                <Row3>
                  <Field label="É hipertenso?">
                    <select
                      value={form.hipertenso === true ? "sim" : form.hipertenso === false ? "nao" : ""}
                      onChange={(e) => setField("hipertenso", e.target.value === "" ? null : e.target.value === "sim")}
                      className={selectCls}
                    >
                      <option value="">—</option>
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </select>
                  </Field>
                  <Field label="Tem diabetes?">
                    <select
                      value={form.diabetes === true ? "sim" : form.diabetes === false ? "nao" : ""}
                      onChange={(e) => setField("diabetes", e.target.value === "" ? null : e.target.value === "sim")}
                      className={selectCls}
                    >
                      <option value="">—</option>
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </select>
                  </Field>
                  <Field label="Possui deficiência?">
                    <select
                      value={form.possui_deficiencia === true ? "sim" : form.possui_deficiencia === false ? "nao" : ""}
                      onChange={(e) => setField("possui_deficiencia", e.target.value === "" ? null : e.target.value === "sim")}
                      className={selectCls}
                    >
                      <option value="">—</option>
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </select>
                  </Field>
                </Row3>
                <Row2>
                  <Field label="Outros problemas de saúde? Quais?">
                    <TArea value={form.outros_problemas_saude ?? ""} onChange={(v) => setField("outros_problemas_saude", v)} />
                  </Field>
                  <Field label="Qual deficiência?">
                    <TArea value={form.qual_deficiencia ?? ""} onChange={(v) => setField("qual_deficiencia", v)} />
                  </Field>
                </Row2>
              </Section>

              <Section title="Observações e status">
                <Row3>
                  <Field label="Data da inscrição">
                    <DateInput value={form.data_inscricao ?? ""} onChange={(v) => setField("data_inscricao", v)} />
                  </Field>
                  <Field label="Status">
                    <select value={form.status ?? "ativo"} onChange={(e) => setField("status", e.target.value)} className={selectCls}>
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="desligado">Desligado</option>
                    </select>
                  </Field>
                </Row3>
                <Field label="Observações">
                  <TArea value={form.observacoes ?? ""} onChange={(v) => setField("observacoes", v)} />
                </Field>
              </Section>
            </div>

            {saveError && <p className="px-6 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">{saveError}</p>}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button type="button" onClick={closeModal} disabled={saving} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</> : <><Save className="h-4 w-4" />Salvar inscrição</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componentes auxiliares do formulário ──────────────────────────────────────

const selectCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100 bg-white";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-orange-500">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Row3({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-3">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function TInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100"
    />
  );
}

function TArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      rows={2}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100"
    />
  );
}

/** Input de data com máscara automática dd/mm/yyyy enquanto o usuário digita. */
function DateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  function applyMask(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      placeholder="dd/mm/aaaa"
      maxLength={10}
      onChange={(e) => onChange(applyMask(e.target.value))}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100 placeholder:text-gray-300 tracking-widest"
    />
  );
}
