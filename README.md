# AT13 Hair Design — 基隆仁三店

Static site for AT13 Hair Design, served from a Cloudflare Worker.

Live: <https://at13-hair-design.wahmey.workers.dev/>

## ⚠️ This is a snapshot of the *built* site, not its source

The files in `public/` were mirrored from the live deployment on 2026-08-11.
They are Vite build output: the JavaScript is minified and bundled into
content-hashed chunks, and no source maps were published, so the original
`src/` tree **cannot be recovered from this snapshot**.

The bundles still name the source modules they came from (`src/ui/preloader`,
`src/ui/cursor`, `src/ui/nav`, `ui/sections/render/footer.js`), which confirms
the original project exists somewhere — it was just never on this machine. If
you still have it, commit it alongside `public/` and treat this snapshot as a
fallback.

What this snapshot **is** good for: it deploys, it renders identically to
production, and it puts the artifact under version control instead of leaving
it only on Cloudflare.

What it is **not** good for: editing. Changing copy or layout means editing
minified bundles by hand.

## Contents

| Path | What it is |
| --- | --- |
| `public/index.html` | Page shell, metadata, `HairSalon` JSON-LD |
| `public/assets/*.js` | 18 bundled chunks — app entry, three.js, GSAP, content, i18n dictionary |
| `public/assets/*.css` | 5 stylesheets |
| `public/assets/*.webp` | 95 images (full, texture and thumbnail variants) |
| `public/assets/*.woff2` | Subset Noto Serif TC |
| `public/robots.txt` | Blanket `Disallow: /` — see below |
| `wrangler.jsonc` | Worker config, static assets only |

The site is bilingual (zh-Hant-TW / en) and uses a WebGL canvas driven by
three.js, with GSAP for transitions.

## Not indexable, on purpose

Both `public/robots.txt` and the `<meta name="robots" content="noindex,
nofollow">` tag in `index.html` block search engines. Per the comments left in
the source, this is a design proposal carrying AT13's real address and phone
number but generated imagery rather than the salon's own photography. Lift both
only once the owner approves and real photos are in place.

## Local preview

Any static file server works for a quick look:

```bash
python3 -m http.server 8788 --directory public
```

For behaviour identical to production, including the single-page-application
fallback for unknown paths, use Wrangler (requires Node.js):

```bash
npx wrangler dev
```

## Deploy

```bash
npx wrangler deploy
```

This publishes to the `at13-hair-design` Worker. Confirm you are logged into
the Cloudflare account that owns the `wahmey.workers.dev` subdomain first —
`npx wrangler whoami`.
