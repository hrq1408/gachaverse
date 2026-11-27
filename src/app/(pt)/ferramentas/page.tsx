import Link from 'next/link';
import { ArrowUpRight, Orbit } from 'lucide-react';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata('Ferramentas para jogos gacha', 'Planeje seus recursos em Honkai: Star Rail com as ferramentas gratuitas do GachaVerse.', '/ferramentas/');
export default function Tools() {
  return <div className="shell interior page-heading"><h1>Ferramentas</h1>
    <p className="intro">Planeje seus próximos Saltos com os recursos da sua conta.</p>
    <Link href="/ferramentas/calculadora-pity/" className="tool-card"><Orbit size={34}/><span>Honkai: Star Rail<strong>Calculadora de pity</strong>Compare seu saldo com a garantia do banner.</span><ArrowUpRight/></Link>
  <Link href="/ferramentas/warp-tracker/" className="tool-card"><Orbit size={34}/><span>Honkai: Star Rail<strong>Warp Tracker</strong>Organize seu diário de Saltos por banner.</span><ArrowUpRight/></Link></div>;
}
