"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Printer, Search, X, UserRound } from "lucide-react";

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
const SERIES = ["Maternal 1", "Maternal 2", "Pré Escola 1 A", "Pré Escola 1 B", "Pré Escola 2"];

const STATUS_STYLE: Record<string, string> = {
  Ativo:        "bg-emerald-100 text-emerald-700",
  Inativo:      "bg-gray-100 text-gray-500",
  Transferido:  "bg-yellow-100 text-yellow-700",
};

function val(v: string | null | undefined) {
  return v && v.trim() ? v : "—";
}

// ─── Print ficha in new window ────────────────────────────────────────────────
function openPrint(a: Aluno) {
  const win = window.open("", "_blank", "width=820,height=960");
  if (!win) return;

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
    @media print { .actions { display: none; } body { padding: 12px; } }
  </style>
</head>
<body>
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
export function CrecheManager() {
  const [activeSerie, setActiveSerie] = useState(SERIES[0]);
  const [search, setSearch]           = useState("");
  const [anoLetivo, setAnoLetivo]     = useState("");
  const [alunos, setAlunos]           = useState<Aluno[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Fetch alunos when active serie changes
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setError("Supabase não configurado.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    supabase
      .from("alunos")
      .select("*")
      .eq("serie", activeSerie)
      .order("nome_aluno", { ascending: true })
      .then(({ data, error: err }) => {
        setLoading(false);
        if (err) {
          setError("Tabela 'alunos' não encontrada. Execute a migration no Supabase.");
          setAlunos([]);
          return;
        }
        setAlunos((data ?? []) as Aluno[]);
      });
  }, [activeSerie]);

  // Client-side filtering
  const filtered = alunos.filter((a) => {
    const matchSearch = a.nome_aluno.toLowerCase().includes(search.toLowerCase());
    const matchAno    = anoLetivo ? a.ano_letivo === anoLetivo : true;
    return matchSearch && matchAno;
  });

  // Collect distinct anos for filter dropdown
  const anos = Array.from(new Set(alunos.map((a) => a.ano_letivo))).sort().reverse();

  return (
    <div className="space-y-4">

      {/* ── Tab bar horizontal ──────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {SERIES.map((serie) => (
          <button
            key={serie}
            type="button"
            onClick={() => {
              setActiveSerie(serie);
              setSearch("");
              setAnoLetivo("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeSerie === serie
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-orange-50 hover:text-primary border border-gray-200"
            }`}
          >
            {serie}
          </button>
        ))}
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

          {/* Série (informativo, não filtra — a tab já filtra) */}
          <span className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-primary">
            {activeSerie}
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
                  <th className="px-4 py-3 text-center">Ficha</th>
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
                      <button
                        type="button"
                        title="Ver e imprimir ficha"
                        onClick={() => openPrint(aluno)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-orange-50 hover:text-primary"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
