import { useState, type ReactNode } from 'react';
import { Monitor, Smartphone, TabletSmartphone, Gamepad2, FileUp, ShieldCheck, ExternalLink } from 'lucide-react';

const platforms = [
  { id: 'windows', label: 'Windows', Icon: Monitor },
  { id: 'android', label: 'Android', Icon: Smartphone },
  { id: 'ios', label: 'iPhone / iPad', Icon: TabletSmartphone },
  { id: 'console', label: 'PlayStation', Icon: Gamepad2 },
  { id: 'file', label: 'Já tenho um arquivo', Icon: FileUp },
] as const;
type Platform = (typeof platforms)[number]['id'];
const official = 'https://support.hoyoverse.com/hc/en-us/articles/50913754903577-How-can-I-check-my-Warp-history-and-why-aren-t-my-latest-pulls-showing-up';
const calculator = 'https://gachaverse.pages.dev/ferramentas/calculadora-pity/';
function External({ href, children, primary = false }: { href: string; children: ReactNode; primary?: boolean }) {
  return <a className={primary ? 'guide-link primary' : 'guide-link'} href={href} target="_blank" rel="noopener noreferrer">{children}<ExternalLink size={16} aria-hidden="true" /></a>;
}
export function ImportGuide({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<Platform>('windows');
  return (
    <section className="import-guide" id="tutorial" aria-labelledby="guide-title">
      <div className="guide-heading">
        <div><p className="guide-kicker">COMECE AQUI</p><h2 id="guide-title">Importar meus Saltos</h2><p>Traga seu histórico para descobrir quantos tiros você deu e acompanhar seu pity.</p></div>
        <a className="guide-link primary" href="#import-file" onClick={() => setPlatform('file')}>Já tenho um arquivo <FileUp size={18} aria-hidden="true" /></a>
      </div>
      <fieldset className="guide-platforms">
        <legend><span className="guide-number">1</span> Onde você joga?</legend>
        <div className="guide-options">
          {platforms.map(({ id, label, Icon }) => <label className="guide-option" key={id}>
            <input type="radio" name="import-platform" value={id} checked={platform === id} onChange={() => setPlatform(id)} />
            <Icon size={22} aria-hidden="true" /><span>{label}</span>
          </label>)}
        </div>
      </fieldset>
      <section className="guide-step" aria-labelledby="get-history-title">
        <h3 id="get-history-title"><span className="guide-number">2</span> {platform === 'file' ? 'Encontre seu arquivo' : 'Obtenha seu histórico'}</h3>
        {platform === 'windows' ? <>
          <p>Se você já usa outro tracker, procure a opção Exportar histórico e escolha UIGF 4.0–4.2 ou SRGF 1.0 (JSON). Não exporte planilhas Excel.</p>
          <p>Se ainda não tem arquivo, uma opção comunitária para Windows 64 bits é o Star Rail Warp History Exporter (biuuu). Seu código-fonte exporta histórico de Star Rail em UIGF 4.1.</p>
          <div className="guide-actions"><External href="https://github.com/biuuu/star-rail-warp-export/releases" primary>Abrir downloads do exportador</External><External href="https://github.com/biuuu/star-rail-warp-export">Ver instruções e código-fonte</External><External href="https://uigf.org/en/partnership-list.html">Outros exportadores UIGF</External></div>
          <ol><li>Se decidir usar o exportador, consulte as versões oficiais do projeto no GitHub, leia as instruções e extraia o pacote em uma pasta local.</li><li>Abra Honkai: Star Rail, entre em Salto e abra o histórico de Saltos. No exportador, use a opção Load data (carregar dados).</li><li>Após carregar os registros, abra Import/Export e escolha Export UIGF (não Export Excel). Selecione sua conta e salve o JSON em Downloads.</li><li>Volte aqui e selecione esse arquivo no passo 3.</li></ol>
          <p className="guide-warning">Ferramentas de terceiros não são oficiais. Não auditamos seus executáveis nem testamos a conexão com uma conta real. O programa lê dados locais e utiliza uma chave temporária do histórico. Não use o modo proxy como alternativa deste guia. Nunca desative proteções do Windows, nem compartilhe senha, cookies ou links de sessão. Se preferir, use a calculadora manual.</p>
        </> : platform === 'file' ? <p>Procure o arquivo terminado em .json que você salvou, normalmente em Downloads ou Arquivos. Não é necessário obter outro histórico.</p> : <>
          <p>Não temos um método de exportação direta validado para {platforms.find(p => p.id === platform)?.label}. Se você já usa um tracker que exporta UIGF ou SRGF, salve o JSON no dispositivo e selecione-o no passo 3.</p>
          <p>Você também pode consultar seus Saltos no jogo ou no HoYoLAB. A consulta oficial não é uma exportação JSON confirmada.</p>
          <div className="guide-actions"><External href="https://www.hoyolab.com/article/46452547">Consultar Warp Records no HoYoLAB</External><External href="https://uigf.org/en/partnership-list.html">Ver ferramentas comunitárias</External></div>
        </>}
        <div className="guide-actions"><External href={official}>Como consultar o histórico no jogo</External><External href={calculator}>Calcular pity sem baixar arquivo</External></div>
      </section>
      <section className="guide-step guide-file" id="import-file" aria-labelledby="import-file-title">
        <h3 id="import-file-title"><span className="guide-number">3</span> Selecione seu arquivo</h3>
        <p>Confira a prévia e confirme para salvar o histórico. Você não precisa enviar dados para nenhum servidor do GachaVerse.</p>
        {children}
      </section>
      <div className="guide-privacy"><ShieldCheck size={22} aria-hidden="true" /><p><strong>Seu histórico fica neste navegador.</strong> Não pedimos login ou senha. Guarde uma cópia do arquivo: limpar os dados do navegador pode apagar o diário.</p></div>
      <details className="guide-details"><summary>Formatos, atualizações e histórico incompleto</summary><p>O tracker aceita arquivos JSON GachaVerse, UIGF 4.0, 4.1 e 4.2, e SRGF 1.0. Nos arquivos UIGF de vários jogos, somente os registros de Star Rail são importados. Importe novamente após novos Saltos; registros repetidos da mesma conta são unificados. O histórico disponível no jogo pode ser incompleto.</p><p>Para backups GachaVerse v1 sem UID, use sempre o mesmo nome de perfil para a mesma conta. Na migração, exporte o backup na origem antiga, importe aqui, confira os registros e só então exclua a cópia antiga.</p><div className="guide-actions"><External href="https://uigf.org/en/standards/uigf.html">Padrão UIGF</External><External href="https://uigf.org/en/standards/srgf.html">Padrão SRGF</External><External href="https://support.hoyoverse.com/hc/en-us/articles/50913710696217">Regras dos Saltos</External></div></details>
    </section>
  );
}
