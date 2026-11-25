import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { loadArticles, relatedArticles } from '../src/content/articles';

test('drafts stay private and only reviewed, unique publications load', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'gachaverse-editorial-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const original = readFileSync('content/artigos/onde-resgatar-codigos.md', 'utf8');
  writeFileSync(join(dir, 'draft.md'), '---\nstatus: rascunho\n---\nTexto privado');
  assert.deepEqual(loadArticles(dir), []);
  writeFileSync(join(dir, 'guide.md'), original.replace('revisado: true', 'revisado: false'));
  assert.throws(() => loadArticles(dir), /revisado/);
  writeFileSync(join(dir, 'guide.md'), original);
  const [guide] = loadArticles(dir);
  assert.ok(guide.headings.length > 0);
  for (const heading of guide.headings) assert.ok(guide.html.includes('id="' + heading.id + '"'));
  assert.deepEqual(relatedArticles(guide, [guide]), []);
  writeFileSync(join(dir, 'duplicate.md'), original);
  assert.throws(() => loadArticles(dir), /duplicado/);
});
