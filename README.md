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

## Docker

```bash
docker compose up --build
```

Em VPS, publique atrás de um proxy reverso com HTTPS habilitado.
