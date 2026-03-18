export async function onRequestGet(context) {
  const { env, params } = context;
  const key = String(params.key || "");
  if (!key || !key.startsWith("art_")) return new Response("Not found", { status: 404 });

  const obj = await env.ART_BUCKET.get(key);
  if (!obj) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  headers.set("content-type", obj.httpMetadata?.contentType || "application/octet-stream");
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(obj.body, { headers });
}
