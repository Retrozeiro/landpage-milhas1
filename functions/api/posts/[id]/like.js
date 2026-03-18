import { requireUser } from "../../../_lib/auth.js";
import { badRequest, json, methodNotAllowed, notFound } from "../../../_lib/responses.js";

export async function onRequest(context) {
  const { request, env, params } = context;
  if (request.method !== "POST") return methodNotAllowed();

  const { session, response } = await requireUser(context);
  if (response) return response;

  const postId = Number(params.id);
  if (!Number.isInteger(postId) || postId <= 0) return badRequest("Post inválido");

  const postExists = await env.DB.prepare("SELECT 1 as ok FROM posts WHERE id = ?").bind(postId).first();
  if (!postExists) return notFound("Post não existe");

  const exists = await env.DB.prepare("SELECT 1 as ok FROM post_likes WHERE post_id = ? AND user_id = ?")
    .bind(postId, session.user.id)
    .first();

  const now = Date.now();
  if (exists) {
    await env.DB.prepare("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?").bind(postId, session.user.id).run();
  } else {
    await env.DB.prepare("INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)")
      .bind(postId, session.user.id, now)
      .run();
  }

  const countRow = await env.DB.prepare("SELECT COUNT(*) as c FROM post_likes WHERE post_id = ?").bind(postId).first();
  return json(
    { liked: !exists, likeCount: Number(countRow?.c || 0) },
    {
      headers: { "cache-control": "no-store" },
    }
  );
}
