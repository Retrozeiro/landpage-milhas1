# Comunidade — Milhas por hora (exibição)

Portfólio estático que mostra uma vitrine de artes e informações rápidas sobre o projeto, hospedado com Cloudflare Pages. Todo o conteúdo é fictício e pensado apenas para exibição: não há login, banco de dados ou upload de imagens, apenas HTML/CSS/JS carregado a partir da pasta `public/`.

## Rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor Pages emulando a pasta `public/`:

```bash
npm run dev
```

3. Acesse `http://localhost:8788` para ver o site.

## Deploy (Cloudflare Pages)

- **Command**: deixe em branco (build não necessário).
- **Output**: `public`
- **Funções**: não há (não existe `functions/`).

Para deploy via CLI use:

```bash
npx wrangler pages deploy public
```

## Sobre o conteúdo

- Layout responsivo com seções de hero, portfólio, galeria e contato.
- Galeria preenchida dinamicamente com artes fictícias usando `app.js`.
- Sessão de login local que salva nome/e-mail no navegador para ilustrar autenticação sem APIs.
- Imagens da galeria trocadas aleatoriamente a cada carregamento para dar variedade ao portfólio.
- Texto e CTAs prontos para exibição em um portfólio profissional ou apresentação.
