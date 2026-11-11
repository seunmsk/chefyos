import { checkPassword, makeToken, json } from "../../lib/auth.js";

export async function onRequestPost({ request, env }) {
  let body = {};
  try { body = await request.json(); } catch {}
  if (!env.ADMIN_PASSWORD) return json({ error: "The dashboard password hasn't been set up yet." }, 500);
  if (!checkPassword(env, body.password)) {
    await new Promise((r) => setTimeout(r, 800));
    return json({ error: "That password isn't right." }, 401);
  }
  return json({ token: await makeToken(env, 30) });
}
