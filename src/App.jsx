import { useCallback, useEffect, useMemo, useState } from "react";
import "./styles.css";

const artPieces = [
  {
    title: "Fluxo Aéreo",
    description: "Colagem digital com gradientes e texturas metálicas que lembram painéis aeronáuticos.",
    tag: "Conceito",
  },
  {
    title: "Mapa de Ressonância",
    description: "Estudo de luz e som usando pinceladas vetoriais sobre fotografias urbanas em baixa saturação.",
    tag: "Estudo",
  },
  {
    title: "Linha do Tempo",
    description: "Infográfico animado para eventos da comunidade, com camadas translúcidas e brilho neon.",
    tag: "Apresentação",
  },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500530852062-a5a52d1241f0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
];

const heroStats = [
  { label: "Inscritos", value: "4,3M", detail: "no YouTube" },
  { label: "Vídeos", value: "175+", detail: "entre shorts e episódios" },
  { label: "Estúdio", value: "Animação", detail: "personagens e nostalgia" },
];

const latestVideos = [
  { title: "Refiz o Team Dark com animações novas", duration: "9:01" },
  { title: "Criando o Vilgax absoluto", duration: "8:05" },
  { title: "Novo visual para o Sonic, vibe clássica", duration: "8:08" },
];

const socialLinks = [
  { label: "YouTube", url: "https://www.youtube.com/@Milhasporhora", detail: "Vídeos e bastidores" },
  { label: "Instagram", url: "https://www.instagram.com/_milhasporhora", detail: "Processos e artes" },
  { label: "TikTok", url: "https://www.tiktok.com/@milhasporhora", detail: "Stories e timelapses" },
];

const STORAGE_KEY = "demoLoginUser";
const profileImage =
  "https://yt3.googleusercontent.com/SMq8U3m2HqYA2VIAE6hijYgAOjkZ1kVVXgPbXoRsMZ0WVxIUbXuHU3v4xNbyAaXIU9IkVe6j=s900-c-k-c0x00ffffff-no-rj";
const platformNote =
  "Animação, personagens e humor simples em português, tudo produzido e editado em um estúdio caseiro pronto para o portfólio.";

