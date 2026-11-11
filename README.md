# Chef Yos — website + dashboard

Private chef website for Chef Yos (Lagos), hosted on **Cloudflare Pages**.

- **Website** (`/`): food gallery, price list, and a booking chat that sends orders to her WhatsApp.
- **Dashboard** (`/admin`): Chef Yos logs in with a password to manage:
  - **Bookings:** every booking sent from the site (New → Confirmed → Done)
  - **Prices:** monthly plans, one-off services and add-ons
  - **Photos:** upload from her phone, caption, reorder, remove
  - **Settings:** WhatsApp number, phone, city, intro text, "Meet the chef" text, and a switch to pause bookings

## How it's built
```
public/            static site (served as-is)
  index.html       website
  admin/           dashboard
  assets/defaults.js   starting content, used until the first publish from the dashboard
  img/             photos
  _headers, _redirects
functions/api/     Cloudflare Pages Functions (the API)
lib/auth.js        login tokens + helpers
```
Saved content, uploaded photos and bookings live in one **Workers KV** namespace bound as `CHEF_KV`.
The password is the `ADMIN_PASSWORD` secret. No other services or databases.

---

## Cloudflare setup (one time, about 10 minutes)

1. **Create the project.** Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** →
   pick `seunmsk/chefyos`.
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `public`

   Click **Save and Deploy**.
2. **Create storage.** **Storage & Databases → KV → Create a namespace** → name it `chefyos`.
3. **Connect the storage.** Your Pages project → **Settings → Bindings → Add → KV namespace**:
   - Variable name: `CHEF_KV`
   - KV namespace: `chefyos`
4. **Set the password.** Project → **Settings → Variables and Secrets → Add** →
   type **Secret**, name `ADMIN_PASSWORD`, value: a strong password (12+ characters).
5. **Redeploy** so the binding and secret take effect: **Deployments → latest → ⋯ → Retry deployment**.
6. Open `https://chefyos.pages.dev/admin` and log in.

Do steps 3 and 4 for the **Production** environment (and Preview too if you use preview links).

### Custom domain
Project → **Custom domains → Set up a domain** (e.g. `chefyos.ng`). If the domain's DNS is already
on Cloudflare it connects in a click; otherwise follow the CNAME steps.
Then in `public/index.html` change `content="/img/share.jpg"` (og:image) to the full URL,
e.g. `https://chefyos.ng/img/share.jpg`, so WhatsApp link previews show the photo.

---

## Using the dashboard
1. Open `/admin` on her phone and log in. Tip: **Add to Home Screen** so it opens like an app.
2. Make changes. A bar appears at the bottom; tap **Publish** to update the site.
3. **Undo** throws away anything not yet published.

## Good to know
- Changes usually show on the site within seconds; Cloudflare KV can take up to a minute in some regions.
- A booking is logged when the customer taps "Send booking on WhatsApp" (or copies it). Their phone
  number arrives with their WhatsApp message; the website never sees it.
- Each publish keeps the previous version as `content-backup` in KV.
- Free-plan limits (1,000 KV writes/day) are far above what the site needs.

## Run locally
```
npm install
npm run dev        # http://localhost:8788  (dashboard password: test1234)
```
