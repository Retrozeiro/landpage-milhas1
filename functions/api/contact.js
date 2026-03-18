import { badRequest, json, methodNotAllowed } from "../_lib/responses.js";

function cleanText(value, max) {
  const s = String(value || "").trim();
  if (!s) return "";
  return s.length > max ? s.slice(0, max) : s;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "POST") return methodNotAllowed();

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("JSON inválido");
  }

  const name = cleanText(body.name, 80);
  const email = cleanText(body.email, 120);
  const message = cleanText(body.message, 2000);
  if (!name || !email || !message) return badRequest("Preencha nome, e-mail e mensagem");

  const now = Date.now();
  const ip = request.headers.get("cf-connecting-ip") || "";
  await env.DB.prepare(
    "INSERT INTO contact_messages (name, email, message, created_at, ip) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(name, email, message, now, ip)
    .run();

  return json({ ok: true }, { status: 201, headers: { "cache-control": "no-store" } });
}

