# Deploying the Two Wheels Zone website to Hostinger

This is a static React (Vite) build — no Node.js needed on the server. You
build it locally (or here), then upload the output folder.

---

## 1. Set the production API URL

Create `.env.production` in the project root (git-ignored, same as
`.env.local`):

```ini
VITE_API_URL=https://api.twowheelszone.com
```

This is the twowheelszone-api subdomain — see that project's own `DEPLOY.md`.
`npm run build` picks this up automatically; no other code changes needed.

## 2. Build

```
npm run build
```

Output lands in `dist/`. This includes `dist/.htaccess` (SPA routing + HTTPS
redirect + long-cache headers for hashed assets — copied from `public/.htaccess`
automatically by Vite) and `dist/robots.txt` (blocks `/admin` from search
engines).

## 3. Upload

Using **hPanel → File Manager** or **FTP**, upload the **contents of `dist/`**
(not the `dist` folder itself) into `public_html/` for your main domain —
i.e. `public_html/index.html`, `public_html/assets/`, `public_html/.htaccess`,
etc. should sit directly in `public_html/`.

## 4. Point the domain's document root

hPanel → your domain should already point at `public_html/`. If the site was
previously something else, confirm under **Domains** that the document root
is `public_html` (not a subfolder).

## 5. Force HTTPS

`dist/.htaccess` already redirects HTTP → HTTPS. Make sure the domain has an
SSL certificate issued in hPanel (**SSL** section — Hostinger's free
Let's Encrypt cert is usually auto-issued within a few minutes of pointing
the domain).

## 6. Test the live site

- Visit `https://twowheelszone.com/` — the homepage should load.
- **Refresh the page on an inner route** (e.g. `/franchise`, `/status`) —
  this is the SPA-routing test; without `.htaccess` working, a hard refresh
  404s instead of loading the app.
- Submit the Contact and Franchise forms — confirm you get the success
  message (this proves the API's `ALLOWED_ORIGINS` matches this exact
  origin; a mismatch shows "Request blocked.").
- Visit `/status` with a real reference — confirm it finds the inquiry.
- Visit `/admin` and log in.

---

## Rebuilding after future changes

Every time you (or Claude) change the frontend code, repeat steps 2-3:
`npm run build`, then re-upload the new `dist/` contents (overwrite what's
in `public_html/`). `.env.production` only needs to be set once unless the
API subdomain changes.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Refreshing `/franchise` (or any inner page) 404s | `.htaccess` wasn't uploaded, or `mod_rewrite` isn't enabled (contact Hostinger support — it is on all shared plans by default). |
| Forms say "Could not reach the server" | `VITE_API_URL` in `.env.production` was wrong or missing at build time — rebuild after fixing it. |
| Forms say "Request blocked." | The API's `ALLOWED_ORIGINS` doesn't match this site's exact origin (check for `www` vs non-`www` mismatches). |
| Old version still showing after upload | Browser/CDN cache on `index.html` — hard refresh (Ctrl+Shift+R); hashed JS/CSS assets are safe to cache forever since each build gets new filenames. |
