import { createSession, setSessionCookie, clearOauthStateCookie, readOauthState } from "../_lib/auth.js";
import { redirect, serverError } from "../_lib/responses.js";

async function exchangeCode({ code, clientId, clientSecret, redirectUri }) {
  const body = new URLSearchParams();
  body.set("code", code);
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);
  body.set("redirect_uri", redirectUri);
  body.set("grant_type", "authorization_code");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error("Falha ao trocar o code por token");
  return res.json();
}

async function fetchUserInfo(accessToken) {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Falha ao buscar userinfo");
  return res.json();
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const err = url.searchParams.get("error") || "";

  if (err) return redirect(`/#login=error&reason=${encodeURIComponent(err)}`);
  if (!code || !state) return redirect("/#login=error");

  const expected = readOauthState(context);
  if (!expected || expected !== state) {
    const headers = new Headers();
    clearOauthStateCookie(context, headers);
    headers.set("location", "/#login=error");
    return new Response(null, { status: 302, headers });
  }

  const clientId = String(context.env.GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = String(context.env.GOOGLE_CLIENT_SECRET || "").trim();
  const redirectUri = String(context.env.OAUTH_REDIRECT_URL || "").trim();
  if (!clientId || !clientSecret || !redirectUri) return serverError("OAuth do Google não configurado");

  let token;
  try {
    token = await exchangeCode({ code, clientId, clientSecret, redirectUri });
  } catch {
    return redirect("/#login=error");
  }

  let info;
  try {
    info = await fetchUserInfo(token.access_token);
  } catch {
    return redirect("/#login=error");
  }

  const userId = String(info.sub || "").trim();
  const email = String(info.email || "").trim();
  const name = String(info.name || "").trim() || email;
  const picture = String(info.picture || "").trim();
  if (!userId || !email) return redirect("/#login=error");

  const now = Date.now();
  await context.env.DB.prepare(
    `INSERT INTO users (id, email, name, picture, created_at, last_login_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET email=excluded.email, name=excluded.name, picture=excluded.picture, last_login_at=excluded.last_login_at`
  )
    .bind(userId, email, name, picture, now, now)
    .run();

  const session = await createSession(context, userId);
  const headers = new Headers();
  setSessionCookie(context, headers, session.token, session.expiresAt);
  clearOauthStateCookie(context, headers);
  headers.set("location", "/#login=ok");
  return new Response(null, { status: 302, headers });
}
