import Link from 'next/link';
import { AdSlot } from '@/features/advertising/components';
import { pageMetadata } from '@/lib/site';
export const metadata=pageMetadata('Warp Tracker de Honkai: Star Rail','Importe UIGF, SRGF ou JSON GachaVerse e explore seu histórico por conta e família de banner.','/ferramentas/warp-tracker/');
export default function Guide(){
  const released=process.env.NEXT_PUBLIC_TRACKER_RELEASED==='true';
  return <div className="shell interior page-heading"><Link className="back-link" href="/ferramentas/">Ferramentas</Link><p className="eyebrow mt-5">Honkai: Star Rail</p><h1>Warp <em>Tracker</em></h1>
  <p className="intro">Explore a versão beta. Organize seus Saltos por conta, acompanhe os intervalos entre cinco estrelas e compare o histórico mensal.</p>
  {released?<a className="button primary" href="https://gachaverse-tracker.pages.dev/" rel="noreferrer">Abrir Warp Tracker Beta</a>:<p>O novo painel está em revisão para publicação em uma origem independente.</p>}
  <article className="prose"><h2>Como importar</h2><ol><li>Separe um arquivo UIGF 4.0, 4.1 ou 4.2, SRGF 1.0 ou JSON GachaVerse. Apenas registros de Star Rail entram no diário.</li>
  <li>Escolha o arquivo no painel. Para JSON GachaVerse v1, informe um nome local para distinguir contas.</li>
  <li>Revise perfis, contagens e registros repetidos na prévia. Confirme a importação e escolha a família de banner.</li></ol>
  <h2>Como interpretar o resultado</h2><p>O contador mede os registros observados desde o último cinco estrelas daquela família. Um histórico truncado ou sem raridade pode impedir a reconstrução. Confira o resultado promocional no jogo antes de classificar um cinco estrelas.</p>
  <AdSlot placement="trackerGuide"/><h2>Exportação e migração</h2><p>O backup GachaVerse 2 conserva suas anotações. Para exportar em outro formato, o histórico precisa conter os campos exigidos. Você também pode <Link href="/ferramentas/warp-tracker/painel/">recuperar um diário salvo na versão anterior</Link>.</p>
  <p>Consulte a <Link href="/ferramentas/calculadora-pity/">calculadora de pity</Link> para planejar recursos e o <Link href="/artigos/honkai-star-rail-pity-50-50/">guia sobre garantias</Link> para interpretar os limites.</p></article></div>;
}
