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

const randomImages = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500530852062-a5a52d1241f0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
];

const socialLinks = [
  { label: "YouTube", url: "https://www.youtube.com/@Milhasporhora", detail: "Vídeos e bastidores" },
  { label: "Instagram", url: "https://www.instagram.com/milhasporhora", detail: "Processos e artes" },
  { label: "TikTok", url: "https://www.tiktok.com/@milhasporhora", detail: "Stories curtos" },
  { label: "Discord", url: "https://discord.gg/exemplo", detail: "Comunidade apaixonada" },
];

const STORAGE_KEY = "demoLoginUser";

function getRandomImage() {
  return randomImages[Math.floor(Math.random() * randomImages.length)];
}

function getSavedUser() {
  try {
    const payload = localStorage.getItem(STORAGE_KEY);
    return payload ? JSON.parse(payload) : null;
  } catch (err) {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearSavedUser() {
  localStorage.removeItem(STORAGE_KEY);
}

function renderGallery() {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;
  gallery.innerHTML = "";
  artPieces.forEach((piece) => {
    const item = document.createElement("article");
    item.className = "gallery__item";

    const img = document.createElement("img");
    img.src = getRandomImage();
    img.alt = piece.title;
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";

    const body = document.createElement("div");
    body.className = "gallery__body";
    body.innerHTML = `<h3>${piece.title}</h3><p>${piece.description}</p><small class="muted">${piece.tag}</small>`;

    item.appendChild(img);
    item.appendChild(body);
    gallery.appendChild(item);
  });
}

function renderSocialLinks() {
  const container = document.getElementById("socialLinks");
  if (!container) return;
  container.innerHTML = "";
  socialLinks.forEach((link) => {
    const card = document.createElement("article");
    card.className = "social-card";
    card.innerHTML = `<h3>${link.label}</h3><p>${link.detail}</p><a href="${link.url}" target="_blank" rel="noreferrer">Visitar ${link.label}</a>`;
    container.appendChild(card);
  });
}

function renderLoginStatus() {
  const status = document.getElementById("loginStatus");
  if (!status) return;
  const user = getSavedUser();
  if (user) {
    status.innerHTML = `<p>Conectado como <strong>${user.name}</strong> (${user.email}).</p><button class="btn btn--ghost" type="button" onclick="logoutDemo()">Sair</button>`;
  } else {
    status.innerHTML = `<p>Nenhum login ativo. Use o formulário para simular um acesso.</p>`;
  }
}

function handleLoginForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name?.value.trim() || "Visitante";
  const email = form.elements.email?.value.trim() || "visitante@exemplo.com";
  saveUser({ name, email });
  renderLoginStatus();
}

function logoutDemo() {
  clearSavedUser();
  renderLoginStatus();
}

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

window.scrollToSection = scrollToSection;
window.logoutDemo = logoutDemo;

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("demoLoginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginForm);
  }
  renderGallery();
  renderSocialLinks();
  renderLoginStatus();
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
