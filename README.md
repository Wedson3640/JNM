# Associação Espírita João Nunes Maia

Portal institucional da Associação Espírita João Nunes Maia — Teresina, Piauí.

## Recursos

- Site responsivo com cabeçalho, carrossel de palestras, atendimento fraterno, programação semanal, vídeos, notícias, eventos, grupos de estudos, convênios e rodapé.
- Área interna para gerenciamento de conteúdo com autenticação.
- SEO com metadados, Open Graph, sitemap e robots.

## Configuração

1. Crie um projeto no [Supabase](https://supabase.com).
2. Execute o script `supabase/schema.sql` no SQL Editor do Supabase.
3. Copie `.env.example` para `.env.local` e preencha as variáveis com os valores do seu projeto.

## Desenvolvimento

```bash
npm install
npm run dev
```

Acesse `http://localhost:3002`.

## Gestão de usuários

Os usuários com acesso à área interna são gerenciados pelo Supabase Auth.

**Onde os dados ficam:**

| Dado | Local no Supabase |
|---|---|
| Usuários cadastrados (email/senha) | Authentication → Users |
| Registro de acessos à área interna | Table Editor → `user_access_logs` |

**Para cadastrar um novo usuário:**

- Acesse a URL de cadastro (não divulgada publicamente) com o código de acesso definido em `REGISTER_CODE`.
- Ou crie diretamente pelo painel: **Supabase → Authentication → Users → Add user**.

**Variáveis necessárias para cadastro via interface:**

```env
SUPABASE_SERVICE_ROLE_KEY=  # Project Settings → API → Service Role Key
REGISTER_CODE=              # Código secreto definido pela equipe
```

## Docker

```bash
docker compose up --build
```

Em VPS, publique atrás de um proxy reverso com HTTPS habilitado.
