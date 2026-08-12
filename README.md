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
| `public/assets/gen/**/*.webp` | 10 real designer portraits — see below |
| `source/designer-cards/` | The owner's original designer cards, and how to re-crop them |
| `tools/crop-designer-cards.py` | Card → portrait, all three sizes |
| `public/assets/*.woff2` | Subset Noto Serif TC |
| `public/robots.txt` | Blanket `Disallow: /` — see below |
| `wrangler.jsonc` | Worker config, static assets only |

The site is bilingual (zh-Hant-TW / en) and uses a WebGL canvas driven by
three.js, with GSAP for transitions.

## The designer photos

The team section shows the salon's own photography. The owner supplied ten
finished designer cards (portrait plus name, number and 擅長項目, laid out in
their own house style); the portrait was cropped out of each card to 3:4 and
the wording was moved into the site's bilingual content data, so the text
stays selectable, translatable and responsive instead of being baked into a
picture.

The cards themselves are kept in `source/designer-cards/` — they are the
masters, and the portraits cannot be regenerated at full quality without
them. `tools/crop-designer-cards.py` rebuilds every portrait from them in one
pass; see that folder's README for the roster mapping.

Image ids are resolved by a glob map in `index-BMUe7iZr.js` with a
`./assets/gen/{,thumb/,tex/}<id>.webp` fallback for anything not in the map,
which is why these portraits sit in `public/assets/gen/` under plain
unhashed names rather than alongside the content-hashed build output. Each
one ships in the three sizes the site asks for: full 1200×1600, `tex/`
768×1024, `thumb/` 400×533.

The roster itself lives in `content-DRgEOFBw.js`. 擅長項目 bullets are stored
one string per designer with `｜` between items — the i18n layer rewrites
that separator to ` / ` in English, so the team renderer splits on either.

Every face in the team section is now the salon's own. Numbers 1–4 are
vacant, so the roster runs 0, 5, 6, 7, 8, 10, 11, 12, 13 and 瑪利 at the
front desk.

## Not indexable, on purpose

Both `public/robots.txt` and the `<meta name="robots" content="noindex,
nofollow">` tag in `index.html` block search engines. Per the comments left in
the source, this is a design proposal carrying AT13's real address and phone
number but generated imagery rather than the salon's own photography. The
designer portraits are now the salon's own; the work gallery, salon interiors,
harbour and mood images are still generated. Lift both only once the owner
approves and the rest of the imagery is real too.

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
