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

## Patches applied on top of the snapshot

Because this is build output, anything fixed here is fixed in a minified
bundle and will be **silently reverted by the next real build**. Each patch is
listed with what to change in the original `src/` so it can be carried over.

### Designer photo resolution (`public/assets/index-B1COvtui.js`)

The team section's `sizes` attribute — `(max-width: 720px) 62vw,
(max-width: 1200px) 34vw, 22vw` — did not describe the layout it actually
renders. The designer card frames are laid out by `.team__rail` at breakpoints
700px and 1100px, not 720/1200, and are much wider than declared:

| Viewport | Card | Declared | Actual | Result |
| --- | --- | --- | --- | --- |
| ≤ 700px | any | 62vw | 100vw (full bleed) | 1.6× upscale |
| 701–1100px | `lead` | 34vw | 91.6vw | 2.7× upscale |
| 701–1100px | `full` | 34vw | 60.6vw | 1.8× upscale |
| ≥ 1101px | `lead` | 22vw | 37.2vw | 1.7× upscale |

So the browser fetched a candidate one step too small and scaled it up: the
lead card drew the 400w thumbnail into a 536px box at 1× and the 768w texture
variant into 1072–1170 device px at 2×/3×. Designer photos rendered visibly
soft on every device.

The single `sizes` string is now a per-rank lookup, since the three card ranks
occupy three different track spans, and the render function already knows the
rank before it builds the image:

| Rank | `sizes` |
| --- | --- |
| `lead` | `(max-width: 700px) 100vw, (max-width: 1100px) 92vw, 38vw` |
| `full` | `(max-width: 700px) 100vw, (max-width: 1100px) 61vw, 30vw` |
| `std` | `(max-width: 700px) 100vw, (max-width: 1100px) 45vw, 22vw` |

Measured against the real frame widths from 360px to 1920px, every rank now
lands within 2% of its declared width, on the safe side. **In `src/`:** the
constant is the team equivalent of the `sizes` strings used by the craft and
work rails; make it rank-keyed and pass the card's rank when building the
`<img>`.

### Craft and work rail resolution (`public/assets/index-B1COvtui.js`)

The same mistake, from the same stale 720/1200 breakpoints, in the two other
image rails. Auditing all three at sixteen viewport widths turned up:

| Rail | Viewport | Declared | Actual | Result |
| --- | --- | --- | --- | --- |
| craft | 721–1100px | 46vw | 91.6vw | **2.0× upscale** |
| craft | ≥ 1201px | 32vw | 45vw | 1.4× upscale |
| craft | ≤ 700px | 78vw | 100vw | 1.3× upscale |
| work | ≤ 460px | 82vw | 100vw | 1.2× upscale |
| work | 1201–1600px | 30vw | 35vw | 1.2× upscale |

New strings:

- craft: `(max-width: 700px) 100vw, (max-width: 1100px) 92vw, 46vw`
- work: `(max-width: 460px) 100vw, (max-width: 700px) 446px, (max-width: 1200px) 44vw, 36vw`

The work rail needs the fixed `446px` step because its cards stop growing at
446px wide between 461px and 700px of viewport — as a percentage that band
runs from 97vw down to 64vw, so no single `vw` value covers it without
badly over-declaring at the wide end. Above 1200px the cards grow at 35vw
until they cap at 560px; `36vw` covers the growing part and over-declares
past ~1600px, which costs a little bandwidth on very wide screens but never
softens the image.

After the change every rail is at or below 1.00× — declared width meets or
exceeds actual width — at every measured viewport.

### Designer photo alt text (`public/assets/index-B1COvtui.js`)

Each designer photo carried an `alt` that was, word for word, the visible
`<figcaption>` sitting directly beneath it in the same `<figure>` — `作品：煙灰漸層`
against a caption reading `作品｜煙灰漸層`. Both are built from the same work
title, so this held for all twelve cards in both languages. A screen reader
announced the work title twice, before ever reaching the designer's name.

The image is now `alt=""`, which is the convention this codebase already uses
for the craft cards: when a visible caption in the same figure describes the
image, the caption is the description and the image should not repeat it. The
figure keeps its accessible name from the caption, so nothing is lost:

```
- figure "作品｜黑髮 · 一道光"
  - heading "Eric" [level=3]
  - paragraph: 店長 · 0號設計師
```

The work rail's `alt` is deliberately left alone: it carries the technique as
well as the title, and its image sits inside a button whose `aria-label`
overrides the content anyway.

## Designer cards still carry no portraits

Each of the twelve designer cards reuses one of the twelve images from the
Work rail, credited in the caption as `作品｜<work title>` — so the same twelve
pictures appear twice on the page and none of them shows the designer. That is
honest as far as it goes, but it is placeholder content, not a bug to fix in
code: real portraits have to come from the salon. Once they exist, add them as
their own assets and point each entry's `img` at its portrait instead of at a
work id.

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
