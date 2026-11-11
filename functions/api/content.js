import { isAdmin, json, kv } from "../../lib/auth.js";

export async function onRequestGet({ env }) {
  const data = await kv(env).get("content", { type: "json" });
  return json({ content: data || null });
}

export async function onRequestPut({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "Please log in again." }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid data" }, 400); }
  const c = body && body.content;
  if (!c || !Array.isArray(c.oneoff) || !Array.isArray(c.monthly) || !Array.isArray(c.addons) || !Array.isArray(c.gallery) || typeof c.business !== "object")
    return json({ error: "Some sections are missing." }, 400);
  const raw = JSON.stringify(c);
  if (raw.length > 500_000) return json({ error: "Content is too large." }, 413);
  const store = kv(env);
  const prev = await store.get("content");
  if (prev) await store.put("content-backup", prev);
  await store.put("content", JSON.stringify({ ...c, updatedAt: new Date().toISOString() }));
  return json({ ok: true });
}
