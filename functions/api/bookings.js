import { isAdmin, json, kv } from "../../lib/auth.js";

const STATUSES = ["new", "confirmed", "done", "cancelled"];
const clip = (v, n = 600) => String(v ?? "").slice(0, n);
// Keys sort newest first: KV lists keys in ascending order
const newKey = () => {
  const rand = [...crypto.getRandomValues(new Uint8Array(3))].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `booking:${String(9_999_999_999_999 - Date.now()).padStart(13, "0")}-${rand}`;
};

// Public: the booking chat logs each booking when the customer taps "Send on WhatsApp"
export async function onRequestPost({ request, env }) {
  let b = {};
  try { b = JSON.parse(await request.text()); } catch { return json({ error: "Invalid booking" }, 400); }
  if (!b.name || !b.service) return json({ error: "Missing details" }, 400);
  const id = newKey();
  const rec = {
    id, status: "new", createdAt: new Date().toISOString(),
    name: clip(b.name, 120), type: clip(b.type, 20), service: clip(b.service, 160),
    date: clip(b.date, 40), time: clip(b.time, 20), days: clip(b.days, 60), guests: Number(b.guests) || null,
    area: clip(b.area, 160), addons: clip(b.addons, 400), notes: clip(b.notes, 1200), estimate: clip(b.estimate, 80)
  };
  await kv(env).put(id, JSON.stringify(rec));
  return json({ ok: true });
}

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "Please log in again." }, 401);
  const store = kv(env);
  const { keys } = await store.list({ prefix: "booking:", limit: 200 });
  const items = (await Promise.all(keys.map((k) => store.get(k.name, { type: "json" })))).filter(Boolean);
  return json({ bookings: items });
}

export async function onRequestPatch({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "Please log in again." }, 401);
  const { id, status } = await request.json().catch(() => ({}));
  if (!id || !id.startsWith("booking:") || !STATUSES.includes(status)) return json({ error: "Invalid update" }, 400);
  const store = kv(env);
  const rec = await store.get(id, { type: "json" });
  if (!rec) return json({ error: "Booking not found" }, 404);
  rec.status = status;
  await store.put(id, JSON.stringify(rec));
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ error: "Please log in again." }, 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !id.startsWith("booking:")) return json({ error: "Missing id" }, 400);
  await kv(env).delete(id);
  return json({ ok: true });
}
