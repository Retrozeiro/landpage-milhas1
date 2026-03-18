import { getSession, requireUser } from "../../../../_lib/auth.js";
import { badRequest, json, methodNotAllowed, notFound } from "../../../../_lib/responses.js";

function cleanText(value, max) {
  const s = String(value || "").trim();
  if (!s) return "";
  return s.length > max ? s.slice(0, max) : s;
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const postId = Number(params.id);
  if (!Number.isInteger(postId) || postId <= 0) return badRequest("Post inválido");

  const postExists = await env.DB.prepare("SELECT 1 as ok FROM posts WHERE id = ?").bind(postId).first();
  if (!postExists) return notFound("Post não existe");

  if (request.method === "GET") {
    const rows = await env.DB.prepare(
      `SELECT
        c.id,
        c.body,
        c.created_at as createdAt,
        u.name as authorName,
        u.picture as authorPicture
      FROM comments c
      JOIN users u ON u.id = c.created_by
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
      LIMIT 40`
    )
      .bind(postId)
      .all();

    return json({ comments: rows.results || [] }, { headers: { "cache-control": "no-store" } });
  }

  if (request.method === "POST") {
    const { session, response } = await requireUser(context);
    if (response) return response;

    let body;
    try {
      body = await request.json();
    } catch {
      return badRequest("JSON inválido");
    }
    const text = cleanText(body.body, 800);
    if (!text) return badRequest("Comentário vazio");

    const now = Date.now();
    await env.DB.prepare("INSERT INTO comments (post_id, body, created_at, created_by) VALUES (?, ?, ?, ?)")
      .bind(postId, text, now, session.user.id)
      .run();

    const session2 = await getSession(context);
    return json(
      {
        ok: true,
        comment: {
          body: text,
          createdAt: now,
          authorName: session2?.user?.name || session.user.name,
          authorPicture: session2?.user?.picture || session.user.picture,
        },
      },
      { status: 201, headers: { "cache-control": "no-store" } }
    );
  }

  return methodNotAllowed();
}
