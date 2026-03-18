const SITE = {
  siteName: "Milhas por hora",
  youtube: {
    handle: "@Milhasporhora",
    channelUrl: "https://www.youtube.com/@Milhasporhora",
  },
  social: {
    youtube: "https://www.youtube.com/@Milhasporhora",
    instagram: "",
    tiktok: "",
    discord: "",
    x: "",
  },
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function escapeHtml(input) {
  return String(input).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function formatDate(tsOrIso) {
  const d = typeof tsOrIso === "number" ? new Date(tsOrIso) : new Date(tsOrIso);
  return d.toLocaleDateString("pt-BR", { year: "numeric", month: "short", day: "2-digit" });
}

async function api(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: options.body instanceof FormData ? undefined : { "content-type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Erro ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

let state = {
  me: null,
  isAdmin: false,
  config: null,
  postsOffset: 0,
  postsHasMore: true,
};

async function boot() {
  $("#year").textContent = String(new Date().getFullYear());

  state.config = await api("/api/config");
  const siteName = state.config.siteName || SITE.siteName;
  const handle = state.config.youtubeHandle || SITE.youtube.handle;
  const channelUrl = state.config.youtubeChannelUrl || SITE.youtube.channelUrl;

  $("#siteName").textContent = siteName;
  $("#siteName2").textContent = siteName;
  $("#siteHandle").textContent = handle;
  $("#ytLink").href = channelUrl;

  const contactEmail = state.config.contactEmail || "";
  if (contactEmail) {
    $("#contactEmail").textContent = contactEmail;
    $("#contactEmail").href = `mailto:${encodeURIComponent(contactEmail)}`;
  } else {
    $("#contactEmail").textContent = "—";
    $("#contactEmail").removeAttribute("href");
  }

  await refreshMe();
  renderAuth();

  await Promise.all([loadVideos(), loadAnnouncements(), loadPosts({ reset: true }), renderSocial()]);
  wireForms();
}

async function refreshMe() {
  const meRes = await api("/api/me");
  state.me = meRes.user;
  state.isAdmin = Boolean(meRes.isAdmin);
}

function renderAuth() {
  const auth = $("#auth");
  auth.innerHTML = "";

  if (!state.config.googleEnabled) {
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = "Login desativado";
    auth.appendChild(b);
    $("#loginHint").hidden = true;
    $("#postForm").hidden = true;
    $("#postLoginNotice").hidden = false;
    return;
  }

  if (!state.me) {
    const a = document.createElement("a");
    a.className = "btn btn--primary";
    a.href = "/auth/login";
    a.textContent = "Entrar com YouTube";
    auth.appendChild(a);
    $("#loginHint").hidden = false;
    $("#postForm").hidden = true;
    $("#postLoginNotice").hidden = false;
    $("#annForm").hidden = true;
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = "user";
  const img = document.createElement("img");
  img.className = "avatar";
  img.alt = "";
  img.referrerPolicy = "no-referrer";
  img.src = state.me.picture || "";

  const who = document.createElement("div");
  who.style.display = "grid";
  who.style.gap = "2px";
  const name = document.createElement("div");
  name.style.fontWeight = "760";
  name.style.fontSize = "13px";
  name.textContent = state.me.name || state.me.email || "Você";
  const email = document.createElement("div");
  email.style.fontSize = "12px";
  email.style.color = "var(--muted)";
  email.textContent = state.me.email || "";
  who.appendChild(name);
  who.appendChild(email);

  wrap.appendChild(img);
  wrap.appendChild(who);
  auth.appendChild(wrap);

  if (state.isAdmin) {
    const badge = document.createElement("span");
    badge.className = "badge badge--admin";
    badge.textContent = "Admin";
    auth.appendChild(badge);
  }

  const out = document.createElement("button");
  out.className = "btn";
  out.type = "button";
  out.textContent = "Sair";
  out.addEventListener("click", async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {}
    location.href = "/";
  });
  auth.appendChild(out);

  $("#loginHint").hidden = true;
  $("#postForm").hidden = false;
  $("#postLoginNotice").hidden = true;
  $("#annForm").hidden = !state.isAdmin;
}

async function loadVideos() {
  const grid = $("#videosGrid");
  const fallback = $("#videosFallback");
  try {
    const res = await api("/api/videos");
    const videos = res.videos || [];
    $("#videosCount").textContent = String(videos.length || 0);
    grid.innerHTML = "";

    if (!videos.length) {
      fallback.hidden = false;
      return;
    }

    fallback.hidden = true;
    for (const v of videos.slice(0, 9)) {
      const card = document.createElement("article");
      card.className = "card video";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Abrir vídeo: ${v.title}`);
      card.dataset.videoId = v.videoId;

      const img = document.createElement("img");
      img.className = "video__thumb";
      img.alt = "";
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.src = v.thumbnail || `https://i.ytimg.com/vi/${encodeURIComponent(v.videoId)}/hqdefault.jpg`;

      const body = document.createElement("div");
      body.className = "video__body";
      body.innerHTML = `<div class="video__title">${escapeHtml(v.title || "")}</div><div class="video__meta">${escapeHtml(
        formatDate(v.published || Date.now())
      )}</div>`;

      card.appendChild(img);
      card.appendChild(body);
      card.addEventListener("click", () => openVideo(v.videoId));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") openVideo(v.videoId);
      });
      grid.appendChild(card);
    }
  } catch {
    $("#videosCount").textContent = "0";
    fallback.hidden = false;
    grid.innerHTML = "";
  }
}

function openVideo(videoId) {
  const modal = $("#videoModal");
  const frame = $("#modalFrame");
  frame.innerHTML = `<iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen src="https://www.youtube.com/embed/${encodeURIComponent(
    videoId
  )}?rel=0"></iframe>`;
  modal.hidden = false;

  const close = () => {
    modal.hidden = true;
    frame.innerHTML = "";
    document.removeEventListener("keydown", onKey);
    modal.removeEventListener("click", onClick);
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
  };
  const onClick = (e) => {
    const t = e.target;
    if (t && t.dataset && t.dataset.close) close();
  };
  document.addEventListener("keydown", onKey);
  modal.addEventListener("click", onClick);
}

async function loadAnnouncements() {
  const box = $("#announcements");
  box.innerHTML = `<div class="skeleton ann" style="min-height:92px"></div>`;
  try {
    const res = await api("/api/announcements");
    const items = res.announcements || [];
    $("#annCount").textContent = String(items.length || 0);
    box.innerHTML = "";
    if (!items.length) {
      const n = document.createElement("div");
      n.className = "notice";
      n.textContent = "Sem avisos por enquanto.";
      box.appendChild(n);
      return;
    }
    for (const a of items) {
      const el = document.createElement("article");
      el.className = "ann";
      el.innerHTML = `
        <div class="ann__head">
          <div class="ann__title">${escapeHtml(a.title || "")}</div>
          ${a.isPinned ? `<div class="pin" title="Fixado">Fixado</div>` : ""}
        </div>
        <div class="ann__meta">${escapeHtml(formatDate(a.createdAt))}</div>
        <div class="ann__body">${escapeHtml(a.body || "")}</div>
      `;
      box.appendChild(el);
    }
  } catch {
    $("#annCount").textContent = "0";
    box.innerHTML = `<div class="notice">Não foi possível carregar os avisos.</div>`;
  }
}

async function loadPosts({ reset = false } = {}) {
  if (reset) {
    state.postsOffset = 0;
    state.postsHasMore = true;
    $("#feed").innerHTML = `<div class="skeleton post" style="min-height:280px"></div>`;
  }
  if (!state.postsHasMore) return;

  const limit = 10;
  const res = await api(`/api/posts?limit=${limit}&offset=${state.postsOffset}`);
  const posts = res.posts || [];

  if (reset) $("#feed").innerHTML = "";
  if (!posts.length && reset) {
    $("#feed").innerHTML = `<div class="notice">Ainda não tem posts. Seja a primeira pessoa a publicar uma arte!</div>`;
  }

  for (const p of posts) $("#feed").appendChild(renderPost(p));

  state.postsOffset += posts.length;
  state.postsHasMore = posts.length === limit;
  $("#loadMoreBtn").hidden = !state.postsHasMore;
  $("#postsCount").textContent = String(res.totalApprox || state.postsOffset);
}

function renderPost(p) {
  const el = document.createElement("article");
  el.className = "post";
  el.dataset.postId = String(p.id);

  const liked = Boolean(p.likedByMe);
  const imgUrl = p.imageUrl || `/art/${encodeURIComponent(p.imageKey)}`;

  el.innerHTML = `
    <div class="post__head">
      <div class="post__who">
        <img class="avatar" referrerpolicy="no-referrer" alt="" src="${escapeHtml(p.authorPicture || "")}" />
        <div>
          <div><b>${escapeHtml(p.authorName || "Usuário")}</b></div>
          <div class="post__meta">${escapeHtml(formatDate(p.createdAt))}</div>
        </div>
      </div>
      <div class="post__meta">${escapeHtml(p.commentCount)} comentários</div>
    </div>
    <img class="post__img" loading="lazy" alt="Arte publicada pela comunidade" src="${escapeHtml(imgUrl)}" />
    <div class="post__body">
      ${p.caption ? `<div class="post__caption">${escapeHtml(p.caption)}</div>` : ""}
      <div class="actions">
        <button class="action" type="button" data-like="1" aria-pressed="${liked ? "true" : "false"}">
          <span>Curtir</span>
          <span class="mono" data-like-count="1">${escapeHtml(p.likeCount)}</span>
        </button>
        <button class="action" type="button" data-comments="1">
          <span>Comentários</span>
          <span class="mono">${escapeHtml(p.commentCount)}</span>
        </button>
      </div>
    </div>
    <div class="comments" hidden></div>
  `;

  $("button[data-like]", el).addEventListener("click", async () => {
    if (!state.me) {
      location.href = "/auth/login";
      return;
    }
    try {
      const r = await api(`/api/posts/${encodeURIComponent(p.id)}/like`, { method: "POST" });
      $("button[data-like]", el).setAttribute("aria-pressed", r.liked ? "true" : "false");
      $("[data-like-count]", el).textContent = String(r.likeCount);
    } catch {}
  });

  $("button[data-comments]", el).addEventListener("click", async () => {
    const box = $(".comments", el);
    box.hidden = !box.hidden;
    if (!box.hidden && !box.dataset.loaded) {
      box.innerHTML = `<div class="skeleton" style="min-height:120px;border-radius:14px"></div>`;
      await loadComments(p.id, box);
      box.dataset.loaded = "1";
    }
  });

  return el;
}

async function loadComments(postId, box) {
  try {
    const res = await api(`/api/posts/${encodeURIComponent(postId)}/comments`);
    const items = res.comments || [];
    box.innerHTML = "";

    if (state.me) {
      const form = document.createElement("form");
      form.className = "form";
      form.style.background = "transparent";
      form.style.border = "0";
      form.style.padding = "0";
      form.innerHTML = `
        <label>
          Comentar
          <textarea name="body" rows="2" maxlength="800" required placeholder="Escreva um comentário..."></textarea>
        </label>
        <button class="btn btn--ghost" type="submit">Enviar comentário</button>
        <div class="form__msg" role="status" aria-live="polite"></div>
      `;
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const body = String(new FormData(form).get("body") || "").trim();
        if (!body) return;
        const msg = $(".form__msg", form);
        msg.textContent = "Enviando...";
        try {
          await api(`/api/posts/${encodeURIComponent(postId)}/comments`, { method: "POST", body: JSON.stringify({ body }) });
          msg.textContent = "Comentário enviado.";
          $("textarea", form).value = "";
          box.dataset.loaded = "";
          box.hidden = false;
          await loadComments(postId, box);
          box.dataset.loaded = "1";
        } catch (err) {
          msg.textContent = `Erro: ${err.message || "não foi possível enviar"}`;
        }
      });
      box.appendChild(form);
    } else {
      const n = document.createElement("div");
      n.className = "notice";
      n.innerHTML = `Faça <a href="/auth/login">login</a> para comentar.`;
      box.appendChild(n);
    }

    for (const c of items) {
      const el = document.createElement("div");
      el.className = "comment";
      el.innerHTML = `
        <div class="comment__meta">
          <div>${escapeHtml(c.authorName || "Usuário")}</div>
          <div>${escapeHtml(formatDate(c.createdAt))}</div>
        </div>
        <div class="comment__body">${escapeHtml(c.body || "")}</div>
      `;
      box.appendChild(el);
    }

    if (!items.length) {
      const e = document.createElement("div");
      e.className = "muted";
      e.textContent = "Sem comentários ainda.";
      box.appendChild(e);
    }
  } catch {
    box.innerHTML = `<div class="notice">Não foi possível carregar os comentários.</div>`;
  }
}

