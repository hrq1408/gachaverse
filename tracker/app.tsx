import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  ArrowDownToLine,
  ChartNoAxesColumn,
  Database,
  FileUp,
  Orbit,
  Stars,
  Trash2,
} from 'lucide-react';
import { analyze, probability } from './analysis';
import {
  canExport,
  encode,
  families,
  fileLimit,
  formats,
  merge,
  parseFile,
  type Format,
  type Profile,
  type Row,
} from './formats';
import { importProfiles, transact } from './store';
import { demo } from './demo';
import { ImportGuide } from './import-guide';
import './style.css';
import './import-guide.css';

const integer = new Intl.NumberFormat('pt-BR');
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' });
function displayDate(row: Row) {
  if (row.source?.time) {
    const [date, time] = row.source.time.split(' ');
    return date.split('-').reverse().join('/') + ' ' + time.slice(0, 5) + ' (servidor)';
  }
  const value = new Date(row.instant);
  return Number.isFinite(value.getTime()) ? dateFormatter.format(value) + ' UTC' : row.instant;
}
function Chart({ title, values }: { title: string; values: Record<string, number> }) {
  const entries = Object.entries(values);
  const max = Math.max(1, ...Object.values(values));
  return (
    <section className="chart">
      <h3>{title}</h3>
      {entries.length ? (
        <ul>
          {entries.map(([label, n]) => (
            <li key={label}>
              <span>{label}</span>
              <meter min={0} max={max} value={n} aria-label={label} />
              <b>{n}</b>
            </li>
          ))}
        </ul>
      ) : (
        <p>Sem observações suficientes.</p>
      )}
    </section>
  );
}
function Summary({
  profile,
  family,
  mark,
}: {
  profile: Profile;
  family: Row['family'];
  mark: (id: string, value: boolean | undefined) => void;
}) {
  const [pulls, setPulls] = useState(10),
    [limit, setLimit] = useState(20);
  const s = analyze(profile.rows, family);
  const rate = s.rule?.baseRate;
  return (
    <>
      <div className="metrics">
        <div>
          <small>Saltos registrados</small>
          <strong>{integer.format(s.history.length)}</strong>
        </div>
        <div>
          <small>Pity observado</small>
          <strong>
            {s.inconsistent ? '—' : s.distance}
            <em>{!s.anchored && !s.inconsistent ? ' ou mais' : ''}</em>
          </strong>
        </div>
        <div>
          <small>Garantia promocional</small>
          <b>{s.guarantee}</b>
        </div>
      </div>
      <p className="note">
        {s.inconsistent
          ? 'Há um registro agrupado ou um intervalo incompatível com o limite do banner. Confira o arquivo antes de interpretar o pity.'
          : !s.anchored
            ? 'Histórico parcial: falta uma referência de cinco estrelas ou há registros recentes sem raridade.'
            : 'Contagem desde o último cinco estrelas observado. O arquivo não comprova que todos os Saltos posteriores estão presentes.'}
      </p>
      {profile.key !== 'demo' && s.lastFive && s.rule && (
        <label>
          Resultado do último cinco estrelas · {s.lastFive.name ?? s.lastFive.source?.item_id}
          <select
            value={s.lastFive.featured === undefined ? '' : String(s.lastFive.featured)}
            onChange={(e) =>
              mark(s.lastFive!.id, e.target.value === '' ? undefined : e.target.value === 'true')
            }
          >
            <option value="">Destaque desconhecido</option>
            <option value="true">Conferi: recebi o destaque</option>
            <option value="false">Conferi: recebi outro item</option>
          </select>
        </label>
      )}
      <div className="charts">
        <Chart
          title="Distribuição de raridades"
          values={Object.fromEntries(
            Object.entries(s.rarities).map(([k, v]) => [k === 'Sem raridade' ? k : k + ' estrelas', v]),
          )}
        />
        <Chart title="Saltos por mês" values={s.months} />
        <Chart
          title="Pity entre cinco estrelas"
          values={Object.fromEntries(
            s.cycles
              .slice(-8)
              .map((n, i) => ['Ciclo ' + (Math.max(0, s.cycles.length - 8) + i + 1), n]),
          )}
        />
      </div>
      {s.rule && rate && (
        <section className="model">
          <Activity />
          <div>
            <h3>Estimativa beta para o próximo cinco estrelas</h3>
            <label>
              Saltos planejados{' '}
              <input
                type="number"
                min="0"
                max="180"
                value={pulls}
                onChange={(e) =>
                  setPulls(Math.max(0, Math.min(180, Math.trunc(Number(e.target.value) || 0))))
                }
              />
            </label>
            {s.anchored && !s.inconsistent ? (
              <strong>
                {(probability(s.distance, pulls, s.rule.hardPity, rate) * 100).toLocaleString('pt-BR', {
                  maximumFractionDigits: 2,
                })}
                %
              </strong>
            ) : (
              <p>Estimativa indisponível para este histórico parcial.</p>
            )}
            <p>
              Modelo simplificado com taxa base fixa de {(rate * 100).toLocaleString('pt-BR')}% e
              garantia no Salto {s.rule.hardPity}. Supõe um histórico contínuo desde o último cinco
              estrelas e desconsidera soft pity. Mede a chance de pelo menos um cinco estrelas nos
              Saltos planejados.
            </p>
          </div>
        </section>
      )}
      <h3>Últimos Saltos</h3>
      <ol className="log">
        {s.history.slice(0, limit).map((r) => (
          <li key={r.id}>
            <span>{r.name ?? 'Item ' + r.source?.item_id}</span>
            <small>
              {r.rank ? r.rank + ' ★' : 'Raridade desconhecida'} · {displayDate(r)}
            </small>
          </li>
        ))}
      </ol>
      {s.history.length > limit && (
        <button onClick={() => setLimit(limit + 30)}>Ver mais registros</button>
      )}
    </>
  );
}
type Preview = ReturnType<typeof parseFile>;
function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]),
    [selected, setSelected] = useState(''),
    [showDemo, setDemo] = useState(false);
  const [preview, setPreview] = useState<Preview>(),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(true);
  const [localName, setLocalName] = useState('Local'),
    [family, setFamily] = useState<Row['family']>('11'),
    [format, setFormat] = useState<Format>('GachaVerse 2'),
    [confirmDelete, setDelete] = useState(false);
  useEffect(() => {
    transact()
      .then(setProfiles)
      .catch(() => setNotice('Armazenamento indisponível neste navegador.'))
      .finally(() => setBusy(false));
  }, []);
  const profile = showDemo ? demo : (profiles.find((p) => p.key === selected) ?? profiles[0]);
  const existingIds = useMemo(
    () => new Map(profiles.map((p) => [p.key, new Set(p.rows.map((r) => r.id))])),
    [profiles],
  );
  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) await readHistoryFile(file);
  }
  async function readHistoryFile(file: File) {
    setBusy(true);
    setPreview(undefined);
    setNotice('');
    setDelete(false);
    try {
      if (file.size > fileLimit) throw Error('O limite por arquivo é de 32 MB.');
      const candidate = parseFile(JSON.parse((await file.text()).replace(/^\uFEFF/, '')), localName);
      merge(profiles, candidate.profiles);
      setPreview(candidate);
    } catch (err) {
      setNotice(
        err instanceof Error && err.name === 'Error'
          ? err.message
          : 'Não conseguimos ler esse arquivo. Exporte um JSON de histórico (UIGF, SRGF ou GachaVerse), não uma planilha, e tente novamente.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!preview) return;
    setBusy(true);
    try {
      const result = await importProfiles(preview.profiles);
      setProfiles(result);
      setSelected(preview.profiles[0].key);
      setPreview(undefined);
      setDemo(false);
      setNotice('Histórico salvo neste navegador. Veja seus resultados no diário abaixo.');
      requestAnimationFrame(() => document.getElementById('tracker-board')?.focus());
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Falha ao gravar.');
    } finally {
      setBusy(false);
    }
  }
  async function modify(fn: (p: Profile[]) => Profile[]) {
    setBusy(true);
    try {
      setProfiles(await transact(fn));
      setDelete(false);
      setNotice('Diário atualizado.');
    } catch {
      setNotice('Não foi possível alterar os registros.');
    } finally {
      setBusy(false);
    }
  }
  function download() {
    if (!profile || !canExport(profile, format)) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(encode(profile, format))], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gachaverse-historico.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <header>
        <div className="wrap brand">
          <Orbit /> Gacha<span>Verse</span>
          <a href="https://gachaverse.pages.dev/ferramentas/" rel="noreferrer">Ferramentas</a><a href="#tutorial">Tutorial</a>
        </div>
      </header>
      <main className="wrap">
        <div className="heading">
          <p>HONKAI: STAR RAIL</p>
          <h1>
            Warp <i>Tracker</i> <small className="beta">Beta</small>
          </h1>
          <p className="intro">
            Acompanhe quantos tiros você deu, seu pity e seu histórico. Importe um arquivo ou explore a demonstração gratuita.
          </p>
        </div>
        <ImportGuide>
            <details className="guide-details">
              <summary>Opções avançadas (apenas backups antigos)</summary>
            <label>
              Nome do perfil para arquivo GachaVerse v1 sem UID
              <input
                value={localName}
                maxLength={80}
                onChange={(e) => {
                  setLocalName(e.target.value);
                  setPreview(undefined);
                }}
              />
            </label>
            </details>
            <label className="upload"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (busy) return;
                if (e.dataTransfer.files.length !== 1) {
                  setPreview(undefined);
                  setNotice('Selecione apenas um arquivo por vez.');
                  return;
                }
                void readHistoryFile(e.dataTransfer.files[0]);
              }}>
              <FileUp size={28} aria-hidden="true" />
              <strong>Arraste o arquivo aqui</strong>
              <span className="guide-select-button">Selecionar arquivo JSON</span>
              <span className="upload-hint">Procure em Downloads · arquivo .json de até 32 MB</span>
              <input
                aria-label="Escolher JSON"
                type="file"
                accept=".json,application/json"
                disabled={busy}
                onChange={pick}
              />
            </label>
            {preview && (
              <div className="preview">
                <h3>Prévia · {preview.format}</h3>
                <p>Somente registros de Star Rail serão importados.</p>
                <ul>
                  {preview.profiles.map((p) => (
                    <li key={p.key}>
                      {p.key} · {p.rows.length} Saltos ·{' '}
                      {p.rows.filter((r) => existingIds.get(p.key)?.has(r.id)).length} já existentes
                    </li>
                  ))}
                </ul>
                <button disabled={busy} onClick={save}>
                  Confirmar importação
                </button>
                <button disabled={busy} onClick={() => setPreview(undefined)}>
                  Cancelar
                </button>
              </div>
            )}
            <p role="status" aria-live="polite">{busy ? 'Processando…' : notice}</p>
        </ImportGuide>
        <div className="layout">
          <aside>
            <Stars />
            <h3>Explorar demonstração</h3>
            <p>Conheça os gráficos com um histórico fictício mantido apenas em memória.</p>
            <button
              onClick={() => {
                setDemo(!showDemo);
                setDelete(false);
                setNotice('');
              }}
            >
              {showDemo ? 'Sair da demonstração' : 'Abrir demonstração'}
            </button>
          </aside>
          <section className="board" id="tracker-board" tabIndex={-1} aria-label="Meu diário de Saltos">
            <div className="board-title">
              <ChartNoAxesColumn />
              <h2>{showDemo ? 'Diário demonstrativo' : 'Meu diário'}</h2>
            </div>
            {profile ? (
              <>
                <div className="filters">
                  {!showDemo && (
                    <label>
                      Conta
                      <select
                        value={profile.key}
                        onChange={(e) => {
                          setSelected(e.target.value);
                          setDelete(false);
                          setFormat('GachaVerse 2');
                        }}
                      >
                        {profiles.map((p) => (
                          <option key={p.key}>{p.key}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label>
                    Família de banner
                    <select value={family} onChange={(e) => setFamily(e.target.value as Row['family'])}>
                      {Object.entries(families).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <Summary
                  key={profile.key + family}
                  profile={profile}
                  family={family}
                  mark={(id, value) =>
                    modify((list) =>
                      list.map((p) =>
                        p.key === profile.key
                          ? {
                              ...p,
                              rows: p.rows.map((r) => (r.id === id ? { ...r, featured: value } : r)),
                            }
                          : p,
                      ),
                    )
                  }
                />
                {!showDemo && (
                  <fieldset disabled={busy}>
                    <legend>Gerenciar esta conta</legend>
                    <label>
                      Formato de exportação
                      <select value={format} onChange={(e) => setFormat(e.target.value as Format)}>
                        {formats.map((f) => (
                          <option key={f} disabled={!canExport(profile, f)}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p>
                      O backup GachaVerse 2 preserva também suas anotações. Opções indisponíveis exigem
                      dados ausentes ou outra família de banner.
                    </p>
                    <button disabled={!canExport(profile, format)} onClick={download}>
                      <ArrowDownToLine /> Exportar conta
                    </button>
                    <button onClick={() => setDelete(!confirmDelete)}>
                      <Trash2 /> {confirmDelete ? 'Cancelar exclusão' : 'Excluir conta local'}
                    </button>
                    {confirmDelete && (
                      <button
                        onClick={() => modify((list) => list.filter((p) => p.key !== profile.key))}
                      >
                        Confirmar exclusão de {profile.key}
                      </button>
                    )}
                  </fieldset>
                )}
              </>
            ) : (
              <div className="empty">
                <Database size={42} />
                <h3>Seu diário começa com um arquivo</h3>
                <p>Importe um histórico ou abra a demonstração para explorar os gráficos.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
createRoot(document.getElementById('app')!).render(<App />);
