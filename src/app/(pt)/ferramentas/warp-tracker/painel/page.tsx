import Link from 'next/link';
import { Dashboard } from '@/features/tracker/dashboard';
import { pageMetadata } from '@/lib/site';
export const metadata = pageMetadata('Meu histórico de Saltos', 'Painel local do Warp Tracker.', '/ferramentas/warp-tracker/painel/', false);
export default function Panel() {
  return <div className="shell interior page-heading"><Link className="back-link" href="/ferramentas/warp-tracker/">Guia do Warp Tracker</Link>
    <p className="eyebrow mt-5">Honkai: Star Rail</p><h1>Migração do <em>histórico</em></h1>
    <p className="intro">Recupere os registros que ficaram salvos na origem anterior.</p><Dashboard/></div>;
}
