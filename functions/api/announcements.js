import { requireUser, isAdmin } from "../_lib/auth.js";
import { badRequest, forbidden, json, methodNotAllowed } from "../_lib/responses.js";

function cleanText(value, max) {
  const s = String(value || "").trim();
  if (!s) return "";
  return s.length > max ? s.slice(0, max) : s;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "GET") {
    const rows = await env.DB.prepare(
      `SELECT a.id, a.title, a.body, a.is_pinned as isPinned, a.created_at as createdAt
       FROM announcements a
       ORDER BY a.is_pinned DESC, a.created_at DESC
       LIMIT 30`
    ).all();

    return json({ announcements: rows.results || [] }, { headers: { "cache-control": "no-store" } });
  }

  if (request.method === "POST") {
    const { session, response } = await requireUser(context);
    if (response) return response;
    if (!isAdmin(env, session.user)) return forbidden("Apenas admin pode publicar avisos");

    let body;
    try {
      body = await request.json();
    } catch {
      return badRequest("JSON inválido");
    }

    const title = cleanText(body.title, 120);
    const message = cleanText(body.body, 1200);
    const pinned = body.pinned ? 1 : 0;
    if (!title || !message) return badRequest("Preencha título e mensagem");

    const now = Date.now();
    await env.DB.prepare(
      "INSERT INTO announcements (title, body, is_pinned, created_at, created_by) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(title, message, pinned, now, session.user.id)
      .run();

    return json({ ok: true }, { status: 201, headers: { "cache-control": "no-store" } });
  }

  return methodNotAllowed();
}

