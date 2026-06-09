"use client";

import React, { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Printer, Search, X, UserRound, Pencil, Save, Loader2, UserPlus, Upload } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Aluno = {
  id: string;
  matricula_nr: string;
  nome_aluno: string;
  data_nascimento: string | null;
  sexo: string | null;
  grupo_etnico: string | null;
  numero_nis: string | null;
  foto_url: string | null;
  assento_nr: string | null;
  cartorio_registro: string | null;
  data_registro_nascimento: string | null;
  cidade_registro_nascimento: string | null;
  estado_registro: string | null;
  folha_registro_nr: string | null;
  nr_livro_registro_nasc: string | null;
  endereco_aluno: string | null;
  bairro_aluno: string | null;
  cidade_aluno: string | null;
  estado_residencia: string | null;
  nome_mae: string | null;
  cpf_mae: string | null;
  rg_mae: string | null;
  profissao_mae: string | null;
  nome_pai: string | null;
  cpf_pai: string | null;
  rg_pai: string | null;
  profissao_pai: string | null;
  nome_responsavel: string | null;
  fone_contato: string | null;
  possui_alergia: boolean;
  qual_alergia: string | null;
  necessidade_especial: boolean;
  necessidade_especial_text: string | null;
  serie: string;
  ano_letivo: string;
  status: string;
  qual_horario: string | null;
  qual_projeto: string | null;
  tipo_cadastro: string | null;
  transferido: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────
// Séries são carregadas dinamicamente do banco (alunos com status Matriculado)

const STATUS_STYLE: Record<string, string> = {
  Matriculado: "bg-emerald-100 text-emerald-700",
  Transferido: "bg-yellow-100 text-yellow-700",
  Desistente:  "bg-red-100 text-red-700",
  Concluído:   "bg-blue-100 text-blue-700",
  Cancelado:   "bg-gray-100 text-gray-500",
};

// Status que indicam aluno ATIVO (aparece na lista principal)
const STATUS_ATIVO = "Matriculado";

// Status de histórico (saída)
const STATUS_HISTORICO = ["Transferido", "Desistente", "Concluído", "Cancelado"];

function val(v: string | null | undefined) {
  return v && v.trim() ? v : "—";
}

function escapeAttr(v: string) {
  return v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeHtml(v: string) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── Print ficha in new window ────────────────────────────────────────────────
function openPrint(a: Aluno) {
  const win = window.open("", "_blank", "width=820,height=960");
  if (!win) return;

  const fotoUrl = a.foto_url?.trim();
  const fotoMarkup = fotoUrl
    ? `<img class="student-photo" src="${escapeAttr(fotoUrl)}" alt="Foto de ${escapeAttr(a.nome_aluno)}">`
    : `<div class="student-photo photo-empty">Sem foto</div>`;

  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Ficha — ${a.nome_aluno}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 24px; }
    h1 { font-size: 20px; font-weight: bold; }
    .sub { font-size: 12px; color: #555; margin-top: 2px; margin-bottom: 16px; }
    .photo-box { float: right; width: 118px; margin-left: 20px; margin-bottom: 12px; }
    .student-photo { display: block; width: 118px; height: 142px; object-fit: cover; object-position: center top;
      border: 1px solid #d1d5db; border-radius: 8px; background: #f9fafb; }
    .photo-empty { display: flex; align-items: center; justify-content: center; color: #9ca3af;
      font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: .06em; }
    .section { margin-top: 14px; border-top: 1px solid #ddd; padding-top: 10px; }
    .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase;
      letter-spacing: .08em; color: #ea580c; margin-bottom: 8px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px 20px; }
    .field label { font-size: 10px; color: #666; display: block; margin-bottom: 1px; }
    .field span { font-weight: 600; font-size: 12px; }
    .badge { display: inline-block; padding: 1px 8px; border-radius: 9999px;
      font-size: 10px; font-weight: bold;
      background: ${a.status === "Ativo" ? "#d1fae5" : a.status === "Transferido" ? "#fef9c3" : "#f3f4f6"};
      color: ${a.status === "Ativo" ? "#065f46" : a.status === "Transferido" ? "#854d0e" : "#374151"}; }
    .actions { margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px; text-align: right; }
    .btn-print { padding: 8px 24px; background: #ea580c; color: #fff; border: none;
      border-radius: 6px; font-size: 13px; font-weight: bold; cursor: pointer; }
    @media print { .actions { display: none; } body { padding: 12px; } .student-photo { break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="photo-box">${fotoMarkup}</div>
  <h1>${val(a.nome_aluno)}</h1>
  <p class="sub">
    Matrícula: <strong>${val(a.matricula_nr)}</strong> &nbsp;·&nbsp;
    Série: <strong>${val(a.serie)}</strong> &nbsp;·&nbsp;
    Ano: <strong>${val(a.ano_letivo)}</strong> &nbsp;·&nbsp;
    <span class="badge">${val(a.status)}</span>
  </p>

  <div class="section">
    <div class="section-title">Identificação</div>
    <div class="grid3">
      <div class="field"><label>Data de Nascimento</label><span>${val(a.data_nascimento)}</span></div>
      <div class="field"><label>Sexo</label><span>${val(a.sexo)}</span></div>
      <div class="field"><label>Grupo Étnico</label><span>${val(a.grupo_etnico)}</span></div>
      <div class="field"><label>Nº NIS</label><span>${val(a.numero_nis)}</span></div>
      <div class="field"><label>Possui Alergia</label><span>${a.possui_alergia ? "Sim" : "Não"}</span></div>
      <div class="field"><label>Qual Alergia</label><span>${val(a.qual_alergia)}</span></div>
      <div class="field"><label>Necessidade Especial</label><span>${a.necessidade_especial ? "Sim" : "Não"}</span></div>
      <div class="field"><label>Descrição</label><span>${val(a.necessidade_especial_text)}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Registro Civil</div>
    <div class="grid3">
      <div class="field"><label>Data do Registro</label><span>${val(a.data_registro_nascimento)}</span></div>
      <div class="field"><label>Cartório</label><span>${val(a.cartorio_registro)}</span></div>
      <div class="field"><label>Assento Nº</label><span>${val(a.assento_nr)}</span></div>
      <div class="field"><label>Folha Nº</label><span>${val(a.folha_registro_nr)}</span></div>
      <div class="field"><label>Livro Nº</label><span>${val(a.nr_livro_registro_nasc)}</span></div>
      <div class="field"><label>Cidade de Registro</label><span>${val(a.cidade_registro_nascimento)}</span></div>
      <div class="field"><label>Estado de Registro</label><span>${val(a.estado_registro)}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Endereço</div>
    <div class="grid2">
      <div class="field"><label>Endereço</label><span>${val(a.endereco_aluno)}</span></div>
      <div class="field"><label>Bairro</label><span>${val(a.bairro_aluno)}</span></div>
      <div class="field"><label>Cidade</label><span>${val(a.cidade_aluno)}</span></div>
      <div class="field"><label>Estado</label><span>${val(a.estado_residencia)}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Filiação — Mãe</div>
    <div class="grid3">
      <div class="field"><label>Nome</label><span>${val(a.nome_mae)}</span></div>
      <div class="field"><label>CPF</label><span>${val(a.cpf_mae)}</span></div>
      <div class="field"><label>RG</label><span>${val(a.rg_mae)}</span></div>
      <div class="field"><label>Profissão</label><span>${val(a.profissao_mae)}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Filiação — Pai</div>
    <div class="grid3">
      <div class="field"><label>Nome</label><span>${val(a.nome_pai)}</span></div>
      <div class="field"><label>CPF</label><span>${val(a.cpf_pai)}</span></div>
      <div class="field"><label>RG</label><span>${val(a.rg_pai)}</span></div>
      <div class="field"><label>Profissão</label><span>${val(a.profissao_pai)}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Responsável</div>
    <div class="grid2">
      <div class="field"><label>Nome do Responsável</label><span>${val(a.nome_responsavel)}</span></div>
      <div class="field"><label>Telefone / Contato</label><span>${val(a.fone_contato)}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Informações Escolares</div>
    <div class="grid3">
      <div class="field"><label>Série</label><span>${val(a.serie)}</span></div>
      <div class="field"><label>Ano Letivo</label><span>${val(a.ano_letivo)}</span></div>
      <div class="field"><label>Horário</label><span>${val(a.qual_horario)}</span></div>
      <div class="field"><label>Projeto</label><span>${val(a.qual_projeto)}</span></div>
      <div class="field"><label>Tipo de Cadastro</label><span>${val(a.tipo_cadastro)}</span></div>
      <div class="field"><label>Transferido</label><span>${a.transferido ? "Sim" : "Não"}</span></div>
    </div>
  </div>

  <div class="actions">
    <button class="btn-print" onclick="window.print()">🖨️ Imprimir</button>
  </div>
</body>
</html>`);
  win.document.close();
}

// ─── Main component ───────────────────────────────────────────────────────────
function openPrintList(alunos: Aluno[], serie: string, filters: { anoLetivo: string; status: string }) {
  const win = window.open("", "_blank", "width=900,height=960");
  if (!win) return;

  const rows = alunos
    .map((a, index) => `
      <tr>
        <td class="num">${index + 1}</td>
        <td>${escapeHtml(val(a.nome_aluno))}</td>
        <td>${escapeHtml(val(a.serie))}</td>
        <td>${escapeHtml(val(a.matricula_nr))}</td>
        <td>${escapeHtml(val(a.ano_letivo))}</td>
      </tr>
    `)
    .join("");

  const filterText = [
    `Série: ${serie}`,
    filters.anoLetivo ? `Ano letivo: ${filters.anoLetivo}` : "Ano letivo: todos",
    filters.status ? `Status: ${filters.status}` : "Status: todos",
  ].join(" | ");

  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Lista de conferência — ${escapeHtml(serie)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #111; padding: 24px; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .sub { color: #555; font-size: 12px; margin-bottom: 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #d1d5db; padding: 7px 8px; text-align: left; }
    th { background: #f3f4f6; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; }
    .num { width: 42px; text-align: center; color: #555; }
    .empty { border: 1px dashed #d1d5db; color: #777; padding: 18px; text-align: center; font-size: 13px; }
    .actions { margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px; text-align: right; }
    .btn-print { padding: 8px 24px; background: #ea580c; color: #fff; border: none;
      border-radius: 6px; font-size: 13px; font-weight: bold; cursor: pointer; }
    @media print { body { padding: 12px; } .actions { display: none; } thead { display: table-header-group; } tr { break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>Lista de conferência</h1>
  <p class="sub">${escapeHtml(filterText)} | Total: ${alunos.length}</p>
  ${
    alunos.length
      ? `<table>
          <thead>
            <tr>
              <th class="num">Nº</th>
              <th>Nome do aluno</th>
              <th>Série</th>
              <th>Matrícula</th>
              <th>Ano letivo</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`
      : `<div class="empty">Nenhum aluno encontrado para os filtros selecionados.</div>`
  }
  <div class="actions">
    <button class="btn-print" onclick="window.print()">Imprimir lista</button>
  </div>
</body>
</html>`);
  win.document.close();
}

export function CrecheManager() {
  const [series, setSeries]                 = useState<string[]>([]);
  const [activeSerie, setActiveSerie]       = useState<string>("");
  const [search, setSearch]                 = useState("");
  const [anoLetivo, setAnoLetivo]           = useState("");
  const [statusFiltro, setStatusFiltro]     = useState("");
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [alunos, setAlunos]                 = useState<Aluno[]>([]);
  const [loading, setLoading]               = useState(false);
  const [loadingSeries, setLoadingSeries]   = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  // ── Carrega as séries disponíveis no banco (alunos Matriculados) ──────────
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    const supabase = createSupabaseBrowserClient();
    supabase
      .from("alunos")
      .select("serie")
      .eq("status", STATUS_ATIVO)
      .order("serie", { ascending: true })
      .then(({ data }) => {
        const distintas = Array.from(
          new Set((data ?? []).map((r: { serie: string }) => r.serie).filter(Boolean))
        ).sort() as string[];
        setSeries(distintas);
        if (distintas.length > 0) setActiveSerie(distintas[0]);
        setLoadingSeries(false);
      });
  }, []);

  // ── Fetch alunos quando série ativa ou modo histórico muda ───────────────
  useEffect(() => {
    if (!activeSerie || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    let query = supabase
      .from("alunos")
      .select("*")
      .eq("serie", activeSerie)
      .order("nome_aluno", { ascending: true });

    // Modo padrão: apenas matriculados | Modo histórico: apenas saídas
    if (!mostrarHistorico) {
      query = query.eq("status", STATUS_ATIVO);
    } else {
      query = query.in("status", STATUS_HISTORICO);
    }

    query.then(({ data, error: err }) => {
      setLoading(false);
      if (err) {
        setError("Tabela 'alunos' não encontrada. Execute a migration no Supabase.");
        setAlunos([]);
        return;
      }
      setAlunos((data ?? []) as Aluno[]);
    });
  }, [activeSerie, mostrarHistorico]);

  // ── Estado do modal de edição ────────────────────────────────────────────
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [editForm, setEditForm]         = useState<Partial<Aluno>>({});
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState<string | null>(null);

  // ── Estado do modal de cadastro ───────────────────────────────────────────
  const [creatingAluno, setCreatingAluno] = useState(false);
  const [createForm, setCreateForm]       = useState<Partial<Aluno>>({});
  const [creating, setCreating]           = useState(false);
  const [createError, setCreateError]     = useState<string | null>(null);
  const [photoFile, setPhotoFile]         = useState<File | null>(null);
  const [photoPreview, setPhotoPreview]   = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef                     = useRef<HTMLInputElement>(null);

  function openEdit(aluno: Aluno) {
    setEditingAluno(aluno);
    setEditForm({ ...aluno });
    setSaveError(null);
  }

  function closeEdit() {
    if (saving) return;
    setEditingAluno(null);
    setEditForm({});
  }

  function openCreate() {
    const anoAtual = String(new Date().getFullYear());
    setCreateForm({
      serie: activeSerie,
      status: STATUS_ATIVO,
      ano_letivo: anoAtual,
      possui_alergia: false,
      necessidade_especial: false,
      transferido: false,
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setCreateError(null);
    setCreatingAluno(true);
  }

  function closeCreate() {
    if (creating) return;
    setCreatingAluno(false);
    setCreateForm({});
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function setCreateField(key: keyof Aluno, value: string | boolean | null) {
    setCreateForm((f) => ({ ...f, [key]: value }));
  }

  function setCreateFieldUpper(key: keyof Aluno, value: string) {
    setCreateForm((f) => ({ ...f, [key]: value.toUpperCase() }));
  }

  async function handleCreate() {
    if (!createForm.nome_aluno?.trim()) {
      setCreateError("O nome do aluno é obrigatório.");
      return;
    }
    setCreating(true);
    setCreateError(null);

    const supabase = createSupabaseBrowserClient();

    // Faz upload da foto se houver arquivo selecionado
    let fotoUrl: string | null = createForm.foto_url ?? null;
    if (photoFile) {
      setUploadingPhoto(true);
      try {
        const ext  = photoFile.name.split(".").pop() ?? "jpg";
        const path = `alunos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("creche-miranez")
          .upload(path, photoFile, { upsert: false });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from("creche-miranez")
            .getPublicUrl(path);
          fotoUrl = urlData.publicUrl;
        } else {
          // Upload falhou mas segue sem foto, apenas avisa
          console.warn("Upload de foto falhou:", uploadErr.message);
        }
      } catch {
        console.warn("Erro inesperado no upload de foto.");
      } finally {
        setUploadingPhoto(false);
      }
    }

    // Monta payload com uppercase nos campos de texto
    const raw: Partial<Aluno> = { ...createForm, foto_url: fotoUrl };
    const payload: Partial<Aluno> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (SKIP_UPPER.has(k) || typeof v !== "string") {
        (payload as Record<string, unknown>)[k] = v;
      } else {
        (payload as Record<string, unknown>)[k] = v.toUpperCase();
      }
    }

    const { data: inserted, error: err } = await supabase
      .from("alunos")
      .insert(payload)
      .select()
      .single();

    setCreating(false);
    if (err) {
      setCreateError("Erro ao cadastrar: " + err.message);
      return;
    }

    // Adiciona à lista local se for da série/status atual visível
    if (inserted) {
      const novoAluno = inserted as Aluno;
      const visivel =
        novoAluno.serie === activeSerie &&
        (!mostrarHistorico
          ? novoAluno.status === STATUS_ATIVO
          : STATUS_HISTORICO.includes(novoAluno.status));
      if (visivel) {
        setAlunos((prev) =>
          [...prev, novoAluno].sort((a, b) =>
            a.nome_aluno.localeCompare(b.nome_aluno, "pt-BR")
          )
        );
      }
    }

    closeCreate();
  }

  // Campos que NÃO devem ser convertidos para uppercase
  // "status" tem constraint com valores exatos (Matriculado, Transferido…)
  // "serie" vem do banco e deve ser preservada como está
  const SKIP_UPPER = new Set(["id", "foto_url", "possui_alergia", "necessidade_especial", "transferido", "created_at", "status", "serie"]);

  function setField(key: keyof Aluno, value: string | boolean | null) {
    setEditForm((f) => ({ ...f, [key]: value }));
  }

  function setFieldUpper(key: keyof Aluno, value: string) {
    setEditForm((f) => ({ ...f, [key]: value.toUpperCase() }));
  }

  async function handleSave() {
    if (!editingAluno) return;
    setSaving(true);
    setSaveError(null);

    // Aplica uppercase em todos os campos de texto
    const payload: Partial<Aluno> = {};
    for (const [k, v] of Object.entries(editForm)) {
      if (SKIP_UPPER.has(k) || typeof v !== "string") {
        (payload as Record<string, unknown>)[k] = v;
      } else {
        (payload as Record<string, unknown>)[k] = v.toUpperCase();
      }
    }

    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase
      .from("alunos")
      .update(payload)
      .eq("id", editingAluno.id);

    setSaving(false);
    if (err) {
      setSaveError("Erro ao salvar: " + err.message);
      return;
    }

    // Atualiza lista local
    setAlunos((prev) =>
      prev.map((a) => (a.id === editingAluno.id ? ({ ...a, ...payload } as Aluno) : a))
    );
    closeEdit();
  }

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filtered = alunos.filter((a) => {
    const matchSearch = a.nome_aluno.toLowerCase().includes(search.toLowerCase());
    const matchAno    = anoLetivo ? a.ano_letivo === anoLetivo : true;
    const matchStatus = statusFiltro ? a.status === statusFiltro : true;
    return matchSearch && matchAno && matchStatus;
  });

  // Collect distinct anos for filter dropdown
  const anos = Array.from(new Set(alunos.map((a) => a.ano_letivo))).sort().reverse();

  function resetFiltros() {
    setSearch("");
    setAnoLetivo("");
    setStatusFiltro("");
  }

  return (
    <div className="space-y-4">

      {/* ── Tab bar horizontal ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        {loadingSeries ? (
          <span className="text-sm text-gray-400 py-2">Carregando turmas...</span>
        ) : series.length === 0 ? (
          <span className="text-sm text-amber-600 py-2">Nenhuma turma com alunos matriculados encontrada.</span>
        ) : (
          series.map((serie) => (
            <button
              key={serie}
              type="button"
              onClick={() => {
                setActiveSerie(serie);
                resetFiltros();
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeSerie === serie
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-orange-50 hover:text-primary border border-gray-200"
              }`}
            >
              {serie}
            </button>
          ))
        )}

        {/* Ações direita: cadastrar + histórico */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <UserPlus className="h-4 w-4" />
            Cadastrar Novo Aluno
          </button>

          {/* Toggle histórico */}
          <button
            type="button"
            onClick={() => {
              setMostrarHistorico((v) => !v);
              resetFiltros();
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold border transition-colors ${
              mostrarHistorico
                ? "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {mostrarHistorico ? "📋 Ver matriculados" : "🗂 Ver histórico"}
          </button>
        </div>
      </div>

      {/* ── Container da série ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Cabeçalho com filtros */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">

          {/* Ano letivo */}
          <select
            value={anoLetivo}
            onChange={(e) => setAnoLetivo(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Todos os anos</option>
            {anos.map((ano) => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>

          {/* Filtro de status — só aparece no modo histórico */}
          {mostrarHistorico && (
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm outline-none focus:border-yellow-500"
            >
              <option value="">Todos os históricos</option>
              {STATUS_HISTORICO.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          {/* Série (informativo, não filtra — a tab já filtra) */}
          <span className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
            mostrarHistorico
              ? "border-yellow-300 bg-yellow-50 text-yellow-800"
              : "border-orange-200 bg-orange-50 text-primary"
          }`}>
            {activeSerie} {mostrarHistorico ? "· Histórico" : "· Matriculados"}
          </span>

          {/* Pesquisa */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar aluno..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Contagem */}
          <span className="ml-auto shrink-0 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
            {loading ? "..." : `${filtered.length} aluno${filtered.length !== 1 ? "s" : ""}`}
          </span>

          <button
            type="button"
            onClick={() => openPrintList(filtered, activeSerie, { anoLetivo, status: statusFiltro })}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Printer className="h-4 w-4" />
            Imprimir lista
          </button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-6 text-center text-sm text-amber-700 bg-amber-50 rounded-b-xl">
              {error}
            </div>
          ) : loading ? (
            <div className="p-10 text-center text-sm text-gray-400">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <UserRound className="h-10 w-10 text-gray-200" />
              <p className="text-sm text-gray-400">Nenhum aluno encontrado nesta turma.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3">Matrícula</th>
                  <th className="px-4 py-3">Nome do Aluno</th>
                  <th className="px-4 py-3">Responsável</th>
                  <th className="px-4 py-3">Contato</th>
                  <th className="px-4 py-3">Série</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ano Letivo</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((aluno) => (
                  <tr key={aluno.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{aluno.matricula_nr}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{aluno.nome_aluno}</td>
                    <td className="px-4 py-3 text-gray-700">{aluno.nome_responsavel ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{aluno.fone_contato ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{aluno.serie}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[aluno.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {aluno.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{aluno.ano_letivo}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          title="Editar dados do aluno"
                          onClick={() => openEdit(aluno)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-violet-50 hover:text-violet-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Ver e imprimir ficha"
                          onClick={() => openPrint(aluno)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-orange-50 hover:text-primary"
                        >
                          <Printer className="h-4 w-4" />
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

      {/* ── Modal de cadastro ────────────────────────────────────────────── */}
      {creatingAluno && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm">
          <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
              <UserPlus className="h-5 w-5 text-emerald-500" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Novo Cadastro</p>
                <p className="text-sm font-bold text-gray-900">Cadastrar Novo Aluno</p>
              </div>
              <button
                type="button"
                onClick={closeCreate}
                disabled={creating}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Corpo */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* ── Foto ── */}
              <Section title="Foto do Aluno">
                <div className="flex items-start gap-5">
                  {/* Preview */}
                  <div className="relative shrink-0">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview da foto"
                        className="h-32 w-28 rounded-xl object-cover object-top border border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="flex h-32 w-28 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                        <UserRound className="h-10 w-10 text-gray-300" />
                      </div>
                    )}
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={() => { setPhotoFile(null); setPhotoPreview(null); if (photoInputRef.current) photoInputRef.current.value = ""; }}
                        className="absolute -top-2 -right-2 rounded-full bg-white border border-gray-200 p-0.5 text-gray-400 hover:text-red-500 shadow-sm"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {/* Botões de upload */}
                  <div className="flex flex-col gap-3 pt-1">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      {photoPreview ? "Trocar foto" : "Selecionar foto"}
                    </button>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      JPG, PNG ou WEBP.<br />A foto será enviada ao salvar.
                    </p>
                    {/* Ou URL manual */}
                    <Field label="Ou cole a URL da foto">
                      <TInput
                        value={createForm.foto_url ?? ""}
                        onChange={(v) => setCreateField("foto_url", v)}
                        placeholder="https://..."
                      />
                    </Field>
                  </div>
                </div>
              </Section>

              {/* ── Identificação ── */}
              <Section title="Identificação">
                <Row2>
                  <Field label="Nome do Aluno *">
                    <TInput value={createForm.nome_aluno ?? ""} onChange={(v) => setCreateField("nome_aluno", v)} onBlur={(v) => setCreateFieldUpper("nome_aluno", v)} />
                  </Field>
                  <Field label="Matrícula">
                    <TInput value={createForm.matricula_nr ?? ""} onChange={(v) => setCreateField("matricula_nr", v)} onBlur={(v) => setCreateFieldUpper("matricula_nr", v)} />
                  </Field>
                </Row2>
                <Row3>
                  <Field label="Data de Nascimento">
                    <TInput value={createForm.data_nascimento ?? ""} onChange={(v) => setCreateField("data_nascimento", v)} />
                  </Field>
                  <Field label="Sexo">
                    <select value={createForm.sexo ?? ""} onChange={(e) => setCreateField("sexo", e.target.value)} className={selectCls}>
                      <option value="">—</option>
                      <option value="MASCULINO">MASCULINO</option>
                      <option value="FEMININO">FEMININO</option>
                    </select>
                  </Field>
                  <Field label="Grupo Étnico">
                    <TInput value={createForm.grupo_etnico ?? ""} onChange={(v) => setCreateField("grupo_etnico", v)} onBlur={(v) => setCreateFieldUpper("grupo_etnico", v)} />
                  </Field>
                </Row3>
                <Row2>
                  <Field label="Nº NIS">
                    <TInput value={createForm.numero_nis ?? ""} onChange={(v) => setCreateField("numero_nis", v)} />
                  </Field>
                </Row2>
              </Section>

              {/* ── Registro Civil ── */}
              <Section title="Registro Civil">
                <Row3>
                  <Field label="Assento Nº">
                    <TInput value={createForm.assento_nr ?? ""} onChange={(v) => setCreateField("assento_nr", v)} onBlur={(v) => setCreateFieldUpper("assento_nr", v)} />
                  </Field>
                  <Field label="Data do Registro">
                    <TInput value={createForm.data_registro_nascimento ?? ""} onChange={(v) => setCreateField("data_registro_nascimento", v)} />
                  </Field>
                  <Field label="Cartório">
                    <TInput value={createForm.cartorio_registro ?? ""} onChange={(v) => setCreateField("cartorio_registro", v)} onBlur={(v) => setCreateFieldUpper("cartorio_registro", v)} />
                  </Field>
                </Row3>
                <Row3>
                  <Field label="Cidade de Registro">
                    <TInput value={createForm.cidade_registro_nascimento ?? ""} onChange={(v) => setCreateField("cidade_registro_nascimento", v)} onBlur={(v) => setCreateFieldUpper("cidade_registro_nascimento", v)} />
                  </Field>
                  <Field label="Estado">
                    <TInput value={createForm.estado_registro ?? ""} onChange={(v) => setCreateField("estado_registro", v)} onBlur={(v) => setCreateFieldUpper("estado_registro", v)} />
                  </Field>
                  <Field label="Folha Nº">
                    <TInput value={createForm.folha_registro_nr ?? ""} onChange={(v) => setCreateField("folha_registro_nr", v)} onBlur={(v) => setCreateFieldUpper("folha_registro_nr", v)} />
                  </Field>
                </Row3>
                <Row2>
                  <Field label="Livro Nº">
                    <TInput value={createForm.nr_livro_registro_nasc ?? ""} onChange={(v) => setCreateField("nr_livro_registro_nasc", v)} onBlur={(v) => setCreateFieldUpper("nr_livro_registro_nasc", v)} />
                  </Field>
                </Row2>
              </Section>

              {/* ── Endereço ── */}
              <Section title="Endereço">
                <Row2>
                  <Field label="Endereço">
                    <TInput value={createForm.endereco_aluno ?? ""} onChange={(v) => setCreateField("endereco_aluno", v)} onBlur={(v) => setCreateFieldUpper("endereco_aluno", v)} />
                  </Field>
                  <Field label="Bairro">
                    <TInput value={createForm.bairro_aluno ?? ""} onChange={(v) => setCreateField("bairro_aluno", v)} onBlur={(v) => setCreateFieldUpper("bairro_aluno", v)} />
                  </Field>
                </Row2>
                <Row2>
                  <Field label="Cidade">
                    <TInput value={createForm.cidade_aluno ?? ""} onChange={(v) => setCreateField("cidade_aluno", v)} onBlur={(v) => setCreateFieldUpper("cidade_aluno", v)} />
                  </Field>
                  <Field label="Estado">
                    <TInput value={createForm.estado_residencia ?? ""} onChange={(v) => setCreateField("estado_residencia", v)} onBlur={(v) => setCreateFieldUpper("estado_residencia", v)} />
                  </Field>
                </Row2>
              </Section>

              {/* ── Filiação — Mãe ── */}
              <Section title="Filiação — Mãe">
                <Row2>
                  <Field label="Nome da Mãe">
                    <TInput value={createForm.nome_mae ?? ""} onChange={(v) => setCreateField("nome_mae", v)} onBlur={(v) => setCreateFieldUpper("nome_mae", v)} />
                  </Field>
                  <Field label="Profissão">
                    <TInput value={createForm.profissao_mae ?? ""} onChange={(v) => setCreateField("profissao_mae", v)} onBlur={(v) => setCreateFieldUpper("profissao_mae", v)} />
                  </Field>
                </Row2>
                <Row2>
                  <Field label="CPF">
                    <TInput value={createForm.cpf_mae ?? ""} onChange={(v) => setCreateField("cpf_mae", v)} />
                  </Field>
                  <Field label="RG">
                    <TInput value={createForm.rg_mae ?? ""} onChange={(v) => setCreateField("rg_mae", v)} />
                  </Field>
                </Row2>
              </Section>

              {/* ── Filiação — Pai ── */}
              <Section title="Filiação — Pai">
                <Row2>
                  <Field label="Nome do Pai">
                    <TInput value={createForm.nome_pai ?? ""} onChange={(v) => setCreateField("nome_pai", v)} onBlur={(v) => setCreateFieldUpper("nome_pai", v)} />
                  </Field>
                  <Field label="Profissão">
                    <TInput value={createForm.profissao_pai ?? ""} onChange={(v) => setCreateField("profissao_pai", v)} onBlur={(v) => setCreateFieldUpper("profissao_pai", v)} />
                  </Field>
                </Row2>
                <Row2>
                  <Field label="CPF">
                    <TInput value={createForm.cpf_pai ?? ""} onChange={(v) => setCreateField("cpf_pai", v)} />
                  </Field>
                  <Field label="RG">
                    <TInput value={createForm.rg_pai ?? ""} onChange={(v) => setCreateField("rg_pai", v)} />
                  </Field>
                </Row2>
              </Section>

              {/* ── Responsável ── */}
              <Section title="Responsável">
                <Row2>
                  <Field label="Nome do Responsável">
                    <TInput value={createForm.nome_responsavel ?? ""} onChange={(v) => setCreateField("nome_responsavel", v)} onBlur={(v) => setCreateFieldUpper("nome_responsavel", v)} />
                  </Field>
                  <Field label="Telefone / Contato">
                    <TInput value={createForm.fone_contato ?? ""} onChange={(v) => setCreateField("fone_contato", v)} />
                  </Field>
                </Row2>
              </Section>

              {/* ── Saúde ── */}
              <Section title="Saúde">
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createForm.possui_alergia ?? false}
                      onChange={(e) => setCreateField("possui_alergia", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 accent-violet-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Possui alergia</span>
                  </label>
                  {createForm.possui_alergia && (
                    <Field label="Qual alergia?">
                      <TInput value={createForm.qual_alergia ?? ""} onChange={(v) => setCreateField("qual_alergia", v)} onBlur={(v) => setCreateFieldUpper("qual_alergia", v)} />
                    </Field>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createForm.necessidade_especial ?? false}
                      onChange={(e) => setCreateField("necessidade_especial", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 accent-violet-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Necessidade especial</span>
                  </label>
                  {createForm.necessidade_especial && (
                    <Field label="Descrição">
                      <TInput value={createForm.necessidade_especial_text ?? ""} onChange={(v) => setCreateField("necessidade_especial_text", v)} onBlur={(v) => setCreateFieldUpper("necessidade_especial_text", v)} />
                    </Field>
                  )}
                </div>
              </Section>

              {/* ── Informações Escolares ── */}
              <Section title="Informações Escolares">
                <Row3>
                  <Field label="Série">
                    <select value={createForm.serie ?? activeSerie} onChange={(e) => setCreateField("serie", e.target.value)} className={selectCls}>
                      {series.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Ano Letivo">
                    <TInput value={createForm.ano_letivo ?? ""} onChange={(v) => setCreateField("ano_letivo", v)} onBlur={(v) => setCreateFieldUpper("ano_letivo", v)} />
                  </Field>
                  <Field label="Status">
                    <select value={createForm.status ?? STATUS_ATIVO} onChange={(e) => setCreateField("status", e.target.value)} className={selectCls}>
                      <option value="Matriculado">Matriculado</option>
                      {STATUS_HISTORICO.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </Row3>
                <Row3>
                  <Field label="Horário">
                    <TInput value={createForm.qual_horario ?? ""} onChange={(v) => setCreateField("qual_horario", v)} onBlur={(v) => setCreateFieldUpper("qual_horario", v)} />
                  </Field>
                  <Field label="Projeto">
                    <TInput value={createForm.qual_projeto ?? ""} onChange={(v) => setCreateField("qual_projeto", v)} onBlur={(v) => setCreateFieldUpper("qual_projeto", v)} />
                  </Field>
                  <Field label="Tipo de Cadastro">
                    <TInput value={createForm.tipo_cadastro ?? ""} onChange={(v) => setCreateField("tipo_cadastro", v)} onBlur={(v) => setCreateFieldUpper("tipo_cadastro", v)} />
                  </Field>
                </Row3>
              </Section>

            </div>

            {/* Footer */}
            {createError && (
              <p className="px-6 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">{createError}</p>
            )}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={closeCreate}
                disabled={creating}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              >
                {creating
                  ? <><Loader2 className="h-4 w-4 animate-spin" />{uploadingPhoto ? "Enviando foto..." : "Cadastrando..."}</>
                  : <><UserPlus className="h-4 w-4" />Cadastrar Aluno</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de edição ──────────────────────────────────────────────── */}
      {editingAluno && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm">
          <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">

            {/* Header do drawer */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
              <Pencil className="h-5 w-5 text-violet-500" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Editando</p>
                <p className="text-sm font-bold text-gray-900 truncate">{editingAluno.nome_aluno}</p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Corpo com scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* ── Identificação ── */}
              <Section title="Identificação">
                <Row2>
                  <Field label="Nome do Aluno *">
                    <TInput value={editForm.nome_aluno ?? ""} onChange={(v) => setField("nome_aluno", v)} onBlur={(v) => setFieldUpper("nome_aluno", v)} />
                  </Field>
                  <Field label="Matrícula">
                    <TInput value={editForm.matricula_nr ?? ""} onChange={(v) => setField("matricula_nr", v)} onBlur={(v) => setFieldUpper("matricula_nr", v)} />
                  </Field>
                </Row2>
                <Row3>
                  <Field label="Data de Nascimento">
                    <TInput value={editForm.data_nascimento ?? ""} onChange={(v) => setField("data_nascimento", v)} />
                  </Field>
                  <Field label="Sexo">
                    <select value={editForm.sexo ?? ""} onChange={(e) => setField("sexo", e.target.value)} className={selectCls}>
                      <option value="">—</option>
                      <option value="MASCULINO">MASCULINO</option>
                      <option value="FEMININO">FEMININO</option>
                    </select>
                  </Field>
                  <Field label="Grupo Étnico">
                    <TInput value={editForm.grupo_etnico ?? ""} onChange={(v) => setField("grupo_etnico", v)} onBlur={(v) => setFieldUpper("grupo_etnico", v)} />
                  </Field>
                </Row3>
                <Row2>
                  <Field label="Nº NIS">
                    <TInput value={editForm.numero_nis ?? ""} onChange={(v) => setField("numero_nis", v)} />
                  </Field>
                  <Field label="URL da Foto">
                    <TInput value={editForm.foto_url ?? ""} onChange={(v) => setField("foto_url", v)} placeholder="https://..." />
                  </Field>
                </Row2>
              </Section>

              {/* ── Registro Civil ── */}
              <Section title="Registro Civil">
                <Row3>
                  <Field label="Assento Nº">
                    <TInput value={editForm.assento_nr ?? ""} onChange={(v) => setField("assento_nr", v)} onBlur={(v) => setFieldUpper("assento_nr", v)} />
                  </Field>
                  <Field label="Data do Registro">
                    <TInput value={editForm.data_registro_nascimento ?? ""} onChange={(v) => setField("data_registro_nascimento", v)} />
                  </Field>
                  <Field label="Cartório">
                    <TInput value={editForm.cartorio_registro ?? ""} onChange={(v) => setField("cartorio_registro", v)} onBlur={(v) => setFieldUpper("cartorio_registro", v)} />
                  </Field>
                </Row3>
                <Row3>
                  <Field label="Cidade de Registro">
                    <TInput value={editForm.cidade_registro_nascimento ?? ""} onChange={(v) => setField("cidade_registro_nascimento", v)} onBlur={(v) => setFieldUpper("cidade_registro_nascimento", v)} />
                  </Field>
                  <Field label="Estado">
                    <TInput value={editForm.estado_registro ?? ""} onChange={(v) => setField("estado_registro", v)} onBlur={(v) => setFieldUpper("estado_registro", v)} />
                  </Field>
                  <Field label="Folha Nº">
                    <TInput value={editForm.folha_registro_nr ?? ""} onChange={(v) => setField("folha_registro_nr", v)} onBlur={(v) => setFieldUpper("folha_registro_nr", v)} />
                  </Field>
                </Row3>
                <Row2>
                  <Field label="Livro Nº">
                    <TInput value={editForm.nr_livro_registro_nasc ?? ""} onChange={(v) => setField("nr_livro_registro_nasc", v)} onBlur={(v) => setFieldUpper("nr_livro_registro_nasc", v)} />
                  </Field>
                </Row2>
              </Section>

              {/* ── Endereço ── */}
              <Section title="Endereço">
                <Row2>
                  <Field label="Endereço">
                    <TInput value={editForm.endereco_aluno ?? ""} onChange={(v) => setField("endereco_aluno", v)} onBlur={(v) => setFieldUpper("endereco_aluno", v)} />
                  </Field>
                  <Field label="Bairro">
                    <TInput value={editForm.bairro_aluno ?? ""} onChange={(v) => setField("bairro_aluno", v)} onBlur={(v) => setFieldUpper("bairro_aluno", v)} />
                  </Field>
                </Row2>
                <Row2>
                  <Field label="Cidade">
                    <TInput value={editForm.cidade_aluno ?? ""} onChange={(v) => setField("cidade_aluno", v)} onBlur={(v) => setFieldUpper("cidade_aluno", v)} />
                  </Field>
                  <Field label="Estado">
                    <TInput value={editForm.estado_residencia ?? ""} onChange={(v) => setField("estado_residencia", v)} onBlur={(v) => setFieldUpper("estado_residencia", v)} />
                  </Field>
                </Row2>
              </Section>

              {/* ── Filiação — Mãe ── */}
              <Section title="Filiação — Mãe">
                <Row2>
                  <Field label="Nome da Mãe">
                    <TInput value={editForm.nome_mae ?? ""} onChange={(v) => setField("nome_mae", v)} onBlur={(v) => setFieldUpper("nome_mae", v)} />
                  </Field>
                  <Field label="Profissão">
                    <TInput value={editForm.profissao_mae ?? ""} onChange={(v) => setField("profissao_mae", v)} onBlur={(v) => setFieldUpper("profissao_mae", v)} />
                  </Field>
                </Row2>
                <Row2>
                  <Field label="CPF">
                    <TInput value={editForm.cpf_mae ?? ""} onChange={(v) => setField("cpf_mae", v)} />
                  </Field>
                  <Field label="RG">
                    <TInput value={editForm.rg_mae ?? ""} onChange={(v) => setField("rg_mae", v)} />
                  </Field>
                </Row2>
              </Section>

              {/* ── Filiação — Pai ── */}
              <Section title="Filiação — Pai">
                <Row2>
                  <Field label="Nome do Pai">
                    <TInput value={editForm.nome_pai ?? ""} onChange={(v) => setField("nome_pai", v)} onBlur={(v) => setFieldUpper("nome_pai", v)} />
                  </Field>
                  <Field label="Profissão">
                    <TInput value={editForm.profissao_pai ?? ""} onChange={(v) => setField("profissao_pai", v)} onBlur={(v) => setFieldUpper("profissao_pai", v)} />
                  </Field>
                </Row2>
                <Row2>
                  <Field label="CPF">
                    <TInput value={editForm.cpf_pai ?? ""} onChange={(v) => setField("cpf_pai", v)} />
                  </Field>
                  <Field label="RG">
                    <TInput value={editForm.rg_pai ?? ""} onChange={(v) => setField("rg_pai", v)} />
                  </Field>
                </Row2>
              </Section>

              {/* ── Responsável ── */}
              <Section title="Responsável">
                <Row2>
                  <Field label="Nome do Responsável">
                    <TInput value={editForm.nome_responsavel ?? ""} onChange={(v) => setField("nome_responsavel", v)} onBlur={(v) => setFieldUpper("nome_responsavel", v)} />
                  </Field>
                  <Field label="Telefone / Contato">
                    <TInput value={editForm.fone_contato ?? ""} onChange={(v) => setField("fone_contato", v)} />
                  </Field>
                </Row2>
              </Section>

              {/* ── Saúde ── */}
              <Section title="Saúde">
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.possui_alergia ?? false}
                      onChange={(e) => setField("possui_alergia", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 accent-violet-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Possui alergia</span>
                  </label>
                  {editForm.possui_alergia && (
                    <Field label="Qual alergia?">
                      <TInput value={editForm.qual_alergia ?? ""} onChange={(v) => setField("qual_alergia", v)} onBlur={(v) => setFieldUpper("qual_alergia", v)} />
                    </Field>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.necessidade_especial ?? false}
                      onChange={(e) => setField("necessidade_especial", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 accent-violet-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Necessidade especial</span>
                  </label>
                  {editForm.necessidade_especial && (
                    <Field label="Descrição">
                      <TInput value={editForm.necessidade_especial_text ?? ""} onChange={(v) => setField("necessidade_especial_text", v)} onBlur={(v) => setFieldUpper("necessidade_especial_text", v)} />
                    </Field>
                  )}
                </div>
              </Section>

              {/* ── Informações Escolares ── */}
              <Section title="Informações Escolares">
                <Row3>
                  <Field label="Série">
                    <select value={editForm.serie ?? ""} onChange={(e) => setField("serie", e.target.value)} className={selectCls}>
                      {series.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Ano Letivo">
                    <TInput value={editForm.ano_letivo ?? ""} onChange={(v) => setField("ano_letivo", v)} onBlur={(v) => setFieldUpper("ano_letivo", v)} />
                  </Field>
                  <Field label="Status">
                    <select value={editForm.status ?? STATUS_ATIVO} onChange={(e) => setField("status", e.target.value)} className={selectCls}>
                      <option value="Matriculado">Matriculado</option>
                      {STATUS_HISTORICO.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </Row3>
                <Row3>
                  <Field label="Horário">
                    <TInput value={editForm.qual_horario ?? ""} onChange={(v) => setField("qual_horario", v)} onBlur={(v) => setFieldUpper("qual_horario", v)} />
                  </Field>
                  <Field label="Projeto">
                    <TInput value={editForm.qual_projeto ?? ""} onChange={(v) => setField("qual_projeto", v)} onBlur={(v) => setFieldUpper("qual_projeto", v)} />
                  </Field>
                  <Field label="Tipo de Cadastro">
                    <TInput value={editForm.tipo_cadastro ?? ""} onChange={(v) => setField("tipo_cadastro", v)} onBlur={(v) => setFieldUpper("tipo_cadastro", v)} />
                  </Field>
                </Row3>
              </Section>

            </div>

            {/* Footer com ações */}
            {saveError && (
              <p className="px-6 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">{saveError}</p>
            )}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Salvando..." : "Salvar"}
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

function TInput({
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onBlur?.(e.target.value)}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100 uppercase placeholder:normal-case"
    />
  );
}
