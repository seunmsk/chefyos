// Shared helpers for the Chef Yos API (Cloudflare Pages Functions).
const enc = new TextEncoder();
const DAY = 24 * 60 * 60 * 1000;

const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64urlText = (str) => b64url(enc.encode(str));
const fromB64urlText = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)));

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sign(env, data) {
  const key = await crypto.subtle.importKey("raw", enc.encode("chef-yos::" + env.ADMIN_PASSWORD), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export const checkPassword = (env, given) => !!env.ADMIN_PASSWORD && safeEqual(String(given || ""), String(env.ADMIN_PASSWORD));

export async function makeToken(env, days = 30) {
  const payload = b64urlText(JSON.stringify({ exp: Date.now() + days * DAY }));
  return payload + "." + (await sign(env, payload));
}

export async function isAdmin(request, env) {
  try {
    if (!env.ADMIN_PASSWORD) return false;
    const h = request.headers.get("authorization") || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return false;
    if (!safeEqual(sig, await sign(env, payload))) return false;
    return JSON.parse(fromB64urlText(payload)).exp > Date.now();
  } catch { return false; }
}

export function kv(env) {
  if (!env.CHEF_KV) throw new Error("The CHEF_KV storage binding is missing. See README: Cloudflare setup, step 3.");
  return env.CHEF_KV;
}
