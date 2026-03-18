import { getSession, isAdmin } from "../_lib/auth.js";
import { json } from "../_lib/responses.js";

function pick(v, fallback = "") {
  const s = String(v || "").trim();
  return s || fallback;
}

export async function onRequestGet(context) {
  const session = await getSession(context);
  const user = session?.user || null;

  const siteName = pick(context.env.SITE_NAME, "Milhas por hora");
  const youtubeHandle = pick(context.env.YOUTUBE_HANDLE, "@Milhasporhora");
  const youtubeChannelId = pick(context.env.YOUTUBE_CHANNEL_ID, "");
  const youtubeChannelUrl = youtubeHandle.startsWith("@")
    ? `https://www.youtube.com/${youtubeHandle}`
    : pick(context.env.SOCIAL_YOUTUBE, "https://www.youtube.com/");

  const googleEnabled = Boolean(
    pick(context.env.GOOGLE_CLIENT_ID) && pick(context.env.GOOGLE_CLIENT_SECRET) && pick(context.env.OAUTH_REDIRECT_URL)
  );

  const data = {
    siteName,
    youtubeHandle,
    youtubeChannelId,
    youtubeChannelUrl,
    contactEmail: pick(context.env.CONTACT_EMAIL, ""),
    socialYoutube: pick(context.env.SOCIAL_YOUTUBE, youtubeChannelUrl),
    socialInstagram: pick(context.env.SOCIAL_INSTAGRAM, ""),
    socialTiktok: pick(context.env.SOCIAL_TIKTOK, ""),
    socialDiscord: pick(context.env.SOCIAL_DISCORD, ""),
    socialX: pick(context.env.SOCIAL_X, ""),
    googleEnabled,
    me: user,
    isAdmin: isAdmin(context.env, user),
  };

  return json(data, { headers: { "cache-control": "no-store" } });
}

