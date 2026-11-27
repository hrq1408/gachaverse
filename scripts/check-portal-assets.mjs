import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = 'out';
const normalize = path => path.split(sep).join('/');
const files = (await readdir(root, { recursive: true, withFileTypes: true })).filter(file => file.isFile());
const paths = new Set(files.map(file => normalize(relative(root, join(file.parentPath, file.name)))));
const references = /\/_next\/static\/chunks\/([a-zA-Z0-9_.~-]+\.(?:js|css))(?=["'\s,<>?\\]|$)/g;
const missing = [];
let documents = 0;

for (const path of paths) {
  if (!path.endsWith('.html') && !path.endsWith('.txt')) continue;
  const text = await readFile(join(root, path), 'utf8');
  documents++;
  if (text.includes('/_next//_next/') || text.includes('/_next/_next/')) {
    missing.push(path + ' contém prefixo de assets duplicado');
  }
  for (const match of text.matchAll(references)) {
    if (!paths.has('_next/static/chunks/' + match[1])) missing.push(path + ' → ' + match[0]);
  }
}

if (!paths.has('index.html') || ![...paths].some(path => path.startsWith('_next/static/chunks/') && path.endsWith('.js'))) {
  missing.push('A exportação precisa conter a home e chunks JavaScript.');
}
if (missing.length) {
  console.error([...new Set(missing)].slice(0, 30).join('\n'));
  process.exitCode = 1;
} else {
  console.log(documents + ' documentos HTML e segmentos RSC conferidos na exportação.');
}
