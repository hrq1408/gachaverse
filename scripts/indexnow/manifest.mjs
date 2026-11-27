import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { canonical, fingerprint } from './core.mjs';

export async function manifest(root) {
  const sitemap = await readFile(join(root, 'sitemap.txt'), 'utf8');
  const urls = sitemap.split(/\r?\n/).filter(canonical);
  const browser = await chromium.launch({ channel: process.env.BETA_BROWSER_CHANNEL || 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => route.abort());
    const current = {};
    for (let start = 0; start < urls.length; start += 12) {
      const batch = urls.slice(start, start + 12);
      const pages = await Promise.all(batch.map(async url => ({
        url, html: await readFile(join(root, new URL(url).pathname, 'index.html'), 'utf8'),
      })));
      const fields = await page.evaluate(pages => pages.map(({ url, html }) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
        const excluded = Array.from(doc.querySelectorAll('meta[name]')).some(meta =>
          /^(?:robots|bingbot)$/i.test(meta.name) && /\b(?:noindex|none)\b/i.test(meta.content));
        if (canonical !== url || excluded) return null;
        const article = doc.querySelector('main article.prose');
        const content = article ?? doc.querySelector('main');
        if (!content) throw new Error('O HTML canônico não contém main.');
        for (const element of content.querySelectorAll('script, style, template, svg, input, .redemption-highlight, .redemption-notice')) element.remove();
        // The redemption countdown changes every second; confirmed deadlines remain in <time>.
        for (const element of content.querySelectorAll('p')) {
          if (/\b\d+ h \d+ min \d+ s$/.test(element.textContent.trim())) element.remove();
        }
        const output = [];
        const walk = node => {
          if (node.nodeType === 3) {
            const value = node.textContent.replace(/\s+/g, ' ').trim();
            if (value) output.push(value);
          } else if (node.nodeType === 1) {
            const selector = node.tagName.toLowerCase();
            if (selector === 'img') output.push(['img', node.getAttribute('alt') ?? '']);
            if (selector === 'a') output.push(['a', node.getAttribute('href')]);
            if (selector === 'time') output.push(['time', node.getAttribute('datetime')]);
            if (/^h[1-6]$/.test(selector)) output.push(selector);
            for (const child of node.childNodes) walk(child);
          }
        };
        walk(content);
        return [doc.title, doc.querySelector('meta[name="description"]')?.content, output];
      }), pages);
      fields.forEach((entry, i) => { if (entry) current[batch[i]] = fingerprint(entry); });
    }
    return current;
  } finally { await browser.close(); }
}

if (process.argv[2] === '--out') {
  const current = await manifest(process.argv[3] ?? 'out');
  if (!Object.keys(current).length) throw new Error('Manifesto IndexNow vazio.');
  await writeFile(process.argv[4] ?? 'indexnow-current.json', JSON.stringify(current), 'utf8');
  console.log(Object.keys(current).length + ' canônicas indexáveis no manifesto IndexNow.');
}
