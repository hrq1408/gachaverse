import { AdSlot } from '@/features/advertising/components';
import Link from 'next/link';
import { Suspense } from 'react';
import { Calculator, CalculatorForm } from '@/features/pity/components/calculator';
import { starRail } from '@/features/pity/config/games';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata('Calculadora de pity de Honkai: Star Rail', 'Calcule quantos Saltos, Jades Estelares e Passes Especiais faltam para garantir o personagem ou Cone de Luz em destaque.', '/ferramentas/calculadora-pity/');
export default function PityPage() {
  return <div className="shell interior pity-page">
    <header className="page-heading"><Link className="back-link" href="/ferramentas/">Ferramentas</Link>
      <p className="eyebrow mt-5">Honkai: Star Rail</p><h1>Calculadora de <em>pity</em></h1>
      <p className="intro">Veja quantos Saltos sua reserva cobre e quanto falta para garantir o destaque do banner.</p></header>
    <Suspense fallback={<CalculatorForm game={starRail} />}><Calculator game={starRail}/></Suspense>
    <section className="prose pity-guide"><h2>Como utilizar</h2>
      <p>Escolha o tipo de banner e conte, no histórico correspondente, os Saltos feitos desde o último cinco estrelas. Se ainda não recebeu nenhum, conte desde o primeiro Salto. Informe suas Jades e apenas os Passes Especiais. Cada banner guarda um cenário separado neste navegador.</p>
      <h2>O que o pity garante?</h2><p>Um cinco estrelas reinicia o contador. O limite é de 90 Saltos no evento convencional de personagem e de 80 no de Cone de Luz. Se o último cinco estrelas desse tipo de evento veio fora do destaque e sua garantia continua ativa, marque a opção correspondente. Assim, basta reservar recursos para um ciclo. Sem essa garantia, o planejamento cobre também um segundo ciclo completo.</p>
      <h2>Exemplos de cálculo</h2><p>Com pity 70 em personagem e garantia ativa, faltam no máximo 20 Saltos. Com 2 Passes Especiais e 2.879 Jades, você já cobre 19. Uma Jade a mais completa o vigésimo Salto.</p>
      <p>Em um banner de Cone de Luz, pity 79 deixa apenas um Salto até o próximo cinco estrelas. Sem garantia promocional ativa, o teto para obter o destaque ainda é de 81 Saltos.</p>
      <AdSlot placement="calculatorGuide"/>
      <h2>Limites e fontes</h2><p>A barra mede a parte do orçamento já coberta. O destaque pode chegar antes do limite. O cálculo usa 160 Jades por Salto e abrange apenas eventos promocionais convencionais. Confira as regras na tela de detalhes antes de gastar passes.</p>
      <p>Regras conferidas em <time dateTime="2026-11-25">25 de novembro de 2026</time>.</p>
      <ul><li><a href="https://support.hoyoverse.com/hc/en-us/articles/50913710696217-How-does-the-pity-system-work-for-different-banners-and-reruns">HoYoverse — limites por tipo de Salto</a></li>
      <li><a href="https://support.hoyoverse.com/hc/en-us/articles/50913708153625-How-does-the-guarantee-system-work-for-the-Light-Cone-Event-Warp-and-does-my-pity-carry-over">HoYoverse — garantia dos Cones de Luz</a></li>
      <li><a href="https://www.hoyolab.com/article/45275874">HoYoLAB — exemplo de regras de um evento de personagem</a></li></ul>
      <h2>Guias relacionados</h2><ul><li><Link href="/artigos/honkai-star-rail-pity-50-50/">Como funcionam o pity e o 50/50</Link></li><li><Link href="/artigos/honkai-star-rail-jades-estelares/">Como conseguir Jades Estelares</Link></li><li><Link href="/artigos/honkai-star-rail-planejar-banners-f2p/">Como planejar banners sendo F2P</Link></li></ul>
    </section></div>;
}
