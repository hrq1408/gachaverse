import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const origin = 'https://gachaverse.pages.dev';
const endpoint = 'https://api.indexnow.org/indexnow';
const privatePath = /\/(?:painel|dashboard|drafts?|rascunhos?|preview|migration|migracao)\//i;
const cooldown = 15 * 60_000;

export function canonical(url) {
  if (typeof url !== 'string' || !URL.canParse(url)) return false;
  const parsed = new URL(url);
  return parsed.origin === origin && parsed.href === url &&
    /^\/(?:[a-z0-9-]+\/)*$/.test(parsed.pathname) &&
    !parsed.search && !parsed.hash && !parsed.username && !parsed.password &&
    !privatePath.test(parsed.pathname);
}

export function keyName(key) {
  if (typeof key !== 'string' || !/^[a-z0-9-]{8,128}$/i.test(key)) throw new Error('INDEXNOW_KEY tem formato inválido.');
  return key + '.txt';
}

export async function writeKey(root, key) {
  const file = keyName(key);
  await mkdir(root, { recursive: true });
  await writeFile(join(root, file), key, 'utf8');
}

export function fingerprint(fields) {
  return createHash('sha256').update(JSON.stringify(fields)).digest('hex');
}

export function validateState(value) {
  if (!value || value.version !== 1 || !Number.isSafeInteger(value.retryAt) || value.retryAt < 0 ||
      !value.received || Array.isArray(value.received) || typeof value.received !== 'object' ||
      !Object.entries(value.received).every(([url, hash]) => canonical(url) && /^[a-f0-9]{64}$/.test(hash))) {
    throw new Error('Registro IndexNow inválido. Preserve-o para investigação antes de tentar novamente.');
  }
  return value;
}

export function changes(received, current) {
  return {
    added: Object.keys(current).filter(url => !(url in received)).sort(),
    changed: Object.keys(current).filter(url => url in received && received[url] !== current[url]).sort(),
    removed: Object.keys(received).filter(url => !(url in current)).sort(),
  };
}

const options = () => ({ redirect: 'error', signal: AbortSignal.timeout(15_000) });

export async function checkKey(key, get = fetch) {
  const keyLocation = origin + '/' + keyName(key);
  try {
    const response = await get(keyLocation, { ...options(), cache: 'no-store' });
    if (response.status === 200 && /^text\/plain\b/i.test(response.headers.get('content-type') ?? '') &&
        Buffer.from(await response.arrayBuffer()).equals(Buffer.from(key))) return keyLocation;
  } catch {
    // The URL contains the public proof token. Avoid emitting it in errors.
  }
  throw new Error('Arquivo IndexNow indisponível ou divergente em produção.');
}

function nextRetry(header, now) {
  const value = header?.trim();
  const end = value && /^\d+$/.test(value) ? now + Number(value) * 1000 : Date.parse(value ?? '');
  return Number.isSafeInteger(end) && end > now ? end : now + cooldown;
}

export const outcomes = {
  200: 'URLs recebidas. Indexação não confirmada.',
  202: 'URLs recebidas. Validação da chave pendente. Indexação não confirmada.',
  400: 'Payload inválido. Confira o JSON e os campos.',
  403: 'Verificação recusada. Confira a chave e o arquivo público.',
  422: 'URLs ou domínio incompatíveis. Confira o host e as canônicas.',
  429: 'Limite de requisições. Retentativa adiada.',
};

/**
 * @param {string} key
 * @param {string} keyLocation
 * @param {string[]} urls
 * @param {{send?: typeof fetch, now?: () => number, wait?: (ms: number) => Promise<unknown>}} [options]
 */
export async function submit(key, keyLocation, urls, { send = fetch, now = Date.now, wait } = {}) {
  const urlList = [...new Set(urls)];
  if (!urlList.length || urlList.length > 10_000 || !urlList.every(canonical) || keyLocation !== origin + '/' + keyName(key)) {
    throw new Error('Lote IndexNow inválido.');
  }
  const body = JSON.stringify({ host: new URL(origin).hostname, key, keyLocation, urlList });
  for (let attempt = 0; ; attempt++) {
    const response = await send(endpoint, { ...options(), method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body });
    const status = response.status;
    if (status !== 429) return { status, retryAt: 0 };
    const current = now();
    const retryAt = nextRetry(response.headers.get('retry-after'), current);
    if (attempt || !wait || retryAt - current > 10_000) return { status, retryAt };
    await wait(retryAt - current);
  }
}

export function acknowledge(state, current, urls, result) {
  if (![200, 202].includes(result.status)) return { ...state, retryAt: result.retryAt };
  const received = { ...state.received };
  for (const url of urls) {
    if (url in current) received[url] = current[url];
    else delete received[url];
  }
  return { version: 1, retryAt: 0, received };
}

export async function confirmedRemoval(url, get = fetch) {
  try {
    const response = await get(url, { redirect: 'manual', signal: AbortSignal.timeout(10_000) });
    return response.status === 404 || response.status === 410;
  } catch { return false; }
}
