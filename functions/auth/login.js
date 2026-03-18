import { randomId } from "../_lib/id.js";
import { serverError } from "../_lib/responses.js";
import { setOauthStateCookie } from "../_lib/auth.js";

export async function onRequestGet(context) {
  const clientId = String(context.env.GOOGLE_CLIENT_ID || "").trim();
  const redirectUri = String(context.env.OAUTH_REDIRECT_URL || "").trim();
  if (!clientId || !redirectUri) return serverError("OAuth do Google não configurado");

  const state = randomId(18);
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  const headers = new Headers();
  setOauthStateCookie(context, headers, state);
  headers.set("location", url.toString());
  return new Response(null, { status: 302, headers });
}
