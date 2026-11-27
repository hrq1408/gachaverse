import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { relative, sep } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright-core';
import { checkSitemaps } from './check-sitemaps.mjs';

const tracker = 'https://gachaverse-tracker.pages.dev';
const portal = 'https://gachaverse.pages.dev';
const mode = process.argv[2];
assert(['tracker', 'portal'].includes(mode));
async function request(url) {
  const res = await fetch(url, {redirect:'error',signal:AbortSignal.timeout(15000)});
  assert.equal(res.status,200,url);
  return res;
}
async function deployed(check) {
  for(let i=0;;i++) {
    try { await check(); return; }
    catch(error) { if(i===14) throw error; await delay(4000); }
  }
}
const browser = await chromium.launch({channel:process.env.BETA_BROWSER_CHANNEL || 'chrome', headless:true});
try {
  const context = await browser.newContext({serviceWorkers:'block'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', err=>errors.push(err.message));
  if(mode==='tracker'){
    await deployed(async()=>{
      for(const f of ['app.js','app.css','index.html']){
        const res=await request(tracker+(f==='index.html'?'/':'/'+f)+'?build='+encodeURIComponent(process.env.GITHUB_SHA||'verify'));
        assert.deepEqual(Buffer.from(await res.arrayBuffer()),await readFile('tracker-out/'+f),f+' diverge do build');
      }
    });
    const outside = new Set();
    page.on('request', req=>{if(/^https?:/.test(req.url()) && new URL(req.url()).origin!==tracker)outside.add(new URL(req.url()).origin);});
    const response=await page.goto(tracker);
    assert.equal(response.status(),200);
    const h=await response.allHeaders();
    const csp=h['content-security-policy']||'';
    for(const directive of ["default-src 'none'","script-src 'self'","style-src 'self'","connect-src 'none'","frame-src 'none'","frame-ancestors 'none'","object-src 'none'","form-action 'none'","base-uri 'none'"])assert(csp.split(';').map(x=>x.trim()).includes(directive),directive);
    for(const [k,v] of Object.entries({'referrer-policy':'no-referrer','x-content-type-options':'nosniff','x-frame-options':'DENY'}))assert.equal(h[k]?.toLowerCase(),v.toLowerCase());
    console.log('HTTPS 200; CSP:',csp,'; referrer-policy:',h['referrer-policy'],'; nosniff; DENY');
    await page.getByRole('heading',{name:/Warp Tracker Beta/}).waitFor();
    const file={version:1,saltos:[{id:'10001',banner:'personagem',data:'2026-01-01T12:00:00Z',item:'Registro sintético de validação',estrelas:5}]};
    await page.getByLabel('Escolher JSON',{exact:true}).setInputFiles({name:'beta.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(file))});
    await page.getByRole('button',{name:'Confirmar importação'}).click();
    await page.getByText(file.saltos[0].item,{exact:true}).waitFor();
    await page.reload();await page.getByText(file.saltos[0].item,{exact:true}).waitFor();
    for (const [locale, label, journal] of [['en','EN','My journal'],['es','ES','Mi diario'],['pt-BR','PT','Meu diário']]) {
      await page.getByRole('link', { name: label, exact: true }).click();
      await page.waitForURL(tracker + (locale === 'pt-BR' ? '/' : '/?lang=' + locale));
      await page.getByRole('heading',{name:journal,exact:true}).waitFor();
      assert.equal(await page.locator('html').getAttribute('lang'), locale);
      await page.getByText(file.saltos[0].item,{exact:true}).waitFor();
    }
    await page.getByLabel('Formato de exportação').selectOption('GachaVerse 1');
    const downloaded=page.waitForEvent('download');
    await page.getByRole('button',{name:'Exportar conta'}).click();
    const download=await downloaded;
    assert.deepEqual(JSON.parse(await readFile(await download.path(),'utf8')),file);
    const dbs=page=>page.evaluate(async()=>(await indexedDB.databases()).map(db=>db.name));
    assert((await dbs(page)).includes('gachaverse-tracker'));
    const publicPage=await context.newPage();
    // Capture the tracker independently before the intentional portal request.
    assert.equal(outside.size,0,[...outside].join(','));
    await publicPage.goto(portal);assert(!(await dbs(publicPage)).includes('gachaverse-tracker'));await publicPage.close();
    await page.getByRole('button',{name:'Excluir conta local'}).click();
    await page.getByRole('button',{name:/Confirmar exclusão de/}).click();
    await page.getByText('Seu diário começa com um arquivo').waitFor();
    await page.reload();await page.getByText('Seu diário começa com um arquivo').waitFor();
    await page.getByRole('button',{name:'Abrir demonstração'}).click();
    await page.getByRole('heading',{name:/Estimativa beta/}).waitFor();
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:900});
      await page.waitForFunction(w => innerWidth === w && document.documentElement.scrollWidth <= w,width,{timeout:5000}).catch(async error => {
        console.error('Elementos além da largura',width,await page.evaluate(w=>Array.from(document.querySelectorAll('body *')).filter(el=>el.getBoundingClientRect().right>w+1).slice(0,12).map(el=>el.tagName+'.'+el.className),width));
        throw error;
      });
    }
    assert.equal(await page.locator('script:not([src="./app.js"]),iframe').count(),0);
    assert.deepEqual([...outside],[]);
    console.log('Importação, exportação, persistência, exclusão local, isolamento de origem e quatro larguras OK.');
  }else{
    const guide='/ferramentas/warp-tracker/';
    await deployed(async()=>assert((await (await request(portal+guide)).text()).includes(tracker+'/')));
    const sitemap=await checkSitemaps(portal,page);
    const articles=(await readdir('out/artigos',{withFileTypes:true})).filter(x=>x.isDirectory());
    assert(articles.length>=11);
    for(const a of articles){
      const url=portal+'/artigos/'+a.name+'/';assert(sitemap.includes(url),url);
      const html=await (await request(url)).text();assert(html.includes('rel="canonical" href="'+url+'"'),url);
    }
    for(const f of ['ads.txt','google35321f89903e0b6b.html'])assert.deepEqual(Buffer.from(await (await request(portal+'/'+f)).arrayBuffer()),await readFile('public/'+f));
    const assetErrors = [];
    page.on('console', message => {
      if (message.type() !== 'error') return;
      const { url } = message.location();
      // Chromium probes for a default favicon even when the portal has no icon declared.
      if (url === portal + '/favicon.ico' && message.text().includes('status of 404')) return;
      assetErrors.push(url + ' ' + message.text());
    });
    page.on('response', response => {
      const url = new URL(response.url());
      const asset = ['script', 'stylesheet', 'image', 'font'].includes(response.request().resourceType());
      if (url.origin !== portal || (!asset && !url.pathname.startsWith('/_next/'))) return;
      if (url.pathname === '/favicon.ico' && response.status() === 404) return;
      if (response.status() >= 400 || url.pathname.includes('/_next//_next/')) {
        assetErrors.push(response.status() + ' ' + url.pathname + ' (página: ' + page.url() + ')');
      }
    });
    const exported = await readdir('out', { recursive: true, withFileTypes: true });
    const routes = exported.filter(file => file.isFile() && file.name === 'index.html')
      .map(file => relative('out', file.parentPath).split(sep).filter(Boolean))
      .filter(parts => !['404', '_not-found'].includes(parts[0]))
      .map(parts => portal + '/' + (parts.length ? parts.join('/') + '/' : ''));
    for (const url of routes) {
      const response = await page.goto(url);
      assert.equal(response.status(), 200, url);
      if (sitemap.includes('<loc>' + url + '</loc>')) {
        assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), url);
      }
      await page.waitForLoadState('networkidle');
    }
    await page.goto(portal);
    await page.getByRole('button',{name:'Preferências de cookies'}).click();
    await page.getByRole('button',{name:'Salvar preferências'}).click();
    await page.evaluate(() => { document.body.dataset.navigationCheck = 'gachaverse-navigation-check'; });
    await page.getByRole('navigation',{name:'Navegação principal'}).getByText('Ferramentas').click();
    await page.getByRole('link',{name:/Calculadora de pity/}).click();
    assert.equal(await page.locator('body').getAttribute('data-navigation-check'), 'gachaverse-navigation-check');
    await page.locator('#pity').fill('70');await page.locator('.guarantee input').check();
    await page.locator('.pity-wallet input').first().fill('2879');await page.locator('.pity-wallet input').last().fill('2');
    await page.getByRole('status').filter({hasText:'1 Jade Estelar'}).waitFor();
    for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
    assert.equal(await page.locator('meta[name="google-adsense-account"]').getAttribute('content'),'ca-pub-6914991641652412');
    assert.equal(await page.locator('iframe[src*="medicao"],script[src*="googlesyndication"]').count(),0);
    await page.goto(portal+guide);await page.getByRole('link',{name:'Abrir Warp Tracker Beta'}).click();
    assert.equal(new URL(page.url()).origin,tracker);await page.getByRole('heading',{name:/Warp Tracker Beta/}).waitFor();
    assert.deepEqual(assetErrors, []);
    console.log(routes.length+' páginas, '+articles.length+' artigos, assets, sitemap, consentimento e navegação interna OK.');
  }
  assert.deepEqual(errors,[]);
}finally{await browser.close();}
