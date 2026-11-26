import { advertisingPolicy, adsenseClient, autoAdsEnabled, autoAdsSource } from '@/features/advertising/config';
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
    <h2>Preferências de cookies e Google Analytics</h2>
    <p>Você pode aceitar, recusar ou personalizar a medição de audiência. Guardamos a escolha no armazenamento local deste navegador. O Google Analytics só é carregado após sua autorização.</p>
    <p>Com sua permissão, medimos visitas a páginas do portal, cliques em jogos e canais de resgate e a chegada ao fim do texto de um artigo. Os eventos usam caminhos editoriais e identificadores públicos de jogos e guias. Parâmetros de consulta, fragmentos e endereços de sites de origem são excluídos dos dados de navegação enviados pelo portal.</p>
    <p>O Analytics pode usar cookies próprios para distinguir visitas. Ao carregar o serviço, o navegador transmite ao Google dados técnicos da conexão, como o endereço IP. Os relatórios ajudam a escolher conteúdos para revisar. <a href="https://policies.google.com/technologies/partner-sites?hl=pt-BR">Como o Google usa dados de sites parceiros</a>.</p>
    <p>Em “Preferências de cookies”, no rodapé, desmarque a medição e salve para interromper os próximos envios e remover os cookies de medição deste site. Excluir os dados do site no navegador também apaga a escolha salva.</p>
    <h2>Calculadora de pity</h2><p>Os valores informados ficam no armazenamento local deste navegador. Com sua permissão para medição, registramos a abertura da ferramenta, o uso do cálculo, a troca de banner e o reinício. Os eventos omitem o pity e o saldo de recursos.</p>
    <h2>Diário de Saltos</h2><p>O novo tracker armazena o histórico no IndexedDB da sua origem independente. O painel funciona com arquivos locais e dispensa medição de audiência e publicidade. A migração de um histórico anterior exige que você exporte uma cópia no portal e confirme a importação no tracker.</p>
    <h2>Publicidade</h2>
    {autoAdsSource(advertisingPolicy, autoAdsEnabled, adsenseClient) ? (
      <p>O AdSense é opcional. Em “Preferências de cookies”, no rodapé, você pode autorizar o carregamento ou retirar a autorização. O Google pode oferecer controles adicionais de privacidade conforme a região. A escolha de audiência se aplica apenas ao Analytics. <a href="https://policies.google.com/technologies/partner-sites?hl=pt-BR">Como o Google trata dados de sites parceiros</a>.</p>
    ) : (
      <p>Os anúncios estão desativados. A verificação do AdSense usa uma metatag e o arquivo ads.txt. A preferência de audiência se aplica apenas ao Analytics.</p>
    )}
    <h2>Links externos e contato</h2>
    <p>Com a medição autorizada, podemos contar cliques em ofertas identificadas usando o identificador público da oferta e o tipo de relação comercial. O evento omite a URL do parceiro e dados da compra. Consulte a <Link href="/publicidade-e-afiliados/">política de publicidade e afiliados</Link>.</p>
    <p>Os resgates acontecem nos canais oficiais de cada jogo. Dados de login e códigos inseridos nesses canais são tratados pelo respectivo serviço. Ao abrir um relato no GitHub, seu nome de usuário e a mensagem ficam visíveis ao público.</p>
    <p>Para dúvidas sobre esta política ou solicitações relacionadas a dados, consulte a <Link href="/contato/">página de contato</Link>.</p>
  </article></div>;
}
