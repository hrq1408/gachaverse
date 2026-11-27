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
import { tr, trackerLocale, trackerPortal } from './i18n';
import './style.css';
import './import-guide.css';

const familyCopy: Record<Row['family'], readonly [string, string]> = {
  '1': ['Regular Warp', 'Salto permanente'], '2': ['Departure Warp', 'Salto de partida'],
  '11': ['Character Event Warp', 'Salto promocional de personaje'], '12': ['Light Cone Event Warp', 'Salto promocional de cono de luz'],
  '21': ['Collaboration Character Warp', 'Salto de personaje de colaboración'],
  '22': ['Collaboration Light Cone Warp', 'Salto de cono de luz de colaboración'],
};
const guaranteeCopy: Record<string, readonly [string, string]> = {
  Indeterminada: ['Unknown', 'Indeterminada'],
  'Sem garantia ativa': ['No active guarantee', 'Sin garantía activa'],
  Ativa: ['Active', 'Activa'],
} as const;

const integer = new Intl.NumberFormat(trackerLocale);
const dateFormatter = new Intl.DateTimeFormat(trackerLocale, { dateStyle: 'short', timeStyle: 'short', timeZone: 'UTC' });
function displayDate(row: Row) {
  if (row.source?.time) {
    const [date, time] = row.source.time.split(' ');
    const localDate = new Date(date + 'T00:00:00Z');
    return new Intl.DateTimeFormat(trackerLocale, { dateStyle: 'short', timeZone: 'UTC' }).format(localDate) +
      ' ' + time.slice(0, 5) + tr(' (servidor)', ' (server)', ' (servidor)');
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
        <p>{tr('Sem observações suficientes.', 'Not enough observations.', 'No hay suficientes observaciones.')}</p>
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
          <small>{tr("Saltos registrados", "Recorded Warps", "Saltos registrados")}</small>
          <strong>{integer.format(s.history.length)}</strong>
        </div>
        <div>
          <small>{tr("Pity observado", "Observed pity", "Pity observado")}</small>
          <strong>
            {s.inconsistent ? '—' : s.distance}
            <em>{!s.anchored && !s.inconsistent ? tr(" ou mais", " or more", " o más") : ''}</em>
          </strong>
        </div>
        <div>
          <small>{tr("Garantia promocional", "Featured guarantee", "Garantía promocional")}</small>
          <b>{tr(s.guarantee, ...guaranteeCopy[s.guarantee])}</b>
        </div>
      </div>
      <p className="note">
        {s.inconsistent
          ? tr("Há um registro agrupado ou um intervalo incompatível com o limite do banner. Confira o arquivo antes de interpretar o pity.", "An aggregated record or an interval conflicts with the banner limit. Check the file before interpreting pity.", "Un registro agrupado o un intervalo supera el límite del banner. Revisa el archivo antes de interpretar el pity.")
          : !s.anchored
            ? tr("Histórico parcial: falta uma referência de cinco estrelas ou há registros recentes sem raridade.", "Partial history: a 5-star anchor is missing or recent records have no rarity.", "Historial parcial: falta un cinco estrellas de referencia o hay registros recientes sin rareza.")
            : tr("Contagem desde o último cinco estrelas observado. O arquivo não comprova que todos os Saltos posteriores estão presentes.", "Count since the last recorded 5-star. The file cannot confirm that every later Warp is present.", "Cuenta desde el último cinco estrellas registrado. El archivo no confirma que estén todos los Saltos posteriores.")}
      </p>
      {profile.key !== 'demo' && s.lastFive && s.rule && (
        <label>
          {tr('Resultado do último cinco estrelas', 'Latest 5-star result', 'Último resultado de cinco estrellas')} · {s.lastFive.name ?? s.lastFive.source?.item_id}
          <select
            value={s.lastFive.featured === undefined ? '' : String(s.lastFive.featured)}
            onChange={(e) =>
              mark(s.lastFive!.id, e.target.value === '' ? undefined : e.target.value === 'true')
            }
          >
            <option value="">{tr("Destaque desconhecido", "Featured result unknown", "Resultado destacado desconocido")}</option>
            <option value="true">{tr("Conferi: recebi o destaque", "Confirmed: I received the featured result", "Confirmado: obtuve el resultado destacado")}</option>
            <option value="false">{tr("Conferi: recebi outro item", "Confirmed: I received another result", "Confirmado: obtuve otro resultado")}</option>
          </select>
        </label>
      )}
      <div className="charts">
        <Chart
          title={tr("Distribuição de raridades", "Rarity distribution", "Distribución de rarezas")}
          values={Object.fromEntries(
            Object.entries(s.rarities).map(([k, v]) => [k === 'Sem raridade' ? tr(k, 'Unknown rarity', 'Rareza desconocida') : k + tr(' estrelas', ' stars', ' estrellas'), v]),
          )}
        />
        <Chart title={tr("Saltos por mês", "Warps by month", "Saltos por mes")} values={s.months} />
        <Chart
          title={tr("Pity entre cinco estrelas", "Pity between 5-stars", "Pity entre cinco estrellas")}
          values={Object.fromEntries(
            s.cycles
              .slice(-8)
              .map((n, i) => [tr("Ciclo ", "Cycle ", "Ciclo ") + (Math.max(0, s.cycles.length - 8) + i + 1), n]),
          )}
        />
      </div>
      {s.rule && rate && (
        <section className="model">
          <Activity />
          <div>
            <h3>{tr("Estimativa beta para o próximo cinco estrelas", "Beta estimate for the next 5-star", "Estimación beta para el próximo cinco estrellas")}</h3>
            <label>
              {tr("Saltos planejados", "Planned Warps", "Saltos previstos")}{' '}
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
                {(probability(s.distance, pulls, s.rule.hardPity, rate) * 100).toLocaleString(trackerLocale, {
                  maximumFractionDigits: 2,
                })}
                %
              </strong>
            ) : (
              <p>{tr('Estimativa indisponível para este histórico parcial.', 'An estimate is unavailable for this partial history.', 'No hay estimación para este historial parcial.')}</p>
            )}
            <p>
              {tr('Modelo simplificado com taxa base fixa de', 'Simplified model with a fixed base rate of', 'Modelo simplificado con una tasa base fija del')} {(rate * 100).toLocaleString(trackerLocale)}%
              {' '}{tr('e garantia no Salto', 'and hard pity at Warp', 'y garantía en el Salto')} {s.rule.hardPity}.
              {' '}{tr('Supõe um histórico contínuo desde o último cinco estrelas e desconsidera soft pity. Mede a chance de pelo menos um cinco estrelas nos Saltos planejados.',
                'It assumes an unbroken history since the last 5-star and omits soft pity. It estimates the chance of at least one 5-star in the planned Warps.',
                'Supone un historial continuo desde el último cinco estrellas y omite el soft pity. Estima la probabilidad de al menos un cinco estrellas en los Saltos previstos.')}
            </p>
          </div>
        </section>
      )}
      <h3>{tr("Últimos Saltos", "Latest Warps", "Últimos Saltos")}</h3>
      <ol className="log">
        {s.history.slice(0, limit).map((r) => (
          <li key={r.id}>
            <span>{r.name ?? 'Item ' + r.source?.item_id}</span>
            <small>
              {r.rank ? r.rank + ' ★' : tr("Raridade desconhecida", "Unknown rarity", "Rareza desconocida")} · {displayDate(r)}
            </small>
          </li>
        ))}
      </ol>
      {s.history.length > limit && (
        <button onClick={() => setLimit(limit + 30)}>{tr("Ver mais registros", "Show more records", "Mostrar más registros")}</button>
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
      .catch(() => setNotice(tr("Armazenamento indisponível neste navegador.", "Storage is unavailable in this browser.", "El almacenamiento no está disponible en este navegador.")))
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
      if (file.size > fileLimit) throw Error(tr("O limite por arquivo é de 32 MB.", "The file limit is 32 MB.", "El límite por archivo es de 32 MB."));
      const candidate = parseFile(JSON.parse((await file.text()).replace(/^\uFEFF/, '')), localName);
      merge(profiles, candidate.profiles);
      setPreview(candidate);
    } catch (err) {
      setNotice(
        err instanceof Error && err.name === 'Error'
          ? err.message
          : tr("Não conseguimos ler esse arquivo. Exporte um JSON de histórico (UIGF, SRGF ou GachaVerse), não uma planilha, e tente novamente.", "This file could not be read. Export a JSON history (UIGF, SRGF, or GachaVerse) and try again.", "No se pudo leer este archivo. Exporta el historial en JSON (UIGF, SRGF o GachaVerse) y vuelve a intentarlo."),
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
      setNotice(tr("Histórico salvo neste navegador. Veja seus resultados no diário abaixo.", "History saved in this browser. See your results in the journal below.", "Historial guardado en este navegador. Consulta los resultados en el diario."));
      requestAnimationFrame(() => document.getElementById('tracker-board')?.focus());
    } catch (err) {
      setNotice(err instanceof Error ? err.message : tr("Falha ao gravar.", "Could not save.", "No se pudo guardar."));
    } finally {
      setBusy(false);
    }
  }
  async function modify(fn: (p: Profile[]) => Profile[]) {
    setBusy(true);
    try {
      setProfiles(await transact(fn));
      setDelete(false);
      setNotice(tr("Diário atualizado.", "Journal updated.", "Diario actualizado."));
    } catch {
      setNotice(tr("Não foi possível alterar os registros.", "Could not update the records.", "No se pudieron modificar los registros."));
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
          <a href={trackerPortal} rel="noreferrer">{tr("Ferramentas", "Portal tools", "Herramientas del portal")}</a><a href="#tutorial">{tr("Tutorial", "Import guide", "Guía de importación")}</a>
          <nav aria-label={tr('Idiomas','Languages','Idiomas')}>
            {(['pt-BR','en','es'] as const).map(lang => <a key={lang} href={lang === 'pt-BR' ? '/' : '/?lang=' + lang} lang={lang} aria-current={lang === trackerLocale ? 'page' : undefined}>{lang === 'pt-BR' ? 'PT' : lang.toUpperCase()}</a>)}
          </nav>
        </div>
      </header>
      <main className="wrap">
        <div className="heading">
          <p>HONKAI: STAR RAIL</p>
          <h1>
            Warp <i>Tracker</i> <small className="beta">Beta</small>
          </h1>
          <p className="intro">
            {tr('Acompanhe quantos tiros você deu, seu pity e seu histórico. Importe um arquivo ou explore a demonstração gratuita.', 'Track your Warps, pity, and history. Import a file or explore the free demo.', 'Consulta tus Saltos, tu pity y tu historial. Importa un archivo o explora la demostración gratuita.')}
          </p>
        </div>
        <ImportGuide>
            <details className="guide-details">
              <summary>{tr('Opções avançadas (apenas backups antigos)', 'Advanced options (older backups only)', 'Opciones avanzadas (solo copias antiguas)')}</summary>
            <label>
              {tr("Nome do perfil para arquivo GachaVerse v1 sem UID", "Profile name for a GachaVerse v1 file without a UID", "Nombre del perfil para un archivo GachaVerse v1 sin UID")}
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
                  setNotice(tr("Selecione apenas um arquivo por vez.", "Select only one file at a time.", "Selecciona un archivo cada vez."));
                  return;
                }
                void readHistoryFile(e.dataTransfer.files[0]);
              }}>
              <FileUp size={28} aria-hidden="true" />
              <strong>{tr("Arraste o arquivo aqui", "Drop the file here", "Arrastra el archivo aquí")}</strong>
              <span className="guide-select-button">{tr("Selecionar arquivo JSON", "Select JSON file", "Seleccionar archivo JSON")}</span>
              <span className="upload-hint">{tr('Procure em Downloads · arquivo .json de até 32 MB', 'Look in Downloads · .json up to 32 MB', 'Busca en Descargas · .json de hasta 32 MB')}</span>
              <input
                aria-label={tr('Escolher JSON', 'Choose JSON', 'Elegir JSON')}
                type="file"
                accept=".json,application/json"
                disabled={busy}
                onChange={pick}
              />
            </label>
            {preview && (
              <div className="preview">
                <h3>{tr('Prévia', 'Preview', 'Vista previa')} · {preview.format}</h3>
                <p>{tr('Somente registros de Star Rail serão importados.', 'Only Star Rail records will be imported.', 'Solo se importarán registros de Star Rail.')}</p>
                <ul>
                  {preview.profiles.map((p) => (
                    <li key={p.key}>
                      {p.key} · {p.rows.length} {tr('Saltos', 'Warps', 'Saltos')} ·{' '}
                      {p.rows.filter((r) => existingIds.get(p.key)?.has(r.id)).length} {tr('já existentes', 'already present', 'ya existentes')}
                    </li>
                  ))}
                </ul>
                <button disabled={busy} onClick={save}>
                  {tr("Confirmar importação", "Confirm import", "Confirmar importación")}
                </button>
                <button disabled={busy} onClick={() => setPreview(undefined)}>
                  {tr("Cancelar", "Cancel", "Cancelar")}
                </button>
              </div>
            )}
            <p role="status" aria-live="polite">{busy ? tr("Processando…", "Processing…", "Procesando…") : notice}</p>
        </ImportGuide>
        <div className="layout">
          <aside>
            <Stars />
            <h3>{tr("Explorar demonstração", "Explore the demo", "Explorar la demostración")}</h3>
            <p>{tr('Conheça os gráficos com um histórico fictício mantido apenas em memória.', 'Explore the charts with sample data held only in memory.', 'Explora los gráficos con datos ficticios guardados solo en memoria.')}</p>
            <button
              onClick={() => {
                setDemo(!showDemo);
                setDelete(false);
                setNotice('');
              }}
            >
              {showDemo ? tr("Sair da demonstração", "Leave demo", "Salir de la demostración") : tr("Abrir demonstração", "Open demo", "Abrir demostración")}
            </button>
          </aside>
          <section className="board" id="tracker-board" tabIndex={-1} aria-label={tr('Meu diário de Saltos', 'My Warp journal', 'Mi diario de Saltos')}>
            <div className="board-title">
              <ChartNoAxesColumn />
              <h2>{showDemo ? tr("Diário demonstrativo", "Demo journal", "Diario de demostración") : tr("Meu diário", "My journal", "Mi diario")}</h2>
            </div>
            {profile ? (
              <>
                <div className="filters">
                  {!showDemo && (
                    <label>
                      {tr("Conta", "Account", "Cuenta")}
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
                    {tr("Família de banner", "Banner family", "Familia de banner")}
                    <select value={family} onChange={(e) => setFamily(e.target.value as Row['family'])}>
                      {Object.entries(families).map(([id, label]) => (
                        <option key={id} value={id}>
                          {tr(label, ...familyCopy[id as Row['family']])}
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
                    <legend>{tr("Gerenciar esta conta", "Manage this account", "Gestionar esta cuenta")}</legend>
                    <label>
                      {tr("Formato de exportação", "Export format", "Formato de exportación")}
                      <select value={format} onChange={(e) => setFormat(e.target.value as Format)}>
                        {formats.map((f) => (
                          <option key={f} disabled={!canExport(profile, f)}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p>
                      {tr('O backup GachaVerse 2 preserva também suas anotações. Opções indisponíveis exigem dados ausentes ou outra família de banner.',
                        'GachaVerse 2 backups preserve your annotations. Unavailable formats require missing fields or another banner family.',
                        'La copia GachaVerse 2 conserva tus anotaciones. Los formatos no disponibles requieren otros datos u otra familia de banner.')}
                    </p>
                    <button disabled={!canExport(profile, format)} onClick={download}>
                      <ArrowDownToLine /> {tr("Exportar conta", "Export account", "Exportar cuenta")}
                    </button>
                    <button onClick={() => setDelete(!confirmDelete)}>
                      <Trash2 /> {confirmDelete ? tr("Cancelar exclusão", "Cancel deletion", "Cancelar eliminación") : tr("Excluir conta local", "Delete local account", "Eliminar cuenta local")}
                    </button>
                    {confirmDelete && (
                      <button
                        onClick={() => modify((list) => list.filter((p) => p.key !== profile.key))}
                      >
                        {tr('Confirmar exclusão de', 'Confirm deletion of', 'Confirmar eliminación de')} {profile.key}
                      </button>
                    )}
                  </fieldset>
                )}
              </>
            ) : (
              <div className="empty">
                <Database size={42} />
                <h3>{tr("Seu diário começa com um arquivo", "Your journal starts with a file", "Tu diario empieza con un archivo")}</h3>
                <p>{tr('Importe um histórico ou abra a demonstração para explorar os gráficos.', 'Import your history or open the demo to explore the charts.', 'Importa un historial o abre la demostración para explorar los gráficos.')}</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
document.documentElement.lang = trackerLocale;
createRoot(document.getElementById('app')!).render(<App />);
