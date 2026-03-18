import { parseCookies } from "../_lib/cookies.js";
import { clearSessionCookie } from "../_lib/auth.js";
import { json, methodNotAllowed } from "../_lib/responses.js";

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "POST" && request.method !== "GET") return methodNotAllowed();

  const cookies = parseCookies(request.headers.get("cookie") || "");
  const token = cookies.session || "";
  if (token) {
    await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  }

  const headers = new Headers();
  clearSessionCookie(context, headers);

  if (request.method === "GET") {
    headers.set("location", "/");
    return new Response(null, { status: 302, headers });
  }

  return json({ ok: true }, { headers });
}