function App() {
  const [user, setUser] = useState(null);
  const [gallerySeed, setGallerySeed] = useState(Math.random());

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (err) {
        setUser(null);
      }
    }
  }, []);

  const galleryItems = useMemo(() => {
    return artPieces.map((piece, index) => {
      const randomIndex = Math.floor(((gallerySeed + index) * 1000) % galleryImages.length);
      return {
        ...piece,
        image: galleryImages[randomIndex],
      };
    });
  }, [gallerySeed]);

  const handleLogin = useCallback((event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.name?.value.trim() || "Visitante";
    const email = form.elements.email?.value.trim() || "visitante@exemplo.com";
    const nextUser = { name, email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const scrollToSection = useCallback((id) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="page">
      <a className="skip" href="#portfolio">
        Pular para o portfólio
      </a>
      <header className="header">
        <div className="wrap header__inner">
          <div className="brand">
            <strong>Milhas por hora</strong>
            <span>Youtuber de animação</span>
          </div>
          <nav className="nav" aria-label="Seções">
            <button type="button" className="link" onClick={() => scrollToSection("portfolio")}>Portfolio</button>
            <button type="button" className="link" onClick={() => scrollToSection("videos")}>Vídeos</button>
            <button type="button" className="link" onClick={() => scrollToSection("arte")}>Galeria</button>
            <button type="button" className="link" onClick={() => scrollToSection("contato")}>Contato</button>
          </nav>
          <button className="btn btn--accent" type="button" onClick={() => scrollToSection("contato")}>Parceria</button>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="wrap hero__inner">
            <div>
              <p className="eyebrow">Animação sem filtro</p>
              <h1 id="hero-title">
                Milhas por hora — animações, timelapses e dublagens curtas que vivem nos jogos clássicos.
              </h1>
              <p className="lead">
                Um portfólio inspirado no canal do YouTube, com narrativas simples, ilustrações feitas à mão e exposições das rotinas de edição.
              </p>
              <div className="hero__actions">
                <button className="btn btn--primary" type="button" onClick={() => scrollToSection("videos")}>Ver os vídeos</button>
                <button className="btn btn--ghost" type="button" onClick={() => scrollToSection("arte")}>Explorar a galeria</button>
              </div>
              <p className="note">{platformNote}</p>
              <div className="hero__stats">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="stat">
                    <div className="stat__value">{stat.value}</div>
                    <div className="stat__label">{stat.label}</div>
                    <div className="stat__detail">{stat.detail}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero__portrait">
              <div className="portrait__circle">
                <img src={profileImage} alt="Milhas por hora" loading="lazy" referrerPolicy="no-referrer" />
              </div>
              <p className="portrait__label">@Milhasporhora</p>
              <p className="portrait__sub">Canal de animação no YouTube, vivo no YouTube, TikTok e Instagram.</p>
            </div>
          </div>
        </section>

        <section className="section section--videos" id="videos">
          <div className="wrap">
            <div className="section__header">
              <h2>Últimos vídeos</h2>
              <p>Foco em animações, fanarts e um processo criativo que varia entre o humor e o retrô.</p>
            </div>
            <div className="video-grid">
              {latestVideos.map((video) => (
                <article key={video.title} className="video-card">
                  <div className="video-card__badge">{video.duration}</div>
                  <h3>{video.title}</h3>
                  <p>Observação rápida sobre conceitos, personagens e referências em cada corte.</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="portfolio">
          <div className="wrap">
            <div className="section__header">
              <h2>História do projeto</h2>
              <p>Texturas, cores e linhas que acompanham a jornada de um youtuber de animação.</p>
            </div>
            <div className="grid three">
              <article>
                <h3>Processo</h3>
                <p>Texturas e composições feitas para capturar o ritmo acelerado de trabalhar com milhas e viagens.</p>
              </article>
              <article>
                <h3>Experiência</h3>
                <p>Design com tipografias fluidas, grid modular e iluminação suave para destacar cada peça.</p>
              </article>
              <article>
                <h3>Resultados</h3>
                <p>Versões impressas, combinações para redes sociais e materiais conceituais para eventos.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section section--alt" id="descricao">
          <div className="wrap wrap--narrow">
            <div className="section__header">
              <h2>O motivo desta vitrine</h2>
              <p>Sem backend complexo: apenas React renderizado no cliente e hospedado em Vercel.</p>
            </div>
            <p>
              O objetivo é mostrar clareza visual e atenção ao detalhe, mantendo o foco apenas em conteúdo estático. A seção de login é local e as imagens são exemplos fictícios para reforçar o visual.
            </p>
            <ul className="list">
              <li>Layout responsivo, componentizado e pronto para ser replicado em outros projetos.</li>
              <li>Textos e CTAs pensados para apresentar uma comunidade criativa.</li>
              <li>Galeria com imagens públicas que mudam a cada carregamento.</li>
            </ul>
          </div>
        </section>

        <section className="section" id="login-example">
          <div className="wrap wrap--narrow">
            <div className="section__header">
              <h2>Login de demonstração</h2>
              <p>Formulário local que salva nome/e-mail no navegador, sem tocar nenhuma API.</p>
            </div>
            <form className="form" onSubmit={handleLogin}>
              <label>
                Nome
                <input name="name" type="text" placeholder="Digite seu nome" />
              </label>
              <label>
                E-mail
                <input name="email" type="email" placeholder="voce@exemplo.com" />
              </label>
              <button className="btn btn--primary" type="submit">
                Entrar como visitante
              </button>
            </form>
            <div className="login-status">
              {user ? (
                <div>
                  <p>
                    Conectado como <strong>{user.name}</strong> ({user.email}).
                  </p>
                  <button className="btn btn--ghost" type="button" onClick={handleLogout}>
                    Sair
                  </button>
                </div>
              ) : (
                <p>Nenhum login ativo. Use o formulário acima para simular um acesso.</p>
              )}
            </div>
          </div>
        </section>

        <section className="section" id="arte">
          <div className="wrap">
            <div className="section__header">
              <h2>Exemplos de artes</h2>
              <p>Imagens fictícias que ilustram o conteúdo compatível com o canal.</p>
            </div>
            <div className="gallery">
              {galleryItems.map((piece) => (
                <article key={piece.title} className="gallery__item">
                  <img src={piece.image} alt={piece.title} loading="lazy" referrerPolicy="no-referrer" />
                  <div className="gallery__body">
                    <h3>{piece.title}</h3>
                    <p>{piece.description}</p>
                    <small className="muted">{piece.tag}</small>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--grid" aria-labelledby="social-title">
          <div className="wrap">
            <div className="section__header">
              <h2 id="social-title">Onde achar mais</h2>
              <p>Perfis sociais e canais relacionados para conferir o trabalho ao vivo.</p>
            </div>
            <div className="grid social-grid">
              {socialLinks.map((link) => (
                <article key={link.label} className="social-card">
                  <h3>{link.label}</h3>
                  <p>{link.detail}</p>
                  <a href={link.url} target="_blank" rel="noreferrer">
                    Visitar {link.label}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="contato">
          <div className="wrap wrap--narrow">
            <div className="section__header">
              <h2>Contato</h2>
              <p>Perfeito para quem quer ver o projeto completo ou alinhar próximas etapas.</p>
            </div>
            <p>
              <strong>Email:</strong> <a href="mailto:contato@milhasporhora.com">contato@milhasporhora.com</a>
              <br />
              <strong>Telegram:</strong> <a href="https://t.me/milhasporhora" target="_blank" rel="noreferrer">
                @milhasporhora
              </a>
            </p>
            <p className="muted">Disponível para apresentar o projeto inteiro ou manter como inspiração de portfólio.</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__inner">
          <span>© <span id="year">{new Date().getFullYear()}</span> Milhas por hora — hospedado com Vercel.</span>
          <span>Conteúdo de exibição.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
