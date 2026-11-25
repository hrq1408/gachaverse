import Link from 'next/link';
import { PageHeading } from '@/components/catalog';
import { pageMetadata } from '@/lib/site';

const description = 'Entenda quais serviços recebem dados quando você consulta os guias e como controlar cookies no navegador.';
export const metadata = pageMetadata('Política de privacidade', description, '/privacidade/');

export default function Privacy() {
  return <div className="shell interior"><article className="prose">
    <PageHeading eyebrow="GachaVerse" title="Política de privacidade" description={description} />
    <h2>Ao visitar o portal</h2>
    <p>A leitura dos guias dispensa cadastro. A Cloudflare entrega as páginas e recebe dados técnicos da conexão, como endereço IP, página solicitada e informações do navegador, para atender à solicitação e proteger a infraestrutura.</p>
    <p><a href="https://www.cloudflare.com/privacypolicy/">Consultar a política de privacidade da Cloudflare</a></p>
    <h2>Google AdSense e cookies</h2>
    <p>Os espaços publicitários estão desativados. As páginas carregam o script de verificação do Google AdSense. Ao buscá-lo, seu navegador se conecta ao Google, que recebe dados técnicos da requisição, como o endereço IP. Serviços do Google podem usar cookies e outros identificadores conforme as configurações do serviço e do navegador.</p>
    <p>Você pode consultar, bloquear ou apagar cookies nas configurações de privacidade do navegador. O Google explica como trata informações em sites parceiros e oferece controles de personalização de anúncios.</p>
    <p><a href="https://policies.google.com/technologies/partner-sites?hl=pt-BR">Uso de dados em sites parceiros do Google</a> · <a href="https://myadcenter.google.com/">Minha central de anúncios</a></p>
    <h2>Links externos e contato</h2>
    <p>Os resgates acontecem nos canais oficiais de cada jogo. Dados de login e códigos inseridos nesses canais são tratados pelo respectivo serviço. Ao abrir um relato no GitHub, seu nome de usuário e a mensagem ficam visíveis ao público.</p>
    <p>Para dúvidas sobre esta política ou solicitações relacionadas a dados, consulte a <Link href="/contato/">página de contato</Link>.</p>
  </article></div>;
}