async function renderSocial() {
  const box = $("#social");
  const list = [
    ["YouTube", state.config.youtubeChannelUrl || SITE.social.youtube],
    ["Instagram", state.config.socialInstagram || SITE.social.instagram],
    ["TikTok", state.config.socialTiktok || SITE.social.tiktok],
    ["Discord", state.config.socialDiscord || SITE.social.discord],
    ["X/Twitter", state.config.socialX || SITE.social.x],
  ].filter(([, url]) => url);

  box.innerHTML = "";
  for (const [label, url] of list) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.textContent = label;
    box.appendChild(a);
  }
}

function wireForms() {
  $("#loadMoreBtn").addEventListener("click", async () => {
    $("#loadMoreBtn").disabled = true;
    try {
      await loadPosts();
    } finally {
      $("#loadMoreBtn").disabled = false;
    }
  });

  $("#postForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("#postMsg");
    msg.textContent = "Enviando...";
    const formData = new FormData(e.currentTarget);
    try {
      await api("/api/posts", { method: "POST", body: formData });
      msg.textContent = "Publicado! 🎉";
      e.currentTarget.reset();
      await loadPosts({ reset: true });
    } catch (err) {
      msg.textContent = `Erro: ${err.message || "não foi possível publicar"}`;
    }
  });

  $("#annForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("#annMsg");
    msg.textContent = "Publicando...";
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title") || "").trim(),
      body: String(fd.get("body") || "").trim(),
      pinned: Boolean(fd.get("pinned")),
    };
    try {
      await api("/api/announcements", { method: "POST", body: JSON.stringify(payload) });
      msg.textContent = "Aviso publicado.";
      e.currentTarget.reset();
      await loadAnnouncements();
    } catch (err) {
      msg.textContent = `Erro: ${err.message || "não foi possível publicar"}`;
    }
  });

  $("#contactForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("#contactMsg");
    msg.textContent = "Enviando...";
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      message: String(fd.get("message") || "").trim(),
    };
    try {
      await api("/api/contact", { method: "POST", body: JSON.stringify(payload) });
      msg.textContent = "Mensagem enviada. Obrigado!";
      e.currentTarget.reset();
    } catch (err) {
      msg.textContent = `Erro: ${err.message || "não foi possível enviar"}`;
    }
  });
}

boot().catch((err) => {
  console.error(err);
  $("#videosFallback").hidden = false;
});
