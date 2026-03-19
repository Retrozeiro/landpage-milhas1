# Milhas por hora — Portfolio React

Landing page construída com Vite + React para mostrar o universo de um Youtuber focado em animações, fanarts e timelapses (com base nos canais e redes do Milhas por hora).

## Rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Abra `http://localhost:5173` no navegador e navegue pelas seções de hero, vídeos e galeria.

Não há autenticação real: o formulário de login apenas salva nome/e-mail no `localStorage` para ilustrar um estado conectado no front-end.

## Deploy no Vercel

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Framework preset:** Vite

Link dos perfis usados neste showcase:
- [YouTube (Milhas por hora)](https://www.youtube.com/@Milhasporhora)
- [Instagram (@_milhasporhora)](https://www.instagram.com/_milhasporhora)
- [TikTok (@milhasporhora)](https://www.tiktok.com/@milhasporhora)

Após conectar o repositório ao Vercel ou rodar `vercel --prod`, o site fica disponível para mostrar o trabalho de animação em seu portfólio.
