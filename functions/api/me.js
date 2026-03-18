import { getSession, isAdmin } from "../_lib/auth.js";
import { json } from "../_lib/responses.js";

export async function onRequestGet(context) {
  const session = await getSession(context);
  const user = session?.user || null;
  return json(
    { user, isAdmin: isAdmin(context.env, user) },
    {
      headers: { "cache-control": "no-store" },
    }
  );
}

