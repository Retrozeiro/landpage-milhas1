import { parseCookies, serializeCookie } from "./cookies.js";
import { json, unauthorized } from "./responses.js";
import { randomId } from "./id.js";

const SESSION_COOKIE = "session";
const OAUTH_STATE_COOKIE = "oauth_state";

function isHttps(context) {
  try {
    return new URL(context.request.url).protocol === "https:";
  } catch {
    return true;
  }
}

export function getAdminEmailSet(env) {
  const raw = String(env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return new Set(raw);
}

export async function getSession(context) {
  const cookies = parseCookies(context.request.headers.get("cookie") || "");
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  const now = Date.now();
  const row = await context.env.DB.prepare(
    `SELECT s.token, s.user_id, s.expires_at, u.email, u.name, u.picture
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = ?`
  )
    .bind(token)
    .first();

  if (!row) return null;
  if (Number(row.expires_at) <= now) {
    await context.env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
    return null;
  }

  return {
    token: row.token,
    user: { id: row.user_id, email: row.email, name: row.name, picture: row.picture || "" },
  };
}

export async function requireUser(context) {
  const session = await getSession(context);
  if (!session) return { session: null, response: unauthorized("Faça login para continuar") };
  return { session, response: null };
}

export function isAdmin(env, user) {
  if (!user?.email) return false;
  return getAdminEmailSet(env).has(String(user.email).toLowerCase());
}

export function clearSessionCookie(context, headers) {
  headers.append(
    "set-cookie",
    serializeCookie(SESSION_COOKIE, "", {
      path: "/",
      httpOnly: true,
      secure: isHttps(context),
      sameSite: "Lax",
      maxAge: 0,
    })
  );
}

export async function createSession(context, userId) {
  const token = randomId(24);
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const expiresAt = now + sevenDays;
  const ip = context.request.headers.get("cf-connecting-ip") || "";
  const ua = context.request.headers.get("user-agent") || "";

  await context.env.DB.prepare(
    "INSERT INTO sessions (token, user_id, expires_at, created_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(token, userId, expiresAt, now, ip, ua)
    .run();

  return { token, expiresAt };
}

export function setSessionCookie(context, headers, token, expiresAt) {
  const maxAge = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  headers.append(
    "set-cookie",
    serializeCookie(SESSION_COOKIE, token, {
      path: "/",
      httpOnly: true,
      secure: isHttps(context),
      sameSite: "Lax",
      maxAge,
    })
  );
}

export function setOauthStateCookie(context, headers, state) {
  headers.append(
    "set-cookie",
    serializeCookie(OAUTH_STATE_COOKIE, state, {
      path: "/auth/callback",
      httpOnly: true,
      secure: isHttps(context),
      sameSite: "Lax",
      maxAge: 10 * 60,
    })
  );
}

export function readOauthState(context) {
  const cookies = parseCookies(context.request.headers.get("cookie") || "");
  return cookies[OAUTH_STATE_COOKIE] || "";
}

export function clearOauthStateCookie(context, headers) {
  headers.append(
    "set-cookie",
    serializeCookie(OAUTH_STATE_COOKIE, "", {
      path: "/auth/callback",
      httpOnly: true,
      secure: isHttps(context),
      sameSite: "Lax",
      maxAge: 0,
    })
  );
}

export function ok(user, admin) {
  return json({ user, isAdmin: admin });
}
