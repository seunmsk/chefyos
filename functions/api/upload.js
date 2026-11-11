import { isAdmin, json, kv } from "../../lib/auth.js";

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "Please log in again." }, 401);
  const type = (request.headers.get("content-type") || "").split(";")[0].trim();
  if (!TYPES[type]) return json({ error: "Please upload a JPG, PNG or WebP photo." }, 415);
  const buf = await request.arrayBuffer();
  if (buf.byteLength > 4_000_000) return json({ error: "That photo is too large (max 4 MB)." }, 413);
  const rand = [...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, "0")).join("");
  const key = `${Date.now().toString(36)}-${rand}.${TYPES[type]}`;
  await kv(env).put("photo:" + key, buf, { metadata: { type } });
  return json({ src: `/api/img/${key}` });
}
