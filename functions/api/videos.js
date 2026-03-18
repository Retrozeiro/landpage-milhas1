import { json } from "../_lib/responses.js";

const CACHE_MS = 5 * 60 * 1000;
let cacheAt = 0;
let cacheData = { videos: [] };

function decodeXmlEntities(input) {
  return String(input || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function extractBetween(str, re) {
  const m = re.exec(str);
  return m ? m[1] : "";
}

function parseFeed(xmlText, limit = 12) {
  const entries = xmlText.split("<entry>").slice(1).map((chunk) => chunk.split("</entry>")[0]);
  const out = [];
  for (const e of entries) {
    const videoId = extractBetween(e, /<yt:videoId>([^<]+)<\/yt:videoId>/);
    if (!videoId) continue;
    const titleRaw = extractBetween(e, /<title>([^<]+)<\/title>/);
    const published = extractBetween(e, /<published>([^<]+)<\/published>/);
    const thumb = extractBetween(e, /<media:thumbnail[^>]*url="([^"]+)"/);
    out.push({
      videoId,
      title: decodeXmlEntities(titleRaw),
      published,
      thumbnail: thumb,
    });
    if (out.length >= limit) break;
  }
  return out;
}

export async function onRequestGet(context) {
  const channelId = String(context.env.YOUTUBE_CHANNEL_ID || "").trim();
  if (!channelId) return json({ videos: [] }, { headers: { "cache-control": "no-store" } });

  const now = Date.now();
  if (now - cacheAt < CACHE_MS && cacheData?.videos?.length) {
    return json(cacheData, { headers: { "cache-control": `public, max-age=${Math.floor(CACHE_MS / 1000)}` } });
  }

  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
  const res = await fetch(url, { cf: { cacheTtl: 300, cacheEverything: true } });
  const text = await res.text();
  const videos = parseFeed(text, 12);

  cacheAt = now;
  cacheData = { videos };
  return json(cacheData, { headers: { "cache-control": "public, max-age=300" } });
}

