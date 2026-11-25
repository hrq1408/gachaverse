import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
const out = 'tracker-out';
await mkdir(out, { recursive: true });
await build({
  entryPoints: ['tracker/app.tsx'],
  bundle: true,
  minify: true,
  outfile: out + '/app.js',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});
const policy =
  "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'";
await writeFile(
  out + '/index.html',
  '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="' +
    policy +
    '"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Warp Tracker | GachaVerse</title><link rel="stylesheet" href="./app.css"><script src="./app.js" defer></script></head><body><div id="app"></div></body></html>',
);
await writeFile(
  out + '/_headers',
  '/*\n  Content-Security-Policy: ' +
    policy +
    "; frame-ancestors 'none'\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n",
);
await writeFile(out + '/robots.txt', 'User-agent: *\nDisallow: /\n');
