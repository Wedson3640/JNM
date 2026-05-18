# Associacao Espirita Joao Nunes Maia

Portal institucional da Associacao Espirita Joao Nunes Maia - Teresina, Piaui.

## Recursos

- Site responsivo com cabecalho, carrossel de palestras, atendimento fraterno, programacao semanal, videos, noticias, eventos, grupos de estudos, convenios e rodape.
- Area interna para gerenciamento de conteudo com autenticacao.
- SEO com metadados, Open Graph, sitemap e robots.

## Configuracao

1. Crie um projeto no [Supabase](https://supabase.com).
2. Execute o script `supabase/schema.sql` no SQL Editor do Supabase.
3. Copie `.env.example` para `.env.local` e preencha as variaveis com os valores do seu projeto.

## Desenvolvimento

```bash
npm install
npm run dev
```

Acesse `http://localhost:3002`.

## Gestao de usuarios

Os usuarios com acesso a area interna sao gerenciados pelo Supabase Auth.

**Onde os dados ficam:**

| Dado | Local no Supabase |
|---|---|
| Usuarios cadastrados (email/senha) | Authentication -> Users |
| Registro de acessos a area interna | Table Editor -> `user_access_logs` |

**Para cadastrar um novo usuario:**

- Acesse a URL de cadastro, que nao deve ser divulgada publicamente.
- Ou crie diretamente pelo painel: **Supabase -> Authentication -> Users -> Add user**.

**Variavel necessaria para cadastro via interface:**

```env
SUPABASE_SERVICE_ROLE_KEY=  # Project Settings -> API -> Service Role Key
```

## Docker

```bash
docker compose up --build
```

Em VPS, publique atras de um proxy reverso com HTTPS habilitado.
