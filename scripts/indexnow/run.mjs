import { readFile, appendFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { acknowledge, changes, checkKey, confirmedRemoval, outcomes, submit, validateState, writeKey } from './core.mjs';

const [mode, stateFile, nextFile] = process.argv.slice(2);
const key = process.env.INDEXNOW_KEY;

async function report(message, urls = []) {
  const summary = [message, ...urls.map(url => '- ' + url)].join('\n');
  console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, '### IndexNow\n\n' + summary + '\n\n');
  else if (urls.length) console.log(urls.join('\n'));
}

async function notify() {
  const state = validateState(JSON.parse(await readFile(stateFile, 'utf8')));
  const current = JSON.parse(process.env.INDEXNOW_MANIFEST ?? '{}');
  if (!Object.keys(current).length) throw new Error('Manifesto IndexNow ausente.');
  validateState({ version: 1, retryAt: 0, received: current });
  const { added, changed, removed } = changes(state.received, current);
  const confirmed = [];
  for (let offset = 0; offset < removed.length; offset += 8) {
    const batch = removed.slice(offset, offset + 8);
    const decisions = await Promise.all(batch.map(url => confirmedRemoval(url)));
    confirmed.push(...batch.filter((_, index) => decisions[index]));
  }
  const urls = [...added, ...changed, ...confirmed].slice(0, 1000);
  const total = [added.length + ' novas', changed.length + ' alteradas', confirmed.length + ' remoções 404/410', (removed.length - confirmed.length) + ' saídas sem remoção confirmada'].join(', ') + '.';
  if (process.env.INDEXNOW_DRY_RUN === 'true') return report('Simulação sem POST e sem alteração do registro. ' + total, urls);
  if (!urls.length) return report('Nenhuma URL para enviar. ' + total);
  if (!key) return report('Envio pendente. Configure o secret INDEXNOW_KEY. ' + total);
  if (state.retryAt > Date.now()) return report('Envio pendente até ' + new Date(state.retryAt).toISOString() + '. ' + total);
  let result;
  try {
    const keyLocation = await checkKey(key);
    await report('Prova de propriedade conferida por HTTPS. Resposta HTTP 200 e conteúdo exato.');
    result = await submit(key, keyLocation, urls, { wait: delay });
  } catch {
    return report('Não foi possível verificar a chave ou concluir o POST. Lote pendente para próxima execução validada.');
  }
  const accepted = result.status === 200 || result.status === 202;
  await report('HTTP ' + result.status + '. ' + (outcomes[result.status] ?? 'Resposta inesperada. Lote pendente.') + ' ' + total, accepted ? urls : []);
  const next = acknowledge(state, current, urls, result);
  if (JSON.stringify(next) !== JSON.stringify(state)) await writeFile(nextFile, JSON.stringify(next) + '\n');
}

if (mode === 'key-file') {
  if (key) await writeKey('public', key);
  else console.log('INDEXNOW_KEY ausente. O build do portal continua sem a prova de propriedade.');
} else if (mode === 'notify') {
  await notify();
} else {
  throw new Error('Use key-file ou notify.');
}
