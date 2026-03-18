import * as apiAnnouncements from "../functions/api/announcements.js";
import * as apiConfig from "../functions/api/config.js";
import * as apiContact from "../functions/api/contact.js";
import * as apiMe from "../functions/api/me.js";
import * as apiPosts from "../functions/api/posts.js";
import * as apiVideos from "../functions/api/videos.js";
import * as artKey from "../functions/art/[key].js";
import * as authCallback from "../functions/auth/callback.js";
import * as authLogin from "../functions/auth/login.js";
import * as authLogout from "../functions/auth/logout.js";
import { methodNotAllowed } from "../functions/_lib/responses.js";

function handlerFor(mod, request) {
  if (typeof mod?.onRequest === "function") return mod.onRequest;

  const method = String(request?.method || "").toUpperCase();
  const name = `onRequest${method.slice(0, 1)}${method.slice(1).toLowerCase()}`;
  const fn = mod?.[name];
  if (typeof fn === "function") return fn;

  if (method === "HEAD" && typeof mod?.onRequestGet === "function") {
    return mod.onRequestGet;
  }

  return null;
}

const routes = [
  { pattern: /^\/api\/config$/, mod: apiConfig },
  { pattern: /^\/api\/me$/, mod: apiMe },
  { pattern: /^\/api\/videos$/, mod: apiVideos },
  { pattern: /^\/api\/announcements$/, mod: apiAnnouncements },
  { pattern: /^\/api\/posts$/, mod: apiPosts },
  { pattern: /^\/api\/contact$/, mod: apiContact },

  { pattern: /^\/auth\/login$/, mod: authLogin },
  { pattern: /^\/auth\/logout$/, mod: authLogout },
  { pattern: /^\/auth\/callback$/, mod: authCallback },

  {
    pattern: /^\/art\/([^/]+)$/,
    mod: artKey,
    params: (match) => ({ key: decodeURIComponent(match[1] || "") }),
  },
];

export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname;

    for (const route of routes) {
      const match = pathname.match(route.pattern);
      if (!match) continue;

      const handler = handlerFor(route.mod, request);
      if (!handler) return methodNotAllowed();

      const params = route.params ? route.params(match) : {};
      return handler({ request, env, params });
    }

    const assets = env?.ASSETS;
    if (assets && typeof assets.fetch === "function") {
      return assets.fetch(request);
    }

    ctx?.passThroughOnException?.();
    return new Response("Not found", { status: 404 });
  },
};
