import { requireUser, getSession } from "../_lib/auth.js";
import { badRequest, json, methodNotAllowed, serverError } from "../_lib/responses.js";
import { randomId } from "../_lib/id.js";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function cleanCaption(value) {
  const s = String(value || "").trim();
  return s.length > 800 ? s.slice(0, 800) : s;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "GET") {
    const session = await getSession(context);
    const userId = session?.user?.id || "";

    const url = new URL(request.url);
    const limit = clampInt(url.searchParams.get("limit"), 1, 25, 10);
    const offset = clampInt(url.searchParams.get("offset"), 0, 10_000, 0);

    const listStmt = env.DB.prepare(
      `SELECT
        p.id,
        p.caption,
        p.image_key as imageKey,
        p.created_at as createdAt,
        u.name as authorName,
        u.picture as authorPicture,
        (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as likeCount,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as commentCount,
        EXISTS(SELECT 1 FROM post_likes pl2 WHERE pl2.post_id = p.id AND pl2.user_id = ?) as likedByMe
      FROM posts p
      JOIN users u ON u.id = p.created_by
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`
    );

    const rows = await listStmt.bind(userId, limit, offset).all();
    const countRow = await env.DB.prepare("SELECT COUNT(*) as count FROM posts").first();
    const totalApprox = Number(countRow?.count || 0);

    const posts = (rows.results || []).map((r) => ({
      ...r,
      imageUrl: `/art/${encodeURIComponent(r.imageKey)}`,
    }));

    return json({ posts, totalApprox }, { headers: { "cache-control": "no-store" } });
  }

  if (request.method === "POST") {
    const { session, response } = await requireUser(context);
    if (response) return response;

    if (!env.ART_BUCKET) return serverError("R2 não configurado (binding ART_BUCKET)");

    const ct = request.headers.get("content-type") || "";
    if (!ct.includes("multipart/form-data")) return badRequest("Envie o formulário com imagem");

    const form = await request.formData();
    const file = form.get("image");
    const caption = cleanCaption(form.get("caption"));

    if (!(file instanceof File)) return badRequest("Imagem obrigatória");
    if (file.size <= 0) return badRequest("Arquivo vazio");
    if (file.size > MAX_IMAGE_BYTES) return badRequest("Imagem muito grande (máx 10MB)");
    const ext = ALLOWED_TYPES.get(file.type);
    if (!ext) return badRequest("Tipo de imagem não suportado");

    const key = `art_${randomId(16)}.${ext}`;
    const now = Date.now();

    await env.ART_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { userId: session.user.id },
    });

    const ins = await env.DB.prepare("INSERT INTO posts (caption, image_key, created_at, created_by) VALUES (?, ?, ?, ?)")
      .bind(caption || "", key, now, session.user.id)
      .run();

    return json(
      { ok: true, id: ins.meta?.last_row_id, imageKey: key },
      { status: 201, headers: { "cache-control": "no-store" } }
    );
  }

  return methodNotAllowed();
}

