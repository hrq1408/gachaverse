import Link from 'next/link';
import { InstitutionalPage } from '@/components/page-frames';
import { pageMetadata } from '@/lib/site';

const description = 'Entenda como o GachaVerse identifica publicidade, ofertas de parceiros e links que podem gerar comissão.';
export const metadata = pageMetadata('Política de publicidade e afiliados', description, '/publicidade-e-afiliados/');

export default function AdvertisingPolicyPage() {
  return <InstitutionalPage eyebrow="GachaVerse" title="Política de publicidade e afiliados" description={description}>
    <h2>Publicidade e independência editorial</h2>
    <p>Guias e ferramentas são gratuitos. Quando houver publicidade ou parceria comercial, ela será identificada junto ao conteúdo correspondente. As relações comerciais não determinam as recomendações e revisões editoriais.</p>
    <h2>Links de afiliados</h2>
    <p>Um link identificado como “Link de afiliado” pode gerar comissão para o GachaVerse se você comprar pelo endereço divulgado. O parceiro informa preços, disponibilidade, métodos de pagamento, condições e suporte.</p>
    <h2>Ofertas e recargas</h2>
    <p>Uma oferta só entra no catálogo após revisão. Para divulgar uma recarga como autorizada, o GachaVerse exige comprovação pública do publicador para aquele fornecedor, jogo e região. Confira as condições e o domínio antes de comprar.</p>
    <h2>Medição e privacidade</h2>
    <p>Com sua autorização para medição, o portal registra o clique usando apenas o identificador público da oferta, o tipo de relação comercial e o contexto de navegação do portal. Os sites parceiros têm suas próprias políticas. Altere sua escolha de medição em “Preferências de cookies”, no rodapé.</p>
    <p>Consulte a <Link href="/privacidade/">política de privacidade</Link> ou use a <Link href="/contato/">página de contato</Link> para relatar uma oferta incorreta.</p>
    <p>Para propor uma parceria, veja a página <Link href="/anuncie/">Anuncie no GachaVerse</Link>.</p>
  </InstitutionalPage>;
}
