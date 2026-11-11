import { kv } from "../../../lib/auth.js";

export async function onRequestGet({ params, env }) {
  const key = params.key;
  if (!/^[a-z0-9-]+\.(jpg|png|webp)$/.test(key || "")) return new Response("Not found", { status: 404 });
  const { value, metadata } = await kv(env).getWithMetadata("photo:" + key, { type: "arrayBuffer", cacheTtl: 86400 });
  if (!value) return new Response("Not found", { status: 404 });
  return new Response(value, {
    headers: { "content-type": metadata?.type || "image/jpeg", "cache-control": "public, max-age=31536000, immutable" }
  });
}
