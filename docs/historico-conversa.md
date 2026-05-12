# Histórico da Conversa - Projeto JNM

Data de referência: 2026-05-11

## Projeto

Site institucional da Associação Espírita João Nunes Maia.

Stack definida:

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Database
- Framer Motion
- Docker/VPS
- Deploy na Vercel

## Estrutura Inicial Criada

Foi criado um projeto Next.js com:

- página pública institucional;
- login em `/login`;
- painel interno protegido em `/admin`;
- integração com Supabase;
- Dockerfile e docker-compose;
- SEO com metadata, Open Graph, sitemap e robots;
- `.gitignore`;
- README.

## Porta Local

Portas já ocupadas informadas:

- 3000
- 3001
- 5434
- 6381
- 8000
- 3005
- 5433
- 6380
- 8001
- 8501
- 8502
- 9090

Porta escolhida para o projeto:

```text
3002
```

Scripts ajustados:

```json
"dev": "next dev -p 3002",
"start": "next start -p 3002"
```

## Design e Layout

O layout foi inspirado no mockup `pagina final.png`.

Principais seções:

- Cabeçalho com logo, navegação, redes sociais e acesso à área interna.
- Hero/carrossel de palestras.
- Atendimento Fraterno.
- Programação da Semana.
- Vídeos por plataforma.
- Notícias.
- Áreas da Casa.
- Eventos.
- Grupos de Estudos.
- Convênios.
- Rodapé com contato, endereço, redes e horários.

## Cabeçalho / Sidebar Superior

Ajustes feitos:

- cor central do topo igual ao rodapé: `bg-orange-50`;
- moldura externa laranja;
- efeito arredondado nas extremidades superiores;
- logo JNM sem fundo;
- texto corrigido para:
  - Associação Espírita
  - João Nunes Maia
- menu principal com fonte maior e mais destaque;
- botão visível `Área interna`;
- botão `Área interna` também no menu mobile.

## Logo e Favicon

Logo usada:

```text
public/images/logo JNM (1).png
```

Favicon usado:

```text
public/images/favicoJNM 64x64.png
```

O favicon foi configurado em `app/layout.tsx` como:

- `icon`
- `shortcut`
- `apple`

## Carrossel de Palestras

Ajustes feitos:

- borda fina;
- ring visual suave;
- setas com borda e efeito hover;
- indicadores interativos;
- autoplay a cada 7 segundos.

## Vídeos

Houve uma tentativa de unificar vídeos em uma seção com abas, mas a preferência final foi voltar ao formato separado:

- Vídeos no YouTube
- Vídeos no Facebook
- Vídeos no Instagram

Ajustes mantidos:

- cards mais largos;
- thumbnails maiores;
- overlay suave;
- hover;
- botão play destacado;
- remoção dos links “Ver canal”, “Ver página” e “Ver perfil”;
- clique no vídeo abre a URL da respectiva plataforma.

## Grid Responsivo

Foi ampliado o container geral para reduzir espaço vazio lateral:

```text
max-w-screen-2xl
```

Grid adotado:

- Desktop: 12 colunas
- Tablet: 6 colunas
- Mobile: 1 coluna

No bloco Notícias / Áreas / Eventos:

- Notícias: 5/12
- Áreas: 4/12
- Eventos: 3/12

## Área Interna / Admin

O painel interno foi transformado em central de configuração do site.

Áreas configuráveis:

- Palestras em destaque
- Atendimento Fraterno
- Programação da Semana
- Notícias
- Vídeos das redes sociais
- Eventos
- Grupos de estudos
- Convênios
- Áreas da Casa

O painel fica em:

```text
/admin
```

Login:

```text
/login
```

Proteção:

- Supabase Auth
- Middleware protegendo `/admin`
- Sessão/JWT do Supabase

## Supabase

O arquivo `supabase/schema.sql` foi criado e depois ampliado.

O usuário confirmou que o schema foi rodado com sucesso.

Tabelas principais:

- `news`
- `media_items`
- `hero_slides`
- `fraternal_services`
- `weekly_schedule`
- `events`
- `study_groups`
- `partners`
- `house_areas`
- `user_access_logs`

RLS:

- Leitura pública apenas de itens publicados.
- Usuários autenticados podem gerenciar conteúdo.
- Acessos ao admin são registrados em `user_access_logs`.

## Rodapé

Endereço atualizado:

