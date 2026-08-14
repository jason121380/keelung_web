#!/usr/bin/env node
/**
 * Ingest designer photographs into the site.
 *
 * The page asks for an image by id and the bundle resolves that id in three
 * sizes. Ids it does not know fall through to a fixed path, so a photo only
 * has to be written to the right place — no bundle editing:
 *
 *   public/assets/gen/<id>.webp          full   1200 x 1600
 *   public/assets/gen/tex/<id>.webp      mid     768 x 1024
 *   public/assets/gen/thumb/<id>.webp    thumb   400 x  533
 *
 * Every designer frame is 3:4, so each source is cropped to 3:4 before it is
 * resized. Sources that are already 3:4 lose nothing. Anything else is cropped
 * on its longer axis, by default around whatever the photo's own detail
 * suggests is the subject; pass a gravity to override that per photo.
 *
 * Usage:
 *   node tools/add-photos.mjs <photo> --id <id> [--gravity <g>] [...]
 *   node tools/add-photos.mjs --manifest photos.json
 *
 * A manifest is a JSON array of { file, id, gravity? }. Gravity is one of
 * attention (default), entropy, north, south, east, west, center.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join, resolve as resolvePath } from 'node:path';
import { argv, exit } from 'node:process';
import sharp from 'sharp';

const ROOT = resolvePath(new URL('..', import.meta.url).pathname);
const GEN = join(ROOT, 'public', 'assets', 'gen');

/** The three variants the bundle asks for, and the widths the srcset names. */
const VARIANTS = [
  { dir: '', width: 1200, height: 1600, quality: 82 },
  { dir: 'tex', width: 768, height: 1024, quality: 80 },
  { dir: 'thumb', width: 400, height: 533, quality: 74 },
];

const GRAVITIES = new Set(['attention', 'entropy', 'north', 'south', 'east', 'west', 'center']);

const position = g =>
  g === 'attention' ? sharp.strategy.attention
  : g === 'entropy' ? sharp.strategy.entropy
  : g;

async function ingest({ file, id, gravity = 'attention' }) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error(`id "${id}" must be lowercase letters, digits and dashes`);
  if (!GRAVITIES.has(gravity)) throw new Error(`gravity "${gravity}" is not one of ${[...GRAVITIES].join(', ')}`);

  const source = await readFile(file);
  const meta = await sharp(source).metadata();
  const ratio = meta.width / meta.height;
  const target = 3 / 4;
  // What the 3:4 crop costs, reported so a bad source is obvious before it ships.
  const lost = ratio > target ? 1 - target / ratio : 1 - ratio / target;

  const written = [];
  for (const v of VARIANTS) {
    const dir = join(GEN, v.dir);
    await mkdir(dir, { recursive: true });
    const out = join(dir, `${id}.webp`);
    await sharp(source)
      .rotate() // honour EXIF orientation before measuring anything
      .resize(v.width, v.height, { fit: 'cover', position: position(gravity), withoutEnlargement: false })
      .webp({ quality: v.quality, effort: 6 })
      .toFile(out);
    written.push(out.slice(ROOT.length + 1));
  }

  return {
    id,
    source: basename(file),
    sourceSize: `${meta.width}x${meta.height}`,
    sourceRatio: ratio.toFixed(3),
    croppedAxis: Math.abs(ratio - target) < 0.005 ? 'none' : ratio > target ? 'width' : 'height',
    croppedPct: Math.round(lost * 100),
    gravity,
    written,
  };
}

function parseArgs(args) {
  const jobs = [];
  let manifest = null;
  let current = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--manifest') manifest = args[++i];
    else if (a === '--id') { if (!current) throw new Error('--id must follow a photo path'); current.id = args[++i]; }
    else if (a === '--gravity') { if (!current) throw new Error('--gravity must follow a photo path'); current.gravity = args[++i]; }
    else { current = { file: a }; jobs.push(current); }
  }
  return { jobs, manifest };
}

const { jobs, manifest } = parseArgs(argv.slice(2));
const work = manifest
  ? JSON.parse(await readFile(manifest, 'utf8'))
  : jobs;

if (!work.length) {
  console.error('Nothing to do. Pass photo paths with --id, or --manifest photos.json');
  exit(1);
}

const results = [];
for (const job of work) {
  if (!job.id) throw new Error(`no --id given for ${job.file}`);
  results.push(await ingest(job));
}

console.table(results.map(r => ({
  id: r.id,
  source: r.source,
  size: r.sourceSize,
  ratio: r.sourceRatio,
  cropped: r.croppedAxis === 'none' ? 'nothing' : `${r.croppedPct}% off the ${r.croppedAxis}`,
  gravity: r.gravity,
})));

console.log(`\n${results.length} photo(s) written as ${results.length * 3} files under public/assets/gen/.`);
console.log('Point each designer\'s img at its id in public/assets/content-*.js to put them on the page.');
