# Associação Espírita João Nunes Maia

Portal institucional em Next.js 14 com área interna para publicações.

## Recursos

- Site responsivo inspirado no mockup fornecido.
- Header, hero com carrossel, atendimentos, programação, vídeos, notícias, áreas, eventos, estudos, convênios e rodapé.
- Login em `/login` com Supabase Auth.
- Área protegida em `/admin`.
- CRUD de notícias com publicar/despublicar.
- Campos para imagem e vídeo sem alterar a estrutura do site.
- SEO com metadados, Open Graph, robots e sitemap.
- Segurança básica com sessão JWT do Supabase, RLS no banco e headers HTTP.

## Configuração

1. Crie um projeto no Supabase.
2. Rode o SQL em `supabase/schema.sql`.
3. Copie `.env.example` para `.env.local`.
4. Preencha:

```env
NEXT_PUBLIC_SITE_URL=https://seudominio.com.br
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra `http://localhost:3002`.

## Docker

```bash
docker compose up --build
```

Em VPS, publique atrás de um proxy com HTTPS habilitado.
