import { PageHeading } from '@/components/catalog';
import { pageMetadata } from '@/lib/site';

const description = 'Envie correções editoriais, dúvidas sobre privacidade ou relatos de problemas no portal.';
export const metadata = pageMetadata('Contato', description, '/contato/');

export default function Contact() {
  return <div className="shell interior"><article className="prose">
    <PageHeading eyebrow="GachaVerse" title="Contato" description={description} />
    <h2>Fale com o projeto</h2>
    <p>Usamos as issues do repositório do GachaVerse no GitHub. Você pode consultar relatos existentes ou entrar com uma conta GitHub para abrir uma nova issue.</p>
    <p>Para corrigir um guia, indique a página, o trecho e a fonte oficial. Para relatar uma falha, descreva o que tentou fazer e o que apareceu na tela.</p>
    <p>As mensagens são públicas. Para questões de privacidade, descreva a solicitação em termos gerais. Evite publicar e-mail, documentos, senhas ou identificadores de contas de jogo.</p>
    <p><a href="https://github.com/hrq1408/gachaverse/issues">Acessar o canal público do GachaVerse no GitHub</a></p>
  </article></div>;
}
