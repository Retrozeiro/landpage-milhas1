# Comunidade — Milhas por hora

Site estático (HTML/CSS/JS) para Cloudflare Pages + Pages Functions.

## Recursos

- Vídeos (últimos do canal via feed do YouTube)
- Quadro de avisos (admin)
- Comunidade: login com Google/YouTube, postar arte (imagem), curtir e comentar
- Rodapé com contato para parceria/trabalho (mensagens salvas no D1)

## Requisitos (Cloudflare)

- **Pages** (para hospedar o `public/`)
- **Pages Functions** (já vem junto)
- **D1** (banco de dados)
- **R2** (armazenar as artes enviadas)
- Credenciais **Google OAuth** (Client ID + Client Secret)

## Rodar localmente

1) Instale o Wrangler:

```bash
npm i -g wrangler
```

2) Instale dependências:

```bash
npm i
```

3) Crie o D1 e aplique a migração:

```bash
wrangler d1 create milhas-comunidade
wrangler d1 migrations apply milhas-comunidade
```

Copie o `database_id` retornado pelo comando e cole em `wrangler.toml`.

4) Crie o R2:

```bash
wrangler r2 bucket create milhas-art
```

5) Configure variáveis (local):

Crie um arquivo `.dev.vars` com:

```ini
SITE_NAME=Milhas por hora
YOUTUBE_HANDLE=@Milhasporhora
YOUTUBE_CHANNEL_ID=
CONTACT_EMAIL=
ADMIN_EMAILS=
SOCIAL_YOUTUBE=
SOCIAL_INSTAGRAM=
SOCIAL_TIKTOK=
SOCIAL_DISCORD=
SOCIAL_X=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OAUTH_REDIRECT_URL=http://localhost:8788/auth/callback
```

6) Suba o dev server:

```bash
npm run dev
```

Abra `http://localhost:8788`.

## Deploy (Cloudflare Pages)

- **Build command**: (vazio)
- **Build output directory**: `public`
- **Functions**: `functions`

Bindings necessários no projeto:

- D1: `DB`
- R2: `ART_BUCKET`
- Vars: mesmas do `.dev.vars`

## Deploy (Cloudflare Workers)

Se seu pipeline roda `wrangler deploy`, este projeto também pode ser publicado como **Worker** (servindo os arquivos estáticos de `public/` via `[assets]` e usando o código de `functions/` como handlers):

```bash
npx wrangler deploy
```

## Google OAuth (login YouTube)

No Google Cloud Console, crie credenciais OAuth do tipo “Web application” e adicione os redirect URIs:

- `http://localhost:8788/auth/callback`
- `https://SEU-DOMINIO/auth/callback`

## Como pegar o `YOUTUBE_CHANNEL_ID`

No canal do YouTube, copie o ID que começa com `UC...` (em “Sobre” ou no HTML da página).