```text
Rua Inácio da Costa Filho, Nº 4059
Bairro Santo Antônio
Teresina - Piauí - Brazil
CEP: 64032-190
```

Foi adicionado link para Google Maps:

```text
Ver no Google Maps
```

Copyright atualizado:

```text
© 2026 Associação Espírita João Nunes Maia. Todos os direitos reservados.
```

## GitHub

Repositório:

```text
https://github.com/Wedson3640/JNM.git
```

Orientação dada ao criar repo no GitHub:

- README: Off
- .gitignore: No .gitignore
- License: No license

Motivo:

O projeto local já tinha README e `.gitignore`.

Comandos usados/orientados:

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Wedson3640/JNM.git
git push -u origin main
```

Para commits posteriores:

```powershell
git add .
git commit -m "mensagem"
git push origin main
```

## Vercel

Configuração orientada:

- Framework: Next.js
- Root Directory: vazio
- Build Command: padrão / `next build`
- Output Directory: padrão
- porta local `3002` não é necessária na Vercel

Variáveis de ambiente necessárias:

```env
NEXT_PUBLIC_SITE_URL=https://seudominio.com.br
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

DNS orientado:

Domínio raiz:

```text
Tipo: A
Nome: @
Valor: 76.76.21.21
```

WWW:

```text
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns-0.com
```

## Supabase Auth Para Produção

Configurar em:

```text
Authentication > URL Configuration
```

Site URL:

```text
https://seudominio.com.br
```

Redirect URLs:

```text
https://seudominio.com.br/**
https://www.seudominio.com.br/**
```

## Atualização do Next.js

Foi orientado atualizar Next.js:

```powershell
npm install next@14.2.35
```

Depois validar:

```powershell
npm run lint
npx tsc --noEmit
```

Foi recomendado não rodar:

```powershell
npm audit fix --force
```

Motivo:

O audit queria migrar para Next 16, o que é breaking change e deve ser feito como tarefa separada.

## Problemas Encontrados

### Porta 3002 ocupada

Erro:

```text
EADDRINUSE: address already in use :::3002
```

Solução:

```powershell
netstat -ano | findstr :3002
taskkill /PID <PID> /F
```

### Push para GitHub

Em um momento o push falhou por proxy/rede:

```text
Failed to connect to github.com port 443 via 127.0.0.1
```

Depois o usuário conseguiu:

```text
Everything up-to-date
```

### Vercel Bloqueando Redeploy

Mensagem:

```text
The Deployment was blocked because the commit author does not have contributing access to the project on Vercel.
```

Possíveis causas:

- autor do commit não reconhecido pela Vercel;
- conta GitHub conectada diferente;
- workspace da Vercel diferente;
- integração GitHub/Vercel precisando reautorizar.

Orientações dadas:

```powershell
git log -1 --pretty=format:"%an <%ae>"
git config user.name
git config user.email
```

E, se necessário:

```powershell
git config user.name "Wedson3640"
git config user.email "SEU_EMAIL_DO_GITHUB"
git commit --allow-empty -m "Trigger deploy with correct author"
git push origin main
```

Também foi sugerido reautorizar GitHub na Vercel ou desconectar/reconectar o Git no projeto.

## Validações Realizadas

Em vários pontos foram executados:

```powershell
npm run lint
npx tsc --noEmit
```

Ambos passaram sem erros após os ajustes principais.

## Pendências / Próximos Passos

- Confirmar deploy da Vercel após resolver permissão do autor do commit.
- Configurar domínio definitivo.
- Configurar URLs de Auth no Supabase para produção.
- Cadastrar conteúdos reais pelo painel `/admin`.
- Futuramente avaliar migração planejada para Next 16.

## Atualização de 2026-05-11

Foi criada a documentação de histórico da conversa dentro do projeto:

```text
docs/historico-conversa.md
```

Objetivo:

- manter registro das decisões técnicas;
- facilitar retomada do projeto;
- documentar comandos usados;
- registrar pendências de deploy, domínio, Supabase e conteúdo.

Estado atual conhecido:

- projeto local está estruturado;
- schema do Supabase foi executado com sucesso;
- área interna `/admin` está preparada para gerenciar os principais blocos do site;
- favicon e rodapé foram atualizados;
- repositório GitHub foi conectado;
- ainda é necessário confirmar o deploy final na Vercel após resolver a permissão do autor do commit.
