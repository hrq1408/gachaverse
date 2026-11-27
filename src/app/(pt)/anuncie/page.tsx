import Link from 'next/link';
import { PageHeading } from '@/components/catalog';
import { pageMetadata } from '@/lib/site';

const title = 'Anuncie no GachaVerse';
const description = 'Conheça as possibilidades de parceria comercial com o GachaVerse, portal brasileiro de guias, calendários e ferramentas de jogos gacha.';
export const metadata = pageMetadata(title, description, '/anuncie/');

export default function AdvertisePage() {
  return <div className="shell interior"><article className="prose">
    <PageHeading eyebrow="Parcerias comerciais" title={title} description={description} />
    <h2>Formatos que podemos avaliar</h2>
    <ul>
      <li>Patrocínio identificado de guias, calendários ou outras seções do portal.</li>
      <li>Campanhas de divulgação de lançamentos e eventos relacionados aos jogos cobertos.</li>
      <li>Ofertas e links de afiliados identificados, com revisão do destino, fornecedor e condições.</li>
    </ul>
    <h2>Como enviar uma proposta</h2>
    <p>Informe o nome público da empresa, o jogo ou tema da campanha, o formato pretendido e o período desejado. O canal existente é público. Evite incluir dados pessoais, credenciais ou condições comerciais confidenciais.</p>
    <p><Link className="button secondary" href="/contato/">Ver canal de contato</Link></p>
    <h2>Critérios editoriais</h2>
    <p>Propostas são avaliadas antes de qualquer publicação. As relações comerciais são identificadas e não determinam as conclusões dos guias. Divulgações de recarga exigem comprovação do publicador para o jogo, fornecedor e região.</p>
    <p><Link href="/publicidade-e-afiliados/">Política de publicidade e afiliados</Link></p>
  </article></div>;
}
